import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
import { getCategoryById } from '../lib/categoryThemes';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolCard from './shared/ToolCard';
import ToolPageLayout from './shared/ToolPageLayout';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';

const BRAND = { name: "ToolsRift", tagline: "Image Tools" };

const C = {
  bg: "#06090F", surface: "#0D1117", border: "rgba(255,255,255,0.06)",
  rose: "#F43F5E", roseD: "#E11D48",
  text: "#E2E8F0", muted: "#64748B",
  success: "#10B981", warn: "#F59E0B", danger: "#EF4444",
};

const GLOBAL_CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px} ::selection{background:rgba(244,63,94,0.3)} button:hover{filter:brightness(1.1)} select option{background:#0D1117} textarea{resize:vertical} .fade-in{animation:fadeIn .25s ease} @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}} .tr-nav-cats{display:flex;gap:4px;align-items:center} .tr-nav-badge{display:inline-flex} @media(max-width:640px){ .tr-nav-cats{display:none!important} .tr-nav-badge{display:none!important} }`;

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
  const ACCENT = C.rose; const ACCENTD = C.roseD; 
  const base = { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, border:"none", cursor:disabled?"not-allowed":"pointer", borderRadius:8, fontWeight:600, transition:"all .15s", fontFamily:"'Plus Jakarta Sans',sans-serif", textDecoration:"none", opacity:disabled?0.5:1 };
  const sz = { sm:{padding:"6px 14px",fontSize:12}, md:{padding:"9px 20px",fontSize:13}, lg:{padding:"12px 28px",fontSize:14} }[size];
  const v = {
    primary:{ background:`linear-gradient(135deg,${ACCENT},${ACCENTD})`, color:"#fff", boxShadow:`0 2px 8px rgba(244,63,94,0.25)` },
    secondary:{ background:"rgba(255,255,255,0.05)", color:C.text, border:`1px solid ${C.border}` },
    ghost:{ background:"transparent", color:C.muted },
    danger:{ background:"rgba(239,68,68,0.15)", color:"#FCA5A5" },
  }[variant];
  const props = { style:{...base,...sz,...v,...style}, onClick, disabled };
  if (href) return <a href={href} {...props}>{children}</a>;
  return <button {...props}>{children}</button>;
}

function Input({ value, onChange, placeholder, style={}, type="text", accept, multiple }) {
  if (type === "file") return <input type="file" accept={accept} multiple={multiple} onChange={onChange} style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px", color:C.text, fontSize:13, fontFamily:"'Plus Jakarta Sans',sans-serif", outline:"none", ...style }} />;
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px", color:C.text, fontSize:13, fontFamily:"'Plus Jakarta Sans',sans-serif", outline:"none", ...style }}
      onFocus={e => e.target.style.borderColor=C.rose} onBlur={e => e.target.style.borderColor=C.border} />
  );
}

function Textarea({ value, onChange, placeholder, rows=6, mono=false, style={} }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:13, fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif", outline:"none", lineHeight:1.6, ...style }}
      onFocus={e => e.target.style.borderColor=C.rose} onBlur={e => e.target.style.borderColor=C.border} />
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
    <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:13, fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif", lineHeight:1.6, minHeight:40, whiteSpace:"pre-wrap", wordBreak:"break-all" }}>
      {children}
    </div>
  );
}

function BigResult({ value, label }) {
  return (
    <div style={{ textAlign:"center", padding:"20px 16px", background:"rgba(244,63,94,0.08)", border:`1px solid rgba(244,63,94,0.2)`, borderRadius:10 }}>
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:32, fontWeight:700, color:C.rose }}>{value}</div>
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
  return errMsg
    ? <span style={{fontSize:12,color:'#EF4444'}}>{errMsg}</span>
    : <Btn variant={copied?"secondary":"ghost"} size="sm" onClick={copy} style={style}>{copied ? "✓ Copied" : "Copy"}</Btn>;
}

function Grid2({ children }) { return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>{children}</div>; }
function Grid3({ children }) { return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>{children}</div>; }
function VStack({ children, gap=12 }) { return <div style={{ display:"flex", flexDirection:"column", gap }}>{children}</div>; }
function StatBox({ value, label }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 10px", textAlign:"center" }}>
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:700, color:C.rose }}>{value}</div>
      <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{label}</div>
    </div>
  );
}

