import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  { id: "purchase-order-gen", cat: "documents", name: "Purchase Order Generator", icon: "📦", desc: "Create purchase orders with line items, tax, and totals" },
  { id: "packing-slip-gen", cat: "documents", name: "Packing Slip Generator", icon: "📬", desc: "Generate itemized packing slips for shipments and orders" },
  { id: "timesheet-gen", cat: "documents", name: "Timesheet Generator", icon: "⏱️", desc: "Build a weekly timesheet with hours, overtime, and pay" },
  { id: "expense-report-gen", cat: "documents", name: "Expense Report Generator", icon: "💳", desc: "Create expense reports with category breakdowns and totals" },
  { id: "markup-margin-calc", cat: "finance", name: "Markup & Margin Calculator", icon: "🏷️", desc: "Calculate markup, profit margin, and selling price" },
  { id: "cagr-calc", cat: "finance", name: "CAGR Calculator", icon: "📈", desc: "Compute compound annual growth rate over any period" },
  { id: "clv-calc", cat: "finance", name: "Customer Lifetime Value Calculator", icon: "💎", desc: "Estimate customer lifetime value from order and margin data" },
  { id: "business-hours-gen", cat: "marketing", name: "Business Hours Schema Generator", icon: "🕒", desc: "Generate schema.org opening-hours JSON-LD for local SEO" },
  { id: "meeting-agenda-gen", cat: "strategy", name: "Meeting Agenda Generator", icon: "🗓️", desc: "Build a structured meeting agenda with timed discussion items" },
  { id: "memo-gen", cat: "career", name: "Business Memo Generator", icon: "📝", desc: "Create a formatted business memorandum (memo)" },
  { id: "press-release-gen", cat: "marketing", name: "Press Release Generator", icon: "📰", desc: "Draft a professional press release from a few key details" },
  { id: "job-description-gen", cat: "career", name: "Job Description Generator", icon: "📋", desc: "Generate a structured job description for any role" },
  { id: "payslip-gen", cat: "documents", name: "Payslip / Salary Slip Generator", icon: "🧮", desc: "Create a printable payslip with editable earnings and deductions, automatic gross, net pay and net pay in words." },
  { id: "rent-receipt-gen", cat: "documents", name: "Rent Receipt Generator", icon: "🏠", desc: "Generate monthly or quarterly rent receipts with landlord PAN and revenue stamp note for HRA claims." },
  { id: "salary-certificate-gen", cat: "documents", name: "Salary Certificate Generator", icon: "📑", desc: "Produce a salary certificate on your letterhead showing designation, tenure and a monthly salary breakdown." },
  { id: "offer-letter-gen", cat: "documents", name: "Job Offer Letter Generator", icon: "🤝", desc: "Draft a clear job offer letter with role, compensation, start date, probation and acceptance terms." },
  { id: "appointment-letter-gen", cat: "documents", name: "Appointment Letter Generator", icon: "📜", desc: "Create an appointment letter covering designation, joining date, salary, probation, notice period and duties." },
  { id: "experience-letter-gen", cat: "documents", name: "Experience / Service Certificate Generator", icon: "🎓", desc: "Generate an experience certificate with auto-calculated tenure, designation history and a conduct remark." },
  { id: "relieving-letter-gen", cat: "documents", name: "Relieving Letter Generator", icon: "👋", desc: "Write a relieving letter confirming resignation acceptance, last working day and completed clearance formalities." },
  { id: "delivery-challan-gen", cat: "documents", name: "Delivery Challan Generator", icon: "🚚", desc: "Build a delivery challan with consignor, consignee, vehicle number, HSN codes, quantities and goods value." },
  { id: "credit-note-gen", cat: "documents", name: "Credit Note Generator", icon: "↩️", desc: "Issue a credit note against an invoice for returns, discounts or overbilling, with tax and amount in words." },
  { id: "debit-note-gen", cat: "documents", name: "Debit Note Generator", icon: "↪️", desc: "Raise a debit note for undercharged invoices, extra supplies or price revisions, with tax and total in words." },
  { id: "proforma-invoice-gen", cat: "documents", name: "Proforma Invoice Generator", icon: "🧾", desc: "Create a proforma invoice quoting goods, taxes, shipping and bank details before the final tax invoice." },
  { id: "petty-cash-gen", cat: "documents", name: "Petty Cash Voucher Generator", icon: "💵", desc: "Print petty cash vouchers with expense lines, account heads, total in words and approval signature blocks." },
  { id: "profit-loss-gen", cat: "finance", name: "Profit & Loss Statement Generator", icon: "📉", desc: "Build a profit and loss statement with revenue, COGS, expenses, gross margin, EBIT, tax and net profit." },
  { id: "balance-sheet-gen", cat: "finance", name: "Balance Sheet Generator", icon: "⚖️", desc: "Create a balance sheet with assets, liabilities and equity, plus a balance check and key liquidity ratios." },
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
  "purchase-order-gen":{title:"Free Purchase Order Generator",faq:[["What is a purchase order?","A purchase order (PO) is a buyer-issued document authorizing a purchase, listing items, quantities, agreed prices, and delivery details."],["How is a PO different from an invoice?","A purchase order is sent by the buyer to order goods. An invoice is sent by the seller to request payment for those goods."]]},
  "packing-slip-gen":{title:"Free Packing Slip Generator",faq:[["What is a packing slip?","A packing slip is a document included with a shipment that lists the items and quantities being sent, but usually omits prices."],["Do I need a packing slip and an invoice?","A packing slip helps the recipient verify the contents of a shipment, while an invoice handles billing. Many businesses include both."]]},
  "timesheet-gen":{title:"Free Timesheet Generator",faq:[["How is overtime calculated?","This tool treats hours over 40 in a week as overtime, paid at 1.5× the base rate by default. Regular hours are paid at the base rate."],["Can I use this for payroll?","It gives a clear breakdown of regular hours, overtime, and gross pay. Confirm figures against your local labor laws before payroll."]]},
  "expense-report-gen":{title:"Free Expense Report Generator",faq:[["What should an expense report include?","Date, category, description, and amount for each expense, plus subtotals per category and an overall total for reimbursement."],["Can I group expenses by category?","Yes. This generator automatically totals each spending category (travel, meals, supplies, etc.) and sums the grand total."]]},
  "markup-margin-calc":{title:"Free Markup & Margin Calculator",faq:[["What is the difference between markup and margin?","Markup is profit as a percentage of cost: (Price − Cost) / Cost. Margin is profit as a percentage of price: (Price − Cost) / Price."],["How do I set a price for a target margin?","Price = Cost / (1 − Margin%). This tool shows the required price for any target margin you enter."]]},
  "cagr-calc":{title:"Free CAGR Calculator",faq:[["What is CAGR?","Compound Annual Growth Rate is the smoothed annual rate at which a value grows over multiple periods: (End/Start)^(1/Years) − 1."],["Why use CAGR instead of average growth?","CAGR accounts for compounding and gives a single, comparable annual rate, whereas a simple average can overstate volatile returns."]]},
  "clv-calc":{title:"Free Customer Lifetime Value Calculator",faq:[["How is customer lifetime value calculated?","LTV = Average Order Value × Purchase Frequency (per year) × Customer Lifespan (years) × Gross Margin %."],["Why does CLV matter?","CLV tells you how much revenue a customer generates over time, so you can set a sensible customer acquisition cost (CAC) budget."]]},
  "business-hours-gen":{title:"Free Business Hours Schema Generator",faq:[["What is opening-hours structured data?","It is schema.org JSON-LD markup that tells Google your open and close times, helping your hours appear in search and maps."],["Where do I put the generated code?","Paste the JSON-LD script into the <head> of your website's homepage or contact page so search engines can read it."]]},
  "meeting-agenda-gen":{title:"Free Meeting Agenda Generator",faq:[["What makes a good meeting agenda?","A clear objective, timed discussion topics with an owner for each, attendee list, and a defined start and end time to keep things focused."],["How long should each agenda item be?","Assign realistic time blocks. This tool sums the minutes so you can keep the total within your scheduled meeting length."]]},
  "memo-gen":{title:"Free Business Memo Generator",faq:[["What is a business memo?","A memorandum is a short internal document with a standard TO / FROM / DATE / SUBJECT header used to share information within an organization."],["How long should a memo be?","Keep it concise — usually under one page. State the purpose in the first line and end with any required action."]]},
  "press-release-gen":{title:"Free Press Release Generator",faq:[["What is the structure of a press release?","Headline, dateline (city and date), an opening paragraph answering who/what/when/where/why, supporting body, a quote, and boilerplate."],["What is a boilerplate?","A short standard paragraph about your company placed at the end of every press release describing what your organization does."]]},
  "job-description-gen":{title:"Free Job Description Generator",faq:[["What should a job description include?","Job title, company overview, responsibilities, required qualifications, preferred skills, location, employment type, and how to apply."],["How do I write an effective job description?","Use clear, inclusive language, list concrete responsibilities, and separate must-have requirements from nice-to-have skills."]]},

  "payslip-gen":{
    title:"Free Payslip Generator — Salary Slip Maker | ToolsRift",
    desc:"Create a printable payslip in seconds. Editable earnings and deductions, auto gross and net pay, net amount in words, five currencies and A4 print or PDF.",
    keywords:"payslip generator, salary slip format, free payslip maker, salary slip generator india, pay stub generator, net pay in words",
    faq:[
      ["What must a payslip contain?","At minimum a payslip should show the employer and employee names, the pay period, each earning head (basic, HRA, allowances), each deduction (provident fund, professional tax, income tax), and the resulting gross and net pay. Many jurisdictions also expect an employee ID, days paid and loss-of-pay days, all of which this generator includes."],
      ["Does the payslip work outside India?","Yes. The row labels are fully editable and the currency selector supports INR, USD, GBP, EUR and AED. Pick your currency and rename rows such as Provident Fund or Professional Tax to the equivalents used in your country, and the amount-in-words line switches between the Indian lakh/crore system and the international million/billion system automatically."],
      ["Is a generated payslip legally valid proof of income?","The document this tool formats is only as valid as the figures you enter and the authority of the person issuing it. A payslip is normally issued by the employer and signed or system-generated. Use this as a formatting aid and have your payroll or finance team verify every figure before issuing it."],
    ],
    howTo:"Fill in the employer and employee blocks, then set the pay period, days paid and loss-of-pay days. Add, rename or remove earning and deduction rows — gross, total deductions, net pay and the net-pay-in-words line recalculate instantly. Click Print / Save as PDF to export a clean A4 payslip.",
  },
  "rent-receipt-gen":{
    title:"Free Rent Receipt Generator for HRA Claims | ToolsRift",
    desc:"Generate monthly or quarterly rent receipts with landlord name, PAN, property address and revenue stamp note. Print a full year of HRA rent receipts in one click.",
    keywords:"rent receipt generator, rent receipt for HRA, house rent receipt format, landlord PAN rent receipt, monthly rent receipt, rent receipt pdf",
    faq:[
      ["What does a rent receipt need for an HRA claim?","Employers usually ask for the tenant and landlord names, the rented property address, the rent amount, the period covered and the landlord's signature. If your annual rent exceeds the threshold set by the tax authority (₹1,00,000 a year in India), the landlord's PAN is also required, so this generator has a dedicated PAN field."],
      ["When is a revenue stamp needed on a rent receipt?","In India a revenue stamp is customarily affixed when a single rent payment above ₹5,000 is made in cash. Payments by bank transfer, cheque or UPI are traceable and generally do not need one. The generator prints a revenue stamp box and note automatically when your settings meet that condition."],
      ["Can I generate a whole year of receipts at once?","Yes. Choose monthly or quarterly frequency, set the starting month and the number of receipts (up to 24) and the tool lays out every period with its own receipt number, date range and amount, ready to print as a single document."],
    ],
    howTo:"Enter the tenant, landlord and property details along with the rent per month and the payment mode. Choose the frequency and how many receipts you need, then review the printable stack of receipts and hit Print / Save as PDF to get them all on paper for your HRA file.",
  },
  "salary-certificate-gen":{
    title:"Free Salary Certificate Generator — Income Letter | ToolsRift",
    desc:"Create a salary certificate showing designation, date of joining and a monthly salary breakdown with gross, deductions and net pay. Print-ready A4 letter format.",
    keywords:"salary certificate generator, salary certificate format, income certificate for employee, salary letter for bank loan, employment income letter",
    faq:[
      ["What is a salary certificate used for?","It is an employer-issued letter confirming that a person works for the organisation and what they are paid. Banks, landlords, embassies and visa offices commonly ask for one to verify income before approving a loan, tenancy or visa application."],
      ["How is a salary certificate different from a payslip?","A payslip covers a single pay period and is generated every month by payroll. A salary certificate is a one-off letter on company letterhead, signed by an authorised person, that summarises current compensation and employment status — usually addressed to whoever requested it."],
      ["Who should sign the salary certificate?","It should be signed by someone with authority to confirm employment terms, typically the HR manager, finance head or a director, with their name, designation and the company stamp. Enter the signatory details in the tool so they print in the correct position."],
    ],
    howTo:"Fill in the company block, employee details and the salary components you want disclosed. The tool totals the earnings and deductions and states the net monthly salary in the letter body. Add the purpose and signatory, then print or save the certificate as a PDF.",
  },
  "offer-letter-gen":{
    title:"Free Job Offer Letter Generator for Employers | ToolsRift",
    desc:"Draft a professional job offer letter with role, compensation, joining date, probation, work location and acceptance terms. Editable, print-ready and free.",
    keywords:"offer letter generator, job offer letter format, employment offer letter template, offer letter for employee, hiring offer letter",
    faq:[
      ["What should a job offer letter include?","The role title and department, reporting manager, start date, work location, employment type, total compensation, probation period and a clear statement that the offer is subject to any checks you require. It should also give the candidate a deadline for accepting."],
      ["Is an offer letter a binding employment contract?","An offer letter usually sets out the headline terms and becomes binding once accepted, but a detailed appointment letter or employment agreement typically follows and governs the full relationship. Have a lawyer review your standard wording before you send offers at scale."],
      ["Should the offer letter mention conditions?","Yes. If the offer depends on background verification, reference checks, medical clearance or proof of qualifications, state that plainly in the letter so both sides understand the offer can be withdrawn if a condition is not met."],
    ],
    howTo:"Enter the company details, candidate details and the terms of the role including compensation and joining date. The letter body is composed for you and updates as you type. Review the preview, then print or save it as a PDF and send it to the candidate.",
  },
  "appointment-letter-gen":{
    title:"Free Appointment Letter Generator for Employers | ToolsRift",
    desc:"Create an appointment letter with designation, joining date, salary, probation, notice period, working hours and custom terms. Clean A4 letter you can print free.",
    keywords:"appointment letter generator, appointment letter format, employee appointment letter template, joining letter format, appointment letter pdf",
    faq:[
      ["How is an appointment letter different from an offer letter?","An offer letter proposes a role and invites the candidate to accept. An appointment letter is issued once the offer is accepted and formally confirms the appointment, spelling out the working terms — designation, salary, probation, notice period, hours and any conditions of service."],
      ["What terms should an appointment letter cover?","Designation and department, date of joining, place of work, remuneration, probation period and confirmation process, notice period for either side, working hours, and any policies on confidentiality and company property that the employee is agreeing to."],
      ["Can I add my own clauses?","Yes. The tool includes an additional terms box where you can list custom clauses one per line — non-disclosure, intellectual property, relocation, bond or leave policy — and each one prints as a numbered term in the letter."],
    ],
    howTo:"Fill in the employer and employee blocks, then set designation, joining date, compensation, probation and notice period. Add any extra clauses one per line. The formatted letter builds live in the preview — print it or save it as a PDF to issue.",
  },
  "experience-letter-gen":{
    title:"Free Experience Letter & Service Certificate Maker | ToolsRift",
    desc:"Generate an experience certificate with auto-calculated tenure in years and months, designation, department and a conduct remark. Print-ready A4 letter, free.",
    keywords:"experience letter generator, experience certificate format, service certificate template, work experience letter for employee, employment certificate",
    faq:[
      ["What is an experience letter?","It is a letter from a former or current employer confirming that a person worked there, in what role, and for how long. Recruiters and background verification agencies use it as evidence of the work history claimed on a CV."],
      ["How is the tenure calculated?","The tool takes the date of joining and the last working day and works out the exact duration in whole years and months, so you never have to compute it by hand or risk a mismatch between the dates and the wording of the letter."],
      ["Should the experience letter mention salary or performance?","Most organisations keep experience certificates factual — dates, designation and department — and add only a neutral conduct remark. Detailed performance or salary information usually belongs in a separate salary certificate or reference letter given only with the employee's consent."],
    ],
    howTo:"Enter the company details, the employee's name, designation and department, then the joining and last working dates. The tenure line calculates itself. Pick a conduct remark, add the signatory, and print or save the certificate as a PDF.",
  },
  "relieving-letter-gen":{
    title:"Free Relieving Letter Generator for Employers | ToolsRift",
    desc:"Write a relieving letter confirming resignation acceptance, last working day, clearance of dues and return of company property. Free print-ready A4 letter format.",
    keywords:"relieving letter generator, relieving letter format, resignation acceptance letter, last working day letter, employee exit letter",
    faq:[
      ["What is a relieving letter?","It is the letter an employer issues at the end of employment confirming that the resignation was accepted, stating the last working day, and recording that the employee has been relieved of their duties. New employers often ask for it before confirming a joining date."],
      ["What is the difference between a relieving letter and an experience letter?","A relieving letter is about the exit — it proves you were formally released and that no dues or formalities remain outstanding. An experience letter is about the tenure — it describes the role held and how long it lasted. Many companies issue both on the same day."],
      ["Should the letter mention clearance of dues?","Yes, if it applies. Stating that the employee has completed exit formalities, returned company property and has no pending dues protects both sides later. This generator includes a toggle for that clearance statement so you can include or omit it."],
    ],
    howTo:"Fill in the company block and the employee's name, ID, designation and department, then add the resignation date and the last working day. Choose whether to include the dues-clearance statement, review the letter, and print or save it as a PDF.",
  },
  "delivery-challan-gen":{
    title:"Free Delivery Challan Generator with HSN Codes | ToolsRift",
    desc:"Create a delivery challan with consignor, consignee, vehicle number, transport mode, HSN codes, quantities and total goods value. Print or save as PDF free.",
    keywords:"delivery challan generator, delivery challan format, challan for job work, goods dispatch note, delivery challan pdf, transport challan",
    faq:[
      ["What is a delivery challan used for?","It accompanies goods that are moving but are not being sold outright at that moment — job work, samples, goods sent on approval, stock transfers between branches, or returnable equipment. It proves what left the premises and in what quantity."],
      ["How is a delivery challan different from an invoice?","An invoice creates a demand for payment and records the sale. A delivery challan records the physical movement of goods and states their value for transport purposes only. When the goods are eventually sold, a tax invoice is raised separately."],
      ["What details should a challan carry?","Consignor and consignee names and addresses, a serial challan number and date, a description of the goods with HSN or item codes, quantity and unit, the value of the goods, the purpose of movement, and vehicle and transport details where applicable."],
    ],
    howTo:"Enter the consignor and consignee details, the challan number, date, purpose of movement and vehicle details. Add one row per item with its code, quantity, unit and rate — the value totals automatically. Print the challan or save it as a PDF for the driver.",
  },
  "credit-note-gen":{
    title:"Free Credit Note Generator Against Invoice | ToolsRift",
    desc:"Issue a credit note for returns, discounts or overbilling. Links to the original invoice, adds tax, totals the credit and prints the amount in words. Free A4 format.",
    keywords:"credit note generator, credit note format, credit note against invoice, sales return credit note, credit memo template",
    faq:[
      ["When should a business issue a credit note?","Whenever the amount already invoiced to a customer needs to be reduced — goods were returned, the invoice overstated the quantity or rate, a post-sale discount was agreed, or a service was not delivered. The credit note reduces the customer's outstanding balance by the stated amount."],
      ["Does a credit note need to reference the original invoice?","Yes. Tax authorities and auditors expect a credit note to identify the invoice it corrects by number and date, along with the reason for the adjustment. This generator has dedicated fields for the original invoice number, its date and the reason."],
      ["What is the difference between a credit note and a refund?","A credit note is an accounting document that reduces what the customer owes; the balance can be offset against future invoices. A refund is the actual movement of money back to the customer. A credit note often precedes a refund but the two are recorded separately."],
    ],
    howTo:"Fill in your business and customer details, then reference the original invoice number, its date and the reason for the credit. Add the credited line items with quantity and rate, set the tax rate, and print or save the credit note as a PDF.",
  },
  "debit-note-gen":{
    title:"Free Debit Note Generator for Businesses | ToolsRift",
    desc:"Raise a debit note for undercharged invoices, extra supplies or price revisions. References the original invoice, adds tax and prints the total in words. Free A4.",
    keywords:"debit note generator, debit note format, debit note against invoice, purchase return debit note, debit memo template",
    faq:[
      ["When is a debit note issued?","When the amount already invoiced turns out to be too low — the rate was understated, extra quantity was supplied, freight or handling was omitted, or a price revision was agreed after the invoice went out. The debit note increases the amount the customer owes."],
      ["Who issues a debit note, the buyer or the seller?","Both do, in different situations. A seller raises one to charge more against an earlier invoice. A buyer raises one to notify a supplier of goods returned or of an overcharge they expect to be credited. This tool prints either — just set the parties accordingly."],
      ["Must a debit note quote the original invoice?","Yes. Referencing the invoice number and date is what links the adjustment to the original transaction, which is what auditors and tax filings need. The reason for the debit should also be stated in one clear line."],
    ],
    howTo:"Enter your business and the counterparty's details, then reference the original invoice number, its date and the reason for the debit. Add the line items being charged, set the tax rate, and print or save the debit note as a PDF.",
  },
  "proforma-invoice-gen":{
    title:"Free Proforma Invoice Generator with Tax | ToolsRift",
    desc:"Create a proforma invoice quoting goods, tax, shipping and bank details before the final tax invoice. Totals and amount in words included. Print or save as PDF.",
    keywords:"proforma invoice generator, proforma invoice format, pro forma invoice template, advance payment invoice, export proforma invoice",
    faq:[
      ["What is a proforma invoice?","It is a preliminary bill sent before goods or services are delivered. It commits the seller to the quantities, prices, taxes and terms shown so the buyer can raise a purchase order, arrange payment, open a letter of credit or clear customs paperwork in advance."],
      ["Is a proforma invoice a legal demand for payment?","No. It is not a tax invoice and it does not create a receivable in your books. Once the goods ship or the service is delivered, you issue the actual tax invoice, which is the document used for accounting and tax purposes."],
      ["What should a proforma invoice include?","Seller and buyer details, a proforma number and date, a validity date, itemised goods with quantity and rate, applicable tax, shipping or handling charges, payment terms and bank details for the transfer. Every one of those has a field in this generator."],
    ],
    howTo:"Fill in the seller and buyer blocks, the proforma number, date and validity. Add line items with quantity and rate, set tax and shipping, then enter your payment terms and bank details. Review the preview and print or save it as a PDF to send.",
  },
  "petty-cash-gen":{
    title:"Free Petty Cash Voucher Generator — Print Ready | ToolsRift",
    desc:"Print petty cash vouchers with expense lines, account heads, voucher number, total in words and signature blocks for paid-by, received-by and approved-by. Free.",
    keywords:"petty cash voucher generator, petty cash voucher format, cash payment voucher template, expense voucher print, petty cash book slip",
    faq:[
      ["What is a petty cash voucher?","It is the slip that records a small cash payment made from the office cash float — taxi fare, courier charges, stationery, refreshments. It documents who received the money, what it was for, which account head it belongs to, and who authorised it."],
      ["Why do businesses need vouchers for small amounts?","Because cash leaves no bank trail. A signed voucher with a receipt attached is the only evidence an auditor has that the money was spent on business. Vouchers also let you reconcile the cash box: opening float minus vouchers should equal the cash remaining."],
      ["What should be attached to the voucher?","The original bill or receipt for the expense, stapled to the voucher and filed in voucher-number order. If no receipt exists, note that on the voucher and have the approver initial it, since unsupported cash payments are the first thing an auditor questions."],
    ],
    howTo:"Enter the voucher number, date, department and the person being paid, then list each expense line with its account head and amount. The total and the amount in words fill in automatically. Print the voucher, attach the receipt, and collect the signatures.",
  },
  "profit-loss-gen":{
    title:"Free Profit & Loss Statement Generator (P&L) | ToolsRift",
    desc:"Build a profit and loss statement with revenue, COGS, operating expenses, gross margin, EBIT, tax and net profit. Editable rows, print-ready A4 output, free.",
    keywords:"profit and loss statement generator, P&L statement format, income statement template, gross margin calculator, net profit statement",
    faq:[
      ["What does a profit and loss statement show?","It reports performance over a period — a month, quarter or year. Revenue comes first, cost of goods sold is subtracted to give gross profit, operating expenses are subtracted to give operating profit (EBIT), then other income, other expenses and tax produce the net profit for the period."],
      ["What is the difference between gross margin and net margin?","Gross margin is gross profit as a percentage of revenue and tells you how profitable the product or service is before running costs. Net margin is net profit as a percentage of revenue and tells you what actually survives after every cost, including overheads and tax."],
      ["Can I use this statement for filing taxes?","Treat it as a working draft. It formats and totals the numbers you enter, but statutory filings need figures drawn from your books under the accounting standards that apply to you. Have a qualified accountant review the statement before it is filed or shared with lenders."],
    ],
    howTo:"Set the business name, period and currency, then fill in your revenue, cost of goods sold and operating expense rows — add or remove lines as needed. Gross profit, EBIT, tax and net profit recalculate live. Print the statement or save it as a PDF.",
  },
  "balance-sheet-gen":{
    title:"Free Balance Sheet Generator with Ratios | ToolsRift",
    desc:"Create a balance sheet with current and non-current assets, liabilities and equity. Automatic balance check, working capital, current ratio and debt-to-equity. Free.",
    keywords:"balance sheet generator, balance sheet format, statement of financial position template, current ratio calculator, assets liabilities equity sheet",
    faq:[
      ["What does a balance sheet show?","It is a snapshot of what a business owns and owes on one specific date. Assets appear on one side, liabilities and owner's equity on the other, and the two sides must be equal — that identity is the reason it is called a balance sheet."],
      ["Why does my balance sheet not balance?","Almost always because a figure is missing or double counted: retained earnings not carried over, a loan recorded as an asset, or an expense entered without the matching cash reduction. This tool shows the exact difference between the two sides so you can hunt down the gap."],
      ["What do the ratios at the bottom mean?","Working capital is current assets minus current liabilities and shows short-term breathing room. The current ratio divides the same two figures, with above 1 generally meaning you can cover near-term dues. Debt-to-equity compares total liabilities to owner's equity and indicates how leveraged the business is."],
    ],
    howTo:"Enter the business name, the as-of date and your currency, then list current assets, non-current assets, current and non-current liabilities and equity lines. The totals, the balance check and the ratios update as you type. Print or save the sheet as a PDF.",
  },
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

