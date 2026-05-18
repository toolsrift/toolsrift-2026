import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolPageLayout, { ToolSchemas } from './shared/ToolPageLayout';

const THEME = getCategoryById("colors");
const PAGE_THEME = getCategoryById('colors');

// ─── TOKENS ───────────────────────────────────────────────────────────────────
const C = {
  bg:"#06090F", surface:"#0D1117", border:"rgba(255,255,255,0.06)",
  pink:"#A855F7", pinkD:"#9333EA", text:"#E2E8F0", muted:"#64748B",
  blue:"#3B82F6", green:"#10B981", purple:"#8B5CF6", amber:"#F59E0B",
  cyan:"#06B6D4", danger:"#EF4444",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:6px;height:6px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
  ::selection{background:rgba(168,85,247,0.3)}
  button:hover{filter:brightness(1.1)}
  select option{background:#0D1117}
  textarea{resize:vertical}
  input[type=range]{accent-color:#A855F7;width:100%}
  .fade-in{animation:fadeIn .2s ease}
  @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
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

// ─── COLOR MATH LIBRARY ───────────────────────────────────────────────────────
function hexToRgb(hex) {
  const h = hex.replace("#","");
  if(h.length===3) return hexToRgb("#"+h[0]+h[0]+h[1]+h[1]+h[2]+h[2]);
  const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
  if(isNaN(r)||isNaN(g)||isNaN(b)) return null;
  return {r,g,b};
}

function rgbToHex(r,g,b) {
  return "#"+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0")).join("").toUpperCase();
}

function rgbToHsl(r,g,b) {
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h, s, l=(max+min)/2;
  if(max===min){ h=s=0; }
  else {
    const d=max-min;
    s = l>0.5 ? d/(2-max-min) : d/(max+min);
    switch(max){
      case r: h=((g-b)/d+(g<b?6:0))/6; break;
      case g: h=((b-r)/d+2)/6; break;
      case b: h=((r-g)/d+4)/6; break;
    }
  }
  return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
}

function hslToRgb(h,s,l) {
  h/=360; s/=100; l/=100;
  let r,g,b;
  if(s===0){ r=g=b=l; }
  else {
    const hue2rgb=(p,q,t)=>{ if(t<0)t+=1; if(t>1)t-=1; if(t<1/6)return p+(q-p)*6*t; if(t<1/2)return q; if(t<2/3)return p+(q-p)*(2/3-t)*6; return p; };
    const q=l<0.5?l*(1+s):l+s-l*s, p=2*l-q;
    r=hue2rgb(p,q,h+1/3); g=hue2rgb(p,q,h); b=hue2rgb(p,q,h-1/3);
  }
  return {r:Math.round(r*255), g:Math.round(g*255), b:Math.round(b*255)};
}

function hslToHex(h,s,l) { const {r,g,b}=hslToRgb(h,s,l); return rgbToHex(r,g,b); }

function rgbToHsv(r,g,b) {
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b), d=max-min;
  let h, s=max===0?0:d/max, v=max;
  if(max===min){ h=0; }
  else {
    switch(max){
      case r: h=(g-b)/d+(g<b?6:0); break;
      case g: h=(b-r)/d+2; break;
      case b: h=(r-g)/d+4; break;
    }
    h/=6;
  }
  return [Math.round(h*360), Math.round(s*100), Math.round(v*100)];
}

function hsvToRgb(h,s,v) {
  h/=360; s/=100; v/=100;
  let r,g,b;
  const i=Math.floor(h*6), f=h*6-i, p=v*(1-s), q=v*(1-f*s), t=v*(1-(1-f)*s);
  switch(i%6){
    case 0:r=v;g=t;b=p;break; case 1:r=q;g=v;b=p;break; case 2:r=p;g=v;b=t;break;
    case 3:r=p;g=q;b=v;break; case 4:r=t;g=p;b=v;break; case 5:r=v;g=p;b=q;break;
  }
  return {r:Math.round(r*255), g:Math.round(g*255), b:Math.round(b*255)};
}

function rgbToCmyk(r,g,b) {
  r/=255; g/=255; b/=255;
  const k=1-Math.max(r,g,b);
  if(k===1) return {c:0,m:0,y:0,k:100};
  return { c:Math.round((1-r-k)/(1-k)*100), m:Math.round((1-g-k)/(1-k)*100), y:Math.round((1-b-k)/(1-k)*100), k:Math.round(k*100) };
}

function cmykToRgb(c,m,y,k) {
  c/=100; m/=100; y/=100; k/=100;
  return { r:Math.round(255*(1-c)*(1-k)), g:Math.round(255*(1-m)*(1-k)), b:Math.round(255*(1-y)*(1-k)) };
}

function rgbToLab(r,g,b) {
  let R=r/255, G=g/255, B=b/255;
  R = R>0.04045 ? Math.pow((R+0.055)/1.055,2.4) : R/12.92;
  G = G>0.04045 ? Math.pow((G+0.055)/1.055,2.4) : G/12.92;
  B = B>0.04045 ? Math.pow((B+0.055)/1.055,2.4) : B/12.92;
  let X=(R*0.4124+G*0.3576+B*0.1805)/0.9505, Y=(R*0.2126+G*0.7152+B*0.0722)/1.0000, Z=(R*0.0193+G*0.1192+B*0.9505)/1.0890;
  const f=t=>t>0.008856?Math.cbrt(t):(7.787*t+16/116);
  return { l:Math.round(116*f(Y)-16), a:Math.round(500*(f(X)-f(Y))), b2:Math.round(200*(f(Y)-f(Z))) };
}

function contrastRatio(hex1, hex2) {
  const lum = hex => {
    const {r,g,b} = hexToRgb(hex)||{r:0,g:0,b:0};
    const c = [r,g,b].map(v=>{ const s=v/255; return s<=0.03928?s/12.92:Math.pow((s+0.055)/1.055,2.4); });
    return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];
  };
  const l1=lum(hex1), l2=lum(hex2);
  return ((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05));
}

function getLuminance(hex) {
  const {r,g,b} = hexToRgb(hex)||{r:0,g:0,b:0};
  const c = [r,g,b].map(v=>{ const s=v/255; return s<=0.03928?s/12.92:Math.pow((s+0.055)/1.055,2.4); });
  return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];
}

function colorDistance(hex1, hex2) {
  const lab1=rgbToLab(...Object.values(hexToRgb(hex1)||{r:0,g:0,b:0}));
  const lab2=rgbToLab(...Object.values(hexToRgb(hex2)||{r:0,g:0,b:0}));
  return Math.sqrt(Math.pow(lab1.l-lab2.l,2)+Math.pow(lab1.a-lab2.a,2)+Math.pow(lab1.b2-lab2.b2,2));
}

