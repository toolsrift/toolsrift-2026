import { useState } from "react";

const PHASES = [
  {
    id: "done", name: "✅ Already Built", color: "#22C55E", count: 85,
    batches: [
      { name: "Calculators", count: 52, status: "done", tools: "Basic, Scientific, Percentage, Fraction, Ratio, Average, Mean/Median/Mode, Std Dev, Probability, Perm/Comb, BMI, BMR, Body Fat, Calorie, Ideal Weight, Pregnancy, Ovulation, Water Intake, EMI, Loan, Mortgage, Interest, Compound Interest, Simple Interest, Discount, Profit Margin, GST, VAT, Sales Tax, Currency, Salary, Inflation, ROI, SIP, FD, Retirement, Age, Date Diff, Days Between, Working Days, Countdown, Timezone, GPA, CGPA, Pct→GPA, Marks%, CPM, CPC, CTR, ROI Ads, Keyword Density, Readability" },
      { name: "Business & Marketing", count: 15, status: "done", tools: "Invoice, Receipt, Quotation, Business Card, Resume, Cover Letter, SWOT, Marketing Plan, Persona, UTM Builder, Ad Copy, Sales Copy, Landing Copy, ROI, Break Even" },
      { name: "One Per Category", count: 18, status: "done", tools: "Meta Tag Gen, Word Counter, Image Resizer, PDF Merger, JSON Formatter, Base64, Color Converter, Length Converter, Password Gen, Hashtag Gen, Email Validator, DNS Lookup, Password Strength, File→Base64, Lorem Ipsum, Case Converter, AI Writer, Text to Speech" },
    ]
  },
  {
    id: "phase2", name: "🔥 Phase 2: High Traffic", color: "#3B82F6", count: 180,
    desc: "BUILD NEXT — These tools drive 40% of organic traffic",
    batches: [
      { name: "2A: Text & Content Tools", count: 45, priority: "⭐⭐⭐⭐⭐", search: "200K+/mo combined", status: "next", reason: "Every writer/marketer needs these. Word counter alone gets 200K searches." },
      { name: "2B: Encoder/Decoder Tools", count: 25, priority: "⭐⭐⭐⭐⭐", search: "300K+/mo combined", status: "pending", reason: "Base64, URL encode, JWT — developers search these daily." },
      { name: "2C: Hash & Crypto Tools", count: 25, priority: "⭐⭐⭐⭐⭐", search: "350K+/mo combined", status: "pending", reason: "MD5 alone gets 150K/mo. Zero client-side competition." },
      { name: "2D: JSON Tools", count: 25, priority: "⭐⭐⭐⭐⭐", search: "400K+/mo combined", status: "pending", reason: "JSON formatter/validator = massive developer traffic." },
      { name: "2E: CSS Generators", count: 20, priority: "⭐⭐⭐⭐", search: "250K+/mo combined", status: "pending", reason: "Visual tools designers love. High engagement." },
      { name: "2F: Color Tools", count: 20, priority: "⭐⭐⭐⭐", search: "300K+/mo combined", status: "pending", reason: "Color picker = 100K/mo. Great for SEO." },
      { name: "2G: Unit Converters", count: 25, priority: "⭐⭐⭐⭐", search: "200K+/mo combined", status: "pending", reason: "Temperature converter alone = 80K/mo." },
    ]
  },
  {
    id: "phase3", name: "📦 Phase 3: Medium Traffic", color: "#8B5CF6", count: 300,
    desc: "Image, PDF, HTML, JS, Code formatters, Fancy text, Encoding",
    batches: [
      { name: "3A: Image Tools", count: 50, priority: "⭐⭐⭐⭐", search: "150K+/mo", status: "pending", reason: "Image resize/compress = huge traffic. Needs canvas APIs." },
      { name: "3B: PDF Tools", count: 28, priority: "⭐⭐⭐⭐", search: "200K+/mo", status: "pending", reason: "PDF merge/split = massive. Needs pdf-lib library." },
      { name: "3C: HTML Tools", count: 25, priority: "⭐⭐⭐", search: "80K+/mo", status: "pending", reason: "HTML beautifier/minifier — solid developer traffic." },
      { name: "3D: JavaScript Tools", count: 10, priority: "⭐⭐⭐", search: "50K+/mo", status: "pending", reason: "JS beautifier/minifier — niche but loyal users." },
      { name: "3E: Code Formatters", count: 25, priority: "⭐⭐⭐", search: "60K+/mo", status: "pending", reason: "SQL, PHP, Python formatters — developer daily tools." },
      { name: "3F: Fancy Text Generators", count: 20, priority: "⭐⭐⭐", search: "100K+/mo", status: "pending", reason: "Viral social media potential. Easy to build." },
      { name: "3G: Text Encoding", count: 11, priority: "⭐⭐⭐", search: "30K+/mo", status: "pending", reason: "Morse code, binary text — fun + educational." },
    ]
  },
  {
    id: "phase4", name: "📈 Phase 4: Long-Tail SEO", color: "#F59E0B", count: 400,
    desc: "Generators, additional calculators, niche converters, dev tools",
    batches: [
      { name: "4A: Generator Tools", count: 100, priority: "⭐⭐⭐", search: "Various", status: "pending", reason: "100+ generators = 100+ SEO landing pages. QR codes, passwords, legal docs." },
      { name: "4B: Additional Calculators", count: 60, priority: "⭐⭐⭐", search: "Various", status: "pending", reason: "Geometry, advanced math, more finance — fills gaps." },
      { name: "4C: Niche Converters", count: 20, priority: "⭐⭐", search: "Various", status: "pending", reason: "Force, torque, electrical — niche but zero competition." },
      { name: "4D: Developer Tools", count: 40, priority: "⭐⭐⭐", search: "Various", status: "pending", reason: "Code playground, regex debugger, API tester — sticky users." },
    ]
  },
  {
    id: "phase5", name: "🔒 Phase 5: Backend/API Tools", color: "#EF4444", count: 200,
    desc: "REQUIRES: Node.js server, external APIs — Pro subscription features",
    batches: [
      { name: "5A: SEO Analysis Tools", count: 40, priority: "⭐⭐⭐⭐", search: "High", status: "backend", reason: "DA checker, backlink checker — needs Moz/Ahrefs API." },
      { name: "5B: Technical SEO", count: 30, priority: "⭐⭐⭐⭐", search: "High", status: "backend", reason: "Page speed, broken links — needs server-side crawling." },
      { name: "5C: Link Tools", count: 13, priority: "⭐⭐⭐", search: "Medium", status: "backend", reason: "Backlink analysis — needs link index API." },
      { name: "5D: DNS & Network", count: 25, priority: "⭐⭐⭐", search: "Medium", status: "backend", reason: "WHOIS, DNS lookup — needs DNS resolver backend." },
      { name: "5E: SSL & Security", count: 17, priority: "⭐⭐⭐", search: "Medium", status: "backend", reason: "SSL checker, malware scan — needs HTTPS inspection." },
      { name: "5F: Email Tools", count: 15, priority: "⭐⭐⭐", search: "Medium", status: "backend", reason: "Email validation (MX check) — needs DNS queries." },
    ]
  },
  {
    id: "phase6", name: "🤖 Phase 6: AI-Powered", color: "#7C3AED", count: 30,
    desc: "REQUIRES: LLM API — Premium Pro features",
    batches: [
      { name: "6A: AI Writing Tools", count: 20, priority: "⭐⭐⭐⭐", search: "High", status: "ai", reason: "AI writer, rewriter, grammar fixer — high willingness to pay." },
      { name: "6B: AI Developer Tools", count: 10, priority: "⭐⭐⭐", search: "Medium", status: "ai", reason: "AI code gen, regex gen, SQL gen — dev productivity." },
    ]
  },
];

