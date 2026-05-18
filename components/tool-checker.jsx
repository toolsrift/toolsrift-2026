import { useState } from "react";

const TOOLS = [
  { cat: "🔍 SEO", name: "Meta Tag Generator", file: "toolsrift.jsx", route: "#/tool/meta-tag-gen" },
  { cat: "✍️ Content", name: "Word Counter", file: "toolsrift.jsx", route: "#/tool/word-counter" },
  { cat: "🖼️ Image", name: "Image Resizer", file: "toolsrift.jsx", route: "#/tool/image-resizer" },
  { cat: "📄 PDF", name: "PDF Merger (Pro)", file: "toolsrift.jsx", route: "#/tool/pdf-merger" },
  { cat: "🔐 Encoder", name: "Base64 Encode/Decode", file: "toolsrift.jsx", route: "#/tool/base64" },
  { cat: "🎨 Color", name: "Color Converter", file: "toolsrift.jsx", route: "#/tool/color-picker" },
  { cat: "⚖️ Converter", name: "Length Converter", file: "toolsrift.jsx", route: "#/tool/unit-converter" },
  { cat: "⚡ Generator", name: "Password Generator", file: "toolsrift.jsx", route: "#/tool/password-gen" },
  { cat: "📱 Social", name: "Hashtag Generator", file: "toolsrift.jsx", route: "#/tool/hashtag-gen" },
  { cat: "📧 Email", name: "Email Validator", file: "toolsrift.jsx", route: "#/tool/email-validator" },
  { cat: "🌐 Network", name: "DNS Lookup (Pro)", file: "toolsrift.jsx", route: "#/tool/dns-lookup" },
  { cat: "🛡️ Security", name: "Password Strength", file: "toolsrift.jsx", route: "#/tool/password-strength" },
  { cat: "📁 File", name: "File to Base64", file: "toolsrift.jsx", route: "#/tool/file-base64" },
  { cat: "🧰 Misc", name: "Lorem Ipsum Generator", file: "toolsrift.jsx", route: "#/tool/lorem-ipsum" },
  { cat: "🌍 Language", name: "Case Converter", file: "toolsrift.jsx", route: "#/tool/case-converter" },
  { cat: "🤖 AI", name: "AI Writer (Pro)", file: "toolsrift.jsx", route: "#/tool/ai-writer" },
  { cat: "🎙️ Media", name: "Text to Speech", file: "toolsrift.jsx", route: "#/tool/text-to-speech" },
  // Calculators
  ...[
    ["➕ Basic Math","Basic Calculator","basic-calc"],["➕ Basic Math","Scientific Calculator","scientific-calc"],
    ["➕ Basic Math","Percentage Calculator","percentage-calc"],["➕ Basic Math","Fraction Calculator","fraction-calc"],
    ["➕ Basic Math","Ratio Calculator","ratio-calc"],["➕ Basic Math","Average Calculator","average-calc"],
    ["➕ Basic Math","Mean Median Mode","mean-median-mode"],["➕ Basic Math","Standard Deviation","std-dev-calc"],
    ["➕ Basic Math","Probability Calculator","probability-calc"],["➕ Basic Math","Permutation & Combination","perm-comb-calc"],
    ["❤️ Health","BMI Calculator","bmi-calc"],["❤️ Health","BMR Calculator","bmr-calc"],
    ["❤️ Health","Body Fat Calculator","body-fat-calc"],["❤️ Health","Calorie Calculator","calorie-calc"],
    ["❤️ Health","Ideal Weight Calculator","ideal-weight-calc"],["❤️ Health","Pregnancy Calculator","pregnancy-calc"],
    ["❤️ Health","Ovulation Calculator","ovulation-calc"],["❤️ Health","Water Intake Calculator","water-intake-calc"],
    ["💰 Finance","EMI Calculator","emi-calc"],["💰 Finance","Loan Calculator","loan-calc"],
    ["💰 Finance","Mortgage Calculator","mortgage-calc"],["💰 Finance","Interest Calculator","interest-calc"],
    ["💰 Finance","Compound Interest","compound-interest"],["💰 Finance","Simple Interest","simple-interest"],
    ["💰 Finance","Discount Calculator","discount-calc"],["💰 Finance","Profit Margin Calculator","profit-margin-calc"],
    ["💰 Finance","GST Calculator","gst-calc"],["💰 Finance","VAT Calculator","vat-calc"],
    ["💰 Finance","Sales Tax Calculator","sales-tax-calc"],["💰 Finance","Currency Converter","currency-converter"],
    ["💰 Finance","Salary Calculator","salary-calc"],["💰 Finance","Inflation Calculator","inflation-calc"],
    ["💰 Finance","ROI Calculator","roi-calc"],["💰 Finance","SIP Calculator","sip-calc"],
    ["💰 Finance","FD Calculator","fd-calc"],["💰 Finance","Retirement Calculator","retirement-calc"],
    ["📅 Time","Age Calculator","age-calc"],["📅 Time","Date Difference","date-diff-calc"],
    ["📅 Time","Days Between Dates","days-between"],["📅 Time","Working Days Calculator","working-days-calc"],
    ["📅 Time","Countdown Timer","countdown-timer"],["📅 Time","Time Zone Converter","timezone-converter"],
    ["🎓 Education","GPA Calculator","gpa-calc"],["🎓 Education","CGPA Calculator","cgpa-calc"],
    ["🎓 Education","Percentage to GPA","pct-to-gpa"],["🎓 Education","Marks Percentage","marks-pct-calc"],
    ["🌐 Web/SEO","CPM Calculator","cpm-calc"],["🌐 Web/SEO","CPC Calculator","cpc-calc"],
    ["🌐 Web/SEO","CTR Calculator","ctr-calc"],["🌐 Web/SEO","ROI for Ads","roi-ads-calc"],
    ["🌐 Web/SEO","Keyword Density","keyword-density-calc"],["🌐 Web/SEO","Readability Score","readability-calc"],
  ].map(([cat,name,id])=>({cat:`🧮 Calc → ${cat}`,name,file:"toolsrift.jsx",route:`#/tool/${id}`})),
  // Business tools
  ...[
    ["Invoice Generator","invoice-gen"],["Receipt Generator","receipt-gen"],["Quotation Generator","quotation-gen"],
    ["Business Card Generator","business-card-gen"],["Resume Builder","resume-builder"],["Cover Letter Generator","cover-letter-gen"],
    ["SWOT Analysis","swot-gen"],["Marketing Plan Generator","marketing-plan-gen"],["Persona Generator","persona-gen"],
    ["UTM Campaign Builder","utm-builder"],["Ad Copy Generator","ad-copy-gen"],["Sales Copy Generator","sales-copy-gen"],
    ["Landing Page Copy Generator","landing-copy-gen"],["ROI Calculator","roi-calculator"],["Break Even Calculator","break-even-calc"],
  ].map(([name,id])=>({cat:"💼 Business",name,file:"toolsrift-business.jsx",route:`#/tool/${id}`})),
];