function hexValid(hex) { return /^#[0-9A-Fa-f]{6}$/.test(hex); }

function mixColors(hex1, hex2, ratio) {
  const c1=hexToRgb(hex1)||{r:0,g:0,b:0}, c2=hexToRgb(hex2)||{r:0,g:0,b:0};
  const t=ratio/100;
  return rgbToHex(Math.round(c1.r*(1-t)+c2.r*t), Math.round(c1.g*(1-t)+c2.g*t), Math.round(c1.b*(1-t)+c2.b*t));
}

function interpolateColors(hex1, hex2, steps) {
  return Array.from({length:steps},(_,i)=>mixColors(hex1, hex2, (i/(steps-1))*100));
}

// Named CSS colors (subset — most common 148)
const CSS_COLORS = [
  ["aliceblue","#F0F8FF"],["antiquewhite","#FAEBD7"],["aqua","#00FFFF"],["aquamarine","#7FFFD4"],["azure","#F0FFFF"],
  ["beige","#F5F5DC"],["bisque","#FFE4C4"],["black","#000000"],["blanchedalmond","#FFEBCD"],["blue","#0000FF"],
  ["blueviolet","#8A2BE2"],["brown","#A52A2A"],["burlywood","#DEB887"],["cadetblue","#5F9EA0"],["chartreuse","#7FFF00"],
  ["chocolate","#D2691E"],["coral","#FF7F50"],["cornflowerblue","#6495ED"],["cornsilk","#FFF8DC"],["crimson","#DC143C"],
  ["cyan","#00FFFF"],["darkblue","#00008B"],["darkcyan","#008B8B"],["darkgoldenrod","#B8860B"],["darkgray","#A9A9A9"],
  ["darkgreen","#006400"],["darkkhaki","#BDB76B"],["darkmagenta","#8B008B"],["darkolivegreen","#556B2F"],["darkorange","#FF8C00"],
  ["darkorchid","#9932CC"],["darkred","#8B0000"],["darksalmon","#E9967A"],["darkseagreen","#8FBC8F"],["darkslateblue","#483D8B"],
  ["darkslategray","#2F4F4F"],["darkturquoise","#00CED1"],["darkviolet","#9400D3"],["deeppink","#FF1493"],["deepskyblue","#00BFFF"],
  ["dimgray","#696969"],["dodgerblue","#1E90FF"],["firebrick","#B22222"],["floralwhite","#FFFAF0"],["forestgreen","#228B22"],
  ["fuchsia","#FF00FF"],["gainsboro","#DCDCDC"],["ghostwhite","#F8F8FF"],["gold","#FFD700"],["goldenrod","#DAA520"],
  ["gray","#808080"],["green","#008000"],["greenyellow","#ADFF2F"],["honeydew","#F0FFF0"],["hotpink","#FF69B4"],
  ["indianred","#CD5C5C"],["indigo","#4B0082"],["ivory","#FFFFF0"],["khaki","#F0E68C"],["lavender","#E6E6FA"],
  ["lavenderblush","#FFF0F5"],["lawngreen","#7CFC00"],["lemonchiffon","#FFFACD"],["lightblue","#ADD8E6"],["lightcoral","#F08080"],
  ["lightcyan","#E0FFFF"],["lightgoldenrodyellow","#FAFAD2"],["lightgray","#D3D3D3"],["lightgreen","#90EE90"],["lightpink","#FFB6C1"],
  ["lightsalmon","#FFA07A"],["lightseagreen","#20B2AA"],["lightskyblue","#87CEFA"],["lightslategray","#778899"],["lightsteelblue","#B0C4DE"],
  ["lightyellow","#FFFFE0"],["lime","#00FF00"],["limegreen","#32CD32"],["linen","#FAF0E6"],["magenta","#FF00FF"],
  ["maroon","#800000"],["mediumaquamarine","#66CDAA"],["mediumblue","#0000CD"],["mediumorchid","#BA55D3"],["mediumpurple","#9370DB"],
  ["mediumseagreen","#3CB371"],["mediumslateblue","#7B68EE"],["mediumspringgreen","#00FA9A"],["mediumturquoise","#48D1CC"],["mediumvioletred","#C71585"],
  ["midnightblue","#191970"],["mintcream","#F5FFFA"],["mistyrose","#FFE4E1"],["moccasin","#FFE4B5"],["navajowhite","#FFDEAD"],
  ["navy","#000080"],["oldlace","#FDF5E6"],["olive","#808000"],["olivedrab","#6B8E23"],["orange","#FFA500"],
  ["orangered","#FF4500"],["orchid","#DA70D6"],["palegoldenrod","#EEE8AA"],["palegreen","#98FB98"],["paleturquoise","#AFEEEE"],
  ["palevioletred","#DB7093"],["papayawhip","#FFEFD5"],["peachpuff","#FFDAB9"],["peru","#CD853F"],["pink","#FFC0CB"],
  ["plum","#DDA0DD"],["powderblue","#B0E0E6"],["purple","#800080"],["red","#FF0000"],["rosybrown","#BC8F8F"],
  ["royalblue","#4169E1"],["saddlebrown","#8B4513"],["salmon","#FA8072"],["sandybrown","#F4A460"],["seagreen","#2E8B57"],
  ["seashell","#FFF5EE"],["sienna","#A0522D"],["silver","#C0C0C0"],["skyblue","#87CEEB"],["slateblue","#6A5ACD"],
  ["slategray","#708090"],["snow","#FFFAFA"],["springgreen","#00FF7F"],["steelblue","#4682B4"],["tan","#D2B48C"],
  ["teal","#008080"],["thistle","#D8BFD8"],["tomato","#FF6347"],["turquoise","#40E0D0"],["violet","#EE82EE"],
  ["wheat","#F5DEB3"],["white","#FFFFFF"],["whitesmoke","#F5F5F5"],["yellow","#FFFF00"],["yellowgreen","#9ACD32"],
];

// Tailwind palette (key shades)
const TAILWIND = {
  slate:["#F8FAFC","#F1F5F9","#E2E8F0","#CBD5E1","#94A3B8","#64748B","#475569","#334155","#1E293B","#0F172A"],
  gray:["#F9FAFB","#F3F4F6","#E5E7EB","#D1D5DB","#9CA3AF","#6B7280","#4B5563","#374151","#1F2937","#111827"],
  red:["#FEF2F2","#FEE2E2","#FECACA","#FCA5A5","#F87171","#EF4444","#DC2626","#B91C1C","#991B1B","#7F1D1D"],
  orange:["#FFF7ED","#FFEDD5","#FED7AA","#FDBA74","#FB923C","#F97316","#EA580C","#C2410C","#9A3412","#7C2D12"],
  amber:["#FFFBEB","#FEF3C7","#FDE68A","#FCD34D","#FBBF24","#F59E0B","#D97706","#B45309","#92400E","#78350F"],
  yellow:["#FEFCE8","#FEF9C3","#FEF08A","#FDE047","#FACC15","#EAB308","#CA8A04","#A16207","#854D0E","#713F12"],
  lime:["#F7FEE7","#ECFCCB","#D9F99D","#BEF264","#A3E635","#84CC16","#65A30D","#4D7C0F","#3F6212","#365314"],
  green:["#F0FDF4","#DCFCE7","#BBF7D0","#86EFAC","#4ADE80","#22C55E","#16A34A","#15803D","#166534","#14532D"],
  teal:["#F0FDFA","#CCFBF1","#99F6E4","#5EEAD4","#2DD4BF","#14B8A6","#0D9488","#0F766E","#115E59","#134E4A"],
  cyan:["#ECFEFF","#CFFAFE","#A5F3FC","#67E8F9","#22D3EE","#06B6D4","#0891B2","#0E7490","#155E75","#164E63"],
  blue:["#EFF6FF","#DBEAFE","#BFDBFE","#93C5FD","#60A5FA","#3B82F6","#2563EB","#1D4ED8","#1E40AF","#1E3A8A"],
  indigo:["#EEF2FF","#E0E7FF","#C7D2FE","#A5B4FC","#818CF8","#6366F1","#4F46E5","#4338CA","#3730A3","#312E81"],
  violet:["#F5F3FF","#EDE9FE","#DDD6FE","#C4B5FD","#A78BFA","#8B5CF6","#7C3AED","#6D28D9","#5B21B6","#4C1D95"],
  pink:["#FDF2F8","#FCE7F3","#FBCFE8","#F9A8D4","#F472B6","#EC4899","#DB2777","#BE185D","#9D174D","#831843"],
  rose:["#FFF1F2","#FFE4E6","#FECDD3","#FDA4AF","#FB7185","#F43F5E","#E11D48","#BE123C","#9F1239","#881337"],
};

const TW_SHADES = ["50","100","200","300","400","500","600","700","800","900"];

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Badge({ children, color="pink" }) {
  const bg={pink:"rgba(168,85,247,0.15)",blue:"rgba(59,130,246,0.15)",green:"rgba(16,185,129,0.15)",amber:"rgba(245,158,11,0.15)",purple:"rgba(139,92,246,0.15)",cyan:"rgba(6,182,212,0.15)",red:"rgba(239,68,68,0.15)"};
  const fg={pink:"#C084FC",blue:"#60A5FA",green:"#34D399",amber:"#FCD34D",purple:"#A78BFA",cyan:"#22D3EE",red:"#FCA5A5"};
  return <span style={{background:bg[color]||bg.pink,color:fg[color]||fg.pink,borderRadius:4,padding:"2px 8px",fontSize:11,fontWeight:600,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{children}</span>;
}

function Btn({ children, onClick, variant="primary", size="md", disabled, style={} }) {
  const base={display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,border:"none",cursor:disabled?"not-allowed":"pointer",borderRadius:8,fontWeight:600,transition:"all .15s",fontFamily:"'Plus Jakarta Sans',sans-serif",opacity:disabled?0.5:1};
  const sz={sm:{padding:"6px 14px",fontSize:12},md:{padding:"9px 20px",fontSize:13},lg:{padding:"12px 28px",fontSize:14}}[size];
  const v={
    primary:{background:`linear-gradient(135deg,${C.pink},${C.pinkD})`,color:"#fff",boxShadow:"0 2px 8px rgba(168,85,247,0.3)"},
    secondary:{background:"rgba(255,255,255,0.05)",color:C.text,border:`1px solid ${C.border}`},
    ghost:{background:"transparent",color:C.muted},
  }[variant];
  return <button style={{...base,...sz,...v,...style}} onClick={onClick} disabled={disabled}>{children}</button>;
}

function Input({ value, onChange, placeholder, style={}, mono=false, type="text" }) {
  return (
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 14px",color:C.text,fontSize:13,fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif",outline:"none",...style}}
      onFocus={e=>e.target.style.borderColor=C.pink} onBlur={e=>e.target.style.borderColor=C.border}/>
  );
}

function SelectInput({ value, onChange, options, style={} }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 14px",color:C.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",cursor:"pointer",...style}}>
      {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
    </select>
  );
}

function Card({ children, style={} }) { return <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20,...style}}>{children}</div>; }
function Label({ children }) { return <div style={{...T.label,marginBottom:6}}>{children}</div>; }

function CopyBtn({ text, label="Copy", style={} }) {
  const [copied,setCopied]=useState(false);
  const copy=()=>{navigator.clipboard.writeText(text).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),1800);});};
  return <Btn variant={copied?"secondary":"ghost"} size="sm" onClick={copy} style={style}>{copied?"✓ Copied":label}</Btn>;
}

function VStack({ children, gap=12 }) { return <div style={{display:"flex",flexDirection:"column",gap}}>{children}</div>; }
function Grid2({ children, gap=16 }) { return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap}}>{children}</div>; }
function Grid3({ children, gap=12 }) { return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap}}>{children}</div>; }

function Slider({ label, value, onChange, min=0, max=100, step=1, unit="" }) {
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <Label>{label}</Label>
        <span style={{fontSize:12,color:C.pink,fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/>
    </div>
  );
}

function ColorSwatch({ color, size=48, onClick, label, showHex=false }) {
  const textColor = getLuminance(hexValid(color)?color:"#000000")>0.5 ? "#000":"#fff";
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:onClick?"pointer":"default"}} onClick={onClick}>
      <div style={{width:size,height:size,borderRadius:8,background:hexValid(color)?color:"transparent",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:textColor,transition:"transform .1s"}}
        onMouseEnter={e=>onClick&&(e.currentTarget.style.transform="scale(1.08)")} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>
      {label&&<div style={{fontSize:10,color:C.muted,textAlign:"center",maxWidth:60,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{label}</div>}
      {showHex&&<div style={{fontSize:10,color:C.text,fontFamily:"'JetBrains Mono',monospace"}}>{color}</div>}
    </div>
  );
}

function ColorInput({ label, value, onChange }) {
  return (
    <div>
      {label&&<Label>{label}</Label>}
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <input type="color" value={hexValid(value)?value:"#000000"} onChange={e=>onChange(e.target.value)}
          style={{width:40,height:36,borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer",padding:2,background:"rgba(255,255,255,0.04)"}}/>
        <Input value={value} onChange={onChange} mono placeholder="#EC4899" style={{flex:1}}/>
      </div>
    </div>
  );
}

function StatRow({ label, value, mono=true, accent="" }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
      <span style={{color:C.muted}}>{label}</span>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{color:accent||C.text,fontFamily:mono?"'JetBrains Mono',monospace":"inherit",fontWeight:600}}>{value}</span>
        <CopyBtn text={String(value)} label=""/>
      </div>
    </div>
  );
}

