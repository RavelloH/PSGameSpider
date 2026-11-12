/**
 * Mirror only original UI assets (46 files, ~13 MB) from RavelloH/ravelloh.github.io.
 * NO game cover bulk sync. GitHub tree API is read-only.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const HERE=path.dirname(fileURLToPath(import.meta.url));
const dest=path.join(HERE,'assets-cache');
let tree=null;
for(let attempt=0;attempt<4;attempt++){
  try{tree=JSON.parse(execFileSync('gh',['api','repos/RavelloH/ravelloh.github.io/git/trees/master?recursive=1'],{encoding:'utf8',maxBuffer:20_000_000,timeout:20000,stdio:['ignore','pipe','pipe']}));break;}
  catch(error){if(attempt===3)throw error;await new Promise(resolve=>setTimeout(resolve,(attempt+1)*800));}
}
const assets=tree.tree.filter(t=>t.type==='blob'&&t.path.startsWith('origin/assets/'));
if(assets.length<30||assets.length>120)throw Error('Unexpected UI asset inventory: '+assets.length);
if(assets.reduce((s,t)=>s+t.size,0)>40_000_000)throw Error('Unexpected size');
let next=0,created=0,skipped=0;
async function work(){
  while(next<assets.length){
    const file=assets[next++],relative=file.path.slice('origin/'.length);
    const target=path.join(dest,relative);
    try{if((await fs.stat(target)).size===file.size){skipped++;continue}}catch{}
    const url='https://raw.githubusercontent.com/RavelloH/ravelloh.github.io/master/'+file.path;
    let buffer;
    for(let attempt=0;attempt<3;attempt++){
      try{
        const response=await fetch(url,{signal:AbortSignal.timeout(15000)});
        if(!response.ok)throw Error('HTTP '+response.status+' '+url);
        buffer=Buffer.from(await response.arrayBuffer());
        if(buffer.length!==file.size)throw Error('File-size mismatch '+file.path);
        break;
      }catch(err){if(attempt===2)throw err;await new Promise(resolve=>setTimeout(resolve,300*(attempt+1)))}
    }
    await fs.mkdir(path.dirname(target),{recursive:true});
    await fs.writeFile(target,buffer);
    created++;
  }
}
await Promise.all(Array.from({length:5},work));
console.log(JSON.stringify({status:'synced',files:assets.length,downloaded:created,cached:skipped,bytes:assets.reduce((s,t)=>s+t.size,0),directory:dest}));
