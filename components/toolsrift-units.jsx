import { useState, useEffect, useCallback, useMemo } from "react";
import { getCategoryById } from '../lib/categoryThemes';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolPageLayout, { ToolSchemas } from './shared/ToolPageLayout';
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';

const PAGE_THEME = getCategoryById('units');

// ─── TOKENS ───────────────────────────────────────────────────────────────────
const C = {
  bg:"#06090F", surface:"#0D1117", border:"rgba(255,255,255,0.06)",
  violet:"#06B6D4", violetL:"#0891B2", text:"#E2E8F0", muted:"#64748B",
  blue:"#3B82F6", green:"#10B981", amber:"#F59E0B", danger:"#EF4444",
  cyan:"#06B6D4", pink:"#EC4899",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:6px;height:6px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
  ::selection{background:rgba(6,182,212,0.3)}
  button:hover{filter:brightness(1.1)}
  select option{background:#0D1117}
  input[type=range]{accent-color:#06B6D4;width:100%}
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

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Badge({ children, color="violet" }) {
  const bg={violet:"rgba(124,58,237,0.15)",blue:"rgba(59,130,246,0.15)",green:"rgba(16,185,129,0.15)",amber:"rgba(245,158,11,0.15)",cyan:"rgba(6,182,212,0.15)",pink:"rgba(236,72,153,0.15)"};
  const fg={violet:"#A78BFA",blue:"#60A5FA",green:"#34D399",amber:"#FCD34D",cyan:"#22D3EE",pink:"#F472B6"};
  return <span style={{background:bg[color]||bg.violet,color:fg[color]||fg.violet,borderRadius:4,padding:"2px 8px",fontSize:11,fontWeight:600,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{children}</span>;
}

function Btn({ children, onClick, variant="primary", size="md", disabled, style={} }) {
  const base={display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,border:"none",cursor:disabled?"not-allowed":"pointer",borderRadius:8,fontWeight:600,transition:"all .15s",fontFamily:"'Plus Jakarta Sans',sans-serif",opacity:disabled?0.5:1};
  const sz={sm:{padding:"6px 14px",fontSize:12},md:{padding:"9px 20px",fontSize:13},lg:{padding:"12px 28px",fontSize:14}}[size];
  const v={
    primary:{background:`linear-gradient(135deg,${C.violet},${C.violetL})`,color:"#fff",boxShadow:"0 2px 8px rgba(6,182,212,0.3)"},
    secondary:{background:"rgba(255,255,255,0.05)",color:C.text,border:`1px solid ${C.border}`},
    ghost:{background:"transparent",color:C.muted},
    swap:{background:"rgba(6,182,212,0.15)",color:C.cyan,border:`1px solid rgba(6,182,212,0.3)`},
  }[variant];
  return <button style={{...base,...sz,...v,...style}} onClick={onClick} disabled={disabled}>{children}</button>;
}

function Input({ value, onChange, placeholder, style={}, mono=false, type="text" }) {
  return (
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontSize:14,fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif",outline:"none",...style}}
      onFocus={e=>e.target.style.borderColor=C.cyan} onBlur={e=>e.target.style.borderColor=C.border}/>
  );
}

function SelectInput({ value, onChange, options, style={} }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",cursor:"pointer",...style}}>
      {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
    </select>
  );
}

function Card({ children, style={} }) { return <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20,...style}}>{children}</div>; }
function Label({ children }) { return <div style={{...T.label,marginBottom:6}}>{children}</div>; }

function CopyBtn({ text, style={} }) {
  const [copied,setCopied]=useState(false);
  const copy=()=>{navigator.clipboard.writeText(String(text)).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),1800);});};
  return <Btn variant={copied?"secondary":"ghost"} size="sm" onClick={copy} style={style}>{copied?"✓ Copied":"Copy"}</Btn>;
}

function VStack({ children, gap=12 }) { return <div style={{display:"flex",flexDirection:"column",gap}}>{children}</div>; }
function Grid2({ children, gap=16 }) { return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap}}>{children}</div>; }
function Grid3({ children, gap=12 }) { return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap}}>{children}</div>; }

// ─── CORE CONVERTER COMPONENT ─────────────────────────────────────────────────
// Each converter defines units as {id, label, toBase, fromBase}
// where toBase(value) => base unit, fromBase(base) => this unit
function fmt(n) {
  if(n===null||n===undefined||isNaN(n)) return "";
  if(Math.abs(n)<1e-10&&n!==0) return n.toExponential(4);
  if(Math.abs(n)>=1e12) return n.toExponential(4);
  const abs=Math.abs(n);
  if(abs>=100) return parseFloat(n.toPrecision(8)).toString();
  if(abs>=1)   return parseFloat(n.toPrecision(8)).toString();
  return parseFloat(n.toPrecision(6)).toString();
}

function UnitConverter({ units, defaultFrom, defaultTo, accentColor=C.violet }) {
  const [fromUnit,setFromUnit]=useState(defaultFrom||units[0].id);
  const [toUnit,setToUnit]=useState(defaultTo||units[1].id);
  const [fromVal,setFromVal]=useState("1");
  const [toVal,setToVal]=useState("");

  const from=units.find(u=>u.id===fromUnit);
  const to=units.find(u=>u.id===toUnit);

  useEffect(()=>{
    const n=parseFloat(fromVal);
    if(isNaN(n)||!from||!to){setToVal("");return;}
    const base=from.toBase(n);
    const result=to.fromBase(base);
    setToVal(fmt(result));
  },[fromVal,fromUnit,toUnit]);

  const handleToChange=v=>{
    setToVal(v);
    const n=parseFloat(v);
    if(isNaN(n)||!from||!to){setFromVal("");return;}
    const base=to.toBase(n);
    const result=from.fromBase(base);
    setFromVal(fmt(result));
  };

  const swap=()=>{
    const tmp=fromUnit; setFromUnit(toUnit); setToUnit(tmp);
    const tmpV=fromVal; setFromVal(toVal); setToVal(tmpV);
  };

  const allResults=useMemo(()=>{
    const n=parseFloat(fromVal);
    if(isNaN(n)||!from) return [];
    const base=from.toBase(n);
    return units.filter(u=>u.id!==fromUnit).map(u=>({...u,result:fmt(u.fromBase(base))}));
  },[fromVal,fromUnit,units]);

  return (
    <VStack>
      {/* Main converter — two large boxes with swap */}
      <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:16,alignItems:"center"}}>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <span style={{fontSize:12,color:C.muted,fontWeight:600,fontFamily:"'Plus Jakarta Sans',sans-serif",textTransform:"uppercase",letterSpacing:"0.05em"}}>From</span>
          <input type="number" value={fromVal} onChange={e=>setFromVal(e.target.value)}
            style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px",color:C.cyan,fontSize:28,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,outline:"none",textAlign:"center"}}
            onFocus={e=>e.target.style.borderColor=C.cyan} onBlur={e=>e.target.style.borderColor=C.border}/>
          <SelectInput value={fromUnit} onChange={setFromUnit} options={units.map(u=>({value:u.id,label:u.label}))}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
          <button onClick={swap} style={{width:44,height:44,borderRadius:"50%",background:"rgba(6,182,212,0.15)",border:"1px solid rgba(6,182,212,0.3)",color:C.cyan,fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.3s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="rotate(180deg)"} onMouseLeave={e=>e.currentTarget.style.transform="rotate(0deg)"}>⇄</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <span style={{fontSize:12,color:C.muted,fontWeight:600,fontFamily:"'Plus Jakarta Sans',sans-serif",textTransform:"uppercase",letterSpacing:"0.05em"}}>To</span>
          <input type="number" value={toVal} onChange={e=>handleToChange(e.target.value)}
            style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px",color:C.text,fontSize:28,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,outline:"none",textAlign:"center"}}
            onFocus={e=>e.target.style.borderColor=C.cyan} onBlur={e=>e.target.style.borderColor=C.border}/>
          <SelectInput value={toUnit} onChange={setToUnit} options={units.map(u=>({value:u.id,label:u.label}))}/>
        </div>
      </div>

      {/* Result highlight */}
      {toVal&&(
        <div style={{padding:"16px 20px",background:`rgba(6,182,212,0.08)`,border:`1px solid rgba(6,182,212,0.25)`,borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center"}} className="fade-in">
          <div>
            <span style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:700,color:C.cyan}}>{toVal}</span>
            <span style={{marginLeft:8,fontSize:14,color:C.muted}}>{to?.label}</span>
          </div>
          <CopyBtn text={toVal}/>
        </div>
      )}

      {/* All conversions table — alternating rows, active unit highlighted */}
      {allResults.length>0&&(
        <Card>
          <Label>All Conversions from {fromVal} {from?.label}</Label>
          <div style={{display:"flex",flexDirection:"column",marginTop:8,borderRadius:8,overflow:"hidden"}}>
            {allResults.map((u,idx)=>{
              const isActive=u.id===toUnit;
              return(
              <div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",background:isActive?"rgba(6,182,212,0.08)":idx%2===0?"#0F172A":"#1a2234",borderLeft:isActive?"3px solid #06B6D4":"3px solid transparent"}}>
                <span style={{fontSize:13,color:isActive?C.cyan:C.muted,minWidth:180,fontWeight:isActive?600:400}}>{u.label}</span>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:isActive?C.cyan:C.text,fontWeight:600}}>{u.result}</span>
                  <CopyBtn text={u.result}/>
                </div>
              </div>
              );
            })}
          </div>
        </Card>
      )}
    </VStack>
  );
}