// ─── ROUTER ───────────────────────────────────────────────────────────────────
function useAppRouter() {
  const parse=()=>{const h=window.location.hash||"#/";const path=h.replace(/^#/,"")||"/";const parts=path.split("/").filter(Boolean);if(!parts.length)return{page:"home"};if(parts[0]==="tool"&&parts[1])return{page:"tool",toolId:parts[1]};if(parts[0]==="category"&&parts[1])return{page:"category",catId:parts[1]};return{page:"home"};};
  const[route,setRoute]=useState(parse);
  useEffect(()=>{const fn=()=>setRoute(parse());window.addEventListener("hashchange",fn);return()=>window.removeEventListener("hashchange",fn);},[]);
  useEffect(()=>{const fn=e=>{const a=e.target.closest("a[href]");if(!a)return;const h=a.getAttribute("href");if(h&&h.startsWith("#/")){e.preventDefault();window.location.hash=h;}};document.addEventListener("click",fn);return()=>document.removeEventListener("click",fn);},[]);
  return route;
}

// ─── TOOL REGISTRY ────────────────────────────────────────────────────────────
const TOOLS = [
  {id:"color-picker",       cat:"core",     name:"Color Picker",                desc:"Pick colors visually and get HEX, RGB, HSL, HSV, CMYK values",  icon:"🎨", free:true},
  {id:"color-converter",    cat:"core",     name:"Color Format Converter",      desc:"Convert between HEX, RGB, HSL, HSV, CMYK, LAB and CSS names",   icon:"🔄", free:true},
  {id:"color-contrast",     cat:"a11y",     name:"Color Contrast Checker",      desc:"Check WCAG AA/AAA contrast ratios for text and backgrounds",    icon:"⚖️", free:true},
  {id:"wcag-checker",       cat:"a11y",     name:"WCAG Color Compliance",       desc:"Test all WCAG 2.1 text size requirements with pass/fail badges", icon:"✅", free:true},
  {id:"color-mixer",        cat:"generate", name:"Color Mixer",                 desc:"Blend two colors with a ratio slider and preview the mix",       icon:"🧪", free:true},
  {id:"color-shades",       cat:"generate", name:"Tints & Shades Generator",    desc:"Generate a complete range of tints and shades from any color",   icon:"🌗", free:true},
  {id:"color-gradient",     cat:"generate", name:"Gradient Color Steps",        desc:"Generate N evenly-spaced colors between two endpoints",          icon:"🌈", free:true},
  {id:"color-harmonies",    cat:"generate", name:"Color Harmonies",             desc:"Generate complementary, triadic and analogous palettes",         icon:"🎵", free:true},
  {id:"color-palette",      cat:"generate", name:"Random Palette Generator",    desc:"Generate beautiful random color palettes with one click",        icon:"🎲", free:true},
  {id:"color-opacity",      cat:"convert",  name:"Color Opacity / RGBA",        desc:"Add alpha transparency to any color and get rgba() values",      icon:"👻", free:true},
  {id:"image-colors",       cat:"extract",  name:"Image Color Extractor",       desc:"Upload an image to extract its dominant color palette",          icon:"🖼️", free:true},
  {id:"color-blindness",    cat:"a11y",     name:"Color Blindness Simulator",   desc:"Simulate how your palette looks with different color blindness",  icon:"👁️", free:true},
  {id:"color-name",         cat:"convert",  name:"Color Name Finder",           desc:"Find the nearest CSS named color for any hex value",             icon:"🏷️", free:true},
  {id:"css-color-names",    cat:"reference",name:"CSS Color Names Reference",   desc:"Complete table of all 148 CSS named colors with hex values",     icon:"📋", free:true},
  {id:"tailwind-colors",    cat:"reference",name:"Tailwind Color Finder",       desc:"Browse and copy the complete Tailwind CSS color palette",        icon:"🌊", free:true},
  {id:"color-distance",     cat:"convert",  name:"Color Distance Calculator",   desc:"Measure perceptual color difference using the ΔECIEDE2000 metric",icon:"📏", free:true},
  {id:"color-temperature",  cat:"convert",  name:"Color Temperature Tool",      desc:"Visualize warm/cool color temperature and generate palettes",    icon:"🌡️", free:true},
  {id:"hex-rgba",           cat:"convert",  name:"HEX to RGBA Converter",       desc:"Convert HEX colors to rgba() with custom alpha / opacity",       icon:"🔢", free:true},
  {id:"color-sorter",       cat:"generate", name:"Color Palette Sorter",        desc:"Sort a list of hex colors by hue, saturation, or lightness",     icon:"🔃", free:true},
  {id:"color-scheme",       cat:"generate", name:"UI Color Scheme Builder",     desc:"Build a complete UI color scheme with semantic role assignment",  icon:"🎯", free:true},
];

const CATEGORIES = [
  {id:"core",      name:"Core Tools",        icon:"🎨", desc:"Color picking and format conversion"},
  {id:"a11y",      name:"Accessibility",     icon:"♿", desc:"WCAG contrast, color blindness simulation"},
  {id:"generate",  name:"Generate & Mix",    icon:"🌈", desc:"Palettes, harmonies, tints, shades, gradients"},
  {id:"convert",   name:"Convert & Analyze", icon:"🔄", desc:"Opacity, name finder, distance, temperature"},
  {id:"extract",   name:"Extract",           icon:"🖼️", desc:"Extract colors from images"},
  {id:"reference", name:"Reference",         icon:"📋", desc:"CSS names, Tailwind palette"},
];

const TOOL_META = {
  "color-picker":    {title:"Color Picker – Free Online Color Picker Tool", desc:"Pick any color visually and instantly get HEX, RGB, HSL, HSV, CMYK and LAB values. Copy any format with one click.", faq:[["What color formats are shown?","HEX, RGB, HSL, HSV, CMYK, and CIE-LAB. Each can be copied individually."],["What is HSL?","Hue-Saturation-Lightness — a more intuitive model where hue is a 0–360° color wheel, S is vividness, and L is brightness."],["What is CMYK?","Cyan-Magenta-Yellow-Key(Black) — the color model used in color printing."]]},
  "color-contrast":  {title:"Color Contrast Checker – WCAG AA/AAA Compliance", desc:"Check foreground/background color contrast ratios against WCAG 2.1 AA and AAA standards for accessibility compliance.", faq:[["What is WCAG?","Web Content Accessibility Guidelines — standards ensuring web content is accessible to people with disabilities."],["What contrast ratio is required?","WCAG AA requires 4.5:1 for normal text, 3:1 for large text. AAA requires 7:1 and 4.5:1 respectively."],["What counts as large text?","18pt (24px) or 14pt bold (approximately 18.67px bold) is considered large text."]]},
  "color-harmonies": {title:"Color Harmonies Generator – Complementary, Triadic & More", desc:"Generate color palettes based on color theory harmony rules: complementary, analogous, triadic, tetradic and split-complementary.", faq:[["What is a complementary color?","The color directly opposite on the color wheel, 180° away. Creates maximum contrast."],["What is a triadic harmony?","Three colors evenly spaced 120° apart on the color wheel. Creates vibrant, balanced palettes."],["What is analogous?","Colors that are adjacent on the color wheel (within 30°). Creates harmonious, natural-looking palettes."]]},
  "tailwind-colors": {title:"Tailwind CSS Color Palette – Browse & Copy All Colors", desc:"Browse the complete Tailwind CSS color palette (v3). Click any swatch to copy its hex value or Tailwind class name.", faq:[["How many Tailwind colors are there?","Tailwind v3 includes 22 color families, each with 11 shades from 50 to 950."],["How do I use these in my project?","Use the class names like bg-blue-500 or text-pink-400 directly in your HTML."],["Can I customize Tailwind colors?","Yes — add custom colors in tailwind.config.js under the theme.extend.colors key."]]},
};

// ─── TOOL COMPONENTS ─────────────────────────────────────────────────────────

function ColorPicker() {
  const [hex, setHex] = useState("#EC4899");
  const rgb = useMemo(()=>hexToRgb(hex)||{r:0,g:0,b:0}, [hex]);
  const hsl = useMemo(()=>rgbToHsl(rgb.r,rgb.g,rgb.b), [rgb]);
  const hsv = useMemo(()=>rgbToHsv(rgb.r,rgb.g,rgb.b), [rgb]);
  const cmyk = useMemo(()=>rgbToCmyk(rgb.r,rgb.g,rgb.b), [rgb]);
  const lab = useMemo(()=>rgbToLab(rgb.r,rgb.g,rgb.b), [rgb]);
  const lum = getLuminance(hexValid(hex)?hex:"#000");

  const formats = [
    ["HEX", hex.toUpperCase()],
    ["RGB", `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`],
    ["HSL", `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`],
    ["HSV", `hsv(${hsv[0]}, ${hsv[1]}%, ${hsv[2]}%)`],
    ["CMYK", `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`],
    ["LAB", `lab(${lab.l}, ${lab.a}, ${lab.b2})`],
    ["Luminance", lum.toFixed(4)],
  ];

  return (
    <VStack>
      <Grid2>
        <div>
          <Label>Color Picker</Label>
          <input type="color" value={hexValid(hex)?hex:"#000000"} onChange={e=>setHex(e.target.value.toUpperCase())}
            style={{width:"100%",height:160,borderRadius:12,border:`1px solid ${C.border}`,cursor:"pointer",padding:4,background:"none"}}/>
        </div>
        <div>
          <Label>Color Preview</Label>
          <div style={{height:160,borderRadius:12,background:hexValid(hex)?hex:"#000",border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
            <span style={{fontSize:18,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:lum>0.5?"#000":"#fff"}}>{hex.toUpperCase()}</span>
            <span style={{fontSize:12,color:lum>0.5?"rgba(0,0,0,0.6)":"rgba(255,255,255,0.6)"}}>{lum>0.179?"Light":"Dark"} color</span>
          </div>
        </div>
      </Grid2>
      <div><Label>Hex Value</Label><Input value={hex} onChange={v=>{if(v.startsWith("#")||v.startsWith("")) setHex(v.startsWith("#")?v:"#"+v);}} mono placeholder="#EC4899"/></div>
      <Card>
        {formats.map(([l,v])=><StatRow key={l} label={l} value={v} accent={l==="HEX"?C.pink:""}/>)}
      </Card>
      <Grid3>
        {[["H",hsl[0]+"°"],[" S",hsl[1]+"%"],["L",hsl[2]+"%"]].map(([l,v])=>(
          <div key={l} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px",textAlign:"center"}}>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:700,color:C.pink}}>{v}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>HSL {l}</div>
          </div>
        ))}
      </Grid3>
    </VStack>
  );
}

function ColorConverter() {
  const [mode, setMode] = useState("hex");
  const [hex, setHex] = useState("#EC4899");
  const [r,setR]=useState(236); const [g,setG]=useState(72); const [b,setB]=useState(153);
  const [h,setH]=useState(330); const [s,setS]=useState(81); const [l,setL]=useState(604);
  const [c,setC]=useState(0); const [m,setM]=useState(69); const [y,setY]=useState(35); const [k,setK]=useState(7);

  const sync = useCallback((source, val) => {
    let rgb2;
    if(source==="hex"&&hexValid(val)) { rgb2=hexToRgb(val); }
    else if(source==="rgb") { rgb2={r,g,b}; }
    else if(source==="hsl") { rgb2=hslToRgb(h,s,l/10); }
    else if(source==="cmyk") { rgb2=cmykToRgb(c,m,y,k); }
    if(!rgb2) return;
    const hx=rgbToHex(rgb2.r,rgb2.g,rgb2.b);
    const hl=rgbToHsl(rgb2.r,rgb2.g,rgb2.b);
    const cm=rgbToCmyk(rgb2.r,rgb2.g,rgb2.b);
    if(source!=="hex") setHex(hx);
    if(source!=="rgb"){setR(rgb2.r);setG(rgb2.g);setB(rgb2.b);}
    if(source!=="hsl"){setH(hl[0]);setS(hl[1]);setL(hl[2]*10);}
    if(source!=="cmyk"){setC(cm.c);setM(cm.m);setY(cm.y);setK(cm.k);}
  },[r,g,b,h,s,l,c,m,y,k]);

  const currentRgb = hexToRgb(hexValid(hex)?hex:"#000000")||{r:0,g:0,b:0};
  const allFormats = [
    ["HEX", hex.toUpperCase()],
    ["RGB", `rgb(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b})`],
    ["RGBA", `rgba(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}, 1)`],
    ["HSL", (()=>{const hl=rgbToHsl(currentRgb.r,currentRgb.g,currentRgb.b);return `hsl(${hl[0]}, ${hl[1]}%, ${hl[2]}%)`;})()],
    ["HSV", (()=>{const hv=rgbToHsv(currentRgb.r,currentRgb.g,currentRgb.b);return `hsv(${hv[0]}, ${hv[1]}%, ${hv[2]}%)`;})()],
    ["CMYK", (()=>{const cm=rgbToCmyk(currentRgb.r,currentRgb.g,currentRgb.b);return `cmyk(${cm.c}%, ${cm.m}%, ${cm.y}%, ${cm.k}%)`;})()],
    ["LAB", (()=>{const la=rgbToLab(currentRgb.r,currentRgb.g,currentRgb.b);return `lab(${la.l}, ${la.a}, ${la.b2})`;})()],
    ["CSS filter", `invert(${Math.round(getLuminance(hex)*100)}%) sepia(100%)`],
  ];

  return (
    <VStack>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {["hex","rgb","hsl","cmyk"].map(m2=><Btn key={m2} size="sm" variant={mode===m2?"primary":"secondary"} onClick={()=>setMode(m2)}>{m2.toUpperCase()} Input</Btn>)}
      </div>
      {mode==="hex"&&(
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <input type="color" value={hexValid(hex)?hex:"#000000"} onChange={e=>{setHex(e.target.value.toUpperCase());sync("hex",e.target.value);}} style={{width:44,height:40,borderRadius:8,border:`1px solid ${C.border}`,padding:2,background:"none",cursor:"pointer"}}/>
          <Input value={hex} onChange={v=>{setHex(v);sync("hex",v);}} mono placeholder="#EC4899"/>
        </div>
      )}
      {mode==="rgb"&&<Grid3><div><Label>R (0–255)</Label><Input value={r} onChange={v=>{setR(Number(v));sync("rgb");}} type="number" mono/></div><div><Label>G (0–255)</Label><Input value={g} onChange={v=>{setG(Number(v));sync("rgb");}} type="number" mono/></div><div><Label>B (0–255)</Label><Input value={b} onChange={v=>{setB(Number(v));sync("rgb");}} type="number" mono/></div></Grid3>}
      {mode==="hsl"&&<Grid3><div><Label>H (0–360)</Label><Input value={h} onChange={v=>{setH(Number(v));sync("hsl");}} type="number" mono/></div><div><Label>S (0–100)</Label><Input value={s} onChange={v=>{setS(Number(v));sync("hsl");}} type="number" mono/></div><div><Label>L (0–100)</Label><Input value={Math.round(l/10)} onChange={v=>{setL(Number(v)*10);sync("hsl");}} type="number" mono/></div></Grid3>}
      {mode==="cmyk"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}>{[["C",c,setC],["M",m,setM],["Y",y,setY],["K",k,setK]].map(([lbl,val,set])=><div key={lbl}><Label>{lbl} %</Label><Input value={val} onChange={v=>{set(Number(v));sync("cmyk");}} type="number" mono/></div>)}</div>}
      <div style={{height:80,borderRadius:10,background:hexValid(hex)?hex:"#000",border:`1px solid ${C.border}`,transition:"background .1s"}}/>
      <Card>
        {allFormats.map(([l2,v2])=><StatRow key={l2} label={l2} value={v2}/>)}
      </Card>
    </VStack>
  );
}

function ColorContrast() {
  const [fg, setFg] = useState("#FFFFFF");
  const [bg, setBg] = useState("#EC4899");
  const ratio = hexValid(fg)&&hexValid(bg) ? contrastRatio(fg,bg) : 1;
  const pass = {
    normalAA: ratio>=4.5, normalAAA: ratio>=7,
    largeAA: ratio>=3, largeAAA: ratio>=4.5,
    uiAA: ratio>=3,
  };
  const grade = ratio>=7?"AAA":ratio>=4.5?"AA":ratio>=3?"AA Large":"Fail";
  const gradeColor = ratio>=4.5?C.green:ratio>=3?C.amber:C.danger;

  return (
    <VStack>
      <Grid2>
        <ColorInput label="Foreground (Text)" value={fg} onChange={setFg}/>
        <ColorInput label="Background" value={bg} onChange={setBg}/>
      </Grid2>
      <div style={{borderRadius:12,background:hexValid(bg)?bg:"#000",padding:24,textAlign:"center",border:`1px solid ${C.border}`}} className="fade-in">
        <div style={{color:hexValid(fg)?fg:"#fff",fontSize:24,fontWeight:700,fontFamily:"'Sora',sans-serif",marginBottom:8}}>Sample Text Preview</div>
        <div style={{color:hexValid(fg)?fg:"#fff",fontSize:14,opacity:0.9}}>The quick brown fox jumps over the lazy dog</div>
        <div style={{color:hexValid(fg)?fg:"#fff",fontSize:12,marginTop:8,opacity:0.7}}>Small text (12px) — harder to read at low contrast</div>
      </div>
      <div style={{textAlign:"center",padding:"20px 24px",background:gradeColor+"15",border:`1px solid ${gradeColor}40`,borderRadius:12}}>
        <div style={{fontFamily:"'Sora',sans-serif",fontSize:44,fontWeight:800,color:gradeColor}}>{ratio.toFixed(2)}:1</div>
        <div style={{marginTop:6}}><Badge color={ratio>=4.5?"green":ratio>=3?"amber":"red"}>{grade}</Badge></div>
      </div>
      <Card>
        <Label>WCAG 2.1 Results</Label>
        <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:8}}>
          {[
            ["Normal Text — AA (4.5:1)",pass.normalAA],
            ["Normal Text — AAA (7:1)",pass.normalAAA],
            ["Large Text — AA (3:1)",pass.largeAA],
            ["Large Text — AAA (4.5:1)",pass.largeAAA],
            ["UI Components — AA (3:1)",pass.uiAA],
          ].map(([label,passes])=>(
            <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:"rgba(255,255,255,0.02)",borderRadius:7}}>
              <span style={{fontSize:13,color:C.muted}}>{label}</span>
              <Badge color={passes?"green":"red"}>{passes?"✓ Pass":"✗ Fail"}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </VStack>
  );
}

function WcagChecker() {
  const [pairs, setPairs] = useState([
    {fg:"#FFFFFF",bg:"#1E293B",label:"White on Dark"},
    {fg:"#000000",bg:"#FFFFFF",label:"Black on White"},
    {fg:"#EC4899",bg:"#0D1117",label:"Pink on Dark"},
    {fg:"#FCD34D",bg:"#1E293B",label:"Amber on Dark"},
    {fg:"#334155",bg:"#F1F5F9",label:"Slate on Light"},
  ]);
  const [newFg,setNewFg]=useState("#EC4899");
  const [newBg,setNewBg]=useState("#000000");
  const [newLabel,setNewLabel]=useState("");

  const addPair = ()=>{ setPairs(p=>[...p,{fg:newFg,bg:newBg,label:newLabel||`Pair ${p.length+1}`}]); };

  return (
    <VStack>
      <Card>
        <Label>Add Color Pair</Label>
        <div style={{display:"flex",gap:10,marginTop:8,flexWrap:"wrap",alignItems:"flex-end"}}>
          <div><Label>Foreground</Label><div style={{display:"flex",gap:6,alignItems:"center"}}><input type="color" value={newFg} onChange={e=>setNewFg(e.target.value)} style={{width:36,height:36,borderRadius:6,border:`1px solid ${C.border}`,padding:2,background:"none",cursor:"pointer"}}/><Input value={newFg} onChange={setNewFg} mono style={{width:100}}/></div></div>
          <div><Label>Background</Label><div style={{display:"flex",gap:6,alignItems:"center"}}><input type="color" value={newBg} onChange={e=>setNewBg(e.target.value)} style={{width:36,height:36,borderRadius:6,border:`1px solid ${C.border}`,padding:2,background:"none",cursor:"pointer"}}/><Input value={newBg} onChange={setNewBg} mono style={{width:100}}/></div></div>
          <div style={{flex:1}}><Label>Label</Label><Input value={newLabel} onChange={setNewLabel} placeholder="Optional name"/></div>
          <Btn onClick={addPair}>Add</Btn>
        </div>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {pairs.map((p,i)=>{
          const ratio2=hexValid(p.fg)&&hexValid(p.bg)?contrastRatio(p.fg,p.bg):1;
          const grade=ratio2>=7?"AAA":ratio2>=4.5?"AA":ratio2>=3?"AA-L":"Fail";
          const gc=ratio2>=7?C.green:ratio2>=4.5?"#4ADE80":ratio2>=3?C.amber:C.danger;
          return (
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10}}>
              <div style={{width:60,height:40,borderRadius:8,background:hexValid(p.bg)?p.bg:"#000",display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.border}`,flexShrink:0}}>
                <span style={{color:hexValid(p.fg)?p.fg:"#fff",fontSize:13,fontWeight:700}}>Aa</span>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{p.label}</div>
                <div style={{fontSize:11,color:C.muted,fontFamily:"'JetBrains Mono',monospace"}}>{p.fg} on {p.bg}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:15,fontWeight:700,color:gc}}>{ratio2.toFixed(2)}:1</div>
                <Badge color={ratio2>=4.5?"green":ratio2>=3?"amber":"red"}>{grade}</Badge>
              </div>
              <Btn size="sm" variant="ghost" onClick={()=>setPairs(ps=>ps.filter((_,j)=>j!==i))}>×</Btn>
            </div>
          );
        })}
      </div>
    </VStack>
  );
}

function ColorMixer() {
  const [c1, setC1] = useState("#EC4899");
  const [c2, setC2] = useState("#06B6D4");
  const [ratio, setRatio] = useState(50);
  const mixed = hexValid(c1)&&hexValid(c2) ? mixColors(c1,c2,ratio) : "#000";
  const steps = hexValid(c1)&&hexValid(c2) ? interpolateColors(c1,c2,9) : [];

  return (
    <VStack>
      <Grid2>
        <ColorInput label="Color A" value={c1} onChange={setC1}/>
        <ColorInput label="Color B" value={c2} onChange={setC2}/>
      </Grid2>
      <Slider label={`Mix Ratio — ${100-ratio}% A + ${ratio}% B`} value={ratio} onChange={setRatio} min={0} max={100} unit="%"/>
      <div style={{height:100,borderRadius:12,background:mixed,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",gap:10}} className="fade-in">
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,fontWeight:700,color:getLuminance(mixed)>0.3?"#000":"#fff"}}>{mixed}</span>
        <CopyBtn text={mixed} label="Copy"/>
      </div>
      <div>
        <Label>Mix Steps (9-stop gradient)</Label>
        <div style={{display:"flex",height:64,borderRadius:10,overflow:"hidden",marginTop:6}}>
          {steps.map((c,i)=>(
            <div key={i} style={{flex:1,background:c,cursor:"pointer",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"4px 0"}} onClick={()=>navigator.clipboard.writeText(c)} title={c}>
              <span style={{fontSize:8,color:getLuminance(c)>0.3?"rgba(0,0,0,0.5)":"rgba(255,255,255,0.5)",fontFamily:"'JetBrains Mono',monospace"}}>{i===0?"A":i===8?"B":""}</span>
            </div>
          ))}
        </div>
      </div>
    </VStack>
  );
}

function ColorShades() {
  const [base, setBase] = useState("#EC4899");
  const [steps, setSteps] = useState(10);
  const rgb = hexToRgb(hexValid(base)?base:"#EC4899")||{r:236,g:72,b:153};
  const [h2,s2] = rgbToHsl(rgb.r,rgb.g,rgb.b);

  const shades = useMemo(()=>Array.from({length:steps},(_,i)=>{
    const l=Math.round(5+((i/(steps-1))*90));
    return hslToHex(h2,s2,l);
  }),[h2,s2,steps]);

  const tints = useMemo(()=>shades.filter((_,i)=>i>= Math.floor(steps/2)), [shades,steps]);
  const darkShades = useMemo(()=>shades.filter((_,i)=>i< Math.floor(steps/2)), [shades,steps]);

  return (
    <VStack>
      <Grid2>
        <ColorInput label="Base Color" value={base} onChange={setBase}/>
        <Slider label="Steps" value={steps} onChange={setSteps} min={5} max={20} step={1} unit=""/>
      </Grid2>
      <div>
        <Label>Full Range ({steps} shades)</Label>
        <div style={{display:"flex",height:80,borderRadius:10,overflow:"hidden",marginTop:6}}>
          {shades.map((c,i)=>(
            <div key={i} style={{flex:1,background:c,cursor:"pointer",display:"flex",alignItems:"flex-end",justifyContent:"center",paddingBottom:4}} onClick={()=>navigator.clipboard.writeText(c)} title={`Click to copy ${c}`}>
              {i===Math.floor(steps/2)&&<span style={{fontSize:8,color:getLuminance(c)>0.3?"rgba(0,0,0,0.5)":"rgba(255,255,255,0.5)",fontFamily:"'JetBrains Mono',monospace"}}>base</span>}
            </div>
          ))}
        </div>
      </div>
      <Grid2>
        <div>
          <Label>Dark Shades</Label>
          <div style={{display:"flex",flexDirection:"column",gap:4,marginTop:6}}>
            {darkShades.map((c,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 10px",background:"rgba(255,255,255,0.02)",borderRadius:6}}>
                <div style={{width:24,height:24,borderRadius:4,background:c,border:`1px solid ${C.border}`}}/>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:C.text,flex:1}}>{c}</span>
                <CopyBtn text={c} label=""/>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label>Light Tints</Label>
          <div style={{display:"flex",flexDirection:"column",gap:4,marginTop:6}}>
            {tints.map((c,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 10px",background:"rgba(255,255,255,0.02)",borderRadius:6}}>
                <div style={{width:24,height:24,borderRadius:4,background:c,border:`1px solid ${C.border}`}}/>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:C.text,flex:1}}>{c}</span>
                <CopyBtn text={c} label=""/>
              </div>
            ))}
          </div>
        </div>
      </Grid2>
    </VStack>
  );
}

function ColorGradient() {
  const [from, setFrom] = useState("#EC4899");
  const [to, setTo] = useState("#06B6D4");
  const [steps, setSteps] = useState(8);
  const [space, setSpace] = useState("rgb");
  const colors = hexValid(from)&&hexValid(to) ? interpolateColors(from,to,steps) : [];
  const css = `background: linear-gradient(to right, ${from}, ${to});`;

  return (
    <VStack>
      <Grid2>
        <ColorInput label="From Color" value={from} onChange={setFrom}/>
        <ColorInput label="To Color" value={to} onChange={setTo}/>
      </Grid2>
      <Slider label="Steps" value={steps} onChange={setSteps} min={3} max={20} step={1} unit=" colors"/>
      <div>
        <Label>Gradient Preview</Label>
        <div style={{height:60,borderRadius:10,background:`linear-gradient(to right, ${from}, ${to})`,marginTop:6,border:`1px solid ${C.border}`}}/>
      </div>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <Label>{steps} Color Steps</Label>
          <CopyBtn text={colors.join(", ")} label="Copy All"/>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {colors.map((c,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{width:44,height:44,borderRadius:8,background:c,border:`1px solid ${C.border}`,cursor:"pointer"}} onClick={()=>navigator.clipboard.writeText(c)} title={c}/>
              <span style={{fontSize:9,fontFamily:"'JetBrains Mono',monospace",color:C.muted}}>{c}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><Label>CSS</Label><CopyBtn text={css}/></div>
        <div style={{background:"rgba(0,0,0,0.3)",borderRadius:8,padding:"10px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:C.text}}>{css}</div>
      </div>
    </VStack>
  );
}

function ColorHarmonies() {
  const [base, setBase] = useState("#EC4899");
  const [mode, setMode] = useState("complementary");
  const rgb = hexToRgb(hexValid(base)?base:"#EC4899")||{r:236,g:72,b:153};
  const [bh,bs,bl] = rgbToHsl(rgb.r,rgb.g,rgb.b);

  const schemes = useMemo(()=>{
    const h=(d)=>hslToHex((bh+d+360)%360,bs,bl);
    return {
      complementary:{ colors:[base,h(180)], desc:"Opposite on color wheel — maximum contrast" },
      analogous:{ colors:[h(-30),h(-15),base,h(15),h(30)], desc:"Adjacent colors — harmonious and natural" },
      triadic:{ colors:[base,h(120),h(240)], desc:"Evenly spaced 120° apart — vibrant balance" },
      tetradic:{ colors:[base,h(90),h(180),h(270)], desc:"Four colors 90° apart — rich, complex palettes" },
      "split-comp":{ colors:[base,h(150),h(210)], desc:"Base + two neighbors of complement" },
      monochromatic:{ colors:[hslToHex(bh,bs,Math.max(10,bl-30)),hslToHex(bh,bs,Math.max(10,bl-15)),base,hslToHex(bh,bs,Math.min(90,bl+15)),hslToHex(bh,bs,Math.min(90,bl+30))], desc:"Same hue, varying lightness" },
    };
  },[base,bh,bs,bl]);

  const current = schemes[mode];

  return (
    <VStack>
      <ColorInput label="Base Color" value={base} onChange={setBase}/>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {Object.entries(schemes).map(([k,{desc}])=>(
          <Btn key={k} size="sm" variant={mode===k?"primary":"secondary"} onClick={()=>setMode(k)}>{k}</Btn>
        ))}
      </div>
      {current&&(
        <>
          <p style={{fontSize:13,color:C.muted}}>{current.desc}</p>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {current.colors.map((c,i)=>(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                <div style={{width:70,height:70,borderRadius:10,background:c,border:`1px solid ${C.border}`,cursor:"pointer"}} onClick={()=>navigator.clipboard.writeText(c)}/>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:C.text}}>{c}</span>
                <CopyBtn text={c} label="Copy"/>
              </div>
            ))}
          </div>
          <div style={{height:50,display:"flex",borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
            {current.colors.map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
          </div>
        </>
      )}
    </VStack>
  );
}

function ColorPalette() {
  const [palette, setPalette] = useState([]);
  const [count, setCount] = useState(5);
  const [locked, setLocked] = useState([]);

  const generate = useCallback(()=>{
    setPalette(p=>{
      const newP = Array.from({length:count},(_,i)=>{
        if(locked.includes(i)&&p[i]) return p[i];
        const h=Math.floor(Math.random()*360), s=40+Math.floor(Math.random()*50), l=30+Math.floor(Math.random()*40);
        return hslToHex(h,s,l);
      });
      return newP;
    });
  },[count,locked]);

  useEffect(()=>generate(),[count]);

  return (
    <VStack>
      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <Slider label="Colors" value={count} onChange={setCount} min={3} max={8} step={1} unit=""/>
        <Btn onClick={generate}>↻ Generate</Btn>
        {locked.length>0&&<Btn variant="secondary" size="sm" onClick={()=>setLocked([])}>Unlock All</Btn>}
        <CopyBtn text={palette.join(", ")} label="Copy All HEX"/>
      </div>
      <div style={{display:"flex",gap:0,height:200,borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`}}>
        {palette.map((c,i)=>(
          <div key={i} style={{flex:1,background:c,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",padding:"10px 4px",gap:4,cursor:"pointer",position:"relative"}} onClick={()=>navigator.clipboard.writeText(c)}>
            <button onClick={e=>{e.stopPropagation();setLocked(l=>l.includes(i)?l.filter(x=>x!==i):[...l,i]);}} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.4)",border:"none",borderRadius:4,padding:"2px 6px",cursor:"pointer",fontSize:12,color:"#fff"}}>{locked.includes(i)?"🔒":"🔓"}</button>
            <span style={{fontSize:9,fontFamily:"'JetBrains Mono',monospace",color:getLuminance(c)>0.3?"rgba(0,0,0,0.7)":"rgba(255,255,255,0.7)",textAlign:"center",wordBreak:"break-all"}}>{c}</span>
          </div>
        ))}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        {palette.map((c,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 10px",background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:7}}>
            <div style={{width:16,height:16,borderRadius:3,background:c}}/>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:C.text}}>{c}</span>
            <CopyBtn text={c} label=""/>
          </div>
        ))}
      </div>
    </VStack>
  );
}

function ColorOpacity() {
  const [base, setBase] = useState("#EC4899");
  const [alpha, setAlpha] = useState(80);
  const rgb = hexToRgb(hexValid(base)?base:"#EC4899")||{r:236,g:72,b:153};
  const rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(alpha/100).toFixed(2)})`;
  const hexA = base.replace("#","")+(Math.round(alpha/100*255).toString(16).padStart(2,"0")).toUpperCase();
  const steps = [100,90,80,70,60,50,40,30,20,10];

  return (
    <VStack>
      <ColorInput label="Base Color" value={base} onChange={setBase}/>
      <Slider label="Opacity / Alpha" value={alpha} onChange={setAlpha} min={0} max={100} unit="%"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>
          <Label>Preview on Dark</Label>
          <div style={{height:80,borderRadius:10,background:"#0D1117",display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.border}`}}>
            <div style={{width:120,height:50,borderRadius:8,background:rgba}}/>
          </div>
        </div>
        <div>
          <Label>Preview on Light</Label>
          <div style={{height:80,borderRadius:10,background:"#F1F5F9",display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.border}`}}>
            <div style={{width:120,height:50,borderRadius:8,background:rgba}}/>
          </div>
        </div>
      </div>
      <Card>
        <StatRow label="rgba()" value={rgba} accent={C.pink}/>
        <StatRow label="8-digit HEX" value={`#${hexA}`}/>
        <StatRow label="CSS opacity" value={`opacity: ${(alpha/100).toFixed(2)}`}/>
        <StatRow label="Alpha value" value={(alpha/100).toFixed(2)}/>
      </Card>
      <div>
        <Label>Opacity Scale</Label>
        <div style={{display:"flex",height:56,borderRadius:10,overflow:"hidden",marginTop:6,border:`1px solid ${C.border}`,backgroundImage:"linear-gradient(45deg, #aaa 25%, transparent 25%), linear-gradient(-45deg, #aaa 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #aaa 75%), linear-gradient(-45deg, transparent 75%, #aaa 75%)",backgroundSize:"12px 12px",backgroundPosition:"0 0, 0 6px, 6px -6px, -6px 0px"}}>
          {steps.map(a=>(
            <div key={a} style={{flex:1,background:`rgba(${rgb.r},${rgb.g},${rgb.b},${a/100})`,cursor:"pointer",display:"flex",alignItems:"flex-end",justifyContent:"center",paddingBottom:2}} onClick={()=>{setAlpha(a);}}>
              <span style={{fontSize:8,color:"#fff",textShadow:"0 1px 2px rgba(0,0,0,0.5)"}}>{a}%</span>
            </div>
          ))}
        </div>
      </div>
    </VStack>
  );
}