// ─── TOOL: PURCHASE ORDER GENERATOR ────────────────────────────
function PurchaseOrderGen(){
  const[from,setFrom]=useState({name:"",addr:""});
  const[to,setTo]=useState({name:"",addr:""});
  const[po,setPo]=useState("PO-001");
  const[date,setDate]=useState(new Date().toISOString().split("T")[0]);
  const[deliver,setDeliver]=useState("");
  const[items,setItems]=useState([{desc:"",qty:1,rate:0}]);
  const[taxRate,setTaxRate]=useState("0");const[notes,setNotes]=useState("");
  const add=()=>setItems([...items,{desc:"",qty:1,rate:0}]);
  const upd=(i,f,v)=>{const n=[...items];n[i][f]=v;setItems(n)};
  const rm=(i)=>setItems(items.filter((_,j)=>j!==i));
  const sub=items.reduce((s,it)=>s+p(it.qty)*p(it.rate),0);
  const tax=sub*p(taxRate)/100;const total=sub+tax;
  return(<V>
    <G2>
      <Card><Lab>Buyer (Your Business)</Lab><Input value={from.name} onChange={v=>setFrom({...from,name:v})} placeholder="Business Name" style={{marginBottom:8}}/><Input value={from.addr} onChange={v=>setFrom({...from,addr:v})} placeholder="Address" multiline rows={2}/></Card>
      <Card><Lab>Vendor / Supplier</Lab><Input value={to.name} onChange={v=>setTo({...to,name:v})} placeholder="Vendor Name" style={{marginBottom:8}}/><Input value={to.addr} onChange={v=>setTo({...to,addr:v})} placeholder="Vendor Address" multiline rows={2}/></Card>
    </G2>
    <G3><div><Lab>PO #</Lab><Input value={po} onChange={setPo}/></div><div><Lab>Date</Lab><Input type="date" value={date} onChange={setDate}/></div><div><Lab>Delivery Date</Lab><Input type="date" value={deliver} onChange={setDeliver}/></div></G3>
    <Lab>Line Items</Lab>
    {items.map((it,i)=>(<div key={i} style={{display:"flex",gap:8,alignItems:"end",marginBottom:8}}>
      <div style={{flex:3}}>{i===0&&<Lab>Description</Lab>}<Input value={it.desc} onChange={v=>upd(i,"desc",v)} placeholder="Item or material"/></div>
      <div style={{flex:1}}>{i===0&&<Lab>Qty</Lab>}<Input value={String(it.qty)} onChange={v=>upd(i,"qty",v)} placeholder="1"/></div>
      <div style={{flex:1}}>{i===0&&<Lab>Unit ($)</Lab>}<Input value={String(it.rate)} onChange={v=>upd(i,"rate",v)} placeholder="0"/></div>
      <div style={{flex:1,textAlign:"right",paddingBottom:10,color:S.text,fontWeight:700,fontFamily:S.mono}}>{$(p(it.qty)*p(it.rate))}</div>
      {items.length>1&&<Btn v="ghost" s="sm" onClick={()=>rm(i)}>✕</Btn>}
    </div>))}
    <Btn v="secondary" s="sm" onClick={add}>+ Add Line Item</Btn>
    <G2><NumInput label="Tax Rate (%)" value={taxRate} onChange={setTaxRate} placeholder="0"/><div><Lab>Notes / Terms</Lab><Input value={notes} onChange={setNotes} placeholder="Shipping terms, payment terms..." multiline rows={2}/></div></G2>
    <div style={{borderRadius:10,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.4)"}}>
      <div className="tr-print-doc" style={{background:"white",color:"#1E293B",padding:"32px 40px",fontFamily:S.font}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:20,paddingBottom:16,borderBottom:"2px solid #E2E8F0"}}>
          <div>
            <div style={{fontSize:22,fontWeight:800,color:"#0F172A",fontFamily:S.display}}>{from.name||"Your Business"}</div>
            {from.addr&&<div style={{fontSize:12,color:"#64748B",marginTop:2,whiteSpace:"pre-wrap"}}>{from.addr}</div>}
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:26,fontWeight:900,color:"#059669",fontFamily:S.display,letterSpacing:"-1px"}}>PURCHASE ORDER</div>
            <div style={{fontSize:12,color:"#64748B",marginTop:4}}>#{po}</div>
            <div style={{fontSize:12,color:"#64748B"}}>Date: {date}</div>
            {deliver&&<div style={{fontSize:12,color:"#64748B"}}>Deliver by: {deliver}</div>}
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",marginBottom:4}}>Vendor</div>
          <div style={{fontSize:14,fontWeight:600,color:"#0F172A"}}>{to.name||"Vendor Name"}</div>
          {to.addr&&<div style={{fontSize:12,color:"#64748B",whiteSpace:"pre-wrap"}}>{to.addr}</div>}
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",marginBottom:16}}>
          <thead><tr style={{background:"#F8FAFC"}}><th style={{padding:"8px 10px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase"}}>Description</th><th style={{padding:"8px 10px",textAlign:"center",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",width:60}}>Qty</th><th style={{padding:"8px 10px",textAlign:"right",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",width:80}}>Unit</th><th style={{padding:"8px 10px",textAlign:"right",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",width:90}}>Amount</th></tr></thead>
          <tbody>{items.filter(it=>it.desc||p(it.rate)).map((it,i)=><tr key={i} style={{borderBottom:"1px solid #F1F5F9"}}><td style={{padding:"8px 10px",fontSize:13,color:"#1E293B"}}>{it.desc||"-"}</td><td style={{padding:"8px 10px",textAlign:"center",fontSize:13,color:"#475569"}}>{p(it.qty)}</td><td style={{padding:"8px 10px",textAlign:"right",fontSize:13,color:"#475569"}}>{$(p(it.rate))}</td><td style={{padding:"8px 10px",textAlign:"right",fontSize:13,fontWeight:600,color:"#0F172A"}}>{$(p(it.qty)*p(it.rate))}</td></tr>)}</tbody>
        </table>
        <div style={{display:"flex",justifyContent:"flex-end"}}>
          <div style={{minWidth:220}}>
            <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #E2E8F0",fontSize:13,color:"#64748B"}}><span>Subtotal</span><span style={{fontWeight:600,color:"#1E293B"}}>{$(sub)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #E2E8F0",fontSize:13,color:"#64748B"}}><span>Tax ({p(taxRate)}%)</span><span style={{fontWeight:600,color:"#1E293B"}}>{$(tax)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontSize:16,fontWeight:800,color:"#059669"}}><span>Total</span><span>{$(total)}</span></div>
          </div>
        </div>
        {notes&&<div style={{marginTop:12,padding:"10px 14px",background:"#F8FAFC",borderRadius:6,fontSize:12,color:"#475569"}}>{notes}</div>}
      </div>
      <div className="tr-no-print" style={{position:"sticky",bottom:0,background:"rgba(6,9,15,0.92)",backdropFilter:"blur(12px)",padding:"12px 16px",display:"flex",gap:10,alignItems:"center",justifyContent:"flex-end",borderTop:"1px solid rgba(5,150,105,0.2)"}}>
        <span style={{fontSize:12,color:S.muted,marginRight:"auto"}}>Purchase order ready</span>
        <Btn s="sm" v="secondary" onClick={()=>window.print()}>🖨️ Print / Save PDF</Btn>
        <CopyBtn text={`Purchase Order #${po}\n${from.name} → ${to.name}\nSubtotal: ${$(sub)}\nTax: ${$(tax)}\nTotal: ${$(total)}`}/>
      </div>
    </div>
  </V>);
}

