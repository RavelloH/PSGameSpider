import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {jsonl,adaptGame,minorToAmount,normalDate,snapshotsOf,escapeHTML,recentlyPublished} from './model.mjs';
const listing={product_key:'a'.repeat(24),region:'en-us',name:'A',fullname:'A Deluxe',
  store_url:'https://store.playstation.com/en-us/concept/12345',
  image_path:'images/abc.jpg',publisher:'Publisher',platform:'PS5',category:'Game',
  type:'Adventure',release_date_raw:'2026/9/11',description:'Short',
  info:'A <script>alert(1)</script> description',currency:'USD',
  current_price_minor:4900,current_rating:4.5};
test('Node JSONL streaming preserves U+2028 within a quoted string',async()=>{
  const folder=await fs.mkdtemp(path.join(os.tmpdir(),'psgs-jsonl-test-'));
  try{
    const file=path.join(folder,'data.jsonl');
    await fs.writeFile(file,JSON.stringify({a:'alpha\u2028beta'})+'\n'+JSON.stringify({a:'second'})+'\n');
    const rows=[];for await(const item of jsonl(file))rows.push(item);
    assert.equal(rows.length,2);assert.equal(rows[0].a,'alpha\u2028beta');
  }finally{await fs.rm(folder,{recursive:true,force:true})}
});
test('Minor-unit currency conversion matches original price model',()=>{
  assert.equal(minorToAmount(4900,'USD'),49);
  assert.equal(minorToAmount(1250,'HKD'),12.5);
  assert.equal(minorToAmount(8400,'JPY'),8400);
  assert.equal(minorToAmount(null,'USD'),null);
});
test('Original store URL is retained without changing Concept',()=>{
  const result=adaptGame(listing,new Map(),new Map(),'en-us');
  assert.equal(result._concept,'12345');
  assert.equal(result.path,listing.store_url);
  assert.equal(result.price,49);
});
test('Full game text stays HTML-safe in original unescaped EJS field',()=>{
  const result=adaptGame(listing,new Map(),new Map(),'en-us');
  assert.ok(result.info.includes('&lt;script&gt;'));
  assert.ok(!result.info.includes('<script>'));
});
test('Reject unfamiliar storefront host or wrong locale',()=>{
  assert.throws(()=>adaptGame({...listing,store_url:'https://bad.example/en-us/concept/12345'},new Map(),new Map(),'en-us'));
  assert.throws(()=>adaptGame(listing,new Map(),new Map(),'ja-jp'));
});
test('Release dates normalize before original index recent filtering',()=>{
  assert.equal(normalDate('2026/9/11','en-us'),'2026-11-09');
  assert.equal(normalDate('2026/11/9','zh-hans-hk'),'2026-11-09');
  assert.equal(normalDate('9/11/2026','ja-jp'),'2026-11-09');
});
test('Discount is calculated from last valid recorded values',()=>{
  const g=adaptGame(listing,new Map(),new Map(),'en-us');
  const map=new Map([[g._key,[['2026-11-05',5900],['2026-11-09',4900]]]]);
  const drops=snapshotsOf([g],map,7,'2026-11-10');
  assert.equal(drops.length,1);assert.equal(drops[0].previousPrice,59);
  assert.equal(snapshotsOf([g],map,1,'2026-11-11').length,0);
});
test('Recent release filtering uses data recording date',()=>{
  const g=adaptGame(listing,new Map(),new Map(),'en-us');
  assert.equal(recentlyPublished([g],'2026-11-10').length,1);
  assert.equal(recentlyPublished([g],'2026-12-15').length,0);
});
