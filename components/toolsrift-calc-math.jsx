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
      {options.map((o) => (
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
  const vars = new Set((expr.match(/[A-Z]/gi) || []).map(v => v.toUpperCase()));
  return Array.from(vars).sort();
}
function evalBoolExpr(expr, env) {
  let s = expr.toUpperCase();
  for (const k of Object.keys(env)) s = s.replaceAll(k, env[k] ? "1" : "0");
  s = s.replace(/\s+/g, "").replace(/AND/g, "&").replace(/OR/g, "|").replace(/NOT/g, "!").replace(/XOR/g, "^");
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

const TOOL_COMPONENTS = {
  "area-calc": AreaCalc,
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
  const meta = null;
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