function ImageColors() {
  const [colors, setColors] = useState([]);
  const [fileName, setFileName] = useState("");
  const [imgSrc, setImgSrc] = useState("");
  const canvasRef = useRef();

  const extractColors = (imgEl) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const maxSize = 80;
    const scale = Math.min(maxSize/imgEl.width, maxSize/imgEl.height);
    canvas.width = Math.round(imgEl.width*scale);
    canvas.height = Math.round(imgEl.height*scale);
    ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0,0,canvas.width,canvas.height).data;
    const colorMap = {};
    for(let i=0;i<data.length;i+=4) {
      const r=Math.round(data[i]/32)*32, g=Math.round(data[i+1]/32)*32, b=Math.round(data[i+2]/32)*32;
      const k=`${r},${g},${b}`;
      colorMap[k]=(colorMap[k]||0)+1;
    }
    const sorted = Object.entries(colorMap).sort((a,b)=>b[1]-a[1]).slice(0,12);
    setColors(sorted.map(([k])=>{ const [r2,g2,b2]=k.split(",").map(Number); return rgbToHex(r2,g2,b2); }));
  };

  const onFile = e => {
    const file = e.target.files[0];
    if(!file) return;
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    const img = new Image();
    img.onload = ()=>extractColors(img);
    img.src = url;
  };

  return (
    <VStack>
      <canvas ref={canvasRef} style={{display:"none"}}/>
      <div style={{border:`2px dashed ${C.border}`,borderRadius:12,padding:28,textAlign:"center",cursor:"pointer",background:"rgba(255,255,255,0.01)"}}
        onClick={()=>document.getElementById("imgcolor-input").click()}>
        <div style={{fontSize:36,marginBottom:8}}>🖼️</div>
        <div style={{fontSize:13,color:C.text,marginBottom:4}}>Upload an image to extract its colors</div>
        <div style={{fontSize:12,color:C.muted}}>PNG, JPEG, WebP, GIF — processed locally in your browser</div>
        <input id="imgcolor-input" type="file" accept="image/*" onChange={onFile} style={{display:"none"}}/>
      </div>
      {imgSrc&&(
        <Grid2>
          <div><Label>Image Preview</Label><img src={imgSrc} alt="uploaded" style={{width:"100%",maxHeight:200,objectFit:"contain",borderRadius:10,border:`1px solid ${C.border}`}}/></div>
          <div>
            <Label>Dominant Colors ({colors.length})</Label>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:6}}>
              {colors.map((c,i)=>(
                <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{width:44,height:44,borderRadius:8,background:c,border:`1px solid ${C.border}`,cursor:"pointer"}} onClick={()=>navigator.clipboard.writeText(c)} title={`Copy ${c}`}/>
                  <span style={{fontSize:9,fontFamily:"'JetBrains Mono',monospace",color:C.muted}}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </Grid2>
      )}
      {colors.length>0&&(
        <>
          <div style={{height:48,display:"flex",borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
            {colors.map((c,i)=><div key={i} style={{flex:1,background:c,cursor:"pointer"}} onClick={()=>navigator.clipboard.writeText(c)} title={c}/>)}
          </div>
          <CopyBtn text={colors.join(", ")} label="Copy All Colors"/>
        </>
      )}
    </VStack>
  );
}

function ColorBlindness() {
  const [palette, setPalette] = useState(["#EC4899","#06B6D4","#10B981","#F59E0B","#8B5CF6","#EF4444"]);
  const [inputVal, setInputVal] = useState("#EC4899");

  const simulators = {
    normal:    { name:"Normal Vision", fn:(r,g,b)=>({r,g,b}) },
    protanopia:{ name:"Protanopia (Red-blind)", fn:(r,g,b)=>({r:0.567*r+0.433*g,g:0.558*r+0.442*g,b:0.242*g+0.758*b}) },
    deuteranopia:{name:"Deuteranopia (Green-blind)",fn:(r,g,b)=>({r:0.625*r+0.375*g,g:0.7*r+0.3*g,b:0.3*g+0.7*b})},
    tritanopia:{ name:"Tritanopia (Blue-blind)", fn:(r,g,b)=>({r:0.95*r+0.05*g,g:0.433*g+0.567*b,b:0.475*g+0.525*b}) },
    achromatopsia:{name:"Achromatopsia (No color)",fn:(r,g,b)=>{ const gray=0.299*r+0.587*g+0.114*b; return {r:gray,g:gray,b:gray}; }},
    deuteranomaly:{name:"Deuteranomaly (Weak green)",fn:(r,g,b)=>({r:0.8*r+0.2*g,g:0.258*r+0.742*g,b:0.142*g+0.858*b})},
  };

  const simulate = (hex, fn) => {
    const {r,g,b} = hexToRgb(hex)||{r:0,g:0,b:0};
    const s = fn(r,g,b);
    return rgbToHex(Math.round(s.r),Math.round(s.g),Math.round(s.b));
  };

  const addColor = ()=>{ if(hexValid(inputVal)&&!palette.includes(inputVal)) setPalette(p=>[...p,inputVal]); };

  return (
    <VStack>
      <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
        <div style={{flex:1}}><Label>Add Color to Palette</Label><ColorInput value={inputVal} onChange={setInputVal}/></div>
        <Btn onClick={addColor}>Add</Btn>
        {palette.length>0&&<Btn variant="secondary" size="sm" onClick={()=>setPalette([])}>Clear</Btn>}
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:12}}>
          <thead>
            <tr style={{background:"rgba(255,255,255,0.03)"}}>
              <th style={{padding:"10px 12px",textAlign:"left",color:C.muted,fontWeight:600,fontSize:11,textTransform:"uppercase",borderBottom:`1px solid ${C.border}`,minWidth:160}}>Vision Type</th>
              {palette.map((c,i)=><th key={i} style={{padding:"10px 8px",borderBottom:`1px solid ${C.border}`,minWidth:64}}><div style={{width:40,height:32,borderRadius:6,background:c,margin:"0 auto"}}/></th>)}
            </tr>
          </thead>
          <tbody>
            {Object.entries(simulators).map(([key,{name,fn}])=>(
              <tr key={key} style={{borderBottom:`1px solid rgba(255,255,255,0.03)`}}>
                <td style={{padding:"8px 12px",color:C.muted}}>{name}</td>
                {palette.map((c,i)=>(
                  <td key={i} style={{padding:"8px",textAlign:"center"}}>
                    <div style={{width:40,height:32,borderRadius:6,background:simulate(c,fn),margin:"0 auto",cursor:"pointer"}} onClick={()=>navigator.clipboard.writeText(simulate(c,fn))} title={simulate(c,fn)}/>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </VStack>
  );
}

function ColorName() {
  const [hex, setHex] = useState("#EC4899");
  const nearest = useMemo(()=>{
    if(!hexValid(hex)) return null;
    let best = null, bestDist = Infinity;
    for(const [name, cssHex] of CSS_COLORS) {
      const d = colorDistance(hex, cssHex);
      if(d<bestDist){ bestDist=d; best={name,hex:cssHex,dist:d}; }
    }
    return best;
  },[hex]);
  const top5 = useMemo(()=>{
    if(!hexValid(hex)) return [];
    return CSS_COLORS.map(([name,cssHex])=>({name,hex:cssHex,dist:colorDistance(hex,cssHex)})).sort((a,b)=>a.dist-b.dist).slice(0,5);
  },[hex]);

  return (
    <VStack>
      <ColorInput label="Enter Color" value={hex} onChange={setHex}/>
      {nearest&&(
        <div className="fade-in" style={{display:"flex",gap:16,alignItems:"center",padding:"16px 20px",background:"rgba(236,72,153,0.08)",border:"1px solid rgba(236,72,153,0.2)",borderRadius:12}}>
          <div style={{width:72,height:72,borderRadius:12,background:nearest.hex,border:`1px solid ${C.border}`,flexShrink:0}}/>
          <div>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:700,color:C.text}}>{nearest.name}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:C.muted,marginTop:4}}>{nearest.hex} — ΔE {nearest.dist.toFixed(1)}</div>
            <div style={{marginTop:8,display:"flex",gap:8}}>
              <CopyBtn text={nearest.name} label="Copy Name"/>
              <CopyBtn text={nearest.hex} label="Copy HEX"/>
            </div>
          </div>
        </div>
      )}
      {top5.length>0&&(
        <div>
          <Label>5 Nearest CSS Colors</Label>
          <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:6}}>
            {top5.map(({name,hex:ch,dist},i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 12px",background:"rgba(255,255,255,0.02)",borderRadius:8}}>
                <div style={{width:28,height:28,borderRadius:6,background:ch,border:`1px solid ${C.border}`,flexShrink:0}}/>
                <span style={{flex:1,fontSize:13,color:C.text}}>{name}</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:C.muted}}>{ch}</span>
                <span style={{fontSize:11,color:C.muted}}>ΔE {dist.toFixed(1)}</span>
                <CopyBtn text={ch} label=""/>
              </div>
            ))}
          </div>
        </div>
      )}
    </VStack>
  );
}

