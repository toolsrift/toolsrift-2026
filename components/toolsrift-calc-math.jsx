import { useState, useEffect, useMemo } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from "../lib/usage";
// PHASE 2: import UpgradeModal from "./UpgradeModal";
// PHASE 2: import UsageCounter from "./UsageCounter";
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolPageLayout, { ToolSchemas } from './shared/ToolPageLayout';

const THEME = getCategoryById("mathcalc");
const PAGE_THEME = getCategoryById('mathcalc');
const BRAND = { name: "ToolsRift", tagline: "Math & Geometry Calculators" };

const C = {
  bg: "#06090F",
  surface: "#0D1117",
  border: "rgba(255,255,255,0.06)",
  blue: "#6366F1",
  blueD: "#4F46E5",
  text: "#E2E8F0",
  muted: "#64748B",
  success: "#10B981",
  warn: "#F59E0B",
  danger: "#EF4444",
};

const GLOBAL_CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px} ::selection{background:rgba(99,102,241,0.3)} button:hover{filter:brightness(1.07)} select option{background:#0D1117} textarea{resize:vertical} .fade-in{animation:fadeIn .25s ease} @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}} table{border-collapse:collapse} th,td{border:1px solid rgba(255,255,255,0.08);padding:8px 10px;font-size:12px} th{background:rgba(255,255,255,0.04)} .mono{font-family:'JetBrains Mono',monospace};`;

const T = {
  body: { fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: C.text },
  mono: { fontFamily: "'JetBrains Mono',monospace", fontSize: 13 },
  label: {
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    fontSize: 12,
    fontWeight: 600,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  h1: { fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: C.text },
  h2: { fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 600, color: C.text },
};

function Badge({ children, color = "blue" }) {
  const map = {
    blue: "rgba(99,102,241,0.15)",
    green: "rgba(16,185,129,0.15)",
    amber: "rgba(245,158,11,0.15)",
    red: "rgba(239,68,68,0.15)",
  };
  const textMap = { blue: "#A5B4FC", green: "#34D399", amber: "#FCD34D", red: "#FCA5A5" };
  return (
    <span
      style={{
        background: map[color] || map.blue,
        color: textMap[color] || textMap.blue,
        borderRadius: 4,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", disabled, style = {} }) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: 8,
    fontWeight: 600,
    transition: "all .15s",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    opacity: disabled ? 0.5 : 1,
  };
  const sz = {
    sm: { padding: "6px 14px", fontSize: 12 },
    md: { padding: "9px 20px", fontSize: 13 },
    lg: { padding: "12px 28px", fontSize: 14 },
  }[size];
  const v = {
    primary: {
      background: `linear-gradient(135deg,${C.blue},${C.blueD})`,
      color: "#fff",
      boxShadow: "0 2px 8px rgba(99,102,241,0.28)",
    },
    secondary: { background: "rgba(255,255,255,0.05)", color: C.text, border: `1px solid ${C.border}` },
    ghost: { background: "transparent", color: C.muted },
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...sz, ...v, ...style }}>
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder, type = "text", style = {} }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        background: "#0F172A",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: "0 14px",
        color: "#F8FAFC",
        fontSize: 16,
        fontFamily: "'JetBrains Mono',monospace",
        textAlign: "right",
        outline: "none",
        height: 48,
        transition: "border-color 0.15s",
        ...style,
      }}
      onFocus={(e) => (e.target.style.borderColor = C.blue)}
      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
    />
  );
}

function SelectInput({ value, onChange, options }) {
  const norm = (options || []).map((o) =>
    Array.isArray(o) ? { value: o[0], label: o[1] } : (typeof o === "string" ? { value: o, label: o } : o)
  );
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "9px 14px",
        color: C.text,
        fontSize: 13,
        outline: "none",
      }}
    >
      {norm.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Textarea({ value, onChange, rows = 6, mono = false }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "12px 14px",
        color: C.text,
        fontSize: 13,
        fontFamily: mono ? "'JetBrains Mono',monospace" : "'Plus Jakarta Sans',sans-serif",
        outline: "none",
        lineHeight: 1.6,
      }}
    />
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, ...style }}>
      {children}
    </div>
  );
}

function Label({ children }) {
  return <div style={{ ...T.label, marginBottom: 6 }}>{children}</div>;
}

function Grid2({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
}
function Grid3({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>{children}</div>;
}
function VStack({ children, gap = 12 }) {
  return <div style={{ display: "flex", flexDirection: "column", gap }}>{children}</div>;
}

function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  if (text == null || text === "" || text === "—" || text === "∞") return null;
  return (
    <button
      onClick={() => navigator.clipboard?.writeText(String(text)).then(() => { setDone(true); setTimeout(() => setDone(false), 2000); }).catch(() => {})}
      title="Copy result"
      style={{ background: "transparent", border: `1px solid ${C.border}`, color: done ? C.success : C.blue, borderRadius: 6, padding: "3px 9px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", flexShrink: 0 }}
    >
      {done ? "✓ Copied" : "⧉ Copy"}
    </button>
  );
}

function BigResult({ value, label }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px 24px",
        background: "rgba(99,102,241,0.1)",
        border: "1px solid rgba(99,102,241,0.3)",
        borderRadius: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(28px,4vw,32px)", fontWeight: 700, color: C.blue, overflowWrap: "anywhere", wordBreak: "break-word", maxWidth: "100%", minWidth: 0 }}>{value}</div>
        <CopyBtn text={value} />
      </div>
      <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function Result({ children, mono = true }) {
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.28)",
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "12px 14px",
        color: C.text,
        fontSize: 13,
        fontFamily: mono ? "'JetBrains Mono',monospace" : "'Plus Jakarta Sans',sans-serif",
        lineHeight: 1.6,
        whiteSpace: "pre-wrap",
      }}
    >
      {children}
    </div>
  );
}

function ShapeSVG({ shape, labels = {} }) {
  const stroke = "#A5B4FC";
  const fill = "rgba(99,102,241,0.18)";
  const t = { fill: "#A5B4FC", fontSize: 11, fontFamily: "JetBrains Mono, monospace" };
  if (shape === "circle") return <svg viewBox="0 0 220 140" width="100%" height="140"><circle cx="70" cy="70" r="45" fill={fill} stroke={stroke} /><line x1="70" y1="70" x2="115" y2="70" stroke={stroke} /><text x="88" y="64" style={t}>r={labels.r}</text></svg>;
  if (shape === "rectangle") return <svg viewBox="0 0 220 140" width="100%" height="140"><rect x="35" y="35" width="140" height="70" fill={fill} stroke={stroke}/><text x="95" y="28" style={t}>w={labels.w}</text><text x="182" y="74" style={t}>h={labels.h}</text></svg>;
  if (shape === "square") return <svg viewBox="0 0 220 140" width="100%" height="140"><rect x="55" y="30" width="80" height="80" fill={fill} stroke={stroke}/><text x="86" y="24" style={t}>a={labels.a}</text></svg>;
  if (shape === "triangle") return <svg viewBox="0 0 220 140" width="100%" height="140"><polygon points="40,110 180,110 110,30" fill={fill} stroke={stroke}/><text x="101" y="124" style={t}>b={labels.b}</text><text x="114" y="76" style={t}>h={labels.h}</text></svg>;
  if (shape === "ellipse") return <svg viewBox="0 0 220 140" width="100%" height="140"><ellipse cx="110" cy="70" rx="70" ry="40" fill={fill} stroke={stroke}/><text x="108" y="66" style={t}>a={labels.a}</text><text x="183" y="72" style={t}>b={labels.b}</text></svg>;
  return <svg viewBox="0 0 220 140" width="100%" height="140"><rect x="20" y="20" width="180" height="100" fill={fill} stroke={stroke}/><text x="30" y="35" style={t}>{shape}</text></svg>;
}

const n = (v) => {
  const x = parseFloat(v);
  return Number.isFinite(x) ? x : 0;
};
const round = (x, p = 6) => Number.isFinite(x) ? Number(x.toFixed(p)).toString() : "—";

function AreaCalc() {
  const [shape, setShape] = useState("circle");
  const [a, setA] = useState("10");
  const [b, setB] = useState("6");
  const [c, setC] = useState("8");
  const [d, setD] = useState("5");
  const [theta, setTheta] = useState("60");
  const [sides, setSides] = useState("6");
  const res = useMemo(() => {
    const A = n(a), B = n(b), Cc = n(c), D = n(d), th = n(theta), m = n(sides);
    let val = 0, formula = "";
    if (shape === "circle") { val = Math.PI * A * A; formula = "A = πr²"; }
    if (shape === "rectangle") { val = A * B; formula = "A = w·h"; }
    if (shape === "square") { val = A * A; formula = "A = a²"; }
    if (shape === "triangle") { val = 0.5 * A * B; formula = "A = ½·b·h"; }
    if (shape === "trapezoid") { val = 0.5 * (A + B) * Cc; formula = "A = ½(a+b)h"; }
    if (shape === "parallelogram") { val = A * B; formula = "A = b·h"; }
    if (shape === "ellipse") { val = Math.PI * A * B; formula = "A = πab"; }
    if (shape === "rhombus") { val = (A * B) / 2; formula = "A = (d₁d₂)/2"; }
    if (shape === "sector") { val = (th / 360) * Math.PI * A * A; formula = "A = (θ/360)πr²"; }
    if (shape === "polygon") { val = (m * A * A) / (4 * Math.tan(Math.PI / m || 1)); formula = "A = n·s²/(4tan(π/n))"; }
    return { val, formula };
  }, [shape, a, b, c, d, theta, sides]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Shape</Label><SelectInput value={shape} onChange={setShape} options={["circle","rectangle","square","triangle","trapezoid","parallelogram","ellipse","rhombus","sector","polygon"].map(x=>({value:x,label:x}))} /></div>
        <div><Label>a / r / side</Label><Input value={a} onChange={setA} /></div>
        <div><Label>b / height</Label><Input value={b} onChange={setB} /></div>
      </Grid3>
      <Grid3>
        <div><Label>c (trapezoid h)</Label><Input value={c} onChange={setC} /></div>
        <div><Label>θ (sector deg)</Label><Input value={theta} onChange={setTheta} /></div>
        <div><Label>n sides (polygon)</Label><Input value={sides} onChange={setSides} /></div>
      </Grid3>
      <BigResult value={round(res.val)} label="Area" />
      <Result mono={false}>Formula: <b>{res.formula}</b></Result>
      <ShapeSVG shape={shape} labels={{ r:a,w:a,h:b,a,b }} />
    </VStack>
  );
}

function PerimeterCalc() {
  const [shape, setShape] = useState("circle");
  const [a, setA] = useState("10");
  const [b, setB] = useState("6");
  const [c, setC] = useState("8");
  const [d, setD] = useState("5");
  const [theta, setTheta] = useState("60");
  const [sides, setSides] = useState("6");
  const res = useMemo(() => {
    const A=n(a),B=n(b),Cc=n(c),D=n(d),th=n(theta),m=n(sides);
    let val=0, formula="";
    if(shape==="circle"){val=2*Math.PI*A;formula="C = 2πr";}
    if(shape==="rectangle"){val=2*(A+B);formula="P = 2(w+h)";}
    if(shape==="square"){val=4*A;formula="P = 4a";}
    if(shape==="triangle"){val=A+B+Cc;formula="P = a+b+c";}
    if(shape==="trapezoid"){val=A+B+Cc+D;formula="P = a+b+c+d";}
    if(shape==="parallelogram"){val=2*(A+B);formula="P = 2(a+b)";}
    if(shape==="ellipse"){val=Math.PI*(3*(A+B)-Math.sqrt((3*A+B)*(A+3*B)));formula="P ≈ π[3(a+b)-√((3a+b)(a+3b))]";}
    if(shape==="rhombus"){val=4*A;formula="P = 4a";}
    if(shape==="sector"){val=2*A+(th/360)*2*Math.PI*A;formula="P = 2r + arc";}
    if(shape==="polygon"){val=m*A;formula="P = n·s";}
    return {val,formula};
  },[shape,a,b,c,d,theta,sides]);
  return (
    <VStack>
      <Grid3>
        <div><Label>Shape</Label><SelectInput value={shape} onChange={setShape} options={["circle","rectangle","square","triangle","trapezoid","parallelogram","ellipse","rhombus","sector","polygon"].map(x=>({value:x,label:x}))} /></div>
        <div><Label>a / r / side</Label><Input value={a} onChange={setA} /></div>
        <div><Label>b</Label><Input value={b} onChange={setB} /></div>
      </Grid3>
      <Grid3>
        <div><Label>c</Label><Input value={c} onChange={setC} /></div>
        <div><Label>d</Label><Input value={d} onChange={setD} /></div>
        <div><Label>θ / n</Label><Input value={shape==="polygon"?sides:theta} onChange={shape==="polygon"?setSides:setTheta} /></div>
      </Grid3>
      <BigResult value={round(res.val)} label="Perimeter / Circumference" />
      <Result mono={false}>Formula: <b>{res.formula}</b></Result>
      <ShapeSVG shape={shape} labels={{ r:a,w:a,h:b,a,b }} />
    </VStack>
  );
}

function VolumeCalc() {
  const [shape,setShape]=useState("cube");
  const [a,setA]=useState("4");
  const [b,setB]=useState("5");
  const [c,setC]=useState("6");
  const [h,setH]=useState("10");
  const [r2,setR2]=useState("3");
  const res=useMemo(()=>{
    const A=n(a),B=n(b),Cc=n(c),H=n(h),R2=n(r2);
    let val=0, formula="";
    if(shape==="cube"){val=A**3;formula="V = a³";}
    if(shape==="cuboid"){val=A*B*Cc;formula="V = lwh";}
    if(shape==="sphere"){val=4/3*Math.PI*A**3;formula="V = 4/3 πr³";}
    if(shape==="cylinder"){val=Math.PI*A**2*H;formula="V = πr²h";}
    if(shape==="cone"){val=(1/3)*Math.PI*A**2*H;formula="V = 1/3 πr²h";}
    if(shape==="pyramid"){val=(1/3)*(A*B)*H;formula="V = 1/3 Bh";}
    if(shape==="prism"){val=(A*B/2)*H;formula="V = Bh (triangle base)";}
    if(shape==="torus"){val=2*Math.PI**2*A**2*R2;formula="V = 2π²r²R";}
    return {val,formula};
  },[shape,a,b,c,h,r2]);
  return (
    <VStack>
      <Grid3>
        <div><Label>3D Shape</Label><SelectInput value={shape} onChange={setShape} options={["cube","cuboid","sphere","cylinder","cone","pyramid","prism","torus"].map(x=>({value:x,label:x}))}/></div>
        <div><Label>a / r</Label><Input value={a} onChange={setA}/></div>
        <div><Label>b</Label><Input value={b} onChange={setB}/></div>
      </Grid3>
      <Grid3>
        <div><Label>c</Label><Input value={c} onChange={setC}/></div>
        <div><Label>h</Label><Input value={h} onChange={setH}/></div>
        <div><Label>R (torus)</Label><Input value={r2} onChange={setR2}/></div>
      </Grid3>
      <BigResult value={round(res.val)} label="Volume" />
      <Result mono={false}>Formula: <b>{res.formula}</b></Result>
    </VStack>
  );
}

function SurfaceAreaCalc() {
  const [shape,setShape]=useState("cube");
  const [a,setA]=useState("4");
  const [b,setB]=useState("5");
  const [c,setC]=useState("6");
  const [h,setH]=useState("10");
  const [R,setR]=useState("6");
  const res=useMemo(()=>{
    const A=n(a),B=n(b),Cc=n(c),H=n(h),RR=n(R);
    let val=0, formula="";
    if(shape==="cube"){val=6*A*A;formula="SA = 6a²";}
    if(shape==="cuboid"){val=2*(A*B+B*Cc+A*Cc);formula="SA = 2(lw+wh+lh)";}
    if(shape==="sphere"){val=4*Math.PI*A*A;formula="SA = 4πr²";}
    if(shape==="cylinder"){val=2*Math.PI*A*(A+H);formula="SA = 2πr(r+h)";}
    if(shape==="cone"){val=Math.PI*A*(A+Math.sqrt(A*A+H*H));formula="SA = πr(r+l)";}
    if(shape==="pyramid"){val=A*B + A*Math.sqrt((B/2)**2+H**2)+B*Math.sqrt((A/2)**2+H**2);formula="SA = base + lateral";}
    if(shape==="prism"){val=2*(A*B/2)+ (A+B+Math.sqrt(A*A+B*B))*H;formula="SA = 2B + Ph";}
    if(shape==="torus"){val=4*Math.PI**2*A*RR;formula="SA = 4π²rR";}
    return {val,formula};
  },[shape,a,b,c,h,R]);
  return (
    <VStack>
      <Grid3>
        <div><Label>3D Shape</Label><SelectInput value={shape} onChange={setShape} options={["cube","cuboid","sphere","cylinder","cone","pyramid","prism","torus"].map(x=>({value:x,label:x}))}/></div>
        <div><Label>a / r</Label><Input value={a} onChange={setA}/></div>
        <div><Label>b</Label><Input value={b} onChange={setB}/></div>
      </Grid3>
      <Grid3>
        <div><Label>c</Label><Input value={c} onChange={setC}/></div>
        <div><Label>h</Label><Input value={h} onChange={setH}/></div>
        <div><Label>R (torus)</Label><Input value={R} onChange={setR}/></div>
      </Grid3>
      <BigResult value={round(res.val)} label="Surface Area" />
      <Result mono={false}>Formula: <b>{res.formula}</b></Result>
    </VStack>
  );
}

function PythagoreanCalc() {
  const [solve,setSolve]=useState("c");
  const [a,setA]=useState("3");
  const [b,setB]=useState("4");
  const [c,setC]=useState("5");
  const r=useMemo(()=>{
    const A=n(a),B=n(b),Cc=n(c);
    if(solve==="c"){const v=Math.sqrt(A*A+B*B); return {v, steps:`c² = a² + b²\nc² = ${A*A} + ${B*B}\nc² = ${A*A+B*B}\nc = √${A*A+B*B}`};}
    if(solve==="a"){const v=Math.sqrt(Cc*Cc-B*B); return {v, steps:`a² = c² - b²\na² = ${Cc*Cc} - ${B*B}\na = √${Cc*Cc-B*B}`};}
    const v=Math.sqrt(Cc*Cc-A*A); return {v, steps:`b² = c² - a²\nb² = ${Cc*Cc} - ${A*A}\nb = √${Cc*Cc-A*A}`};
  },[solve,a,b,c]);
  return (
    <VStack>
      <Grid3>
        <div><Label>Solve For</Label><SelectInput value={solve} onChange={setSolve} options={[{value:"a",label:"a"},{value:"b",label:"b"},{value:"c",label:"c (hypotenuse)"}]} /></div>
        <div><Label>a</Label><Input value={a} onChange={setA} /></div>
        <div><Label>b</Label><Input value={b} onChange={setB} /></div>
      </Grid3>
      <div><Label>c</Label><Input value={c} onChange={setC} /></div>
      <BigResult value={round(r.v)} label={`Solved ${solve}`} />
      <Result>{r.steps}</Result>
      <svg viewBox="0 0 240 140" width="100%" height="140">
        <polygon points="30,120 190,120 30,30" fill="rgba(249,115,22,0.15)" stroke="#FDBA74" />
        <text x="95" y="134" fill="#FDBA74" fontSize="12">a</text>
        <text x="14" y="80" fill="#FDBA74" fontSize="12">b</text>
        <text x="108" y="76" fill="#FDBA74" fontSize="12">c</text>
      </svg>
    </VStack>
  );
}

function DistanceCalc() {
  const [x1,setX1]=useState("0"),[y1,setY1]=useState("0"),[x2,setX2]=useState("3"),[y2,setY2]=useState("4");
  const r=useMemo(()=>{
    const X1=n(x1),Y1=n(y1),X2=n(x2),Y2=n(y2);
    const dx=X2-X1, dy=Y2-Y1, d=Math.sqrt(dx*dx+dy*dy);
    return {d,steps:`d = √((x₂-x₁)² + (y₂-y₁)²)\nd = √((${X2}-${X1})² + (${Y2}-${Y1})²)\nd = √(${dx*dx}+${dy*dy})\nd = √${dx*dx+dy*dy}`};
  },[x1,y1,x2,y2]);
  return <VStack><Grid2><div><Label>x1</Label><Input value={x1} onChange={setX1}/></div><div><Label>y1</Label><Input value={y1} onChange={setY1}/></div></Grid2><Grid2><div><Label>x2</Label><Input value={x2} onChange={setX2}/></div><div><Label>y2</Label><Input value={y2} onChange={setY2}/></div></Grid2><BigResult value={round(r.d)} label="Distance" /><Result>{r.steps}</Result></VStack>;
}

function MidpointCalc() {
  const [x1,setX1]=useState("2"),[y1,setY1]=useState("1"),[x2,setX2]=useState("6"),[y2,setY2]=useState("7");
  const r=useMemo(()=>{
    const X1=n(x1),Y1=n(y1),X2=n(x2),Y2=n(y2);
    const mx=(X1+X2)/2,my=(Y1+Y2)/2;
    return {mx,my,steps:`M = ((x₁+x₂)/2, (y₁+y₂)/2)\nM = ((${X1}+${X2})/2, (${Y1}+${Y2})/2)\nM = (${mx}, ${my})`};
  },[x1,y1,x2,y2]);
  return <VStack><Grid2><div><Label>x1</Label><Input value={x1} onChange={setX1}/></div><div><Label>y1</Label><Input value={y1} onChange={setY1}/></div></Grid2><Grid2><div><Label>x2</Label><Input value={x2} onChange={setX2}/></div><div><Label>y2</Label><Input value={y2} onChange={setY2}/></div></Grid2><BigResult value={`(${round(r.mx)}, ${round(r.my)})`} label="Midpoint" /><Result>{r.steps}</Result></VStack>;
}