// ─── ROUTER ───────────────────────────────────────────────────────────────────
function useAppRouter() {
  const parse=()=>{const h=window.location.hash||"#/";const path=h.replace(/^#/,"")||"/";const parts=path.split("/").filter(Boolean);if(!parts.length)return{page:"home"};if(parts[0]==="tool"&&parts[1])return{page:"tool",toolId:parts[1]};if(parts[0]==="category"&&parts[1])return{page:"home"};return{page:"home"};};
  const[route,setRoute]=useState(parse);
  useEffect(()=>{const fn=()=>setRoute(parse());window.addEventListener("hashchange",fn);return()=>window.removeEventListener("hashchange",fn);},[]);
  useEffect(()=>{const fn=e=>{const a=e.target.closest("a[href]");if(!a)return;const h=a.getAttribute("href");if(h&&h.startsWith("#/")){e.preventDefault();window.location.hash=h;}};document.addEventListener("click",fn);return()=>document.removeEventListener("click",fn);},[]);
  return route;
}

// ─── UNIT DEFINITIONS ─────────────────────────────────────────────────────────
const UNITS = {

  length:[
    {id:"km",    label:"Kilometer (km)",       toBase:v=>v*1000,         fromBase:b=>b/1000},
    {id:"m",     label:"Meter (m)",             toBase:v=>v,              fromBase:b=>b},
    {id:"cm",    label:"Centimeter (cm)",       toBase:v=>v/100,          fromBase:b=>b*100},
    {id:"mm",    label:"Millimeter (mm)",       toBase:v=>v/1000,         fromBase:b=>b*1000},
    {id:"um",    label:"Micrometer (μm)",       toBase:v=>v/1e6,          fromBase:b=>b*1e6},
    {id:"nm",    label:"Nanometer (nm)",        toBase:v=>v/1e9,          fromBase:b=>b*1e9},
    {id:"mi",    label:"Mile (mi)",             toBase:v=>v*1609.344,     fromBase:b=>b/1609.344},
    {id:"yd",    label:"Yard (yd)",             toBase:v=>v*0.9144,       fromBase:b=>b/0.9144},
    {id:"ft",    label:"Foot (ft)",             toBase:v=>v*0.3048,       fromBase:b=>b/0.3048},
    {id:"in",    label:"Inch (in)",             toBase:v=>v*0.0254,       fromBase:b=>b/0.0254},
    {id:"nmi",   label:"Nautical Mile (nmi)",   toBase:v=>v*1852,         fromBase:b=>b/1852},
    {id:"ly",    label:"Light Year (ly)",       toBase:v=>v*9.461e15,     fromBase:b=>b/9.461e15},
    {id:"au",    label:"Astronomical Unit (AU)",toBase:v=>v*1.496e11,     fromBase:b=>b/1.496e11},
  ],

  weight:[
    {id:"t",     label:"Metric Ton (t)",        toBase:v=>v*1e6,          fromBase:b=>b/1e6},
    {id:"kg",    label:"Kilogram (kg)",          toBase:v=>v*1000,         fromBase:b=>b/1000},
    {id:"g",     label:"Gram (g)",               toBase:v=>v,              fromBase:b=>b},
    {id:"mg",    label:"Milligram (mg)",         toBase:v=>v/1000,         fromBase:b=>b*1000},
    {id:"ug",    label:"Microgram (μg)",         toBase:v=>v/1e6,          fromBase:b=>b*1e6},
    {id:"lb",    label:"Pound (lb)",             toBase:v=>v*453.592,      fromBase:b=>b/453.592},
    {id:"oz",    label:"Ounce (oz)",             toBase:v=>v*28.3495,      fromBase:b=>b/28.3495},
    {id:"st",    label:"Stone (st)",             toBase:v=>v*6350.29,      fromBase:b=>b/6350.29},
    {id:"ton",   label:"US Ton (short ton)",     toBase:v=>v*907185,       fromBase:b=>b/907185},
    {id:"tonUK", label:"UK Ton (long ton)",      toBase:v=>v*1016046.9,    fromBase:b=>b/1016046.9},
    {id:"ct",    label:"Carat (ct)",             toBase:v=>v*0.2,          fromBase:b=>b/0.2},
    {id:"gr",    label:"Grain (gr)",             toBase:v=>v*0.0647989,    fromBase:b=>b/0.0647989},
  ],

  temperature:[
    {id:"c",   label:"Celsius (°C)",    toBase:v=>v,                    fromBase:b=>b},
    {id:"f",   label:"Fahrenheit (°F)", toBase:v=>(v-32)*5/9,           fromBase:b=>b*9/5+32},
    {id:"k",   label:"Kelvin (K)",      toBase:v=>v-273.15,             fromBase:b=>b+273.15},
    {id:"r",   label:"Rankine (°R)",    toBase:v=>(v-491.67)*5/9,       fromBase:b=>(b+273.15)*9/5},
    {id:"re",  label:"Réaumur (°Ré)",   toBase:v=>v*5/4,                fromBase:b=>b*4/5},
    {id:"ro",  label:"Rømer (°Rø)",     toBase:v=>(v-7.5)*40/21,        fromBase:b=>b*21/40+7.5},
  ],

  area:[
    {id:"km2",  label:"Square Kilometer (km²)", toBase:v=>v*1e6,         fromBase:b=>b/1e6},
    {id:"m2",   label:"Square Meter (m²)",       toBase:v=>v,             fromBase:b=>b},
    {id:"cm2",  label:"Square Centimeter (cm²)", toBase:v=>v/1e4,         fromBase:b=>b*1e4},
    {id:"mm2",  label:"Square Millimeter (mm²)", toBase:v=>v/1e6,         fromBase:b=>b*1e6},
    {id:"ha",   label:"Hectare (ha)",             toBase:v=>v*1e4,         fromBase:b=>b/1e4},
    {id:"acre", label:"Acre",                     toBase:v=>v*4046.86,     fromBase:b=>b/4046.86},
    {id:"mi2",  label:"Square Mile (mi²)",        toBase:v=>v*2.59e6,      fromBase:b=>b/2.59e6},
    {id:"yd2",  label:"Square Yard (yd²)",        toBase:v=>v*0.836127,    fromBase:b=>b/0.836127},
    {id:"ft2",  label:"Square Foot (ft²)",        toBase:v=>v*0.0929,      fromBase:b=>b/0.0929},
    {id:"in2",  label:"Square Inch (in²)",        toBase:v=>v*0.000645,    fromBase:b=>b/0.000645},
  ],

  volume:[
    {id:"m3",   label:"Cubic Meter (m³)",     toBase:v=>v*1000,         fromBase:b=>b/1000},
    {id:"l",    label:"Liter (L)",             toBase:v=>v,              fromBase:b=>b},
    {id:"ml",   label:"Milliliter (mL)",       toBase:v=>v/1000,         fromBase:b=>b*1000},
    {id:"cl",   label:"Centiliter (cL)",       toBase:v=>v/100,          fromBase:b=>b*100},
    {id:"dl",   label:"Deciliter (dL)",        toBase:v=>v/10,           fromBase:b=>b*10},
    {id:"gal",  label:"US Gallon (gal)",       toBase:v=>v*3.78541,      fromBase:b=>b/3.78541},
    {id:"galUK",label:"UK Gallon (gal)",       toBase:v=>v*4.54609,      fromBase:b=>b/4.54609},
    {id:"qt",   label:"US Quart (qt)",         toBase:v=>v*0.946353,     fromBase:b=>b/0.946353},
    {id:"pt",   label:"US Pint (pt)",          toBase:v=>v*0.473176,     fromBase:b=>b/0.473176},
    {id:"cup",  label:"US Cup",                toBase:v=>v*0.236588,     fromBase:b=>b/0.236588},
    {id:"floz", label:"US Fl Oz (fl oz)",      toBase:v=>v*0.0295735,    fromBase:b=>b/0.0295735},
    {id:"tbsp", label:"Tablespoon (tbsp)",     toBase:v=>v*0.0147868,    fromBase:b=>b/0.0147868},
    {id:"tsp",  label:"Teaspoon (tsp)",        toBase:v=>v*0.00492892,   fromBase:b=>b/0.00492892},
    {id:"in3",  label:"Cubic Inch (in³)",      toBase:v=>v*0.0163871,    fromBase:b=>b/0.0163871},
    {id:"ft3",  label:"Cubic Foot (ft³)",      toBase:v=>v*28.3168,      fromBase:b=>b/28.3168},
  ],

  speed:[
    {id:"mps",  label:"Meters/second (m/s)",   toBase:v=>v,              fromBase:b=>b},
    {id:"kmh",  label:"Kilometers/hour (km/h)",toBase:v=>v/3.6,          fromBase:b=>b*3.6},
    {id:"mph",  label:"Miles/hour (mph)",       toBase:v=>v*0.44704,      fromBase:b=>b/0.44704},
    {id:"kt",   label:"Knot (kt)",              toBase:v=>v*0.514444,     fromBase:b=>b/0.514444},
    {id:"ftps", label:"Feet/second (ft/s)",     toBase:v=>v*0.3048,       fromBase:b=>b/0.3048},
    {id:"mach", label:"Mach (at sea level)",    toBase:v=>v*340.29,       fromBase:b=>b/340.29},
    {id:"c",    label:"Speed of Light (c)",     toBase:v=>v*2.998e8,      fromBase:b=>b/2.998e8},
  ],

  pressure:[
    {id:"pa",   label:"Pascal (Pa)",            toBase:v=>v,              fromBase:b=>b},
    {id:"kpa",  label:"Kilopascal (kPa)",       toBase:v=>v*1000,         fromBase:b=>b/1000},
    {id:"mpa",  label:"Megapascal (MPa)",       toBase:v=>v*1e6,          fromBase:b=>b/1e6},
    {id:"bar",  label:"Bar",                    toBase:v=>v*1e5,          fromBase:b=>b/1e5},
    {id:"mbar", label:"Millibar (mbar)",        toBase:v=>v*100,          fromBase:b=>b/100},
    {id:"atm",  label:"Atmosphere (atm)",       toBase:v=>v*101325,       fromBase:b=>b/101325},
    {id:"psi",  label:"PSI (lbf/in²)",          toBase:v=>v*6894.76,      fromBase:b=>b/6894.76},
    {id:"torr", label:"Torr (mmHg)",            toBase:v=>v*133.322,      fromBase:b=>b/133.322},
    {id:"inHg", label:"Inches of Mercury (inHg)",toBase:v=>v*3386.39,    fromBase:b=>b/3386.39},
    {id:"inhg2",label:"Inches of Water (inH₂O)",toBase:v=>v*249.089,     fromBase:b=>b/249.089},
  ],

  energy:[
    {id:"j",    label:"Joule (J)",              toBase:v=>v,              fromBase:b=>b},
    {id:"kj",   label:"Kilojoule (kJ)",         toBase:v=>v*1000,         fromBase:b=>b/1000},
    {id:"mj",   label:"Megajoule (MJ)",         toBase:v=>v*1e6,          fromBase:b=>b/1e6},
    {id:"cal",  label:"Calorie (cal)",          toBase:v=>v*4.184,        fromBase:b=>b/4.184},
    {id:"kcal", label:"Kilocalorie (kcal)",     toBase:v=>v*4184,         fromBase:b=>b/4184},
    {id:"wh",   label:"Watt-hour (Wh)",         toBase:v=>v*3600,         fromBase:b=>b/3600},
    {id:"kwh",  label:"Kilowatt-hour (kWh)",    toBase:v=>v*3.6e6,        fromBase:b=>b/3.6e6},
    {id:"btu",  label:"BTU",                    toBase:v=>v*1055.06,      fromBase:b=>b/1055.06},
    {id:"ev",   label:"Electronvolt (eV)",      toBase:v=>v*1.602e-19,    fromBase:b=>b/1.602e-19},
    {id:"ftlb", label:"Foot-pound (ft·lb)",     toBase:v=>v*1.35582,      fromBase:b=>b/1.35582},
    {id:"erg",  label:"Erg",                    toBase:v=>v*1e-7,         fromBase:b=>b*1e7},
  ],

  power:[
    {id:"w",    label:"Watt (W)",               toBase:v=>v,              fromBase:b=>b},
    {id:"kw",   label:"Kilowatt (kW)",          toBase:v=>v*1000,         fromBase:b=>b/1000},
    {id:"mw",   label:"Megawatt (MW)",          toBase:v=>v*1e6,          fromBase:b=>b/1e6},
    {id:"gw",   label:"Gigawatt (GW)",          toBase:v=>v*1e9,          fromBase:b=>b/1e9},
    {id:"hp",   label:"Horsepower (hp)",        toBase:v=>v*745.7,        fromBase:b=>b/745.7},
    {id:"hpUK", label:"Horsepower UK (hp)",     toBase:v=>v*746,          fromBase:b=>b/746},
    {id:"btuhr",label:"BTU/hour (BTU/hr)",      toBase:v=>v*0.293071,     fromBase:b=>b/0.293071},
    {id:"calps",label:"Cal/second (cal/s)",     toBase:v=>v*4.184,        fromBase:b=>b/4.184},
    {id:"ftlbs",label:"Ft·lb/second",           toBase:v=>v*1.35582,      fromBase:b=>b/1.35582},
  ],

  digital:[
    {id:"bit",  label:"Bit (b)",                toBase:v=>v,              fromBase:b=>b},
    {id:"byte", label:"Byte (B)",               toBase:v=>v*8,            fromBase:b=>b/8},
    {id:"kb",   label:"Kilobyte (KB)",          toBase:v=>v*8000,         fromBase:b=>b/8000},
    {id:"mb",   label:"Megabyte (MB)",          toBase:v=>v*8e6,          fromBase:b=>b/8e6},
    {id:"gb",   label:"Gigabyte (GB)",          toBase:v=>v*8e9,          fromBase:b=>b/8e9},
    {id:"tb",   label:"Terabyte (TB)",          toBase:v=>v*8e12,         fromBase:b=>b/8e12},
    {id:"pb",   label:"Petabyte (PB)",          toBase:v=>v*8e15,         fromBase:b=>b/8e15},
    {id:"kib",  label:"Kibibyte (KiB)",         toBase:v=>v*8192,         fromBase:b=>b/8192},
    {id:"mib",  label:"Mebibyte (MiB)",         toBase:v=>v*8*1048576,    fromBase:b=>b/(8*1048576)},
    {id:"gib",  label:"Gibibyte (GiB)",         toBase:v=>v*8*1073741824, fromBase:b=>b/(8*1073741824)},
    {id:"kbps", label:"Kilobit/s (Kbps)",       toBase:v=>v*1000,         fromBase:b=>b/1000},
    {id:"mbps", label:"Megabit/s (Mbps)",       toBase:v=>v*1e6,          fromBase:b=>b/1e6},
    {id:"gbps", label:"Gigabit/s (Gbps)",       toBase:v=>v*1e9,          fromBase:b=>b/1e9},
  ],

  time:[
    {id:"ms",   label:"Millisecond (ms)",       toBase:v=>v/1000,         fromBase:b=>b*1000},
    {id:"s",    label:"Second (s)",             toBase:v=>v,              fromBase:b=>b},
    {id:"min",  label:"Minute (min)",           toBase:v=>v*60,           fromBase:b=>b/60},
    {id:"h",    label:"Hour (h)",               toBase:v=>v*3600,         fromBase:b=>b/3600},
    {id:"d",    label:"Day",                    toBase:v=>v*86400,        fromBase:b=>b/86400},
    {id:"wk",   label:"Week",                   toBase:v=>v*604800,       fromBase:b=>b/604800},
    {id:"mo",   label:"Month (30 days)",        toBase:v=>v*2592000,      fromBase:b=>b/2592000},
    {id:"yr",   label:"Year (365 days)",        toBase:v=>v*31536000,     fromBase:b=>b/31536000},
    {id:"dec",  label:"Decade",                 toBase:v=>v*315360000,    fromBase:b=>b/315360000},
    {id:"cent", label:"Century",                toBase:v=>v*3153600000,   fromBase:b=>b/3153600000},
    {id:"us",   label:"Microsecond (μs)",       toBase:v=>v/1e6,          fromBase:b=>b*1e6},
    {id:"ns",   label:"Nanosecond (ns)",        toBase:v=>v/1e9,          fromBase:b=>b*1e9},
  ],

  angle:[
    {id:"deg",  label:"Degree (°)",             toBase:v=>v,              fromBase:b=>b},
    {id:"rad",  label:"Radian (rad)",           toBase:v=>v*(180/Math.PI),fromBase:b=>b*(Math.PI/180)},
    {id:"grad", label:"Gradian (grad)",         toBase:v=>v*0.9,          fromBase:b=>b/0.9},
    {id:"turn", label:"Turn (full rotation)",   toBase:v=>v*360,          fromBase:b=>b/360},
    {id:"arcmin",label:"Arcminute (′)",         toBase:v=>v/60,           fromBase:b=>b*60},
    {id:"arcsec",label:"Arcsecond (″)",         toBase:v=>v/3600,         fromBase:b=>b*3600},
    {id:"mil",  label:"Mil (NATO)",             toBase:v=>v*0.05625,      fromBase:b=>b/0.05625},
  ],

  frequency:[
    {id:"hz",   label:"Hertz (Hz)",             toBase:v=>v,              fromBase:b=>b},
    {id:"khz",  label:"Kilohertz (kHz)",        toBase:v=>v*1000,         fromBase:b=>b/1000},
    {id:"mhz",  label:"Megahertz (MHz)",        toBase:v=>v*1e6,          fromBase:b=>b/1e6},
    {id:"ghz",  label:"Gigahertz (GHz)",        toBase:v=>v*1e9,          fromBase:b=>b/1e9},
    {id:"thz",  label:"Terahertz (THz)",        toBase:v=>v*1e12,         fromBase:b=>b/1e12},
    {id:"rpm",  label:"RPM (rev/min)",          toBase:v=>v/60,           fromBase:b=>b*60},
    {id:"rads", label:"Radian/second (rad/s)",  toBase:v=>v/(2*Math.PI),  fromBase:b=>b*2*Math.PI},
    {id:"bpm",  label:"Beats per Minute (BPM)", toBase:v=>v/60,           fromBase:b=>b*60},
  ],

  fuel:[
    {id:"mpg",   label:"Miles per Gallon (mpg US)",  toBase:v=>v,            fromBase:b=>b},
    {id:"mpgUK", label:"Miles per Gallon (mpg UK)",  toBase:v=>v*1.20095,    fromBase:b=>b/1.20095},
    {id:"kml",   label:"Kilometers per Liter (km/L)",toBase:v=>v*2.35215,    fromBase:b=>b/2.35215},
    {id:"l100",  label:"L/100km (EU standard)",      toBase:v=>235.215/v,    fromBase:b=>235.215/b},
    {id:"mpl",   label:"Miles per Liter (mpl)",      toBase:v=>v*2.35215*0.621371, fromBase:b=>b/(2.35215*0.621371)},
  ],

  torque:[
    {id:"nm",    label:"Newton-meter (N·m)",    toBase:v=>v,              fromBase:b=>b},
    {id:"knm",   label:"Kilonewton-meter (kN·m)",toBase:v=>v*1000,        fromBase:b=>b/1000},
    {id:"lbft",  label:"Pound-foot (lb·ft)",    toBase:v=>v*1.35582,      fromBase:b=>b/1.35582},
    {id:"lbin",  label:"Pound-inch (lb·in)",    toBase:v=>v*0.113,        fromBase:b=>b/0.113},
    {id:"kgm",   label:"Kilogram-meter (kg·m)", toBase:v=>v*9.80665,      fromBase:b=>b/9.80665},
    {id:"ozin",  label:"Ounce-inch (oz·in)",    toBase:v=>v*0.00706,      fromBase:b=>b/0.00706},
    {id:"dyncm", label:"Dyne-centimeter",       toBase:v=>v*1e-7,         fromBase:b=>b*1e7},
  ],

  force:[
    {id:"n",     label:"Newton (N)",            toBase:v=>v,              fromBase:b=>b},
    {id:"kn",    label:"Kilonewton (kN)",       toBase:v=>v*1000,         fromBase:b=>b/1000},
    {id:"mn",    label:"Meganewton (MN)",       toBase:v=>v*1e6,          fromBase:b=>b/1e6},
    {id:"lbf",   label:"Pound-force (lbf)",     toBase:v=>v*4.44822,      fromBase:b=>b/4.44822},
    {id:"kgf",   label:"Kilogram-force (kgf)",  toBase:v=>v*9.80665,      fromBase:b=>b/9.80665},
    {id:"dyn",   label:"Dyne (dyn)",            toBase:v=>v*1e-5,         fromBase:b=>b*1e5},
    {id:"oz",    label:"Ounce-force (ozf)",     toBase:v=>v*0.278014,     fromBase:b=>b/0.278014},
    {id:"pf",    label:"Pond (p)",              toBase:v=>v*0.00980665,   fromBase:b=>b/0.00980665},
  ],

  illuminance:[
    {id:"lx",    label:"Lux (lx)",              toBase:v=>v,              fromBase:b=>b},
    {id:"fc",    label:"Foot-candle (fc)",      toBase:v=>v*10.7639,      fromBase:b=>b/10.7639},
    {id:"phot",  label:"Phot (ph)",             toBase:v=>v*10000,        fromBase:b=>b/10000},
    {id:"nit",   label:"Nit (cd/m²) — approx", toBase:v=>v*3.14159,      fromBase:b=>b/3.14159},
    {id:"klux",  label:"Kilolux (klx)",         toBase:v=>v*1000,         fromBase:b=>b/1000},
  ],

  density:[
    {id:"kgm3",  label:"kg/m³",                 toBase:v=>v,              fromBase:b=>b},
    {id:"gcm3",  label:"g/cm³",                 toBase:v=>v*1000,         fromBase:b=>b/1000},
    {id:"gml",   label:"g/mL",                  toBase:v=>v*1000,         fromBase:b=>b/1000},
    {id:"kgl",   label:"kg/L",                  toBase:v=>v*1000,         fromBase:b=>b/1000},
    {id:"lbft3", label:"lb/ft³",                toBase:v=>v*16.0185,      fromBase:b=>b/16.0185},
    {id:"lbin3", label:"lb/in³",                toBase:v=>v*27679.9,      fromBase:b=>b/27679.9},
    {id:"lbgal", label:"lb/gal (US)",           toBase:v=>v*119.826,      fromBase:b=>b/119.826},
    {id:"ozin3", label:"oz/in³",                toBase:v=>v*1729.99,      fromBase:b=>b/1729.99},
  ],

  flow:[
    {id:"m3s",   label:"m³/s",                  toBase:v=>v,              fromBase:b=>b},
    {id:"m3h",   label:"m³/h",                  toBase:v=>v/3600,         fromBase:b=>b*3600},
    {id:"ls",    label:"L/s",                   toBase:v=>v/1000,         fromBase:b=>b*1000},
    {id:"lmin",  label:"L/min",                 toBase:v=>v/60000,        fromBase:b=>b*60000},
    {id:"lhr",   label:"L/h",                   toBase:v=>v/3600000,      fromBase:b=>b*3600000},
    {id:"gals",  label:"gal/s (US)",            toBase:v=>v*0.00378541,   fromBase:b=>b/0.00378541},
    {id:"galm",  label:"gal/min (US GPM)",      toBase:v=>v*6.30902e-5,   fromBase:b=>b/6.30902e-5},
    {id:"ft3s",  label:"ft³/s (CFS)",           toBase:v=>v*0.0283168,    fromBase:b=>b/0.0283168},
    {id:"ft3m",  label:"ft³/min (CFM)",         toBase:v=>v*0.000471947,  fromBase:b=>b/0.000471947},
  ],

  cooking:[
    {id:"cup",   label:"US Cup",                toBase:v=>v*236.588,      fromBase:b=>b/236.588},
    {id:"tbsp",  label:"Tablespoon (tbsp)",     toBase:v=>v*14.7868,      fromBase:b=>b/14.7868},
    {id:"tsp",   label:"Teaspoon (tsp)",        toBase:v=>v*4.92892,      fromBase:b=>b/4.92892},
    {id:"floz",  label:"Fl Oz (US)",            toBase:v=>v*29.5735,      fromBase:b=>b/29.5735},
    {id:"pt",    label:"Pint (US)",             toBase:v=>v*473.176,      fromBase:b=>b/473.176},
    {id:"qt",    label:"Quart (US)",            toBase:v=>v*946.353,      fromBase:b=>b/946.353},
    {id:"gal",   label:"Gallon (US)",           toBase:v=>v*3785.41,      fromBase:b=>b/3785.41},
    {id:"ml",    label:"Milliliter (mL)",       toBase:v=>v,              fromBase:b=>b},
    {id:"l",     label:"Liter (L)",             toBase:v=>v*1000,         fromBase:b=>b/1000},
    {id:"dl",    label:"Deciliter (dL)",        toBase:v=>v*100,          fromBase:b=>b/100},
  ],

  typography:[
    {id:"px",    label:"Pixel (px) @ 96 dpi",   toBase:v=>v,              fromBase:b=>b},
    {id:"pt",    label:"Point (pt)",             toBase:v=>v*1.3333,       fromBase:b=>b/1.3333},
    {id:"pc",    label:"Pica (pc)",              toBase:v=>v*16,           fromBase:b=>b/16},
    {id:"em",    label:"Em (relative to 16px)", toBase:v=>v*16,           fromBase:b=>b/16},
    {id:"rem",   label:"Rem (relative to 16px)",toBase:v=>v*16,           fromBase:b=>b/16},
    {id:"mm",    label:"Millimeter (mm)",        toBase:v=>v*3.7795,       fromBase:b=>b/3.7795},
    {id:"cm",    label:"Centimeter (cm)",        toBase:v=>v*37.795,       fromBase:b=>b/37.795},
    {id:"in",    label:"Inch (in)",              toBase:v=>v*96,           fromBase:b=>b/96},
    {id:"vw",    label:"vw (1% of 1440px wide)",toBase:v=>v*14.4,         fromBase:b=>b/14.4},
    {id:"vh",    label:"vh (1% of 900px tall)", toBase:v=>v*9,            fromBase:b=>b/9},
  ],

  numbase:[
    {id:"dec",   label:"Decimal (Base 10)",     toBase:v=>v,              fromBase:b=>b},
    {id:"bin",   label:"Binary (Base 2)",       toBase:v=>parseInt(String(v),2)||0,  fromBase:b=>parseInt(b).toString(2)},
    {id:"oct",   label:"Octal (Base 8)",        toBase:v=>parseInt(String(v),8)||0,  fromBase:b=>parseInt(b).toString(8)},
    {id:"hex",   label:"Hexadecimal (Base 16)", toBase:v=>parseInt(String(v),16)||0, fromBase:b=>parseInt(b).toString(16).toUpperCase()},
    {id:"b32",   label:"Base 32",               toBase:v=>parseInt(String(v),32)||0, fromBase:b=>parseInt(b).toString(32).toUpperCase()},
    {id:"b36",   label:"Base 36",               toBase:v=>parseInt(String(v),36)||0, fromBase:b=>parseInt(b).toString(36).toUpperCase()},
  ],

  acceleration:[
    {id:"ms2",   label:"m/s²",                  toBase:v=>v,              fromBase:b=>b},
    {id:"cms2",  label:"cm/s²",                 toBase:v=>v/100,          fromBase:b=>b*100},
    {id:"g",     label:"g-force (g)",           toBase:v=>v*9.80665,      fromBase:b=>b/9.80665},
    {id:"ftps2", label:"ft/s²",                 toBase:v=>v*0.3048,       fromBase:b=>b/0.3048},
    {id:"gal",   label:"Gal (cm/s²) — galileo", toBase:v=>v/100,         fromBase:b=>b*100},
    {id:"inps2", label:"in/s²",                 toBase:v=>v*0.0254,       fromBase:b=>b/0.0254},
  ],

  radiation:[
    {id:"gy",    label:"Gray (Gy)",             toBase:v=>v,              fromBase:b=>b},
    {id:"sv",    label:"Sievert (Sv)",          toBase:v=>v,              fromBase:b=>b},
    {id:"msv",   label:"Millisievert (mSv)",    toBase:v=>v/1000,         fromBase:b=>b*1000},
    {id:"usv",   label:"Microsievert (μSv)",    toBase:v=>v/1e6,          fromBase:b=>b*1e6},
    {id:"rem",   label:"Rem",                   toBase:v=>v/100,          fromBase:b=>b*100},
    {id:"mrem",  label:"Millirem (mrem)",       toBase:v=>v/1e5,          fromBase:b=>b*1e5},
    {id:"rad",   label:"Rad",                   toBase:v=>v/100,          fromBase:b=>b*100},
    {id:"bq",    label:"Becquerel (Bq)",        toBase:v=>v,              fromBase:b=>b},
    {id:"ci",    label:"Curie (Ci)",            toBase:v=>v*3.7e10,       fromBase:b=>b/3.7e10},
  ],

  voltage:[
    {id:"v",     label:"Volt (V)",              toBase:v=>v,              fromBase:b=>b},
    {id:"mv",    label:"Millivolt (mV)",        toBase:v=>v/1000,         fromBase:b=>b*1000},
    {id:"kv",    label:"Kilovolt (kV)",         toBase:v=>v*1000,         fromBase:b=>b/1000},
    {id:"mv2",   label:"Megavolt (MV)",         toBase:v=>v*1e6,          fromBase:b=>b/1e6},
    {id:"uv",    label:"Microvolt (μV)",        toBase:v=>v/1e6,          fromBase:b=>b*1e6},
    {id:"abv",   label:"Abvolt",                toBase:v=>v*1e-8,         fromBase:b=>b*1e8},
    {id:"stv",   label:"Statvolt",              toBase:v=>v*299.792,      fromBase:b=>b/299.792},
  ],

};

// ─── TOOL REGISTRY ────────────────────────────────────────────────────────────
const TOOLS = [
  {id:"length-converter",       cat:"physical",  name:"Length Converter",         desc:"Convert km, m, cm, mm, miles, feet, inches, nautical miles",   icon:"📏", units:"length",       df:"m",  dt:"ft"},
  {id:"weight-converter",       cat:"physical",  name:"Weight / Mass Converter",  desc:"Convert kg, g, pounds, ounces, stones, metric tons and more",   icon:"⚖️", units:"weight",       df:"kg", dt:"lb"},
  {id:"temperature-converter",  cat:"physical",  name:"Temperature Converter",    desc:"Convert Celsius, Fahrenheit, Kelvin, Rankine and Réaumur",      icon:"🌡️", units:"temperature",   df:"c",  dt:"f"},
  {id:"area-converter",         cat:"physical",  name:"Area Converter",           desc:"Convert m², km², acres, hectares, square feet and miles",       icon:"⬜", units:"area",          df:"m2", dt:"ft2"},
  {id:"volume-converter",       cat:"physical",  name:"Volume Converter",         desc:"Convert liters, gallons, cubic meters, cups, fluid ounces",     icon:"🧊", units:"volume",        df:"l",  dt:"gal"},
  {id:"speed-converter",        cat:"physical",  name:"Speed Converter",          desc:"Convert m/s, km/h, mph, knots, Mach and speed of light",        icon:"🚀", units:"speed",         df:"kmh",dt:"mph"},
  {id:"pressure-converter",     cat:"physical",  name:"Pressure Converter",       desc:"Convert Pa, kPa, bar, PSI, atm, Torr and inches of mercury",    icon:"🔵", units:"pressure",      df:"bar",dt:"psi"},
  {id:"energy-converter",       cat:"physical",  name:"Energy Converter",         desc:"Convert Joules, kWh, BTU, calories, electronvolts and ergs",    icon:"⚡", units:"energy",        df:"kj", dt:"kcal"},
  {id:"power-converter",        cat:"physics",   name:"Power Converter",          desc:"Convert Watts, kilowatts, horsepower, BTU/hr and more",         icon:"🔌", units:"power",         df:"kw", dt:"hp"},
  {id:"digital-converter",      cat:"digital",   name:"Data Storage Converter",   desc:"Convert bits, bytes, KB, MB, GB, TB, Mbps and Kbps",            icon:"💾", units:"digital",       df:"gb", dt:"mb"},
  {id:"time-converter",         cat:"physical",  name:"Time Converter",           desc:"Convert nanoseconds to centuries — all time units covered",     icon:"⏱️", units:"time",           df:"h",  dt:"min"},
  {id:"angle-converter",        cat:"physics",   name:"Angle Converter",          desc:"Convert degrees, radians, gradians, arcminutes and arcseconds",  icon:"📐", units:"angle",         df:"deg",dt:"rad"},
  {id:"frequency-converter",    cat:"physics",   name:"Frequency Converter",      desc:"Convert Hz, kHz, MHz, GHz, RPM and radians per second",         icon:"〰️", units:"frequency",     df:"hz", dt:"mhz"},
  {id:"fuel-converter",         cat:"everyday",  name:"Fuel Economy Converter",   desc:"Convert MPG (US/UK), km/L and L/100km for fuel efficiency",     icon:"⛽", units:"fuel",          df:"mpg",dt:"l100"},
  {id:"torque-converter",       cat:"physics",   name:"Torque Converter",         desc:"Convert N·m, lb·ft, lb·in, kg·m and other torque units",        icon:"🔧", units:"torque",        df:"nm", dt:"lbft"},
  {id:"force-converter",        cat:"physics",   name:"Force Converter",          desc:"Convert Newtons, pound-force, kilogram-force, dynes and more",   icon:"💪", units:"force",         df:"n",  dt:"lbf"},
  {id:"illuminance-converter",  cat:"physics",   name:"Illuminance Converter",    desc:"Convert lux, foot-candles, phot and other light intensity units",icon:"💡", units:"illuminance",   df:"lx", dt:"fc"},
  {id:"density-converter",      cat:"physics",   name:"Density Converter",        desc:"Convert kg/m³, g/cm³, g/mL, lb/ft³ and lb/in³",               icon:"🧱", units:"density",        df:"kgm3",dt:"gcm3"},
  {id:"flow-converter",         cat:"physics",   name:"Flow Rate Converter",      desc:"Convert m³/s, L/min, GPM, CFM and other volumetric flow rates", icon:"💧", units:"flow",          df:"ls", dt:"galm"},
  {id:"cooking-converter",      cat:"everyday",  name:"Cooking Measurement Converter",desc:"Convert cups, tablespoons, teaspoons, fluid oz, mL and liters",icon:"🍳", units:"cooking",  df:"cup",dt:"ml"},
  {id:"typography-converter",   cat:"digital",   name:"Typography / CSS Units",   desc:"Convert px, pt, em, rem, mm, cm, vw, vh for web and print",     icon:"🔤", units:"typography",    df:"px", dt:"rem"},
  {id:"numbase-converter",      cat:"digital",   name:"Number Base Converter",    desc:"Convert between binary, octal, decimal, hex and base 36",        icon:"🔢", units:"numbase",       df:"dec",dt:"hex"},
  {id:"acceleration-converter", cat:"physics",   name:"Acceleration Converter",   desc:"Convert m/s², ft/s², g-force, Gal and other acceleration units", icon:"🏎️", units:"acceleration",  df:"ms2",dt:"g"},
  {id:"radiation-converter",    cat:"physics",   name:"Radiation Converter",      desc:"Convert Sievert, Gray, rem, rad, Becquerel, Curie and more",    icon:"☢️", units:"radiation",     df:"sv",  dt:"msv"},
  {id:"voltage-converter",      cat:"physics",   name:"Voltage Converter",        desc:"Convert Volts, millivolts, kilovolts, megavolts and microvolts", icon:"🔋", units:"voltage",       df:"v",  dt:"mv"},
];

const CATEGORIES = [
  {id:"physical", name:"Physical",     icon:"📏", desc:"Length, weight, temperature, area, volume, time, pressure, energy"},
  {id:"physics",  name:"Physics",      icon:"⚛️", desc:"Power, angle, frequency, torque, force, density, acceleration, radiation, voltage"},
  {id:"digital",  name:"Digital",      icon:"💾", desc:"Data storage, number bases, CSS/typography units"},
  {id:"everyday", name:"Everyday",     icon:"🍳", desc:"Cooking measurements, fuel economy"},
];

const TOOL_META = {
  "length-converter":      {title:"Length Converter – Free Online Distance Unit Converter",    desc:"Convert between all length units: kilometers, meters, feet, inches, miles, nautical miles, light years and more.", faq:[["How many feet in a meter?","1 meter = 3.28084 feet."],["How many km in a mile?","1 mile = 1.60934 kilometers."],["What is a nautical mile?","A nautical mile equals 1,852 meters (1.151 statute miles). Used in aviation and maritime navigation."]]},
  "weight-converter":      {title:"Weight & Mass Converter – kg to lbs, grams to ounces",     desc:"Convert kg, grams, pounds, ounces, stones, metric tons and more. Bidirectional conversion with all units shown.", faq:[["How many pounds in a kilogram?","1 kilogram = 2.20462 pounds."],["How many ounces in a pound?","1 pound = 16 ounces."],["What is a stone in kg?","1 stone = 14 pounds = 6.35029 kilograms."]]},
  "temperature-converter": {title:"Temperature Converter – Celsius, Fahrenheit, Kelvin Online", desc:"Convert between Celsius, Fahrenheit, Kelvin, Rankine, Réaumur and Rømer temperature scales.", faq:[["How to convert Celsius to Fahrenheit?","F = (C × 9/5) + 32. So 100°C = 212°F."],["What is absolute zero?","Absolute zero is 0 Kelvin = -273.15°C = -459.67°F."],["What is normal body temperature?","37°C (98.6°F), or 310.15 K."]]},
  "digital-converter":     {title:"Data Storage Converter – Bits, Bytes, KB, MB, GB, TB",     desc:"Convert between bits, bytes, kilobytes, megabytes, gigabytes, terabytes and binary (KiB, MiB, GiB) units.", faq:[["What is the difference between MB and MiB?","MB (megabyte) = 1,000,000 bytes. MiB (mebibyte) = 1,048,576 bytes (2²⁰)."],["How many bytes in a gigabyte?","1 GB = 1,000,000,000 bytes. 1 GiB = 1,073,741,824 bytes."],["What is Mbps?","Megabits per second — a data transfer rate. 1 Mbps = 1,000,000 bits per second."]]},
  "cooking-converter":     {title:"Cooking Measurement Converter – Cups, Tbsp, mL, Oz",       desc:"Convert cups, tablespoons, teaspoons, fluid ounces, pints, quarts, milliliters and liters for cooking.", faq:[["How many tablespoons in a cup?","16 tablespoons = 1 US cup."],["How many ml in a teaspoon?","1 US teaspoon = 4.929 mL."],["How many cups in a liter?","1 liter = 4.2268 US cups."]]},
  "numbase-converter":     {title:"Number Base Converter – Binary, Octal, Decimal, Hex",      desc:"Convert numbers between binary (base 2), octal (base 8), decimal (base 10), hexadecimal (base 16) and more.", faq:[["How to convert decimal to binary?","Repeatedly divide by 2 and record remainders. E.g. 10 = 1010 in binary."],["What is hexadecimal?","Base 16, using digits 0–9 and letters A–F. Used in colors (#FF5733) and memory addresses."],["What is octal?","Base 8, using digits 0–7. Used in Unix file permissions (chmod 755)."]]},
};

// ─── TOOL COMPONENTS ─────────────────────────────────────────────────────────
// Each tool is just a UnitConverter wrapper with its unit set
const makeConverter = (toolId) => {
  return function ToolWrapper() {
    const tool = TOOLS.find(t=>t.id===toolId);
    if(!tool) return null;
    const units = UNITS[tool.units];
    return <UnitConverter units={units} defaultFrom={tool.df} defaultTo={tool.dt}/>;
  };
};

// Special: Number Base Converter with text display (not just numbers)
function NumbaseConverter() {
  const [input, setInput] = useState("255");
  const [fromBase, setFromBase] = useState("10");
  const [error, setError] = useState("");

  const decimal = useMemo(()=>{
    const n = parseInt(input.trim(), parseInt(fromBase));
    if(isNaN(n)){ setError(`Invalid ${fromBase === "10" ? "decimal" : `base-${fromBase}`} number`); return null; }
    setError("");
    return n;
  },[input, fromBase]);

  const results = decimal !== null ? [
    {base:"2",  label:"Binary",      val:decimal.toString(2).toUpperCase()},
    {base:"8",  label:"Octal",       val:decimal.toString(8).toUpperCase()},
    {base:"10", label:"Decimal",     val:decimal.toString(10)},
    {base:"16", label:"Hexadecimal", val:decimal.toString(16).toUpperCase()},
    {base:"32", label:"Base 32",     val:decimal.toString(32).toUpperCase()},
    {base:"36", label:"Base 36",     val:decimal.toString(36).toUpperCase()},
    {base:"64", label:"Base 64 (digit count)", val:`${Math.ceil(Math.log2(decimal+1)/6)} digits`},
  ] : [];

  const groupBits = v => v.replace(/(.{4})/g,"$1 ").trim();

  return (
    <VStack>
      <Grid2>
        <div>
          <Label>Input Number</Label>
          <Input value={input} onChange={setInput} placeholder="Enter number…" mono/>
        </div>
        <div>
          <Label>Input Base</Label>
          <SelectInput value={fromBase} onChange={setFromBase} options={[
            {value:"2",label:"Binary (base 2)"},{value:"8",label:"Octal (base 8)"},
            {value:"10",label:"Decimal (base 10)"},{value:"16",label:"Hexadecimal (base 16)"},
            {value:"32",label:"Base 32"},{value:"36",label:"Base 36"},
          ]}/>
        </div>
      </Grid2>
      {error && <div style={{padding:"10px 14px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:8,fontSize:13,color:C.danger}}>{error}</div>}
      {decimal !== null && (
        <>
          <Card>
            {results.map(({base,label,val})=>(
              <div key={base} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:13,color:C.muted,minWidth:160}}>{label} (base {base})</span>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:C.text,fontWeight:600}}>{val}</span>
                  <CopyBtn text={val}/>
                </div>
              </div>
            ))}
          </Card>
          {fromBase==="10"&&(
            <Card style={{background:"rgba(6,182,212,0.05)"}}>
              <Label>Binary breakdown (grouped by 4 bits)</Label>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:15,color:C.cyan,letterSpacing:"0.12em",marginTop:8}}>
                {groupBits(decimal.toString(2).padStart(Math.ceil(decimal.toString(2).length/4)*4,"0"))}
              </div>
            </Card>
          )}
        </>
      )}
    </VStack>
  );
}

