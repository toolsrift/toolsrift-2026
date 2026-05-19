import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';
import CategoryLayout from './shared/CategoryLayout';
import PremiumCategoryLanding from './shared/PremiumCategoryLanding';
import ToolPageLayout, { ToolSchemas } from './shared/ToolPageLayout';

const THEME = getCategoryById("devgen");
const PAGE_THEME = getCategoryById('devgen');
const BRAND = { name: "ToolsRift", tagline: "Developer Config Generators" };

const C = {
bg: "#06090F", surface: "#0D1117", border: "rgba(255,255,255,0.06)",
blue: "#8B5CF6", blueD: "#7C3AED",
text: "#E2E8F0", muted: "#64748B",
success: "#10B981", warn: "#F59E0B", danger: "#EF4444",
};

const GLOBAL_CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px} ::selection{background:rgba(139,92,246,0.3)} button:hover{filter:brightness(1.1)} select option{background:#0D1117} textarea{resize:vertical} .fade-in{animation:fadeIn .25s ease} @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}} .tr-nav-cats{display:flex;gap:4px;align-items:center} .tr-nav-badge{display:inline-flex} @media(max-width:640px){ .tr-nav-cats{display:none!important} .tr-nav-badge{display:none!important} };`;

const T = {
body: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, color:C.text },
mono: { fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
label: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
h1: { fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:C.text },
h2: { fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:C.text },
};

function Badge({ children, color = "blue" }) {
const map = { blue:"rgba(59,130,246,0.15)", green:"rgba(16,185,129,0.15)", amber:"rgba(245,158,11,0.15)", red:"rgba(239,68,68,0.15)" };
const textMap = { blue:"#60A5FA", green:"#34D399", amber:"#FCD34D", red:"#FCA5A5" };
return (
<span style={{ background:map[color]||map.blue, color:textMap[color]||textMap.blue, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
{children}
</span>
);
}

function Btn({ children, onClick, variant="primary", size="md", href, disabled, style={} }) {
const ACCENT = C.blue; const ACCENTD = C.blueD;
const base = { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, border:"none", cursor:disabled?"not-allowed":"pointer", borderRadius:8, fontWeight:600, transition:"all .15s", fontFamily:"'Plus Jakarta Sans',sans-serif", textDecoration:"none", opacity:disabled?0.5:1 };
const sz = { sm:{padding:"6px 14px",fontSize:12}, md:{padding:"9px 20px",fontSize:13}, lg:{padding:"12px 28px",fontSize:14} }[size];
const v = {
primary:{ background:`linear-gradient(135deg,${ACCENT},${ACCENTD})`, color:"#fff", boxShadow:"0 2px 8px rgba(139,92,246,0.25)" },
secondary:{ background:"rgba(255,255,255,0.05)", color:C.text, border:`1px solid ${C.border}` },
ghost:{ background:"transparent", color:C.muted },
danger:{ background:"rgba(239,68,68,0.15)", color:"#FCA5A5" },
}[variant];
const props = { style:{...base,...sz,...v,...style}, onClick, disabled };
if (href) return <a href={href} {...props}>{children}</a>;
return <button {...props}>{children}</button>;
}

function Input({ value, onChange, placeholder, style={} }) {
return (
<input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px", color:C.text, fontSize:13, fontFamily:"'Plus Jakarta Sans',sans-serif", outline:"none", ...style }}
onFocus={e => e.target.style.borderColor=C.blue} onBlur={e => e.target.style.borderColor=C.border} />
);
}

function Textarea({ value, onChange, placeholder, rows=6, mono=false, style={} }) {
return (
<textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:13, fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif", outline:"none", lineHeight:1.6, ...style }}
onFocus={e => e.target.style.borderColor=C.blue} onBlur={e => e.target.style.borderColor=C.border} />
);
}

function SelectInput({ value, onChange, options, style={} }) {
return (
<select value={value} onChange={e => onChange(e.target.value)}
style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 14px", color:C.text, fontSize:13, fontFamily:"'Plus Jakarta Sans',sans-serif", outline:"none", cursor:"pointer", ...style }}>
{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
</select>
);
}

function Card({ children, style={} }) {
return <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20, ...style }}>{children}</div>;
}

function Label({ children }) {
return <div style={{ ...T.label, marginBottom:6 }}>{children}</div>;
}

function Result({ children, mono=true }) {
return (
<div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:13, fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif", lineHeight:1.6, minHeight:40, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
{children}
</div>
);
}

function BigResult({ value, label }) {
return (
<div style={{ textAlign:"center", padding:"20px 16px", background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:10 }}>
<div style={{ fontFamily:"'Sora',sans-serif", fontSize:32, fontWeight:700, color:C.blue }}>{value}</div>
<div style={{ ...T.label, marginTop:4 }}>{label}</div>
</div>
);
}

function CopyBtn({ text, style={} }) {
const [copied, setCopied] = useState(false);
const [errMsg, setErrMsg] = useState(null);
const copy = () => {
navigator.clipboard.writeText(text || "").then(() => {
  setCopied(true); setErrMsg(null); setTimeout(() => setCopied(false), 2000);
}).catch(() => { setErrMsg("Copy failed — please select and copy manually."); setTimeout(() => setErrMsg(null), 3000); });
};
if (errMsg) return <span style={{fontSize:12,color:'#EF4444'}}>{errMsg}</span>;
return (
<Btn variant={copied?"secondary":"ghost"} size="sm" onClick={copy} style={style}>
{copied ? "✓ Copied" : "Copy"}
</Btn>
);
}

function Grid2({ children }) {
return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>{children}</div>;
}

function Grid3({ children }) {
return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>{children}</div>;
}

function VStack({ children, gap=12 }) {
return <div style={{ display:"flex", flexDirection:"column", gap }}>{children}</div>;
}

function StatBox({ value, label }) {
return (
<div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 10px", textAlign:"center" }}>
<div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:700, color:C.blue }}>{value}</div>
<div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{label}</div>
</div>
);
}

function useAppRouter() {
const parse = () => {
const h = window.location.hash || "#/";
const path = h.replace(/^#/, "").replace(/\?.*$/, "") || "/";
const parts = path.split("/").filter(Boolean);
if (!parts.length) return { page:"home" };
if (parts[0]==="tool" && parts[1]) return { page:"tool", toolId:parts[1] };
if (parts[0]==="category" && parts[1]) return { page:"category", catId:parts[1] };
return { page:"home" };
};
const [route, setRoute] = useState(parse);
useEffect(() => {
const onHash = () => setRoute(parse());
window.addEventListener("hashchange", onHash);
return () => window.removeEventListener("hashchange", onHash);
}, []);
useEffect(() => {
const onClick = e => {
const a = e.target.closest("a[href]");
if (!a) return;
const h = a.getAttribute("href");
if (h && h.startsWith("#/")) { e.preventDefault(); window.location.hash = h; }
};
document.addEventListener("click", onClick);
return () => document.removeEventListener("click", onClick);
}, []);
return route;
}

const countStats = (txt) => ({ chars: (txt || "").length, lines: (txt || "").split("\n").length });
const dl = (name, text, type="text/plain;charset=utf-8") => {
const blob = new Blob([text], { type });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url; a.download = name; a.click();
URL.revokeObjectURL(url);
};

function OutputPanel({ output, filename, mime="text/plain;charset=utf-8" }) {
const s = countStats(output);
return (
<VStack gap={8}>
<div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
<div style={{ display:"flex", gap:8 }}>
<CopyBtn text={output} />
<Btn variant="secondary" size="sm" onClick={() => dl(filename, output, mime)}>Download</Btn>
</div>
<div style={{ display:"flex", gap:8 }}>
<Badge color="blue">{s.chars} chars</Badge>
<Badge color="amber">{s.lines} lines</Badge>
</div>
</div>
<Textarea value={output} onChange={()=>{}} rows={14} mono style={{ minHeight:240 }} />
</VStack>
);
}

function PillMultiSelect({ options, selected, onChange }) {
const toggle = (v) => onChange(selected.includes(v) ? selected.filter(x=>x!==v) : [...selected, v]);
return (
<div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
{options.map(o => {
const active = selected.includes(o.value);
return (
<button key={o.value} onClick={() => toggle(o.value)} style={{
padding:"7px 12px", borderRadius:999, border:`1px solid ${active ? C.blue : C.border}`,
background: active ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.03)",
color: active ? "#EDE9FE" : C.text, cursor:"pointer", fontSize:12, fontWeight:600
}}>
{o.label}
</button>
);
})}
</div>
);
}