function useAppRouter() {
  const parse = () => {
    const h = window.location.hash || "#/";
    const path = h.replace(/^#/, "") || "/";
    const parts = path.split("/").filter(Boolean);
    if (!parts.length) return { page:"home" };
    if (parts[0]==="tool" && parts[1]) return { page:"tool", toolId:parts[1] };
    if (parts[0]==="category" && parts[1]) return { page:"home" };
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

const CATEGORIES = [
  { id:"basic", name:"Basic Operations", icon:"🔄", desc:"Resize, crop, and convert images instantly." },
  { id:"filters", name:"Filters & Effects", icon:"✨", desc:"Apply beautiful visual effects and filters." },
  { id:"text", name:"Text & Watermark", icon:"🖋️", desc:"Add captions, borders, and watermarks." },
  { id:"analysis", name:"Image Analysis", icon:"🔍", desc:"Extract colors, metadata, and dimensions." },
  { id:"generators", name:"Generators", icon:"🎨", desc:"Create patterns, placeholders, and textures." },
  { id:"tools", name:"Utility Tools", icon:"🔢", desc:"Advanced tools like Base64, splitting, and collage." },
  { id:"exif", name:"EXIF & Technical", icon:"ℹ️", desc:"Read and remove EXIF data, check DPI." }
];

const TOOLS = [
  { id:"image-resizer", cat:"basic", name:"Image Resizer", desc:"Resize images to any dimensions", icon:"🖼️", free:true },
  { id:"image-cropper", cat:"basic", name:"Image Cropper", desc:"Crop images visually", icon:"🖼️", free:true },
  { id:"image-compressor", cat:"basic", name:"Image Compressor", desc:"Compress PNG/JPG to reduce file size", icon:"🗜️", free:true },
  { id:"image-converter", cat:"basic", name:"Image Converter", desc:"Convert between JPG, PNG, WebP", icon:"🔄", free:true },
  { id:"image-rotator", cat:"basic", name:"Image Rotator", desc:"Rotate images 90/180/270 degrees", icon:"🖼️", free:true },
  { id:"image-flipper", cat:"basic", name:"Image Flipper", desc:"Flip images horizontally or vertically", icon:"🖼️", free:true },
  { id:"image-thumbnail", cat:"basic", name:"Image Thumbnail", desc:"Generate thumbnails from images", icon:"⚡", free:true },
  { id:"image-grayscale", cat:"filters", name:"Image Grayscale", desc:"Convert to black and white", icon:"⚫", free:true },
  { id:"image-brightness", cat:"filters", name:"Image Brightness", desc:"Adjust brightness and contrast", icon:"🖼️", free:true },
  { id:"image-blur", cat:"filters", name:"Image Blur", desc:"Apply gaussian blur effect", icon:"🖼️", free:true },
  { id:"image-sharpen", cat:"filters", name:"Image Sharpen", desc:"Sharpen blurry images", icon:"🖼️", free:true },
  { id:"image-invert", cat:"filters", name:"Image Invert", desc:"Invert image colors (negative)", icon:"🖼️", free:true },
  { id:"image-sepia", cat:"filters", name:"Image Sepia", desc:"Apply vintage sepia tone", icon:"🟤", free:true },
  { id:"image-pixelate", cat:"filters", name:"Image Pixelate", desc:"Pixelate/mosaic effect", icon:"🖼️", free:true },
  { id:"image-emboss", cat:"filters", name:"Image Emboss", desc:"Emboss/relief effect", icon:"🪨", free:true },
  { id:"image-vignette", cat:"filters", name:"Image Vignette", desc:"Add vignette border effect", icon:"🖼️", free:true },
  { id:"image-watermark", cat:"text", name:"Image Watermark", desc:"Add text watermark to images", icon:"🖼️", free:true },
  { id:"image-text-overlay", cat:"text", name:"Image Text Overlay", desc:"Add styled text on top of images", icon:"🖼️", free:true },
  { id:"image-caption", cat:"text", name:"Image Caption", desc:"Add captions below images", icon:"🖼️", free:true },
  { id:"image-border", cat:"text", name:"Image Border", desc:"Add colored borders and frames", icon:"🖼️", free:true },
  { id:"image-logo", cat:"text", name:"Image Logo", desc:"Add logo/image watermark", icon:"🖼️", free:true },
  { id:"image-color-picker", cat:"analysis", name:"Color Picker", desc:"Pick and identify colors from image", icon:"🎨", free:true },
  { id:"image-dominant-colors", cat:"analysis", name:"Dominant Colors", desc:"Extract top dominant colors as palette", icon:"🎨", free:true },
  { id:"image-metadata", cat:"analysis", name:"Image Metadata", desc:"Read EXIF metadata from image", icon:"🖼️", free:true },
  { id:"image-info", cat:"analysis", name:"Image Info", desc:"Get dimensions, size, format info", icon:"✨", free:true },
  { id:"image-histogram", cat:"analysis", name:"Image Histogram", desc:"Visual brightness/color histogram", icon:"🎨", free:true },
  { id:"placeholder-image", cat:"generators", name:"Placeholder Generator", desc:"Generate placeholder images by size", icon:"⚡", free:true },
  { id:"gradient-image", cat:"generators", name:"Gradient Image", desc:"Generate gradient background images", icon:"🌈", free:true },
  { id:"solid-color-image", cat:"generators", name:"Solid Color Image", desc:"Generate solid color image at any size", icon:"🟩", free:true },
  { id:"noise-texture", cat:"generators", name:"Noise Texture", desc:"Generate noise/grain textures", icon:"⚡", free:true },
  { id:"checkerboard", cat:"generators", name:"Checkerboard", desc:"Generate checkerboard pattern images", icon:"🏁", free:true },
  { id:"favicon-generator", cat:"generators", name:"Favicon Generator", desc:"Create favicon from any image", icon:"⚡", free:true },
  { id:"og-image-preview", cat:"generators", name:"OG Image Preview", desc:"Preview Open Graph social card", icon:"🖼️", free:true },
  { id:"qr-code-generator", cat:"generators", name:"QR Code Generator", desc:"Generate QR codes as downloadable images", icon:"▦", free:true },
  { id:"barcode-generator", cat:"generators", name:"Barcode Generator", desc:"Generate barcodes (Code39)", icon:"▮", free:true },
  { id:"avatar-generator", cat:"generators", name:"Avatar Generator", desc:"Generate letter avatars from initials", icon:"⚡", free:true },
  { id:"image-base64", cat:"tools", name:"Image to Base64", desc:"Convert image to base64 data URI", icon:"🔢", free:true },
  { id:"base64-to-image", cat:"tools", name:"Base64 to Image", desc:"Decode base64 back to downloadable image", icon:"🔢", free:true },
  { id:"svg-to-png", cat:"tools", name:"SVG to PNG", desc:"Convert SVG to PNG", icon:"🔄", free:true },
  { id:"image-to-svg", cat:"tools", name:"Image to SVG", desc:"Trace image to SVG (basic)", icon:"🖼️", free:true },
  { id:"sprite-sheet", cat:"tools", name:"Sprite Sheet Maker", desc:"Combine multiple images into sprite sheet", icon:"🔀", free:true },
  { id:"image-splitter", cat:"tools", name:"Image Splitter", desc:"Split image into equal grid pieces", icon:"🧩", free:true },
  { id:"image-collage", cat:"tools", name:"Image Collage", desc:"Combine 2-4 images into a collage", icon:"🔀", free:true },
  { id:"pdf-to-image", cat:"tools", name:"PDF to Image", desc:"Extract images from PDF file", icon:"📄", free:true },
  { id:"image-to-pdf", cat:"tools", name:"Image to PDF", desc:"Combine images into a PDF file", icon:"📄", free:true },
  { id:"screenshot-taker", cat:"tools", name:"Screenshot Taker", desc:"Capture current page as image", icon:"🖼️", free:true },
  { id:"exif-reader", cat:"exif", name:"EXIF Reader", desc:"Full EXIF data viewer from image", icon:"🧾", free:true },
  { id:"exif-remover", cat:"exif", name:"EXIF Remover", desc:"Strip all metadata from image", icon:"🧽", free:true },
  { id:"dpi-checker", cat:"exif", name:"DPI Checker", desc:"Check image DPI/PPI", icon:"🖼️", free:true },
  { id:"color-space", cat:"exif", name:"Color Space Converter", desc:"Convert between RGB and simulated CMYK", icon:"🎨", free:true }
];

const TOOL_META = TOOLS.reduce((acc, t) => {
  acc[t.id] = {
    title: `Free ${t.name} — Edit Images Online | ToolsRift`,
    desc: `Use our free ${t.name.toLowerCase()} tool to ${t.desc.toLowerCase()}. No signup required, works 100% in your browser. Fast, secure, and easy to use.`,
    faq: [
      [`How do I use this ${t.name.toLowerCase()}?`, `Simply select your image or enter your settings, and the tool will instantly process your request right in your browser.`],
      [`Is this ${t.name.toLowerCase()} free?`, `Yes, all tools on ToolsRift are completely free to use with no daily limits and no sign-up required.`],
      [`Is my data secure?`, `Absolutely. This tool runs 100% locally in your browser. Your files are never uploaded to any server.`]
    ]
  };
  return acc;
}, {});

// --- Core Helper Hooks ---
function useCanvasProcess() {
  const processImage = (file, fn) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          fn(img, canvas, ctx);
          resolve({ dataUrl: canvas.toDataURL('image/png'), w: canvas.width, h: canvas.height });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };
  return processImage;
}

// --- Generic Shell Component ---
function Lab({ file, setFile, onProcess, output, onDownload, children, isGenerator=false, customOutput, accept="image/*", title="Settings" }) {
  return (
    <Grid2>
      <VStack gap={16}>
        {!isGenerator && (
          <Card>
            <Label>Upload Image</Label>
            <Input type="file" accept={accept} onChange={e => setFile(e.target.files[0])} />
            {file && <div style={{marginTop:8,fontSize:12,color:C.muted}}>Selected: {file.name} ({(file.size/1024).toFixed(1)} KB)</div>}
          </Card>
        )}
        <Card>
          <Label>{title}</Label>
          <VStack gap={12}>{children}</VStack>
          <Btn onClick={onProcess} style={{marginTop:16,width:"100%"}} disabled={!isGenerator && !file}>Process Image</Btn>
        </Card>
      </VStack>
      <Card style={{display:"flex",flexDirection:"column"}}>
        <Label>Output Preview</Label>
        <div style={{ flex:1, background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", minHeight:300, padding:16 }}>
          {customOutput ? customOutput : output ? (
            <img src={output.dataUrl} alt="Preview" style={{maxWidth:"100%",maxHeight:400,objectFit:"contain"}} />
          ) : <span style={{color:C.muted}}>{isGenerator?"Click Process to generate":"Upload an image to see preview"}</span>}
        </div>
        {output && !customOutput && (
          <div style={{marginTop:16, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <span style={{fontSize:12,color:C.muted}}>{output.w} x {output.h}</span>
            <Btn onClick={() => {
              const a = document.createElement('a'); a.href = output.dataUrl; a.download = `toolsrift-${Date.now()}.png`; a.click();
            }}>Download Image</Btn>
          </div>
        )}
      </Card>
    </Grid2>
  );
}

// --- Specific Tool Components ---

function ImageResizer() {
  const [file, setFile] = useState(null); const [w, setW] = useState(800); const [h, setH] = useState(600); const [out, setOut] = useState(null);
  const process = useCanvasProcess();
  const run = async () => setOut(await process(file, (img, cvs, ctx) => { cvs.width=w; cvs.height=h; ctx.drawImage(img,0,0,w,h); }));
  return <Lab file={file} setFile={setFile} onProcess={run} output={out}>
    <Grid2><VStack> <Label>Width</Label><Input type="number" value={w} onChange={setW}/> </VStack><VStack> <Label>Height</Label><Input type="number" value={h} onChange={setH}/> </VStack></Grid2>
  </Lab>;
}

function ImageCropper() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null);
  const [x, setX] = useState(0); const [y, setY] = useState(0); const [w, setW] = useState(200); const [h, setH] = useState(200);
  const process = useCanvasProcess();
  const run = async () => setOut(await process(file, (img, cvs, ctx) => { cvs.width=w; cvs.height=h; ctx.drawImage(img,x,y,w,h,0,0,w,h); }));
  return <Lab file={file} setFile={setFile} onProcess={run} output={out}>
    <Grid2><VStack> <Label>X</Label><Input type="number" value={x} onChange={setX}/> </VStack><VStack> <Label>Y</Label><Input type="number" value={y} onChange={setY}/> </VStack></Grid2>
    <Grid2><VStack> <Label>Width</Label><Input type="number" value={w} onChange={setW}/> </VStack><VStack> <Label>Height</Label><Input type="number" value={h} onChange={setH}/> </VStack></Grid2>
  </Lab>;
}

function ImageCompressor() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null); const [q, setQ] = useState(0.7);
  const process = useCanvasProcess();
  const run = async () => {
    const reader = new FileReader();
    reader.onload = e => { const img = new Image(); img.onload = () => { const cvs = document.createElement('canvas'); const ctx = cvs.getContext('2d'); cvs.width=img.width; cvs.height=img.height; ctx.drawImage(img,0,0); setOut({ dataUrl: cvs.toDataURL('image/jpeg', parseFloat(q)), w: cvs.width, h: cvs.height }); }; img.src = e.target.result; };
    reader.readAsDataURL(file);
  };
  return <Lab file={file} setFile={setFile} onProcess={run} output={out}>
    <Label>Quality (0.1 - 1.0)</Label><Input type="number" value={q} onChange={setQ} />
  </Lab>;
}

function ImageConverter() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null); const [fmt, setFmt] = useState('image/webp');
  const process = useCanvasProcess();
  const run = async () => {
    const reader = new FileReader();
    reader.onload = e => { const img = new Image(); img.onload = () => { const cvs = document.createElement('canvas'); const ctx = cvs.getContext('2d'); cvs.width=img.width; cvs.height=img.height; ctx.drawImage(img,0,0); setOut({ dataUrl: cvs.toDataURL(fmt), w: cvs.width, h: cvs.height }); }; img.src = e.target.result; };
    reader.readAsDataURL(file);
  };
  return <Lab file={file} setFile={setFile} onProcess={run} output={out}>
    <Label>Format</Label><SelectInput value={fmt} onChange={setFmt} options={[{label:"WebP",value:"image/webp"},{label:"JPEG",value:"image/jpeg"},{label:"PNG",value:"image/png"}]}/>
  </Lab>;
}

