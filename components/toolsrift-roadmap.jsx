import { useState } from "react";

const PHASES = [
  {
    id: "done", name: "✅ Shipped", color: "#22C55E", count: 1136,
    desc: "All 29 categories are live — every tool runs 100% in your browser",
    batches: [
      { name: "Everyday & Core Calculators", count: 95, status: "done", tools: "Basic, Scientific, Percentage, Fraction, Ratio, Average, Age, Date Diff, Days Between, Working Days, Countdown, Timezone, GPA, CGPA, Tip, Discount, and many more everyday calculators" },
      { name: "Math Calculators", count: 50, status: "done", tools: "Geometry, Algebra, Trigonometry, Matrix, Number Theory, Statistics, Std Dev, Probability, Permutation/Combination, Quadratic, and more" },
      { name: "Finance & Health Calculators", count: 55, status: "done", tools: "EMI, Loan, Mortgage, Interest, Compound Interest, SIP, FD, ROI, Retirement, GST/VAT/Sales Tax, BMI, BMR, Body Fat, TDEE, Calorie, Ideal Weight, Pregnancy, and more" },
      { name: "Unit Converters", count: 42, status: "done", tools: "Length, Weight, Temperature, Speed, Area, Volume, Time, Pressure, Energy, Data, Angle, and more" },
      { name: "Specialty Converters", count: 26, status: "done", tools: "Electrical units, Clothing sizes, Paper sizes, Physical constants, Force, Torque, and more" },
      { name: "Text Tools", count: 72, status: "done", tools: "Word Counter, Character Counter, Case Converter, Lorem Ipsum, Readability, Find & Replace, Remove Duplicates, Sort Lines, and more" },
      { name: "Fancy Text Generators", count: 26, status: "done", tools: "Bold, Italic, Cursive, Gothic, Bubble, Strikethrough and 20+ Unicode text styles" },
      { name: "Text Encoding", count: 16, status: "done", tools: "Morse Code, Binary, Octal, NATO Alphabet, Caesar Cipher, ROT13, and more" },
      { name: "Encoders & Decoders", count: 32, status: "done", tools: "Base64, URL, HTML Entities, JWT Decoder, Hex, and more" },
      { name: "Hash & Crypto", count: 30, status: "done", tools: "MD5, SHA-1, SHA-256, SHA-512, HMAC, Bcrypt, UUID, and more" },
      { name: "JSON Tools", count: 32, status: "done", tools: "Formatter, Validator, Minifier, Compare, JSON→CSV/YAML/XML, JSONPath tester, and more" },
      { name: "HTML Tools", count: 30, status: "done", tools: "Formatter, Minifier, Validator, Encoder/Decoder, Table Generator, Meta Tag Generator, and more" },
      { name: "JavaScript Tools", count: 14, status: "done", tools: "Formatter, Minifier, Validator, Obfuscator, JSON→JS Object, and more" },
      { name: "Code Formatters", count: 30, status: "done", tools: "CSS, SQL, XML, YAML, Markdown, PHP, Python beautifiers and more" },
      { name: "CSS Generators", count: 28, status: "done", tools: "Gradient, Box Shadow, Border Radius, Animation, Flexbox, Grid, and more" },
      { name: "Color Tools", count: 28, status: "done", tools: "Picker, HEX/RGB/HSL/CMYK Converter, Palette Generator, Gradient Maker, Contrast Checker, and more" },
      { name: "Image Tools", count: 70, status: "done", tools: "Resize, Compress, Crop, Convert, Flip, Filter, and more — all in-browser" },
      { name: "PDF Tools", count: 34, status: "done", tools: "Merge, Split, Compress, PDF→Text, Rotate, and more — no uploads" },
      { name: "Security & ID Generators", count: 53, status: "done", tools: "Password, UUID, API Key, Token, PIN, and more" },
      { name: "Content Generators", count: 55, status: "done", tools: "Privacy Policy, Terms of Service, SVG Pattern Art, Marketing Copy, Lorem, and more" },
      { name: "Dev Config Generators", count: 39, status: "done", tools: ".gitignore, Dockerfile, nginx config, package.json, .env templates, and more" },
      { name: "Developer Tools", count: 70, status: "done", tools: "Regex Tester, JSON Diff, JWT Debugger, Cron Builder, chmod Calculator, Color Scheme Generator, and more" },
      { name: "Business & Marketing", count: 41, status: "done", tools: "Invoice, Receipt, Quotation, Payslip, Rent Receipt, Offer/Appointment/Experience Letters, Credit/Debit Notes, Profit & Loss, Balance Sheet, Resume, Cover Letter, SWOT, UTM Builder, and more" },
      { name: "Randomizers & Games", count: 40, status: "done", tools: "Spinner Wheel, Dice Roller, Random Picker, Lottery Numbers, Tournament Bracket, Would You Rather, Trivia, Tarot Card, and more" },
      { name: "Audio Tools", count: 30, status: "done", tools: "Trimmer, Merger, Converter, Voice Recorder, Text to Speech, Waveform Viewer, BPM Detector, Tone & Noise Generators, and more — 100% in-browser, nothing uploaded" },
      { name: "Office & Productivity", count: 25, status: "done", tools: "vCard QR, WiFi QR, iCal Event Generator, Notepad, To-Do List, Kanban Board, Signature Pad, Label Sheets, Certificates, and more" },
      { name: "Charts & Data Tools", count: 25, status: "done", tools: "Bar, Line, Pie, Donut, Area, Scatter and Gantt charts, CSV Viewer, Cleaner, Merger, Splitter, Pivot Table, and more" },
      { name: "Study & Education Tools", count: 30, status: "done", tools: "Flashcards, Quiz Generator, Citation Generator, Grade Calculator, Periodic Table, Molar Mass Calculator, Equation Balancer, and more" },
      { name: "Video Tools", count: 25, status: "done", tools: "Trim, Merge, Rotate, Crop, Compress, Convert, Video to GIF, Frame Extractor, Contact Sheet, Webcam & Screen Recorder, and more — 100% in-browser via FFmpeg WebAssembly, nothing uploaded" },
    ]
  },
  {
    id: "backend", name: "🔒 Coming Soon: Server-Powered Tools", color: "#EF4444", count: 200,
    desc: "Planned — these need a backend or external APIs, so they come after the client-side catalog",
    batches: [
      { name: "SEO Analysis Tools", count: 40, priority: "⭐⭐⭐⭐", status: "backend", reason: "DA checker, backlink checker — needs third-party SEO data APIs." },
      { name: "Technical SEO", count: 30, priority: "⭐⭐⭐⭐", status: "backend", reason: "Page speed, broken links — needs server-side crawling." },
      { name: "Link Tools", count: 13, priority: "⭐⭐⭐", status: "backend", reason: "Backlink analysis — needs a link index API." },
      { name: "DNS & Network", count: 25, priority: "⭐⭐⭐", status: "backend", reason: "WHOIS, DNS lookup — needs a DNS resolver backend." },
      { name: "SSL & Security", count: 17, priority: "⭐⭐⭐", status: "backend", reason: "SSL checker, malware scan — needs HTTPS inspection." },
      { name: "Email Tools", count: 15, priority: "⭐⭐⭐", status: "backend", reason: "Email validation (MX check) — needs DNS queries." },
    ]
  },
  {
    id: "ai", name: "🤖 Coming Soon: AI-Powered Tools", color: "#7C3AED", count: 30,
    desc: "Planned — these need an LLM API",
    batches: [
      { name: "AI Writing Tools", count: 20, priority: "⭐⭐⭐⭐", status: "ai", reason: "AI writer, rewriter, grammar fixer." },
      { name: "AI Developer Tools", count: 10, priority: "⭐⭐⭐", status: "ai", reason: "AI code gen, regex gen, SQL gen." },
    ]
  },
];

