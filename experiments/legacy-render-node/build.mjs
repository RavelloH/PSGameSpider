/**
 * Original render-build 0.4.0 + ORIGINAL template/{layout.html,index.ejs,item.ejs}.
 * All new logic lives exclusively in the Node.js JSONL data adapter.
 * No Python, React, shadcn, DuckDB or publication.
 */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {
  REGIONS,jsonl,readHistory,adaptGame,snapshotsOf,recentlyPublished,searchRecords
} from './model.mjs';

const require=createRequire(import.meta.url);
const ejs=require('ejs');
const rbuild=require('render-build');
const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'../..');
const OUTPUT=path.join(ROOT,'experiments','output');
const DEFAULT_DATA=path.join(OUTPUT,'dataset-full-5regions');
const options=new Map();
for(let i=2;i<process.argv.length;i++){
  if(process.argv[i].startsWith('--')){
    const next=process.argv[i+1];
    options.set(process.argv[i].slice(2),next&&!next.startsWith('--')?next:true);
    if(next&&!next.startsWith('--'))i++;
  }
}
const dest=path.resolve(String(options.get('output')||path.join(OUTPUT,'renderbuild-restored')));
const DATA=path.resolve(String(options.get('data')||DEFAULT_DATA));
const regions=String(options.get('regions')||REGIONS.join(',')).split(',');
const limit=options.has('limit')?Number(options.get('limit')):Infinity;
if(regions.some(x=>!REGIONS.includes(x))||(!Number.isInteger(limit)&&limit!==Infinity)||limit<=0)
  throw Error('Invalid regions/limit');
const relativeOutput=path.relative(OUTPUT,dest);
if(!relativeOutput||relativeOutput.startsWith('..')||path.isAbsolute(relativeOutput)||fs.existsSync(dest))
  throw Error('Build output is not new isolated directory: '+dest);
