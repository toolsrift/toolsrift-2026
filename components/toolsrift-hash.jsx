import { useState, useEffect, useCallback, useMemo, useRef } from "react";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
import { getCategoryById } from '../lib/categoryThemes';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolCard from './shared/ToolCard';
import ToolPageLayout from './shared/ToolPageLayout';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';

// �"����� TOKENS �������������������������������������������������������������������������������������������������������������������������������������"�
const C = {
  bg:"#06090F", surface:"#0D1117", border:"rgba(255,255,255,0.06)",
  green:"#7C3AED", greenD:"#6D28D9", text:"#E2E8F0", muted:"#64748B",
  blue:"#7C3AED", purple:"#8B5CF6", warn:"#F59E0B", danger:"#EF4444",
  teal:"#14B8A6", emerald:"#7C3AED",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:6px;height:6px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
  ::selection{background:rgba(124,58,237,0.3)}
  button:hover{filter:brightness(1.1)}
  select option{background:#0D1117}
  textarea{resize:vertical}
  input[type=range]{accent-color:#7C3AED}
  .fade-in{animation:fadeIn .22s ease}
  @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
  .spin{animation:spin 1s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .tr-nav-cats{display:flex;gap:4px;align-items:center}
  .tr-nav-badge{display:inline-flex}
  @media(max-width:640px){
    .tr-nav-cats{display:none!important}
    .tr-nav-badge{display:none!important}
  }
`;

const T = {
  mono:{ fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
  label:{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
  h1:{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:C.text },
  h2:{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:C.text },
};

// �"����� SHARED UI �������������������������������������������������������������������������������������������������������������������������������"�
function Badge({ children, color="green" }) {
  const bg={green:"rgba(16,185,129,0.15)",blue:"rgba(59,130,246,0.15)",amber:"rgba(245,158,11,0.15)",red:"rgba(239,68,68,0.15)",purple:"rgba(139,92,246,0.15)",teal:"rgba(20,184,166,0.15)"};
  const fg={green:"#34D399",blue:"#60A5FA",amber:"#FCD34D",red:"#FCA5A5",purple:"#A78BFA",teal:"#2DD4BF"};
  return <span style={{background:bg[color]||bg.green,color:fg[color]||fg.green,borderRadius:4,padding:"2px 8px",fontSize:11,fontWeight:600,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{children}</span>;
}

function Btn({ children, onClick, variant="primary", size="md", disabled, style={} }) {
  const base={display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,border:"none",cursor:disabled?"not-allowed":"pointer",borderRadius:8,fontWeight:600,transition:"all .15s",fontFamily:"'Plus Jakarta Sans',sans-serif",opacity:disabled?0.5:1};
  const sz={sm:{padding:"6px 14px",fontSize:12},md:{padding:"9px 20px",fontSize:13},lg:{padding:"12px 28px",fontSize:14}}[size];
  const v={
    primary:{background:`linear-gradient(135deg,${C.green},${C.greenD})`,color:"#fff",boxShadow:"0 2px 8px rgba(124,58,237,0.3)"},
    secondary:{background:"rgba(255,255,255,0.05)",color:C.text,border:`1px solid ${C.border}`},
    ghost:{background:"transparent",color:C.muted},
    danger:{background:"rgba(239,68,68,0.15)",color:"#FCA5A5"},
    blue:{background:`linear-gradient(135deg,${C.blue},#6D28D9)`,color:"#fff",boxShadow:"0 2px 8px rgba(124,58,237,0.25)"},
  }[variant];
  return <button style={{...base,...sz,...v,...style}} onClick={onClick} disabled={disabled}>{children}</button>;
}

function Input({ value, onChange, placeholder, style={}, mono=false, type="text" }) {
  return (
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontSize:13,fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif",outline:"none",...style}}
      onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=C.border} />
  );
}

function Textarea({ value, onChange, placeholder, rows=5, mono=true, readOnly=false, style={} }) {
  return (
    <textarea value={value} onChange={e=>onChange&&onChange(e.target.value)} placeholder={placeholder} rows={rows} readOnly={readOnly}
      style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px",color:C.text,fontSize:13,fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif",outline:"none",lineHeight:1.6,...style}}
      onFocus={e=>!readOnly&&(e.target.style.borderColor=C.green)} onBlur={e=>e.target.style.borderColor=C.border} />
  );
}

function SelectInput({ value, onChange, options, style={} }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 14px",color:C.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",cursor:"pointer",...style}}>
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Card({ children, style={} }) {
  return <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20,...style}}>{children}</div>;
}

function Label({ children }) { return <div style={{...T.label,marginBottom:6}}>{children}</div>; }

function CopyBtn({ text, style={} }) {
  const [copied, setCopied] = useState(false);
  const [err, setErr]       = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text || '').then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    }).catch(() => { setErr(true); setTimeout(() => setErr(false), 2000); });
  };
  return (
    <button onClick={copy} style={{
      background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)',
      border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
      color: err ? '#EF4444' : copied ? '#10B981' : '#94A3B8',
      borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600,
      cursor: 'pointer', transition: 'all 0.15s', minHeight: 36,
      fontFamily: "'Plus Jakarta Sans',sans-serif", ...style,
    }}>
      {err ? 'Failed' : copied ? '✓ Copied!' : 'Copy'}
    </button>
  );
}

function HashOutput({ label, value, accent=C.green }) {
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <Label>{label}</Label>
        {value && <CopyBtn text={value} />}
      </div>
      <div style={{background:"rgba(0,0,0,0.4)",border:`1px solid ${value?accent+"40":C.border}`,borderRadius:8,padding:"12px 16px",fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:value?accent:C.muted,wordBreak:"break-all",letterSpacing:"0.03em",minHeight:44,lineHeight:1.6}}>
        {value||<span style={{color:C.muted,fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:13}}>Hash will appear here…</span>}
      </div>
    </div>
  );
}

function StatRow({ label, value, mono=false, accent="" }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
      <span style={{color:C.muted}}>{label}</span>
      <span style={{color:accent||C.text,fontFamily:mono?"'JetBrains Mono',monospace":"inherit",fontWeight:600}}>{value}</span>
    </div>
  );
}

function VStack({ children, gap=12 }) { return <div style={{display:"flex",flexDirection:"column",gap}}>{children}</div>; }
function Grid2({ children, gap=16 }) { return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap}}>{children}</div>; }
function Grid3({ children }) { return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>{children}</div>; }

function StatBox({ value, label, accent=C.green }) {
  return (
    <div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 10px",textAlign:"center"}}>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:700,color:accent}}>{value}</div>
      <div style={{fontSize:11,color:C.muted,marginTop:2}}>{label}</div>
    </div>
  );
}

