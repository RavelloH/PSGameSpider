/** Deterministic Node.js conversion of tracked PlayStation JSON into build-ready JSONL.
 * JSONL is a build artifact, not a second source of truth. No Python required.
 */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'../..');
const OUTPUT=path.resolve(ROOT,'experiments/output');
const REGION_CURRENCY={'zh-hans-hk':'HKD','ja-jp':'JPY','en-us':'USD','en-gb':'GBP','ko-kr':'KRW'};
const FACTOR={HKD:100,JPY:1,USD:100,GBP:100,KRW:1};
function arg(name,fallback){
  const at=process.argv.indexOf('--'+name);
  return at<0?fallback:process.argv[at+1];
}
const target=path.resolve(arg('output',path.join(OUTPUT,'dataset-pages')));
const rel=path.relative(OUTPUT,target);
if(!rel||rel.startsWith('..')||path.isAbsolute(rel)||fs.existsSync(target)){
  throw Error('Refusing to overwrite or write outside experiments/output: '+target);
}
const regions=arg('regions',Object.keys(REGION_CURRENCY).join(',')).split(',');
if(regions.some(r=>!REGION_CURRENCY[r]))throw Error('Unknown region');
function read(region,kind){return JSON.parse(fs.readFileSync(path.join(ROOT,'data',region+'-'+kind+'.json'),'utf8'));}
function minor(value,currency){
  if(value===null||value===undefined||value==='')return null;
  const n=Number(value)*FACTOR[currency],round=Math.round(n);
  return Number.isFinite(n)&&Number.isSafeInteger(round)&&round>=0&&Math.abs(n-round)<1e-6?round:null;
}
function rating(v){if(v===null||v===undefined||v==='')return null;const n=Number(v);return Number.isFinite(n)?n:null;}
function key(region,url,name){return createHash('sha256').update(region+'|'+url+(name?'|'+name:'')).digest('hex').slice(0,24);}
function lines(rows){return rows.map(row=>JSON.stringify(row)).join('\n')+'\n';}
const summary={regions:{},total:0,generatedAt:new Date().toISOString()};
await fsp.mkdir(target,{recursive:true});
for(const region of regions){
  const currency=REGION_CURRENCY[region],meta=read(region,'metaData');
  const prices=read(region,'priceHistory'),ratings=read(region,'rateHistory'),info=read(region,'info');
  const pathCounts=new Map();
  for(const row of meta){
    const p=String(row.path??'');pathCounts.set(p,(pathCounts.get(p)||0)+1);
  }
  const byName=new Map();
  const rows=meta.map(row=>{
    const name=String(row.name),storeUrl=String(row.path??'');
    const id=key(region,storeUrl,pathCounts.get(storeUrl)>1?name:null);
    byName.set(name,id);
    return {
      product_key:id,region,name,fullname:row.fullname??null,store_url:storeUrl,
      image_path:row.img??null,publisher:row.publisher??null,platform:row.platform??null,
      type:row.type??null,category:row.category??null,release_date_raw:row.releaseTime??null,
      description:row.description??null,info:info[name]??null,currency,
      current_price_minor:minor(row.price,currency),
      current_rating:rating(row.rate)
    };
  });
  await fsp.mkdir(path.join(target,'catalog'),{recursive:true});
  await fsp.writeFile(path.join(target,'catalog',region+'.jsonl'),lines(rows),'utf8');
  for(const [directory,source,convert] of [
    ['prices',prices,v=>minor(v,currency)],
    ['ratings',ratings,rating],
  ]){
    const years=new Map();
    for(const [name,events] of Object.entries(source)){
      const product_key=byName.get(name);
      if(!product_key)throw Error('History has unknown product: '+region+'/'+name);
      const byYear=new Map();
      for(const event of events){
        const [date,value]=event;
        const year=String(date).slice(0,4);
        if(!/^\d{4}$/.test(year))throw Error('Invalid history year: '+date);
        const parts=byYear.get(year)||[];
        parts.push([String(date).replaceAll('/','-'),convert(value)]);
        byYear.set(year,parts);
      }
      for(const [year,values] of byYear){
        const bucket=years.get(year)||[];
        bucket.push({product_key,region,year:Number(year),events:values});
        years.set(year,bucket);
      }
    }
    const dir=path.join(target,directory,region);
    await fsp.mkdir(dir,{recursive:true});
    for(const [year,bucket] of years)await fsp.writeFile(path.join(dir,year+'.jsonl'),lines(bucket),'utf8');
  }
  summary.regions[region]={catalog:rows.length};
  summary.total+=rows.length;
  console.log('PREPARED',region,rows.length);
}
await fsp.writeFile(path.join(target,'manifest.json'),JSON.stringify(summary,null,2)+'\n');
console.log('PREPARED_ALL',JSON.stringify(summary));