const GITIGNORE_RULES = {
node: `node_modules/
dist/
build/
*.log
.env
coverage/
.npm
.eslintcache`,
python: `__pycache__/
*.py[cod]
*.pyo
*.pyd
.venv/
venv/
env/
*.egg-info/
.pytest_cache/`,
java: `.classpath
.project
.settings/
target/
*.class
*.jar
*.war
hs_err_pid*`,
react: `node_modules/
build/
.env.local
.env.development.local
.env.test.local
.env.production.local`,
vue: `node_modules/
dist/
.env.local
.env.*.local
npm-debug.log*
yarn-debug.log*`,
angular: `node_modules/
dist/
tmp/
out-tsc/
coverage/
.angular/cache/`,
next: `.next/
out/
node_modules/
.env*.local
.next/cache/`,
nuxt: `.nuxt/
.output/
node_modules/
dist/`,
laravel: `/vendor
/node_modules
/public/storage
/storage/*.key
.env`,
django: `*.log
*.pot
*.pyc
db.sqlite3
media
staticfiles
.env`,
flask: `instance/
.webassets-cache
.env
venv/
__pycache__/`,
rails: `.bundle/
log/*
tmp/*
db/*.sqlite3
public/assets
node_modules/`,
go: `bin/
pkg/
*.test
*.out`,
rust: `target/
Cargo.lock`,
dotnet: `bin/
obj/
*.user
*.suo
.vs/`,
docker: `.docker/
docker-compose.override.yml
*.pid`,
kubernetes: `*.secret.yaml
kubeconfig
*.kubeconfig`,
terraform: `.terraform/
*.tfstate
*.tfstate.*
crash.log
*.tfvars`,
wordpress: `wp-content/uploads/
wp-content/cache/
wp-config.php`,
};

function GitignoreGen() {
const options = Object.keys(GITIGNORE_RULES).map(k => ({ value:k, label:k.toUpperCase() }));
const [stacks, setStacks] = useState(["node", "react", "next"]);
const output = useMemo(() => {
const parts = stacks.map(s => `# ${s.toUpperCase()}\n${GITIGNORE_RULES[s] || ""}`);
const merged = Array.from(new Set(parts.join("\n").split("\n").filter(Boolean)));
return `# .gitignore generated by ToolsRift\n\n${merged.join("\n")}\n`;
}, [stacks]);
return (
<VStack>
<div><Label>Select Stacks</Label><PillMultiSelect options={options} selected={stacks} onChange={setStacks} /></div>
<OutputPanel output={output} filename=".gitignore" />
</VStack>
);
}

function ReadmeGen() {
const [name, setName] = useState("my-awesome-project");
const [desc, setDesc] = useState("A modern project scaffolded for productivity.");
const [features, setFeatures] = useState("Fast setup\nReusable components\nCI/CD ready");
const [install, setInstall] = useState("npm install");
const [usage, setUsage] = useState("npm run dev");
const [stack, setStack] = useState("Next.js, React, TypeScript");
const [license, setLicense] = useState("MIT");
const output = useMemo(() => {
const feat = features.split("\n").filter(Boolean).map(f => `- ${f}`).join("\n");
return `# ${name}

${desc}

## Features
${feat || "- Add your top features"}

## Tech Stack
${stack}

## Installation
\`\`\`bash
${install}
\`\`\`

## Usage
\`\`\`bash
${usage}
\`\`\`

## Contributing
Contributions are welcome. Please open an issue first to discuss major changes.

## License
This project is licensed under the ${license} License.
`;
}, [name, desc, features, install, usage, stack, license]);

return (
<VStack>
<Grid2>
<div><Label>Project Name</Label><Input value={name} onChange={setName} placeholder="project-name" /></div>
<div><Label>License</Label><SelectInput value={license} onChange={setLicense} options={[{value:"MIT",label:"MIT"},{value:"Apache-2.0",label:"Apache 2.0"},{value:"GPL-3.0",label:"GPL v3"},{value:"BSD-3-Clause",label:"BSD 3-Clause"},{value:"ISC",label:"ISC"}]} /></div>
</Grid2>
<div><Label>Description</Label><Textarea value={desc} onChange={setDesc} rows={3} /></div>
<Grid2>
<div><Label>Installation Command</Label><Input value={install} onChange={setInstall} placeholder="npm install" /></div>
<div><Label>Usage Command</Label><Input value={usage} onChange={setUsage} placeholder="npm run dev" /></div>
</Grid2>
<div><Label>Tech Stack</Label><Input value={stack} onChange={setStack} placeholder="Next.js, React, TypeScript" /></div>
<div><Label>Features (one per line)</Label><Textarea value={features} onChange={setFeatures} rows={5} /></div>
<OutputPanel output={output} filename="README.md" mime="text/markdown;charset=utf-8" />
</VStack>
);
}