function SlopeCalc() {
  const [x1,setX1]=useState("1"),[y1,setY1]=useState("2"),[x2,setX2]=useState("5"),[y2,setY2]=useState("10");
  const r=useMemo(()=>{
    const X1=n(x1),Y1=n(y1),X2=n(x2),Y2=n(y2);
    const m=(Y2-Y1)/(X2-X1||1e-9), b=Y1-m*X1;
    return {m,b,eq:`y = ${round(m)}x ${b>=0?"+":"-"} ${round(Math.abs(b))}`,steps:`m = (y₂-y₁)/(x₂-x₁)\nm = (${Y2}-${Y1})/(${X2}-${X1}) = ${round(m)}\nb = y - mx = ${Y1} - (${round(m)}·${X1}) = ${round(b)}`};
  },[x1,y1,x2,y2]);
  return <VStack><Grid2><div><Label>x1</Label><Input value={x1} onChange={setX1}/></div><div><Label>y1</Label><Input value={y1} onChange={setY1}/></div></Grid2><Grid2><div><Label>x2</Label><Input value={x2} onChange={setX2}/></div><div><Label>y2</Label><Input value={y2} onChange={setY2}/></div></Grid2><BigResult value={round(r.m)} label="Slope" /><Result>{`y-intercept: ${round(r.b)}\nEquation: ${r.eq}\n\n${r.steps}`}</Result></VStack>;
}

function AngleCalc() {
  const [mode,setMode]=useState("triangle");
  const [a,setA]=useState("40"),[b,setB]=useState("60");
  const r=useMemo(()=>{
    const A=n(a),B=n(b);
    if(mode==="triangle"){const c=180-A-B; return {main:round(c),label:"Missing Angle",steps:`In triangle: A+B+C=180\nC=180-${A}-${B}=${c}`};}
    if(mode==="supplementary"){const c=180-A; return {main:round(c),label:"Supplementary",steps:`Supplementary sum=180\nx=180-${A}=${c}`};}
    const c=90-A; return {main:round(c),label:"Complementary",steps:`Complementary sum=90\nx=90-${A}=${c}`};
  },[mode,a,b]);
  return <VStack><Grid3><div><Label>Type</Label><SelectInput value={mode} onChange={setMode} options={[{value:"triangle",label:"Triangle Missing Angle"},{value:"supplementary",label:"Supplementary"},{value:"complementary",label:"Complementary"}]} /></div><div><Label>Angle A</Label><Input value={a} onChange={setA}/></div><div><Label>Angle B</Label><Input value={b} onChange={setB}/></div></Grid3><BigResult value={`${r.main}°`} label={r.label}/><Result>{r.steps}</Result></VStack>;
}

function ArcLengthCalc() {
  const [r,setR]=useState("10"),[theta,setTheta]=useState("60");
  const out=useMemo(()=>{
    const R=n(r),th=n(theta);
    const arc=(th/360)*2*Math.PI*R;
    const area=(th/360)*Math.PI*R*R;
    return {arc,area,steps:`Arc length L=(θ/360)·2πr\nL=(${th}/360)·2π·${R}=${round(arc)}\nSector area A=(θ/360)·πr²\nA=(${th}/360)·π·${R}²=${round(area)}`};
  },[r,theta]);
  return <VStack><Grid2><div><Label>Radius r</Label><Input value={r} onChange={setR}/></div><div><Label>Angle θ (deg)</Label><Input value={theta} onChange={setTheta}/></div></Grid2><BigResult value={round(out.arc)} label="Arc Length"/><Result>{`Sector Area: ${round(out.area)}\nFormula: L=(θ/360)2πr, A=(θ/360)πr²\n\n${out.steps}`}</Result><ShapeSVG shape="sector" labels={{r,theta}}/></VStack>;
}

function GoldenRatioCalc() {
  const [x,setX]=useState("100");
  const out=useMemo(()=>{
    const X=n(x),phi=(1+Math.sqrt(5))/2;
    return {long:X*phi,short:X/phi,steps:`φ=(1+√5)/2≈${round(phi)}\nLong side = x·φ = ${X}·${round(phi)} = ${round(X*phi)}\nShort side = x/φ = ${X}/${round(phi)} = ${round(X/phi)}`};
  },[x]);
  return <VStack><div><Label>Given Length</Label><Input value={x} onChange={setX}/></div><BigResult value={round(out.long)} label="Golden Long Dimension"/><Result>{`Golden short dimension: ${round(out.short)}\n\n${out.steps}`}</Result></VStack>;
}

function CoordinateCalc() {
  const [x1,setX1]=useState("1"),[y1,setY1]=useState("2"),[x2,setX2]=useState("6"),[y2,setY2]=useState("8");
  const out=useMemo(()=>{
    const X1=n(x1),Y1=n(y1),X2=n(x2),Y2=n(y2);
    const dx=X2-X1,dy=Y2-Y1,dist=Math.sqrt(dx*dx+dy*dy),mid=[(X1+X2)/2,(Y1+Y2)/2];
    const m=dy/(dx||1e-9),b=Y1-m*X1;
    return {dist,mid,m,b,eq:`y=${round(m)}x ${b>=0?"+":"-"} ${round(Math.abs(b))}`,steps:`dx=${dx}, dy=${dy}\nDistance=√(dx²+dy²)=${round(dist)}\nMidpoint=((${X1}+${X2})/2,(${Y1}+${Y2})/2)=(${round(mid[0])},${round(mid[1])})\nSlope=dy/dx=${round(m)}\nLine: y=mx+b => ${Y1}=${round(m)}(${X1})+b => b=${round(b)}`};
  },[x1,y1,x2,y2]);
  return <VStack><Grid2><div><Label>x1</Label><Input value={x1} onChange={setX1}/></div><div><Label>y1</Label><Input value={y1} onChange={setY1}/></div></Grid2><Grid2><div><Label>x2</Label><Input value={x2} onChange={setX2}/></div><div><Label>y2</Label><Input value={y2} onChange={setY2}/></div></Grid2><BigResult value={round(out.dist)} label="Distance"/><Result>{`Midpoint: (${round(out.mid[0])}, ${round(out.mid[1])})\nSlope: ${round(out.m)}\nIntercept: ${round(out.b)}\nEquation: ${out.eq}\n\n${out.steps}`}</Result></VStack>;
}

const TOOLS = [
  { id:"area-calc", cat:"geometry", name:"Area Calculator", icon:"📐", desc:"Area for 10 common shapes with formula and diagram.", free:true },
  { id:"perimeter-calc", cat:"geometry", name:"Perimeter Calculator", icon:"📏", desc:"Perimeter/circumference for 10 shapes with formula and diagram.", free:true },
  { id:"volume-calc", cat:"geometry", name:"Volume Calculator", icon:"🧊", desc:"Volume of 8 3D shapes with formula.", free:true },
  { id:"surface-area-calc", cat:"geometry", name:"Surface Area Calculator", icon:"📦", desc:"Surface area of 8 3D shapes with formula.", free:true },
  { id:"pythagorean-calc", cat:"geometry", name:"Pythagorean Calculator", icon:"📐", desc:"Solve right triangle sides with steps and diagram.", free:true },
  { id:"distance-calc", cat:"geometry", name:"Distance Between Points", icon:"📍", desc:"Distance from two coordinates with steps.", free:true },
  { id:"midpoint-calc", cat:"geometry", name:"Midpoint Calculator", icon:"🧭", desc:"Midpoint between two coordinates.", free:true },
  { id:"slope-calc", cat:"geometry", name:"Slope & Line Equation", icon:"📈", desc:"Slope, intercept, and line equation from two points.", free:true },
  { id:"angle-calc", cat:"geometry", name:"Angle Calculator", icon:"🔺", desc:"Triangle, supplementary, and complementary angles.", free:true },
  { id:"arc-length-calc", cat:"geometry", name:"Arc Length Calculator", icon:"⭕", desc:"Arc length and sector area from radius and angle.", free:true },
  { id:"golden-ratio-calc", cat:"geometry", name:"Golden Ratio Calculator", icon:"🌀", desc:"Golden dimensions from one measurement.", free:true },
  { id:"coordinate-calc", cat:"geometry", name:"Coordinate Line Properties", icon:"🧮", desc:"Slope, distance, midpoint, and equation together.", free:true },
  { id:"circle-calc", cat:"geometry", name:"Circle Calculator", icon:"⭕", desc:"Full circle report from radius, diameter, circumference, or area — solves all four properties at once with formulas.", free:true },
  { id:"triangle-solver", cat:"geometry", name:"Triangle Solver (SSS)", icon:"🔺", desc:"Solve a triangle from three sides: Heron area, perimeter, all three interior angles, and equilateral/isosceles/scalene type.", free:true },
  { id:"sphere-calc", cat:"geometry", name:"Sphere Calculator", icon:"🔵", desc:"Sphere volume, surface area, diameter, and great-circle circumference from the radius with exact formulas.", free:true },
  { id:"cylinder-calc", cat:"geometry", name:"Cylinder Calculator", icon:"🥫", desc:"Cylinder volume, base area, lateral surface, and total surface area from radius and height with formulas.", free:true },
  { id:"cone-calc", cat:"geometry", name:"Cone Calculator", icon:"🍦", desc:"Cone volume, slant height, lateral surface, base area, and total surface area from radius and height.", free:true },
  { id:"ellipse-calc", cat:"geometry", name:"Ellipse Calculator", icon:"🥚", desc:"Ellipse area, Ramanujan perimeter, eccentricity, and focal distance from the two semi-axes.", free:true },
  { id:"regular-polygon-calc", cat:"geometry", name:"Regular Polygon Calculator", icon:"⬡", desc:"Regular polygon interior/exterior angle, perimeter, apothem, area, and circumradius from side count and length.", free:true },
  { id:"trapezoid-calc", cat:"geometry", name:"Trapezoid Calculator", icon:"⏢", desc:"Trapezoid area, median (midsegment), and perimeter from the two parallel sides, height, and legs.", free:true },
  { id:"vector-2d-calc", cat:"geometry", name:"2D Vector Calculator", icon:"➡️", desc:"Magnitude, dot product, 2D cross (scalar), sum, and angle between two 2D vectors.", free:true },
  { id:"vector-3d-calc", cat:"geometry", name:"3D Vector Calculator", icon:"🧭", desc:"Magnitudes, dot product, cross product vector, and angle between two 3D vectors.", free:true },
  { id:"distance-3d-calc", cat:"geometry", name:"3D Distance Calculator", icon:"📐", desc:"Euclidean distance between two points in 3D space with the full √((Δx)²+(Δy)²+(Δz)²) breakdown.", free:true },
  { id:"cubic-solver", cat:"advanced", name:"Cubic Equation Solver", icon:"📉", desc:"Solve ax³+bx²+cx+d=0 for all three roots (real and complex) using the discriminant and Cardano/trigonometric method.", free:true },
  { id:"proportion-solver", cat:"number", name:"Proportion Solver", icon:"⚖️", desc:"Solve a/b = c/d for the missing term via cross multiplication. Leave one box blank to find x.", free:true },
  { id:"percent-error-calc", cat:"number", name:"Percent Error Calculator", icon:"🎯", desc:"Percent error between a measured/experimental value and the true/theoretical value, with absolute error.", free:true },

  { id:"gcd-lcm-calc", cat:"advanced", name:"GCD & LCM Calculator", icon:"➗", desc:"Compute GCD/LCM for 2–5 numbers with steps.", free:true },
  { id:"factorial-calc", cat:"advanced", name:"Factorial Calculator", icon:"❗", desc:"Factorial up to 20! with expansion.", free:true },
  { id:"fibonacci-calc", cat:"advanced", name:"Fibonacci Calculator", icon:"🧵", desc:"Generate sequence or nth term.", free:true },
  { id:"prime-checker", cat:"advanced", name:"Prime Checker", icon:"🔍", desc:"Check primality and nearest primes.", free:true },
  { id:"prime-factorization", cat:"advanced", name:"Prime Factorization", icon:"🧩", desc:"Prime factors with exponents.", free:true },
  { id:"quadratic-solver", cat:"advanced", name:"Quadratic Solver", icon:"📉", desc:"Solve ax²+bx+c with discriminant and roots.", free:true },
  { id:"logarithm-calc", cat:"advanced", name:"Logarithm Calculator", icon:"🪵", desc:"Log base 2, 10, e, custom.", free:true },
  { id:"modulo-calc", cat:"advanced", name:"Modulo Calculator", icon:"🧮", desc:"Modulo with quotient and remainder.", free:true },
  { id:"trigonometry-calc", cat:"advanced", name:"Trigonometry Calculator", icon:"📐", desc:"sin cos tan and inverse in deg/rad.", free:true },
  { id:"significant-figures", cat:"advanced", name:"Significant Figures", icon:"🔢", desc:"Round to sig figs with explanation.", free:true },
  { id:"rounding-calc", cat:"advanced", name:"Rounding Calculator", icon:"🎯", desc:"Round decimals, sig figs, or nearest.", free:true },
  { id:"number-to-words", cat:"advanced", name:"Number to Words", icon:"🗣️", desc:"Convert up to 1 trillion to English words.", free:true },
  { id:"scientific-notation", cat:"advanced", name:"Scientific Notation", icon:"🔬", desc:"Convert standard <-> scientific.", free:true },
  { id:"binary-calc", cat:"advanced", name:"Binary Arithmetic", icon:"💾", desc:"Binary + - × ÷ operations.", free:true },
  { id:"boolean-algebra", cat:"advanced", name:"Boolean Algebra", icon:"⚙️", desc:"Simplify boolean expression and truth table.", free:true },
  { id:"truth-table-gen", cat:"advanced", name:"Truth Table Generator", icon:"📋", desc:"Generate truth table for boolean expression.", free:true },
  { id:"set-theory-calc", cat:"advanced", name:"Set Theory Calculator", icon:"🫧", desc:"Union, intersection, difference + Venn text.", free:true },
  { id:"mean-median-mode", cat:"advanced", name:"Mean, Median & Mode Calculator", icon:"📊", desc:"Mean, median, mode, range, variance and standard deviation from a list of numbers.", free:true },
  { id:"permutation-combination", cat:"advanced", name:"Permutation & Combination Calculator", icon:"🔀", desc:"Compute nPr and nCr with n! and r!, using iterative products for large-number safety.", free:true },
  { id:"z-score-calculator", cat:"advanced", name:"Z-Score Calculator", icon:"🔔", desc:"Standard score z=(x−μ)/σ with an approximate normal-distribution percentile.", free:true },

  { id:"number-base-calc", cat:"number", name:"Number Base Converter", icon:"🔁", desc:"Convert bases 2,8,10,16 and custom.", free:true },
  { id:"complex-number-calc", cat:"number", name:"Complex Number Calculator", icon:"ℹ️", desc:"Add/subtract/multiply/divide complex numbers.", free:true },
  { id:"matrix-calc", cat:"number", name:"Matrix Calculator", icon:"🧱", desc:"2x2/3x3 add, multiply, determinant, inverse, transpose.", free:true },
  { id:"sequence-calc", cat:"number", name:"Sequence Calculator", icon:"📚", desc:"Nth term and sum for arithmetic/geometric.", free:true },
  { id:"percentage-advanced", cat:"number", name:"Advanced Percentage Calculator", icon:"💯", desc:"Comprehensive percentage operations.", free:true },
  { id:"ratio-simplifier", cat:"number", name:"Ratio Simplifier", icon:"⚖️", desc:"Simplify and generate equivalent ratios.", free:true },
  { id:"fraction-advanced", cat:"number", name:"Advanced Fraction Calculator", icon:"🍰", desc:"Fraction operations with steps.", free:true },
  { id:"roman-numeral-converter", cat:"number", name:"Roman Numeral Converter", icon:"🏛️", desc:"Convert numbers to Roman numerals and Roman numerals back to numbers (1–3999).", free:true },
  { id:"percentage-change-calculator", cat:"number", name:"Percentage Change Calculator", icon:"📶", desc:"Percent increase or decrease between an old and new value, with absolute difference.", free:true },
  { id:"decimal-to-fraction", cat:"number", name:"Decimal to Fraction Converter", icon:"½", desc:"Convert terminating or repeating decimals to a simplified fraction, mixed number, and GCD.", free:true },
];

const CATEGORIES = [
  { id:"geometry", name:"Geometry Calculators", icon:"📐", desc:"Shape, coordinate, and triangle calculators with formulas and diagrams." },
  { id:"advanced", name:"Advanced Math", icon:"🧠", desc:"Prime, quadratic, trig, logic, sets, and numeric analysis tools." },
  { id:"number", name:"Number Conversions", icon:"🔢", desc:"Bases, complex numbers, matrix ops, sequences, fractions, and percentages." },
];