function ModeToggle({ mode, setMode, options }) {
  return (
    <div style={{display:"inline-flex",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,padding:3,gap:2}}>
      {options.map(([v,l])=>(
        <button key={v} onClick={()=>setMode(v)} style={{padding:"6px 16px",borderRadius:6,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Plus Jakarta Sans',sans-serif",background:mode===v?`linear-gradient(135deg,${C.green},${C.greenD})`:"transparent",color:mode===v?"#fff":C.muted,transition:"all .15s"}}>{l}</button>
      ))}
    </div>
  );
}

// �"����� ROUTER �������������������������������������������������������������������������������������������������������������������������������������"�
function useAppRouter() {
  const parse=()=>{ const h=window.location.hash||"#/"; const path=h.replace(/^#/,"")||"/"; const parts=path.split("/").filter(Boolean); if(!parts.length) return{page:"home"}; if(parts[0]==="tool"&&parts[1]) return{page:"tool",toolId:parts[1]}; if(parts[0]==="category"&&parts[1]) return{page:"home"}; return{page:"home"}; };
  const [route,setRoute]=useState(parse);
  useEffect(()=>{ const fn=()=>setRoute(parse()); window.addEventListener("hashchange",fn); return()=>window.removeEventListener("hashchange",fn); },[]);
  useEffect(()=>{ const fn=e=>{ const a=e.target.closest("a[href]"); if(!a) return; const h=a.getAttribute("href"); if(h&&h.startsWith("#/")){e.preventDefault();window.location.hash=h;} }; document.addEventListener("click",fn); return()=>document.removeEventListener("click",fn); },[]);
  return route;
}

// �"����� PURE-JS SHA IMPLEMENTATIONS �����������������������������������������������������������������������������������������"�
// SHA-1
function sha1(msg) {
  function rotl(n,s){return(n<<s)|(n>>>(32-s));}
  const bytes=Array.isArray(msg)?msg.slice():[...msg].flatMap(c=>{const cp=c.codePointAt(0);return cp<0x80?[cp]:cp<0x800?[0xC0|(cp>>6),0x80|(cp&0x3F)]:cp<0x10000?[0xE0|(cp>>12),0x80|((cp>>6)&0x3F),0x80|(cp&0x3F)]:[0xF0|(cp>>18),0x80|((cp>>12)&0x3F),0x80|((cp>>6)&0x3F),0x80|(cp&0x3F)];});
  const ml=bytes.length*8;
  bytes.push(0x80);
  while(bytes.length%64!==56) bytes.push(0);
  for(let i=7;i>=0;i--) bytes.push((ml/(2**(i*8)))&0xFF);
  let[h0,h1,h2,h3,h4]=[0x67452301,0xEFCDAB89,0x98BADCFE,0x10325476,0xC3D2E1F0];
  for(let i=0;i<bytes.length;i+=64){
    const w=[];
    for(let j=0;j<16;j++) w[j]=(bytes[i+j*4]<<24)|(bytes[i+j*4+1]<<16)|(bytes[i+j*4+2]<<8)|bytes[i+j*4+3];
    for(let j=16;j<80;j++) w[j]=rotl(w[j-3]^w[j-8]^w[j-14]^w[j-16],1);
    let[a,b,c,d,e]=[h0,h1,h2,h3,h4];
    for(let j=0;j<80;j++){
      let f,k;
      if(j<20){f=(b&c)|((~b)&d);k=0x5A827999;}
      else if(j<40){f=b^c^d;k=0x6ED9EBA1;}
      else if(j<60){f=(b&c)|(b&d)|(c&d);k=0x8F1BBCDC;}
      else{f=b^c^d;k=0xCA62C1D6;}
      const tmp=(rotl(a,5)+f+e+k+w[j])>>>0;
      e=d;d=c;c=rotl(b,30);b=a;a=tmp;
    }
    h0=(h0+a)>>>0;h1=(h1+b)>>>0;h2=(h2+c)>>>0;h3=(h3+d)>>>0;h4=(h4+e)>>>0;
  }
  return [h0,h1,h2,h3,h4].map(h=>h.toString(16).padStart(8,"0")).join("");
}

// SHA-256
function sha256(msg) {
  const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  function rotr(n,s){return(n>>>s)|(n<<(32-s));}
  const bytes=Array.isArray(msg)?msg.slice():[...msg].flatMap(c=>{const cp=c.codePointAt(0);return cp<0x80?[cp]:cp<0x800?[0xC0|(cp>>6),0x80|(cp&0x3F)]:cp<0x10000?[0xE0|(cp>>12),0x80|((cp>>6)&0x3F),0x80|(cp&0x3F)]:[0xF0|(cp>>18),0x80|((cp>>12)&0x3F),0x80|((cp>>6)&0x3F),0x80|(cp&0x3F)];});
  const ml=bytes.length*8; bytes.push(0x80);
  while(bytes.length%64!==56) bytes.push(0);
  for(let i=7;i>=0;i--) bytes.push((ml/(2**(i*8)))&0xFF);
  let[h0,h1,h2,h3,h4,h5,h6,h7]=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  for(let i=0;i<bytes.length;i+=64){
    const w=[];
    for(let j=0;j<16;j++) w[j]=(bytes[i+j*4]<<24)|(bytes[i+j*4+1]<<16)|(bytes[i+j*4+2]<<8)|bytes[i+j*4+3];
    for(let j=16;j<64;j++){const s0=rotr(w[j-15],7)^rotr(w[j-15],18)^(w[j-15]>>>3);const s1=rotr(w[j-2],17)^rotr(w[j-2],19)^(w[j-2]>>>10);w[j]=(w[j-16]+s0+w[j-7]+s1)>>>0;}
    let[a,b,c,d,e,f,g,h]=[h0,h1,h2,h3,h4,h5,h6,h7];
    for(let j=0;j<64;j++){const S1=rotr(e,6)^rotr(e,11)^rotr(e,25);const ch=(e&f)^((~e)&g);const t1=(h+S1+ch+K[j]+w[j])>>>0;const S0=rotr(a,2)^rotr(a,13)^rotr(a,22);const maj=(a&b)^(a&c)^(b&c);const t2=(S0+maj)>>>0;h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;}
    h0=(h0+a)>>>0;h1=(h1+b)>>>0;h2=(h2+c)>>>0;h3=(h3+d)>>>0;h4=(h4+e)>>>0;h5=(h5+f)>>>0;h6=(h6+g)>>>0;h7=(h7+h)>>>0;
  }
  return [h0,h1,h2,h3,h4,h5,h6,h7].map(h=>h.toString(16).padStart(8,"0")).join("");
}

// MD5
function md5(str) {
  function safeAdd(x,y){const l=(x&0xFFFF)+(y&0xFFFF);return((x>>16)+(y>>16)+(l>>16))<<16|l&0xFFFF;}
  function bitRotateLeft(n,c){return n<<c|n>>>32-c;}
  function md5cmn(q,a,b,x,s,t){return safeAdd(bitRotateLeft(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b);}
  function md5ff(a,b,c,d,x,s,t){return md5cmn(b&c|~b&d,a,b,x,s,t);}
  function md5gg(a,b,c,d,x,s,t){return md5cmn(b&d|c&~d,a,b,x,s,t);}
  function md5hh(a,b,c,d,x,s,t){return md5cmn(b^c^d,a,b,x,s,t);}
  function md5ii(a,b,c,d,x,s,t){return md5cmn(c^(b|~d),a,b,x,s,t);}
  const bytes=Array.isArray(str)?str.slice():[...str].flatMap(c=>{const cp=c.codePointAt(0);return cp<0x80?[cp]:cp<0x800?[0xC0|(cp>>6),0x80|(cp&0x3F)]:cp<0x10000?[0xE0|(cp>>12),0x80|((cp>>6)&0x3F),0x80|(cp&0x3F)]:[0xF0|(cp>>18),0x80|((cp>>12)&0x3F),0x80|((cp>>6)&0x3F),0x80|(cp&0x3F)];});
  const ml=bytes.length*8; bytes.push(0x80);
  while(bytes.length%64!==56) bytes.push(0);
  bytes.push(ml&0xFF,(ml>>8)&0xFF,(ml>>16)&0xFF,(ml>>24)&0xFF,0,0,0,0);
  const M=[];
  for(let i=0;i<bytes.length;i+=4) M.push(bytes[i]|(bytes[i+1]<<8)|(bytes[i+2]<<16)|(bytes[i+3]<<24));
  let[a,b,c,d]=[0x67452301,0xefcdab89,0x98badcfe,0x10325476];
  for(let i=0;i<M.length;i+=16){
    const[A,B,C,D]=[a,b,c,d];
    a=md5ff(a,b,c,d,M[i],7,-680876936);d=md5ff(d,a,b,c,M[i+1],12,-389564586);c=md5ff(c,d,a,b,M[i+2],17,606105819);b=md5ff(b,c,d,a,M[i+3],22,-1044525330);
    a=md5ff(a,b,c,d,M[i+4],7,-176418897);d=md5ff(d,a,b,c,M[i+5],12,1200080426);c=md5ff(c,d,a,b,M[i+6],17,-1473231341);b=md5ff(b,c,d,a,M[i+7],22,-45705983);
    a=md5ff(a,b,c,d,M[i+8],7,1770035416);d=md5ff(d,a,b,c,M[i+9],12,-1958414417);c=md5ff(c,d,a,b,M[i+10],17,-42063);b=md5ff(b,c,d,a,M[i+11],22,-1990404162);
    a=md5ff(a,b,c,d,M[i+12],7,1804603682);d=md5ff(d,a,b,c,M[i+13],12,-40341101);c=md5ff(c,d,a,b,M[i+14],17,-1502002290);b=md5ff(b,c,d,a,M[i+15],22,1236535329);
    a=md5gg(a,b,c,d,M[i+1],5,-165796510);d=md5gg(d,a,b,c,M[i+6],9,-1069501632);c=md5gg(c,d,a,b,M[i+11],14,643717713);b=md5gg(b,c,d,a,M[i],20,-373897302);
    a=md5gg(a,b,c,d,M[i+5],5,-701558691);d=md5gg(d,a,b,c,M[i+10],9,38016083);c=md5gg(c,d,a,b,M[i+15],14,-660478335);b=md5gg(b,c,d,a,M[i+4],20,-405537848);
    a=md5gg(a,b,c,d,M[i+9],5,568446438);d=md5gg(d,a,b,c,M[i+14],9,-1019803690);c=md5gg(c,d,a,b,M[i+3],14,-187363961);b=md5gg(b,c,d,a,M[i+8],20,1163531501);
    a=md5gg(a,b,c,d,M[i+13],5,-1444681467);d=md5gg(d,a,b,c,M[i+2],9,-51403784);c=md5gg(c,d,a,b,M[i+7],14,1735328473);b=md5gg(b,c,d,a,M[i+12],20,-1926607734);
    a=md5hh(a,b,c,d,M[i+5],4,-378558);d=md5hh(d,a,b,c,M[i+8],11,-2022574463);c=md5hh(c,d,a,b,M[i+11],16,1839030562);b=md5hh(b,c,d,a,M[i+14],23,-35309556);
    a=md5hh(a,b,c,d,M[i+1],4,-1530992060);d=md5hh(d,a,b,c,M[i+4],11,1272893353);c=md5hh(c,d,a,b,M[i+7],16,-155497632);b=md5hh(b,c,d,a,M[i+10],23,-1094730640);
    a=md5hh(a,b,c,d,M[i+13],4,681279174);d=md5hh(d,a,b,c,M[i],11,-358537222);c=md5hh(c,d,a,b,M[i+3],16,-722521979);b=md5hh(b,c,d,a,M[i+6],23,76029189);
    a=md5hh(a,b,c,d,M[i+9],4,-640364487);d=md5hh(d,a,b,c,M[i+12],11,-421815835);c=md5hh(c,d,a,b,M[i+15],16,530742520);b=md5hh(b,c,d,a,M[i+2],23,-995338651);
    a=md5ii(a,b,c,d,M[i],6,-198630844);d=md5ii(d,a,b,c,M[i+7],10,1126891415);c=md5ii(c,d,a,b,M[i+14],15,-1416354905);b=md5ii(b,c,d,a,M[i+5],21,-57434055);
    a=md5ii(a,b,c,d,M[i+12],6,1700485571);d=md5ii(d,a,b,c,M[i+3],10,-1894986606);c=md5ii(c,d,a,b,M[i+10],15,-1051523);b=md5ii(b,c,d,a,M[i+1],21,-2054922799);
    a=md5ii(a,b,c,d,M[i+8],6,1873313359);d=md5ii(d,a,b,c,M[i+15],10,-30611744);c=md5ii(c,d,a,b,M[i+6],15,-1560198380);b=md5ii(b,c,d,a,M[i+13],21,1309151649);
    a=md5ii(a,b,c,d,M[i+4],6,-145523070);d=md5ii(d,a,b,c,M[i+11],10,-1120210379);c=md5ii(c,d,a,b,M[i+2],15,718787259);b=md5ii(b,c,d,a,M[i+9],21,-343485551);
    a=safeAdd(a,A);b=safeAdd(b,B);c=safeAdd(c,C);d=safeAdd(d,D);
  }
  return [a,b,c,d].map(n=>[n&0xFF,(n>>8)&0xFF,(n>>16)&0xFF,(n>>24)&0xFF].map(b=>b.toString(16).padStart(2,"0")).join("")).join("");
}

// CRC32
function crc32(str) {
  let table=[];
  for(let i=0;i<256;i++){let c=i;for(let j=0;j<8;j++) c=c&1?(0xEDB88320^(c>>>1)):(c>>>1);table[i]=c;}
  let crc=0xFFFFFFFF;
  const bytes=[...str].flatMap(c=>{const cp=c.codePointAt(0);return cp<0x80?[cp]:cp<0x800?[0xC0|(cp>>6),0x80|(cp&0x3F)]:[0xE0|(cp>>12),0x80|((cp>>6)&0x3F),0x80|(cp&0x3F)];});
  for(const b of bytes) crc=table[(crc^b)&0xFF]^(crc>>>8);
  return ((crc^0xFFFFFFFF)>>>0).toString(16).toUpperCase().padStart(8,"0");
}

// Adler-32
function adler32(str) {
  let a=1,b=0;
  const MOD=65521;
  const bytes=[...str].flatMap(c=>{const cp=c.codePointAt(0);return cp<0x80?[cp]:[0xC0|(cp>>6),0x80|(cp&0x3F)];});
  for(const byte of bytes){a=(a+byte)%MOD;b=(b+a)%MOD;}
  return ((b<<16|a)>>>0).toString(16).toUpperCase().padStart(8,"0");
}

// FNV-1a 32-bit
function fnv1a32(str) {
  let hash=0x811c9dc5;
  const bytes=[...str].flatMap(c=>{const cp=c.codePointAt(0);return cp<0x80?[cp]:[0xC0|(cp>>6),0x80|(cp&0x3F)];});
  for(const b of bytes){hash^=b;hash=Math.imul(hash,0x01000193)>>>0;}
  return hash.toString(16).toUpperCase().padStart(8,"0");
}

// DJB2
function djb2(str) {
  let hash=5381;
  for(const c of str) hash=((hash<<5)+hash+c.charCodeAt(0))>>>0;
  return hash.toString(16).toUpperCase().padStart(8,"0");
}

// HMAC-SHA256 (pure JS)
function hmacSha256(key, msg) {
  const blockSize=64;
  const utf8=s=>[...s].flatMap(c=>{const cp=c.codePointAt(0);return cp<0x80?[cp]:cp<0x800?[0xC0|(cp>>6),0x80|(cp&0x3F)]:cp<0x10000?[0xE0|(cp>>12),0x80|((cp>>6)&0x3F),0x80|(cp&0x3F)]:[0xF0|(cp>>18),0x80|((cp>>12)&0x3F),0x80|((cp>>6)&0x3F),0x80|(cp&0x3F)];});
  let keyBytes=utf8(key);
  if(keyBytes.length>blockSize){
    const h=sha256(key);
    keyBytes=[];for(let i=0;i<h.length;i+=2) keyBytes.push(parseInt(h.slice(i,i+2),16));
  }
  while(keyBytes.length<blockSize) keyBytes.push(0);
  const opad=keyBytes.map(b=>b^0x5C);
  const ipad=keyBytes.map(b=>b^0x36);
  // Hash raw bytes (not UTF-8 re-encoded) so inner-digest bytes >=0x80 are preserved
  const inner=sha256(ipad.concat(utf8(msg)));
  const innerBytes=[];for(let i=0;i<inner.length;i+=2) innerBytes.push(parseInt(inner.slice(i,i+2),16));
  return sha256(opad.concat(innerBytes));
}

// Web Crypto wrapper for SHA-384, SHA-512
async function webCryptoHash(algorithm, message) {
  const encoder=new TextEncoder();
  const data=encoder.encode(message);
  const hashBuffer=await crypto.subtle.digest(algorithm,data);
  return Array.from(new Uint8Array(hashBuffer)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

// �"����� TOOL REGISTRY �����������������������������������������������������������������������������������������������������������������������"�
const TOOLS = [
  {id:"hash-all",        cat:"hash",     name:"Hash Generator (All)",     desc:"Generate MD5, SHA-1, SHA-256, SHA-512 hashes at once",   icon:"#️⃣",  free:true},
  {id:"md5-hash",        cat:"hash",     name:"MD5 Hash Generator",       desc:"Generate MD5 checksums for text strings",                icon:"#️⃣",  free:true},
  {id:"sha1-hash",       cat:"hash",     name:"SHA-1 Hash Generator",     desc:"Generate SHA-1 hash digests from any text input",       icon:"🟢",  free:true},
  {id:"sha256-hash",     cat:"hash",     name:"SHA-256 Hash Generator",   desc:"Generate secure SHA-256 hash digests from text",        icon:"🟡",  free:true},
  {id:"sha512-hash",     cat:"hash",     name:"SHA-512 Hash Generator",   desc:"Generate SHA-512 cryptographic hash digests",           icon:"🟠",  free:true},
  {id:"sha384-hash",     cat:"hash",     name:"SHA-384 Hash Generator",   desc:"Generate SHA-384 hash digests from any text",           icon:"#️⃣",  free:true},
  {id:"hmac-generator",  cat:"hash",     name:"HMAC Generator",           desc:"Generate HMAC-SHA256 signatures with a secret key",     icon:"#️⃣",  free:true},
  {id:"hash-compare",    cat:"hash",     name:"Hash Comparator",          desc:"Compare two hashes to verify integrity",                icon:"#️⃣",  free:true},
  {id:"crc32",           cat:"checksum", name:"CRC32 Checksum",           desc:"Calculate CRC32 cyclic redundancy check values",        icon:"⚡",  free:true},
  {id:"adler32",         cat:"checksum", name:"Adler-32 Checksum",        desc:"Compute Adler-32 checksums for data verification",      icon:"✅",  free:true},
  {id:"fnv-hash",        cat:"checksum", name:"FNV Hash",                 desc:"Generate FNV-1a 32-bit non-cryptographic hash values",  icon:"⚡",  free:true},
  {id:"djb2-hash",       cat:"checksum", name:"DJB2 Hash",                desc:"Compute the classic DJB2 string hash algorithm",        icon:"🧮",  free:true},
  {id:"crc16",           cat:"checksum", name:"CRC-16 Checksum",          desc:"Calculate CRC-16/ARC (IBM) cyclic redundancy check values",  icon:"⚡",  free:true},
  {id:"luhn-validator",  cat:"checksum", name:"Luhn Validator & Check Digit", desc:"Validate credit card / IMEI numbers with the Luhn algorithm and compute the check digit", icon:"💳", free:true},
  {id:"isbn-validator",  cat:"checksum", name:"ISBN Validator & Check Digit", desc:"Validate ISBN-10 and ISBN-13 book numbers and compute their check digits", icon:"📚", free:true},
  {id:"password-generator", cat:"crypto", name:"Password Generator",     desc:"Generate strong random passwords with custom rules",    icon:"🔑",  free:true},
  {id:"passphrase-gen",  cat:"crypto",   name:"Passphrase Generator",     desc:"Generate memorable diceware-style passphrases",         icon:"⚡",  free:true},
  {id:"password-strength",cat:"crypto",  name:"Password Strength Tester", desc:"Analyse password strength and crack time estimate",     icon:"🔑",  free:true},
  {id:"random-string",   cat:"crypto",   name:"Random String Generator",  desc:"Generate cryptographically random strings and tokens",  icon:"🎲",  free:true},
  {id:"uuid-generator",  cat:"crypto",   name:"UUID / GUID Generator",    desc:"Generate RFC 4122 UUID v4 random identifiers",          icon:"🆔",  free:true},
  {id:"hash-file",       cat:"hash",     name:"File Hash Calculator",     desc:"Calculate MD5, SHA-1 and SHA-256 hashes for uploaded files", icon:"#️⃣", free:true},
  {id:"bcrypt-hash",     cat:"crypto",   name:"Bcrypt Hash Generator",    desc:"Generate real bcrypt password hashes with a random salt and adjustable cost factor",  icon:"🔐",  free:true},
  {id:"token-generator", cat:"crypto",   name:"API Token Generator",      desc:"Generate secure API keys and bearer tokens",            icon:"🪙",  free:true},
  {id:"otp-generator",   cat:"crypto",   name:"OTP Code Generator",       desc:"Generate real RFC 6238 TOTP codes that match Google Authenticator from a Base32 secret",    icon:"⏱️",  free:true},
  {id:"caesar-hash",     cat:"checksum", name:"Simple String Hash",       desc:"Compare multiple non-cryptographic hash algorithms",    icon:"#️⃣",  free:true},
  {id:"xor-cipher",      cat:"crypto",   name:"XOR Cipher",               desc:"Encrypt and decrypt text with XOR bitwise operation",   icon:"⊕",   free:true},
  {id:"binary-converter",cat:"checksum", name:"Number Base Converter",    desc:"Convert numbers between binary, octal, decimal, hex",   icon:"🔢",  free:true},
  {id:"color-hash",      cat:"checksum", name:"Text to Color Hash",       desc:"Visualize text as a deterministic color hash",          icon:"🎨",  free:true},
  {id:"pbkdf2-generator",cat:"crypto",   name:"PBKDF2 Key Derivation",    desc:"Derive a key from a password with PBKDF2-HMAC (SHA-256/384/512), salt and iterations", icon:"🗝️",  free:true},
  {id:"sha3-keccak",     cat:"hash",     name:"SHA-3 / Keccak Hash",      desc:"Generate SHA3-256/384/512 and Keccak-256 digests (used by Ethereum)", icon:"🎲",  free:true},
  {id:"hash-identifier", cat:"crypto",   name:"Hash Identifier",          desc:"Identify the likely hash type of a digest from its length and format", icon:"🔎",  free:true},
];

const CATEGORIES = [
  {id:"hash",     name:"Hash Generators", icon:"#️⃣", desc:"MD5, SHA-1, SHA-256, SHA-512, HMAC"},
  {id:"checksum", name:"Checksums",       icon:"✅", desc:"CRC32, Adler-32, FNV, DJB2, base conversion"},
  {id:"crypto",   name:"Crypto Utilities",icon:"⚡", desc:"Passwords, UUIDs, tokens, OTP, ciphers"},
];

const TOOL_META = {
  "hash-all":       {title:"Hash Generator — MD5 SHA1 SHA256 SHA512 Online",  desc:"Generate MD5, SHA-1, SHA-256, SHA-512 and SHA-384 hashes simultaneously from any text input.", faq:[["What is a cryptographic hash?","A one-way function that maps arbitrary data to a fixed-size digest. Changing one character produces a completely different hash."],["Which hash should I use?","SHA-256 or SHA-512 for security. MD5 and SHA-1 are broken for security use but fine for checksums."],["Are these hashes reversible?","No — hash functions are one-way. You cannot recover the input from the hash."]]},
  "md5-hash":       {title:"MD5 Hash Generator — Free Online MD5 Checksum Tool", desc:"Generate MD5 hashes from text. MD5 produces a 128-bit (32 hex char) digest. Fast for checksums, not secure for passwords.", faq:[["Is MD5 secure for passwords?","No — MD5 is cryptographically broken. Use bcrypt, Argon2, or scrypt for password hashing."],["What is MD5 used for?","File integrity checksums, database fingerprinting, non-security deduplication."],["How long is an MD5 hash?","32 hexadecimal characters (128 bits)."]]},
  "sha256-hash":    {title:"SHA-256 Hash Generator — Free Online SHA256 Tool",   desc:"Generate SHA-256 cryptographic hashes. SHA-256 is part of SHA-2 family, producing 256-bit (64 hex char) digests.", faq:[["Is SHA-256 secure?","Yes — SHA-256 is still considered secure for general cryptographic use."],["What uses SHA-256?","Bitcoin mining, TLS certificates, code signing, and Git commit hashes."],["How long is a SHA-256 hash?","64 hexadecimal characters (256 bits)."]]},
  "password-generator":{title:"Strong Password Generator — Free Online Tool",   desc:"Generate strong, random passwords with custom length and character sets. Cryptographically secure random generation.", faq:[["How long should my password be?","At least 16 characters. 20+ characters significantly increases security."],["What characters should I include?","Use uppercase, lowercase, numbers, and symbols for maximum entropy."],["Is this generator truly random?","Yes — it uses window.crypto.getRandomValues() which is cryptographically secure."]]},
  "uuid-generator": {title:"UUID / GUID Generator — Free Online UUID v4 Tool",  desc:"Generate RFC 4122 compliant UUID v4 random identifiers. Generate one or multiple UUIDs at once.", faq:[["What is a UUID?","A Universally Unique Identifier — a 128-bit label guaranteed to be unique across space and time."],["What is UUID v4?","Version 4 UUIDs are randomly generated. Version 1 uses timestamp+MAC address."],["What is the collision probability?","For v4 UUIDs, the probability of collision is astronomically low — 1 in 5.3×10³⁶."]]},
  "hmac-generator": {title:"HMAC-SHA256 Generator — Online HMAC Tool",          desc:"Generate HMAC-SHA256 message authentication codes with a secret key. Used for API authentication.", faq:[["What is HMAC?","Hash-based Message Authentication Code — combines a cryptographic hash with a secret key to authenticate messages."],["How is HMAC different from a hash?","HMAC requires a secret key. Without the key, you cannot reproduce the MAC, unlike a plain hash."],["Where is HMAC used?","API authentication (AWS Signature, Stripe webhooks), JWT signing, and cookie signing."]]},
  "crc16":          {title:"CRC-16 Checksum Calculator — CRC-16/ARC Online",     desc:"Calculate CRC-16/ARC (IBM) cyclic redundancy check values from text. Used in Modbus, USB, and legacy data-link protocols.", faq:[["Which CRC-16 variant is this?","CRC-16/ARC (also called CRC-16/IBM): polynomial 0x8005 reflected (0xA001), initial value 0x0000, no final XOR. The check value of '123456789' is 0xBB3D."],["What is a CRC used for?","Detecting accidental changes to data during storage or transmission. It is an error-detection code, not a cryptographic hash."],["Is CRC-16 secure?","No — CRCs are trivial to forge. Use them only for integrity checks against random corruption, never for security."]]},
  "luhn-validator": {title:"Luhn Algorithm Validator — Credit Card & IMEI Check", desc:"Validate credit card, IMEI, and other numbers with the Luhn (mod 10) algorithm, and compute the check digit for a partial number.", faq:[["What is the Luhn algorithm?","A simple checksum (mod 10) formula that validates identification numbers such as credit cards, IMEI numbers, and some national IDs. It catches most single-digit typos and adjacent transpositions."],["Does a valid Luhn mean a real card?","No — Luhn only verifies the check digit is consistent. It does not mean the card exists or is active. No data is sent anywhere; validation runs entirely in your browser."],["How is the check digit calculated?","Enter the number without its last digit and the tool appends the digit that makes the full number pass the Luhn check."]]},
  "isbn-validator": {title:"ISBN Validator — ISBN-10 & ISBN-13 Check Digit",     desc:"Validate ISBN-10 and ISBN-13 book identifiers and compute their check digits. Handles hyphens, spaces, and the ISBN-10 'X' digit.", faq:[["What is an ISBN check digit?","The last digit of an ISBN is a checksum. ISBN-10 uses a weighted mod-11 sum (with 'X' meaning 10); ISBN-13 uses an alternating 1/3 weighted mod-10 sum."],["Can this convert ISBN-10 to ISBN-13?","This tool validates and computes check digits. An ISBN-10 becomes ISBN-13 by prefixing '978' and recomputing the final check digit, which the ISBN-13 mode will do for you."],["Are hyphens required?","No — hyphens and spaces are ignored. Only the digits (and a trailing X for ISBN-10) are used in the calculation."]]},
  "sha1-hash":      {title:"SHA-1 Hash Generator — Free Online SHA1 Tool", desc:"Generate SHA-1 hash digests from any text. SHA-1 produces a 160-bit (40 hex character) digest, once common for Git and TLS.", keywords:"sha1 hash generator, sha-1 online, sha1 checksum", howTo:"Type or paste your text and the SHA-1 digest is calculated instantly in your browser. Click copy to grab the 40-character hex hash.", faq:[["How long is a SHA-1 hash?","40 hexadecimal characters, or 160 bits."],["Is SHA-1 still safe to use?","No — SHA-1 is broken for security because practical collisions exist. Use SHA-256 or SHA-512 instead. SHA-1 is fine for non-security checksums and Git object IDs."],["Where is SHA-1 still used?","Git uses SHA-1 to identify commits and objects, and some legacy systems still rely on it for integrity checks."]]},
  "sha512-hash":    {title:"SHA-512 Hash Generator — Free Online SHA512 Tool", desc:"Generate SHA-512 cryptographic hashes from text. SHA-512 is part of the SHA-2 family and produces a 512-bit (128 hex character) digest.", keywords:"sha512 hash generator, sha-512 online, sha512 checksum", howTo:"Enter your text and the SHA-512 digest appears immediately. Everything runs locally, so your input never leaves the browser.", faq:[["How long is a SHA-512 hash?","128 hexadecimal characters, or 512 bits."],["Is SHA-512 more secure than SHA-256?","Both are secure members of SHA-2. SHA-512 has a larger digest and is often faster on 64-bit CPUs, but SHA-256 is sufficient for most uses."],["Can I reverse a SHA-512 hash?","No — it is a one-way function. You cannot recover the original input from the digest."]]},
  "sha384-hash":    {title:"SHA-384 Hash Generator — Free Online SHA384 Tool", desc:"Generate SHA-384 hash digests from any text. SHA-384 is a truncated SHA-512 variant producing a 384-bit (96 hex character) digest.", keywords:"sha384 hash generator, sha-384 online, sha384 digest", howTo:"Paste your text to compute its SHA-384 digest instantly. Copy the 96-character hex result with one click.", faq:[["How is SHA-384 different from SHA-512?","SHA-384 uses the SHA-512 algorithm with different initial values and truncates the output to 384 bits, which resists length-extension attacks."],["How long is a SHA-384 hash?","96 hexadecimal characters, or 384 bits."],["Where is SHA-384 used?","It appears in TLS cipher suites and code-signing where a digest longer than SHA-256 but shorter than SHA-512 is desired."]]},
  "hash-compare":   {title:"Hash Comparator — Verify & Compare Two Hashes Online", desc:"Compare two hash strings to confirm they match. Ideal for verifying file downloads and checksums without case or whitespace mistakes.", keywords:"hash comparator, compare hashes, checksum verify", howTo:"Paste the expected hash in one box and the actual hash in the other. The tool normalizes case and spacing and tells you instantly whether they match.", faq:[["Why compare hashes?","To verify that a downloaded file or copied value is identical to the original — a single differing character means the data changed."],["Does case matter?","No — the comparator ignores case and surrounding whitespace so 'ABC123' and 'abc123' are treated as equal."],["Does it send my hashes anywhere?","No — the comparison happens entirely in your browser with no network requests."]]},
  "crc32":          {title:"CRC32 Checksum Calculator — Free Online CRC-32 Tool", desc:"Calculate CRC32 (IEEE 802.3) cyclic redundancy check values from text. Used in ZIP archives, PNG images and Ethernet frames.", keywords:"crc32 calculator, crc-32 checksum, crc32 online", howTo:"Type or paste your text and the 8-character CRC32 value is computed live. Copy the hex result for use in file or frame integrity checks.", faq:[["What is CRC32?","A 32-bit cyclic redundancy check that detects accidental changes to data. ZIP, gzip and PNG all use it."],["Is CRC32 a secure hash?","No — CRC32 is designed to catch random corruption, not tampering. It is trivial to forge, so never use it for security."],["What is the CRC32 of '123456789'?","The standard IEEE CRC32 of that test string is 0xCBF43926."]]},
  "adler32":        {title:"Adler-32 Checksum Calculator — Free Online Tool", desc:"Compute Adler-32 checksums from text. Adler-32 is the fast checksum used inside zlib and PNG, trading a little reliability for speed.", keywords:"adler-32 checksum, adler32 calculator, zlib checksum", howTo:"Enter your text and the Adler-32 checksum is calculated instantly as an 8-character hex value you can copy.", faq:[["What is Adler-32?","A checksum invented by Mark Adler for zlib. It sums bytes in two running totals, making it faster than CRC32 but slightly weaker."],["Where is Adler-32 used?","Inside the zlib/DEFLATE format and PNG image streams to detect data corruption."],["Is Adler-32 good for short data?","It is weak for very short messages because the sums stay small, so CRC32 is preferred when detecting tiny changes matters."]]},
  "fnv-hash":       {title:"FNV Hash Generator — FNV-1a 32-bit Online Tool", desc:"Generate FNV-1a 32-bit non-cryptographic hashes from text. FNV is fast and simple, popular for hash tables and bucketing.", keywords:"fnv hash, fnv-1a generator, fnv 32-bit", howTo:"Paste your text to see its FNV-1a 32-bit hash as a hex value. The result updates live and can be copied instantly.", faq:[["What is FNV-1a?","Fowler–Noll–Vo is a simple, fast non-cryptographic hash. The 1a variant XORs the byte before multiplying by the FNV prime."],["When should I use FNV?","For hash tables, checksums and load distribution where speed matters and cryptographic strength is not needed."],["Is FNV secure?","No — it is easy to find collisions, so never use FNV for passwords, signatures or security tokens."]]},
  "djb2-hash":      {title:"DJB2 Hash Generator — Classic String Hash Online", desc:"Compute the classic DJB2 string hash by Daniel J. Bernstein. A fast, simple non-cryptographic hash widely used in symbol tables.", keywords:"djb2 hash, bernstein hash, string hash online", howTo:"Type your text and the DJB2 hash is computed live using the hash*33 + c algorithm, shown as a number and hex value.", faq:[["What is the DJB2 algorithm?","It starts at 5381 and for each character sets hash = hash*33 + c. The magic constants give a good spread for short strings."],["Is DJB2 cryptographic?","No — it is a fast general-purpose hash for hash tables, not for security."],["Why the number 5381?","It is the empirically chosen seed by Daniel J. Bernstein that produced few collisions in his tests."]]},
  "passphrase-gen": {title:"Passphrase Generator — Memorable Diceware Passwords", desc:"Generate memorable diceware-style passphrases from random words. Long, easy to remember and far stronger than short complex passwords.", keywords:"passphrase generator, diceware passphrase, memorable password", howTo:"Choose how many words you want and click generate. Each word is picked with cryptographically secure randomness for a passphrase you can actually remember.", faq:[["Why are passphrases stronger?","A four-to-six word passphrase has enormous entropy yet is easy to memorize, unlike a short string of random symbols."],["What is diceware?","A method of building passphrases by selecting random words from a list, originally chosen with physical dice."],["Are the words truly random?","Yes — words are selected using crypto.getRandomValues(), not Math.random(), so the choice is cryptographically secure."]]},
  "password-strength":{title:"Password Strength Tester — Estimate Crack Time Online", desc:"Analyze password strength and estimate how long it would take to crack. Get entropy, character-set and length feedback instantly.", keywords:"password strength tester, crack time estimate, password entropy", howTo:"Type a password and the tester scores it live, estimating entropy and brute-force crack time without ever sending the password anywhere.", faq:[["How is strength measured?","From length, character variety and entropy in bits, then converted into an estimated brute-force cracking time."],["Is it safe to type my real password?","Yes — the analysis runs entirely in your browser and nothing is transmitted or stored."],["What makes a strong password?","Length above all — a long passphrase beats a short password with symbols. Aim for 16 or more characters."]]},
  "random-string":  {title:"Random String Generator — Secure Tokens Online", desc:"Generate cryptographically random strings and tokens with custom length and character sets. Great for salts, IDs and test data.", keywords:"random string generator, secure token, random hex generator", howTo:"Pick the length and character set, then generate. Strings are produced with crypto.getRandomValues() so they are safe for cryptographic use.", faq:[["Are the strings cryptographically secure?","Yes — they use the browser Web Crypto API rather than Math.random(), making them suitable for salts and tokens."],["Can I choose the characters?","Yes — select from letters, digits and symbols, or restrict to hex or alphanumeric only."],["What are these strings good for?","Salts, API keys, nonces, one-off passwords, unique IDs and randomized test fixtures."]]},
  "hash-file":      {title:"File Hash Calculator — MD5, SHA-1 & SHA-256 Online", desc:"Calculate MD5, SHA-1 and SHA-256 hashes for any uploaded file. Verify downloads and integrity fully in-browser with no uploads.", keywords:"file hash calculator, file checksum, sha256 file hash", howTo:"Drag a file onto the drop zone or click to browse. The tool reads it locally and shows the MD5, SHA-1 and SHA-256 digests at once.", faq:[["Is my file uploaded to a server?","No — the file is read and hashed entirely in your browser, so it never leaves your device."],["Which algorithms are computed?","MD5, SHA-1 and SHA-256 are all calculated simultaneously for the same file."],["How do I verify a download?","Compare the SHA-256 shown here with the checksum published by the software vendor; they must match exactly."]]},
  "bcrypt-hash":    {title:"Bcrypt Hash Generator — Free Online Bcrypt Tool", desc:"Generate real bcrypt password hashes with a random salt and adjustable cost factor. The industry standard for secure password storage.", keywords:"bcrypt hash generator, bcrypt online, password hashing", howTo:"Enter a password, choose a cost factor, and generate a bcrypt hash with a built-in random salt that is safe to store in your database.", faq:[["Why use bcrypt for passwords?","Bcrypt is deliberately slow and includes a salt, so it resists brute-force and rainbow-table attacks far better than MD5 or SHA."],["What is the cost factor?","The work factor (rounds) — each increment doubles the hashing time. 10 to 12 is a common, sensible range."],["Do I need to store the salt separately?","No — bcrypt embeds the salt and cost inside the hash string, so a single value is all you store."]]},
  "token-generator":{title:"API Token Generator — Secure Keys & Bearer Tokens", desc:"Generate secure API keys and bearer tokens with custom prefixes and lengths. Cryptographically random, ready for authentication.", keywords:"api token generator, bearer token, secret key generator", howTo:"Choose a length and optional prefix, then generate. Tokens use secure randomness so they are safe to use as real API keys and secrets.", faq:[["How random are the tokens?","They are generated with the Web Crypto API, giving cryptographically secure randomness suitable for production secrets."],["Should tokens have a prefix?","A short prefix like sk_ or pk_ helps identify a token's type and scope at a glance, as many API providers do."],["How long should a token be?","32 characters or more of random alphanumerics gives ample entropy for bearer tokens and API keys."]]},
  "otp-generator":  {title:"TOTP Code Generator — RFC 6238 Authenticator Codes", desc:"Generate real RFC 6238 TOTP codes from a Base32 secret that match Google Authenticator and Authy. Great for testing 2FA flows.", keywords:"totp generator, otp code, rfc 6238 authenticator", howTo:"Paste your Base32 secret and the current 6-digit code appears, refreshing every 30 seconds exactly like an authenticator app.", faq:[["What is TOTP?","Time-based One-Time Password (RFC 6238) derives a 6-digit code from a shared secret and the current time, changing every 30 seconds."],["Will these codes match my authenticator?","Yes — for the same Base32 secret the codes match Google Authenticator, Authy and similar apps."],["Is my secret sent anywhere?","No — codes are computed locally with HMAC-SHA1 and the secret never leaves your browser."]]},
  "caesar-hash":    {title:"Simple String Hash — Compare Non-Crypto Algorithms", desc:"Hash text with several simple non-cryptographic algorithms at once and compare their outputs. Handy for learning and quick bucketing.", keywords:"simple string hash, non-cryptographic hash, hash comparison", howTo:"Type your text and see it hashed by multiple lightweight algorithms side by side, so you can compare speed and distribution.", faq:[["What are non-cryptographic hashes for?","Hash tables, checksums, sharding and deduplication — anywhere you need a fast fingerprint but not security."],["Why compare several algorithms?","Different algorithms distribute values differently; seeing them together helps you pick one for hash tables or bucketing."],["Are these safe for passwords?","No — never use simple hashes for passwords. Use bcrypt, scrypt or Argon2 instead."]]},
  "xor-cipher":     {title:"XOR Cipher — Encrypt & Decrypt Text Online", desc:"Encrypt and decrypt text with the XOR bitwise cipher using a repeating key. Symmetric, reversible and fully in-browser.", keywords:"xor cipher, xor encryption, xor decrypt online", howTo:"Enter your text and a key, and the XOR result is produced instantly. Run the output back through with the same key to decrypt it.", faq:[["How does an XOR cipher work?","Each byte of the text is XORed with a byte of the repeating key. Applying the same key again reverses the operation."],["Is XOR encryption secure?","With a short reused key, no — it is easily broken. Only a truly random key as long as the message (a one-time pad) is secure."],["Why is XOR reversible?","Because a XOR b XOR b equals a, so encrypting and decrypting use the exact same step with the same key."]]},
  "binary-converter":{title:"Number Base Converter — Binary, Octal, Decimal, Hex", desc:"Convert numbers between binary, octal, decimal and hexadecimal instantly. See all four bases update together as you type.", keywords:"number base converter, binary to hex, decimal to binary", howTo:"Enter a value in any base field and the binary, octal, decimal and hex equivalents update live. Copy whichever representation you need.", faq:[["Which bases are supported?","Binary (base 2), octal (base 8), decimal (base 10) and hexadecimal (base 16), all converted at once."],["Can I convert hex back to decimal?","Yes — type into the hex field and the decimal, octal and binary values update automatically."],["Does it handle large numbers?","It converts standard integer values; very large numbers may exceed JavaScript's safe integer range and lose precision."]]},
  "color-hash":     {title:"Text to Color Hash — Deterministic Color from Text", desc:"Turn any text into a deterministic color hash. The same input always maps to the same color — perfect for avatars and tags.", keywords:"text to color, color hash, string to hex color", howTo:"Type any text and a repeatable color is derived from its hash, shown as a swatch with its HEX value to copy.", faq:[["How is the color generated?","The text is hashed and the resulting number is mapped to a HEX color, so identical text always yields the same color."],["What is a color hash used for?","Assigning consistent colors to usernames, tags, avatars and categories without storing a color for each one."],["Will the same text always give the same color?","Yes — the mapping is deterministic, so the same string produces an identical color every time."]]},
  "pbkdf2-generator":{title:"PBKDF2 Key Derivation — Derive Keys Online", desc:"Derive a key from a password using PBKDF2-HMAC with SHA-256, SHA-384 or SHA-512, a salt and configurable iterations. Runs in-browser.", keywords:"pbkdf2 generator, key derivation, pbkdf2 hmac", howTo:"Enter a password and salt, pick the hash and iteration count, and PBKDF2 derives a hex key locally using the Web Crypto API.", faq:[["What is PBKDF2?","Password-Based Key Derivation Function 2 stretches a password with many HMAC iterations and a salt to produce a strong cryptographic key."],["Why increase the iteration count?","More iterations slow down each guess, making brute-force attacks against the derived key far more expensive."],["What salt should I use?","A unique random salt per password. It prevents rainbow-table attacks and should be stored alongside the derived key."]]},
  "sha3-keccak":    {title:"SHA-3 / Keccak Hash Generator — SHA3 & Keccak-256", desc:"Generate SHA3-256, SHA3-384, SHA3-512 and Keccak-256 digests from text. Keccak-256 is the hash used across Ethereum.", keywords:"sha-3 generator, keccak-256, ethereum hash", howTo:"Paste your text and choose a variant to compute its SHA-3 or Keccak-256 digest instantly, shown as a hex string to copy.", faq:[["How is SHA-3 different from SHA-2?","SHA-3 uses the sponge-based Keccak construction rather than the Merkle–Damgård design of SHA-2, giving it a different security profile."],["What is Keccak-256 used for?","Ethereum uses Keccak-256 for addresses, function selectors and state hashing. Note it differs slightly from the final SHA3-256 standard."],["Are SHA-3 hashes reversible?","No — like all cryptographic hashes they are one-way and cannot be reversed to the original input."]]},
  "hash-identifier":{title:"Hash Identifier — Detect Hash Type Online", desc:"Identify the likely algorithm behind a hash from its length and character set. Quickly tell MD5, SHA-1, SHA-256, bcrypt and more apart.", keywords:"hash identifier, detect hash type, identify hash algorithm", howTo:"Paste a hash and the tool inspects its length and format to list the most likely algorithms that could have produced it.", faq:[["How does it identify a hash?","It examines the length, character set and any prefix (like $2b$ for bcrypt) to shortlist the algorithms that match."],["Can it be certain of the type?","Not always — many algorithms share the same length. A 32-character hex string could be MD5 or an NTLM hash, so it lists candidates."],["Does it crack the hash?","No — it only guesses the algorithm from the format; it does not attempt to reverse or crack the value."]]},
};

// �"����� WORD LIST for passphrases �����������������������������������������������������������������������������������������������"�
const WORDS = ["apple","bridge","cloud","dance","eagle","flame","grape","house","ivory","jungle","kite","lemon","magic","night","ocean","piano","queen","river","storm","tiger","umbrella","valley","water","xenon","yacht","zebra","amber","blaze","coral","drift","ember","frost","glade","haven","inkwell","jewel","knack","lunar","maple","noble","orbit","pearl","quest","ridge","solar","tower","ultra","vivid","woven","xylem","yield","azure","brick","creep","dusk","epoch","flint","gloom","hatch","index","joust","kneel","lance","mirth","notch","oxide","prism","quill","realm","shore","tryst","unveil","verse","wrath","xyster","young","zonal"];

// �"����� CRYPTO RANDOM HELPERS �������������������������������������������������������������������������������������������������������"�
function cryptoRandom() { return crypto.getRandomValues(new Uint32Array(1))[0]/0x100000000; }
function cryptoRandomInt(min,max) { return min+Math.floor(cryptoRandom()*(max-min)); }
function cryptoRandomChoice(arr) { return arr[cryptoRandomInt(0,arr.length)]; }
function cryptoRandomString(len, chars) {
  const arr=new Uint8Array(len*2);
  crypto.getRandomValues(arr);
  let result="";
  for(let i=0;result.length<len;i++) result+=chars[arr[i%arr.length]%chars.length];
  return result.slice(0,len);
}

// ─── CDN loader (cached per src) ───
const _scripts = {};
function loadScript(src) {
  if (_scripts[src]) return _scripts[src];
  _scripts[src] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { delete _scripts[src]; reject(new Error('Could not load a required library. Check your connection and retry.')); };
    document.body.appendChild(s);
  });
  return _scripts[src];
}
async function loadBcrypt() {
  await loadScript('https://cdn.jsdelivr.net/npm/bcryptjs@2.4.3/dist/bcrypt.min.js');
  return window.bcrypt || (window.dcodeIO && window.dcodeIO.bcrypt);
}

// ─── RFC 4648 Base32 decode (for TOTP secrets) ───
const B32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Decode(input) {
  const clean = input.toUpperCase().replace(/[\s=-]/g, "");
  if (!clean) throw new Error("Enter a Base32 secret.");
  let bits = 0, value = 0;
  const out = [];
  for (const ch of clean) {
    const idx = B32_ALPHABET.indexOf(ch);
    if (idx === -1) throw new Error(`"${ch}" is not a valid Base32 character (A–Z, 2–7).`);
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 0xff); bits -= 8; }
  }
  return new Uint8Array(out);
}

// ─── RFC 6238 TOTP (HMAC-SHA1 via WebCrypto) ───
async function computeTotp(secretB32, { period = 30, digits = 6, now = Date.now() } = {}) {
  const keyBytes = base32Decode(secretB32);
  const counter = Math.floor(now / 1000 / period);
  // 8-byte big-endian counter
  const msg = new Uint8Array(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) { msg[i] = c & 0xff; c = Math.floor(c / 256); }
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, msg));
  // Dynamic truncation (RFC 4226 §5.3)
  const offset = sig[sig.length - 1] & 0x0f;
  const bin = ((sig[offset] & 0x7f) << 24) | (sig[offset + 1] << 16) | (sig[offset + 2] << 8) | sig[offset + 3];
  const code = (bin % Math.pow(10, digits)).toString().padStart(digits, "0");
  const secondsLeft = period - Math.floor((now / 1000) % period);
  return { code, secondsLeft, period };
}

// �"����� TOOL COMPONENTS �����������������������������������������������������������������������������������������������������������������"�

function HashAll() {
  const [input, setInput] = useState("");
  const [sha384val, setSha384val] = useState("");
  const [sha512val, setSha512val] = useState("");
  const [upper, setUpper] = useState(false);

  useEffect(()=>{
    if(!input) { setSha384val(""); setSha512val(""); return; }
    webCryptoHash("SHA-384",input).then(h=>setSha384val(upper?h.toUpperCase():h));
    webCryptoHash("SHA-512",input).then(h=>setSha512val(upper?h.toUpperCase():h));
  },[input,upper]);

  const fmt = h => h ? (upper?h.toUpperCase():h) : "";
  const hashes = [
    {label:"MD5 (128-bit)",    value:fmt(input?md5(input):""),         bits:128, accent:"#60A5FA"},
    {label:"SHA-1 (160-bit)",  value:fmt(input?sha1(input):""),        bits:160, accent:"#34D399"},
    {label:"SHA-256 (256-bit)",value:fmt(input?sha256(input):""),      bits:256, accent:C.green},
    {label:"SHA-384 (384-bit)",value:sha384val,                        bits:384, accent:"#FCD34D"},
    {label:"SHA-512 (512-bit)",value:sha512val,                        bits:512, accent:"#FB923C"},
  ];

  return (
    <VStack>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <Label>Input Text</Label>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:12,color:C.muted}}>
            <input type="checkbox" checked={upper} onChange={e=>setUpper(e.target.checked)} /> Uppercase
          </label>
        </div>
        <Textarea value={input} onChange={setInput} placeholder="Enter text to hash…" mono={false} rows={4} />
      </div>
      <VStack gap={8}>
        {hashes.map(({label,value,bits,accent})=>(
          <HashOutput key={label} label={`${label} — ${value.length||"—"} chars`} value={value} accent={accent} />
        ))}
      </VStack>
      {input && (
        <Card>
          <Grid3>
            {[["Input Bytes",new TextEncoder().encode(input).length],["Unique Algos","5"],["Bits Output","(varies)"]].map(([l,v])=>(
              <StatBox key={l} value={v} label={l} />
            ))}
          </Grid3>
        </Card>
      )}
    </VStack>
  );
}