const lang=JSON.parse(fs.readFileSync(path.join(ROOT,'i18n.json'),'utf8'));
const config=JSON.parse(fs.readFileSync(path.join(ROOT,'config.json'),'utf8'));
const publishing=options.has('publish');
const basePath=publishing?String(options.get('base-path')||'/PSGameSpider/'):'/';
if(!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(basePath))throw Error('Invalid site base path');
const siteUrl=publishing?String(options.get('site-url')||'https://ravelloh.github.io/PSGameSpider/'):'http://127.0.0.1:4173/';
if(!/^https:\/\//.test(siteUrl)||!siteUrl.endsWith('/'))throw Error('Invalid site URL');
config.page={...config.page,siteUrl,analyticScript:''};
rbuild.setConfig(config);
process.chdir(ROOT);
const start=performance.now();
const report={engine:'render-build',rendererVersion:rbuild.version,model:'Node.js JSONL adapter',
  node:process.version,regions:{},pages:0,duplicates:0,bytes:0,
  layout:'original template/layout.html',templates:['index.ejs','item.ejs']};
const assetRoot=path.join(HERE,'assets-cache','assets');
for(const file of ['css/style.css','css/iconfont.css','js/script.js','js/loading.js']){
  if(!fs.existsSync(path.join(assetRoot,file)))throw Error('Missing original resource '+file);
}
const stage=await fsp.mkdtemp(path.join(OUTPUT,'.psgs-renderbuild-'));
async function write(relative,html){
  const to=path.resolve(stage,relative);
  if(!to.startsWith(stage+path.sep))throw Error('Invalid relative output path');
  await rbuild.writeFileSync(to,html);
  report.bytes+=Buffer.byteLength(html);
}
const sourceImages='https://i.ravelloh.com/raw.githubusercontent.com/RavelloH/PSGameSpider/main/origin/images/';
const imageUrl=(filename,width)=>sourceImages+filename+'?w='+width+'&q=75';
function optimizeCovers(document){
  return document.replace(/(<img\s+)src="\/(?:images|mini)\/([A-Za-z0-9._-]+\.(?:jpe?g|png|webp))"/gi,(_,start,file)=>{
    const big=_.includes('/images/');
    const widths=big?[384,640,828,1080,1200]:[128,256,384,640];
    const src=imageUrl(file,big?828:256);
    const srcset=widths.map(w=>imageUrl(file,w)+' '+w+'w').join(', ');
    const sizes=big?'(max-width: 600px) 90vw, (max-width: 1000px) 50vw, 512px':
      '(max-width: 480px) 42vw, (max-width: 960px) 25vw, 160px';
    return start+'src="'+src+'" srcset="'+srcset+'" sizes="'+sizes+
      '" loading="'+(big?'eager':'lazy')+'" decoding="async"';
  });
}
function localize(doc){
  let result=doc.replaceAll('https://static.ravelloh.top/assets/',basePath+'assets/')
    .replaceAll('https://psgamespider.ravelloh.top/',siteUrl);
  if(publishing){
    result=optimizeCovers(result);
    // Fix root-absolute HTML links for the GitHub Pages project subdirectory.
    const absoluteAsset=new RegExp('(href|src)=(["\\\'])/(?!/|'+basePath.slice(1)+')','gi');
    result=result.replace(absoluteAsset,(_,attr,quote)=>attr+'='+quote+basePath);
  }else{
    result=result.replace('<head>','<head><meta name="robots" content="noindex,nofollow">');
  }
  return result
    .replace('</head>','<link rel="stylesheet" href="'+basePath+'assets/css/psgs-cover-state.css"></head>')
    .replace('</body>',
      '<script>window.PSGS_BASE='+JSON.stringify(basePath)+';</script>'+
      '<script defer src="'+basePath+'assets/js/psgs-static-search.js"></script>'+
      '<script defer src="'+basePath+'assets/js/psgs-cover-state.js"></script></body>');
}
function rngKey(seed,item){
  return createHash('sha1').update(seed).update(item._key).digest('hex');
}
try{
  const cachedLayout=path.join(HERE,'render-build-layout.html');
  let layout;
  if(fs.existsSync(cachedLayout)&&!options.get('refresh-layout')){
    layout=fs.readFileSync(cachedLayout,'utf8');
  }else{
    // This is the actual original render-build singleBuild API; it processes
    // local template includes and remote old-site layout snippets.
    layout=await rbuild.singleBuild(
      fs.readFileSync(path.join(ROOT,'template','layout.html'),'utf8'),'template/');
    await fsp.writeFile(cachedLayout,layout);
  }
  const wrap=ejs.compile(layout,{filename:path.join(ROOT,'template','layout.html')});
  let homeSource=fs.readFileSync(path.join(ROOT,'template','index.ejs'),'utf8');
  if(publishing){
    const searchCall="fetch('/api/search?area=<%= lang %>&keyword=' + name)";
    if(!homeSource.includes(searchCall))throw Error('Expected original search API code');
    homeSource=homeSource.replace(searchCall,"psgsSearch('<%= lang %>', name)");
    // The static index client already returns parsed records, not Response.
    const responseJson='.then((response) => response.json())';
    if(!homeSource.includes(responseJson))throw Error('Expected original fetch response parser');
    homeSource=homeSource.replace(responseJson,'');
    homeSource=homeSource.replace('gameSearchResult += getstructuregameSearchResult(data[i]);',
      'gameSearchResult += window.psgsOptimizeSearchResult(getstructuregameSearchResult(data[i]),data[i]);');
  }
  const homeTemplate=ejs.compile(homeSource,{filename:path.join(ROOT,'template','index.ejs')});
  // Keep original EJS and original detail-chart behavior intact.
  const itemTemplate=ejs.compile(fs.readFileSync(path.join(ROOT,'template','item.ejs'),'utf8'),
    {filename:path.join(ROOT,'template','item.ejs')});
  await fsp.cp(assetRoot,path.join(stage,'assets'),{recursive:true});
  // Additive cover loading only: original style.css and original templates unchanged.
  await fsp.copyFile(path.join(HERE,'ui','psgs-cover-state.css'),path.join(stage,'assets','css','psgs-cover-state.css'));
  await fsp.copyFile(path.join(HERE,'ui','psgs-cover-state.js'),path.join(stage,'assets','js','psgs-cover-state.js'));
  await fsp.copyFile(path.join(HERE,'ui','psgs-static-search.js'),path.join(stage,'assets','js','psgs-static-search.js'));
  await write('index.html','<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url='+basePath+'zh-hans-hk"><a href="'+basePath+'zh-hans-hk">PSGameSpider</a>');
  if(publishing)await fsp.writeFile(path.join(stage,'.nojekyll'),'');
  for(const region of regions){
    const begun=performance.now();
    const priceMap=await readHistory(DATA,region,'prices');
    const ratingMap=await readHistory(DATA,region,'ratings');
    const games=[];
    for await(const row of jsonl(path.join(DATA,'catalog',region+'.jsonl'))){
      if(games.length>=limit)break;
      if(row.region!==region)throw Error('Catalog region mismatch');
      games.push(adaptGame(row,priceMap,ratingMap,region));
    }
    let asOf='1900-01-01';
    for(const history of priceMap.values()){
      if(history.length&&history.at(-1)[0]>asOf)asOf=history.at(-1)[0];
    }
    const same=new Map();
    for(const item of games){
      const siblings=same.get(item._concept)||[];
      siblings.push(item);same.set(item._concept,siblings);
    }
    const rand=games.slice().sort((a,b)=>rngKey(region+asOf,a).localeCompare(rngKey(region+asOf,b))).slice(0,100);
    const homeConfig={
      ...config.page,doc:'',title:lang[region].index,
      keywords:'playstation',description:'PSGameSpider',pagetype:'edge',
      url:siteUrl+region,
      pageJs:`<script>function main(){setTimeout(() => {const target=document.querySelector('#page-dest');if(target&&typeof virgule==='function'){virgule(target,${JSON.stringify(lang[region].platform)})}},400)}</script>`,prefetch:[],
      lang:region,langList:REGIONS,i18n:lang[region],gameList:games,
      randomList:rand,
      discount:snapshotsOf(games,priceMap,7,asOf).slice(0,120),
      todayDiscount:snapshotsOf(games,priceMap,1,asOf).slice(0,120),
      recent:recentlyPublished(games,asOf)
    };
    const homepage=localize(wrap({...homeConfig,doc:homeTemplate(homeConfig)}))
      .replace(/<img (?=src="\/mini\/)/g,'<img loading="lazy" ');
    await write(region+'/index.html',homepage);
    await write(region+'/search-index.json',JSON.stringify(searchRecords(games)));
    const pending=[];
    let count=0;
    for(const game of games){
      const group=same.get(game._concept);
      const oldOwner=group.at(-1)===game;
      const directory=region+'/'+game._concept+(oldOwner?'':'/edition-'+game._key);
      if(!oldOwner)report.duplicates++;
      const itemConfig={
        ...config.page,title:game.fullname,keywords:'',
        description:game.description||'',pagetype:'edge',
        url:siteUrl+directory,
        pageJs:'<script>function main(){}</script>',prefetch:[],
        game,lang:region,i18n:lang[region]
      };
      const document=localize(wrap({...itemConfig,doc:itemTemplate(itemConfig)}));
      pending.push(write(directory+'/index.html',document));
      report.pages++;
      if(pending.length===16){await Promise.all(pending);pending.length=0;}
      count++;
      if(count%3000===0)console.log('PROGRESS',region,count,'/',games.length);
    }
    await Promise.all(pending);
    report.regions[region]={
      listings:games.length,uniqueConceptPaths:same.size,asOf,
      durationSeconds:+((performance.now()-begun)/1000).toFixed(2),
      discounted:homeConfig.discount.length,recent:homeConfig.recent.length};
    console.log('REGION_DONE',region,JSON.stringify(report.regions[region]));
  }
  report.elapsedSeconds=+((performance.now()-start)/1000).toFixed(2);
  report.status='success';
  await write('build-report.json',JSON.stringify(report,null,2));
  await fsp.rename(stage,dest);
  console.log('BUILD_REPORT',JSON.stringify(report));
}catch(error){
  console.error('RENDER_BUILD_FAILED',error.stack||error);
  await fsp.rm(stage,{recursive:true,force:true});
  process.exitCode=1;
}
