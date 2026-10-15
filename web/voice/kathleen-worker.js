/* Kathleen voice worker: loads the speech runtime, voice and dictionary, then turns text into audio off the main thread */
const ORT_VER='1.17.3';
const ORT_CDNS=['https://cdn.jsdelivr.net/npm/onnxruntime-web@'+ORT_VER+'/dist/','https://unpkg.com/onnxruntime-web@'+ORT_VER+'/dist/','https://cdnjs.cloudflare.com/ajax/libs/onnxruntime-web/'+ORT_VER+'/'];
let session=null,g2p=null,cfg=null,step='start';
const post=(m,t)=>self.postMessage(m,t||[]);
async function getJSON(u){const r=await fetch(u);if(!r.ok)throw new Error(u+' HTTP '+r.status);return r.json()}
async function init(base){
  step='speech runtime';let loaded=false;
  for(const b of [base+'ort/',...ORT_CDNS]){/* the Android app carries its own copy; the web app uses a CDN */try{importScripts(b+'ort.min.js');if(self.ort){ort.env.wasm.wasmPaths=b;loaded=true;break}}catch(e){}}
  if(!loaded)throw new Error('could not load the speech runtime (offline or blocked)');
  ort.env.wasm.numThreads=1;ort.env.wasm.proxy=false;
  step='voice settings';const man=await getJSON(base+'kathleen.manifest.json');cfg=await getJSON(base+man.config);
  step='pronunciation dictionary';importScripts(base+'kathleen-g2p.js');const D=await getJSON(base+man.dict),X=await getJSON(base+man.extra);g2p=self.KG2P.make(D,X,cfg.phoneme_id_map);
  step='voice';const buf=new Uint8Array(man.size);let off=0;
  for(let i=0;i<man.parts.length;i++){const r=await fetch(base+man.parts[i]);if(!r.ok)throw new Error(man.parts[i]+' HTTP '+r.status);
    const b=man.encoding==='base64'?Uint8Array.from(atob((await r.text()).replace(/\s+/g,'')),c=>c.charCodeAt(0)):new Uint8Array(await r.arrayBuffer());buf.set(b,off);off+=b.length;post({type:'progress',done:off,total:man.size})}
  if(off!==man.size)throw new Error('voice file incomplete ('+off+' of '+man.size+' bytes)');
  step='starting the voice';session=await ort.InferenceSession.create(buf,{executionProviders:['wasm'],graphOptimizationLevel:'all'});
  step='ready';return cfg.audio.sample_rate}
async function speak(text,opt){
  const inf=cfg.inference||{},S=g2p.toIds(text),chunks=[],gap=new Float32Array(Math.round(cfg.audio.sample_rate*(opt.gap||.3)));
  for(const ids of S){if(ids.length<4)continue;
    const feeds={input:new ort.Tensor('int64',BigInt64Array.from(ids.map(BigInt)),[1,ids.length]),input_lengths:new ort.Tensor('int64',BigInt64Array.from([BigInt(ids.length)]),[1]),
      scales:new ort.Tensor('float32',Float32Array.from([opt.noise??inf.noise_scale??.667,opt.length??inf.length_scale??1,opt.noiseW??inf.noise_w??.8]),[3])};
    const out=await session.run(feeds);const a=(out.output||out[Object.keys(out)[0]]).data;chunks.push(Float32Array.from(a),gap)}
  let n=0;for(const c of chunks)n+=c.length;const pcm=new Float32Array(n);let o=0;for(const c of chunks){pcm.set(c,o);o+=c.length}
  let peak=0;for(let i=0;i<pcm.length;i++)peak=Math.max(peak,Math.abs(pcm[i]));if(peak>0){const k=.9/peak;for(let i=0;i<pcm.length;i++)pcm[i]*=k}
  return pcm}
let initP=null;
self.onmessage=async e=>{const m=e.data;
  if(m.type==='init'){if(!initP)initP=init(m.base);try{const sr=await initP;post({type:'ready',sr})}catch(err){initP=null;post({type:'error',step,msg:String(err&&err.message||err)})}}
  if(m.type==='speak'){try{if(!session)throw new Error('voice not ready');const pcm=await speak(m.text,m.opt||{});post({type:'audio',id:m.id,pcm,sr:cfg.audio.sample_rate},[pcm.buffer])}
    catch(err){post({type:'speakError',id:m.id,msg:String(err&&err.message||err)})}}};