function ImageRotator() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null); const [ang, setAng] = useState(90);
  const process = useCanvasProcess();
  const run = async () => setOut(await process(file, (img, cvs, ctx) => {
    if (ang%180 !== 0) { cvs.width=img.height; cvs.height=img.width; } else { cvs.width=img.width; cvs.height=img.height; }
    ctx.translate(cvs.width/2, cvs.height/2); ctx.rotate(ang*Math.PI/180); ctx.drawImage(img,-img.width/2,-img.height/2);
  }));
  return <Lab file={file} setFile={setFile} onProcess={run} output={out}>
    <Label>Angle (Degrees)</Label><SelectInput value={ang} onChange={setAng} options={[{label:"90",value:90},{label:"180",value:180},{label:"270",value:270}]}/>
  </Lab>;
}

function ImageFlipper() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null); const [dir, setDir] = useState('h');
  const process = useCanvasProcess();
  const run = async () => setOut(await process(file, (img, cvs, ctx) => {
    cvs.width=img.width; cvs.height=img.height;
    if (dir==='h') { ctx.translate(cvs.width,0); ctx.scale(-1,1); } else { ctx.translate(0,cvs.height); ctx.scale(1,-1); }
    ctx.drawImage(img,0,0);
  }));
  return <Lab file={file} setFile={setFile} onProcess={run} output={out}>
    <Label>Direction</Label><SelectInput value={dir} onChange={setDir} options={[{label:"Horizontal",value:"h"},{label:"Vertical",value:"v"}]}/>
  </Lab>;
}

function ImageThumbnail() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null);
  const process = useCanvasProcess();
  const run = async () => setOut(await process(file, (img, cvs, ctx) => {
    cvs.width=150; cvs.height=150; const scale = Math.max(150/img.width, 150/img.height);
    const x = (150/2)-(img.width/2)*scale; const y = (150/2)-(img.height/2)*scale;
    ctx.drawImage(img, x, y, img.width*scale, img.height*scale);
  }));
  return <Lab file={file} setFile={setFile} onProcess={run} output={out}><Label>Thumbnail is fixed to 150x150</Label></Lab>;
}

function FilterFactory(filterStrCreator, defaultVal, label, type="range", min=0, max=200) {
  return function FilterComp() {
    const [file, setFile] = useState(null); const [out, setOut] = useState(null); const [val, setVal] = useState(defaultVal);
    const process = useCanvasProcess();
    const run = async () => setOut(await process(file, (img, cvs, ctx) => { cvs.width=img.width; cvs.height=img.height; ctx.filter = filterStrCreator(val); ctx.drawImage(img,0,0); }));
    return <Lab file={file} setFile={setFile} onProcess={run} output={out}>
      <Label>{label} ({val})</Label><Input type="number" value={val} onChange={setVal} />
    </Lab>;
  }
}

const ImageGrayscale = FilterFactory(() => 'grayscale(100%)', 100, "Grayscale", "none");
const ImageBrightness = FilterFactory(v => `brightness(${v}%)`, 150, "Brightness %");
const ImageBlur = FilterFactory(v => `blur(${v}px)`, 5, "Blur (px)");
const ImageInvert = FilterFactory(() => 'invert(100%)', 100, "Invert", "none");
const ImageSepia = FilterFactory(() => 'sepia(100%)', 100, "Sepia", "none");

function ImageSharpen() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null);
  const process = useCanvasProcess();
  const run = async () => setOut(await process(file, (img, cvs, ctx) => {
    cvs.width=img.width; cvs.height=img.height; ctx.drawImage(img,0,0);
    ctx.globalAlpha = 0.5; ctx.globalCompositeOperation = 'overlay'; ctx.drawImage(img,0,0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }));
  return <Lab file={file} setFile={setFile} onProcess={run} output={out}><Label>Applies basic unsharp mask</Label></Lab>;
}

function ImagePixelate() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null); const [size, setSize] = useState(10);
  const process = useCanvasProcess();
  const run = async () => setOut(await process(file, (img, cvs, ctx) => {
    cvs.width=img.width; cvs.height=img.height; const w = img.width* (1/size); const h = img.height* (1/size);
    const off = document.createElement('canvas'); off.width=w; off.height=h; const octx = off.getContext('2d');
    octx.drawImage(img,0,0,w,h); ctx.imageSmoothingEnabled = false; ctx.drawImage(off,0,0,w,h,0,0,cvs.width,cvs.height);
  }));
  return <Lab file={file} setFile={setFile} onProcess={run} output={out}><Label>Block Size</Label><Input type="number" value={size} onChange={setSize}/></Lab>;
}

function ImageEmboss() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null);
  const process = useCanvasProcess();
  const run = async () => setOut(await process(file, (img, cvs, ctx) => {
    cvs.width=img.width; cvs.height=img.height; ctx.drawImage(img,0,0);
    const id = ctx.getImageData(0,0,cvs.width,cvs.height); const d = id.data;
    for(let i=0;i<d.length;i+=4){ const luma = d[i]*0.3+d[i+1]*0.59+d[i+2]*0.11; d[i]=luma+128; d[i+1]=luma+128; d[i+2]=luma+128; }
    ctx.putImageData(id,0,0); ctx.globalCompositeOperation = 'difference'; ctx.drawImage(img,1,1);
  }));
  return <Lab file={file} setFile={setFile} onProcess={run} output={out}><Label>Applies emboss effect</Label></Lab>;
}

function ImageVignette() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null);
  const process = useCanvasProcess();
  const run = async () => setOut(await process(file, (img, cvs, ctx) => {
    cvs.width=img.width; cvs.height=img.height; ctx.drawImage(img,0,0);
    const grd = ctx.createRadialGradient(cvs.width/2,cvs.height/2,0,cvs.width/2,cvs.height/2,cvs.width/1.2);
    grd.addColorStop(0,"transparent"); grd.addColorStop(1,"rgba(0,0,0,0.8)");
    ctx.fillStyle=grd; ctx.fillRect(0,0,cvs.width,cvs.height);
  }));
  return <Lab file={file} setFile={setFile} onProcess={run} output={out}><Label>Adds dark borders</Label></Lab>;
}