// Per-tool SEO metadata: keyed by tool id. Consumed in ToolPage via TOOL_META[toolId].
const TOOL_META = {
  "area-calc": { title:"Free Area Calculator — Find Area of Any Shape Online", desc:"Calculate the area of squares, rectangles, triangles, circles, trapezoids and 10+ shapes with the exact formula shown. Free, no signup, works in-browser.", keywords:"area calculator, area of shapes, rectangle area, circle area, triangle area", faq:[["Which shapes can I calculate the area of?","Ten common shapes including square, rectangle, triangle, circle, parallelogram, trapezoid, rhombus, ellipse, sector and regular polygon — each with its own formula and inputs."],["What formula is used for a circle?","Area = π × r², where r is the radius. Enter the radius and the calculator multiplies it by pi automatically."],["What units does it use?","It is unit-agnostic — enter all measurements in the same unit (cm, m, in, ft) and the area is returned in that unit squared."]], howTo:"Pick a shape, type in its dimensions such as length, width or radius, and the area appears instantly along with the formula used." },
  "perimeter-calc": { title:"Free Perimeter Calculator — Perimeter & Circumference", desc:"Find the perimeter or circumference of 10 shapes from your measurements, with the formula and diagram shown. 100% free, no signup, runs in your browser.", keywords:"perimeter calculator, circumference calculator, perimeter of shapes, rectangle perimeter", faq:[["What is the difference between perimeter and circumference?","Perimeter is the total distance around a straight-sided shape; circumference is that same distance for a circle, found with 2 × π × r."],["Can it handle a rectangle?","Yes — enter length and width and it returns 2 × (length + width) as the perimeter."],["Which shapes are supported?","Square, rectangle, triangle, circle, parallelogram, trapezoid, rhombus, regular polygon and more, each with its own formula."]], howTo:"Choose the shape, enter its side lengths or radius, and the perimeter or circumference is calculated instantly with the formula displayed." },
  "volume-calc": { title:"Free Volume Calculator — Volume of 3D Shapes Online", desc:"Calculate the volume of cubes, spheres, cylinders, cones, pyramids and 8 solids with formulas shown. Free, no signup, all math runs in your browser.", keywords:"volume calculator, cylinder volume, sphere volume, cone volume, 3d volume", faq:[["Which 3D shapes are supported?","Eight solids: cube, rectangular box, sphere, cylinder, cone, pyramid, prism and more, each with the correct volume formula."],["How is the volume of a cylinder found?","Volume = π × r² × h, using the base radius and the height of the cylinder."],["What units are used?","Any consistent unit — enter dimensions in the same unit and volume is returned in that unit cubed (e.g. cm³)."]], howTo:"Select a 3D shape, enter its dimensions such as radius and height, and the volume is computed instantly with the formula shown." },
  "surface-area-calc": { title:"Free Surface Area Calculator — 3D Shapes Online", desc:"Compute the surface area of spheres, cylinders, cones, cubes and 8 solids with the exact formula shown. Free, no signup, calculated in your browser.", keywords:"surface area calculator, sphere surface area, cylinder surface area, cone surface area", faq:[["What is surface area?","The total area of all outer faces or curved surfaces of a 3D shape, measured in square units."],["How is a sphere's surface area calculated?","Surface area = 4 × π × r², where r is the radius of the sphere."],["Does it include the base of a cone or cylinder?","Yes — the total surface area includes both the curved lateral surface and the circular base(s)."]], howTo:"Choose a solid, enter its radius, height or side length, and the surface area appears instantly with the formula used." },
  "pythagorean-calc": { title:"Free Pythagorean Theorem Calculator — Right Triangle", desc:"Solve any missing side of a right triangle using a² + b² = c², with step-by-step working and a diagram. Free, no signup, runs entirely in-browser.", keywords:"pythagorean calculator, pythagorean theorem, right triangle calculator, hypotenuse calculator", faq:[["What is the Pythagorean theorem?","In a right triangle, a² + b² = c², where c is the hypotenuse (the longest side, opposite the right angle)."],["Can it find a leg, not just the hypotenuse?","Yes — leave any one side blank and it solves for it, e.g. b = √(c² − a²)."],["What if my triangle is not right-angled?","The Pythagorean theorem only applies to right triangles; use the triangle solver for other triangles."]], howTo:"Enter any two of the three sides (legs a, b or hypotenuse c) and leave the unknown blank; the missing side is solved with steps shown." },
  "distance-calc": { title:"Free Distance Between Two Points Calculator Online", desc:"Find the straight-line distance between two (x, y) coordinates using the distance formula, with steps shown. Free, no signup, works in your browser.", keywords:"distance calculator, distance between two points, distance formula, coordinate distance", faq:[["What formula finds the distance between two points?","The distance formula d = √((x₂−x₁)² + (y₂−y₁)²), derived from the Pythagorean theorem."],["Does it work with negative coordinates?","Yes — enter any real numbers, positive or negative, for both points and it computes the distance correctly."],["Can I see the working?","Yes — the calculator shows the substituted values and each step of the calculation."]], howTo:"Enter the x and y coordinates of both points and the straight-line distance is calculated instantly with the formula and steps shown." },
  "midpoint-calc": { title:"Free Midpoint Calculator — Find Midpoint of a Line", desc:"Calculate the midpoint between two (x, y) coordinates using the midpoint formula, with steps shown. Free, no signup, runs entirely in your browser.", keywords:"midpoint calculator, midpoint formula, coordinate midpoint, line midpoint", faq:[["What is the midpoint formula?","The midpoint is ((x₁+x₂)/2, (y₁+y₂)/2) — the average of the two x-values and the two y-values."],["What does the midpoint represent?","It is the exact center point of the line segment joining the two coordinates."],["Can I use decimals or negatives?","Yes — any real numbers are accepted for both points and the midpoint is computed exactly."]], howTo:"Enter the coordinates of both endpoints and the midpoint is calculated instantly by averaging the x and y values." },
  "slope-calc": { title:"Free Slope Calculator — Slope & Line Equation Online", desc:"Find the slope, y-intercept and equation of a line from two points, with the rise-over-run steps shown. Free, no signup, works in your browser.", keywords:"slope calculator, slope formula, line equation, y-intercept calculator, gradient", faq:[["How is slope calculated?","Slope m = (y₂−y₁)/(x₂−x₁), the rise divided by the run between the two points."],["What if the line is vertical?","A vertical line has an undefined slope because the run (x₂−x₁) is zero; the calculator reports this."],["Does it give the line equation?","Yes — it returns the slope-intercept form y = mx + b along with the slope and intercept."]], howTo:"Enter two points and the calculator returns the slope, the y-intercept and the full y = mx + b line equation with steps." },
  "angle-calc": { title:"Free Angle Calculator — Triangle & Angle Pairs Online", desc:"Find a missing triangle angle, or supplementary and complementary angles, instantly. Free, no signup, all calculations run in your browser.", keywords:"angle calculator, complementary angle, supplementary angle, triangle angle calculator", faq:[["How do I find a third triangle angle?","The three interior angles of a triangle sum to 180°, so the third angle equals 180° minus the other two."],["What are complementary and supplementary angles?","Complementary angles add up to 90°; supplementary angles add up to 180°."],["Can it find the complement of any angle?","Yes — enter one angle and it returns both its complement (90° − angle) and supplement (180° − angle)."]], howTo:"Choose the angle type, enter the known angle(s), and the missing or paired angle is calculated instantly." },
  "arc-length-calc": { title:"Free Arc Length Calculator — Arc & Sector Area Online", desc:"Calculate arc length and sector area from a circle's radius and central angle, with formulas shown. Free, no signup, runs in your browser.", keywords:"arc length calculator, sector area, central angle, circle arc calculator", faq:[["How is arc length calculated?","Arc length = r × θ when θ is in radians, or (θ/360) × 2πr when θ is in degrees."],["What is the sector area formula?","Sector area = (θ/360) × πr² in degrees, or ½ × r² × θ in radians."],["Do I enter the angle in degrees or radians?","You can use degrees — the calculator handles the conversion and shows both the arc length and sector area."]], howTo:"Enter the radius and the central angle and the calculator returns the arc length and the sector area with formulas shown." },
  "golden-ratio-calc": { title:"Free Golden Ratio Calculator — Phi Proportions Online", desc:"Compute golden ratio dimensions from a single measurement using phi (≈1.618), for design and layout. Free, no signup, runs in your browser.", keywords:"golden ratio calculator, phi calculator, golden ratio, 1.618 calculator, divine proportion", faq:[["What is the golden ratio?","Phi (φ) ≈ 1.618, the ratio where a+b is to a as a is to b. It appears in art, design and nature."],["How is it calculated from one number?","Enter one length and the calculator multiplies or divides by 1.618 to give the longer and shorter golden segments."],["Where is the golden ratio used?","In layout design, typography, logo proportions, photography composition and architecture for visually pleasing balance."]], howTo:"Type in one known measurement and the calculator returns the corresponding golden-ratio larger and smaller values using phi." },
  "coordinate-calc": { title:"Free Coordinate Calculator — Line Properties Online", desc:"Get slope, distance, midpoint and the line equation for two points all at once, with steps. Free, no signup, all math runs in your browser.", keywords:"coordinate calculator, line properties, slope distance midpoint, two point calculator", faq:[["What does this calculator return?","From two points it computes the slope, the distance between them, the midpoint and the slope-intercept line equation together."],["Why calculate all properties at once?","It saves switching tools — one entry of two points gives every key line property in a single result."],["Does it handle vertical lines?","Yes — it flags an undefined slope and reports the remaining properties that still apply."]], howTo:"Enter the coordinates of two points and the calculator returns slope, distance, midpoint and the line equation in one view." },
  "circle-calc": { title:"Free Circle Calculator — Radius, Area & Circumference", desc:"Enter any one of radius, diameter, circumference or area and solve all four circle properties at once with formulas. Free, no signup, in-browser.", keywords:"circle calculator, circle area, circumference calculator, radius diameter calculator", faq:[["What can I enter to solve a circle?","Any single value — radius, diameter, circumference or area — and the calculator derives the other three."],["What are the circle formulas used?","Area = πr², circumference = 2πr, and diameter = 2r; each is applied automatically from your input."],["How accurate is pi in the results?","It uses JavaScript's built-in high-precision value of π, so results are accurate to many decimal places."]], howTo:"Type any one known circle measurement and the tool instantly solves the radius, diameter, circumference and area with formulas." },
  "triangle-solver": { title:"Free Triangle Solver (SSS) — Sides, Angles & Area", desc:"Solve a triangle from three sides: get Heron's area, perimeter, all three angles and the triangle type. Free, no signup, runs in your browser.", keywords:"triangle solver, sss triangle calculator, heron area, triangle angles, triangle type", faq:[["What is SSS solving?","Side-Side-Side: given all three side lengths, the calculator determines the angles, area, perimeter and classification."],["How is the area found from three sides?","With Heron's formula: area = √(s(s−a)(s−b)(s−c)), where s is the semi-perimeter (a+b+c)/2."],["How are the angles calculated?","Using the law of cosines, e.g. cos(A) = (b²+c²−a²)/(2bc), for each of the three interior angles."]], howTo:"Enter the three side lengths and the solver returns the area, perimeter, all three interior angles and whether it is scalene, isosceles or equilateral." },
  "sphere-calc": { title:"Free Sphere Calculator — Volume & Surface Area Online", desc:"Compute a sphere's volume, surface area, diameter and great-circle circumference from its radius with exact formulas. Free, no signup, in-browser.", keywords:"sphere calculator, sphere volume, sphere surface area, great circle circumference", faq:[["What sphere properties are calculated?","From the radius it returns volume, surface area, diameter and the great-circle circumference."],["What are the sphere formulas?","Volume = (4/3)πr³ and surface area = 4πr², with diameter = 2r and great-circle circumference = 2πr."],["What is a great circle?","The largest circle that can be drawn on a sphere, passing through its center; its circumference is 2πr."]], howTo:"Enter the sphere's radius and the calculator instantly returns its volume, surface area, diameter and great-circle circumference." },
  "cylinder-calc": { title:"Free Cylinder Calculator — Volume & Surface Area", desc:"Find a cylinder's volume, base area, lateral surface and total surface area from radius and height with formulas. Free, no signup, in-browser.", keywords:"cylinder calculator, cylinder volume, lateral surface area, cylinder surface area", faq:[["What is the volume of a cylinder?","Volume = π × r² × h, the base area times the height."],["What is lateral surface area?","The curved side surface only: 2πrh, excluding the two circular ends."],["How is total surface area found?","Total surface area = 2πrh + 2πr², adding the curved side to both circular bases."]], howTo:"Enter the base radius and the height and the calculator returns the volume, base area, lateral surface and total surface area." },
  "cone-calc": { title:"Free Cone Calculator — Volume, Slant & Surface Area", desc:"Calculate a cone's volume, slant height, lateral surface, base area and total surface area from radius and height. Free, no signup, in-browser.", keywords:"cone calculator, cone volume, slant height, cone surface area, lateral surface", faq:[["How is a cone's volume calculated?","Volume = (1/3)πr²h — one third of the equivalent cylinder's volume."],["What is the slant height?","The distance from the base edge to the apex, found with l = √(r² + h²)."],["What is the total surface area of a cone?","Total surface area = πr² + πrl, the circular base plus the lateral (slant) surface."]], howTo:"Enter the base radius and vertical height and the calculator returns the volume, slant height, lateral surface, base area and total surface area." },
  "ellipse-calc": { title:"Free Ellipse Calculator — Area, Perimeter & Eccentricity", desc:"Compute an ellipse's area, Ramanujan perimeter, eccentricity and focal distance from its two semi-axes. Free, no signup, runs in your browser.", keywords:"ellipse calculator, ellipse area, ellipse perimeter, eccentricity, focal distance", faq:[["How is the area of an ellipse found?","Area = π × a × b, where a and b are the semi-major and semi-minor axes."],["Why use Ramanujan's perimeter formula?","An ellipse perimeter has no simple exact formula; Ramanujan's approximation is extremely accurate and fast to compute."],["What is eccentricity?","A measure of how elongated the ellipse is: e = √(1 − b²/a²), where 0 is a circle and values near 1 are very stretched."]], howTo:"Enter the semi-major (a) and semi-minor (b) axes and the calculator returns area, perimeter, eccentricity and focal distance." },
  "regular-polygon-calc": { title:"Free Regular Polygon Calculator — Area & Angles Online", desc:"Find a regular polygon's interior and exterior angles, perimeter, apothem, area and circumradius from sides and length. Free, no signup, in-browser.", keywords:"regular polygon calculator, interior angle, apothem, polygon area, circumradius", faq:[["How is the interior angle of a regular polygon found?","Interior angle = (n−2) × 180° / n, where n is the number of sides."],["What is the apothem?","The distance from the center to the midpoint of a side; it equals s / (2 tan(π/n)) for side length s."],["How is the area calculated?","Area = (1/2) × perimeter × apothem, or equivalently (1/4)n·s²·cot(π/n)."]], howTo:"Enter the number of sides and the side length and the calculator returns angles, perimeter, apothem, area and circumradius." },
  "trapezoid-calc": { title:"Free Trapezoid Calculator — Area, Median & Perimeter", desc:"Calculate a trapezoid's area, median (midsegment) and perimeter from its parallel sides, height and legs. Free, no signup, runs in your browser.", keywords:"trapezoid calculator, trapezoid area, midsegment, median trapezoid, trapezoid perimeter", faq:[["What is the area formula for a trapezoid?","Area = ½ × (a + b) × h, where a and b are the parallel sides and h is the height between them."],["What is the median or midsegment?","The median = (a + b)/2, the average of the two parallel sides, which equals the length of the midsegment."],["How is the perimeter found?","Add all four sides: the two parallel sides plus the two legs."]], howTo:"Enter the two parallel sides, the height and the legs and the calculator returns the area, median and perimeter." },
  "vector-2d-calc": { title:"Free 2D Vector Calculator — Dot Product & Angle Online", desc:"Compute magnitude, dot product, 2D cross product, sum and the angle between two 2D vectors. Free, no signup, all math runs in your browser.", keywords:"2d vector calculator, dot product, vector magnitude, angle between vectors, cross product", faq:[["How is the dot product of 2D vectors found?","Dot product = x₁x₂ + y₁y₂, the sum of the products of matching components."],["What does the 2D cross product return?","A scalar, x₁y₂ − x₂y₁, whose magnitude is the area of the parallelogram the two vectors span."],["How is the angle between vectors calculated?","cos(θ) = (a · b) / (|a| |b|), so θ = arccos of the dot product over the product of magnitudes."]], howTo:"Enter the x and y components of both vectors and the calculator returns their magnitudes, dot product, cross product, sum and angle." },
  "vector-3d-calc": { title:"Free 3D Vector Calculator — Cross Product & Angle", desc:"Find magnitudes, dot product, the cross-product vector and the angle between two 3D vectors. Free, no signup, runs entirely in your browser.", keywords:"3d vector calculator, cross product, dot product 3d, vector angle, vector magnitude", faq:[["How is the 3D cross product calculated?","The cross product is a vector: (y₁z₂−z₁y₂, z₁x₂−x₁z₂, x₁y₂−y₁x₂), perpendicular to both inputs."],["What does the dot product tell me?","It measures alignment: positive means a similar direction, zero means perpendicular, negative means opposite directions."],["How is the angle between two 3D vectors found?","θ = arccos((a · b) / (|a| |b|)), using the dot product and both magnitudes."]], howTo:"Enter the x, y and z components of both vectors and the calculator returns magnitudes, dot product, cross product and the angle." },
  "distance-3d-calc": { title:"Free 3D Distance Calculator — Distance in 3D Space", desc:"Calculate the straight-line distance between two points in 3D space with the full delta-x, delta-y, delta-z breakdown. Free, no signup, in-browser.", keywords:"3d distance calculator, distance in 3d, euclidean distance, 3d coordinate distance", faq:[["What is the 3D distance formula?","d = √((x₂−x₁)² + (y₂−y₁)² + (z₂−z₁)²), the 3D extension of the Pythagorean theorem."],["Does it show the component differences?","Yes — it shows Δx, Δy and Δz along with the squared terms in the final calculation."],["Can I use negative coordinates?","Yes — any real numbers work for all six coordinate values across both points."]], howTo:"Enter the x, y and z coordinates of both points and the calculator returns the 3D distance with the full breakdown." },
  "cubic-solver": { title:"Free Cubic Equation Solver — Solve ax³+bx²+cx+d=0", desc:"Solve any cubic equation for all three roots, real and complex, using the discriminant and Cardano's method. Free, no signup, runs in-browser.", keywords:"cubic equation solver, cubic roots, cardano method, solve cubic, third degree equation", faq:[["What does a cubic solver find?","All three roots of ax³ + bx² + cx + d = 0, which may be three real roots or one real and two complex roots."],["What method does it use?","The discriminant determines the root type, then Cardano's formula or the trigonometric method computes the roots."],["Can a cubic have complex roots?","Yes — when the discriminant is negative, two of the roots form a complex-conjugate pair."]], howTo:"Enter the coefficients a, b, c and d and the solver returns all three roots along with the discriminant." },
  "proportion-solver": { title:"Free Proportion Solver — Solve a/b = c/d for x", desc:"Solve any proportion a/b = c/d for the missing term by cross multiplication — just leave one box blank. Free, no signup, runs in your browser.", keywords:"proportion solver, cross multiplication, solve proportion, ratio proportion calculator", faq:[["How does cross multiplication work?","For a/b = c/d, the products a×d and b×c are equal, so the missing term is found by rearranging that equation."],["Which term can I leave blank?","Any one of the four — a, b, c or d. The solver finds whichever value is missing."],["What are proportions used for?","Scaling recipes, converting units, map distances, and any situation where two ratios must stay equal."]], howTo:"Fill in three of the four values in a/b = c/d, leave the unknown blank, and the solver cross-multiplies to find it." },
  "percent-error-calc": { title:"Free Percent Error Calculator — Measured vs True Value", desc:"Calculate the percent error between a measured value and the true value, plus the absolute error. Free, no signup, all math runs in your browser.", keywords:"percent error calculator, percentage error, experimental error, measured vs true value", faq:[["What is the percent error formula?","Percent error = |measured − true| / |true| × 100%, showing how far a measurement is from the accepted value."],["Why use the absolute value?","Percent error is usually reported as a positive magnitude regardless of whether the measurement was over or under."],["Where is percent error used?","In science labs, engineering and quality control to judge how accurate an experimental result is."]], howTo:"Enter the measured (experimental) value and the true (theoretical) value and the calculator returns the percent error and absolute error." },
  "gcd-lcm-calc": { title:"Free GCD & LCM Calculator — Greatest Common Divisor", desc:"Compute the GCD and LCM of 2 to 5 numbers with the step-by-step working shown. Free, no signup, all calculations run in your browser.", keywords:"gcd calculator, lcm calculator, greatest common divisor, least common multiple, hcf", faq:[["What are GCD and LCM?","GCD is the largest number that divides all inputs; LCM is the smallest number they all divide into."],["How are they computed?","The GCD uses the Euclidean algorithm; the LCM uses the identity LCM(a,b) = |a×b| / GCD(a,b), applied across all numbers."],["How many numbers can I enter?","Between 2 and 5 numbers, separated by commas or spaces."]], howTo:"Enter 2 to 5 whole numbers separated by commas and the calculator returns the GCD, the LCM and each intermediate step." },
  "factorial-calc": { title:"Free Factorial Calculator — Compute n! with Expansion", desc:"Calculate the factorial of any integer up to 20! and see the full multiplication expansion. Free, no signup, runs entirely in your browser.", keywords:"factorial calculator, n factorial, factorial expansion, combinatorics calculator", faq:[["What is a factorial?","n! is the product of all positive integers up to n, so 5! = 5 × 4 × 3 × 2 × 1 = 120."],["What is 0! equal to?","0! is defined as 1, a convention that keeps combinatorics formulas consistent."],["Why is the limit 20!?","20! is the largest factorial that fits exactly in a standard 64-bit number without losing precision."]], howTo:"Enter a whole number from 0 to 20 and the calculator returns its factorial along with the full multiplication expansion." },
  "fibonacci-calc": { title:"Free Fibonacci Calculator — Sequence & Nth Term Online", desc:"Generate the Fibonacci sequence or find the nth term instantly, where each number is the sum of the two before it. Free, no signup, in-browser.", keywords:"fibonacci calculator, fibonacci sequence, nth fibonacci number, golden ratio sequence", faq:[["What is the Fibonacci sequence?","A series starting 0, 1 where each term is the sum of the previous two: 0, 1, 1, 2, 3, 5, 8, 13..."],["Can it find just the nth term?","Yes — enter a position n and the calculator returns that single Fibonacci number, or the whole sequence up to n."],["How does Fibonacci relate to the golden ratio?","The ratio of consecutive Fibonacci numbers approaches the golden ratio (≈1.618) as the terms grow larger."]], howTo:"Enter how many terms you want or an nth position, and the calculator generates the Fibonacci sequence or that term." },
  "prime-checker": { title:"Free Prime Number Checker — Test Primality Online", desc:"Check whether a number is prime and find the nearest primes above and below it. Free, no signup, all calculations run in your browser.", keywords:"prime checker, is it prime, primality test, prime number calculator, nearest prime", faq:[["What makes a number prime?","A prime number greater than 1 has exactly two divisors: 1 and itself, so it cannot be evenly divided by any other number."],["How is primality tested?","The checker tests divisibility by integers up to the square root of the number — enough to confirm primality efficiently."],["Is 1 a prime number?","No — 1 has only a single divisor, so by definition it is neither prime nor composite."]], howTo:"Enter any whole number and the tool reports whether it is prime and shows the nearest prime numbers on either side." },
  "prime-factorization": { title:"Free Prime Factorization Calculator — Factor Trees", desc:"Break any number down into its prime factors with exponents, e.g. 360 = 2³ × 3² × 5. Free, no signup, runs entirely in your browser.", keywords:"prime factorization, prime factors, factor calculator, factorization with exponents", faq:[["What is prime factorization?","Expressing a number as a product of prime numbers, such as 60 = 2² × 3 × 5."],["Is the prime factorization unique?","Yes — by the fundamental theorem of arithmetic, every integer above 1 has exactly one prime factorization."],["How are exponents shown?","Repeated prime factors are grouped, so 8 is shown as 2³ rather than 2 × 2 × 2."]], howTo:"Enter a whole number and the calculator returns its prime factors written with exponents in ascending order." },
  "quadratic-solver": { title:"Free Quadratic Equation Solver — ax²+bx+c=0 Online", desc:"Solve any quadratic equation for its roots using the discriminant and quadratic formula, with steps. Free, no signup, runs in your browser.", keywords:"quadratic solver, quadratic formula, quadratic equation, discriminant, solve for x", faq:[["What is the quadratic formula?","x = (−b ± √(b²−4ac)) / 2a, which gives both roots of ax² + bx + c = 0."],["What does the discriminant tell me?","b²−4ac indicates the root type: positive gives two real roots, zero gives one repeated root, negative gives two complex roots."],["Can it return complex roots?","Yes — when the discriminant is negative the solver reports the complex-conjugate root pair."]], howTo:"Enter the coefficients a, b and c and the solver returns the discriminant and both roots with the formula shown." },
  "logarithm-calc": { title:"Free Logarithm Calculator — Log Base 2, 10, e & Custom", desc:"Compute logarithms in base 2, 10, natural (e) or any custom base instantly. Free, no signup, all calculations run in your browser.", keywords:"logarithm calculator, log base 2, natural log, ln calculator, log base 10, custom base", faq:[["What is a logarithm?","The logarithm answers 'what exponent gives this number?' — log_b(x) = y means bʸ = x."],["What is the difference between log and ln?","log usually means base 10, while ln is the natural logarithm with base e (≈2.71828)."],["How is a custom base handled?","Using the change-of-base formula log_b(x) = ln(x) / ln(b), so any base can be evaluated."]], howTo:"Enter the number and choose a base — 2, 10, e or a custom value — and the logarithm is calculated instantly." },
  "modulo-calc": { title:"Free Modulo Calculator — Remainder & Quotient Online", desc:"Calculate the modulo (remainder) and quotient of any division, including negative numbers. Free, no signup, runs entirely in your browser.", keywords:"modulo calculator, remainder calculator, mod operation, quotient calculator, modulus", faq:[["What does the modulo operation do?","It returns the remainder after dividing one number by another, so 17 mod 5 = 2."],["How are negative numbers handled?","The calculator shows the standard result and explains sign conventions, since languages differ on negative modulo."],["Where is modulo used?","In programming for cycling through values, checking even/odd, hashing, and wrapping clock or calendar arithmetic."]], howTo:"Enter the dividend and the divisor and the calculator returns both the quotient and the modulo (remainder)." },
  "trigonometry-calc": { title:"Free Trigonometry Calculator — sin, cos, tan & Inverse", desc:"Compute sine, cosine, tangent and their inverses in degrees or radians. Free, no signup, all trig calculations run in your browser.", keywords:"trigonometry calculator, sin cos tan, inverse trig, arcsin arccos arctan, degrees radians", faq:[["Can I switch between degrees and radians?","Yes — choose your angle unit and the calculator interprets and returns values accordingly."],["What inverse functions are supported?","Arcsin, arccos and arctan, which return the angle for a given ratio."],["What is the range of valid inputs for arcsin?","Arcsin and arccos accept values between −1 and 1; outside that range the result is undefined."]], howTo:"Pick a function, choose degrees or radians, enter the angle or ratio, and the trig value is calculated instantly." },
  "significant-figures": { title:"Free Significant Figures Calculator — Round to Sig Figs", desc:"Round any number to a chosen number of significant figures with a clear explanation. Free, no signup, all math runs in your browser.", keywords:"significant figures calculator, sig figs, rounding sig figs, scientific rounding", faq:[["What are significant figures?","The meaningful digits in a number that carry precision, starting from the first non-zero digit."],["Do leading zeros count?","No — leading zeros are placeholders and are not significant, but zeros between or after significant digits usually are."],["Why round to significant figures?","To report measurements with a precision that honestly reflects the accuracy of the instrument or data."]], howTo:"Enter a number and the desired number of significant figures, and the calculator returns the rounded value with an explanation." },
  "rounding-calc": { title:"Free Rounding Calculator — Decimals, Sig Figs & Nearest", desc:"Round numbers to decimal places, significant figures or the nearest 10, 100 or 1000. Free, no signup, runs entirely in your browser.", keywords:"rounding calculator, round to decimal places, round to nearest, sig fig rounding", faq:[["What rounding modes are available?","Round to a set number of decimal places, to significant figures, or to the nearest 10, 100, 1000 and so on."],["How does rounding to the nearest 100 work?","The number is snapped to the closest multiple of 100, so 1,234 becomes 1,200."],["What is the standard rounding rule?","Digits 5 and above round up, digits below 5 round down (round-half-up), which this calculator uses."]], howTo:"Enter a number, choose a rounding mode and precision, and the rounded result appears instantly." },
  "number-to-words": { title:"Free Number to Words Converter — Spell Out Numbers", desc:"Convert any number up to one trillion into written English words, ideal for cheques and documents. Free, no signup, runs in your browser.", keywords:"number to words, number spelling, spell out numbers, amount in words, cheque writer", faq:[["How large a number can it convert?","Numbers up to one trillion are spelled out in full English words."],["Does it handle decimals?","The whole-number part is converted to words; use it for cheque amounts and formal writing."],["Where is this useful?","Writing cheques, legal documents, invoices and anywhere an amount must appear in words as well as digits."]], howTo:"Type a number and the converter instantly writes it out in English words, up to one trillion." },
  "scientific-notation": { title:"Free Scientific Notation Converter — Standard ↔ Sci", desc:"Convert numbers between standard decimal form and scientific (E) notation in both directions. Free, no signup, runs in your browser.", keywords:"scientific notation converter, standard form, e notation, exponential notation, sci notation", faq:[["What is scientific notation?","A compact way to write very large or small numbers as a coefficient times a power of ten, e.g. 3.2 × 10⁴."],["Can it convert both ways?","Yes — enter standard decimal form to get scientific notation, or enter scientific notation to get the standard number."],["What is the coefficient rule?","In proper scientific notation the coefficient is at least 1 and less than 10, with the exponent absorbing the rest."]], howTo:"Enter a number in either standard or scientific form and the converter returns the equivalent in the other notation." },
  "binary-calc": { title:"Free Binary Calculator — Add, Subtract & Multiply Binary", desc:"Perform binary addition, subtraction, multiplication and division with decimal equivalents shown. Free, no signup, runs in your browser.", keywords:"binary calculator, binary addition, binary arithmetic, binary multiplication, base 2 math", faq:[["What operations are supported?","Binary addition, subtraction, multiplication and division on base-2 numbers."],["Does it show the decimal equivalent?","Yes — each binary input and the result are shown alongside their decimal values for clarity."],["What input is valid?","Only 0s and 1s — any other characters are rejected as invalid binary."]], howTo:"Enter two binary numbers, pick an operation, and the calculator returns the binary result with the decimal equivalent." },
  "boolean-algebra": { title:"Free Boolean Algebra Simplifier — Logic & Truth Table", desc:"Simplify a boolean expression and view its full truth table for AND, OR, NOT and XOR. Free, no signup, runs entirely in your browser.", keywords:"boolean algebra calculator, boolean simplifier, logic simplification, truth table, and or not", faq:[["What operators are supported?","AND, OR, NOT and XOR combining boolean variables into an expression."],["What does simplification produce?","A reduced equivalent expression that gives the same output for every input combination but with fewer terms."],["Does it show a truth table?","Yes — the full truth table lists every variable combination and the resulting output."]], howTo:"Type a boolean expression using AND, OR, NOT and variables, and the tool returns a simplified form plus the truth table." },
  "truth-table-gen": { title:"Free Truth Table Generator — Boolean Logic Online", desc:"Generate a complete truth table for any boolean expression across all variable combinations. Free, no signup, runs in your browser.", keywords:"truth table generator, boolean truth table, logic table, and or not xor table", faq:[["What is a truth table?","A table listing every possible combination of input values and the resulting output of a logical expression."],["How many rows will it have?","2ⁿ rows for n variables — 2 variables give 4 rows, 3 variables give 8 rows, and so on."],["Which operators can I use?","AND, OR, NOT and XOR, combined with parentheses and single-letter variables."]], howTo:"Enter a boolean expression with variables and operators, and the generator builds the complete truth table for all input combinations." },
  "set-theory-calc": { title:"Free Set Theory Calculator — Union, Intersection & Diff", desc:"Compute the union, intersection and difference of two sets with a text Venn breakdown. Free, no signup, all math runs in your browser.", keywords:"set theory calculator, union intersection, set difference, venn diagram, set operations", faq:[["What set operations are supported?","Union (all elements), intersection (shared elements) and difference (elements in one set but not the other)."],["How do I enter the sets?","List each set's elements separated by commas; duplicates are automatically ignored."],["What is the difference between A−B and B−A?","A−B keeps elements only in A; B−A keeps elements only in B — the two are usually different."]], howTo:"Enter the elements of two sets and the calculator returns their union, intersection and differences with a Venn text summary." },
  "mean-median-mode": { title:"Free Mean, Median & Mode Calculator — Statistics Online", desc:"Find the mean, median, mode, range, variance and standard deviation from a list of numbers. Free, no signup, runs in your browser.", keywords:"mean median mode calculator, average calculator, standard deviation, variance, range statistics", faq:[["What is the difference between mean, median and mode?","Mean is the average, median is the middle value when sorted, and mode is the most frequently occurring value."],["Does it calculate standard deviation?","Yes — it returns the variance and standard deviation, which measure how spread out the numbers are."],["How do I enter my data?","Type your numbers separated by commas or spaces; the calculator sorts and analyzes them automatically."]], howTo:"Enter a list of numbers separated by commas and the calculator returns the mean, median, mode, range, variance and standard deviation." },
  "permutation-combination": { title:"Free Permutation & Combination Calculator — nPr & nCr", desc:"Calculate permutations (nPr) and combinations (nCr) with factorials, safe for large numbers. Free, no signup, runs in your browser.", keywords:"permutation calculator, combination calculator, npr ncr, factorial combinatorics, choose calculator", faq:[["What is the difference between nPr and nCr?","Permutations (nPr) count ordered arrangements; combinations (nCr) count selections where order does not matter."],["What are the formulas?","nPr = n! / (n−r)! and nCr = n! / (r!(n−r)!), where n is the total and r the number chosen."],["How does it stay accurate for large numbers?","It multiplies iteratively rather than computing huge factorials directly, avoiding overflow for large n."]], howTo:"Enter the total n and the number chosen r, and the calculator returns both the permutations (nPr) and combinations (nCr)." },
  "z-score-calculator": { title:"Free Z-Score Calculator — Standard Score & Percentile", desc:"Compute a z-score z=(x−μ)/σ and an approximate normal-distribution percentile. Free, no signup, all math runs in your browser.", keywords:"z-score calculator, standard score, normal distribution percentile, z score formula, standardize", faq:[["What is a z-score?","The number of standard deviations a value lies from the mean: z = (x − μ) / σ."],["What does a negative z-score mean?","It means the value is below the mean; a positive z-score means it is above the mean."],["What is the percentile output?","An approximate percentage of a normal distribution that falls below your value, derived from the z-score."]], howTo:"Enter the value x, the mean μ and the standard deviation σ, and the calculator returns the z-score and its approximate percentile." },
  "number-base-calc": { title:"Free Number Base Converter — Binary, Octal, Hex & More", desc:"Convert numbers between binary, octal, decimal, hexadecimal and custom bases (2–36). Free, no signup, runs entirely in your browser.", keywords:"number base converter, binary to decimal, hex converter, octal converter, base conversion", faq:[["Which bases are supported?","Binary (2), octal (8), decimal (10), hexadecimal (16) and any custom base from 2 to 36."],["How does hexadecimal represent values above 9?","It uses letters A–F for 10–15, so hex FF equals 255 in decimal."],["Can I convert between two non-decimal bases?","Yes — enter a value in any base and it is converted to all the others in one step."]], howTo:"Enter a number and its current base, then read the equivalent in binary, octal, decimal, hexadecimal or a custom base." },
  "complex-number-calc": { title:"Free Complex Number Calculator — Add, Multiply & Divide", desc:"Add, subtract, multiply and divide complex numbers in a+bi form with results shown. Free, no signup, runs in your browser.", keywords:"complex number calculator, imaginary numbers, a+bi arithmetic, complex division, i squared", faq:[["How are complex numbers written?","In the form a + bi, where a is the real part, b the imaginary part, and i is √(−1)."],["How is complex multiplication done?","(a+bi)(c+di) = (ac−bd) + (ad+bc)i, using the rule that i² = −1."],["How does complex division work?","Multiply the numerator and denominator by the conjugate of the denominator to remove i from the bottom."]], howTo:"Enter the real and imaginary parts of two complex numbers, choose an operation, and the result is shown in a+bi form." },
  "matrix-calc": { title:"Free Matrix Calculator — Determinant, Inverse & Multiply", desc:"Add, multiply, transpose and find the determinant or inverse of 2×2 and 3×3 matrices. Free, no signup, runs in your browser.", keywords:"matrix calculator, determinant, matrix inverse, matrix multiplication, transpose matrix", faq:[["What matrix sizes are supported?","2×2 and 3×3 matrices for addition, multiplication, determinant, inverse and transpose."],["What is the determinant used for?","It indicates whether a matrix is invertible — a determinant of zero means no inverse exists."],["How is the inverse found?","Using the adjugate divided by the determinant, valid only when the determinant is non-zero."]], howTo:"Enter the matrix values, choose an operation such as multiply, determinant or inverse, and the result matrix or value is shown." },
  "sequence-calc": { title:"Free Sequence Calculator — Arithmetic & Geometric Series", desc:"Find the nth term and the sum of arithmetic or geometric sequences with formulas shown. Free, no signup, runs in your browser.", keywords:"sequence calculator, arithmetic sequence, geometric sequence, nth term, series sum", faq:[["What is the difference between arithmetic and geometric sequences?","Arithmetic sequences add a constant difference each term; geometric sequences multiply by a constant ratio."],["How is the nth term found?","Arithmetic: aₙ = a₁ + (n−1)d; geometric: aₙ = a₁ × r^(n−1), using the first term and the common difference or ratio."],["Can it sum the series?","Yes — it returns the sum of the first n terms using the appropriate arithmetic or geometric sum formula."]], howTo:"Choose arithmetic or geometric, enter the first term, the difference or ratio and n, and get the nth term and sum." },
  "percentage-advanced": { title:"Free Advanced Percentage Calculator — All Percent Math", desc:"Handle every percentage operation: percent of a number, percent change, increase, decrease and more. Free, no signup, runs in your browser.", keywords:"percentage calculator, percent of a number, percent change, percentage increase, discount calculator", faq:[["What percentage operations are covered?","Percent of a number, what percent one number is of another, percent increase or decrease, and reverse percentages."],["How do I find X percent of a number?","Multiply the number by the percentage divided by 100, e.g. 20% of 150 = 150 × 0.20 = 30."],["Can it calculate a discount?","Yes — use percent decrease to find a sale price after a percentage is taken off."]], howTo:"Pick the percentage operation you need, enter the values, and the calculator returns the result instantly." },
  "ratio-simplifier": { title:"Free Ratio Simplifier — Reduce & Scale Ratios Online", desc:"Simplify ratios to their lowest terms and generate equivalent ratios using the GCD. Free, no signup, all math runs in your browser.", keywords:"ratio simplifier, simplify ratio, equivalent ratios, ratio calculator, reduce ratio", faq:[["How is a ratio simplified?","Both parts are divided by their greatest common divisor, so 8:12 reduces to 2:3."],["What are equivalent ratios?","Ratios that represent the same proportion, like 2:3, 4:6 and 6:9, found by scaling both parts equally."],["Can it handle three-part ratios?","It focuses on simplifying and scaling two-part ratios to their lowest terms."]], howTo:"Enter the two parts of your ratio and the tool reduces it to lowest terms and lists equivalent ratios." },
  "fraction-advanced": { title:"Free Advanced Fraction Calculator — Add, Multiply & More", desc:"Add, subtract, multiply and divide fractions with simplified results and step-by-step working. Free, no signup, runs in your browser.", keywords:"fraction calculator, add fractions, multiply fractions, simplify fraction, mixed numbers", faq:[["What fraction operations are supported?","Addition, subtraction, multiplication and division, with the answer automatically simplified."],["How are fractions added?","Convert to a common denominator, add the numerators, then simplify — the calculator shows each step."],["Does it handle mixed numbers?","Yes — mixed numbers are converted to improper fractions for the calculation and can be shown in the result."]], howTo:"Enter two fractions, choose an operation, and the calculator returns the simplified result with the steps shown." },
  "roman-numeral-converter": { title:"Free Roman Numeral Converter — Numbers ↔ Roman", desc:"Convert numbers to Roman numerals and Roman numerals back to numbers from 1 to 3999. Free, no signup, runs entirely in your browser.", keywords:"roman numeral converter, number to roman, roman to number, roman numerals, mcmxci", faq:[["What range of numbers is supported?","Standard Roman numerals cover 1 to 3999, the maximum representable without special overline notation."],["What are the Roman numeral symbols?","I=1, V=5, X=10, L=50, C=100, D=500 and M=1000, combined using additive and subtractive rules."],["How does subtractive notation work?","A smaller symbol before a larger one subtracts, so IV is 4 and IX is 9 rather than IIII or VIIII."]], howTo:"Enter a number to get its Roman numeral, or enter a Roman numeral to convert it back to a number." },
  "percentage-change-calculator": { title:"Free Percentage Change Calculator — Increase or Decrease", desc:"Calculate the percentage increase or decrease between an old and new value, plus the absolute difference. Free, no signup, in-browser.", keywords:"percentage change calculator, percent increase, percent decrease, percent difference, growth rate", faq:[["What is the percentage change formula?","Percentage change = (new − old) / |old| × 100%, positive for an increase and negative for a decrease."],["How is percent increase different from percent decrease?","An increase gives a positive result; a decrease gives a negative one — the sign shows the direction of change."],["What does the absolute difference show?","Simply new minus old, the raw amount of change before it is expressed as a percentage."]], howTo:"Enter the original value and the new value and the calculator returns the percentage change and the absolute difference." },
  "decimal-to-fraction": { title:"Free Decimal to Fraction Converter — Repeating Decimals", desc:"Convert terminating or repeating decimals into a simplified fraction and mixed number, with the GCD shown. Free, no signup, runs in-browser.", keywords:"decimal to fraction, repeating decimal to fraction, fraction converter, simplify fraction, mixed number", faq:[["Can it convert repeating decimals?","Yes — mark the repeating part and it produces the exact fraction, so 0.333... becomes 1/3."],["How is the fraction simplified?","The numerator and denominator are divided by their greatest common divisor to reach lowest terms."],["Does it show a mixed number?","Yes — improper fractions are also given as a whole number plus a proper fraction where applicable."]], howTo:"Enter a decimal, indicating any repeating digits, and the converter returns the simplified fraction, mixed number and GCD." },
};
function gcd2(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}
function lcm2(a, b) {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd2(a, b);
}
function parseNumsCSV(s) {
  return s.split(/[,\s]+/).map(x => x.trim()).filter(Boolean).map(Number).filter(Number.isFinite);
}