// Special: Cooking converter with visual measurement cards
function CookingConverter() {
  const [val, setVal] = useState("1");
  const [fromUnit, setFromUnit] = useState("cup");
  const units = UNITS.cooking;
  const from = units.find(u=>u.id===fromUnit);

  const results = useMemo(()=>{
    const n = parseFloat(val);
    if(isNaN(n)||!from) return [];
    const base = from.toBase(n);
    return units.map(u=>({...u, result:fmt(u.fromBase(base))}));
  },[val, fromUnit]);

  const visuals = [
    {id:"cup", icon:"🥛", label:"1 Cup = 237 mL"},
    {id:"tbsp", icon:"🥄", label:"1 Tbsp = 15 mL"},
    {id:"tsp", icon:"🥄", label:"1 Tsp = 5 mL"},
    {id:"floz", icon:"🧃", label:"1 fl oz = 30 mL"},
  ];

  return (
    <VStack>
      <Grid2>
        <div>
          <Label>Amount</Label>
          <Input value={val} onChange={setVal} placeholder="Enter value" type="number"/>
        </div>
        <div>
          <Label>Unit</Label>
          <SelectInput value={fromUnit} onChange={setFromUnit} options={units.map(u=>({value:u.id,label:u.label}))}/>
        </div>
      </Grid2>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {visuals.map(v=>(
          <div key={v.id} style={{padding:"8px 14px",background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:8,fontSize:12,color:C.muted}}>
            <span style={{marginRight:6}}>{v.icon}</span>{v.label}
          </div>
        ))}
      </div>
      <Card>
        {results.map(u=>(
          <div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontSize:13,color:C.muted,minWidth:200}}>{u.label}</span>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:C.text,fontWeight:600}}>{u.result}</span>
              <CopyBtn text={u.result}/>
            </div>
          </div>
        ))}
      </Card>
    </VStack>
  );
}