function CssColorNames() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const filtered = useMemo(()=>{
    let list = [...CSS_COLORS];
    if(search) list = list.filter(([n,h])=>n.includes(search.toLowerCase())||h.toLowerCase().includes(search.toLowerCase()));
    if(sortBy==="hue") list.sort((a,b)=>{ const ha=rgbToHsl(...Object.values(hexToRgb(a[1])||{r:0,g:0,b:0})); const hb=rgbToHsl(...Object.values(hexToRgb(b[1])||{r:0,g:0,b:0})); return ha[0]-hb[0]; });
    else if(sortBy==="light") list.sort((a,b)=>{ const la=rgbToHsl(...Object.values(hexToRgb(a[1])||{r:0,g:0,b:0}))[2]; const lb=rgbToHsl(...Object.values(hexToRgb(b[1])||{r:0,g:0,b:0}))[2]; return lb-la; });
    return list;
  },[search,sortBy]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Search</Label><Input value={search} onChange={setSearch} placeholder="Search name or hex…"/></div>
        <div><Label>Sort By</Label><SelectInput value={sortBy} onChange={setSortBy} options={[{value:"name",label:"Name (A→Z)"},{value:"hue",label:"Hue"},{value:"light",label:"Lightness"}]}/></div>
      </Grid2>
      <div style={{fontSize:12,color:C.muted}}>{filtered.length} colors</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8,maxHeight:500,overflowY:"auto"}}>
        {filtered.map(([name,ch])=>(
          <div key={name} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"rgba(255,255,255,0.02)",borderRadius:8,cursor:"pointer",border:`1px solid ${C.border}`}}
            onClick={()=>navigator.clipboard.writeText(ch)} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(168,85,247,0.4)"} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <div style={{width:24,height:24,borderRadius:4,background:ch,flexShrink:0}}/>
            <div style={{overflow:"hidden"}}>
              <div style={{fontSize:11,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</div>
              <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:C.muted}}>{ch}</div>
            </div>
          </div>
        ))}
      </div>
    </VStack>
  );
}