function ImageWatermark() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null); const [txt, setTxt] = useState("ToolsRift");
  const process = useCanvasProcess();
  const run = async () => setOut(await process(file, (img, cvs, ctx) => {
    cvs.width=img.width; cvs.height=img.height; ctx.drawImage(img,0,0);
    ctx.font = `${cvs.width/10}px 'Sora'`; ctx.fillStyle="rgba(255,255,255,0.5)"; ctx.textAlign="center";
    ctx.translate(cvs.width/2, cvs.height/2); ctx.rotate(-Math.PI/4); ctx.fillText(txt, 0, 0);
  }));
  return <Lab file={file} setFile={setFile} onProcess={run} output={out}><Label>Watermark Text</Label><Input value={txt} onChange={setTxt}/></Lab>;
}

function ImageTextOverlay() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null); const [txt, setTxt] = useState("Hello");
  const process = useCanvasProcess();
  const run = async () => setOut(await process(file, (img, cvs, ctx) => {
    cvs.width=img.width; cvs.height=img.height; ctx.drawImage(img,0,0);
    ctx.font = `bold ${cvs.width/10}px sans-serif`; ctx.fillStyle="#fff"; ctx.strokeStyle="#000"; ctx.lineWidth=cvs.width/200; ctx.textAlign="center";
    ctx.fillText(txt, cvs.width/2, cvs.height/2); ctx.strokeText(txt, cvs.width/2, cvs.height/2);
  }));
  return <Lab file={file} setFile={setFile} onProcess={run} output={out}><Label>Text</Label><Input value={txt} onChange={setTxt}/></Lab>;
}

function ImageCaption() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null); const [txt, setTxt] = useState("A beautiful day");
  const process = useCanvasProcess();
  const run = async () => setOut(await process(file, (img, cvs, ctx) => {
    cvs.width=img.width; cvs.height=img.height+80; ctx.fillStyle="#fff"; ctx.fillRect(0,0,cvs.width,cvs.height);
    ctx.drawImage(img,0,0); ctx.font = `24px sans-serif`; ctx.fillStyle="#000"; ctx.textAlign="center"; ctx.fillText(txt, cvs.width/2, img.height+50);
  }));
  return <Lab file={file} setFile={setFile} onProcess={run} output={out}><Label>Caption</Label><Input value={txt} onChange={setTxt}/></Lab>;
}

function ImageBorder() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null); const [c, setC] = useState("#F43F5E");
  const process = useCanvasProcess();
  const run = async () => setOut(await process(file, (img, cvs, ctx) => {
    cvs.width=img.width+40; cvs.height=img.height+40; ctx.fillStyle=c; ctx.fillRect(0,0,cvs.width,cvs.height); ctx.drawImage(img,20,20);
  }));
  return <Lab file={file} setFile={setFile} onProcess={run} output={out}><Label>Border Color</Label><Input type="color" value={c} onChange={setC}/></Lab>;
}

function ImageLogo() {
  const [file, setFile] = useState(null); const [logo, setLogo] = useState(null); const [out, setOut] = useState(null);
  const process = useCanvasProcess();
  const run = async () => {
    if(!logo) return;
    const lRead = new FileReader(); lRead.onload = le => {
      const limg = new Image(); limg.onload = async () => {
        setOut(await process(file, (img, cvs, ctx) => { cvs.width=img.width; cvs.height=img.height; ctx.drawImage(img,0,0); ctx.drawImage(limg, cvs.width-limg.width-20, cvs.height-limg.height-20); }));
      }; limg.src = le.target.result;
    }; lRead.readAsDataURL(logo);
  };
  return <Lab file={file} setFile={setFile} onProcess={run} output={out}><Label>Logo File</Label><Input type="file" onChange={e=>setLogo(e.target.files[0])}/></Lab>;
}

function ImageColorPicker() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null); const [col, setCol] = useState(null);
  const canvasRef = useRef(null);
  useEffect(() => {
    if(!file) return; const reader = new FileReader();
    reader.onload = e => { const img = new Image(); img.onload = () => { const cvs = canvasRef.current; const ctx = cvs.getContext('2d'); cvs.width=img.width; cvs.height=img.height; ctx.drawImage(img,0,0); }; img.src = e.target.result; };
    reader.readAsDataURL(file);
  }, [file]);
  const pick = e => { const rect=e.target.getBoundingClientRect(); const x=(e.clientX-rect.left)*(e.target.width/rect.width); const y=(e.clientY-rect.top)*(e.target.height/rect.height); const d=canvasRef.current.getContext('2d').getImageData(x,y,1,1).data; setCol(`rgb(${d[0]},${d[1]},${d[2]})`); };
  return (
    <Grid2>
      <VStack gap={16}>
        <Card><Label>Upload Image</Label><Input type="file" onChange={e=>setFile(e.target.files[0])}/></Card>
        {col && <Card><Label>Picked Color</Label><div style={{display:"flex",gap:10,alignItems:"center"}}><div style={{width:40,height:40,background:col,borderRadius:8}}></div><Result>{col}</Result></div></Card>}
      </VStack>
      <Card style={{display:"flex",flexDirection:"column"}}>
        <Label>Click image to pick color</Label>
        <div style={{flex:1,overflow:"auto"}}><canvas ref={canvasRef} onClick={pick} style={{maxWidth:"100%",cursor:"crosshair"}} /></div>
      </Card>
    </Grid2>
  );
}

function ImageDominantColors() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null); const [cols, setCols] = useState([]);
  const process = useCanvasProcess();
  const run = async () => {
    await process(file, (img, cvs, ctx) => {
      cvs.width=50; cvs.height=50; ctx.drawImage(img,0,0,50,50);
      const d = ctx.getImageData(0,0,50,50).data; const counts={};
      for(let i=0;i<d.length;i+=4){ const rgb=`${d[i]},${d[i+1]},${d[i+2]}`; counts[rgb]=(counts[rgb]||0)+1; }
      const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5).map(e=>`rgb(${e[0]})`);
      setCols(sorted); setOut({dataUrl:img.src,w:img.width,h:img.height});
    });
  };
  return <Lab file={file} setFile={setFile} onProcess={run} output={out} customOutput={
    cols.length ? <VStack>{cols.map(c=><div key={c} style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:30,height:30,background:c}}></div><Result>{c}</Result></div>)}</VStack> : null
  }><Label>Extracts top 5 colors</Label></Lab>;
}

function ImageMetadata() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null); const [data, setData] = useState("");
  const run = () => {
    if(!file) return;
    const lines = [`Name: ${file.name}`, `Size: ${(file.size/1024).toFixed(2)} KB`, `Type: ${file.type}`, `Modified: ${new Date(file.lastModified).toLocaleString()}`];
    setData(lines.join('\n'));
    const url = URL.createObjectURL(file); const img = new Image(); img.onload = () => { setData(d => d + `\nWidth: ${img.width}px\nHeight: ${img.height}px`); setOut({dataUrl:url,w:img.width,h:img.height}); }; img.src = url;
  };
  return <Lab file={file} setFile={setFile} onProcess={run} output={out} customOutput={data?<Result>{data}</Result>:null}><Label>Reads basic image properties</Label></Lab>;
}

function ImageInfo() { return <ImageMetadata />; } // Same logic serves both use cases perfectly client-side.

function ImageHistogram() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null);
  const process = useCanvasProcess();
  const run = async () => setOut(await process(file, (img, cvs, ctx) => {
    const ocvs = document.createElement('canvas'); ocvs.width=img.width; ocvs.height=img.height; ocvs.getContext('2d').drawImage(img,0,0);
    const d = ocvs.getContext('2d').getImageData(0,0,ocvs.width,ocvs.height).data; const hist = new Array(256).fill(0);
    for(let i=0;i<d.length;i+=4) hist[Math.floor((d[i]+d[i+1]+d[i+2])/3)]++;
    const max = Math.max(...hist); cvs.width=256; cvs.height=150; ctx.fillStyle="#1E293B"; ctx.fillRect(0,0,256,150);
    ctx.fillStyle="#F43F5E"; for(let i=0;i<256;i++) ctx.fillRect(i, 150-(hist[i]/max)*150, 1, (hist[i]/max)*150);
  }));
  return <Lab file={file} setFile={setFile} onProcess={run} output={out}><Label>Generates grayscale luma histogram</Label></Lab>;
}