// Special: Temperature with visual thermometer & feel descriptor
function TemperatureConverter() {
  const [val, setVal] = useState("20");
  const [fromUnit, setFromUnit] = useState("c");
  const units = UNITS.temperature;
  const from = units.find(u=>u.id===fromUnit);

  const results = useMemo(()=>{
    const n = parseFloat(val);
    if(isNaN(n)||!from) return [];
    const base = from.toBase(n);
    return units.map(u=>({...u, result:fmt(u.fromBase(base))}));
  },[val, fromUnit]);

  const celsiusVal = from ? from.toBase(parseFloat(val)||0) : 0;
  const getFeeling = c => c<-20?"🥶 Extreme cold":c<-10?"❄️ Very cold":c<0?"🌨️ Freezing":c<10?"🧥 Cold":c<18?"🌤️ Cool":c<24?"😊 Comfortable":c<30?"☀️ Warm":c<38?"🥵 Hot":"🔥 Extreme heat";
  const getColor = c => c<0?"#60A5FA":c<18?"#34D399":c<28?"#FCD34D":"#F87171";
  const thermPct = Math.min(100,Math.max(0,((celsiusVal+20)/80)*100));

  return (
    <VStack>
      <Grid2>
        <div>
          <Label>Temperature</Label>
          <Input value={val} onChange={setVal} placeholder="Enter temperature" type="number"/>
        </div>
        <div>
          <Label>From Unit</Label>
          <SelectInput value={fromUnit} onChange={setFromUnit} options={units.map(u=>({value:u.id,label:u.label}))}/>
        </div>
      </Grid2>

      {/* Thermometer visual */}
      {!isNaN(parseFloat(val)) && (
        <div style={{display:"flex",gap:20,alignItems:"center",padding:"16px 20px",background:"rgba(255,255,255,0.03)",borderRadius:12,border:`1px solid ${C.border}`}} className="fade-in">
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div style={{width:16,height:100,background:"rgba(255,255,255,0.06)",borderRadius:8,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",bottom:0,width:"100%",height:`${thermPct}%`,background:getColor(celsiusVal),borderRadius:8,transition:"height .3s"}}/>
            </div>
            <div style={{width:20,height:20,borderRadius:"50%",background:getColor(celsiusVal)}}/>
          </div>
          <div>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:28,fontWeight:700,color:getColor(celsiusVal)}}>{celsiusVal.toFixed(1)}°C</div>
            <div style={{fontSize:14,color:C.muted,marginTop:4}}>{getFeeling(celsiusVal)}</div>
          </div>
        </div>
      )}

      <Card>
        {results.map(u=>(
          <div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontSize:13,color:C.muted,minWidth:200}}>{u.label}</span>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:C.text,fontWeight:600}}>{u.result}</span>
              <CopyBtn text={u.result}/>
            </div>
          </div>
        ))}
      </Card>

      <Card style={{background:"rgba(6,182,212,0.05)"}}>
        <Label>Quick Reference</Label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:8}}>
          {[["Freezing","0°C / 32°F"],["Body temp","37°C / 98.6°F"],["Boiling","100°C / 212°F"],["Room temp","20°C / 68°F"],["Absolute zero","-273.15°C / 0 K"],["Sun surface","~5500°C"]].map(([l,v])=>(
            <div key={l} style={{fontSize:12,padding:"5px 8px",background:"rgba(255,255,255,0.02)",borderRadius:6}}>
              <span style={{color:C.muted}}>{l}: </span><span style={{color:C.text,fontFamily:"'JetBrains Mono',monospace"}}>{v}</span>
            </div>
          ))}
        </div>
      </Card>
    </VStack>
  );
}