function GcdLcmCalc() {
  const [inp, setInp] = useState("12, 18, 30");
  const out = useMemo(() => {
    const nums = parseNumsCSV(inp).slice(0, 5);
    if (nums.length < 2) return { gcd: "—", lcm: "—", steps: "Enter 2 to 5 numbers." };
    let g = nums[0], l = nums[0], s = [];
    for (let i = 1; i < nums.length; i++) {
      const ng = gcd2(g, nums[i]);
      const nl = lcm2(l, nums[i]);
      s.push(`gcd(${g}, ${nums[i]}) = ${ng}`);
      s.push(`lcm(${l}, ${nums[i]}) = ${nl}`);
      g = ng; l = nl;
    }
    return { gcd: g, lcm: l, steps: `Numbers: ${nums.join(", ")}\n` + s.join("\n") };
  }, [inp]);

  return (
    <VStack>
      <div><Label>Numbers (2-5, comma/space separated)</Label><Input value={inp} onChange={setInp} /></div>
      <Grid2>
        <BigResult value={String(out.gcd)} label="GCD" />
        <BigResult value={String(out.lcm)} label="LCM" />
      </Grid2>
      <Result>{out.steps}</Result>
    </VStack>
  );
}

function FactorialCalc() {
  const [nVal, setNVal] = useState("10");
  const out = useMemo(() => {
    const n = Math.floor(Number(nVal));
    if (!Number.isFinite(n) || n < 0 || n > 20) return { main: "—", steps: "Enter integer n where 0 ≤ n ≤ 20." };
    let v = 1;
    for (let i = 2; i <= n; i++) v *= i;
    const exp = n <= 1 ? "1" : Array.from({ length: n }, (_, i) => n - i).join(" × ");
    return { main: String(v), steps: `${n}! = ${exp}\n${n}! = ${v}` };
  }, [nVal]);

  return (
    <VStack>
      <div><Label>n (0 to 20)</Label><Input value={nVal} onChange={setNVal} /></div>
      <BigResult value={out.main} label="Factorial" />
      <Result>{out.steps}</Result>
    </VStack>
  );
}

function FibonacciCalc() {
  const [mode, setMode] = useState("sequence");
  const [nVal, setNVal] = useState("10");
  const out = useMemo(() => {
    const n = Math.floor(Number(nVal));
    if (!Number.isFinite(n) || n < 1 || n > 200) return { main: "—", steps: "Enter n in range 1..200." };
    let a = 0, b = 1;
    const seq = [];
    for (let i = 1; i <= n; i++) {
      seq.push(a);
      [a, b] = [b, a + b];
    }
    if (mode === "nth") return { main: String(seq[n - 1]), steps: `F(${n}) = ${seq[n - 1]}\nSequence up to n:\n${seq.join(", ")}` };
    return { main: String(n), steps: `First ${n} terms:\n${seq.join(", ")}` };
  }, [mode, nVal]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Mode</Label><SelectInput value={mode} onChange={setMode} options={[{ value: "sequence", label: "Generate Sequence" }, { value: "nth", label: "Find Nth Term" }]} /></div>
        <div><Label>N</Label><Input value={nVal} onChange={setNVal} /></div>
      </Grid2>
      <BigResult value={out.main} label={mode === "nth" ? "Nth Fibonacci" : "Terms Generated"} />
      <Result>{out.steps}</Result>
    </VStack>
  );
}

function isPrimeNum(x) {
  if (x < 2) return false;
  if (x === 2) return true;
  if (x % 2 === 0) return false;
  for (let i = 3; i * i <= x; i += 2) if (x % i === 0) return false;
  return true;
}
function nearestPrimes(n) {
  let lo = n - 1, hi = n + 1;
  while (lo >= 2 && !isPrimeNum(lo)) lo--;
  while (!isPrimeNum(hi)) hi++;
  return { lo: lo >= 2 ? lo : null, hi };
}

function PrimeChecker() {
  const [val, setVal] = useState("97");
  const out = useMemo(() => {
    const n = Math.floor(Number(val));
    if (!Number.isFinite(n)) return { main: "—", steps: "Enter an integer." };
    const p = isPrimeNum(n);
    const near = nearestPrimes(n);
    const checks = [];
    if (n >= 2) {
      checks.push(`Check divisors up to √${n} ≈ ${round(Math.sqrt(n), 3)}`);
      for (let i = 2; i * i <= n && checks.length < 10; i++) checks.push(`${n} % ${i} = ${n % i}`);
    }
    return {
      main: p ? "Prime" : "Composite",
      steps: `n = ${n}\n${checks.join("\n")}\nNearest lower prime: ${near.lo ?? "none"}\nNearest higher prime: ${near.hi}`,
    };
  }, [val]);

  return (
    <VStack>
      <div><Label>Integer</Label><Input value={val} onChange={setVal} /></div>
      <BigResult value={out.main} label="Prime Status" />
      <Result>{out.steps}</Result>
    </VStack>
  );
}

function PrimeFactorization() {
  const [val, setVal] = useState("360");
  const out = useMemo(() => {
    let n = Math.floor(Number(val));
    if (!Number.isFinite(n) || n < 2) return { main: "—", steps: "Enter integer n ≥ 2." };
    const original = n;
    const factors = {};
    const steps = [];
    for (let p = 2; p * p <= n; p++) {
      while (n % p === 0) {
        factors[p] = (factors[p] || 0) + 1;
        steps.push(`${n} ÷ ${p} = ${n / p}`);
        n /= p;
      }
    }
    if (n > 1) {
      factors[n] = (factors[n] || 0) + 1;
      steps.push(`Remaining prime factor: ${n}`);
    }
    const formatted = Object.entries(factors).map(([p, e]) => (e > 1 ? `${p}^${e}` : `${p}`)).join(" × ");
    return { main: formatted, steps: `Prime factorization of ${original}:\n${steps.join("\n")}` };
  }, [val]);

  return (
    <VStack>
      <div><Label>Integer n</Label><Input value={val} onChange={setVal} /></div>
      <BigResult value={out.main} label="Prime Factors" />
      <Result>{out.steps}</Result>
    </VStack>
  );
}