function SingleHash({ algo }) {
  const [input, setInput] = useState("");
  const [upper, setUpper] = useState(false);
  const [result, setResult] = useState("");

  useEffect(()=>{
    if(!input){ setResult(""); return; }
    const compute = async()=>{
      let h;
      if(algo==="md5") h=md5(input);
      else if(algo==="sha1") h=sha1(input);
      else if(algo==="sha256") h=sha256(input);
      else h=await webCryptoHash(algo==="sha384"?"SHA-384":"SHA-512",input);
      setResult(upper?h.toUpperCase():h);
    };
    compute();
  },[input,algo,upper]);

  const info = {md5:{bits:128,chars:32},sha1:{bits:160,chars:40},sha256:{bits:256,chars:64},sha384:{bits:384,chars:96},sha512:{bits:512,chars:128}}[algo];

  return (
    <VStack>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <Label>Input Text</Label>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:12,color:C.muted}}>
            <input type="checkbox" checked={upper} onChange={e=>setUpper(e.target.checked)} /> Uppercase output
          </label>
        </div>
        <Textarea value={input} onChange={setInput} placeholder="Enter any text to hash…" mono={false} rows={5} />
      </div>
      <HashOutput label={`${algo.toUpperCase()} Hash — ${info.bits} bits`} value={result} />
      {result && (
        <Grid3>
          <StatBox value={info.bits} label="Hash Bits" />
          <StatBox value={info.chars} label="Hex Chars" />
          <StatBox value={new TextEncoder().encode(input).length} label="Input Bytes" />
        </Grid3>
      )}
      <Card style={{background:"rgba(124,58,237,0.04)",border:"1px solid rgba(124,58,237,0.12)"}}>
        <div style={{fontSize:12,color:C.muted,lineHeight:1.8}}>
          {algo==="md5"&&<><strong style={{color:C.text}}>MD5</strong> — Fast 128-bit hash. <span style={{color:C.warn}}>Not secure for passwords or signatures.</span> Use for checksums only.</>}
          {algo==="sha1"&&<><strong style={{color:C.text}}>SHA-1</strong> — 160-bit hash. <span style={{color:C.warn}}>Deprecated for security use.</span> Still used in Git commits and legacy systems.</>}
          {algo==="sha256"&&<><strong style={{color:C.text}}>SHA-256</strong> — 256-bit hash from the SHA-2 family. <span style={{color:C.green}}>Recommended for most uses.</span> Used in Bitcoin, TLS, and code signing.</>}
          {algo==="sha384"&&<><strong style={{color:C.text}}>SHA-384</strong> — 384-bit truncated SHA-512. <span style={{color:C.green}}>Strong and secure.</span> Used in TLS certificates and HMAC.</>}
          {algo==="sha512"&&<><strong style={{color:C.text}}>SHA-512</strong> — 512-bit hash from SHA-2. <span style={{color:C.green}}>Maximum SHA-2 strength.</span> Faster than SHA-256 on 64-bit CPUs.</>}
        </div>
      </Card>
    </VStack>
  );
}