const TIMELINE = [
  { month: "Now", tools: 1136, total: 1136, phase: "Shipped", action: "1,136 client-side tools live across 29 categories" },
  { month: "Next", tools: 60, total: 1196, phase: "SEO & Network", action: "DNS, WHOIS, SSL & SEO analysis tools (server-powered)" },
  { month: "Later", tools: 90, total: 1286, phase: "Technical SEO & Email", action: "Page speed, broken-link and email-validation tools" },
  { month: "Future", tools: 30, total: 1316, phase: "AI Tools", action: "AI writer, rewriter and code helpers" },
  { month: "Ongoing", tools: 284, total: 1600, phase: "Community Requests", action: "More free tools toward 1,600+ based on your requests" },
];

function ToolsRiftRoadmap() {
  const [expanded, setExpanded] = useState("done");
  const [view, setView] = useState("overview");
  const totalBuilt = 1136;
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
        <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Outfit',sans-serif", marginBottom: 12 }}>1,136 Tools Shipped — and Growing</h1>
        <p style={{ color: "#64748B", fontSize: 15, maxWidth: 600, margin: "0 auto" }}>All 29 client-side categories are live. Everything below is prioritized by search volume and build complexity, with server-powered and AI tools planned next.</p>
      </div>

      {/* Progress Bar */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 24, marginBottom: 24, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>Overall Progress</span>
          <span style={{ color: "#22C55E", fontWeight: 700 }}>{totalBuilt} / {totalPlanned}+ tools ({pct}%)</span>
        </div>
        <div style={{ height: 12, borderRadius: 6, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #22C55E, #3B82F6)", borderRadius: 6, transition: "width 1s" }} />
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
          {[["✅ Shipped", 1136, "#22C55E"], ["🔒 Server-Powered (planned)", 200, "#EF4444"], ["🤖 AI (planned)", 30, "#7C3AED"], ["💡 More ideas", 234, "#F59E0B"]].map(([l, c, col]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: col }} />
              <span style={{ color: "#94A3B8" }}>{l}: {c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* View Toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[["overview", "📋 Phase Overview"], ["timeline", "📅 Build Timeline"]].map(([v, l]) => (
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
                      <summary style={{ fontSize: 11, color: "#64748B", cursor: "pointer" }}>View sample tools →</summary>
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
          <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Outfit',sans-serif", marginBottom: 20 }}>What's Next</h2>
          {TIMELINE.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "start" }}>
              <div style={{ width: 100, flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontWeight: 700, color: "#3B82F6", fontFamily: "'Outfit',sans-serif" }}>{t.month}</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>{t.phase}</div>
              </div>
              <div style={{ width: 2, background: "rgba(59,130,246,0.3)", minHeight: 80, position: "relative", flexShrink: 0 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: i === 0 ? "#22C55E" : "rgba(59,130,246,0.4)", position: "absolute", top: 4, left: -5 }} />
              </div>
              <div style={{ flex: 1, padding: "12px 16px", borderRadius: 10, background: i === 0 ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${i === 0 ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.04)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{t.action}</span>
                  <span style={{ color: "#22C55E", fontWeight: 700, fontSize: 13 }}>{i === 0 ? `${t.total} live` : `+${t.tools} → ${t.total}`}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(t.total / totalPlanned) * 100}%`, background: `linear-gradient(90deg, #22C55E, #3B82F6)`, borderRadius: 3 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Note */}
      <div style={{ marginTop: 32, padding: 24, borderRadius: 14, background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.04))", border: "1px solid rgba(59,130,246,0.15)", textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Outfit',sans-serif", marginBottom: 8 }}>💡 Have a tool in mind?</div>
        <div style={{ color: "#94A3B8", fontSize: 14, lineHeight: 1.6, maxWidth: 600, margin: "0 auto" }}>
          All 1,136 client-side tools are free with no sign-up. The next wave adds <strong style={{ color: "#3B82F6" }}>server-powered SEO, network and AI tools</strong>. Missing something you need? Suggestions shape what we build next.
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
