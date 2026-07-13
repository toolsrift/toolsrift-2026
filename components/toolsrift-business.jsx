import { useState, useEffect, useRef, useCallback } from "react";
import { getCategoryById } from '../lib/categoryThemes';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolPageLayout, { ToolSchemas } from './shared/ToolPageLayout';
// PHASE 1: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';

const BRAND = { name: "ToolsRift" };
const PAGE_THEME = getCategoryById('business');

// ─── STATE-BASED ROUTING (works in artifact sandbox) ───────────
function useAppRouter() {
  const [page, setPage] = useState("landing");
  const [toolId, setToolId] = useState(null);
  const navigate = useCallback((target) => {
    if (target.startsWith("#/tool/")) { setPage("tool"); setToolId(target.replace("#/tool/","")); }
    else if (target==="#/tools"||target==="tools") { setPage("dashboard"); setToolId(null); }
    else { setPage("landing"); setToolId(null); }
    try { window.scrollTo(0,0); } catch(e) {}
  }, []);
  useEffect(() => {
    const handler = (e) => {
      const link = e.target.closest ? e.target.closest('a[href^="#/"]') : null;
      if (link) { e.preventDefault(); e.stopPropagation(); navigate(link.getAttribute("href")); }
    };
    const onHash = () => {
      const h = window.location.hash || "";
      if (h.startsWith("#/tool/")) { setPage("tool"); setToolId(h.replace("#/tool/", "")); window.scrollTo(0, 0); }
      else if (h === "#/tools") { setPage("dashboard"); setToolId(null); }
      else { setPage("landing"); setToolId(null); }
    };
    onHash();
    document.addEventListener("click", handler, true);
    window.addEventListener("hashchange", onHash);
    return () => {
      document.removeEventListener("click", handler, true);
      window.removeEventListener("hashchange", onHash);
    };
  }, [navigate]);
  return { page, toolId, navigate };
}

// ─── TOOL DATA ─────────────────────────────────────────────────
const CATEGORIES = [
  { id: "documents", name: "Documents & Billing", icon: "🧾", desc: "Invoices, receipts and quotations for clients" },
  { id: "career",    name: "Career",              icon: "📄", desc: "Resumes, cover letters and business cards" },
  { id: "strategy",  name: "Strategy",            icon: "📊", desc: "SWOT, marketing plans and buyer personas" },
  { id: "marketing", name: "Marketing & Copy",    icon: "📢", desc: "Ad copy, sales copy and campaign URLs" },
  { id: "finance",   name: "Finance",             icon: "💰", desc: "ROI and break-even calculators" },
];

const TOOLS = [
  { id: "invoice-gen", cat: "documents", name: "Invoice Generator", icon: "📃", desc: "Create professional invoices with line items, tax, and totals" },
  { id: "receipt-gen", cat: "documents", name: "Receipt Generator", icon: "🧾", desc: "Generate payment receipts with itemized details" },
  { id: "quotation-gen", cat: "documents", name: "Quotation Generator", icon: "📋", desc: "Build professional price quotations for clients" },
  { id: "business-card-gen", cat: "career", name: "Business Card Generator", icon: "💳", desc: "Design business cards with live preview" },
  { id: "resume-builder", cat: "career", name: "Resume Builder", icon: "📄", desc: "Build a professional resume with structured sections" },
  { id: "cover-letter-gen", cat: "career", name: "Cover Letter Generator", icon: "✉️", desc: "Generate tailored cover letters for job applications" },
  { id: "swot-gen", cat: "strategy", name: "SWOT Analysis Generator", icon: "📊", desc: "Create a 4-quadrant SWOT matrix for strategic planning" },
  { id: "marketing-plan-gen", cat: "strategy", name: "Marketing Plan Generator", icon: "📈", desc: "Build a structured marketing plan from scratch" },
  { id: "persona-gen", cat: "strategy", name: "Persona Generator", icon: "👤", desc: "Create detailed buyer persona profiles" },
  { id: "utm-builder", cat: "marketing", name: "UTM Campaign Builder", icon: "🔗", desc: "Build UTM-tagged campaign URLs for analytics" },
  { id: "ad-copy-gen", cat: "marketing", name: "Ad Copy Generator", icon: "📢", desc: "Generate persuasive ad copy for multiple platforms" },
  { id: "sales-copy-gen", cat: "marketing", name: "Sales Copy Generator", icon: "💬", desc: "Create compelling sales copy with proven frameworks" },
  { id: "landing-copy-gen", cat: "marketing", name: "Landing Page Copy Generator", icon: "🚀", desc: "Generate landing page sections: hero, features, CTA" },
  { id: "roi-calculator", cat: "finance", name: "ROI Calculator", icon: "💰", desc: "Calculate marketing return on investment" },
  { id: "break-even-calc", cat: "finance", name: "Break Even Calculator", icon: "⚖️", desc: "Find your break-even point in units and revenue" },
];

const SEO = {
  "invoice-gen":{title:"Free Invoice Generator Online",faq:[["What should an invoice include?","An invoice should include your business name, client details, invoice number, date, line items with descriptions, quantities, prices, subtotal, tax, and total amount."],["Is this invoice legally valid?","This tool generates a formatted invoice. For legal validity, consult your local business regulations."]]},
  "receipt-gen":{title:"Free Receipt Generator Online",faq:[["What's the difference between an invoice and a receipt?","An invoice is a request for payment sent before payment. A receipt is confirmation that payment has been received."],["Can I customize the receipt?","Yes, add your business name, payment method, items, and notes."]]},
  "quotation-gen":{title:"Free Quotation Generator Online",faq:[["What is a quotation?","A quotation is a formal document that offers a price for goods or services before a buyer commits to purchase."],["How long should a quote be valid?","Typically 15-30 days, but it depends on your industry and pricing stability."]]},
  "business-card-gen":{title:"Free Business Card Generator",faq:[["What size is a standard business card?","Standard size is 3.5 × 2 inches (89 × 51 mm)."],["What information should be on a business card?","Name, title, company, phone, email, website, and optionally social media handles."]]},
  "resume-builder":{title:"Free Resume Builder Online",faq:[["How long should a resume be?","1 page for early career, 2 pages for experienced professionals. Keep it concise and relevant."],["What sections should a resume include?","Contact info, summary, experience, education, skills, and optionally certifications and projects."]]},
  "cover-letter-gen":{title:"Free Cover Letter Generator",faq:[["How long should a cover letter be?","3-4 paragraphs, roughly 250-400 words. Keep it focused and specific to the role."],["Should I always include a cover letter?","Yes, unless the job posting explicitly says not to. It shows initiative and lets you highlight key qualifications."]]},
  "swot-gen":{title:"Free SWOT Analysis Generator",faq:[["What is SWOT analysis?","SWOT stands for Strengths, Weaknesses, Opportunities, and Threats. It's a strategic planning framework."],["When should I use SWOT?","For business planning, competitive analysis, project evaluation, or personal career planning."]]},
  "marketing-plan-gen":{title:"Free Marketing Plan Generator",faq:[["What should a marketing plan include?","Goals, target audience, budget, channels, timeline, KPIs, and competitive analysis."],["How often should I update my marketing plan?","Review quarterly and update annually, or whenever significant market changes occur."]]},
  "persona-gen":{title:"Free Buyer Persona Generator",faq:[["What is a buyer persona?","A semi-fictional profile of your ideal customer based on research and data about demographics, behavior, and goals."],["How many personas should I create?","Most businesses need 3-5 personas to cover their main customer segments."]]},
  "utm-builder":{title:"Free UTM Campaign URL Builder",faq:[["What are UTM parameters?","UTM (Urchin Tracking Module) parameters are tags added to URLs to track the effectiveness of marketing campaigns in analytics tools."],["Which UTM parameters are required?","utm_source, utm_medium, and utm_campaign are the essential three. utm_term and utm_content are optional."]]},
  "ad-copy-gen":{title:"Free Ad Copy Generator",faq:[["What makes good ad copy?","Clear value proposition, emotional triggers, urgency, social proof, and a strong call-to-action."],["How long should ad copy be?","Google Ads: 30-90 characters per line. Facebook: under 125 characters primary text. Adapt to each platform."]]},
  "sales-copy-gen":{title:"Free Sales Copy Generator",faq:[["What is the AIDA framework?","Attention, Interest, Desire, Action — a proven copywriting framework that guides readers through a persuasion journey."],["What's the difference between sales copy and ad copy?","Sales copy is longer-form, focused on conversion. Ad copy is short, focused on clicks and attention."]]},
  "landing-copy-gen":{title:"Free Landing Page Copy Generator",faq:[["What sections does a landing page need?","Hero with headline, value proposition, features/benefits, social proof, FAQ, and a clear CTA."],["What is a good landing page conversion rate?","Average is 2-5%. Top performers hit 10%+. Focus on one clear CTA."]]},
  "roi-calculator":{title:"Free Marketing ROI Calculator",faq:[["How is marketing ROI calculated?","ROI = ((Revenue - Cost) / Cost) × 100. It shows the percentage return on your marketing investment."],["What is a good marketing ROI?","A 5:1 ratio (500% ROI) is considered strong. 10:1 is exceptional. Below 2:1 is generally not profitable."]]},
  "break-even-calc":{title:"Free Break Even Calculator",faq:[["What is the break-even point?","The point where total revenue equals total costs — no profit, no loss."],["How is break-even calculated?","Break-even units = Fixed Costs / (Selling Price - Variable Cost per Unit)."]]},
};