function HmacGenerator() {
  const [msg, setMsg] = useState("");
  const [key, setKey] = useState("");
  const [result, setResult] = useState("");
  const [upper, setUpper] = useState(false);

  useEffect(()=>{
    if(!msg||!key){ setResult(""); return; }
    const h=hmacSha256(key,msg);
    setResult(upper?h.toUpperCase():h);
  },[msg,key,upper]);

  return (
    <VStack>
      <div><Label>Secret Key</Label><Input value={key} onChange={setKey} placeholder="Enter your secret key…" mono /></div>
      <div><Label>Message</Label><Textarea value={msg} onChange={setMsg} placeholder="Enter message to authenticate…" mono={false} rows={4} /></div>
      <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:C.text}}>
        <input type="checkbox" checked={upper} onChange={e=>setUpper(e.target.checked)} /> Uppercase output
      </label>
      <HashOutput label="HMAC-SHA256 Signature" value={result} accent={C.green} />
      {result && (
        <Grid3>
          <StatBox value="256" label="Bits" />
          <StatBox value="64" label="Hex Chars" />
          <StatBox value={key.length} label="Key Length" />
        </Grid3>
      )}
      <Card style={{background:"rgba(124,58,237,0.05)"}}>
        <div style={{fontSize:12,color:C.muted,lineHeight:1.8}}>
          <strong style={{color:C.text}}>HMAC-SHA256</strong> combines your secret key with the message. Anyone without the key cannot produce a valid signature — unlike plain SHA-256 which anyone can compute.
        </div>
      </Card>
    </VStack>
  );
}

