# ToolsRift — 1600+ Free Online Tools

> **Website:** [toolsrift.com](https://toolsrift.com)

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open in browser
http://localhost:3000
```

## 📦 Project Structure

```
toolsrift/
├── pages/                    # Next.js routes
│   ├── index.js              # / → Main tools (calculators etc.)
│   ├── business.js           # /business → Business tools
│   ├── text.js               # /text → Text tools (45)
│   ├── encoders.js           # /encoders → Encoder/Decoder (25)
│   ├── hash.js               # /hash → Hash & Crypto (25)
│   ├── json.js               # /json → JSON tools (25)
│   ├── css.js                # /css → CSS Generators (20)
│   ├── colors.js             # /colors → Color tools (20)
│   ├── units.js              # /units → Unit Converters (25)
│   ├── roadmap.js            # /roadmap → Dev roadmap
│   └── checker.js            # /checker → Tool checker
│
├── components/               # Tool components
│   ├── toolsrift-main.jsx    # Phase 1: Calculators (52) + Core tools (18)
│   ├── toolsrift-business.jsx# Phase 1: Business tools (15)
│   ├── toolsrift-text.jsx    # Batch 2A: Text tools (45)
│   ├── toolsrift-encoders.jsx# Batch 2B: Encoders (25)
│   ├── toolsrift-hash.jsx    # Batch 2C: Hash/Crypto (25)
│   ├── toolsrift-json.jsx    # Batch 2D: JSON tools (25)
│   ├── toolsrift-css.jsx     # Batch 2E: CSS Generators (20)
│   ├── toolsrift-colors.jsx  # Batch 2F: Color tools (20)
│   ├── toolsrift-units.jsx   # Batch 2G: Unit Converters (25)
│   ├── toolsrift-roadmap.jsx # Roadmap dashboard
│   └── tool-checker.jsx      # Tool verification checklist
│
├── public/
│   ├── logo.svg              # Full logo (icon + wordmark)
│   ├── icon.svg              # Icon only (favicon)
│   ├── robots.txt
│   └── site.webmanifest
│
├── styles/
│   └── globals.css
│
├── TOOLSRIFT-ROADMAP.md      # Full roadmap document
├── next.config.js
├── tailwind.config.js
├── package.json
└── .gitignore
```

## 🛠 Tech Stack

- **Framework:** Next.js 14
- **Styling:** Tailwind CSS + inline styles
- **Fonts:** Sora, Plus Jakarta Sans, JetBrains Mono (Google Fonts)
- **Deployment:** Vercel
- **Processing:** 100% client-side (no server needed for tools)

## 📊 Tools Built (270 total)

| Batch | Category | Count | Route |
|-------|----------|-------|-------|
| Phase 1 | Calculators + Core Tools | 70 | `/` |
| Phase 1 | Business Tools | 15 | `/business` |
| 2A | Text Tools | 45 | `/text` |
| 2B | Encoders/Decoders | 25 | `/encoders` |
| 2C | Hash & Crypto | 25 | `/hash` |
| 2D | JSON Tools | 25 | `/json` |
| 2E | CSS Generators | 20 | `/css` |
| 2F | Color Tools | 20 | `/colors` |
| 2G | Unit Converters | 25 | `/units` |
| **Total** | | **270** | |

## 🌐 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set custom domain
# Go to Vercel Dashboard → Project → Settings → Domains → Add toolsrift.com
```

## 🎨 Design System

- **Background:** `#06090F`
- **Surface:** `#0D1117`
- **Blue accent:** `#3B82F6`
- **Text:** `#E2E8F0`
- **Muted:** `#64748B`
- **Border:** `rgba(255,255,255,0.06)`

## 📈 Roadmap

See `TOOLSRIFT-ROADMAP.md` for the full 1600+ tools plan across 6 phases.

**Next up:** Phase 3 — Image Tools (50), PDF Tools (28), HTML Tools (25), JS Tools (10), Code Formatters (25), Fancy Text (20), Text Encoding (11)