function GithubProfileGen() {
const [name, setName] = useState("Your Name");
const [handle, setHandle] = useState("yourhandle");
const [role, setRole] = useState("Full Stack Developer");
const [skills, setSkills] = useState("JavaScript,TypeScript,React,Node.js,Docker");
const [twitter, setTwitter] = useState("");
const [linkedin, setLinkedin] = useState("");
const output = useMemo(() => {
const skillBadges = skills.split(",").map(s=>s.trim()).filter(Boolean).map(s=>`![${s}](https://img.shields.io/badge/-${encodeURIComponent(s)}-1f2937?style=flat&logo=github)`).join(" ");
return `# Hi there, I'm ${name} 👋

## ${role}

- 🔭 Currently building useful tools
- 🌱 Always learning and improving
- 💬 Ask me about web development and system design

## Skills
${skillBadges || "Add your skills"}

## GitHub Stats
![${handle}'s GitHub stats](https://github-readme-stats.vercel.app/api?username=${handle}&show_icons=true&theme=tokyonight)
![Top Langs](https://github-readme-stats.vercel.app/api/top-langs/?username=${handle}&layout=compact&theme=tokyonight)

## Connect
${twitter ? `- Twitter: https://twitter.com/${twitter.replace("@","")}` : "- Twitter: add your handle"}
${linkedin ? `- LinkedIn: ${linkedin}` : "- LinkedIn: add your profile URL"}
`;
}, [name, handle, role, skills, twitter, linkedin]);

return (
<VStack>
<Grid3>
<div><Label>Name</Label><Input value={name} onChange={setName} /></div>
<div><Label>GitHub Username</Label><Input value={handle} onChange={setHandle} /></div>
<div><Label>Role</Label><Input value={role} onChange={setRole} /></div>
</Grid3>
<div><Label>Skills (comma separated)</Label><Input value={skills} onChange={setSkills} /></div>
<Grid2>
<div><Label>Twitter Handle</Label><Input value={twitter} onChange={setTwitter} placeholder="@handle" /></div>
<div><Label>LinkedIn URL</Label><Input value={linkedin} onChange={setLinkedin} placeholder="https://linkedin.com/in/..." /></div>
</Grid2>
<OutputPanel output={output} filename="README.md" mime="text/markdown;charset=utf-8" />
</VStack>
);
}

function LicenseGen() {
const [year, setYear] = useState(String(new Date().getFullYear()));
const [owner, setOwner] = useState("Your Name");
const [type, setType] = useState("MIT");
const output = useMemo(() => {
if (type === "MIT") return `MIT License

Copyright (c) ${year} ${owner}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED...`;
if (type === "Apache-2.0") return `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

Copyright ${year} ${owner}

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0`;
if (type === "GPL-3.0") return `GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) ${year} ${owner}
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by the Free Software Foundation...`;
if (type === "BSD-3-Clause") return `BSD 3-Clause License

Copyright (c) ${year}, ${owner}
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met...`;
return `ISC License

Copyright (c) ${year} ${owner}

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted...`;
}, [type, owner, year]);

return (
<VStack>
<Grid3>
<div><Label>License</Label><SelectInput value={type} onChange={setType} options={[{value:"MIT",label:"MIT"},{value:"Apache-2.0",label:"Apache 2.0"},{value:"GPL-3.0",label:"GPL v3"},{value:"BSD-3-Clause",label:"BSD 3-Clause"},{value:"ISC",label:"ISC"}]} /></div>
<div><Label>Year</Label><Input value={year} onChange={setYear} /></div>
<div><Label>Owner</Label><Input value={owner} onChange={setOwner} /></div>
</Grid3>
<OutputPanel output={output} filename="LICENSE" />
</VStack>
);
}

function ChangelogGen() {
const [version, setVersion] = useState("1.0.0");
const [date, setDate] = useState(new Date().toISOString().slice(0,10));
const [entries, setEntries] = useState("Added user auth\nImproved dashboard performance\nFixed mobile layout issues");
const output = useMemo(() => {
const list = entries.split("\n").filter(Boolean).map(e => `- ${e}`).join("\n");
return `# Changelog

All notable changes to this project will be documented in this file.

## [${version}] - ${date}
${list || "- Initial release"}
`;
}, [version, date, entries]);

return (
<VStack>
<Grid2>
<div><Label>Version</Label><Input value={version} onChange={setVersion} /></div>
<div><Label>Date</Label><Input value={date} onChange={setDate} /></div>
</Grid2>
<div><Label>Changes (one per line)</Label><Textarea value={entries} onChange={setEntries} rows={6} /></div>
<OutputPanel output={output} filename="CHANGELOG.md" mime="text/markdown;charset=utf-8" />
</VStack>
);
}

function GithubActionsGen() {
const [preset, setPreset] = useState("node");
const [name, setName] = useState("CI");
const [branch, setBranch] = useState("main");
const output = useMemo(() => {
if (preset === "python") return `name: ${name}
on:
  push:
    branches: [${branch}]
  pull_request:
    branches: [${branch}]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install -r requirements.txt
      - run: pytest`;
if (preset === "docker") return `name: ${name}
on:
  push:
    branches: [${branch}]
jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build image
        run: docker build -t app:latest .
      - name: Run tests
        run: docker run --rm app:latest npm test`;
return `name: ${name}
on:
  push:
    branches: [${branch}]
  pull_request:
    branches: [${branch}]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm test --if-present
      - run: npm run build --if-present`;
}, [preset, name, branch]);

return (
<VStack>
<Grid3>
<div><Label>Workflow Name</Label><Input value={name} onChange={setName} /></div>
<div><Label>Branch</Label><Input value={branch} onChange={setBranch} /></div>
<div><Label>Preset</Label><SelectInput value={preset} onChange={setPreset} options={[{value:"node",label:"Node CI"},{value:"python",label:"Python CI"},{value:"docker",label:"Docker Build"}]} /></div>
</Grid3>
<OutputPanel output={output} filename="ci.yml" mime="text/yaml;charset=utf-8" />
</VStack>
);
}

function GitcommitGen() {
const [type, setType] = useState("feat");
const [scope, setScope] = useState("auth");
const [desc, setDesc] = useState("add OAuth login flow");
const [breaking, setBreaking] = useState("no");
const output = useMemo(() => `${type}${scope ? `(${scope})` : ""}${breaking==="yes"?"!":""}: ${desc}`, [type, scope, desc, breaking]);

return (
<VStack>
<Grid2>
<div><Label>Type</Label><SelectInput value={type} onChange={setType} options={[
{value:"feat",label:"feat"},{value:"fix",label:"fix"},{value:"docs",label:"docs"},{value:"style",label:"style"},
{value:"refactor",label:"refactor"},{value:"test",label:"test"},{value:"chore",label:"chore"}
]} /></div>
<div><Label>Scope</Label><Input value={scope} onChange={setScope} placeholder="api, ui, auth..." /></div>
</Grid2>
<div><Label>Description</Label><Input value={desc} onChange={setDesc} placeholder="short imperative summary" /></div>
<div><Label>Breaking Change</Label><SelectInput value={breaking} onChange={setBreaking} options={[{value:"no",label:"No"},{value:"yes",label:"Yes"}]} /></div>
<OutputPanel output={output} filename="commit-message.txt" />
</VStack>
);
}

const TOOLS = [
{ id:"gitignore-gen", cat:"git", name:"Gitignore Generator", desc:"Generate combined .gitignore files by selecting multiple tech stacks and export ready-to-use ignore rules.", icon:"🗂️", free:true },
{ id:"readme-gen", cat:"git", name:"README Generator", desc:"Generate a complete Markdown README.md from project details, commands, stack, and license inputs.", icon:"📘", free:true },
{ id:"github-profile-gen", cat:"git", name:"GitHub Profile README Generator", desc:"Generate a GitHub profile README with badges, stats widgets, skills, and social links.", icon:"👤", free:true },
{ id:"license-gen", cat:"git", name:"License Generator", desc:"Generate LICENSE text for MIT, Apache 2.0, GPL v3, BSD, and ISC with ownership placeholders.", icon:"⚖️", free:true },
{ id:"changelog-gen", cat:"git", name:"Changelog Generator", desc:"Generate structured CHANGELOG.md entries from version and bullet point release notes.", icon:"📝", free:true },
{ id:"github-actions-gen", cat:"git", name:"GitHub Actions Generator", desc:"Generate CI workflow YAML for Node, Python, or Docker pipelines with branch settings.", icon:"🚦", free:true },
{ id:"gitcommit-gen", cat:"git", name:"Conventional Commit Generator", desc:"Generate conventional commit messages from type, scope, and description in proper format.", icon:"✅", free:true },

{ id:"packagejson-gen", cat:"config", name:"package.json Generator", desc:"Generate package.json with project metadata, scripts, and dependencies from form inputs.", icon:"📦", free:true },
{ id:"tsconfig-gen", cat:"config", name:"tsconfig Generator", desc:"Generate tsconfig.json for strict, web, node, react, and next presets.", icon:"🧩", free:true },
{ id:"eslint-config-gen", cat:"config", name:"ESLint Config Generator", desc:"Generate .eslintrc.json for React, TypeScript, Airbnb, and Next.js setups.", icon:"🔎", free:true },
{ id:"prettier-config-gen", cat:"config", name:"Prettier Config Generator", desc:"Generate .prettierrc with tabs/spaces, quotes, semicolons, line width, and trailing commas.", icon:"🧼", free:true },
{ id:"env-gen", cat:"config", name:".env Example Generator", desc:"Generate .env.example templates from variable names with clean placeholder values.", icon:"🌱", free:true },
{ id:"editorconfig-gen", cat:"config", name:"EditorConfig Generator", desc:"Generate .editorconfig with indentation, charset, line endings, and whitespace trimming.", icon:"🧾", free:true },
{ id:"browserslist-gen", cat:"config", name:"Browserslist Generator", desc:"Generate browserslist config for modern, broad, and legacy browser support targets.", icon:"🌐", free:true },

{ id:"dockerfile-gen", cat:"docker", name:"Dockerfile Generator", desc:"Generate optimized Dockerfiles for Node.js, Python, and static web deployments.", icon:"🐳", free:true },
{ id:"dockercompose-gen", cat:"docker", name:"Docker Compose Generator", desc:"Generate docker-compose.yml with web, database, redis, and nginx service presets.", icon:"📚", free:true },
{ id:"nginx-config-gen", cat:"docker", name:"Nginx Config Generator", desc:"Generate nginx.conf for reverse proxy, static hosting, and SSL redirect scenarios.", icon:"🛡️", free:true },
{ id:"htaccess-gen", cat:"docker", name:".htaccess Generator", desc:"Generate Apache .htaccess with redirects, caching directives, and security headers.", icon:"🔐", free:true },

{ id:"tailwind-config-gen", cat:"css", name:"Tailwind Config Generator", desc:"Generate tailwind.config.js with custom color palettes, fonts, screens, and plugins.", icon:"🎨", free:true },
{ id:"css-variables-gen", cat:"css", name:"CSS Variables Generator", desc:"Generate CSS custom properties from palette and spacing scale for design systems.", icon:"🧬", free:true },
{ id:"css-reset-gen", cat:"css", name:"CSS Reset Generator", desc:"Generate minimal, normalize-style, or modern CSS reset code blocks for projects.", icon:"♻️", free:true },
{ id:"media-query-gen", cat:"css", name:"Media Query Generator", desc:"Generate responsive CSS media query templates for common breakpoint systems.", icon:"📱", free:true },
{ id:"css-animation-gen", cat:"css", name:"CSS Animation Generator", desc:"Generate keyframes and animation shorthand for fade, slide, bounce, spin, and pulse.", icon:"✨", free:true },

{ id:"robots-txt-gen", cat:"web", name:"Robots.txt Generator", desc:"Generate robots.txt with allow/disallow directives and sitemap references for major bots.", icon:"🤖", free:true },
{ id:"sitemap-gen", cat:"web", name:"XML Sitemap Generator", desc:"Generate XML sitemap from URL lists with priority and changefreq controls.", icon:"🗺️", free:true },
{ id:"htpasswd-gen", cat:"web", name:".htpasswd Generator", desc:"Generate htpasswd entries with salted hash format for HTTP basic auth setups.", icon:"🔑", free:true },
{ id:"json-schema-gen", cat:"web", name:"JSON Schema Generator", desc:"Generate JSON Schema from sample JSON payloads with type inference and required fields.", icon:"📐", free:true },
{ id:"openapi-gen", cat:"web", name:"OpenAPI Generator", desc:"Generate OpenAPI 3.0 YAML skeleton from endpoint definitions for quick API docs.", icon:"📄", free:true },
{ id:"csp-header-gen", cat:"web", name:"CSP Header Generator", desc:"Generate Content-Security-Policy header values with practical default web directives.", icon:"🧱", free:true },
];

const CATEGORIES = [
{ id:"git", name:"Git & GitHub", icon:"🧬", desc:"Generate Git files, README docs, licenses, commits, and CI workflows." },
{ id:"config", name:"Project Config Files", icon:"⚙️", desc:"Generate JSON and dotfile configs for modern JavaScript and TypeScript apps." },
{ id:"docker", name:"Docker & Server", icon:"🐳", desc:"Generate Docker, compose, Nginx, and Apache server configuration files." },
{ id:"css", name:"CSS Config & Themes", icon:"🎨", desc:"Generate theme variables, reset styles, media queries, and animations." },
{ id:"web", name:"Web & API", icon:"🌐", desc:"Generate robots, sitemap, schema, OpenAPI, CSP, and auth helper files." },
];

const TOOL_META = Object.fromEntries(TOOLS.map(t => [t.id, {
title:`Free ${t.name} – Generate Config Online | ToolsRift`,
desc:t.desc,
faq:[
["Can I use these generated files directly in production?", "Yes, as a starting point. Review and adjust values for your environment, security policy, and deployment constraints."],
["Do these tools call any external API?", "No. Generation happens completely client-side in your browser."],
["Can I download the output with proper extension?", "Yes. Every tool includes Copy and Download actions with suitable filenames and extensions."]
]
}]));
function PackagejsonGen() {
const [name, setName] = useState("my-app");
const [version, setVersion] = useState("1.0.0");
const [description, setDescription] = useState("A production-ready app.");
const [scripts, setScripts] = useState(`dev:next dev
build:next build
start:next start
lint:next lint`);
const [deps, setDeps] = useState(`react:^18.3.0
next:^14.2.0`);
const output = useMemo(() => {
const scriptObj = {};
scripts.split("\n").forEach(line => {
const [k, ...rest] = line.split(":");
if (k && rest.length) scriptObj[k.trim()] = rest.join(":").trim();
});
const depObj = {};
deps.split("\n").forEach(line => {
const [k, v] = line.split(":");
if (k && v) depObj[k.trim()] = v.trim();
});
return JSON.stringify({
name, version, description, private: true,
scripts: scriptObj,
dependencies: depObj
}, null, 2);
}, [name, version, description, scripts, deps]);

return (
<VStack>
<Grid3>
<div><Label>Name</Label><Input value={name} onChange={setName} /></div>
<div><Label>Version</Label><Input value={version} onChange={setVersion} /></div>
<div><Label>Description</Label><Input value={description} onChange={setDescription} /></div>
</Grid3>
<Grid2>
<div><Label>Scripts (key:value per line)</Label><Textarea value={scripts} onChange={setScripts} rows={6} mono /></div>
<div><Label>Dependencies (name:version per line)</Label><Textarea value={deps} onChange={setDeps} rows={6} mono /></div>
</Grid2>
<OutputPanel output={output} filename="package.json" mime="application/json;charset=utf-8" />
</VStack>
);
}

function TsconfigGen() {
const [preset, setPreset] = useState("strict");
const output = useMemo(() => {
const base = {
compilerOptions: {
target: "ES2022",
module: "ESNext",
moduleResolution: "Bundler",
strict: true,
esModuleInterop: true,
skipLibCheck: true,
forceConsistentCasingInFileNames: true
}
};
if (preset === "web") base.compilerOptions.lib = ["DOM", "ES2022"];
if (preset === "node") { base.compilerOptions.lib = ["ES2022"]; base.compilerOptions.types = ["node"]; }
if (preset === "react") { base.compilerOptions.jsx = "react-jsx"; base.compilerOptions.lib = ["DOM", "ES2022"]; }
if (preset === "next") { base.compilerOptions.jsx = "preserve"; base.compilerOptions.allowJs = true; base.compilerOptions.incremental = true; }
return JSON.stringify(base, null, 2);
}, [preset]);

return (
<VStack>
<div><Label>Preset</Label><SelectInput value={preset} onChange={setPreset} options={[
{value:"strict",label:"Strict"},
{value:"web",label:"Web"},
{value:"node",label:"Node"},
{value:"react",label:"React"},
{value:"next",label:"Next.js"},
]} /></div>
<OutputPanel output={output} filename="tsconfig.json" mime="application/json;charset=utf-8" />
</VStack>
);
}

function EslintConfigGen() {
const [react, setReact] = useState(true);
const [ts, setTs] = useState(true);
const [airbnb, setAirbnb] = useState(false);
const [nextjs, setNextjs] = useState(true);
const output = useMemo(() => {
const extendsArr = ["eslint:recommended"];
if (react) extendsArr.push("plugin:react/recommended");
if (ts) extendsArr.push("plugin:@typescript-eslint/recommended");
if (airbnb) extendsArr.push("airbnb");
if (nextjs) extendsArr.push("next/core-web-vitals");
return JSON.stringify({
env: { browser: true, es2022: true, node: true },
parser: ts ? "@typescript-eslint/parser" : undefined,
plugins: [
react ? "react" : null,
ts ? "@typescript-eslint" : null
].filter(Boolean),
extends: extendsArr,
rules: {
"no-console": "warn",
"react/react-in-jsx-scope": "off"
}
}, null, 2);
}, [react, ts, airbnb, nextjs]);

const Toggle = ({label, val, on}) => (
<button onClick={()=>on(!val)} style={{padding:"8px 12px",borderRadius:999,border:`1px solid ${val?C.blue:C.border}`,background:val?"rgba(139,92,246,0.18)":"rgba(255,255,255,0.03)",color:C.text,cursor:"pointer",fontSize:12,fontWeight:600}}>{label}</button>
);

return (
<VStack>
<div><Label>Select Stack Rules</Label></div>
<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
<Toggle label="React" val={react} on={setReact}/>
<Toggle label="TypeScript" val={ts} on={setTs}/>
<Toggle label="Airbnb" val={airbnb} on={setAirbnb}/>
<Toggle label="Next.js" val={nextjs} on={setNextjs}/>
</div>
<OutputPanel output={output} filename=".eslintrc.json" mime="application/json;charset=utf-8" />
</VStack>
);
}

function PrettierConfigGen() {
const [useTabs, setUseTabs] = useState("false");
const [singleQuote, setSingleQuote] = useState("true");
const [semi, setSemi] = useState("true");
const [trailingComma, setTrailingComma] = useState("all");
const [printWidth, setPrintWidth] = useState("100");
const [tabWidth, setTabWidth] = useState("2");

const output = useMemo(() => JSON.stringify({
useTabs: useTabs === "true",
singleQuote: singleQuote === "true",
semi: semi === "true",
trailingComma,
printWidth: Number(printWidth) || 100,
tabWidth: Number(tabWidth) || 2
}, null, 2), [useTabs, singleQuote, semi, trailingComma, printWidth, tabWidth]);

return (
<VStack>
<Grid3>
<div><Label>Use Tabs</Label><SelectInput value={useTabs} onChange={setUseTabs} options={[{value:"false",label:"No"},{value:"true",label:"Yes"}]} /></div>
<div><Label>Single Quotes</Label><SelectInput value={singleQuote} onChange={setSingleQuote} options={[{value:"true",label:"Yes"},{value:"false",label:"No"}]} /></div>
<div><Label>Semicolons</Label><SelectInput value={semi} onChange={setSemi} options={[{value:"true",label:"Yes"},{value:"false",label:"No"}]} /></div>
</Grid3>
<Grid3>
<div><Label>Trailing Comma</Label><SelectInput value={trailingComma} onChange={setTrailingComma} options={[{value:"none",label:"none"},{value:"es5",label:"es5"},{value:"all",label:"all"}]} /></div>
<div><Label>Print Width</Label><Input value={printWidth} onChange={setPrintWidth} /></div>
<div><Label>Tab Width</Label><Input value={tabWidth} onChange={setTabWidth} /></div>
</Grid3>
<OutputPanel output={output} filename=".prettierrc" mime="application/json;charset=utf-8" />
</VStack>
);
}

function EnvGen() {
const [vars, setVars] = useState(`NODE_ENV
PORT
DATABASE_URL
JWT_SECRET
API_BASE_URL`);
const output = useMemo(() => vars.split("\n").map(v => v.trim()).filter(Boolean).map(v => `${v}=`).join("\n") + "\n", [vars]);

return (
<VStack>
<div><Label>Environment Variable Names (one per line)</Label><Textarea value={vars} onChange={setVars} rows={8} mono /></div>
<OutputPanel output={output} filename=".env.example" />
</VStack>
);
}

function EditorconfigGen() {
const [indentStyle, setIndentStyle] = useState("space");
const [indentSize, setIndentSize] = useState("2");
const [charset, setCharset] = useState("utf-8");
const [trim, setTrim] = useState("true");
const [insertFinal, setInsertFinal] = useState("true");
const output = useMemo(() => `root = true

[*]
indent_style = ${indentStyle}
indent_size = ${indentSize}
charset = ${charset}
trim_trailing_whitespace = ${trim}
insert_final_newline = ${insertFinal}
`, [indentStyle, indentSize, charset, trim, insertFinal]);

return (
<VStack>
<Grid3>
<div><Label>Indent Style</Label><SelectInput value={indentStyle} onChange={setIndentStyle} options={[{value:"space",label:"space"},{value:"tab",label:"tab"}]} /></div>
<div><Label>Indent Size</Label><Input value={indentSize} onChange={setIndentSize} /></div>
<div><Label>Charset</Label><SelectInput value={charset} onChange={setCharset} options={[{value:"utf-8",label:"utf-8"},{value:"latin1",label:"latin1"}]} /></div>
</Grid3>
<Grid2>
<div><Label>Trim Trailing Whitespace</Label><SelectInput value={trim} onChange={setTrim} options={[{value:"true",label:"true"},{value:"false",label:"false"}]} /></div>
<div><Label>Insert Final Newline</Label><SelectInput value={insertFinal} onChange={setInsertFinal} options={[{value:"true",label:"true"},{value:"false",label:"false"}]} /></div>
</Grid2>
<OutputPanel output={output} filename=".editorconfig" />
</VStack>
);
}

function BrowserslistGen() {
const [target, setTarget] = useState("modern");
const output = useMemo(() => {
if (target === "broad") return `> 0.5%
last 2 versions
Firefox ESR
not dead`;
if (target === "legacy") return `> 0.2%
last 5 versions
ie 11
not dead`;
return `last 2 chrome versions
last 2 firefox versions
last 2 safari versions
last 2 edge versions`;
}, [target]);

return (
<VStack>
<div><Label>Support Target</Label><SelectInput value={target} onChange={setTarget} options={[
{value:"modern",label:"Modern Browsers"},
{value:"broad",label:"Broad Support"},
{value:"legacy",label:"Legacy Support"},
]} /></div>
<OutputPanel output={output} filename=".browserslistrc" />
</VStack>
);
}

function DockerfileGen() {
const [type, setType] = useState("node");
const output = useMemo(() => {
if (type === "python") return `FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "app.py"]`;
if (type === "static") return `FROM nginx:alpine
COPY ./dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;
return `FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "start"]`;
}, [type]);

