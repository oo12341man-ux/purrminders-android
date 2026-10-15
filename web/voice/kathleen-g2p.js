/* Kathleen pronunciation: text -> Piper phoneme ids, fully offline, using a dictionary made with Piper's own tool */
(function(root){
const ONES=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const TENS=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
const ORD={one:'first',two:'second',three:'third',five:'fifth',eight:'eighth',nine:'ninth',twelve:'twelfth'};
function num(n){n=Math.floor(n);if(n<0)return 'minus '+num(-n);if(n<20)return ONES[n];if(n<100)return TENS[Math.floor(n/10)]+(n%10?' '+ONES[n%10]:'');
  if(n<1000)return ONES[Math.floor(n/100)]+' hundred'+(n%100?' '+num(n%100):'');
  for(const[v,w]of[[1e9,'billion'],[1e6,'million'],[1e3,'thousand']])if(n>=v)return num(Math.floor(n/v))+' '+w+(n%v?' '+num(n%v):'');}
function ordinal(n){const w=num(n).split(' '),l=w.pop();return w.concat(ORD[l]||(l.endsWith('y')?l.slice(0,-1)+'ieth':l+'th')).join(' ')}
function year(n){if(n>=2000&&n<2010)return num(n);if(n>=1100&&n<2100&&n%100)return num(Math.floor(n/100))+' '+(n%100<10?'oh '+num(n%100):num(n%100));return num(n)}
const MON={jan:'January',feb:'February',mar:'March',apr:'April',may:'May',jun:'June',jul:'July',aug:'August',sep:'September',sept:'September',oct:'October',nov:'November',dec:'December'};
const WD={sun:'Sunday',mon:'Monday',tue:'Tuesday',tues:'Tuesday',wed:'Wednesday',thu:'Thursday',thur:'Thursday',thurs:'Thursday',fri:'Friday',sat:'Saturday'};
function normalize(t){
  t=String(t).replace(/[\u{1F000}-\u{1FAFF}☀-➿️‍]/gu,' ').replace(/[“”"]/g,'').replace(/[‘’]/g,"'").replace(/–|—/g,', ').replace(/…/g,'.').replace(/·/g,',');
  t=t.replace(/\b(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?\b/g,(m,h,mi,ap)=>num(+h)+(+mi===0?'':+mi<10?' oh '+num(+mi):' '+num(+mi))+(ap?' '+ap.toUpperCase():''));
  t=t.replace(/\b(\d{1,2})\s*(AM|PM|am|pm)\b/g,(m,h,ap)=>num(+h)+' '+ap.toUpperCase());
  t=t.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b(?:,?\s+(\d{4}))?/g,(m,mo,d,y)=>MON[mo.toLowerCase()]+' '+ordinal(+d)+(y?', '+year(+y):''));
  t=t.replace(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)[a-z]*\.?(?:,?\s+(\d{4}))?/g,(m,d,mo,y)=>'the '+ordinal(+d)+' of '+MON[mo.toLowerCase()]+(y?', '+year(+y):''));
  t=t.replace(/\b(Sun|Mon|Tues?|Wed|Thur?s?|Fri|Sat)\b\.?/g,(m,w)=>WD[w.toLowerCase()]||m);
  t=t.replace(/\b(\d+)(st|nd|rd|th)\b/g,(m,d)=>ordinal(+d));
  t=t.replace(/\b(1[1-9]\d\d|20\d\d)\b/g,(m,y)=>year(+y));
  t=t.replace(/\bRM\s?(\d[\d,]*)(?:\.(\d{2}))?\b/gi,(m,a,c)=>num(+a.replace(/,/g,''))+' ringgit'+(c&&+c?' '+num(+c):''));
  t=t.replace(/[$£€]\s?(\d[\d,]*)(?:\.(\d{2}))?/g,(m,a,c)=>num(+a.replace(/,/g,''))+(c&&+c?' point '+c.split('').map(x=>ONES[+x]).join(' '):''));
  t=t.replace(/\b(\d[\d,]*)\.(\d+)\b/g,(m,a,b)=>num(+a.replace(/,/g,''))+' point '+b.split('').map(x=>ONES[+x]).join(' '));
  t=t.replace(/\b\d{1,3}(?:,\d{3})+\b|\b\d+\b/g,m=>num(+m.replace(/,/g,'')));
  t=t.replace(/%/g,' percent').replace(/&/g,' and ').replace(/\+/g,' plus ').replace(/[\/_]/g,' ').replace(/[()\[\]{}<>*#=~^|\\]/g,' ');
  return t.replace(/\s+/g,' ').trim()}
function make(D,X,idmap){
  const L=X.letters,SP=X.special;
  const ok=p=>{for(const c of p)if(!idmap[c])return false;return true};
  function word(w){const lw=w.toLowerCase();
    if((w==='AM'||w==='PM')&&SP[lw])return SP[lw];if(SP[lw]&&lw!=='am'&&lw!=='pm')return SP[lw];if(D[lw]!=null)return D[lw];
    if(/^[A-Z]{2,4}$/.test(w))return w.toLowerCase().split('').map(c=>L[c]).join(' ');
    let m=lw.match(/^(.+)'s$/);if(m){const b=word(m[1]);if(b)return b+(/[szʃʒ]$|tʃ$|dʒ$/.test(b)?'ɪz':/[ptkfθ]$/.test(b)?'s':'z')}
    if((m=lw.match(/^(.+?)(s|es)$/))&&D[m[1]])return D[m[1]]+(/[szʃʒ]$|tʃ$|dʒ$/.test(D[m[1]])?'ɪz':/[ptkfθ]$/.test(D[m[1]])?'s':'z');
    if((m=lw.match(/^(.+?)(ing)$/))&&(D[m[1]]||D[m[1]+'e']))return (D[m[1]]||D[m[1]+'e'])+'ɪŋ';
    if((m=lw.match(/^(.+?)(ed)$/))&&(D[m[1]]||D[m[1]+'e'])){const b=D[m[1]]||D[m[1]+'e'];return b+(/[td]$/.test(b)?'ɪd':/[pkfsθʃ]$|tʃ$/.test(b)?'t':'d')}
    /* unknown: split into known pieces (fewest pieces), else spell it out */
    const n=lw.length,best=new Array(n+1).fill(null);best[0]=[];
    for(let i=0;i<n;i++)if(best[i])for(let j=Math.min(n,i+20);j>i;j--){const s=lw.slice(i,j);if(s.length>=3&&D[s]!=null&&(!best[j]||best[j].length>best[i].length+1))best[j]=best[i].concat(D[s])}
    if(best[n]&&best[n].length<=2)return best[n].join('').replace(/ˈ(?=.*ˈ)/g,'ˌ');
    return soundOut(lw)}
  /* sound out an unknown word letter-group by letter-group (works well for Malay, Tamil, Chinese and other romanised names) */
  const RULES=[['tch','tʃ'],['sch','ʃ'],['ng','ŋ'],['ny','nj'],['sh','ʃ'],['sy','ʃ'],['ch','tʃ'],['th','t'],['ph','f'],['kh','k'],['gh','ɡ'],['dh','d'],['bh','b'],['zh','dʒ'],['ck','k'],['qu','kw'],['x','ks'],
    ['ee','iː'],['ea','iː'],['oo','uː'],['ou','aʊ'],['ow','aʊ'],['oi','ɔɪ'],['oy','ɔɪ'],['ai','aɪ'],['ay','eɪ'],['au','aʊ'],['ei','eɪ'],['ey','eɪ'],['ie','iː'],['ue','uː'],['aa','ɑː'],['ii','iː'],['uu','uː'],
    ['é','eɪ'],['è','ɛ'],['ê','ɛ'],['á','ɑː'],['à','ɑː'],['ñ','nj'],['ç','s'],['ü','uː'],['ö','ɜː'],['ó','oʊ'],['í','iː'],['ú','uː'],
    ['a','ɑː'],['e','ɛ'],['i','iː'],['o','oʊ'],['u','uː'],['y','j'],['b','b'],['c','tʃ'],['d','d'],['f','f'],['g','ɡ'],['h','h'],['j','dʒ'],['k','k'],['l','l'],['m','m'],['n','n'],['p','p'],['q','k'],['r','ɹ'],['s','s'],['t','t'],['v','v'],['w','w'],['z','z']];
  const VOW=/^(iː|uː|aʊ|ɔɪ|aɪ|eɪ|ɑː|oʊ|ɛ|ɜː)/;
  function soundOut(w){let out='',i=0,first=true;w=w.replace(/[^a-zà-ÿ]/g,'');
    while(i<w.length){if(w[i]==='h'&&i===w.length-1&&i>0){i++;continue}let hit=null;for(const[g,p]of RULES)if(w.startsWith(g,i)){hit=[g,p];break}if(!hit){i++;continue}
      let p=hit[1];if(VOW.test(p)){if(first){p='ˈ'+p;first=false}else if(p==='ɑː'&&i===w.length-1)p='ə'}
      if(hit[0]==='e'&&i===w.length-1&&out)p='eɪ';out+=p;i+=hit[0].length}
    return [...out].filter(c=>idmap[c]).join('')||w.split('').map(c=>L[c]||'').join(' ')}
  function sentences(text){const t=normalize(text);const parts=t.match(/[^.!?]+[.!?]*/g)||[];return parts.map(s=>s.trim()).filter(s=>/[a-z0-9]/i.test(s))}
  function hyph(tk){const whole=tk.replace(/-/g,'').toLowerCase();if(D[whole]!=null||SP[whole])return word(whole);
    const ps=tk.split('-').filter(Boolean).map(word);return ps.map((p,i)=>i?p.replace(/^ˌ/,'ˈ'):p).join('')}
  function phonemes(sentence){const toks=sentence.match(/[A-Za-z0-9À-ɏ']+(?:-[A-Za-z0-9À-ɏ']+)*|[,.!?;:]/g)||[];let out='';
    for(const tk of toks){if(/^[,.!?;:]$/.test(tk)){out=out.replace(/ $/,'')+tk+' ';continue}const c=tk.replace(/^'+|'+$/g,'');const p=c.includes('-')?hyph(c):word(c);if(p)out+=p+' '}
    out=out.replace(/(^| )(tə)( )(?=[ˈˌ]?[aeiouæɑɐɔəɛɜɪʊʌ])/g,'$1tʊ$3').replace(/(^| )(ðə)( )(?=[ˈˌ]?[aeiouæɑɐɔəɛɜɪʊʌ])/g,'$1ðɪ$3');
    return /:\s*$/.test(out)?out.trim()+' ':out.trim()}
  function ids(ph){const a=[1,0];for(const c of ph){const v=idmap[c];if(v)a.push(v[0],0)}a.push(2);return a}
  return{normalize,sentences,phonemes,ids,word,toIds:text=>sentences(text).map(s=>ids(phonemes(s)))}}
const api={make,normalize,num,ordinal};
if(typeof module!=='undefined')module.exports=api;else root.KG2P=api;
})(typeof self!=='undefined'?self:this);