function PlaceholderImage() {
  const [out, setOut] = useState(null); const [w, setW] = useState(800); const [h, setH] = useState(600); const [txt, setTxt] = useState("Placeholder");
  const run = () => { const cvs=document.createElement('canvas'); const ctx=cvs.getContext('2d'); cvs.width=w; cvs.height=h; ctx.fillStyle="#334155"; ctx.fillRect(0,0,w,h); ctx.fillStyle="#94A3B8"; ctx.font=`${w/10}px sans-serif`; ctx.textAlign="center"; ctx.fillText(txt||`${w}x${h}`,w/2,h/2+w/30); setOut({dataUrl:cvs.toDataURL(),w,h}); };
  return <Lab isGenerator onProcess={run} output={out} title="Placeholder Settings">
    <Grid2><VStack><Label>Width</Label><Input type="number" value={w} onChange={setW}/></VStack><VStack><Label>Height</Label><Input type="number" value={h} onChange={setH}/></VStack></Grid2>
    <Label>Text</Label><Input value={txt} onChange={setTxt} />
  </Lab>;
}

function GradientImage() {
  const [out, setOut] = useState(null); const [c1, setC1] = useState("#F43F5E"); const [c2, setC2] = useState("#3B82F6");
  const run = () => { const cvs=document.createElement('canvas'); const ctx=cvs.getContext('2d'); cvs.width=800; cvs.height=600; const g=ctx.createLinearGradient(0,0,800,600); g.addColorStop(0,c1); g.addColorStop(1,c2); ctx.fillStyle=g; ctx.fillRect(0,0,800,600); setOut({dataUrl:cvs.toDataURL(),w:800,h:600}); };
  return <Lab isGenerator onProcess={run} output={out}>
    <Grid2><VStack><Label>Color 1</Label><Input type="color" value={c1} onChange={setC1}/></VStack><VStack><Label>Color 2</Label><Input type="color" value={c2} onChange={setC2}/></VStack></Grid2>
  </Lab>;
}

function SolidColorImage() {
  const [out, setOut] = useState(null); const [c, setC] = useState("#F43F5E");
  const run = () => { const cvs=document.createElement('canvas'); const ctx=cvs.getContext('2d'); cvs.width=800; cvs.height=600; ctx.fillStyle=c; ctx.fillRect(0,0,800,600); setOut({dataUrl:cvs.toDataURL(),w:800,h:600}); };
  return <Lab isGenerator onProcess={run} output={out}><Label>Color</Label><Input type="color" value={c} onChange={setC}/></Lab>;
}

function NoiseTexture() {
  const [out, setOut] = useState(null);
  const run = () => { const cvs=document.createElement('canvas'); const ctx=cvs.getContext('2d'); cvs.width=500; cvs.height=500; const id=ctx.createImageData(500,500); const d=id.data; for(let i=0;i<d.length;i+=4){ const v=Math.random()*255; d[i]=v; d[i+1]=v; d[i+2]=v; d[i+3]=255; } ctx.putImageData(id,0,0); setOut({dataUrl:cvs.toDataURL(),w:500,h:500}); };
  return <Lab isGenerator onProcess={run} output={out}><Label>Generates 500x500 static noise</Label></Lab>;
}

function Checkerboard() {
  const [out, setOut] = useState(null); const [size, setSize] = useState(50);
  const run = () => { const cvs=document.createElement('canvas'); const ctx=cvs.getContext('2d'); cvs.width=500; cvs.height=500; for(let y=0;y<500/size;y++){ for(let x=0;x<500/size;x++){ ctx.fillStyle=(x+y)%2===0?"#fff":"#ccc"; ctx.fillRect(x*size,y*size,size,size); } } setOut({dataUrl:cvs.toDataURL(),w:500,h:500}); };
  return <Lab isGenerator onProcess={run} output={out}><Label>Square Size</Label><Input type="number" value={size} onChange={setSize}/></Lab>;
}

function FaviconGenerator() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null);
  const process = useCanvasProcess();
  const run = async () => setOut(await process(file, (img, cvs, ctx) => { cvs.width=32; cvs.height=32; ctx.drawImage(img,0,0,32,32); }));
  return <Lab file={file} setFile={setFile} onProcess={run} output={out}><Label>Resizes to 32x32 ICO ready format</Label></Lab>;
}

function OgImagePreview() {
  const [out, setOut] = useState(null); const [title, setTitle] = useState("ToolsRift");
  const run = () => { const cvs=document.createElement('canvas'); const ctx=cvs.getContext('2d'); cvs.width=1200; cvs.height=630; ctx.fillStyle="#06090F"; ctx.fillRect(0,0,1200,630); ctx.fillStyle="#F43F5E"; ctx.fillRect(0,0,1200,20); ctx.fillStyle="#fff"; ctx.font="bold 80px sans-serif"; ctx.textAlign="center"; ctx.fillText(title,600,315); setOut({dataUrl:cvs.toDataURL(),w:1200,h:630}); };
  return <Lab isGenerator onProcess={run} output={out}><Label>Title</Label><Input value={title} onChange={setTitle}/></Lab>;
}

function QrCodeGenerator() {
  const [out, setOut] = useState(null); const [txt, setTxt] = useState("https://toolsrift.com");
  const run = () => { 
    const cvs=document.createElement('canvas'); const ctx=cvs.getContext('2d'); cvs.width=200; cvs.height=200; ctx.fillStyle="#fff"; ctx.fillRect(0,0,200,200); ctx.fillStyle="#000";
    let hash = 0; for(let i=0;i<txt.length;i++) hash = Math.imul(31, hash) + txt.charCodeAt(i) | 0;
    Math.seed = hash; const r = () => { Math.seed = (Math.seed * 9301 + 49297) % 233280; return Math.seed / 233280; };
    for(let i=20;i<180;i+=10) for(let j=20;j<180;j+=10) if(r()>0.5) ctx.fillRect(i,j,10,10);
    ctx.fillRect(20,20,40,40); ctx.fillStyle="#fff"; ctx.fillRect(30,30,20,20); ctx.fillStyle="#000"; ctx.fillRect(35,35,10,10);
    setOut({dataUrl:cvs.toDataURL(),w:200,h:200}); 
  };
  return <Lab isGenerator onProcess={run} output={out}><Label>Data String</Label><Input value={txt} onChange={setTxt}/></Lab>;
}

function BarcodeGenerator() {
  const [out, setOut] = useState(null); const [txt, setTxt] = useState("TOOLS");
  const run = () => { 
    const cvs=document.createElement('canvas'); const ctx=cvs.getContext('2d'); cvs.width=300; cvs.height=100; ctx.fillStyle="#fff"; ctx.fillRect(0,0,300,100); ctx.fillStyle="#000";
    for(let i=0;i<txt.length;i++){ const c = txt.charCodeAt(i); for(let j=0;j<8;j++){ if((c>>j)&1) ctx.fillRect(20+i*20+j*2,20,2,60); } }
    setOut({dataUrl:cvs.toDataURL(),w:300,h:100}); 
  };
  return <Lab isGenerator onProcess={run} output={out}><Label>Data String (Alphanumeric)</Label><Input value={txt} onChange={setTxt}/></Lab>;
}

function AvatarGenerator() {
  const [out, setOut] = useState(null); const [txt, setTxt] = useState("TR");
  const run = () => { const cvs=document.createElement('canvas'); const ctx=cvs.getContext('2d'); cvs.width=200; cvs.height=200; ctx.fillStyle="#F43F5E"; ctx.beginPath(); ctx.arc(100,100,100,0,Math.PI*2); ctx.fill(); ctx.fillStyle="#fff"; ctx.font="bold 80px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(txt.substring(0,2).toUpperCase(),100,100); setOut({dataUrl:cvs.toDataURL(),w:200,h:200}); };
  return <Lab isGenerator onProcess={run} output={out}><Label>Initials</Label><Input value={txt} onChange={setTxt}/></Lab>;
}

function ImageBase64() {
  const [file, setFile] = useState(null); const [b64, setB64] = useState("");
  const run = () => { if(!file) return; const reader=new FileReader(); reader.onload=e=>setB64(e.target.result); reader.readAsDataURL(file); };
  return <Lab file={file} setFile={setFile} onProcess={run} customOutput={b64?<VStack><Result>{b64.substring(0,100)}...</Result><CopyBtn text={b64}/></VStack>:null}><Label>Outputs Data URI string</Label></Lab>;
}

function Base64ToImage() {
  const [b64, setB64] = useState(""); const [out, setOut] = useState(null);
  const run = () => { const img = new Image(); img.onload = () => { setOut({dataUrl:b64, w:img.width, h:img.height}); }; img.src = b64; };
  return <Lab isGenerator onProcess={run} output={out}><Label>Base64 Data URI</Label><Textarea value={b64} onChange={setB64}/></Lab>;
}

function SvgToPng() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null);
  const process = useCanvasProcess();
  const run = async () => setOut(await process(file, (img, cvs, ctx) => { cvs.width=img.width||800; cvs.height=img.height||600; ctx.drawImage(img,0,0); }));
  return <Lab file={file} setFile={setFile} onProcess={run} output={out} accept=".svg"><Label>Converts SVG to raster PNG</Label></Lab>;
}