// ─── SHARED UI ─────────────────────────────────────────────────
const S = {
  bg: "#060A10", card: "rgba(255,255,255,0.025)", border: "rgba(255,255,255,0.06)",
  text: "#E2E8F0", muted: "#64748B", accent: "#059669", accentLight: "rgba(5,150,105,0.12)",
  green: "#22C55E", orange: "#F59E0B", blue: "#3B82F6", red: "#EF4444",
  font: "'DM Sans',sans-serif", mono: "'JetBrains Mono',monospace", display: "'Outfit',sans-serif",
};
const T = {
  body:  { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, color:S.text },
  mono:  { fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
  label: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600,
           color:S.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
  h1:    { fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:S.text },
  h2:    { fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:S.text },
};
const Btn=({children,onClick,v="primary",s="md",style={},href,disabled})=>{const base={border:"none",borderRadius:8,cursor:disabled?"not-allowed":"pointer",fontWeight:600,fontFamily:S.display,transition:"all 0.2s",display:"inline-flex",alignItems:"center",gap:8,opacity:disabled?0.5:1,textDecoration:"none"};const sz={sm:{padding:"6px 14px",fontSize:12},md:{padding:"10px 22px",fontSize:14},lg:{padding:"14px 32px",fontSize:16}};const vs={primary:{background:`linear-gradient(135deg,${S.accent},#047857)`,color:"#fff"},secondary:{background:"rgba(255,255,255,0.06)",color:S.text,border:`1px solid ${S.border}`},ghost:{background:"transparent",color:S.muted},accent:{background:`linear-gradient(135deg,${S.orange},#D97706)`,color:"#000"}};if(href)return<a href={href} style={{...base,...sz[s],...vs[v],...style}}>{children}</a>;return<button onClick={onClick} disabled={disabled} style={{...base,...sz[s],...vs[v],...style}}>{children}</button>};
const Input=({value,onChange,placeholder,style={},multiline,rows=4,type="text"})=>{const[foc,setFoc]=useState(false);const st={width:"100%",padding:"10px 14px",borderRadius:8,border:`1px solid ${foc?"#059669":"rgba(255,255,255,0.1)"}`,background:"#0F172A",color:S.text,fontSize:14,fontFamily:S.font,outline:"none",resize:"vertical",boxSizing:"border-box",height:multiline?undefined:48,transition:"border-color 0.2s",...style};const handlers={onFocus:()=>setFoc(true),onBlur:()=>setFoc(false)};return multiline?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{...st,height:undefined}} {...handlers}/>:<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={st} {...handlers}/>};
const NumInput=({value,onChange,placeholder,label,unit})=>{const[foc,setFoc]=useState(false);return(<div>{label&&<Lab>{label}</Lab>}<div style={{position:"relative"}}><input type="number" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)} style={{width:"100%",padding:"10px 14px",paddingRight:unit?44:14,height:48,borderRadius:8,border:`1px solid ${foc?"#059669":"rgba(255,255,255,0.1)"}`,background:"#0F172A",color:S.text,fontSize:14,fontFamily:S.font,outline:"none",boxSizing:"border-box",transition:"border-color 0.2s"}}/>{unit&&<span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:S.muted,fontSize:12,fontWeight:600}}>{unit}</span>}</div></div>)};
const Sel=({value,onChange,options,label})=>(<div>{label&&<Lab>{label}</Lab>}<select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"10px 14px",borderRadius:8,border:`1px solid ${S.border}`,background:"#0D1424",color:S.text,fontSize:14,fontFamily:S.font}}>{options.map(o=><option key={typeof o==="string"?o:o.v} value={typeof o==="string"?o:o.v}>{typeof o==="string"?o:o.l}</option>)}</select></div>);
const Card=({children,style={}})=><div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:14,padding:24,...style}}>{children}</div>;
const Lab=({children})=><div style={{fontSize:12,fontWeight:700,color:S.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em",fontFamily:S.display}}>{children}</div>;
const Res=({label,value,mono,color})=><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:S.accentLight,borderRadius:6,marginBottom:6}}><span style={{color:S.muted,fontSize:13}}>{label}</span><span style={{color:color||S.text,fontWeight:600,fontSize:14,fontFamily:mono?S.mono:"inherit"}}>{value}</span></div>;
const Big=({label,value,sub,color=S.accent})=><div style={{padding:20,background:`linear-gradient(135deg,${color}11,${color}08)`,borderRadius:12,textAlign:"center",border:`1px solid ${color}22`}}><div style={{fontSize:13,color:S.muted,marginBottom:4}}>{label}</div><div style={{fontSize:32,fontWeight:700,color,fontFamily:S.display}}>{value}</div>{sub&&<div style={{fontSize:12,color:S.muted,marginTop:4}}>{sub}</div>}</div>;
const CopyBtn=({text})=>{const[c,sc]=useState(false);return<Btn v="secondary" s="sm" onClick={()=>{navigator.clipboard.writeText(String(text)).then(()=>{sc(true);setTimeout(()=>sc(false),1500)}).catch(()=>{sc(false)})}}>{c?"✓ Copied":"📋 Copy"}</Btn>};
const G2=({children})=><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{children}</div>;
const G3=({children})=><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>{children}</div>;
const V=({children,gap=16})=><div style={{display:"flex",flexDirection:"column",gap}}>{children}</div>;
const p=v=>parseFloat(v)||0;
const fmt=(n,d=2)=>{const v=parseFloat(n);return isNaN(v)?"0":v.toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:d})};
const $=n=>`$${fmt(n)}`;