// ─── TOOL: PACKING SLIP GENERATOR ──────────────────────────────
function PackingSlipGen(){
  const[from,setFrom]=useState("");const[to,setTo]=useState("");
  const[slip,setSlip]=useState("PS-001");const[order,setOrder]=useState("");
  const[date,setDate]=useState(new Date().toISOString().split("T")[0]);
  const[items,setItems]=useState([{desc:"",sku:"",qty:1}]);
  const[notes,setNotes]=useState("");
  const add=()=>setItems([...items,{desc:"",sku:"",qty:1}]);
  const upd=(i,f,v)=>{const n=[...items];n[i][f]=v;setItems(n)};
  const rm=(i)=>setItems(items.filter((_,j)=>j!==i));
  const totalQty=items.reduce((s,it)=>s+p(it.qty),0);
  return(<V>
    <G2><div><Lab>Ship From</Lab><Input value={from} onChange={setFrom} placeholder="Your Warehouse / Business" multiline rows={2}/></div><div><Lab>Ship To</Lab><Input value={to} onChange={setTo} placeholder="Recipient Name & Address" multiline rows={2}/></div></G2>
    <G3><div><Lab>Slip #</Lab><Input value={slip} onChange={setSlip}/></div><div><Lab>Order #</Lab><Input value={order} onChange={setOrder} placeholder="ORD-1234"/></div><div><Lab>Date</Lab><Input type="date" value={date} onChange={setDate}/></div></G3>
    <Lab>Items</Lab>
    {items.map((it,i)=>(<div key={i} style={{display:"flex",gap:8,alignItems:"end",marginBottom:8}}>
      <div style={{flex:3}}>{i===0&&<Lab>Description</Lab>}<Input value={it.desc} onChange={v=>upd(i,"desc",v)} placeholder="Product name"/></div>
      <div style={{flex:2}}>{i===0&&<Lab>SKU</Lab>}<Input value={it.sku} onChange={v=>upd(i,"sku",v)} placeholder="SKU-001"/></div>
      <div style={{flex:1}}>{i===0&&<Lab>Qty</Lab>}<Input value={String(it.qty)} onChange={v=>upd(i,"qty",v)} placeholder="1"/></div>
      {items.length>1&&<Btn v="ghost" s="sm" onClick={()=>rm(i)}>✕</Btn>}
    </div>))}
    <Btn v="secondary" s="sm" onClick={add}>+ Add Item</Btn>
    <div><Lab>Notes</Lab><Input value={notes} onChange={setNotes} placeholder="Handle with care, thank you for your order!" multiline rows={2}/></div>
    <div style={{borderRadius:10,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.4)"}}>
      <div className="tr-print-doc" style={{background:"white",color:"#1E293B",padding:"32px 40px",fontFamily:S.font}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:20,paddingBottom:16,borderBottom:"2px solid #E2E8F0"}}>
          <div style={{fontSize:12,color:"#64748B",whiteSpace:"pre-wrap",maxWidth:220}}><div style={{fontSize:11,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",marginBottom:2}}>Ship From</div>{from||"Your Business"}</div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:24,fontWeight:900,color:"#059669",fontFamily:S.display,letterSpacing:"-1px"}}>PACKING SLIP</div>
            <div style={{fontSize:12,color:"#64748B",marginTop:4}}>Slip #{slip}</div>
            {order&&<div style={{fontSize:12,color:"#64748B"}}>Order #{order}</div>}
            <div style={{fontSize:12,color:"#64748B"}}>Date: {date}</div>
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",marginBottom:4}}>Ship To</div>
          <div style={{fontSize:13,color:"#1E293B",whiteSpace:"pre-wrap"}}>{to||"Recipient"}</div>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",marginBottom:16}}>
          <thead><tr style={{background:"#F8FAFC"}}><th style={{padding:"8px 10px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase"}}>Item</th><th style={{padding:"8px 10px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",width:110}}>SKU</th><th style={{padding:"8px 10px",textAlign:"center",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",width:60}}>Qty</th></tr></thead>
          <tbody>{items.filter(it=>it.desc||it.sku).map((it,i)=><tr key={i} style={{borderBottom:"1px solid #F1F5F9"}}><td style={{padding:"8px 10px",fontSize:13,color:"#1E293B"}}>{it.desc||"-"}</td><td style={{padding:"8px 10px",fontSize:13,color:"#475569",fontFamily:S.mono}}>{it.sku||"-"}</td><td style={{padding:"8px 10px",textAlign:"center",fontSize:13,fontWeight:600,color:"#0F172A"}}>{p(it.qty)}</td></tr>)}</tbody>
        </table>
        <div style={{display:"flex",justifyContent:"flex-end",padding:"8px 10px",background:"#F8FAFC",borderRadius:6,fontWeight:700,fontSize:14,color:"#0F172A"}}><span style={{marginRight:16}}>Total Items</span><span>{fmt(totalQty,0)}</span></div>
        {notes&&<div style={{marginTop:12,textAlign:"center",fontSize:12,color:"#64748B",fontStyle:"italic"}}>{notes}</div>}
      </div>
      <div className="tr-no-print" style={{position:"sticky",bottom:0,background:"rgba(6,9,15,0.92)",backdropFilter:"blur(12px)",padding:"12px 16px",display:"flex",gap:10,alignItems:"center",justifyContent:"flex-end",borderTop:"1px solid rgba(5,150,105,0.2)"}}>
        <span style={{fontSize:12,color:S.muted,marginRight:"auto"}}>Packing slip ready</span>
        <Btn s="sm" v="secondary" onClick={()=>window.print()}>🖨️ Print / Save PDF</Btn>
        <CopyBtn text={`Packing Slip #${slip}${order?` (Order #${order})`:""}\n${items.filter(it=>it.desc).map(it=>`${p(it.qty)}x ${it.desc}${it.sku?` [${it.sku}]`:""}`).join("\n")}\nTotal items: ${fmt(totalQty,0)}`}/>
      </div>
    </div>
  </V>);
}

// ─── TOOL: TIMESHEET GENERATOR ─────────────────────────────────
function TimesheetGen(){
  const DAYS=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const[emp,setEmp]=useState("");const[period,setPeriod]=useState("");
  const[rate,setRate]=useState("25");const[otMult,setOtMult]=useState("1.5");
  const[hours,setHours]=useState(DAYS.map(()=>""));
  const updH=(i,v)=>{const n=[...hours];n[i]=v;setHours(n)};
  const total=hours.reduce((s,h)=>s+p(h),0);
  const reg=Math.min(total,40);const ot=Math.max(0,total-40);
  const r=p(rate),om=p(otMult)||1.5;
  const regPay=reg*r,otPay=ot*r*om,gross=regPay+otPay;
  return(<V>
    <G2><div><Lab>Employee Name</Lab><Input value={emp} onChange={setEmp} placeholder="John Doe"/></div><div><Lab>Pay Period</Lab><Input value={period} onChange={setPeriod} placeholder="Jan 1 - Jan 7, 2026"/></div></G2>
    <G2><NumInput label="Hourly Rate ($)" value={rate} onChange={setRate} placeholder="25"/><NumInput label="Overtime Multiplier (×)" value={otMult} onChange={setOtMult} placeholder="1.5"/></G2>
    <Lab>Hours Worked</Lab>
    {DAYS.map((d,i)=>(<div key={d} style={{display:"flex",gap:12,alignItems:"center",marginBottom:6}}>
      <div style={{width:110,fontSize:13,color:S.muted,fontWeight:600}}>{d}</div>
      <div style={{flex:1}}><Input value={hours[i]} onChange={v=>updH(i,v)} placeholder="0"/></div>
      <div style={{width:80,textAlign:"right",fontSize:13,color:S.text,fontFamily:S.mono}}>{$(p(hours[i])*r)}</div>
    </div>))}
    <G3>
      <Big label="Total Hours" value={fmt(total,2)} sub={ot>0?`${fmt(reg,2)} reg + ${fmt(ot,2)} OT`:"regular"}/>
      <Big label="Overtime Hours" value={fmt(ot,2)} color={ot>0?S.orange:S.muted}/>
      <Big label="Gross Pay" value={$(gross)} color={S.green}/>
    </G3>
    <Res label="Regular Pay" value={`${fmt(reg,2)} h × ${$(r)} = ${$(regPay)}`} mono/>
    <Res label="Overtime Pay" value={`${fmt(ot,2)} h × ${$(r*om)} = ${$(otPay)}`} mono color={ot>0?S.orange:undefined}/>
    <Res label="Total Gross Pay" value={$(gross)} mono color={S.green}/>
    <div style={{textAlign:"right"}}><CopyBtn text={`Timesheet — ${emp||"Employee"} (${period||"period"})\nTotal hours: ${fmt(total,2)} (${fmt(reg,2)} reg + ${fmt(ot,2)} OT)\nRate: ${$(r)}/h, OT ×${om}\nGross pay: ${$(gross)}`}/></div>
  </V>);
}

// ─── TOOL: EXPENSE REPORT GENERATOR ────────────────────────────
function ExpenseReportGen(){
  const CATS=["Travel","Meals","Lodging","Supplies","Software","Other"];
  const[name,setName]=useState("");const[period,setPeriod]=useState("");
  const[rows,setRows]=useState([{date:"",cat:"Travel",desc:"",amt:0}]);
  const add=()=>setRows([...rows,{date:"",cat:"Travel",desc:"",amt:0}]);
  const upd=(i,f,v)=>{const n=[...rows];n[i][f]=v;setRows(n)};
  const rm=(i)=>setRows(rows.filter((_,j)=>j!==i));
  const total=rows.reduce((s,r)=>s+p(r.amt),0);
  const byCat={};rows.forEach(r=>{if(p(r.amt))byCat[r.cat]=(byCat[r.cat]||0)+p(r.amt)});
  return(<V>
    <G2><div><Lab>Employee / Name</Lab><Input value={name} onChange={setName} placeholder="Jane Smith"/></div><div><Lab>Report Period</Lab><Input value={period} onChange={setPeriod} placeholder="March 2026"/></div></G2>
    <Lab>Expenses</Lab>
    {rows.map((r,i)=>(<div key={i} style={{display:"flex",gap:8,alignItems:"end",marginBottom:8}}>
      <div style={{flex:2}}>{i===0&&<Lab>Date</Lab>}<Input type="date" value={r.date} onChange={v=>upd(i,"date",v)}/></div>
      <div style={{flex:2}}>{i===0&&<Lab>Category</Lab>}<Sel value={r.cat} onChange={v=>upd(i,"cat",v)} options={CATS}/></div>
      <div style={{flex:3}}>{i===0&&<Lab>Description</Lab>}<Input value={r.desc} onChange={v=>upd(i,"desc",v)} placeholder="What was it for?"/></div>
      <div style={{flex:1}}>{i===0&&<Lab>Amount ($)</Lab>}<Input value={String(r.amt)} onChange={v=>upd(i,"amt",v)} placeholder="0"/></div>
      {rows.length>1&&<Btn v="ghost" s="sm" onClick={()=>rm(i)}>✕</Btn>}
    </div>))}
    <Btn v="secondary" s="sm" onClick={add}>+ Add Expense</Btn>
    <Big label="Total Expenses" value={$(total)} sub={period||"reimbursable"} color={S.green}/>
    {Object.keys(byCat).length>0&&<div>
      <Lab>By Category</Lab>
      {Object.entries(byCat).map(([c,v])=><Res key={c} label={c} value={$(v)} mono/>)}
    </div>}
    <div style={{textAlign:"right"}}><CopyBtn text={`Expense Report — ${name||"Name"} (${period||"period"})\n${rows.filter(r=>p(r.amt)).map(r=>`${r.date||"—"}  ${r.cat}  ${r.desc}  ${$(p(r.amt))}`).join("\n")}\n${Object.entries(byCat).map(([c,v])=>`${c}: ${$(v)}`).join("\n")}\nTotal: ${$(total)}`}/></div>
  </V>);
}

// ─── TOOL: MARKUP & MARGIN CALCULATOR ──────────────────────────
function MarkupMarginCalc(){
  const[cost,setCost]=useState("");const[price,setPrice]=useState("");const[targetMargin,setTargetMargin]=useState("");
  const c=p(cost),pr=p(price);const profit=pr-c;
  const markup=c?profit/c*100:0;const margin=pr?profit/pr*100:0;
  const tm=p(targetMargin);
  const priceForMargin=(tm>0&&tm<100&&c>0)?c/(1-tm/100):null;
  return(<V>
    <G2><NumInput label="Unit Cost ($)" value={cost} onChange={setCost} placeholder="60"/><NumInput label="Selling Price ($)" value={price} onChange={setPrice} placeholder="100"/></G2>
    {cost&&price?<>
      <G3>
        <Big label="Profit" value={$(profit)} color={profit>=0?S.green:S.red}/>
        <Big label="Markup" value={`${fmt(markup)}%`} color={S.blue}/>
        <Big label="Margin" value={`${fmt(margin)}%`} color={S.accent}/>
      </G3>
      <Res label="Cost" value={$(c)} mono/>
      <Res label="Selling Price" value={$(pr)} mono/>
      <Res label="Profit per Unit" value={$(profit)} mono color={profit>=0?S.green:S.red}/>
      <Res label="Markup on Cost" value={`${fmt(markup)}%`} mono/>
      <Res label="Profit Margin on Price" value={`${fmt(margin)}%`} mono/>
    </>:<div style={{padding:16,background:S.accentLight,borderRadius:8,color:S.muted,fontSize:14,textAlign:"center"}}>Enter cost and price to see markup and margin</div>}
    <Card>
      <Lab>Reverse: Price for a Target Margin</Lab>
      <NumInput label="Target Margin (%)" value={targetMargin} onChange={setTargetMargin} placeholder="40"/>
      {priceForMargin!==null
        ?<div style={{marginTop:10}}><Res label={`Sell at (for ${fmt(tm)}% margin on cost ${$(c)})`} value={$(priceForMargin)} mono color={S.green}/><Res label="Profit per unit" value={$(priceForMargin-c)} mono/></div>
        :<div style={{marginTop:10,fontSize:12,color:S.muted}}>Enter a unit cost above and a target margin between 0 and 100%.</div>}
    </Card>
    <div style={{textAlign:"right"}}><CopyBtn text={`Cost ${$(c)}, Price ${$(pr)}\nProfit: ${$(profit)}\nMarkup: ${fmt(markup)}%\nMargin: ${fmt(margin)}%`}/></div>
  </V>);
}

// ─── TOOL: CAGR CALCULATOR ─────────────────────────────────────
function CagrCalc(){
  const[start,setStart]=useState("");const[end,setEnd]=useState("");const[years,setYears]=useState("");
  const s=p(start),e=p(end),y=p(years);
  const valid=s>0&&y>0&&end!=="";
  const cagr=valid?(Math.pow(e/s,1/y)-1)*100:null;
  const totalGrowth=s>0?(e-s)/s*100:null;
  const multiple=s>0?e/s:null;
  return(<V>
    <G3>
      <NumInput label="Starting Value ($)" value={start} onChange={setStart} placeholder="1000"/>
      <NumInput label="Ending Value ($)" value={end} onChange={setEnd} placeholder="1331"/>
      <NumInput label="Number of Years" value={years} onChange={setYears} placeholder="3"/>
    </G3>
    {valid?<>
      <Big label="CAGR (Compound Annual Growth Rate)" value={`${fmt(cagr)}%`} color={cagr>=0?S.green:S.red}/>
      <G2>
        <Res label="Total Growth" value={`${fmt(totalGrowth)}%`} mono color={totalGrowth>=0?S.green:S.red}/>
        <Res label="Growth Multiple" value={`${fmt(multiple)}×`} mono/>
      </G2>
      <Lab>Projected Value Each Year</Lab>
      {Array.from({length:Math.min(Math.ceil(y),10)},(_,i)=>i+1).map(yr=><Res key={yr} label={`Year ${yr}`} value={$(s*Math.pow(1+cagr/100,yr))} mono/>)}
    </>:<div style={{padding:16,background:S.accentLight,borderRadius:8,color:S.muted,fontSize:14,textAlign:"center"}}>Enter a positive starting value, ending value, and number of years</div>}
    {valid&&<div style={{textAlign:"right"}}><CopyBtn text={`CAGR: ${fmt(cagr)}%\n${$(s)} → ${$(e)} over ${fmt(y,2)} years\nTotal growth: ${fmt(totalGrowth)}% (${fmt(multiple)}×)`}/></div>}
  </V>);
}

// ─── TOOL: CUSTOMER LIFETIME VALUE CALCULATOR ──────────────────
function ClvCalc(){
  const[aov,setAov]=useState("");const[freq,setFreq]=useState("");const[lifespan,setLifespan]=useState("");const[margin,setMargin]=useState("100");
  const a=p(aov),f=p(freq),l=p(lifespan),m=p(margin);
  const annualRevenue=a*f;
  const annualProfit=annualRevenue*(m/100);
  const ltv=annualProfit*l;
  const has=aov&&freq&&lifespan;
  return(<V>
    <G2>
      <NumInput label="Average Order Value ($)" value={aov} onChange={setAov} placeholder="50"/>
      <NumInput label="Purchases per Year" value={freq} onChange={setFreq} placeholder="4"/>
    </G2>
    <G2>
      <NumInput label="Avg Customer Lifespan (years)" value={lifespan} onChange={setLifespan} placeholder="3"/>
      <NumInput label="Gross Margin (%)" value={margin} onChange={setMargin} placeholder="100"/>
    </G2>
    {has?<>
      <Big label="Customer Lifetime Value (LTV)" value={$(ltv)} sub={`over ${fmt(l,1)} years`} color={S.green}/>
      <Res label="Annual Revenue per Customer" value={$(annualRevenue)} mono/>
      <Res label="Annual Profit per Customer" value={$(annualProfit)} mono color={S.accent}/>
      <Res label="Total Orders (lifetime)" value={fmt(f*l,1)} mono/>
      <Res label="Suggested Max CAC (3:1 LTV:CAC)" value={$(ltv/3)} mono color={S.blue}/>
      <div style={{textAlign:"right"}}><CopyBtn text={`Customer LTV: ${$(ltv)}\nAOV ${$(a)} × ${fmt(f,1)}/yr × ${fmt(l,1)} yrs × ${fmt(m)}% margin\nMax CAC (3:1): ${$(ltv/3)}`}/></div>
    </>:<div style={{padding:16,background:S.accentLight,borderRadius:8,color:S.muted,fontSize:14,textAlign:"center"}}>Enter order value, frequency, and lifespan to estimate LTV</div>}
  </V>);
}

// ─── TOOL: BUSINESS HOURS SCHEMA GENERATOR ─────────────────────
function BusinessHoursGen(){
  const DAYS=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const[name,setName]=useState("");
  const[hours,setHours]=useState(()=>{const h={};DAYS.forEach((d,i)=>{h[d]={open:"09:00",close:"17:00",closed:i>=5}});return h;});
  const setDay=(d,f,v)=>setHours(prev=>({...prev,[d]:{...prev[d],[f]:v}}));
  const spec=DAYS.filter(d=>!hours[d].closed&&hours[d].open&&hours[d].close).map(d=>({
    "@type":"OpeningHoursSpecification",dayOfWeek:`https://schema.org/${d}`,opens:hours[d].open,closes:hours[d].close
  }));
  const schema={"@context":"https://schema.org","@type":"LocalBusiness",name:name||"Your Business Name",openingHoursSpecification:spec};
  const jsonLd=`<script type="application/ld+json">\n${JSON.stringify(schema,null,2)}\n</script>`;
  const human=DAYS.map(d=>`${d}: ${hours[d].closed?"Closed":`${hours[d].open} – ${hours[d].close}`}`).join("\n");
  return(<V>
    <div><Lab>Business Name</Lab><Input value={name} onChange={setName} placeholder="Acme Coffee Shop"/></div>
    <Lab>Opening Hours</Lab>
    {DAYS.map(d=>(<div key={d} style={{display:"flex",gap:10,alignItems:"center",marginBottom:6}}>
      <div style={{width:100,fontSize:13,color:S.muted,fontWeight:600}}>{d}</div>
      <Btn v={hours[d].closed?"secondary":"primary"} s="sm" onClick={()=>setDay(d,"closed",!hours[d].closed)} style={{width:80,justifyContent:"center"}}>{hours[d].closed?"Closed":"Open"}</Btn>
      {!hours[d].closed&&<>
        <Input type="time" value={hours[d].open} onChange={v=>setDay(d,"open",v)} style={{width:130}}/>
        <span style={{color:S.muted}}>–</span>
        <Input type="time" value={hours[d].close} onChange={v=>setDay(d,"close",v)} style={{width:130}}/>
      </>}
    </div>))}
    <Card>
      <Lab>Human-Readable Hours</Lab>
      <pre style={{fontSize:13,color:S.text,whiteSpace:"pre-wrap",fontFamily:S.font,lineHeight:1.7,margin:0}}>{human}</pre>
    </Card>
    <div style={{position:"relative"}}>
      <Lab>schema.org JSON-LD (paste in your page &lt;head&gt;)</Lab>
      <pre style={{background:"rgba(0,0,0,0.4)",padding:16,borderRadius:10,fontSize:12,color:"#86EFAC",whiteSpace:"pre-wrap",fontFamily:S.mono,lineHeight:1.6,overflowX:"auto"}}>{jsonLd}</pre>
      <div style={{position:"absolute",top:24,right:8}}><CopyBtn text={jsonLd}/></div>
    </div>
  </V>);
}

// ─── TOOL: MEETING AGENDA GENERATOR ────────────────────────────
function MeetingAgendaGen(){
  const[title,setTitle]=useState("");const[date,setDate]=useState(new Date().toISOString().split("T")[0]);
  const[time,setTime]=useState("");const[location,setLocation]=useState("");const[attendees,setAttendees]=useState("");
  const[items,setItems]=useState([{topic:"",owner:"",mins:"10"}]);
  const add=()=>setItems([...items,{topic:"",owner:"",mins:"10"}]);
  const upd=(i,f,v)=>{const n=[...items];n[i][f]=v;setItems(n)};
  const rm=(i)=>setItems(items.filter((_,j)=>j!==i));
  const totalMins=items.reduce((s,it)=>s+p(it.mins),0);
  return(<V>
    <div><Lab>Meeting Title</Lab><Input value={title} onChange={setTitle} placeholder="Q2 Product Planning"/></div>
    <G3><div><Lab>Date</Lab><Input type="date" value={date} onChange={setDate}/></div><div><Lab>Time</Lab><Input type="time" value={time} onChange={setTime}/></div><div><Lab>Location</Lab><Input value={location} onChange={setLocation} placeholder="Zoom / Room 4B"/></div></G3>
    <div><Lab>Attendees (comma separated)</Lab><Input value={attendees} onChange={setAttendees} placeholder="Alice, Bob, Carol"/></div>
    <Lab>Agenda Items</Lab>
    {items.map((it,i)=>(<div key={i} style={{display:"flex",gap:8,alignItems:"end",marginBottom:8}}>
      <div style={{flex:3}}>{i===0&&<Lab>Topic</Lab>}<Input value={it.topic} onChange={v=>upd(i,"topic",v)} placeholder="Discussion topic"/></div>
      <div style={{flex:2}}>{i===0&&<Lab>Owner</Lab>}<Input value={it.owner} onChange={v=>upd(i,"owner",v)} placeholder="Who leads"/></div>
      <div style={{flex:1}}>{i===0&&<Lab>Min</Lab>}<Input value={String(it.mins)} onChange={v=>upd(i,"mins",v)} placeholder="10"/></div>
      {items.length>1&&<Btn v="ghost" s="sm" onClick={()=>rm(i)}>✕</Btn>}
    </div>))}
    <Btn v="secondary" s="sm" onClick={add}>+ Add Agenda Item</Btn>
    <div style={{borderRadius:10,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.4)"}}>
      <div className="tr-print-doc" style={{background:"white",color:"#1E293B",padding:"32px 40px",fontFamily:S.font}}>
        <div style={{borderBottom:"3px solid #059669",paddingBottom:14,marginBottom:16}}>
          <div style={{fontSize:24,fontWeight:800,color:"#0F172A",fontFamily:S.display}}>{title||"Meeting Agenda"}</div>
          <div style={{fontSize:12,color:"#64748B",marginTop:4}}>{[date,time,location].filter(Boolean).join(" · ")}</div>
        </div>
        {attendees&&<div style={{marginBottom:16,fontSize:12,color:"#475569"}}><strong style={{color:"#0F172A"}}>Attendees: </strong>{attendees}</div>}
        <table style={{width:"100%",borderCollapse:"collapse",marginBottom:14}}>
          <thead><tr style={{background:"#F8FAFC"}}><th style={{padding:"8px 10px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",width:30}}>#</th><th style={{padding:"8px 10px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase"}}>Topic</th><th style={{padding:"8px 10px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",width:120}}>Owner</th><th style={{padding:"8px 10px",textAlign:"right",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",width:70}}>Time</th></tr></thead>
          <tbody>{items.filter(it=>it.topic).map((it,i)=><tr key={i} style={{borderBottom:"1px solid #F1F5F9"}}><td style={{padding:"8px 10px",fontSize:13,color:"#94A3B8"}}>{i+1}</td><td style={{padding:"8px 10px",fontSize:13,color:"#1E293B"}}>{it.topic}</td><td style={{padding:"8px 10px",fontSize:13,color:"#475569"}}>{it.owner||"—"}</td><td style={{padding:"8px 10px",textAlign:"right",fontSize:13,color:"#475569"}}>{p(it.mins)} min</td></tr>)}</tbody>
        </table>
        <div style={{display:"flex",justifyContent:"flex-end",fontSize:13,fontWeight:700,color:"#059669"}}>Total: {totalMins} min ({fmt(totalMins/60,1)} h)</div>
      </div>
      <div className="tr-no-print" style={{position:"sticky",bottom:0,background:"rgba(6,9,15,0.92)",backdropFilter:"blur(12px)",padding:"12px 16px",display:"flex",gap:10,alignItems:"center",justifyContent:"flex-end",borderTop:"1px solid rgba(5,150,105,0.2)"}}>
        <span style={{fontSize:12,color:S.muted,marginRight:"auto"}}>Agenda ready · {totalMins} min total</span>
        <Btn s="sm" v="secondary" onClick={()=>window.print()}>🖨️ Print / Save PDF</Btn>
        <CopyBtn text={`${title||"Meeting Agenda"}\n${[date,time,location].filter(Boolean).join(" · ")}\n${attendees?`Attendees: ${attendees}\n`:""}\n${items.filter(it=>it.topic).map((it,i)=>`${i+1}. ${it.topic}${it.owner?` (${it.owner})`:""} — ${p(it.mins)} min`).join("\n")}\nTotal: ${totalMins} min`}/>
      </div>
    </div>
  </V>);
}

// ─── TOOL: BUSINESS MEMO GENERATOR ─────────────────────────────
function MemoGen(){
  const[to,setTo]=useState("");const[from,setFrom]=useState("");
  const[date,setDate]=useState(new Date().toISOString().split("T")[0]);
  const[subject,setSubject]=useState("");const[body,setBody]=useState("");
  return(<V>
    <G2><div><Lab>To</Lab><Input value={to} onChange={setTo} placeholder="All Staff"/></div><div><Lab>From</Lab><Input value={from} onChange={setFrom} placeholder="Jane Smith, Operations"/></div></G2>
    <G2><div><Lab>Date</Lab><Input type="date" value={date} onChange={setDate}/></div><div><Lab>Subject</Lab><Input value={subject} onChange={setSubject} placeholder="Updated remote work policy"/></div></G2>
    <div><Lab>Body</Lab><Input value={body} onChange={setBody} placeholder="Write the memo content here..." multiline rows={6}/></div>
    <div style={{borderRadius:10,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.4)"}}>
      <div className="tr-print-doc" style={{background:"white",color:"#1E293B",padding:"40px",fontFamily:S.font}}>
        <div style={{fontSize:24,fontWeight:900,color:"#0F172A",fontFamily:S.display,letterSpacing:"0.05em",marginBottom:20}}>MEMORANDUM</div>
        <div style={{borderTop:"2px solid #E2E8F0",borderBottom:"2px solid #E2E8F0",padding:"14px 0",marginBottom:20}}>
          {[["TO",to||"—"],["FROM",from||"—"],["DATE",date],["SUBJECT",subject||"—"]].map(([l,v])=><div key={l} style={{display:"flex",fontSize:13,marginBottom:6}}><span style={{width:90,fontWeight:800,color:"#64748B"}}>{l}:</span><span style={{color:"#1E293B",fontWeight:l==="SUBJECT"?700:400}}>{v}</span></div>)}
        </div>
        <div style={{fontSize:14,color:"#374151",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{body||"Memo content will appear here as you type."}</div>
      </div>
      <div className="tr-no-print" style={{position:"sticky",bottom:0,background:"rgba(6,9,15,0.92)",backdropFilter:"blur(12px)",padding:"12px 16px",display:"flex",gap:10,alignItems:"center",justifyContent:"flex-end",borderTop:"1px solid rgba(5,150,105,0.2)"}}>
        <span style={{fontSize:12,color:S.muted,marginRight:"auto"}}>Memo ready</span>
        <Btn s="sm" v="secondary" onClick={()=>window.print()}>🖨️ Print / Save PDF</Btn>
        <CopyBtn text={`MEMORANDUM\n\nTO: ${to||"—"}\nFROM: ${from||"—"}\nDATE: ${date}\nSUBJECT: ${subject||"—"}\n\n${body||""}`}/>
      </div>
    </div>
  </V>);
}

// ─── TOOL: PRESS RELEASE GENERATOR ─────────────────────────────
function PressReleaseGen(){
  const[company,setCompany]=useState("");const[city,setCity]=useState("");
  const[date,setDate]=useState(new Date().toISOString().split("T")[0]);
  const[headline,setHeadline]=useState("");const[summary,setSummary]=useState("");
  const[details,setDetails]=useState("");const[quote,setQuote]=useState("");const[speaker,setSpeaker]=useState("");
  const[boiler,setBoiler]=useState("");const[contact,setContact]=useState("");
  const output=useMemo(()=>{
    if(!headline&&!company)return "";
    const dateline=`${city||"[CITY]"} — ${date} — `;
    const lead=summary?`${dateline}${summary}`:`${dateline}${company||"[Company]"} today announced ${headline||"[announcement]"}.`;
    const parts=["FOR IMMEDIATE RELEASE\n",(headline||"[Headline]").toUpperCase(),"",lead];
    if(details)parts.push("",details);
    if(quote)parts.push("",`"${quote}"${speaker?` said ${speaker}.`:""}`);
    parts.push("","### About "+(company||"[Company]"),boiler||"[Company boilerplate — a short paragraph describing what your company does.]");
    if(contact)parts.push("","Media Contact:",contact);
    parts.push("","### END ###");
    return parts.join("\n");
  },[company,city,date,headline,summary,details,quote,speaker,boiler,contact]);
  return(<V>
    <G2><div><Lab>Company Name</Lab><Input value={company} onChange={setCompany} placeholder="Acme Inc."/></div><div><Lab>City</Lab><Input value={city} onChange={setCity} placeholder="San Francisco, CA"/></div></G2>
    <G2><div><Lab>Release Date</Lab><Input type="date" value={date} onChange={setDate}/></div><div><Lab>Spokesperson</Lab><Input value={speaker} onChange={setSpeaker} placeholder="Jane Doe, CEO"/></div></G2>
    <div><Lab>Headline</Lab><Input value={headline} onChange={setHeadline} placeholder="Acme Launches Revolutionary New Product"/></div>
    <div><Lab>Summary (opening paragraph)</Lab><Input value={summary} onChange={setSummary} placeholder="Who, what, when, where, and why in one or two sentences." multiline rows={2}/></div>
    <div><Lab>Body Details</Lab><Input value={details} onChange={setDetails} placeholder="Supporting facts, features, availability, pricing..." multiline rows={3}/></div>
    <div><Lab>Quote</Lab><Input value={quote} onChange={setQuote} placeholder="This launch marks a milestone for our customers..." multiline rows={2}/></div>
    <div><Lab>Company Boilerplate</Lab><Input value={boiler} onChange={setBoiler} placeholder="Acme Inc. is a leading provider of..." multiline rows={2}/></div>
    <div><Lab>Media Contact</Lab><Input value={contact} onChange={setContact} placeholder="press@acme.com · +1 234 567 890"/></div>
    {output&&<div style={{position:"relative"}}><pre style={{background:"rgba(0,0,0,0.4)",padding:20,borderRadius:10,fontSize:14,color:S.text,whiteSpace:"pre-wrap",lineHeight:1.8,fontFamily:S.font}}>{output}</pre><div style={{position:"absolute",top:8,right:8}}><CopyBtn text={output}/></div></div>}
  </V>);
}

// ─── TOOL: JOB DESCRIPTION GENERATOR ───────────────────────────
function JobDescriptionGen(){
  const[title,setTitle]=useState("");const[company,setCompany]=useState("");const[location,setLocation]=useState("");
  const[type,setType]=useState("Full-time");const[overview,setOverview]=useState("");
  const[resp,setResp]=useState("");const[req,setReq]=useState("");const[nice,setNice]=useState("");const[apply,setApply]=useState("");
  const bullets=(txt)=>txt.split("\n").map(l=>l.trim()).filter(Boolean).map(l=>`• ${l.replace(/^[•\-*]\s*/,"")}`).join("\n");
  const output=useMemo(()=>{
    if(!title)return "";
    const parts=[`${title}${company?` — ${company}`:""}`,[location,type].filter(Boolean).join(" · "),""];
    if(overview)parts.push("ABOUT THE ROLE",overview,"");
    if(resp)parts.push("RESPONSIBILITIES",bullets(resp),"");
    if(req)parts.push("REQUIREMENTS",bullets(req),"");
    if(nice)parts.push("NICE TO HAVE",bullets(nice),"");
    if(apply)parts.push("HOW TO APPLY",apply);
    return parts.join("\n").replace(/\n{3,}/g,"\n\n").trim();
  },[title,company,location,type,overview,resp,req,nice,apply]);
  return(<V>
    <G2><div><Lab>Job Title</Lab><Input value={title} onChange={setTitle} placeholder="Senior Frontend Engineer"/></div><div><Lab>Company</Lab><Input value={company} onChange={setCompany} placeholder="Acme Inc."/></div></G2>
    <G2><div><Lab>Location</Lab><Input value={location} onChange={setLocation} placeholder="Remote / New York, NY"/></div><Sel label="Employment Type" value={type} onChange={setType} options={["Full-time","Part-time","Contract","Internship","Temporary"]}/></G2>
    <div><Lab>Role Overview</Lab><Input value={overview} onChange={setOverview} placeholder="A short paragraph about the role and team." multiline rows={2}/></div>
    <div><Lab>Responsibilities (one per line)</Lab><Input value={resp} onChange={setResp} placeholder={"Build and maintain UI\nCollaborate with designers\nWrite tests"} multiline rows={3}/></div>
    <div><Lab>Requirements (one per line)</Lab><Input value={req} onChange={setReq} placeholder={"5+ years React\nStrong CSS skills"} multiline rows={3}/></div>
    <div><Lab>Nice to Have (one per line)</Lab><Input value={nice} onChange={setNice} placeholder={"TypeScript\nOpen-source contributions"} multiline rows={2}/></div>
    <div><Lab>How to Apply</Lab><Input value={apply} onChange={setApply} placeholder="Email your resume to jobs@acme.com" multiline rows={2}/></div>
    {output&&<div style={{position:"relative"}}><pre style={{background:"rgba(0,0,0,0.4)",padding:20,borderRadius:10,fontSize:14,color:S.text,whiteSpace:"pre-wrap",lineHeight:1.7,fontFamily:S.font}}>{output}</pre><div style={{position:"absolute",top:8,right:8}}><CopyBtn text={output}/></div></div>}
  </V>);
}

// ═══ SHARED HELPERS FOR DOCUMENT / STATEMENT TOOLS ═════════════
const CUR={
  INR:{sym:"₹",loc:"en-IN",sys:"indian",major:"Rupees",minor:"Paise"},
  USD:{sym:"$",loc:"en-US",sys:"intl",major:"Dollars",minor:"Cents"},
  GBP:{sym:"£",loc:"en-US",sys:"intl",major:"Pounds",minor:"Pence"},
  EUR:{sym:"€",loc:"en-US",sys:"intl",major:"Euros",minor:"Cents"},
  AED:{sym:"AED ",loc:"en-US",sys:"intl",major:"Dirhams",minor:"Fils"},
};
const CUR_OPTS=[
  {v:"INR",l:"₹ INR — Indian Rupee"},
  {v:"USD",l:"$ USD — US Dollar"},
  {v:"GBP",l:"£ GBP — Pound Sterling"},
  {v:"EUR",l:"€ EUR — Euro"},
  {v:"AED",l:"AED — UAE Dirham"},
];
// Money with thousands separators, always 2 decimals. Never NaN.
const mny=(n,code="INR")=>{
  const k=CUR[code]||CUR.USD;const v=parseFloat(n);const x=isNaN(v)?0:v;
  return `${x<0?"-":""}${k.sym}${Math.abs(x).toLocaleString(k.loc,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
};
const W_ONES=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
const W_TENS=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
function w99(n){if(n<20)return W_ONES[n];const t=W_TENS[Math.floor(n/10)],o=n%10;return o?`${t} ${W_ONES[o]}`:t;}
function w999(n){const h=Math.floor(n/100),r=n%100,parts=[];if(h)parts.push(`${W_ONES[h]} Hundred`);if(r)parts.push(w99(r));return parts.join(" and ");}
// Indian numbering: thousand / lakh / crore
function wIndian(n){
  n=Math.floor(n);if(n<=0)return "Zero";
  const out=[];
  const cr=Math.floor(n/10000000);n%=10000000;
  const lk=Math.floor(n/100000);n%=100000;
  const th=Math.floor(n/1000);n%=1000;
  if(cr)out.push(`${cr>999?wIndian(cr):w999(cr)} Crore`);
  if(lk)out.push(`${w999(lk)} Lakh`);
  if(th)out.push(`${w999(th)} Thousand`);
  if(n)out.push(w999(n));
  return out.join(" ").trim();
}
// International numbering: thousand / million / billion / trillion
function wIntl(n){
  n=Math.floor(n);if(n<=0)return "Zero";
  const scales=[[1e12,"Trillion"],[1e9,"Billion"],[1e6,"Million"],[1e3,"Thousand"]];
  const out=[];
  for(const [v,name] of scales){if(n>=v){const q=Math.floor(n/v);n-=q*v;out.push(`${q>999?wIntl(q):w999(q)} ${name}`);}}
  if(n)out.push(w999(n));
  return out.join(" ").trim();
}
function amountWords(amount,code="INR"){
  const k=CUR[code]||CUR.USD;const v=parseFloat(amount);
  if(isNaN(v)||Math.abs(v)>=1e15)return "—";
  const neg=v<0,abs=Math.abs(v);
  let whole=Math.floor(abs+1e-9),frac=Math.round((abs-whole)*100);
  if(frac>=100){whole+=1;frac=0;}
  const f=k.sys==="indian"?wIndian:wIntl;
  let s=`${f(whole)} ${k.major}`;
  if(frac>0)s+=` and ${f(frac)} ${k.minor}`;
  return `${neg?"Minus ":""}${s} Only`;
}
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const today=()=>new Date().toISOString().split("T")[0];
const fmtDate=(s)=>{if(!s)return "—";const d=new Date(`${s}T00:00:00`);if(isNaN(d.getTime()))return s;return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;};
function tenureText(a,b){
  if(!a||!b)return "—";
  const d1=new Date(`${a}T00:00:00`),d2=new Date(`${b}T00:00:00`);
  if(isNaN(d1.getTime())||isNaN(d2.getTime())||d2<d1)return "—";
  let months=(d2.getFullYear()-d1.getFullYear())*12+(d2.getMonth()-d1.getMonth());
  if(d2.getDate()<d1.getDate())months--;
  if(months<0)months=0;
  const y=Math.floor(months/12),m=months%12;
  const parts=[];if(y)parts.push(`${y} year${y>1?"s":""}`);if(m)parts.push(`${m} month${m>1?"s":""}`);
  return parts.length?parts.join(" and "):"less than a month";
}
// White A4-style printable panel + action bar (matches the existing document tools)
const DocFrame=({children,status="Document ready",copyText})=>(
  <div style={{borderRadius:10,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.4)"}}>
    <div className="tr-print-doc" style={{background:"white",color:"#1E293B",padding:"34px 40px",fontFamily:S.font}}>{children}</div>
    <div className="tr-no-print" style={{position:"sticky",bottom:0,background:"rgba(6,9,15,0.92)",backdropFilter:"blur(12px)",padding:"12px 16px",display:"flex",gap:10,alignItems:"center",justifyContent:"flex-end",borderTop:"1px solid rgba(5,150,105,0.2)"}}>
      <span style={{fontSize:12,color:S.muted,marginRight:"auto"}}>{status}</span>
      <Btn s="sm" v="secondary" onClick={()=>{try{window.print()}catch(e){}}}>🖨️ Print / Save PDF</Btn>
      {copyText?<CopyBtn text={copyText}/>:null}
    </div>
  </div>
);
const Disclaim=({children})=>(
  <div style={{fontSize:11,color:S.muted,lineHeight:1.7,padding:"10px 14px",background:"rgba(255,255,255,0.02)",border:`1px solid ${S.border}`,borderRadius:8}}>
    ℹ️ {children||"This generator is a formatting aid only. You are solely responsible for the accuracy of every figure and detail you enter, and for the authority to issue this document. It is not tax, legal or accounting advice — have a qualified professional review it before it is relied upon."}
  </div>
);
// Generic add/edit/remove row editor used by the new document tools
const RowsEditor=({rows,upd,rm,add,cols,addLabel="+ Add Row",minRows=1})=>(
  <div>
    {rows.map((r,i)=>(
      <div key={i} style={{display:"flex",gap:8,alignItems:"end",marginBottom:8}}>
        {cols.map(c=>(
          <div key={c.f} style={{flex:c.flex||1}}>
            {i===0&&<Lab>{c.label}</Lab>}
            <Input value={String(r[c.f]??"")} onChange={v=>upd(i,c.f,v)} placeholder={c.ph||""}/>
          </div>
        ))}
        <div style={{width:34,paddingBottom:4}}>{rows.length>minRows&&<Btn v="ghost" s="sm" onClick={()=>rm(i)}>✕</Btn>}</div>
      </div>
    ))}
    <Btn v="secondary" s="sm" onClick={add}>{addLabel}</Btn>
  </div>
);
function useRows(initial){
  const[rows,setRows]=useState(initial);
  const upd=useCallback((i,f,v)=>setRows(r=>r.map((x,j)=>j===i?{...x,[f]:v}:x)),[]);
  const rm=useCallback((i)=>setRows(r=>r.filter((_,j)=>j!==i)),[]);
  return {rows,setRows,upd,rm};
}
const sumRows=(rows,field)=>rows.reduce((s,r)=>s+p(r[field]),0);
// Shared print-document styles
const D={
  head:{fontSize:20,fontWeight:800,color:"#0F172A",fontFamily:S.display,lineHeight:1.2},
  sub:{fontSize:12,color:"#64748B",lineHeight:1.6,whiteSpace:"pre-wrap"},
  title:{fontSize:22,fontWeight:900,color:"#059669",fontFamily:S.display,letterSpacing:"-0.5px"},
  cap:{fontSize:10,fontWeight:800,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.07em"},
  body:{fontSize:13,color:"#374151",lineHeight:1.85,whiteSpace:"pre-wrap"},
  th:{padding:"7px 10px",textAlign:"left",fontSize:10,fontWeight:800,color:"#64748B",textTransform:"uppercase",letterSpacing:"0.05em",background:"#F8FAFC"},
  thR:{padding:"7px 10px",textAlign:"right",fontSize:10,fontWeight:800,color:"#64748B",textTransform:"uppercase",letterSpacing:"0.05em",background:"#F8FAFC"},
  td:{padding:"7px 10px",fontSize:12.5,color:"#1E293B"},
  tdR:{padding:"7px 10px",fontSize:12.5,color:"#1E293B",textAlign:"right",fontVariantNumeric:"tabular-nums"},
  row:{borderBottom:"1px solid #F1F5F9"},
  note:{marginTop:14,fontSize:10,color:"#94A3B8",lineHeight:1.6,borderTop:"1px solid #F1F5F9",paddingTop:10},
};
const DocMetaRow=({pairs})=>(
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 20px",marginBottom:16}}>
    {pairs.filter(([,v])=>v!==undefined&&v!==null&&v!=="").map(([l,v])=>(
      <div key={l} style={{display:"flex",fontSize:12,padding:"3px 0",borderBottom:"1px solid #F1F5F9"}}>
        <span style={{width:130,color:"#94A3B8",fontWeight:700}}>{l}</span>
        <span style={{color:"#1E293B",flex:1}}>{v}</span>
      </div>
    ))}
  </div>
);
const SignBlock=({left,right})=>(
  <div style={{display:"flex",justifyContent:"space-between",marginTop:34,gap:24}}>
    {[left,right].filter(Boolean).map((b,i)=>(
      <div key={i} style={{fontSize:11,color:"#64748B",minWidth:180,textAlign:i===1?"right":"left"}}>
        <div style={{borderTop:"1px solid #CBD5E1",paddingTop:6,marginTop:38}}>
          <div style={{fontWeight:700,color:"#1E293B",fontSize:12}}>{b.name||"—"}</div>
          {b.role&&<div>{b.role}</div>}
          {b.extra&&<div>{b.extra}</div>}
        </div>
      </div>
    ))}
  </div>
);
// Reusable letterhead used by the letter-style generators
const Letterhead=({company,addr,right})=>(
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:20,borderBottom:"3px solid #059669",paddingBottom:14,marginBottom:20}}>
    <div>
      <div style={D.head}>{company||"Your Company Name"}</div>
      {addr&&<div style={{...D.sub,marginTop:4,maxWidth:320}}>{addr}</div>}
    </div>
    {right&&<div style={{textAlign:"right",fontSize:11,color:"#64748B",lineHeight:1.7}}>{right}</div>}
  </div>
);

// ─── TOOL: PAYSLIP / SALARY SLIP GENERATOR ─────────────────────
function PayslipGen(){
  const now=new Date();
  const[cur,setCur]=useState("INR");
  const[co,setCo]=useState({name:"Acme Technologies Pvt Ltd",addr:"4th Floor, Orion Park, HITEC City\nHyderabad 500081, India",mark:"ACME"});
  const[month,setMonth]=useState(MONTHS[now.getMonth()]);
  const[year,setYear]=useState(String(now.getFullYear()));
  const[emp,setEmp]=useState({name:"Ravi Kumar",id:"EMP-1042",desig:"Senior Engineer",dept:"Engineering",taxId:"ABCDE1234F",bank:"4417",days:"30",lop:"0"});
  const earn=useRows([
    {label:"Basic Salary",amount:"30000"},{label:"House Rent Allowance",amount:"12000"},
    {label:"Dearness Allowance",amount:"6000"},{label:"Conveyance Allowance",amount:"1600"},
    {label:"Special Allowance",amount:"5400"},{label:"Bonus",amount:"0"},
  ]);
  const ded=useRows([
    {label:"Provident Fund",amount:"3600"},{label:"ESI",amount:"0"},
    {label:"Professional Tax",amount:"200"},{label:"Income Tax (TDS)",amount:"2500"},
    {label:"Loan / Advance",amount:"0"},
  ]);
  const gross=sumRows(earn.rows,"amount");
  const totalDed=sumRows(ded.rows,"amount");
  const net=gross-totalDed;
  const words=amountWords(net,cur);
  const rowsMax=Math.max(earn.rows.length,ded.rows.length);
  const copyText=`PAYSLIP — ${month} ${year}\n${co.name}\nEmployee: ${emp.name} (${emp.id}) · ${emp.desig}\n\nEARNINGS\n${earn.rows.map(r=>`${r.label||"—"}: ${mny(r.amount,cur)}`).join("\n")}\nGross Earnings: ${mny(gross,cur)}\n\nDEDUCTIONS\n${ded.rows.map(r=>`${r.label||"—"}: ${mny(r.amount,cur)}`).join("\n")}\nTotal Deductions: ${mny(totalDed,cur)}\n\nNET PAY: ${mny(net,cur)}\n(${words})`;
  return(<V>
    <G2>
      <Card>
        <Lab>Employer</Lab>
        <Input value={co.name} onChange={v=>setCo({...co,name:v})} placeholder="Company Name" style={{marginBottom:8}}/>
        <Input value={co.addr} onChange={v=>setCo({...co,addr:v})} placeholder="Registered Address" multiline rows={2} style={{marginBottom:8}}/>
        <Input value={co.mark} onChange={v=>setCo({...co,mark:v})} placeholder="Logo text / initials (optional)"/>
      </Card>
      <Card>
        <Lab>Pay Period & Currency</Lab>
        <div style={{marginBottom:8}}><Sel value={month} onChange={setMonth} options={MONTHS}/></div>
        <div style={{marginBottom:8}}><Input value={year} onChange={setYear} placeholder="2026"/></div>
        <Sel value={cur} onChange={setCur} options={CUR_OPTS}/>
      </Card>
    </G2>
    <Card>
      <Lab>Employee</Lab>
      <G2>
        <div><Lab>Name</Lab><Input value={emp.name} onChange={v=>setEmp({...emp,name:v})} placeholder="Employee Name"/></div>
        <div><Lab>Employee ID</Lab><Input value={emp.id} onChange={v=>setEmp({...emp,id:v})} placeholder="EMP-1042"/></div>
        <div><Lab>Designation</Lab><Input value={emp.desig} onChange={v=>setEmp({...emp,desig:v})} placeholder="Senior Engineer"/></div>
        <div><Lab>Department</Lab><Input value={emp.dept} onChange={v=>setEmp({...emp,dept:v})} placeholder="Engineering"/></div>
        <div><Lab>Tax ID (PAN / UAN / SSN)</Lab><Input value={emp.taxId} onChange={v=>setEmp({...emp,taxId:v})} placeholder="ABCDE1234F"/></div>
        <div><Lab>Bank A/C (last 4)</Lab><Input value={emp.bank} onChange={v=>setEmp({...emp,bank:v})} placeholder="4417"/></div>
        <NumInput label="Days Paid" value={emp.days} onChange={v=>setEmp({...emp,days:v})} placeholder="30"/>
        <NumInput label="LOP Days" value={emp.lop} onChange={v=>setEmp({...emp,lop:v})} placeholder="0"/>
      </G2>
    </Card>
    <G2>
      <Card>
        <Lab>Earnings</Lab>
        <RowsEditor rows={earn.rows} upd={earn.upd} rm={earn.rm} add={()=>earn.setRows(r=>[...r,{label:"",amount:"0"}])}
          cols={[{f:"label",label:"Head",flex:2,ph:"Allowance name"},{f:"amount",label:"Amount",flex:1,ph:"0"}]} addLabel="+ Add Earning"/>
        <div style={{marginTop:10}}><Res label="Gross Earnings" value={mny(gross,cur)} mono color={S.green}/></div>
      </Card>
      <Card>
        <Lab>Deductions</Lab>
        <RowsEditor rows={ded.rows} upd={ded.upd} rm={ded.rm} add={()=>ded.setRows(r=>[...r,{label:"",amount:"0"}])}
          cols={[{f:"label",label:"Head",flex:2,ph:"Deduction name"},{f:"amount",label:"Amount",flex:1,ph:"0"}]} addLabel="+ Add Deduction"/>
        <div style={{marginTop:10}}><Res label="Total Deductions" value={mny(totalDed,cur)} mono color={S.red}/></div>
      </Card>
    </G2>
    <Big label="Net Pay" value={mny(net,cur)} sub={words} color={net>=0?S.accent:S.red}/>
    <Disclaim/>
    <DocFrame status={`Payslip ready · Net ${mny(net,cur)}`} copyText={copyText}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:20,borderBottom:"3px solid #059669",paddingBottom:14,marginBottom:18}}>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          {co.mark&&<div style={{width:44,height:44,borderRadius:10,background:"#ECFDF5",border:"1px solid #A7F3D0",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"#059669",fontFamily:S.display,fontSize:13}}>{co.mark.slice(0,4)}</div>}
          <div>
            <div style={D.head}>{co.name||"Your Company Name"}</div>
            {co.addr&&<div style={{...D.sub,marginTop:3,maxWidth:300}}>{co.addr}</div>}
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={D.title}>PAYSLIP</div>
          <div style={{fontSize:12,color:"#64748B",marginTop:4}}>Pay Period: {month} {year}</div>
        </div>
      </div>
      <DocMetaRow pairs={[
        ["Employee Name",emp.name||"—"],["Employee ID",emp.id||"—"],
        ["Designation",emp.desig||"—"],["Department",emp.dept||"—"],
        ["Tax ID",emp.taxId||"—"],["Bank A/C",emp.bank?`XXXX${emp.bank}`:"—"],
        ["Days Paid",emp.days||"—"],["LOP Days",emp.lop||"0"],
      ]}/>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:14}}>
        <thead><tr>
          <th style={D.th}>Earnings</th><th style={D.thR}>Amount</th>
          <th style={{...D.th,borderLeft:"1px solid #E2E8F0"}}>Deductions</th><th style={D.thR}>Amount</th>
        </tr></thead>
        <tbody>
          {Array.from({length:rowsMax}).map((_,i)=>{
            const e=earn.rows[i],d=ded.rows[i];
            return(<tr key={i} style={D.row}>
              <td style={D.td}>{e?(e.label||"—"):""}</td>
              <td style={D.tdR}>{e?mny(e.amount,cur):""}</td>
              <td style={{...D.td,borderLeft:"1px solid #E2E8F0"}}>{d?(d.label||"—"):""}</td>
              <td style={D.tdR}>{d?mny(d.amount,cur):""}</td>
            </tr>);
          })}
          <tr style={{background:"#F8FAFC",fontWeight:800}}>
            <td style={{...D.td,fontWeight:800}}>Gross Earnings</td>
            <td style={{...D.tdR,fontWeight:800}}>{mny(gross,cur)}</td>
            <td style={{...D.td,fontWeight:800,borderLeft:"1px solid #E2E8F0"}}>Total Deductions</td>
            <td style={{...D.tdR,fontWeight:800}}>{mny(totalDed,cur)}</td>
          </tr>
        </tbody>
      </table>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",background:"#ECFDF5",border:"1px solid #A7F3D0",borderRadius:8}}>
        <div>
          <div style={D.cap}>Net Pay</div>
          <div style={{fontSize:12,color:"#475569",marginTop:4,maxWidth:420}}>{words}</div>
        </div>
        <div style={{fontSize:24,fontWeight:900,color:"#059669",fontFamily:S.display}}>{mny(net,cur)}</div>
      </div>
      <SignBlock left={{name:emp.name||"Employee",role:"Employee Signature"}} right={{name:co.name||"Employer",role:"Authorised Signatory"}}/>
      <div style={D.note}>This payslip is a formatting aid produced from figures entered by the issuer. The issuer is responsible for their accuracy. It is not tax, legal or accounting advice.</div>
    </DocFrame>
  </V>);
}

// ─── TOOL: RENT RECEIPT GENERATOR ──────────────────────────────
function RentReceiptGen(){
  const[cur,setCur]=useState("INR");
  const[tenant,setTenant]=useState("Ravi Kumar");
  const[landlord,setLandlord]=useState("Suresh Rao");
  const[lAddr,setLAddr]=useState("12-4-88, Banjara Hills, Hyderabad 500034");
  const[pan,setPan]=useState("ABCDE1234F");
  const[prop,setProp]=useState("Flat 302, Green Meadows, Gachibowli, Hyderabad 500032");
  const[rent,setRent]=useState("18000");
  const[freq,setFreq]=useState("monthly");
  const[start,setStart]=useState(()=>`${new Date().getFullYear()}-04-01`);
  const[count,setCount]=useState("12");
  const[mode,setMode]=useState("Bank Transfer");
  const[place,setPlace]=useState("Hyderabad");
  const step=freq==="quarterly"?3:freq==="yearly"?12:1;
  const n=Math.max(1,Math.min(24,Math.floor(p(count))||1));
  const perReceipt=p(rent)*step;
  const receipts=useMemo(()=>{
    const d=new Date(`${start}T00:00:00`);
    if(isNaN(d.getTime()))return [];
    const out=[];
    for(let i=0;i<n;i++){
      const s=new Date(d.getFullYear(),d.getMonth()+i*step,1);
      const e=new Date(d.getFullYear(),d.getMonth()+i*step+step,0);
      out.push({
        no:i+1,
        label:step===1?`${MONTHS[s.getMonth()]} ${s.getFullYear()}`:`${MONTHS[s.getMonth()]} ${s.getFullYear()} – ${MONTHS[e.getMonth()]} ${e.getFullYear()}`,
        paidOn:`${e.getDate()} ${MONTHS[e.getMonth()]} ${e.getFullYear()}`,
      });
    }
    return out;
  },[start,step,n]);
  const total=perReceipt*receipts.length;
  const needStamp=mode==="Cash"&&perReceipt>5000;
  const copyText=`RENT RECEIPTS\nTenant: ${tenant}\nLandlord: ${landlord}${pan?` (PAN ${pan})`:""}\nProperty: ${prop}\n\n${receipts.map(r=>`#${r.no} ${r.label} — ${mny(perReceipt,cur)} (paid ${r.paidOn}, ${mode})`).join("\n")}\n\nTotal: ${mny(total,cur)}`;
  return(<V>
    <G2>
      <div><Lab>Tenant Name</Lab><Input value={tenant} onChange={setTenant} placeholder="Tenant full name"/></div>
      <div><Lab>Landlord Name</Lab><Input value={landlord} onChange={setLandlord} placeholder="Landlord full name"/></div>
    </G2>
    <G2>
      <div><Lab>Landlord Address</Lab><Input value={lAddr} onChange={setLAddr} placeholder="Landlord address" multiline rows={2}/></div>
      <div><Lab>Rented Property Address</Lab><Input value={prop} onChange={setProp} placeholder="Property address" multiline rows={2}/></div>
    </G2>
    <G3>
      <div><Lab>Landlord PAN / Tax ID</Lab><Input value={pan} onChange={setPan} placeholder="ABCDE1234F"/></div>
      <NumInput label="Rent per Month" value={rent} onChange={setRent} placeholder="18000"/>
      <Sel label="Currency" value={cur} onChange={setCur} options={CUR_OPTS}/>
    </G3>
    <G3>
      <Sel label="Frequency" value={freq} onChange={setFreq} options={[{v:"monthly",l:"Monthly"},{v:"quarterly",l:"Quarterly"},{v:"yearly",l:"Yearly"}]}/>
      <div><Lab>Start Month</Lab><Input type="date" value={start} onChange={setStart}/></div>
      <NumInput label="Number of Receipts (1-24)" value={count} onChange={setCount} placeholder="12"/>
    </G3>
    <G2>
      <Sel label="Payment Mode" value={mode} onChange={setMode} options={["Bank Transfer","Cash","Cheque","UPI","Credit Card"]}/>
      <div><Lab>Place of Issue</Lab><Input value={place} onChange={setPlace} placeholder="Hyderabad"/></div>
    </G2>
    <G2>
      <Big label="Amount per Receipt" value={mny(perReceipt,cur)} sub={freq==="monthly"?"one month":`${step} months`}/>
      <Big label="Total for the Period" value={mny(total,cur)} sub={`${receipts.length} receipt${receipts.length===1?"":"s"}`} color={S.green}/>
    </G2>
    {pan?null:<div style={{padding:12,background:"rgba(245,158,11,0.1)",borderRadius:8,color:S.orange,fontSize:12}}>⚠️ Landlord PAN is usually required when annual rent exceeds ₹1,00,000. Add it above if it applies to you.</div>}
    {receipts.length===0
      ?<div style={{padding:16,background:S.accentLight,borderRadius:8,color:S.muted,fontSize:14,textAlign:"center"}}>Pick a valid start month to generate receipts</div>
      :<DocFrame status={`${receipts.length} receipt${receipts.length===1?"":"s"} · ${mny(total,cur)} total`} copyText={copyText}>
        {receipts.map(r=>(
          <div key={r.no} style={{border:"1px solid #E2E8F0",borderRadius:8,padding:"18px 20px",marginBottom:14,pageBreakInside:"avoid"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",borderBottom:"2px solid #ECFDF5",paddingBottom:10,marginBottom:12}}>
              <div>
                <div style={{...D.title,fontSize:18}}>RENT RECEIPT</div>
                <div style={{fontSize:11,color:"#94A3B8",marginTop:2}}>Receipt No. {r.no} of {receipts.length}</div>
              </div>
              <div style={{textAlign:"right",fontSize:11,color:"#64748B"}}>
                <div>Period: <strong style={{color:"#1E293B"}}>{r.label}</strong></div>
                <div>Received on: {r.paidOn}</div>
              </div>
            </div>
            <div style={{fontSize:13,color:"#374151",lineHeight:1.9}}>
              Received a sum of <strong style={{color:"#059669"}}>{mny(perReceipt,cur)}</strong> ({amountWords(perReceipt,cur)}) from <strong>{tenant||"—"}</strong> by {mode.toLowerCase()} towards the rent of the property at <strong>{prop||"—"}</strong> for the period <strong>{r.label}</strong>.
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:18,gap:20}}>
              <div style={{fontSize:11,color:"#64748B",lineHeight:1.7}}>
                <div style={D.cap}>Landlord</div>
                <div style={{color:"#1E293B",fontWeight:700,fontSize:12}}>{landlord||"—"}</div>
                {lAddr&&<div style={{maxWidth:260}}>{lAddr}</div>}
                {pan&&<div>PAN / Tax ID: {pan}</div>}
                {place&&<div>Place: {place}</div>}
              </div>
              <div style={{textAlign:"center"}}>
                {needStamp&&<div style={{width:110,height:60,border:"1px dashed #CBD5E1",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#94A3B8",marginBottom:6,textAlign:"center",padding:4}}>Affix revenue stamp here</div>}
                <div style={{borderTop:"1px solid #CBD5E1",paddingTop:5,fontSize:10,color:"#64748B",minWidth:150}}>Landlord's Signature</div>
              </div>
            </div>
          </div>
        ))}
        <div style={D.note}>
          {needStamp?"A revenue stamp is customarily affixed on cash rent payments above ₹5,000 in India. ":""}
          Rent receipts are supporting evidence for a house rent allowance claim; retain the rent agreement and payment proof alongside them. This tool only formats the details you entered.
        </div>
      </DocFrame>}
  </V>);
}

// ─── TOOL: SALARY CERTIFICATE GENERATOR ────────────────────────
function SalaryCertificateGen(){
  const[cur,setCur]=useState("INR");
  const[co,setCo]=useState({name:"Acme Technologies Pvt Ltd",addr:"4th Floor, Orion Park, HITEC City, Hyderabad 500081"});
  const[ref,setRef]=useState("HR/SAL/2026/018");
  const[date,setDate]=useState(today());
  const[emp,setEmp]=useState({name:"Ravi Kumar",id:"EMP-1042",desig:"Senior Engineer",dept:"Engineering",doj:"2021-06-14"});
  const[purpose,setPurpose]=useState("submission to the bank for a home loan application");
  const[sign,setSign]=useState({name:"Meera Nair",role:"Head of Human Resources"});
  const earn=useRows([{label:"Basic Salary",amount:"30000"},{label:"House Rent Allowance",amount:"12000"},{label:"Other Allowances",amount:"7000"}]);
  const ded=useRows([{label:"Provident Fund",amount:"3600"},{label:"Income Tax (TDS)",amount:"2500"}]);
  const gross=sumRows(earn.rows,"amount"),dedTotal=sumRows(ded.rows,"amount"),net=gross-dedTotal;
  const copyText=`SALARY CERTIFICATE (Ref ${ref})\n${co.name}\nDate: ${fmtDate(date)}\n\nThis is to certify that ${emp.name} (${emp.id}) is employed as ${emp.desig} in the ${emp.dept} department since ${fmtDate(emp.doj)}.\nGross monthly salary: ${mny(gross,cur)}\nTotal deductions: ${mny(dedTotal,cur)}\nNet monthly salary: ${mny(net,cur)} (${amountWords(net,cur)})\nIssued for ${purpose}.\n\n${sign.name}\n${sign.role}`;
  return(<V>
    <G2>
      <div><Lab>Company Name</Lab><Input value={co.name} onChange={v=>setCo({...co,name:v})} placeholder="Company Name"/></div>
      <div><Lab>Company Address</Lab><Input value={co.addr} onChange={v=>setCo({...co,addr:v})} placeholder="Registered address" multiline rows={2}/></div>
    </G2>
    <G3>
      <div><Lab>Reference No.</Lab><Input value={ref} onChange={setRef} placeholder="HR/SAL/2026/018"/></div>
      <div><Lab>Date of Issue</Lab><Input type="date" value={date} onChange={setDate}/></div>
      <Sel label="Currency" value={cur} onChange={setCur} options={CUR_OPTS}/>
    </G3>
    <G2>
      <div><Lab>Employee Name</Lab><Input value={emp.name} onChange={v=>setEmp({...emp,name:v})} placeholder="Employee name"/></div>
      <div><Lab>Employee ID</Lab><Input value={emp.id} onChange={v=>setEmp({...emp,id:v})} placeholder="EMP-1042"/></div>
      <div><Lab>Designation</Lab><Input value={emp.desig} onChange={v=>setEmp({...emp,desig:v})} placeholder="Senior Engineer"/></div>
      <div><Lab>Department</Lab><Input value={emp.dept} onChange={v=>setEmp({...emp,dept:v})} placeholder="Engineering"/></div>
    </G2>
    <G2>
      <div><Lab>Date of Joining</Lab><Input type="date" value={emp.doj} onChange={v=>setEmp({...emp,doj:v})}/></div>
      <div><Lab>Purpose of Certificate</Lab><Input value={purpose} onChange={setPurpose} placeholder="submission to the bank for a home loan"/></div>
    </G2>
    <G2>
      <Card><Lab>Monthly Earnings</Lab><RowsEditor rows={earn.rows} upd={earn.upd} rm={earn.rm} add={()=>earn.setRows(r=>[...r,{label:"",amount:"0"}])} cols={[{f:"label",label:"Head",flex:2,ph:"Component"},{f:"amount",label:"Amount",flex:1,ph:"0"}]} addLabel="+ Add Earning"/></Card>
      <Card><Lab>Monthly Deductions</Lab><RowsEditor rows={ded.rows} upd={ded.upd} rm={ded.rm} add={()=>ded.setRows(r=>[...r,{label:"",amount:"0"}])} cols={[{f:"label",label:"Head",flex:2,ph:"Component"},{f:"amount",label:"Amount",flex:1,ph:"0"}]} addLabel="+ Add Deduction"/></Card>
    </G2>
    <G2>
      <div><Lab>Signatory Name</Lab><Input value={sign.name} onChange={v=>setSign({...sign,name:v})} placeholder="Meera Nair"/></div>
      <div><Lab>Signatory Designation</Lab><Input value={sign.role} onChange={v=>setSign({...sign,role:v})} placeholder="Head of Human Resources"/></div>
    </G2>
    <G3>
      <Big label="Gross Monthly" value={mny(gross,cur)}/>
      <Big label="Deductions" value={mny(dedTotal,cur)} color={S.red}/>
      <Big label="Net Monthly" value={mny(net,cur)} color={S.green}/>
    </G3>
    <Disclaim/>
    <DocFrame status={`Salary certificate ready · Net ${mny(net,cur)}`} copyText={copyText}>
      <Letterhead company={co.name} addr={co.addr} right={<><div>Ref: {ref||"—"}</div><div>Date: {fmtDate(date)}</div></>}/>
      <div style={{textAlign:"center",fontSize:15,fontWeight:800,color:"#0F172A",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:18,fontFamily:S.display}}>Salary Certificate</div>
      <div style={D.body}>
        This is to certify that <strong>{emp.name||"—"}</strong> (Employee ID: {emp.id||"—"}) has been employed with {co.name||"our organisation"} as <strong>{emp.desig||"—"}</strong> in the {emp.dept||"—"} department since <strong>{fmtDate(emp.doj)}</strong>{emp.doj?` (${tenureText(emp.doj,date)} of service as on ${fmtDate(date)})`:""}.
      </div>
      <div style={{...D.body,marginTop:10,marginBottom:14}}>The current monthly salary details are as follows:</div>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:14}}>
        <thead><tr><th style={D.th}>Earnings</th><th style={D.thR}>Amount</th></tr></thead>
        <tbody>
          {earn.rows.map((r,i)=><tr key={i} style={D.row}><td style={D.td}>{r.label||"—"}</td><td style={D.tdR}>{mny(r.amount,cur)}</td></tr>)}
          <tr style={{background:"#F8FAFC"}}><td style={{...D.td,fontWeight:800}}>Gross Monthly Salary</td><td style={{...D.tdR,fontWeight:800}}>{mny(gross,cur)}</td></tr>
          {ded.rows.map((r,i)=><tr key={`d${i}`} style={D.row}><td style={D.td}>Less: {r.label||"—"}</td><td style={D.tdR}>{mny(r.amount,cur)}</td></tr>)}
          <tr style={{background:"#ECFDF5"}}><td style={{...D.td,fontWeight:800,color:"#059669"}}>Net Monthly Salary</td><td style={{...D.tdR,fontWeight:800,color:"#059669"}}>{mny(net,cur)}</td></tr>
        </tbody>
      </table>
      <div style={D.body}>The net monthly salary in words is <strong>{amountWords(net,cur)}</strong>. This certificate is issued at the request of the employee for the purpose of {purpose||"official verification"} and carries no other liability on the part of the company.</div>
      <SignBlock left={{name:sign.name||"—",role:sign.role||"Authorised Signatory",extra:co.name}}/>
      <div style={D.note}>This certificate is a formatting aid produced from figures supplied by the issuer, who is responsible for their accuracy. It is not tax, legal or accounting advice.</div>
    </DocFrame>
  </V>);
}

// ─── TOOL: JOB OFFER LETTER GENERATOR ──────────────────────────
function OfferLetterGen(){
  const[cur,setCur]=useState("INR");
  const[co,setCo]=useState({name:"Acme Technologies Pvt Ltd",addr:"4th Floor, Orion Park, HITEC City, Hyderabad 500081"});
  const[date,setDate]=useState(today());
  const[ref,setRef]=useState("HR/OFR/2026/041");
  const[cand,setCand]=useState({name:"Ananya Sharma",addr:"18 Rose Villa, Kondapur, Hyderabad 500084"});
  const[role,setRole]=useState({title:"Product Designer",dept:"Design",manager:"Head of Design",location:"Hyderabad (Hybrid)",type:"Full-time"});
  const[ctc,setCtc]=useState("1200000");
  const[period,setPeriod]=useState("per annum");
  const[startDate,setStartDate]=useState("");
  const[probation,setProbation]=useState("3");
  const[validTill,setValidTill]=useState("");
  const[conditions,setConditions]=useState("satisfactory background verification and submission of relieving documents from your previous employer");
  const[sign,setSign]=useState({name:"Meera Nair",role:"Head of Human Resources"});
  const copyText=`OFFER OF EMPLOYMENT (Ref ${ref})\n${co.name} — ${fmtDate(date)}\n\nDear ${cand.name},\n\nWe are pleased to offer you the position of ${role.title} in the ${role.dept} team at ${co.name}, reporting to the ${role.manager}.\n\nPosition: ${role.title} (${role.type})\nLocation: ${role.location}\nCompensation: ${mny(ctc,cur)} ${period}\nStart date: ${fmtDate(startDate)}\nProbation: ${probation} months\nOffer valid until: ${fmtDate(validTill)}\n\nThis offer is subject to ${conditions}.\n\n${sign.name}\n${sign.role}, ${co.name}`;
  return(<V>
    <G2>
      <div><Lab>Company Name</Lab><Input value={co.name} onChange={v=>setCo({...co,name:v})} placeholder="Company Name"/></div>
      <div><Lab>Company Address</Lab><Input value={co.addr} onChange={v=>setCo({...co,addr:v})} placeholder="Address" multiline rows={2}/></div>
    </G2>
    <G3>
      <div><Lab>Reference No.</Lab><Input value={ref} onChange={setRef} placeholder="HR/OFR/2026/041"/></div>
      <div><Lab>Letter Date</Lab><Input type="date" value={date} onChange={setDate}/></div>
      <Sel label="Currency" value={cur} onChange={setCur} options={CUR_OPTS}/>
    </G3>
    <G2>
      <div><Lab>Candidate Name</Lab><Input value={cand.name} onChange={v=>setCand({...cand,name:v})} placeholder="Candidate name"/></div>
      <div><Lab>Candidate Address</Lab><Input value={cand.addr} onChange={v=>setCand({...cand,addr:v})} placeholder="Candidate address" multiline rows={2}/></div>
    </G2>
    <G2>
      <div><Lab>Position / Title</Lab><Input value={role.title} onChange={v=>setRole({...role,title:v})} placeholder="Product Designer"/></div>
      <div><Lab>Department</Lab><Input value={role.dept} onChange={v=>setRole({...role,dept:v})} placeholder="Design"/></div>
      <div><Lab>Reporting To</Lab><Input value={role.manager} onChange={v=>setRole({...role,manager:v})} placeholder="Head of Design"/></div>
      <div><Lab>Work Location</Lab><Input value={role.location} onChange={v=>setRole({...role,location:v})} placeholder="Hyderabad (Hybrid)"/></div>
    </G2>
    <G3>
      <Sel label="Employment Type" value={role.type} onChange={v=>setRole({...role,type:v})} options={["Full-time","Part-time","Contract","Internship","Temporary"]}/>
      <NumInput label="Total Compensation" value={ctc} onChange={setCtc} placeholder="1200000"/>
      <Sel label="Compensation Period" value={period} onChange={setPeriod} options={[{v:"per annum",l:"Per annum"},{v:"per month",l:"Per month"},{v:"per hour",l:"Per hour"}]}/>
    </G3>
    <G3>
      <div><Lab>Expected Start Date</Lab><Input type="date" value={startDate} onChange={setStartDate}/></div>
      <NumInput label="Probation (months)" value={probation} onChange={setProbation} placeholder="3"/>
      <div><Lab>Offer Valid Until</Lab><Input type="date" value={validTill} onChange={setValidTill}/></div>
    </G3>
    <div><Lab>Offer Conditions</Lab><Input value={conditions} onChange={setConditions} placeholder="background verification, reference checks..." multiline rows={2}/></div>
    <G2>
      <div><Lab>Signatory Name</Lab><Input value={sign.name} onChange={v=>setSign({...sign,name:v})} placeholder="Meera Nair"/></div>
      <div><Lab>Signatory Designation</Lab><Input value={sign.role} onChange={v=>setSign({...sign,role:v})} placeholder="Head of Human Resources"/></div>
    </G2>
    <Disclaim/>
    <DocFrame status="Offer letter ready" copyText={copyText}>
      <Letterhead company={co.name} addr={co.addr} right={<><div>Ref: {ref||"—"}</div><div>Date: {fmtDate(date)}</div></>}/>
      <div style={{fontSize:12,color:"#64748B",marginBottom:16,lineHeight:1.7}}>
        <div style={D.cap}>To</div>
        <div style={{color:"#1E293B",fontWeight:700,fontSize:13}}>{cand.name||"—"}</div>
        {cand.addr&&<div style={{maxWidth:320,whiteSpace:"pre-wrap"}}>{cand.addr}</div>}
      </div>
      <div style={{fontSize:13,fontWeight:800,color:"#0F172A",marginBottom:14}}>Subject: Offer of Employment — {role.title||"—"}</div>
      <div style={D.body}>Dear {(cand.name||"Candidate").split(" ")[0]},</div>
      <div style={{...D.body,marginTop:10}}>
        We are pleased to offer you the position of <strong>{role.title||"—"}</strong> in the {role.dept||"—"} team at {co.name||"our company"}, reporting to the {role.manager||"—"}. We were impressed by your background and believe you will make a strong contribution to the team.
      </div>
      <div style={{...D.body,marginTop:10,marginBottom:12}}>The principal terms of this offer are set out below:</div>
      <DocMetaRow pairs={[
        ["Position",role.title||"—"],["Department",role.dept||"—"],
        ["Employment Type",role.type],["Work Location",role.location||"—"],
        ["Reporting To",role.manager||"—"],["Compensation",`${mny(ctc,cur)} ${period}`],
        ["Start Date",startDate?fmtDate(startDate):"To be mutually agreed"],["Probation",`${p(probation)||0} month${p(probation)===1?"":"s"}`],
      ]}/>
      <div style={D.body}>
        Your total compensation will be <strong>{mny(ctc,cur)} {period}</strong> ({amountWords(ctc,cur)} {period}), payable in line with company payroll policy and subject to applicable statutory deductions.
        {conditions?` This offer is conditional upon ${conditions}.`:""}
        {validTill?` Please confirm your acceptance by signing and returning a copy of this letter on or before ${fmtDate(validTill)}, after which this offer lapses.`:" Please confirm your acceptance by signing and returning a copy of this letter."}
      </div>
      <div style={{...D.body,marginTop:10}}>A detailed appointment letter setting out the full terms and conditions of service will be issued to you on the date of joining. We look forward to welcoming you aboard.</div>
      <SignBlock left={{name:sign.name||"—",role:sign.role||"Authorised Signatory",extra:co.name}} right={{name:cand.name||"—",role:"Accepted — Candidate Signature & Date"}}/>
      <div style={D.note}>This letter is a formatting aid produced from details entered by the issuer, who is responsible for their accuracy and for compliance with applicable employment law. It is not legal advice.</div>
    </DocFrame>
  </V>);
}

// ─── TOOL: APPOINTMENT LETTER GENERATOR ────────────────────────
function AppointmentLetterGen(){
  const[cur,setCur]=useState("INR");
  const[co,setCo]=useState({name:"Acme Technologies Pvt Ltd",addr:"4th Floor, Orion Park, HITEC City, Hyderabad 500081"});
  const[ref,setRef]=useState("HR/APT/2026/077");
  const[date,setDate]=useState(today());
  const[emp,setEmp]=useState({name:"Ananya Sharma",addr:"18 Rose Villa, Kondapur, Hyderabad 500084",desig:"Product Designer",dept:"Design",location:"Hyderabad"});
  const[doj,setDoj]=useState("");
  const[salary,setSalary]=useState("100000");
  const[period,setPeriod]=useState("per month");
  const[probation,setProbation]=useState("6");
  const[notice,setNotice]=useState("60");
  const[hours,setHours]=useState("9:30 AM to 6:30 PM, Monday to Friday");
  const[extra,setExtra]=useState("You shall maintain strict confidentiality of all company and client information.\nAll work product created during employment shall remain the property of the company.\nYou shall return all company property on separation.");
  const[sign,setSign]=useState({name:"Meera Nair",role:"Head of Human Resources"});
  const clauses=extra.split("\n").map(s=>s.trim()).filter(Boolean);
  const copyText=`APPOINTMENT LETTER (Ref ${ref})\n${co.name} — ${fmtDate(date)}\n\nDear ${emp.name},\n\nYou are appointed as ${emp.desig} in the ${emp.dept} department at ${emp.location}, with effect from ${fmtDate(doj)}.\n\nRemuneration: ${mny(salary,cur)} ${period}\nProbation: ${probation} months\nNotice period: ${notice} days\nWorking hours: ${hours}\n\n${clauses.map((c,i)=>`${i+1}. ${c}`).join("\n")}\n\n${sign.name}\n${sign.role}, ${co.name}`;
  return(<V>
    <G2>
      <div><Lab>Company Name</Lab><Input value={co.name} onChange={v=>setCo({...co,name:v})} placeholder="Company Name"/></div>
      <div><Lab>Company Address</Lab><Input value={co.addr} onChange={v=>setCo({...co,addr:v})} placeholder="Address" multiline rows={2}/></div>
    </G2>
    <G3>
      <div><Lab>Reference No.</Lab><Input value={ref} onChange={setRef} placeholder="HR/APT/2026/077"/></div>
      <div><Lab>Letter Date</Lab><Input type="date" value={date} onChange={setDate}/></div>
      <Sel label="Currency" value={cur} onChange={setCur} options={CUR_OPTS}/>
    </G3>
    <G2>
      <div><Lab>Employee Name</Lab><Input value={emp.name} onChange={v=>setEmp({...emp,name:v})} placeholder="Employee name"/></div>
      <div><Lab>Employee Address</Lab><Input value={emp.addr} onChange={v=>setEmp({...emp,addr:v})} placeholder="Address" multiline rows={2}/></div>
      <div><Lab>Designation</Lab><Input value={emp.desig} onChange={v=>setEmp({...emp,desig:v})} placeholder="Product Designer"/></div>
      <div><Lab>Department</Lab><Input value={emp.dept} onChange={v=>setEmp({...emp,dept:v})} placeholder="Design"/></div>
    </G2>
    <G3>
      <div><Lab>Place of Work</Lab><Input value={emp.location} onChange={v=>setEmp({...emp,location:v})} placeholder="Hyderabad"/></div>
      <div><Lab>Date of Joining</Lab><Input type="date" value={doj} onChange={setDoj}/></div>
      <NumInput label="Remuneration" value={salary} onChange={setSalary} placeholder="100000"/>
    </G3>
    <G3>
      <Sel label="Salary Period" value={period} onChange={setPeriod} options={[{v:"per month",l:"Per month"},{v:"per annum",l:"Per annum"}]}/>
      <NumInput label="Probation (months)" value={probation} onChange={setProbation} placeholder="6"/>
      <NumInput label="Notice Period (days)" value={notice} onChange={setNotice} placeholder="60"/>
    </G3>
    <div><Lab>Working Hours</Lab><Input value={hours} onChange={setHours} placeholder="9:30 AM to 6:30 PM, Monday to Friday"/></div>
    <div><Lab>Additional Terms (one per line)</Lab><Input value={extra} onChange={setExtra} placeholder={"Confidentiality clause\nIntellectual property clause"} multiline rows={4}/></div>
    <G2>
      <div><Lab>Signatory Name</Lab><Input value={sign.name} onChange={v=>setSign({...sign,name:v})} placeholder="Meera Nair"/></div>
      <div><Lab>Signatory Designation</Lab><Input value={sign.role} onChange={v=>setSign({...sign,role:v})} placeholder="Head of Human Resources"/></div>
    </G2>
    <Disclaim/>
    <DocFrame status="Appointment letter ready" copyText={copyText}>
      <Letterhead company={co.name} addr={co.addr} right={<><div>Ref: {ref||"—"}</div><div>Date: {fmtDate(date)}</div></>}/>
      <div style={{fontSize:12,color:"#64748B",marginBottom:16,lineHeight:1.7}}>
        <div style={D.cap}>To</div>
        <div style={{color:"#1E293B",fontWeight:700,fontSize:13}}>{emp.name||"—"}</div>
        {emp.addr&&<div style={{maxWidth:320,whiteSpace:"pre-wrap"}}>{emp.addr}</div>}
      </div>
      <div style={{fontSize:13,fontWeight:800,color:"#0F172A",marginBottom:14}}>Subject: Letter of Appointment — {emp.desig||"—"}</div>
      <div style={D.body}>Dear {(emp.name||"Employee").split(" ")[0]},</div>
      <div style={{...D.body,marginTop:10,marginBottom:12}}>
        With reference to your acceptance of our offer, we are pleased to confirm your appointment with {co.name||"our company"} on the following terms and conditions of service.
      </div>
      <DocMetaRow pairs={[
        ["Designation",emp.desig||"—"],["Department",emp.dept||"—"],
        ["Place of Work",emp.location||"—"],["Date of Joining",doj?fmtDate(doj):"—"],
        ["Remuneration",`${mny(salary,cur)} ${period}`],["Probation",`${p(probation)||0} month${p(probation)===1?"":"s"}`],
        ["Notice Period",`${p(notice)||0} days`],["Working Hours",hours||"—"],
      ]}/>
      <div style={D.body}>
        Your remuneration will be <strong>{mny(salary,cur)} {period}</strong> ({amountWords(salary,cur)} {period}), subject to applicable statutory deductions. You will be on probation for {p(probation)||0} month{p(probation)===1?"":"s"} from the date of joining, and your appointment will be confirmed in writing on satisfactory completion of that period. Either party may terminate this employment by giving {p(notice)||0} days' written notice or salary in lieu thereof.
      </div>
      {clauses.length>0&&<div style={{marginTop:14}}>
        <div style={{...D.cap,marginBottom:8}}>Additional Terms</div>
        <ol style={{margin:0,paddingLeft:20}}>
          {clauses.map((c,i)=><li key={i} style={{fontSize:12.5,color:"#374151",lineHeight:1.8,marginBottom:4}}>{c}</li>)}
        </ol>
      </div>}
      <div style={{...D.body,marginTop:14}}>Please sign and return the duplicate copy of this letter as a token of your acceptance of the above terms. We welcome you to {co.name||"the company"} and wish you a rewarding tenure.</div>
      <SignBlock left={{name:sign.name||"—",role:sign.role||"Authorised Signatory",extra:co.name}} right={{name:emp.name||"—",role:"Accepted — Employee Signature & Date"}}/>
      <div style={D.note}>This letter is a formatting aid produced from details entered by the issuer, who is responsible for their accuracy and for compliance with applicable employment law. It is not legal advice.</div>
    </DocFrame>
  </V>);
}

// ─── TOOL: EXPERIENCE / SERVICE CERTIFICATE GENERATOR ──────────
function ExperienceLetterGen(){
  const[co,setCo]=useState({name:"Acme Technologies Pvt Ltd",addr:"4th Floor, Orion Park, HITEC City, Hyderabad 500081"});
  const[ref,setRef]=useState("HR/EXP/2026/112");
  const[date,setDate]=useState(today());
  const[emp,setEmp]=useState({name:"Ravi Kumar",id:"EMP-1042",desig:"Senior Engineer",dept:"Engineering",gender:"He"});
  const[doj,setDoj]=useState("2021-06-14");
  const[lwd,setLwd]=useState("2026-03-31");
  const[conduct,setConduct]=useState("His conduct and performance during the tenure were found to be satisfactory.");
  const[duties,setDuties]=useState("Designing and maintaining backend services, mentoring junior engineers and owning production reliability.");
  const[sign,setSign]=useState({name:"Meera Nair",role:"Head of Human Resources"});
  const span=tenureText(doj,lwd);
  const copyText=`EXPERIENCE CERTIFICATE (Ref ${ref})\n${co.name} — ${fmtDate(date)}\n\nThis is to certify that ${emp.name} (${emp.id}) was employed with ${co.name} as ${emp.desig} in the ${emp.dept} department from ${fmtDate(doj)} to ${fmtDate(lwd)} — a total of ${span}.\n\n${duties}\n\n${conduct}\n\n${sign.name}\n${sign.role}, ${co.name}`;
  return(<V>
    <G2>
      <div><Lab>Company Name</Lab><Input value={co.name} onChange={v=>setCo({...co,name:v})} placeholder="Company Name"/></div>
      <div><Lab>Company Address</Lab><Input value={co.addr} onChange={v=>setCo({...co,addr:v})} placeholder="Address" multiline rows={2}/></div>
    </G2>
    <G3>
      <div><Lab>Reference No.</Lab><Input value={ref} onChange={setRef} placeholder="HR/EXP/2026/112"/></div>
      <div><Lab>Date of Issue</Lab><Input type="date" value={date} onChange={setDate}/></div>
      <Sel label="Pronoun" value={emp.gender} onChange={v=>setEmp({...emp,gender:v})} options={[{v:"He",l:"He / His"},{v:"She",l:"She / Her"},{v:"They",l:"They / Their"}]}/>
    </G3>
    <G2>
      <div><Lab>Employee Name</Lab><Input value={emp.name} onChange={v=>setEmp({...emp,name:v})} placeholder="Employee name"/></div>
      <div><Lab>Employee ID</Lab><Input value={emp.id} onChange={v=>setEmp({...emp,id:v})} placeholder="EMP-1042"/></div>
      <div><Lab>Designation Held</Lab><Input value={emp.desig} onChange={v=>setEmp({...emp,desig:v})} placeholder="Senior Engineer"/></div>
      <div><Lab>Department</Lab><Input value={emp.dept} onChange={v=>setEmp({...emp,dept:v})} placeholder="Engineering"/></div>
    </G2>
    <G2>
      <div><Lab>Date of Joining</Lab><Input type="date" value={doj} onChange={setDoj}/></div>
      <div><Lab>Last Working Day</Lab><Input type="date" value={lwd} onChange={setLwd}/></div>
    </G2>
    <div><Lab>Key Responsibilities (optional)</Lab><Input value={duties} onChange={setDuties} placeholder="Brief summary of the role" multiline rows={2}/></div>
    <div><Lab>Conduct Remark</Lab><Input value={conduct} onChange={setConduct} placeholder="Conduct and performance remark" multiline rows={2}/></div>
    <G2>
      <div><Lab>Signatory Name</Lab><Input value={sign.name} onChange={v=>setSign({...sign,name:v})} placeholder="Meera Nair"/></div>
      <div><Lab>Signatory Designation</Lab><Input value={sign.role} onChange={v=>setSign({...sign,role:v})} placeholder="Head of Human Resources"/></div>
    </G2>
    <Big label="Total Service Tenure" value={span} sub={`${fmtDate(doj)} → ${fmtDate(lwd)}`} color={span==="—"?S.orange:S.accent}/>
    {span==="—"&&<div style={{padding:12,background:"rgba(245,158,11,0.1)",borderRadius:8,color:S.orange,fontSize:12}}>⚠️ Enter a joining date and a later last working day to calculate the tenure.</div>}
    <Disclaim/>
    <DocFrame status="Experience certificate ready" copyText={copyText}>
      <Letterhead company={co.name} addr={co.addr} right={<><div>Ref: {ref||"—"}</div><div>Date: {fmtDate(date)}</div></>}/>
      <div style={{textAlign:"center",fontSize:15,fontWeight:800,color:"#0F172A",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:18,fontFamily:S.display}}>Experience Certificate</div>
      <div style={{...D.body,marginBottom:12}}>
        This is to certify that <strong>{emp.name||"—"}</strong> (Employee ID: {emp.id||"—"}) was employed with {co.name||"our organisation"} as <strong>{emp.desig||"—"}</strong> in the {emp.dept||"—"} department from <strong>{fmtDate(doj)}</strong> to <strong>{fmtDate(lwd)}</strong>, a total service period of <strong>{span}</strong>.
      </div>
      {duties&&<div style={{...D.body,marginBottom:12}}>{emp.gender==="They"?"Their":emp.gender==="She"?"Her":"His"} responsibilities included {duties.charAt(0).toLowerCase()+duties.slice(1)}</div>}
      {conduct&&<div style={{...D.body,marginBottom:12}}>{conduct}</div>}
      <div style={D.body}>We wish {emp.gender==="They"?"them":emp.gender==="She"?"her":"him"} every success in future endeavours. This certificate is issued at the request of the employee.</div>
      <SignBlock left={{name:sign.name||"—",role:sign.role||"Authorised Signatory",extra:co.name}}/>
      <div style={D.note}>This certificate is a formatting aid produced from details entered by the issuer, who is responsible for their accuracy. It is not legal advice.</div>
    </DocFrame>
  </V>);
}

// ─── TOOL: RELIEVING LETTER GENERATOR ──────────────────────────
function RelievingLetterGen(){
  const[co,setCo]=useState({name:"Acme Technologies Pvt Ltd",addr:"4th Floor, Orion Park, HITEC City, Hyderabad 500081"});
  const[ref,setRef]=useState("HR/REL/2026/058");
  const[date,setDate]=useState(today());
  const[emp,setEmp]=useState({name:"Ravi Kumar",id:"EMP-1042",desig:"Senior Engineer",dept:"Engineering",gender:"He"});
  const[doj,setDoj]=useState("2021-06-14");
  const[resign,setResign]=useState("2026-01-31");
  const[lwd,setLwd]=useState("2026-03-31");
  const[clearance,setClearance]=useState("yes");
  const[sign,setSign]=useState({name:"Meera Nair",role:"Head of Human Resources"});
  const span=tenureText(doj,lwd);
  const copyText=`RELIEVING LETTER (Ref ${ref})\n${co.name} — ${fmtDate(date)}\n\nDear ${emp.name},\n\nThis is to confirm that your resignation dated ${fmtDate(resign)} has been accepted and you have been relieved from your duties as ${emp.desig}, ${emp.dept}, at the close of business on ${fmtDate(lwd)}. Your total service with the company was ${span}.\n\n${clearance==="yes"?"You have completed all exit formalities, returned company property and have no dues outstanding.":"Pending exit formalities and dues, if any, will be settled separately."}\n\n${sign.name}\n${sign.role}, ${co.name}`;
  return(<V>
    <G2>
      <div><Lab>Company Name</Lab><Input value={co.name} onChange={v=>setCo({...co,name:v})} placeholder="Company Name"/></div>
      <div><Lab>Company Address</Lab><Input value={co.addr} onChange={v=>setCo({...co,addr:v})} placeholder="Address" multiline rows={2}/></div>
    </G2>
    <G3>
      <div><Lab>Reference No.</Lab><Input value={ref} onChange={setRef} placeholder="HR/REL/2026/058"/></div>
      <div><Lab>Letter Date</Lab><Input type="date" value={date} onChange={setDate}/></div>
      <Sel label="Pronoun" value={emp.gender} onChange={v=>setEmp({...emp,gender:v})} options={[{v:"He",l:"He / His"},{v:"She",l:"She / Her"},{v:"They",l:"They / Their"}]}/>
    </G3>
    <G2>
      <div><Lab>Employee Name</Lab><Input value={emp.name} onChange={v=>setEmp({...emp,name:v})} placeholder="Employee name"/></div>
      <div><Lab>Employee ID</Lab><Input value={emp.id} onChange={v=>setEmp({...emp,id:v})} placeholder="EMP-1042"/></div>
      <div><Lab>Designation</Lab><Input value={emp.desig} onChange={v=>setEmp({...emp,desig:v})} placeholder="Senior Engineer"/></div>
      <div><Lab>Department</Lab><Input value={emp.dept} onChange={v=>setEmp({...emp,dept:v})} placeholder="Engineering"/></div>
    </G2>
    <G3>
      <div><Lab>Date of Joining</Lab><Input type="date" value={doj} onChange={setDoj}/></div>
      <div><Lab>Resignation Date</Lab><Input type="date" value={resign} onChange={setResign}/></div>
      <div><Lab>Last Working Day</Lab><Input type="date" value={lwd} onChange={setLwd}/></div>
    </G3>
    <G2>
      <Sel label="Dues & Property Clearance" value={clearance} onChange={setClearance} options={[{v:"yes",l:"All formalities completed — include statement"},{v:"no",l:"Pending — omit clearance statement"}]}/>
      <div><Lab>Signatory Name</Lab><Input value={sign.name} onChange={v=>setSign({...sign,name:v})} placeholder="Meera Nair"/></div>
    </G2>
    <div><Lab>Signatory Designation</Lab><Input value={sign.role} onChange={v=>setSign({...sign,role:v})} placeholder="Head of Human Resources"/></div>
    <Big label="Service Tenure" value={span} sub={`${fmtDate(doj)} → ${fmtDate(lwd)}`} color={span==="—"?S.orange:S.accent}/>
    <Disclaim/>
    <DocFrame status="Relieving letter ready" copyText={copyText}>
      <Letterhead company={co.name} addr={co.addr} right={<><div>Ref: {ref||"—"}</div><div>Date: {fmtDate(date)}</div></>}/>
      <div style={{textAlign:"center",fontSize:15,fontWeight:800,color:"#0F172A",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:18,fontFamily:S.display}}>Relieving Letter</div>
      <div style={D.body}>Dear {(emp.name||"Employee").split(" ")[0]},</div>
      <div style={{...D.body,marginTop:10,marginBottom:12}}>
        This is to confirm that your resignation dated <strong>{fmtDate(resign)}</strong> has been accepted and that you stand relieved from your duties as <strong>{emp.desig||"—"}</strong> (Employee ID: {emp.id||"—"}) in the {emp.dept||"—"} department at the close of business on <strong>{fmtDate(lwd)}</strong>.
      </div>
      <DocMetaRow pairs={[
        ["Employee Name",emp.name||"—"],["Employee ID",emp.id||"—"],
        ["Designation",emp.desig||"—"],["Department",emp.dept||"—"],
        ["Date of Joining",fmtDate(doj)],["Last Working Day",fmtDate(lwd)],
        ["Resignation Accepted",fmtDate(resign)],["Total Service",span],
      ]}/>
      <div style={D.body}>
        {clearance==="yes"
          ?"You have completed all exit formalities, handed over your responsibilities and returned all company property in your possession. No dues remain outstanding on either side as on the date of this letter."
          :"Exit formalities, final settlement and return of company property, where pending, will be processed and communicated to you separately."}
      </div>
      <div style={{...D.body,marginTop:10}}>We thank you for your contribution during your tenure with {co.name||"the company"} and wish {emp.gender==="They"?"them":emp.gender==="She"?"her":"him"} continued success ahead.</div>
      <SignBlock left={{name:sign.name||"—",role:sign.role||"Authorised Signatory",extra:co.name}}/>
      <div style={D.note}>This letter is a formatting aid produced from details entered by the issuer, who is responsible for their accuracy. It is not legal advice.</div>
    </DocFrame>
  </V>);
}

// ─── TOOL: DELIVERY CHALLAN GENERATOR ──────────────────────────
function DeliveryChallanGen(){
  const[cur,setCur]=useState("INR");
  const[from,setFrom]=useState({name:"Acme Traders",addr:"Plot 22, Industrial Area, Phase II\nHyderabad 500055",tax:"36AABCA1234C1ZX"});
  const[to,setTo]=useState({name:"Bluewave Retail Pvt Ltd",addr:"Shop 8, MG Road\nBengaluru 560001",tax:"29AACCB5678D1ZQ"});
  const[no,setNo]=useState("DC-001");
  const[date,setDate]=useState(today());
  const[purpose,setPurpose]=useState("Supply of Goods");
  const[vehicle,setVehicle]=useState("TS09 AB 1234");
  const[mode,setMode]=useState("Road");
  const[remarks,setRemarks]=useState("Goods once dispatched are transported at the consignee's risk.");
  const{rows,setRows,upd,rm}=useRows([
    {desc:"Steel Bracket 40mm",code:"7326",qty:"120",unit:"Pcs",rate:"85"},
    {desc:"Rubber Gasket Set",code:"4016",qty:"40",unit:"Set",rate:"250"},
  ]);
  const totalQty=sumRows(rows,"qty");
  const totalValue=rows.reduce((s,r)=>s+p(r.qty)*p(r.rate),0);
  const copyText=`DELIVERY CHALLAN ${no} — ${fmtDate(date)}\nFrom: ${from.name}\nTo: ${to.name}\nPurpose: ${purpose} · Vehicle: ${vehicle} (${mode})\n\n${rows.map(r=>`${r.desc||"—"} [${r.code||"-"}] ${p(r.qty)} ${r.unit} × ${mny(r.rate,cur)} = ${mny(p(r.qty)*p(r.rate),cur)}`).join("\n")}\n\nTotal quantity: ${fmt(totalQty,2)}\nTotal value: ${mny(totalValue,cur)}`;
  return(<V>
    <G2>
      <Card><Lab>Consignor (From)</Lab>
        <Input value={from.name} onChange={v=>setFrom({...from,name:v})} placeholder="Your business" style={{marginBottom:8}}/>
        <Input value={from.addr} onChange={v=>setFrom({...from,addr:v})} placeholder="Address" multiline rows={2} style={{marginBottom:8}}/>
        <Input value={from.tax} onChange={v=>setFrom({...from,tax:v})} placeholder="GSTIN / Tax ID"/>
      </Card>
      <Card><Lab>Consignee (To)</Lab>
        <Input value={to.name} onChange={v=>setTo({...to,name:v})} placeholder="Recipient" style={{marginBottom:8}}/>
        <Input value={to.addr} onChange={v=>setTo({...to,addr:v})} placeholder="Delivery address" multiline rows={2} style={{marginBottom:8}}/>
        <Input value={to.tax} onChange={v=>setTo({...to,tax:v})} placeholder="GSTIN / Tax ID"/>
      </Card>
    </G2>
    <G3>
      <div><Lab>Challan No.</Lab><Input value={no} onChange={setNo} placeholder="DC-001"/></div>
      <div><Lab>Date</Lab><Input type="date" value={date} onChange={setDate}/></div>
      <Sel label="Currency" value={cur} onChange={setCur} options={CUR_OPTS}/>
    </G3>
    <G3>
      <Sel label="Purpose of Movement" value={purpose} onChange={setPurpose} options={["Supply of Goods","Job Work","Sample / Approval","Stock Transfer","Returnable Goods","Repair & Return","Exhibition"]}/>
      <div><Lab>Vehicle Number</Lab><Input value={vehicle} onChange={setVehicle} placeholder="TS09 AB 1234"/></div>
      <Sel label="Transport Mode" value={mode} onChange={setMode} options={["Road","Rail","Air","Sea","Courier","Hand Delivery"]}/>
    </G3>
    <Lab>Items</Lab>
    <RowsEditor rows={rows} upd={upd} rm={rm} add={()=>setRows(r=>[...r,{desc:"",code:"",qty:"1",unit:"Pcs",rate:"0"}])}
      cols={[{f:"desc",label:"Description",flex:3,ph:"Item"},{f:"code",label:"HSN / Code",flex:1,ph:"7326"},{f:"qty",label:"Qty",flex:1,ph:"1"},{f:"unit",label:"Unit",flex:1,ph:"Pcs"},{f:"rate",label:"Rate",flex:1,ph:"0"}]}
      addLabel="+ Add Item"/>
    <G2>
      <Big label="Total Quantity" value={fmt(totalQty,2)} sub="units dispatched"/>
      <Big label="Total Value of Goods" value={mny(totalValue,cur)} color={S.green}/>
    </G2>
    <div><Lab>Remarks</Lab><Input value={remarks} onChange={setRemarks} placeholder="Transport terms, handling notes..." multiline rows={2}/></div>
    <DocFrame status={`Challan ready · ${mny(totalValue,cur)}`} copyText={copyText}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:20,borderBottom:"3px solid #059669",paddingBottom:14,marginBottom:18}}>
        <div>
          <div style={D.head}>{from.name||"Your Business"}</div>
          {from.addr&&<div style={{...D.sub,marginTop:3,maxWidth:300}}>{from.addr}</div>}
          {from.tax&&<div style={{fontSize:11,color:"#64748B",marginTop:3}}>Tax ID: {from.tax}</div>}
        </div>
        <div style={{textAlign:"right"}}>
          <div style={D.title}>DELIVERY CHALLAN</div>
          <div style={{fontSize:12,color:"#64748B",marginTop:4}}>No. {no||"—"}</div>
          <div style={{fontSize:12,color:"#64748B"}}>Date: {fmtDate(date)}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:24,marginBottom:16}}>
        <div style={{flex:1}}>
          <div style={D.cap}>Consignee</div>
          <div style={{fontSize:13,fontWeight:700,color:"#0F172A",marginTop:3}}>{to.name||"—"}</div>
          {to.addr&&<div style={D.sub}>{to.addr}</div>}
          {to.tax&&<div style={{fontSize:11,color:"#64748B"}}>Tax ID: {to.tax}</div>}
        </div>
        <div style={{flex:1}}>
          <div style={D.cap}>Dispatch Details</div>
          <div style={{fontSize:12,color:"#475569",marginTop:3,lineHeight:1.8}}>
            <div>Purpose: <strong style={{color:"#1E293B"}}>{purpose}</strong></div>
            <div>Vehicle No.: {vehicle||"—"}</div>
            <div>Mode: {mode}</div>
          </div>
        </div>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:14}}>
        <thead><tr>
          <th style={{...D.th,width:28}}>#</th><th style={D.th}>Description</th><th style={D.th}>HSN / Code</th>
          <th style={D.thR}>Qty</th><th style={D.th}>Unit</th><th style={D.thR}>Rate</th><th style={D.thR}>Value</th>
        </tr></thead>
        <tbody>
          {rows.map((r,i)=><tr key={i} style={D.row}>
            <td style={{...D.td,color:"#94A3B8"}}>{i+1}</td>
            <td style={D.td}>{r.desc||"—"}</td>
            <td style={{...D.td,fontFamily:S.mono,fontSize:11.5}}>{r.code||"—"}</td>
            <td style={D.tdR}>{fmt(p(r.qty),2)}</td>
            <td style={D.td}>{r.unit||"—"}</td>
            <td style={D.tdR}>{mny(r.rate,cur)}</td>
            <td style={{...D.tdR,fontWeight:700}}>{mny(p(r.qty)*p(r.rate),cur)}</td>
          </tr>)}
          <tr style={{background:"#F8FAFC"}}>
            <td style={D.td} colSpan={3}><strong>Total</strong></td>
            <td style={{...D.tdR,fontWeight:800}}>{fmt(totalQty,2)}</td>
            <td style={D.td}></td><td style={D.td}></td>
            <td style={{...D.tdR,fontWeight:800,color:"#059669"}}>{mny(totalValue,cur)}</td>
          </tr>
        </tbody>
      </table>
      <div style={{fontSize:12,color:"#475569",marginBottom:6}}>Value in words: <strong>{amountWords(totalValue,cur)}</strong></div>
      {remarks&&<div style={{marginTop:10,padding:"10px 14px",background:"#F8FAFC",borderRadius:6,fontSize:11.5,color:"#475569"}}>{remarks}</div>}
      <SignBlock left={{name:"Receiver's Signature",role:"Goods received in good condition"}} right={{name:from.name||"Consignor",role:"Authorised Signatory"}}/>
      <div style={D.note}>A delivery challan records the movement of goods and is not a tax invoice. Issue the applicable invoice separately.</div>
    </DocFrame>
  </V>);
}

// ─── SHARED: CREDIT / DEBIT NOTE ───────────────────────────────
function NoteGen({kind}){
  const isCredit=kind==="credit";
  const[cur,setCur]=useState("INR");
  const[from,setFrom]=useState({name:"Acme Traders",addr:"Plot 22, Industrial Area, Phase II\nHyderabad 500055",tax:"36AABCA1234C1ZX"});
  const[to,setTo]=useState({name:"Bluewave Retail Pvt Ltd",addr:"Shop 8, MG Road\nBengaluru 560001",tax:"29AACCB5678D1ZQ"});
  const[no,setNo]=useState(isCredit?"CN-001":"DN-001");
  const[date,setDate]=useState(today());
  const[invNo,setInvNo]=useState("INV-2026-114");
  const[invDate,setInvDate]=useState("");
  const[reason,setReason]=useState(isCredit?"Goods returned by the customer — 6 units found damaged in transit.":"Freight and handling charges omitted from the original invoice.");
  const[taxRate,setTaxRate]=useState("18");
  const{rows,setRows,upd,rm}=useRows([
    {desc:isCredit?"Steel Bracket 40mm (returned)":"Freight & handling",qty:isCredit?"6":"1",rate:isCredit?"85":"2400"},
  ]);
  const sub=rows.reduce((s,r)=>s+p(r.qty)*p(r.rate),0);
  const tax=sub*p(taxRate)/100;
  const total=sub+tax;
  const label=isCredit?"CREDIT NOTE":"DEBIT NOTE";
  const verb=isCredit?"credited to":"debited to";
  const copyText=`${label} ${no} — ${fmtDate(date)}\nFrom: ${from.name}\nTo: ${to.name}\nAgainst Invoice: ${invNo} dated ${fmtDate(invDate)}\nReason: ${reason}\n\n${rows.map(r=>`${r.desc||"—"} ${p(r.qty)} × ${mny(r.rate,cur)} = ${mny(p(r.qty)*p(r.rate),cur)}`).join("\n")}\nSubtotal: ${mny(sub,cur)}\nTax (${p(taxRate)}%): ${mny(tax,cur)}\nTotal ${isCredit?"credit":"debit"}: ${mny(total,cur)}\n(${amountWords(total,cur)})`;
  return(<V>
    <G2>
      <Card><Lab>{isCredit?"Issued By (Supplier)":"Issued By"}</Lab>
        <Input value={from.name} onChange={v=>setFrom({...from,name:v})} placeholder="Your business" style={{marginBottom:8}}/>
        <Input value={from.addr} onChange={v=>setFrom({...from,addr:v})} placeholder="Address" multiline rows={2} style={{marginBottom:8}}/>
        <Input value={from.tax} onChange={v=>setFrom({...from,tax:v})} placeholder="GSTIN / Tax ID"/>
      </Card>
      <Card><Lab>{isCredit?"Issued To (Customer)":"Issued To"}</Lab>
        <Input value={to.name} onChange={v=>setTo({...to,name:v})} placeholder="Counterparty" style={{marginBottom:8}}/>
        <Input value={to.addr} onChange={v=>setTo({...to,addr:v})} placeholder="Address" multiline rows={2} style={{marginBottom:8}}/>
        <Input value={to.tax} onChange={v=>setTo({...to,tax:v})} placeholder="GSTIN / Tax ID"/>
      </Card>
    </G2>
    <G3>
      <div><Lab>{isCredit?"Credit Note No.":"Debit Note No."}</Lab><Input value={no} onChange={setNo} placeholder={isCredit?"CN-001":"DN-001"}/></div>
      <div><Lab>Note Date</Lab><Input type="date" value={date} onChange={setDate}/></div>
      <Sel label="Currency" value={cur} onChange={setCur} options={CUR_OPTS}/>
    </G3>
    <G3>
      <div><Lab>Original Invoice No.</Lab><Input value={invNo} onChange={setInvNo} placeholder="INV-2026-114"/></div>
      <div><Lab>Original Invoice Date</Lab><Input type="date" value={invDate} onChange={setInvDate}/></div>
      <NumInput label="Tax Rate (%)" value={taxRate} onChange={setTaxRate} placeholder="18"/>
    </G3>
    <div><Lab>Reason for {isCredit?"Credit":"Debit"}</Lab><Input value={reason} onChange={setReason} placeholder="Why is this note being raised?" multiline rows={2}/></div>
    <Lab>Line Items</Lab>
    <RowsEditor rows={rows} upd={upd} rm={rm} add={()=>setRows(r=>[...r,{desc:"",qty:"1",rate:"0"}])}
      cols={[{f:"desc",label:"Description",flex:3,ph:"Item or charge"},{f:"qty",label:"Qty",flex:1,ph:"1"},{f:"rate",label:"Rate",flex:1,ph:"0"}]}
      addLabel="+ Add Line"/>
    <G3>
      <Big label="Subtotal" value={mny(sub,cur)}/>
      <Big label={`Tax (${fmt(p(taxRate))}%)`} value={mny(tax,cur)} color={S.blue}/>
      <Big label={`Total ${isCredit?"Credit":"Debit"}`} value={mny(total,cur)} color={isCredit?S.green:S.orange}/>
    </G3>
    <DocFrame status={`${isCredit?"Credit":"Debit"} note ready · ${mny(total,cur)}`} copyText={copyText}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:20,borderBottom:"3px solid #059669",paddingBottom:14,marginBottom:18}}>
        <div>
          <div style={D.head}>{from.name||"Your Business"}</div>
          {from.addr&&<div style={{...D.sub,marginTop:3,maxWidth:300}}>{from.addr}</div>}
          {from.tax&&<div style={{fontSize:11,color:"#64748B",marginTop:3}}>Tax ID: {from.tax}</div>}
        </div>
        <div style={{textAlign:"right"}}>
          <div style={D.title}>{label}</div>
          <div style={{fontSize:12,color:"#64748B",marginTop:4}}>No. {no||"—"}</div>
          <div style={{fontSize:12,color:"#64748B"}}>Date: {fmtDate(date)}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:24,marginBottom:16}}>
        <div style={{flex:1}}>
          <div style={D.cap}>{isCredit?"Credit To":"Debit To"}</div>
          <div style={{fontSize:13,fontWeight:700,color:"#0F172A",marginTop:3}}>{to.name||"—"}</div>
          {to.addr&&<div style={D.sub}>{to.addr}</div>}
          {to.tax&&<div style={{fontSize:11,color:"#64748B"}}>Tax ID: {to.tax}</div>}
        </div>
        <div style={{flex:1}}>
          <div style={D.cap}>Against Original Invoice</div>
          <div style={{fontSize:12,color:"#475569",marginTop:3,lineHeight:1.8}}>
            <div>Invoice No.: <strong style={{color:"#1E293B"}}>{invNo||"—"}</strong></div>
            <div>Invoice Date: {fmtDate(invDate)}</div>
          </div>
        </div>
      </div>
      {reason&&<div style={{marginBottom:14,padding:"10px 14px",background:"#F8FAFC",borderRadius:6,fontSize:12,color:"#475569"}}><strong style={{color:"#1E293B"}}>Reason: </strong>{reason}</div>}
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:14}}>
        <thead><tr>
          <th style={{...D.th,width:28}}>#</th><th style={D.th}>Description</th>
          <th style={D.thR}>Qty</th><th style={D.thR}>Rate</th><th style={D.thR}>Amount</th>
        </tr></thead>
        <tbody>{rows.map((r,i)=><tr key={i} style={D.row}>
          <td style={{...D.td,color:"#94A3B8"}}>{i+1}</td>
          <td style={D.td}>{r.desc||"—"}</td>
          <td style={D.tdR}>{fmt(p(r.qty),2)}</td>
          <td style={D.tdR}>{mny(r.rate,cur)}</td>
          <td style={{...D.tdR,fontWeight:700}}>{mny(p(r.qty)*p(r.rate),cur)}</td>
        </tr>)}</tbody>
      </table>
      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <div style={{minWidth:240}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #E2E8F0",fontSize:12.5,color:"#64748B"}}><span>Subtotal</span><span style={{fontWeight:600,color:"#1E293B"}}>{mny(sub,cur)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #E2E8F0",fontSize:12.5,color:"#64748B"}}><span>Tax ({fmt(p(taxRate))}%)</span><span style={{fontWeight:600,color:"#1E293B"}}>{mny(tax,cur)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontSize:16,fontWeight:800,color:"#059669"}}><span>Total {isCredit?"Credit":"Debit"}</span><span>{mny(total,cur)}</span></div>
        </div>
      </div>
      <div style={{fontSize:12,color:"#475569",marginTop:4}}>Amount in words: <strong>{amountWords(total,cur)}</strong></div>
      <div style={{...D.body,marginTop:12,fontSize:12}}>The above amount has been {verb} the account of {to.name||"the counterparty"} against the referenced invoice.</div>
      <SignBlock right={{name:from.name||"Issuer",role:"Authorised Signatory"}}/>
      <div style={D.note}>This note formats the figures you entered. Confirm the tax treatment of the adjustment with your accountant before filing.</div>
    </DocFrame>
  </V>);
}
function CreditNoteGen(){return <NoteGen kind="credit"/>;}
function DebitNoteGen(){return <NoteGen kind="debit"/>;}

// ─── TOOL: PROFORMA INVOICE GENERATOR ──────────────────────────
function ProformaInvoiceGen(){
  const[cur,setCur]=useState("INR");
  const[from,setFrom]=useState({name:"Acme Traders",addr:"Plot 22, Industrial Area, Phase II\nHyderabad 500055",tax:"36AABCA1234C1ZX"});
  const[to,setTo]=useState({name:"Bluewave Retail Pvt Ltd",addr:"Shop 8, MG Road\nBengaluru 560001",tax:"29AACCB5678D1ZQ"});
  const[no,setNo]=useState("PI-2026-001");
  const[date,setDate]=useState(today());
  const[valid,setValid]=useState("");
  const[taxRate,setTaxRate]=useState("18");
  const[shipping,setShipping]=useState("1500");
  const[terms,setTerms]=useState("50% advance with the purchase order, balance before dispatch. Delivery within 10 working days of confirmed payment.");
  const[bank,setBank]=useState("Acme Traders · HDFC Bank, Madhapur\nA/C 50200012345678 · IFSC HDFC0001234");
  const{rows,setRows,upd,rm}=useRows([
    {desc:"Steel Bracket 40mm",qty:"200",rate:"85"},
    {desc:"Rubber Gasket Set",qty:"60",rate:"250"},
  ]);
  const sub=rows.reduce((s,r)=>s+p(r.qty)*p(r.rate),0);
  const tax=sub*p(taxRate)/100;
  const ship=p(shipping);
  const total=sub+tax+ship;
  const copyText=`PROFORMA INVOICE ${no} — ${fmtDate(date)}\nFrom: ${from.name}\nTo: ${to.name}\n\n${rows.map(r=>`${r.desc||"—"} ${p(r.qty)} × ${mny(r.rate,cur)} = ${mny(p(r.qty)*p(r.rate),cur)}`).join("\n")}\nSubtotal: ${mny(sub,cur)}\nTax (${p(taxRate)}%): ${mny(tax,cur)}\nShipping: ${mny(ship,cur)}\nTotal: ${mny(total,cur)}\n(${amountWords(total,cur)})\n\nValid until: ${fmtDate(valid)}\nTerms: ${terms}`;
  return(<V>
    <G2>
      <Card><Lab>Seller</Lab>
        <Input value={from.name} onChange={v=>setFrom({...from,name:v})} placeholder="Your business" style={{marginBottom:8}}/>
        <Input value={from.addr} onChange={v=>setFrom({...from,addr:v})} placeholder="Address" multiline rows={2} style={{marginBottom:8}}/>
        <Input value={from.tax} onChange={v=>setFrom({...from,tax:v})} placeholder="GSTIN / Tax ID"/>
      </Card>
      <Card><Lab>Buyer</Lab>
        <Input value={to.name} onChange={v=>setTo({...to,name:v})} placeholder="Buyer" style={{marginBottom:8}}/>
        <Input value={to.addr} onChange={v=>setTo({...to,addr:v})} placeholder="Address" multiline rows={2} style={{marginBottom:8}}/>
        <Input value={to.tax} onChange={v=>setTo({...to,tax:v})} placeholder="GSTIN / Tax ID"/>
      </Card>
    </G2>
    <G3>
      <div><Lab>Proforma No.</Lab><Input value={no} onChange={setNo} placeholder="PI-2026-001"/></div>
      <div><Lab>Date</Lab><Input type="date" value={date} onChange={setDate}/></div>
      <div><Lab>Valid Until</Lab><Input type="date" value={valid} onChange={setValid}/></div>
    </G3>
    <Lab>Line Items</Lab>
    <RowsEditor rows={rows} upd={upd} rm={rm} add={()=>setRows(r=>[...r,{desc:"",qty:"1",rate:"0"}])}
      cols={[{f:"desc",label:"Description",flex:3,ph:"Goods or service"},{f:"qty",label:"Qty",flex:1,ph:"1"},{f:"rate",label:"Rate",flex:1,ph:"0"}]}
      addLabel="+ Add Line Item"/>
    <G3>
      <Sel label="Currency" value={cur} onChange={setCur} options={CUR_OPTS}/>
      <NumInput label="Tax Rate (%)" value={taxRate} onChange={setTaxRate} placeholder="18"/>
      <NumInput label="Shipping / Handling" value={shipping} onChange={setShipping} placeholder="0"/>
    </G3>
    <G2>
      <div><Lab>Payment Terms</Lab><Input value={terms} onChange={setTerms} placeholder="Advance, delivery window..." multiline rows={3}/></div>
      <div><Lab>Bank Details</Lab><Input value={bank} onChange={setBank} placeholder="Bank name, account number, IFSC/SWIFT" multiline rows={3}/></div>
    </G2>
    <Big label="Proforma Total" value={mny(total,cur)} sub={amountWords(total,cur)} color={S.green}/>
    <DocFrame status={`Proforma ready · ${mny(total,cur)}`} copyText={copyText}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:20,borderBottom:"3px solid #059669",paddingBottom:14,marginBottom:18}}>
        <div>
          <div style={D.head}>{from.name||"Your Business"}</div>
          {from.addr&&<div style={{...D.sub,marginTop:3,maxWidth:300}}>{from.addr}</div>}
          {from.tax&&<div style={{fontSize:11,color:"#64748B",marginTop:3}}>Tax ID: {from.tax}</div>}
        </div>
        <div style={{textAlign:"right"}}>
          <div style={D.title}>PROFORMA INVOICE</div>
          <div style={{fontSize:12,color:"#64748B",marginTop:4}}>No. {no||"—"}</div>
          <div style={{fontSize:12,color:"#64748B"}}>Date: {fmtDate(date)}</div>
          {valid&&<div style={{fontSize:12,color:"#64748B"}}>Valid until: {fmtDate(valid)}</div>}
        </div>
      </div>
      <div style={{marginBottom:16}}>
        <div style={D.cap}>Buyer</div>
        <div style={{fontSize:13,fontWeight:700,color:"#0F172A",marginTop:3}}>{to.name||"—"}</div>
        {to.addr&&<div style={D.sub}>{to.addr}</div>}
        {to.tax&&<div style={{fontSize:11,color:"#64748B"}}>Tax ID: {to.tax}</div>}
      </div>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:14}}>
        <thead><tr>
          <th style={{...D.th,width:28}}>#</th><th style={D.th}>Description</th>
          <th style={D.thR}>Qty</th><th style={D.thR}>Rate</th><th style={D.thR}>Amount</th>
        </tr></thead>
        <tbody>{rows.map((r,i)=><tr key={i} style={D.row}>
          <td style={{...D.td,color:"#94A3B8"}}>{i+1}</td>
          <td style={D.td}>{r.desc||"—"}</td>
          <td style={D.tdR}>{fmt(p(r.qty),2)}</td>
          <td style={D.tdR}>{mny(r.rate,cur)}</td>
          <td style={{...D.tdR,fontWeight:700}}>{mny(p(r.qty)*p(r.rate),cur)}</td>
        </tr>)}</tbody>
      </table>
      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <div style={{minWidth:250}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #E2E8F0",fontSize:12.5,color:"#64748B"}}><span>Subtotal</span><span style={{fontWeight:600,color:"#1E293B"}}>{mny(sub,cur)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #E2E8F0",fontSize:12.5,color:"#64748B"}}><span>Tax ({fmt(p(taxRate))}%)</span><span style={{fontWeight:600,color:"#1E293B"}}>{mny(tax,cur)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #E2E8F0",fontSize:12.5,color:"#64748B"}}><span>Shipping / Handling</span><span style={{fontWeight:600,color:"#1E293B"}}>{mny(ship,cur)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontSize:16,fontWeight:800,color:"#059669"}}><span>Total</span><span>{mny(total,cur)}</span></div>
        </div>
      </div>
      <div style={{fontSize:12,color:"#475569",marginTop:4,marginBottom:12}}>Amount in words: <strong>{amountWords(total,cur)}</strong></div>
      <div style={{display:"flex",gap:24}}>
        {terms&&<div style={{flex:1}}><div style={D.cap}>Payment Terms</div><div style={{fontSize:11.5,color:"#475569",lineHeight:1.7,marginTop:4,whiteSpace:"pre-wrap"}}>{terms}</div></div>}
        {bank&&<div style={{flex:1}}><div style={D.cap}>Bank Details</div><div style={{fontSize:11.5,color:"#475569",lineHeight:1.7,marginTop:4,whiteSpace:"pre-wrap"}}>{bank}</div></div>}
      </div>
      <SignBlock right={{name:from.name||"Seller",role:"Authorised Signatory"}}/>
      <div style={D.note}>This is a proforma invoice issued for quotation and advance-payment purposes only. It is not a tax invoice and does not constitute a demand for payment.</div>
    </DocFrame>
  </V>);
}

// ─── TOOL: PETTY CASH VOUCHER GENERATOR ────────────────────────
function PettyCashGen(){
  const[cur,setCur]=useState("INR");
  const[co,setCo]=useState("Acme Technologies Pvt Ltd");
  const[no,setNo]=useState("PCV-014");
  const[date,setDate]=useState(today());
  const[dept,setDept]=useState("Administration");
  const[payee,setPayee]=useState("Ravi Kumar");
  const[purpose,setPurpose]=useState("Office running expenses for the week");
  const[mode,setMode]=useState("Cash");
  const[float,setFloat]=useState("10000");
  const[approved,setApproved]=useState("Meera Nair");
  const{rows,setRows,upd,rm}=useRows([
    {desc:"Courier charges — client documents",head:"Postage & Courier",amount:"340"},
    {desc:"Stationery — printer paper",head:"Office Supplies",amount:"620"},
    {desc:"Taxi fare — vendor visit",head:"Local Conveyance",amount:"480"},
  ]);
  const total=sumRows(rows,"amount");
  const opening=p(float);
  const balance=opening-total;
  const copyText=`PETTY CASH VOUCHER ${no} — ${fmtDate(date)}\n${co} · ${dept}\nPaid to: ${payee} (${mode})\nPurpose: ${purpose}\n\n${rows.map(r=>`${r.desc||"—"} [${r.head||"-"}] ${mny(r.amount,cur)}`).join("\n")}\n\nTotal: ${mny(total,cur)}\n(${amountWords(total,cur)})\nOpening float: ${mny(opening,cur)} · Balance: ${mny(balance,cur)}`;
  return(<V>
    <G2>
      <div><Lab>Company / Office</Lab><Input value={co} onChange={setCo} placeholder="Company name"/></div>
      <div><Lab>Department / Cost Centre</Lab><Input value={dept} onChange={setDept} placeholder="Administration"/></div>
    </G2>
    <G3>
      <div><Lab>Voucher No.</Lab><Input value={no} onChange={setNo} placeholder="PCV-014"/></div>
      <div><Lab>Date</Lab><Input type="date" value={date} onChange={setDate}/></div>
      <Sel label="Currency" value={cur} onChange={setCur} options={CUR_OPTS}/>
    </G3>
    <G3>
      <div><Lab>Paid To</Lab><Input value={payee} onChange={setPayee} placeholder="Person receiving cash"/></div>
      <Sel label="Payment Mode" value={mode} onChange={setMode} options={["Cash","UPI","Cheque","Bank Transfer","Card"]}/>
      <NumInput label="Opening Cash Float" value={float} onChange={setFloat} placeholder="10000"/>
    </G3>
    <div><Lab>Purpose</Lab><Input value={purpose} onChange={setPurpose} placeholder="What was the cash spent on?"/></div>
    <Lab>Expense Lines</Lab>
    <RowsEditor rows={rows} upd={upd} rm={rm} add={()=>setRows(r=>[...r,{desc:"",head:"",amount:"0"}])}
      cols={[{f:"desc",label:"Description",flex:3,ph:"What was paid for"},{f:"head",label:"Account Head",flex:2,ph:"Office Supplies"},{f:"amount",label:"Amount",flex:1,ph:"0"}]}
      addLabel="+ Add Expense Line"/>
    <G3>
      <Big label="Voucher Total" value={mny(total,cur)} color={S.accent}/>
      <Big label="Opening Float" value={mny(opening,cur)} color={S.blue}/>
      <Big label="Cash Balance" value={mny(balance,cur)} color={balance>=0?S.green:S.red} sub={balance<0?"exceeds the float":"remaining in the box"}/>
    </G3>
    <div><Lab>Approved By</Lab><Input value={approved} onChange={setApproved} placeholder="Approver name"/></div>
    <DocFrame status={`Voucher ready · ${mny(total,cur)}`} copyText={copyText}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:20,borderBottom:"3px solid #059669",paddingBottom:14,marginBottom:18}}>
        <div>
          <div style={D.head}>{co||"Your Company"}</div>
          <div style={{...D.sub,marginTop:3}}>{dept||"—"}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={D.title}>PETTY CASH VOUCHER</div>
          <div style={{fontSize:12,color:"#64748B",marginTop:4}}>No. {no||"—"}</div>
          <div style={{fontSize:12,color:"#64748B"}}>Date: {fmtDate(date)}</div>
        </div>
      </div>
      <DocMetaRow pairs={[
        ["Paid To",payee||"—"],["Payment Mode",mode],
        ["Department",dept||"—"],["Purpose",purpose||"—"],
      ]}/>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:14}}>
        <thead><tr>
          <th style={{...D.th,width:28}}>#</th><th style={D.th}>Description</th><th style={D.th}>Account Head</th><th style={D.thR}>Amount</th>
        </tr></thead>
        <tbody>
          {rows.map((r,i)=><tr key={i} style={D.row}>
            <td style={{...D.td,color:"#94A3B8"}}>{i+1}</td>
            <td style={D.td}>{r.desc||"—"}</td>
            <td style={D.td}>{r.head||"—"}</td>
            <td style={{...D.tdR,fontWeight:700}}>{mny(r.amount,cur)}</td>
          </tr>)}
          <tr style={{background:"#ECFDF5"}}>
            <td style={D.td} colSpan={3}><strong style={{color:"#059669"}}>Total Paid</strong></td>
            <td style={{...D.tdR,fontWeight:800,color:"#059669"}}>{mny(total,cur)}</td>
          </tr>
        </tbody>
      </table>
      <div style={{fontSize:12,color:"#475569",marginBottom:8}}>Amount in words: <strong>{amountWords(total,cur)}</strong></div>
      <div style={{display:"flex",gap:20,fontSize:11.5,color:"#475569",padding:"10px 14px",background:"#F8FAFC",borderRadius:6}}>
        <span>Opening float: <strong style={{color:"#1E293B"}}>{mny(opening,cur)}</strong></span>
        <span>This voucher: <strong style={{color:"#1E293B"}}>{mny(total,cur)}</strong></span>
        <span>Balance in hand: <strong style={{color:balance>=0?"#059669":"#DC2626"}}>{mny(balance,cur)}</strong></span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",gap:16,marginTop:38}}>
        {[["Received By",payee],["Paid By","Cashier"],["Approved By",approved]].map(([l,v])=>(
          <div key={l} style={{flex:1,fontSize:10.5,color:"#64748B",textAlign:"center"}}>
            <div style={{borderTop:"1px solid #CBD5E1",paddingTop:6}}>
              <div style={{fontWeight:700,color:"#1E293B",fontSize:11.5}}>{v||"—"}</div>
              <div>{l}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={D.note}>Attach the original bill or receipt to this voucher and file it in voucher-number order.</div>
    </DocFrame>
  </V>);
}

// ─── TOOL: PROFIT & LOSS STATEMENT GENERATOR ───────────────────
function ProfitLossGen(){
  const[cur,setCur]=useState("INR");
  const[biz,setBiz]=useState("Acme Technologies Pvt Ltd");
  const[period,setPeriod]=useState("Financial Year 2025-26");
  const rev=useRows([{label:"Product Sales",amount:"4200000"},{label:"Service Revenue",amount:"1350000"}]);
  const cogs=useRows([{label:"Raw Materials",amount:"1450000"},{label:"Direct Labour",amount:"680000"},{label:"Freight Inward",amount:"120000"}]);
  const opex=useRows([{label:"Salaries & Wages",amount:"1400000"},{label:"Rent",amount:"360000"},{label:"Marketing",amount:"280000"},{label:"Utilities & Internet",amount:"96000"},{label:"Depreciation",amount:"150000"}]);
  const[otherInc,setOtherInc]=useState("40000");
  const[otherExp,setOtherExp]=useState("85000");
  const[taxRate,setTaxRate]=useState("25");
  const totalRev=sumRows(rev.rows,"amount");
  const totalCogs=sumRows(cogs.rows,"amount");
  const grossProfit=totalRev-totalCogs;
  const totalOpex=sumRows(opex.rows,"amount");
  const ebit=grossProfit-totalOpex;
  const pbt=ebit+p(otherInc)-p(otherExp);
  const taxAmt=pbt>0?pbt*p(taxRate)/100:0;
  const netProfit=pbt-taxAmt;
  const pct=(v)=>totalRev>0?`${fmt(v/totalRev*100,1)}%`:"—";
  const copyText=`PROFIT & LOSS STATEMENT\n${biz} · ${period}\n\nRevenue: ${mny(totalRev,cur)}\nCost of Goods Sold: ${mny(totalCogs,cur)}\nGross Profit: ${mny(grossProfit,cur)} (${pct(grossProfit)})\nOperating Expenses: ${mny(totalOpex,cur)}\nOperating Profit (EBIT): ${mny(ebit,cur)} (${pct(ebit)})\nOther income: ${mny(p(otherInc),cur)} · Other expenses: ${mny(p(otherExp),cur)}\nProfit Before Tax: ${mny(pbt,cur)}\nTax @ ${p(taxRate)}%: ${mny(taxAmt,cur)}\nNET PROFIT: ${mny(netProfit,cur)} (${pct(netProfit)})`;
  const Section=({title,rows,total})=>(<>
    <tr style={{background:"#F8FAFC"}}><td style={{...D.td,fontWeight:800}} colSpan={2}>{title}</td><td style={D.tdR}></td></tr>
    {rows.map((r,i)=><tr key={i} style={D.row}><td style={{...D.td,paddingLeft:24}} colSpan={2}>{r.label||"—"}</td><td style={D.tdR}>{mny(r.amount,cur)}</td></tr>)}
    <tr style={D.row}><td style={{...D.td,fontWeight:700}} colSpan={2}>Total {title}</td><td style={{...D.tdR,fontWeight:700}}>{mny(total,cur)}</td></tr>
  </>);
  return(<V>
    <G3>
      <div><Lab>Business Name</Lab><Input value={biz} onChange={setBiz} placeholder="Business name"/></div>
      <div><Lab>Reporting Period</Lab><Input value={period} onChange={setPeriod} placeholder="Financial Year 2025-26"/></div>
      <Sel label="Currency" value={cur} onChange={setCur} options={CUR_OPTS}/>
    </G3>
    <Card><Lab>Revenue</Lab><RowsEditor rows={rev.rows} upd={rev.upd} rm={rev.rm} add={()=>rev.setRows(r=>[...r,{label:"",amount:"0"}])} cols={[{f:"label",label:"Line",flex:3,ph:"Revenue stream"},{f:"amount",label:"Amount",flex:1,ph:"0"}]} addLabel="+ Add Revenue Line"/></Card>
    <Card><Lab>Cost of Goods Sold</Lab><RowsEditor rows={cogs.rows} upd={cogs.upd} rm={cogs.rm} add={()=>cogs.setRows(r=>[...r,{label:"",amount:"0"}])} cols={[{f:"label",label:"Line",flex:3,ph:"Direct cost"},{f:"amount",label:"Amount",flex:1,ph:"0"}]} addLabel="+ Add COGS Line"/></Card>
    <Card><Lab>Operating Expenses</Lab><RowsEditor rows={opex.rows} upd={opex.upd} rm={opex.rm} add={()=>opex.setRows(r=>[...r,{label:"",amount:"0"}])} cols={[{f:"label",label:"Line",flex:3,ph:"Operating expense"},{f:"amount",label:"Amount",flex:1,ph:"0"}]} addLabel="+ Add Expense Line"/></Card>
    <G3>
      <NumInput label="Other Income" value={otherInc} onChange={setOtherInc} placeholder="0"/>
      <NumInput label="Other Expenses" value={otherExp} onChange={setOtherExp} placeholder="0"/>
      <NumInput label="Tax Rate (%)" value={taxRate} onChange={setTaxRate} placeholder="25"/>
    </G3>
    <G3>
      <Big label="Gross Profit" value={mny(grossProfit,cur)} sub={`Gross margin ${pct(grossProfit)}`} color={grossProfit>=0?S.green:S.red}/>
      <Big label="Operating Profit (EBIT)" value={mny(ebit,cur)} sub={`Operating margin ${pct(ebit)}`} color={ebit>=0?S.blue:S.red}/>
      <Big label="Net Profit" value={mny(netProfit,cur)} sub={`Net margin ${pct(netProfit)}`} color={netProfit>=0?S.accent:S.red}/>
    </G3>
    {totalRev===0&&<div style={{padding:16,background:S.accentLight,borderRadius:8,color:S.muted,fontSize:14,textAlign:"center"}}>Add at least one revenue line to see margins</div>}
    <Disclaim>This statement is a formatting and arithmetic aid only. You are responsible for the accuracy and classification of every figure entered, and this output is not tax, legal or accounting advice. Have a qualified accountant review it before filing or sharing it with lenders.</Disclaim>
    <DocFrame status={`P&L ready · Net ${mny(netProfit,cur)}`} copyText={copyText}>
      <div style={{textAlign:"center",borderBottom:"3px solid #059669",paddingBottom:14,marginBottom:18}}>
        <div style={D.head}>{biz||"Your Business"}</div>
        <div style={{...D.title,fontSize:16,marginTop:6}}>PROFIT &amp; LOSS STATEMENT</div>
        <div style={{fontSize:12,color:"#64748B",marginTop:2}}>{period||"Reporting period"}</div>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:14}}>
        <thead><tr><th style={D.th} colSpan={2}>Particulars</th><th style={{...D.thR,width:150}}>Amount</th></tr></thead>
        <tbody>
          <Section title="Revenue" rows={rev.rows} total={totalRev}/>
          <Section title="Cost of Goods Sold" rows={cogs.rows} total={totalCogs}/>
          <tr style={{background:"#ECFDF5"}}><td style={{...D.td,fontWeight:800,color:"#059669"}} colSpan={2}>Gross Profit ({pct(grossProfit)})</td><td style={{...D.tdR,fontWeight:800,color:"#059669"}}>{mny(grossProfit,cur)}</td></tr>
          <Section title="Operating Expenses" rows={opex.rows} total={totalOpex}/>
          <tr style={{background:"#EFF6FF"}}><td style={{...D.td,fontWeight:800,color:"#1D4ED8"}} colSpan={2}>Operating Profit / EBIT ({pct(ebit)})</td><td style={{...D.tdR,fontWeight:800,color:"#1D4ED8"}}>{mny(ebit,cur)}</td></tr>
          <tr style={D.row}><td style={D.td} colSpan={2}>Add: Other Income</td><td style={D.tdR}>{mny(p(otherInc),cur)}</td></tr>
          <tr style={D.row}><td style={D.td} colSpan={2}>Less: Other Expenses</td><td style={D.tdR}>{mny(p(otherExp),cur)}</td></tr>
          <tr style={D.row}><td style={{...D.td,fontWeight:700}} colSpan={2}>Profit Before Tax</td><td style={{...D.tdR,fontWeight:700}}>{mny(pbt,cur)}</td></tr>
          <tr style={D.row}><td style={D.td} colSpan={2}>Less: Tax @ {fmt(p(taxRate))}%</td><td style={D.tdR}>{mny(taxAmt,cur)}</td></tr>
          <tr style={{background:"#ECFDF5"}}><td style={{...D.td,fontWeight:900,fontSize:13,color:"#059669"}} colSpan={2}>NET PROFIT ({pct(netProfit)})</td><td style={{...D.tdR,fontWeight:900,fontSize:13,color:netProfit>=0?"#059669":"#DC2626"}}>{mny(netProfit,cur)}</td></tr>
        </tbody>
      </table>
      <div style={{fontSize:12,color:"#475569"}}>Net profit in words: <strong>{amountWords(netProfit,cur)}</strong></div>
      <div style={D.note}>Prepared from figures entered by the user as a formatting aid. The preparer is responsible for their accuracy and classification. Not tax, legal or accounting advice.</div>
    </DocFrame>
  </V>);
}

// ─── TOOL: BALANCE SHEET GENERATOR ─────────────────────────────
function BalanceSheetGen(){
  const[cur,setCur]=useState("INR");
  const[biz,setBiz]=useState("Acme Technologies Pvt Ltd");
  const[asOf,setAsOf]=useState(today());
  const ca=useRows([{label:"Cash & Bank Balances",amount:"850000"},{label:"Accounts Receivable",amount:"620000"},{label:"Inventory",amount:"430000"},{label:"Prepaid Expenses",amount:"75000"}]);
  const nca=useRows([{label:"Property, Plant & Equipment",amount:"2400000"},{label:"Intangible Assets",amount:"320000"},{label:"Long-term Investments",amount:"500000"}]);
  const cl=useRows([{label:"Accounts Payable",amount:"470000"},{label:"Short-term Borrowings",amount:"300000"},{label:"Accrued Expenses",amount:"160000"}]);
  const ncl=useRows([{label:"Long-term Loans",amount:"1500000"},{label:"Deferred Tax Liability",amount:"120000"}]);
  const eq=useRows([{label:"Share Capital",amount:"1000000"},{label:"Retained Earnings",amount:"1645000"}]);
  const tCA=sumRows(ca.rows,"amount"),tNCA=sumRows(nca.rows,"amount");
  const tCL=sumRows(cl.rows,"amount"),tNCL=sumRows(ncl.rows,"amount");
  const tEq=sumRows(eq.rows,"amount");
  const totalAssets=tCA+tNCA;
  const totalLiab=tCL+tNCL;
  const totalLE=totalLiab+tEq;
  const diff=totalAssets-totalLE;
  const balanced=Math.abs(diff)<0.005;
  const workingCap=tCA-tCL;
  const currentRatio=tCL>0?tCA/tCL:null;
  const de=tEq!==0?totalLiab/tEq:null;
  const copyText=`BALANCE SHEET\n${biz} · as at ${fmtDate(asOf)}\n\nCurrent Assets: ${mny(tCA,cur)}\nNon-Current Assets: ${mny(tNCA,cur)}\nTOTAL ASSETS: ${mny(totalAssets,cur)}\n\nCurrent Liabilities: ${mny(tCL,cur)}\nNon-Current Liabilities: ${mny(tNCL,cur)}\nEquity: ${mny(tEq,cur)}\nTOTAL LIABILITIES & EQUITY: ${mny(totalLE,cur)}\n\n${balanced?"Balanced ✓":`Out of balance by ${mny(diff,cur)}`}\nWorking capital: ${mny(workingCap,cur)}\nCurrent ratio: ${currentRatio===null?"—":fmt(currentRatio,2)}\nDebt-to-equity: ${de===null?"—":fmt(de,2)}`;
  const editor=(t,r,ph)=>(<Card><Lab>{t}</Lab><RowsEditor rows={r.rows} upd={r.upd} rm={r.rm} add={()=>r.setRows(x=>[...x,{label:"",amount:"0"}])} cols={[{f:"label",label:"Line",flex:3,ph},{f:"amount",label:"Amount",flex:1,ph:"0"}]} addLabel="+ Add Line"/></Card>);
  const Block=({title,rows,total})=>(<>
    <tr style={{background:"#F8FAFC"}}><td style={{...D.td,fontWeight:800}}>{title}</td><td style={D.tdR}></td></tr>
    {rows.map((r,i)=><tr key={i} style={D.row}><td style={{...D.td,paddingLeft:24}}>{r.label||"—"}</td><td style={D.tdR}>{mny(r.amount,cur)}</td></tr>)}
    <tr style={D.row}><td style={{...D.td,fontWeight:700}}>Total {title}</td><td style={{...D.tdR,fontWeight:700}}>{mny(total,cur)}</td></tr>
  </>);
  return(<V>
    <G3>
      <div><Lab>Business Name</Lab><Input value={biz} onChange={setBiz} placeholder="Business name"/></div>
      <div><Lab>As at Date</Lab><Input type="date" value={asOf} onChange={setAsOf}/></div>
      <Sel label="Currency" value={cur} onChange={setCur} options={CUR_OPTS}/>
    </G3>
    <G2>
      {editor("Current Assets",ca,"Cash, receivables, inventory")}
      {editor("Non-Current Assets",nca,"Equipment, investments")}
    </G2>
    <G2>
      {editor("Current Liabilities",cl,"Payables, short-term loans")}
      {editor("Non-Current Liabilities",ncl,"Long-term loans")}
    </G2>
    {editor("Owner's Equity",eq,"Share capital, retained earnings")}
    <G3>
      <Big label="Total Assets" value={mny(totalAssets,cur)} color={S.blue}/>
      <Big label="Total Liabilities" value={mny(totalLiab,cur)} color={S.orange}/>
      <Big label="Total Equity" value={mny(tEq,cur)} color={S.accent}/>
    </G3>
    {balanced
      ?<div style={{padding:14,background:"rgba(34,197,94,0.1)",borderRadius:8,color:S.green,fontSize:14,textAlign:"center",fontWeight:600}}>✓ Balanced — Assets equal Liabilities plus Equity ({mny(totalAssets,cur)})</div>
      :<div style={{padding:14,background:"rgba(239,68,68,0.1)",borderRadius:8,color:S.red,fontSize:14,textAlign:"center",fontWeight:600}}>⚠️ Out of balance by {mny(Math.abs(diff),cur)} — assets are {diff>0?"higher":"lower"} than liabilities plus equity</div>}
    <G3>
      <Res label="Working Capital" value={mny(workingCap,cur)} mono color={workingCap>=0?S.green:S.red}/>
      <Res label="Current Ratio" value={currentRatio===null?"—":`${fmt(currentRatio,2)}×`} mono color={currentRatio!==null&&currentRatio>=1?S.green:S.orange}/>
      <Res label="Debt-to-Equity" value={de===null?"—":`${fmt(de,2)}×`} mono/>
    </G3>
    <Disclaim>This balance sheet is a formatting and arithmetic aid only. You are responsible for the accuracy and classification of every figure entered, and this output is not tax, legal or accounting advice. Have a qualified accountant review it before it is filed or relied upon.</Disclaim>
    <DocFrame status={balanced?"Balance sheet ready · balanced":`Balance sheet ready · off by ${mny(Math.abs(diff),cur)}`} copyText={copyText}>
      <div style={{textAlign:"center",borderBottom:"3px solid #059669",paddingBottom:14,marginBottom:18}}>
        <div style={D.head}>{biz||"Your Business"}</div>
        <div style={{...D.title,fontSize:16,marginTop:6}}>BALANCE SHEET</div>
        <div style={{fontSize:12,color:"#64748B",marginTop:2}}>As at {fmtDate(asOf)}</div>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:16}}>
        <thead><tr><th style={D.th}>Assets</th><th style={{...D.thR,width:160}}>Amount</th></tr></thead>
        <tbody>
          <Block title="Current Assets" rows={ca.rows} total={tCA}/>
          <Block title="Non-Current Assets" rows={nca.rows} total={tNCA}/>
          <tr style={{background:"#EFF6FF"}}><td style={{...D.td,fontWeight:900,color:"#1D4ED8"}}>TOTAL ASSETS</td><td style={{...D.tdR,fontWeight:900,color:"#1D4ED8"}}>{mny(totalAssets,cur)}</td></tr>
        </tbody>
      </table>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:14}}>
        <thead><tr><th style={D.th}>Liabilities &amp; Equity</th><th style={{...D.thR,width:160}}>Amount</th></tr></thead>
        <tbody>
          <Block title="Current Liabilities" rows={cl.rows} total={tCL}/>
          <Block title="Non-Current Liabilities" rows={ncl.rows} total={tNCL}/>
          <Block title="Owner's Equity" rows={eq.rows} total={tEq}/>
          <tr style={{background:"#ECFDF5"}}><td style={{...D.td,fontWeight:900,color:"#059669"}}>TOTAL LIABILITIES &amp; EQUITY</td><td style={{...D.tdR,fontWeight:900,color:"#059669"}}>{mny(totalLE,cur)}</td></tr>
        </tbody>
      </table>
      <div style={{padding:"10px 14px",borderRadius:6,background:balanced?"#ECFDF5":"#FEF2F2",color:balanced?"#059669":"#DC2626",fontSize:12,fontWeight:700,marginBottom:12}}>
        {balanced?"✓ The balance sheet balances.":`⚠️ Out of balance by ${mny(Math.abs(diff),cur)}. Review the entries before circulating this statement.`}
      </div>
      <div style={{display:"flex",gap:20,fontSize:11.5,color:"#475569",flexWrap:"wrap"}}>
        <span>Working capital: <strong style={{color:"#1E293B"}}>{mny(workingCap,cur)}</strong></span>
        <span>Current ratio: <strong style={{color:"#1E293B"}}>{currentRatio===null?"—":`${fmt(currentRatio,2)}×`}</strong></span>
        <span>Debt-to-equity: <strong style={{color:"#1E293B"}}>{de===null?"—":`${fmt(de,2)}×`}</strong></span>
      </div>
      <div style={D.note}>Prepared from figures entered by the user as a formatting aid. The preparer is responsible for their accuracy and classification. Not tax, legal or accounting advice.</div>
    </DocFrame>
  </V>);
}

// ─── TOOL REGISTRY ─────────────────────────────────────────────
const TOOL_COMPONENTS = {
  "invoice-gen":InvoiceGenerator,"receipt-gen":ReceiptGenerator,"quotation-gen":QuotationGenerator,
  "business-card-gen":BusinessCardGen,"resume-builder":ResumeBuilder,"cover-letter-gen":CoverLetterGen,
  "swot-gen":SwotGen,"marketing-plan-gen":MarketingPlanGen,"persona-gen":PersonaGen,
  "utm-builder":UtmBuilder,"ad-copy-gen":AdCopyGen,"sales-copy-gen":SalesCopyGen,
  "landing-copy-gen":LandingCopyGen,"roi-calculator":RoiCalculator,"break-even-calc":BreakEvenCalc,
  "purchase-order-gen":PurchaseOrderGen,"packing-slip-gen":PackingSlipGen,"timesheet-gen":TimesheetGen,
  "expense-report-gen":ExpenseReportGen,"markup-margin-calc":MarkupMarginCalc,"cagr-calc":CagrCalc,
  "clv-calc":ClvCalc,"business-hours-gen":BusinessHoursGen,"meeting-agenda-gen":MeetingAgendaGen,
  "memo-gen":MemoGen,"press-release-gen":PressReleaseGen,"job-description-gen":JobDescriptionGen,
  "payslip-gen":PayslipGen,"rent-receipt-gen":RentReceiptGen,"salary-certificate-gen":SalaryCertificateGen,
  "offer-letter-gen":OfferLetterGen,"appointment-letter-gen":AppointmentLetterGen,
  "experience-letter-gen":ExperienceLetterGen,"relieving-letter-gen":RelievingLetterGen,
  "delivery-challan-gen":DeliveryChallanGen,"credit-note-gen":CreditNoteGen,"debit-note-gen":DebitNoteGen,
  "proforma-invoice-gen":ProformaInvoiceGen,"petty-cash-gen":PettyCashGen,
  "profit-loss-gen":ProfitLossGen,"balance-sheet-gen":BalanceSheetGen,
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
    else document.title=`${BRAND.name} - ${TOOLS.length} Free Business & Marketing Tools`;
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