function HashCompare() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const match = a.trim() && b.trim() ? a.trim().toLowerCase()===b.trim().toLowerCase() : null;
  const charDiff = useMemo(()=>{
    if(!a||!b) return [];
    const la=a.toLowerCase(), lb=b.toLowerCase();
    return Array.from({length:Math.max(la.length,lb.length)},(_,i)=>({
      ca:la[i]||"", cb:lb[i]||"", same:la[i]===lb[i]
    }));
  },[a,b]);
  const diffCount = charDiff.filter(c=>!c.same).length;
  return (
    <VStack>
      <Grid2>
        <div><Label>Hash A</Label><Textarea value={a} onChange={setA} placeholder="Paste first hash here…" rows={4} /></div>
        <div><Label>Hash B</Label><Textarea value={b} onChange={setB} placeholder="Paste second hash here…" rows={4} /></div>
      </Grid2>
      {match!==null && (
        <div className="fade-in" style={{textAlign:"center",padding:"24px",background:match?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.06)",border:`1px solid ${match?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.2)"}`,borderRadius:12}}>
          <div style={{fontSize:40,marginBottom:8}}>{match?"✅":"❌"}</div>
          <div style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:700,color:match?C.green:C.danger}}>
            {match?"Hashes Match!":"Hashes Do Not Match"}
          </div>
          {!match && <div style={{fontSize:13,color:C.muted,marginTop:6}}>{diffCount} character difference{diffCount!==1?"s":""}</div>}
        </div>
      )}
      {a&&b&&charDiff.length>0&&(
        <div>
          <Label>Character Diff</Label>
          <div style={{display:"flex",flexWrap:"wrap",gap:0,fontFamily:"'JetBrains Mono',monospace",fontSize:12,background:"rgba(0,0,0,0.3)",borderRadius:8,padding:12,marginTop:6}}>
            {charDiff.map((c,i)=>(
              <span key={i} style={{color:c.same?C.muted:C.danger,background:c.same?"transparent":"rgba(239,68,68,0.15)",borderRadius:2,padding:"1px 0"}}>{c.ca||"_"}</span>
            ))}
          </div>
        </div>
      )}
    </VStack>
  );
}

function Crc32Tool() {
  const [input, setInput] = useState("");
  const result = input ? crc32(input) : "";
  return (
    <VStack>
      <Textarea value={input} onChange={setInput} placeholder="Enter text to compute CRC32…" mono={false} rows={5} />
      <HashOutput label="CRC32 Checksum" value={result} accent={C.teal} />
      {result && <Grid3><StatBox value="32" label="Bits" accent={C.teal}/><StatBox value="8" label="Hex Chars" accent={C.teal}/><StatBox value={`0x${result}`} label="Hex Value" accent={C.teal}/></Grid3>}
      <Card><div style={{fontSize:12,color:C.muted,lineHeight:1.8}}><strong style={{color:C.text}}>CRC32</strong> (Cyclic Redundancy Check) detects accidental data corruption. Used in ZIP, PNG, Ethernet frames, and data transmission verification. Not suitable for cryptographic security.</div></Card>
    </VStack>
  );
}

function Adler32Tool() {
  const [input, setInput] = useState("");
  const result = input ? adler32(input) : "";
  return (
    <VStack>
      <Textarea value={input} onChange={setInput} placeholder="Enter text to compute Adler-32…" mono={false} rows={5} />
      <HashOutput label="Adler-32 Checksum" value={result} accent={C.blue} />
      {result && <Grid3><StatBox value="32" label="Bits" accent={C.blue}/><StatBox value="8" label="Hex Chars" accent={C.blue}/><StatBox value={`0x${result}`} label="Hex Value" accent={C.blue}/></Grid3>}
      <Card><div style={{fontSize:12,color:C.muted,lineHeight:1.8}}><strong style={{color:C.text}}>Adler-32</strong> is faster than CRC32 with slightly lower reliability. Used in zlib compression (RFC 1950) and the PNG image format. Not suitable for security.</div></Card>
    </VStack>
  );
}

function FnvHash() {
  const [input, setInput] = useState("");
  const fnv = input ? fnv1a32(input) : "";
  const djb = input ? djb2(input) : "";
  return (
    <VStack>
      <Textarea value={input} onChange={setInput} placeholder="Enter text to hash…" mono={false} rows={4} />
      <HashOutput label="FNV-1a 32-bit" value={fnv} accent={C.purple} />
      <HashOutput label="DJB2" value={djb} accent="#FB923C" />
      <Card><div style={{fontSize:12,color:C.muted,lineHeight:1.8}}><strong style={{color:C.text}}>FNV (Fowler-Noll-Vo)</strong> and <strong style={{color:C.text}}>DJB2</strong> are fast non-cryptographic hashes used in hash tables, caches, and distributed systems. They offer speed but no security guarantees.</div></Card>
    </VStack>
  );
}

function Djb2Hash() {
  const [input, setInput] = useState("");
  const result = input ? djb2(input) : "";
  return (
    <VStack>
      <Textarea value={input} onChange={setInput} placeholder="Enter text…" mono={false} rows={5} />
      <HashOutput label="DJB2 Hash" value={result} accent="#FB923C" />
    </VStack>
  );
}

// CRC-16/ARC (IBM): reflected poly 0xA001, init 0x0000, no final XOR
function crc16arc(str) {
  const bytes = new TextEncoder().encode(str);
  let crc = 0x0000;
  for (const b of bytes) {
    crc ^= b;
    for (let i = 0; i < 8; i++) crc = (crc & 1) ? ((crc >>> 1) ^ 0xA001) : (crc >>> 1);
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
}
function Crc16Tool() {
  const [input, setInput] = useState("");
  const result = input ? crc16arc(input) : "";
  return (
    <VStack>
      <Textarea value={input} onChange={setInput} placeholder="Enter text to compute CRC-16…" mono={false} rows={5} />
      <HashOutput label="CRC-16/ARC Checksum" value={result} accent={C.teal} />
      {result && <Grid3><StatBox value="16" label="Bits" accent={C.teal}/><StatBox value="4" label="Hex Chars" accent={C.teal}/><StatBox value={`0x${result}`} label="Hex Value" accent={C.teal}/></Grid3>}
      <Card><div style={{fontSize:12,color:C.muted,lineHeight:1.8}}><strong style={{color:C.text}}>CRC-16/ARC</strong> (poly 0x8005, init 0x0000) is a 16-bit cyclic redundancy check used in Modbus, USB, and many legacy protocols. The standard check value of "123456789" is <strong style={{color:C.text}}>0xBB3D</strong>. Not for cryptographic use.</div></Card>
    </VStack>
  );
}

// Luhn (mod 10)
function luhnIsValid(num) {
  const d = num.replace(/\D/g, "");
  if (d.length < 2) return false;
  let sum = 0, alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = +d[i];
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n; alt = !alt;
  }
  return sum % 10 === 0;
}
function luhnCheckDigit(partial) {
  const d = partial.replace(/\D/g, "");
  let sum = 0, alt = true;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = +d[i];
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n; alt = !alt;
  }
  return (10 - (sum % 10)) % 10;
}
function LuhnValidator() {
  const [input, setInput] = useState("");
  const digits = input.replace(/\D/g, "");
  const has = digits.length >= 2;
  const valid = has && luhnIsValid(digits);
  const checkDigit = digits.length >= 1 ? luhnCheckDigit(digits) : null;
  return (
    <VStack>
      <div><Label>Number (spaces / dashes ignored)</Label><Input value={input} onChange={setInput} placeholder="4532 0151 1283 0366" mono /></div>
      {has && (
        <div className="fade-in" style={{textAlign:"center",padding:"22px",background:valid?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.06)",border:`1px solid ${valid?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.2)"}`,borderRadius:12}}>
          <div style={{fontSize:38,marginBottom:6}}>{valid?"✅":"❌"}</div>
          <div style={{fontFamily:"'Sora',sans-serif",fontSize:19,fontWeight:700,color:valid?C.green:C.danger}}>{valid?"Passes the Luhn check":"Fails the Luhn check"}</div>
          <div style={{fontSize:12,color:C.muted,marginTop:6}}>{digits.length} digits</div>
        </div>
      )}
      {checkDigit !== null && (
        <Card>
          <div style={{fontSize:12,color:C.muted,lineHeight:1.8}}>
            <strong style={{color:C.text}}>Treating your input as a body without a check digit</strong>, the digit that would make it valid is:
            <span style={{display:"inline-block",marginLeft:8,padding:"2px 12px",borderRadius:6,background:"rgba(20,184,166,0.15)",color:C.teal,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:15}}>{checkDigit}</span>
            <span style={{marginLeft:8}}>→ full number <strong style={{color:C.text,fontFamily:"'JetBrains Mono',monospace"}}>{digits}{checkDigit}</strong></span>
          </div>
        </Card>
      )}
      <Card><div style={{fontSize:12,color:C.muted,lineHeight:1.8}}>The <strong style={{color:C.text}}>Luhn algorithm</strong> validates credit cards, IMEI numbers and more. It only checks the checksum digit — it does not confirm a number is real or active. Everything runs locally in your browser.</div></Card>
    </VStack>
  );
}