// ─── TOOL: INVOICE GENERATOR ───────────────────────────────────
function InvoiceGenerator(){
  const[from,setFrom]=useState({name:"",email:"",addr:""});
  const[to,setTo]=useState({name:"",email:"",addr:""});
  const[items,setItems]=useState([{desc:"",qty:1,rate:0}]);
  const[inv,setInv]=useState("INV-001");
  const[date,setDate]=useState(new Date().toISOString().split("T")[0]);
  const[due,setDue]=useState("");
  const[taxRate,setTaxRate]=useState("10");
  const[notes,setNotes]=useState("");
  const add=()=>setItems([...items,{desc:"",qty:1,rate:0}]);
  const upd=(i,f,v)=>{const n=[...items];n[i][f]=v;setItems(n)};
  const rm=(i)=>setItems(items.filter((_,j)=>j!==i));
  const sub=items.reduce((s,it)=>s+it.qty*it.rate,0);
  const tax=sub*p(taxRate)/100;
  const total=sub+tax;
  return(<V>
    <G2>
      <Card><Lab>From (Your Business)</Lab><Input value={from.name} onChange={v=>setFrom({...from,name:v})} placeholder="Business Name" style={{marginBottom:8}}/><Input value={from.email} onChange={v=>setFrom({...from,email:v})} placeholder="Email" style={{marginBottom:8}}/><Input value={from.addr} onChange={v=>setFrom({...from,addr:v})} placeholder="Address" multiline rows={2}/></Card>
      <Card><Lab>Bill To (Client)</Lab><Input value={to.name} onChange={v=>setTo({...to,name:v})} placeholder="Client Name" style={{marginBottom:8}}/><Input value={to.email} onChange={v=>setTo({...to,email:v})} placeholder="Client Email" style={{marginBottom:8}}/><Input value={to.addr} onChange={v=>setTo({...to,addr:v})} placeholder="Client Address" multiline rows={2}/></Card>
    </G2>
    <G3><div><Lab>Invoice #</Lab><Input value={inv} onChange={setInv}/></div><div><Lab>Date</Lab><Input type="date" value={date} onChange={setDate}/></div><div><Lab>Due Date</Lab><Input type="date" value={due} onChange={setDue}/></div></G3>
    <Lab>Line Items</Lab>
    {items.map((it,i)=>(<div key={i} style={{display:"flex",gap:8,alignItems:"end",marginBottom:8}}>
      <div style={{flex:3}}>{i===0&&<Lab>Description</Lab>}<Input value={it.desc} onChange={v=>upd(i,"desc",v)} placeholder="Service or product"/></div>
      <div style={{flex:1}}>{i===0&&<Lab>Qty</Lab>}<Input value={String(it.qty)} onChange={v=>upd(i,"qty",+v||0)} placeholder="1"/></div>
      <div style={{flex:1}}>{i===0&&<Lab>Rate ($)</Lab>}<Input value={String(it.rate)} onChange={v=>upd(i,"rate",+v||0)} placeholder="0"/></div>
      <div style={{flex:1,textAlign:"right",paddingBottom:10,color:S.text,fontWeight:700,fontFamily:S.mono}}>{$(it.qty*it.rate)}</div>
      {items.length>1&&<Btn v="ghost" s="sm" onClick={()=>rm(i)}>✕</Btn>}
    </div>))}
    <Btn v="secondary" s="sm" onClick={add}>+ Add Line Item</Btn>
    <G2><NumInput label="Tax Rate (%)" value={taxRate} onChange={setTaxRate} placeholder="10"/><div><Lab>Notes</Lab><Input value={notes} onChange={setNotes} placeholder="Payment terms, thank you note..." multiline rows={2}/></div></G2>
    <div style={{borderRadius:10,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.4)"}}>
      <div className="tr-print-doc" style={{background:"white",color:"#1E293B",padding:"32px 40px",borderRadius:"10px 10px 0 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:20,paddingBottom:16,borderBottom:"2px solid #E2E8F0"}}>
          <div>
            <div style={{fontSize:22,fontWeight:800,color:"#0F172A",fontFamily:S.display}}>{from.name||"Your Business"}</div>
            {from.email&&<div style={{fontSize:12,color:"#64748B",marginTop:2}}>{from.email}</div>}
            {from.addr&&<div style={{fontSize:12,color:"#64748B",marginTop:2,whiteSpace:"pre-wrap"}}>{from.addr}</div>}
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:28,fontWeight:900,color:"#059669",fontFamily:S.display,letterSpacing:"-1px"}}>INVOICE</div>
            <div style={{fontSize:12,color:"#64748B",marginTop:4}}>#{inv}</div>
            <div style={{fontSize:12,color:"#64748B"}}>Date: {date}</div>
            {due&&<div style={{fontSize:12,color:"#64748B"}}>Due: {due}</div>}
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",marginBottom:4}}>Bill To</div>
          <div style={{fontSize:14,fontWeight:600,color:"#0F172A"}}>{to.name||"Client Name"}</div>
          {to.email&&<div style={{fontSize:12,color:"#64748B"}}>{to.email}</div>}
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",marginBottom:16}}>
          <thead><tr style={{background:"#F8FAFC"}}><th style={{padding:"8px 10px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase"}}>Description</th><th style={{padding:"8px 10px",textAlign:"center",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",width:60}}>Qty</th><th style={{padding:"8px 10px",textAlign:"right",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",width:80}}>Rate</th><th style={{padding:"8px 10px",textAlign:"right",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",width:90}}>Amount</th></tr></thead>
          <tbody>{items.filter(it=>it.desc||it.rate).map((it,i)=><tr key={i} style={{borderBottom:"1px solid #F1F5F9"}}><td style={{padding:"8px 10px",fontSize:13,color:"#1E293B"}}>{it.desc||"-"}</td><td style={{padding:"8px 10px",textAlign:"center",fontSize:13,color:"#475569"}}>{it.qty}</td><td style={{padding:"8px 10px",textAlign:"right",fontSize:13,color:"#475569"}}>{$(it.rate)}</td><td style={{padding:"8px 10px",textAlign:"right",fontSize:13,fontWeight:600,color:"#0F172A"}}>{$(it.qty*it.rate)}</td></tr>)}</tbody>
        </table>
        <div style={{display:"flex",justifyContent:"flex-end"}}>
          <div style={{minWidth:220}}>
            <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #E2E8F0",fontSize:13,color:"#64748B"}}><span>Subtotal</span><span style={{fontWeight:600,color:"#1E293B"}}>{$(sub)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #E2E8F0",fontSize:13,color:"#64748B"}}><span>Tax ({taxRate}%)</span><span style={{fontWeight:600,color:"#1E293B"}}>{$(tax)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontSize:16,fontWeight:800,color:"#059669"}}><span>Total</span><span>{$(total)}</span></div>
          </div>
        </div>
        {notes&&<div style={{marginTop:12,padding:"10px 14px",background:"#F8FAFC",borderRadius:6,fontSize:12,color:"#475569"}}>{notes}</div>}
      </div>
      <div className="tr-no-print" style={{position:"sticky",bottom:0,background:"rgba(6,9,15,0.92)",backdropFilter:"blur(12px)",padding:"12px 16px",display:"flex",gap:10,alignItems:"center",justifyContent:"flex-end",borderTop:"1px solid rgba(5,150,105,0.2)"}}>
        <span style={{fontSize:12,color:S.muted,marginRight:"auto"}}>Invoice ready</span>
        <Btn s="sm" v="secondary" onClick={()=>{const el=document.createElement("button");el.onclick=()=>window.print();el.click()}}>🖨️ Print / Save PDF</Btn>
        <CopyBtn text={`Invoice #${inv}\n${from.name} → ${to.name}\nSubtotal: ${$(sub)}\nTax: ${$(tax)}\nTotal: ${$(total)}`}/>
      </div>
    </div>
  </V>);
}

// ─── TOOL: RECEIPT GENERATOR ───────────────────────────────────
function ReceiptGenerator(){
  const[biz,setBiz]=useState("");const[cust,setCust]=useState("");
  const[items,setItems]=useState([{desc:"",amt:0}]);
  const[rcpt,setRcpt]=useState("RCT-001");const[date,setDate]=useState(new Date().toISOString().split("T")[0]);
  const[method,setMethod]=useState("Cash");const[notes,setNotes]=useState("");
  const add=()=>setItems([...items,{desc:"",amt:0}]);
  const upd=(i,f,v)=>{const n=[...items];n[i][f]=v;setItems(n)};
  const total=items.reduce((s,it)=>s+p(it.amt),0);
  return(<V>
    <G2><div><Lab>Business Name</Lab><Input value={biz} onChange={setBiz} placeholder="Your Business"/></div><div><Lab>Customer</Lab><Input value={cust} onChange={setCust} placeholder="Customer Name"/></div></G2>
    <G3><div><Lab>Receipt #</Lab><Input value={rcpt} onChange={setRcpt}/></div><div><Lab>Date</Lab><Input type="date" value={date} onChange={setDate}/></div><Sel label="Payment Method" value={method} onChange={setMethod} options={["Cash","Credit Card","Debit Card","Bank Transfer","UPI","PayPal","Check"]}/></G3>
    <Lab>Items</Lab>
    {items.map((it,i)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:6}}>
      <div style={{flex:3}}><Input value={it.desc} onChange={v=>upd(i,"desc",v)} placeholder="Item description"/></div>
      <div style={{flex:1}}><Input value={String(it.amt)} onChange={v=>upd(i,"amt",v)} placeholder="Amount"/></div>
    </div>))}
    <Btn v="secondary" s="sm" onClick={add}>+ Add Item</Btn>
    <div><Lab>Notes</Lab><Input value={notes} onChange={setNotes} placeholder="Thank you for your payment!" multiline rows={2}/></div>
    <div style={{borderRadius:10,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.4)"}}>
      <div className="tr-print-doc" style={{background:"white",color:"#1E293B",padding:"32px 40px",fontFamily:S.font}}>
        <div style={{textAlign:"center",borderBottom:"2px solid #E2E8F0",paddingBottom:16,marginBottom:20}}>
          <div style={{fontSize:22,fontWeight:800,color:"#0F172A",fontFamily:S.display}}>{biz||"Your Business"}</div>
          <div style={{fontSize:12,color:"#64748B",marginTop:4,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>Receipt</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:16,fontSize:12,color:"#64748B"}}>
          <span>Receipt #: <strong style={{color:"#1E293B"}}>{rcpt}</strong></span>
          <span>Date: <strong style={{color:"#1E293B"}}>{date}</strong></span>
          <span>Customer: <strong style={{color:"#1E293B"}}>{cust||"Walk-in"}</strong></span>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",marginBottom:16}}>
          <thead><tr style={{background:"#F8FAFC"}}><th style={{padding:"8px 10px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase"}}>Item</th><th style={{padding:"8px 10px",textAlign:"right",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",width:90}}>Amount</th></tr></thead>
          <tbody>{items.filter(it=>it.desc).map((it,i)=><tr key={i} style={{borderBottom:"1px solid #F1F5F9"}}><td style={{padding:"8px 10px",fontSize:13,color:"#1E293B"}}>{it.desc}</td><td style={{padding:"8px 10px",textAlign:"right",fontSize:13,fontWeight:600,color:"#0F172A"}}>{$(p(it.amt))}</td></tr>)}</tbody>
        </table>
        <div style={{display:"flex",justifyContent:"space-between",padding:"12px 10px",background:"#F8FAFC",borderRadius:6,fontWeight:800,fontSize:16,color:"#059669"}}><span>Total Paid ({method})</span><span>{$(total)}</span></div>
        {notes&&<div style={{marginTop:12,textAlign:"center",fontSize:12,color:"#64748B",fontStyle:"italic"}}>{notes}</div>}
      </div>
      <div className="tr-no-print" style={{position:"sticky",bottom:0,background:"rgba(6,9,15,0.92)",backdropFilter:"blur(12px)",padding:"12px 16px",display:"flex",gap:10,alignItems:"center",justifyContent:"flex-end",borderTop:"1px solid rgba(5,150,105,0.2)"}}>
        <span style={{fontSize:12,color:S.muted,marginRight:"auto"}}>Receipt ready</span>
        <Btn s="sm" v="secondary" onClick={()=>window.print()}>🖨️ Print / Save PDF</Btn>
        <CopyBtn text={`Receipt #${rcpt} — ${biz||"Business"}\nCustomer: ${cust||"Walk-in"}\n${items.filter(it=>it.desc).map(it=>`${it.desc}: ${$(p(it.amt))}`).join("\n")}\nTotal: ${$(total)} (${method})`}/>
      </div>
    </div>
  </V>);
}

// ─── TOOL: QUOTATION GENERATOR ─────────────────────────────────
function QuotationGenerator(){
  const[from,setFrom]=useState("");const[to,setTo]=useState("");
  const[items,setItems]=useState([{desc:"",qty:1,rate:0}]);
  const[date,setDate]=useState(new Date().toISOString().split("T")[0]);
  const[valid,setValid]=useState("30");const[notes,setNotes]=useState("This quotation is valid for the period mentioned above.");
  const add=()=>setItems([...items,{desc:"",qty:1,rate:0}]);
  const upd=(i,f,v)=>{const n=[...items];n[i][f]=v;setItems(n)};
  const sub=items.reduce((s,it)=>s+it.qty*p(it.rate),0);
  return(<V>
    <G2><div><Lab>Your Business</Lab><Input value={from} onChange={setFrom} placeholder="Company Name" multiline rows={2}/></div><div><Lab>Client</Lab><Input value={to} onChange={setTo} placeholder="Client Name & Address" multiline rows={2}/></div></G2>
    <G2><div><Lab>Quote Date</Lab><Input type="date" value={date} onChange={setDate}/></div><NumInput label="Valid For (days)" value={valid} onChange={setValid} placeholder="30"/></G2>
    <Lab>Items</Lab>
    {items.map((it,i)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:6}}>
      <div style={{flex:3}}><Input value={it.desc} onChange={v=>upd(i,"desc",v)} placeholder="Description"/></div>
      <div style={{flex:1}}><Input value={String(it.qty)} onChange={v=>upd(i,"qty",+v||0)} placeholder="Qty"/></div>
      <div style={{flex:1}}><Input value={String(it.rate)} onChange={v=>upd(i,"rate",v)} placeholder="Rate"/></div>
      <div style={{flex:1,textAlign:"right",paddingTop:10,color:S.text,fontWeight:700,fontFamily:S.mono}}>{$(it.qty*p(it.rate))}</div>
    </div>))}
    <Btn v="secondary" s="sm" onClick={add}>+ Add Item</Btn>
    <div><Lab>Terms & Notes</Lab><Input value={notes} onChange={setNotes} multiline rows={2}/></div>
    <Big label="Quotation Total" value={$(sub)} sub={`Valid for ${valid} days`}/>
  </V>);
}

