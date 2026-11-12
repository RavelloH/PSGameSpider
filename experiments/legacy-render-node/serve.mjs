/** Offline-only Node.js static preview server for original render-build site.
 * Preserves Vercel clean URLs and original /api/search input-only behavior.
 * Downloads NO image library; redirects each requested cover to existing Raw URL.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url));
const outputRoot=path.resolve(HERE,'../output');
const opts=new Map();
for(let i=2;i<process.argv.length;i++){
 if(process.argv[i].startsWith('--')){opts.set(process.argv[i].slice(2),process.argv[++i]);}
}
const directory=path.resolve(opts.get('root')||path.join(outputRoot,'renderbuild-restored'));
const port=Number(opts.get('port')||4173);
const basePath=String(opts.get('base-path')||'/');
if(!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(basePath))throw Error('Invalid base path');
if(!Number.isSafeInteger(port)||port<1024||port>65535)throw Error('Invalid port');
const rel=path.relative(outputRoot,directory);
if(!rel||rel.startsWith('..')||path.isAbsolute(rel)||!fs.statSync(directory).isDirectory())
 throw Error('Must serve local isolated renderbuild output');
if(!fs.existsSync(path.join(directory,'en-us','index.html')))
 throw Error('Build site is missing en-us/index.html');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png',
  '.webp':'image/webp','.ttf':'font/ttf','.woff':'font/woff','.woff2':'font/woff2',
  '.eot':'application/vnd.ms-fontobject','.ico':'image/x-icon'};
const searchCache=new Map();
const REGIONS=new Set(['zh-hans-hk','ja-jp','en-us','en-gb','ko-kr']);
const fail=(res,status,msg)=>{res.writeHead(status,{'content-type':'text/plain; charset=utf-8','cache-control':'no-store'});res.end(msg);}
const server=http.createServer(async(req,res)=>{
 try{
   const u=new URL(req.url,'http://127.0.0.1');
   const requestPath=decodeURIComponent(u.pathname);
   if(basePath!=='/'&&!requestPath.startsWith(basePath))return fail(res,404,'Outside preview base path');
   const pathname=basePath==='/'?requestPath:'/'+requestPath.slice(basePath.length);
   if(req.method!=='GET'&&req.method!=='HEAD')return fail(res,405,'Method not allowed');
   if(pathname==='/'){
     res.writeHead(308,{location:basePath+'zh-hans-hk','cache-control':'no-store','content-length':'0'});res.end();return;
   }
   if(pathname==='/api/search'){
     const region=u.searchParams.get('area')||'';
     const needle=(u.searchParams.get('keyword')||'').trim().normalize('NFKC').toLocaleLowerCase();
     if(!REGIONS.has(region)||needle.length>120)return fail(res,400,'Invalid search parameters');
     if(!needle){res.writeHead(200,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end('[]');return;}
     if(!searchCache.has(region)){
       searchCache.set(region,JSON.parse(fs.readFileSync(path.join(directory,region,'search-index.json'),'utf8')));
     }
     // Original index.ejs builds HTML via string interpolation; escape user-
     // supplied catalog values before responding to prevent search-result XSS.
     const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
     const results=searchCache.get(region).filter(x=>
       String(x.name||'').normalize('NFKC').toLocaleLowerCase().includes(needle)||
       String(x.fullname||'').normalize('NFKC').toLocaleLowerCase().includes(needle)).slice(0,80)
       .map(x=>({lang:region,path:String(x.path||''),
          img:/^images\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/i.test(x.img||'')?x.img:'images/unknown.jpg',
          name:esc(x.name),fullname:esc(x.fullname)}));
     const body=JSON.stringify(results);
     res.writeHead(200,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','content-length':Buffer.byteLength(body)});
     res.end(req.method==='HEAD'?'':body);return;
   }
   // Original source uses /images and /mini; the sparse checkout intentionally
   // has no photo tree. Keep those paths working via existing original images.
   const image=pathname.match(/^\/(?:images|mini)\/([A-Za-z0-9._-]+\.(?:jpg|jpeg|png|webp))$/i);
   if(image){
     const url='https://raw.githubusercontent.com/RavelloH/PSGameSpider/main/origin/images/'+image[1];
     res.writeHead(302,{location:url,'cache-control':'public, max-age=3600','content-length':'0'});res.end();return;
   }
   if(pathname.includes('\0')||pathname.includes('\\'))return fail(res,400,'Invalid path');
   let resolved=path.resolve(directory,'.'+pathname);
   if(!resolved.startsWith(directory+path.sep))return fail(res,403,'Forbidden');
   if(!fs.existsSync(resolved))return fail(res,404,'Not found');
   if(fs.statSync(resolved).isDirectory())resolved=path.join(resolved,'index.html');
   if(!fs.existsSync(resolved)||!fs.statSync(resolved).isFile())return fail(res,404,'Not found');
   const stat=fs.statSync(resolved),ext=path.extname(resolved).toLowerCase();
   res.writeHead(200,{'content-type':mime[ext]||'application/octet-stream','content-length':stat.size,'cache-control':'no-store'});
   if(req.method==='HEAD')res.end();
   else fs.createReadStream(resolved).pipe(res);
 }catch(err){console.error('REQUEST_ERROR',String(err));if(!res.headersSent)fail(res,500,'Internal preview error');else res.end();}
});
server.listen(port,'127.0.0.1',()=>console.log('NODE_RENDERBUILD_PREVIEW http://127.0.0.1:'+port+'/ SOURCE '+directory));