// Special: Digital storage with visual bar
function DigitalConverter() {
  const [val, setVal] = useState("1");
  const [fromUnit, setFromUnit] = useState("gb");
  const units = UNITS.digital;
  const from = units.find(u=>u.id===fromUnit);

  const results = useMemo(()=>{
    const n = parseFloat(val);
    if(isNaN(n)||!from) return [];
    const base = from.toBase(n);
    return units.map(u=>({...u, result:fmt(u.fromBase(base))}));
  },[val, fromUnit]);

  const refItems = [
    {label:"1 MP Photo (JPEG)",bits:2e7},
    {label:"1 min HD video",bits:1e9},
    {label:"MP3 song (3 min)",bits:2.5e7},
    {label:"4K movie (2 hr)",bits:4e10},
  ];

  const bitsVal = from && parseFloat(val) ? from.toBase(parseFloat(val)) : 0;

  return (
    <VStack>
      <Grid2>
        <div>
          <Label>Value</Label>
          <Input value={val} onChange={setVal} placeholder="Enter value" type="number"/>
        </div>
        <div>
          <Label>Unit</Label>
          <SelectInput value={fromUnit} onChange={setFromUnit} options={units.map(u=>({value:u.id,label:u.label}))}/>
        </div>
      </Grid2>
      <Card>
        {results.filter(u=>["bit","byte","kb","mb","gb","tb","pb"].includes(u.id)).map(u=>(
          <div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontSize:13,color:C.muted,minWidth:180}}>{u.label}</span>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:C.text,fontWeight:600}}>{u.result}</span>
              <CopyBtn text={u.result}/>
            </div>
          </div>
        ))}
      </Card>
      <Card>
        <Label>Binary (IEC) Units</Label>
        <div style={{marginTop:8}}>
          {results.filter(u=>["kib","mib","gib"].includes(u.id)).map(u=>(
            <div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:13,color:C.muted,minWidth:180}}>{u.label}</span>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:C.text,fontWeight:600}}>{u.result}</span>
                <CopyBtn text={u.result}/>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {bitsVal>0&&(
        <Card style={{background:"rgba(6,182,212,0.05)"}}>
          <Label>Real-world comparison</Label>
          <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:8}}>
            {refItems.map(({label,bits})=>{
              const ratio=bitsVal/bits;
              const desc=ratio<0.01?`< 1% of ${label}`:ratio<1?`${(ratio*100).toFixed(0)}% of ${label}`:ratio>=1e6?`${(ratio/1e6).toFixed(1)}M × ${label}`:`${ratio.toFixed(1)} × ${label}`;
              return <div key={label} style={{fontSize:12,color:C.muted,padding:"4px 8px",background:"rgba(255,255,255,0.02)",borderRadius:5}}><span style={{color:C.text}}>{desc}</span></div>;
            })}
          </div>
        </Card>
      )}
    </VStack>
  );
}