// ISBN
function isbn10Valid(s) {
  const d = s.replace(/[^0-9Xx]/g, "").toUpperCase();
  if (d.length !== 10) return false;
  let sum = 0;
  for (let i = 0; i < 10; i++) { const c = d[i]; const v = c === "X" ? 10 : +c; if (c !== "X" && isNaN(v)) return false; if (c === "X" && i !== 9) return false; sum += (10 - i) * v; }
  return sum % 11 === 0;
}
function isbn13Valid(s) {
  const d = s.replace(/\D/g, "");
  if (d.length !== 13) return false;
  let sum = 0;
  for (let i = 0; i < 13; i++) sum += (+d[i]) * (i % 2 === 0 ? 1 : 3);
  return sum % 10 === 0;
}
function isbn10CheckDigit(first9) {
  const d = first9.replace(/[^0-9]/g, "").slice(0, 9);
  let sum = 0; for (let i = 0; i < d.length; i++) sum += (10 - i) * (+d[i]);
  const r = (11 - (sum % 11)) % 11; return r === 10 ? "X" : String(r);
}
function isbn13CheckDigit(first12) {
  const d = first12.replace(/\D/g, "").slice(0, 12);
  let sum = 0; for (let i = 0; i < d.length; i++) sum += (+d[i]) * (i % 2 === 0 ? 1 : 3);
  return String((10 - (sum % 10)) % 10);
}
function IsbnValidator() {
  const [input, setInput] = useState("");
  const clean = input.replace(/[^0-9Xx]/g, "").toUpperCase();
  const kind = clean.length === 13 ? 13 : clean.length === 10 ? 10 : 0;
  const valid = kind === 13 ? isbn13Valid(clean) : kind === 10 ? isbn10Valid(clean) : false;
  const bodyLen = clean.replace(/[^0-9]/g, "").length;
  let computed = null;
  if (bodyLen === 12) computed = { type: "ISBN-13", digit: isbn13CheckDigit(clean) };
  else if (bodyLen === 9) computed = { type: "ISBN-10", digit: isbn10CheckDigit(clean) };
  return (
    <VStack>
      <div><Label>ISBN (hyphens / spaces ignored)</Label><Input value={input} onChange={setInput} placeholder="978-0-306-40615-7" mono /></div>
      {kind > 0 && (
        <div className="fade-in" style={{textAlign:"center",padding:"22px",background:valid?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.06)",border:`1px solid ${valid?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.2)"}`,borderRadius:12}}>
          <div style={{fontSize:38,marginBottom:6}}>{valid?"✅":"❌"}</div>
          <div style={{fontFamily:"'Sora',sans-serif",fontSize:19,fontWeight:700,color:valid?C.green:C.danger}}>{valid?`Valid ISBN-${kind}`:`Invalid ISBN-${kind} check digit`}</div>
        </div>
      )}
      {kind === 0 && clean.length > 0 && <div style={{fontSize:12,color:C.warn}}>An ISBN must have 10 or 13 digits — you entered {clean.length}.</div>}
      {computed && (
        <Card>
          <div style={{fontSize:12,color:C.muted,lineHeight:1.8}}>
            <strong style={{color:C.text}}>As an {computed.type} body</strong>, the correct check digit is:
            <span style={{display:"inline-block",marginLeft:8,padding:"2px 12px",borderRadius:6,background:"rgba(20,184,166,0.15)",color:C.teal,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:15}}>{computed.digit}</span>
          </div>
        </Card>
      )}
      <Card><div style={{fontSize:12,color:C.muted,lineHeight:1.8}}><strong style={{color:C.text}}>ISBN-10</strong> uses a weighted mod-11 checksum (with X = 10); <strong style={{color:C.text}}>ISBN-13</strong> uses an alternating 1/3 weighted mod-10 checksum shared with EAN-13 barcodes.</div></Card>
    </VStack>
  );
}

function PasswordGenerator() {
  const CHARS = {upper:"ABCDEFGHIJKLMNOPQRSTUVWXYZ",lower:"abcdefghijklmnopqrstuvwxyz",numbers:"0123456789",symbols:"!@#$%^&*()-_=+[]{}|;:,.<>?"};
  const [len, setLen] = useState(16);
  const [opts, setOpts] = useState({upper:true,lower:true,numbers:true,symbols:true});
  const [exclude, setExclude] = useState("");
  const [count, setCount] = useState(1);
  const [passwords, setPasswords] = useState([]);

  const generate = useCallback(()=>{
    let pool=Object.entries(opts).filter(([,v])=>v).map(([k])=>CHARS[k]).join("");
    if(exclude) pool=pool.split("").filter(c=>!exclude.includes(c)).join("");
    if(!pool) return;
    setPasswords(Array.from({length:count},()=>{
      // Ensure at least one char from each selected set
      const required=Object.entries(opts).filter(([,v])=>v).map(([k])=>cryptoRandomChoice(CHARS[k].split("").filter(c=>!exclude.includes(c))));
      const rest=Array.from({length:Math.max(0,len-required.length)},()=>cryptoRandomChoice(pool.split("")));
      return [...required,...rest].sort(()=>cryptoRandom()-0.5).join("");
    }));
  },[len,opts,exclude,count]);

  useEffect(()=>generate(),[]);

  const entropy = useMemo(()=>{
    const pool=Object.entries(opts).filter(([,v])=>v).map(([k])=>CHARS[k]).join("");
    const size=pool.length;
    return (len*Math.log2(Math.max(size,1))).toFixed(1);
  },[len,opts]);

  return (
    <VStack>
      <Grid2>
        <div>
          <Label>Length: {len}</Label>
          <input type="range" min={8} max={64} value={len} onChange={e=>setLen(Number(e.target.value))} style={{width:"100%",marginTop:8}} />
        </div>
        <div>
          <Label>How Many</Label>
          <SelectInput value={count} onChange={v=>setCount(Number(v))} options={[1,5,10,20].map(n=>({value:n,label:`${n} password${n>1?"s":""}`}))} />
        </div>
      </Grid2>
      <div>
        <Label>Character Sets</Label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:6}}>
          {[["upper","A—Z"],["lower","a'z"],["numbers","0–9"],["symbols","!@#$…"]].map(([k,l])=>(
            <button key={k} onClick={()=>setOpts(o=>({...o,[k]:!o[k]}))}
              style={{padding:"6px 14px",borderRadius:6,border:`1px solid ${opts[k]?"rgba(124,58,237,0.5)":C.border}`,background:opts[k]?"rgba(124,58,237,0.1)":"transparent",color:opts[k]?C.green:C.muted,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div><Label>Exclude Characters</Label><Input value={exclude} onChange={setExclude} placeholder="e.g. 0Ol1I (ambiguous chars)" /></div>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <Btn onClick={generate}>↻ Generate</Btn>
        <Badge color="green">~{entropy} bits entropy</Badge>
        {parseFloat(entropy)>=80&&<Badge color="teal">Strong</Badge>}
        {parseFloat(entropy)>=60&&parseFloat(entropy)<80&&<Badge color="amber">Good</Badge>}
      </div>
      <VStack gap={6}>
        {passwords.map((p,i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 14px",background:"rgba(0,0,0,0.3)",border:`1px solid ${C.border}`,borderRadius:8}}>
            <span style={{flex:1,fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:C.green,wordBreak:"break-all"}}>{p}</span>
            <CopyBtn text={p} />
          </div>
        ))}
      </VStack>
    </VStack>
  );
}

function PassphraseGen() {
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState("-");
  const [capitalize, setCapitalize] = useState(false);
  const [addNumber, setAddNumber] = useState(true);
  const [phrases, setPhrases] = useState([]);

  const generate = useCallback(()=>{
    setPhrases(Array.from({length:5},()=>{
      const words=Array.from({length:wordCount},()=>cryptoRandomChoice(WORDS));
      const formatted=capitalize?words.map(w=>w[0].toUpperCase()+w.slice(1)):words;
      let phrase=formatted.join(separator);
      if(addNumber) phrase+=separator+cryptoRandomInt(0,100);
      return phrase;
    }));
  },[wordCount,separator,capitalize,addNumber]);

  useEffect(()=>generate(),[]);

  const entropy = (wordCount*Math.log2(WORDS.length)+(addNumber?Math.log2(100):0)).toFixed(1);

  return (
    <VStack>
      <Grid2>
        <div><Label>Word Count: {wordCount}</Label><input type="range" min={3} max={8} value={wordCount} onChange={e=>setWordCount(Number(e.target.value))} style={{width:"100%",marginTop:8}} /></div>
        <div><Label>Separator</Label><SelectInput value={separator} onChange={setSeparator} options={[{value:"-",label:"Hyphen (-)"},  {value:".",label:"Dot (.)"},  {value:"_",label:"Underscore (_)"},  {value:" ",label:"Space"},  {value:"",label:"None"}]} /></div>
      </Grid2>
      <div style={{display:"flex",gap:16}}>
        {[[capitalize,setCapitalize,"Capitalize Words"],[addNumber,setAddNumber,"Add Random Number"]].map(([v,set,l])=>(
          <label key={l} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:C.text}}>
            <input type="checkbox" checked={v} onChange={e=>set(e.target.checked)} /> {l}
          </label>
        ))}
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <Btn onClick={generate}>↻ Generate</Btn>
        <Badge color="green">~{entropy} bits entropy</Badge>
      </div>
      <VStack gap={6}>
        {phrases.map((p,i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 14px",background:"rgba(0,0,0,0.3)",border:`1px solid ${C.border}`,borderRadius:8}}>
            <span style={{flex:1,fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:C.green}}>{p}</span>
            <CopyBtn text={p} />
          </div>
        ))}
      </VStack>
    </VStack>
  );
}

function PasswordStrength() {
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);

  const analysis = useMemo(()=>{
    if(!pwd) return null;
    const len=pwd.length;
    const hasUpper=/[A-Z]/.test(pwd);
    const hasLower=/[a-z]/.test(pwd);
    const hasNum=/[0-9]/.test(pwd);
    const hasSym=/[^A-Za-z0-9]/.test(pwd);
    const uniqueChars=new Set(pwd).size;
    const charsetSize=(hasUpper?26:0)+(hasLower?26:0)+(hasNum?10:0)+(hasSym?32:0);
    const entropy=(len*Math.log2(Math.max(charsetSize,1))).toFixed(1);
    const score=[len>=8,len>=12,len>=16,hasUpper,hasLower,hasNum,hasSym,uniqueChars>=8].filter(Boolean).length;
    const strength=score<=2?"Very Weak":score<=4?"Weak":score<=5?"Fair":score<=6?"Strong":"Very Strong";
    const color=score<=2?C.danger:score<=4?"#FB923C":score<=5?C.warn:score<=6?C.teal:C.green;
    const crackSeconds=Math.pow(charsetSize||1,len)/1e9;
    const crackTime=crackSeconds<60?"< 1 minute":crackSeconds<3600?`${Math.round(crackSeconds/60)} minutes`:crackSeconds<86400?`${Math.round(crackSeconds/3600)} hours`:crackSeconds<31536000?`${Math.round(crackSeconds/86400)} days`:crackSeconds<3.15e9?`${Math.round(crackSeconds/31536000)} years`:"Centuries+";
    const checks=[
      {label:"Length ≥ 8 chars",ok:len>=8},
      {label:"Length ≥ 12 chars",ok:len>=12},
      {label:"Length ≥ 16 chars",ok:len>=16},
      {label:"Uppercase letters (A—Z)",ok:hasUpper},
      {label:"Lowercase letters (a'z)",ok:hasLower},
      {label:"Numbers (0–9)",ok:hasNum},
      {label:"Special symbols (!@#…)",ok:hasSym},
      {label:"8+ unique characters",ok:uniqueChars>=8},
    ];
    return {len,entropy,score,strength,color,crackTime,checks,charsetSize,uniqueChars};
  },[pwd]);

  return (
    <VStack>
      <div style={{position:"relative"}}>
        <Label>Enter Password to Test</Label>
        <Input value={pwd} onChange={setPwd} placeholder="Type your password…" type={show?"text":"password"} />
        <button onClick={()=>setShow(s=>!s)} style={{position:"absolute",right:12,top:32,background:"transparent",border:"none",cursor:"pointer",color:C.muted,fontSize:14}}>{show?"🙈":"👁️"}</button>
      </div>
      {analysis && (
        <>
          <div style={{padding:"16px 20px",background:analysis.color+"15",border:`1px solid ${analysis.color}40`,borderRadius:12,textAlign:"center"}} className="fade-in">
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:28,fontWeight:700,color:analysis.color}}>{analysis.strength}</div>
            <div style={{marginTop:6,display:"flex",justifyContent:"center",gap:4}}>
              {Array.from({length:8},(_,i)=>(
                <div key={i} style={{width:24,height:6,borderRadius:3,background:i<analysis.score?analysis.color:"rgba(255,255,255,0.1)",transition:"background .2s"}} />
              ))}
            </div>
          </div>
          <Grid3>
            <StatBox value={`${analysis.entropy} bits`} label="Entropy" accent={analysis.color} />
            <StatBox value={analysis.crackTime} label="Crack Time (brute)" accent={analysis.color} />
            <StatBox value={analysis.len} label="Length" accent={analysis.color} />
          </Grid3>
          <Card>
            <Label>Strength Checks</Label>
            <VStack gap={6} style={{marginTop:8}}>
              {analysis.checks.map(({label,ok})=>(
                <div key={label} style={{display:"flex",alignItems:"center",gap:10,fontSize:13}}>
                  <span style={{color:ok?C.green:C.danger,fontSize:14,minWidth:16}}>{ok?"✓":"✗"}</span>
                  <span style={{color:ok?C.text:C.muted}}>{label}</span>
                </div>
              ))}
            </VStack>
          </Card>
        </>
      )}
    </VStack>
  );
}

function RandomString() {
  const PRESETS = {
    hex:"0123456789abcdef",
    alphanumeric:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    alpha:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    numeric:"0123456789",
    base64:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    urlsafe:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
    custom:"",
  };
  const [preset, setPreset] = useState("hex");
  const [customChars, setCustomChars] = useState("");
  const [len, setLen] = useState(32);
  const [count, setCount] = useState(5);
  const [strings, setStrings] = useState([]);
  const chars = preset==="custom"?customChars:PRESETS[preset];
  const generate = useCallback(()=>{
    if(!chars) return;
    setStrings(Array.from({length:count},()=>cryptoRandomString(len,chars)));
  },[chars,len,count]);
  useEffect(()=>generate(),[]);
  return (
    <VStack>
      <div>
        <Label>Character Set</Label>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
          {Object.keys(PRESETS).map(p=>(
            <Btn key={p} variant={preset===p?"primary":"secondary"} size="sm" onClick={()=>setPreset(p)}>{p}</Btn>
          ))}
        </div>
        {preset==="custom"&&<div style={{marginTop:8}}><Input value={customChars} onChange={setCustomChars} placeholder="Enter custom character set…" mono /></div>}
      </div>
      <Grid2>
        <div><Label>Length: {len}</Label><input type="range" min={4} max={256} value={len} onChange={e=>setLen(Number(e.target.value))} style={{width:"100%",marginTop:8}} /></div>
        <div><Label>Count</Label><SelectInput value={count} onChange={v=>setCount(Number(v))} options={[1,5,10,20].map(n=>({value:n,label:`${n}`}))} /></div>
      </Grid2>
      <div style={{display:"flex",gap:10}}>
        <Btn onClick={generate}>↻ Generate</Btn>
        <CopyBtn text={strings.join("\n")} style={{}} />
      </div>
      <VStack gap={4}>
        {strings.map((s,i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 12px",background:"rgba(0,0,0,0.3)",border:`1px solid ${C.border}`,borderRadius:7}}>
            <span style={{flex:1,fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:C.green,wordBreak:"break-all"}}>{s}</span>
            <CopyBtn text={s} />
          </div>
        ))}
      </VStack>
    </VStack>
  );
}

function UuidGenerator() {
  function uuidv4() {
    const b=new Uint8Array(16);
    crypto.getRandomValues(b);
    b[6]=(b[6]&0x0f)|0x40;
    b[8]=(b[8]&0x3f)|0x80;
    const h=Array.from(b).map(x=>x.toString(16).padStart(2,"0")).join("");
    return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
  }
  const [upper, setUpper] = useState(false);
  const [braces, setBraces] = useState(false);
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState([]);
  const generate = useCallback(()=>{
    setUuids(Array.from({length:count},()=>{
      let u=uuidv4();
      if(upper) u=u.toUpperCase();
      if(braces) u=`{${u}}`;
      return u;
    }));
  },[count,upper,braces]);
  useEffect(()=>generate(),[]);
  return (
    <VStack>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
        <SelectInput value={count} onChange={v=>setCount(Number(v))} options={[1,5,10,25,50].map(n=>({value:n,label:`${n} UUID${n>1?"s":""}`}))} />
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:C.text}}><input type="checkbox" checked={upper} onChange={e=>setUpper(e.target.checked)} /> Uppercase</label>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:C.text}}><input type="checkbox" checked={braces} onChange={e=>setBraces(e.target.checked)} /> Braces</label>
        <Btn onClick={generate}>↻ Generate</Btn>
        <CopyBtn text={uuids.join("\n")} />
      </div>
      <VStack gap={4}>
        {uuids.map((u,i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 14px",background:"rgba(0,0,0,0.3)",border:`1px solid ${C.border}`,borderRadius:7}}>
            <span style={{flex:1,fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:C.green}}>{u}</span>
            <CopyBtn text={u} />
          </div>
        ))}
      </VStack>
      <Card>
        <Label>UUID v4 Structure</Label>
        <div style={{marginTop:8,fontFamily:"'JetBrains Mono',monospace",fontSize:13,lineHeight:2}}>
          <span style={{color:"#60A5FA"}}>xxxxxxxx</span>-
          <span style={{color:"#34D399"}}>xxxx</span>-
          <span style={{color:C.green}}>4xxx</span>-
          <span style={{color:C.warn}}>yxxx</span>-
          <span style={{color:"#A78BFA"}}>xxxxxxxxxxxx</span>
          <div style={{marginTop:6,fontSize:11,color:C.muted}}>Where 4 = version and y = variant (8, 9, a, or b)</div>
        </div>
      </Card>
    </VStack>
  );
}

function FileHash() {
  const [hashes, setHashes] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const processFile = async file => {
    if(!file) return;
    setFileName(file.name); setFileSize(file.size); setLoading(true); setHashes(null); setProgress(10);
    const buffer = await file.arrayBuffer();
    const byteArr = Array.from(new Uint8Array(buffer));
    setProgress(40);
    const [md5v, sha1v, sha256v, sha512v] = await Promise.all([
      Promise.resolve(md5(byteArr)),
      Promise.resolve(sha1(byteArr)),
      crypto.subtle.digest("SHA-256",buffer).then(b=>Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("")),
      crypto.subtle.digest("SHA-512",buffer).then(b=>Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("")),
    ]);
    setProgress(100);
    setHashes({md5:md5v,sha1:sha1v,sha256:sha256v,sha512:sha512v});
    setLoading(false);
  };

  const formatSize = n => n<1024?`${n} B`:n<1048576?`${(n/1024).toFixed(1)} KB`:`${(n/1048576).toFixed(2)} MB`;

  return (
    <VStack>
      <div style={{border:`2px dashed ${C.border}`,borderRadius:12,padding:28,textAlign:"center",cursor:"pointer",background:"rgba(255,255,255,0.01)"}}
        onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();processFile(e.dataTransfer.files[0]);}}
        onClick={()=>document.getElementById("filehash-input").click()}>
        <div style={{fontSize:36,marginBottom:8}}>📁</div>
        <div style={{fontSize:13,color:C.text,marginBottom:4}}>Drop any file here or click to browse</div>
        <div style={{fontSize:12,color:C.muted}}>All processing happens in your browser — no uploads</div>
        <input id="filehash-input" type="file" style={{display:"none"}} onChange={e=>processFile(e.target.files[0])} />
      </div>
      {loading && (
        <div style={{textAlign:"center",padding:16}}>
          <div style={{fontSize:24,marginBottom:8}} className="spin">⚙</div>
          <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${progress}%`,background:`linear-gradient(90deg,${C.green},${C.teal})`,borderRadius:3,transition:"width .3s"}} />
          </div>
          <div style={{fontSize:12,color:C.muted,marginTop:6}}>Computing hashes…</div>
        </div>
      )}
      {hashes && (
        <>
          <Card>
            <Grid2>
              <StatRow label="File Name" value={fileName} />
              <StatRow label="File Size" value={formatSize(fileSize)} />
            </Grid2>
          </Card>
          {[["MD5",hashes.md5,"#60A5FA"],["SHA-1",hashes.sha1,"#34D399"],["SHA-256",hashes.sha256,C.green],["SHA-512",hashes.sha512,"#FB923C"]].map(([l,v,a])=>(
            <HashOutput key={l} label={l} value={v} accent={a} />
          ))}
        </>
      )}
    </VStack>
  );
}

function BcryptHash() {
  const [pwd, setPwd] = useState("");
  const [cost, setCost] = useState(10);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const generate = async()=>{
    if(!pwd) return;
    setLoading(true); setResult(""); setErr("");
    try {
      const bcrypt = await loadBcrypt();
      if (!bcrypt) throw new Error("bcrypt library failed to load.");
      // Real bcrypt: genSalt(cost) embeds a crypto-random salt into the hash.
      const salt = bcrypt.genSaltSync(cost);
      setResult(bcrypt.hashSync(pwd, salt));
    } catch (e) {
      setErr(e.message);
    }
    setLoading(false);
  };
  return (
    <VStack>
      <div><Label>Password</Label><Input value={pwd} onChange={setPwd} placeholder="Enter password to hash…" type="password" /></div>
      <div>
        <Label>Cost Factor (rounds): {cost} → 2^{cost} = {Math.pow(2,cost).toLocaleString()} iterations</Label>
        <input type="range" min={4} max={14} value={cost} onChange={e=>setCost(Number(e.target.value))} style={{width:"100%",marginTop:8}} />
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginTop:4}}>
          <span>4 (fast/insecure)</span><span style={{color:cost>=10?C.green:C.warn}}>10 (recommended)</span><span>14 (very slow)</span>
        </div>
      </div>
      <Btn onClick={generate} disabled={!pwd||loading}>{loading?"⚙ Hashing…":"Generate Bcrypt Hash"}</Btn>
      {err && <div style={{padding:12,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,fontSize:13,color:C.text}}>{err}</div>}
      {result && (
        <HashOutput label={`Bcrypt Hash (cost=${cost})`} value={result} accent={C.green} />
      )}
      <Card style={{background:"rgba(124,58,237,0.04)"}}>
        <div style={{fontSize:12,color:C.muted,lineHeight:1.8}}>
          <strong style={{color:C.text}}>Bcrypt</strong> is the industry standard for password hashing — intentionally slow, with a crypto-random salt built into every hash. Use cost 10–12 for production. This generates real <code style={{fontFamily:"'JetBrains Mono',monospace"}}>$2a$</code> bcrypt hashes locally that verify with any bcrypt library; higher cost factors take noticeably longer.
        </div>
      </Card>
    </VStack>
  );
}

