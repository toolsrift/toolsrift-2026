import { useState, useEffect, useMemo } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from "../lib/usage";
// PHASE 2: import UpgradeModal from "./UpgradeModal";
// PHASE 2: import UsageCounter from "./UsageCounter";
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolPageLayout, { ToolSchemas } from './shared/ToolPageLayout';

const THEME = getCategoryById("financecalc");
const PAGE_THEME = getCategoryById('financecalc');
const BRAND = { name: "ToolsRift", tagline: "Finance & Health Calculators" };

const C = {
  bg: "#06090F",
  surface: "#0D1117",
  border: "rgba(255,255,255,0.06)",
  blue: "#22C55E",
  blueD: "#16A34A",
  text: "#E2E8F0",
  muted: "#64748B",
  success: "#34D399",
  warn: "#F59E0B",
  danger: "#EF4444",
};

const GLOBAL_CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
::selection{background:rgba(34,197,94,0.3)}
button:hover{filter:brightness(1.07)}
select option{background:#0D1117}
textarea{resize:vertical}
.fade-in{animation:fadeIn .25s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
table{border-collapse:collapse}
th,td{border:1px solid rgba(255,255,255,0.08);padding:8px 10px;font-size:12px}
th{background:rgba(255,255,255,0.04)}
.mono{font-family:'JetBrains Mono',monospace};`;

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
  h2: { fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 600, color: C.text },
};

const n = (v) => {
  const x = parseFloat(v);
  return Number.isFinite(x) ? x : 0;
};
const round = (x, p = 2) => (Number.isFinite(x) ? Number(x.toFixed(p)) : 0);
const inr = (x) => Number.isFinite(Number(x)) ? `₹${(Number(x) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "—";
const curr = (x) => Number.isFinite(Number(x)) ? `$${(Number(x) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—";
const pct = (x) => `${round(x, 2)}%`;

function Badge({ children, color = "blue" }) {
  const bg = { blue: "rgba(34,197,94,0.15)", green: "rgba(34,197,94,0.15)", amber: "rgba(245,158,11,0.15)" }[color] || "rgba(34,197,94,0.15)";
  const fg = { blue: "#86EFAC", green: "#86EFAC", amber: "#FCD34D" }[color] || "#86EFAC";
  return <span style={{ background: bg, color: fg, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{children}</span>;
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
  // Accept both option shapes: { value, label } objects and [value, label] arrays.
  const norm = options.map((o) => Array.isArray(o) ? { value: o[0], label: o[1] } : o);
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 13 }}>
      {norm.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
function Textarea({ value, onChange, rows = 5 }) {
  return <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px", color: C.text, fontSize: 13, fontFamily: "'JetBrains Mono',monospace" }} />;
}
function Label({ children }) { return <div style={{ ...T.label, marginBottom: 6 }}>{children}</div>; }
function Card({ children, style = {} }) { return <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, ...style }}>{children}</div>; }
function VStack({ children, gap = 12 }) { return <div style={{ display: "flex", flexDirection: "column", gap }}>{children}</div>; }
function Grid2({ children }) { return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>; }
function Grid3({ children }) { return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>{children}</div>; }

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
function BigResult({ value, label, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "20px 24px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(28px,4vw,32px)", color: C.blue, fontWeight: 700, overflowWrap: "anywhere", wordBreak: "break-word", maxWidth: "100%", minWidth: 0 }}>{value}</div>
        <CopyBtn text={value} />
      </div>
      <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{label}</div>
      {sub ? <div style={{ marginTop: 4, color: C.muted, fontSize: 12 }}>{sub}</div> : null}
    </div>
  );
}
function Result({ children }) {
  return <div style={{ background: "rgba(0,0,0,0.28)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px", color: C.text, fontFamily: "'JetBrains Mono',monospace", whiteSpace: "pre-wrap", lineHeight: 1.6, fontSize: 12 }}>{children}</div>;
}
function DataTable({ columns, rows }) {
  // Cap rendered rows so an extreme input (e.g. 10000 "years") can never
  // freeze the browser by rendering thousands of DOM rows. The computed
  // result values above the table are unaffected — only the breakdown is capped.
  const MAX_ROWS = 200;
  const shown = rows.length > MAX_ROWS ? rows.slice(0, MAX_ROWS) : rows;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%" }}>
        <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {shown.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j}>{v}</td>)}</tr>)}
        </tbody>
      </table>
      {rows.length > MAX_ROWS && (
        <div style={{ fontSize: 12, color: "#64748B", padding: "8px 4px" }}>
          Showing first {MAX_ROWS} of {rows.length} rows.
        </div>
      )}
    </div>
  );
}

function InvestmentReturnCalc() {
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("12");
  const [years, setYears] = useState("10");
  const [annualAdd, setAnnualAdd] = useState("0");

  const out = useMemo(() => {
    const P = n(principal), r = n(rate) / 100, y = Math.max(1, Math.floor(n(years))), add = n(annualAdd);
    let bal = P;
    const rows = [];
    for (let i = 1; i <= y; i++) {
      const start = bal;
      const interest = start * r;
      bal = start + interest + add;
      rows.push([i, curr(start), curr(interest), curr(add), curr(bal)]);
    }
    const totalInvested = P + add * y;
    const gain = bal - totalInvested;
    const hasContrib = add > 0;
    // With annual contributions, bal reflects deposits too, so (bal/P) is NOT a
    // true annualized return. Only report CAGR when there are no contributions;
    // otherwise report total growth over the invested amount.
    const cagr = !hasContrib && y > 0 && P > 0 ? (Math.pow(bal / P, 1 / y) - 1) * 100 : 0;
    const totalGrowth = totalInvested > 0 ? (bal / totalInvested - 1) * 100 : 0;
    return { fv: bal, gain, cagr, totalGrowth, hasContrib, rows };
  }, [principal, rate, years, annualAdd]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Initial Investment</Label><Input value={principal} onChange={setPrincipal} /></div>
        <div><Label>Annual Return %</Label><Input value={rate} onChange={setRate} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Years</Label><Input value={years} onChange={setYears} /></div>
        <div><Label>Annual Contribution</Label><Input value={annualAdd} onChange={setAnnualAdd} /></div>
      </Grid2>
      <Grid3>
        <BigResult value={curr(out.fv)} label="Final Value" />
        <BigResult value={curr(out.gain)} label="Total Gain" />
        {out.hasContrib
          ? <BigResult value={pct(out.totalGrowth)} label="Total Growth" />
          : <BigResult value={pct(out.cagr)} label="CAGR" />}
      </Grid3>
      <DataTable columns={["Year", "Start", "Interest", "Contribution", "End Balance"]} rows={out.rows} />
    </VStack>
  );
}

function RdCalc() {
  const [monthly, setMonthly] = useState("5000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("5");

  const out = useMemo(() => {
    const P = n(monthly), r = n(rate) / 100 / 12, m = Math.max(1, Math.floor(n(years) * 12));
    const fv = r === 0 ? P * m : P * (((Math.pow(1 + r, m) - 1) / r) * (1 + r));
    const total = P * m;
    const interest = fv - total;
    let bal = 0;
    const rows = [];
    for (let i = 1; i <= m; i++) {
      const start = bal;
      const intr = (start + P) * r;
      bal = start + P + intr;
      if (i % 12 === 0 || i === m) rows.push([Math.ceil(i / 12), inr(start), inr(P * 12), inr(intr * 12), inr(bal)]);
    }
    return { fv, total, interest, rows };
  }, [monthly, rate, years]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Monthly Deposit (₹)</Label><Input value={monthly} onChange={setMonthly} /></div>
        <div><Label>Interest % (p.a.)</Label><Input value={rate} onChange={setRate} /></div>
        <div><Label>Tenure (Years)</Label><Input value={years} onChange={setYears} /></div>
      </Grid3>
      <Grid3>
        <BigResult value={inr(out.fv)} label="Maturity Amount" />
        <BigResult value={inr(out.total)} label="Total Deposit" />
        <BigResult value={inr(out.interest)} label="Interest Earned" />
      </Grid3>
      <DataTable columns={["Year", "Start Bal", "Deposits", "Approx Interest", "End Bal"]} rows={out.rows} />
    </VStack>
  );
}

function PpfCalc() {
  const [yearly, setYearly] = useState("150000");
  const [rate, setRate] = useState("7.1");
  const [years, setYears] = useState("15");

  const out = useMemo(() => {
    const dep = n(yearly), r = n(rate) / 100, y = Math.max(1, Math.floor(n(years)));
    let bal = 0;
    const rows = [];
    for (let i = 1; i <= y; i++) {
      const start = bal;
      const interest = (start + dep) * r;
      bal = start + dep + interest;
      rows.push([i, inr(start), inr(dep), inr(interest), inr(bal)]);
    }
    return { maturity: bal, invested: dep * y, rows };
  }, [yearly, rate, years]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Yearly Deposit (₹)</Label><Input value={yearly} onChange={setYearly} /></div>
        <div><Label>Interest % (p.a.)</Label><Input value={rate} onChange={setRate} /></div>
        <div><Label>Years</Label><Input value={years} onChange={setYears} /></div>
      </Grid3>
      <Grid2>
        <BigResult value={inr(out.maturity)} label="Maturity Value" />
        <BigResult value={inr(out.invested)} label="Total Invested" />
      </Grid2>
      <DataTable columns={["Year", "Opening", "Deposit", "Interest", "Closing"]} rows={out.rows} />
    </VStack>
  );
}

function GratuityCalc() {
  const [lastBasicDa, setLastBasicDa] = useState("50000");
  const [years, setYears] = useState("12");
  const [months, setMonths] = useState("6");

  const out = useMemo(() => {
    const salary = n(lastBasicDa), y = Math.floor(n(years)), m = Math.floor(n(months));
    const serviceYears = y + (m >= 6 ? 1 : 0);
    const gratuity = (15 / 26) * salary * serviceYears;
    const rows = [
      ["Last Basic + DA", inr(salary)],
      ["Completed Years Counted", serviceYears],
      ["Formula", "(15/26) × Salary × Years"],
      ["Gratuity", inr(gratuity)],
    ];
    return { gratuity, rows };
  }, [lastBasicDa, years, months]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Last Basic + DA (₹)</Label><Input value={lastBasicDa} onChange={setLastBasicDa} /></div>
        <div><Label>Years of Service</Label><Input value={years} onChange={setYears} /></div>
        <div><Label>Additional Months</Label><Input value={months} onChange={setMonths} /></div>
      </Grid3>
      <BigResult value={inr(out.gratuity)} label="Estimated Gratuity" />
      <DataTable columns={["Item", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function TakeHomePayCalc() {
  const [gross, setGross] = useState("1200000");
  const [taxRate, setTaxRate] = useState("15");
  const [pf, setPf] = useState("72000");
  const [other, setOther] = useState("30000");

  const out = useMemo(() => {
    const G = n(gross), t = n(taxRate) / 100, pfy = n(pf), od = n(other);
    const tax = G * t;
    const annualTake = G - tax - pfy - od;
    const monthly = annualTake / 12;
    const rows = [
      ["Gross Annual", curr(G)],
      ["Tax", curr(tax)],
      ["PF", curr(pfy)],
      ["Other Deductions", curr(od)],
      ["Net Annual", curr(annualTake)],
      ["Net Monthly", curr(monthly)],
    ];
    return { annualTake, monthly, rows };
  }, [gross, taxRate, pf, other]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Gross Annual Salary</Label><Input value={gross} onChange={setGross} /></div>
        <div><Label>Tax Rate %</Label><Input value={taxRate} onChange={setTaxRate} /></div>
      </Grid2>
      <Grid2>
        <div><Label>PF (Annual)</Label><Input value={pf} onChange={setPf} /></div>
        <div><Label>Other Deductions</Label><Input value={other} onChange={setOther} /></div>
      </Grid2>
      <Grid2>
        <BigResult value={curr(out.monthly)} label="Monthly Take Home" />
        <BigResult value={curr(out.annualTake)} label="Annual Take Home" />
      </Grid2>
      <DataTable columns={["Component", "Amount"]} rows={out.rows} />
    </VStack>
  );
}

function HourlyToAnnualCalc() {
  const [hourly, setHourly] = useState("25");
  const [hoursWeek, setHoursWeek] = useState("40");
  const [weeksYear, setWeeksYear] = useState("52");

  const out = useMemo(() => {
    const h = n(hourly), hw = n(hoursWeek), wy = n(weeksYear);
    const weekly = h * hw;
    const annual = weekly * wy;
    const monthly = annual / 12;
    const rows = [
      ["Hourly", curr(h)],
      ["Weekly", curr(weekly)],
      ["Monthly", curr(monthly)],
      ["Annual", curr(annual)],
    ];
    return { weekly, monthly, annual, rows };
  }, [hourly, hoursWeek, weeksYear]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Hourly Rate</Label><Input value={hourly} onChange={setHourly} /></div>
        <div><Label>Hours / Week</Label><Input value={hoursWeek} onChange={setHoursWeek} /></div>
        <div><Label>Weeks / Year</Label><Input value={weeksYear} onChange={setWeeksYear} /></div>
      </Grid3>
      <Grid3>
        <BigResult value={curr(out.weekly)} label="Weekly" />
        <BigResult value={curr(out.monthly)} label="Monthly" />
        <BigResult value={curr(out.annual)} label="Annual" />
      </Grid3>
      <DataTable columns={["Period", "Pay"]} rows={out.rows} />
    </VStack>
  );
}

// ── India income tax — FY 2025-26 (AY 2026-27) ──────────────────────────────
// Salaried individual estimate. Both regimes include the §87A rebate and the 4%
// health & education cess; the new regime also applies marginal relief just above
// the ₹12L rebate threshold. Surcharge on very high incomes is not modelled.
const TAX_FY_LABEL = "FY 2025-26 (AY 2026-27)";

function taxOldRegime(taxable) {
  // Slabs unchanged for years: 0–2.5L nil, 2.5–5L 5%, 5–10L 20%, >10L 30%.
  const slabs = [[250000, 0], [250000, 0.05], [500000, 0.2], [Infinity, 0.3]];
  let rem = taxable, tax = 0;
  for (const [w, r] of slabs) { const a = Math.min(rem, w); tax += a * r; rem -= a; if (rem <= 0) break; }
  if (taxable <= 500000) tax = 0;                 // §87A rebate (old regime)
  return tax * 1.04;                              // 4% cess
}

function taxNewRegime(taxable) {
  if (taxable <= 1200000) return 0;               // §87A rebate (new regime)
  const slabs = [[400000, 0], [400000, 0.05], [400000, 0.10], [400000, 0.15], [400000, 0.20], [400000, 0.25], [Infinity, 0.30]];
  let rem = taxable, tax = 0;
  for (const [w, r] of slabs) { const a = Math.min(rem, w); tax += a * r; rem -= a; if (rem <= 0) break; }
  // Marginal relief: tax just above ₹12L cannot exceed the income earned over ₹12L.
  const excess = taxable - 1200000;
  if (tax > excess) tax = excess;
  return tax * 1.04;                              // 4% cess
}

function IncomeTaxCalc() {
  const [income, setIncome] = useState("1500000");
  const [deduction80c, setDeduction80c] = useState("150000");

  const out = useMemo(() => {
    const inc = n(income), d80 = Math.min(n(deduction80c), 150000);
    // Standard deduction: ₹50,000 old regime, ₹75,000 new regime (salaried).
    const oldTaxable = Math.max(0, inc - d80 - 50000);
    const newTaxable = Math.max(0, inc - 75000);
    const oldTax = taxOldRegime(oldTaxable);
    const newTax = taxNewRegime(newTaxable);
    return { oldTaxable, newTaxable, oldTax, newTax, cheaper: newTax <= oldTax ? "New" : "Old" };
  }, [income, deduction80c]);

  return (
    <VStack>
      <div style={{ fontSize: 12, color: "#94A3B8", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        Slabs: <strong style={{ color: "#E2E8F0" }}>{TAX_FY_LABEL}</strong> · salaried individual estimate
      </div>
      <Grid2>
        <div><Label>Gross Income (₹)</Label><Input value={income} onChange={setIncome} /></div>
        <div><Label>80C Deduction (Old Regime, max ₹1.5L)</Label><Input value={deduction80c} onChange={setDeduction80c} /></div>
      </Grid2>
      <Grid2>
        <BigResult value={inr(out.oldTax)} label="Old Regime Tax (incl. cess)" />
        <BigResult value={inr(out.newTax)} label="New Regime Tax (incl. cess)" />
      </Grid2>
      <div style={{ padding: "10px 14px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 8, fontSize: 13, color: "#E2E8F0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        The <strong>{out.cheaper} Regime</strong> is cheaper for this income — you save {inr(Math.abs(out.oldTax - out.newTax))}.
      </div>
      <Grid2>
        <DataTable
          columns={["Old Regime", "Value"]}
          rows={[
            ["Taxable Income", inr(out.oldTaxable)],
            ["Tax + 4% Cess", inr(out.oldTax)],
            ["Take Home", inr(n(income) - out.oldTax)],
          ]}
        />
        <DataTable
          columns={["New Regime", "Value"]}
          rows={[
            ["Taxable Income", inr(out.newTaxable)],
            ["Tax + 4% Cess", inr(out.newTax)],
            ["Take Home", inr(n(income) - out.newTax)],
          ]}
        />
      </Grid2>
      <div style={{ padding: "10px 14px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 8, fontSize: 12, color: "#CBD5E1", lineHeight: 1.6, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        Estimate for a salaried individual under {TAX_FY_LABEL}. Surcharge on incomes above ₹50L, capital-gains rates and other deductions aren't modelled. Verify against the latest Budget or a tax professional before filing — this is not tax advice.
      </div>
    </VStack>
  );
}

function TipCalc() {
  const [bill, setBill] = useState("120");
  const [tipPct, setTipPct] = useState("15");
  const [people, setPeople] = useState("3");

  const out = useMemo(() => {
    const b = n(bill), t = n(tipPct) / 100, p = Math.max(1, Math.floor(n(people)));
    const tip = b * t;
    const total = b + tip;
    const each = total / p;
    return { tip, total, each, p };
  }, [bill, tipPct, people]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Bill Amount</Label><Input value={bill} onChange={setBill} /></div>
        <div><Label>Tip %</Label><Input value={tipPct} onChange={setTipPct} /></div>
        <div><Label>People</Label><Input value={people} onChange={setPeople} /></div>
      </Grid3>
      <Grid3>
        <BigResult value={curr(out.tip)} label="Tip" />
        <BigResult value={curr(out.total)} label="Total Bill" />
        <BigResult value={curr(out.each)} label={`Per Person (${out.p})`} />
      </Grid3>
      <DataTable columns={["Item", "Amount"]} rows={[["Bill", curr(n(bill))], ["Tip", curr(out.tip)], ["Total", curr(out.total)], ["Split", curr(out.each)]]} />
    </VStack>
  );
}

function MarkupCalc() {
  const [mode, setMode] = useState("selling");
  const [cost, setCost] = useState("100");
  const [sell, setSell] = useState("150");
  const [markup, setMarkup] = useState("25");

  const out = useMemo(() => {
    const c = n(cost), s = n(sell), m = n(markup) / 100;
    if (mode === "selling") {
      const val = c * (1 + m);
      return { main: curr(val), rows: [["Cost", curr(c)], ["Markup %", pct(m * 100)], ["Selling Price", curr(val)]] };
    }
    if (mode === "cost") {
      const val = s / (1 + m || 1);
      return { main: curr(val), rows: [["Selling", curr(s)], ["Markup %", pct(m * 100)], ["Cost Price", curr(val)]] };
    }
    const mk = c > 0 ? ((s - c) / c) * 100 : 0;
    return { main: pct(mk), rows: [["Cost", curr(c)], ["Selling", curr(s)], ["Markup %", pct(mk)]] };
  }, [mode, cost, sell, markup]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Mode</Label><SelectInput value={mode} onChange={setMode} options={[{ value: "selling", label: "Find Selling Price" }, { value: "cost", label: "Find Cost Price" }, { value: "markup", label: "Find Markup %" }]} /></div>
        <div><Label>Markup %</Label><Input value={markup} onChange={setMarkup} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Cost Price</Label><Input value={cost} onChange={setCost} /></div>
        <div><Label>Selling Price</Label><Input value={sell} onChange={setSell} /></div>
      </Grid2>
      <BigResult value={out.main} label="Result" />
      <DataTable columns={["Component", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function DepreciationCalc() {
  const [cost, setCost] = useState("10000");
  const [salvage, setSalvage] = useState("1000");
  const [years, setYears] = useState("5");
  const [rate, setRate] = useState("20");
  const [method, setMethod] = useState("straight");

  const out = useMemo(() => {
    const C0 = n(cost), S = n(salvage), y = Math.max(1, Math.floor(n(years))), r = n(rate) / 100;
    const rows = [];
    let bv = C0;
    if (method === "straight") {
      const dep = (C0 - S) / y;
      for (let i = 1; i <= y; i++) {
        const start = bv;
        bv = Math.max(S, bv - dep);
        rows.push([i, curr(start), curr(dep), curr(bv)]);
      }
    } else {
      for (let i = 1; i <= y; i++) {
        const start = bv;
        let dep = start * r;
        if (start - dep < S) dep = start - S;
        bv = start - dep;
        rows.push([i, curr(start), curr(dep), curr(bv)]);
      }
    }
    return { end: bv, rows };
  }, [cost, salvage, years, rate, method]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Method</Label><SelectInput value={method} onChange={setMethod} options={[{ value: "straight", label: "Straight-line" }, { value: "reducing", label: "Reducing Balance" }]} /></div>
        <div><Label>Asset Cost</Label><Input value={cost} onChange={setCost} /></div>
        <div><Label>Salvage Value</Label><Input value={salvage} onChange={setSalvage} /></div>
      </Grid3>
      <Grid2>
        <div><Label>Years</Label><Input value={years} onChange={setYears} /></div>
        <div><Label>Rate % (for reducing)</Label><Input value={rate} onChange={setRate} /></div>
      </Grid2>
      <BigResult value={curr(out.end)} label="Ending Book Value" />
      <DataTable columns={["Year", "Opening BV", "Depreciation", "Closing BV"]} rows={out.rows} />
    </VStack>
  );
}

function FutureValueCalc() {
  const [pv, setPv] = useState("10000");
  const [rate, setRate] = useState("8");
  const [years, setYears] = useState("10");
  const [freq, setFreq] = useState("12");

  const out = useMemo(() => {
    const P = n(pv), r = n(rate) / 100, y = n(years), m = n(freq);
    const fv = P * Math.pow(1 + r / m, m * y);
    const rows = [];
    for (let i = 1; i <= Math.max(1, Math.floor(y)); i++) {
      const val = P * Math.pow(1 + r / m, m * i);
      rows.push([i, curr(val)]);
    }
    return { fv, rows };
  }, [pv, rate, years, freq]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Present Value</Label><Input value={pv} onChange={setPv} /></div>
        <div><Label>Rate % p.a.</Label><Input value={rate} onChange={setRate} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Years</Label><Input value={years} onChange={setYears} /></div>
        <div><Label>Compounds / Year</Label><Input value={freq} onChange={setFreq} /></div>
      </Grid2>
      <BigResult value={curr(out.fv)} label="Future Value" />
      <DataTable columns={["Year", "Projected Value"]} rows={out.rows} />
    </VStack>
  );
}

const TOOLS = [
  { id: "investment-return-calc", cat: "finance", name: "Investment Return Calculator", icon: "📈", desc: "CAGR, gain and yearly investment table.", free: true },
  { id: "rd-calc", cat: "finance", name: "RD Calculator", icon: "🏦", desc: "Recurring Deposit maturity with ₹ table.", free: true },
  { id: "ppf-calc", cat: "finance", name: "PPF Calculator", icon: "🇮🇳", desc: "PPF projection with year-wise balance.", free: true },
  { id: "gratuity-calc", cat: "finance", name: "Gratuity Calculator", icon: "🎁", desc: "Indian gratuity payout estimate.", free: true },
  { id: "take-home-pay-calc", cat: "finance", name: "Take Home Pay Calculator", icon: "💵", desc: "Net monthly pay after deductions.", free: true },
  { id: "hourly-to-annual-calc", cat: "finance", name: "Hourly to Annual Salary", icon: "⏱️", desc: "Convert hourly to weekly/monthly/annual.", free: true },
  { id: "income-tax-calc", cat: "finance", name: "Income Tax Calculator (India)", icon: "🧾", desc: "Old vs New regime comparison.", free: true },
  { id: "tip-calc", cat: "finance", name: "Tip Calculator", icon: "🍽️", desc: "Tip + split bill among people.", free: true },
  { id: "markup-calc", cat: "finance", name: "Markup Calculator", icon: "🏷️", desc: "Markup %, cost, and selling price.", free: true },
  { id: "depreciation-calc", cat: "finance", name: "Depreciation Calculator", icon: "📉", desc: "Straight-line and reducing balance schedule.", free: true },
  { id: "future-value-calc", cat: "finance", name: "Future Value Calculator", icon: "🔮", desc: "Future value with compounding.", free: true },
  { id: "present-value-calc", cat: "finance", name: "Present Value Calculator", icon: "🕰️", desc: "Discount future money to present.", free: true },
  { id: "savings-goal-calc", cat: "finance", name: "Savings Goal Calculator", icon: "🎯", desc: "Monthly savings required for goal.", free: true },
  { id: "debt-payoff-calc", cat: "finance", name: "Debt Payoff Calculator", icon: "🧮", desc: "Debt payoff time and interest.", free: true },
  { id: "credit-card-payoff-calc", cat: "finance", name: "Credit Card Payoff Calculator", icon: "💳", desc: "Minimum vs fixed payment comparison.", free: true },
  { id: "car-loan-calc", cat: "finance", name: "Car Loan Calculator", icon: "🚗", desc: "EMI and ownership cost with amortization.", free: true },
  { id: "student-loan-calc", cat: "finance", name: "Student Loan Calculator", icon: "🎓", desc: "Standard vs income-based repayment.", free: true },
  { id: "break-even-calc", cat: "finance", name: "Break-even Calculator", icon: "⚖️", desc: "Break-even units and revenue.", free: true },
  { id: "net-worth-calc", cat: "finance", name: "Net Worth Calculator", icon: "🧾", desc: "Assets minus liabilities.", free: true },
  { id: "budget-calc", cat: "finance", name: "Budget Planner", icon: "📊", desc: "Income vs expenses with visual bar.", free: true },
  { id: "discount-calculator", cat: "finance", name: "Discount Calculator", icon: "🛍️", desc: "Sale price and savings from a discount %, or the discount % from a sale price, with optional stacked second discount.", free: true },
  // ── India Finance Batch (July 2026) ──
  { id: "emi-calc", cat: "finance", name: "EMI Calculator", icon: "🏦", desc: "Monthly EMI, total interest and year-wise loan schedule for any loan.", free: true },
  { id: "home-loan-emi-calc", cat: "finance", name: "Home Loan EMI Calculator", icon: "🏠", desc: "Home loan EMI with principal/interest split and yearly balance table.", free: true },
  { id: "sip-calc", cat: "finance", name: "SIP Calculator", icon: "📈", desc: "Mutual fund SIP maturity value, invested amount and wealth gained.", free: true },
  { id: "step-up-sip-calc", cat: "finance", name: "Step-up SIP Calculator", icon: "🪜", desc: "SIP returns when you increase your monthly investment every year.", free: true },
  { id: "lumpsum-calc", cat: "finance", name: "Lumpsum Calculator", icon: "💎", desc: "One-time investment growth with year-by-year value table.", free: true },
  { id: "swp-calc", cat: "finance", name: "SWP Calculator", icon: "🏧", desc: "Systematic withdrawal plan — how long your corpus lasts with monthly income.", free: true },
  { id: "gst-calc", cat: "finance", name: "GST Calculator", icon: "🧾", desc: "Add or remove GST with CGST/SGST split for all Indian GST rates.", free: true },
  { id: "fd-calc", cat: "finance", name: "FD Calculator", icon: "🏛️", desc: "Fixed deposit maturity with quarterly compounding like Indian banks.", free: true },
  { id: "hra-calc", cat: "finance", name: "HRA Exemption Calculator", icon: "🏘️", desc: "HRA tax exemption using the three-rule method for metro and non-metro.", free: true },
  { id: "ctc-to-inhand-calc", cat: "finance", name: "CTC to In-Hand Salary Calculator", icon: "💼", desc: "Convert annual CTC to monthly take-home salary under the new tax regime.", free: true },
  { id: "nps-calc", cat: "finance", name: "NPS Calculator", icon: "🧓", desc: "NPS retirement corpus, tax-free lumpsum and monthly pension estimate.", free: true },
  { id: "ssy-calc", cat: "finance", name: "Sukanya Samriddhi Calculator", icon: "👧", desc: "SSY maturity value for your daughter with 15-year deposits, 21-year term.", free: true },
  { id: "inflation-calc", cat: "finance", name: "Inflation Calculator", icon: "📉", desc: "Future cost of expenses and how inflation erodes the value of money.", free: true },
  { id: "simple-vs-compound-calc", cat: "finance", name: "Simple vs Compound Interest", icon: "⚖️", desc: "Side-by-side comparison showing the power of compounding year by year.", free: true },
  { id: "loan-prepayment-calc", cat: "finance", name: "Loan Prepayment Calculator", icon: "✂️", desc: "Interest saved and tenure reduced by paying extra EMI every month.", free: true },
  // ── Investment & Business Finance Batch (W3) ──
  { id: "rule-of-72-calc", cat: "finance", name: "Rule of 72 Calculator", icon: "⏳", desc: "Estimate how many years it takes for money to double at a given interest rate, with the exact compounding answer for comparison.", free: true },
  { id: "npv-calc", cat: "finance", name: "NPV Calculator", icon: "💹", desc: "Net Present Value of a project by discounting a series of yearly cash flows at your required rate of return.", free: true },
  { id: "irr-calc", cat: "finance", name: "IRR Calculator", icon: "🔁", desc: "Internal Rate of Return of an investment's cash flows, solved numerically so NPV equals zero.", free: true },
  { id: "payback-period-calc", cat: "finance", name: "Payback Period Calculator", icon: "🕗", desc: "How long an investment takes to recover its initial cost from annual cash inflows, in years and months.", free: true },
  { id: "dividend-yield-calc", cat: "finance", name: "Dividend Yield Calculator", icon: "💰", desc: "Annual dividend yield of a stock from its dividend per share and current market price, plus yearly income on your holding.", free: true },
  { id: "pe-ratio-calc", cat: "finance", name: "P/E Ratio Calculator", icon: "📊", desc: "Price-to-earnings ratio and earnings yield of a stock from its share price and earnings per share.", free: true },
  { id: "dividend-payout-ratio-calc", cat: "finance", name: "Dividend Payout Ratio Calculator", icon: "🥧", desc: "Share of net income paid to shareholders as dividends, with the retention ratio kept for growth.", free: true },
  { id: "salary-hike-calc", cat: "finance", name: "Salary Hike Calculator", icon: "📈", desc: "New salary after a percentage raise, or the hike percentage between an old and new salary, with the increment amount.", free: true },
  { id: "overtime-pay-calc", cat: "finance", name: "Overtime Pay Calculator", icon: "🕔", desc: "Total pay from regular hours plus overtime hours at a chosen overtime multiplier such as time-and-a-half or double time.", free: true },
  { id: "currency-denomination-calc", cat: "finance", name: "Cash Denomination Breakdown", icon: "🪙", desc: "Break any amount into the fewest currency notes and coins for INR or USD, ideal for cash handling and petty cash.", free: true },
  { id: "effective-annual-rate-calc", cat: "finance", name: "Effective Annual Rate Calculator", icon: "🔂", desc: "Effective annual rate (APY) from a nominal interest rate and its compounding frequency, including continuous compounding.", free: true },
  { id: "annualized-return-calc", cat: "finance", name: "Annualized Return Calculator", icon: "📆", desc: "Holding period return and annualized return of an investment from its buy value, sell value, income and days held.", free: true },

  { id: "tdee-calc", cat: "health", name: "TDEE Calculator", icon: "🔥", desc: "Daily energy expenditure by activity.", free: true },
  { id: "macro-calc", cat: "health", name: "Macro Calculator", icon: "🥗", desc: "Protein/carbs/fats from calorie goal.", free: true },
  { id: "protein-intake-calc", cat: "health", name: "Protein Intake Calculator", icon: "💪", desc: "Daily protein recommendation.", free: true },
  { id: "heart-rate-zone-calc", cat: "health", name: "Heart Rate Zones", icon: "❤️", desc: "Five training zones.", free: true },
  { id: "vo2max-calc", cat: "health", name: "VO2 Max Calculator", icon: "🏃", desc: "Estimate VO2 max via Cooper/resting HR.", free: true },
  { id: "pace-calc", cat: "health", name: "Pace Calculator", icon: "⏱️", desc: "Speed/pace/distance/time converter.", free: true },
  { id: "blood-alcohol-calc", cat: "health", name: "Blood Alcohol Calculator", icon: "🍺", desc: "Estimate BAC with safety disclaimer.", free: true },
  { id: "sleep-calc", cat: "health", name: "Sleep Calculator", icon: "😴", desc: "Best bed/wake times by 90-min cycles.", free: true },
  { id: "blood-pressure-calc", cat: "health", name: "Blood Pressure Classifier", icon: "🩺", desc: "BP category with chart.", free: true },
  { id: "blood-sugar-converter", cat: "health", name: "Blood Sugar Converter", icon: "🩸", desc: "mg/dL ↔ mmol/L with category.", free: true },
  { id: "bmi-calculator", cat: "health", name: "BMI Calculator", icon: "🧍", desc: "Body Mass Index from weight and height in metric or imperial, with WHO and Asian-Indian category tables.", free: true },

  { id: "aspect-ratio-calc", cat: "unit", name: "Aspect Ratio Calculator", icon: "🖼️", desc: "Find ratio and equivalent dimensions.", free: true },
  { id: "ppi-dpi-calc", cat: "unit", name: "PPI/DPI Calculator", icon: "🖥️", desc: "Pixels per inch from resolution/size.", free: true },
  { id: "fuel-cost-calc", cat: "unit", name: "Fuel Cost Calculator", icon: "⛽", desc: "Trip fuel cost estimate.", free: true },
  { id: "electricity-cost-calc", cat: "unit", name: "Electricity Cost Calculator", icon: "💡", desc: "Appliance electricity bill estimate.", free: true },
  { id: "ohms-law-calc", cat: "unit", name: "Ohm's Law Calculator", icon: "⚡", desc: "Solve V, I, R or P.", free: true },
];

const CATEGORIES = [
  { id: "finance", name: "Finance Calculators", icon: "💰", desc: "Money, investment, tax, loans and planning tools." },
  { id: "health", name: "Health & Fitness Calculators", icon: "🏥", desc: "Fitness, vitals, sleep and health metric tools." },
  { id: "unit", name: "Everyday Calculators", icon: "🧰", desc: "Practical daily-use conversion and utility calculators." },
];
function PresentValueCalc() {
  const [fv, setFv] = useState("50000");
  const [rate, setRate] = useState("8");
  const [years, setYears] = useState("10");
  const [freq, setFreq] = useState("12");

  const out = useMemo(() => {
    const F = n(fv), r = n(rate) / 100, y = n(years), m = n(freq);
    const pv = F / Math.pow(1 + r / m, m * y);
    const rows = [];
    for (let i = 1; i <= Math.max(1, Math.floor(y)); i++) {
      const df = 1 / Math.pow(1 + r / m, m * i);
      rows.push([i, round(df, 6), curr(F * df)]);
    }
    return { pv, rows };
  }, [fv, rate, years, freq]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Future Value</Label><Input value={fv} onChange={setFv} /></div>
        <div><Label>Discount Rate %</Label><Input value={rate} onChange={setRate} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Years</Label><Input value={years} onChange={setYears} /></div>
        <div><Label>Compounds / Year</Label><Input value={freq} onChange={setFreq} /></div>
      </Grid2>
      <BigResult value={curr(out.pv)} label="Present Value" />
      <DataTable columns={["Year", "Discount Factor", "PV Equivalent"]} rows={out.rows} />
    </VStack>
  );
}

function SavingsGoalCalc() {
  const [goal, setGoal] = useState("100000");
  const [current, setCurrent] = useState("5000");
  const [rate, setRate] = useState("6");
  const [years, setYears] = useState("5");

  const out = useMemo(() => {
    const G = n(goal), C0 = n(current), r = n(rate) / 100 / 12, m = Math.max(1, Math.floor(n(years) * 12));
    const needFromContrib = Math.max(0, G - C0 * Math.pow(1 + r, m));
    const monthly = r === 0 ? needFromContrib / m : needFromContrib / ((((Math.pow(1 + r, m) - 1) / r) * (1 + r)));
    let bal = C0;
    const rows = [];
    for (let i = 1; i <= m; i++) {
      const start = bal;
      const interest = start * r;
      bal = start + interest + monthly;
      if (i % 12 === 0 || i === m) rows.push([Math.ceil(i / 12), curr(start), curr(interest * 12), curr(monthly * 12), curr(bal)]);
    }
    return { monthly, rows };
  }, [goal, current, rate, years]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Goal Amount</Label><Input value={goal} onChange={setGoal} /></div>
        <div><Label>Current Savings</Label><Input value={current} onChange={setCurrent} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Expected Return % p.a.</Label><Input value={rate} onChange={setRate} /></div>
        <div><Label>Years to Goal</Label><Input value={years} onChange={setYears} /></div>
      </Grid2>
      <BigResult value={curr(out.monthly)} label="Required Monthly Savings" />
      <DataTable columns={["Year", "Start", "Interest (approx)", "Contributions", "End"]} rows={out.rows} />
    </VStack>
  );
}

function buildAmortization(P, annualRate, monthlyPay, maxMonths = 600) {
  let bal = P;
  const r = annualRate / 12 / 100;
  let month = 0;
  let totalInterest = 0;
  const rows = [];
  while (bal > 0.01 && month < maxMonths) {
    month++;
    const interest = bal * r;
    let principal = monthlyPay - interest;
    if (principal <= 0) return { impossible: true, months: Infinity, totalInterest: Infinity, rows: [] };
    if (principal > bal) principal = bal;
    const end = bal - principal;
    totalInterest += interest;
    if (month <= 12) rows.push([month, curr(bal), curr(interest), curr(principal), curr(end)]);
    bal = end;
  }
  return { impossible: false, months: month, totalInterest, rows };
}

function DebtPayoffCalc() {
  const [debt, setDebt] = useState("8000");
  const [rate, setRate] = useState("18");
  const [payment, setPayment] = useState("250");

  const out = useMemo(() => {
    const P = n(debt), r = n(rate), pay = n(payment);
    const sim = buildAmortization(P, r, pay, 1200);
    if (sim.impossible) return { months: "Never", interest: "—", rows: [] };
    return { months: sim.months, interest: sim.totalInterest, rows: sim.rows };
  }, [debt, rate, payment]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Total Debt</Label><Input value={debt} onChange={setDebt} /></div>
        <div><Label>APR %</Label><Input value={rate} onChange={setRate} /></div>
        <div><Label>Monthly Payment</Label><Input value={payment} onChange={setPayment} /></div>
      </Grid3>
      <Grid2>
        <BigResult value={String(out.months)} label="Months to Payoff" />
        <BigResult value={out.interest === "—" ? "—" : curr(out.interest)} label="Total Interest" />
      </Grid2>
      <DataTable columns={["Month", "Start Balance", "Interest", "Principal", "End Balance"]} rows={out.rows} />
    </VStack>
  );
}

function CreditCardPayoffCalc() {
  const [balance, setBalance] = useState("5000");
  const [apr, setApr] = useState("24");
  const [minRate, setMinRate] = useState("3");
  const [fixedPay, setFixedPay] = useState("250");

  const out = useMemo(() => {
    const B = n(balance), A = n(apr), mrate = n(minRate) / 100, fixed = n(fixedPay);

    // Minimum payment simulation
    let bal = B, month = 0, totalI = 0;
    const r = A / 12 / 100;
    while (bal > 0.01 && month < 1200) {
      month++;
      const i = bal * r;
      let pay = Math.max(25, bal * mrate);
      if (pay > bal + i) pay = bal + i;
      const p = pay - i;
      bal -= p;
      totalI += i;
    }
    const minResult = month >= 1200 ? { months: Infinity, interest: Infinity } : { months: month, interest: totalI };

    // Fixed payment simulation + first 12 rows
    const fixedResult = buildAmortization(B, A, fixed, 1200);

    const compareRows = [
      ["Minimum Payment", minResult.months === Infinity ? "Very long" : `${minResult.months} mo`, minResult.interest === Infinity ? "—" : curr(minResult.interest)],
      ["Fixed Payment", fixedResult.impossible ? "Never" : `${fixedResult.months} mo`, fixedResult.impossible ? "—" : curr(fixedResult.totalInterest)],
    ];

    return { compareRows, amortRows: fixedResult.rows };
  }, [balance, apr, minRate, fixedPay]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Card Balance</Label><Input value={balance} onChange={setBalance} /></div>
        <div><Label>APR %</Label><Input value={apr} onChange={setApr} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Minimum Payment %</Label><Input value={minRate} onChange={setMinRate} /></div>
        <div><Label>Fixed Payment / Month</Label><Input value={fixedPay} onChange={setFixedPay} /></div>
      </Grid2>
      <DataTable columns={["Scenario", "Payoff Time", "Total Interest"]} rows={out.compareRows} />
      <DataTable columns={["Month", "Start Balance", "Interest", "Principal", "End Balance"]} rows={out.amortRows} />
    </VStack>
  );
}

function emi(P, annualRate, months) {
  const r = annualRate / 12 / 100;
  if (r === 0) return P / months;
  return (P * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function CarLoanCalc() {
  const [price, setPrice] = useState("25000");
  const [down, setDown] = useState("5000");
  const [rate, setRate] = useState("9");
  const [years, setYears] = useState("5");
  const [insuranceYear, setInsuranceYear] = useState("1200");
  const [maintenanceYear, setMaintenanceYear] = useState("800");

  const out = useMemo(() => {
    const principal = Math.max(0, n(price) - n(down));
    const months = Math.max(1, Math.floor(n(years) * 12));
    const E = emi(principal, n(rate), months);
    const totalLoanPaid = E * months;
    const totalInterest = totalLoanPaid - principal;
    const tco = n(down) + totalLoanPaid + (n(insuranceYear) + n(maintenanceYear)) * n(years);

    // amortization first 12
    let bal = principal;
    const r = n(rate) / 12 / 100;
    const rows = [];
    for (let m = 1; m <= Math.min(12, months); m++) {
      const i = bal * r;
      let p = E - i;
      if (p > bal) p = bal;
      const end = bal - p;
      rows.push([m, curr(bal), curr(i), curr(p), curr(end)]);
      bal = end;
    }
    const sumRows = [
      ["Vehicle Price", curr(n(price))],
      ["Down Payment", curr(n(down))],
      ["Loan Principal", curr(principal)],
      ["Total Interest", curr(totalInterest)],
      ["Total Cost of Ownership", curr(tco)],
    ];
    return { E, rows, sumRows };
  }, [price, down, rate, years, insuranceYear, maintenanceYear]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Car Price</Label><Input value={price} onChange={setPrice} /></div>
        <div><Label>Down Payment</Label><Input value={down} onChange={setDown} /></div>
        <div><Label>APR %</Label><Input value={rate} onChange={setRate} /></div>
      </Grid3>
      <Grid3>
        <div><Label>Loan Years</Label><Input value={years} onChange={setYears} /></div>
        <div><Label>Insurance / Year</Label><Input value={insuranceYear} onChange={setInsuranceYear} /></div>
        <div><Label>Maintenance / Year</Label><Input value={maintenanceYear} onChange={setMaintenanceYear} /></div>
      </Grid3>
      <BigResult value={curr(out.E)} label="Monthly EMI" />
      <DataTable columns={["Item", "Amount"]} rows={out.sumRows} />
      <DataTable columns={["Month", "Start Balance", "Interest", "Principal", "End Balance"]} rows={out.rows} />
    </VStack>
  );
}

function StudentLoanCalc() {
  const [principal, setPrincipal] = useState("40000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState("10");
  const [annualIncome, setAnnualIncome] = useState("55000");

  const out = useMemo(() => {
    const P = n(principal), R = n(rate), months = Math.max(1, Math.floor(n(years) * 12));
    const stdPay = emi(P, R, months);
    const std = buildAmortization(P, R, stdPay, 1200);

    const incomeBased = Math.max(25, (n(annualIncome) * 0.1) / 12); // simplified 10% of income /12
    const ibr = buildAmortization(P, R, incomeBased, 2400);

    const compare = [
      ["Standard Plan", curr(stdPay), std.impossible ? "Never" : `${std.months} mo`, std.impossible ? "—" : curr(std.totalInterest)],
      ["Income-Based", curr(incomeBased), ibr.impossible ? "Very long" : `${ibr.months} mo`, ibr.impossible ? "—" : curr(ibr.totalInterest)],
    ];

    return { compare, amortRows: std.rows };
  }, [principal, rate, years, annualIncome]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Loan Principal</Label><Input value={principal} onChange={setPrincipal} /></div>
        <div><Label>APR %</Label><Input value={rate} onChange={setRate} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Standard Term (Years)</Label><Input value={years} onChange={setYears} /></div>
        <div><Label>Annual Income (for IBR)</Label><Input value={annualIncome} onChange={setAnnualIncome} /></div>
      </Grid2>
      <DataTable columns={["Plan", "Monthly Payment", "Payoff Time", "Total Interest"]} rows={out.compare} />
      <DataTable columns={["Month", "Start Balance", "Interest", "Principal", "End Balance"]} rows={out.amortRows} />
    </VStack>
  );
}

function BreakEvenCalc() {
  const [fixed, setFixed] = useState("10000");
  const [variable, setVariable] = useState("30");
  const [price, setPrice] = useState("60");
  const [targetUnits, setTargetUnits] = useState("500");

  const out = useMemo(() => {
    const F = n(fixed), V = n(variable), P = n(price), U = n(targetUnits);
    const contribution = P - V;
    const units = contribution > 0 ? F / contribution : Infinity;
    const revenue = units === Infinity ? Infinity : units * P;
    const rows = [
      ["Fixed Costs", curr(F)],
      ["Variable Cost / Unit", curr(V)],
      ["Selling Price / Unit", curr(P)],
      ["Contribution / Unit", curr(contribution)],
      ["Break-even Units", Number.isFinite(units) ? round(units, 2) : "Not achievable"],
      ["Break-even Revenue", Number.isFinite(revenue) ? curr(revenue) : "Not achievable"],
      ["Profit at Target Units", curr(U * contribution - F)],
    ];
    return { units, rows };
  }, [fixed, variable, price, targetUnits]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Fixed Costs</Label><Input value={fixed} onChange={setFixed} /></div>
        <div><Label>Variable Cost / Unit</Label><Input value={variable} onChange={setVariable} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Selling Price / Unit</Label><Input value={price} onChange={setPrice} /></div>
        <div><Label>Target Units</Label><Input value={targetUnits} onChange={setTargetUnits} /></div>
      </Grid2>
      <BigResult value={Number.isFinite(out.units) ? round(out.units, 2) : "Not achievable"} label="Break-even Units" />
      <DataTable columns={["Metric", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function NetWorthCalc() {
  const [assets, setAssets] = useState("150000, 25000, 12000");
  const [liabilities, setLiabilities] = useState("40000, 15000");

  const out = useMemo(() => {
    const A = assets.split(/[,\n]+/).map((x) => n(x)).filter((x) => x > 0);
    const L = liabilities.split(/[,\n]+/).map((x) => n(x)).filter((x) => x > 0);
    const aSum = A.reduce((s, x) => s + x, 0);
    const lSum = L.reduce((s, x) => s + x, 0);
    const nw = aSum - lSum;
    const rows = [
      ["Total Assets", curr(aSum)],
      ["Total Liabilities", curr(lSum)],
      ["Net Worth", curr(nw)],
    ];
    return { nw, rows, A, L };
  }, [assets, liabilities]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Assets (comma or newline)</Label><Textarea value={assets} onChange={setAssets} rows={5} /></div>
        <div><Label>Liabilities (comma or newline)</Label><Textarea value={liabilities} onChange={setLiabilities} rows={5} /></div>
      </Grid2>
      <BigResult value={curr(out.nw)} label="Net Worth" />
      <DataTable columns={["Item", "Amount"]} rows={out.rows} />
    </VStack>
  );
}

function BudgetCalc() {
  const [income, setIncome] = useState("4000");
  const [housing, setHousing] = useState("1200");
  const [food, setFood] = useState("500");
  const [transport, setTransport] = useState("300");
  const [utilities, setUtilities] = useState("250");
  const [misc, setMisc] = useState("400");

  const out = useMemo(() => {
    const inc = n(income);
    const exp = n(housing) + n(food) + n(transport) + n(utilities) + n(misc);
    const save = inc - exp;
    const expPct = inc > 0 ? (exp / inc) * 100 : 0;
    const savePct = inc > 0 ? (save / inc) * 100 : 0;
    const rows = [
      ["Income", curr(inc)],
      ["Housing", curr(n(housing))],
      ["Food", curr(n(food))],
      ["Transport", curr(n(transport))],
      ["Utilities", curr(n(utilities))],
      ["Misc", curr(n(misc))],
      ["Total Expenses", curr(exp)],
      ["Remaining", curr(save)],
    ];
    return { inc, exp, save, expPct, savePct, rows };
  }, [income, housing, food, transport, utilities, misc]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Monthly Income</Label><Input value={income} onChange={setIncome} /></div>
        <div><Label>Housing</Label><Input value={housing} onChange={setHousing} /></div>
        <div><Label>Food</Label><Input value={food} onChange={setFood} /></div>
      </Grid3>
      <Grid3>
        <div><Label>Transport</Label><Input value={transport} onChange={setTransport} /></div>
        <div><Label>Utilities</Label><Input value={utilities} onChange={setUtilities} /></div>
        <div><Label>Misc</Label><Input value={misc} onChange={setMisc} /></div>
      </Grid3>

      <Grid2>
        <BigResult value={curr(out.exp)} label="Total Expenses" sub={`${pct(out.expPct)} of income`} />
        <BigResult value={curr(out.save)} label="Remaining / Savings" sub={`${pct(out.savePct)} of income`} />
      </Grid2>

      <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 10, padding: 10 }}>
        <div style={{ height: 18, borderRadius: 8, overflow: "hidden", background: "rgba(255,255,255,0.08)", display: "flex" }}>
          <div style={{ width: `${Math.min(100, Math.max(0, out.expPct))}%`, background: "#EF4444" }} />
          <div style={{ width: `${Math.min(100, Math.max(0, out.savePct))}%`, background: "#10B981" }} />
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 16, fontSize: 12, color: C.muted }}>
          <span>🟥 Expenses: {pct(out.expPct)}</span>
          <span>🟩 Savings: {pct(out.savePct)}</span>
        </div>
      </div>

      <DataTable columns={["Component", "Amount"]} rows={out.rows} />
    </VStack>
  );
}

function DiscountCalc() {
  const [mode, setMode] = useState("percent");
  const [original, setOriginal] = useState("2000");
  const [discount, setDiscount] = useState("25");
  const [discount2, setDiscount2] = useState("0");
  const [sale, setSale] = useState("1500");

  const out = useMemo(() => {
    const P = n(original);
    if (mode === "percent") {
      // Two discounts apply sequentially: the 2nd is taken off the already-reduced price.
      const d1 = n(discount) / 100, d2 = n(discount2) / 100;
      const afterFirst = P * (1 - d1);
      const finalPrice = afterFirst * (1 - d2);
      const saved = P - finalPrice;
      const effective = P > 0 ? (saved / P) * 100 : 0;
      return {
        finalPrice, saved, effective,
        rows: [
          ["Original Price", curr(P)],
          ["First Discount", pct(n(discount))],
          ["Price After 1st Discount", curr(afterFirst)],
          ["Second Discount", pct(n(discount2))],
          ["Final Sale Price", curr(finalPrice)],
          ["Total Saved", curr(saved)],
          ["Effective Discount", pct(effective)],
        ],
      };
    }
    // mode === "amount": derive the discount % from original + sale price
    const S = n(sale);
    const saved = P - S;
    const effective = P > 0 ? (saved / P) * 100 : 0;
    return {
      finalPrice: S, saved, effective,
      rows: [
        ["Original Price", curr(P)],
        ["Sale Price", curr(S)],
        ["Total Saved", curr(saved)],
        ["Discount %", pct(effective)],
      ],
    };
  }, [mode, original, discount, discount2, sale]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Mode</Label><SelectInput value={mode} onChange={setMode} options={[{ value: "percent", label: "Price + Discount % → Sale" }, { value: "amount", label: "Price + Sale → Discount %" }]} /></div>
        <div><Label>Original Price</Label><Input value={original} onChange={setOriginal} /></div>
      </Grid2>
      {mode === "percent" ? (
        <Grid2>
          <div><Label>Discount %</Label><Input value={discount} onChange={setDiscount} /></div>
          <div><Label>2nd Discount % (optional)</Label><Input value={discount2} onChange={setDiscount2} /></div>
        </Grid2>
      ) : (
        <div><Label>Sale Price</Label><Input value={sale} onChange={setSale} /></div>
      )}
      <Grid3>
        <BigResult value={curr(out.finalPrice)} label="Sale Price" />
        <BigResult value={curr(out.saved)} label="You Save" />
        <BigResult value={pct(out.effective)} label="Effective Discount" />
      </Grid3>
      <DataTable columns={["Item", "Value"]} rows={out.rows} />
    </VStack>
  );
}

const TOOL_COMPONENTS = {
  "investment-return-calc": InvestmentReturnCalc,
  "discount-calculator": DiscountCalc,
  "rd-calc": RdCalc,
  "ppf-calc": PpfCalc,
  "gratuity-calc": GratuityCalc,
  "take-home-pay-calc": TakeHomePayCalc,
  "hourly-to-annual-calc": HourlyToAnnualCalc,
  "income-tax-calc": IncomeTaxCalc,
  "tip-calc": TipCalc,
  "markup-calc": MarkupCalc,
  "depreciation-calc": DepreciationCalc,
  "future-value-calc": FutureValueCalc,
  "present-value-calc": PresentValueCalc,
  "savings-goal-calc": SavingsGoalCalc,
  "debt-payoff-calc": DebtPayoffCalc,
  "credit-card-payoff-calc": CreditCardPayoffCalc,
  "car-loan-calc": CarLoanCalc,
  "student-loan-calc": StudentLoanCalc,
  "break-even-calc": BreakEvenCalc,
  "net-worth-calc": NetWorthCalc,
  "budget-calc": BudgetCalc,
};
function bmrMifflin(gender, weightKg, heightCm, age) {
  if (gender === "female") return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
}

function TdeeCalc() {
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState("30");
  const [weight, setWeight] = useState("75");
  const [height, setHeight] = useState("175");
  const [activity, setActivity] = useState("1.55");

  const out = useMemo(() => {
    const a = n(age), w = n(weight), h = n(height), act = n(activity);
    const bmr = bmrMifflin(gender, w, h, a);
    const tdee = bmr * act;
    let cat = "Maintenance";
    if (tdee < 1800) cat = "Lower energy need";
    else if (tdee < 2600) cat = "Moderate energy need";
    else cat = "Higher energy need";
    const rows = [
      ["BMR (Mifflin-St Jeor)", round(bmr, 0)],
      ["Activity Factor", act],
      ["TDEE", round(tdee, 0)],
      ["Category", cat],
    ];
    return { bmr, tdee, cat, rows };
  }, [gender, age, weight, height, activity]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Gender</Label><SelectInput value={gender} onChange={setGender} options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]} /></div>
        <div><Label>Age</Label><Input value={age} onChange={setAge} /></div>
        <div><Label>Weight (kg)</Label><Input value={weight} onChange={setWeight} /></div>
      </Grid3>
      <Grid2>
        <div><Label>Height (cm)</Label><Input value={height} onChange={setHeight} /></div>
        <div><Label>Activity Level</Label><SelectInput value={activity} onChange={setActivity} options={[
          { value: "1.2", label: "Sedentary (1.2)" },
          { value: "1.375", label: "Lightly active (1.375)" },
          { value: "1.55", label: "Moderately active (1.55)" },
          { value: "1.725", label: "Very active (1.725)" },
          { value: "1.9", label: "Extra active (1.9)" },
        ]} /></div>
      </Grid2>
      <Grid2>
        <BigResult value={`${round(out.tdee, 0)} kcal`} label="TDEE" />
        <BigResult value={out.cat} label="Classification" />
      </Grid2>
      <DataTable columns={["Metric", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function MacroCalc() {
  const [cal, setCal] = useState("2200");
  const [goal, setGoal] = useState("maintain");
  const [weight, setWeight] = useState("75");

  const out = useMemo(() => {
    let C = n(cal);
    if (goal === "cut") C -= 300;
    if (goal === "bulk") C += 300;
    const w = n(weight);
    const proteinG = goal === "cut" ? w * 2.2 : w * 1.8;
    const fatG = (C * 0.25) / 9;
    const carbsG = Math.max(0, (C - proteinG * 4 - fatG * 9) / 4);
    let cat = "Balanced";
    if (goal === "cut") cat = "Fat loss";
    if (goal === "bulk") cat = "Muscle gain";
    const rows = [
      ["Calorie Target", `${round(C, 0)} kcal`],
      ["Protein", `${round(proteinG, 1)} g`],
      ["Carbs", `${round(carbsG, 1)} g`],
      ["Fat", `${round(fatG, 1)} g`],
      ["Goal Category", cat],
    ];
    return { C, proteinG, carbsG, fatG, cat, rows };
  }, [cal, goal, weight]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Base Calories</Label><Input value={cal} onChange={setCal} /></div>
        <div><Label>Goal</Label><SelectInput value={goal} onChange={setGoal} options={[{ value: "cut", label: "Cut" }, { value: "maintain", label: "Maintain" }, { value: "bulk", label: "Bulk" }]} /></div>
        <div><Label>Weight (kg)</Label><Input value={weight} onChange={setWeight} /></div>
      </Grid3>
      <Grid3>
        <BigResult value={`${round(out.proteinG, 1)} g`} label="Protein" />
        <BigResult value={`${round(out.carbsG, 1)} g`} label="Carbs" />
        <BigResult value={`${round(out.fatG, 1)} g`} label="Fat" />
      </Grid3>
      <DataTable columns={["Component", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function ProteinIntakeCalc() {
  const [weight, setWeight] = useState("75");
  const [activity, setActivity] = useState("moderate");

  const out = useMemo(() => {
    const w = n(weight);
    const factorMap = { low: 1.2, moderate: 1.6, high: 2.0, athlete: 2.2 };
    const factor = factorMap[activity] || 1.6;
    const grams = w * factor;
    const cat = activity === "athlete" ? "Performance" : activity === "high" ? "High training" : activity === "moderate" ? "Active lifestyle" : "General health";
    const rows = [
      ["Weight", `${w} kg`],
      ["Activity Factor", `${factor} g/kg`],
      ["Recommended Protein", `${round(grams, 1)} g/day`],
      ["Category", cat],
    ];
    return { grams, cat, rows };
  }, [weight, activity]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Weight (kg)</Label><Input value={weight} onChange={setWeight} /></div>
        <div><Label>Activity Level</Label><SelectInput value={activity} onChange={setActivity} options={[
          { value: "low", label: "Low" },
          { value: "moderate", label: "Moderate" },
          { value: "high", label: "High" },
          { value: "athlete", label: "Athlete" },
        ]} /></div>
      </Grid2>
      <Grid2>
        <BigResult value={`${round(out.grams, 1)} g/day`} label="Protein Target" />
        <BigResult value={out.cat} label="Classification" />
      </Grid2>
      <DataTable columns={["Metric", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function HeartRateZoneCalc() {
  const [mode, setMode] = useState("age");
  const [age, setAge] = useState("30");
  const [maxHrInput, setMaxHrInput] = useState("190");

  const out = useMemo(() => {
    const maxHr = mode === "age" ? 220 - n(age) : n(maxHrInput);
    const zones = [
      ["Zone 1 (50-60%)", `${round(maxHr * 0.5, 0)} - ${round(maxHr * 0.6, 0)} bpm`, "Recovery"],
      ["Zone 2 (60-70%)", `${round(maxHr * 0.6, 0)} - ${round(maxHr * 0.7, 0)} bpm`, "Easy aerobic"],
      ["Zone 3 (70-80%)", `${round(maxHr * 0.7, 0)} - ${round(maxHr * 0.8, 0)} bpm`, "Moderate"],
      ["Zone 4 (80-90%)", `${round(maxHr * 0.8, 0)} - ${round(maxHr * 0.9, 0)} bpm`, "Hard threshold"],
      ["Zone 5 (90-100%)", `${round(maxHr * 0.9, 0)} - ${round(maxHr * 1.0, 0)} bpm`, "Max effort"],
    ];
    return { maxHr, zones };
  }, [mode, age, maxHrInput]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Mode</Label><SelectInput value={mode} onChange={setMode} options={[{ value: "age", label: "From Age" }, { value: "max", label: "Use Max HR" }]} /></div>
        <div><Label>Age</Label><Input value={age} onChange={setAge} /></div>
        <div><Label>Max HR (manual)</Label><Input value={maxHrInput} onChange={setMaxHrInput} /></div>
      </Grid3>
      <BigResult value={`${round(out.maxHr, 0)} bpm`} label="Estimated Max HR" />
      <DataTable columns={["Zone", "Range", "Category"]} rows={out.zones} />
    </VStack>
  );
}

function Vo2MaxCalc() {
  const [method, setMethod] = useState("cooper");
  const [distance, setDistance] = useState("2600");
  const [restingHr, setRestingHr] = useState("60");
  const [maxHr, setMaxHr] = useState("190");

  const out = useMemo(() => {
    let vo2 = 0;
    let cat = "";
    let rows = [];
    if (method === "cooper") {
      const d = n(distance); // meters in 12 min
      vo2 = (d - 504.9) / 44.73;
      cat = vo2 < 35 ? "Below average" : vo2 < 45 ? "Average" : "Good+";
      rows = [["Method", "Cooper 12-min"], ["Distance", `${d} m`], ["VO2 max", `${round(vo2, 2)} ml/kg/min`], ["Category", cat]];
    } else {
      const r = n(restingHr), m = n(maxHr);
      vo2 = 15.3 * (m / (r || 1));
      cat = vo2 < 35 ? "Below average" : vo2 < 45 ? "Average" : "Good+";
      rows = [["Method", "HR Ratio"], ["Resting HR", `${r} bpm`], ["Max HR", `${m} bpm`], ["VO2 max", `${round(vo2, 2)} ml/kg/min`], ["Category", cat]];
    }
    return { vo2, cat, rows };
  }, [method, distance, restingHr, maxHr]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Method</Label><SelectInput value={method} onChange={setMethod} options={[{ value: "cooper", label: "Cooper Test" }, { value: "hr", label: "Resting HR Method" }]} /></div>
        <div><Label>12-min Distance (m)</Label><Input value={distance} onChange={setDistance} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Resting HR</Label><Input value={restingHr} onChange={setRestingHr} /></div>
        <div><Label>Max HR</Label><Input value={maxHr} onChange={setMaxHr} /></div>
      </Grid2>
      <Grid2>
        <BigResult value={`${round(out.vo2, 2)} ml/kg/min`} label="Estimated VO2 Max" />
        <BigResult value={out.cat} label="Classification" />
      </Grid2>
      <DataTable columns={["Metric", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function toSeconds(h, m, s) { return n(h) * 3600 + n(m) * 60 + n(s); }
function fmtPace(secPerKm) {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return "—";
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, "0")} /km`;
}

function PaceCalc() {
  const [distance, setDistance] = useState("10");
  const [h, setH] = useState("0");
  const [m, setM] = useState("50");
  const [s, setS] = useState("0");

  const out = useMemo(() => {
    const d = n(distance);
    const t = toSeconds(h, m, s);
    const pace = d > 0 ? t / d : 0;
    const speed = t > 0 ? (d / t) * 3600 : 0;
    const cat = pace < 300 ? "Fast" : pace < 390 ? "Moderate" : "Easy";
    const rows = [
      ["Distance", `${d} km`],
      ["Time", `${h}h ${m}m ${s}s`],
      ["Pace", fmtPace(pace)],
      ["Speed", `${round(speed, 2)} km/h`],
      ["Category", cat],
    ];
    return { pace, speed, cat, rows };
  }, [distance, h, m, s]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Distance (km)</Label><Input value={distance} onChange={setDistance} /></div>
        <div><Label>Time (h:m:s)</Label><Grid3><Input value={h} onChange={setH} /><Input value={m} onChange={setM} /><Input value={s} onChange={setS} /></Grid3></div>
      </Grid2>
      <Grid2>
        <BigResult value={fmtPace(out.pace)} label="Pace" />
        <BigResult value={`${round(out.speed, 2)} km/h`} label="Speed" />
      </Grid2>
      <DataTable columns={["Metric", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function BloodAlcoholCalc() {
  const [drinks, setDrinks] = useState("3");
  const [weightKg, setWeightKg] = useState("75");
  const [gender, setGender] = useState("male");
  const [hours, setHours] = useState("2");

  const out = useMemo(() => {
    const d = n(drinks), w = n(weightKg), h = n(hours);
    const alcoholG = d * 14;
    const r = gender === "female" ? 0.55 : 0.68;
    let bac = ((alcoholG / (w * 1000 * r)) * 100) - (0.015 * h);
    if (bac < 0) bac = 0;
    let cat = "Low";
    if (bac >= 0.08) cat = "Legally impaired in many regions";
    else if (bac >= 0.03) cat = "Impaired";
    const rows = [
      ["Drinks", d],
      ["Weight", `${w} kg`],
      ["Time elapsed", `${h} h`],
      ["Estimated BAC", round(bac, 3)],
      ["Category", cat],
    ];
    return { bac, cat, rows };
  }, [drinks, weightKg, gender, hours]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Standard Drinks</Label><Input value={drinks} onChange={setDrinks} /></div>
        <div><Label>Weight (kg)</Label><Input value={weightKg} onChange={setWeightKg} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Gender</Label><SelectInput value={gender} onChange={setGender} options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]} /></div>
        <div><Label>Hours Elapsed</Label><Input value={hours} onChange={setHours} /></div>
      </Grid2>
      <Grid2>
        <BigResult value={round(out.bac, 3)} label="Estimated BAC" />
        <BigResult value={out.cat} label="Classification" />
      </Grid2>
      <DataTable columns={["Metric", "Value"]} rows={out.rows} />
      <Result>⚠️ Safety Disclaimer: This is only an estimate. Do not drink and drive. If you consumed alcohol, use a safe ride option and avoid operating vehicles or machinery.</Result>
    </VStack>
  );
}

function SleepCalc() {
  const [wakeHour, setWakeHour] = useState("7");
  const [wakeMin, setWakeMin] = useState("00");

  const out = useMemo(() => {
    const h = Math.floor(n(wakeHour)) % 24;
    const m = Math.floor(n(wakeMin)) % 60;
    const wake = new Date();
    wake.setHours(h, m, 0, 0);
    const rows = [];
    for (let cycles = 6; cycles >= 3; cycles--) {
      const bedtime = new Date(wake.getTime() - (cycles * 90 + 15) * 60000); // include 15 min fall asleep
      const hh = String(bedtime.getHours()).padStart(2, "0");
      const mm = String(bedtime.getMinutes()).padStart(2, "0");
      const cat = cycles >= 5 ? "Optimal" : cycles === 4 ? "Okay" : "Short sleep";
      rows.push([`${cycles} cycles`, `${hh}:${mm}`, cat]);
    }
    return { rows };
  }, [wakeHour, wakeMin]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Wake Hour (24h)</Label><Input value={wakeHour} onChange={setWakeHour} /></div>
        <div><Label>Wake Minute</Label><Input value={wakeMin} onChange={setWakeMin} /></div>
      </Grid2>
      <BigResult value="90-min cycles" label="Sleep Cycle Planner" />
      <DataTable columns={["Cycles", "Suggested Bedtime", "Category"]} rows={out.rows} />
    </VStack>
  );
}

function BloodPressureCalc() {
  const [sys, setSys] = useState("118");
  const [dia, setDia] = useState("76");

  const out = useMemo(() => {
    const S = n(sys), D = n(dia);
    let cat = "Normal";
    if (S >= 180 || D >= 120) cat = "Hypertensive Crisis";
    else if (S >= 140 || D >= 90) cat = "High BP Stage 2";
    else if (S >= 130 || D >= 80) cat = "High BP Stage 1";
    else if (S >= 120 && D < 80) cat = "Elevated";
    const rows = [
      ["Systolic", `${S} mmHg`],
      ["Diastolic", `${D} mmHg`],
      ["Classification", cat],
    ];
    const chart = [
      ["Normal", "<120 and <80"],
      ["Elevated", "120-129 and <80"],
      ["High Stage 1", "130-139 or 80-89"],
      ["High Stage 2", "≥140 or ≥90"],
      ["Crisis", "≥180 and/or ≥120"],
    ];
    return { cat, rows, chart };
  }, [sys, dia]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Systolic (mmHg)</Label><Input value={sys} onChange={setSys} /></div>
        <div><Label>Diastolic (mmHg)</Label><Input value={dia} onChange={setDia} /></div>
      </Grid2>
      <Grid2>
        <BigResult value={`${n(sys)}/${n(dia)}`} label="Reading" />
        <BigResult value={out.cat} label="Classification" />
      </Grid2>
      <DataTable columns={["Metric", "Value"]} rows={out.rows} />
      <DataTable columns={["Category", "Range"]} rows={out.chart} />
      <Result>⚠️ Not medical advice. This classifies a single reading against standard (ACC/AHA) ranges and is for general information only. A diagnosis needs repeated readings and a clinician — consult a healthcare professional about your blood pressure.</Result>
    </VStack>
  );
}

function BloodSugarConverter() {
  const [mode, setMode] = useState("mg2mmol");
  const [value, setValue] = useState("95");
  const [context, setContext] = useState("fasting");

  const out = useMemo(() => {
    const v = n(value);
    const mmol = mode === "mg2mmol" ? v / 18 : v;
    const mg = mode === "mg2mmol" ? v : v * 18;

    let cat = "Normal";
    if (context === "fasting") {
      if (mg >= 126) cat = "Diabetes range";
      else if (mg >= 100) cat = "Prediabetes range";
      else cat = "Normal fasting";
    } else {
      if (mg >= 200) cat = "Diabetes range";
      else if (mg >= 140) cat = "Prediabetes range";
      else cat = "Normal post-meal";
    }

    const rows = [
      ["Input", mode === "mg2mmol" ? `${v} mg/dL` : `${v} mmol/L`],
      ["Converted mg/dL", round(mg, 2)],
      ["Converted mmol/L", round(mmol, 2)],
      ["Context", context === "fasting" ? "Fasting" : "Post-meal"],
      ["Classification", cat],
    ];
    return { mg, mmol, cat, rows };
  }, [mode, value, context]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Conversion</Label><SelectInput value={mode} onChange={setMode} options={[{ value: "mg2mmol", label: "mg/dL → mmol/L" }, { value: "mmol2mg", label: "mmol/L → mg/dL" }]} /></div>
        <div><Label>Value</Label><Input value={value} onChange={setValue} /></div>
        <div><Label>Context</Label><SelectInput value={context} onChange={setContext} options={[{ value: "fasting", label: "Fasting" }, { value: "post", label: "Post-meal" }]} /></div>
      </Grid3>
      <Grid2>
        <BigResult value={`${round(out.mg, 2)} mg/dL`} label="mg/dL" />
        <BigResult value={`${round(out.mmol, 2)} mmol/L`} label="mmol/L" />
      </Grid2>
      <DataTable columns={["Metric", "Value"]} rows={out.rows} />
      <Result>⚠️ Not medical advice. The mg/dL ↔ mmol/L conversion is exact, but the range labels are general (ADA) references, not a diagnosis. Discuss any blood-sugar concern with a healthcare professional.</Result>
    </VStack>
  );
}

function bmiCategory(bmi, standard) {
  if (!Number.isFinite(bmi) || bmi <= 0) return "—";
  if (standard === "asian") {
    // Asian-Indian cut-offs (lower thresholds for overweight/obese)
    if (bmi < 18.5) return "Underweight";
    if (bmi < 23) return "Normal";
    if (bmi < 25) return "Overweight";
    return "Obese";
  }
  // WHO standard
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

function BmiCalc() {
  const [unit, setUnit] = useState("metric");
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");

  const out = useMemo(() => {
    const w = n(weight), h = n(height);
    let bmi = 0;
    if (unit === "metric") {
      const m = h / 100;                    // cm → m
      bmi = m > 0 ? w / (m * m) : 0;        // kg / m²
    } else {
      bmi = h > 0 ? (703 * w) / (h * h) : 0; // 703 · lb / in²
    }
    const valid = w > 0 && h > 0 && Number.isFinite(bmi) && bmi > 0;
    return {
      valid,
      bmi,
      who: valid ? bmiCategory(bmi, "who") : "—",
      asian: valid ? bmiCategory(bmi, "asian") : "—",
    };
  }, [unit, weight, height]);

  const whoTable = [
    ["Underweight", "< 18.5"],
    ["Normal", "18.5 – 24.9"],
    ["Overweight", "25 – 29.9"],
    ["Obese", "≥ 30"],
  ];
  const asianTable = [
    ["Underweight", "< 18.5"],
    ["Normal", "18.5 – 22.9"],
    ["Overweight", "23 – 24.9"],
    ["Obese", "≥ 25"],
  ];

  return (
    <VStack>
      <Grid3>
        <div><Label>Units</Label><SelectInput value={unit} onChange={setUnit} options={[{ value: "metric", label: "Metric (kg, cm)" }, { value: "imperial", label: "Imperial (lb, in)" }]} /></div>
        <div><Label>{unit === "metric" ? "Weight (kg)" : "Weight (lb)"}</Label><Input value={weight} onChange={setWeight} /></div>
        <div><Label>{unit === "metric" ? "Height (cm)" : "Height (in)"}</Label><Input value={height} onChange={setHeight} /></div>
      </Grid3>
      <Grid3>
        <BigResult value={out.valid ? out.bmi.toFixed(1) : "—"} label="BMI" />
        <BigResult value={out.who} label="WHO Category" />
        <BigResult value={out.asian} label="Asian-Indian Category" />
      </Grid3>
      <Grid2>
        <DataTable columns={["WHO Standard", "BMI Range"]} rows={whoTable} />
        <DataTable columns={["Asian-Indian", "BMI Range"]} rows={asianTable} />
      </Grid2>
      <Result>⚠️ Not medical advice. BMI is a rough screening ratio and does not account for muscle mass, frame, age, sex or body composition. For an assessment of your weight and health, consult a qualified healthcare professional.</Result>
    </VStack>
  );
}

Object.assign(TOOL_COMPONENTS, {
  "tdee-calc": TdeeCalc,
  "bmi-calculator": BmiCalc,
  "macro-calc": MacroCalc,
  "protein-intake-calc": ProteinIntakeCalc,
  "heart-rate-zone-calc": HeartRateZoneCalc,
  "vo2max-calc": Vo2MaxCalc,
  "pace-calc": PaceCalc,
  "blood-alcohol-calc": BloodAlcoholCalc,
  "sleep-calc": SleepCalc,
  "blood-pressure-calc": BloodPressureCalc,
  "blood-sugar-converter": BloodSugarConverter,
});
function gcd2(a, b) {
  a = Math.abs(Math.floor(a)); b = Math.abs(Math.floor(b));
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function AspectRatioCalc() {
  const [w, setW] = useState("1920");
  const [h, setH] = useState("1080");
  const [newW, setNewW] = useState("1280");
  const [newH, setNewH] = useState("720");
  const [mode, setMode] = useState("fromWidth");

  const out = useMemo(() => {
    const W = n(w), H = n(h);
    const g = gcd2(W, H);
    const rw = Math.round(W / g), rh = Math.round(H / g);

    let eqW = n(newW), eqH = n(newH);
    if (mode === "fromWidth") eqH = eqW * (H / (W || 1));
    if (mode === "fromHeight") eqW = eqH * (W / (H || 1));

    const rows = [
      ["Original", `${W} × ${H}`],
      ["Simplified Ratio", `${rw}:${rh}`],
      ["Equivalent", `${round(eqW, 2)} × ${round(eqH, 2)}`],
      ["Category", `${rw === 16 && rh === 9 ? "Widescreen 16:9" : rw === 4 && rh === 3 ? "Standard 4:3" : "Custom"}`],
    ];
    return { rw, rh, eqW, eqH, rows };
  }, [w, h, newW, newH, mode]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Width</Label><Input value={w} onChange={setW} /></div>
        <div><Label>Height</Label><Input value={h} onChange={setH} /></div>
      </Grid2>
      <Grid3>
        <div><Label>Mode</Label><SelectInput value={mode} onChange={setMode} options={[{ value: "fromWidth", label: "Find Height from Width" }, { value: "fromHeight", label: "Find Width from Height" }]} /></div>
        <div><Label>New Width</Label><Input value={newW} onChange={setNewW} /></div>
        <div><Label>New Height</Label><Input value={newH} onChange={setNewH} /></div>
      </Grid3>
      <Grid2>
        <BigResult value={`${out.rw}:${out.rh}`} label="Aspect Ratio" />
        <BigResult value={`${round(out.eqW, 2)} × ${round(out.eqH, 2)}`} label="Equivalent Size" />
      </Grid2>
      <DataTable columns={["Metric", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function PpiDpiCalc() {
  const [pxW, setPxW] = useState("1920");
  const [pxH, setPxH] = useState("1080");
  const [diag, setDiag] = useState("24");

  const out = useMemo(() => {
    const w = n(pxW), h = n(pxH), d = n(diag);
    const ppi = d > 0 ? Math.sqrt(w * w + h * h) / d : 0;
    let cat = "Standard";
    if (ppi >= 300) cat = "Print/Retina grade";
    else if (ppi >= 200) cat = "High density";
    else if (ppi >= 120) cat = "Good desktop";
    const rows = [
      ["Resolution", `${w} × ${h}`],
      ["Diagonal", `${d} in`],
      ["PPI / DPI", round(ppi, 2)],
      ["Classification", cat],
    ];
    return { ppi, cat, rows };
  }, [pxW, pxH, diag]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Pixels Width</Label><Input value={pxW} onChange={setPxW} /></div>
        <div><Label>Pixels Height</Label><Input value={pxH} onChange={setPxH} /></div>
        <div><Label>Screen Size (in)</Label><Input value={diag} onChange={setDiag} /></div>
      </Grid3>
      <Grid2>
        <BigResult value={round(out.ppi, 2)} label="PPI / DPI" />
        <BigResult value={out.cat} label="Classification" />
      </Grid2>
      <DataTable columns={["Metric", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function FuelCostCalc() {
  const [distance, setDistance] = useState("350");
  const [mileage, setMileage] = useState("15");
  const [price, setPrice] = useState("1.4");

  const out = useMemo(() => {
    const d = n(distance), m = n(mileage), p = n(price);
    const fuel = m > 0 ? d / m : 0;
    const cost = fuel * p;
    const rows = [
      ["Distance", `${d} km`],
      ["Mileage", `${m} km/L`],
      ["Fuel Needed", `${round(fuel, 2)} L`],
      ["Fuel Price", curr(p)],
      ["Trip Cost", curr(cost)],
      ["Category", cost > 100 ? "Higher trip cost" : "Moderate trip cost"],
    ];
    return { fuel, cost, rows };
  }, [distance, mileage, price]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Distance (km)</Label><Input value={distance} onChange={setDistance} /></div>
        <div><Label>Mileage (km/L)</Label><Input value={mileage} onChange={setMileage} /></div>
        <div><Label>Fuel Price / L</Label><Input value={price} onChange={setPrice} /></div>
      </Grid3>
      <Grid2>
        <BigResult value={`${round(out.fuel, 2)} L`} label="Fuel Needed" />
        <BigResult value={curr(out.cost)} label="Estimated Cost" />
      </Grid2>
      <DataTable columns={["Metric", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function ElectricityCostCalc() {
  const [watt, setWatt] = useState("1000");
  const [hours, setHours] = useState("5");
  const [days, setDays] = useState("30");
  const [tariff, setTariff] = useState("0.15");

  const out = useMemo(() => {
    const W = n(watt), h = n(hours), d = n(days), t = n(tariff);
    const kWhDay = (W / 1000) * h;
    const kWhMonth = kWhDay * d;
    const bill = kWhMonth * t;
    const rows = [
      ["Power", `${W} W`],
      ["Usage", `${h} h/day`],
      ["Monthly Consumption", `${round(kWhMonth, 2)} kWh`],
      ["Tariff", curr(t) + " /kWh"],
      ["Estimated Bill", curr(bill)],
      ["Category", bill > 100 ? "High consumption" : "Normal consumption"],
    ];
    return { kWhMonth, bill, rows };
  }, [watt, hours, days, tariff]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Appliance Wattage</Label><Input value={watt} onChange={setWatt} /></div>
        <div><Label>Hours / Day</Label><Input value={hours} onChange={setHours} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Days / Month</Label><Input value={days} onChange={setDays} /></div>
        <div><Label>Tariff per kWh</Label><Input value={tariff} onChange={setTariff} /></div>
      </Grid2>
      <Grid2>
        <BigResult value={`${round(out.kWhMonth, 2)} kWh`} label="Monthly Units" />
        <BigResult value={curr(out.bill)} label="Estimated Bill" />
      </Grid2>
      <DataTable columns={["Metric", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function OhmsLawCalc() {
  const [mode, setMode] = useState("V");
  const [V, setV] = useState("12");
  const [I, setI] = useState("2");
  const [R, setR] = useState("6");
  const [P, setP] = useState("24");

  const out = useMemo(() => {
    let v = n(V), i = n(I), r = n(R), p = n(P);
    if (mode === "V") v = i * r;
    if (mode === "I") i = r !== 0 ? v / r : 0;
    if (mode === "R") r = i !== 0 ? v / i : 0;
    if (mode === "P") p = v * i;
    const cat = p > 100 ? "Higher power load" : "Safe/low power load";
    const rows = [
      ["Voltage (V)", round(v, 4)],
      ["Current (A)", round(i, 4)],
      ["Resistance (Ω)", round(r, 4)],
      ["Power (W)", round(p, 4)],
      ["Classification", cat],
    ];
    return { v, i, r, p, cat, rows };
  }, [mode, V, I, R, P]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Solve For</Label><SelectInput value={mode} onChange={setMode} options={[{ value: "V", label: "Voltage (V)" }, { value: "I", label: "Current (I)" }, { value: "R", label: "Resistance (R)" }, { value: "P", label: "Power (P)" }]} /></div>
        <div><Label>Voltage (V)</Label><Input value={V} onChange={setV} /></div>
        <div><Label>Current (A)</Label><Input value={I} onChange={setI} /></div>
      </Grid3>
      <Grid2>
        <div><Label>Resistance (Ω)</Label><Input value={R} onChange={setR} /></div>
        <div><Label>Power (W)</Label><Input value={P} onChange={setP} /></div>
      </Grid2>
      <Grid2>
        <BigResult value={round(out.v, 4)} label="Voltage (V)" />
        <BigResult value={round(out.p, 4)} label="Power (W)" />
      </Grid2>
      <DataTable columns={["Metric", "Value"]} rows={out.rows} />
    </VStack>
  );
}

Object.assign(TOOL_COMPONENTS, {
  "aspect-ratio-calc": AspectRatioCalc,
  "ppi-dpi-calc": PpiDpiCalc,
  "fuel-cost-calc": FuelCostCalc,
  "electricity-cost-calc": ElectricityCostCalc,
  "ohms-law-calc": OhmsLawCalc,
});

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
          { "@type": "ListItem", "position": 2, "name": "Finance & Health Calculators", "item": "https://toolsrift.com/financecalc" },
          { "@type": "ListItem", "position": 3, "name": tool?.name || tool?.id || "" }
        ]
      }) }} />
    </>
  );
}

// ───── INDIA FINANCE BATCH (July 2026) — 15 calculators ─────────────────────

function EmiCalc() {
  const [amount, setAmount] = useState("1000000");
  const [rate, setRate] = useState("9");
  const [years, setYears] = useState("10");
  const out = useMemo(() => {
    const P = n(amount), r = n(rate) / 100 / 12, m = Math.max(1, Math.round(n(years) * 12));
    const emi = r > 0 ? (P * r * Math.pow(1 + r, m)) / (Math.pow(1 + r, m) - 1) : P / m;
    const total = emi * m, interest = total - P;
    let bal = P; const rows = [];
    for (let i = 1; i <= m; i++) {
      const intr = bal * r, princ = emi - intr; bal = Math.max(0, bal - princ);
      if (i % 12 === 0 || i === m) rows.push([Math.ceil(i / 12), inr(emi * Math.min(12, i - (Math.ceil(i / 12) - 1) * 12) || emi * 12), inr(bal)]);
    }
    return { emi, total, interest, rows };
  }, [amount, rate, years]);
  return (
    <VStack>
      <Grid3>
        <div><Label>Loan Amount (₹)</Label><Input value={amount} onChange={setAmount} /></div>
        <div><Label>Interest Rate % (p.a.)</Label><Input value={rate} onChange={setRate} /></div>
        <div><Label>Tenure (Years)</Label><Input value={years} onChange={setYears} /></div>
      </Grid3>
      <Grid3>
        <BigResult value={inr(out.emi)} label="Monthly EMI" />
        <BigResult value={inr(out.interest)} label="Total Interest" />
        <BigResult value={inr(out.total)} label="Total Payment" />
      </Grid3>
      <DataTable columns={["Year", "Paid in Year", "Balance Left"]} rows={out.rows} />
    </VStack>
  );
}

function HomeLoanEmiCalc() {
  const [amount, setAmount] = useState("5000000");
  const [rate, setRate] = useState("8.5");
  const [years, setYears] = useState("20");
  const out = useMemo(() => {
    const P = n(amount), r = n(rate) / 100 / 12, m = Math.max(1, Math.round(n(years) * 12));
    const emi = r > 0 ? (P * r * Math.pow(1 + r, m)) / (Math.pow(1 + r, m) - 1) : P / m;
    const total = emi * m, interest = total - P;
    let bal = P; const rows = []; let princYr = 0, intrYr = 0;
    for (let i = 1; i <= m; i++) {
      const intr = bal * r, princ = emi - intr; bal = Math.max(0, bal - princ);
      princYr += princ; intrYr += intr;
      if (i % 12 === 0 || i === m) { rows.push([Math.ceil(i / 12), inr(princYr), inr(intrYr), inr(bal)]); princYr = 0; intrYr = 0; }
    }
    return { emi, total, interest, rows };
  }, [amount, rate, years]);
  return (
    <VStack>
      <Grid3>
        <div><Label>Home Loan Amount (₹)</Label><Input value={amount} onChange={setAmount} /></div>
        <div><Label>Interest Rate % (p.a.)</Label><Input value={rate} onChange={setRate} /></div>
        <div><Label>Tenure (Years)</Label><Input value={years} onChange={setYears} /></div>
      </Grid3>
      <Grid3>
        <BigResult value={inr(out.emi)} label="Monthly EMI" />
        <BigResult value={inr(out.interest)} label="Total Interest" />
        <BigResult value={inr(out.total)} label="Total Payment" />
      </Grid3>
      <DataTable columns={["Year", "Principal Paid", "Interest Paid", "Balance"]} rows={out.rows} />
    </VStack>
  );
}

function SipCalc() {
  const [monthly, setMonthly] = useState("10000");
  const [rate, setRate] = useState("12");
  const [years, setYears] = useState("15");
  const out = useMemo(() => {
    const P = n(monthly), i = n(rate) / 100 / 12, m = Math.max(1, Math.round(n(years) * 12));
    const fv = i > 0 ? P * ((Math.pow(1 + i, m) - 1) / i) * (1 + i) : P * m;
    const invested = P * m, gain = fv - invested;
    let bal = 0; const rows = [];
    for (let k = 1; k <= m; k++) { bal = (bal + P) * (1 + i); if (k % 12 === 0 || k === m) rows.push([Math.ceil(k / 12), inr(P * k), inr(bal - P * k), inr(bal)]); }
    return { fv, invested, gain, rows };
  }, [monthly, rate, years]);
  return (
    <VStack>
      <Grid3>
        <div><Label>Monthly SIP (₹)</Label><Input value={monthly} onChange={setMonthly} /></div>
        <div><Label>Expected Return % (p.a.)</Label><Input value={rate} onChange={setRate} /></div>
        <div><Label>Duration (Years)</Label><Input value={years} onChange={setYears} /></div>
      </Grid3>
      <Grid3>
        <BigResult value={inr(out.fv)} label="Maturity Value" />
        <BigResult value={inr(out.invested)} label="Total Invested" />
        <BigResult value={inr(out.gain)} label="Wealth Gained" />
      </Grid3>
      <DataTable columns={["Year", "Invested", "Returns", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function StepUpSipCalc() {
  const [monthly, setMonthly] = useState("10000");
  const [stepUp, setStepUp] = useState("10");
  const [rate, setRate] = useState("12");
  const [years, setYears] = useState("15");
  const out = useMemo(() => {
    const i = n(rate) / 100 / 12, yrs = Math.max(1, Math.round(n(years))), s = n(stepUp) / 100;
    let bal = 0, invested = 0, sip = n(monthly); const rows = [];
    for (let y = 1; y <= yrs; y++) {
      for (let mo = 0; mo < 12; mo++) { bal = (bal + sip) * (1 + i); invested += sip; }
      rows.push([y, inr(sip), inr(invested), inr(bal)]);
      sip = sip * (1 + s);
    }
    return { fv: bal, invested, gain: bal - invested, rows };
  }, [monthly, stepUp, rate, years]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Starting Monthly SIP (₹)</Label><Input value={monthly} onChange={setMonthly} /></div>
        <div><Label>Annual Step-up %</Label><Input value={stepUp} onChange={setStepUp} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Expected Return % (p.a.)</Label><Input value={rate} onChange={setRate} /></div>
        <div><Label>Duration (Years)</Label><Input value={years} onChange={setYears} /></div>
      </Grid2>
      <Grid3>
        <BigResult value={inr(out.fv)} label="Maturity Value" />
        <BigResult value={inr(out.invested)} label="Total Invested" />
        <BigResult value={inr(out.gain)} label="Wealth Gained" />
      </Grid3>
      <DataTable columns={["Year", "Monthly SIP", "Total Invested", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function LumpsumCalc() {
  const [amount, setAmount] = useState("100000");
  const [rate, setRate] = useState("12");
  const [years, setYears] = useState("10");
  const out = useMemo(() => {
    const P = n(amount), r = n(rate) / 100, t = Math.max(1, n(years));
    const fv = P * Math.pow(1 + r, t);
    const rows = []; let bal = P;
    for (let y = 1; y <= Math.floor(t); y++) { bal = bal * (1 + r); rows.push([y, inr(bal - P), inr(bal)]); }
    return { fv, gain: fv - P, mult: P > 0 ? fv / P : 0, rows };
  }, [amount, rate, years]);
  return (
    <VStack>
      <Grid3>
        <div><Label>Investment (₹)</Label><Input value={amount} onChange={setAmount} /></div>
        <div><Label>Expected Return % (p.a.)</Label><Input value={rate} onChange={setRate} /></div>
        <div><Label>Duration (Years)</Label><Input value={years} onChange={setYears} /></div>
      </Grid3>
      <Grid3>
        <BigResult value={inr(out.fv)} label="Maturity Value" />
        <BigResult value={inr(out.gain)} label="Total Gain" />
        <BigResult value={`${round(out.mult, 2)}×`} label="Money Multiplied" />
      </Grid3>
      <DataTable columns={["Year", "Gain", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function SwpCalc() {
  const [corpus, setCorpus] = useState("5000000");
  const [withdraw, setWithdraw] = useState("30000");
  const [rate, setRate] = useState("8");
  const [years, setYears] = useState("20");
  const out = useMemo(() => {
    const i = n(rate) / 100 / 12, m = Math.max(1, Math.round(n(years) * 12)), W = n(withdraw);
    let bal = n(corpus), totalW = 0, exhausted = 0; const rows = [];
    for (let k = 1; k <= m; k++) {
      bal = bal * (1 + i) - W; totalW += W;
      if (bal <= 0 && !exhausted) { exhausted = k; bal = 0; }
      if (k % 12 === 0 || k === m) rows.push([Math.ceil(k / 12), inr(W * 12), inr(bal)]);
      if (exhausted) break;
    }
    return { bal, totalW, exhausted, rows };
  }, [corpus, withdraw, rate, years]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Total Corpus (₹)</Label><Input value={corpus} onChange={setCorpus} /></div>
        <div><Label>Monthly Withdrawal (₹)</Label><Input value={withdraw} onChange={setWithdraw} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Expected Return % (p.a.)</Label><Input value={rate} onChange={setRate} /></div>
        <div><Label>Duration (Years)</Label><Input value={years} onChange={setYears} /></div>
      </Grid2>
      <Grid3>
        <BigResult value={inr(out.bal)} label="Balance at End" />
        <BigResult value={inr(out.totalW)} label="Total Withdrawn" />
        <BigResult value={out.exhausted ? `${Math.ceil(out.exhausted / 12)} yrs` : "Lasts full term"} label={out.exhausted ? "Corpus Lasts" : "Corpus Status"} />
      </Grid3>
      <DataTable columns={["Year", "Withdrawn", "Balance"]} rows={out.rows} />
    </VStack>
  );
}

function GstCalc() {
  const [amount, setAmount] = useState("10000");
  const [rate, setRate] = useState("18");
  const [mode, setMode] = useState("add");
  const out = useMemo(() => {
    const A = n(amount), r = n(rate) / 100;
    if (mode === "add") {
      const gst = A * r, total = A + gst;
      return { base: A, gst, total, cgst: gst / 2, sgst: gst / 2 };
    }
    const base = A / (1 + r), gst = A - base;
    return { base, gst, total: A, cgst: gst / 2, sgst: gst / 2 };
  }, [amount, rate, mode]);
  return (
    <VStack>
      <Grid3>
        <div><Label>Amount (₹)</Label><Input value={amount} onChange={setAmount} /></div>
        <div><Label>GST Rate</Label><SelectInput value={rate} onChange={setRate} options={[["0.25","0.25%"],["3","3%"],["5","5%"],["12","12%"],["18","18%"],["28","28%"]]} /></div>
        <div><Label>Mode</Label><SelectInput value={mode} onChange={setMode} options={[["add","Add GST (exclusive)"],["remove","Remove GST (inclusive)"]]} /></div>
      </Grid3>
      <Grid3>
        <BigResult value={inr(out.base)} label="Base Amount" />
        <BigResult value={inr(out.gst)} label={`GST (${rate}%)`} sub={`CGST ${inr(out.cgst)} + SGST ${inr(out.sgst)}`} />
        <BigResult value={inr(out.total)} label="Total Amount" />
      </Grid3>
      <Result>For intra-state supply GST splits equally into CGST and SGST. For inter-state supply the full amount is charged as IGST.</Result>
    </VStack>
  );
}

function FdCalc() {
  const [amount, setAmount] = useState("100000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("5");
  const out = useMemo(() => {
    const P = n(amount), r = n(rate) / 100, t = Math.max(0.25, n(years));
    const maturity = P * Math.pow(1 + r / 4, 4 * t); // quarterly compounding (standard for Indian banks)
    const rows = []; let prev = P;
    for (let y = 1; y <= Math.floor(t); y++) {
      const val = P * Math.pow(1 + r / 4, 4 * y);
      rows.push([y, inr(val - prev), inr(val)]); prev = val;
    }
    return { maturity, interest: maturity - P, rows };
  }, [amount, rate, years]);
  return (
    <VStack>
      <Grid3>
        <div><Label>Deposit Amount (₹)</Label><Input value={amount} onChange={setAmount} /></div>
        <div><Label>Interest Rate % (p.a.)</Label><Input value={rate} onChange={setRate} /></div>
        <div><Label>Tenure (Years)</Label><Input value={years} onChange={setYears} /></div>
      </Grid3>
      <Grid2>
        <BigResult value={inr(out.maturity)} label="Maturity Amount" />
        <BigResult value={inr(out.interest)} label="Interest Earned" />
      </Grid2>
      <Result>Calculated with quarterly compounding, the standard used by Indian banks for cumulative fixed deposits.</Result>
      <DataTable columns={["Year", "Interest in Year", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function HraCalc() {
  const [basic, setBasic] = useState("50000");
  const [hra, setHra] = useState("20000");
  const [rent, setRent] = useState("18000");
  const [metro, setMetro] = useState("yes");
  const out = useMemo(() => {
    const B = n(basic), H = n(hra), R = n(rent);
    const a = H;
    const b = Math.max(0, R - 0.1 * B);
    const c = (metro === "yes" ? 0.5 : 0.4) * B;
    const exempt = Math.max(0, Math.min(a, b, c));
    return { a, b, c, exempt, taxable: Math.max(0, H - exempt) };
  }, [basic, hra, rent, metro]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Basic Salary + DA (₹/month)</Label><Input value={basic} onChange={setBasic} /></div>
        <div><Label>HRA Received (₹/month)</Label><Input value={hra} onChange={setHra} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Rent Paid (₹/month)</Label><Input value={rent} onChange={setRent} /></div>
        <div><Label>Metro City? (Delhi/Mumbai/Kolkata/Chennai)</Label><SelectInput value={metro} onChange={setMetro} options={[["yes","Yes — Metro (50%)"],["no","No — Non-metro (40%)"]]} /></div>
      </Grid2>
      <Grid2>
        <BigResult value={inr(out.exempt)} label="HRA Exempt (monthly)" sub={`${inr(out.exempt * 12)} per year`} />
        <BigResult value={inr(out.taxable)} label="Taxable HRA (monthly)" />
      </Grid2>
      <DataTable columns={["Rule", "Amount (monthly)"]} rows={[
        ["Actual HRA received", inr(out.a)],
        ["Rent paid − 10% of Basic+DA", inr(out.b)],
        [metro === "yes" ? "50% of Basic+DA (metro)" : "40% of Basic+DA (non-metro)", inr(out.c)],
        ["Exemption = LOWEST of the three", inr(out.exempt)],
      ]} />
      <Result>Note: HRA exemption is available only under the old tax regime.</Result>
    </VStack>
  );
}

// New-regime income tax (FY 2025-26) helper — used by CTC calculator
function newRegimeTax(gross) {
  const taxable = Math.max(0, gross - 75000); // standard deduction
  if (taxable <= 1200000) return 0; // Section 87A rebate
  const slabs = [[400000, 0], [400000, 0.05], [400000, 0.10], [400000, 0.15], [400000, 0.20], [400000, 0.25], [Infinity, 0.30]];
  let rem = taxable, tax = 0;
  for (const [width, r] of slabs) {
    const amt = Math.min(rem, width);
    tax += amt * r; rem -= amt;
    if (rem <= 0) break;
  }
  return tax * 1.04; // 4% health & education cess
}

function CtcToInhandCalc() {
  const [ctc, setCtc] = useState("1200000");
  const [basicPct, setBasicPct] = useState("40");
  const out = useMemo(() => {
    const C_ = n(ctc), basic = C_ * n(basicPct) / 100;
    const employerPf = 0.12 * basic;          // employer PF (inside CTC)
    const gross = Math.max(0, C_ - employerPf);
    const employeePf = 0.12 * basic;          // employee PF deduction
    const profTax = 2400;                     // typical professional tax per year
    const tax = newRegimeTax(gross);
    const annualInhand = Math.max(0, gross - employeePf - profTax - tax);
    return { gross, employerPf, employeePf, profTax, tax, annualInhand, monthly: annualInhand / 12 };
  }, [ctc, basicPct]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Annual CTC (₹)</Label><Input value={ctc} onChange={setCtc} /></div>
        <div><Label>Basic Salary (% of CTC)</Label><SelectInput value={basicPct} onChange={setBasicPct} options={[["40","40% (common)"],["50","50%"],["35","35%"]]} /></div>
      </Grid2>
      <Grid2>
        <BigResult value={inr(out.monthly)} label="Monthly In-Hand (approx)" />
        <BigResult value={inr(out.annualInhand)} label="Annual In-Hand (approx)" />
      </Grid2>
      <DataTable columns={["Component", "Amount (yearly)"]} rows={[
        ["CTC", inr(n(ctc))],
        ["Less: Employer PF (12% of basic)", `− ${inr(out.employerPf)}`],
        ["Gross Salary", inr(out.gross)],
        ["Less: Employee PF (12% of basic)", `− ${inr(out.employeePf)}`],
        ["Less: Professional Tax", `− ${inr(out.profTax)}`],
        ["Less: Income Tax (new regime, FY 2025-26)", `− ${inr(out.tax)}`],
        ["In-Hand Salary", inr(out.annualInhand)],
      ]} />
      <Result>Estimate under the new tax regime (FY 2025-26) with ₹75,000 standard deduction, Section 87A rebate up to ₹12 lakh taxable income, and 4% cess. Actual in-hand varies with your company's salary structure, gratuity, insurance and other deductions.</Result>
    </VStack>
  );
}

function NpsCalc() {
  const [age, setAge] = useState("30");
  const [monthly, setMonthly] = useState("5000");
  const [rate, setRate] = useState("10");
  const [annuityPct, setAnnuityPct] = useState("40");
  const [annuityRate, setAnnuityRate] = useState("6");
  const out = useMemo(() => {
    const yrs = Math.max(1, 60 - Math.min(59, Math.max(18, Math.round(n(age)))));
    const i = n(rate) / 100 / 12, m = yrs * 12, P = n(monthly);
    const corpus = i > 0 ? P * ((Math.pow(1 + i, m) - 1) / i) * (1 + i) : P * m;
    const invested = P * m;
    const annuityCorpus = corpus * Math.min(100, Math.max(40, n(annuityPct))) / 100;
    const lumpsum = corpus - annuityCorpus;
    const pension = annuityCorpus * (n(annuityRate) / 100) / 12;
    return { yrs, corpus, invested, annuityCorpus, lumpsum, pension };
  }, [age, monthly, rate, annuityPct, annuityRate]);
  return (
    <VStack>
      <Grid3>
        <div><Label>Your Current Age</Label><Input value={age} onChange={setAge} /></div>
        <div><Label>Monthly Contribution (₹)</Label><Input value={monthly} onChange={setMonthly} /></div>
        <div><Label>Expected Return % (p.a.)</Label><Input value={rate} onChange={setRate} /></div>
      </Grid3>
      <Grid2>
        <div><Label>Annuity Purchase % (min 40%)</Label><Input value={annuityPct} onChange={setAnnuityPct} /></div>
        <div><Label>Annuity Rate % (p.a.)</Label><Input value={annuityRate} onChange={setAnnuityRate} /></div>
      </Grid2>
      <Grid3>
        <BigResult value={inr(out.corpus)} label={`Corpus at 60 (${out.yrs} yrs)`} />
        <BigResult value={inr(out.lumpsum)} label="Tax-free Lumpsum" />
        <BigResult value={inr(out.pension)} label="Monthly Pension (approx)" />
      </Grid3>
      <Result>At retirement, minimum 40% of the NPS corpus must be used to buy an annuity that pays monthly pension; the rest can be withdrawn as lumpsum. Total invested: {inr(out.invested)}.</Result>
    </VStack>
  );
}

function SsyCalc() {
  const [yearly, setYearly] = useState("100000");
  const [rate, setRate] = useState("8.2");
  const out = useMemo(() => {
    const D = Math.min(150000, Math.max(250, n(yearly))), r = n(rate) / 100;
    let bal = 0; const rows = [];
    for (let y = 1; y <= 21; y++) {
      const dep = y <= 15 ? D : 0;
      bal = (bal + dep) * (1 + r);
      if (y % 3 === 0 || y === 21 || y === 15) rows.push([y, dep ? inr(dep) : "—", inr(bal)]);
    }
    const invested = D * 15;
    return { maturity: bal, invested, interest: bal - invested, capped: n(yearly) > 150000 };
  }, [yearly, rate]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Yearly Deposit (₹, max 1.5 lakh)</Label><Input value={yearly} onChange={setYearly} /></div>
        <div><Label>Interest Rate % (p.a.)</Label><Input value={rate} onChange={setRate} /></div>
      </Grid2>
      <Grid3>
        <BigResult value={inr(out.maturity)} label="Maturity Value (21 yrs)" />
        <BigResult value={inr(out.invested)} label="Total Deposited (15 yrs)" />
        <BigResult value={inr(out.interest)} label="Interest Earned" />
      </Grid3>
      <Result>Sukanya Samriddhi Yojana: deposits are made for 15 years; the account matures 21 years after opening. Deposits qualify for Section 80C and maturity is tax-free (EEE).{out.capped ? " Deposit capped at ₹1,50,000 — the yearly maximum." : ""}</Result>
    </VStack>
  );
}

function InflationCalc() {
  const [amount, setAmount] = useState("100000");
  const [rate, setRate] = useState("6");
  const [years, setYears] = useState("10");
  const out = useMemo(() => {
    const P = n(amount), r = n(rate) / 100, t = Math.max(1, n(years));
    const future = P * Math.pow(1 + r, t);        // future cost of same item
    const eroded = P / Math.pow(1 + r, t);        // value of today's money later
    return { future, eroded, lossPct: (1 - eroded / P) * 100 };
  }, [amount, rate, years]);
  return (
    <VStack>
      <Grid3>
        <div><Label>Amount Today (₹)</Label><Input value={amount} onChange={setAmount} /></div>
        <div><Label>Inflation Rate % (p.a.)</Label><Input value={rate} onChange={setRate} /></div>
        <div><Label>Years</Label><Input value={years} onChange={setYears} /></div>
      </Grid3>
      <Grid3>
        <BigResult value={inr(out.future)} label={`Future Cost after ${years} yrs`} />
        <BigResult value={inr(out.eroded)} label="What Today's Money Will Be Worth" />
        <BigResult value={pct(out.lossPct)} label="Purchasing Power Lost" />
      </Grid3>
      <Result>Something costing {inr(n(amount))} today will cost {inr(out.future)} in {years} years at {rate}% inflation — and {inr(n(amount))} kept as cash will only buy {inr(out.eroded)} worth of goods.</Result>
    </VStack>
  );
}

function SimpleVsCompoundCalc() {
  const [amount, setAmount] = useState("100000");
  const [rate, setRate] = useState("8");
  const [years, setYears] = useState("10");
  const out = useMemo(() => {
    const P = n(amount), r = n(rate) / 100, t = Math.max(1, n(years));
    const si = P * r * t;
    const ci = P * Math.pow(1 + r, t) - P;
    const rows = [];
    for (let y = 1; y <= Math.floor(t); y++) rows.push([y, inr(P + P * r * y), inr(P * Math.pow(1 + r, y)), inr(P * Math.pow(1 + r, y) - (P + P * r * y))]);
    return { si, ci, diff: ci - si, rows };
  }, [amount, rate, years]);
  return (
    <VStack>
      <Grid3>
        <div><Label>Principal (₹)</Label><Input value={amount} onChange={setAmount} /></div>
        <div><Label>Interest Rate % (p.a.)</Label><Input value={rate} onChange={setRate} /></div>
        <div><Label>Years</Label><Input value={years} onChange={setYears} /></div>
      </Grid3>
      <Grid3>
        <BigResult value={inr(out.si)} label="Simple Interest" />
        <BigResult value={inr(out.ci)} label="Compound Interest" />
        <BigResult value={inr(out.diff)} label="Compounding Advantage" />
      </Grid3>
      <DataTable columns={["Year", "With Simple Interest", "With Compound Interest", "Difference"]} rows={out.rows} />
    </VStack>
  );
}

function LoanPrepaymentCalc() {
  const [amount, setAmount] = useState("3000000");
  const [rate, setRate] = useState("8.5");
  const [years, setYears] = useState("20");
  const [extra, setExtra] = useState("5000");
  const out = useMemo(() => {
    const P = n(amount), r = n(rate) / 100 / 12, m = Math.max(1, Math.round(n(years) * 12)), X = n(extra);
    const emi = r > 0 ? (P * r * Math.pow(1 + r, m)) / (Math.pow(1 + r, m) - 1) : P / m;
    // without prepayment
    const totalNormal = emi * m, interestNormal = totalNormal - P;
    // with extra monthly payment
    let bal = P, months = 0, interestExtra = 0;
    while (bal > 0 && months < m * 2) {
      const intr = bal * r; interestExtra += intr;
      bal = bal + intr - (emi + X); months++;
    }
    return {
      emi, interestNormal, interestExtra,
      saved: Math.max(0, interestNormal - interestExtra),
      monthsSaved: Math.max(0, m - months), months,
    };
  }, [amount, rate, years, extra]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Loan Amount (₹)</Label><Input value={amount} onChange={setAmount} /></div>
        <div><Label>Interest Rate % (p.a.)</Label><Input value={rate} onChange={setRate} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Tenure (Years)</Label><Input value={years} onChange={setYears} /></div>
        <div><Label>Extra Payment per Month (₹)</Label><Input value={extra} onChange={setExtra} /></div>
      </Grid2>
      <Grid3>
        <BigResult value={inr(out.saved)} label="Interest Saved" />
        <BigResult value={`${Math.floor(out.monthsSaved / 12)}y ${out.monthsSaved % 12}m`} label="Loan Ends Earlier By" />
        <BigResult value={inr(out.emi)} label="Regular EMI" />
      </Grid3>
      <Result>By paying an extra {inr(n(extra))} every month, you finish the loan in {Math.floor(out.months / 12)} years {out.months % 12} months instead of {years} years, and save {inr(out.saved)} in interest.</Result>
    </VStack>
  );
}

Object.assign(TOOL_COMPONENTS, {
  "emi-calc": EmiCalc,
  "home-loan-emi-calc": HomeLoanEmiCalc,
  "sip-calc": SipCalc,
  "step-up-sip-calc": StepUpSipCalc,
  "lumpsum-calc": LumpsumCalc,
  "swp-calc": SwpCalc,
  "gst-calc": GstCalc,
  "fd-calc": FdCalc,
  "hra-calc": HraCalc,
  "ctc-to-inhand-calc": CtcToInhandCalc,
  "nps-calc": NpsCalc,
  "ssy-calc": SsyCalc,
  "inflation-calc": InflationCalc,
  "simple-vs-compound-calc": SimpleVsCompoundCalc,
  "loan-prepayment-calc": LoanPrepaymentCalc,
});
// ───── END INDIA FINANCE BATCH ───────────────────────────────────────────────

// ───── INVESTMENT & BUSINESS FINANCE BATCH (W3) — 12 calculators ─────────────

// Parse a comma/newline separated list of numbers, keeping zeros and negatives.
function parseNums(s) {
  return String(s).split(/[,\n]+/).map((x) => x.trim()).filter((x) => x !== "").map((x) => parseFloat(x)).filter((x) => Number.isFinite(x));
}

function RuleOf72Calc() {
  const [rate, setRate] = useState("8");

  const out = useMemo(() => {
    const r = n(rate);
    const approx = r > 0 ? 72 / r : Infinity;
    const exact = r > 0 ? Math.log(2) / Math.log(1 + r / 100) : Infinity;
    const triple = r > 0 ? Math.log(3) / Math.log(1 + r / 100) : Infinity;
    const rows = [
      ["Interest Rate", pct(r)],
      ["Rule of 72 (approx.)", Number.isFinite(approx) ? `${round(approx, 2)} years` : "—"],
      ["Exact Doubling Time", Number.isFinite(exact) ? `${round(exact, 2)} years` : "—"],
      ["Time to Triple", Number.isFinite(triple) ? `${round(triple, 2)} years` : "—"],
    ];
    return { approx, exact, rows };
  }, [rate]);

  return (
    <VStack>
      <div><Label>Annual Interest Rate %</Label><Input value={rate} onChange={setRate} /></div>
      <Grid2>
        <BigResult value={Number.isFinite(out.approx) ? `${round(out.approx, 2)} yr` : "—"} label="Doubling Time (Rule of 72)" />
        <BigResult value={Number.isFinite(out.exact) ? `${round(out.exact, 2)} yr` : "—"} label="Exact Doubling Time" />
      </Grid2>
      <DataTable columns={["Metric", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function NpvCalc() {
  const [rate, setRate] = useState("10");
  const [flows, setFlows] = useState("-1000, 500, 500, 500");

  const out = useMemo(() => {
    const r = n(rate) / 100;
    const cfs = parseNums(flows);
    let npv = 0;
    const rows = [];
    cfs.forEach((cf, t) => {
      const pv = cf / Math.pow(1 + r, t);
      npv += pv;
      rows.push([t, curr(cf), round(1 / Math.pow(1 + r, t), 6), curr(pv)]);
    });
    const sumIn = cfs.slice(1).reduce((s, x) => s + x, 0);
    return { npv, verdict: cfs.length < 2 ? "—" : (npv >= 0 ? "Accept — value-adding" : "Reject — destroys value"), rows, sumIn };
  }, [rate, flows]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Discount Rate % (p.a.)</Label><Input value={rate} onChange={setRate} /></div>
        <div><Label>Cash Flows (t=0 first)</Label><Textarea value={flows} onChange={setFlows} rows={4} /></div>
      </Grid2>
      <BigResult value={curr(out.npv)} label="Net Present Value" sub={out.verdict} />
      <DataTable columns={["Year", "Cash Flow", "Discount Factor", "Present Value"]} rows={out.rows} />
    </VStack>
  );
}

function IrrCalc() {
  const [flows, setFlows] = useState("-1000, 500, 500, 500");

  const out = useMemo(() => {
    const cfs = parseNums(flows);
    const f = (r) => cfs.reduce((s, cf, t) => s + cf / Math.pow(1 + r, t), 0);
    let irr = null;
    if (cfs.length >= 2) {
      let lo = -0.9999, hi = 10, flo = f(lo), fhi = f(hi);
      if (flo * fhi <= 0) {
        for (let i = 0; i < 200; i++) {
          const mid = (lo + hi) / 2, fm = f(mid);
          if (Math.abs(fm) < 1e-9) { irr = mid; break; }
          if (flo * fm < 0) { hi = mid; fhi = fm; } else { lo = mid; flo = fm; }
          irr = (lo + hi) / 2;
        }
      }
    }
    const rows = cfs.map((cf, t) => [t, curr(cf)]);
    return { irr, rows, ok: irr !== null };
  }, [flows]);

  return (
    <VStack>
      <div><Label>Cash Flows (t=0 first, comma or newline)</Label><Textarea value={flows} onChange={setFlows} rows={4} /></div>
      <BigResult value={out.ok ? pct(out.irr * 100) : "—"} label="Internal Rate of Return" sub={out.ok ? "Rate where NPV = 0" : "No sign change — IRR undefined for these flows"} />
      <DataTable columns={["Year", "Cash Flow"]} rows={out.rows} />
    </VStack>
  );
}

function PaybackPeriodCalc() {
  const [investment, setInvestment] = useState("1000");
  const [inflows, setInflows] = useState("400, 400, 400, 400");

  const out = useMemo(() => {
    const inv = Math.abs(n(investment));
    const flows = parseNums(inflows);
    let cum = 0, years = null;
    const rows = [];
    for (let i = 0; i < flows.length; i++) {
      const prev = cum; cum += flows[i];
      rows.push([i + 1, curr(flows[i]), curr(cum)]);
      if (years === null && cum >= inv && flows[i] > 0) years = i + (inv - prev) / flows[i];
    }
    const months = years !== null ? Math.round((years % 1) * 12) : 0;
    return { years, whole: years !== null ? Math.floor(years) : 0, months, rows };
  }, [investment, inflows]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Initial Investment</Label><Input value={investment} onChange={setInvestment} /></div>
        <div><Label>Annual Cash Inflows</Label><Textarea value={inflows} onChange={setInflows} rows={4} /></div>
      </Grid2>
      <BigResult value={out.years !== null ? `${round(out.years, 2)} yr` : "Never"} label="Payback Period" sub={out.years !== null ? `≈ ${out.whole} yr ${out.months} mo` : "Inflows never recover the investment"} />
      <DataTable columns={["Year", "Inflow", "Cumulative"]} rows={out.rows} />
    </VStack>
  );
}

function DividendYieldCalc() {
  const [dividend, setDividend] = useState("20");
  const [price, setPrice] = useState("400");
  const [shares, setShares] = useState("100");

  const out = useMemo(() => {
    const d = n(dividend), p = n(price), s = n(shares);
    const yld = p > 0 ? (d / p) * 100 : 0;
    const annualIncome = d * s;
    const invested = p * s;
    const rows = [
      ["Dividend / Share", curr(d)],
      ["Market Price", curr(p)],
      ["Dividend Yield", p > 0 ? pct(yld) : "—"],
      ["Shares Held", s],
      ["Annual Dividend Income", curr(annualIncome)],
      ["Amount Invested", curr(invested)],
    ];
    return { yld, annualIncome, rows, valid: p > 0 };
  }, [dividend, price, shares]);

  return (
    <VStack>
      <Grid3>
        <div><Label>Dividend / Share</Label><Input value={dividend} onChange={setDividend} /></div>
        <div><Label>Market Price / Share</Label><Input value={price} onChange={setPrice} /></div>
        <div><Label>Shares Held</Label><Input value={shares} onChange={setShares} /></div>
      </Grid3>
      <Grid2>
        <BigResult value={out.valid ? pct(out.yld) : "—"} label="Dividend Yield" />
        <BigResult value={curr(out.annualIncome)} label="Annual Dividend Income" />
      </Grid2>
      <DataTable columns={["Metric", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function PeRatioCalc() {
  const [price, setPrice] = useState("400");
  const [eps, setEps] = useState("20");

  const out = useMemo(() => {
    const p = n(price), e = n(eps);
    const pe = e !== 0 ? p / e : Infinity;
    const earnYield = p > 0 ? (e / p) * 100 : 0;
    const rows = [
      ["Share Price", curr(p)],
      ["Earnings / Share (EPS)", curr(e)],
      ["P/E Ratio", Number.isFinite(pe) ? round(pe, 2) : "—"],
      ["Earnings Yield", p > 0 ? pct(earnYield) : "—"],
    ];
    return { pe, earnYield, rows };
  }, [price, eps]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Share Price</Label><Input value={price} onChange={setPrice} /></div>
        <div><Label>Earnings / Share (EPS)</Label><Input value={eps} onChange={setEps} /></div>
      </Grid2>
      <Grid2>
        <BigResult value={Number.isFinite(out.pe) ? round(out.pe, 2) : "—"} label="P/E Ratio" />
        <BigResult value={n(price) > 0 ? pct(out.earnYield) : "—"} label="Earnings Yield" />
      </Grid2>
      <DataTable columns={["Metric", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function DividendPayoutRatioCalc() {
  const [dividends, setDividends] = useState("40");
  const [netIncome, setNetIncome] = useState("100");

  const out = useMemo(() => {
    const d = n(dividends), ni = n(netIncome);
    const payout = ni > 0 ? (d / ni) * 100 : 0;
    const retention = ni > 0 ? 100 - payout : 0;
    const rows = [
      ["Total Dividends", curr(d)],
      ["Net Income", curr(ni)],
      ["Payout Ratio", ni > 0 ? pct(payout) : "—"],
      ["Retention Ratio", ni > 0 ? pct(retention) : "—"],
    ];
    return { payout, retention, rows, valid: ni > 0 };
  }, [dividends, netIncome]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Total Dividends Paid</Label><Input value={dividends} onChange={setDividends} /></div>
        <div><Label>Net Income</Label><Input value={netIncome} onChange={setNetIncome} /></div>
      </Grid2>
      <Grid2>
        <BigResult value={out.valid ? pct(out.payout) : "—"} label="Dividend Payout Ratio" />
        <BigResult value={out.valid ? pct(out.retention) : "—"} label="Retention Ratio" />
      </Grid2>
      <DataTable columns={["Metric", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function SalaryHikeCalc() {
  const [mode, setMode] = useState("newSalary");
  const [oldSalary, setOldSalary] = useState("50000");
  const [hikePct, setHikePct] = useState("15");
  const [newSalary, setNewSalary] = useState("57500");

  const out = useMemo(() => {
    const o = n(oldSalary);
    if (mode === "newSalary") {
      const h = n(hikePct) / 100;
      const nw = o * (1 + h);
      return { main: curr(nw), rows: [["Old Salary", curr(o)], ["Hike %", pct(h * 100)], ["Increment", curr(nw - o)], ["New Salary", curr(nw)]] };
    }
    const nw = n(newSalary);
    const h = o > 0 ? ((nw - o) / o) * 100 : 0;
    return { main: o > 0 ? pct(h) : "—", rows: [["Old Salary", curr(o)], ["New Salary", curr(nw)], ["Increment", curr(nw - o)], ["Hike %", o > 0 ? pct(h) : "—"]] };
  }, [mode, oldSalary, hikePct, newSalary]);

  return (
    <VStack>
      <div><Label>Mode</Label><SelectInput value={mode} onChange={setMode} options={[{ value: "newSalary", label: "Find New Salary from Hike %" }, { value: "hikePct", label: "Find Hike % from Salaries" }]} /></div>
      <Grid3>
        <div><Label>Old Salary</Label><Input value={oldSalary} onChange={setOldSalary} /></div>
        <div><Label>Hike %</Label><Input value={hikePct} onChange={setHikePct} /></div>
        <div><Label>New Salary</Label><Input value={newSalary} onChange={setNewSalary} /></div>
      </Grid3>
      <BigResult value={out.main} label={mode === "newSalary" ? "New Salary" : "Hike Percentage"} />
      <DataTable columns={["Component", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function OvertimePayCalc() {
  const [rate, setRate] = useState("20");
  const [regHrs, setRegHrs] = useState("40");
  const [otHrs, setOtHrs] = useState("10");
  const [mult, setMult] = useState("1.5");

  const out = useMemo(() => {
    const r = n(rate), reg = n(regHrs), ot = n(otHrs), m = n(mult);
    const regPay = r * reg;
    const otRate = r * m;
    const otPay = otRate * ot;
    const total = regPay + otPay;
    const rows = [
      ["Regular Pay", `${curr(r)} × ${round(reg, 2)} h`, curr(regPay)],
      ["Overtime Rate", `${curr(r)} × ${round(m, 2)}`, curr(otRate)],
      ["Overtime Pay", `${curr(otRate)} × ${round(ot, 2)} h`, curr(otPay)],
      ["Total Pay", "", curr(total)],
    ];
    return { total, regPay, otPay, rows };
  }, [rate, regHrs, otHrs, mult]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Hourly Rate</Label><Input value={rate} onChange={setRate} /></div>
        <div><Label>Regular Hours</Label><Input value={regHrs} onChange={setRegHrs} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Overtime Hours</Label><Input value={otHrs} onChange={setOtHrs} /></div>
        <div><Label>Overtime Multiplier</Label><SelectInput value={mult} onChange={setMult} options={[{ value: "1.5", label: "1.5× (time-and-a-half)" }, { value: "2", label: "2× (double time)" }, { value: "1.25", label: "1.25×" }, { value: "1", label: "1× (flat)" }]} /></div>
      </Grid2>
      <Grid2>
        <BigResult value={curr(out.total)} label="Total Pay" />
        <BigResult value={curr(out.otPay)} label="Overtime Pay" />
      </Grid2>
      <DataTable columns={["Component", "Basis", "Amount"]} rows={out.rows} />
    </VStack>
  );
}

const DENOMS = {
  INR: { sym: "₹", list: [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1] },
  USD: { sym: "$", list: [100, 50, 20, 10, 5, 1] },
};

function CurrencyDenominationCalc() {
  const [amount, setAmount] = useState("1234");
  const [ccy, setCcy] = useState("INR");

  const out = useMemo(() => {
    const cfg = DENOMS[ccy] || DENOMS.INR;
    let rem = Math.floor(Math.abs(n(amount)));
    const total = rem;
    const rows = [];
    let count = 0;
    for (const d of cfg.list) {
      const c = Math.floor(rem / d);
      if (c > 0) { rows.push([`${cfg.sym}${d}`, c, `${cfg.sym}${(d * c).toLocaleString()}`]); rem -= d * c; count += c; }
    }
    return { rows, count, total, sym: cfg.sym, remainder: rem };
  }, [amount, ccy]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Amount</Label><Input value={amount} onChange={setAmount} /></div>
        <div><Label>Currency</Label><SelectInput value={ccy} onChange={setCcy} options={[{ value: "INR", label: "₹ Indian Rupee" }, { value: "USD", label: "$ US Dollar" }]} /></div>
      </Grid2>
      <Grid2>
        <BigResult value={`${out.sym}${out.total.toLocaleString()}`} label="Whole Amount" />
        <BigResult value={String(out.count)} label="Total Notes / Coins" />
      </Grid2>
      <DataTable columns={["Denomination", "Count", "Subtotal"]} rows={out.rows} />
      {out.remainder > 0 ? <div style={{ fontSize: 12, color: C.muted }}>Note: smallest available unit is {out.sym}1 — {out.sym}{out.remainder} could not be broken down further.</div> : null}
    </VStack>
  );
}

function EffectiveAnnualRateCalc() {
  const [nominal, setNominal] = useState("12");
  const [periods, setPeriods] = useState("12");

  const out = useMemo(() => {
    const i = n(nominal) / 100;
    const p = Math.floor(n(periods));
    const ear = p <= 0 ? (Math.exp(i) - 1) * 100 : (Math.pow(1 + i / p, p) - 1) * 100;
    const rows = [
      ["Nominal Rate (APR)", pct(n(nominal))],
      ["Compounding / Year", p <= 0 ? "Continuous" : p],
      ["Effective Annual Rate", pct(ear)],
      ["Extra vs Nominal", pct(ear - n(nominal))],
    ];
    return { ear, rows };
  }, [nominal, periods]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Nominal Rate % (APR)</Label><Input value={nominal} onChange={setNominal} /></div>
        <div><Label>Compounding Frequency</Label><SelectInput value={periods} onChange={setPeriods} options={[{ value: "1", label: "Annually (1)" }, { value: "2", label: "Semi-annually (2)" }, { value: "4", label: "Quarterly (4)" }, { value: "12", label: "Monthly (12)" }, { value: "365", label: "Daily (365)" }, { value: "0", label: "Continuous" }]} /></div>
      </Grid2>
      <BigResult value={pct(out.ear)} label="Effective Annual Rate (APY)" />
      <DataTable columns={["Metric", "Value"]} rows={out.rows} />
    </VStack>
  );
}

function AnnualizedReturnCalc() {
  const [begin, setBegin] = useState("100000");
  const [end, setEnd] = useState("125000");
  const [income, setIncome] = useState("3000");
  const [days, setDays] = useState("365");

  const out = useMemo(() => {
    const b = n(begin), e = n(end), inc = n(income), d = n(days);
    if (b <= 0 || d <= 0) return { hpr: 0, ann: 0, rows: [], valid: false };
    const hpr = (e - b + inc) / b;
    const ann = Math.pow(1 + hpr, 365 / d) - 1;
    const rows = [
      ["Buy Value", curr(b)],
      ["Sell Value", curr(e)],
      ["Income / Dividends", curr(inc)],
      ["Days Held", round(d, 0)],
      ["Holding Period Return", pct(hpr * 100)],
      ["Annualized Return", pct(ann * 100)],
    ];
    return { hpr: hpr * 100, ann: ann * 100, rows, valid: true };
  }, [begin, end, income, days]);

  return (
    <VStack>
      <Grid2>
        <div><Label>Buy Value</Label><Input value={begin} onChange={setBegin} /></div>
        <div><Label>Sell Value</Label><Input value={end} onChange={setEnd} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Income / Dividends</Label><Input value={income} onChange={setIncome} /></div>
        <div><Label>Days Held</Label><Input value={days} onChange={setDays} /></div>
      </Grid2>
      <Grid2>
        <BigResult value={out.valid ? pct(out.hpr) : "—"} label="Total Return" />
        <BigResult value={out.valid ? pct(out.ann) : "—"} label="Annualized Return" />
      </Grid2>
      <DataTable columns={["Metric", "Value"]} rows={out.rows} />
    </VStack>
  );
}

Object.assign(TOOL_COMPONENTS, {
  "rule-of-72-calc": RuleOf72Calc,
  "npv-calc": NpvCalc,
  "irr-calc": IrrCalc,
  "payback-period-calc": PaybackPeriodCalc,
  "dividend-yield-calc": DividendYieldCalc,
  "pe-ratio-calc": PeRatioCalc,
  "dividend-payout-ratio-calc": DividendPayoutRatioCalc,
  "salary-hike-calc": SalaryHikeCalc,
  "overtime-pay-calc": OvertimePayCalc,
  "currency-denomination-calc": CurrencyDenominationCalc,
  "effective-annual-rate-calc": EffectiveAnnualRateCalc,
  "annualized-return-calc": AnnualizedReturnCalc,
});
// ───── END INVESTMENT & BUSINESS FINANCE BATCH ───────────────────────────────


// ───── PER-TOOL SEO METADATA (title / desc / keywords / faq / howTo) ─────────
const TOOL_META = {
  // ── Finance ──
  "investment-return-calc": {
    title: "Free Investment Return Calculator — CAGR & Growth",
    desc: "Calculate investment returns, CAGR and total gain from your start value, end value and holding period, with a year-by-year growth table. Not financial advice.",
    keywords: "investment return calculator, cagr calculator, roi calculator, compound growth, investment gain",
    faq: [
      ["How is CAGR calculated?", "CAGR uses the formula (End Value / Start Value) ^ (1 / years) − 1. It smooths uneven yearly returns into one constant annual growth rate."],
      ["What is the difference between total return and CAGR?", "Total return is the overall percentage gain across the whole period, while CAGR expresses that same growth as an equivalent annual rate for easy comparison."],
      ["Are these projections guaranteed?", "No. Returns are estimates based on the numbers you enter and assume steady growth. Actual market returns vary year to year. This is not financial advice."]
    ],
    howTo: "Enter your initial investment, final value and the number of years held. The calculator instantly shows total gain, CAGR and a year-by-year value table."
  },
  "rd-calc": {
    title: "Free RD Calculator — Recurring Deposit Maturity",
    desc: "Calculate Recurring Deposit maturity value and interest earned from your monthly deposit, interest rate and tenure, with quarterly compounding and a year-wise table.",
    keywords: "rd calculator, recurring deposit calculator, rd maturity calculator, rd interest calculator",
    faq: [
      ["How is RD maturity calculated?", "Each monthly deposit earns compound interest for its remaining months. Indian banks typically compound quarterly, so every instalment grows at rate/4 per quarter until maturity."],
      ["Is RD interest taxable?", "Yes. Interest earned on a Recurring Deposit is added to your income and taxed at your slab rate, and TDS may apply if annual interest crosses the bank's threshold."],
      ["Can I change my monthly RD amount?", "No. A standard RD requires a fixed monthly deposit for the full tenure. To vary amounts you would open a separate RD or a flexible deposit product."]
    ],
    howTo: "Enter your monthly deposit, the annual interest rate and the tenure in months or years. The calculator shows maturity value, total invested and interest earned."
  },
  "ppf-calc": {
    title: "Free PPF Calculator — Maturity & Interest Online",
    desc: "Project your Public Provident Fund maturity value with annual compounding over a 15-year term, showing year-wise balance, total invested and tax-free interest earned.",
    keywords: "ppf calculator, public provident fund calculator, ppf maturity calculator, ppf interest calculator",
    faq: [
      ["How is PPF interest calculated?", "PPF interest is compounded annually on the lowest balance between the 5th and last day of each month, then credited at year-end. The default 15-year term can be extended in 5-year blocks."],
      ["Is PPF maturity tax-free?", "Yes. PPF follows the EEE (Exempt-Exempt-Exempt) status, so contributions, annual interest and the final maturity amount are all fully tax-free in India."],
      ["What is the PPF deposit limit?", "You can deposit between ₹500 and ₹1.5 lakh per financial year. Deposits above ₹1.5 lakh earn no interest and are not eligible for section 80C benefits."]
    ],
    howTo: "Enter your yearly PPF contribution, the current interest rate and the term in years. The calculator shows year-wise balance and the tax-free maturity value."
  },
  "gratuity-calc": {
    title: "Free Gratuity Calculator — Indian Payout Estimate",
    desc: "Estimate your gratuity payout under the Payment of Gratuity Act from your last drawn salary and years of service, using the standard 15/26 formula. Not legal advice.",
    keywords: "gratuity calculator, gratuity formula, gratuity india, end of service benefit calculator",
    faq: [
      ["What is the gratuity formula?", "For covered employees, gratuity = last drawn (basic + DA) × 15/26 × years of service. The 15/26 factor treats 15 days' wages for each completed year based on a 26-day month."],
      ["When am I eligible for gratuity?", "Under the Act you generally need at least 5 continuous years of service, except in cases of death or disablement where the 5-year rule is waived."],
      ["Is gratuity tax-free?", "Gratuity is tax-exempt up to a statutory ceiling (₹20 lakh for most employees). Amounts above the exemption limit are added to taxable income. This is not legal advice."]
    ],
    howTo: "Enter your last drawn basic salary plus dearness allowance and your completed years of service. The calculator applies the 15/26 formula to estimate your gratuity."
  },
  "take-home-pay-calc": {
    title: "Free Take Home Pay Calculator — Net Salary",
    desc: "Work out your net monthly take-home pay after tax, provident fund and other deductions from your gross salary, so you know exactly what lands in your account.",
    keywords: "take home pay calculator, net salary calculator, in hand salary, paycheck calculator",
    faq: [
      ["How is take-home pay calculated?", "Take-home pay is gross salary minus all deductions such as income tax, provident fund, professional tax and insurance. What remains is your net in-hand amount."],
      ["Why is my take-home lower than my CTC?", "CTC includes employer contributions and benefits you never receive as cash, such as the employer PF share and gratuity, which are deducted before your net pay."],
      ["Does this include tax accurately?", "It gives a close estimate based on the deductions you enter. Exact tax depends on your regime, exemptions and investments, so treat the result as a guide."]
    ],
    howTo: "Enter your gross salary and each deduction such as tax, provident fund and other withholdings. The calculator subtracts them to show your net take-home pay."
  },
  "hourly-to-annual-calc": {
    title: "Free Hourly to Annual Salary Calculator Online",
    desc: "Convert an hourly wage into weekly, monthly and annual salary based on hours worked per week and weeks worked per year, and reverse it back to an hourly rate.",
    keywords: "hourly to annual salary, wage calculator, hourly to yearly, salary converter, hourly rate calculator",
    faq: [
      ["How do I convert hourly pay to annual salary?", "Multiply your hourly rate by hours worked per week, then by weeks worked per year. For example, ₹500/hour × 40 hours × 52 weeks equals ₹10,40,000 a year."],
      ["How many working hours are in a year?", "A common full-time assumption is 40 hours × 52 weeks = 2,080 hours per year, though paid holidays and leave can reduce actual hours worked."],
      ["Does this account for overtime or bonuses?", "No. It converts a flat hourly rate into salary. Overtime, bonuses and shift premiums should be added separately to the base figure."]
    ],
    howTo: "Enter your hourly wage, hours worked per week and weeks worked per year. The calculator shows equivalent weekly, monthly and annual earnings instantly."
  },
  "income-tax-calc": {
    title: "Free Income Tax Calculator India — Old vs New",
    desc: "Compare your income tax under the old and new Indian regimes side by side from your income, deductions and exemptions, to see which one saves you more. Not tax advice.",
    keywords: "income tax calculator india, old vs new regime, tax slab calculator, income tax estimate",
    faq: [
      ["How does the old regime differ from the new regime?", "The old regime offers deductions and exemptions like 80C, HRA and standard deduction with higher slab rates, while the new regime has lower rates but removes most deductions."],
      ["Which tax regime should I choose?", "It depends on your deductions. If your eligible deductions are large, the old regime often wins; with few deductions the new regime's lower rates usually cost less."],
      ["Is this calculation exact?", "It is a close estimate using standard slabs and the inputs you provide. Cess, surcharge and special cases can change the final figure, so this is not tax advice."]
    ],
    howTo: "Enter your annual income and eligible deductions. The calculator computes tax under both the old and new regimes and highlights the cheaper option."
  },
  "tip-calc": {
    title: "Free Tip Calculator — Gratuity & Bill Split",
    desc: "Calculate the tip on any bill by percentage and split the total fairly among any number of people, showing tip amount, grand total and each person's exact share.",
    keywords: "tip calculator, gratuity calculator, bill split calculator, tip splitter, restaurant tip",
    faq: [
      ["How much should I tip?", "Tipping norms vary by country, but 10–20% of the pre-tax bill is common in many places. Enter any percentage to see the exact tip amount."],
      ["How does the bill split work?", "The calculator adds your chosen tip to the bill, then divides the total by the number of people so everyone pays an equal share including gratuity."],
      ["Should I tip on the pre-tax or post-tax amount?", "Either is acceptable, but tipping on the pre-tax subtotal is common. Enter whichever bill figure you prefer as the base amount."]
    ],
    howTo: "Enter the bill amount, choose a tip percentage and the number of people. The calculator shows the tip, grand total and per-person share instantly."
  },
  "markup-calc": {
    title: "Free Markup Calculator — Cost, Price & Margin",
    desc: "Calculate selling price, markup percentage and profit margin from cost and price, and see the difference between markup on cost and margin on revenue for pricing.",
    keywords: "markup calculator, margin calculator, selling price calculator, profit markup, cost plus pricing",
    faq: [
      ["What is the difference between markup and margin?", "Markup is profit as a percentage of cost, while margin is profit as a percentage of selling price. A 50% markup equals a 33.3% margin on the same item."],
      ["How is selling price from markup calculated?", "Selling price = cost × (1 + markup%). For a ₹100 cost with 40% markup, the price is ₹100 × 1.40 = ₹140."],
      ["How do I find markup from cost and price?", "Markup% = (price − cost) / cost × 100. If cost is ₹100 and price ₹140, the markup is ₹40 / ₹100 = 40%."]
    ],
    howTo: "Enter any two of cost, selling price or markup percentage. The calculator solves for the missing value and shows both markup and profit margin."
  },
  "depreciation-calc": {
    title: "Free Depreciation Calculator — Straight & Reducing",
    desc: "Build a depreciation schedule for an asset using straight-line or reducing-balance methods from cost, salvage value and useful life, with year-wise book value.",
    keywords: "depreciation calculator, straight line depreciation, reducing balance depreciation, asset depreciation schedule",
    faq: [
      ["How does straight-line depreciation work?", "It spreads cost evenly: annual depreciation = (cost − salvage value) / useful life. The asset loses the same amount of value every year."],
      ["How does reducing-balance depreciation work?", "It applies a fixed percentage to the remaining book value each year, so depreciation is highest early on and shrinks over the asset's life."],
      ["What is salvage value?", "Salvage value is the estimated resale or scrap value at the end of an asset's useful life. Only cost minus salvage is depreciated over time."]
    ],
    howTo: "Enter the asset cost, salvage value and useful life, then choose straight-line or reducing-balance. The calculator produces a year-by-year depreciation schedule."
  },
  "future-value-calc": {
    title: "Free Future Value Calculator — Compound Growth",
    desc: "Calculate the future value of a present sum with compound interest from your principal, rate, term and compounding frequency, with a year-by-year growth table.",
    keywords: "future value calculator, compound interest calculator, fv calculator, investment growth, time value of money",
    faq: [
      ["What is the future value formula?", "Future value = principal × (1 + r/n) ^ (n×t), where r is the annual rate, n the compounds per year and t the number of years."],
      ["How does compounding frequency affect future value?", "More frequent compounding grows money faster because interest is added and starts earning interest sooner. Monthly beats yearly for the same nominal rate."],
      ["Does this include regular contributions?", "This tool compounds a single lump sum. For recurring monthly investments, use the SIP or savings goal calculator instead."]
    ],
    howTo: "Enter your present amount, annual interest rate, number of years and compounding frequency. The calculator shows the future value and a growth table."
  },
  "present-value-calc": {
    title: "Free Present Value Calculator — Discount Future Cash",
    desc: "Find the present value of a future amount by discounting it at your chosen rate and compounding frequency, showing the discount factor and value for each year.",
    keywords: "present value calculator, pv calculator, discounted cash flow, time value of money, discount rate calculator",
    faq: [
      ["What is the present value formula?", "Present value = future value / (1 + r/n) ^ (n×t). It answers how much a future sum is worth in today's money at a given discount rate."],
      ["Why is future money worth less today?", "Money available now can be invested to earn returns, and inflation erodes purchasing power, so a rupee today is worth more than the same rupee in the future."],
      ["What discount rate should I use?", "Use a rate that reflects your opportunity cost or required return, such as an expected investment return or a borrowing rate. Higher rates lower present value."]
    ],
    howTo: "Enter the future value, discount rate, number of years and compounding frequency. The calculator shows the present value and a year-wise discount table."
  },
  "savings-goal-calc": {
    title: "Free Savings Goal Calculator — Monthly Target",
    desc: "Find the monthly saving needed to reach a target amount by a deadline, accounting for interest earned and any starting balance, with a year-wise growth breakdown.",
    keywords: "savings goal calculator, monthly savings calculator, savings target, how much to save, goal planner",
    faq: [
      ["How is the required monthly saving calculated?", "The tool uses the future value of an annuity formula, factoring in your interest rate and existing balance, then solves for the monthly deposit that hits your goal."],
      ["Does a starting balance reduce my monthly saving?", "Yes. Any current savings grow with interest toward your goal, so a larger starting balance lowers the monthly amount you still need to set aside."],
      ["What if my interest rate is zero?", "With no interest, the required monthly saving is simply the remaining goal divided by the number of months until your deadline."]
    ],
    howTo: "Enter your goal amount, current savings, expected return and time frame. The calculator shows the monthly saving needed and a year-by-year progress table."
  },
  "debt-payoff-calc": {
    title: "Free Debt Payoff Calculator — Time & Interest",
    desc: "Find how long it takes to clear a debt and the total interest you will pay from your balance, interest rate and monthly payment, with a reducing-balance schedule.",
    keywords: "debt payoff calculator, loan payoff calculator, debt free calculator, interest paid calculator",
    faq: [
      ["How is debt payoff time calculated?", "Each month interest is charged on the outstanding balance, your payment covers that interest first, and the rest reduces principal until the balance reaches zero."],
      ["How can I pay off debt faster?", "Increase your monthly payment or make lump-sum prepayments. Because interest is charged on the balance, extra principal payments cut both time and total interest."],
      ["What happens if my payment is too low?", "If your monthly payment does not cover the monthly interest, the balance never falls. The calculator flags when a payment is insufficient to make progress."]
    ],
    howTo: "Enter your outstanding balance, annual interest rate and monthly payment. The calculator shows payoff time, total interest and a month-by-month schedule."
  },
  "credit-card-payoff-calc": {
    title: "Free Credit Card Payoff Calculator — Interest Saved",
    desc: "Compare paying only the minimum versus a fixed monthly amount on your credit card, revealing payoff time and interest saved so you can escape revolving debt faster.",
    keywords: "credit card payoff calculator, minimum payment calculator, credit card interest calculator, pay off credit card",
    faq: [
      ["Why is paying only the minimum so costly?", "Minimum payments barely exceed monthly interest, so the balance falls slowly and interest keeps compounding, often stretching payoff over many years and huge interest."],
      ["How is credit card interest calculated?", "Interest is charged monthly on your balance at your card's periodic rate (APR ÷ 12). Any unpaid balance carries over and accrues interest the next cycle."],
      ["Does a fixed payment really help?", "Yes. Paying a steady amount above the minimum shortens payoff dramatically and slashes total interest, because more of each payment attacks the principal."]
    ],
    howTo: "Enter your card balance, APR, minimum payment percent and a fixed payment amount. The calculator compares both strategies for time and interest cost."
  },
  "car-loan-calc": {
    title: "Free Car Loan Calculator — EMI & Amortization",
    desc: "Calculate car loan EMI, total interest and true ownership cost from price, down payment, rate and tenure, with a full month-wise amortization schedule.",
    keywords: "car loan calculator, auto loan emi calculator, vehicle loan calculator, car emi calculator",
    faq: [
      ["How is car loan EMI calculated?", "EMI uses the reducing-balance formula EMI = P × r × (1+r)^n / ((1+r)^n − 1), where P is the loan amount, r the monthly rate and n the number of months."],
      ["How does a down payment affect my EMI?", "A larger down payment reduces the loan principal, which lowers both your monthly EMI and the total interest paid over the loan term."],
      ["What is the total cost of ownership shown here?", "It adds your down payment plus every EMI over the loan, revealing the full amount you pay for the car including all financing interest."]
    ],
    howTo: "Enter the car price, down payment, interest rate and tenure. The calculator shows your EMI, total interest and a month-by-month amortization table."
  },
  "student-loan-calc": {
    title: "Free Student Loan Calculator — Repayment Plans",
    desc: "Compare standard versus income-based student loan repayment from your balance, interest rate and term, showing monthly payment, total interest and payoff timeline.",
    keywords: "student loan calculator, education loan emi, student loan repayment, loan interest calculator",
    faq: [
      ["How is a standard student loan payment calculated?", "Standard repayment uses the fixed EMI formula so equal monthly payments clear the balance over the term, with interest charged on the reducing balance each month."],
      ["What is income-based repayment?", "Income-based repayment caps monthly payments at a share of your income, which can lower payments but often extends the term and increases total interest paid."],
      ["Should I prepay my student loan?", "Prepaying reduces principal and saves interest, but weigh it against tax benefits on education loan interest and any higher-return uses of the money."]
    ],
    howTo: "Enter your loan balance, interest rate and repayment term. The calculator compares standard and income-based plans for payment size and total interest."
  },
  "break-even-calc": {
    title: "Free Break-even Calculator — Units & Revenue",
    desc: "Find your break-even point in units and revenue from fixed costs, price per unit and variable cost per unit, so you know exactly when a product turns profitable.",
    keywords: "break even calculator, break even point, break even analysis, contribution margin calculator",
    faq: [
      ["What is the break-even formula?", "Break-even units = fixed costs / (price per unit − variable cost per unit). The denominator is the contribution margin each unit adds toward covering fixed costs."],
      ["What is contribution margin?", "Contribution margin is the selling price minus the variable cost per unit. It is the amount each sale contributes to covering fixed costs and then profit."],
      ["What if price is below variable cost?", "Then every sale loses money and there is no break-even point. You must raise the price or cut variable cost until the contribution margin is positive."]
    ],
    howTo: "Enter your fixed costs, selling price per unit and variable cost per unit. The calculator shows the break-even quantity and the revenue needed to reach it."
  },
  "net-worth-calc": {
    title: "Free Net Worth Calculator — Assets vs Liabilities",
    desc: "Calculate your personal net worth by subtracting total liabilities from total assets, giving a clear snapshot of your financial health at a single point in time.",
    keywords: "net worth calculator, personal net worth, assets minus liabilities, financial health calculator",
    faq: [
      ["How is net worth calculated?", "Net worth = total assets − total liabilities. Add up everything you own, such as cash, investments and property, then subtract all debts you owe."],
      ["What counts as an asset versus a liability?", "Assets are things of value you own like savings, investments and property. Liabilities are debts you owe such as loans, mortgages and credit card balances."],
      ["Can net worth be negative?", "Yes. If your debts exceed the value of what you own, net worth is negative. Reducing liabilities and building assets moves it back into positive territory."]
    ],
    howTo: "Enter the value of your assets and the total of your liabilities. The calculator subtracts them to show your current net worth instantly."
  },
  "budget-calc": {
    title: "Free Budget Planner — Income vs Expense Tracker",
    desc: "Plan your monthly budget by comparing total income against expenses, revealing your surplus or deficit and savings rate with a clear visual breakdown of where money goes.",
    keywords: "budget calculator, budget planner, income expense calculator, monthly budget, savings rate calculator",
    faq: [
      ["How does the budget planner work?", "It totals your income and your expenses, then subtracts expenses from income to show whether you have a surplus to save or a deficit to fix."],
      ["What is a good savings rate?", "Many planners suggest saving at least 20% of income, following guides like the 50/30/20 rule. The right rate depends on your goals and cost of living."],
      ["What should I do about a budget deficit?", "A deficit means you spend more than you earn. Cut discretionary expenses, increase income, or both, until expenses fall below your monthly income."]
    ],
    howTo: "Enter your monthly income and each expense category. The calculator shows your surplus or deficit, savings rate and a visual breakdown of spending."
  },
  "discount-calculator": {
    title: "Free Discount Calculator — Sale Price & Savings",
    desc: "Calculate the final sale price and money saved from a discount percentage, or work out the discount percent from a sale price, with optional stacked second discounts.",
    keywords: "discount calculator, sale price calculator, percent off calculator, savings calculator, stacked discount",
    faq: [
      ["How is a discounted price calculated?", "Sale price = original price × (1 − discount%). For ₹1,000 at 20% off, you pay ₹1,000 × 0.80 = ₹800 and save ₹200."],
      ["How do stacked discounts work?", "Stacked discounts apply one after another, not added together. A 20% then 10% off is 0.80 × 0.90 = 0.72, an effective 28% off, not 30%."],
      ["How do I find the discount percentage?", "Discount% = (original − sale) / original × 100. If an item drops from ₹1,000 to ₹750, that is a 25% discount."]
    ],
    howTo: "Enter the original price and discount percentage, or a sale price to find the percent off. Add a second discount to see the stacked final price and savings."
  },
  "emi-calc": {
    title: "Free EMI Calculator — Loan EMI & Interest Online",
    desc: "Calculate the monthly EMI, total interest and full year-wise schedule for any loan from the amount, interest rate and tenure, using the standard reducing-balance method.",
    keywords: "emi calculator, loan emi calculator, monthly emi, loan interest calculator, reducing balance emi",
    faq: [
      ["How is EMI calculated?", "EMI = P × r × (1+r)^n / ((1+r)^n − 1), where P is the loan amount, r is the monthly interest rate (annual rate ÷ 12) and n is the number of monthly instalments."],
      ["What is a reducing-balance loan?", "Interest each month is charged only on the remaining principal, not the original amount. As you repay, the interest portion shrinks and principal repayment grows."],
      ["Does a longer tenure reduce my EMI?", "Yes, a longer tenure lowers the monthly EMI but increases total interest paid, because the outstanding balance accrues interest over more months."]
    ],
    howTo: "Enter the loan amount, annual interest rate and tenure. The calculator instantly shows your EMI, total interest, total payable and a year-wise schedule."
  },
  "home-loan-emi-calc": {
    title: "Free Home Loan EMI Calculator — Interest Split",
    desc: "Calculate home loan EMI with a principal and interest breakdown plus a yearly balance table from your loan amount, rate and tenure, using reducing-balance interest.",
    keywords: "home loan emi calculator, housing loan calculator, mortgage emi calculator, home loan interest",
    faq: [
      ["How is home loan EMI split between principal and interest?", "Early EMIs are mostly interest because the balance is high; over time more of each EMI goes to principal as the outstanding amount and its interest shrink."],
      ["How can I reduce total interest on a home loan?", "Make prepayments, choose a shorter tenure, or pay a higher EMI. Reducing the principal early cuts the interest charged over the remaining term significantly."],
      ["Are home loan payments tax-deductible?", "In India, principal repayment can qualify under section 80C and interest under section 24(b), within limits. Confirm current rules as this is not tax advice."]
    ],
    howTo: "Enter your home loan amount, interest rate and tenure. The calculator shows your EMI, the principal-interest split and a year-wise outstanding balance table."
  },
  "sip-calc": {
    title: "Free SIP Calculator — Mutual Fund SIP Returns",
    desc: "Estimate the maturity value of a monthly mutual fund SIP from your contribution, expected return and duration, showing total invested and wealth gained. Not investment advice.",
    keywords: "sip calculator, mutual fund sip calculator, sip returns calculator, systematic investment plan",
    faq: [
      ["How is SIP maturity calculated?", "SIP uses the future value of an annuity: M = P × (((1+i)^n − 1) / i) × (1+i), where P is the monthly amount, i the monthly return and n the number of months."],
      ["Are SIP returns guaranteed?", "No. SIPs invest in market-linked mutual funds, so the expected return you enter is only an assumption. Actual returns vary and can be negative. Not investment advice."],
      ["What is rupee cost averaging?", "By investing a fixed amount monthly, you buy more units when prices are low and fewer when high, averaging your cost and reducing timing risk over the long run."]
    ],
    howTo: "Enter your monthly SIP amount, expected annual return and investment period. The calculator shows maturity value, total invested and wealth gained."
  },
  "step-up-sip-calc": {
    title: "Free Step-up SIP Calculator — Annual Increase",
    desc: "Project SIP returns when you raise your monthly investment by a fixed percentage each year, showing how the step-up boosts your final corpus. Not investment advice.",
    keywords: "step up sip calculator, top up sip calculator, increasing sip calculator, sip step up returns",
    faq: [
      ["What is a step-up SIP?", "A step-up or top-up SIP increases your monthly contribution by a set percentage every year, letting your investment grow with your income for a much larger corpus."],
      ["How does the annual step-up affect returns?", "Because later contributions are larger and still compound, even a small yearly step-up like 10% can significantly raise the final maturity value over a long period."],
      ["Are these results guaranteed?", "No. The expected return is an assumption and market-linked funds fluctuate, so actual results will differ. This tool is for planning, not investment advice."]
    ],
    howTo: "Enter your starting monthly SIP, the annual step-up percentage, expected return and duration. The calculator projects the stepped-up maturity value."
  },
  "lumpsum-calc": {
    title: "Free Lumpsum Calculator — One-Time Investment",
    desc: "Calculate the future value of a one-time lumpsum investment with annual compounding from your amount, expected return and period, with a year-by-year value table.",
    keywords: "lumpsum calculator, lumpsum investment calculator, mutual fund lumpsum, one time investment returns",
    faq: [
      ["How is lumpsum growth calculated?", "It uses compound interest: maturity = principal × (1 + r)^n, where r is the annual expected return and n is the number of years the money stays invested."],
      ["Lumpsum or SIP — which is better?", "Lumpsum suits a large amount you can invest at once, while SIP spreads risk over time. The best choice depends on your cash flow and market timing comfort."],
      ["Are the returns assured?", "No. Market-linked investments do not guarantee returns, so the expected rate you enter is only an estimate. Actual value may be higher or lower."]
    ],
    howTo: "Enter your one-time investment amount, expected annual return and number of years. The calculator shows the maturity value and a year-wise growth table."
  },
  "swp-calc": {
    title: "Free SWP Calculator — Systematic Withdrawal Plan",
    desc: "See how long your investment corpus lasts with a systematic withdrawal plan, from your starting amount, monthly withdrawal and expected return, with a depletion table.",
    keywords: "swp calculator, systematic withdrawal plan, retirement withdrawal calculator, corpus withdrawal calculator",
    faq: [
      ["How does an SWP work?", "You invest a lumpsum and withdraw a fixed amount each month. The remaining balance keeps earning returns, so the corpus depletes slower than plain withdrawals."],
      ["Will my corpus ever run out?", "It depends on the balance between returns and withdrawals. If withdrawals exceed the growth, the corpus shrinks each month and eventually reaches zero."],
      ["Can withdrawals continue indefinitely?", "If the expected return earns more than you withdraw, the corpus can grow or stay stable, allowing withdrawals to continue for a very long time or perpetually."]
    ],
    howTo: "Enter your invested corpus, monthly withdrawal amount and expected annual return. The calculator shows how many months the corpus lasts with a depletion table."
  },
  "gst-calc": {
    title: "Free GST Calculator — Add or Remove GST Online",
    desc: "Add or remove GST from any amount with an automatic CGST and SGST split across all Indian GST rates, showing the net price, tax amount and gross total clearly.",
    keywords: "gst calculator, gst india calculator, cgst sgst calculator, add gst, remove gst, reverse gst",
    faq: [
      ["How do I add GST to a price?", "GST amount = price × rate%. The gross = price + GST. For ₹1,000 at 18% GST, tax is ₹180 and the total payable is ₹1,180."],
      ["How is GST removed from a gross amount?", "Net price = gross / (1 + rate%). For ₹1,180 including 18% GST, the base price is ₹1,180 / 1.18 = ₹1,000 and the GST portion is ₹180."],
      ["What are CGST and SGST?", "For intra-state sales, GST splits equally into Central GST and State GST. An 18% rate becomes 9% CGST plus 9% SGST, which this tool shows automatically."]
    ],
    howTo: "Enter the amount, choose a GST rate and select add or remove GST. The calculator shows the net price, GST amount with CGST/SGST split and gross total."
  },
  "fd-calc": {
    title: "Free FD Calculator — Fixed Deposit Maturity Online",
    desc: "Calculate fixed deposit maturity and interest with quarterly compounding like Indian banks, from your deposit amount, interest rate and tenure, with a growth table.",
    keywords: "fd calculator, fixed deposit calculator, fd maturity calculator, fd interest calculator, bank fd",
    faq: [
      ["How is FD interest compounded?", "Most Indian banks compound FD interest quarterly. The maturity uses A = P × (1 + r/4)^(4×t), where r is the annual rate and t the tenure in years."],
      ["Is FD interest taxable?", "Yes. FD interest is added to your income and taxed at your slab rate, and banks deduct TDS if annual interest exceeds the applicable threshold."],
      ["What is the difference between cumulative and payout FD?", "A cumulative FD reinvests interest until maturity for compounding, while a payout FD pays interest periodically, so its final amount is just the principal returned."]
    ],
    howTo: "Enter your deposit amount, annual interest rate and tenure. The calculator applies quarterly compounding to show maturity value and total interest earned."
  },
  "hra-calc": {
    title: "Free HRA Exemption Calculator — Metro & Non-Metro",
    desc: "Calculate your House Rent Allowance tax exemption using the three-rule method from salary, HRA received, rent paid and city type for metro or non-metro. Not tax advice.",
    keywords: "hra calculator, hra exemption calculator, house rent allowance, hra tax exemption, section 10 13a",
    faq: [
      ["How is HRA exemption calculated?", "Exemption is the least of three: actual HRA received, rent paid minus 10% of salary, and 50% of salary for metro cities (40% for non-metro). The smallest amount is exempt."],
      ["What counts as a metro city for HRA?", "For HRA, metro cities are Delhi, Mumbai, Kolkata and Chennai, which allow the 50% of salary limit. All other cities use the 40% non-metro limit."],
      ["Which salary is used for HRA?", "The salary here means basic pay plus dearness allowance (and commission if it is a fixed percentage of turnover), not your full gross salary. This is not tax advice."]
    ],
    howTo: "Enter your basic salary, HRA received, annual rent paid and whether you live in a metro city. The calculator shows your exempt and taxable HRA."
  },
  "ctc-to-inhand-calc": {
    title: "Free CTC to In-Hand Salary Calculator — New Regime",
    desc: "Convert your annual CTC into monthly in-hand take-home salary under the new tax regime, accounting for provident fund, tax and other deductions. Not tax advice.",
    keywords: "ctc to in hand calculator, ctc calculator, in hand salary calculator, take home from ctc, salary breakup",
    faq: [
      ["Why is in-hand salary lower than CTC?", "CTC includes employer contributions like the employer PF share and gratuity that you never receive as cash, plus your own deductions for PF and income tax."],
      ["How is in-hand salary estimated here?", "The tool subtracts employer PF, employee PF, professional tax and estimated income tax under the new regime from your CTC to arrive at monthly take-home."],
      ["Is the tax figure exact?", "It is a close estimate using new-regime slabs. Actual tax depends on your full salary structure and any special components, so treat it as a guide, not tax advice."]
    ],
    howTo: "Enter your annual CTC and any known components. The calculator estimates deductions under the new regime and shows your monthly in-hand salary."
  },
  "nps-calc": {
    title: "Free NPS Calculator — Pension & Corpus Estimate",
    desc: "Estimate your National Pension System corpus, tax-free lumpsum and monthly pension at retirement from your contribution, expected return and annuity choice. Not advice.",
    keywords: "nps calculator, national pension system calculator, nps pension calculator, retirement corpus calculator",
    faq: [
      ["How is the NPS corpus calculated?", "Monthly contributions compound at your expected return until retirement using the annuity future-value formula, building the total corpus available at age 60."],
      ["How much of the NPS corpus is tax-free?", "At maturity you can withdraw up to 60% of the corpus tax-free as a lumpsum; the remaining 40% must buy an annuity that pays your monthly pension."],
      ["How is the monthly pension estimated?", "The annuity portion is multiplied by an assumed annuity rate to estimate monthly pension. Actual pension depends on the annuity plan and prevailing rates."]
    ],
    howTo: "Enter your monthly contribution, expected return, current age and annuity rate. The calculator shows the corpus, tax-free lumpsum and monthly pension."
  },
  "ssy-calc": {
    title: "Free Sukanya Samriddhi Calculator — SSY Maturity",
    desc: "Calculate Sukanya Samriddhi Yojana maturity value for your daughter with 15 years of deposits and a 21-year term, using annual compounding. Tax-free under EEE status.",
    keywords: "sukanya samriddhi calculator, ssy calculator, sukanya yojana maturity, girl child savings calculator",
    faq: [
      ["How does the SSY scheme work?", "You deposit each year for 15 years, but the account matures after 21 years from opening. Interest compounds annually and the full maturity amount is tax-free."],
      ["How much can I deposit in SSY each year?", "You can deposit between ₹250 and ₹1.5 lakh per financial year. Deposits qualify for section 80C benefits and the account earns a government-set interest rate."],
      ["When can the SSY corpus be withdrawn?", "The account matures 21 years after opening, or on the girl's marriage after age 18. Partial withdrawal is allowed for higher education after she turns 18."]
    ],
    howTo: "Enter your yearly SSY deposit, the interest rate and the girl's age. The calculator projects the tax-free maturity value at the end of the 21-year term."
  },
  "inflation-calc": {
    title: "Free Inflation Calculator — Future Cost of Money",
    desc: "See how inflation erodes purchasing power and what today's expenses will cost in the future, from an amount, inflation rate and number of years, with a year-wise table.",
    keywords: "inflation calculator, future cost calculator, purchasing power calculator, cost of living calculator",
    faq: [
      ["How is future cost from inflation calculated?", "Future cost = present cost × (1 + inflation rate)^years. At 6% inflation, an item costing ₹1,000 today would cost about ₹1,791 in ten years."],
      ["How does inflation reduce purchasing power?", "As prices rise, the same money buys fewer goods. ₹100 today buys less each year, which is why savings must earn more than inflation to grow in real terms."],
      ["Why should I plan for inflation?", "Ignoring inflation understates future expenses like retirement or education. Factoring it in helps you set realistic savings and investment targets that keep pace."]
    ],
    howTo: "Enter a current amount, the expected inflation rate and number of years. The calculator shows the future cost and the drop in purchasing power over time."
  },
  "simple-vs-compound-calc": {
    title: "Free Simple vs Compound Interest Calculator",
    desc: "Compare simple and compound interest side by side from your principal, rate and term, revealing the extra wealth compounding builds year after year with a growth table.",
    keywords: "simple vs compound interest, compound interest calculator, interest comparison, power of compounding",
    faq: [
      ["What is the difference between simple and compound interest?", "Simple interest is charged only on the original principal, while compound interest is charged on principal plus accumulated interest, so it grows faster over time."],
      ["What are the two formulas?", "Simple interest = P × r × t. Compound interest gives A = P × (1 + r)^t. The gap between them widens the longer the money stays invested."],
      ["When does compounding matter most?", "Over long periods and at higher rates. Early years look similar, but compounding pulls far ahead the longer you stay invested, which is why time is so valuable."]
    ],
    howTo: "Enter your principal, interest rate and number of years. The calculator shows simple and compound interest side by side with a year-by-year comparison table."
  },
  "loan-prepayment-calc": {
    title: "Free Loan Prepayment Calculator — Interest Saved",
    desc: "Calculate the interest saved and tenure reduced by paying an extra amount toward your loan each month, from your balance, rate, EMI and extra payment. Not financial advice.",
    keywords: "loan prepayment calculator, part payment calculator, prepay loan calculator, interest saved calculator",
    faq: [
      ["How does prepayment save interest?", "Extra payments go straight to principal, so the outstanding balance falls faster. Since interest is charged on the balance, less principal means far less total interest."],
      ["Does prepayment reduce EMI or tenure?", "This tool keeps the EMI the same and shortens the tenure, which usually saves the most interest. Some lenders instead lower the EMI while keeping the tenure."],
      ["Are there prepayment charges?", "Floating-rate home loans in India generally have no prepayment penalty, but fixed-rate or other loans may. Check your loan terms before prepaying."]
    ],
    howTo: "Enter your loan balance, interest rate, current EMI and the extra monthly payment. The calculator shows the interest saved and months cut from your tenure."
  },
  "rule-of-72-calc": {
    title: "Free Rule of 72 Calculator — Doubling Time",
    desc: "Estimate how many years it takes for money to double at a given rate using the Rule of 72, alongside the exact compounding answer for an accurate comparison.",
    keywords: "rule of 72 calculator, doubling time calculator, money doubling calculator, compound growth rule",
    faq: [
      ["What is the Rule of 72?", "It is a shortcut: divide 72 by the annual interest rate to estimate the years needed to double your money. At 8%, that is 72 ÷ 8 = about 9 years."],
      ["How accurate is the Rule of 72?", "It is a close approximation for rates between roughly 6% and 10%. For very high or low rates the exact logarithmic formula, also shown here, is more precise."],
      ["What is the exact doubling formula?", "The precise time to double is ln(2) / ln(1 + r), where r is the annual rate. This calculator shows both the Rule of 72 estimate and this exact value."]
    ],
    howTo: "Enter an annual interest or growth rate. The calculator shows the Rule of 72 doubling-time estimate next to the exact compounding answer for comparison."
  },
  "npv-calc": {
    title: "Free NPV Calculator — Net Present Value Online",
    desc: "Calculate the Net Present Value of a project by discounting a series of yearly cash flows at your required rate of return, to judge whether an investment adds value.",
    keywords: "npv calculator, net present value calculator, discounted cash flow calculator, capital budgeting, dcf",
    faq: [
      ["How is NPV calculated?", "NPV sums each year's cash flow discounted to today: NPV = Σ CFt / (1 + r)^t, minus the initial outlay. A positive NPV means the project adds value."],
      ["What does a positive or negative NPV mean?", "A positive NPV means the discounted returns exceed the cost, so the project is worth doing. A negative NPV means it destroys value at your required rate."],
      ["How do I choose a discount rate?", "Use your required rate of return or cost of capital. A higher discount rate lowers NPV, reflecting greater risk or a higher opportunity cost of funds."]
    ],
    howTo: "Enter the initial investment, your discount rate and each year's cash flow. The calculator discounts them all and shows the project's Net Present Value."
  },
  "irr-calc": {
    title: "Free IRR Calculator — Internal Rate of Return",
    desc: "Compute the Internal Rate of Return of an investment's cash flows, solved numerically so that Net Present Value equals zero, to gauge a project's true annual yield.",
    keywords: "irr calculator, internal rate of return calculator, cash flow return, project return calculator",
    faq: [
      ["What is IRR?", "The Internal Rate of Return is the discount rate at which a project's Net Present Value equals zero. It represents the effective annual return of its cash flows."],
      ["How is IRR calculated?", "There is no closed formula, so IRR is found numerically by testing discount rates until NPV reaches zero. This tool iterates to converge on that rate."],
      ["How do I use IRR to decide?", "Compare IRR with your required rate or cost of capital. If IRR exceeds it, the project is generally worthwhile; if lower, it may not justify the investment."]
    ],
    howTo: "Enter the initial investment and each year's cash flow. The calculator iterates to find the discount rate where NPV equals zero, giving the IRR."
  },
  "payback-period-calc": {
    title: "Free Payback Period Calculator — Recovery Time",
    desc: "Find how long an investment takes to recover its initial cost from annual cash inflows, shown in years and months, to compare how quickly projects return their outlay.",
    keywords: "payback period calculator, investment recovery calculator, roi payback, capital recovery period",
    faq: [
      ["What is the payback period?", "It is the time needed for cumulative cash inflows to equal the initial investment. A shorter payback means you recover your money faster with less risk."],
      ["How is the payback period calculated?", "Cash inflows are added year by year until they reach the initial cost. The fractional final year is prorated to express the answer in years and months."],
      ["What is the drawback of the payback method?", "Payback ignores the time value of money and any cash flows after recovery, so pair it with NPV or IRR for a complete view of a project's profitability."]
    ],
    howTo: "Enter the initial investment and each year's cash inflow. The calculator adds them until the cost is recovered and shows the payback period in years and months."
  },
  "dividend-yield-calc": {
    title: "Free Dividend Yield Calculator — Stock Income",
    desc: "Calculate the annual dividend yield of a stock from its dividend per share and current price, plus the yearly income on your holding. Not investment advice.",
    keywords: "dividend yield calculator, stock yield calculator, dividend income calculator, dividend per share",
    faq: [
      ["How is dividend yield calculated?", "Dividend yield = annual dividend per share / current share price × 100. A ₹10 dividend on a ₹200 share is a 5% yield."],
      ["What is a good dividend yield?", "It varies by sector and market. A very high yield can signal a falling share price or unsustainable payout, so weigh yield against the company's stability."],
      ["Does yield change with the share price?", "Yes. Since price is in the denominator, yield rises when the share price falls and falls when the price rises, even if the dividend amount stays the same."]
    ],
    howTo: "Enter the annual dividend per share, the current share price and your number of shares. The calculator shows the dividend yield and your yearly income."
  },
  "pe-ratio-calc": {
    title: "Free P/E Ratio Calculator — Price to Earnings",
    desc: "Calculate the price-to-earnings ratio and earnings yield of a stock from its share price and earnings per share, to help gauge how expensively it is valued.",
    keywords: "pe ratio calculator, price to earnings calculator, earnings yield calculator, stock valuation ratio",
    faq: [
      ["How is the P/E ratio calculated?", "P/E ratio = share price / earnings per share. A ₹200 stock earning ₹10 per share has a P/E of 20, meaning investors pay ₹20 for every ₹1 of earnings."],
      ["What does a high or low P/E mean?", "A high P/E can signal strong growth expectations or an overvalued stock, while a low P/E may mean it is undervalued or that growth prospects are weak."],
      ["What is earnings yield?", "Earnings yield is the inverse of P/E: EPS / price × 100. It expresses earnings as a percentage of price, making it easy to compare with bond or interest yields."]
    ],
    howTo: "Enter the current share price and earnings per share. The calculator shows the P/E ratio and the corresponding earnings yield instantly."
  },
  "dividend-payout-ratio-calc": {
    title: "Free Dividend Payout Ratio Calculator Online",
    desc: "Calculate the share of net income paid out as dividends and the retention ratio kept for growth, from dividends and earnings, to assess a company's payout policy.",
    keywords: "dividend payout ratio calculator, payout ratio, retention ratio calculator, dividend policy calculator",
    faq: [
      ["How is the dividend payout ratio calculated?", "Payout ratio = total dividends / net income × 100, or dividend per share / earnings per share. It shows how much profit is returned to shareholders."],
      ["What is the retention ratio?", "The retention ratio is the profit kept in the business: 100% minus the payout ratio. Retained earnings fund growth, debt repayment and reinvestment."],
      ["What payout ratio is healthy?", "It depends on the company's stage. Mature firms often pay out more, while growth firms retain most earnings. A payout above 100% is unsustainable long term."]
    ],
    howTo: "Enter total dividends and net income, or per-share figures. The calculator shows the dividend payout ratio and the retention ratio kept for growth."
  },
  "salary-hike-calc": {
    title: "Free Salary Hike Calculator — Raise Percentage",
    desc: "Calculate your new salary after a percentage raise, or find the hike percentage between an old and new salary, along with the exact increment amount you gained.",
    keywords: "salary hike calculator, salary increment calculator, pay raise calculator, hike percentage calculator",
    faq: [
      ["How is a salary hike percentage calculated?", "Hike% = (new salary − old salary) / old salary × 100. A jump from ₹50,000 to ₹60,000 is a ₹10,000 increment, a 20% hike."],
      ["How do I find my new salary from a hike percent?", "New salary = old salary × (1 + hike%). A 15% raise on ₹40,000 gives ₹40,000 × 1.15 = ₹46,000."],
      ["Should I compare CTC or in-hand for a hike?", "Compare like with like. A CTC hike may not fully reach your in-hand pay because of taxes and deductions, so check both figures when evaluating an offer."]
    ],
    howTo: "Enter your old salary with either a hike percentage or your new salary. The calculator shows the new pay, the hike percent and the increment amount."
  },
  "overtime-pay-calc": {
    title: "Free Overtime Pay Calculator — Time and a Half",
    desc: "Calculate total pay from regular plus overtime hours at any overtime multiplier such as time-and-a-half or double time, from your hourly rate and hours worked.",
    keywords: "overtime pay calculator, overtime calculator, time and a half calculator, double time pay",
    faq: [
      ["How is overtime pay calculated?", "Overtime pay = overtime hours × hourly rate × overtime multiplier. At time-and-a-half, a ₹200/hour rate pays ₹300 for each overtime hour."],
      ["What is time-and-a-half versus double time?", "Time-and-a-half pays 1.5× your normal rate for overtime hours, while double time pays 2×. This tool lets you set any multiplier that applies to you."],
      ["How is total pay worked out?", "Total pay adds regular pay (regular hours × rate) to overtime pay (overtime hours × rate × multiplier), giving your full earnings for the period."]
    ],
    howTo: "Enter your hourly rate, regular hours, overtime hours and the overtime multiplier. The calculator shows regular pay, overtime pay and total earnings."
  },
  "currency-denomination-calc": {
    title: "Free Cash Denomination Breakdown Calculator",
    desc: "Break any amount into the fewest currency notes and coins for INR or USD, ideal for cash handling, petty cash, salary disbursement and till preparation.",
    keywords: "cash denomination calculator, currency breakdown calculator, note counter, cash count calculator, denomination breakup",
    faq: [
      ["How does the denomination breakdown work?", "The calculator applies a greedy method, using the largest note first and moving down, so any amount is split into the fewest possible notes and coins."],
      ["Which currencies are supported?", "It supports Indian Rupee (INR) and US Dollar (USD) denominations. Select a currency to break your amount into that country's standard notes and coins."],
      ["Where is this useful?", "It helps cashiers, accountants and businesses plan cash for salary payouts, petty cash, ATMs and till floats without manually counting each denomination."]
    ],
    howTo: "Choose a currency and enter the total amount. The calculator lists how many of each note and coin make up the amount using the fewest pieces."
  },
  "effective-annual-rate-calc": {
    title: "Free Effective Annual Rate Calculator — APY",
    desc: "Calculate the effective annual rate (APY) from a nominal interest rate and its compounding frequency, including continuous compounding, to compare rates fairly.",
    keywords: "effective annual rate calculator, apy calculator, ear calculator, nominal to effective rate, continuous compounding",
    faq: [
      ["What is the effective annual rate?", "The EAR, or APY, is the true annual return once compounding is included. It is always at least the nominal rate and higher when compounding is more frequent."],
      ["How is EAR calculated?", "EAR = (1 + i/n)^n − 1, where i is the nominal annual rate and n the number of compounding periods per year. For continuous compounding, EAR = e^i − 1."],
      ["Why compare EAR instead of nominal rates?", "Two loans or deposits with the same nominal rate can differ if one compounds monthly and another yearly. EAR normalizes them so you compare true annual cost or yield."]
    ],
    howTo: "Enter the nominal annual rate and choose a compounding frequency, up to continuous. The calculator shows the effective annual rate (APY) for true comparison."
  },
  "annualized-return-calc": {
    title: "Free Annualized Return Calculator — Holding Yield",
    desc: "Calculate the holding period return and annualized return of an investment from its buy value, sell value, income and days held, to compare investments on a yearly basis.",
    keywords: "annualized return calculator, holding period return, cagr from dates, investment return calculator",
    faq: [
      ["What is holding period return?", "It is the total percentage gain over the time you held an investment: (sell value + income − buy value) / buy value × 100, regardless of how long you held it."],
      ["How is the annualized return calculated?", "The holding period return is scaled to a yearly rate using (1 + HPR)^(365/days) − 1, so investments held for different durations can be compared fairly."],
      ["Why annualize returns?", "A 10% gain in 6 months is far better than 10% over 3 years. Annualizing puts every investment on the same yearly basis so comparisons are meaningful."]
    ],
    howTo: "Enter your buy value, sell value, any income received and the number of days held. The calculator shows the holding period and annualized return."
  },
  // ── Health & Fitness ──
  "tdee-calc": {
    title: "Free TDEE Calculator — Daily Calorie Needs",
    desc: "Estimate your Total Daily Energy Expenditure from age, sex, height, weight and activity level using the Mifflin-St Jeor equation. For guidance only, not medical advice.",
    keywords: "tdee calculator, daily calorie calculator, maintenance calories, mifflin st jeor calculator, energy expenditure",
    faq: [
      ["What is TDEE?", "Total Daily Energy Expenditure is the calories you burn per day, including your basal metabolic rate plus activity. It is your maintenance calorie level."],
      ["How is TDEE calculated?", "This tool finds BMR with the Mifflin-St Jeor equation, then multiplies by an activity factor (1.2 sedentary to about 1.9 very active) to estimate TDEE."],
      ["How do I use TDEE for weight goals?", "Eat below your TDEE to lose weight and above it to gain. A deficit or surplus of around 500 calories a day changes weight by roughly half a kilo per week."]
    ],
    howTo: "Enter your age, sex, height, weight and activity level. The calculator applies the Mifflin-St Jeor formula to estimate your daily maintenance calories."
  },
  "macro-calc": {
    title: "Free Macro Calculator — Protein, Carbs & Fat",
    desc: "Split a daily calorie goal into protein, carbohydrate and fat grams using your chosen ratio, to plan meals for cutting, bulking or maintenance. Not medical advice.",
    keywords: "macro calculator, macronutrient calculator, protein carb fat calculator, iifym calculator, diet macros",
    faq: [
      ["How are macros calculated from calories?", "Each gram of protein and carbohydrate provides 4 calories and each gram of fat provides 9. Your calorie goal is split by the ratio you pick into grams of each."],
      ["What macro ratio should I use?", "A common balanced split is around 30% protein, 40% carbs and 30% fat, but athletes and specific diets vary widely. Adjust to your goals and preferences."],
      ["Why is protein important?", "Protein preserves muscle, especially in a calorie deficit, and keeps you full. Many plans target roughly 1.6–2.2 g of protein per kg of body weight."]
    ],
    howTo: "Enter your daily calorie goal and choose a macro ratio. The calculator converts it into grams of protein, carbohydrate and fat for your meal plan."
  },
  "protein-intake-calc": {
    title: "Free Protein Intake Calculator — Daily Grams",
    desc: "Find your recommended daily protein in grams based on body weight and activity or goal, from sedentary maintenance to muscle building. Guidance only, not medical advice.",
    keywords: "protein intake calculator, daily protein calculator, protein per kg, muscle protein calculator, protein needs",
    faq: [
      ["How much protein do I need per day?", "General health needs about 0.8 g per kg of body weight, active people 1.2–1.6 g, and those building muscle often aim for 1.6–2.2 g per kg."],
      ["Is protein based on body weight or calories?", "Protein targets are usually set per kilogram of body weight because muscle maintenance scales with body mass rather than total calorie intake."],
      ["Can I eat too much protein?", "For healthy people, moderately high protein is generally safe, but very high intakes offer little extra benefit. Those with kidney issues should seek medical advice."]
    ],
    howTo: "Enter your body weight and choose your activity level or goal. The calculator shows a recommended daily protein range in grams for that goal."
  },
  "heart-rate-zone-calc": {
    title: "Free Heart Rate Zone Calculator — Training Zones",
    desc: "Calculate your five heart rate training zones from your age and resting heart rate, to guide fat-burning, endurance and peak workouts. For guidance only, not medical advice.",
    keywords: "heart rate zone calculator, training zone calculator, max heart rate calculator, fat burn zone, cardio zones",
    faq: [
      ["How is maximum heart rate estimated?", "A common estimate is 220 minus your age, though individual maximums vary. Some tools also use the Karvonen method with your resting heart rate for more accuracy."],
      ["What are the five heart rate zones?", "Zones range from very light recovery (about 50–60% of max) up to peak effort (90–100%), each targeting different goals like fat burn, endurance or performance."],
      ["What is the Karvonen method?", "Karvonen uses heart rate reserve (max minus resting) to set zones, giving more personalised targets than a plain percentage of maximum heart rate."]
    ],
    howTo: "Enter your age and resting heart rate. The calculator estimates your maximum heart rate and shows the five training zones with their heart rate ranges."
  },
  "vo2max-calc": {
    title: "Free VO2 Max Calculator — Cardio Fitness Estimate",
    desc: "Estimate your VO2 max, a key measure of aerobic fitness, using the Cooper test distance or your resting heart rate method. For general guidance, not medical advice.",
    keywords: "vo2 max calculator, aerobic fitness calculator, cooper test calculator, cardio fitness, vo2max estimate",
    faq: [
      ["What is VO2 max?", "VO2 max is the maximum volume of oxygen your body can use during intense exercise, measured in ml/kg/min. A higher value indicates better aerobic fitness."],
      ["How does the Cooper test estimate VO2 max?", "It uses the distance run in 12 minutes: VO2 max ≈ (distance in metres − 504.9) / 44.73. The farther you run, the higher your estimated VO2 max."],
      ["How accurate are these estimates?", "Field estimates are approximations and can differ from a lab test. Use them to track your own progress over time rather than as an exact clinical figure."]
    ],
    howTo: "Choose the Cooper 12-minute distance or resting heart rate method and enter your values. The calculator estimates your VO2 max in ml/kg/min."
  },
  "pace-calc": {
    title: "Free Pace Calculator — Running Speed & Time",
    desc: "Convert between pace, speed, distance and time for running, cycling and walking. Enter any two values to solve the third, in metric or imperial units.",
    keywords: "pace calculator, running pace calculator, speed distance time calculator, race pace, min per km calculator",
    faq: [
      ["How is running pace calculated?", "Pace = time / distance, usually expressed as minutes per kilometre or mile. Running 10 km in 50 minutes is a pace of 5 minutes per kilometre."],
      ["What is the difference between pace and speed?", "Pace is time per unit distance (min/km), while speed is distance per unit time (km/h). Both describe the same effort from opposite angles."],
      ["How do I find my finish time?", "Enter your target pace and the race distance, and the calculator multiplies them to project your total finish time for the event."]
    ],
    howTo: "Enter any two of pace, speed, distance or time. The calculator solves for the remaining value and lets you switch between metric and imperial units."
  },
  "blood-alcohol-calc": {
    title: "Free Blood Alcohol Calculator — BAC Estimate",
    desc: "Estimate your blood alcohol concentration from drinks, body weight, sex and time using the Widmark formula. A rough guide only — never use it to decide if you can drive.",
    keywords: "blood alcohol calculator, bac calculator, widmark formula calculator, alcohol level estimate, drink calculator",
    faq: [
      ["How is BAC estimated?", "This tool uses the Widmark formula: BAC = (alcohol grams / (body weight × distribution ratio)) minus the alcohol metabolised over the time since drinking."],
      ["How accurate is a BAC estimate?", "It is only a rough approximation. Actual BAC depends on food, metabolism, medication and health, so never rely on it to judge whether you are fit to drive."],
      ["How long does alcohol take to leave the body?", "The body clears alcohol at roughly 0.015 BAC per hour on average, but this varies by person. Only time reduces BAC — coffee and water do not speed it up."]
    ],
    howTo: "Enter the number and size of drinks, your body weight, sex and time elapsed. The calculator applies the Widmark formula for an approximate BAC. Never drink and drive."
  },
  "sleep-calc": {
    title: "Free Sleep Calculator — Best Bed & Wake Times",
    desc: "Find the best times to sleep or wake based on 90-minute sleep cycles, so you rise between cycles feeling refreshed rather than groggy. For general guidance only.",
    keywords: "sleep calculator, sleep cycle calculator, bedtime calculator, wake up time calculator, 90 minute cycles",
    faq: [
      ["How does the sleep cycle calculator work?", "Sleep runs in roughly 90-minute cycles. The tool counts back or forward in 90-minute blocks (plus time to fall asleep) so you wake between cycles, not mid-cycle."],
      ["Why does waking between cycles feel better?", "Waking during deep sleep leaves you groggy. Waking at the end of a cycle, in lighter sleep, tends to feel more refreshing even with the same total hours."],
      ["How many sleep cycles do I need?", "Most adults do best with 5 to 6 complete cycles, about 7.5 to 9 hours. The calculator suggests times that give whole cycles within that range."]
    ],
    howTo: "Enter the time you want to wake up or the time you plan to sleep. The calculator suggests ideal bed or wake times aligned to 90-minute sleep cycles."
  },
  "blood-pressure-calc": {
    title: "Free Blood Pressure Classifier — BP Category Chart",
    desc: "Classify a blood pressure reading into categories from normal to hypertensive crisis using your systolic and diastolic values, with a reference chart. Not medical advice.",
    keywords: "blood pressure calculator, bp classifier, hypertension calculator, systolic diastolic chart, bp category",
    faq: [
      ["How is blood pressure classified?", "Readings use systolic over diastolic. Common categories are normal, elevated, and stage 1 and stage 2 hypertension, with very high readings flagged as a crisis."],
      ["What do systolic and diastolic mean?", "Systolic is the top number, the pressure when the heart beats, and diastolic is the bottom number, the pressure between beats when the heart rests."],
      ["Is this a diagnosis?", "No. This tool only classifies a single reading against standard ranges. Diagnosing high blood pressure needs repeated measurements and a doctor's assessment."]
    ],
    howTo: "Enter your systolic and diastolic numbers. The calculator places the reading into its blood pressure category and shows a reference chart. Not medical advice."
  },
  "blood-sugar-converter": {
    title: "Free Blood Sugar Converter — mg/dL to mmol/L",
    desc: "Convert blood glucose between mg/dL and mmol/L and see the general category for the reading, useful when comparing lab results across regions. Not medical advice.",
    keywords: "blood sugar converter, glucose converter, mg/dl to mmol/l, blood glucose calculator, sugar level converter",
    faq: [
      ["How do I convert mg/dL to mmol/L?", "Divide the mg/dL value by 18 to get mmol/L, and multiply mmol/L by 18 to go back. For example, 90 mg/dL equals 5.0 mmol/L."],
      ["Why do countries use different units?", "The United States and a few others report glucose in mg/dL, while most of the world uses mmol/L. Converting lets you compare readings from different sources."],
      ["What are normal blood sugar ranges?", "Fasting glucose is often considered normal around 70–99 mg/dL (3.9–5.5 mmol/L), but targets vary by person. Always confirm ranges with your doctor."]
    ],
    howTo: "Enter a glucose value in either mg/dL or mmol/L. The calculator converts it to the other unit and shows the general category for the reading."
  },
  "bmi-calculator": {
    title: "Free BMI Calculator — Body Mass Index Online",
    desc: "Calculate Body Mass Index from weight and height in metric or imperial units, with both WHO and Asian-Indian category tables. A screening guide, not medical advice.",
    keywords: "bmi calculator, body mass index calculator, bmi chart, weight category calculator, asian bmi calculator",
    faq: [
      ["How is BMI calculated?", "BMI = weight in kilograms / (height in metres)². For imperial, BMI = 703 × weight in pounds / (height in inches)². The result is compared against category ranges."],
      ["What are the BMI categories?", "WHO ranges are underweight below 18.5, normal 18.5–24.9, overweight 25–29.9 and obese 30 or above. Asian-Indian cut-offs flag risk at lower BMI values."],
      ["What are the limitations of BMI?", "BMI does not distinguish muscle from fat or account for body composition, so athletes may read high. Treat it as a rough screening tool, not a diagnosis."]
    ],
    howTo: "Enter your weight and height in metric or imperial units. The calculator computes your BMI and shows the WHO and Asian-Indian weight categories."
  },
  // ── Everyday / Unit ──
  "aspect-ratio-calc": {
    title: "Free Aspect Ratio Calculator — Resize Dimensions",
    desc: "Find the aspect ratio of a width and height, or compute a missing dimension that keeps the same ratio, ideal for images, video, screens and design layouts.",
    keywords: "aspect ratio calculator, resize calculator, image ratio calculator, 16:9 calculator, proportional resize",
    faq: [
      ["How is aspect ratio calculated?", "Aspect ratio is width divided by height, simplified to whole numbers using the greatest common divisor. 1920×1080 simplifies to a 16:9 ratio."],
      ["How do I resize while keeping the ratio?", "Enter the original width and height plus one new dimension, and the calculator finds the other so the image or video is not stretched or squashed."],
      ["What are common aspect ratios?", "16:9 for widescreen video, 4:3 for older displays, 1:1 for square social posts, and 21:9 for ultrawide. Photos often use 3:2 or 4:3."]
    ],
    howTo: "Enter a width and height to see the simplified aspect ratio, or enter one new dimension to get the matching value that preserves the ratio."
  },
  "ppi-dpi-calc": {
    title: "Free PPI/DPI Calculator — Pixel Density Online",
    desc: "Calculate a screen's pixels per inch from its resolution and diagonal size, to compare display sharpness across phones, monitors and TVs. Fast and accurate.",
    keywords: "ppi calculator, dpi calculator, pixel density calculator, screen ppi, display sharpness calculator",
    faq: [
      ["How is PPI calculated?", "PPI = √(width² + height²) in pixels / diagonal screen size in inches. It combines the resolution and physical size to measure pixel density."],
      ["What is the difference between PPI and DPI?", "PPI (pixels per inch) describes screen pixel density, while DPI (dots per inch) refers to print resolution. The terms are often used interchangeably for displays."],
      ["Why does PPI matter?", "Higher PPI means sharper images and text, as individual pixels become harder to see. Small high-resolution screens like phones have very high PPI."]
    ],
    howTo: "Enter the horizontal and vertical resolution in pixels and the diagonal screen size in inches. The calculator shows the display's pixels per inch."
  },
  "fuel-cost-calc": {
    title: "Free Fuel Cost Calculator — Trip Fuel Estimate",
    desc: "Estimate the fuel cost of any trip from distance, your vehicle's fuel efficiency and the fuel price, so you can budget journeys and compare routes or vehicles.",
    keywords: "fuel cost calculator, trip fuel calculator, gas cost calculator, mileage cost calculator, petrol cost",
    faq: [
      ["How is trip fuel cost calculated?", "Fuel used = distance / fuel efficiency, then cost = fuel used × price per unit. For 300 km at 15 km/l and ₹100/l, that is 20 litres costing ₹2,000."],
      ["What efficiency figure should I enter?", "Use your vehicle's real-world mileage in km per litre (or miles per gallon), which is often lower than the official rating in city driving."],
      ["Can I compare two vehicles?", "Yes. Run the same trip with each vehicle's efficiency to see the cost difference, which helps when choosing a car or planning a long journey."]
    ],
    howTo: "Enter the trip distance, your vehicle's fuel efficiency and the price per litre or gallon. The calculator shows the fuel needed and the total trip cost."
  },
  "electricity-cost-calc": {
    title: "Free Electricity Cost Calculator — Appliance Bill",
    desc: "Estimate an appliance's electricity cost from its wattage, hours of use and your unit tariff, revealing daily, monthly and yearly running costs to cut your power bill.",
    keywords: "electricity cost calculator, appliance energy calculator, power bill calculator, kwh cost calculator, energy cost",
    faq: [
      ["How is electricity cost calculated?", "Energy in kWh = watts × hours / 1000, then cost = kWh × tariff. A 1000 W device run 3 hours uses 3 kWh; at ₹8 per unit that is ₹24 a day."],
      ["What is a kWh?", "A kilowatt-hour is the energy of 1000 watts running for one hour, and it is the unit your electricity provider bills. The tariff is the price per kWh."],
      ["How can I lower my electricity bill?", "Reduce running hours, use lower-wattage or energy-efficient appliances, and target the biggest consumers like heaters, air conditioners and geysers first."]
    ],
    howTo: "Enter the appliance wattage, hours used per day and your cost per unit. The calculator shows daily, monthly and yearly electricity costs."
  },
  "ohms-law-calc": {
    title: "Free Ohm's Law Calculator — Volts, Amps, Ohms",
    desc: "Solve any of voltage, current, resistance or power using Ohm's law. Enter any two known values and the calculator computes the remaining electrical quantities.",
    keywords: "ohms law calculator, voltage current resistance calculator, power calculator, v=ir calculator, electrical calculator",
    faq: [
      ["What is Ohm's law?", "Ohm's law states V = I × R: voltage equals current times resistance. From any two values you can find the third, and power follows as P = V × I."],
      ["How is electrical power calculated?", "Power P = V × I, and by substitution P = I² × R or P = V² / R. Enter any two of the four quantities and the calculator derives the rest."],
      ["What units does the calculator use?", "Voltage is in volts (V), current in amperes (A), resistance in ohms (Ω) and power in watts (W). Enter values in these base units for correct results."]
    ],
    howTo: "Enter any two of voltage, current, resistance or power. The calculator applies Ohm's law to solve for the remaining electrical values instantly."
  },
};
// ───── END PER-TOOL SEO METADATA ─────────────────────────────────────────────

function ToolPage({ toolId }) {
  const tool = TOOLS.find(t => t.id === toolId);
  const meta = TOOL_META[toolId];
  const ToolComp = TOOL_COMPONENTS[toolId];
  useEffect(() => {
    document.title = meta?.title || `${tool?.name} – Free Finance Calculator | ToolsRift`;
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
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 20px 60px" }}>
      <Breadcrumb cat={cat} />
      <h1 style={T.h1}>{cat.icon} {cat.name}</h1>
      <p style={{ color: C.muted, marginTop: 8, marginBottom: 16 }}>{cat.desc}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
        {items.map((t) => (
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
      {cats.map((c) => (
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
        searchPlaceholder="Search finance & health calculators..."
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
      borderBottom: `1px solid ${scrolled ? "rgba(34,197,94,0.2)" : C.border}`,
      transition: "background 0.2s, border-color 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <a href="/" aria-label="ToolsRift home" style={{display:"flex",alignItems:"center",flexShrink:0}}><img src="/logo.svg" alt="ToolsRift" style={{height:26,display:"block"}}/></a>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>›</span>
        <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 500, color: C.blue }}>{THEME?.name}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ background: "rgba(34,197,94,0.12)", color: C.blue, border: "1px solid rgba(34,197,94,0.25)", borderRadius: 20, fontSize: 11, fontWeight: 700, padding: "3px 10px", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{TOOLS.length} tools</span>
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
  ].filter((p) => !p.href.endsWith("/" + currentPage));
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px 28px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Explore More Tools</span>
        <a href="/" style={{ fontSize: 12, color: C.blue, textDecoration: "none", fontWeight: 600 }}>← Back to Home</a>
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

function ToolsRiftCalcFinance() {
  const route = useAppRouter();
  const showChrome = route.page !== 'home' && route.page !== 'tool';
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>
      {showChrome && <Nav />}
      {route.page === "home" && <HomePage />}
      {route.page === "tool" && <ToolPage toolId={route.toolId} />}
      {route.page === "category" && <CategoryPage catId={route.catId} />}
      {showChrome && <SiteFooter currentPage="financecalc" />}
    </div>
  );
}

export default ToolsRiftCalcFinance;