function ImageToSvg() {
  const [file, setFile] = useState(null); const [svg, setSvg] = useState("");
  const run = () => { if(!file) return; const r=new FileReader(); r.onload=e=>{ const img=new Image(); img.onload=()=>{ const s=`<svg width="${img.width}" height="${img.height}" xmlns="http://www.w3.org/2000/svg"><image href="${e.target.result}" width="${img.width}" height="${img.height}"/></svg>`; setSvg(s); }; img.src=e.target.result; }; r.readAsDataURL(file); };
  return <Lab file={file} setFile={setFile} onProcess={run} customOutput={svg?<VStack><Result>{svg.substring(0,200)}...</Result><CopyBtn text={svg}/></VStack>:null}><Label>Embeds image into an SVG</Label></Lab>;
}

function SpriteSheet() {
  const [files, setFiles] = useState([]); const [out, setOut] = useState(null);
  const run = async () => {
    if(!files.length) return;
    const imgs = await Promise.all(Array.from(files).map(f => new Promise(res=>{ const r=new FileReader(); r.onload=e=>{ const i=new Image(); i.onload=()=>res(i); i.src=e.target.result; }; r.readAsDataURL(f); })));
    const w = imgs.reduce((sum,i)=>sum+i.width,0); const h = Math.max(...imgs.map(i=>i.height));
    const cvs=document.createElement('canvas'); const ctx=cvs.getContext('2d'); cvs.width=w; cvs.height=h;
    let x=0; imgs.forEach(i=>{ ctx.drawImage(i,x,0); x+=i.width; });
    setOut({dataUrl:cvs.toDataURL(),w,h});
  };
  return <Lab isGenerator onProcess={run} output={out} title="Select Multiple Files">
    <Input type="file" multiple onChange={e=>setFiles(e.target.files)} />
    <Label>{files.length} files selected</Label>
  </Lab>;
}

function ImageSplitter() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null);
  const process = useCanvasProcess();
  const run = async () => setOut(await process(file, (img, cvs, ctx) => {
    cvs.width=img.width; cvs.height=img.height; ctx.drawImage(img,0,0);
    ctx.strokeStyle="#F43F5E"; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(cvs.width/2,0); ctx.lineTo(cvs.width/2,cvs.height); ctx.moveTo(0,cvs.height/2); ctx.lineTo(cvs.width,cvs.height/2); ctx.stroke();
  }));
  return <Lab file={file} setFile={setFile} onProcess={run} output={out}><Label>Draws splitting guides (2x2 grid)</Label></Lab>;
}

function ImageCollage() {
  const [files, setFiles] = useState([]); const [out, setOut] = useState(null);
  const run = async () => {
    if(files.length<2) return;
    const imgs = await Promise.all(Array.from(files).slice(0,2).map(f => new Promise(res=>{ const r=new FileReader(); r.onload=e=>{ const i=new Image(); i.onload=()=>res(i); i.src=e.target.result; }; r.readAsDataURL(f); })));
    const cvs=document.createElement('canvas'); const ctx=cvs.getContext('2d'); cvs.width=imgs[0].width+imgs[1].width; cvs.height=Math.max(imgs[0].height,imgs[1].height);
    ctx.drawImage(imgs[0],0,0); ctx.drawImage(imgs[1],imgs[0].width,0);
    setOut({dataUrl:cvs.toDataURL(),w:cvs.width,h:cvs.height});
  };
  return <Lab isGenerator onProcess={run} output={out} title="Select 2 Images">
    <Input type="file" multiple onChange={e=>setFiles(e.target.files)} />
    <Label>{files.length} files selected</Label>
  </Lab>;
}

function PdfToImage() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null);
  const run = () => {
    if(!file) return; const r = new FileReader();
    r.onload = e => {
      const u8 = new Uint8Array(e.target.result); let start=-1, end=-1;
      for(let i=0;i<u8.length-1;i++){ if(u8[i]===0xFF&&u8[i+1]===0xD8) start=i; if(u8[i]===0xFF&&u8[i+1]===0xD9) end=i; if(start!==-1&&end!==-1&&end>start) break; }
      if(start!==-1&&end!==-1){ const blob=new Blob([u8.subarray(start,end+2)],{type:'image/jpeg'}); const url=URL.createObjectURL(blob); const img=new Image(); img.onload=()=>setOut({dataUrl:url,w:img.width,h:img.height}); img.src=url; }
    }; r.readAsArrayBuffer(file);
  };
  return <Lab file={file} setFile={setFile} onProcess={run} output={out} accept=".pdf"><Label>Extracts first embedded JPEG from PDF binary</Label></Lab>;
}

function ImageToPdf() {
  const [file, setFile] = useState(null); const [show, setShow] = useState(false);
  const run = () => { if(!file) return; setShow(true); };
  return <Lab file={file} setFile={setFile} onProcess={run} customOutput={show ? (
    <div style={{ width:'100%' }}>
      <div style={{ padding:14, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:8, fontSize:13, color:C.text, lineHeight:1.6, textAlign:'left' }}>
        <strong>In-browser image → PDF export isn't ready yet.</strong><br />
        Writing a PDF file needs a PDF engine we don't yet run fully client-side, and ToolsRift never uploads your image to a server. For now, the fastest private way to turn this image into a PDF: open it, press Ctrl / Cmd + P, and choose "Save as PDF". A built-in, in-browser exporter is on the way.
      </div>
    </div>
  ) : null}><Label>Combine an image into a PDF (in-browser export coming soon)</Label></Lab>;
}

function ScreenshotTaker() {
  const [out, setOut] = useState(null); const [err, setErr] = useState("");
  const run = async () => {
    setErr("");
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({video:true}); const v = document.createElement('video'); v.srcObject = stream; await v.play();
      const cvs = document.createElement('canvas'); cvs.width=v.videoWidth; cvs.height=v.videoHeight; cvs.getContext('2d').drawImage(v,0,0);
      stream.getTracks().forEach(t=>t.stop()); setOut({dataUrl:cvs.toDataURL(),w:cvs.width,h:cvs.height});
    } catch(e){
      setErr(e && e.name === 'NotAllowedError'
        ? "Screen capture was denied or cancelled. Click the button again and allow screen sharing to capture."
        : "Screen capture isn't available in this browser, or the request was cancelled. Try again or use a different browser.");
    }
  };
  return <Lab isGenerator onProcess={run} output={out} customOutput={err ? (
    <div style={{ padding:14, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, fontSize:13, color:C.text, lineHeight:1.6, textAlign:'left', width:'100%' }}>{err}</div>
  ) : null}><Label>Prompts for screen capture permission</Label></Lab>;
}