function ToolChecker() {
  const [checked, setChecked] = useState({});
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const toggle = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }));
  const checkedCount = Object.values(checked).filter(Boolean).length;

  const categories = [...new Set(TOOLS.map(t => t.cat))];
  const files = [...new Set(TOOLS.map(t => t.file))];

  const filtered = TOOLS.filter((t, i) => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "checked" && checked[i]) || (filter === "unchecked" && !checked[i]) || t.file === filter || t.cat.includes(filter);
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#06090F", color: "#E2E8F0", fontFamily: "'DM Sans',sans-serif", padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}`}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Outfit',sans-serif", marginBottom: 8 }}>✅ ToolsRift Verification Checklist</h1>
        <p style={{ color: "#64748B", fontSize: 14 }}>All 85 built tools. Check each one to verify it works.</p>
      </div>

      {/* Progress */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 20, marginBottom: 24, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>Verification Progress</span>
          <span style={{ color: "#22C55E", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{checkedCount} / {TOOLS.length} verified ({((checkedCount / TOOLS.length) * 100).toFixed(0)}%)</span>
        </div>
        <div style={{ height: 10, borderRadius: 5, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(checkedCount / TOOLS.length) * 100}%`, background: "linear-gradient(90deg, #22C55E, #3B82F6)", borderRadius: 5, transition: "width 0.3s" }} />
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12, color: "#94A3B8" }}>
          <span>📄 <strong style={{ color: "#3B82F6" }}>toolsrift.jsx</strong>: {TOOLS.filter(t => t.file === "toolsrift.jsx").length} tools</span>
          <span>📄 <strong style={{ color: "#059669" }}>toolsrift-business.jsx</strong>: {TOOLS.filter(t => t.file === "toolsrift-business.jsx").length} tools</span>
        </div>
      </div>

      {/* How to Check */}
      <div style={{ background: "rgba(59,130,246,0.06)", borderRadius: 12, padding: 16, marginBottom: 24, border: "1px solid rgba(59,130,246,0.15)", fontSize: 13, color: "#94A3B8", lineHeight: 1.7 }}>
        <strong style={{ color: "#3B82F6" }}>📌 How to verify each tool:</strong><br />
        1. <strong>Scroll up</strong> in this conversation to find the rendered artifact<br />
        2. Tools from <strong style={{ color: "#3B82F6" }}>toolsrift.jsx</strong> → Click that artifact, use sidebar navigation<br />
        3. Tools from <strong style={{ color: "#059669" }}>toolsrift-business.jsx</strong> → Click that artifact, use sidebar navigation<br />
        4. Test each tool with sample data → If it works, check it off below ✅
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search tools..." style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.3)", color: "#E2E8F0", fontSize: 13, width: 200, outline: "none" }} />
        {[["all", "All"], ["unchecked", "⬜ Pending"], ["checked", "✅ Verified"], ["toolsrift.jsx", "📄 Main"], ["toolsrift-business.jsx", "💼 Business"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: filter === v ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)", color: filter === v ? "#60A5FA" : "#94A3B8" }}>{l}</button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748B" }}>Showing {filtered.length} of {TOOLS.length}</span>
      </div>

      {/* Tool List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {filtered.map((tool, origIdx) => {
          const realIdx = TOOLS.indexOf(tool);
          const isChecked = checked[realIdx];
          return (
            <div key={realIdx} onClick={() => toggle(realIdx)}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 8, cursor: "pointer",
                background: isChecked ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${isChecked ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)"}`,
                transition: "all 0.15s",
              }}>
              {/* Checkbox */}
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                background: isChecked ? "#22C55E" : "transparent",
                border: isChecked ? "none" : "2px solid rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, color: "#fff", fontWeight: 700,
              }}>
                {isChecked ? "✓" : ""}
              </div>

              {/* Number */}
              <span style={{ color: "#475569", fontSize: 11, fontFamily: "'JetBrains Mono',monospace", width: 28, textAlign: "right", flexShrink: 0 }}>
                #{realIdx + 1}
              </span>

              {/* Tool Name */}
              <div style={{ flex: 1 }}>
                <span style={{ color: isChecked ? "#86EFAC" : "#E2E8F0", fontWeight: 600, fontSize: 14, textDecoration: isChecked ? "line-through" : "none", opacity: isChecked ? 0.7 : 1 }}>
                  {tool.name}
                </span>
              </div>

              {/* Category Badge */}
              <span style={{ fontSize: 11, color: "#64748B", whiteSpace: "nowrap" }}>{tool.cat}</span>

              {/* File Badge */}
              <span style={{
                padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap",
                background: tool.file === "toolsrift.jsx" ? "rgba(59,130,246,0.15)" : "rgba(5,150,105,0.15)",
                color: tool.file === "toolsrift.jsx" ? "#60A5FA" : "#34D399",
              }}>
                {tool.file === "toolsrift.jsx" ? "MAIN" : "BIZ"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {checkedCount === TOOLS.length && (
        <div style={{ marginTop: 24, padding: 24, borderRadius: 14, background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(59,130,246,0.05))", border: "1px solid rgba(34,197,94,0.2)", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#22C55E", fontFamily: "'Outfit',sans-serif" }}>All 85 Tools Verified!</div>
          <div style={{ color: "#94A3B8", marginTop: 8 }}>Ready to move to Phase 2: Text & Content Tools (45 more tools)</div>
        </div>
      )}

      {/* Quick Stats */}
      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[
          ["Total Built", 85, "#E2E8F0"],
          ["Verified", checkedCount, "#22C55E"],
          ["Pending", TOOLS.length - checkedCount, "#F59E0B"],
          ["Categories", new Set(TOOLS.map(t => t.cat.split("→")[0].trim())).size, "#3B82F6"],
        ].map(([l, v, c]) => (
          <div key={l} style={{ padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: c, fontFamily: "'Outfit',sans-serif" }}>{v}</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ToolChecker;