function TailwindColors() {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState("");

  const copy = (val)=>{ navigator.clipboard.writeText(val); setCopied(val); setTimeout(()=>setCopied(""),1800); };

  const families = Object.entries(TAILWIND).filter(([name])=>!search||name.toLowerCase().includes(search.toLowerCase()));

  return (
    <VStack>
      <div><Label>Search Color Family</Label><Input value={search} onChange={setSearch} placeholder="e.g. blue, pink, emerald…"/></div>
      <VStack gap={16}>
        {families.map(([name,shades])=>(
          <div key={name}>
            <div style={{marginBottom:8,fontSize:13,fontWeight:600,color:C.text,textTransform:"capitalize"}}>{name}</div>
            <div style={{display:"flex",gap:0,borderRadius:10,overflow:"hidden",height:48,border:`1px solid ${C.border}`}}>
              {shades.map((shade,i)=>(
                <div key={i} style={{flex:1,background:shade,cursor:"pointer",display:"flex",alignItems:"flex-end",justifyContent:"center",paddingBottom:2,transition:"transform .1s"}}
                  onClick={()=>copy(shade)}
                  onMouseEnter={e=>e.currentTarget.style.transform="scaleY(1.08)"} onMouseLeave={e=>e.currentTarget.style.transform=""}
                  title={`${name}-${TW_SHADES[i]}: ${shade}`}>
                  {copied===shade&&<span style={{fontSize:7,color:getLuminance(shade)>0.3?"#000":"#fff",fontWeight:700}}>✓</span>}
                </div>
              ))}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
              {TW_SHADES.map((s,i)=><span key={s} style={{flex:1,textAlign:"center",fontSize:9,color:C.muted}}>{s}</span>)}
            </div>
          </div>
        ))}
      </VStack>
    </VStack>
  );
}

