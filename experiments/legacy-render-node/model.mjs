// Node.js adapter: Git JSONL -> ORIGINAL PSGameSpider template game fields.
// Templates, HTML layout, CSS, visual effects remain unchanged.
import fs from 'node:fs';
import path from 'node:path';
const DECIMALS={USD:2,GBP:2,HKD:2,JPY:0,KRW:0};
export const REGIONS=['zh-hans-hk','ja-jp','en-us','en-gb','ko-kr'];
export async function* jsonl(file){
  // JSON allows literal U+2028 line separators INSIDE strings. Node readline
  // treats those as record boundaries; split ONLY on LF to preserve JSONL.
  const stream=fs.createReadStream(file,{encoding:'utf8',highWaterMark:128*1024});
  let buffer='';
  try{
    for await(const chunk of stream){
      buffer+=chunk;
      let idx;
      while((idx=buffer.indexOf('\n'))!==-1){
        const line=buffer.slice(0,idx).replace(/\r$/,'');
        buffer=buffer.slice(idx+1);
        if(line.trim())yield JSON.parse(line);
      }
    }
    if(buffer.trim())yield JSON.parse(buffer);
  }finally{stream.destroy();}
}
export async function readHistory(source,region,kind){
  const dir=path.join(source,kind,region);
  const fileNames=fs.readdirSync(dir).filter(n=>/^\d{4}\.jsonl$/.test(n)).sort();
  const map=new Map();
  for(const file of fileNames){
    for await(const row of jsonl(path.join(dir,file))){
      if(row.region!==region||row.year!==Number(file.slice(0,4)))throw Error('History partition mismatch');
      const list=map.get(row.product_key)||[];
      list.push(...(row.events||[]));map.set(row.product_key,list);
    }
  }
  for(const list of map.values())list.sort((a,b)=>a[0].localeCompare(b[0]));
  return map;
}
export function normalDate(raw,region){
  const s=String(raw||'');
  let m=s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  let y,mo,day;
  if(m){
    [y,mo,day]=m.slice(1).map(Number);
    if(region!=='zh-hans-hk'&&(region==='en-us'||region==='en-gb')){
      [mo,day]=[day,mo];
    }
    if(mo>12&&day<=12)[mo,day]=[day,mo];
  }else{
    m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if(!m)return null;
    [day,mo,y]=m.slice(1).map(Number);
  }
  const result=new Date(Date.UTC(y,mo-1,day));
  if(result.getUTCFullYear()!==y||result.getUTCMonth()+1!==mo||result.getUTCDate()!==day)return null;
  return result.toISOString().slice(0,10);
}
export function minorToAmount(value,currency){
  if(value==null)return null;
  if(!Number.isSafeInteger(value)||value<0)throw Error('Invalid price minor units');
  return value/10**(DECIMALS[currency]??2);
}
export function escapeHTML(value){
  return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
export function adaptGame(row,priceMap,ratingMap,region){
  const u=new URL(row.store_url);
  const p=u.pathname.split('/');
  if(u.protocol!=='https:'||u.host!=='store.playstation.com'||p[1]!==region||
     p[2]!=='concept'||!/^\d+$/.test(p[3]||'')||p.length!==4)
    throw Error('Invalid PlayStation Store Concept URL: '+row.store_url);
  if(!/^[0-9a-f]{24,64}$/.test(row.product_key))throw Error('Invalid Listing ID');
  const prices=(priceMap.get(row.product_key)||[]).map(([date,value])=>[date.replaceAll('-','/'),minorToAmount(value,row.currency)]);
  const ratings=(ratingMap.get(row.product_key)||[]).map(([date,value])=>[date.replaceAll('-','/'),value]);
  const info=[row.info,row.description].sort((a,b)=>String(b||'').length-String(a||'').length)[0]||'';
  return {
    _key:row.product_key,_concept:p[3],name:row.name,fullname:row.fullname||row.name,
    img:row.image_path,path:row.store_url,lang:region,
    publisher:row.publisher||'',platform:row.platform||'',category:row.category||'',
    type:row.type||'',description:row.description||'',info:escapeHTML(String(info).replaceAll('\\n','\n')).replace(/\r?\n/g,'<br>'),
    releaseTime:normalDate(row.release_date_raw,region)||row.release_date_raw||'',
    rate:row.current_rating==null?'—':String(row.current_rating),
    price:minorToAmount(row.current_price_minor,row.currency),
    priceCurrency:row.currency||'',priceHistory:prices,rateHistory:ratings
  };
}
export function snapshotsOf(games,priceHistory,days,asOf){
  const earliest=Date.parse(asOf)-days*86400000;
  const hits=[];
  for(const g of games){
    const original=priceHistory.get(g._key)||[];
    if(original.length<2||original.at(-1)[1]===null)continue;
    const events=original.filter(x=>x[1]!==null);
    if(events.length<2)continue;
    const newer=events.at(-1),older=events.at(-2);
    if(Date.parse(newer[0])>=earliest&&newer[1]<older[1]){
      hits.push({...g,previousPrice:minorToAmount(older[1],g.priceCurrency)});
    }
  }
  return hits;
}
export function recentlyPublished(games,asOf){
  const latest=Date.parse(asOf);
  return games.filter(g=>{
    const time=Date.parse(g.releaseTime);
    return Number.isFinite(time)&&time<=latest&&time>=latest-14*86400000;
  });
}
export function searchRecords(games){
  return games.map(({lang,path,img,name,fullname})=>({lang,path,img,name,fullname}));
}