return (
<VStack>
<div><Label>Project Type</Label><SelectInput value={type} onChange={setType} options={[{value:"node",label:"Node.js"},{value:"python",label:"Python"},{value:"static",label:"Static Site"}]} /></div>
<OutputPanel output={output} filename="Dockerfile" />
</VStack>
);
}

function DockercomposeGen() {
const [web, setWeb] = useState(true);
const [db, setDb] = useState(true);
const [redis, setRedis] = useState(false);
const [nginx, setNginx] = useState(false);

const output = useMemo(() => {
const services = [];
if (web) services.push(`  web:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped`);
if (db) services.push(`  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: example
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data`);
if (redis) services.push(`  redis:
    image: redis:7
    ports:
      - "6379:6379"`);
if (nginx) services.push(`  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    depends_on:
      - web`);
return `version: "3.9"
services:
${services.join("\n")}
${db ? "\nvolumes:\n  db_data:" : ""}`;
}, [web, db, redis, nginx]);

const Toggle = ({label,val,on}) => (
<button onClick={()=>on(!val)} style={{padding:"8px 12px",borderRadius:999,border:`1px solid ${val?C.blue:C.border}`,background:val?"rgba(139,92,246,0.18)":"rgba(255,255,255,0.03)",color:C.text,cursor:"pointer",fontSize:12,fontWeight:600}}>{label}</button>
);

return (
<VStack>
<div><Label>Services</Label></div>
<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
<Toggle label="Web" val={web} on={setWeb}/>
<Toggle label="PostgreSQL" val={db} on={setDb}/>
<Toggle label="Redis" val={redis} on={setRedis}/>
<Toggle label="Nginx" val={nginx} on={setNginx}/>
</div>
<OutputPanel output={output} filename="docker-compose.yml" mime="text/yaml;charset=utf-8" />
</VStack>
);
}