const TIMELINE = [
  { month: "Month 1", tools: 95, total: 180, phase: "Phase 2A-C", action: "Text tools + Encoders + Hash" },
  { month: "Month 2", tools: 90, total: 270, phase: "Phase 2D-G", action: "JSON + CSS + Color + Converters" },
  { month: "Month 3", tools: 138, total: 408, phase: "Phase 3A-E", action: "Image + PDF + HTML/JS/Code" },
  { month: "Month 4", tools: 131, total: 539, phase: "Phase 3F + 4A", action: "Fancy Text + Generators" },
  { month: "Month 5", tools: 120, total: 659, phase: "Phase 4B-D", action: "More Calcs + Dev Tools → PUBLIC BETA" },
  { month: "Month 6", tools: 200, total: 859, phase: "Phase 5", action: "Backend setup → PRO LAUNCH" },
  { month: "Month 7+", tools: 170, total: 1029, phase: "Phase 6 + Polish", action: "AI Tools → 1000+ TOOLS" },
];

function ToolsRiftRoadmap() {
  const [expanded, setExpanded] = useState("phase2");
  const [view, setView] = useState("overview");
  const totalBuilt = 85;
  const totalPlanned = 1600;
  const pct = ((totalBuilt / totalPlanned) * 100).toFixed(1);

  return (
    <div style={{ minHeight: "100vh", background: "#06090F", color: "#E2E8F0", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}details summary::-webkit-details-marker{display:none}`}</style>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: 'rgba(6,9,15,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="https://toolsrift.com" style={{ textDecoration: 'none' }}>
          <img src="/logo.svg" alt="ToolsRift" style={{ height: 36 }} />
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="/" style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none', fontWeight: 500 }}>Home</a>
          <a href="/" style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none', fontWeight: 500 }}>All Tools</a>
        </div>
      </nav>

      <div style={{ padding: "24px 32px", maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#3B82F6", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>ToolsRift Build Roadmap</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Outfit',sans-serif", marginBottom: 12 }}>1,600+ Tools Priority Plan</h1>
        <p style={{ color: "#64748B", fontSize: 15, maxWidth: 600, margin: "0 auto" }}>Organized by search volume, build complexity, and revenue potential. Built tools stay — everything else is prioritized for maximum SEO impact.</p>
      </div>

      {/* Progress Bar */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 24, marginBottom: 24, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>Overall Progress</span>
          <span style={{ color: "#22C55E", fontWeight: 700 }}>{totalBuilt} / {totalPlanned} tools ({pct}%)</span>
        </div>
        <div style={{ height: 12, borderRadius: 6, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #22C55E, #3B82F6)", borderRadius: 6, transition: "width 1s" }} />
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
          {[["✅ Built", 85, "#22C55E"], ["🔥 Phase 2", 180, "#3B82F6"], ["📦 Phase 3", 300, "#8B5CF6"], ["📈 Phase 4", 400, "#F59E0B"], ["🔒 Phase 5", 200, "#EF4444"], ["🤖 Phase 6", 30, "#7C3AED"]].map(([l, c, col]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: col }} />
              <span style={{ color: "#94A3B8" }}>{l}: {c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* View Toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[["overview", "📋 Phase Overview"], ["timeline", "📅 Build Timeline"], ["revenue", "💰 Revenue Plan"]].map(([v, l]) => (
          <button key={v} onClick={() => setView(v)} style={{ padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "'Outfit',sans-serif", background: view === v ? "linear-gradient(135deg,#3B82F6,#2563EB)" : "rgba(255,255,255,0.06)", color: view === v ? "#fff" : "#94A3B8" }}>{l}</button>
        ))}
      </div>

      {/* Phase Overview */}
      {view === "overview" && PHASES.map(phase => (
        <div key={phase.id} style={{ marginBottom: 12 }}>
          <div onClick={() => setExpanded(expanded === phase.id ? null : phase.id)}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderRadius: expanded === phase.id ? "12px 12px 0 0" : 12, cursor: "pointer", background: "rgba(255,255,255,0.03)", border: `1px solid ${expanded === phase.id ? phase.color + "44" : "rgba(255,255,255,0.06)"}`, borderBottom: expanded === phase.id ? "none" : undefined }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${phase.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{phase.name.split(" ")[0]}</div>
              <div>
                <div style={{ fontWeight: 700, fontFamily: "'Outfit',sans-serif", fontSize: 16 }}>{phase.name}</div>
                {phase.desc && <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{phase.desc}</div>}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ padding: "4px 12px", borderRadius: 6, background: `${phase.color}22`, color: phase.color, fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{phase.count}</div>
              <span style={{ color: "#64748B", fontSize: 18 }}>{expanded === phase.id ? "▼" : "▶"}</span>
            </div>
          </div>
          {expanded === phase.id && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${phase.color}22`, borderTop: "none", borderRadius: "0 0 12px 12px", padding: "16px 20px" }}>
              {phase.batches.map((b, i) => (
                <div key={i} style={{ padding: "12px 16px", marginBottom: 8, borderRadius: 10, background: b.status === "done" ? "rgba(34,197,94,0.06)" : b.status === "next" ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${b.status === "done" ? "rgba(34,197,94,0.15)" : b.status === "next" ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14 }}>{b.status === "done" ? "✅" : b.status === "next" ? "🔥" : b.status === "backend" ? "🔒" : b.status === "ai" ? "🤖" : "⏳"}</span>
                      <span style={{ fontWeight: 700, fontSize: 14, fontFamily: "'Outfit',sans-serif" }}>{b.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {b.priority && <span style={{ fontSize: 11, color: "#F59E0B" }}>{b.priority}</span>}
                      <span style={{ padding: "2px 8px", borderRadius: 4, background: phase.color + "22", color: phase.color, fontSize: 12, fontWeight: 700 }}>{b.count} tools</span>
                    </div>
                  </div>
                  {b.reason && <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 6 }}>{b.reason}</div>}
                  {b.search && <div style={{ fontSize: 11, color: "#64748B" }}>📊 Est. search volume: {b.search}</div>}
                  {b.tools && (
                    <details style={{ marginTop: 8 }}>
                      <summary style={{ fontSize: 11, color: "#64748B", cursor: "pointer" }}>View all {b.count} tools →</summary>
                      <div style={{ fontSize: 11, color: "#475569", marginTop: 6, lineHeight: 1.8, fontFamily: "'JetBrains Mono',monospace" }}>{b.tools}</div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Timeline View */}
      {view === "timeline" && (
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Outfit',sans-serif", marginBottom: 20 }}>7-Month Build Timeline</h2>
          {TIMELINE.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "start" }}>
              <div style={{ width: 100, flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontWeight: 700, color: "#3B82F6", fontFamily: "'Outfit',sans-serif" }}>{t.month}</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>{t.phase}</div>
              </div>
              <div style={{ width: 2, background: "rgba(59,130,246,0.3)", minHeight: 80, position: "relative", flexShrink: 0 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: i === 0 ? "#3B82F6" : "rgba(59,130,246,0.4)", position: "absolute", top: 4, left: -5 }} />
              </div>
              <div style={{ flex: 1, padding: "12px 16px", borderRadius: 10, background: i === 0 ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${i === 0 ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{t.action}</span>
                  <span style={{ color: "#22C55E", fontWeight: 700, fontSize: 13 }}>+{t.tools} tools → {t.total} total</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(t.total / totalPlanned) * 100}%`, background: `linear-gradient(90deg, #22C55E, #3B82F6)`, borderRadius: 3 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revenue View */}
      {view === "revenue" && (
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Outfit',sans-serif", marginBottom: 20 }}>Revenue & Traffic Projections</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Month 3", traffic: "5K/mo", revenue: "$0", tools: "270", milestone: "SEO indexing begins" },
              { label: "Month 6", traffic: "50K/mo", revenue: "$500/mo", tools: "659", milestone: "Pro launch" },
              { label: "Month 9", traffic: "200K/mo", revenue: "$5K/mo", tools: "859", milestone: "Profitable" },
              { label: "Year 2", traffic: "1M/mo", revenue: "$30K+/mo", tools: "1000+", milestone: "Market leader" },
            ].map((p, i) => (
              <div key={i} style={{ padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontWeight: 800, color: "#3B82F6", fontFamily: "'Outfit',sans-serif", marginBottom: 8 }}>{p.label}</div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}><span style={{ color: "#64748B" }}>Traffic</span><span style={{ fontWeight: 600 }}>{p.traffic}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}><span style={{ color: "#64748B" }}>Revenue</span><span style={{ fontWeight: 600, color: "#22C55E" }}>{p.revenue}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}><span style={{ color: "#64748B" }}>Tools</span><span style={{ fontWeight: 600 }}>{p.tools}</span></div>
                <div style={{ marginTop: 8, fontSize: 11, color: "#F59E0B", fontWeight: 600 }}>🎯 {p.milestone}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: 20, borderRadius: 12, background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div style={{ fontWeight: 700, fontFamily: "'Outfit',sans-serif", marginBottom: 12 }}>💡 Monetization Strategy</div>
            {[
              ["Free Tier", "$0/mo", "5 uses/tool/day, 400+ tools, standard processing"],
              ["Pro Tier", "$12/mo", "Unlimited usage, all 1000+ tools, bulk ops, CSV export, API access"],
              ["API Access", "$49/mo", "REST API for all tools, 10K requests/mo, webhooks"],
              ["Enterprise", "$199/mo", "White-label, custom domain, priority support, SLA"],
            ].map(([name, price, desc], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <div><span style={{ fontWeight: 600, fontSize: 14 }}>{name}</span><span style={{ color: "#64748B", fontSize: 12, marginLeft: 8 }}>{desc}</span></div>
                <span style={{ fontWeight: 700, color: "#22C55E", fontFamily: "'JetBrains Mono',monospace" }}>{price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Recommendation */}
      <div style={{ marginTop: 32, padding: 24, borderRadius: 14, background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.04))", border: "1px solid rgba(59,130,246,0.15)", textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Outfit',sans-serif", marginBottom: 8 }}>🎯 Recommended Next Step</div>
        <div style={{ color: "#94A3B8", fontSize: 14, lineHeight: 1.6, maxWidth: 600, margin: "0 auto" }}>
          Build <strong style={{ color: "#3B82F6" }}>Batch 2A: Text & Content Tools (45 tools)</strong> — these are the highest-traffic, easiest-to-build tools. Word counter variations alone drive 200K+ monthly searches and they're 100% client-side.
        </div>
      </div>

      </div>{/* end inner padding div */}

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '28px 24px', textAlign: 'center', color: '#64748B', fontSize: 13, marginTop: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 16px', marginBottom: 12 }}>
          {[['Home','/'],['Text Tools','/text'],['PDF Tools','/pdf'],['Image Tools','/images'],
            ['JSON Tools','/json'],['CSS Tools','/css'],['Dev Tools','/devtools'],
            ['Calculators','/#/category/calculator'],['Business','/business']].map(([n,h]) => (
            <a key={h} href={h} style={{ color: '#64748B', textDecoration: 'none' }}>{n}</a>
          ))}
        </div>
        <div>© 2026 ToolsRift · Free online tools, powered by ads.</div>
      </footer>
    </div>
  );
}

export default ToolsRiftRoadmap;
