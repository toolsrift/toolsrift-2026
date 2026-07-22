import { useState, useEffect, useMemo } from "react";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from "../lib/usage";
// PHASE 2: import UpgradeModal from "./UpgradeModal";
// PHASE 2: import UsageCounter from "./UsageCounter";
import { getCategoryById } from '../lib/categoryThemes';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolPageLayout, { ToolSchemas } from './shared/ToolPageLayout';

const PAGE_THEME = getCategoryById('converters2');

const BRAND = { name: "ToolsRift", tagline: "Additional Unit Converters" };

const C = {
  bg: "#06090F",
  surface: "#0D1117",
  border: "rgba(255,255,255,0.06)",
  blue: "#0EA5E9",
  blueD: "#0284C7",
  text: "#E2E8F0",
  muted: "#64748B",
};

const GLOBAL_CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
::selection{background:rgba(14,165,233,0.3)}
input,select,textarea{outline:none}
button:hover{filter:brightness(1.07)}
.fade-in{animation:fadeIn .25s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
table{border-collapse:collapse;width:100%}
th,td{border:1px solid rgba(255,255,255,0.08);padding:8px 10px;font-size:12px}
th{background:rgba(255,255,255,0.04)}
`;

const T = {
  label: {
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    fontSize: 12,
    fontWeight: 600,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  h1: { fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: C.text },
};

const n = (v) => {
  const x = parseFloat(v);
  return Number.isFinite(x) ? x : 0;
};
const round = (x, p = 8) => (Number.isFinite(x) ? Number(x.toFixed(p)) : 0);

function Badge({ children }) {
  return <span style={{ background: "rgba(14,165,233,0.15)", color: "#38BDF8", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{children}</span>;
}
function Input({ value, onChange, placeholder, type = "text" }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 13 }} />;
}
function SelectInput({ value, onChange, options }) {
  const norm = (options || []).map((o) => Array.isArray(o) ? { value: o[0], label: o[1] } : (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 13 }}>
      {norm.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
function Label({ children }) { return <div style={{ ...T.label, marginBottom: 6 }}>{children}</div>; }
function Card({ children, style = {} }) { return <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, ...style }}>{children}</div>; }
function VStack({ children, gap = 12 }) { return <div style={{ display: "flex", flexDirection: "column", gap }}>{children}</div>; }
function Grid2({ children }) { return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>; }
function Grid3({ children }) { return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>{children}</div>; }

function Formula({ children }) {
  return (
    <div style={{ background: "rgba(0,0,0,0.22)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", color: "#93C5FD", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, whiteSpace: "pre-wrap" }}>
      {children}
    </div>
  );
}
function DataTable({ columns, rows }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table>
        <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j}>{v}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  if (text == null || text === "" || text === "—") return null;
  return (
    <button
      onClick={() => navigator.clipboard?.writeText(String(text)).then(() => { setDone(true); setTimeout(() => setDone(false), 2000); }).catch(() => {})}
      title="Copy value"
      style={{ background: "transparent", border: `1px solid ${C.border}`, color: done ? "#22C55E" : C.blue, borderRadius: 6, padding: "2px 7px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", flexShrink: 0, lineHeight: 1.4 }}
    >
      {done ? "✓" : "⧉"}
    </button>
  );
}

function ConverterGrid({ title, units, state, onEdit, formula, activeKey }) {
  return (
    <VStack>
      <Label>{title}</Label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
        {units.map((u) => (
          <div key={u.key}>
            <div style={{ ...T.label, marginBottom: 5 }}>{u.label}</div>
            <Input value={state[u.key] ?? ""} onChange={(v) => onEdit(u.key, v)} />
          </div>
        ))}
      </div>
      <Formula>{formula}</Formula>
      {/* Comparison table */}
      <div style={{ borderRadius: 8, overflow: "hidden" }}>
        {units.map((u, idx) => {
          const isActive = u.key === activeKey;
          return (
            <div key={u.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", background: isActive ? "rgba(14,165,233,0.08)" : idx % 2 === 0 ? "#0F172A" : "#1a2234", borderLeft: isActive ? "3px solid #0EA5E9" : "3px solid transparent" }}>
              <span style={{ fontSize: 12, color: isActive ? C.blue : C.muted, fontWeight: isActive ? 600 : 400 }}>{u.label}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: isActive ? C.blue : C.text, fontWeight: 600, overflowWrap: "anywhere", wordBreak: "break-word", textAlign: "right" }}>{state[u.key] ?? "—"}</span>
                <CopyBtn text={state[u.key]} />
              </span>
            </div>
          );
        })}
      </div>
    </VStack>
  );
}

function buildLinearConverter(units, baseKey, formulaText) {
  return function LinearConv() {
    const [vals, setVals] = useState(() => Object.fromEntries(units.map((u) => [u.key, u.key === baseKey ? "1" : String(round(units.find(x => x.key === baseKey).toBase / u.toBase, 8))])));
    const [activeKey, setActiveKey] = useState(baseKey);

    const onEdit = (key, raw) => {
      setActiveKey(key);
      const v = n(raw);
      const from = units.find((u) => u.key === key);
      const base = v * from.toBase;
      const next = {};
      for (const u of units) next[u.key] = String(round(base / u.toBase, 12));
      next[key] = raw;
      setVals(next);
    };

    return <ConverterGrid title="Real-time Conversion" units={units} state={vals} onEdit={onEdit} formula={formulaText} activeKey={activeKey} />;
  };
}

/* Electrical */
const ForceConverter = buildLinearConverter(
  [
    { key: "n", label: "Newton (N)", toBase: 1 },
    { key: "kn", label: "Kilonewton (kN)", toBase: 1000 },
    { key: "lbf", label: "Pound-force (lbf)", toBase: 4.4482216152605 },
    { key: "kp", label: "Kilopond (kp)", toBase: 9.80665 },
    { key: "dyne", label: "Dyne", toBase: 1e-5 },
  ],
  "n",
  "Base: Newton\nConvert to base: base = value × factor_to_N\nConvert from base: target = base ÷ factor_to_N"
);

const TorqueConverter = buildLinearConverter(
  [
    { key: "nm", label: "Newton-metre (N·m)", toBase: 1 },
    { key: "lbft", label: "Pound-foot (lb·ft)", toBase: 1.3558179483314 },
    { key: "lbin", label: "Pound-inch (lb·in)", toBase: 0.11298482902762 },
    { key: "kgm", label: "Kilogram-metre (kg·m)", toBase: 9.80665 },
  ],
  "nm",
  "Base: N·m\n1 lb·ft = 1.355817948 N·m\n1 lb·in = 0.112984829 N·m\n1 kg·m = 9.80665 N·m"
);

const CurrentConverter = buildLinearConverter(
  [
    { key: "a", label: "Ampere (A)", toBase: 1 },
    { key: "ma", label: "Milliampere (mA)", toBase: 1e-3 },
    { key: "ua", label: "Microampere (µA)", toBase: 1e-6 },
    { key: "ka", label: "Kiloampere (kA)", toBase: 1e3 },
  ],
  "a",
  "Base: Ampere\nA ↔ mA: ×1000 / ÷1000\nA ↔ µA: ×1,000,000 / ÷1,000,000\nA ↔ kA: ÷1000 / ×1000"
);

const VoltageConverter = buildLinearConverter(
  [
    { key: "v", label: "Volt (V)", toBase: 1 },
    { key: "mv", label: "Millivolt (mV)", toBase: 1e-3 },
    { key: "kv", label: "Kilovolt (kV)", toBase: 1e3 },
    { key: "mvv", label: "Megavolt (MV)", toBase: 1e6 },
  ],
  "v",
  "Base: Volt\nV ↔ mV: ×1000 / ÷1000\nV ↔ kV: ÷1000 / ×1000\nV ↔ MV: ÷1,000,000 / ×1,000,000"
);

const ResistanceConverter = buildLinearConverter(
  [
    { key: "ohm", label: "Ohm (Ω)", toBase: 1 },
    { key: "kohm", label: "Kiloohm (kΩ)", toBase: 1e3 },
    { key: "mohm", label: "Megaohm (MΩ)", toBase: 1e6 },
    { key: "uohm", label: "Microohm (µΩ)", toBase: 1e-6 },
  ],
  "ohm",
  "Base: Ohm\nΩ ↔ kΩ ↔ MΩ via powers of 1000.\nµΩ = 10^-6 Ω."
);

const CapacitanceConverter = buildLinearConverter(
  [
    { key: "f", label: "Farad (F)", toBase: 1 },
    { key: "uf", label: "Microfarad (µF)", toBase: 1e-6 },
    { key: "nf", label: "Nanofarad (nF)", toBase: 1e-9 },
    { key: "pf", label: "Picofarad (pF)", toBase: 1e-12 },
  ],
  "f",
  "Base: Farad\n1 µF = 10^-6 F\n1 nF = 10^-9 F\n1 pF = 10^-12 F"
);

const InductanceConverter = buildLinearConverter(
  [
    { key: "h", label: "Henry (H)", toBase: 1 },
    { key: "mh", label: "Millihenry (mH)", toBase: 1e-3 },
    { key: "uh", label: "Microhenry (µH)", toBase: 1e-6 },
    { key: "nh", label: "Nanohenry (nH)", toBase: 1e-9 },
  ],
  "h",
  "Base: Henry\n1 mH = 10^-3 H\n1 µH = 10^-6 H\n1 nH = 10^-9 H"
);

/* Light */
const LuminanceConverter = buildLinearConverter(
  [
    { key: "cdm2", label: "Candela/m² (nit)", toBase: 1 },
    { key: "nit", label: "Nit", toBase: 1 },
    { key: "ftL", label: "Foot-lambert", toBase: 3.4262590996 },
    { key: "stilb", label: "Stilb", toBase: 1e4 },
    { key: "lambert", label: "Lambert", toBase: 3183.09886184 },
  ],
  "cdm2",
  "Base: cd/m² (nit)\n1 ft-L = 3.4262590996 cd/m²\n1 sb = 10,000 cd/m²\n1 L = 3183.09886184 cd/m²"
);

const IlluminanceConverter = buildLinearConverter(
  [
    { key: "lux", label: "Lux", toBase: 1 },
    { key: "fc", label: "Foot-candle", toBase: 10.7639104167 },
    { key: "phot", label: "Phot", toBase: 10000 },
    { key: "nox", label: "Nox", toBase: 0.001 },
  ],
  "lux",
  "Base: Lux\n1 fc = 10.7639104167 lux\n1 phot = 10,000 lux\n1 nox = 0.001 lux"
);

const MagneticFluxConverter = buildLinearConverter(
  [
    { key: "wb", label: "Weber (Wb)", toBase: 1 },
    { key: "mx", label: "Maxwell (Mx)", toBase: 1e-8 },
    { key: "tm2", label: "Tesla·m²", toBase: 1 },
    { key: "vs", label: "Volt·second", toBase: 1 },
  ],
  "wb",
  "Equivalent relation: 1 Wb = 1 T·m² = 1 V·s = 10^8 Mx"
);

/* Physical */
const DensityConverter = buildLinearConverter(
  [
    { key: "kgm3", label: "kg/m³", toBase: 1 },
    { key: "gcm3", label: "g/cm³", toBase: 1000 },
    { key: "gl", label: "g/L", toBase: 1 },
    { key: "lbft3", label: "lb/ft³", toBase: 16.01846337396 },
    { key: "lbgal", label: "lb/gal (US)", toBase: 119.826427316 },
    { key: "ozin3", label: "oz/in³", toBase: 1729.99404466 },
  ],
  "kgm3",
  "Base: kg/m³\n1 g/cm³ = 1000 kg/m³\n1 g/L = 1 kg/m³"
);

function ViscosityConverter() {
  const dynUnits = [
    { key: "pas", label: "Pa·s", toBase: 1 },
    { key: "cp", label: "cP", toBase: 1e-3 },
    { key: "poise", label: "Poise", toBase: 0.1 },
  ];
  const kinUnits = [
    { key: "m2s", label: "m²/s", toBase: 1 },
    { key: "cst", label: "cSt", toBase: 1e-6 },
    { key: "st", label: "Stokes", toBase: 1e-4 },
  ];
  const [dyn, setDyn] = useState({ pas: "1", cp: "1000", poise: "10" });
  const [kin, setKin] = useState({ m2s: "0.000001", cst: "1", st: "0.01" });

  const onDyn = (key, raw) => {
    const from = dynUnits.find((u) => u.key === key);
    const base = n(raw) * from.toBase;
    const next = {};
    dynUnits.forEach((u) => { next[u.key] = String(round(base / u.toBase, 12)); });
    next[key] = raw;
    setDyn(next);
  };
  const onKin = (key, raw) => {
    const from = kinUnits.find((u) => u.key === key);
    const base = n(raw) * from.toBase;
    const next = {};
    kinUnits.forEach((u) => { next[u.key] = String(round(base / u.toBase, 12)); });
    next[key] = raw;
    setKin(next);
  };

  return (
    <VStack>
      <ConverterGrid title="Dynamic Viscosity (independent)" units={dynUnits} state={dyn} onEdit={onDyn} formula={"Base dynamic: Pa·s\n1 cP = 0.001 Pa·s\n1 P = 0.1 Pa·s"} />
      <ConverterGrid title="Kinematic Viscosity (independent)" units={kinUnits} state={kin} onEdit={onKin} formula={"Base kinematic: m²/s\n1 cSt = 10^-6 m²/s\n1 St = 10^-4 m²/s"} />
    </VStack>
  );
}

const FlowRateConverter = buildLinearConverter(
  [
    { key: "m3s", label: "m³/s", toBase: 1 },
    { key: "lmin", label: "L/min", toBase: 1 / 60000 },
    { key: "gpm", label: "GPM (US)", toBase: 0.0000630901964 },
    { key: "cfm", label: "CFM", toBase: 0.0004719474432 },
    { key: "bpd", label: "Barrel/day", toBase: 0.00000184013072833 },
  ],
  "m3s",
  "Base: m³/s\nL/min = m³/s × 60,000\nGPM(US) ≈ m³/s ÷ 0.0000630901964"
);

const AccelerationConverter = buildLinearConverter(
  [
    { key: "ms2", label: "m/s²", toBase: 1 },
    { key: "g", label: "g-force", toBase: 9.80665 },
    { key: "fts2", label: "ft/s²", toBase: 0.3048 },
    { key: "gal", label: "Gal", toBase: 0.01 },
  ],
  "ms2",
  "Base: m/s²\n1 g = 9.80665 m/s²\n1 ft/s² = 0.3048 m/s²\n1 Gal = 0.01 m/s²"
);

/* Everyday */
function awgDiameterMm(awg) {
  return 0.127 * Math.pow(92, (36 - awg) / 39);
}
function WireGaugeConverter() {
  const [awg, setAwg] = useState("12");
  const [mm, setMm] = useState(String(round(awgDiameterMm(12), 6)));
  const [mm2, setMm2] = useState(String(round(Math.PI * Math.pow(awgDiameterMm(12) / 2, 2), 6)));

  const onAwg = (raw) => {
    setAwg(raw);
    const a = n(raw);
    const d = awgDiameterMm(a);
    setMm(String(round(d, 8)));
    setMm2(String(round(Math.PI * Math.pow(d / 2, 2), 8)));
  };
  const onMm = (raw) => {
    setMm(raw);
    const d = n(raw);
    const a = 36 - 39 * (Math.log(d / 0.127) / Math.log(92));
    setAwg(String(round(a, 4)));
    setMm2(String(round(Math.PI * Math.pow(d / 2, 2), 8)));
  };
  const onMm2 = (raw) => {
    setMm2(raw);
    const A = n(raw);
    const d = Math.sqrt((4 * A) / Math.PI);
    setMm(String(round(d, 8)));
    const a = 36 - 39 * (Math.log(d / 0.127) / Math.log(92));
    setAwg(String(round(a, 4)));
  };

  const awgLabels = ["0000", "000", "00", "0", ...Array.from({ length: 41 }, (_, i) => String(i))];
  const mapLabelToNum = (label) => ({ "0000": -3, "000": -2, "00": -1, "0": 0 }[label] ?? Number(label));
  const rows = awgLabels.map((label) => {
    const num = mapLabelToNum(label);
    const d = awgDiameterMm(num);
    const A = Math.PI * Math.pow(d / 2, 2);
    return [label, round(d, 6), round(A, 6)];
  });

  return (
    <VStack>
      <Grid3>
        <div><Label>AWG</Label><Input value={awg} onChange={onAwg} /></div>
        <div><Label>Diameter (mm)</Label><Input value={mm} onChange={onMm} /></div>
        <div><Label>Area (mm²)</Label><Input value={mm2} onChange={onMm2} /></div>
      </Grid3>
      <Formula>{"AWG formula:\nd(mm) = 0.127 × 92^((36 - AWG)/39)\nArea(mm²) = π × (d/2)^2"}</Formula>
      <DataTable columns={["AWG", "Diameter (mm)", "Area (mm²)"]} rows={rows} />
    </VStack>
  );
}

function ClothingSizeConverter() {
  const chart = [
    ["XS", "34", "34", "44", "44", "34"],
    ["S", "36", "36", "46", "46", "36"],
    ["M", "38", "38", "48", "48", "38"],
    ["L", "40", "40", "50", "50", "40"],
    ["XL", "42", "42", "52", "52", "42"],
    ["XXL", "44", "44", "54", "54", "44"],
  ];
  const [size, setSize] = useState("M");
  const [gender, setGender] = useState("men");

  const selected = useMemo(() => {
    const idx = chart.findIndex((r) => r[0] === size);
    return idx >= 0 ? chart[idx] : chart[2];
  }, [size]);

  const womenOffset = { us: -2, uk: -2, eu: 0, it: 2, au: -2 };
  const adjusted = useMemo(() => {
    if (gender === "men") return selected;
    const [alpha, us, uk, eu, it, au] = selected;
    return [
      alpha,
      String(Number(us) + womenOffset.us),
      String(Number(uk) + womenOffset.uk),
      String(Number(eu) + womenOffset.eu),
      String(Number(it) + womenOffset.it),
      String(Number(au) + womenOffset.au),
    ];
  }, [selected, gender]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Gender</Label><SelectInput value={gender} onChange={setGender} options={[{ value: "men", label: "Men" }, { value: "women", label: "Women" }]} /></div>
        <div><Label>Alpha Size</Label><SelectInput value={size} onChange={setSize} options={chart.map((r) => ({ value: r[0], label: r[0] }))} /></div>
      </Grid2>
      <DataTable columns={["Alpha", "US", "UK", "EU", "IT", "AU"]} rows={[adjusted]} />
      <Formula>{"Reference chart mapping (approximate fashion conversion).\nWomen chart generated from men baseline using regional offsets."}</Formula>
      <DataTable columns={["Alpha", "US", "UK", "EU", "IT", "AU"]} rows={chart} />
    </VStack>
  );
}

function ShoeSizeConverter() {
  const [gender, setGender] = useState("men");
  const [us, setUs] = useState("9");

  const out = useMemo(() => {
    const U = n(us);
    const uk = U - 1;
    const eu = round(U + 33, 1);
    const jp = round(U + (gender === "men" ? 18 : 16.5), 1);
    const cn = round(jp, 1);
    const au = gender === "men" ? uk : round(uk + 2, 1);
    const br = round(eu - 2, 1);
    return { uk, eu, jp, cn, au, br };
  }, [us, gender]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Gender</Label><SelectInput value={gender} onChange={setGender} options={[{ value: "men", label: "Men" }, { value: "women", label: "Women" }]} /></div>
        <div><Label>US Size</Label><Input value={us} onChange={setUs} /></div>
      </Grid2>
      <DataTable
        columns={["US", "UK", "EU", "JP", "CN", "AU", "BR"]}
        rows={[[us, round(out.uk, 1), out.eu, out.jp, out.cn, out.au, out.br]]}
      />
      <Formula>{"Approx formulas:\nUK = US - 1\nEU ≈ US + 33\nJP/CN (cm) approximate mapping from US scale\nBR ≈ EU - 2"}</Formula>
    </VStack>
  );
}

function BraSizeConverter() {
  const [bandUS, setBandUS] = useState("34");
  const [cup, setCup] = useState("C");
  const cupOrder = ["AA","A","B","C","D","DD","DDD","G","H","I","J"];

  const out = useMemo(() => {
    const b = n(bandUS);
    const uk = b;
    const eu = round(b * 2.25 + 10, 0);
    const fr = eu + 15;
    const it = round((b - 26) * 2 + 0, 0);
    const au = b;
    const cupIndex = Math.max(0, cupOrder.indexOf(cup));
    const euCup = cupOrder[Math.min(cupOrder.length - 1, cupIndex)];
    return { uk, eu, fr, it, au, euCup };
  }, [bandUS, cup]);

  return (
    <VStack>
      <Grid2>
        <div><Label>US Band</Label><Input value={bandUS} onChange={setBandUS} /></div>
        <div><Label>Cup</Label><SelectInput value={cup} onChange={setCup} options={cupOrder.map((x) => ({ value: x, label: x }))} /></div>
      </Grid2>
      <DataTable
        columns={["US", "UK", "EU", "FR/BE", "IT", "AU/NZ"]}
        rows={[[`${bandUS}${cup}`, `${out.uk}${cup}`, `${out.eu}${out.euCup}`, `${out.fr}${out.euCup}`, `${out.it}${cup}`, `${out.au}${cup}`]]}
      />
      <Formula>{"Band conversion (approx):\nEU ≈ US×2.25 + 10\nFR/BE = EU + 15\nIT ≈ (US - 26) × 2\nCup letters vary by brand and country."}</Formula>
    </VStack>
  );
}

const PAPER = {
  A: {
    A0:[841,1189], A1:[594,841], A2:[420,594], A3:[297,420], A4:[210,297], A5:[148,210], A6:[105,148], A7:[74,105], A8:[52,74], A9:[37,52], A10:[26,37],
  },
  B: {
    B0:[1000,1414], B1:[707,1000], B2:[500,707], B3:[353,500], B4:[250,353], B5:[176,250], B6:[125,176], B7:[88,125], B8:[62,88],
  },
  US: {
    Letter:[216,279], Legal:[216,356], Tabloid:[279,432],
  },
};

function PaperSizeConverter() {
  const all = [...Object.entries(PAPER.A), ...Object.entries(PAPER.B), ...Object.entries(PAPER.US)];
  const [size, setSize] = useState("A4");
  const [wmm, hmm] = PAPER.A.A4;

  useEffect(() => {
    for (const [k, v] of all) if (k === size) { return; }
  }, [size]);

  const dims = useMemo(() => {
    const found = all.find(([k]) => k === size);
    return found ? found[1] : [210, 297];
  }, [size]);

  const rows = all.map(([k, d]) => [k, `${d[0]} × ${d[1]} mm`, `${round(d[0]/10,2)} × ${round(d[1]/10,2)} cm`, `${round(d[0]/25.4,2)} × ${round(d[1]/25.4,2)} in`]);

  const visual = [["A0","A1","A2","A3","A4","A5"],["B0","B1","B2","B3","B4","B5"],["Letter","Legal","Tabloid"]].flat();

  return (
    <VStack>
      <div>
        <Label>Paper Size</Label>
        <SelectInput value={size} onChange={setSize} options={all.map(([k]) => ({ value: k, label: k }))} />
      </div>
      <DataTable columns={["Size", "mm", "cm", "in"]} rows={rows.filter((r) => r[0] === size)} />
      <Formula>{"Convert:\ncm = mm ÷ 10\nin = mm ÷ 25.4\nISO A/B maintain aspect ratio √2:1."}</Formula>

      <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 12 }}>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>Visual Proportional Rectangles</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10 }}>
          {visual.map((k) => {
            const d = PAPER.A[k] || PAPER.B[k] || PAPER.US[k];
            if (!d) return null;
            const scale = 80 / Math.max(d[0], d[1]);
            const w = Math.max(18, d[0] * scale);
            const h = Math.max(18, d[1] * scale);
            return (
              <div key={k} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, borderRadius: 8, padding: 8, textAlign: "center" }}>
                <div style={{ marginBottom: 6, fontSize: 11, color: C.muted }}>{k}</div>
                <div style={{ width: w, height: h, margin: "0 auto", border: `2px solid ${k===size?C.blue:"#64748B"}`, borderRadius: 2, background: "rgba(14,165,233,0.08)" }} />
              </div>
            );
          })}
        </div>
      </div>

      <DataTable columns={["Size", "mm", "cm", "in"]} rows={rows} />
    </VStack>
  );
}

function TypographyConverter() {
  const [dpi, setDpi] = useState("96");
  const [vals, setVals] = useState({ pt: "12", px: "16", em: "1", rem: "1", mm: "4.233333", cm: "0.423333" });

  const convertFromPx = (px, d) => {
    const pt = px * 72 / d;
    const em = px / 16;
    const rem = px / 16;
    const mm = px * 25.4 / d;
    const cm = mm / 10;
    return { pt, px, em, rem, mm, cm };
  };

  const onEdit = (key, raw) => {
    const D = n(dpi) || 96;
    let px = 0;
    const v = n(raw);
    if (key === "px") px = v;
    if (key === "pt") px = v * D / 72;
    if (key === "em" || key === "rem") px = v * 16;
    if (key === "mm") px = v * D / 25.4;
    if (key === "cm") px = v * D / 2.54;
    const next = convertFromPx(px, D);
    const s = {};
    for (const k of Object.keys(next)) s[k] = String(round(next[k], 10));
    s[key] = raw;
    setVals(s);
  };

  const onDpi = (raw) => {
    setDpi(raw);
    onEdit("px", vals.px);
  };

  return (
    <VStack>
      <div>
        <Label>DPI</Label>
        <Input value={dpi} onChange={onDpi} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10 }}>
        {["pt","px","em","rem","mm","cm"].map((k) => (
          <div key={k}>
            <div style={{ ...T.label, marginBottom: 5 }}>{k}</div>
            <Input value={vals[k]} onChange={(v) => onEdit(k, v)} />
          </div>
        ))}
      </div>
      <Formula>{"Given DPI = d:\npt = px×72/d\npx = pt×d/72\nmm = px×25.4/d\ncm = px×2.54/d\nem/rem (default root 16px): em = px/16"}</Formula>
    </VStack>
  );
}

/* ===== Batch W3: additional verified converters ===== */
const SPEED_OF_LIGHT = 299792458; // m/s (exact)
const MILE_KM = 1.609344;         // km per statute mile (exact)

/* Linear converters (buildLinearConverter idiom) */
const DataTransferConverter = buildLinearConverter(
  [
    { key: "bps", label: "bit/s", toBase: 1 },
    { key: "kbps", label: "kbit/s", toBase: 1e3 },
    { key: "mbps", label: "Mbit/s", toBase: 1e6 },
    { key: "gbps", label: "Gbit/s", toBase: 1e9 },
    { key: "Bps", label: "byte/s", toBase: 8 },
    { key: "KBps", label: "KB/s (10³)", toBase: 8e3 },
    { key: "MBps", label: "MB/s (10⁶)", toBase: 8e6 },
    { key: "GBps", label: "GB/s (10⁹)", toBase: 8e9 },
  ],
  "mbps",
  "Base: bit/s\n1 byte = 8 bits\nSI decimal prefixes (k=1000, M=10⁶, G=10⁹)\n1 MB/s = 8 Mbit/s"
);

const TirePressureConverter = buildLinearConverter(
  [
    { key: "psi", label: "PSI", toBase: 6894.757293168 },
    { key: "bar", label: "Bar", toBase: 1e5 },
    { key: "kpa", label: "Kilopascal (kPa)", toBase: 1000 },
    { key: "atm", label: "Atmosphere (atm)", toBase: 101325 },
    { key: "mmhg", label: "mmHg (torr)", toBase: 133.322387415 },
  ],
  "psi",
  "Base: Pascal\n1 psi = 6894.757293 Pa\n1 bar = 100,000 Pa\n1 atm = 101,325 Pa"
);

const AngleConverter = buildLinearConverter(
  [
    { key: "deg", label: "Degree (°)", toBase: Math.PI / 180 },
    { key: "rad", label: "Radian (rad)", toBase: 1 },
    { key: "grad", label: "Gradian (gon)", toBase: Math.PI / 200 },
    { key: "arcmin", label: "Arcminute (′)", toBase: Math.PI / 10800 },
    { key: "arcsec", label: "Arcsecond (″)", toBase: Math.PI / 648000 },
    { key: "turn", label: "Turn (revolution)", toBase: 2 * Math.PI },
  ],
  "deg",
  "Base: Radian\n180° = π rad\n1 turn = 360° = 2π rad\n1° = 60′ = 3600″"
);

const BloodGlucoseConverter = buildLinearConverter(
  [
    { key: "mmol", label: "mmol/L", toBase: 1 },
    { key: "mgdl", label: "mg/dL", toBase: 1 / 18.0182 },
  ],
  "mmol",
  "Base: mmol/L (glucose)\nmg/dL = mmol/L × 18.0182\nmmol/L = mg/dL ÷ 18.0182"
);

/* Frequency ↔ wavelength (electromagnetic, in vacuum) */
function FrequencyWavelengthConverter() {
  const [hz, setHz] = useState("100000000");
  const [m, setM] = useState(String(round(SPEED_OF_LIGHT / 1e8, 9)));

  const onHz = (raw) => {
    setHz(raw);
    const f = n(raw);
    setM(f > 0 ? String(round(SPEED_OF_LIGHT / f, 12)) : "");
  };
  const onM = (raw) => {
    setM(raw);
    const l = n(raw);
    setHz(l > 0 ? String(round(SPEED_OF_LIGHT / l, 6)) : "");
  };

  const f = n(hz);
  const rows = f > 0
    ? [
        ["Frequency", `${round(f / 1e3, 6)} kHz`],
        ["Frequency", `${round(f / 1e6, 6)} MHz`],
        ["Frequency", `${round(f / 1e9, 9)} GHz`],
        ["Wavelength", `${round(SPEED_OF_LIGHT / f, 9)} m`],
        ["Wavelength", `${round((SPEED_OF_LIGHT / f) * 100, 6)} cm`],
        ["Wavelength", `${round((SPEED_OF_LIGHT / f) * 1000, 4)} mm`],
      ]
    : [];

  return (
    <VStack>
      <Grid2>
        <div><Label>Frequency (Hz)</Label><Input value={hz} onChange={onHz} /></div>
        <div><Label>Wavelength (m)</Label><Input value={m} onChange={onM} /></div>
      </Grid2>
      <Formula>{"λ = c ÷ f   and   f = c ÷ λ\nc = 299,792,458 m/s (speed of light in vacuum)\nExample: 100 MHz → 2.99792458 m"}</Formula>
      {rows.length ? <DataTable columns={["Quantity", "Value"]} rows={rows} /> : <div style={{ color: C.muted, fontSize: 12 }}>Enter a positive frequency or wavelength.</div>}
    </VStack>
  );
}

/* Color temperature ↔ mired */
function ColorTemperatureMiredConverter() {
  const [k, setK] = useState("6500");
  const [mired, setMired] = useState(String(round(1e6 / 6500, 6)));

  const onK = (raw) => {
    setK(raw);
    const v = n(raw);
    setMired(v > 0 ? String(round(1e6 / v, 8)) : "");
  };
  const onM = (raw) => {
    setMired(raw);
    const v = n(raw);
    setK(v > 0 ? String(round(1e6 / v, 4)) : "");
  };

  return (
    <VStack>
      <Grid2>
        <div><Label>Color Temperature (K)</Label><Input value={k} onChange={onK} /></div>
        <div><Label>Mired (µrd)</Label><Input value={mired} onChange={onM} /></div>
      </Grid2>
      <Formula>{"mired = 1,000,000 ÷ Kelvin\nKelvin = 1,000,000 ÷ mired\nMireds add linearly for filters (useful for CTO/CTB gels).\n6500 K ≈ 153.85 mired · 3200 K = 312.5 mired"}</Formula>
      <DataTable
        columns={["Source", "Kelvin", "Mired"]}
        rows={[
          ["Candle flame", "1900", round(1e6 / 1900, 1)],
          ["Tungsten", "3200", round(1e6 / 3200, 1)],
          ["Daylight", "5600", round(1e6 / 5600, 1)],
          ["Overcast / D65", "6500", round(1e6 / 6500, 1)],
          ["Blue sky", "10000", round(1e6 / 10000, 1)],
        ]}
      />
    </VStack>
  );
}

/* Roman numerals */
const ROMAN_TABLE = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
function intToRoman(num) {
  num = Math.floor(num);
  if (!Number.isFinite(num) || num < 1 || num > 3999) return null;
  let out = "";
  for (const [v, s] of ROMAN_TABLE) { while (num >= v) { out += s; num -= v; } }
  return out;
}
function romanToInt(str) {
  if (!str) return null;
  const s = String(str).toUpperCase().trim();
  if (!/^[MDCLXVI]+$/.test(s)) return null;
  const map = { M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1 };
  let total = 0, prev = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    const v = map[s[i]];
    if (v < prev) total -= v; else { total += v; prev = v; }
  }
  if (intToRoman(total) !== s) return null; // reject non-canonical forms
  return total;
}
function RomanNumeralConverter() {
  const [num, setNum] = useState("2024");
  const [roman, setRoman] = useState("MMXXIV");
  const [err, setErr] = useState("");

  const onNum = (raw) => {
    setNum(raw);
    if (raw.trim() === "") { setRoman(""); setErr(""); return; }
    const r = intToRoman(Math.floor(n(raw)));
    if (r) { setRoman(r); setErr(""); } else { setRoman(""); setErr("Enter a whole number from 1 to 3999."); }
  };
  const onRoman = (raw) => {
    setRoman(raw);
    if (raw.trim() === "") { setNum(""); setErr(""); return; }
    const v = romanToInt(raw);
    if (v != null) { setNum(String(v)); setErr(""); } else { setNum(""); setErr("Invalid Roman numeral (use standard form, ≤ 3999)."); }
  };

  return (
    <VStack>
      <Grid2>
        <div><Label>Number (1–3999)</Label><Input value={num} onChange={onNum} /></div>
        <div>
          <Label>Roman Numeral</Label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 1 }}><Input value={roman} onChange={onRoman} /></div>
            <CopyBtn text={roman} />
          </div>
        </div>
      </Grid2>
      {err && <div style={{ color: "#F87171", fontSize: 12 }}>{err}</div>}
      <Formula>{"Additive/subtractive system: M=1000 D=500 C=100 L=50 X=10 V=5 I=1\nSubtractive pairs: CM=900 CD=400 XC=90 XL=40 IX=9 IV=4\nValid range 1–3999 (no zero, no fractions)."}</Formula>
    </VStack>
  );
}

/* Running pace ↔ speed */
function PaceConverter() {
  const units = [
    { key: "minkm", label: "Pace (min/km)" },
    { key: "minmi", label: "Pace (min/mi)" },
    { key: "kmh", label: "Speed (km/h)" },
    { key: "mph", label: "Speed (mph)" },
  ];
  const init = () => {
    const p = 5; const kmh = 60 / p;
    return { minkm: String(p), minmi: String(round(p * MILE_KM, 6)), kmh: String(round(kmh, 6)), mph: String(round(kmh / MILE_KM, 6)) };
  };
  const [vals, setVals] = useState(init);
  const [activeKey, setActiveKey] = useState("minkm");

  const onEdit = (key, raw) => {
    setActiveKey(key);
    const v = n(raw);
    if (!(v > 0)) {
      const bad = {}; units.forEach((u) => { bad[u.key] = "—"; }); bad[key] = raw; setVals(bad); return;
    }
    let p; // min/km
    if (key === "minkm") p = v;
    else if (key === "minmi") p = v / MILE_KM;
    else if (key === "kmh") p = 60 / v;
    else p = 60 / (v * MILE_KM); // mph
    const kmh = 60 / p;
    const next = {
      minkm: String(round(p, 6)),
      minmi: String(round(p * MILE_KM, 6)),
      kmh: String(round(kmh, 6)),
      mph: String(round(kmh / MILE_KM, 6)),
    };
    next[key] = raw;
    setVals(next);
  };

  return <ConverterGrid title="Pace ↔ Speed" units={units} state={vals} onEdit={onEdit} formula={"Pace is in decimal minutes (5.5 = 5 min 30 s).\nspeed(km/h) = 60 ÷ pace(min/km)\npace(min/mi) = pace(min/km) × 1.609344\nmph = km/h ÷ 1.609344"} activeKey={activeKey} />;
}

/* Fuel economy */
function FuelEconomyConverter() {
  const units = [
    { key: "l100", label: "L/100 km" },
    { key: "mpgus", label: "MPG (US)" },
    { key: "mpguk", label: "MPG (UK/imperial)" },
    { key: "kml", label: "km/L" },
  ];
  const fromL100 = (x) => ({
    l100: String(round(x, 6)),
    mpgus: String(round(235.2145833 / x, 6)),
    mpguk: String(round(282.4809363 / x, 6)),
    kml: String(round(100 / x, 6)),
  });
  const [vals, setVals] = useState(() => fromL100(8));
  const [activeKey, setActiveKey] = useState("l100");

  const onEdit = (key, raw) => {
    setActiveKey(key);
    const v = n(raw);
    if (!(v > 0)) {
      const bad = {}; units.forEach((u) => { bad[u.key] = "—"; }); bad[key] = raw; setVals(bad); return;
    }
    let x; // L/100km
    if (key === "l100") x = v;
    else if (key === "mpgus") x = 235.2145833 / v;
    else if (key === "mpguk") x = 282.4809363 / v;
    else x = 100 / v; // km/L
    const next = fromL100(x);
    next[key] = raw;
    setVals(next);
  };

  return <ConverterGrid title="Fuel Economy" units={units} state={vals} onEdit={onEdit} formula={"L/100 km is the base.\nMPG(US) = 235.214583 ÷ (L/100km)\nMPG(UK) = 282.480936 ÷ (L/100km)\nkm/L = 100 ÷ (L/100km)"} activeKey={activeKey} />;
}

/* Oven gas mark */
function GasMarkConverter() {
  const marks = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const descOf = { 1: "Cool", 2: "Slow", 3: "Moderately slow", 4: "Moderate", 5: "Moderately hot", 6: "Hot", 7: "Hot", 8: "Very hot", 9: "Very hot" };
  const F = (g) => 25 * g + 250;
  const [gm, setGm] = useState("4");
  const g = Math.round(n(gm));
  const valid = marks.includes(g);
  const rows = marks.map((mk) => [String(mk), `${F(mk)} °F`, `${round((F(mk) - 32) * 5 / 9, 0)} °C`, descOf[mk]]);

  return (
    <VStack>
      <div>
        <Label>Gas Mark</Label>
        <SelectInput value={gm} onChange={setGm} options={marks.map((mk) => ({ value: String(mk), label: `Gas Mark ${mk}` }))} />
      </div>
      {valid && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ background: "rgba(14,165,233,0.08)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: C.blue }}>{F(g)} °F</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Fahrenheit</div>
          </div>
          <div style={{ background: "rgba(14,165,233,0.08)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: C.blue }}>{round((F(g) - 32) * 5 / 9, 0)} °C</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Celsius</div>
          </div>
        </div>
      )}
      <Formula>{"°F = 25 × gas mark + 250\n°C = (°F − 32) × 5⁄9\nGas Mark 4 = 350 °F = 177 °C (standard \"moderate\" oven)."}</Formula>
      <DataTable columns={["Gas Mark", "°F", "°C", "Oven"]} rows={rows} />
    </VStack>
  );
}

/* Ring size (reference table, US/UK/EU/mm) */
const RING_TABLE = [
  // [US, UK, EU(ISO circ mm), diameter mm, circumference mm]
  ["3", "F", "44", "14.1", "44.2"],
  ["3.5", "G", "45", "14.5", "45.5"],
  ["4", "H", "47", "14.9", "46.8"],
  ["4.5", "I", "48", "15.3", "48.0"],
  ["5", "J½", "49", "15.7", "49.3"],
  ["5.5", "K½", "51", "16.1", "50.6"],
  ["6", "L½", "52", "16.5", "51.9"],
  ["6.5", "M½", "53", "16.9", "53.1"],
  ["7", "N½", "54", "17.3", "54.4"],
  ["7.5", "O½", "56", "17.7", "55.7"],
  ["8", "P½", "57", "18.1", "57.0"],
  ["8.5", "Q½", "58", "18.5", "58.3"],
  ["9", "R½", "59", "18.9", "59.5"],
  ["9.5", "S½", "61", "19.4", "60.8"],
  ["10", "T½", "62", "19.8", "62.1"],
  ["10.5", "U½", "63", "20.2", "63.4"],
  ["11", "V½", "64", "20.6", "64.6"],
  ["11.5", "W½", "66", "21.0", "65.9"],
  ["12", "X½", "67", "21.4", "67.2"],
  ["12.5", "Z", "68", "21.8", "68.5"],
  ["13", "Z+1", "69", "22.2", "69.7"],
];
function RingSizeConverter() {
  const [us, setUs] = useState("7");
  const selected = useMemo(() => RING_TABLE.find((r) => r[0] === us) || RING_TABLE[8], [us]);
  return (
    <VStack>
      <div>
        <Label>US Ring Size</Label>
        <SelectInput value={us} onChange={setUs} options={RING_TABLE.map((r) => ({ value: r[0], label: `US ${r[0]}` }))} />
      </div>
      <DataTable columns={["US", "UK", "EU", "Diameter (mm)", "Circumference (mm)"]} rows={[selected]} />
      <Formula>{"Ring size is set by inside circumference.\ncircumference (mm) ≈ diameter (mm) × π\nEU/ISO size = inside circumference in mm.\nHalf-sizes and letters vary slightly by brand."}</Formula>
      <DataTable columns={["US", "UK", "EU", "Diameter (mm)", "Circumference (mm)"]} rows={RING_TABLE} />
    </VStack>
  );
}

/* Registry */
const TOOLS = [
  { id: "force-converter", cat: "electrical", name: "Force Converter", icon: "🧲", desc: "Newtons, kN, lbf, kp, dyne." },
  { id: "torque-converter", cat: "electrical", name: "Torque Converter", icon: "🔩", desc: "N·m, lb·ft, lb·in, kg·m." },
  { id: "current-converter", cat: "electrical", name: "Current Converter", icon: "🔌", desc: "A, mA, µA, kA." },
  { id: "voltage-converter", cat: "electrical", name: "Voltage Converter", icon: "⚡", desc: "V, mV, kV, MV." },
  { id: "resistance-converter", cat: "electrical", name: "Resistance Converter", icon: "🧯", desc: "Ω, kΩ, MΩ, µΩ." },
  { id: "capacitance-converter", cat: "electrical", name: "Capacitance Converter", icon: "🔋", desc: "F, µF, nF, pF." },
  { id: "inductance-converter", cat: "electrical", name: "Inductance Converter", icon: "🌀", desc: "H, mH, µH, nH." },

  { id: "luminance-converter", cat: "light", name: "Luminance Converter", icon: "💡", desc: "cd/m², nit, ft-L, stilb, lambert." },
  { id: "illuminance-converter", cat: "light", name: "Illuminance Converter", icon: "🔦", desc: "lux, foot-candle, phot, nox." },
  { id: "magnetic-flux-converter", cat: "light", name: "Magnetic Flux Converter", icon: "🧭", desc: "Wb, Mx, T·m², V·s." },

  { id: "density-converter", cat: "physical", name: "Density Converter", icon: "🧪", desc: "kg/m³, g/cm³, lb/ft³ and more." },
  { id: "viscosity-converter", cat: "physical", name: "Viscosity Converter", icon: "🫗", desc: "Dynamic + kinematic viscosity units." },
  { id: "flow-rate-converter", cat: "physical", name: "Flow Rate Converter", icon: "🌊", desc: "m³/s, L/min, GPM, CFM, bpd." },
  { id: "acceleration-converter", cat: "physical", name: "Acceleration Converter", icon: "🏎️", desc: "m/s², g, ft/s², Gal." },

  { id: "wire-gauge-converter", cat: "everyday", name: "Wire Gauge Converter", icon: "🧵", desc: "AWG ↔ mm ↔ mm² with full table." },
  { id: "clothing-size-converter", cat: "everyday", name: "Clothing Size Converter", icon: "👕", desc: "US/UK/EU/IT/AU chart (men/women)." },
  { id: "shoe-size-converter", cat: "everyday", name: "Shoe Size Converter", icon: "👟", desc: "US/UK/EU/JP/CN/AU/BR." },
  { id: "bra-size-converter", cat: "everyday", name: "Bra Size Converter", icon: "🩱", desc: "US, UK, EU, FR/BE, IT, AU/NZ." },
  { id: "paper-size-converter", cat: "everyday", name: "Paper Size Converter", icon: "📄", desc: "A/B + US sizes, dimensions + visuals." },
  { id: "typography-converter", cat: "everyday", name: "Typography Converter", icon: "🔠", desc: "pt, px, em, rem, mm, cm by DPI." },

  { id: "frequency-wavelength-converter", cat: "physical", name: "Frequency ↔ Wavelength Converter", icon: "📡", desc: "Convert between frequency (Hz, kHz, MHz, GHz) and electromagnetic wavelength using λ = c/f with the exact speed of light." },
  { id: "data-transfer-rate-converter", cat: "physical", name: "Data Transfer Rate Converter", icon: "🌐", desc: "Convert bit/s, kbit/s, Mbit/s, Gbit/s and byte-based KB/s, MB/s, GB/s using SI decimal prefixes and the 8-bits-per-byte relation." },
  { id: "angle-unit-converter", cat: "physical", name: "Angle Unit Converter", icon: "📐", desc: "Convert degrees, radians, gradians, arcminutes, arcseconds and turns for geometry, trigonometry and navigation." },
  { id: "tire-pressure-converter", cat: "physical", name: "Tire Pressure Converter", icon: "🛞", desc: "Convert tire and general pressure between PSI, bar, kPa, atmospheres and mmHg (torr)." },
  { id: "blood-glucose-converter", cat: "physical", name: "Blood Glucose Converter", icon: "🩸", desc: "Convert blood sugar readings between mg/dL and mmol/L using the standard glucose factor of 18.0182." },

  { id: "color-temperature-mired-converter", cat: "light", name: "Color Temperature ↔ Mired Converter", icon: "🌡️", desc: "Convert Kelvin color temperature to and from mireds (mired = 1,000,000 ÷ K) for photography and lighting gel calculations." },

  { id: "roman-numeral-converter", cat: "everyday", name: "Roman Numeral Converter", icon: "🏛️", desc: "Convert whole numbers (1–3999) to Roman numerals and parse Roman numerals back to integers with canonical-form validation." },
  { id: "pace-speed-converter", cat: "everyday", name: "Running Pace ↔ Speed Converter", icon: "🏃", desc: "Convert running pace (min/km, min/mi) to and from speed (km/h, mph) for training and race planning." },
  { id: "fuel-economy-converter", cat: "everyday", name: "Fuel Economy Converter", icon: "⛽", desc: "Convert fuel efficiency between L/100 km, US MPG, imperial (UK) MPG and km/L." },
  { id: "gas-mark-converter", cat: "everyday", name: "Oven Gas Mark Converter", icon: "🔥", desc: "Convert oven gas marks (1–9) to Fahrenheit and Celsius with a full baking temperature reference table." },
  { id: "ring-size-converter", cat: "everyday", name: "Ring Size Converter", icon: "💍", desc: "Convert ring sizes across US, UK, EU/ISO and inside diameter/circumference in millimetres." },
];

const TOOL_COMPONENTS = {
  "force-converter": ForceConverter,
  "torque-converter": TorqueConverter,
  "current-converter": CurrentConverter,
  "voltage-converter": VoltageConverter,
  "resistance-converter": ResistanceConverter,
  "capacitance-converter": CapacitanceConverter,
  "inductance-converter": InductanceConverter,

  "luminance-converter": LuminanceConverter,
  "illuminance-converter": IlluminanceConverter,
  "magnetic-flux-converter": MagneticFluxConverter,

  "density-converter": DensityConverter,
  "viscosity-converter": ViscosityConverter,
  "flow-rate-converter": FlowRateConverter,
  "acceleration-converter": AccelerationConverter,

  "wire-gauge-converter": WireGaugeConverter,
  "clothing-size-converter": ClothingSizeConverter,
  "shoe-size-converter": ShoeSizeConverter,
  "bra-size-converter": BraSizeConverter,
  "paper-size-converter": PaperSizeConverter,
  "typography-converter": TypographyConverter,

  "frequency-wavelength-converter": FrequencyWavelengthConverter,
  "data-transfer-rate-converter": DataTransferConverter,
  "angle-unit-converter": AngleConverter,
  "tire-pressure-converter": TirePressureConverter,
  "blood-glucose-converter": BloodGlucoseConverter,

  "color-temperature-mired-converter": ColorTemperatureMiredConverter,

  "roman-numeral-converter": RomanNumeralConverter,
  "pace-speed-converter": PaceConverter,
  "fuel-economy-converter": FuelEconomyConverter,
  "gas-mark-converter": GasMarkConverter,
  "ring-size-converter": RingSizeConverter,
};

const CATEGORIES = [
  { id: "electrical", name: "Electrical Units", icon: "🔋", desc: "Force, torque, current, voltage, resistance and more." },
  { id: "light", name: "Light & Radiation", icon: "💡", desc: "Luminance, illuminance and magnetic flux units." },
  { id: "physical", name: "Physical Properties", icon: "🧪", desc: "Density, viscosity, flow rate, acceleration." },
  { id: "everyday", name: "Everyday Converters", icon: "🧰", desc: "Sizes, paper, wire gauge and typography conversions." },
];

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
          { "@type": "ListItem", "position": 2, "name": "Specialty Converters", "item": "https://toolsrift.com/converters2" },
          { "@type": "ListItem", "position": 3, "name": tool?.name || tool?.id || "" }
        ]
      }) }} />
    </>
  );
}

const TOOL_META = {
  "force-converter": {
    title: "Force Converter — Newton, kN, lbf, kp, Dyne Online",
    desc: "Convert force between newtons, kilonewtons, pound-force, kilopond and dyne. Real-time results using exact SI factors for physics, engineering and statics.",
    keywords: "force converter, newton to lbf, pound-force to newton, kilonewton converter, dyne converter",
    faq: [
      ["How many newtons is 1 pound-force?", "1 lbf equals 4.4482216152605 N exactly, derived from the standard gravity acting on one pound mass."],
      ["What is the base unit for force?", "The newton (N) is the SI base for this tool; every unit is converted through newtons using its factor."],
      ["How is a dyne related to a newton?", "1 dyne is 10⁻⁵ N (the CGS force unit), so 100,000 dyne equal one newton."]
    ],
    howTo: "Type a value into any force field. The tool multiplies by that unit's newton factor, then divides to fill every other unit instantly."
  },
  "torque-converter": {
    title: "Torque Converter — N·m, lb·ft, lb·in, kg·m Online",
    desc: "Convert torque and moment of force between newton-metres, pound-feet, pound-inches and kilogram-metres. Exact factors for automotive, fastening and mechanical work.",
    keywords: "torque converter, nm to lb-ft, pound-foot to newton-metre, kg-m torque, wrench torque conversion",
    faq: [
      ["How many N·m is 1 lb·ft?", "1 pound-foot equals 1.3558179483314 N·m, the exact conversion used for tightening specs."],
      ["What is the base unit here?", "The newton-metre (N·m) is the SI base; all torque units convert through it."],
      ["How do lb·ft and lb·in relate?", "1 lb·ft = 12 lb·in, so pound-inch values are twelve times larger than pound-foot for the same torque."]
    ],
    howTo: "Enter a torque value in any field. It is converted to N·m using the unit factor, then redistributed to all other torque units."
  },
  "current-converter": {
    title: "Electric Current Converter — A, mA, µA, kA Online",
    desc: "Convert electric current between amperes, milliamperes, microamperes and kiloamperes. Instant metric-prefix scaling for electronics, circuits and power work.",
    keywords: "current converter, amps to milliamps, mA to A, microampere converter, kiloampere",
    faq: [
      ["How many milliamps are in an amp?", "1 A equals 1000 mA; the metric milli prefix means one-thousandth of the base ampere."],
      ["What is the base unit?", "The ampere (A) is the SI base for current in this tool, and every prefix scales from it."],
      ["How small is a microampere?", "1 µA is 10⁻⁶ A, so one ampere contains one million microamperes — common in low-power sensors."]
    ],
    howTo: "Type a current in any field. Each metric-prefixed unit is scaled to amperes, then converted back out to all other units live."
  },
  "voltage-converter": {
    title: "Voltage Converter — Volt, mV, kV, MV Online",
    desc: "Convert voltage between volts, millivolts, kilovolts and megavolts. Real-time metric-prefix conversion for electronics, power lines and instrumentation.",
    keywords: "voltage converter, volts to millivolts, kV to V, megavolt converter, mV to V",
    faq: [
      ["How many millivolts in a volt?", "1 V equals 1000 mV; the milli prefix represents one-thousandth of a volt."],
      ["What is the base unit here?", "The volt (V) is the base; kilovolts and megavolts scale up by 1,000 and 1,000,000."],
      ["How large is a megavolt?", "1 MV is 1,000,000 V, a scale seen in high-voltage transmission and lab equipment."]
    ],
    howTo: "Enter a voltage in any field. It is scaled to volts using the metric factor, then divided out to populate every other unit."
  },
  "resistance-converter": {
    title: "Resistance Converter — Ohm, kΩ, MΩ, µΩ Online",
    desc: "Convert electrical resistance between ohms, kiloohms, megaohms and microohms. Instant metric-prefix scaling for resistors, circuit design and measurements.",
    keywords: "resistance converter, ohm to kilohm, MΩ to Ω, microohm converter, resistor value converter",
    faq: [
      ["How many ohms in a kiloohm?", "1 kΩ equals 1000 Ω; kilo means one thousand base ohms."],
      ["What is the base unit?", "The ohm (Ω) is the base for this tool, with kΩ and MΩ scaling by powers of 1000."],
      ["How small is a microohm?", "1 µΩ is 10⁻⁶ Ω, used for very low resistances like contacts and shunts."]
    ],
    howTo: "Type a resistance in any field. The value is converted to ohms with its prefix factor, then redistributed to all other units."
  },
  "capacitance-converter": {
    title: "Capacitance Converter — Farad, µF, nF, pF Online",
    desc: "Convert capacitance between farads, microfarads, nanofarads and picofarads. Real-time factor-of-1000 scaling for capacitors, filters and electronics design.",
    keywords: "capacitance converter, farad to microfarad, µF to nF, picofarad converter, pF to nF",
    faq: [
      ["How many picofarads in a nanofarad?", "1 nF equals 1000 pF; each step down the prefix ladder multiplies by 1000."],
      ["What is the base unit?", "The farad (F) is the base; µF, nF and pF are 10⁻⁶, 10⁻⁹ and 10⁻¹² F."],
      ["Why are capacitors rated in µF and pF?", "One farad is enormous, so real capacitors use microfarads, nanofarads and picofarads."]
    ],
    howTo: "Enter a capacitance in any field. It converts to farads using the prefix factor, then fills every other unit instantly."
  },
  "inductance-converter": {
    title: "Inductance Converter — Henry, mH, µH, nH Online",
    desc: "Convert inductance between henries, millihenries, microhenries and nanohenries. Instant metric-prefix scaling for coils, chokes, transformers and RF design.",
    keywords: "inductance converter, henry to millihenry, µH to nH, nanohenry converter, coil inductance",
    faq: [
      ["How many microhenries in a millihenry?", "1 mH equals 1000 µH; each prefix step scales by a factor of 1000."],
      ["What is the base unit?", "The henry (H) is the base; mH, µH and nH are 10⁻³, 10⁻⁶ and 10⁻⁹ H."],
      ["Where are nanohenries used?", "Nanohenries appear in high-frequency RF circuits where very small inductances matter."]
    ],
    howTo: "Type an inductance in any field. The value scales to henries via its prefix factor, then converts out to all other units live."
  },
  "luminance-converter": {
    title: "Luminance Converter — cd/m², Nit, Foot-Lambert Online",
    desc: "Convert luminance between candela per square metre (nit), foot-lambert, stilb and lambert. Exact factors for displays, photometry and lighting design.",
    keywords: "luminance converter, nit to foot-lambert, cd/m2 converter, stilb, lambert to nit",
    faq: [
      ["Is a nit the same as cd/m²?", "Yes — 1 nit equals exactly 1 candela per square metre, the SI luminance unit."],
      ["How many cd/m² is a foot-lambert?", "1 ft-L equals 3.4262590996 cd/m², the factor used in cinema and display specs."],
      ["What is a stilb?", "1 stilb equals 10,000 cd/m² (1 cd/cm²), a CGS luminance unit."]
    ],
    howTo: "Enter a luminance in any field. It converts to cd/m² using the unit factor, then redistributes to every other luminance unit."
  },
  "illuminance-converter": {
    title: "Illuminance Converter — Lux, Foot-Candle, Phot Online",
    desc: "Convert illuminance between lux, foot-candles, phot and nox. Exact photometric factors for lighting design, photography and workplace light-level checks.",
    keywords: "illuminance converter, lux to foot-candle, fc to lux, phot converter, nox lighting",
    faq: [
      ["How many lux is one foot-candle?", "1 fc equals 10.7639104167 lux — one lumen per square foot versus per square metre."],
      ["What is the base unit?", "The lux (lumen per square metre) is the base; all other units convert through it."],
      ["What is a phot?", "1 phot equals 10,000 lux (1 lumen/cm²), a CGS illuminance unit."]
    ],
    howTo: "Type an illuminance in any field. It converts to lux with the unit factor, then fills the other illuminance units instantly."
  },
  "magnetic-flux-converter": {
    title: "Magnetic Flux Converter — Weber, Maxwell, T·m² Online",
    desc: "Convert magnetic flux between webers, maxwells, tesla-square-metres and volt-seconds. Exact factors for electromagnetism, transformers and coil calculations.",
    keywords: "magnetic flux converter, weber to maxwell, Wb to Mx, tesla m2, volt-second flux",
    faq: [
      ["How many maxwells in a weber?", "1 Wb equals 10⁸ maxwells; the maxwell is the tiny CGS flux unit."],
      ["Why do Wb, T·m² and V·s share a value?", "They are dimensionally equal: 1 Wb = 1 T·m² = 1 V·s, reflecting Faraday's law."],
      ["What is the base unit?", "The weber (Wb) is the SI base for magnetic flux used in this tool."]
    ],
    howTo: "Enter a flux value in any field. It converts to webers using the unit factor, then redistributes to all equivalent flux units."
  },
  "density-converter": {
    title: "Density Converter — kg/m³, g/cm³, lb/ft³ Online",
    desc: "Convert density between kg/m³, g/cm³, g/L, lb/ft³, lb/gal and oz/in³. Exact factors for materials, chemistry, fluids and engineering calculations.",
    keywords: "density converter, kg/m3 to g/cm3, lb/ft3 converter, g/L to kg/m3, lb per gallon density",
    faq: [
      ["How many kg/m³ is 1 g/cm³?", "1 g/cm³ equals 1000 kg/m³ — the density of water is about 1 g/cm³."],
      ["What is the base unit?", "The kilogram per cubic metre (kg/m³) is the SI base used for all conversions here."],
      ["Is g/L the same as kg/m³?", "Yes — 1 g/L equals exactly 1 kg/m³, so the two scales line up one-to-one."]
    ],
    howTo: "Type a density in any field. The value converts to kg/m³ with the unit factor, then fills every other density unit live."
  },
  "viscosity-converter": {
    title: "Viscosity Converter — Pa·s, cP, Poise, cSt, Stokes",
    desc: "Convert dynamic viscosity (Pa·s, cP, poise) and kinematic viscosity (m²/s, cSt, stokes) in independent panels. Exact factors for fluids, oils and lab work.",
    keywords: "viscosity converter, pascal-second to centipoise, poise converter, centistokes, kinematic viscosity",
    faq: [
      ["How many centipoise in a pascal-second?", "1 Pa·s equals 1000 cP; water at 20°C is about 1 cP or 0.001 Pa·s."],
      ["What is the difference between dynamic and kinematic viscosity?", "Dynamic (Pa·s) measures shear resistance; kinematic (m²/s) is dynamic divided by density."],
      ["How does cSt relate to m²/s?", "1 centistokes equals 10⁻⁶ m²/s, the common unit for oil viscosity grades."]
    ],
    howTo: "Use the dynamic panel for Pa·s/cP/poise and the kinematic panel for m²/s/cSt/stokes. Each converts within its own base independently."
  },
  "flow-rate-converter": {
    title: "Flow Rate Converter — m³/s, L/min, GPM, CFM Online",
    desc: "Convert volumetric flow rate between m³/s, L/min, US GPM, CFM and barrels per day. Exact factors for pumps, HVAC, plumbing and process engineering.",
    keywords: "flow rate converter, gpm to lpm, cfm converter, m3/s to l/min, barrel per day flow",
    faq: [
      ["How many L/min in 1 m³/s?", "1 m³/s equals 60,000 L/min, since one cubic metre is 1000 litres over 60 seconds."],
      ["What is the base unit?", "The cubic metre per second (m³/s) is the SI base for flow in this tool."],
      ["Is GPM here US or imperial?", "This tool uses US gallons per minute, where 1 GPM ≈ 0.0000630902 m³/s."]
    ],
    howTo: "Enter a flow value in any field. It converts to m³/s using the unit factor, then redistributes to all other flow-rate units."
  },
  "acceleration-converter": {
    title: "Acceleration Converter — m/s², g-force, ft/s², Gal",
    desc: "Convert acceleration between metres per second squared, g-force, feet per second squared and gal. Exact factors for physics, vehicles and seismology.",
    keywords: "acceleration converter, m/s2 to g, g-force converter, ft/s2, gal acceleration",
    faq: [
      ["How many m/s² is 1 g?", "1 g equals 9.80665 m/s² exactly — the standard gravitational acceleration."],
      ["What is the base unit?", "The metre per second squared (m/s²) is the SI base used for all conversions."],
      ["What is a gal?", "1 gal equals 0.01 m/s², a CGS unit widely used in geodesy and seismology."]
    ],
    howTo: "Type an acceleration in any field. It converts to m/s² using the unit factor, then fills the other acceleration units live."
  },
  "wire-gauge-converter": {
    title: "Wire Gauge Converter — AWG to mm and mm² Online",
    desc: "Convert American Wire Gauge (AWG) to diameter in millimetres and cross-sectional area in mm². Full 0000–40 reference table for electrical and wiring work.",
    keywords: "AWG converter, wire gauge to mm, awg to mm2, wire diameter calculator, cable gauge chart",
    faq: [
      ["What is the AWG-to-diameter formula?", "d(mm) = 0.127 × 92^((36 − AWG)/39); each 6 gauges roughly halves or doubles the diameter."],
      ["How is the area found?", "Area(mm²) = π × (d/2)², computed automatically from the AWG diameter."],
      ["Does a higher AWG mean thicker wire?", "No — a higher AWG number means a thinner wire, so 24 AWG is much finer than 12 AWG."]
    ],
    howTo: "Enter an AWG number, a diameter in mm, or an area in mm². The tool solves the AWG formula both ways and updates all fields."
  },
  "clothing-size-converter": {
    title: "Clothing Size Converter — US, UK, EU, IT, AU Chart",
    desc: "Convert clothing sizes between US, UK, EU, Italian and Australian systems for men and women. Alpha (S/M/L) mapping with a full reference chart for shopping.",
    keywords: "clothing size converter, us to eu size, uk clothing size, international size chart, dress size conversion",
    faq: [
      ["How do US and EU clothing sizes relate?", "EU numeric sizes run larger; the chart maps each alpha size (S, M, L) across systems for a close match."],
      ["Are men's and women's charts different?", "Yes — women's sizes apply regional offsets to the men's baseline, so pick the correct gender."],
      ["Are these conversions exact?", "Apparel sizing varies by brand, so treat the chart as an approximate fashion reference, not a guarantee."]
    ],
    howTo: "Choose gender and an alpha size. The tool looks up the matching US/UK/EU/IT/AU numbers and shows the full chart for comparison."
  },
  "shoe-size-converter": {
    title: "Shoe Size Converter — US, UK, EU, JP, CN, BR Online",
    desc: "Convert shoe sizes between US, UK, EU, Japan, China, Australia and Brazil for men and women. Quick international foot-size mapping for online shoe shopping.",
    keywords: "shoe size converter, us to eu shoe size, uk shoe size, japan shoe size, international shoe chart",
    faq: [
      ["How do US and UK shoe sizes differ?", "UK sizes run about one size smaller than US, so UK = US − 1 in this tool's mapping."],
      ["How is EU shoe size estimated?", "EU size is approximated as US + 33, matching the common Paris-point scale."],
      ["Do men's and women's scales differ?", "Yes — Japanese, Australian and Brazilian offsets differ by gender, so choose the right one."]
    ],
    howTo: "Pick gender and enter your US size. The tool applies each region's formula to display UK, EU, JP, CN, AU and BR equivalents."
  },
  "bra-size-converter": {
    title: "Bra Size Converter — US, UK, EU, FR, IT, AU Chart",
    desc: "Convert bra band and cup sizes between US, UK, EU, French/Belgian, Italian and Australian systems. Fast international lingerie sizing reference for shopping.",
    keywords: "bra size converter, us to eu bra size, band size conversion, cup size chart, international bra size",
    faq: [
      ["How is EU band size calculated?", "EU band ≈ US × 2.25 + 10, mapping the inch-based US band to the centimetre EU scale."],
      ["How do FR and BE sizes relate to EU?", "French and Belgian band sizes are EU + 15, a fixed offset shown automatically."],
      ["Are cup letters the same everywhere?", "Cup lettering varies by country and brand, so treat cup output as an approximate guide."]
    ],
    howTo: "Enter your US band number and select a cup letter. The tool applies each system's band formula and shows matching sizes side by side."
  },
  "paper-size-converter": {
    title: "Paper Size Converter — A4, A3, Letter in mm, cm, in",
    desc: "Convert ISO A/B and US paper sizes to millimetres, centimetres and inches with proportional visuals. Handy for printing, design and document layout.",
    keywords: "paper size converter, a4 in mm, a3 to inches, letter paper size, iso paper dimensions",
    faq: [
      ["What are A4 dimensions?", "A4 is 210 × 297 mm, which is 21.0 × 29.7 cm or about 8.27 × 11.69 inches."],
      ["How do ISO A sizes relate?", "Each A size is half the previous one and keeps a √2:1 aspect ratio, so A5 is half an A4."],
      ["How is size converted to inches?", "Inches equal millimetres divided by 25.4; centimetres equal millimetres divided by 10."]
    ],
    howTo: "Select a paper size to see its mm, cm and inch dimensions, a proportional rectangle preview, and a full comparison table."
  },
  "typography-converter": {
    title: "Typography Unit Converter — pt, px, em, rem, mm, cm",
    desc: "Convert typographic units between points, pixels, em, rem, millimetres and centimetres at any DPI. Essential for web, print and CSS font-size work.",
    keywords: "typography converter, pt to px, px to em, rem converter, points to pixels, font size units",
    faq: [
      ["How many pixels is 12pt?", "At 96 DPI, 12pt equals 16px using px = pt × DPI / 72."],
      ["Why does DPI matter?", "Point-to-pixel conversion depends on resolution; changing DPI rescales every point and metric result."],
      ["How are em and rem computed?", "Both use a 16px root by default, so 1em = 1rem = 16px unless your root font-size differs."]
    ],
    howTo: "Set the DPI, then type a value in any unit field. The tool converts everything through pixels to update pt, em, rem, mm and cm."
  },
  "frequency-wavelength-converter": {
    title: "Frequency to Wavelength Converter — λ = c ÷ f Online",
    desc: "Convert between frequency (Hz, kHz, MHz, GHz) and electromagnetic wavelength using λ = c/f with the exact speed of light. Ideal for RF, radio and optics.",
    keywords: "frequency to wavelength, wavelength calculator, hz to meters, mhz wavelength, lambda equals c over f",
    faq: [
      ["What formula converts frequency to wavelength?", "λ = c ÷ f, where c is 299,792,458 m/s, the exact speed of light in vacuum."],
      ["What wavelength is 100 MHz?", "100 MHz gives λ = c/f ≈ 2.9979 m, a typical FM-radio wavelength."],
      ["Does this assume a vacuum?", "Yes — it uses the vacuum speed of light; in other media, wavelength shrinks by the refractive index."]
    ],
    howTo: "Enter a frequency in Hz or a wavelength in metres. The tool applies λ = c/f both ways and lists kHz, MHz, GHz, cm and mm values."
  },
  "data-transfer-rate-converter": {
    title: "Data Transfer Rate Converter — bps, Mbps, MB/s Online",
    desc: "Convert data rates between bit/s, kbit/s, Mbit/s, Gbit/s and byte-based KB/s, MB/s, GB/s. Uses SI decimal prefixes and 8 bits per byte for network speeds.",
    keywords: "data transfer rate converter, mbps to mb/s, bits to bytes, gbps converter, bandwidth converter",
    faq: [
      ["How many Mbit/s is 1 MB/s?", "1 MB/s equals 8 Mbit/s, because one byte holds eight bits."],
      ["Are these decimal or binary prefixes?", "This tool uses SI decimal prefixes where k = 1000, M = 10⁶ and G = 10⁹."],
      ["Why is my download slower than my Mbps plan?", "ISPs quote megabits (Mbit/s) while downloads show megabytes (MB/s), which is eight times smaller."]
    ],
    howTo: "Type a rate in any field. Values convert to bit/s (using 8 bits per byte), then fill all bit- and byte-based units instantly."
  },
  "angle-unit-converter": {
    title: "Angle Converter — Degrees, Radians, Gradians, Turns",
    desc: "Convert angles between degrees, radians, gradians, arcminutes, arcseconds and turns. Exact factors for geometry, trigonometry, surveying and navigation.",
    keywords: "angle converter, degrees to radians, gradian converter, arcminute arcsecond, radians to degrees",
    faq: [
      ["How many radians is 180 degrees?", "180° equals π radians, so 1 radian ≈ 57.2958°."],
      ["What is the base unit?", "The radian is the SI base for angles; degrees, gradians and turns convert through it."],
      ["How do arcminutes and arcseconds work?", "1° = 60 arcminutes and 1 arcminute = 60 arcseconds, so 1° = 3600 arcseconds."]
    ],
    howTo: "Enter an angle in any field. It converts to radians using the unit factor, then redistributes to every other angular unit live."
  },
  "tire-pressure-converter": {
    title: "Tire Pressure Converter — PSI, Bar, kPa, atm, mmHg",
    desc: "Convert tire and general pressure between PSI, bar, kilopascal, atmosphere and mmHg (torr). Exact factors for vehicles, cycling and pressure measurement.",
    keywords: "tire pressure converter, psi to bar, bar to psi, kpa converter, psi to kpa, mmhg torr",
    faq: [
      ["How many bar is 32 PSI?", "32 PSI ≈ 2.206 bar, using 1 PSI = 6894.757 Pa and 1 bar = 100,000 Pa."],
      ["What is the base unit?", "The pascal (Pa) is the SI base; every pressure unit converts through pascals."],
      ["Is mmHg the same as torr?", "Effectively yes — 1 mmHg = 133.322387415 Pa, and the torr is defined nearly identically."]
    ],
    howTo: "Enter a pressure in any field. It converts to pascals using the unit factor, then fills PSI, bar, kPa, atm and mmHg instantly."
  },
  "blood-glucose-converter": {
    title: "Blood Glucose Converter — mg/dL to mmol/L Online",
    desc: "Convert blood sugar readings between mg/dL and mmol/L using the standard glucose factor of 18.0182. Fast reference for diabetes logs and lab-value comparison.",
    keywords: "blood glucose converter, mg/dl to mmol/l, mmol/l to mg/dl, blood sugar conversion, glucose units",
    faq: [
      ["What is the mg/dL to mmol/L formula?", "mmol/L = mg/dL ÷ 18.0182, and mg/dL = mmol/L × 18.0182 for glucose."],
      ["What is 100 mg/dL in mmol/L?", "100 mg/dL ≈ 5.55 mmol/L, a common fasting reference value."],
      ["Why is 18.0182 used?", "It reflects the molar mass of glucose (about 180.16 g/mol) scaled between the two unit systems."]
    ],
    howTo: "Enter a reading in mg/dL or mmol/L. The tool multiplies or divides by 18.0182 to show the equivalent value instantly."
  },
  "color-temperature-mired-converter": {
    title: "Color Temperature to Mired Converter — Kelvin ↔ Mired",
    desc: "Convert Kelvin color temperature to and from mireds using mired = 1,000,000 ÷ K. Built for photography, video lighting and CTO/CTB gel calculations.",
    keywords: "mired converter, kelvin to mired, color temperature converter, cto ctb gel, mired shift",
    faq: [
      ["What is the Kelvin-to-mired formula?", "mired = 1,000,000 ÷ Kelvin, and Kelvin = 1,000,000 ÷ mired."],
      ["Why use mireds instead of Kelvin?", "Mireds add linearly, so lighting gels shift color by a fixed mired amount regardless of the starting temperature."],
      ["What is 6500 K in mireds?", "6500 K ≈ 153.85 mired, close to daylight/D65, while 3200 K tungsten is 312.5 mired."]
    ],
    howTo: "Enter a value in Kelvin or mired. The tool applies mired = 1,000,000 ÷ K both ways and shows a reference table of common sources."
  },
  "roman-numeral-converter": {
    title: "Roman Numeral Converter — Number to Roman & Back",
    desc: "Convert whole numbers 1–3999 to Roman numerals and parse Roman numerals back to integers with canonical-form validation. Perfect for dates, names and outlines.",
    keywords: "roman numeral converter, number to roman numerals, roman to number, roman numeral date, convert roman numerals",
    faq: [
      ["Why is the range limited to 1–3999?", "Standard Roman numerals have no zero and cannot cleanly express 4000+ without overlines, so 1–3999 is the valid range."],
      ["What are the subtractive pairs?", "CM=900, CD=400, XC=90, XL=40, IX=9 and IV=4 encode values just below the next symbol."],
      ["Does it reject invalid numerals?", "Yes — the parser re-encodes the result and rejects any non-canonical form like IIII or IC."]
    ],
    howTo: "Type a number (1–3999) or a Roman numeral. The tool converts in the direction you edit and validates that the numeral is canonical."
  },
  "pace-speed-converter": {
    title: "Running Pace Converter — min/km, min/mi to km/h, mph",
    desc: "Convert running pace (min/km, min/mi) to and from speed (km/h, mph). Real-time results for race planning, treadmill settings and training splits.",
    keywords: "pace converter, min/km to km/h, running pace to speed, min/mile converter, mph to pace",
    faq: [
      ["How is pace converted to speed?", "speed(km/h) = 60 ÷ pace(min/km), so a 5 min/km pace equals 12 km/h."],
      ["How is pace entered?", "Pace uses decimal minutes, so 5 min 30 s is typed as 5.5, not 5.30."],
      ["How do min/km and min/mi relate?", "min/mi = min/km × 1.609344, since a mile is 1.609344 km long."]
    ],
    howTo: "Enter a pace or a speed in any field. The tool converts through min/km, then fills min/mi, km/h and mph together instantly."
  },
  "fuel-economy-converter": {
    title: "Fuel Economy Converter — L/100km, MPG, km/L Online",
    desc: "Convert fuel efficiency between L/100 km, US MPG, imperial UK MPG and km/L. Exact inverse-relation factors for cars, road trips and mileage comparison.",
    keywords: "fuel economy converter, l/100km to mpg, mpg to l/100km, us to uk mpg, km/l converter",
    faq: [
      ["How does L/100 km relate to US MPG?", "MPG(US) = 235.214583 ÷ (L/100 km); the two scales are inversely related."],
      ["Why do US and UK MPG differ?", "The imperial gallon is larger, so UK MPG = 282.480936 ÷ (L/100 km) gives higher numbers than US MPG."],
      ["Is a lower L/100 km better?", "Yes — fewer litres per 100 km means better efficiency, unlike MPG where higher is better."]
    ],
    howTo: "Type a value in any field. The tool converts through L/100 km using each inverse factor to fill US MPG, UK MPG and km/L."
  },
  "gas-mark-converter": {
    title: "Oven Gas Mark Converter — Gas Mark to °F and °C",
    desc: "Convert oven gas marks 1–9 to Fahrenheit and Celsius with a full baking temperature table. Handy for UK recipes, ovens and cooking conversions.",
    keywords: "gas mark converter, gas mark to fahrenheit, gas mark to celsius, oven temperature chart, uk gas mark",
    faq: [
      ["What is the gas mark formula?", "°F = 25 × gas mark + 250, then °C = (°F − 32) × 5⁄9 for the Celsius value."],
      ["What temperature is Gas Mark 4?", "Gas Mark 4 = 350 °F = about 177 °C, the standard 'moderate' oven setting."],
      ["What range do gas marks cover?", "Gas marks run 1 (cool, 275 °F) to 9 (very hot, 475 °F) in 25 °F steps."]
    ],
    howTo: "Select a gas mark to see its Fahrenheit and Celsius temperatures, plus a full reference table of every mark from 1 to 9."
  },
  "ring-size-converter": {
    title: "Ring Size Converter — US, UK, EU, mm Diameter Chart",
    desc: "Convert ring sizes across US, UK, EU/ISO and inside diameter and circumference in millimetres. Reference chart for jewellery shopping and gift sizing.",
    keywords: "ring size converter, us to uk ring size, ring size in mm, eu ring size, ring diameter chart",
    faq: [
      ["How is ring size measured?", "Ring size is set by the inside circumference; EU/ISO size equals that circumference in millimetres."],
      ["How do diameter and circumference relate?", "circumference ≈ diameter × π, so a wider band means a larger circumference and size."],
      ["Are half sizes exact?", "Half sizes and letter grades vary slightly by brand, so treat the chart as a close reference."]
    ],
    howTo: "Select your US ring size to see the matching UK letter, EU/ISO number, and inside diameter and circumference in millimetres."
  },
};

function ToolPage({ toolId }) {
  const tool = TOOLS.find(t => t.id === toolId);
  const meta = TOOL_META[toolId] || null;
  const ToolComp = TOOL_COMPONENTS[toolId];
  useEffect(() => {
    document.title = meta?.title || `${tool?.name} – Free Converter | ToolsRift`;
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
  const cat = CATEGORIES.find((c) => c.id === catId);
  const items = TOOLS.filter((t) => t.cat === catId);
  if (!cat) return <div style={{ padding: 24, color: C.muted }}>Category not found.</div>;
  return (
    <div style={{ maxWidth: 1060, margin: "0 auto", padding: "24px 20px 60px" }}>
      <Breadcrumb cat={cat} />
      <h1 style={T.h1}>{cat.icon} {cat.name}</h1>
      <p style={{ color: C.muted, marginTop: 8, marginBottom: 16 }}>{cat.desc}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
        {items.map((t) => (
          <a key={t.id} href={`#/tool/${t.id}`} style={{ textDecoration: "none" }}>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 22 }}>{t.icon}</div>
                <Badge>Unit Converters</Badge>
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

function HomePage() {
  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search specialty converters..."
      />
    </CategoryLayout>
  );
}