// ─── TOOL: BUSINESS CARD GENERATOR ─────────────────────────────
function BusinessCardGen(){
  const[name,setName]=useState("");const[title,setTitle]=useState("");const[company,setCompany]=useState("");
  const[phone,setPhone]=useState("");const[email,setEmail]=useState("");const[website,setWebsite]=useState("");
  const[theme,setTheme]=useState("dark");
  const themes={dark:{bg:"linear-gradient(135deg,#0F172A,#1E293B)",text:"#F8FAFC",muted:"#94A3B8",accent:"#3B82F6"},light:{bg:"linear-gradient(135deg,#F8FAFC,#E2E8F0)",text:"#0F172A",muted:"#64748B",accent:"#059669"},bold:{bg:"linear-gradient(135deg,#7C3AED,#2563EB)",text:"#FFFFFF",muted:"#C4B5FD",accent:"#FDE68A"},warm:{bg:"linear-gradient(135deg,#FEF3C7,#FDE68A)",text:"#78350F",muted:"#92400E",accent:"#B91C1C"}};
  const t=themes[theme];
  return(<V>
    <G2>
      <div><Lab>Full Name</Lab><Input value={name} onChange={setName} placeholder="John Doe"/></div>
      <div><Lab>Job Title</Lab><Input value={title} onChange={setTitle} placeholder="Senior Developer"/></div>
      <div><Lab>Company</Lab><Input value={company} onChange={setCompany} placeholder="Acme Corp"/></div>
      <div><Lab>Phone</Lab><Input value={phone} onChange={setPhone} placeholder="+1 234 567 890"/></div>
      <div><Lab>Email</Lab><Input value={email} onChange={setEmail} placeholder="john@acme.com"/></div>
      <div><Lab>Website</Lab><Input value={website} onChange={setWebsite} placeholder="www.acme.com"/></div>
    </G2>
    <Lab>Theme</Lab>
    <div style={{display:"flex",gap:8}}>{Object.keys(themes).map(k=><Btn key={k} v={theme===k?"primary":"secondary"} s="sm" onClick={()=>setTheme(k)}>{k}</Btn>)}</div>
    <Lab>Preview (3.5" × 2")</Lab>
    <div style={{width:"100%",maxWidth:420,aspectRatio:"3.5/2",background:t.bg,borderRadius:12,padding:28,display:"flex",flexDirection:"column",justifyContent:"space-between",boxShadow:"0 8px 32px rgba(0,0,0,0.3)",margin:"0 auto"}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:t.muted,fontFamily:S.display}}>{company||"COMPANY"}</div>
      </div>
      <div>
        <div style={{fontSize:22,fontWeight:700,color:t.text,fontFamily:S.display,marginBottom:2}}>{name||"Your Name"}</div>
        <div style={{fontSize:12,color:t.accent,fontWeight:600,marginBottom:12}}>{title||"Job Title"}</div>
        <div style={{display:"flex",flexDirection:"column",gap:3,fontSize:11,color:t.muted}}>
          {phone&&<span>📞 {phone}</span>}
          {email&&<span>✉️ {email}</span>}
          {website&&<span>🌐 {website}</span>}
        </div>
      </div>
    </div>
  </V>);
}