function NginxConfigGen() {
const [mode, setMode] = useState("reverse");
const [serverName, setServerName] = useState("example.com");
const [upstream, setUpstream] = useState("http://127.0.0.1:3000");
const output = useMemo(() => {
if (mode === "static") return `server {
  listen 80;
  server_name ${serverName};

  root /var/www/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}`;
if (mode === "sslredirect") return `server {
  listen 80;
  server_name ${serverName};
  return 301 https://$host$request_uri;
}`;
return `server {
  listen 80;
  server_name ${serverName};

  location / {
    proxy_pass ${upstream};
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}`;
}, [mode, serverName, upstream]);

return (
<VStack>
<Grid3>
<div><Label>Mode</Label><SelectInput value={mode} onChange={setMode} options={[
{value:"reverse",label:"Reverse Proxy"},
{value:"static",label:"Static Site"},
{value:"sslredirect",label:"SSL Redirect"},
]} /></div>
<div><Label>Server Name</Label><Input value={serverName} onChange={setServerName} /></div>
<div><Label>Upstream (reverse mode)</Label><Input value={upstream} onChange={setUpstream} /></div>
</Grid3>
<OutputPanel output={output} filename="nginx.conf" />
</VStack>
);
}

function HtaccessGen() {
const [redirectWww, setRedirectWww] = useState(true);
const [cache, setCache] = useState(true);
const [headers, setHeaders] = useState(true);

const output = useMemo(() => {
const parts = ["# Generated .htaccess"];
if (redirectWww) parts.push(`RewriteEngine On
RewriteCond %{HTTP_HOST} !^www\\. [NC]
RewriteRule ^ https://www.%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`);
if (cache) parts.push(`<IfModule mod_expires.c>
ExpiresActive On
ExpiresByType text/css "access plus 1 month"
ExpiresByType application/javascript "access plus 1 month"
ExpiresByType image/png "access plus 1 year"
</IfModule>`);
if (headers) parts.push(`<IfModule mod_headers.c>
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>`);
return parts.join("\n\n");
}, [redirectWww, cache, headers]);

const Toggle = ({label,val,on}) => (
<button onClick={()=>on(!val)} style={{padding:"8px 12px",borderRadius:999,border:`1px solid ${val?C.blue:C.border}`,background:val?"rgba(139,92,246,0.18)":"rgba(255,255,255,0.03)",color:C.text,cursor:"pointer",fontSize:12,fontWeight:600}}>{label}</button>
);

return (
<VStack>
<div><Label>Options</Label></div>
<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
<Toggle label="Redirect to www" val={redirectWww} on={setRedirectWww}/>
<Toggle label="Caching Rules" val={cache} on={setCache}/>
<Toggle label="Security Headers" val={headers} on={setHeaders}/>
</div>
<OutputPanel output={output} filename=".htaccess" />
</VStack>
);
}