function QuadraticSolver() {
  const [a, setA] = useState("1");
  const [b, setB] = useState("-3");
  const [c, setC] = useState("2");
  const out = useMemo(() => {
    const A = n(a), B = n(b), Cc = n(c);
    if (A === 0) return { main: "—", steps: "a cannot be 0 for a quadratic equation." };
    const D = B * B - 4 * A * Cc;
    let roots = "";
    if (D > 0) {
      const r1 = (-B + Math.sqrt(D)) / (2 * A);
      const r2 = (-B - Math.sqrt(D)) / (2 * A);
      roots = `x₁ = ${round(r1)}, x₂ = ${round(r2)}`;
    } else if (D === 0) {
      const r = -B / (2 * A);
      roots = `x = ${round(r)} (double root)`;
    } else {
      const real = -B / (2 * A), imag = Math.sqrt(-D) / (2 * A);
      roots = `x = ${round(real)} ± ${round(imag)}i`;
    }
    return {
      main: roots,
      steps: `Equation: ${A}x² + ${B}x + ${Cc} = 0\nDiscriminant D = b² - 4ac = ${B * B} - 4·${A}·${Cc} = ${D}\nRoots by quadratic formula.`,
    };
  }, [a, b, c]);

  return (
    <VStack>
      <Grid3>
        <div><Label>a</Label><Input value={a} onChange={setA} /></div>
        <div><Label>b</Label><Input value={b} onChange={setB} /></div>
        <div><Label>c</Label><Input value={c} onChange={setC} /></div>
      </Grid3>
      <BigResult value={out.main} label="Roots" />
      <Result>{out.steps}</Result>
    </VStack>
  );
}

function LogarithmCalc() {
  const [x, setX] = useState("100");
  const [baseMode, setBaseMode] = useState("10");
  const [customBase, setCustomBase] = useState("3");
  const out = useMemo(() => {
    const X = n(x);
    if (X <= 0) return { main: "—", steps: "x must be > 0." };
    let b = 10;
    if (baseMode === "2") b = 2;
    if (baseMode === "e") b = Math.E;
    if (baseMode === "custom") b = n(customBase);
    if (b <= 0 || b === 1) return { main: "—", steps: "Base must be > 0 and not 1." };
    const val = Math.log(X) / Math.log(b);
    return { main: round(val), steps: `log_b(x) = ln(x)/ln(b)\n= ln(${X})/ln(${round(b, 10)})\n= ${round(val, 10)}` };
  }, [x, baseMode, customBase]);

  return (
    <VStack>
      <Grid3>
        <div><Label>x</Label><Input value={x} onChange={setX} /></div>
        <div><Label>Base</Label><SelectInput value={baseMode} onChange={setBaseMode} options={[{ value: "2", label: "2" }, { value: "10", label: "10" }, { value: "e", label: "e" }, { value: "custom", label: "Custom" }]} /></div>
        <div><Label>Custom Base</Label><Input value={customBase} onChange={setCustomBase} /></div>
      </Grid3>
      <BigResult value={out.main} label="Log Value" />
      <Result>{out.steps}</Result>
    </VStack>
  );
}

function ModuloCalc() {
  const [a, setA] = useState("29");
  const [b, setB] = useState("5");
  const out = useMemo(() => {
    const A = Math.floor(n(a));
    const B = Math.floor(n(b));
    if (B === 0) return { mod: "—", q: "—", steps: "Divisor cannot be 0." };
    const q = Math.trunc(A / B);
    const r = A - q * B;
    return { mod: r, q, steps: `${A} = ${B} × ${q} + ${r}\nQuotient = ${q}\nRemainder = ${r}` };
  }, [a, b]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Dividend (a)</Label><Input value={a} onChange={setA} /></div>
        <div><Label>Divisor (b)</Label><Input value={b} onChange={setB} /></div>
      </Grid2>
      <BigResult value={`${out.mod}`} label="a mod b" />
      <Result>{`Quotient: ${out.q}\n${out.steps}`}</Result>
    </VStack>
  );
}

function TrigonometryCalc() {
  const [fn, setFn] = useState("sin");
  const [mode, setMode] = useState("deg");
  const [x, setX] = useState("30");
  const out = useMemo(() => {
    const X = n(x);
    const rad = mode === "deg" ? (X * Math.PI) / 180 : X;
    let v = 0, steps = "";
    if (fn === "sin") { v = Math.sin(rad); steps = `sin(${X}${mode === "deg" ? "°" : ""})`; }
    if (fn === "cos") { v = Math.cos(rad); steps = `cos(${X}${mode === "deg" ? "°" : ""})`; }
    if (fn === "tan") { v = Math.tan(rad); steps = `tan(${X}${mode === "deg" ? "°" : ""})`; }
    if (fn === "asin") { v = Math.asin(X); steps = `asin(${X})`; if (mode === "deg") v = v * 180 / Math.PI; }
    if (fn === "acos") { v = Math.acos(X); steps = `acos(${X})`; if (mode === "deg") v = v * 180 / Math.PI; }
    if (fn === "atan") { v = Math.atan(X); steps = `atan(${X})`; if (mode === "deg") v = v * 180 / Math.PI; }
    return { main: round(v, 10), steps: `${steps} = ${round(v, 10)}` };
  }, [fn, mode, x]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Function</Label><SelectInput value={fn} onChange={setFn} options={["sin","cos","tan","asin","acos","atan"].map(v=>({value:v,label:v}))} /></div>
        <div><Label>Unit</Label><SelectInput value={mode} onChange={setMode} options={[{value:"deg",label:"Degrees"},{value:"rad",label:"Radians"}]} /></div>
        <div><Label>Input</Label><Input value={x} onChange={setX} /></div>
      </Grid3>
      <BigResult value={out.main} label="Result" />
      <Result>{out.steps}</Result>
    </VStack>
  );
}

function countSigFigString(numStr) {
  const s = numStr.trim().replace(/^[-+]/, "");
  if (!s || !/[0-9]/.test(s)) return 0;
  if (s.includes("e") || s.includes("E")) {
    const [m] = s.split(/[eE]/);
    return m.replace(".", "").replace(/^0+/, "").length;
  }
  if (s.includes(".")) {
    return s.replace(".", "").replace(/^0+/, "").length;
  }
  return s.replace(/0+$/, "").replace(/^0+/, "").length;
}
function roundToSig(num, sig) {
  if (num === 0) return 0;
  const p = Math.floor(Math.log10(Math.abs(num)));
  const f = Math.pow(10, p - sig + 1);
  return Math.round(num / f) * f;
}

function SignificantFiguresCalc() {
  const [num, setNum] = useState("0.004560");
  const [sig, setSig] = useState("3");
  const out = useMemo(() => {
    const N = Number(num), S = Math.max(1, Math.floor(Number(sig)));
    if (!Number.isFinite(N)) return { main: "—", steps: "Invalid number." };
    const current = countSigFigString(num);
    const rounded = roundToSig(N, S);
    return {
      main: String(rounded),
      steps: `Input: ${num}\nDetected significant figures: ${current}\nRounded to ${S} significant figures: ${rounded}`,
    };
  }, [num, sig]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Number</Label><Input value={num} onChange={setNum} /></div>
        <div><Label>Target Sig Figs</Label><Input value={sig} onChange={setSig} /></div>
      </Grid2>
      <BigResult value={out.main} label="Rounded Value" />
      <Result>{out.steps}</Result>
    </VStack>
  );
}

function RoundingCalc() {
  const [mode, setMode] = useState("decimal");
  const [num, setNum] = useState("123.4567");
  const [k, setK] = useState("2");
  const out = useMemo(() => {
    const N = Number(num), K = Number(k);
    if (!Number.isFinite(N) || !Number.isFinite(K)) return { main: "—", steps: "Invalid inputs." };
    if (mode === "decimal") {
      const v = Number(N.toFixed(Math.max(0, Math.floor(K))));
      return { main: String(v), steps: `Round ${N} to ${Math.floor(K)} decimal places => ${v}` };
    }
    if (mode === "sig") {
      const v = roundToSig(N, Math.max(1, Math.floor(K)));
      return { main: String(v), steps: `Round ${N} to ${Math.floor(K)} significant figures => ${v}` };
    }
    const factor = K === 0 ? 1 : K;
    const v = Math.round(N / factor) * factor;
    return { main: String(v), steps: `Round ${N} to nearest ${factor} => ${v}` };
  }, [mode, num, k]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Mode</Label><SelectInput value={mode} onChange={setMode} options={[{value:"decimal",label:"Decimal Places"},{value:"sig",label:"Significant Figures"},{value:"nearest",label:"Nearest Value"}]} /></div>
        <div><Label>Number</Label><Input value={num} onChange={setNum} /></div>
        <div><Label>k</Label><Input value={k} onChange={setK} /></div>
      </Grid3>
      <BigResult value={out.main} label="Rounded Result" />
      <Result>{out.steps}</Result>
    </VStack>
  );
}
function NumberToWordsCalc() {
  const [inp, setInp] = useState("123456789");
  const out = useMemo(() => {
    const n = Math.floor(Number(inp));
    if (!Number.isFinite(n) || Math.abs(n) > 1_000_000_000_000) return { main: "—", steps: "Enter integer up to 1 trillion in magnitude." };

    const ones = ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
    const tens = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];

    function under1000(x) {
      let s = "";
      const h = Math.floor(x / 100);
      const r = x % 100;
      if (h) s += `${ones[h]} hundred`;
      if (r) {
        if (s) s += " ";
        if (r < 20) s += ones[r];
        else {
          s += tens[Math.floor(r / 10)];
          if (r % 10) s += `-${ones[r % 10]}`;
        }
      }
      return s || "zero";
    }

    function toWords(x) {
      if (x === 0) return "zero";
      const sign = x < 0 ? "minus " : "";
      x = Math.abs(x);
      const units = [
        ["trillion", 1_000_000_000_000],
        ["billion", 1_000_000_000],
        ["million", 1_000_000],
        ["thousand", 1_000],
      ];
      let parts = [];
      for (const [name, val] of units) {
        if (x >= val) {
          const q = Math.floor(x / val);
          parts.push(`${under1000(q)} ${name}`);
          x %= val;
        }
      }
      if (x > 0) parts.push(under1000(x));
      return sign + parts.join(" ");
    }

    const words = toWords(n);
    return { main: words, steps: `${n} in words:\n${words}` };
  }, [inp]);

  return (
    <VStack>
      <div><Label>Integer (≤ 1 trillion)</Label><Input value={inp} onChange={setInp} /></div>
      <BigResult value={out.main} label="Number in Words" />
      <Result mono={false}>{out.steps}</Result>
    </VStack>
  );
}

function ScientificNotationCalc() {
  const [mode, setMode] = useState("toSci");
  const [inp, setInp] = useState("1234500");
  const out = useMemo(() => {
    if (mode === "toSci") {
      const n = Number(inp);
      if (!Number.isFinite(n)) return { main: "—", steps: "Invalid standard number." };
      if (n === 0) return { main: "0 × 10^0", steps: "Zero is 0 × 10^0." };
      const e = Math.floor(Math.log10(Math.abs(n)));
      const m = n / Math.pow(10, e);
      return { main: `${round(m, 10)} × 10^${e}`, steps: `Move decimal so mantissa is in [1,10):\n${n} = ${round(m,10)} × 10^${e}` };
    } else {
      const s = inp.trim().replace(/\s+/g, "");
      const m = s.match(/^([+-]?\d*\.?\d+)[eE]([+-]?\d+)$/) || s.match(/^([+-]?\d*\.?\d+)x10\^([+-]?\d+)$/i);
      if (!m) return { main: "—", steps: "Use formats like 1.23e5 or 1.23x10^5." };
      const mant = Number(m[1]), exp = Number(m[2]);
      const v = mant * Math.pow(10, exp);
      return { main: String(v), steps: `${mant} × 10^${exp} = ${v}` };
    }
  }, [mode, inp]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Mode</Label><SelectInput value={mode} onChange={setMode} options={[{value:"toSci",label:"Standard → Scientific"},{value:"toStd",label:"Scientific → Standard"}]} /></div>
        <div><Label>Input</Label><Input value={inp} onChange={setInp} /></div>
      </Grid2>
      <BigResult value={out.main} label="Conversion Result" />
      <Result>{out.steps}</Result>
    </VStack>
  );
}

function BinaryCalc() {
  const [a, setA] = useState("1010");
  const [b, setB] = useState("11");
  const [op, setOp] = useState("add");
  const out = useMemo(() => {
    if (!/^[01]+$/.test(a) || !/^[01]+$/.test(b)) return { main: "—", steps: "Use valid binary numbers (0/1 only)." };
    const A = parseInt(a, 2);
    const B = parseInt(b, 2);
    let val = 0, symbol = "+";
    if (op === "add") { val = A + B; symbol = "+"; }
    if (op === "sub") { val = A - B; symbol = "-"; }
    if (op === "mul") { val = A * B; symbol = "×"; }
    if (op === "div") {
      if (B === 0) return { main: "—", steps: "Division by zero." };
      val = Math.floor(A / B);
      symbol = "÷";
    }
    const main = (val < 0 ? "-" : "") + Math.abs(val).toString(2);
    return {
      main,
      steps: `${a}₂ (${A}) ${symbol} ${b}₂ (${B}) = ${val}\nBinary result: ${main}₂`,
    };
  }, [a, b, op]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Binary A</Label><Input value={a} onChange={setA} /></div>
        <div><Label>Operation</Label><SelectInput value={op} onChange={setOp} options={[{value:"add",label:"Add"},{value:"sub",label:"Subtract"},{value:"mul",label:"Multiply"},{value:"div",label:"Divide"}]} /></div>
        <div><Label>Binary B</Label><Input value={b} onChange={setB} /></div>
      </Grid3>
      <BigResult value={out.main} label="Binary Result" />
      <Result>{out.steps}</Result>
    </VStack>
  );
}

function tokenizeBool(expr) {
  return expr
    .replace(/\s+/g, "")
    .replace(/AND/gi, "&")
    .replace(/OR/gi, "|")
    .replace(/NOT/gi, "!")
    .replace(/XOR/gi, "^")
    .split("");
}
function varsInExpr(expr) {
  const masked = expr.replace(/AND|OR|NOT|XOR/gi, " ");
  const vars = new Set((masked.match(/[A-Z]/gi) || []).map(v => v.toUpperCase()));
  return Array.from(vars).sort();
}
function evalBoolExpr(expr, env) {
  let s = expr.toUpperCase().replace(/\s+/g, "");
  s = s.replace(/XOR/g, "^").replace(/AND/g, "&").replace(/OR/g, "|").replace(/NOT/g, "!");
  s = s.replace(/[A-Z]/g, (ch) => (env[ch] ? "1" : "0"));
  function parse(tokens) {
    let i = 0;
    function parsePrimary() {
      const t = tokens[i++];
      if (t === "(") { const v = parseOr(); i++; return v; }
      if (t === "!") return !parsePrimary();
      if (t === "1") return true;
      if (t === "0") return false;
      return false;
    }
    function parseXor() {
      let v = parsePrimary();
      while (tokens[i] === "^") { i++; v = Boolean(v) !== Boolean(parsePrimary()); }
      return v;
    }
    function parseAnd() {
      let v = parseXor();
      while (tokens[i] === "&") { i++; v = v && parseXor(); }
      return v;
    }
    function parseOr() {
      let v = parseAnd();
      while (tokens[i] === "|") { i++; v = v || parseAnd(); }
      return v;
    }
    return parseOr();
  }
  return parse(tokenizeBool(s));
}