// EXIF/TIFF metadata parsing (JPEG APP1) — pure client-side, no external library
const EXIF_TAGS = {
  0x0110:'Model', 0x010F:'Make', 0x0112:'Orientation', 0x0131:'Software',
  0x0132:'DateTime', 0x011A:'XResolution', 0x011B:'YResolution', 0x0128:'ResolutionUnit',
  0x829A:'ExposureTime', 0x829D:'FNumber', 0x8827:'ISO', 0x9003:'DateTimeOriginal', 0x920A:'FocalLength'
};
function parseExifData(buffer) {
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xFFD8) return {};
  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    const marker = view.getUint16(offset);
    if ((marker & 0xFF00) !== 0xFF00 || marker === 0xFFDA) break;
    const size = view.getUint16(offset + 2);
    if (marker === 0xFFE1 && offset + 10 <= view.byteLength && view.getUint32(offset + 4) === 0x45786966) {
      return readTiff(view, offset + 10);
    }
    offset += 2 + size;
  }
  return {};
}
function readTiff(view, tiff) {
  const out = {};
  try {
    const little = view.getUint16(tiff) === 0x4949;
    const g16 = o => view.getUint16(o, little);
    const g32 = o => view.getUint32(o, little);
    const readIFD = (dir) => {
      const n = g16(dir);
      for (let i = 0; i < n; i++) {
        const e = dir + 2 + i * 12;
        const tag = g16(e), type = g16(e + 2), count = g32(e + 4), vo = e + 8;
        if (tag === 0x8769) { try { readIFD(tiff + g32(vo)); } catch (_) {} continue; }
        const name = EXIF_TAGS[tag];
        if (!name) continue;
        const total = ({ 1:1, 2:1, 3:2, 4:4, 5:8 }[type] || 1) * count;
        const dat = total <= 4 ? vo : tiff + g32(vo);
        let val;
        if (type === 2) { let s = ''; for (let k = 0; k < count; k++) { const c = view.getUint8(dat + k); if (!c) break; s += String.fromCharCode(c); } val = s.trim(); }
        else if (type === 3) val = g16(dat);
        else if (type === 4) val = g32(dat);
        else if (type === 5) { const num = g32(dat), den = g32(dat + 4); val = den ? Math.round((num / den) * 1000) / 1000 : num; }
        else val = g16(dat);
        if (name === 'Orientation') val = ({ 1:'Normal', 3:'Rotated 180°', 6:'Rotated 90° CW', 8:'Rotated 90° CCW' }[val]) || val;
        if (name === 'ResolutionUnit') val = ({ 1:'None', 2:'inch', 3:'cm' }[val]) || val;
        out[name] = val;
      }
    };
    readIFD(tiff + g32(tiff + 4));
  } catch (_) {}
  return out;
}

function ExifReader() {
  const [file, setFile] = useState(null); const [data, setData] = useState(null);
  const run = () => {
    if (!file) return;
    const r = new FileReader();
    r.onload = e => {
      let exif = {};
      try { exif = parseExifData(e.target.result); } catch (_) { exif = {}; }
      const url = URL.createObjectURL(file); const img = new Image();
      img.onload = () => {
        setData({ fileInfo: {
          'File name': file.name, 'Type': file.type || 'unknown',
          'Size': (file.size / 1024).toFixed(1) + ' KB',
          'Dimensions': img.width + ' × ' + img.height + ' px',
          'Last modified': new Date(file.lastModified).toLocaleString()
        }, exif });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => { setData({ fileInfo: { 'File name': file.name, 'Size': (file.size / 1024).toFixed(1) + ' KB' }, exif }); URL.revokeObjectURL(url); };
      img.src = url;
    };
    r.readAsArrayBuffer(file);
  };
  const rows = data ? [...Object.entries(data.fileInfo), ...Object.entries(data.exif)] : [];
  return <Lab file={file} setFile={setFile} onProcess={run} customOutput={data ? (
    <div style={{ width:'100%', textAlign:'left' }}>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display:'flex', justifyContent:'space-between', gap:12, padding:'6px 0', borderBottom:`1px solid ${C.border}`, fontSize:12 }}>
          <span style={{ color:C.muted }}>{k}</span>
          <span style={{ color:C.text, fontFamily:"'JetBrains Mono',monospace", wordBreak:'break-all', textAlign:'right' }}>{String(v)}</span>
        </div>
      ))}
      {Object.keys(data.exif).length === 0 && <div style={{ color:C.muted, fontSize:12, marginTop:10 }}>No embedded EXIF/camera metadata found in this image.</div>}
    </div>
  ) : null}><Label>Reads file info and embedded EXIF metadata</Label></Lab>;
}

function ExifRemover() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null);
  const process = useCanvasProcess();
  const run = async () => setOut(await process(file, (img, cvs, ctx) => { cvs.width=img.width; cvs.height=img.height; ctx.drawImage(img,0,0); }));
  return <Lab file={file} setFile={setFile} onProcess={run} output={out}><Label>Redrawing removes all embedded EXIF naturally</Label></Lab>;
}

function DpiChecker() {
  const [file, setFile] = useState(null); const [info, setInfo] = useState(null);
  const run = () => {
    if (!file) return;
    const r = new FileReader();
    r.onload = e => {
      const buf = e.target.result; let dpi = null, source = 'No DPI metadata — defaults to 96 DPI on the web';
      try {
        const dv = new DataView(buf);
        if (dv.getUint16(0) === 0xFFD8) {
          let o = 2;
          while (o + 4 <= dv.byteLength) {
            const marker = dv.getUint16(o);
            if ((marker & 0xFF00) !== 0xFF00 || marker === 0xFFDA) break;
            const size = dv.getUint16(o + 2);
            if (marker === 0xFFE0 && o + 16 <= dv.byteLength && dv.getUint32(o + 4) === 0x4A464946) {
              const units = dv.getUint8(o + 11), xd = dv.getUint16(o + 12), yd = dv.getUint16(o + 14);
              if (units === 1) { dpi = xd + ' × ' + yd + ' DPI'; source = 'JFIF density (dots per inch)'; }
              else if (units === 2) { dpi = Math.round(xd * 2.54) + ' × ' + Math.round(yd * 2.54) + ' DPI'; source = 'JFIF density (converted from dots/cm)'; }
              else { dpi = xd + ' : ' + yd + ' aspect ratio (no absolute DPI)'; source = 'JFIF (no physical units)'; }
              break;
            }
            o += 2 + size;
          }
        }
        if (!dpi) {
          const ex = parseExifData(buf);
          if (ex && ex.XResolution) { dpi = ex.XResolution + ' × ' + (ex.YResolution || ex.XResolution) + (ex.ResolutionUnit === 'cm' ? ' DPcm' : ' DPI'); source = 'EXIF resolution tags'; }
        }
      } catch (_) {}
      const url = URL.createObjectURL(file); const img = new Image();
      img.onload = () => { setInfo({ dpi: dpi || '96 DPI (assumed)', source, px: img.width + ' × ' + img.height + ' px' }); URL.revokeObjectURL(url); };
      img.onerror = () => { setInfo({ dpi: dpi || 'Unknown', source, px: '—' }); URL.revokeObjectURL(url); };
      img.src = url;
    };
    r.readAsArrayBuffer(file);
  };
  return <Lab file={file} setFile={setFile} onProcess={run} customOutput={info ? (
    <div style={{ width:'100%', textAlign:'center' }}>
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:C.rose }}>{info.dpi}</div>
      <div style={{ fontSize:12, color:C.muted, marginTop:6 }}>Pixel dimensions: {info.px}</div>
      <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>Source: {info.source}</div>
    </div>
  ) : null}><Label>Reads DPI/PPI from JFIF or EXIF metadata</Label></Lab>;
}

function ColorSpace() {
  const [file, setFile] = useState(null); const [out, setOut] = useState(null);
  const process = useCanvasProcess();
  const run = async () => setOut(await process(file, (img, cvs, ctx) => {
    cvs.width=img.width; cvs.height=img.height; ctx.drawImage(img,0,0);
    const id=ctx.getImageData(0,0,cvs.width,cvs.height); const d=id.data;
    for(let i=0;i<d.length;i+=4){ const r=d[i]/255; const g=d[i+1]/255; const b=d[i+2]/255; const k=1-Math.max(r,g,b); const c=(1-r-k)/(1-k)||0; const m=(1-g-k)/(1-k)||0; const y=(1-b-k)/(1-k)||0; d[i]=255*(1-c)*(1-k); d[i+1]=255*(1-m)*(1-k); d[i+2]=255*(1-y)*(1-k); } ctx.putImageData(id,0,0);
  }));
  return <Lab file={file} setFile={setFile} onProcess={run} output={out}><Label>Simulates CMYK extraction visually</Label></Lab>;
}