function TailwindConfigGen() {
const [colors, setColors] = useState("primary:#8B5CF6\nsecondary:#0EA5E9\naccent:#10B981");
const [fontSans, setFontSans] = useState("Inter, sans-serif");
const [screens, setScreens] = useState("sm:640px\nmd:768px\nlg:1024px\nxl:1280px");
const [plugins, setPlugins] = useState("@tailwindcss/forms\n@tailwindcss/typography");

const output = useMemo(() => {
const colorObj = {};
colors.split("\n").forEach(l => {
const [k,v] = l.split(":");
if (k && v) colorObj[k.trim()] = v.trim();
});
const screenObj = {};
screens.split("\n").forEach(l => {
const [k,v] = l.split(":");
if (k && v) screenObj[k.trim()] = v.trim();
});
const p = plugins.split("\n").filter(Boolean).map(x => `require('${x.trim()}')`).join(", ");
return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: ${JSON.stringify(colorObj, null, 6)},
      fontFamily: {
        sans: ["${fontSans.split(",")[0]}", "sans-serif"]
      },
      screens: ${JSON.stringify(screenObj, null, 6)}
    }
  },
  plugins: [${p}]
};`;
}, [colors, fontSans, screens, plugins]);

return (
<VStack>
<Grid2>
<div><Label>Colors (name:value per line)</Label><Textarea value={colors} onChange={setColors} rows={6} mono /></div>
<div><Label>Screens (name:value per line)</Label><Textarea value={screens} onChange={setScreens} rows={6} mono /></div>
</Grid2>
<Grid2>
<div><Label>Font Sans</Label><Input value={fontSans} onChange={setFontSans} /></div>
<div><Label>Plugins (one per line)</Label><Textarea value={plugins} onChange={setPlugins} rows={3} mono /></div>
</Grid2>
<OutputPanel output={output} filename="tailwind.config.js" mime="text/javascript;charset=utf-8" />
</VStack>
);
}

function CssVariablesGen() {
const [palette, setPalette] = useState("primary:#8B5CF6\nsecondary:#0EA5E9\nsuccess:#10B981\ndanger:#EF4444");
const [spacing, setSpacing] = useState("1:4px\n2:8px\n3:12px\n4:16px\n6:24px");
const output = useMemo(() => {
const colors = palette.split("\n").filter(Boolean).map(l => {
const [k,v] = l.split(":"); return k && v ? `  --color-${k.trim()}: ${v.trim()};` : null;
}).filter(Boolean);
const spaces = spacing.split("\n").filter(Boolean).map(l => {
const [k,v] = l.split(":"); return k && v ? `  --space-${k.trim()}: ${v.trim()};` : null;
}).filter(Boolean);
return `:root {
${[...colors, ...spaces].join("\n")}
}`;
}, [palette, spacing]);

return (
<VStack>
<Grid2>
<div><Label>Color Palette (name:value)</Label><Textarea value={palette} onChange={setPalette} rows={8} mono /></div>
<div><Label>Spacing Scale (key:value)</Label><Textarea value={spacing} onChange={setSpacing} rows={8} mono /></div>
</Grid2>
<OutputPanel output={output} filename="variables.css" mime="text/css;charset=utf-8" />
</VStack>
);
}

function CssResetGen() {
const [mode, setMode] = useState("modern");
const output = useMemo(() => {
if (mode === "minimal") return `*,
*::before,
*::after { box-sizing: border-box; }

body, h1, h2, h3, p, ul, ol { margin: 0; padding: 0; }

img { max-width: 100%; display: block; }`;
if (mode === "normalize") return `html { line-height: 1.15; -webkit-text-size-adjust: 100%; }
body { margin: 0; }
main { display: block; }
h1 { font-size: 2em; margin: .67em 0; }
hr { box-sizing: content-box; height: 0; overflow: visible; }
pre { font-family: monospace, monospace; font-size: 1em; }`;
return `*,
*::before,
*::after {
  box-sizing: border-box;
}
* {
  margin: 0;
}
html:focus-within {
  scroll-behavior: smooth;
}
body {
  min-height: 100vh;
  text-rendering: optimizeSpeed;
  line-height: 1.5;
}
img, picture {
  max-width: 100%;
  display: block;
}
input, button, textarea, select {
  font: inherit;
}`;
}, [mode]);

return (
<VStack>
<div><Label>Reset Type</Label><SelectInput value={mode} onChange={setMode} options={[
{value:"minimal",label:"Minimal"},
{value:"normalize",label:"Full Normalize"},
{value:"modern",label:"Modern Reset"},
]} /></div>
<OutputPanel output={output} filename="reset.css" mime="text/css;charset=utf-8" />
</VStack>
);
}

function MediaQueryGen() {
const [mobile, setMobile] = useState("480");
const [tablet, setTablet] = useState("768");
const [laptop, setLaptop] = useState("1024");
const [desktop, setDesktop] = useState("1280");
const output = useMemo(() => `/* Mobile first breakpoints */
@media (min-width: ${mobile}px) {
  /* mobile */
}

@media (min-width: ${tablet}px) {
  /* tablet */
}

@media (min-width: ${laptop}px) {
  /* laptop */
}

@media (min-width: ${desktop}px) {
  /* desktop */
}`, [mobile, tablet, laptop, desktop]);

return (
<VStack>
<Grid4Fallback>
<div><Label>Mobile</Label><Input value={mobile} onChange={setMobile} /></div>
<div><Label>Tablet</Label><Input value={tablet} onChange={setTablet} /></div>
<div><Label>Laptop</Label><Input value={laptop} onChange={setLaptop} /></div>
<div><Label>Desktop</Label><Input value={desktop} onChange={setDesktop} /></div>
</Grid4Fallback>
<OutputPanel output={output} filename="media-queries.css" mime="text/css;charset=utf-8" />
</VStack>
);
}

function Grid4Fallback({ children }) {
return <div style={{ display:"grid", gridTemplateColumns:"repeat(4,minmax(0,1fr))", gap:12 }}>{children}</div>;
}

function CssAnimationGen() {
const [type, setType] = useState("fade");
const [duration, setDuration] = useState("0.6s");
const [timing, setTiming] = useState("ease");
const [iteration, setIteration] = useState("1");
const output = useMemo(() => {
const defs = {
fade: `@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}`,
slide: `@keyframes slideUp {
  from { opacity:0; transform: translateY(12px); }
  to { opacity:1; transform: translateY(0); }
}`,
bounce: `@keyframes bounce {
  0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
  40%, 43% { transform: translateY(-20px); }
  70% { transform: translateY(-10px); }
  90% { transform: translateY(-4px); }
}`,
spin: `@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`,
pulse: `@keyframes pulse {
  0%, 100% { transform: scale(1); opacity:1; }
  50% { transform: scale(1.06); opacity:.85; }
}`,
};
const nameMap = { fade:"fadeIn", slide:"slideUp", bounce:"bounce", spin:"spin", pulse:"pulse" };
return `${defs[type]}