function TruthTableView({ expr }) {
  const vars = useMemo(() => varsInExpr(expr).slice(0, 6), [expr]);
  const rows = useMemo(() => {
    const n = vars.length;
    const arr = [];
    for (let mask = 0; mask < (1 << n); mask++) {
      const env = {};
      vars.forEach((v, i) => { env[v] = Boolean((mask >> (n - 1 - i)) & 1); });
      let val = false;
      try { val = evalBoolExpr(expr, env); } catch { val = false; }
      arr.push({ env, val });
    }
    return arr;
  }, [expr, vars]);

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%" }}>
        <thead>
          <tr>
            {vars.map(v => <th key={v}>{v}</th>)}
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}>
              {vars.map(v => <td key={v}>{r.env[v] ? 1 : 0}</td>)}
              <td style={{ color: r.val ? "#34D399" : "#FCA5A5", fontWeight: 700 }}>{r.val ? 1 : 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BooleanAlgebraCalc() {
  const [expr, setExpr] = useState("(A AND B) OR (A AND NOT B)");
  const out = useMemo(() => {
    let simplified = expr;
    simplified = simplified.replace(/\s+/g, " ");
    simplified = simplified.replace(/\(A AND B\) OR \(A AND NOT B\)/gi, "A");
    simplified = simplified.replace(/A AND 1/gi, "A").replace(/A OR 0/gi, "A");
    return {
      main: simplified,
      steps: `Expression: ${expr}\nHeuristic simplification: ${simplified}\n(For exact minimization use Karnaugh/Quine-McCluskey external tooling)`,
    };
  }, [expr]);

  return (
    <VStack>
      <div><Label>Boolean Expression (AND OR NOT XOR)</Label><Input value={expr} onChange={setExpr} /></div>
      <BigResult value={out.main} label="Simplified Expression" />
      <Result>{out.steps}</Result>
      <TruthTableView expr={expr} />
    </VStack>
  );
}

function TruthTableGen() {
  const [expr, setExpr] = useState("(A XOR B) AND NOT C");
  const vars = useMemo(() => varsInExpr(expr), [expr]);
  return (
    <VStack>
      <div><Label>Expression (AND OR NOT XOR)</Label><Input value={expr} onChange={setExpr} /></div>
      <BigResult value={vars.join(", ") || "None"} label="Detected Variables" />
      <Result>{`Rows: ${Math.pow(2, Math.min(vars.length, 6))}\nOperators supported: AND OR NOT XOR and parentheses.`}</Result>
      <TruthTableView expr={expr} />
    </VStack>
  );
}

function SetTheoryCalc() {
  const [a, setA] = useState("1,2,3,4");
  const [b, setB] = useState("3,4,5,6");
  const out = useMemo(() => {
    const A = new Set(a.split(",").map(x => x.trim()).filter(Boolean));
    const B = new Set(b.split(",").map(x => x.trim()).filter(Boolean));
    const union = Array.from(new Set([...A, ...B]));
    const inter = Array.from([...A].filter(x => B.has(x)));
    const diffAB = Array.from([...A].filter(x => !B.has(x)));
    const diffBA = Array.from([...B].filter(x => !A.has(x)));
    return { union, inter, diffAB, diffBA };
  }, [a, b]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Set A (comma separated)</Label><Input value={a} onChange={setA} /></div>
        <div><Label>Set B (comma separated)</Label><Input value={b} onChange={setB} /></div>
      </Grid2>
      <BigResult value={`|A∪B| = ${out.union.length}`} label="Union Cardinality" />
      <Result>{`A ∪ B = {${out.union.join(", ")}}\nA ∩ B = {${out.inter.join(", ")}}\nA - B = {${out.diffAB.join(", ")}}\nB - A = {${out.diffBA.join(", ")}}`}</Result>
      <Result mono={false}>
        <b>Venn (text view)</b>{"\n"}
        Left-only: {`{${out.diffAB.join(", ")}}`}{"\n"}
        Intersection: {`{${out.inter.join(", ")}}`}{"\n"}
        Right-only: {`{${out.diffBA.join(", ")}}`}
      </Result>
    </VStack>
  );
}

function NumberBaseCalc() {
  const [num, setNum] = useState("255");
  const [fromBase, setFromBase] = useState("10");
  const [toBase, setToBase] = useState("16");
  const [customFrom, setCustomFrom] = useState("10");
  const [customTo, setCustomTo] = useState("36");

  const out = useMemo(() => {
    const fb = fromBase === "custom" ? Math.floor(Number(customFrom)) : Math.floor(Number(fromBase));
    const tb = toBase === "custom" ? Math.floor(Number(customTo)) : Math.floor(Number(toBase));
    if (fb < 2 || fb > 36 || tb < 2 || tb > 36) return { main: "—", steps: "Bases must be between 2 and 36." };
    const sign = num.trim().startsWith("-") ? -1 : 1;
    const raw = num.trim().replace(/^[-+]/, "");
    const parsed = parseInt(raw, fb);
    if (!Number.isFinite(parsed)) return { main: "—", steps: "Invalid number for selected source base." };
    const converted = (sign * parsed).toString(tb).toUpperCase();
    return {
      main: converted,
      steps: `${num} (base ${fb}) = ${sign * parsed} (base 10)\n${sign * parsed} (base 10) = ${converted} (base ${tb})`,
    };
  }, [num, fromBase, toBase, customFrom, customTo]);

  const baseOptions = [
    { value: "2", label: "2 (Binary)" },
    { value: "8", label: "8 (Octal)" },
    { value: "10", label: "10 (Decimal)" },
    { value: "16", label: "16 (Hex)" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <VStack>
      <Grid3>
        <div><Label>Number</Label><Input value={num} onChange={setNum} /></div>
        <div><Label>From Base</Label><SelectInput value={fromBase} onChange={setFromBase} options={baseOptions} /></div>
        <div><Label>To Base</Label><SelectInput value={toBase} onChange={setToBase} options={baseOptions} /></div>
      </Grid3>
      <Grid2>
        <div><Label>Custom From Base</Label><Input value={customFrom} onChange={setCustomFrom} /></div>
        <div><Label>Custom To Base</Label><Input value={customTo} onChange={setCustomTo} /></div>
      </Grid2>
      <BigResult value={out.main} label="Converted Value" />
      <Result>{out.steps}</Result>
    </VStack>
  );
}

function parseComplex(s) {
  const t = s.replace(/\s+/g, "");
  if (!t.includes("i")) return { re: Number(t), im: 0 };
  const m = t.match(/^([+-]?\d*\.?\d+)?([+-]\d*\.?\d+)?i$/) || t.match(/^([+-]?\d*\.?\d+)i$/);
  if (m) {
    if (m[2] !== undefined) return { re: Number(m[1] || 0), im: Number(m[2] || 0) };
    if (t.endsWith("i") && !t.slice(0, -1).includes("+") && !t.slice(0, -1).slice(1).includes("-")) return { re: 0, im: Number(t.slice(0, -1) || 1) };
  }
  const parts = t.replace("i", "").match(/^([+-]?\d*\.?\d+)([+-]\d*\.?\d+)$/);
  if (parts) return { re: Number(parts[1]), im: Number(parts[2]) };
  return { re: 0, im: 0 };
}
function fmtComplex(z) {
  const re = round(z.re, 10), im = round(Math.abs(z.im), 10), sign = z.im >= 0 ? "+" : "-";
  return `${re} ${sign} ${im}i`;
}

function ComplexNumberCalc() {
  const [z1, setZ1] = useState("3+2i");
  const [z2, setZ2] = useState("1-4i");
  const [op, setOp] = useState("add");

  const out = useMemo(() => {
    const a = parseComplex(z1), b = parseComplex(z2);
    let r = { re: 0, im: 0 }, steps = "";
    if (op === "add") {
      r = { re: a.re + b.re, im: a.im + b.im };
      steps = `(${fmtComplex(a)}) + (${fmtComplex(b)}) = ${fmtComplex(r)}`;
    }
    if (op === "sub") {
      r = { re: a.re - b.re, im: a.im - b.im };
      steps = `(${fmtComplex(a)}) - (${fmtComplex(b)}) = ${fmtComplex(r)}`;
    }
    if (op === "mul") {
      r = { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
      steps = `(a+bi)(c+di) = (ac-bd) + (ad+bc)i\nResult = ${fmtComplex(r)}`;
    }
    if (op === "div") {
      const den = b.re * b.re + b.im * b.im;
      if (den === 0) return { main: "—", steps: "Division by zero complex number." };
      r = { re: (a.re * b.re + a.im * b.im) / den, im: (a.im * b.re - a.re * b.im) / den };
      steps = `z1/z2 = z1·conj(z2) / |z2|²\nResult = ${fmtComplex(r)}`;
    }
    return { main: fmtComplex(r), steps };
  }, [z1, z2, op]);

  return (
    <VStack>
      <Grid3>
        <div><Label>z1 (a+bi)</Label><Input value={z1} onChange={setZ1} /></div>
        <div><Label>Operation</Label><SelectInput value={op} onChange={setOp} options={[{value:"add",label:"Add"},{value:"sub",label:"Subtract"},{value:"mul",label:"Multiply"},{value:"div",label:"Divide"}]} /></div>
        <div><Label>z2 (a+bi)</Label><Input value={z2} onChange={setZ2} /></div>
      </Grid3>
      <BigResult value={out.main} label="Complex Result" />
      <Result>{out.steps}</Result>
    </VStack>
  );
}
function parseMatrix(text, size) {
  const rows = text.trim().split("\n").map(r => r.trim()).filter(Boolean).slice(0, size);
  if (rows.length !== size) return null;
  const m = rows.map(r => r.split(/[,\s]+/).map(Number).filter(Number.isFinite).slice(0, size));
  if (m.some(r => r.length !== size)) return null;
  return m;
}
function matAdd(A, B) {
  return A.map((r, i) => r.map((v, j) => v + B[i][j]));
}
function matMul(A, B) {
  const n = A.length;
  const R = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) R[i][j] += A[i][k] * B[k][j];
  return R;
}
function det2(M) {
  return M[0][0] * M[1][1] - M[0][1] * M[1][0];
}
function det3(M) {
  return M[0][0]*(M[1][1]*M[2][2]-M[1][2]*M[2][1]) - M[0][1]*(M[1][0]*M[2][2]-M[1][2]*M[2][0]) + M[0][2]*(M[1][0]*M[2][1]-M[1][1]*M[2][0]);
}
function transpose(M) {
  const n = M.length;
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => M[j][i]));
}
function inv2(M) {
  const d = det2(M);
  if (d === 0) return null;
  return [[M[1][1]/d, -M[0][1]/d],[-M[1][0]/d, M[0][0]/d]];
}
function MatrixGrid({ M, title }) {
  if (!M) return null;
  return (
    <div>
      <Label>{title}</Label>
      <div style={{ display: "inline-grid", gap: 4, background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8, border: `1px solid ${C.border}` }}>
        {M.map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: `repeat(${row.length}, 64px)`, gap: 4 }}>
            {row.map((v, j) => (
              <div key={j} style={{ textAlign: "center", padding: "7px 6px", background: "rgba(0,0,0,0.25)", borderRadius: 6, fontFamily: "'JetBrains Mono',monospace" }}>{round(v, 6)}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MatrixCalc() {
  const [size, setSize] = useState("2");
  const [op, setOp] = useState("add");
  const [a, setA] = useState("1 2\n3 4");
  const [b, setB] = useState("5 6\n7 8");

  const out = useMemo(() => {
    const n = Number(size);
    const A = parseMatrix(a, n);
    const B = parseMatrix(b, n);
    if (!A) return { main: "—", steps: "Matrix A format invalid." };
    if ((op === "add" || op === "multiply") && !B) return { main: "—", steps: "Matrix B format invalid." };
    let R = null, steps = "";
    if (op === "add") { R = matAdd(A, B); steps = "R = A + B (element-wise)." }
    if (op === "multiply") { R = matMul(A, B); steps = "R = A × B (row by column)." }
    if (op === "transpose") { R = transpose(A); steps = "R = Aᵀ." }
    if (op === "determinant") {
      const d = n === 2 ? det2(A) : det3(A);
      return { main: String(round(d, 10)), steps: `det(A) = ${round(d,10)}`, A, B: null, R: null };
    }
    if (op === "inverse") {
      if (n !== 2) return { main: "—", steps: "Inverse implemented for 2x2 in this tool." , A, B:null, R:null};
      const inv = inv2(A);
      if (!inv) return { main: "—", steps: "Matrix is singular (determinant 0)." , A, B:null, R:null};
      R = inv; steps = "A⁻¹ = (1/det)·adj(A)";
    }
    return { main: "Computed", steps, A, B: (op==="add"||op==="multiply") ? B : null, R };
  }, [size, op, a, b]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Size</Label><SelectInput value={size} onChange={setSize} options={[{value:"2",label:"2x2"},{value:"3",label:"3x3"}]} /></div>
        <div><Label>Operation</Label><SelectInput value={op} onChange={setOp} options={[{value:"add",label:"Add"},{value:"multiply",label:"Multiply"},{value:"determinant",label:"Determinant"},{value:"inverse",label:"Inverse"},{value:"transpose",label:"Transpose"}]} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Matrix A (rows newline, cols space/comma)</Label><Textarea value={a} onChange={setA} rows={4} mono /></div>
        <div><Label>Matrix B</Label><Textarea value={b} onChange={setB} rows={4} mono /></div>
      </Grid2>
      <BigResult value={out.main} label="Matrix Result" />
      <Result>{out.steps}</Result>
      <Grid3>
        <MatrixGrid M={out.A} title="A" />
        <MatrixGrid M={out.B} title="B" />
        <MatrixGrid M={out.R} title="Result" />
      </Grid3>
    </VStack>
  );
}

function SequenceCalc() {
  const [type, setType] = useState("arithmetic");
  const [a1, setA1] = useState("2");
  const [d, setD] = useState("3");
  const [nTerm, setNTerm] = useState("10");
  const out = useMemo(() => {
    const A1 = n(a1), D = n(d), N = Math.max(1, Math.floor(n(nTerm)));
    let nth = 0, sum = 0, steps = "";
    if (type === "arithmetic") {
      nth = A1 + (N - 1) * D;
      sum = (N / 2) * (2 * A1 + (N - 1) * D);
      steps = `a_n = a1 + (n-1)d = ${A1} + (${N}-1)·${D} = ${nth}\nS_n = n/2[2a1 + (n-1)d] = ${sum}`;
    } else {
      nth = A1 * Math.pow(D, N - 1);
      sum = D === 1 ? A1 * N : A1 * (1 - Math.pow(D, N)) / (1 - D);
      steps = `a_n = a1·r^(n-1) = ${A1}·${D}^(${N}-1) = ${round(nth)}\nS_n = a1(1-r^n)/(1-r) = ${round(sum)}`;
    }
    return { nth, sum, steps };
  }, [type, a1, d, nTerm]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Type</Label><SelectInput value={type} onChange={setType} options={[{value:"arithmetic",label:"Arithmetic"},{value:"geometric",label:"Geometric"}]} /></div>
        <div><Label>a1</Label><Input value={a1} onChange={setA1} /></div>
        <div><Label>{type==="arithmetic"?"d":"r"}</Label><Input value={d} onChange={setD} /></div>
      </Grid3>
      <div><Label>n</Label><Input value={nTerm} onChange={setNTerm} /></div>
      <Grid2>
        <BigResult value={round(out.nth)} label="Nth Term" />
        <BigResult value={round(out.sum)} label="Sum (first n terms)" />
      </Grid2>
      <Result>{out.steps}</Result>
    </VStack>
  );
}

function PercentageAdvanced() {
  const [mode, setMode] = useState("xofy");
  const [x, setX] = useState("20");
  const [y, setY] = useState("80");
  const [z, setZ] = useState("100");
  const out = useMemo(() => {
    const X = n(x), Y = n(y), Z = n(z);
    if (mode === "xofy") {
      const v = (X / 100) * Y;
      return { main: round(v), steps: `${X}% of ${Y} = (${X}/100)×${Y} = ${round(v)}` };
    }
    if (mode === "xiswhatpercent") {
      if (Y === 0) return { main: "—", steps: "Y cannot be 0." };
      const v = (X / Y) * 100;
      return { main: `${round(v)}%`, steps: `${X} is what % of ${Y}: (${X}/${Y})×100 = ${round(v)}%` };
    }
    if (mode === "increase") {
      if (X === 0) return { main: "—", steps: "Original value cannot be 0." };
      const v = ((Y - X) / X) * 100;
      return { main: `${round(v)}%`, steps: `% change from ${X} to ${Y} = ((${Y}-${X})/${X})×100 = ${round(v)}%` };
    }
    const v = Y - X;
    return { main: `${round(v)} pp`, steps: `Percentage points difference: ${Y}% - ${X}% = ${round(v)} pp` };
  }, [mode, x, y, z]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Mode</Label><SelectInput value={mode} onChange={setMode} options={[
          {value:"xofy",label:"X% of Y"},
          {value:"xiswhatpercent",label:"X is what % of Y"},
          {value:"increase",label:"% Increase/Decrease"},
          {value:"pp",label:"Percentage Points"},
        ]} /></div>
        <div><Label>X</Label><Input value={x} onChange={setX} /></div>
        <div><Label>Y</Label><Input value={y} onChange={setY} /></div>
      </Grid3>
      <BigResult value={out.main} label="Percentage Result" />
      <Result>{out.steps}</Result>
    </VStack>
  );
}

function RatioSimplifier() {
  const [a, setA] = useState("24");
  const [b, setB] = useState("36");
  const [k, setK] = useState("3");
  const out = useMemo(() => {
    const A = Math.floor(n(a)), B = Math.floor(n(b)), K = n(k);
    const g = gcd2(A, B) || 1;
    const sa = A / g, sb = B / g;
    return {
      main: `${sa}:${sb}`,
      steps: `gcd(${A}, ${B}) = ${g}\nSimplified ratio = ${A}/${g} : ${B}/${g} = ${sa}:${sb}\nEquivalent ratio ×${K}: ${sa*K}:${sb*K}`,
    };
  }, [a, b, k]);

  return (
    <VStack>
      <Grid3>
        <div><Label>a</Label><Input value={a} onChange={setA} /></div>
        <div><Label>b</Label><Input value={b} onChange={setB} /></div>
        <div><Label>Equivalent factor</Label><Input value={k} onChange={setK} /></div>
      </Grid3>
      <BigResult value={out.main} label="Simplified Ratio" />
      <Result>{out.steps}</Result>
    </VStack>
  );
}

function parseFraction(s) {
  const t = s.trim();
  if (t.includes("/")) {
    const [p, q] = t.split("/").map(Number);
    return { n: p, d: q };
  }
  const v = Number(t);
  return { n: v, d: 1 };
}
function simpFrac(nu, de) {
  if (de === 0) return null;
  const sign = de < 0 ? -1 : 1;
  nu *= sign; de *= sign;
  const g = gcd2(Math.round(Math.abs(nu)), Math.round(Math.abs(de))) || 1;
  return { n: nu / g, d: de / g };
}
function FractionAdvanced() {
  const [f1, setF1] = useState("2/3");
  const [f2, setF2] = useState("5/6");
  const [op, setOp] = useState("add");
  const out = useMemo(() => {
    const A = parseFraction(f1), B = parseFraction(f2);
    if (!Number.isFinite(A.n) || !Number.isFinite(A.d) || !Number.isFinite(B.n) || !Number.isFinite(B.d) || A.d === 0 || B.d === 0) return { main: "—", steps: "Invalid fraction input." };
    let n1=A.n,d1=A.d,n2=B.n,d2=B.d, rn=0, rd=1, steps="";
    if (op === "add") {
      rn = n1*d2 + n2*d1; rd = d1*d2;
      steps = `${n1}/${d1} + ${n2}/${d2} = (${n1}×${d2} + ${n2}×${d1})/${d1*d2} = ${rn}/${rd}`;
    }
    if (op === "sub") {
      rn = n1*d2 - n2*d1; rd = d1*d2;
      steps = `${n1}/${d1} - ${n2}/${d2} = (${n1}×${d2} - ${n2}×${d1})/${d1*d2} = ${rn}/${rd}`;
    }
    if (op === "mul") {
      rn = n1*n2; rd = d1*d2;
      steps = `${n1}/${d1} × ${n2}/${d2} = ${rn}/${rd}`;
    }
    if (op === "div") {
      rn = n1*d2; rd = d1*n2;
      steps = `${n1}/${d1} ÷ ${n2}/${d2} = ${n1}/${d1} × ${d2}/${n2} = ${rn}/${rd}`;
    }
    const s = simpFrac(rn, rd);
    if (!s) return { main: "—", steps: "Division by zero encountered." };
    return { main: `${s.n}/${s.d}`, steps: `${steps}\nSimplified: ${s.n}/${s.d}` };
  }, [f1, f2, op]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Fraction 1</Label><Input value={f1} onChange={setF1} /></div>
        <div><Label>Operation</Label><SelectInput value={op} onChange={setOp} options={[{value:"add",label:"Add"},{value:"sub",label:"Subtract"},{value:"mul",label:"Multiply"},{value:"div",label:"Divide"}]} /></div>
        <div><Label>Fraction 2</Label><Input value={f2} onChange={setF2} /></div>
      </Grid3>
      <BigResult value={out.main} label="Fraction Result" />
      <Result>{out.steps}</Result>
    </VStack>
  );
}

function MeanMedianModeCalc() {
  const [inp, setInp] = useState("4, 8, 15, 16, 23, 42");

  const out = useMemo(() => {
    const nums = parseNumsCSV(inp); // robust: comma/space/newline, keeps negatives & decimals
    const count = nums.length;
    if (count === 0) return { empty: true };

    const sum = nums.reduce((s, x) => s + x, 0);
    const mean = sum / count;

    const sorted = [...nums].sort((a, b) => a - b);
    const mid = Math.floor(count / 2);
    const median = count % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

    // Mode — handles multiple modes and "no mode" (all values unique)
    const freq = {};
    let maxFreq = 0;
    for (const x of nums) { freq[x] = (freq[x] || 0) + 1; if (freq[x] > maxFreq) maxFreq = freq[x]; }
    let modeStr;
    if (maxFreq <= 1) modeStr = "No mode";
    else modeStr = Object.keys(freq).filter(k => freq[k] === maxFreq).map(Number).sort((a, b) => a - b).join(", ");

    const min = sorted[0], max = sorted[count - 1], range = max - min;

    const sqDiff = nums.reduce((s, x) => s + (x - mean) ** 2, 0);
    const popVar = sqDiff / count;                       // Σ(x−mean)²/n
    const sampVar = count > 1 ? sqDiff / (count - 1) : null; // Σ(x−mean)²/(n−1)
    const popStd = Math.sqrt(popVar);
    const sampStd = sampVar === null ? null : Math.sqrt(sampVar);

    return { empty: false, count, sum, mean, median, modeStr, min, max, range, popVar, sampVar, popStd, sampStd };
  }, [inp]);

  if (out.empty) {
    return (
      <VStack>
        <div><Label>Numbers (comma, space, or newline separated)</Label><Textarea value={inp} onChange={setInp} rows={4} /></div>
        <Result>Enter at least one number to compute statistics.</Result>
      </VStack>
    );
  }

  const rows = [
    ["Count (n)", String(out.count)],
    ["Sum", round(out.sum, 4)],
    ["Mean", round(out.mean, 4)],
    ["Median", round(out.median, 4)],
    ["Mode", out.modeStr],
    ["Minimum", round(out.min, 4)],
    ["Maximum", round(out.max, 4)],
    ["Range", round(out.range, 4)],
    ["Population Variance (σ²)", round(out.popVar, 4)],
    ["Sample Variance (s²)", out.sampVar === null ? "—" : round(out.sampVar, 4)],
    ["Population Std Dev (σ)", round(out.popStd, 4)],
    ["Sample Std Dev (s)", out.sampStd === null ? "—" : round(out.sampStd, 4)],
  ];

  return (
    <VStack>
      <div><Label>Numbers (comma, space, or newline separated)</Label><Textarea value={inp} onChange={setInp} rows={4} /></div>
      <Grid3>
        <BigResult value={round(out.mean, 4)} label="Mean" />
        <BigResult value={round(out.median, 4)} label="Median" />
        <BigResult value={out.modeStr} label="Mode" />
      </Grid3>
      <Result>{rows.map(([k, v]) => `${k}: ${v}`).join("\n")}</Result>
    </VStack>
  );
}

function toRoman(num) {
  const map = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let x = num, out = "";
  for (const [v, sym] of map) { while (x >= v) { out += sym; x -= v; } }
  return out;
}

function fromRoman(str) {
  const vals = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  const s = String(str).toUpperCase().trim();
  if (!/^[IVXLCDM]+$/.test(s)) return null;
  let total = 0, prev = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    const v = vals[s[i]];
    if (v < prev) total -= v; else { total += v; prev = v; }
  }
  // Round-trip check rejects malformed sequences like IIII, VV, IC, XM.
  if (total < 1 || total > 3999 || toRoman(total) !== s) return null;
  return total;
}

function RomanNumeralConverter() {
  const [mode, setMode] = useState("toRoman");
  const [num, setNum] = useState("2026");
  const [roman, setRoman] = useState("MMXXVI");

  const out = useMemo(() => {
    if (mode === "toRoman") {
      const raw = String(num).trim();
      const v = Number(raw);
      if (raw === "" || !Number.isInteger(v) || v < 1 || v > 3999) {
        return { main: "—", err: "Enter a whole number from 1 to 3999.", steps: "" };
      }
      const r = toRoman(v);
      return { main: r, err: "", steps: `${v} = ${r}` };
    }
    const parsed = fromRoman(roman);
    if (parsed === null) {
      return { main: "—", err: "Invalid Roman numeral. Use standard form for 1–3999, e.g. MCMXCIV.", steps: "" };
    }
    return { main: String(parsed), err: "", steps: `${String(roman).toUpperCase().trim()} = ${parsed}` };
  }, [mode, num, roman]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Direction</Label><SelectInput value={mode} onChange={setMode} options={[{ value: "toRoman", label: "Number → Roman" }, { value: "toNumber", label: "Roman → Number" }]} /></div>
        {mode === "toRoman"
          ? <div><Label>Number (1–3999)</Label><Input value={num} onChange={setNum} /></div>
          : <div><Label>Roman Numeral</Label><Input value={roman} onChange={setRoman} /></div>}
      </Grid2>
      <BigResult value={out.main} label={mode === "toRoman" ? "Roman Numeral" : "Number"} />
      <Result>{out.err ? `⚠️ ${out.err}` : out.steps}</Result>
    </VStack>
  );
}

const MAX_SAFE = Number.MAX_SAFE_INTEGER;
const fmtBig = (v) => (!Number.isFinite(v) ? "—" : v <= MAX_SAFE ? Math.round(v).toLocaleString("en-US") : v.toExponential(6));

function PermutationCombinationCalc() {
  const [nv, setNv] = useState("10");
  const [rv, setRv] = useState("3");
  const out = useMemo(() => {
    const N = Math.floor(Number(nv));
    const R = Math.floor(Number(rv));
    if (nv.trim() === "" || rv.trim() === "" || !Number.isFinite(N) || !Number.isFinite(R)) return { err: "Enter non-negative integers n and r." };
    if (N < 0 || R < 0) return { err: "n and r must be non-negative." };
    if (R > N) return { err: "r must be ≤ n." };
    const fact = (k) => { let f = 1; for (let i = 2; i <= k; i++) f *= i; return f; };
    // nPr = n·(n-1)·…·(n-r+1)  (iterative product avoids full n! overflow)
    let nPr = 1;
    for (let i = 0; i < R; i++) nPr *= (N - i);
    // nCr = nPr / r!
    const rFact = fact(R);
    const nCr = nPr <= MAX_SAFE ? Math.round(nPr / rFact) : nPr / rFact;
    const nFact = fact(N);
    const overflow = nPr > MAX_SAFE || nCr > MAX_SAFE || nFact > MAX_SAFE;
    return {
      err: "", N, R, nPr, nCr, nFact, rFact, overflow,
      steps:
        `nPr = n! / (n−r)! = ${N}·${N - 1 >= N - R + 1 ? "…" : ""}(${N - R + 1})  [product of ${R} terms]\n` +
        `nPr = ${fmtBig(nPr)}\n` +
        `nCr = nPr / r! = ${fmtBig(nPr)} / ${fmtBig(rFact)}\n` +
        `nCr = ${fmtBig(nCr)}\n` +
        `n! = ${fmtBig(nFact)}    r! = ${fmtBig(rFact)}` +
        (overflow ? `\n\n⚠️ Result exceeds Number.MAX_SAFE_INTEGER (2^53−1); values shown in scientific notation are approximate.` : ""),
    };
  }, [nv, rv]);

  return (
    <VStack>
      <Grid2>
        <div><Label>n (total items)</Label><Input value={nv} onChange={setNv} /></div>
        <div><Label>r (chosen)</Label><Input value={rv} onChange={setRv} /></div>
      </Grid2>
      {out.err
        ? <Result>{`⚠️ ${out.err}`}</Result>
        : <>
            <Grid2>
              <BigResult value={fmtBig(out.nPr)} label={`Permutations · ${out.N}P${out.R}`} />
              <BigResult value={fmtBig(out.nCr)} label={`Combinations · ${out.N}C${out.R}`} />
            </Grid2>
            <Result>{out.steps}</Result>
          </>}
    </VStack>
  );
}

function ZScoreCalc() {
  const [x, setX] = useState("85");
  const [mu, setMu] = useState("70");
  const [sigma, setSigma] = useState("10");
  const out = useMemo(() => {
    const X = Number(x), M = Number(mu), S = Number(sigma);
    if (x.trim() === "" || mu.trim() === "" || sigma.trim() === "" || !Number.isFinite(X) || !Number.isFinite(M) || !Number.isFinite(S)) return { err: "Enter numeric x, μ and σ." };
    if (S <= 0) return { err: "Standard deviation σ must be greater than 0." };
    // erf via Abramowitz & Stegun 7.1.26
    const erf = (t) => {
      const sign = t < 0 ? -1 : 1;
      const a = Math.abs(t);
      const u = 1 / (1 + 0.3275911 * a);
      const y = 1 - (((((1.061405429 * u - 1.453152027) * u) + 1.421413741) * u - 0.284496736) * u + 0.254829592) * u * Math.exp(-a * a);
      return sign * y;
    };
    const z = (X - M) / S;
    const phi = 0.5 * (1 + erf(z / Math.SQRT2));
    const pct = phi * 100;
    return {
      err: "", z, pct,
      steps:
        `z = (x − μ) / σ = (${X} − ${M}) / ${S} = ${round(z, 6)}\n` +
        `Φ(z) = 0.5·(1 + erf(z/√2)) ≈ ${round(phi, 6)}\n` +
        `Percentile (area to the left) ≈ ${round(pct, 2)}%  (approximate, A&S erf)`,
    };
  }, [x, mu, sigma]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Value x</Label><Input value={x} onChange={setX} /></div>
        <div><Label>Mean μ</Label><Input value={mu} onChange={setMu} /></div>
        <div><Label>Std Dev σ</Label><Input value={sigma} onChange={setSigma} /></div>
      </Grid3>
      {out.err
        ? <Result>{`⚠️ ${out.err}`}</Result>
        : <>
            <Grid2>
              <BigResult value={round(out.z, 4)} label="Z-Score" />
              <BigResult value={`${round(out.pct, 2)}%`} label="Percentile (approx.)" />
            </Grid2>
            <Result>{out.steps}</Result>
          </>}
    </VStack>
  );
}

function PercentageChangeCalc() {
  const [oldV, setOldV] = useState("120");
  const [newV, setNewV] = useState("150");
  const out = useMemo(() => {
    const O = Number(oldV), Nn = Number(newV);
    if (oldV.trim() === "" || newV.trim() === "" || !Number.isFinite(O) || !Number.isFinite(Nn)) return { err: "Enter both old and new values." };
    const diff = Nn - O;
    const dir = diff > 0 ? "increase ▲" : diff < 0 ? "decrease ▼" : "no change";
    if (O === 0) {
      return {
        err: "", diff, dir, pct: null,
        main: "undefined (from zero)",
        steps: `Absolute difference = ${round(Nn, 6)} − 0 = ${round(diff, 6)}\n% change is undefined when the old value is 0 (division by zero).`,
      };
    }
    const pct = (diff / Math.abs(O)) * 100;
    const ofOld = (Nn / O) * 100; // new is what % of old
    return {
      err: "", diff, dir, pct,
      main: `${pct > 0 ? "+" : ""}${round(pct, 4)}%`,
      steps:
        `% change = (new − old) / |old| × 100\n` +
        `= (${round(Nn, 6)} − ${round(O, 6)}) / |${round(O, 6)}| × 100\n` +
        `= ${round(pct, 4)}%  (${dir})\n` +
        `Absolute difference = ${round(diff, 6)}\n` +
        `New is ${round(ofOld, 4)}% of old`,
    };
  }, [oldV, newV]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Old / original value</Label><Input value={oldV} onChange={setOldV} /></div>
        <div><Label>New value</Label><Input value={newV} onChange={setNewV} /></div>
      </Grid2>
      {out.err
        ? <Result>{`⚠️ ${out.err}`}</Result>
        : <>
            <BigResult value={out.main} label={`Percentage Change · ${out.dir}`} />
            <Result>{out.steps}</Result>
          </>}
    </VStack>
  );
}

function DecimalToFractionCalc() {
  const [val, setVal] = useState("0.375");
  const [repeat, setRepeat] = useState("0");
  const out = useMemo(() => {
    const s = val.trim();
    if (s === "" || !/^[-+]?\d*\.?\d+$/.test(s)) return { err: "Enter a decimal number, e.g. 0.375." };
    const num = Number(s);
    if (!Number.isFinite(num)) return { err: "Invalid decimal." };
    const sign = s.startsWith("-") ? -1 : 1;
    const clean = s.replace(/^[-+]/, "");
    const parts = clean.split(".");
    const wholeStr = parts[0] || "0";
    const fracStr = parts[1] || "";
    const decimals = fracStr.length;
    const repN = Math.max(0, Math.floor(Number(repeat) || 0));

    let numerator, denominator, method;
    if (repN > 0 && repN <= decimals) {
      // Repeating decimal: split fractional digits into non-repeating (a) + repeating (b)
      const a = decimals - repN;        // non-repeating count
      const b = repN;                   // repeating count
      const fullInt = parseInt(fracStr || "0", 10);            // all a+b digits
      const nonRepInt = a > 0 ? parseInt(fracStr.slice(0, a), 10) : 0;
      const fracNum = fullInt - nonRepInt;                      // numerator of pure fractional part
      const fracDen = Math.pow(10, a + b) - Math.pow(10, a);    // 10^(a+b) − 10^a
      const wholeInt = parseInt(wholeStr, 10);
      numerator = wholeInt * fracDen + fracNum;                 // combine whole + fraction
      denominator = fracDen;
      method = "repeating";
    } else {
      // Terminating decimal: multiply to clear the point, then reduce by GCD
      denominator = Math.pow(10, decimals) || 1;
      numerator = Math.round(Math.abs(num) * denominator);
      method = "terminating";
    }

    const g = gcd2(numerator, denominator) || 1;               // reduce logic
    const rn = numerator / g;
    const rd = denominator / g;
    const whole = Math.floor(rn / rd);
    const remN = rn - whole * rd;
    const mixed = rd !== 1 && rn > rd ? `${whole} ${remN}/${rd}` : null;
    const fraction = rd === 1 ? `${sign < 0 ? "-" : ""}${rn}` : `${sign < 0 ? "-" : ""}${rn}/${rd}`;

    return {
      err: "", fraction, mixed, g, rn, rd, sign, method,
      steps:
        (method === "terminating"
          ? `Terminating: ${clean} = ${numerator}/${denominator}\n`
          : `Repeating (${repN} repeating digit${repN > 1 ? "s" : ""}): value = ${numerator}/${denominator}\n`) +
        `GCD(${numerator}, ${denominator}) = ${g}\n` +
        `Reduced: ${numerator}/${g} : ${denominator}/${g} = ${sign < 0 ? "-" : ""}${rn}/${rd}` +
        (mixed ? `\nMixed number: ${sign < 0 ? "-" : ""}${mixed}` : ""),
    };
  }, [val, repeat]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Decimal value</Label><Input value={val} onChange={setVal} /></div>
        <div><Label>Repeating trailing digits (0 = none)</Label><Input value={repeat} onChange={setRepeat} /></div>
      </Grid2>
      {out.err
        ? <Result>{`⚠️ ${out.err}`}</Result>
        : <>
            <BigResult value={out.fraction} label={out.mixed ? `Fraction (mixed: ${out.sign < 0 ? "-" : ""}${out.mixed})` : "Simplified Fraction"} />
            <Result>{out.steps}</Result>
          </>}
    </VStack>
  );
}

const PI = Math.PI;

function CircleCalc() {
  const [known, setKnown] = useState("radius");
  const [val, setVal] = useState("5");
  const out = useMemo(() => {
    const v = n(val);
    if (v <= 0) return { err: "Enter a positive value." };
    let r;
    if (known === "radius") r = v;
    else if (known === "diameter") r = v / 2;
    else if (known === "circumference") r = v / (2 * PI);
    else r = Math.sqrt(v / PI); // area
    return {
      err: "", r,
      area: PI * r * r, circ: 2 * PI * r, dia: 2 * r,
      steps: `r = ${round(r)}\nArea = πr² = ${round(PI * r * r)}\nCircumference = 2πr = ${round(2 * PI * r)}\nDiameter = 2r = ${round(2 * r)}`,
    };
  }, [known, val]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Known Value</Label><SelectInput value={known} onChange={setKnown} options={[{value:"radius",label:"Radius"},{value:"diameter",label:"Diameter"},{value:"circumference",label:"Circumference"},{value:"area",label:"Area"}]} /></div>
        <div><Label>Value</Label><Input value={val} onChange={setVal} /></div>
      </Grid2>
      {out.err ? <Result>{`⚠️ ${out.err}`}</Result> : <>
        <Grid3>
          <BigResult value={round(out.area)} label="Area" />
          <BigResult value={round(out.circ)} label="Circumference" />
          <BigResult value={round(out.dia)} label="Diameter" />
        </Grid3>
        <Result>{out.steps}</Result>
        <ShapeSVG shape="circle" labels={{ r: round(out.r) }} />
      </>}
    </VStack>
  );
}

function TriangleSolver() {
  const [a, setA] = useState("3");
  const [b, setB] = useState("4");
  const [c, setC] = useState("5");
  const out = useMemo(() => {
    const A = n(a), B = n(b), Cc = n(c);
    if (A <= 0 || B <= 0 || Cc <= 0) return { err: "All sides must be positive." };
    if (A + B <= Cc || A + Cc <= B || B + Cc <= A) return { err: "Triangle inequality fails: no triangle with these sides." };
    const s = (A + B + Cc) / 2;
    const area = Math.sqrt(s * (s - A) * (s - B) * (s - Cc));
    const angA = Math.acos((B * B + Cc * Cc - A * A) / (2 * B * Cc)) * 180 / PI;
    const angB = Math.acos((A * A + Cc * Cc - B * B) / (2 * A * Cc)) * 180 / PI;
    const angC = 180 - angA - angB;
    const set = new Set([A, B, Cc]);
    const type = set.size === 1 ? "Equilateral" : set.size === 2 ? "Isosceles" : "Scalene";
    const right = [angA, angB, angC].some(x => Math.abs(x - 90) < 1e-6) ? " (right triangle)" : "";
    return {
      err: "", area, s, per: A + B + Cc, angA, angB, angC, type: type + right,
      steps: `s = (a+b+c)/2 = ${round(s)}\nArea = √(s(s-a)(s-b)(s-c)) = ${round(area)}\nAngle A (opp a) = ${round(angA, 4)}°\nAngle B (opp b) = ${round(angB, 4)}°\nAngle C (opp c) = ${round(angC, 4)}°\nType: ${type + right}`,
    };
  }, [a, b, c]);
  return (
    <VStack>
      <Grid3>
        <div><Label>Side a</Label><Input value={a} onChange={setA} /></div>
        <div><Label>Side b</Label><Input value={b} onChange={setB} /></div>
        <div><Label>Side c</Label><Input value={c} onChange={setC} /></div>
      </Grid3>
      {out.err ? <Result>{`⚠️ ${out.err}`}</Result> : <>
        <Grid2>
          <BigResult value={round(out.area)} label="Area (Heron)" />
          <BigResult value={round(out.per)} label="Perimeter" />
        </Grid2>
        <Result>{out.steps}</Result>
      </>}
    </VStack>
  );
}

function SphereCalc() {
  const [r, setR] = useState("3");
  const out = useMemo(() => {
    const R = n(r);
    if (R <= 0) return { err: "Radius must be positive." };
    return {
      err: "", vol: 4 / 3 * PI * R ** 3, sa: 4 * PI * R * R, dia: 2 * R, gc: 2 * PI * R,
      steps: `Volume = 4/3·πr³ = ${round(4 / 3 * PI * R ** 3)}\nSurface area = 4πr² = ${round(4 * PI * R * R)}\nDiameter = 2r = ${round(2 * R)}\nGreat-circle circumference = 2πr = ${round(2 * PI * R)}`,
    };
  }, [r]);
  return (
    <VStack>
      <div><Label>Radius r</Label><Input value={r} onChange={setR} /></div>
      {out.err ? <Result>{`⚠️ ${out.err}`}</Result> : <>
        <Grid2>
          <BigResult value={round(out.vol)} label="Volume" />
          <BigResult value={round(out.sa)} label="Surface Area" />
        </Grid2>
        <Result>{out.steps}</Result>
      </>}
    </VStack>
  );
}

function CylinderCalc() {
  const [r, setR] = useState("3");
  const [h, setH] = useState("5");
  const out = useMemo(() => {
    const R = n(r), H = n(h);
    if (R <= 0 || H <= 0) return { err: "Radius and height must be positive." };
    return {
      err: "", vol: PI * R * R * H, base: PI * R * R, lat: 2 * PI * R * H, total: 2 * PI * R * (R + H),
      steps: `Volume = πr²h = ${round(PI * R * R * H)}\nBase area = πr² = ${round(PI * R * R)}\nLateral surface = 2πrh = ${round(2 * PI * R * H)}\nTotal surface = 2πr(r+h) = ${round(2 * PI * R * (R + H))}`,
    };
  }, [r, h]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Radius r</Label><Input value={r} onChange={setR} /></div>
        <div><Label>Height h</Label><Input value={h} onChange={setH} /></div>
      </Grid2>
      {out.err ? <Result>{`⚠️ ${out.err}`}</Result> : <>
        <Grid2>
          <BigResult value={round(out.vol)} label="Volume" />
          <BigResult value={round(out.total)} label="Total Surface Area" />
        </Grid2>
        <Result>{out.steps}</Result>
      </>}
    </VStack>
  );
}

function ConeCalc() {
  const [r, setR] = useState("3");
  const [h, setH] = useState("4");
  const out = useMemo(() => {
    const R = n(r), H = n(h);
    if (R <= 0 || H <= 0) return { err: "Radius and height must be positive." };
    const l = Math.sqrt(R * R + H * H);
    return {
      err: "", vol: 1 / 3 * PI * R * R * H, slant: l, lat: PI * R * l, base: PI * R * R, total: PI * R * l + PI * R * R,
      steps: `Slant height l = √(r²+h²) = ${round(l)}\nVolume = 1/3·πr²h = ${round(1 / 3 * PI * R * R * H)}\nLateral surface = πrl = ${round(PI * R * l)}\nBase area = πr² = ${round(PI * R * R)}\nTotal surface = πr(l+r) = ${round(PI * R * l + PI * R * R)}`,
    };
  }, [r, h]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Radius r</Label><Input value={r} onChange={setR} /></div>
        <div><Label>Height h</Label><Input value={h} onChange={setH} /></div>
      </Grid2>
      {out.err ? <Result>{`⚠️ ${out.err}`}</Result> : <>
        <Grid3>
          <BigResult value={round(out.vol)} label="Volume" />
          <BigResult value={round(out.slant)} label="Slant Height" />
          <BigResult value={round(out.total)} label="Total Surface" />
        </Grid3>
        <Result>{out.steps}</Result>
      </>}
    </VStack>
  );
}

function EllipseCalc() {
  const [a, setA] = useState("5");
  const [b, setB] = useState("3");
  const out = useMemo(() => {
    const A0 = n(a), B0 = n(b);
    if (A0 <= 0 || B0 <= 0) return { err: "Both semi-axes must be positive." };
    const A = Math.max(A0, B0), B = Math.min(A0, B0);
    const per = PI * (3 * (A0 + B0) - Math.sqrt((3 * A0 + B0) * (A0 + 3 * B0)));
    const ecc = Math.sqrt(1 - (B * B) / (A * A));
    const foci = Math.sqrt(A * A - B * B);
    return {
      err: "", area: PI * A0 * B0, per, ecc, foci,
      steps: `Area = πab = ${round(PI * A0 * B0)}\nPerimeter ≈ π[3(a+b)−√((3a+b)(a+3b))] = ${round(per)}  (Ramanujan)\nEccentricity e = √(1−b²/a²) = ${round(ecc)}\nFocal distance c = √(a²−b²) = ${round(foci)}`,
    };
  }, [a, b]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Semi-axis a</Label><Input value={a} onChange={setA} /></div>
        <div><Label>Semi-axis b</Label><Input value={b} onChange={setB} /></div>
      </Grid2>
      {out.err ? <Result>{`⚠️ ${out.err}`}</Result> : <>
        <Grid2>
          <BigResult value={round(out.area)} label="Area" />
          <BigResult value={round(out.per)} label="Perimeter (approx.)" />
        </Grid2>
        <Result>{out.steps}</Result>
        <ShapeSVG shape="ellipse" labels={{ a, b }} />
      </>}
    </VStack>
  );
}

function RegularPolygonCalc() {
  const [sides, setSides] = useState("6");
  const [side, setSide] = useState("4");
  const out = useMemo(() => {
    const N = Math.floor(n(sides)), s = n(side);
    if (N < 3) return { err: "A polygon needs at least 3 sides." };
    if (s <= 0) return { err: "Side length must be positive." };
    const interior = (N - 2) * 180 / N;
    const exterior = 360 / N;
    const per = N * s;
    const apothem = s / (2 * Math.tan(PI / N));
    const area = 0.5 * per * apothem;
    const circum = s / (2 * Math.sin(PI / N));
    return {
      err: "", interior, exterior, per, apothem, area, circum,
      steps: `Interior angle = (n−2)·180/n = ${round(interior, 4)}°\nExterior angle = 360/n = ${round(exterior, 4)}°\nPerimeter = n·s = ${round(per)}\nApothem = s/(2·tan(π/n)) = ${round(apothem)}\nArea = ½·perimeter·apothem = ${round(area)}\nCircumradius = s/(2·sin(π/n)) = ${round(circum)}`,
    };
  }, [sides, side]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Number of Sides n</Label><Input value={sides} onChange={setSides} /></div>
        <div><Label>Side Length s</Label><Input value={side} onChange={setSide} /></div>
      </Grid2>
      {out.err ? <Result>{`⚠️ ${out.err}`}</Result> : <>
        <Grid3>
          <BigResult value={round(out.area)} label="Area" />
          <BigResult value={round(out.per)} label="Perimeter" />
          <BigResult value={`${round(out.interior, 4)}°`} label="Interior Angle" />
        </Grid3>
        <Result>{out.steps}</Result>
      </>}
    </VStack>
  );
}

function TrapezoidCalc() {
  const [a, setA] = useState("8");
  const [b, setB] = useState("4");
  const [h, setH] = useState("3");
  const [c, setC] = useState("5");
  const [d, setD] = useState("5");
  const out = useMemo(() => {
    const A = n(a), B = n(b), H = n(h), C0 = n(c), D0 = n(d);
    if (A <= 0 || B <= 0 || H <= 0) return { err: "Parallel sides a, b and height h must be positive." };
    return {
      err: "", area: 0.5 * (A + B) * H, mid: (A + B) / 2, per: A + B + C0 + D0,
      steps: `Area = ½(a+b)·h = ½(${A}+${B})·${H} = ${round(0.5 * (A + B) * H)}\nMedian (midsegment) = (a+b)/2 = ${round((A + B) / 2)}\nPerimeter = a+b+c+d = ${round(A + B + C0 + D0)}`,
    };
  }, [a, b, h, c, d]);
  return (
    <VStack>
      <Grid3>
        <div><Label>Parallel side a</Label><Input value={a} onChange={setA} /></div>
        <div><Label>Parallel side b</Label><Input value={b} onChange={setB} /></div>
        <div><Label>Height h</Label><Input value={h} onChange={setH} /></div>
      </Grid3>
      <Grid2>
        <div><Label>Leg c</Label><Input value={c} onChange={setC} /></div>
        <div><Label>Leg d</Label><Input value={d} onChange={setD} /></div>
      </Grid2>
      {out.err ? <Result>{`⚠️ ${out.err}`}</Result> : <>
        <Grid3>
          <BigResult value={round(out.area)} label="Area" />
          <BigResult value={round(out.mid)} label="Median" />
          <BigResult value={round(out.per)} label="Perimeter" />
        </Grid3>
        <Result>{out.steps}</Result>
      </>}
    </VStack>
  );
}

function Vector2DCalc() {
  const [ux, setUx] = useState("3"), [uy, setUy] = useState("4");
  const [vx, setVx] = useState("1"), [vy, setVy] = useState("2");
  const out = useMemo(() => {
    const UX = n(ux), UY = n(uy), VX = n(vx), VY = n(vy);
    const mu = Math.hypot(UX, UY), mv = Math.hypot(VX, VY);
    const dot = UX * VX + UY * VY, cross = UX * VY - UY * VX;
    const ang = (mu === 0 || mv === 0) ? null : Math.acos(Math.max(-1, Math.min(1, dot / (mu * mv)))) * 180 / PI;
    return {
      mu, mv, dot, cross, ang, sx: UX + VX, sy: UY + VY,
      steps: `|u| = √(uₓ²+u_y²) = ${round(mu)}\n|v| = ${round(mv)}\nu·v = uₓvₓ + u_yv_y = ${round(dot)}\nCross (z) = uₓv_y − u_yvₓ = ${round(cross)}\nu + v = (${round(UX + VX)}, ${round(UY + VY)})\nAngle = ${ang === null ? "undefined (zero vector)" : round(ang, 4) + "°"}`,
    };
  }, [ux, uy, vx, vy]);
  return (
    <VStack>
      <Grid2>
        <div><Label>u = (uₓ, u_y)</Label><Grid2><Input value={ux} onChange={setUx} /><Input value={uy} onChange={setUy} /></Grid2></div>
        <div><Label>v = (vₓ, v_y)</Label><Grid2><Input value={vx} onChange={setVx} /><Input value={vy} onChange={setVy} /></Grid2></div>
      </Grid2>
      <Grid3>
        <BigResult value={round(out.dot)} label="Dot Product" />
        <BigResult value={round(out.cross)} label="Cross (z)" />
        <BigResult value={out.ang === null ? "—" : `${round(out.ang, 3)}°`} label="Angle" />
      </Grid3>
      <Result>{out.steps}</Result>
    </VStack>
  );
}

function Vector3DCalc() {
  const [ux, setUx] = useState("1"), [uy, setUy] = useState("2"), [uz, setUz] = useState("3");
  const [vx, setVx] = useState("4"), [vy, setVy] = useState("5"), [vz, setVz] = useState("6");
  const out = useMemo(() => {
    const U = [n(ux), n(uy), n(uz)], V = [n(vx), n(vy), n(vz)];
    const mu = Math.hypot(...U), mv = Math.hypot(...V);
    const dot = U[0] * V[0] + U[1] * V[1] + U[2] * V[2];
    const cross = [U[1] * V[2] - U[2] * V[1], U[2] * V[0] - U[0] * V[2], U[0] * V[1] - U[1] * V[0]];
    const ang = (mu === 0 || mv === 0) ? null : Math.acos(Math.max(-1, Math.min(1, dot / (mu * mv)))) * 180 / PI;
    return {
      mu, mv, dot, cross, mcross: Math.hypot(...cross), ang,
      steps: `|u| = ${round(mu)}   |v| = ${round(mv)}\nu·v = ${round(dot)}\nu×v = (${round(cross[0])}, ${round(cross[1])}, ${round(cross[2])})\n|u×v| = ${round(Math.hypot(...cross))}\nAngle = ${ang === null ? "undefined (zero vector)" : round(ang, 4) + "°"}`,
    };
  }, [ux, uy, uz, vx, vy, vz]);
  return (
    <VStack>
      <div><Label>u = (uₓ, u_y, u_z)</Label><Grid3><Input value={ux} onChange={setUx} /><Input value={uy} onChange={setUy} /><Input value={uz} onChange={setUz} /></Grid3></div>
      <div><Label>v = (vₓ, v_y, v_z)</Label><Grid3><Input value={vx} onChange={setVx} /><Input value={vy} onChange={setVy} /><Input value={vz} onChange={setVz} /></Grid3></div>
      <Grid3>
        <BigResult value={round(out.dot)} label="Dot Product" />
        <BigResult value={`(${round(out.cross[0])}, ${round(out.cross[1])}, ${round(out.cross[2])})`} label="Cross Product" />
        <BigResult value={out.ang === null ? "—" : `${round(out.ang, 3)}°`} label="Angle" />
      </Grid3>
      <Result>{out.steps}</Result>
    </VStack>
  );
}

function Distance3DCalc() {
  const [x1, setX1] = useState("0"), [y1, setY1] = useState("0"), [z1, setZ1] = useState("0");
  const [x2, setX2] = useState("1"), [y2, setY2] = useState("2"), [z2, setZ2] = useState("2");
  const out = useMemo(() => {
    const dx = n(x2) - n(x1), dy = n(y2) - n(y1), dz = n(z2) - n(z1);
    const d = Math.hypot(dx, dy, dz);
    return {
      d,
      steps: `d = √((x₂−x₁)² + (y₂−y₁)² + (z₂−z₁)²)\nΔx=${round(dx)}, Δy=${round(dy)}, Δz=${round(dz)}\nd = √(${round(dx * dx)} + ${round(dy * dy)} + ${round(dz * dz)})\nd = √${round(dx * dx + dy * dy + dz * dz)} = ${round(d)}`,
    };
  }, [x1, y1, z1, x2, y2, z2]);
  return (
    <VStack>
      <div><Label>Point 1 (x₁, y₁, z₁)</Label><Grid3><Input value={x1} onChange={setX1} /><Input value={y1} onChange={setY1} /><Input value={z1} onChange={setZ1} /></Grid3></div>
      <div><Label>Point 2 (x₂, y₂, z₂)</Label><Grid3><Input value={x2} onChange={setX2} /><Input value={y2} onChange={setY2} /><Input value={z2} onChange={setZ2} /></Grid3></div>
      <BigResult value={round(out.d)} label="3D Distance" />
      <Result>{out.steps}</Result>
    </VStack>
  );
}

function CubicSolver() {
  const [a, setA] = useState("1"), [b, setB] = useState("-6"), [c, setC] = useState("11"), [d, setD] = useState("-6");
  const out = useMemo(() => {
    const A = n(a), B = n(b), Cc = n(c), D = n(d);
    if (A === 0) return { err: "a cannot be 0 (that would not be cubic)." };
    const p = (3 * A * Cc - B * B) / (3 * A * A);
    const q = (2 * B ** 3 - 9 * A * B * Cc + 27 * A * A * D) / (27 * A ** 3);
    const shift = -B / (3 * A);
    const disc = (q * q) / 4 + (p ** 3) / 27;
    const roots = [];
    let kind;
    if (Math.abs(p) < 1e-12 && Math.abs(q) < 1e-12) {
      roots.push(shift, shift, shift); kind = "Triple real root";
    } else if (disc > 1e-10) {
      const sq = Math.sqrt(disc);
      const u = Math.cbrt(-q / 2 + sq), v = Math.cbrt(-q / 2 - sq);
      const t = u + v;
      const re = -t / 2 + shift, im = Math.sqrt(3) / 2 * (u - v);
      roots.push(t + shift, { re, im }, { re, im: -im });
      kind = "One real root, two complex conjugate roots";
    } else if (Math.abs(disc) <= 1e-10) {
      const u = Math.cbrt(-q / 2);
      roots.push(2 * u + shift, -u + shift, -u + shift); kind = "Three real roots (a repeated root)";
    } else {
      const r = Math.sqrt(-(p ** 3) / 27);
      const phi = Math.acos(Math.max(-1, Math.min(1, -q / (2 * r))));
      const m = 2 * Math.cbrt(r);
      for (let k = 0; k < 3; k++) roots.push(m * Math.cos((phi + 2 * PI * k) / 3) + shift);
      kind = "Three distinct real roots";
    }
    const fmt = (x) => typeof x === "number" ? round(x, 6) : `${round(x.re, 6)} ${x.im >= 0 ? "+" : "−"} ${round(Math.abs(x.im), 6)}i`;
    return {
      err: "", kind, list: roots.map(fmt),
      steps: `Equation: ${A}x³ + ${B}x² + ${Cc}x + ${D} = 0\nDiscriminant Δ = ${round(disc, 6)}\n${kind}\n` + roots.map((x, i) => `x${i + 1} = ${fmt(x)}`).join("\n"),
    };
  }, [a, b, c, d]);
  return (
    <VStack>
      <Grid2>
        <Grid2>
          <div><Label>a</Label><Input value={a} onChange={setA} /></div>
          <div><Label>b</Label><Input value={b} onChange={setB} /></div>
        </Grid2>
        <Grid2>
          <div><Label>c</Label><Input value={c} onChange={setC} /></div>
          <div><Label>d</Label><Input value={d} onChange={setD} /></div>
        </Grid2>
      </Grid2>
      {out.err ? <Result>{`⚠️ ${out.err}`}</Result> : <>
        <BigResult value={out.list.join(",  ")} label="Roots" />
        <Result>{out.steps}</Result>
      </>}
    </VStack>
  );
}

function ProportionSolver() {
  const [a, setA] = useState("2"), [b, setB] = useState("3"), [c, setC] = useState(""), [d, setD] = useState("12");
  const out = useMemo(() => {
    const raw = { a, b, c, d };
    const blanks = Object.keys(raw).filter(k => raw[k].trim() === "");
    if (blanks.length === 0) {
      const A = n(a), B = n(b), C0 = n(c), D0 = n(d);
      const ok = B !== 0 && D0 !== 0 && Math.abs(A / B - C0 / D0) < 1e-9;
      return { solved: false, main: ok ? "True proportion ✓" : "Not a proportion ✗", steps: `${A}/${B} = ${round(A / B, 6)}\n${C0}/${D0} = ${round(C0 / D0, 6)}\nCross products: ${A}×${D0} = ${round(A * D0)} vs ${B}×${C0} = ${round(B * C0)}` };
    }
    if (blanks.length !== 1) return { err: "Leave exactly one box blank to solve for it (or fill all four to verify)." };
    const A = n(a), B = n(b), C0 = n(c), D0 = n(d);
    const m = blanks[0];
    let v, denomZero = false;
    if (m === "a") { if (D0 === 0) denomZero = true; v = (B * C0) / D0; }
    else if (m === "b") { if (C0 === 0) denomZero = true; v = (A * D0) / C0; }
    else if (m === "c") { if (B === 0) denomZero = true; v = (A * D0) / B; }
    else { if (A === 0) denomZero = true; v = (B * C0) / A; }
    if (denomZero) return { err: "Cannot solve: division by zero in cross multiplication." };
    return {
      solved: true, main: `${m} = ${round(v, 6)}`,
      steps: `a/b = c/d  →  a·d = b·c (cross multiply)\nSolving for ${m}: ${m} = ${round(v, 6)}\nCheck: ${round((m === "a" ? v : A) / (m === "b" ? v : B), 6)} = ${round((m === "c" ? v : C0) / (m === "d" ? v : D0), 6)}`,
    };
  }, [a, b, c, d]);
  return (
    <VStack>
      <Result mono={false}>Leave <b>one</b> box blank to solve for it. a/b = c/d</Result>
      <Grid2>
        <Grid2>
          <div><Label>a</Label><Input value={a} onChange={setA} placeholder="?" /></div>
          <div><Label>b</Label><Input value={b} onChange={setB} placeholder="?" /></div>
        </Grid2>
        <Grid2>
          <div><Label>c</Label><Input value={c} onChange={setC} placeholder="?" /></div>
          <div><Label>d</Label><Input value={d} onChange={setD} placeholder="?" /></div>
        </Grid2>
      </Grid2>
      {out.err ? <Result>{`⚠️ ${out.err}`}</Result> : <>
        <BigResult value={out.main} label={out.solved ? "Missing Term" : "Verification"} />
        <Result>{out.steps}</Result>
      </>}
    </VStack>
  );
}

function PercentErrorCalc() {
  const [measured, setMeasured] = useState("98");
  const [actual, setActual] = useState("100");
  const out = useMemo(() => {
    if (measured.trim() === "" || actual.trim() === "") return { err: "Enter both measured and true values." };
    const M = Number(measured), Ac = Number(actual);
    if (!Number.isFinite(M) || !Number.isFinite(Ac)) return { err: "Enter numeric values." };
    if (Ac === 0) return { err: "Percent error is undefined when the true value is 0." };
    const absErr = Math.abs(M - Ac);
    const pct = absErr / Math.abs(Ac) * 100;
    return {
      err: "", pct, absErr,
      steps: `Absolute error = |measured − true| = |${round(M, 6)} − ${round(Ac, 6)}| = ${round(absErr, 6)}\nPercent error = |measured − true| / |true| × 100\n= ${round(absErr, 6)} / ${round(Math.abs(Ac), 6)} × 100\n= ${round(pct, 4)}%`,
    };
  }, [measured, actual]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Measured / Experimental</Label><Input value={measured} onChange={setMeasured} /></div>
        <div><Label>True / Theoretical</Label><Input value={actual} onChange={setActual} /></div>
      </Grid2>
      {out.err ? <Result>{`⚠️ ${out.err}`}</Result> : <>
        <Grid2>
          <BigResult value={`${round(out.pct, 4)}%`} label="Percent Error" />
          <BigResult value={round(out.absErr, 6)} label="Absolute Error" />
        </Grid2>
        <Result>{out.steps}</Result>
      </>}
    </VStack>
  );
}

const TOOL_COMPONENTS = {
  "area-calc": AreaCalc,
  "circle-calc": CircleCalc,
  "triangle-solver": TriangleSolver,
  "sphere-calc": SphereCalc,
  "cylinder-calc": CylinderCalc,
  "cone-calc": ConeCalc,
  "ellipse-calc": EllipseCalc,
  "regular-polygon-calc": RegularPolygonCalc,
  "trapezoid-calc": TrapezoidCalc,
  "vector-2d-calc": Vector2DCalc,
  "vector-3d-calc": Vector3DCalc,
  "distance-3d-calc": Distance3DCalc,
  "cubic-solver": CubicSolver,
  "proportion-solver": ProportionSolver,
  "percent-error-calc": PercentErrorCalc,
  "mean-median-mode": MeanMedianModeCalc,
  "roman-numeral-converter": RomanNumeralConverter,
  "perimeter-calc": PerimeterCalc,
  "volume-calc": VolumeCalc,
  "surface-area-calc": SurfaceAreaCalc,
  "pythagorean-calc": PythagoreanCalc,
  "distance-calc": DistanceCalc,
  "midpoint-calc": MidpointCalc,
  "slope-calc": SlopeCalc,
  "angle-calc": AngleCalc,
  "arc-length-calc": ArcLengthCalc,
  "golden-ratio-calc": GoldenRatioCalc,
  "coordinate-calc": CoordinateCalc,

  "gcd-lcm-calc": GcdLcmCalc,
  "factorial-calc": FactorialCalc,
  "fibonacci-calc": FibonacciCalc,
  "prime-checker": PrimeChecker,
  "prime-factorization": PrimeFactorization,
  "quadratic-solver": QuadraticSolver,
  "logarithm-calc": LogarithmCalc,
  "modulo-calc": ModuloCalc,
  "trigonometry-calc": TrigonometryCalc,
  "significant-figures": SignificantFiguresCalc,
  "rounding-calc": RoundingCalc,
  "number-to-words": NumberToWordsCalc,
  "scientific-notation": ScientificNotationCalc,
  "binary-calc": BinaryCalc,
  "boolean-algebra": BooleanAlgebraCalc,
  "truth-table-gen": TruthTableGen,
  "set-theory-calc": SetTheoryCalc,
  "permutation-combination": PermutationCombinationCalc,
  "z-score-calculator": ZScoreCalc,

  "number-base-calc": NumberBaseCalc,
  "complex-number-calc": ComplexNumberCalc,
  "matrix-calc": MatrixCalc,
  "sequence-calc": SequenceCalc,
  "percentage-advanced": PercentageAdvanced,
  "ratio-simplifier": RatioSimplifier,
  "fraction-advanced": FractionAdvanced,
  "percentage-change-calculator": PercentageChangeCalc,
  "decimal-to-fraction": DecimalToFractionCalc,
};

function useAppRouter() {
  const parse = () => {
    const h = window.location.hash || "#/";
    const path = h.replace(/^#/, "") || "/";
    const parts = path.split("/").filter(Boolean);
    if (!parts.length) return { page: "home" };
    if (parts[0] === "tool" && parts[1]) return { page: "tool", toolId: parts[1] };
    if (parts[0] === "category" && parts[1]) return { page: "category", catId: parts[1] };
    return { page: "home" };
  };
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const onHash = () => setRoute(parse());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

function Breadcrumb({ tool, cat }) {
  return (
    <>
      <div style={{ display: "flex", gap: 6, fontSize: 12, color: C.muted, marginBottom: 16 }}>
        <a href="https://toolsrift.com" style={{ color: C.muted, textDecoration: "none" }}>🏠 ToolsRift</a>
        {cat && <><span>›</span><a href={`#/category/${cat.id}`} style={{ color: C.muted, textDecoration: "none" }}>{cat.name}</a></>}
        {tool && <><span>›</span><span style={{ color: C.text }}>{tool.name}</span></>}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolsrift.com" },
          { "@type": "ListItem", "position": 2, "name": "Math Calculators", "item": "https://toolsrift.com/mathcalc" },
          { "@type": "ListItem", "position": 3, "name": tool?.name || tool?.id || "" }
        ]
      }) }} />
    </>
  );
}

