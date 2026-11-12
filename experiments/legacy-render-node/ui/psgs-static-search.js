/* GitHub Pages has no /api/search. Search the region's immutable static index. */
(() => {
  'use strict';
  const indexes=new Map(), pending=new Map();
  const base=String(window.PSGS_BASE||'/');
  const regions=new Set(['zh-hans-hk','ja-jp','en-us','en-gb','ko-kr']);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
  window.psgsCoverUrl=(path,width=256)=>{
    const match=String(path??'').match(/^(?:images\/)?([A-Za-z0-9._-]+\.(?:jpe?g|png|webp))$/i);
    if(!match)return base+'assets/images/broke.jpg';
    return 'https://i.ravelloh.com/raw.githubusercontent.com/RavelloH/PSGameSpider/main/origin/images/'
      + match[1]+'?w='+width+'&q=75';
  };
  window.psgsCoverAttributes=(path,name)=>{
    const attrs=Array.from([128,256,384,640],size=>window.psgsCoverUrl(path,size)+' '+size+'w').join(', ');
    return 'src="'+window.psgsCoverUrl(path,256)+'" srcset="'+attrs+
      '" sizes="(max-width:520px) 25vw, (max-width:960px) 160px, 160px" loading="lazy" decoding="async" alt="'+esc(name)+'" class="no-zoom"';
  };
  // Retain the original search-card DOM and animations; only rewrite URLs.
  window.psgsOptimizeSearchResult=(markup,game)=>String(markup)
    // The publishing builder may already have prefixed legacy inline hrefs.
    .replace(new RegExp('href="/(?!/|'+base.slice(1)+')'), 'href="'+base)
    .replace(/<img\b[^>]*>/, '<img '+window.psgsCoverAttributes(game.img, game.fullname)+' />');
  window.psgsSearch=async (region,keyword)=>{
    if(!regions.has(region))throw Error('Invalid region');
    const needle=String(keyword??'').trim().normalize('NFKC').toLocaleLowerCase();
    if(!needle||needle.length>120)return [];
    if(!pending.has(region)){
      pending.set(region,fetch(base+region+'/search-index.json').then(r=>{
        if(!r.ok)throw Error('Search index HTTP '+r.status);
        return r.json();
      }).then(rows=>(indexes.set(region,rows),rows)).catch(e=>(pending.delete(region),Promise.reject(e))));
    }
    const data=indexes.get(region)||await pending.get(region);
    return data.filter(x=>String(x.name??'').normalize('NFKC').toLocaleLowerCase().includes(needle)||
      String(x.fullname??'').normalize('NFKC').toLocaleLowerCase().includes(needle))
      .slice(0,80).map(x=>({
        ...x,lang:region,name:esc(x.name),fullname:esc(x.fullname),
        img:/^images\/[A-Za-z0-9._-]+\.(jpe?g|png|webp)$/i.test(x.img)?x.img:'images/unknown.jpg'
      }));
  };
})();
