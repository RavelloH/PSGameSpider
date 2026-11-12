import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const at=process.argv.indexOf('--dir');
if(at<0||!process.argv[at+1])throw Error('Expected --dir <generated site>');
const root=path.resolve(here,process.argv[at+1]);
const regions=['zh-hans-hk','ja-jp','en-us','en-gb','ko-kr'];
const html=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const baseArg=process.argv.indexOf('--base-path');
const base=baseArg>=0?process.argv[baseArg+1]:'/PSGameSpider/';
assert.match(base,/^\/(?:[a-zA-Z0-9_-]+\/)*$/);
const homeRedirect=html('index.html');
assert.ok(homeRedirect.includes('url='+base+'zh-hans-hk'),'correct locale redirect');
assert.equal(fs.existsSync(path.join(root,'assets/css/style.css')),true);
assert.equal(fs.existsSync(path.join(root,'assets/js/psgs-cover-state.js')),true);
assert.equal(fs.existsSync(path.join(root,'assets/js/psgs-static-search.js')),true);
assert.equal(fs.existsSync(path.join(root,'.nojekyll')),true);

let gamePageCount=0, searchCount=0;
for(const region of regions){
  const home=html(region+'/index.html');
  assert.ok(home.includes(base+'assets/css/style.css'),region+' original stylesheet');
  assert.ok(home.includes('psgsSearch(\''+region+'\', name)'),region+' static search');
  assert.ok(home.includes('https://i.ravelloh.com/raw.githubusercontent.com/RavelloH/PSGameSpider/main/origin/images/'),region+' covers');
  assert.ok(home.includes('srcset='),region+' responsive covers');
  assert.ok(!home.includes('href="'+base+'PSGameSpider/') && !home.includes('src="'+base+'PSGameSpider/'),region+' incorrect base path');
  assert.ok(!home.includes('noindex,nofollow'),region+' production should be indexed');
  assert.ok(!home.includes('127.0.0.1:4173'),region+' localhost leakage');
  assert.ok(home.includes('id="page-dest"'),region+' original virgule target');
  const index=JSON.parse(fs.readFileSync(path.join(root,region,'search-index.json'),'utf8'));
  assert.ok(index.length>9000,region+' search index');
  searchCount+=index.length;
  const dirs=fs.readdirSync(path.join(root,region),{withFileTypes:true}).filter(e=>e.isDirectory());
  const choice=dirs.find(e=>fs.existsSync(path.join(root,region,e.name,'index.html')));
  assert.ok(choice,region+' detail sample');
  const detail=html(region+'/'+choice.name+'/index.html');
  assert.ok(detail.includes('id="priceHistoryChart"')&&detail.includes('id="rateHistoryChart"'),region+' original charts');
  assert.ok(detail.includes('https://i.ravelloh.com/raw.githubusercontent.com/'),region+' detail cover');
  assert.ok(detail.includes('srcset=')&&detail.includes('sizes='),region+' responsive detail cover');
  assert.ok(detail.includes(base+'assets/js/psgs-cover-state.js'),region+' image placeholders');
  assert.ok(!detail.includes('href="'+base+'PSGameSpider/') && !detail.includes('src="'+base+'PSGameSpider/'),region+' incorrect detail base path');
  assert.ok(!detail.includes('127.0.0.1:4173'),region+' localhost detail');
  for(const dir of dirs){
    const full=path.join(root,region,dir.name);
    if(fs.existsSync(path.join(full,'index.html')))gamePageCount++;
    for(const edition of fs.readdirSync(full,{withFileTypes:true})){
      if(edition.isDirectory()&&fs.existsSync(path.join(full,edition.name,'index.html')))gamePageCount++;
    }
  }
  console.log('SMOKE_REGION',region,'searchRows',index.length,'detailPaths',dirs.length);
}
const report=JSON.parse(fs.readFileSync(path.join(root,'build-report.json'),'utf8'));
assert.equal(report.pages,61770,'all item pages');
assert.equal(gamePageCount,report.pages,'all generated detail pages are present');
assert.equal(searchCount,61770,'full catalog included in search indexes');
console.log('PAGES_SMOKE_PASS',JSON.stringify({games:gamePageCount,searchEntries:searchCount,originalCss:true,cloudinary:true,staticSearch:true,basePath:base}));