// ─── COMPONENT MAP ────────────────────────────────────────────────────────────
const TOOL_COMPONENTS = Object.fromEntries(
  TOOLS.map(t=>[t.id, t.id==="numbase-converter" ? NumbaseConverter
                      : t.id==="cooking-converter" ? CookingConverter
                      : t.id==="temperature-converter" ? TemperatureConverter
                      : t.id==="digital-converter" ? DigitalConverter
                      : makeConverter(t.id)])
);

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
          { "@type": "ListItem", "position": 2, "name": "Unit Converters", "item": "https://toolsrift.com/units" },
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
      <h2 style={{...T.h2,marginBottom:14}}>Related Converters</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
        {related.map(t=>(
          <a key={t.id} href={`#/tool/${t.id}`} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(255,255,255,0.02)",border:`1px solid ${C.border}`,borderRadius:8,textDecoration:"none",transition:"border-color .15s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(6,182,212,0.4)"} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <span style={{fontSize:20}}>{t.icon}</span>
            <div><div style={{fontSize:13,fontWeight:600,color:C.text}}>{t.name}</div><div style={{fontSize:11,color:C.muted}}>{t.desc}</div></div>
          </a>
        ))}
      </div>
    </section>
  );
}

function ToolPage({ toolId }) {
  const tool = TOOLS.find(t => t.id === toolId);
  const meta = TOOL_META[toolId];
  const ToolComp = TOOL_COMPONENTS[toolId];
  useEffect(() => {
    document.title = meta?.title || `${tool?.name} – Free Unit Converter | ToolsRift`;
  }, [toolId, tool, meta]);

  if (!tool || !ToolComp) {
    return (
      <CategoryLayout theme={PAGE_THEME} currentTool={toolId || 'unknown'} tools={TOOLS} subcats={CATEGORIES}>
        <div style={{ padding:'48px 20px', textAlign:'center', color:'#94A3B8' }}>
          Tool not found. <a href="#/" style={{ color: PAGE_THEME.color }}>← Back to {PAGE_THEME.name}</a>
        </div>
      </CategoryLayout>
    );
  }

  const toolData = {
    id: tool.id,
    name: tool.name,
    icon: tool.icon,
    description: meta?.desc || tool.desc,
    howTo: meta?.howTo,
    faq: meta?.faq,
  };
  const related = TOOLS.filter(t => t.id !== tool.id && t.cat === tool.cat).slice(0, 8);

  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId} tools={TOOLS} subcats={CATEGORIES}>
      <ToolPageLayout theme={PAGE_THEME} tool={toolData} tools={TOOLS} subcats={CATEGORIES} related={related}>
        <ToolComp />
      </ToolPageLayout>
    </CategoryLayout>
  );
}