// ─── TOOL: RESUME BUILDER ──────────────────────────────────────
function ResumeBuilder(){
  const[name,setName]=useState("");const[title,setTitle]=useState("");const[email,setEmail]=useState("");const[phone,setPhone]=useState("");const[summary,setSummary]=useState("");
  const[skills,setSkills]=useState("");
  const[exps,setExps]=useState([{company:"",role:"",period:"",desc:""}]);
  const[edus,setEdus]=useState([{school:"",degree:"",year:""}]);
  const addExp=()=>setExps([...exps,{company:"",role:"",period:"",desc:""}]);
  const addEdu=()=>setEdus([...edus,{school:"",degree:"",year:""}]);
  const updExp=(i,f,v)=>{const n=[...exps];n[i][f]=v;setExps(n)};
  const updEdu=(i,f,v)=>{const n=[...edus];n[i][f]=v;setEdus(n)};
  return(<V>
    <G2><div><Lab>Full Name</Lab><Input value={name} onChange={setName} placeholder="John Doe"/></div><div><Lab>Job Title</Lab><Input value={title} onChange={setTitle} placeholder="Full Stack Developer"/></div></G2>
    <G2><div><Lab>Email</Lab><Input value={email} onChange={setEmail} placeholder="john@email.com"/></div><div><Lab>Phone</Lab><Input value={phone} onChange={setPhone} placeholder="+1 234 567 890"/></div></G2>
    <div><Lab>Professional Summary</Lab><Input value={summary} onChange={setSummary} placeholder="Experienced developer with 5+ years in..." multiline rows={3}/></div>
    <div><Lab>Skills (comma separated)</Lab><Input value={skills} onChange={setSkills} placeholder="React, Node.js, Python, AWS, SQL"/></div>
    <Lab>Experience</Lab>
    {exps.map((e,i)=>(<Card key={i} style={{marginBottom:8}}><G2><div><Input value={e.company} onChange={v=>updExp(i,"company",v)} placeholder="Company"/></div><div><Input value={e.role} onChange={v=>updExp(i,"role",v)} placeholder="Role"/></div></G2><div style={{marginTop:8}}><Input value={e.period} onChange={v=>updExp(i,"period",v)} placeholder="Jan 2020 - Present" style={{marginBottom:8}}/><Input value={e.desc} onChange={v=>updExp(i,"desc",v)} placeholder="Key achievements and responsibilities..." multiline rows={2}/></div></Card>))}
    <Btn v="secondary" s="sm" onClick={addExp}>+ Add Experience</Btn>
    <Lab>Education</Lab>
    {edus.map((e,i)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:6}}><div style={{flex:2}}><Input value={e.school} onChange={v=>updEdu(i,"school",v)} placeholder="University"/></div><div style={{flex:2}}><Input value={e.degree} onChange={v=>updEdu(i,"degree",v)} placeholder="Degree"/></div><div style={{flex:1}}><Input value={e.year} onChange={v=>updEdu(i,"year",v)} placeholder="2020"/></div></div>))}
    <Btn v="secondary" s="sm" onClick={addEdu}>+ Add Education</Btn>
    <div style={{borderRadius:10,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.4)"}}>
      <div className="tr-print-doc" style={{background:"white",color:"#1E293B",padding:"40px",fontFamily:S.font}}>
        <div style={{borderBottom:"3px solid #059669",paddingBottom:16,marginBottom:20}}>
          <div style={{fontSize:28,fontWeight:800,color:"#0F172A",fontFamily:S.display}}>{name||"Your Name"}</div>
          <div style={{fontSize:14,color:"#059669",fontWeight:600,marginBottom:6}}>{title||"Job Title"}</div>
          <div style={{fontSize:12,color:"#64748B"}}>{[email,phone].filter(Boolean).join(" · ")}</div>
        </div>
        {summary&&<div style={{marginBottom:18}}><div style={{fontSize:11,fontWeight:800,color:"#059669",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Summary</div><div style={{fontSize:13,color:"#475569",lineHeight:1.7}}>{summary}</div></div>}
        {skills&&<div style={{marginBottom:18}}><div style={{fontSize:11,fontWeight:800,color:"#059669",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Skills</div><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{skills.split(",").map((sk,i)=><span key={i} style={{padding:"3px 10px",borderRadius:4,background:"#ECFDF5",color:"#059669",border:"1px solid #A7F3D0",fontSize:11,fontWeight:600}}>{sk.trim()}</span>)}</div></div>}
        {exps.some(e=>e.company)&&<div style={{marginBottom:18}}><div style={{fontSize:11,fontWeight:800,color:"#059669",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Experience</div>{exps.filter(e=>e.company).map((e,i)=>(<div key={i} style={{marginBottom:12,paddingLeft:12,borderLeft:"2px solid #D1FAE5"}}><div style={{fontSize:14,fontWeight:700,color:"#0F172A"}}>{e.role} <span style={{color:"#64748B",fontWeight:400}}>@ {e.company}</span></div><div style={{fontSize:11,color:"#94A3B8",marginBottom:4}}>{e.period}</div><div style={{fontSize:12,color:"#475569",lineHeight:1.5}}>{e.desc}</div></div>))}</div>}
        {edus.some(e=>e.school)&&<div><div style={{fontSize:11,fontWeight:800,color:"#059669",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Education</div>{edus.filter(e=>e.school).map((e,i)=>(<div key={i} style={{fontSize:13,marginBottom:4,color:"#1E293B"}}><span style={{fontWeight:700}}>{e.degree}</span> — {e.school} <span style={{color:"#64748B"}}>({e.year})</span></div>))}</div>}
      </div>
      <div className="tr-no-print" style={{position:"sticky",bottom:0,background:"rgba(6,9,15,0.92)",backdropFilter:"blur(12px)",padding:"12px 16px",display:"flex",gap:10,alignItems:"center",justifyContent:"flex-end",borderTop:"1px solid rgba(5,150,105,0.2)"}}>
        <span style={{fontSize:12,color:S.muted,marginRight:"auto"}}>Resume preview ready</span>
        <Btn s="sm" v="secondary" onClick={()=>window.print()}>🖨️ Print / Save PDF</Btn>
        <CopyBtn text={`${name||"Name"} — ${title||"Title"}\n${[email,phone].filter(Boolean).join(" | ")}\n\n${summary||""}\n\nSkills: ${skills||""}`}/>
      </div>
    </div>
  </V>);
}

// ─── TOOL: COVER LETTER GENERATOR ──────────────────────────────
function CoverLetterGen(){
  const[name,setName]=useState("");const[role,setRole]=useState("");const[company,setCompany]=useState("");
  const[skills,setSkills]=useState("");const[experience,setExp]=useState("");const[tone,setTone]=useState("professional");
  const generate=()=>{
    const sk=skills.split(",").map(s=>s.trim()).filter(Boolean);
    const openers={professional:`I am writing to express my strong interest in the ${role||"[Role]"} position at ${company||"[Company]"}. With ${experience||"several years of"} experience, I am confident I would be a valuable addition to your team.`,enthusiastic:`I am thrilled to apply for the ${role||"[Role]"} position at ${company||"[Company]"}! With ${experience||"extensive"} experience and a genuine passion for this field, I can't wait to contribute to your team's success.`,concise:`I'm applying for the ${role||"[Role]"} role at ${company||"[Company]"}. Here's why I'm a great fit:`};
    return `Dear Hiring Manager,\n\n${openers[tone]}\n\n${sk.length>0?`My key strengths include ${sk.join(", ")}, which align directly with the requirements of this role. `:""}Throughout my career, I have consistently delivered results and built strong collaborative relationships.\n\nI am particularly drawn to ${company||"your company"} because of its reputation for innovation and excellence. I would welcome the opportunity to discuss how my background and skills would benefit your team.\n\nThank you for your time and consideration. I look forward to hearing from you.\n\nSincerely,\n${name||"[Your Name]"}`;
  };
  const[output,setOutput]=useState("");
  return(<V>
    <G2><div><Lab>Your Name</Lab><Input value={name} onChange={setName} placeholder="John Doe"/></div><div><Lab>Target Role</Lab><Input value={role} onChange={setRole} placeholder="Senior Developer"/></div></G2>
    <G2><div><Lab>Company Name</Lab><Input value={company} onChange={setCompany} placeholder="Google"/></div><div><Lab>Years of Experience</Lab><Input value={experience} onChange={setExp} placeholder="5+ years"/></div></G2>
    <div><Lab>Key Skills (comma separated)</Lab><Input value={skills} onChange={setSkills} placeholder="React, Node.js, Leadership, AWS"/></div>
    <Sel label="Tone" value={tone} onChange={setTone} options={[{v:"professional",l:"Professional"},{v:"enthusiastic",l:"Enthusiastic"},{v:"concise",l:"Concise & Direct"}]}/>
    <Btn onClick={()=>setOutput(generate())}>Generate Cover Letter</Btn>
    {output&&<div style={{position:"relative"}}><pre style={{background:"rgba(0,0,0,0.4)",padding:20,borderRadius:10,fontSize:14,color:S.text,whiteSpace:"pre-wrap",lineHeight:1.8,fontFamily:S.font}}>{output}</pre><div style={{position:"absolute",top:8,right:8}}><CopyBtn text={output}/></div></div>}
  </V>);
}

// ─── TOOL: SWOT ANALYSIS ───────────────────────────────────────
function SwotGen(){
  const[s,setS]=useState("");const[w,setW]=useState("");const[o,setO]=useState("");const[t,setT]=useState("");
  const[title,setTitle]=useState("");
  const qStyle=(bg,label,val,set)=>(<div style={{background:bg,borderRadius:12,padding:18,minHeight:160}}>
    <div style={{fontSize:13,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8,fontFamily:S.display,color:"rgba(255,255,255,0.9)"}}>{label}</div>
    <Input value={val} onChange={set} placeholder={`Enter ${label.toLowerCase()}...`} multiline rows={4} style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.15)",color:"#fff",fontSize:13}}/>
  </div>);
  return(<V>
    <div><Lab>Project / Business Name</Lab><Input value={title} onChange={setTitle} placeholder="My Startup Idea"/></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      {qStyle("linear-gradient(135deg,#059669,#047857)","💪 Strengths",s,setS)}
      {qStyle("linear-gradient(135deg,#DC2626,#B91C1C)","⚠️ Weaknesses",w,setW)}
      {qStyle("linear-gradient(135deg,#2563EB,#1D4ED8)","🚀 Opportunities",o,setO)}
      {qStyle("linear-gradient(135deg,#D97706,#B45309)","🛡️ Threats",t,setT)}
    </div>
    {(s||w||o||t)&&<Card style={{background:"rgba(0,0,0,0.3)"}}>
      <div style={{fontSize:16,fontWeight:700,color:S.text,fontFamily:S.display,marginBottom:12}}>SWOT Summary: {title||"Analysis"}</div>
      {[["Strengths",s,"#22C55E"],["Weaknesses",w,"#EF4444"],["Opportunities",o,"#3B82F6"],["Threats",t,"#F59E0B"]].map(([l,v,c])=>v&&<div key={l} style={{marginBottom:10}}><span style={{fontSize:12,fontWeight:700,color:c,textTransform:"uppercase"}}>{l}:</span><span style={{fontSize:13,color:S.muted,marginLeft:8}}>{v}</span></div>)}
    </Card>}
  </V>);
}

// ─── TOOL: MARKETING PLAN GENERATOR ────────────────────────────
function MarketingPlanGen(){
  const[biz,setBiz]=useState("");const[goal,setGoal]=useState("");const[audience,setAud]=useState("");
  const[budget,setBudget]=useState("");const[channels,setChannels]=useState([]);
  const[timeline,setTimeline]=useState("quarterly");const[kpis,setKpis]=useState("");
  const channelList=["Social Media","Email Marketing","Content Marketing","SEO","PPC/Ads","Influencer Marketing","Events","PR","Referral","Affiliate"];
  const toggleCh=(ch)=>setChannels(prev=>prev.includes(ch)?prev.filter(c=>c!==ch):[...prev,ch]);
  const[output,setOutput]=useState(false);
  return(<V>
    <div><Lab>Business / Product Name</Lab><Input value={biz} onChange={setBiz} placeholder="My SaaS Product"/></div>
    <div><Lab>Primary Marketing Goal</Lab><Input value={goal} onChange={setGoal} placeholder="Increase signups by 50% in Q2"/></div>
    <div><Lab>Target Audience</Lab><Input value={audience} onChange={setAud} placeholder="SaaS founders, ages 25-45, tech-savvy" multiline rows={2}/></div>
    <G2><NumInput label="Monthly Budget ($)" value={budget} onChange={setBudget} placeholder="5000"/>
    <Sel label="Timeline" value={timeline} onChange={setTimeline} options={[{v:"monthly",l:"Monthly"},{v:"quarterly",l:"Quarterly"},{v:"annual",l:"Annual"}]}/></G2>
    <Lab>Marketing Channels (select multiple)</Lab>
    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
      {channelList.map(ch=><Btn key={ch} v={channels.includes(ch)?"primary":"secondary"} s="sm" onClick={()=>toggleCh(ch)}>{ch}</Btn>)}
    </div>
    <div><Lab>KPIs to Track</Lab><Input value={kpis} onChange={setKpis} placeholder="Signups, MRR, CAC, LTV, Traffic" multiline rows={2}/></div>
    <Btn onClick={()=>setOutput(true)}>Generate Marketing Plan</Btn>
    {output&&<Card style={{background:"rgba(0,0,0,0.35)"}}>
      <div style={{fontSize:20,fontWeight:800,color:S.text,fontFamily:S.display,marginBottom:16,borderBottom:`2px solid ${S.accent}`,paddingBottom:8}}>📈 Marketing Plan: {biz||"Your Business"}</div>
      {[["🎯 Goal",goal||"Define your primary marketing objective"],["👥 Target Audience",audience||"Define your ideal customer profile"],["💰 Budget",budget?`$${fmt(p(budget))}/month — ${$(p(budget)*(timeline==="quarterly"?3:timeline==="annual"?12:1))} total`:"Set your budget"],["📅 Timeline",`${timeline.charAt(0).toUpperCase()+timeline.slice(1)} plan`],["📣 Channels",channels.length?channels.join(", "):"Select your channels"],["📊 KPIs",kpis||"Define measurable success metrics"]].map(([l,v])=><div key={l} style={{marginBottom:14}}><div style={{fontSize:14,fontWeight:700,color:S.accent,marginBottom:4}}>{l}</div><div style={{fontSize:13,color:S.muted,lineHeight:1.6}}>{v}</div></div>)}
      {channels.length>0&&<div style={{marginTop:12}}><div style={{fontSize:14,fontWeight:700,color:S.accent,marginBottom:8}}>💡 Budget Allocation Suggestion</div>{channels.map((ch,i)=><Res key={ch} label={ch} value={$(p(budget)/channels.length)} mono/>)}</div>}
    </Card>}
  </V>);
}

// ─── TOOL: PERSONA GENERATOR ───────────────────────────────────
function PersonaGen(){
  const[name,setName]=useState("");const[age,setAge]=useState("");const[job,setJob]=useState("");const[income,setIncome]=useState("");
  const[goals,setGoals]=useState("");const[pains,setPains]=useState("");const[channels,setChannels]=useState("");const[bio,setBio]=useState("");
  const avatarColors=["#3B82F6","#8B5CF6","#EC4899","#EF4444","#F59E0B","#10B981"];
  const initials=name?name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2):"?";
  return(<V>
    <G2>
      <div><Lab>Persona Name</Lab><Input value={name} onChange={setName} placeholder="Marketing Mary"/></div>
      <G2><NumInput label="Age" value={age} onChange={setAge} placeholder="35"/><div><Lab>Income</Lab><Input value={income} onChange={setIncome} placeholder="$75,000"/></div></G2>
    </G2>
    <div><Lab>Job Title / Role</Lab><Input value={job} onChange={setJob} placeholder="Marketing Manager at a mid-size SaaS company"/></div>
    <div><Lab>Goals & Motivations</Lab><Input value={goals} onChange={setGoals} placeholder="Increase brand awareness, prove ROI to leadership..." multiline rows={2}/></div>
    <div><Lab>Pain Points & Frustrations</Lab><Input value={pains} onChange={setPains} placeholder="Too many tools, limited budget, can't measure impact..." multiline rows={2}/></div>
    <div><Lab>Preferred Channels</Lab><Input value={channels} onChange={setChannels} placeholder="LinkedIn, industry blogs, podcasts, webinars"/></div>
    <div><Lab>Bio / Background</Lab><Input value={bio} onChange={setBio} placeholder="A short narrative about this persona's typical day..." multiline rows={3}/></div>
    <Card style={{background:"linear-gradient(135deg,rgba(5,150,105,0.06),rgba(59,130,246,0.04))",padding:28}}>
      <div style={{display:"flex",gap:20,alignItems:"start",flexWrap:"wrap"}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:`linear-gradient(135deg,${avatarColors[name.length%6]},${avatarColors[(name.length+2)%6]})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:800,color:"#fff",fontFamily:S.display,flexShrink:0}}>{initials}</div>
        <div style={{flex:1,minWidth:200}}>
          <div style={{fontSize:22,fontWeight:700,color:S.text,fontFamily:S.display}}>{name||"Persona Name"}</div>
          <div style={{fontSize:14,color:S.accent,fontWeight:600}}>{job||"Job Title"}</div>
          <div style={{fontSize:12,color:S.muted,marginTop:4}}>{[age&&`Age ${age}`,income].filter(Boolean).join(" · ")}</div>
        </div>
      </div>
      {[["🎯 Goals",goals],["😤 Pain Points",pains],["📱 Channels",channels],["📖 Bio",bio]].filter(([,v])=>v).map(([l,v])=><div key={l} style={{marginTop:16}}><div style={{fontSize:12,fontWeight:700,color:S.accent,textTransform:"uppercase",marginBottom:4}}>{l}</div><div style={{fontSize:13,color:S.muted,lineHeight:1.6}}>{v}</div></div>)}
    </Card>
  </V>);
}

// ─── TOOL: UTM CAMPAIGN BUILDER ────────────────────────────────
function UtmBuilder(){
  const[url,setUrl]=useState("");const[source,setSource]=useState("");const[medium,setMedium]=useState("");
  const[campaign,setCampaign]=useState("");const[term,setTerm]=useState("");const[content,setContent]=useState("");
  const buildUrl=()=>{
    if(!url)return"";let u=url;if(!u.startsWith("http"))u="https://"+u;
    const params=[];
    if(source)params.push(`utm_source=${encodeURIComponent(source)}`);
    if(medium)params.push(`utm_medium=${encodeURIComponent(medium)}`);
    if(campaign)params.push(`utm_campaign=${encodeURIComponent(campaign)}`);
    if(term)params.push(`utm_term=${encodeURIComponent(term)}`);
    if(content)params.push(`utm_content=${encodeURIComponent(content)}`);
    return params.length?`${u}${u.includes("?")?"&":"?"}${params.join("&")}`:u;
  };
  const result=buildUrl();
  return(<V>
    <div><Lab>Website URL *</Lab><Input value={url} onChange={setUrl} placeholder="https://yoursite.com/landing"/></div>
    <G2>
      <div><Lab>Campaign Source * (utm_source)</Lab><Input value={source} onChange={setSource} placeholder="google, facebook, newsletter"/></div>
      <div><Lab>Campaign Medium * (utm_medium)</Lab><Input value={medium} onChange={setMedium} placeholder="cpc, email, social"/></div>
    </G2>
    <div><Lab>Campaign Name * (utm_campaign)</Lab><Input value={campaign} onChange={setCampaign} placeholder="spring_sale, product_launch"/></div>
    <G2>
      <div><Lab>Campaign Term (utm_term)</Lab><Input value={term} onChange={setTerm} placeholder="running+shoes"/></div>
      <div><Lab>Campaign Content (utm_content)</Lab><Input value={content} onChange={setContent} placeholder="hero_banner, cta_button"/></div>
    </G2>
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}><Lab>Quick Fill:</Lab>
      {[["Google Ads","google","cpc"],["Facebook","facebook","social"],["Instagram","instagram","social"],["Email","newsletter","email"],["Twitter","twitter","social"],["LinkedIn","linkedin","social"]].map(([l,s,m])=><Btn key={l} v="secondary" s="sm" onClick={()=>{setSource(s);setMedium(m)}}>{l}</Btn>)}
    </div>
    {result&&url&&<div style={{position:"relative"}}><Lab>Generated URL</Lab><div style={{background:"rgba(0,0,0,0.4)",padding:16,borderRadius:10,fontSize:13,color:"#86EFAC",fontFamily:S.mono,wordBreak:"break-all",lineHeight:1.6}}>{result}</div><div style={{position:"absolute",top:4,right:0}}><CopyBtn text={result}/></div></div>}
    {url&&source&&medium&&campaign&&<div>
      <Res label="utm_source" value={source} mono/><Res label="utm_medium" value={medium} mono/>
      <Res label="utm_campaign" value={campaign} mono/>
      {term&&<Res label="utm_term" value={term} mono/>}
      {content&&<Res label="utm_content" value={content} mono/>}
    </div>}
  </V>);
}

// ─── TOOL: AD COPY GENERATOR ───────────────────────────────────
function AdCopyGen(){
  const[product,setProduct]=useState("");const[audience,setAud]=useState("");const[usp,setUsp]=useState("");
  const[platform,setPlatform]=useState("google");const[cta,setCta]=useState("Learn More");
  const[output,setOutput]=useState([]);
  const generate=()=>{
    const p=product||"[Product]",a=audience||"[Audience]",u=usp||"[Unique Value]";
    const templates={
      google:[
        {headline:`${p} - ${u}`,desc:`Perfect for ${a}. ${u}. ${cta} today!`,headline2:`Try ${p} Free Today`},
        {headline:`#1 ${p} for ${a}`,desc:`Discover why thousands choose ${p}. ${u}. Get started now.`,headline2:`${u} - ${p}`},
        {headline:`${u} | ${p}`,desc:`Built for ${a} who want results. ${cta} and transform your workflow.`,headline2:`Save Time with ${p}`},
      ],
      facebook:[
        {headline:`Stop struggling. Start with ${p}.`,desc:`🎯 ${u}\n\nDesigned for ${a} who demand more. Join thousands of happy users.\n\n👉 ${cta}`,primary:`${u} — made for ${a}.`},
        {headline:`${a}? You need ${p}.`,desc:`✅ ${u}\n✅ Easy to get started\n✅ Trusted by 10,000+ users\n\n${cta} →`,primary:`Finally — a solution built for you.`},
      ],
      instagram:[
        {caption:`${u} ✨\n\n${p} was built for ${a} like you. Stop settling for less.\n\n🔥 ${cta} — link in bio\n\n#${product.replace(/\s+/g,"")} #${audience.replace(/\s+/g,"")}`},
        {caption:`POV: You just discovered ${p} 🚀\n\n${u}\nDesigned for ${a}\n\n👆 ${cta} via link in bio`},
      ],
    };
    setOutput(templates[platform]||[]);
  };
  return(<V>
    <G2><div><Lab>Product / Service</Lab><Input value={product} onChange={setProduct} placeholder="ToolsRift Pro"/></div><div><Lab>Target Audience</Lab><Input value={audience} onChange={setAud} placeholder="small business owners"/></div></G2>
    <div><Lab>Unique Selling Point</Lab><Input value={usp} onChange={setUsp} placeholder="500+ free tools in one platform"/></div>
    <G2><Sel label="Platform" value={platform} onChange={setPlatform} options={[{v:"google",l:"Google Ads"},{v:"facebook",l:"Facebook Ads"},{v:"instagram",l:"Instagram"}]}/>
    <Sel label="CTA" value={cta} onChange={setCta} options={["Learn More","Sign Up Free","Get Started","Shop Now","Try Free","Book a Demo"]}/></G2>
    <Btn onClick={generate}>Generate Ad Copy ({platform})</Btn>
    {output.length>0&&output.map((ad,i)=>(<Card key={i} style={{position:"relative"}}>
      <div style={{fontSize:11,fontWeight:700,color:S.accent,textTransform:"uppercase",marginBottom:8}}>Variation {i+1}</div>
      {ad.headline&&<div style={{fontSize:16,fontWeight:700,color:S.blue,marginBottom:4}}>{ad.headline}</div>}
      {ad.headline2&&<div style={{fontSize:14,fontWeight:600,color:S.text,marginBottom:4}}>{ad.headline2}</div>}
      {ad.primary&&<div style={{fontSize:14,color:S.text,fontWeight:600,marginBottom:6}}>{ad.primary}</div>}
      {ad.desc&&<div style={{fontSize:13,color:S.muted,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{ad.desc}</div>}
      {ad.caption&&<div style={{fontSize:13,color:S.muted,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{ad.caption}</div>}
      <div style={{position:"absolute",top:12,right:12}}><CopyBtn text={Object.values(ad).join("\n")}/></div>
    </Card>))}
  </V>);
}

// ─── TOOL: SALES COPY GENERATOR ────────────────────────────────
function SalesCopyGen(){
  const[product,setProduct]=useState("");const[problem,setProblem]=useState("");const[solution,setSolution]=useState("");
  const[benefits,setBenefits]=useState("");const[price,setPrice]=useState("");const[framework,setFramework]=useState("aida");
  const[output,setOutput]=useState("");
  const generate=()=>{
    const pr=product||"[Product]",pb=problem||"[Problem]",sl=solution||"[Solution]",bn=benefits||"[Benefits]",px=price;
    const fws={
      aida:`🔥 ATTENTION:\nAre you tired of ${pb}? You're not alone.\n\n💡 INTEREST:\n${pr} is the breakthrough solution that ${sl}.\n\n❤️ DESIRE:\nImagine: ${bn}. Thousands of customers already experience this daily.\n\n🚀 ACTION:\n${px?`Get ${pr} today for just ${px}.`:`Get started with ${pr} today.`} Don't wait — your future self will thank you.`,
      pas:`😤 THE PROBLEM:\n${pb} is costing you time, money, and peace of mind.\n\n😰 THE AGITATION:\nEvery day you wait, the problem gets worse. Your competitors are already solving this. Can you afford to fall behind?\n\n✅ THE SOLUTION:\n${pr} — ${sl}.\n\n${bn}\n\n${px?`→ Just ${px}. `:""}Start today and never look back.`,
      fab:`⭐ FEATURES:\n${pr} offers ${sl}.\n\n💎 ADVANTAGES:\nUnlike other solutions, ${pr} delivers: ${bn}.\n\n🎯 BENEFITS:\nThe result? ${pb} becomes a thing of the past. You save time, reduce stress, and achieve more.\n\n${px?`All for just ${px}.`:""} Try ${pr} today.`,
    };
    setOutput(fws[framework]||"");
  };
  return(<V>
    <div><Lab>Product / Service Name</Lab><Input value={product} onChange={setProduct} placeholder="ToolsRift Pro"/></div>
    <div><Lab>Problem You Solve</Lab><Input value={problem} onChange={setProblem} placeholder="Spending hours switching between 20 different tools" multiline rows={2}/></div>
    <div><Lab>Your Solution</Lab><Input value={solution} onChange={setSolution} placeholder="Combines 500+ tools into one fast, free platform" multiline rows={2}/></div>
    <div><Lab>Key Benefits</Lab><Input value={benefits} onChange={setBenefits} placeholder="Save 5+ hours/week, no subscriptions, instant access" multiline rows={2}/></div>
    <G2><div><Lab>Price (optional)</Lab><Input value={price} onChange={setPrice} placeholder="$12/month"/></div>
    <Sel label="Framework" value={framework} onChange={setFramework} options={[{v:"aida",l:"AIDA (Attention-Interest-Desire-Action)"},{v:"pas",l:"PAS (Problem-Agitate-Solve)"},{v:"fab",l:"FAB (Features-Advantages-Benefits)"}]}/></G2>
    <Btn onClick={generate}>Generate Sales Copy</Btn>
    {output&&<div style={{position:"relative"}}><pre style={{background:"rgba(0,0,0,0.4)",padding:20,borderRadius:10,fontSize:14,color:S.text,whiteSpace:"pre-wrap",lineHeight:1.8,fontFamily:S.font}}>{output}</pre><div style={{position:"absolute",top:8,right:8}}><CopyBtn text={output}/></div></div>}
  </V>);
}

// ─── TOOL: LANDING PAGE COPY GENERATOR ─────────────────────────
function LandingCopyGen(){
  const[product,setProduct]=useState("");const[tagline,setTagline]=useState("");const[audience,setAud]=useState("");
  const[features,setFeatures]=useState("");const[cta,setCta]=useState("Get Started Free");const[social,setSocial]=useState("");
  const[output,setOutput]=useState(false);
  return(<V>
    <div><Lab>Product Name</Lab><Input value={product} onChange={setProduct} placeholder="ToolsRift"/></div>
    <div><Lab>Tagline / Value Proposition</Lab><Input value={tagline} onChange={setTagline} placeholder="Every tool you need. One platform."/></div>
    <div><Lab>Target Audience</Lab><Input value={audience} onChange={setAud} placeholder="Marketers, developers, and content creators"/></div>
    <div><Lab>Key Features (comma separated)</Lab><Input value={features} onChange={setFeatures} placeholder="500+ tools, Free forever, No signup required, Instant results" multiline rows={2}/></div>
    <G2><div><Lab>CTA Button Text</Lab><Input value={cta} onChange={setCta} placeholder="Get Started Free"/></div>
    <div><Lab>Social Proof</Lab><Input value={social} onChange={setSocial} placeholder="Trusted by 50,000+ users"/></div></G2>
    <Btn onClick={()=>setOutput(true)}>Generate Landing Page Copy</Btn>
    {output&&<V gap={12}>
      <Card style={{background:"linear-gradient(135deg,rgba(5,150,105,0.08),rgba(59,130,246,0.04))",padding:32,textAlign:"center"}}>
        <div style={{fontSize:11,fontWeight:700,color:S.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>✨ HERO SECTION</div>
        <div style={{fontSize:28,fontWeight:800,color:S.text,fontFamily:S.display,lineHeight:1.3,marginBottom:8}}>{tagline||`${product||"Product"} — The Ultimate Solution`}</div>
        <div style={{fontSize:15,color:S.muted,maxWidth:500,margin:"0 auto 16px",lineHeight:1.6}}>Built for {audience||"professionals"} who want results without the complexity. {product||"We"} make it effortless.</div>
        <div style={{display:"inline-block",padding:"12px 28px",borderRadius:8,background:`linear-gradient(135deg,${S.accent},#047857)`,color:"#fff",fontWeight:700,fontSize:16,fontFamily:S.display}}>{cta}</div>
        {social&&<div style={{fontSize:13,color:S.muted,marginTop:12}}>⭐ {social}</div>}
      </Card>

      <Card>
        <div style={{fontSize:11,fontWeight:700,color:S.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:16}}>🎯 FEATURES SECTION</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {(features||"Feature 1,Feature 2,Feature 3,Feature 4").split(",").map((f,i)=>(
            <div key={i} style={{padding:16,background:"rgba(5,150,105,0.06)",borderRadius:8,border:"1px solid rgba(5,150,105,0.1)"}}>
              <div style={{fontSize:20,marginBottom:6}}>{"✅🚀💡⚡🔥🎯"[i%6]}</div>
              <div style={{fontSize:14,fontWeight:700,color:S.text,marginBottom:4}}>{f.trim()}</div>
              <div style={{fontSize:12,color:S.muted}}>A compelling benefit description that resonates with {audience||"your audience"}.</div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{textAlign:"center"}}>
        <div style={{fontSize:11,fontWeight:700,color:S.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>🔥 CTA SECTION</div>
        <div style={{fontSize:22,fontWeight:700,color:S.text,fontFamily:S.display,marginBottom:8}}>Ready to get started?</div>
        <div style={{fontSize:14,color:S.muted,marginBottom:16}}>Join {social||"thousands of users"} already using {product||"our platform"}.</div>
        <div style={{display:"inline-block",padding:"12px 28px",borderRadius:8,background:`linear-gradient(135deg,${S.accent},#047857)`,color:"#fff",fontWeight:700}}>{cta}</div>
      </Card>

      <div style={{fontSize:11,color:S.muted,textAlign:"center"}}>Copy each section and adapt the placeholder text to your brand voice.</div>
    </V>}
  </V>);
}

// ─── TOOL: ROI CALCULATOR ──────────────────────────────────────
function RoiCalculator(){
  const[invested,setInvested]=useState("");const[returned,setReturned]=useState("");
  const[period,setPeriod]=useState("monthly");
  const inv=p(invested),ret=p(returned);
  const profit=ret-inv;
  const roi=inv?(profit/inv)*100:0;
  const annualized=period==="monthly"?roi*12:period==="quarterly"?roi*4:roi;
  return(<V>
    <G2><NumInput label="Amount Invested ($)" value={invested} onChange={setInvested} placeholder="10000"/><NumInput label="Revenue Generated ($)" value={returned} onChange={setReturned} placeholder="35000"/></G2>
    <Sel label="Period" value={period} onChange={setPeriod} options={[{v:"monthly",l:"Monthly"},{v:"quarterly",l:"Quarterly"},{v:"annual",l:"Annual"}]}/>
    {invested&&returned&&<>
      <G3>
        <Big label="ROI" value={`${fmt(roi)}%`} color={roi>=0?S.green:S.red}/>
        <Big label="Net Profit" value={$(profit)} color={profit>=0?S.green:S.red}/>
        <Big label="Annualized ROI" value={`${fmt(annualized)}%`} color={S.blue}/>
      </G3>
      <Res label="Revenue" value={$(ret)} mono/><Res label="Investment" value={$(inv)} mono/>
      <Res label="Return Ratio" value={`${fmt(inv?ret/inv:0,2)}x`} mono color={ret>inv?S.green:S.red}/>
      <Res label="Performance" value={roi>=500?"🏆 Exceptional":roi>=200?"🔥 Excellent":roi>=100?"✅ Good":roi>=0?"⚠️ Low":"❌ Negative"} color={roi>=100?S.green:roi>=0?S.orange:S.red}/>
    </>}
    {!(invested&&returned)&&<div style={{padding:16,background:S.accentLight,borderRadius:8,color:S.muted,fontSize:14,textAlign:"center"}}>Enter values above to see your ROI</div>}
  </V>);
}

// ─── TOOL: BREAK EVEN CALCULATOR ───────────────────────────────
function BreakEvenCalc(){
  const[fixed,setFixed]=useState("");const[price,setPrice]=useState("");const[variable,setVariable]=useState("");
  const fc=p(fixed),sp=p(price),vc=p(variable);
  const contribution=sp-vc;
  const beUnits=contribution>0?fc/contribution:0;
  const beRevenue=beUnits*sp;
  const margin=sp?(contribution/sp)*100:0;
  return(<V>
    <G3>
      <NumInput label="Fixed Costs ($)" value={fixed} onChange={setFixed} placeholder="10000"/>
      <NumInput label="Selling Price per Unit ($)" value={price} onChange={setPrice} placeholder="50"/>
      <NumInput label="Variable Cost per Unit ($)" value={variable} onChange={setVariable} placeholder="20"/>
    </G3>
    {price&&variable&&contribution<=0
      ?<div style={{padding:16,background:"rgba(239,68,68,0.1)",borderRadius:8,color:S.red,fontSize:14,textAlign:"center"}}>⚠️ Break-even not achievable — price must exceed variable cost per unit</div>
      :fixed&&price&&variable?<>
        <G2>
          <Big label="Break-Even Units" value={fmt(beUnits,0)} sub="units to sell"/>
          <Big label="Break-Even Revenue" value={$(beRevenue)} color={S.blue}/>
        </G2>
        <Res label="Contribution Margin per Unit" value={$(contribution)} mono color={S.green}/>
        <Res label="Contribution Margin %" value={`${fmt(margin)}%`} mono/>
        <Res label="Fixed Costs" value={$(fc)} mono/>
        <Lab>Profit at Different Sales Volumes</Lab>
        {[0.5,1,1.5,2,3].map(mult=>{
          const units=Math.ceil(beUnits*mult);
          const profit=units*contribution-fc;
          return<Res key={mult} label={`${units} units`} value={$(profit)} mono color={profit>=0?S.green:S.red}/>;
        })}
      </>:<div style={{padding:16,background:S.accentLight,borderRadius:8,color:S.muted,fontSize:14,textAlign:"center"}}>Enter values above to see your break-even point</div>}
  </V>);
}

// ─── TOOL REGISTRY ─────────────────────────────────────────────
const TOOL_COMPONENTS = {
  "invoice-gen":InvoiceGenerator,"receipt-gen":ReceiptGenerator,"quotation-gen":QuotationGenerator,
  "business-card-gen":BusinessCardGen,"resume-builder":ResumeBuilder,"cover-letter-gen":CoverLetterGen,
  "swot-gen":SwotGen,"marketing-plan-gen":MarketingPlanGen,"persona-gen":PersonaGen,
  "utm-builder":UtmBuilder,"ad-copy-gen":AdCopyGen,"sales-copy-gen":SalesCopyGen,
  "landing-copy-gen":LandingCopyGen,"roi-calculator":RoiCalculator,"break-even-calc":BreakEvenCalc,
};

// ─── FAQ SECTION ───────────────────────────────────────────────
function FaqSection({toolId}){
  const seo=SEO[toolId];if(!seo||!seo.faq)return null;
  return(<div style={{marginTop:32,borderTop:`1px solid ${S.border}`,paddingTop:28}}>
    <h2 style={{fontSize:20,fontWeight:700,color:S.text,marginBottom:16,fontFamily:S.display}}>Frequently Asked Questions</h2>
    {seo.faq.map(([q,a],i)=>(
      <details key={i} style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:10,overflow:"hidden",marginBottom:8}}>
        <summary style={{padding:"14px 18px",cursor:"pointer",color:S.text,fontWeight:600,fontSize:14,listStyle:"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h3 style={{margin:0,fontSize:14,fontWeight:600}}>{q}</h3>
          <span style={{color:S.accent,fontSize:18,flexShrink:0}}>+</span>
        </summary>
        <div style={{padding:"0 18px 14px",color:S.muted,fontSize:13,lineHeight:1.7}}>{a}</div>
      </details>
    ))}
  </div>);
}

// ─── BREADCRUMBS ───────────────────────────────────────────────
function Breadcrumbs({items}){
  return(
    <>
      <nav style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:S.muted,marginBottom:16,flexWrap:"wrap"}}>
        {items.map((item,i)=><span key={i} style={{display:"flex",alignItems:"center",gap:6}}>
          {i>0&&<span style={{color:"#334155"}}>/</span>}
          {item.href?<a href={item.href} style={{color:S.accent,textDecoration:"none"}}>{item.label}</a>:<span style={{color:"#94A3B8"}}>{item.label}</span>}
        </span>)}
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolsrift.com" },
          { "@type": "ListItem", "position": 2, "name": "Business Tools", "item": "https://toolsrift.com/business" },
          { "@type": "ListItem", "position": 3, "name": items[2]?.label || "" }
        ]
      }) }} />
    </>
  );
}

// ─── NAV ──────────────────────────────────────────────────────
// NOTE: Nav + SiteFooter below are retained for reference/Phase 2, but are NOT
// rendered — every route is wrapped by the shared CategoryLayout, which supplies
// its own header + footer. Rendering these too produced duplicate chrome (BUG 1).
function Nav() {
  const [isDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const h = () => setScrolled(window.scrollY > 8); window.addEventListener("scroll", h, {passive:true}); return () => window.removeEventListener("scroll", h); }, []);
  return (
    <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 24px",borderBottom:`1px solid ${scrolled?"rgba(5,150,105,0.2)":S.border}`,position:"sticky",top:0,background:scrolled?"rgba(6,10,16,0.97)":"rgba(6,9,15,0.85)",backdropFilter:"blur(12px)",zIndex:100,transition:"all 0.3s"}}>
      <a href="https://toolsrift.com" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none"}}>
        <img src="/logo.svg" alt="ToolsRift" style={{height:36}}/>
        <span className="tr-nav-badge" style={{fontSize:11,color:S.muted,background:"rgba(255,255,255,0.05)",padding:"2px 8px",borderRadius:10}}>Business Tools</span>
      </a>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <a className="tr-nav-cats" href="#/tools" style={{padding:"6px 10px",borderRadius:6,fontSize:12,color:S.muted,textDecoration:"none"}} onMouseEnter={e=>{e.currentTarget.style.color=S.text;e.currentTarget.style.background="rgba(255,255,255,0.04)";}} onMouseLeave={e=>{e.currentTarget.style.color=S.muted;e.currentTarget.style.background="transparent";}}>All Tools</a>
        {/* PHASE 2: <UsageCounter/> */}
        <a href="/" style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600,color:"#E2E8F0",textDecoration:"none",background:"rgba(255,255,255,0.06)",border:`1px solid ${S.border}`}}>🏠 Home</a>
      </div>
    </nav>
  );
}

// ─── SITE FOOTER ────────────────────────────────────────────────
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
    <div style={{maxWidth:920,margin:"0 auto",padding:"32px 24px 28px",borderTop:`1px solid ${S.border}`}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <span style={{fontSize:11,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em"}}>Explore More Tools</span>
        <a href="/" style={{fontSize:12,color:S.accent,textDecoration:"none",fontWeight:600}}>← Back to Home</a>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
        {pages.map(p=>(
          <a key={p.href} href={p.href} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 13px",borderRadius:8,background:S.card,border:`1px solid ${S.border}`,fontSize:12,fontWeight:500,color:S.muted,textDecoration:"none"}}
            onMouseEnter={e=>{e.currentTarget.style.color=S.text;e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";e.currentTarget.style.background="rgba(255,255,255,0.06)";}}
            onMouseLeave={e=>{e.currentTarget.style.color=S.muted;e.currentTarget.style.borderColor=S.border;e.currentTarget.style.background=S.card;}}>
            <span>{p.icon}</span>{p.label}
          </a>
        ))}
      </div>
      <div style={{textAlign:"center",fontSize:11,color:"#334155"}}>© 2026 ToolsRift · Free online tools · No signup required</div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────
function ToolsRiftBusiness(){
  const {page,toolId}=useAppRouter();
  // BUG 1/2 FIX: Every route below is wrapped by the shared CategoryLayout, which
  // provides its own full-width sticky header + footer. So we must NOT also render
  // the local <Nav/> + <SiteFooter/> (that caused two headers/footers on #/tools),
  // and CategoryLayout is returned at the component top level (full width) instead of
  // being squeezed inside a 920px-constrained <main>.
  const activeTool=toolId?TOOLS.find(t=>t.id===toolId):null;
  const ToolComp=toolId?TOOL_COMPONENTS[toolId]:null;
  const seo=toolId?SEO[toolId]:null;
  // PHASE 2: const [upgradeReason, setUpgradeReason] = useState(null);
  // PHASE 2: const [allowed, setAllowed] = useState(false);
  // PHASE 2: useEffect(() => { if (!toolId) return; if (isLimitReached()) { ... } trackUse(toolId); }, [toolId]);

  useEffect(()=>{
    if(seo)document.title=`${seo.title} | ${BRAND.name}`;
    else if(activeTool)document.title=`${activeTool.name} - Free Online | ${BRAND.name}`;
    else if(page==="dashboard")document.title=`Business & Marketing Tools | ${BRAND.name}`;
    else document.title=`${BRAND.name} - 15 Free Business & Marketing Tools`;
  },[page,seo,activeTool]);

  return(
    <div style={{minHeight:"100vh",background:S.bg,color:S.text,fontFamily:S.font}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
        ::selection{background:rgba(5,150,105,0.3)}
        button:hover{filter:brightness(1.1)}a{transition:opacity 0.2s}a:hover{opacity:0.85}
        select option{background:#0D1424}
        details summary::-webkit-details-marker{display:none}
        input[type="number"]::-webkit-inner-spin-button{opacity:0.3}
        .tr-nav-cats{display:flex;gap:4px;align-items:center}
        .tr-nav-badge{display:inline-flex}
        @media(max-width:640px){
          .tr-nav-cats{display:none!important}
          .tr-nav-badge{display:none!important}
        }
        @media print{
          /* Print/Save-PDF: show ONLY the document being exported, on a clean white page */
          body *{visibility:hidden!important}
          .tr-print-doc,.tr-print-doc *{visibility:visible!important}
          .tr-print-doc{position:absolute!important;left:0!important;top:0!important;width:100%!important;margin:0!important;padding:24px!important;box-shadow:none!important;border-radius:0!important;background:#fff!important;color:#1E293B!important}
          .tr-no-print{display:none!important}
          @page{margin:12mm}
        }
      `}</style>
      {page==="tool"&&activeTool&&ToolComp?(
        <CategoryLayout theme={PAGE_THEME} currentTool={activeTool.id} tools={TOOLS} subcats={CATEGORIES}>
          <ToolPageLayout
            theme={PAGE_THEME}
            tool={{
              id: activeTool.id,
              name: activeTool.name,
              icon: activeTool.icon,
              description: seo?.desc || activeTool.desc,
              howTo: seo?.howTo,
              faq: seo?.faq,
            }}
            tools={TOOLS}
            subcats={CATEGORIES}
            related={TOOLS.filter(t=>t.id!==activeTool.id && t.cat===activeTool.cat).slice(0,8)}
          >
            <ToolComp/>
          </ToolPageLayout>
        </CategoryLayout>
      ):(
        <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
          <CategoryDashboard
            theme={PAGE_THEME}
            tools={TOOLS}
            subcats={CATEGORIES}
            searchPlaceholder="Search business tools..."
          />
        </CategoryLayout>
      )}
    </div>
  );
}

export default ToolsRiftBusiness;