function TokenGenerator() {
  const FORMATS = {
    hex32:{label:"32-byte hex (256-bit)",fn:()=>cryptoRandomString(64,"0123456789abcdef")},
    hex16:{label:"16-byte hex (128-bit)",fn:()=>cryptoRandomString(32,"0123456789abcdef")},
    base64:{label:"Base64 URL-safe (256-bit)",fn:()=>{const b=new Uint8Array(32);crypto.getRandomValues(b);return btoa(String.fromCharCode(...b)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");}},
    bearer:{label:"Bearer token (40 chars)",fn:()=>"Bearer "+cryptoRandomString(40,"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789")},
    apikey:{label:"API Key (sk-style)",fn:()=>"sk-"+cryptoRandomString(48,"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789")},
    jwt_secret:{label:"JWT Secret (HS256 ready)",fn:()=>cryptoRandomString(64,"0123456789abcdef")},
  };
  const [format, setFormat] = useState("hex32");
  const [tokens, setTokens] = useState([]);
  const generate = useCallback(()=>{
    setTokens(Array.from({length:5},()=>FORMATS[format].fn()));
  },[format]);
  useEffect(()=>generate(),[format]);
  return (
    <VStack>
      <div><Label>Token Format</Label>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:6}}>
          {Object.entries(FORMATS).map(([k,{label}])=>(
            <label key={k} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"8px 12px",background:format===k?"rgba(124,58,237,0.1)":"rgba(255,255,255,0.02)",border:`1px solid ${format===k?"rgba(124,58,237,0.4)":C.border}`,borderRadius:7}}>
              <input type="radio" checked={format===k} onChange={()=>setFormat(k)} /><span style={{fontSize:13,color:C.text}}>{label}</span>
            </label>
          ))}
        </div>
      </div>
      <Btn onClick={generate}>↻ Regenerate</Btn>
      <VStack gap={4}>
        {tokens.map((t,i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 14px",background:"rgba(0,0,0,0.35)",border:`1px solid ${C.border}`,borderRadius:7}}>
            <span style={{flex:1,fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:C.green,wordBreak:"break-all"}}>{t}</span>
            <CopyBtn text={t} />
          </div>
        ))}
      </VStack>
    </VStack>
  );
}

function OtpGenerator() {
  const [secret, setSecret] = useState("JBSWY3DPEHPK3PXP");
  const [code, setCode] = useState("------");
  const [remaining, setRemaining] = useState(30);
  const [err, setErr] = useState("");

  // Real RFC 6238 TOTP: Base32 secret → HMAC-SHA1 over the 8-byte time counter.
  const compute = useCallback(async () => {
    try {
      const { code, secondsLeft } = await computeTotp(secret, { period: 30, digits: 6 });
      setCode(code); setRemaining(secondsLeft); setErr("");
    } catch (e) {
      setErr(e.message); setCode("------");
    }
  }, [secret]);

  useEffect(() => {
    compute();
    const iv = setInterval(compute, 1000);
    return () => clearInterval(iv);
  }, [compute]);

  return (
    <VStack>
      <div><Label>TOTP Secret Key (Base32)</Label><Input value={secret} onChange={setSecret} placeholder="Base32 secret (e.g. JBSWY3DPEHPK3PXP)" mono /></div>
      {err && <div style={{padding:12,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,fontSize:13,color:C.text}}>{err}</div>}
      <div style={{textAlign:"center",padding:"32px 20px",background:"rgba(124,58,237,0.06)",border:"1px solid rgba(124,58,237,0.2)",borderRadius:12}} className="fade-in">
        <div style={{fontSize:11,color:C.muted,marginBottom:8,letterSpacing:"0.1em"}}>CURRENT OTP CODE</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:52,fontWeight:700,color:C.green,letterSpacing:"0.2em"}}>{code}</div>
        <div style={{marginTop:12,fontSize:13,color:C.muted}}>Refreshes in <strong style={{color:C.text}}>{remaining}s</strong></div>
        <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,margin:"10px auto 0",width:200,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${(remaining/30)*100}%`,background:`linear-gradient(90deg,${C.green},${C.teal})`,borderRadius:2,transition:"width 1s linear"}} />
        </div>
      </div>
      <CopyBtn text={code} style={{alignSelf:"center"}} />
      <Card style={{background:"rgba(124,58,237,0.04)"}}>
        <div style={{fontSize:12,color:C.muted,lineHeight:1.8}}>
          <strong style={{color:C.text}}>TOTP</strong> (Time-based One-Time Password — RFC 6238) generates a 6-digit code that changes every 30 seconds from the current time and a shared Base32 secret. These codes match Google Authenticator and Authy for the same secret. Computed locally with HMAC-SHA1 — the secret never leaves your browser.
        </div>
      </Card>
    </VStack>
  );
}

function SimpleStringHash() {
  const [input, setInput] = useState("");
  const hashes = useMemo(()=>{
    if(!input) return [];
    return [
      {name:"CRC32",     value:crc32(input),    bits:32,  accent:"#14B8A6"},
      {name:"Adler-32",  value:adler32(input),  bits:32,  accent:"#60A5FA"},
      {name:"FNV-1a",    value:fnv1a32(input),  bits:32,  accent:"#A78BFA"},
      {name:"DJB2",      value:djb2(input),     bits:32,  accent:"#FB923C"},
      {name:"MD5",       value:md5(input),       bits:128, accent:"#34D399"},
      {name:"SHA-1",     value:sha1(input),      bits:160, accent:C.green},
      {name:"SHA-256",   value:sha256(input),    bits:256, accent:"#FCD34D"},
    ];
  },[input]);
  return (
    <VStack>
      <Textarea value={input} onChange={setInput} placeholder="Enter text to hash with all algorithms…" mono={false} rows={4} />
      {hashes.map(({name,value,bits,accent})=>(
        <div key={name} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 14px",background:"rgba(255,255,255,0.02)",border:`1px solid ${C.border}`,borderRadius:8}}>
          <div style={{minWidth:80,fontSize:12,fontWeight:600,color:accent}}>{name}</div>
          <div style={{minWidth:40,fontSize:11,color:C.muted}}>{bits}b</div>
          <div style={{flex:1,fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:C.text,wordBreak:"break-all"}}>{value}</div>
          <CopyBtn text={value} />
        </div>
      ))}
    </VStack>
  );
}

function XorCipher() {
  const [text, setText] = useState("");
  const [key, setKey] = useState("");
  const [mode, setMode] = useState("encrypt");
  const xorBytes = (bytes, keyBytes) => {
    if(!keyBytes.length) return bytes;
    return bytes.map((b,i)=>b^keyBytes[i%keyBytes.length]);
  };
  const bytesToB64 = bytes => { let s=""; for(const b of bytes) s+=String.fromCharCode(b); return btoa(s); };
  const b64ToBytes = b64 => { const s=atob(b64); const out=[]; for(let i=0;i<s.length;i++) out.push(s.charCodeAt(i)); return out; };
  const encrypt = () => {
    const data=[...new TextEncoder().encode(text)];
    const kb=[...new TextEncoder().encode(key)];
    return bytesToB64(xorBytes(data,kb));
  };
  const decrypt = () => {
    try{
      const kb=[...new TextEncoder().encode(key)];
      const decoded=xorBytes(b64ToBytes(text),kb);
      return new TextDecoder().decode(new Uint8Array(decoded));
    } catch{ return "Invalid Base64 input for decryption"; }
  };
  const output = text&&key ? (mode==="encrypt"?encrypt():decrypt()) : "";
  return (
    <VStack>
      <ModeToggle mode={mode} setMode={setMode} options={[["encrypt","Encrypt"],["decode","Decrypt"]]} />
      <div><Label>XOR Key</Label><Input value={key} onChange={setKey} placeholder="Enter any key string…" mono /></div>
      <Grid2>
        <div><Label>{mode==="encrypt"?"Plain Text":"Base64-encoded Ciphertext"}</Label><Textarea value={text} onChange={setText} rows={6} mono={mode!=="encrypt"} /></div>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <Label>{mode==="encrypt"?"XOR Encrypted (Base64)":"Decrypted Text"}</Label>
            {output&&<CopyBtn text={output} />}
          </div>
          <Textarea value={output} onChange={()=>{}} rows={6} readOnly />
        </div>
      </Grid2>
      <Card><div style={{fontSize:12,color:C.muted,lineHeight:1.8}}><strong style={{color:C.text}}>XOR cipher</strong> is symmetric — the same key and operation encrypts and decrypts. It is NOT cryptographically secure but useful for light obfuscation. Output is Base64-encoded for safe text transport.</div></Card>
    </VStack>
  );
}

function NumberBaseConverter() {
  const [input, setInput] = useState("");
  const [fromBase, setFromBase] = useState("10");
  const [error, setError] = useState("");
  const results = useMemo(()=>{
    if(!input.trim()) return null;
    try{
      const n=parseInt(input.trim(),parseInt(fromBase));
      if(isNaN(n)) throw new Error("Invalid number for base "+fromBase);
      setError("");
      return {
        bin:n.toString(2), oct:n.toString(8), dec:n.toString(10),
        hex:n.toString(16).toUpperCase(), b32:n.toString(32).toUpperCase(),
        dec_val:n,
      };
    } catch(e){ setError(e.message); return null; }
  },[input,fromBase]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Input Number</Label><Input value={input} onChange={setInput} placeholder="Enter number…" mono /></div>
        <div><Label>From Base</Label><SelectInput value={fromBase} onChange={setFromBase} options={[{value:"2",label:"Binary (base 2)"},{value:"8",label:"Octal (base 8)"},{value:"10",label:"Decimal (base 10)"},{value:"16",label:"Hexadecimal (base 16)"},{value:"32",label:"Base 32"}]} /></div>
      </Grid2>
      {error&&<div style={{color:C.danger,fontSize:13}}>{error}</div>}
      {results&&(
        <Card className="fade-in">
          {[["Binary (2)",results.bin,"0b"],["Octal (8)",results.oct,"0o"],["Decimal (10)",results.dec,""],["Hex (16)",results.hex,"0x"],["Base 32",results.b32,""]].map(([label,val,prefix])=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{minWidth:110,fontSize:12,color:C.muted}}>{label}</span>
              <span style={{flex:1,fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:C.green}}>{prefix}{val}</span>
              <CopyBtn text={val} />
            </div>
          ))}
        </Card>
      )}
    </VStack>
  );
}

function ColorHash() {
  const [input, setInput] = useState("");
  const color = useMemo(()=>{
    if(!input) return null;
    const h=md5(input);
    const r=parseInt(h.slice(0,2),16);
    const g=parseInt(h.slice(2,4),16);
    const b=parseInt(h.slice(4,6),16);
    const hex=`#${h.slice(0,6).toUpperCase()}`;
    const hsl=rgbToHsl(r,g,b);
    return {r,g,b,hex,hsl,hash:h};
  },[input]);
  function rgbToHsl(r,g,b){
    r/=255;g/=255;b/=255;
    const max=Math.max(r,g,b),min=Math.min(r,g,b);
    let h,s,l=(max+min)/2;
    if(max===min){h=s=0;}
    else{const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;}}
    return [Math.round(h*360),Math.round(s*100),Math.round(l*100)];
  }
  return (
    <VStack>
      <Input value={input} onChange={setInput} placeholder="Type any text to generate a deterministic color…" />
      {color && (
        <div className="fade-in">
          <div style={{height:120,borderRadius:12,background:color.hex,marginBottom:16,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:700,color:"rgba(255,255,255,0.9)",textShadow:"0 1px 4px rgba(0,0,0,0.4)"}}>{color.hex}</span>
          </div>
          <Card>
            {[["HEX",color.hex],["RGB",`rgb(${color.r}, ${color.g}, ${color.b})`],["HSL",`hsl(${color.hsl[0]}, ${color.hsl[1]}%, ${color.hsl[2]}%)`],["MD5 Source",color.hash.slice(0,12)+"…"]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:12,color:C.muted}}>{l}</span>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:C.text}}>{v}</span>
                  <CopyBtn text={v} />
                </div>
              </div>
            ))}
          </Card>
          <div style={{marginTop:12}}>
            <Label>Other strings → colors</Label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
              {["hello","world","react","crypto","toolsrift","hash"].map(w=>{
                const h=md5(w);
                const col=`#${h.slice(0,6)}`;
                return <div key={w} title={col} style={{width:36,height:36,borderRadius:6,background:col,border:`1px solid ${C.border}`,cursor:"pointer"}} onClick={()=>setInput(w)} />;
              })}
            </div>
          </div>
        </div>
      )}
    </VStack>
  );
}

// ─── PBKDF2 Key Derivation (WebCrypto — spec-correct, unlike the old bcrypt demo) ───
function Pbkdf2Generator() {
  const [pwd, setPwd] = useState("");
  const [salt, setSalt] = useState("");
  const [iters, setIters] = useState(100000);
  const [hash, setHash] = useState("SHA-256");
  const [keyLen, setKeyLen] = useState(256);
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const randomSalt = () => {
    const b = new Uint8Array(16); crypto.getRandomValues(b);
    setSalt(Array.from(b).map(x => x.toString(16).padStart(2, "0")).join(""));
  };

  const derive = async () => {
    if (!pwd) { setErr("Enter a password."); return; }
    setBusy(true); setErr(""); setResult("");
    try {
      const enc = new TextEncoder();
      const saltBytes = salt ? enc.encode(salt) : (() => { const b = new Uint8Array(16); crypto.getRandomValues(b); return b; })();
      const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(pwd), "PBKDF2", false, ["deriveBits"]);
      const bits = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt: saltBytes, iterations: Math.max(1, iters | 0), hash },
        keyMaterial, keyLen
      );
      const hex = Array.from(new Uint8Array(bits)).map(x => x.toString(16).padStart(2, "0")).join("");
      setResult(hex);
    } catch (e) {
      setErr(e.message);
    }
    setBusy(false);
  };

  return (
    <VStack>
      <div><Label>Password</Label><Input value={pwd} onChange={setPwd} placeholder="Password to derive from" type="password" /></div>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <Label>Salt (UTF-8)</Label>
          <Btn size="sm" variant="secondary" onClick={randomSalt}>Random 16-byte salt</Btn>
        </div>
        <Input value={salt} onChange={setSalt} placeholder="Salt (recommended — leave blank for a random one)" mono />
      </div>
      <Grid3>
        <div><Label>Hash</Label><SelectInput value={hash} onChange={setHash} options={[{value:"SHA-256",label:"SHA-256"},{value:"SHA-384",label:"SHA-384"},{value:"SHA-512",label:"SHA-512"},{value:"SHA-1",label:"SHA-1 (legacy)"}]} /></div>
        <div><Label>Iterations</Label><Input value={iters} onChange={v=>setIters(Number(v)||0)} type="number" /></div>
        <div><Label>Key length (bits)</Label><SelectInput value={String(keyLen)} onChange={v=>setKeyLen(Number(v))} options={[{value:"128",label:"128"},{value:"256",label:"256"},{value:"512",label:"512"}]} /></div>
      </Grid3>
      <Btn onClick={derive} disabled={!pwd||busy}>{busy?"⚙ Deriving…":"Derive Key"}</Btn>
      {err && <div style={{padding:12,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,fontSize:13,color:C.text}}>{err}</div>}
      {result && <HashOutput label={`Derived key (${keyLen}-bit, hex)`} value={result} accent={C.green} />}
      <Card style={{background:"rgba(124,58,237,0.04)"}}>
        <div style={{fontSize:12,color:C.muted,lineHeight:1.8}}>
          <strong style={{color:C.text}}>PBKDF2</strong> stretches a password into a key using many HMAC iterations plus a salt, making brute force expensive. Computed locally with the browser's native WebCrypto — spec-correct and interoperable. Use ≥100,000 iterations (SHA-256) for password storage; higher is stronger but slower.
        </div>
      </Card>
    </VStack>
  );
}