function CategoryPage({ catId }) {
  const cat=CATEGORIES.find(c=>c.id===catId);
  const tools=TOOLS.filter(t=>t.cat===catId);
  useEffect(()=>{document.title=`${cat?.name} Converters – Free Unit Tools | ToolsRift`;},[catId]);
  if(!cat) return <div style={{padding:40,textAlign:"center",color:C.muted}}>Not found. <a href="#/" style={{color:C.violet}}>← Home</a></div>;
  return (
    <div style={{maxWidth:860,margin:"0 auto",padding:"24px 20px 60px"}}>
      <nav style={{fontSize:12,color:C.muted,marginBottom:20}}><a href="#/" style={{color:C.muted,textDecoration:"none"}}>🏠 ToolsRift</a> › <span style={{color:C.text}}>{cat.name}</span></nav>
      <h1 style={{...T.h1,marginBottom:6}}>{cat.icon} {cat.name}</h1>
      <p style={{fontSize:14,color:C.muted,marginBottom:28}}>{cat.desc} — {tools.length} free converters</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
        {tools.map(t=>(
          <a key={t.id} href={`#/tool/${t.id}`} style={{display:"flex",gap:12,padding:"14px 16px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,textDecoration:"none",alignItems:"flex-start",transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(6,182,212,0.4)";e.currentTarget.style.transform="translateY(-1px)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="";}}>
            <span style={{fontSize:24,marginTop:2}}>{t.icon}</span>
            <div><div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:3}}>{t.name}</div><div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>{t.desc}</div></div>
          </a>
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  useEffect(()=>{document.title="Free Unit Converters – Length, Weight, Temperature & More | ToolsRift";},[]);
  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search unit converter tools..."
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
  const [isDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const h=()=>setScrolled(window.scrollY>8); window.addEventListener("scroll",h,{passive:true}); return ()=>window.removeEventListener("scroll",h); }, []);
  return (
    <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 24px",borderBottom:`1px solid ${scrolled?"rgba(6,182,212,0.2)":C.border}`,position:"sticky",top:0,background:scrolled?"rgba(6,9,15,0.97)":"rgba(6,9,15,0.85)",backdropFilter:"blur(12px)",zIndex:100,transition:"all 0.3s"}}>
      <a href="https://toolsrift.com" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none"}}>
        <img src="/logo.svg" alt="ToolsRift" style={{height:36}}/>
        <span className="tr-nav-badge" style={{fontSize:11,color:C.muted,background:"rgba(255,255,255,0.05)",padding:"2px 8px",borderRadius:10}}>Unit Converters</span>
      </a>
      <div style={{display:"flex",gap:4}}>
        <div className="tr-nav-cats">
          {CATEGORIES.map(c=>(
            <a key={c.id} href={`#/category/${c.id}`} title={c.name} style={{padding:"5px 8px",borderRadius:6,fontSize:18,color:C.muted,textDecoration:"none",transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.color=C.text;e.currentTarget.style.background="rgba(255,255,255,0.04)";}} onMouseLeave={e=>{e.currentTarget.style.color=C.muted;e.currentTarget.style.background="transparent";}}>
              {c.icon}
            </a>
          ))}
        </div>
        {/* PHASE 2: <UsageCounter/> */}
        <a href="/" style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600,color:"#E2E8F0",textDecoration:"none",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",marginLeft:4}}>🏠 Home</a>
      </div>
    </nav>
  );
}

function ToolsRiftUnits() {
  const route=useAppRouter();
  const showChrome = route.page !== 'home' && route.page !== 'tool';
  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{GLOBAL_CSS}</style>
      {showChrome && <Nav/>}
      {route.page==="home"&&<HomePage/>}
      {route.page==="tool"&&<ToolPage toolId={route.toolId}/>}
      {route.page==="category"&&<CategoryPage catId={route.catId}/>}
      {showChrome && <SiteFooter currentPage="units"/>}
    </div>
  );
}

export default ToolsRiftUnits;