.animated {
  animation: ${nameMap[type]} ${duration} ${timing} ${iteration};
}`;
}, [type, duration, timing, iteration]);

return (
<VStack>
<Grid2>
<div><Label>Animation Type</Label><SelectInput value={type} onChange={setType} options={[
{value:"fade",label:"Fade"},{value:"slide",label:"Slide"},{value:"bounce",label:"Bounce"},{value:"spin",label:"Spin"},{value:"pulse",label:"Pulse"}
]} /></div>
<div><Label>Duration</Label><Input value={duration} onChange={setDuration} placeholder="0.6s" /></div>
</Grid2>
<Grid2>
<div><Label>Timing</Label><SelectInput value={timing} onChange={setTiming} options={[
{value:"ease",label:"ease"},{value:"linear",label:"linear"},{value:"ease-in",label:"ease-in"},{value:"ease-out",label:"ease-out"},{value:"ease-in-out",label:"ease-in-out"}
]} /></div>
<div><Label>Iteration Count</Label><Input value={iteration} onChange={setIteration} placeholder="1 or infinite" /></div>
</Grid2>
<OutputPanel output={output} filename="animation.css" mime="text/css;charset=utf-8" />
</VStack>
);
}
function RobotsTxtGen() {
const [site, setSite] = useState("https://example.com");
const [disallow, setDisallow] = useState("/admin\n/private");
const [allow, setAllow] = useState("/");
const [bot, setBot] = useState("*");
const output = useMemo(() => {
const allowLines = allow.split("\n").filter(Boolean).map(x=>`Allow: ${x}`).join("\n");
const disallowLines = disallow.split("\n").filter(Boolean).map(x=>`Disallow: ${x}`).join("\n");
return `User-agent: ${bot}
${allowLines || "Allow: /"}
${disallowLines || "Disallow:"}

Sitemap: ${site.replace(/\/+$/,"")}/sitemap.xml
`;
}, [site, disallow, allow, bot]);

return (
<VStack>
<Grid2>
<div><Label>User-agent</Label><Input value={bot} onChange={setBot} placeholder="*" /></div>
<div><Label>Website URL</Label><Input value={site} onChange={setSite} placeholder="https://example.com" /></div>
</Grid2>
<Grid2>
<div><Label>Allow Rules (one per line)</Label><Textarea value={allow} onChange={setAllow} rows={5} mono /></div>
<div><Label>Disallow Rules (one per line)</Label><Textarea value={disallow} onChange={setDisallow} rows={5} mono /></div>
</Grid2>
<OutputPanel output={output} filename="robots.txt" />
</VStack>
);
}

function SitemapGen() {
const [urls, setUrls] = useState("https://example.com/\nhttps://example.com/about\nhttps://example.com/contact");
const [freq, setFreq] = useState("weekly");
const [priority, setPriority] = useState("0.8");
const output = useMemo(() => {
const nodes = urls.split("\n").map(u=>u.trim()).filter(Boolean).map(u => `  <url>
    <loc>${u}</loc>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join("\n");
return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${nodes}
</urlset>`;
}, [urls, freq, priority]);

return (
<VStack>
<div><Label>URLs (one per line)</Label><Textarea value={urls} onChange={setUrls} rows={8} mono /></div>
<Grid2>
<div><Label>Change Frequency</Label><SelectInput value={freq} onChange={setFreq} options={[
{value:"always",label:"always"},{value:"hourly",label:"hourly"},{value:"daily",label:"daily"},{value:"weekly",label:"weekly"},{value:"monthly",label:"monthly"}
]} /></div>
<div><Label>Priority</Label><Input value={priority} onChange={setPriority} /></div>
</Grid2>
<OutputPanel output={output} filename="sitemap.xml" mime="application/xml;charset=utf-8" />
</VStack>
);
}

function simpleHash(str) {
let h = 2166136261;
for (let i = 0; i < str.length; i++) {
h ^= str.charCodeAt(i);
h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
}
return (h >>> 0).toString(16);
}
function pseudoBcrypt(password, rounds=12) {
const salt = Math.random().toString(36).slice(2, 24).padEnd(22, "a").slice(0,22);
const body = simpleHash(password + salt + rounds).padEnd(31, "b").slice(0,31);
return `$2y$${String(rounds).padStart(2,"0")}$${salt}${body}`;
}

function HtpasswdGen() {
const [user, setUser] = useState("admin");
const [pass, setPass] = useState("change-me");
const [rounds, setRounds] = useState("12");
const output = useMemo(() => `${user}:${pseudoBcrypt(pass, Number(rounds)||12)}`, [user, pass, rounds]);

return (
<VStack>
<Grid3>
<div><Label>Username</Label><Input value={user} onChange={setUser} /></div>
<div><Label>Password</Label><Input value={pass} onChange={setPass} /></div>
<div><Label>Cost</Label><Input value={rounds} onChange={setRounds} /></div>
</Grid3>
<OutputPanel output={output} filename=".htpasswd" />
</VStack>
);
}

function inferSchema(value) {
if (Array.isArray(value)) {
if (!value.length) return { type: "array", items: {} };
return { type: "array", items: inferSchema(value[0]) };
}
if (value === null) return { type: "null" };
switch (typeof value) {
case "string": return { type: "string" };
case "number": return Number.isInteger(value) ? { type: "integer" } : { type: "number" };
case "boolean": return { type: "boolean" };
case "object": {
const properties = {};
const required = [];
Object.entries(value).forEach(([k,v]) => {
properties[k] = inferSchema(v);
required.push(k);
});
return { type:"object", properties, required };
}
default: return {};
}
}

function JsonSchemaGen() {
const [sample, setSample] = useState(`{
  "id": 1,
  "name": "Jane",
  "email": "jane@example.com",
  "isActive": true,
  "tags": ["pro", "beta"]
}`);
const output = useMemo(() => {
try {
const parsed = JSON.parse(sample);
return JSON.stringify({
$schema: "http://json-schema.org/draft-07/schema#",
...inferSchema(parsed)
}, null, 2);
} catch {
return `{
  "error": "Invalid JSON input"
}`;
}
}, [sample]);

return (
<VStack>
<div><Label>Sample JSON</Label><Textarea value={sample} onChange={setSample} rows={10} mono /></div>
<OutputPanel output={output} filename="schema.json" mime="application/json;charset=utf-8" />
</VStack>
);
}

function OpenapiGen() {
const [title, setTitle] = useState("My API");
const [version, setVersion] = useState("1.0.0");
const [baseUrl, setBaseUrl] = useState("https://api.example.com");
const [endpoints, setEndpoints] = useState("GET /users\nPOST /users\nGET /users/{id}");
const output = useMemo(() => {
const paths = {};
endpoints.split("\n").map(x=>x.trim()).filter(Boolean).forEach(row => {
const [method, path] = row.split(/\s+/);
if (!method || !path) return;
if (!paths[path]) paths[path] = {};
paths[path][method.toLowerCase()] = {
summary: `${method.toUpperCase()} ${path}`,
responses: { "200": { description: "Successful response" } }
};
});
const pathYaml = Object.entries(paths).map(([path, methods]) => {
const methodYaml = Object.entries(methods).map(([m, obj]) =>
`    ${m}:
      summary: ${obj.summary}
      responses:
        '200':
          description: ${obj.responses["200"].description}`
).join("\n");
return `  ${path}:\n${methodYaml}`;
}).join("\n");
return `openapi: 3.0.0
info:
  title: ${title}
  version: ${version}
servers:
  - url: ${baseUrl}