function ColorDistance() {
  const [c1, setC1] = useState("#EC4899");
  const [c2, setC2] = useState("#06B6D4");
  const dist = hexValid(c1)&&hexValid(c2) ? colorDistance(c1,c2) : 0;
  const rgb1=hexToRgb(hexValid(c1)?c1:"#000")||{r:0,g:0,b:0};
  const rgb2=hexToRgb(hexValid(c2)?c2:"#000")||{r:0,g:0,b:0};
  const lab1=rgbToLab(rgb1.r,rgb1.g,rgb1.b);
  const lab2=rgbToLab(rgb2.r,rgb2.g,rgb2.b);
  const perception = dist<5?"Imperceptible":dist<10?"Just noticeable":dist<25?"Noticeable":dist<50?"Large difference":"Very different";
  const pColor = dist<10?C.green:dist<25?C.amber:C.danger;

  return (
    <VStack>
      <Grid2>
        <ColorInput label="Color A" value={c1} onChange={setC1}/>
        <ColorInput label="Color B" value={c2} onChange={setC2}/>
      </Grid2>
      <div style={{display:"flex",gap:0,height:80,borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
        <div style={{flex:1,background:hexValid(c1)?c1:"#000"}}/>
        <div style={{width:4,background:C.border}}/>
        <div style={{flex:1,background:hexValid(c2)?c2:"#000"}}/>
      </div>
      <div style={{textAlign:"center",padding:"20px 24px",background:pColor+"15",border:`1px solid ${pColor}40`,borderRadius:12}}>
        <div style={{fontFamily:"'Sora',sans-serif",fontSize:44,fontWeight:800,color:pColor}}>{dist.toFixed(2)}</div>
        <div style={{fontSize:13,color:C.muted,marginTop:4}}>CIELAB ΔE Color Distance</div>
        <div style={{marginTop:8}}><Badge color={dist<10?"green":dist<25?"amber":"red"}>{perception}</Badge></div>
      </div>
      <Card>
        <Label>LAB Values</Label>
        <Grid2 gap={10} style={{marginTop:8}}>
          {[["Color A",lab1,c1],["Color B",lab2,c2]].map(([lbl,lab,col])=>(
            <div key={lbl} style={{padding:"10px 14px",background:"rgba(255,255,255,0.02)",borderRadius:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <div style={{width:16,height:16,borderRadius:3,background:col}}/>
                <span style={{fontSize:12,fontWeight:600,color:C.text}}>{lbl}</span>
              </div>
              {[["L*",lab.l],["a*",lab.a],["b*",lab.b2]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.muted}}>{k}</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:C.text}}>{v}</span></div>)}
            </div>
          ))}
        </Grid2>
      </Card>
    </VStack>
  );
}

function ColorTemperature() {
  const [kelvin, setKelvin] = useState(5500);
  const kelvinToHex = k => {
    let r,g,b;
    const t=k/100;
    if(t<=66){ r=255; g=Math.min(255,Math.max(0,Math.round(99.4708025861*Math.log(t)-161.1195681661))); }
    else { r=Math.min(255,Math.max(0,Math.round(329.698727446*Math.pow(t-60,-0.1332047592)))); g=Math.min(255,Math.max(0,Math.round(288.1221695283*Math.pow(t-60,-0.0755148492)))); }
    if(t>=66) b=255;
    else if(t<=19) b=0;
    else b=Math.min(255,Math.max(0,Math.round(138.5177312231*Math.log(t-10)-305.0447927307)));
    return rgbToHex(r,g||0,b||0);
  };

  const tempHex = kelvinToHex(kelvin);
  const tempDesc = kelvin<2000?"Candlelight":kelvin<3000?"Warm incandescent":kelvin<4000?"Halogen":kelvin<5000?"Fluorescent":kelvin<6000?"Daylight":kelvin<7000?"Overcast sky":"Clear blue sky";

  const temps = [1000,1500,2000,2700,3000,4000,5000,5500,6500,7500,10000];

  return (
    <VStack>
      <Slider label="Color Temperature (Kelvin)" value={kelvin} onChange={setKelvin} min={1000} max={12000} step={100} unit="K"/>
      <div style={{height:100,borderRadius:12,background:tempHex,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:4}}>
        <span style={{fontSize:24,fontWeight:800,fontFamily:"'Sora',sans-serif",color:getLuminance(tempHex)>0.3?"#000":"#fff"}}>{kelvin}K</span>
        <span style={{fontSize:13,color:getLuminance(tempHex)>0.3?"rgba(0,0,0,0.6)":"rgba(255,255,255,0.7)"}}>{tempDesc}</span>
      </div>
      <div>
        <Label>Temperature Reference Scale</Label>
        <div style={{display:"flex",height:48,borderRadius:10,overflow:"hidden",marginTop:6,border:`1px solid ${C.border}`}}>
          {temps.map(t=>(
            <div key={t} style={{flex:1,background:kelvinToHex(t),cursor:"pointer",display:"flex",alignItems:"flex-end",justifyContent:"center",paddingBottom:3}} onClick={()=>setKelvin(t)} title={`${t}K`}>
              <span style={{fontSize:7,color:"rgba(0,0,0,0.5)"}}>{t>999?Math.round(t/1000)+"k":t}</span>
            </div>
          ))}
        </div>
      </div>
      <Card>
        <StatRow label="Kelvin" value={`${kelvin}K`}/>
        <StatRow label="Description" value={tempDesc} mono={false}/>
        <StatRow label="HEX" value={tempHex} accent={C.pink}/>
        <StatRow label="RGB" value={(()=>{const {r,g,b}=hexToRgb(tempHex)||{r:0,g:0,b:0};return `rgb(${r}, ${g}, ${b})`;})()}/>
      </Card>
    </VStack>
  );
}

function HexRgba() {
  const [hex, setHex] = useState("#EC4899");
  const [alpha, setAlpha] = useState(100);
  const rgb = hexToRgb(hexValid(hex)?hex:"#EC4899")||{r:236,g:72,b:153};
  const a=(alpha/100).toFixed(2);
  const rgba=`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
  const hex8="#"+hex.replace("#","")+(Math.round(alpha/100*255).toString(16).padStart(2,"0")).toUpperCase();
  const alphas=[100,90,80,70,60,50,40,30,20,10,0];

  return (
    <VStack>
      <ColorInput label="HEX Color" value={hex} onChange={setHex}/>
      <Slider label="Alpha / Opacity" value={alpha} onChange={setAlpha} min={0} max={100} unit="%"/>
      <div style={{height:80,borderRadius:10,background:rgba,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",backgroundImage:"linear-gradient(45deg, #aaa 25%, transparent 25%), linear-gradient(-45deg, #aaa 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #aaa 75%), linear-gradient(-45deg, transparent 75%, #aaa 75%)",backgroundSize:"16px 16px",backgroundPosition:"0 0, 0 8px, 8px -8px, -8px 0px"}}/>
      <Card>
        <StatRow label="rgba()" value={rgba} accent={C.pink}/>
        <StatRow label="8-digit HEX" value={hex8}/>
        <StatRow label="CSS hsla()" value={(()=>{const [hv,sv,lv]=rgbToHsl(rgb.r,rgb.g,rgb.b);return `hsla(${hv}, ${sv}%, ${lv}%, ${a})`;})()}/>
        <StatRow label="Alpha value (0–255)" value={Math.round(alpha/100*255)}/>
      </Card>
      <div>
        <Label>Quick Alpha Values</Label>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
          {alphas.map(a2=>(
            <button key={a2} onClick={()=>setAlpha(a2)} style={{padding:"5px 12px",background:alpha===a2?"rgba(236,72,153,0.2)":"rgba(255,255,255,0.03)",border:`1px solid ${alpha===a2?"rgba(236,72,153,0.5)":C.border}`,borderRadius:6,color:alpha===a2?C.pink:C.muted,fontSize:12,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              {a2}%
            </button>
          ))}
        </div>
      </div>
    </VStack>
  );
}

function ColorSorter() {
  const [input, setInput] = useState("#EC4899\n#06B6D4\n#10B981\n#F59E0B\n#8B5CF6\n#EF4444\n#3B82F6\n#FFFFFF\n#000000");
  const [sortBy, setSortBy] = useState("hue");
  const [output, setOutput] = useState([]);

  const sort = useCallback(()=>{
    const colors = input.split(/[\n,\s]+/).map(c=>c.trim()).filter(c=>hexValid(c)||hexValid("#"+c)).map(c=>hexValid(c)?c:"#"+c);
    const withProps = colors.map(c=>{const {r,g,b}=hexToRgb(c)||{r:0,g:0,b:0};const [h,s,l]=rgbToHsl(r,g,b);return{c,h,s,l};});
    if(sortBy==="hue") withProps.sort((a,b)=>a.h-b.h);
    else if(sortBy==="sat") withProps.sort((a,b)=>b.s-a.s);
    else if(sortBy==="light") withProps.sort((a,b)=>b.l-a.l);
    else if(sortBy==="dark") withProps.sort((a,b)=>a.l-b.l);
    setOutput(withProps.map(x=>x.c));
  },[input,sortBy]);

  useEffect(()=>sort(),[sortBy,input]);

  return (
    <VStack>
      <div><Label>Colors (one per line or comma-separated)</Label><textarea value={input} onChange={e=>setInput(e.target.value)} rows={8} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px",color:C.text,fontSize:12,fontFamily:"'JetBrains Mono',monospace",outline:"none"}} onFocus={e=>e.target.style.borderColor=C.pink} onBlur={e=>e.target.style.borderColor=C.border}/></div>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <Label>Sort by:</Label>
        {[["hue","Hue"],["sat","Saturation"],["light","Lightness ↑"],["dark","Lightness ↓"]].map(([v,l])=>(
          <Btn key={v} size="sm" variant={sortBy===v?"primary":"secondary"} onClick={()=>setSortBy(v)}>{l}</Btn>
        ))}
      </div>
      {output.length>0&&(
        <>
          <div style={{display:"flex",height:60,borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
            {output.map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {output.map((c,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:6,cursor:"pointer"}} onClick={()=>navigator.clipboard.writeText(c)}>
                <div style={{width:16,height:16,borderRadius:3,background:c}}/>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:C.text}}>{c}</span>
              </div>
            ))}
          </div>
          <CopyBtn text={output.join("\n")} label="Copy Sorted List"/>
        </>
      )}
    </VStack>
  );
}

function ColorScheme() {
  const [primary, setPrimary] = useState("#EC4899");
  const scheme = useMemo(()=>{
    if(!hexValid(primary)) return null;
    const {r,g,b}=hexToRgb(primary);
    const [h,s,l]=rgbToHsl(r,g,b);
    return {
      primary,
      primaryLight: hslToHex(h,s,Math.min(90,l+20)),
      primaryDark:  hslToHex(h,s,Math.max(10,l-20)),
      secondary:    hslToHex((h+120)%360,s,l),
      accent:       hslToHex((h+240)%360,s,l),
      neutral:      hslToHex(h,10,50),
      bg:           hslToHex(h,20,8),
      surface:      hslToHex(h,15,12),
      textPrimary:  hslToHex(h,15,95),
      textMuted:    hslToHex(h,10,60),
      success:      "#10B981",
      warning:      "#F59E0B",
      danger:       "#EF4444",
    };
  },[primary]);

  const roles=[
    ["primary","Primary"],["primaryLight","Primary Light"],["primaryDark","Primary Dark"],
    ["secondary","Secondary"],["accent","Accent"],["neutral","Neutral"],
    ["bg","Background"],["surface","Surface"],["textPrimary","Text Primary"],["textMuted","Text Muted"],
    ["success","Success"],["warning","Warning"],["danger","Danger"],
  ];

  const css = scheme ? `:root {\n${roles.map(([k,l])=>`  --color-${k.replace(/([A-Z])/g,"-$1").toLowerCase()}: ${scheme[k]};`).join("\n")}\n}` : "";

  return (
    <VStack>
      <ColorInput label="Primary Brand Color" value={primary} onChange={setPrimary}/>
      {scheme&&(
        <>
          <div style={{height:60,display:"flex",borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
            {roles.slice(0,7).map(([k,l])=><div key={k} style={{flex:1,background:scheme[k]}} title={`${l}: ${scheme[k]}`}/>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>
            {roles.map(([k,l])=>(
              <div key={k} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:"rgba(255,255,255,0.02)",border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer"}} onClick={()=>navigator.clipboard.writeText(scheme[k])}>
                <div style={{width:28,height:28,borderRadius:6,background:scheme[k],border:`1px solid ${C.border}`,flexShrink:0}}/>
                <div><div style={{fontSize:11,color:C.muted}}>{l}</div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:C.text}}>{scheme[k]}</div></div>
              </div>
            ))}
          </div>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><Label>CSS Custom Properties</Label><CopyBtn text={css}/></div>
            <div style={{background:"rgba(0,0,0,0.4)",borderRadius:10,padding:"14px 16px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:C.text,lineHeight:1.8,whiteSpace:"pre"}}>{css}</div>
          </div>
        </>
      )}
    </VStack>
  );
}

// ─── COMPONENT MAP ────────────────────────────────────────────────────────────
const TOOL_COMPONENTS = {
  "color-picker":      ColorPicker,
  "color-converter":   ColorConverter,
  "color-contrast":    ColorContrast,
  "wcag-checker":      WcagChecker,
  "color-mixer":       ColorMixer,
  "color-shades":      ColorShades,
  "color-gradient":    ColorGradient,
  "color-harmonies":   ColorHarmonies,
  "color-palette":     ColorPalette,
  "color-opacity":     ColorOpacity,
  "image-colors":      ImageColors,
  "color-blindness":   ColorBlindness,
  "color-name":        ColorName,
  "css-color-names":   CssColorNames,
  "tailwind-colors":   TailwindColors,
  "color-distance":    ColorDistance,
  "color-temperature": ColorTemperature,
  "hex-rgba":          HexRgba,
  "color-sorter":      ColorSorter,
  "color-scheme":      ColorScheme,
};

// ─── PAGE SHELLS ──────────────────────────────────────────────────────────────
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
          { "@type": "ListItem", "position": 2, "name": "Color Tools", "item": "https://toolsrift.com/colors" },
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
              <h3 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:13,fontWeight:600,margin:0}}>{q}</h3><span style={{color:C.muted}}>+</span>
            </summary>
            <div style={{padding:"0 16px 14px",fontSize:13,color:C.muted,lineHeight:1.7}}>{a}</div>
          </details>
        ))}
      </VStack>
      <script type="application/ld+json">{JSON.stringify({
        "@context":"https://schema.org",
        "@type":"FAQPage",
        "mainEntity":faqs.map(([q,a])=>({
          "@type":"Question",
          "name":q,
          "acceptedAnswer":{"@type":"Answer","text":a}
        }))
      })}</script>
    </section>
  );
}

function RelatedTools({ currentId }) {
  const current=TOOLS.find(t=>t.id===currentId);
  const related=TOOLS.filter(t=>t.id!==currentId&&t.cat===current?.cat).slice(0,4);
  if(!related.length) return null;
  return (
    <section style={{marginTop:32}}>
      <h2 style={{...T.h2,marginBottom:14}}>Related Color Tools</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
        {related.map(t=>(
          <a key={t.id} href={`#/tool/${t.id}`} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(255,255,255,0.02)",border:`1px solid ${C.border}`,borderRadius:8,textDecoration:"none",transition:"border-color .15s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(168,85,247,0.4)"} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
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
  useEffect(()=>{document.title=meta?.title||`${tool?.name} – Free Color Tool | ToolsRift`;},[toolId,tool,meta]);
  if(!tool||!ToolComp) return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId||'unknown'}>
      <div style={{padding:'48px 20px',textAlign:'center',color:C.muted}}>
        Tool not found. <a href="#/" style={{color:PAGE_THEME.color}}>← Back to {PAGE_THEME.name}</a>
      </div>
    </CategoryLayout>
  );
  const toolData={
    id: tool.id,
    name: tool.name,
    icon: tool.icon,
    description: meta?.desc || tool.desc,
    howTo: meta?.howTo,
    faq: meta?.faq,
  };
  const related = TOOLS.filter(t=>t.id!==tool.id && t.cat===tool.cat).slice(0,8);
  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId}>
      <ToolPageLayout theme={PAGE_THEME} tool={toolData} related={related}>
        <ToolComp/>
      </ToolPageLayout>
    </CategoryLayout>
  );
}