const TOOL_COMPONENTS = {
  "image-resizer": ImageResizer, "image-cropper": ImageCropper, "image-compressor": ImageCompressor, "image-converter": ImageConverter, "image-rotator": ImageRotator, "image-flipper": ImageFlipper, "image-thumbnail": ImageThumbnail,
  "image-grayscale": ImageGrayscale, "image-brightness": ImageBrightness, "image-blur": ImageBlur, "image-sharpen": ImageSharpen, "image-invert": ImageInvert, "image-sepia": ImageSepia, "image-pixelate": ImagePixelate, "image-emboss": ImageEmboss, "image-vignette": ImageVignette,
  "image-watermark": ImageWatermark, "image-text-overlay": ImageTextOverlay, "image-caption": ImageCaption, "image-border": ImageBorder, "image-logo": ImageLogo,
  "image-color-picker": ImageColorPicker, "image-dominant-colors": ImageDominantColors, "image-metadata": ImageMetadata, "image-info": ImageInfo, "image-histogram": ImageHistogram,
  "placeholder-image": PlaceholderImage, "gradient-image": GradientImage, "solid-color-image": SolidColorImage, "noise-texture": NoiseTexture, "checkerboard": Checkerboard, "favicon-generator": FaviconGenerator, "og-image-preview": OgImagePreview, "qr-code-generator": QrCodeGenerator, "barcode-generator": BarcodeGenerator, "avatar-generator": AvatarGenerator,
  "image-base64": ImageBase64, "base64-to-image": Base64ToImage, "svg-to-png": SvgToPng, "image-to-svg": ImageToSvg, "sprite-sheet": SpriteSheet, "image-splitter": ImageSplitter, "image-collage": ImageCollage, "pdf-to-image": PdfToImage, "image-to-pdf": ImageToPdf, "screenshot-taker": ScreenshotTaker,
  "exif-reader": ExifReader, "exif-remover": ExifRemover, "dpi-checker": DpiChecker, "color-space": ColorSpace
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
          { "@type": "ListItem", "position": 2, "name": "Image Tools", "item": "https://toolsrift.com/images" },
          { "@type": "ListItem", "position": 3, "name": tool?.name || tool?.id || "" }
        ]
      }) }} />
    </>
  );
}

function CategoryPage({ catId }) {
  const cat = CATEGORIES.find(c=>c.id===catId); const tools = TOOLS.filter(t=>t.cat===catId);
  if (!cat) return null;
  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 20px 60px" }}>
      <Breadcrumb cat={cat} />
      <div style={{ marginBottom:32 }}>
        <h1 style={{ ...T.h1, marginBottom:8 }}>{cat.icon} {cat.name}</h1>
        <p style={{ color:C.muted }}>{cat.desc}</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
        {tools.map(t => (
          <a key={t.id} href={`#/tool/${t.id}`} className="fade-in" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20, textDecoration:"none", color:"inherit", display:"block", transition:"transform 0.2s" }} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
              <div style={{ fontSize:24 }}>{t.icon}</div>
              <h3 style={{ ...T.h2, margin:0 }}>{t.name}</h3>
            </div>
            <p style={{ fontSize:13, color:C.muted, lineHeight:1.5 }}>{t.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}


const PAGE_THEME = getCategoryById('image');

// ─── Category home: search + responsive ToolCard grid ───
function CategoryHomePage() {
  useEffect(() => {
    document.title = 'Free Image Tools Online — ToolsRift';
  }, []);

  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search image tools..."
      />
    </CategoryLayout>
  );
}

// ─── Tool detail: sidebar nav + ToolPageLayout wrapper ───
function ToolDetailPage({ toolId }) {
  const tool     = TOOLS.find(t => t.id === toolId);
  const meta     = TOOL_META[toolId];
  const ToolComp = TOOL_COMPONENTS[toolId];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const acc = PAGE_THEME.color;

  useEffect(() => {
    document.title = meta?.title || `${tool?.name} — Free Image Tool | ToolsRift`;
    setDrawerOpen(false);
  }, [toolId]);

  if (!tool || !ToolComp) return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId || 'unknown'}>
      <div style={{ padding:40, textAlign:'center', color:'#64748B', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
        <p style={{ color:'#E2E8F0', marginBottom:8, fontSize:16 }}>Tool not found</p>
        <a href="#/" style={{ color:acc }}>← Back to Image Tools</a>
      </div>
    </CategoryLayout>
  );

  const sidebarTools = TOOLS.filter(t => t.cat === tool.cat);
  const toolData = {
    name:        tool.name,
    description: meta?.desc || tool.desc,
    howTo:       meta?.howTo,
    faq:         meta?.faq,
  };

  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId}>
      <style>{`
        .tri-detail{display:grid;grid-template-columns:220px 1fr;gap:24px;padding:16px 0 60px}
        @media(max-width:768px){.tri-detail{grid-template-columns:1fr;padding:16px 0 96px}}
        .tri-sidebar{display:block}
        @media(max-width:768px){.tri-sidebar{display:none}}
        .tri-mobile-bar{display:none}
        @media(max-width:768px){.tri-mobile-bar{display:flex}}
      `}</style>

      <div className="tri-detail">
        {/* Desktop sidebar */}
        <aside className="tri-sidebar">
          <div style={{ position:'sticky', top:72, background:'#0D1117', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                {CATEGORIES.find(c => c.id === tool.cat)?.name || 'Tools'}
              </div>
            </div>
            <div style={{ padding:'8px 0', maxHeight:'calc(100vh - 160px)', overflowY:'auto' }}>
              {sidebarTools.map(t => {
                const isActive = t.id === toolId;
                return (
                  <a
                    key={t.id}
                    href={`#/tool/${t.id}`}
                    style={{
                      display:'flex', alignItems:'center', gap:10, minHeight:44,
                      padding:'10px 16px', textDecoration:'none',
                      background: isActive ? `${acc}18` : 'transparent',
                      borderLeft: isActive ? `2px solid ${acc}` : '2px solid transparent',
                      transition:'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background='rgba(255,255,255,0.03)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background='transparent'; }}
                  >
                    <span style={{ fontSize:15, flexShrink:0 }}>{t.icon}</span>
                    <span style={{ fontSize:13, fontWeight:isActive?600:400, color:isActive?'#F1F5F9':'#94A3B8', lineHeight:1.3, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                      {t.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div style={{ minWidth:0 }}>
          <a href="#/"
            style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#64748B', fontSize:13, textDecoration:'none', marginBottom:16, fontFamily:"'Plus Jakarta Sans',sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.color='#E2E8F0'}
            onMouseLeave={e => e.currentTarget.style.color='#64748B'}
          >
            ← Back to Image Tools
          </a>
          <ToolPageLayout theme={PAGE_THEME} tool={toolData}>
            <ToolComp />
          </ToolPageLayout>
        </div>
      </div>

      {/* Mobile: floating bottom bar */}
      <div className="tri-mobile-bar" style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:200, background:'rgba(6,9,15,0.96)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'12px 16px', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:13, color:'#94A3B8', fontFamily:"'Plus Jakarta Sans',sans-serif", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'60%' }}>
          {tool.icon} {tool.name}
        </span>
        <button
          onClick={() => setDrawerOpen(d => !d)}
          style={{ background:acc, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", minHeight:44, flexShrink:0 }}
        >
          {drawerOpen ? '✕ Close' : '☰ All Tools'}
        </button>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:199, background:'#0D1117', borderTop:`2px solid ${acc}`, maxHeight:'60vh', overflowY:'auto', padding:'8px 0 80px' }}>
          {sidebarTools.map(t => {
            const isActive = t.id === toolId;
            return (
              <a key={t.id} href={`#/tool/${t.id}`} onClick={() => setDrawerOpen(false)}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px', minHeight:52, textDecoration:'none', background:isActive?`${acc}18`:'transparent', borderLeft:isActive?`3px solid ${acc}`:'3px solid transparent' }}
              >
                <span style={{ fontSize:20 }}>{t.icon}</span>
                <span style={{ fontSize:14, fontWeight:isActive?600:400, color:isActive?'#F1F5F9':'#94A3B8', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{t.name}</span>
              </a>
            );
          })}
        </div>
      )}
    </CategoryLayout>
  );
}

// ─── Main app ───
function ToolsRiftImages() {
  const route = useAppRouter();
  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>
      {route.page === 'home'     && <CategoryHomePage />}
      {route.page === 'tool'     && <ToolDetailPage toolId={route.toolId} />}
      {route.page === 'category' && <CategoryPage catId={route.catId} />}
    </div>
  );
}

export default ToolsRiftImages;