function ToolPage({ toolId }) {
  const tool = TOOLS.find(t => t.id === toolId);
  const meta = TOOL_META[toolId];
  const ToolComp = TOOL_COMPONENTS[toolId];
  useEffect(() => {
    document.title = meta?.title || `${tool?.name} – Free Math Calculator | ToolsRift`;
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
  const cat = CATEGORIES.find(c => c.id === catId);
  const items = TOOLS.filter(t => t.cat === catId);
  if (!cat) return <div style={{ padding: 24, color: C.muted }}>Category not found.</div>;
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 20px 60px" }}>
      <Breadcrumb cat={cat} />
      <h1 style={T.h1}>{cat.icon} {cat.name}</h1>
      <p style={{ color: C.muted, marginTop: 8, marginBottom: 16 }}>{cat.desc}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
        {items.map(t => (
          <a key={t.id} href={`#/tool/${t.id}`} style={{ textDecoration: "none" }}>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 22 }}>{t.icon}</div>
                <Badge color="blue">Calculators</Badge>
              </div>
              <div style={{ color: C.text, fontWeight: 700, marginBottom: 6 }}>{t.name}</div>
              <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.6 }}>{t.desc}</div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}

function StatBox({ value, label }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 10px", textAlign: "center" }}>
      <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, color: C.blue }}>{value}</div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function SubcatTabs({ cats, active, onSelect }) {
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "4px 0 12px", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", msOverflowStyle: "none", scrollbarWidth: "none" }}>
      {cats.map(c => (
        <button key={c.id} onClick={() => onSelect(c.id)} style={{
          flexShrink: 0, scrollSnapAlign: "start",
          padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
          border: `1px solid ${active === c.id ? C.blue : "rgba(255,255,255,0.1)"}`,
          background: active === c.id ? C.blue : "transparent",
          color: active === c.id ? "#fff" : "#64748B", transition: "all 0.15s",
        }}>{c.icon} {c.name}</button>
      ))}
    </div>
  );
}