// ─── SHA-3 / Keccak (js-sha3 CDN — WebCrypto has no SHA-3) ───
function Sha3Keccak() {
  const [input, setInput] = useState("");
  const [out, setOut] = useState({ "sha3-256":"", "sha3-384":"", "sha3-512":"", "keccak-256":"" });
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadScript("https://cdn.jsdelivr.net/npm/js-sha3@0.9.3/build/sha3.min.js");
        if (cancelled) return;
        const lib = window.sha3 || window;
        const s3 = lib.sha3_256 || window.sha3_256;
        const s3_384 = lib.sha3_384 || window.sha3_384;
        const s3_512 = lib.sha3_512 || window.sha3_512;
        const kec = lib.keccak256 || window.keccak256;
        setOut({
          "sha3-256": s3(input),
          "sha3-384": s3_384(input),
          "sha3-512": s3_512(input),
          "keccak-256": kec(input),
        });
        setErr("");
      } catch (e) { if (!cancelled) setErr(e.message); }
    })();
    return () => { cancelled = true; };
  }, [input]);

  return (
    <VStack>
      <div><Label>Input Text</Label><Textarea value={input} onChange={setInput} placeholder="Type or paste text to hash…" /></div>
      {err && <div style={{padding:12,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,fontSize:13,color:C.text}}>{err}</div>}
      <HashOutput label="SHA3-256" value={out["sha3-256"]} />
      <HashOutput label="SHA3-384" value={out["sha3-384"]} />
      <HashOutput label="SHA3-512" value={out["sha3-512"]} />
      <HashOutput label="Keccak-256 (Ethereum)" value={out["keccak-256"]} accent={C.teal} />
      <Card style={{background:"rgba(139,92,246,0.04)"}}>
        <div style={{fontSize:12,color:C.muted,lineHeight:1.8}}>
          <strong style={{color:C.text}}>SHA-3</strong> is the Keccak-based NIST standard (FIPS 202). <strong style={{color:C.text}}>Keccak-256</strong> is the original (pre-standard) padding used by Ethereum — its digest differs from SHA3-256 for the same input, so they are listed separately.
        </div>
      </Card>
    </VStack>
  );
}

// ─── Hash Identifier (heuristic by length + charset) ───
function HashIdentifier() {
  const [input, setInput] = useState("");
  const guesses = useMemo(() => {
    const h = input.trim();
    if (!h) return [];
    const isHex = /^[0-9a-fA-F]+$/.test(h);
    const len = h.length;
    const out = [];
    if (/^\$2[aby]\$\d\d\$[./A-Za-z0-9]{53}$/.test(h)) out.push(["bcrypt", "high"]);
    if (/^\$argon2(id|i|d)\$/.test(h)) out.push(["Argon2", "high"]);
    if (/^\$6\$/.test(h)) out.push(["sha512crypt ($6$)", "high"]);
    if (/^\$5\$/.test(h)) out.push(["sha256crypt ($5$)", "high"]);
    if (/^\$1\$/.test(h)) out.push(["md5crypt ($1$)", "high"]);
    if (/^\{SHA\}/.test(h)) out.push(["Apache SHA-1 (LDAP {SHA})", "high"]);
    if (isHex) {
      if (len === 32) out.push(["MD5", "likely"], ["MD4", "possible"], ["NTLM", "possible"]);
      else if (len === 40) out.push(["SHA-1", "likely"], ["RIPEMD-160", "possible"]);
      else if (len === 56) out.push(["SHA-224", "likely"], ["SHA3-224", "possible"]);
      else if (len === 64) out.push(["SHA-256", "likely"], ["SHA3-256 / Keccak-256", "possible"], ["BLAKE2s", "possible"]);
      else if (len === 96) out.push(["SHA-384", "likely"], ["SHA3-384", "possible"]);
      else if (len === 128) out.push(["SHA-512", "likely"], ["SHA3-512", "possible"], ["BLAKE2b", "possible"]);
      else if (len === 8) out.push(["CRC-32 / Adler-32", "possible"]);
    }
    if (!out.length) out.push(["Unrecognised — not a standard hex digest or known crypt format", "—"]);
    return out;
  }, [input]);

  return (
    <VStack>
      <div><Label>Hash / Digest</Label><Input value={input} onChange={setInput} placeholder="Paste a hash to identify…" mono /></div>
      {guesses.length > 0 && (
        <div>
          <Label>Likely types</Label>
          <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:6}}>
            {guesses.map(([name, conf], i) => (
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:8}}>
                <span style={{color:C.text,fontSize:13,fontFamily:"'JetBrains Mono',monospace"}}>{name}</span>
                <Badge color={conf==="high"?"green":conf==="likely"?"blue":conf==="possible"?"amber":"red"}>{conf}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      <Card style={{background:"rgba(124,58,237,0.04)"}}>
        <div style={{fontSize:12,color:C.muted,lineHeight:1.8}}>
          Identification is by length and format only — many algorithms share a digest length (e.g. MD5, MD4 and NTLM are all 32 hex chars), so results are ranked guesses, not certainties.
        </div>
      </Card>
    </VStack>
  );
}

// �"����� COMPONENT MAP �����������������������������������������������������������������������������������������������������������������������"�
const TOOL_COMPONENTS = {
  "hash-all":          HashAll,
  "pbkdf2-generator":  Pbkdf2Generator,
  "sha3-keccak":       Sha3Keccak,
  "hash-identifier":   HashIdentifier,
  "md5-hash":          ()=><SingleHash algo="md5" />,
  "sha1-hash":         ()=><SingleHash algo="sha1" />,
  "sha256-hash":       ()=><SingleHash algo="sha256" />,
  "sha512-hash":       ()=><SingleHash algo="sha512" />,
  "sha384-hash":       ()=><SingleHash algo="sha384" />,
  "hmac-generator":    HmacGenerator,
  "hash-compare":      HashCompare,
  "crc32":             Crc32Tool,
  "adler32":           Adler32Tool,
  "fnv-hash":          FnvHash,
  "djb2-hash":         Djb2Hash,
  "crc16":             Crc16Tool,
  "luhn-validator":    LuhnValidator,
  "isbn-validator":    IsbnValidator,
  "password-generator":PasswordGenerator,
  "passphrase-gen":    PassphraseGen,
  "password-strength": PasswordStrength,
  "random-string":     RandomString,
  "uuid-generator":    UuidGenerator,
  "hash-file":         FileHash,
  "bcrypt-hash":       BcryptHash,
  "token-generator":   TokenGenerator,
  "otp-generator":     OtpGenerator,
  "caesar-hash":       SimpleStringHash,
  "xor-cipher":        XorCipher,
  "binary-converter":  NumberBaseConverter,
  "color-hash":        ColorHash,
};

// �"����� PAGE SHELLS ���������������������������������������������������������������������������������������������������������������������������"�
function Breadcrumb({ tool }) {
  const cat=CATEGORIES.find(c=>c.id===tool.cat);
  return (
    <>
      <nav style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:C.muted,marginBottom:20}}>
        <a href="https://toolsrift.com" style={{color:C.muted,textDecoration:"none"}}>🏠 ToolsRift</a><span>›</span>
        <a href={`#/category/${tool.cat}`} style={{color:C.muted,textDecoration:"none"}}>{cat?.name}</a><span>›</span>
        <span style={{color:C.text}}>{tool.name}</span>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolsrift.com" },
          { "@type": "ListItem", "position": 2, "name": "Hash Generator Tools", "item": "https://toolsrift.com/hash" },
          { "@type": "ListItem", "position": 3, "name": tool?.name || tool?.id || "" }
        ]
      }) }} />
    </>
  );
}

function FaqSection({ faqs }) {
  if(!faqs?.length) return null;
  return (
    <section style={{marginTop:32}}>
      <h2 style={{...T.h2,marginBottom:14}}>Frequently Asked Questions</h2>
      <VStack gap={8}>
        {faqs.map(([q,a],i)=>(
          <details key={i} style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${C.border}`,borderRadius:8}}>
            <summary style={{padding:"12px 16px",cursor:"pointer",fontSize:13,fontWeight:600,color:C.text,listStyle:"none",display:"flex",justifyContent:"space-between"}}>
              <h3 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:13,fontWeight:600,margin:0}}>{q}</h3>
              <span style={{color:C.muted}}>+</span>
            </summary>
            <div style={{padding:"0 16px 14px",fontSize:13,color:C.muted,lineHeight:1.7}}>{a}</div>
          </details>
        ))}
      </VStack>
    </section>
  );
}

function RelatedTools({ currentId }) {
  const current=TOOLS.find(t=>t.id===currentId);
  const related=TOOLS.filter(t=>t.id!==currentId&&t.cat===current?.cat).slice(0,4);
  if(!related.length) return null;
  return (
    <section style={{marginTop:32}}>
      <h2 style={{...T.h2,marginBottom:14}}>Related Tools</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
        {related.map(t=>(
          <a key={t.id} href={`#/tool/${t.id}`} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(255,255,255,0.02)",border:`1px solid ${C.border}`,borderRadius:8,textDecoration:"none",transition:"border-color .15s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(124,58,237,0.4)"} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <span style={{fontSize:20}}>{t.icon}</span>
            <div><div style={{fontSize:13,fontWeight:600,color:C.text}}>{t.name}</div><div style={{fontSize:11,color:C.muted}}>{t.desc}</div></div>
          </a>
        ))}
      </div>
    </section>
  );
}

function ToolPage({ toolId }) {
  const tool=TOOLS.find(t=>t.id===toolId);
  const meta=TOOL_META[toolId];
  const ToolComp=TOOL_COMPONENTS[toolId];
  // PHASE 1: All tools free, no gating. Re-enable in Phase 2.
  useEffect(()=>{ document.title=meta?.title||`${tool?.name} — Free Hash Tool | ToolsRift`; },[toolId]);
  if(!tool||!ToolComp) return <div style={{padding:40,textAlign:"center",color:C.muted}}>Tool not found. <a href="#/" style={{color:C.green}}>← Home</a></div>;
  return (
    <div style={{maxWidth:920,margin:"0 auto",padding:"24px 20px 60px"}}>
      <Breadcrumb tool={tool} />
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24,gap:16}}>
        <div>
          <h1 style={{...T.h1,marginBottom:6,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:28}}>{tool.icon}</span> {tool.name}
          </h1>
          <p style={{fontSize:14,color:C.muted,lineHeight:1.6,maxWidth:620}}>{meta?.desc||tool.desc}</p>
        </div>
        <Badge color="green">Free</Badge>
      </div>
      <Card className="fade-in"><ToolComp /></Card>
      {meta?.howTo && (
        <div style={{ background:'rgba(124,58,237,0.05)', border:'1px solid rgba(124,58,237,0.12)', borderRadius:16, padding:'28px 32px', marginBottom:24, marginTop:24 }}>
          <h2 style={{ fontSize:17, fontWeight:700, color:'#F1F5F9', margin:'0 0 12px', fontFamily:"'Sora', sans-serif" }}>📖 How to Use This Tool</h2>
          <p style={{ fontSize:14, color:'#94A3B8', lineHeight:1.8, margin:0 }}>{meta.howTo}</p>
        </div>
      )}
      <FaqSection faqs={meta?.faq} />
      {meta?.faq && meta.faq.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": meta.faq.map(([q, a]) => ({
            "@type": "Question",
            "name": q,
            "acceptedAnswer": { "@type": "Answer", "text": a }
          }))
        })}} />
      )}
      <RelatedTools currentId={toolId} />
    </div>
  );
}

function CategoryPage({ catId }) {
  const cat=CATEGORIES.find(c=>c.id===catId);
  const tools=TOOLS.filter(t=>t.cat===catId);
  useEffect(()=>{ document.title=`${cat?.name} — Free Hash & Crypto Tools | ToolsRift`; },[catId]);
  if(!cat) return <div style={{padding:40,textAlign:"center",color:C.muted}}>Not found. <a href="#/" style={{color:C.green}}>← Home</a></div>;
  return (
    <div style={{maxWidth:920,margin:"0 auto",padding:"24px 20px 60px"}}>
      <nav style={{fontSize:12,color:C.muted,marginBottom:20}}><a href="#/" style={{color:C.muted,textDecoration:"none"}}>🏠 ToolsRift</a> › <span style={{color:C.text}}>{cat.name}</span></nav>
      <h1 style={{...T.h1,marginBottom:6}}>{cat.icon} {cat.name}</h1>
      <p style={{fontSize:14,color:C.muted,marginBottom:28}}>{cat.desc} — {tools.length} free tools</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
        {tools.map(t=>(
          <a key={t.id} href={`#/tool/${t.id}`} style={{display:"flex",gap:12,padding:"14px 16px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,textDecoration:"none",alignItems:"flex-start",transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(124,58,237,0.4)";e.currentTarget.style.transform="translateY(-1px)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="";}}>
            <span style={{fontSize:24,marginTop:2}}>{t.icon}</span>
            <div><div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:3}}>{t.name}</div><div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>{t.desc}</div></div>
          </a>
        ))}
      </div>
    </div>
  );
}


const PAGE_THEME = getCategoryById('hash');

function DevBadge() {
  return (
    <span style={{
      position:'absolute', top:8, right:8, pointerEvents:'none',
      background:'rgba(124,58,237,0.15)', color:'#7C3AED',
      fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:4,
      letterSpacing:'0.04em', fontFamily:"'Plus Jakarta Sans',sans-serif",
    }}>DEV</span>
  );
}

const HASH_SPECIAL_CSS = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  .trh-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  @media(max-width:1024px){.trh-grid{grid-template-columns:repeat(3,1fr)}}
  @media(max-width:640px){.trh-grid{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:400px){.trh-grid{grid-template-columns:1fr}}
`;

function CategoryHomePage() {
  useEffect(() => { document.title = 'Free Hash & Crypto Tools — ToolsRift'; }, []);

  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search hash & crypto tools..."
      />
    </CategoryLayout>
  );
}

function ToolDetailPage({ toolId }) {
  const tool     = TOOLS.find(t => t.id === toolId);
  const meta     = TOOL_META[toolId];
  const ToolComp = TOOL_COMPONENTS[toolId];
  const acc = PAGE_THEME.color;

  useEffect(() => {
    document.title = meta?.title || `${tool?.name} — Free Hash Tool | ToolsRift`;
  }, [toolId]);

  if (!tool || !ToolComp) return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId || 'unknown'} tools={TOOLS} subcats={CATEGORIES}>
      <div style={{ padding:40, textAlign:'center', color:'#64748B', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
        <p style={{ color:'#E2E8F0', marginBottom:8, fontSize:16 }}>Tool not found</p>
        <a href="#/" style={{ color:acc }}>← Back to Hash & Crypto</a>
      </div>
    </CategoryLayout>
  );

  const toolData = { id:tool.id, name:tool.name, description:meta?.desc||tool.desc, howTo:meta?.howTo, faq:meta?.faq };

  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId} tools={TOOLS} subcats={CATEGORIES}>
      <style>{HASH_SPECIAL_CSS}</style>
      <a href="#/" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#64748B', fontSize:13, textDecoration:'none', marginTop:20, fontFamily:"'Plus Jakarta Sans',sans-serif" }}
        onMouseEnter={e => e.currentTarget.style.color='#E2E8F0'}
        onMouseLeave={e => e.currentTarget.style.color='#64748B'}
      >← Back to Hash &amp; Crypto</a>
      <ToolPageLayout
        theme={PAGE_THEME}
        tool={toolData}
        tools={TOOLS}
        subcats={CATEGORIES}
        related={TOOLS.filter(t => t.id !== tool.id && t.cat === tool.cat).slice(0, 8)}
      >
        <ToolComp />
      </ToolPageLayout>
    </CategoryLayout>
  );
}

function ToolsRiftHash() {
  const route = useAppRouter();
  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>
      {route.page === 'home'     && <CategoryHomePage />}
      {route.page === 'tool'     && <ToolDetailPage toolId={route.toolId} />}
      {route.page === 'category' && <CategoryPage catId={route.catId} />}
    </div>
  );
}

export default ToolsRiftHash;