paths:
${pathYaml || "  {}"}
`;
}, [title, version, baseUrl, endpoints]);

return (
<VStack>
<Grid3>
<div><Label>Title</Label><Input value={title} onChange={setTitle} /></div>
<div><Label>Version</Label><Input value={version} onChange={setVersion} /></div>
<div><Label>Server URL</Label><Input value={baseUrl} onChange={setBaseUrl} /></div>
</Grid3>
<div><Label>Endpoints (METHOD /path per line)</Label><Textarea value={endpoints} onChange={setEndpoints} rows={8} mono /></div>
<OutputPanel output={output} filename="openapi.yaml" mime="text/yaml;charset=utf-8" />
</VStack>
);
}

function CspHeaderGen() {
const [defaultSrc, setDefaultSrc] = useState("'self'");
const [scriptSrc, setScriptSrc] = useState("'self' https://cdn.jsdelivr.net");
const [styleSrc, setStyleSrc] = useState("'self' 'unsafe-inline'");
const [imgSrc, setImgSrc] = useState("'self' data: https:");
const [connectSrc, setConnectSrc] = useState("'self' https://api.example.com");
const output = useMemo(() => {
const directives = [
`default-src ${defaultSrc}`,
`script-src ${scriptSrc}`,
`style-src ${styleSrc}`,
`img-src ${imgSrc}`,
`connect-src ${connectSrc}`,
`object-src 'none'`,
`base-uri 'self'`,
`frame-ancestors 'none'`,
`upgrade-insecure-requests`
];
return directives.join("; ");
}, [defaultSrc, scriptSrc, styleSrc, imgSrc, connectSrc]);

return (
<VStack>
<Grid2>
<div><Label>default-src</Label><Input value={defaultSrc} onChange={setDefaultSrc} /></div>
<div><Label>script-src</Label><Input value={scriptSrc} onChange={setScriptSrc} /></div>
</Grid2>
<Grid2>
<div><Label>style-src</Label><Input value={styleSrc} onChange={setStyleSrc} /></div>
<div><Label>img-src</Label><Input value={imgSrc} onChange={setImgSrc} /></div>
</Grid2>
<div><Label>connect-src</Label><Input value={connectSrc} onChange={setConnectSrc} /></div>
<OutputPanel output={output} filename="csp-header.txt" />
</VStack>
);
}

const TOOL_COMPONENTS = {
"gitignore-gen": GitignoreGen,
"readme-gen": ReadmeGen,
"github-profile-gen": GithubProfileGen,
"license-gen": LicenseGen,
"changelog-gen": ChangelogGen,
"github-actions-gen": GithubActionsGen,
"gitcommit-gen": GitcommitGen,

"packagejson-gen": PackagejsonGen,
"tsconfig-gen": TsconfigGen,
"eslint-config-gen": EslintConfigGen,
"prettier-config-gen": PrettierConfigGen,
"env-gen": EnvGen,
"editorconfig-gen": EditorconfigGen,
"browserslist-gen": BrowserslistGen,

"dockerfile-gen": DockerfileGen,
"dockercompose-gen": DockercomposeGen,
"nginx-config-gen": NginxConfigGen,
"htaccess-gen": HtaccessGen,

"tailwind-config-gen": TailwindConfigGen,
"css-variables-gen": CssVariablesGen,
"css-reset-gen": CssResetGen,
"media-query-gen": MediaQueryGen,
"css-animation-gen": CssAnimationGen,

"robots-txt-gen": RobotsTxtGen,
"sitemap-gen": SitemapGen,
"htpasswd-gen": HtpasswdGen,
"json-schema-gen": JsonSchemaGen,
"openapi-gen": OpenapiGen,
"csp-header-gen": CspHeaderGen,
};

function Breadcrumb({ tool, cat }) {
return (
<>
<div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:C.muted, marginBottom:20 }}>
<a href="https://toolsrift.com" style={{ color:C.muted, textDecoration:"none" }}>🏠 ToolsRift</a>
{cat && <><span>›</span><a href={`#/category/${cat.id}`} style={{ color:C.muted, textDecoration:"none" }}>{cat.name}</a></>}
{tool && <><span>›</span><span style={{ color:C.text }}>{tool.name}</span></>}
</div>
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
"@context": "https://schema.org",
"@type": "BreadcrumbList",
"itemListElement": [
{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolsrift.com" },
{ "@type": "ListItem", "position": 2, "name": "Dev Config Generators", "item": "https://toolsrift.com/devgen" },
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
    document.title = meta?.title || `${tool?.name} – Free Dev Config Generator | ToolsRift`;
  }, [toolId, tool, meta]);

  if (!tool || !ToolComp) {
    return (
      <CategoryLayout theme={PAGE_THEME} currentTool={toolId || 'unknown'}>
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
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId}>
      <ToolPageLayout theme={PAGE_THEME} tool={toolData} related={related}>
        <ToolComp />
      </ToolPageLayout>
    </CategoryLayout>
  );
}

function CategoryPage({ catId }) {
const cat = CATEGORIES.find(c => c.id === catId);
const items = TOOLS.filter(t => t.cat === catId);
if (!cat) return <div style={{maxWidth:900,margin:"0 auto",padding:"28px 20px",color:C.muted}}>Category not found.</div>;
return (
<div style={{ maxWidth:1000, margin:"0 auto", padding:"24px 20px 60px" }}>
<Breadcrumb cat={cat} />
<div style={{ marginBottom:20 }}>
<h1 style={T.h1}>{cat.icon} {cat.name}</h1>
<p style={{ color:C.muted, marginTop:8 }}>{cat.desc}</p>
</div>
<div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:14 }}>
{items.map(t => (
<a key={t.id} href={`#/tool/${t.id}`} style={{ textDecoration:"none" }}>
<Card style={{ height:"100%" }}>
<div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
<div style={{ fontSize:22 }}>{t.icon}</div>
<Badge color="green">Free</Badge>
</div>
<div style={{ fontWeight:700, color:C.text, marginBottom:8, fontSize:14 }}>{t.name}</div>
<div style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>{t.desc}</div>
</Card>
</a>
))}
</div>
</div>
);
}

function HomePage() {
  useEffect(() => { document.title = "ToolsRift Dev Generators – Free Developer Config Generators Online"; }, []);
  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null}>
      <PremiumCategoryLanding
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search dev config generators..."
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
      borderBottom: `1px solid ${scrolled ? "rgba(139,92,246,0.2)" : C.border}`,
      transition: "background 0.2s, border-color 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.blue, boxShadow: `0 0 6px ${C.blue}80`, flexShrink: 0 }} />
        <a href="https://toolsrift.com" style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: "#F8FAFC", textDecoration: "none", letterSpacing: "-0.01em" }}>ToolsRift</a>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>›</span>
        <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 500, color: C.blue }}>{THEME?.name}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ background: "rgba(139,92,246,0.12)", color: C.blue, border: "1px solid rgba(139,92,246,0.25)", borderRadius: 20, fontSize: 11, fontWeight: 700, padding: "3px 10px", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{TOOLS.length} tools</span>
        <a href="/" style={{ fontSize: 12, color: C.muted, textDecoration: "none", fontWeight: 500 }}>🏠 Home</a>
        {/* PHASE 2: <UsageCounter/> */}
      </div>
    </nav>
  );
}

function SiteFooter({ currentPage }) {
const pages = [
{href:"/business",icon:"💼",label:"Business"},
{href:"/text",icon:"✍️",label:"Text Tools"},
{href:"/json",icon:"🧑‍💻",label:"Dev Tools"},
{href:"/encoders",icon:"🔐",label:"Encoders"},
{href:"/colors",icon:"🎨",label:"Color Tools"},
{href:"/units",icon:"📏",label:"Unit Converters"},
{href:"/hash",icon:"🔒",label:"Hash & Crypto"},
{href:"/css",icon:"✨",label:"CSS Tools"},
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
].filter(p => !p.href.endsWith("/"+currentPage));
return (
<div style={{maxWidth:860,margin:"0 auto",padding:"32px 20px 28px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
<span style={{fontSize:11,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em"}}>Explore More Tools</span>
<a href="/" style={{fontSize:12,color:C.blue,textDecoration:"none",fontWeight:600}}>← Back to Home</a>
</div>
<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
{pages.map(p => (
<a key={p.href} href={p.href} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 13px",borderRadius:8,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",fontSize:12,fontWeight:500,color:"#64748B",textDecoration:"none"}}
onMouseEnter={e=>{e.currentTarget.style.color="#E2E8F0";e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";e.currentTarget.style.background="rgba(255,255,255,0.06)";}}
onMouseLeave={e=>{e.currentTarget.style.color="#64748B";e.currentTarget.style.borderColor="rgba(255,255,255,0.06)";e.currentTarget.style.background="rgba(255,255,255,0.03)";}}>
<span>{p.icon}</span>{p.label}
</a>
))}
</div>
<div style={{textAlign:"center",fontSize:11,color:"#334155"}}>© 2026 ToolsRift · Free online tools · No signup required</div>
</div>
);
}

function ToolsRiftGenDevConfig() {
const route = useAppRouter();
const showChrome = route.page !== 'home' && route.page !== 'tool';
return (
<div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
<style>{GLOBAL_CSS}</style>
{showChrome && <Nav />}
{route.page==="home" && <HomePage />}
{route.page==="tool" && <ToolPage toolId={route.toolId} />}
{route.page==="category" && <CategoryPage catId={route.catId} />}
{showChrome && <SiteFooter currentPage="devgen"/>}
</div>
);
}

export default ToolsRiftGenDevConfig;