function Nav() {
  const [isDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const h=()=>setScrolled(window.scrollY>8); window.addEventListener("scroll",h,{passive:true}); return ()=>window.removeEventListener("scroll",h); }, []);
  return (
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", borderBottom: `1px solid ${scrolled?"rgba(14,165,233,0.2)":C.border}`, position: "sticky", top: 0, background: scrolled?"rgba(6,9,15,0.97)":"rgba(6,9,15,0.85)", backdropFilter: "blur(12px)", zIndex: 100, transition:"all 0.3s" }}>
      <a href="https://toolsrift.com" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <img src="/logo.svg" alt="ToolsRift" style={{ height: 36 }} />
        <span style={{ fontSize: 11, color: C.muted, background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 10 }}>UNIT CONVERTERS</span>
      </a>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {/* PHASE 2: <UsageCounter /> */}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#E2E8F0", textDecoration: "none", background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}` }}>🏠 Home</a>
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
    { href: "/about", icon: "ℹ️", label: "About" },
    { href: "/privacy-policy", icon: "🔏", label: "Privacy Policy" },
  ].filter((p) => !p.href.endsWith("/" + currentPage));
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px 28px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Explore More Tools</span>
        <a href="/" style={{ fontSize: 12, color: "#0EA5E9", textDecoration: "none", fontWeight: 600 }}>← Back to Home</a>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {pages.map((p) => (
          <a key={p.href} href={p.href} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 12, fontWeight: 500, color: "#64748B", textDecoration: "none" }}>
            <span>{p.icon}</span>{p.label}
          </a>
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: 11, color: "#334155" }}>© 2026 ToolsRift · Free online tools · No signup required</div>
    </div>
  );
}

function ToolsRiftConverters2() {
  const route = useAppRouter();
  const showChrome = route.page !== 'home' && route.page !== 'tool';
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>
      {showChrome && <Nav />}
      {route.page === "home" && <HomePage />}
      {route.page === "tool" && <ToolPage toolId={route.toolId} />}
      {route.page === "category" && <CategoryPage catId={route.catId} />}
      {showChrome && <SiteFooter currentPage="converters2" />}
    </div>
  );
}

export default ToolsRiftConverters2;
