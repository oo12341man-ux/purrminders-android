/* Builds www/ from web/: bundles three.js and the speech runtime so the app works fully offline */
const fs=require('fs'),path=require('path');
const rm=p=>fs.rmSync(p,{recursive:true,force:true}),cp=(a,b)=>fs.cpSync(a,b,{recursive:true});
rm('www');cp('web','www');
for(const f of ['sw.js','manifest.webmanifest'])rm(path.join('www',f));
fs.mkdirSync('www/lib',{recursive:true});fs.copyFileSync('node_modules/three/build/three.min.js','www/lib/three.min.js');
let html=fs.readFileSync('www/index.html','utf8');
const cdn='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
if(!html.includes(cdn))throw new Error('three.js script tag not found');
html=html.replace(cdn,'lib/three.min.js').replace(/<link rel="manifest"[^>]*>\n?/,'');
fs.writeFileSync('www/index.html',html);
const ort='node_modules/onnxruntime-web/dist';fs.mkdirSync('www/voice/ort',{recursive:true});
let n=0;for(const f of fs.readdirSync(ort))if(f==='ort.min.js'||/^ort-wasm.*\.wasm$/.test(f)){fs.copyFileSync(path.join(ort,f),path.join('www/voice/ort',f));n++}
if(!fs.existsSync('www/voice/ort/ort.min.js'))throw new Error('ort.min.js missing');
console.log('www ready: three.js bundled, speech runtime files:',n);