function HomePage() {
  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search math calculators..."
      />
    </CategoryLayout>
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
    <nav style={{
      height: 56, display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "0 24px", position: "sticky", top: 0, zIndex: 100,
      background: `rgba(6,9,15,${scrolled ? 0.97 : 0.85})`,
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      borderBottom: `1px solid ${scrolled ? "rgba(99,102,241,0.2)" : C.border}`,
      transition: "background 0.2s, border-color 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <a href="/" aria-label="ToolsRift home" style={{display:"flex",alignItems:"center",flexShrink:0}}><img src="/logo.svg" alt="ToolsRift" style={{height:26,display:"block"}}/></a>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>›</span>
        <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 500, color: C.blue }}>{THEME?.name}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ background: "rgba(99,102,241,0.12)", color: C.blue, border: "1px solid rgba(99,102,241,0.25)", borderRadius: 20, fontSize: 11, fontWeight: 700, padding: "3px 10px", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{TOOLS.length} tools</span>
        <a href="/" style={{ fontSize: 12, color: C.muted, textDecoration: "none", fontWeight: 500 }}>🏠 Home</a>
        {/* PHASE 2: <UsageCounter /> */}
      </div>
    </nav>
  );
}

function SiteFooter({ currentPage }) {
  const pages = [
    { href: "/business", icon: "💼", label: "Business" },
    { href: "/text", icon: "✍️", label: "Text Tools" },
    { href: "/json", icon: "🧑‍💻", label: "Dev Tools" },
    { href: "/encoders", icon: "🔐", label: "Encoders" },
    { href: "/colors", icon: "🎨", label: "Color Tools" },
    { href: "/units", icon: "📏", label: "Unit Converters" },
    { href: "/hash", icon: "🔒", label: "Hash & Crypto" },
    { href: "/css", icon: "✨", label: "CSS Tools" },
    { href: "/generators", icon: "⚡", label: "Generators" },
    { href: "/generators2", icon: "✍️", label: "Content Gen" },
    { href: "/devgen", icon: "⚙️", label: "Dev Config" },
    { href: "/mathcalc", icon: "📐", label: "Math Calc" },
    { href: "/financecalc", icon: "💰", label: "Finance Calc" },
    { href: "/devtools", icon: "🛠️", label: "Dev Tools" },
    { href: "/js", icon: "📜", label: "JS Tools" },
    { href: "/converters2", icon: "🔄", label: "More Converters" },
    { href: "/about", icon: "ℹ️", label: "About" },
    { href: "/privacy-policy", icon: "🔏", label: "Privacy Policy" },
  ].filter(p => !p.href.endsWith("/" + currentPage));
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px 28px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Explore More Tools</span>
        <a href="/" style={{ fontSize: 12, color: C.blue, textDecoration: "none", fontWeight: 600 }}>← Back to Home</a>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {pages.map(p => (
          <a key={p.href} href={p.href} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 12, fontWeight: 500, color: "#64748B", textDecoration: "none" }}>
            <span>{p.icon}</span>{p.label}
          </a>
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: 11, color: "#334155" }}>© 2026 ToolsRift · Free online tools · No signup required</div>
    </div>
  );
}

function ToolsRiftCalcMath() {
  const route = useAppRouter();
  const showChrome = route.page !== 'home' && route.page !== 'tool';
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>
      {showChrome && <Nav />}
      {route.page === "home" && <HomePage />}
      {route.page === "tool" && <ToolPage toolId={route.toolId} />}
      {route.page === "category" && <CategoryPage catId={route.catId} />}
      {showChrome && <SiteFooter currentPage="mathcalc" />}
    </div>
  );
}

export default ToolsRiftCalcMath;