function CategoryPage({ catId }) {
  const cat=CATEGORIES.find(c=>c.id===catId);
  const tools=TOOLS.filter(t=>t.cat===catId);
  useEffect(()=>{document.title=`${cat?.name} – Free Color Tools | ToolsRift`;},[catId]);
  if(!cat) return <div style={{padding:40,textAlign:"center",color:C.muted}}>Not found. <a href="#/" style={{color:C.pink}}>← Home</a></div>;
  return (
    <div style={{maxWidth:960,margin:"0 auto",padding:"24px 20px 60px"}}>
      <nav style={{fontSize:12,color:C.muted,marginBottom:20}}><a href="#/" style={{color:C.muted,textDecoration:"none"}}>🏠 ToolsRift</a> › <span style={{color:C.text}}>{cat.name}</span></nav>
      <h1 style={{...T.h1,marginBottom:6}}>{cat.icon} {cat.name}</h1>
      <p style={{fontSize:14,color:C.muted,marginBottom:28}}>{cat.desc} — {tools.length} free tools</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
        {tools.map(t=>(
          <a key={t.id} href={`#/tool/${t.id}`} style={{display:"flex",gap:12,padding:"14px 16px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,textDecoration:"none",alignItems:"flex-start",transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(168,85,247,0.4)";e.currentTarget.style.transform="translateY(-1px)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="";}}>
            <span style={{fontSize:24,marginTop:2}}>{t.icon}</span>
            <div><div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:3}}>{t.name}</div><div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>{t.desc}</div></div>
          </a>
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  useEffect(()=>{document.title="Free Color Tools Online – Picker, Converter, Palettes | ToolsRift";},[]);
  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search color tools..."
      />
    </CategoryLayout>
  );
}

function SiteFooter({currentPage}){
  const pages=[
    {href:"/business",icon:"💼",label:"Business"},
    {href:"/text",icon:"✍️",label:"Text Tools"},
    {href:"/json",icon:"🧑‍💻",label:"Dev Tools"},
    {href:"/encoders",icon:"🔐",label:"Encoders"},
    {href:"/colors",icon:"🎨",label:"Color Tools"},
    {href:"/units",icon:"📏",label:"Unit Converters"},
    {href:"/hash",icon:"🔒",label:"Hash & Crypto"},
    {href:"/css",icon:"✨",label:"CSS Tools"},
    {href:"/images",icon:"🖼️",label:"Image Tools"},
    {href:"/pdf",icon:"📄",label:"PDF Tools"},
    {href:"/html",icon:"🌐",label:"HTML Tools"},
    {href:"/formatters",icon:"🧹",label:"Formatters"},
    {href:"/fancy",icon:"✨",label:"Fancy Text"},
    {href:"/encoding",icon:"🔠",label:"Encoding"},
    {href:"/generators",icon:"⚡",label:"Generators"},
    {href:"/generators2",icon:"✍️",label:"Content Gen"},
    {href:"/devgen",icon:"⚙️",label:"Dev Config"},
    {href:"/mathcalc",icon:"📐",label:"Math Calc"},
    {href:"/financecalc",icon:"💰",label:"Finance Calc"},
    {href:"/devtools",icon:"🛠️",label:"Dev Tools"},
    {href:"/js",icon:"📜",label:"JS Tools"},
    {href:"/converters2",icon:"🔄",label:"More Converters"},
    {href:"/about",icon:"ℹ️",label:"About"},
    {href:"/privacy-policy",icon:"🔏",label:"Privacy Policy"},
  ].filter(p=>!p.href.endsWith("/"+currentPage));
  return(
    <div style={{maxWidth:860,margin:"0 auto",padding:"32px 20px 28px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <span style={{fontSize:11,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em"}}>Explore More Tools</span>
        <a href="/" style={{fontSize:12,color:"#3B82F6",textDecoration:"none",fontWeight:600}}>← Back to Home</a>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
        {pages.map(p=>(
          <a key={p.href} href={p.href} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 13px",borderRadius:8,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",fontSize:12,fontWeight:500,color:"#64748B",textDecoration:"none"}}
            onMouseEnter={e=>{e.currentTarget.style.color="#E2E8F0";e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";e.currentTarget.style.background="rgba(255,255,255,0.06)";}}
            onMouseLeave={e=>{e.currentTarget.style.color="#64748B";e.currentTarget.style.borderColor="rgba(255,255,255,0.06)";e.currentTarget.style.background="rgba(255,255,255,0.03)";}}>
            <span>{p.icon}</span>{p.label}
          </a>
        ))}
      </div>
      <div style={{textAlign:"center",fontSize:11,color:"#334155"}}>© 2026 ToolsRift · Free online tools · No signup required</div>
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [isDark] = useState(true);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 24px",height:56,borderBottom:`1px solid ${scrolled?"rgba(168,85,247,0.2)":C.border}`,position:"sticky",top:0,background:`rgba(6,9,15,${scrolled?0.97:0.85})`,backdropFilter:"blur(12px)",zIndex:100,transition:"background 0.2s,border-color 0.2s"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{width:8,height:8,borderRadius:"50%",background:C.pink,boxShadow:`0 0 6px ${C.pink}80`,flexShrink:0}}/>
        <a href="https://toolsrift.com" style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:C.text,textDecoration:"none",letterSpacing:"-0.01em"}}>ToolsRift</a>
        <span style={{color:"rgba(255,255,255,0.2)",fontSize:14}}>›</span>
        <a href="#/" style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:13,fontWeight:500,color:C.pink,textDecoration:"none"}}>{THEME?.name||"Color Tools"}</a>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <div className="tr-nav-cats">
          {CATEGORIES.map(c=>(
            <a key={c.id} href={`#/category/${c.id}`} title={c.name} style={{padding:"5px 8px",borderRadius:6,fontSize:18,color:C.muted,textDecoration:"none",transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.color=C.text;e.currentTarget.style.background="rgba(255,255,255,0.04)";}} onMouseLeave={e=>{e.currentTarget.style.color=C.muted;e.currentTarget.style.background="transparent";}}>
              {c.icon}
            </a>
          ))}
        </div>
        <span className="tr-nav-badge" style={{background:"rgba(168,85,247,0.12)",color:C.pink,fontSize:11,fontWeight:700,fontFamily:"'Plus Jakarta Sans',sans-serif",padding:"3px 10px",borderRadius:20,letterSpacing:"0.02em",border:"1px solid rgba(168,85,247,0.25)"}}>{TOOLS.length} tools</span>
        {/* PHASE 2: <UsageCounter/> */}
        <a href="/" style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600,color:"#E2E8F0",textDecoration:"none",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)"}}>🏠 Home</a>
      </div>
    </nav>
  );
}

function ToolsRiftColors() {
  const route=useAppRouter();
  const showChrome = route.page !== 'home' && route.page !== 'tool';
  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{GLOBAL_CSS}</style>
      {showChrome && <Nav/>}
      {route.page==="home"&&<HomePage/>}
      {route.page==="tool"&&<ToolPage toolId={route.toolId}/>}
      {route.page==="category"&&<CategoryPage catId={route.catId}/>}
      {showChrome && <SiteFooter currentPage="colors"/>}
    </div>
  );
}

export default ToolsRiftColors;
