import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolPageLayout, { ToolSchemas } from './shared/ToolPageLayout';

const THEME = getCategoryById("css");
const PAGE_THEME = getCategoryById('css');

// ─── TOKENS ───────────────────────────────────────────────────────────────────
const C = {
  bg:"#06090F", surface:"#0D1117", border:"rgba(255,255,255,0.06)",
  cyan:"#06B6D4", cyanD:"#0891B2", text:"#E2E8F0", muted:"#64748B",
  blue:"#3B82F6", green:"#10B981", purple:"#8B5CF6",
  danger:"#EF4444", amber:"#F59E0B", pink:"#EC4899",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:6px;height:6px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
  ::selection{background:rgba(6,182,212,0.3)}
  button:hover{filter:brightness(1.1)}
  select option{background:#0D1117}
  textarea{resize:vertical}
  input[type=range]{accent-color:#06B6D4;width:100%}
  input[type=color]{border:none;padding:0;background:none;cursor:pointer;border-radius:6px;overflow:hidden}
  .fade-in{animation:fadeIn .2s ease}
  @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
  .tr-nav-cats{display:flex;gap:4px;align-items:center}
  .tr-nav-badge{display:inline-flex}
  @media(max-width:640px){
    .tr-nav-cats{display:none!important}
    .tr-nav-badge{display:none!important}
  }
`;

const T = {
  mono:{ fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
  label:{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
  h1:{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:C.text },
  h2:{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:C.text },
};

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Badge({ children, color="cyan" }) {
  const bg={cyan:"rgba(6,182,212,0.15)",blue:"rgba(59,130,246,0.15)",green:"rgba(16,185,129,0.15)",amber:"rgba(245,158,11,0.15)",purple:"rgba(139,92,246,0.15)",pink:"rgba(236,72,153,0.15)"};
  const fg={cyan:"#22D3EE",blue:"#60A5FA",green:"#34D399",amber:"#FCD34D",purple:"#A78BFA",pink:"#F472B6"};
  return <span style={{background:bg[color]||bg.cyan,color:fg[color]||fg.cyan,borderRadius:4,padding:"2px 8px",fontSize:11,fontWeight:600,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{children}</span>;
}

function Btn({ children, onClick, variant="primary", size="md", disabled, style={} }) {
  const base={display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,border:"none",cursor:disabled?"not-allowed":"pointer",borderRadius:8,fontWeight:600,transition:"all .15s",fontFamily:"'Plus Jakarta Sans',sans-serif",opacity:disabled?0.5:1};
  const sz={sm:{padding:"6px 14px",fontSize:12},md:{padding:"9px 20px",fontSize:13},lg:{padding:"12px 28px",fontSize:14}}[size];
  const v={
    primary:{background:`linear-gradient(135deg,${C.cyan},${C.cyanD})`,color:"#000",boxShadow:"0 2px 8px rgba(6,182,212,0.3)"},
    secondary:{background:"rgba(255,255,255,0.05)",color:C.text,border:`1px solid ${C.border}`},
    ghost:{background:"transparent",color:C.muted},
  }[variant];
  return <button style={{...base,...sz,...v,...style}} onClick={onClick} disabled={disabled}>{children}</button>;
}

function Input({ value, onChange, placeholder, style={}, mono=false, type="text" }) {
  return (
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 14px",color:C.text,fontSize:13,fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif",outline:"none",...style}}
      onFocus={e=>e.target.style.borderColor=C.cyan} onBlur={e=>e.target.style.borderColor=C.border}/>
  );
}

function SelectInput({ value, onChange, options, style={} }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 14px",color:C.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",cursor:"pointer",...style}}>
      {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
    </select>
  );
}

function Card({ children, style={} }) {
  return <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20,...style}}>{children}</div>;
}

function Label({ children }) { return <div style={{...T.label,marginBottom:6}}>{children}</div>; }

function CopyBtn({ text, style={} }) {
  const [copied,setCopied]=useState(false);
  const copy=()=>{navigator.clipboard.writeText(text).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),1800);});};
  return <Btn variant={copied?"secondary":"ghost"} size="sm" onClick={copy} style={style}>{copied?"✓ Copied":"Copy CSS"}</Btn>;
}

function VStack({ children, gap=12 }) { return <div style={{display:"flex",flexDirection:"column",gap}}>{children}</div>; }
function Grid2({ children, gap=16 }) { return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap}}>{children}</div>; }
function Grid3({ children, gap=12 }) { return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap}}>{children}</div>; }

function Slider({ label, value, onChange, min=0, max=100, step=1, unit="" }) {
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <Label>{label}</Label>
        <span style={{fontSize:12,color:C.cyan,fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/>
    </div>
  );
}

function ColorPicker({ label, value, onChange }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <input type="color" value={value} onChange={e=>onChange(e.target.value)}
          style={{width:40,height:36,borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer",padding:2,background:"rgba(255,255,255,0.04)"}}/>
        <Input value={value} onChange={onChange} placeholder="#000000" style={{flex:1}} mono/>
      </div>
    </div>
  );
}

function CSSOutput({ css }) {
  const lines = (css || "").split("\n");
  const tokens = lines.map((line, li) => {
    const colonIdx = line.indexOf(":");
    const hasBrace = line.indexOf("{") > -1 || line.indexOf("}") > -1;
    if (colonIdx > -1 && !hasBrace) {
      const indent = line.match(/^\s*/)[0];
      const prop = line.slice(indent.length, colonIdx);
      const rest = line.slice(colonIdx + 1);
      return (
        <span key={li}>
          <span style={{color:"#64748B"}}>{indent}</span>
          <span style={{color:"#06B6D4",fontWeight:600}}>{prop}</span>
          <span style={{color:"#64748B"}}>:</span>
          <span style={{color:"#FBBF24"}}>{rest}</span>
          {"\n"}
        </span>
      );
    }
    return <span key={li} style={{color:"#94A3B8"}}>{line}{"\n"}</span>;
  });
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <Label>Generated CSS</Label>
        <CopyBtn text={css}/>
      </div>
      <div style={{background:"#0B0F17",border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,lineHeight:1.8,whiteSpace:"pre-wrap",wordBreak:"break-all",maxHeight:220,overflowY:"auto"}}>
        {tokens}
      </div>
    </div>
  );
}

function PreviewBox({ style={}, children, height=160, label="Preview" }) {
  return (
    <div>
      <Label>{label}</Label>
      <div style={{height,borderRadius:10,border:`1px solid ${C.border}`,background:"rgba(255,255,255,0.03)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}>
        {children}
      </div>
    </div>
  );
}

// ─── ROUTER ───────────────────────────────────────────────────────────────────
function useAppRouter() {
  const parse=()=>{const h=window.location.hash||"#/";const path=h.replace(/^#/,"")||"/";const parts=path.split("/").filter(Boolean);if(!parts.length)return{page:"home"};if(parts[0]==="tool"&&parts[1])return{page:"tool",toolId:parts[1]};if(parts[0]==="category"&&parts[1])return{page:"home"};return{page:"home"};};
  const[route,setRoute]=useState(parse);
  useEffect(()=>{const fn=()=>setRoute(parse());window.addEventListener("hashchange",fn);return()=>window.removeEventListener("hashchange",fn);},[]);
  useEffect(()=>{const fn=e=>{const a=e.target.closest("a[href]");if(!a)return;const h=a.getAttribute("href");if(h&&h.startsWith("#/")){e.preventDefault();window.location.hash=h;}};document.addEventListener("click",fn);return()=>document.removeEventListener("click",fn);},[]);
  return route;
}

// ─── TOOL REGISTRY ────────────────────────────────────────────────────────────
const TOOLS = [
  {id:"css-gradient",      cat:"backgrounds", name:"CSS Gradient Generator",     desc:"Build linear, radial and conic gradients with live preview", icon:"🌈", free:true},
  {id:"css-box-shadow",    cat:"effects",     name:"CSS Box Shadow Generator",    desc:"Create layered box shadows with full control and preview",    icon:"🌑", free:true},
  {id:"css-text-shadow",   cat:"effects",     name:"CSS Text Shadow Generator",   desc:"Generate text shadow effects with live typography preview",   icon:"✍️", free:true},
  {id:"css-border-radius", cat:"shapes",      name:"CSS Border Radius Generator", desc:"Fine-tune all four corners individually with live preview",    icon:"⬛", free:true},
  {id:"css-flexbox",       cat:"layout",      name:"CSS Flexbox Generator",       desc:"Visual flexbox layout builder with all properties",           icon:"📦", free:true},
  {id:"css-grid",          cat:"layout",      name:"CSS Grid Generator",          desc:"Build CSS grid templates visually with live preview",         icon:"⊞",  free:true},
  {id:"css-animation",     cat:"effects",     name:"CSS Animation Generator",     desc:"Create keyframe animations with easing and timing control",   icon:"🎬", free:true},
  {id:"css-filter",        cat:"effects",     name:"CSS Filter Generator",        desc:"Combine blur, brightness, contrast and other CSS filters",    icon:"🎨", free:true},
  {id:"css-transform",     cat:"effects",     name:"CSS Transform Generator",     desc:"Chain rotate, scale, translate and skew transforms visually",  icon:"🔄", free:true},
  {id:"css-transition",    cat:"effects",     name:"CSS Transition Generator",    desc:"Generate smooth CSS transition definitions with easing",       icon:"⚡", free:true},
  {id:"css-button",        cat:"components",  name:"CSS Button Generator",        desc:"Design custom buttons with hover states and full styling",     icon:"🔘", free:true},
  {id:"css-typography",    cat:"components",  name:"CSS Typography Styler",       desc:"Build font stacks, line heights and type scales visually",     icon:"🔤", free:true},
  {id:"css-clip-path",     cat:"shapes",      name:"CSS Clip-Path Generator",     desc:"Create clip-path polygon and circle shapes with live preview", icon:"✂️", free:true},
  {id:"css-glassmorphism", cat:"backgrounds", name:"Glassmorphism Generator",     desc:"Generate frosted glass CSS effects with backdrop-filter",      icon:"🪟", free:true},
  {id:"css-neumorphism",   cat:"backgrounds", name:"Neumorphism Generator",       desc:"Create soft UI neumorphic shadow effects with live preview",   icon:"🫧", free:true},
  {id:"css-scrollbar",     cat:"components",  name:"CSS Scrollbar Styler",        desc:"Design custom scrollbar styles for webkit browsers",           icon:"📜", free:true},
  {id:"css-variables",     cat:"components",  name:"CSS Variables Generator",     desc:"Generate design token CSS custom property systems",           icon:"🎯", free:true},
  {id:"css-loader",        cat:"effects",     name:"CSS Loader Generator",        desc:"Create pure CSS loading spinners and animated indicators",     icon:"⏳", free:true},
  {id:"css-triangle",      cat:"shapes",      name:"CSS Triangle Generator",      desc:"Generate CSS border-trick triangles and arrows",              icon:"▲",  free:true},
  {id:"css-color-palette", cat:"backgrounds", name:"CSS Color Palette Generator", desc:"Generate harmonious color palettes as CSS custom properties",  icon:"🎨", free:true},
  {id:"px-to-rem-converter",       cat:"components",  name:"PX to REM Converter",         desc:"Convert px to rem and rem to px with adjustable root font size", icon:"📏", free:true},
  {id:"css-specificity-calculator",cat:"components",  name:"CSS Specificity Calculator",   desc:"Score any CSS selector's specificity as an (a, b, c) triple",   icon:"🧮", free:true},
  {id:"css-pattern-generator",     cat:"backgrounds", name:"CSS Pattern Generator",        desc:"Create pure-CSS background patterns from gradients, no images", icon:"🔳", free:true},
  {id:"cubic-bezier-editor",       cat:"effects",     name:"Cubic Bezier Editor",          desc:"Build cubic-bezier easing curves with a live animated preview", icon:"📈", free:true},
  {id:"css-text-stroke",     cat:"effects",     name:"CSS Text Stroke Generator",   desc:"Add outlined text with -webkit-text-stroke and live preview",   icon:"🅾️", free:true},
  {id:"css-outline",         cat:"effects",     name:"CSS Outline Generator",       desc:"Generate outline width, style, color and offset with preview",  icon:"🔲", free:true},
  {id:"css-backdrop-filter", cat:"effects",     name:"CSS Backdrop Filter Generator",desc:"Build backdrop-filter blur, brightness and saturation effects", icon:"🌫️", free:true},
  {id:"css-blend-mode",      cat:"effects",     name:"CSS Blend Mode Generator",    desc:"Preview all mix-blend-mode values on overlapping shapes",       icon:"🎭", free:true},
  {id:"css-mask-fade",       cat:"effects",     name:"CSS Mask Fade Generator",     desc:"Fade element edges with mask-image linear gradients",           icon:"🌗", free:true},
  {id:"css-perspective",     cat:"effects",     name:"CSS 3D Perspective Generator",desc:"Rotate elements in 3D space with perspective and live preview",  icon:"🧊", free:true},
  {id:"css-aspect-ratio",    cat:"layout",      name:"CSS Aspect Ratio Generator",  desc:"Get aspect-ratio plus the padding-hack fallback for any ratio",  icon:"📐", free:true},
  {id:"css-columns",         cat:"layout",      name:"CSS Multi-Column Generator",  desc:"Build newspaper-style column-count layouts with column rules",   icon:"🗞️", free:true},
  {id:"css-object-fit",      cat:"layout",      name:"CSS Object Fit Generator",    desc:"Preview object-fit and object-position on images live",         icon:"🖼️", free:true},
  {id:"css-line-clamp",      cat:"components",  name:"CSS Line Clamp Generator",    desc:"Truncate multi-line text with -webkit-line-clamp ellipsis",     icon:"✂️", free:true},
  {id:"css-writing-mode",    cat:"components",  name:"CSS Writing Mode Generator",  desc:"Set vertical and horizontal writing-mode with text-orientation", icon:"↕️", free:true},
  {id:"css-image-rendering", cat:"components",  name:"CSS Image Rendering Generator",desc:"Control pixelated vs smooth image-rendering with live preview",  icon:"🔍", free:true},
  {id:"css-type-scale",      cat:"components",  name:"CSS Type Scale Generator",    desc:"Generate a modular type scale as CSS custom properties",        icon:"🔠", free:true},
  {id:"css-hex-to-rgba",     cat:"backgrounds", name:"CSS Hex to RGBA Converter",   desc:"Convert hex colors to rgba() with an adjustable alpha channel",  icon:"🎚️", free:true},
];

const CATEGORIES = [
  {id:"backgrounds", name:"Backgrounds & Colors", icon:"🌈", desc:"Gradients, glass, neumorphism, palettes"},
  {id:"effects",     name:"Effects & Animations",  icon:"✨", desc:"Shadows, filters, transforms, transitions, loaders"},
  {id:"layout",      name:"Layout",                icon:"⊞",  desc:"Flexbox and CSS Grid generators"},
  {id:"shapes",      name:"Shapes",                icon:"▲",  desc:"Border radius, clip-path, triangles"},
  {id:"components",  name:"Components",            icon:"🔘", desc:"Buttons, typography, scrollbars, CSS variables"},
];

const TOOL_META = {
  "css-gradient":      {title:"CSS Gradient Generator – Linear, Radial & Conic Online", desc:"Generate CSS linear, radial and conic gradients with a live preview. Copy production-ready CSS instantly.", faq:[["What is a CSS gradient?","A CSS gradient is an image created by transitioning between two or more colors. It uses the gradient() CSS function family."],["What are the types of CSS gradients?","Linear (direction-based), radial (circular/elliptical from center), and conic (rotating around a point)."],["Can I use multiple color stops?","Yes — add as many color stop positions as needed between 0% and 100%."]]},
  "css-box-shadow":    {title:"CSS Box Shadow Generator – Live Preview Online",         desc:"Create single and multi-layered CSS box shadows. Adjust X/Y offset, blur, spread, color and inset.", faq:[["What is box-shadow?","A CSS property that adds shadow effects around an element's frame. You can set multiple shadows separated by commas."],["What is inset shadow?","An inset shadow is drawn inside the element's border, creating a recessed effect."],["How many shadows can I add?","CSS supports multiple comma-separated shadows. The first shadow is drawn on top."]]},
  "css-flexbox":       {title:"CSS Flexbox Generator – Visual Flexbox Builder Online",  desc:"Build Flexbox layouts visually. Control flex-direction, justify-content, align-items and all flex properties.", faq:[["What is Flexbox?","A one-dimensional CSS layout model that distributes space and aligns items in a container."],["When should I use Flexbox vs Grid?","Flexbox is ideal for one-dimensional layouts (rows OR columns). CSS Grid is better for two-dimensional layouts."],["What is flex-grow?","flex-grow determines how much a flex item grows relative to siblings when extra space is available."]]},
  "css-glassmorphism": {title:"CSS Glassmorphism Generator – Frosted Glass Effect",    desc:"Generate modern glassmorphism CSS with backdrop-filter blur, background transparency and border glow.", faq:[["What is glassmorphism?","A design trend featuring frosted-glass-like elements with blur, transparency, and subtle borders."],["What browser support does backdrop-filter have?","backdrop-filter is supported in all modern browsers. IE and older Firefox don't support it."],["How do I make the glass effect more visible?","Place the glass element over a colorful or blurred background — the effect requires content behind the element."]]},
  "css-animation":     {title:"CSS Animation Generator – Keyframe Animation Builder",  desc:"Create CSS @keyframe animations with custom easing, duration, delay and iteration control.", faq:[["What is a CSS keyframe animation?","An animation defined with @keyframes that specifies styles at certain points in the animation sequence."],["What is an easing function?","Controls the speed curve of the animation. ease-in starts slow, ease-out ends slow, cubic-bezier allows custom curves."],["Can I loop animations infinitely?","Yes — set animation-iteration-count to infinite."]]},
  "px-to-rem-converter":       {title:"PX to REM Converter – Pixels to REM Online",             desc:"Convert px to rem and rem to px instantly with an adjustable root font size. Batch-convert lists and copy CSS-ready values.", faq:[["How do I convert px to rem?","Divide the pixel value by the root font size. With the default 16px root, 24px equals 1.5rem."],["What is the root font size?","The font-size set on the html element. Browsers default it to 16px, but you can change it in the converter."],["Why use rem instead of px?","rem units scale with the user's root font size, making layouts more accessible and responsive."]]},
  "css-specificity-calculator":{title:"CSS Specificity Calculator – Score Selectors Online",    desc:"Calculate the specificity of any CSS selector as an (a, b, c) triple with a plain-English breakdown of what matched.", faq:[["What is CSS specificity?","A weight the browser assigns to a selector to decide which rule wins. It is expressed as three numbers: IDs, classes/attributes/pseudo-classes, and elements/pseudo-elements."],["Does the universal selector add specificity?","No — the universal selector * has zero specificity and is ignored."],["How is :not() scored?","The :not() and :is() pseudo-classes take the specificity of their most specific argument, while :where() always contributes zero."]]},
  "css-pattern-generator":     {title:"CSS Pattern Generator – Gradient Background Patterns",   desc:"Generate pure-CSS background patterns — stripes, dots, checkerboard, grid and zigzag — using only gradients. Live preview and copyable CSS.", faq:[["Are these patterns real images?","No — every pattern is built from CSS gradients, so there are no image files to load and the output stays crisp at any scale."],["Can I change the pattern colors?","Yes — pick any two colors and adjust the pattern size to fine-tune the look."],["How do I use the generated CSS?","Copy the background-image and background-size rules onto any element to apply the pattern."]]},
  "cubic-bezier-editor":       {title:"Cubic Bezier Editor – Custom Easing Curve Generator",    desc:"Design cubic-bezier easing curves with numeric inputs, presets and a live animated preview. Copy the cubic-bezier() string and a ready transition.", faq:[["What is a cubic-bezier easing curve?","A timing function defined by two control points that shapes how an animation accelerates and decelerates over time."],["What range can the values use?","The x values are clamped between 0 and 1, while the y values can go slightly beyond for overshoot and bounce effects."],["How do I preview the easing?","The editor animates a dot along the curve so you can feel the timing before copying the CSS."]]},
  "css-text-stroke":     {title:"CSS Text Stroke Generator – Outlined Text Online | ToolsRift", desc:"Create outlined text with -webkit-text-stroke. Adjust stroke width, color and fill for hollow or bordered headings, with a live preview and copyable CSS.", faq:[["What is -webkit-text-stroke?","A property that draws an outline around each glyph. Set the fill color to transparent for fully hollow text."],["Is text-stroke supported everywhere?","-webkit-text-stroke works in all modern browsers. The un-prefixed text-stroke is included for forward compatibility."],["How do I make hollow outlined text?","Set a stroke width and color, then set the text color (fill) to transparent."]]},
  "css-outline":         {title:"CSS Outline Generator – Width, Style & Offset | ToolsRift", desc:"Generate CSS outline rules with adjustable width, style, color and outline-offset. Great for focus rings and debugging, with live preview and copy button.", faq:[["How is outline different from border?","Outline is drawn outside the border and does not affect layout or take up space, unlike border."],["What does outline-offset do?","It pushes the outline away from the element edge by the given distance, creating a gap."],["Why use outline for focus states?","Outlines clearly indicate keyboard focus for accessibility without shifting surrounding content."]]},
  "css-backdrop-filter": {title:"CSS Backdrop Filter Generator – Frosted Blur | ToolsRift", desc:"Build backdrop-filter effects with blur, brightness, contrast and saturation. Create frosted glass overlays with a live preview and prefixed, copyable CSS.", faq:[["What does backdrop-filter do?","It applies graphical effects like blur to the area behind an element, not the element itself."],["Why is the -webkit- prefix included?","Some browsers still require -webkit-backdrop-filter, so both are output for maximum support."],["Why can't I see the blur?","backdrop-filter only affects content behind the element, so it needs a colorful background to show."]]},
  "css-blend-mode":      {title:"CSS Blend Mode Generator – mix-blend-mode Preview | ToolsRift", desc:"Preview every CSS mix-blend-mode value on overlapping colored shapes. Pick multiply, screen, overlay and more, then copy the ready-to-use CSS instantly.", faq:[["What is mix-blend-mode?","It defines how an element's content blends with the content and background behind it."],["What is the difference from background-blend-mode?","mix-blend-mode blends an element with what is behind it; background-blend-mode blends an element's own background layers."],["Which blend modes are most useful?","multiply, screen and overlay are the most common for tinting, lightening and contrast effects."]]},
  "css-mask-fade":       {title:"CSS Mask Fade Generator – Gradient Edge Fade | ToolsRift", desc:"Fade any element's edge to transparent using mask-image linear gradients. Choose direction and fade stops, preview live, and copy prefixed CSS in one click.", faq:[["How does a CSS mask fade work?","A linear-gradient mask makes parts of an element transparent based on the gradient's black-to-transparent stops."],["Do I need the -webkit- prefix?","Yes for older WebKit browsers, so both mask-image and -webkit-mask-image are generated."],["Can I fade multiple edges?","This tool fades one direction at a time; combine masks manually for multi-edge fades."]]},
  "css-perspective":     {title:"CSS 3D Perspective Generator – rotateX rotateY | ToolsRift", desc:"Tilt elements in 3D with perspective, rotateX and rotateY. Adjust the depth and angles, watch a live 3D preview, and copy the transform CSS instantly.", faq:[["What does the perspective value control?","It sets how far the viewer is from the z=0 plane; smaller values create a stronger, more dramatic 3D effect."],["What is the difference between the perspective property and function?","The property is set on a parent for shared depth; perspective() inside transform applies depth to a single element."],["Why does my element look flat?","Very large perspective values reduce the 3D effect; lower the value or increase the rotation angles."]]},
  "css-aspect-ratio":    {title:"CSS Aspect Ratio Generator – Ratio & Padding Hack | ToolsRift", desc:"Generate the modern aspect-ratio property plus the classic padding-top percentage fallback for any width-to-height ratio, with a live preview and copyable CSS.", faq:[["How is the padding-hack percentage calculated?","Divide height by width and multiply by 100; a 16:9 ratio becomes 56.25% top padding."],["Should I use aspect-ratio or the padding hack?","Use the aspect-ratio property in modern browsers; the padding hack is a fallback for very old browsers."],["Does aspect-ratio work on any element?","Yes, aspect-ratio applies to most elements when a width or height is otherwise unconstrained."]]},
  "css-columns":         {title:"CSS Multi-Column Generator – column-count Layout | ToolsRift", desc:"Build newspaper-style multi-column text layouts with column-count, column-gap and column-rule. Preview the flow live and copy the responsive CSS in one click.", faq:[["What does column-count do?","It splits an element's content into the specified number of equal-width columns automatically."],["What is column-rule?","A divider line drawn between columns, styled like a border with width, style and color."],["Can I control the space between columns?","Yes, column-gap sets the horizontal spacing between each column."]]},
  "css-object-fit":      {title:"CSS Object Fit Generator – Fit & Position Preview | ToolsRift", desc:"Preview object-fit values like cover, contain and fill along with object-position on a real image. Fine-tune how media fills its box and copy the CSS instantly.", faq:[["What does object-fit: cover do?","It scales the image to fill the box while preserving aspect ratio, cropping any overflow."],["What is object-position for?","It sets which part of the image stays visible when the image is cropped by object-fit."],["Which elements does object-fit apply to?","It applies to replaced elements such as img and video."]]},
  "css-line-clamp":      {title:"CSS Line Clamp Generator – Truncate Multi-line Text | ToolsRift", desc:"Truncate text to a set number of lines with an ellipsis using -webkit-line-clamp. Choose the line count, preview real clamped text, and copy the CSS instantly.", faq:[["How does -webkit-line-clamp work?","Combined with display:-webkit-box and box-orient:vertical, it limits text to a number of lines and adds an ellipsis."],["Is line-clamp widely supported?","The -webkit-line-clamp approach works across all modern browsers, including Chrome, Safari and Firefox."],["Can I clamp to a single line?","Yes, set the line count to 1, though single-line truncation can also use text-overflow:ellipsis."]]},
  "css-writing-mode":    {title:"CSS Writing Mode Generator – Vertical Text | ToolsRift", desc:"Set horizontal or vertical writing-mode with text-orientation for rotated and CJK-style text. Preview the flow direction live and copy the CSS in one click.", faq:[["What does writing-mode do?","It sets whether text flows horizontally or vertically and the block direction of the content."],["When is vertical-rl useful?","It is common for East Asian typography and for rotated sidebar labels or captions."],["What does text-orientation control?","It sets how individual characters are oriented within a vertical writing mode, such as upright or mixed."]]},
  "css-image-rendering": {title:"CSS Image Rendering Generator – Pixelated vs Smooth | ToolsRift", desc:"Control how scaled images are interpolated with image-rendering. Compare pixelated, crisp-edges and smooth on an upscaled preview and copy the CSS instantly.", faq:[["What does image-rendering: pixelated do?","It disables smoothing so upscaled images show crisp, blocky pixels, ideal for pixel art."],["When should I use crisp-edges?","Use it to preserve sharp edges and contrast when scaling images without blurring."],["Does image-rendering affect downscaling?","It mainly changes how browsers interpolate upscaled images; downscaling behavior varies by browser."]]},
  "css-type-scale":      {title:"CSS Type Scale Generator – Modular Font Sizes | ToolsRift", desc:"Generate a harmonious modular type scale from a base size and ratio. Get font sizes as CSS custom properties with a live preview and copyable code.", faq:[["What is a modular type scale?","A set of font sizes derived by repeatedly multiplying a base size by a fixed ratio for visual harmony."],["What ratio should I use?","Common ratios include 1.25 (major third) and 1.618 (golden ratio); larger ratios create more contrast."],["How are the sizes calculated?","Each step multiplies the base size by the ratio raised to the step number, so base 16 at ratio 1.25 gives 20 at step one."]]},
  "css-hex-to-rgba":     {title:"CSS Hex to RGBA Converter – Add Alpha to Colors | ToolsRift", desc:"Convert any 3, 6 or 8-digit hex color to an rgba() value with an adjustable alpha channel. See the swatch, the RGB breakdown and copy the CSS instantly.", faq:[["How do I convert hex to rgba?","Split the hex into red, green and blue byte pairs, convert each to decimal, then append your alpha value."],["Does it support shorthand hex like #fff?","Yes, 3-digit shorthand and 8-digit hex with alpha are both accepted and normalized."],["What alpha range is valid?","Alpha runs from 0 (fully transparent) to 1 (fully opaque); values outside this range are clamped."]]},
  "css-text-shadow": {title:"CSS Text Shadow Generator — Live Typography Preview", desc:"Create CSS text-shadow effects with adjustable X/Y offset, blur and color. Layer multiple shadows for glow and 3D text, preview live, and copy the CSS.", keywords:"css text shadow, text-shadow generator, text glow css, shadow text, css shadow", howTo:"Adjust the offset, blur and color sliders, add extra shadow layers if needed, and copy the generated text-shadow CSS.", faq:[["What does text-shadow do?","It draws one or more shadows behind text, each set by horizontal and vertical offset, blur radius and color."],["Can I add multiple text shadows?","Yes — comma-separate several shadows to build glow, outline or layered 3D lettering effects."],["How do I make glowing text?","Use a zero offset with a large blur and a bright color, optionally stacking several shadows for a stronger glow."]]},
  "css-border-radius": {title:"CSS Border Radius Generator — Round Corners Individually", desc:"Fine-tune all four corners of an element with independent border-radius values. Create rounded cards, pills and organic blob shapes with a live preview.", keywords:"border radius generator, css rounded corners, border-radius, blob shape, rounded css", howTo:"Drag the corner sliders to shape each corner, watch the live preview, and copy the border-radius CSS.", faq:[["Can I set each corner separately?","Yes — control the top-left, top-right, bottom-right and bottom-left radii independently for asymmetric shapes."],["How do I make a pill or circle?","A very large radius (or 9999px) makes pill buttons, and 50% on a square element produces a perfect circle."],["What are the two values per corner for?","Border-radius accepts a horizontal and vertical radius per corner, letting you create elliptical, organic blob corners."]]},
  "css-grid": {title:"CSS Grid Generator — Visual Grid Template Builder", desc:"Build CSS Grid layouts visually. Set columns, rows, gaps and template areas, then copy production-ready grid-template CSS with a live preview.", keywords:"css grid generator, grid layout, grid-template, css grid builder, grid areas", howTo:"Set the number of columns and rows, adjust gaps and sizing, and copy the generated grid-template CSS.", faq:[["What is CSS Grid?","A two-dimensional layout system that arranges items into rows and columns using grid-template properties."],["When should I use Grid instead of Flexbox?","Use Grid for two-dimensional layouts (rows and columns together); Flexbox is better for one-dimensional rows or columns."],["What does fr mean in a grid?","The fr unit distributes leftover space; 1fr 2fr splits free space so the second column is twice as wide as the first."]]},
  "css-filter": {title:"CSS Filter Generator — Blur, Brightness & Contrast", desc:"Combine CSS filter functions like blur, brightness, contrast, grayscale, sepia and hue-rotate on a live image preview, then copy the filter CSS.", keywords:"css filter generator, blur brightness contrast, css filters, image filter css, hue-rotate", howTo:"Toggle and adjust each filter's slider, watch the live preview update, and copy the combined filter CSS.", faq:[["What can the CSS filter property do?","It applies graphical effects — blur, brightness, contrast, saturate, grayscale, sepia, invert and hue-rotate — directly to an element."],["Can I chain multiple filters?","Yes — list several filter functions in one declaration and they are applied in order, left to right."],["Does filter affect layout?","No — filters are painted effects and do not change the element's box size or position."]]},
  "css-transform": {title:"CSS Transform Generator — Rotate, Scale, Translate & Skew", desc:"Chain CSS transform functions — rotate, scale, translate and skew — with sliders and a live preview. Copy the combined transform CSS instantly.", keywords:"css transform generator, rotate scale translate, skew css, transform css, 2d transform", howTo:"Adjust the rotate, scale, translate and skew sliders, preview the result, and copy the chained transform CSS.", faq:[["Does transform order matter?","Yes — transforms are applied right to left, so translate then rotate differs from rotate then translate."],["What is transform-origin?","It sets the point that transforms pivot around; the default is the element's center."],["Does transform move surrounding elements?","No — transformed elements do not affect layout, so neighbors stay in place even as the element moves or scales."]]},
  "css-transition": {title:"CSS Transition Generator — Smooth Easing Definitions", desc:"Generate CSS transition declarations with a chosen property, duration, delay and easing curve. Hover the live preview to test, then copy the transition CSS.", keywords:"css transition generator, transition css, easing, transition-duration, hover transition", howTo:"Choose the property, duration, delay and easing, hover the preview to test the motion, and copy the transition CSS.", faq:[["What does the transition property animate?","It smoothly animates changes to a CSS property over a duration, such as color, transform or opacity on hover."],["What is the difference between transition and animation?","Transitions run between two states triggered by a change; animations use @keyframes and can run on their own and loop."],["What easing should I pick?","ease-out feels responsive for UI, ease-in-out suits movement, and a custom cubic-bezier gives full control."]]},
  "css-button": {title:"CSS Button Generator — Custom Buttons with Hover States", desc:"Design custom CSS buttons with full control over color, padding, radius, border, shadow and hover state. Preview live and copy the complete button CSS.", keywords:"css button generator, button css, hover button, css button styles, button maker", howTo:"Adjust the color, spacing, border and hover controls, watch the live button preview, and copy the generated CSS.", faq:[["What can I customize on the button?","Background and text color, padding, border, radius, font, shadow and a distinct hover state, all with a live preview."],["Does it generate hover styles?","Yes — the output includes a :hover rule so the button reacts when users point at it."],["Can I make a gradient button?","Yes — set a gradient background and combine it with radius and shadow for a modern call-to-action button."]]},
  "css-typography": {title:"CSS Typography Styler — Font Stacks & Type Scales", desc:"Style text visually with font family, size, weight, line height and letter spacing. Build readable type scales and copy the typography CSS.", keywords:"css typography, font styler, line height, letter spacing, type scale css", howTo:"Set the font, size, weight, line height and spacing, preview the sample text, and copy the typography CSS.", faq:[["What typography properties can I set?","Font family, size, weight, line height, letter spacing and text alignment, all previewed on real sample text."],["What line height is readable?","A line height around 1.4 to 1.6 for body text keeps lines comfortably readable; headings can be tighter."],["What is a good font stack?","List your preferred font first with generic fallbacks last, e.g. 'Inter', system-ui, sans-serif, so text always renders."]]},
  "css-clip-path": {title:"CSS Clip-Path Generator — Polygon & Circle Shapes", desc:"Create clip-path shapes — polygons, circles, ellipses and insets — by dragging points on a live preview. Copy the clip-path CSS to crop any element.", keywords:"clip-path generator, css clip path, polygon shape, clip element, css shapes", howTo:"Pick a shape, drag the points or adjust values on the preview, and copy the generated clip-path CSS.", faq:[["What does clip-path do?","It crops an element to a shape, hiding everything outside the defined polygon, circle, ellipse or inset region."],["Can I make custom polygons?","Yes — add and drag points to build any polygon shape, and the clip-path percentage coordinates update live."],["Does the clipped area still take space?","Yes — clip-path only hides visuals; the element keeps its original box in the layout."]]},
  "css-neumorphism": {title:"CSS Neumorphism Generator — Soft UI Shadow Effect", desc:"Create soft-UI neumorphic elements with dual light and dark box shadows on a matching background. Adjust distance, blur and intensity, then copy the CSS.", keywords:"neumorphism generator, soft ui, neumorphic shadow, css neumorphism, soft shadow", howTo:"Set the base color, shadow distance, blur and intensity, choose raised or inset, and copy the neumorphic box-shadow CSS.", faq:[["What is neumorphism?","A soft-UI style where elements appear extruded from or pressed into the background using paired light and dark shadows."],["Why must the background match?","Neumorphism relies on the element and background being the same color so the shadows alone create the raised or inset look."],["How do I make an inset (pressed) effect?","Use inset shadows so the light and dark highlights fall inside the element, making it look pressed into the surface."]]},
  "css-scrollbar": {title:"CSS Scrollbar Styler — Custom Webkit Scrollbars", desc:"Design custom scrollbars with ::-webkit-scrollbar — set width, track and thumb color, and radius. Preview a scrollable box and copy the CSS.", keywords:"css scrollbar, custom scrollbar, webkit scrollbar, scrollbar styler, style scrollbar", howTo:"Set the scrollbar width, track and thumb colors and radius, scroll the preview box to test, and copy the CSS.", faq:[["How do I style a scrollbar in CSS?","Use the ::-webkit-scrollbar pseudo-elements to set the width, track and thumb colors, and thumb border-radius."],["Which browsers support this?","The ::-webkit-scrollbar syntax works in Chrome, Edge and Safari; Firefox uses scrollbar-width and scrollbar-color instead."],["Can I round the scrollbar thumb?","Yes — apply border-radius to the ::-webkit-scrollbar-thumb for a rounded, pill-shaped handle."]]},
  "css-variables": {title:"CSS Variables Generator — Design Token Custom Properties", desc:"Generate a system of CSS custom properties (variables) for colors, spacing and typography. Build reusable design tokens under :root and copy the CSS.", keywords:"css variables, custom properties, design tokens, css var, root variables", howTo:"Add your color, spacing and type tokens, name each variable, and copy the :root custom-property block.", faq:[["What are CSS custom properties?","Reusable values declared like --primary: #3B82F6 and used with var(--primary), so you change a value in one place."],["Why define them on :root?","Declaring variables on :root makes them global, available to every selector across the whole document."],["Can CSS variables change at runtime?","Yes — they cascade and can be overridden per selector or updated with JavaScript for theming."]]},
  "css-loader": {title:"CSS Loader Generator — Pure CSS Spinners", desc:"Create pure-CSS loading spinners and animated indicators with adjustable size, color and speed. No images or JavaScript — copy the animated CSS.", keywords:"css loader, css spinner, loading animation, pure css loader, spinner generator", howTo:"Pick a loader style, set its size, color and speed, preview the animation, and copy the CSS and keyframes.", faq:[["Are these loaders images?","No — every loader is built from CSS and @keyframes animations, so there is nothing to download and they stay crisp."],["Can I change the speed?","Yes — adjust the animation duration to make the spinner rotate faster or slower."],["Do the loaders need JavaScript?","No — they animate purely with CSS keyframes, so they work anywhere CSS runs."]]},
  "css-triangle": {title:"CSS Triangle Generator — Border-Trick Arrows", desc:"Generate CSS triangles and arrows using the classic border trick. Choose direction, size and color for tooltips and speech-bubble tails, then copy the CSS.", keywords:"css triangle, border triangle, css arrow, triangle generator, tooltip arrow", howTo:"Choose the direction, size and color; the tool builds the border-trick triangle and gives you the copyable CSS.", faq:[["How does the CSS triangle trick work?","A zero-size element with thick borders shows only one colored border edge as a triangle while the others stay transparent."],["What are CSS triangles used for?","Tooltip and speech-bubble tails, dropdown carets, and simple arrow indicators without images."],["Can I point the triangle any direction?","Yes — choose up, down, left or right and the border widths and colors adjust to point that way."]]},
  "css-color-palette": {title:"CSS Color Palette Generator — Tokens from Harmony", desc:"Generate a harmonious color palette from a base color and export it as CSS custom properties. Get coordinated colors ready to drop into your stylesheet.", keywords:"css color palette, palette custom properties, color tokens, palette generator, css colors", howTo:"Pick a base color, generate the harmonious palette, and copy the CSS custom properties for your stylesheet.", faq:[["How is the palette generated?","A base color seeds a set of harmonious colors using color-theory rules, then each is emitted as a CSS variable."],["What output do I get?","A block of CSS custom properties like --color-primary and --color-accent that you paste under :root."],["How is this different from the random palette tool?","This tool focuses on exporting a coordinated palette as ready-to-use CSS variables rather than just showing swatches."]]},
};

// ─── TOOL COMPONENTS ─────────────────────────────────────────────────────────

// ── 1. CSS GRADIENT ───────────────────────────────────────────────────────────
function CssGradient() {
  const [type,setType]=useState("linear");
  const [angle,setAngle]=useState(135);
  const [shape,setShape]=useState("ellipse");
  const [stops,setStops]=useState([{color:"#06B6D4",pos:0},{color:"#8B5CF6",pos:50},{color:"#EC4899",pos:100}]);
  const [conicAngle,setConicAngle]=useState(0);

  const addStop=()=>setStops(s=>[...s,{color:"#ffffff",pos:50}].sort((a,b)=>a.pos-b.pos));
  const updateStop=(i,k,v)=>setStops(s=>s.map((x,j)=>j===i?{...x,[k]:v}:x).sort((a,b)=>a.pos-b.pos));
  const removeStop=i=>setStops(s=>s.filter((_,j)=>j!==i));

  const stopsStr=stops.map(s=>`${s.color} ${s.pos}%`).join(", ");
  const gradient=type==="linear"?`linear-gradient(${angle}deg, ${stopsStr})`:type==="radial"?`radial-gradient(${shape} at center, ${stopsStr})`:`conic-gradient(from ${conicAngle}deg, ${stopsStr})`;
  const css=`background: ${gradient};`;

  return (
    <VStack>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {["linear","radial","conic"].map(t=>(
          <Btn key={t} variant={type===t?"primary":"secondary"} size="sm" onClick={()=>setType(t)}>{t}</Btn>
        ))}
      </div>
      {type==="linear"&&<Slider label="Angle" value={angle} onChange={setAngle} min={0} max={360} unit="°"/>}
      {type==="radial"&&<div><Label>Shape</Label><SelectInput value={shape} onChange={setShape} options={[{value:"ellipse",label:"Ellipse"},{value:"circle",label:"Circle"}]}/></div>}
      {type==="conic"&&<Slider label="Start Angle" value={conicAngle} onChange={setConicAngle} min={0} max={360} unit="°"/>}
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><Label>Color Stops</Label><Btn size="sm" variant="secondary" onClick={addStop}>+ Add Stop</Btn></div>
        <VStack gap={8}>
          {stops.map((s,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"center"}}>
              <input type="color" value={s.color} onChange={e=>updateStop(i,"color",e.target.value)} style={{width:36,height:36,borderRadius:6,border:`1px solid ${C.border}`,cursor:"pointer",padding:2,background:"none"}}/>
              <Input value={s.color} onChange={v=>updateStop(i,"color",v)} mono style={{width:100}}/>
              <input type="range" min={0} max={100} value={s.pos} onChange={e=>updateStop(i,"pos",Number(e.target.value))} style={{flex:1}}/>
              <span style={{minWidth:36,fontSize:12,color:C.cyan,fontFamily:"'JetBrains Mono',monospace"}}>{s.pos}%</span>
              {stops.length>2&&<Btn size="sm" variant="ghost" onClick={()=>removeStop(i)}>×</Btn>}
            </div>
          ))}
        </VStack>
      </div>
      <PreviewBox height={140} label="Preview">
        <div style={{position:"absolute",inset:0,background:gradient}}/>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 2. CSS BOX SHADOW ─────────────────────────────────────────────────────────
function CssBoxShadow() {
  const [shadows,setShadows]=useState([{x:0,y:4,blur:24,spread:0,color:"#00000066",inset:false}]);
  const [bg,setBg]=useState("#1a1a2e");
  const [elemColor,setElemColor]=useState("#06B6D4");

  const addShadow=()=>setShadows(s=>[...s,{x:4,y:8,blur:16,spread:0,color:"#00000044",inset:false}]);
  const update=(i,k,v)=>setShadows(s=>s.map((x,j)=>j===i?{...x,[k]:v}:x));
  const remove=i=>setShadows(s=>s.filter((_,j)=>j!==i));

  const shadowStr=shadows.map(s=>`${s.inset?"inset ":""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`).join(", ");
  const css=`box-shadow: ${shadowStr};`;

  return (
    <VStack>
      <Grid2>
        <ColorPicker label="Background Color" value={bg} onChange={setBg}/>
        <ColorPicker label="Element Color" value={elemColor} onChange={setElemColor}/>
      </Grid2>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><Label>Shadow Layers</Label><Btn size="sm" variant="secondary" onClick={addShadow}>+ Add Layer</Btn></div>
      {shadows.map((s,i)=>(
        <Card key={i} style={{padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <Badge color="cyan">Layer {i+1}</Badge>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:C.text,cursor:"pointer"}}>
                <input type="checkbox" checked={s.inset} onChange={e=>update(i,"inset",e.target.checked)}/> Inset
              </label>
              {shadows.length>1&&<Btn size="sm" variant="ghost" onClick={()=>remove(i)}>× Remove</Btn>}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Slider label="X Offset" value={s.x} onChange={v=>update(i,"x",v)} min={-60} max={60} unit="px"/>
            <Slider label="Y Offset" value={s.y} onChange={v=>update(i,"y",v)} min={-60} max={60} unit="px"/>
            <Slider label="Blur" value={s.blur} onChange={v=>update(i,"blur",v)} min={0} max={100} unit="px"/>
            <Slider label="Spread" value={s.spread} onChange={v=>update(i,"spread",v)} min={-30} max={60} unit="px"/>
          </div>
          <div style={{marginTop:12}}><ColorPicker label="Shadow Color" value={s.color} onChange={v=>update(i,"color",v)}/></div>
        </Card>
      ))}
      <PreviewBox height={180} label="Preview">
        <div style={{width:"100%",height:"100%",background:bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:120,height:80,borderRadius:12,background:elemColor,boxShadow:shadowStr}}/>
        </div>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 3. CSS TEXT SHADOW ────────────────────────────────────────────────────────
function CssTextShadow() {
  const [shadows,setShadows]=useState([{x:2,y:2,blur:8,color:"#00000088"}]);
  const [text,setText]=useState("Hello World");
  const [fontSize,setFontSize]=useState(48);
  const [fontColor,setFontColor]=useState("#ffffff");
  const [bgColor,setBgColor]=useState("#0d1117");
  const [fontWeight,setFontWeight]=useState("700");

  const addShadow=()=>setShadows(s=>[...s,{x:0,y:0,blur:10,color:"#06B6D4"}]);
  const update=(i,k,v)=>setShadows(s=>s.map((x,j)=>j===i?{...x,[k]:v}:x));
  const remove=i=>setShadows(s=>s.filter((_,j)=>j!==i));

  const shadowStr=shadows.map(s=>`${s.x}px ${s.y}px ${s.blur}px ${s.color}`).join(", ");
  const css=`text-shadow: ${shadowStr};`;

  return (
    <VStack>
      <Grid2>
        <div><Label>Preview Text</Label><Input value={text} onChange={setText} placeholder="Your Text"/></div>
        <Slider label="Font Size" value={fontSize} onChange={setFontSize} min={16} max={96} unit="px"/>
      </Grid2>
      <Grid2>
        <ColorPicker label="Text Color" value={fontColor} onChange={setFontColor}/>
        <ColorPicker label="Background" value={bgColor} onChange={setBgColor}/>
      </Grid2>
      <div><Label>Font Weight</Label>
        <div style={{display:"flex",gap:6}}>{["400","500","700","800","900"].map(w=><Btn key={w} size="sm" variant={fontWeight===w?"primary":"secondary"} onClick={()=>setFontWeight(w)}>{w}</Btn>)}</div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><Label>Shadow Layers</Label><Btn size="sm" variant="secondary" onClick={addShadow}>+ Add Layer</Btn></div>
      {shadows.map((s,i)=>(
        <Card key={i} style={{padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <Badge color="cyan">Layer {i+1}</Badge>
            {shadows.length>1&&<Btn size="sm" variant="ghost" onClick={()=>remove(i)}>× Remove</Btn>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <Slider label="X" value={s.x} onChange={v=>update(i,"x",v)} min={-40} max={40} unit="px"/>
            <Slider label="Y" value={s.y} onChange={v=>update(i,"y",v)} min={-40} max={40} unit="px"/>
            <Slider label="Blur" value={s.blur} onChange={v=>update(i,"blur",v)} min={0} max={60} unit="px"/>
          </div>
          <div style={{marginTop:12}}><ColorPicker label="Color" value={s.color} onChange={v=>update(i,"color",v)}/></div>
        </Card>
      ))}
      <PreviewBox height={140}>
        <div style={{width:"100%",height:"100%",background:bgColor,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize,color:fontColor,fontWeight,textShadow:shadowStr,fontFamily:"'Sora',sans-serif"}}>{text}</span>
        </div>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 4. CSS BORDER RADIUS ──────────────────────────────────────────────────────
function CssBorderRadius() {
  const [linked,setLinked]=useState(true);
  const [tl,setTl]=useState(16);const [tr,setTr]=useState(16);const [br,setBr]=useState(16);const [bl,setBl]=useState(16);
  const [color,setColor]=useState("#06B6D4");
  const [width,setWidth]=useState(160);const [height,setHeight]=useState(100);

  const set=(v)=>{setTl(v);setTr(v);setBr(v);setBl(v);};
  const css=`border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`;
  const rad=`${tl}px ${tr}px ${br}px ${bl}px`;

  return (
    <VStack>
      <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:C.text}}>
        <input type="checkbox" checked={linked} onChange={e=>setLinked(e.target.checked)}/> Link all corners
      </label>
      {linked?(
        <Slider label="All Corners" value={tl} onChange={set} min={0} max={200} unit="px"/>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Slider label="Top Left" value={tl} onChange={setTl} min={0} max={200} unit="px"/>
          <Slider label="Top Right" value={tr} onChange={setTr} min={0} max={200} unit="px"/>
          <Slider label="Bottom Right" value={br} onChange={setBr} min={0} max={200} unit="px"/>
          <Slider label="Bottom Left" value={bl} onChange={setBl} min={0} max={200} unit="px"/>
        </div>
      )}
      <Grid2>
        <ColorPicker label="Element Color" value={color} onChange={setColor}/>
        <Grid2 gap={12}>
          <Slider label="Width" value={width} onChange={setWidth} min={60} max={300} unit="px"/>
          <Slider label="Height" value={height} onChange={setHeight} min={40} max={300} unit="px"/>
        </Grid2>
      </Grid2>
      <PreviewBox height={200}>
        <div style={{width,height,background:color,borderRadius:rad,transition:"all .2s"}}/>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 5. CSS FLEXBOX ────────────────────────────────────────────────────────────
function CssFlexbox() {
  const [direction,setDirection]=useState("row");
  const [justify,setJustify]=useState("center");
  const [align,setAlign]=useState("center");
  const [wrap,setWrap]=useState("nowrap");
  const [gap,setGap]=useState(12);
  const [itemCount,setItemCount]=useState(4);
  const [itemColor,setItemColor]=useState("#06B6D4");

  const css=`.container {\n  display: flex;\n  flex-direction: ${direction};\n  justify-content: ${justify};\n  align-items: ${align};\n  flex-wrap: ${wrap};\n  gap: ${gap}px;\n}`;

  const opts={
    direction:["row","row-reverse","column","column-reverse"],
    justify:["flex-start","center","flex-end","space-between","space-around","space-evenly"],
    align:["flex-start","center","flex-end","stretch","baseline"],
    wrap:["nowrap","wrap","wrap-reverse"],
  };

  return (
    <VStack>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {[["Direction",direction,setDirection,opts.direction],["Justify Content",justify,setJustify,opts.justify],["Align Items",align,setAlign,opts.align],["Flex Wrap",wrap,setWrap,opts.wrap]].map(([lbl,val,set,options])=>(
          <div key={lbl}><Label>{lbl}</Label><SelectInput value={val} onChange={set} options={options.map(v=>({value:v,label:v}))}/></div>
        ))}
      </div>
      <Grid2 gap={12}>
        <Slider label="Gap" value={gap} onChange={setGap} min={0} max={40} unit="px"/>
        <Slider label="Item Count" value={itemCount} onChange={setItemCount} min={1} max={8} step={1} unit=""/>
      </Grid2>
      <ColorPicker label="Item Color" value={itemColor} onChange={setItemColor}/>
      <PreviewBox height={200}>
        <div style={{width:"100%",height:"100%",display:"flex",flexDirection:direction,justifyContent:justify,alignItems:align,flexWrap:wrap,gap,padding:12}}>
          {Array.from({length:itemCount},(_,i)=>(
            <div key={i} style={{background:itemColor,borderRadius:8,width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#000",flexShrink:0}}>{i+1}</div>
          ))}
        </div>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 6. CSS GRID ───────────────────────────────────────────────────────────────
function CssGrid() {
  const [cols,setCols]=useState(3);
  const [rows,setRows]=useState(2);
  const [colGap,setColGap]=useState(12);
  const [rowGap,setRowGap]=useState(12);
  const [autoFlow,setAutoFlow]=useState("row");
  const [colTemplate,setColTemplate]=useState("repeat(3, 1fr)");
  const [rowTemplate,setRowTemplate]=useState("repeat(2, 1fr)");
  const [useCustom,setUseCustom]=useState(false);

  const effectiveCols=useCustom?colTemplate:`repeat(${cols}, 1fr)`;
  const effectiveRows=useCustom?rowTemplate:`repeat(${rows}, 1fr)`;
  const css=`.grid {\n  display: grid;\n  grid-template-columns: ${effectiveCols};\n  grid-template-rows: ${effectiveRows};\n  column-gap: ${colGap}px;\n  row-gap: ${rowGap}px;\n  grid-auto-flow: ${autoFlow};\n}`;
  const COLORS=["#06B6D4","#8B5CF6","#10B981","#F59E0B","#EC4899","#3B82F6"];

  return (
    <VStack>
      <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:C.text}}>
        <input type="checkbox" checked={useCustom} onChange={e=>setUseCustom(e.target.checked)}/> Use custom template values
      </label>
      {useCustom?(
        <Grid2>
          <div><Label>grid-template-columns</Label><Input value={colTemplate} onChange={setColTemplate} mono placeholder="repeat(3, 1fr)"/></div>
          <div><Label>grid-template-rows</Label><Input value={rowTemplate} onChange={setRowTemplate} mono placeholder="repeat(2, 1fr)"/></div>
        </Grid2>
      ):(
        <Grid2 gap={12}>
          <Slider label="Columns" value={cols} onChange={v=>{setCols(v);}} min={1} max={6} step={1} unit=""/>
          <Slider label="Rows" value={rows} onChange={v=>{setRows(v);}} min={1} max={6} step={1} unit=""/>
        </Grid2>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        <Slider label="Column Gap" value={colGap} onChange={setColGap} min={0} max={40} unit="px"/>
        <Slider label="Row Gap" value={rowGap} onChange={setRowGap} min={0} max={40} unit="px"/>
        <div><Label>Auto Flow</Label><SelectInput value={autoFlow} onChange={setAutoFlow} options={["row","column","row dense","column dense"].map(v=>({value:v,label:v}))}/></div>
      </div>
      <PreviewBox height={220}>
        <div style={{width:"100%",height:"100%",display:"grid",gridTemplateColumns:effectiveCols,gridTemplateRows:effectiveRows,columnGap:colGap,rowGap,gridAutoFlow:autoFlow,padding:12}}>
          {Array.from({length:cols*rows},(_,i)=>(
            <div key={i} style={{background:COLORS[i%COLORS.length],borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#000",opacity:0.9}}>{i+1}</div>
          ))}
        </div>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 7. CSS ANIMATION ──────────────────────────────────────────────────────────
function CssAnimation() {
  const [preset,setPreset]=useState("pulse");
  const [duration,setDuration]=useState(1);
  const [delay,setDelay]=useState(0);
  const [iterations,setIterations]=useState("infinite");
  const [easing,setEasing]=useState("ease-in-out");
  const [direction,setDirection]=useState("alternate");
  const [color,setColor]=useState("#06B6D4");
  const [playing,setPlaying]=useState(true);

  const presets={
    pulse:{name:"pulse",frames:"0% { transform: scale(1); opacity: 1; }\n  50% { transform: scale(1.1); opacity: 0.8; }\n  100% { transform: scale(1); opacity: 1; }"},
    spin:{name:"spin",frames:"from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }"},
    bounce:{name:"bounce",frames:"0%, 100% { transform: translateY(0); }\n  50% { transform: translateY(-30px); }"},
    shake:{name:"shake",frames:"0%, 100% { transform: translateX(0); }\n  25% { transform: translateX(-8px); }\n  75% { transform: translateX(8px); }"},
    fade:{name:"fadeInOut",frames:"0%, 100% { opacity: 0; }\n  50% { opacity: 1; }"},
    glow:{name:"glow",frames:`0%, 100% { box-shadow: 0 0 5px ${color}44; }\n  50% { box-shadow: 0 0 30px ${color}; }`},
    slideIn:{name:"slideIn",frames:"from { transform: translateX(-100%); opacity: 0; }\n  to { transform: translateX(0); opacity: 1; }"},
  };

  const p=presets[preset];
  const animName=p.name;
  const keyframes=`@keyframes ${animName} {\n  ${p.frames}\n}`;
  const animProp=`animation: ${animName} ${duration}s ${easing} ${delay}s ${iterations} ${direction};`;
  const css=`${keyframes}\n\n.element {\n  ${animProp}\n}`;
  const previewStyle={width:80,height:80,background:color,borderRadius:12,animationName:playing?animName:"none",animationDuration:`${duration}s`,animationTimingFunction:easing,animationDelay:`${delay}s`,animationIterationCount:iterations,animationDirection:direction};
  const styleTag=`<style>${keyframes}</style>`;

  return (
    <VStack>
      <div>
        <Label>Animation Preset</Label>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
          {Object.keys(presets).map(k=><Btn key={k} size="sm" variant={preset===k?"primary":"secondary"} onClick={()=>setPreset(k)}>{k}</Btn>)}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        <Slider label="Duration" value={duration} onChange={setDuration} min={0.1} max={5} step={0.1} unit="s"/>
        <Slider label="Delay" value={delay} onChange={setDelay} min={0} max={3} step={0.1} unit="s"/>
        <div><Label>Iterations</Label><SelectInput value={iterations} onChange={setIterations} options={[{value:"infinite",label:"Infinite"},{value:"1",label:"1"},{value:"2",label:"2"},{value:"3",label:"3"}]}/></div>
      </div>
      <Grid2>
        <div><Label>Easing</Label><SelectInput value={easing} onChange={setEasing} options={["ease","ease-in","ease-out","ease-in-out","linear","cubic-bezier(0.68,-0.55,0.265,1.55)"].map(v=>({value:v,label:v}))}/></div>
        <div><Label>Direction</Label><SelectInput value={direction} onChange={setDirection} options={["normal","reverse","alternate","alternate-reverse"].map(v=>({value:v,label:v}))}/></div>
      </Grid2>
      <ColorPicker label="Element Color" value={color} onChange={setColor}/>
      <style>{presets[preset]?`@keyframes ${presets[preset].name} { ${presets[preset].frames} }`:""}</style>
      <div style={{position:"relative"}}>
        <PreviewBox height={160}>
          <div style={previewStyle}/>
        </PreviewBox>
        <button onClick={()=>setPlaying(p=>!p)} style={{position:"absolute",top:28,right:10,background:"rgba(0,0,0,0.6)",border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 10px",color:C.text,cursor:"pointer",fontSize:12}}>{playing?"⏸ Pause":"▶ Play"}</button>
      </div>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 8. CSS FILTER ─────────────────────────────────────────────────────────────
function CssFilter() {
  const [blur,setBlur]=useState(0);
  const [brightness,setBrightness]=useState(100);
  const [contrast,setContrast]=useState(100);
  const [saturate,setSaturate]=useState(100);
  const [hueRotate,setHueRotate]=useState(0);
  const [grayscale,setGrayscale]=useState(0);
  const [invert,setInvert]=useState(0);
  const [sepia,setSepia]=useState(0);
  const [opacity2,setOpacity2]=useState(100);
  const [imgUrl,setImgUrl]=useState("https://picsum.photos/seed/css/400/200");

  const parts=[];
  if(blur>0) parts.push(`blur(${blur}px)`);
  if(brightness!==100) parts.push(`brightness(${brightness}%)`);
  if(contrast!==100) parts.push(`contrast(${contrast}%)`);
  if(saturate!==100) parts.push(`saturate(${saturate}%)`);
  if(hueRotate!==0) parts.push(`hue-rotate(${hueRotate}deg)`);
  if(grayscale>0) parts.push(`grayscale(${grayscale}%)`);
  if(invert>0) parts.push(`invert(${invert}%)`);
  if(sepia>0) parts.push(`sepia(${sepia}%)`);
  if(opacity2!==100) parts.push(`opacity(${opacity2}%)`);
  const filterVal=parts.length?parts.join(" "):"none";
  const css=`filter: ${filterVal};`;
  const reset=()=>{setBlur(0);setBrightness(100);setContrast(100);setSaturate(100);setHueRotate(0);setGrayscale(0);setInvert(0);setSepia(0);setOpacity2(100);};

  return (
    <VStack>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Slider label="Blur" value={blur} onChange={setBlur} min={0} max={20} unit="px"/>
        <Slider label="Brightness" value={brightness} onChange={setBrightness} min={0} max={200} unit="%"/>
        <Slider label="Contrast" value={contrast} onChange={setContrast} min={0} max={200} unit="%"/>
        <Slider label="Saturate" value={saturate} onChange={setSaturate} min={0} max={300} unit="%"/>
        <Slider label="Hue Rotate" value={hueRotate} onChange={setHueRotate} min={0} max={360} unit="°"/>
        <Slider label="Grayscale" value={grayscale} onChange={setGrayscale} min={0} max={100} unit="%"/>
        <Slider label="Invert" value={invert} onChange={setInvert} min={0} max={100} unit="%"/>
        <Slider label="Sepia" value={sepia} onChange={setSepia} min={0} max={100} unit="%"/>
      </div>
      <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
        <div style={{flex:1}}><Label>Sample Image URL</Label><Input value={imgUrl} onChange={setImgUrl} placeholder="https://…"/></div>
        <Btn variant="secondary" size="sm" onClick={reset}>Reset</Btn>
      </div>
      <PreviewBox height={200}>
        <img src={imgUrl} alt="filter preview" style={{width:"100%",height:"100%",objectFit:"cover",filter:filterVal}} onError={e=>e.target.style.display="none"}/>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 9. CSS TRANSFORM ──────────────────────────────────────────────────────────
function CssTransform() {
  const [rotate,setRotate]=useState(0);
  const [scaleX,setScaleX]=useState(100);
  const [scaleY,setScaleY]=useState(100);
  const [translateX,setTranslateX]=useState(0);
  const [translateY,setTranslateY]=useState(0);
  const [skewX,setSkewX]=useState(0);
  const [skewY,setSkewY]=useState(0);
  const [color,setColor]=useState("#06B6D4");
  const [linked,setLinked]=useState(true);

  const setScale=v=>{setScaleX(v);setScaleY(v);};
  const parts=[];
  if(rotate!==0) parts.push(`rotate(${rotate}deg)`);
  if(scaleX!==100||scaleY!==100) parts.push(`scale(${scaleX/100}, ${scaleY/100})`);
  if(translateX!==0||translateY!==0) parts.push(`translate(${translateX}px, ${translateY}px)`);
  if(skewX!==0||skewY!==0) parts.push(`skew(${skewX}deg, ${skewY}deg)`);
  const transformVal=parts.join(" ")||"none";
  const css=`transform: ${transformVal};\ntransform-origin: center;`;

  return (
    <VStack>
      <Slider label="Rotate" value={rotate} onChange={setRotate} min={-180} max={180} unit="°"/>
      <div>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:C.text,marginBottom:8}}>
          <input type="checkbox" checked={linked} onChange={e=>setLinked(e.target.checked)}/> Link Scale X/Y
        </label>
        {linked?(
          <Slider label="Scale" value={scaleX} onChange={setScale} min={0} max={300} unit="%"/>
        ):(
          <Grid2 gap={12}><Slider label="Scale X" value={scaleX} onChange={setScaleX} min={0} max={300} unit="%"/><Slider label="Scale Y" value={scaleY} onChange={setScaleY} min={0} max={300} unit="%"/></Grid2>
        )}
      </div>
      <Grid2 gap={12}>
        <Slider label="Translate X" value={translateX} onChange={setTranslateX} min={-100} max={100} unit="px"/>
        <Slider label="Translate Y" value={translateY} onChange={setTranslateY} min={-100} max={100} unit="px"/>
        <Slider label="Skew X" value={skewX} onChange={setSkewX} min={-45} max={45} unit="°"/>
        <Slider label="Skew Y" value={skewY} onChange={setSkewY} min={-45} max={45} unit="°"/>
      </Grid2>
      <ColorPicker label="Element Color" value={color} onChange={setColor}/>
      <PreviewBox height={200}>
        <div style={{width:100,height:70,background:color,borderRadius:10,transform:transformVal,transition:"transform .1s",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#000"}}>Box</div>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 10. CSS TRANSITION ────────────────────────────────────────────────────────
function CssTransition() {
  const [property,setProperty]=useState("all");
  const [duration,setDuration]=useState(0.3);
  const [easing,setEasing]=useState("ease");
  const [delay,setDelay]=useState(0);
  const [color,setColor]=useState("#06B6D4");
  const [hovered,setHovered]=useState(false);

  const css=`transition: ${property} ${duration}s ${easing} ${delay}s;`;
  const previewStyle={width:120,height:80,background:hovered?"#EC4899":color,borderRadius:hovered?40:12,transform:hovered?"scale(1.15)":"scale(1)",transition:css.replace("transition: ","").replace(";",""),cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#000",fontWeight:700};

  return (
    <VStack>
      <div><Label>Property</Label>
        <SelectInput value={property} onChange={setProperty} options={["all","background-color","transform","opacity","border-radius","color","box-shadow","width","height"].map(v=>({value:v,label:v}))}/>
      </div>
      <Grid2 gap={12}>
        <Slider label="Duration" value={duration} onChange={setDuration} min={0} max={3} step={0.05} unit="s"/>
        <Slider label="Delay" value={delay} onChange={setDelay} min={0} max={2} step={0.05} unit="s"/>
      </Grid2>
      <div><Label>Easing Function</Label>
        <SelectInput value={easing} onChange={setEasing} options={["ease","ease-in","ease-out","ease-in-out","linear","cubic-bezier(0.68,-0.55,0.265,1.55)","cubic-bezier(0.25,0.46,0.45,0.94)"].map(v=>({value:v,label:v}))}/>
      </div>
      <ColorPicker label="Base Color" value={color} onChange={setColor}/>
      <PreviewBox height={160} label="Preview (hover the box)">
        <div style={previewStyle} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>Hover me</div>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 11. CSS BUTTON ────────────────────────────────────────────────────────────
function CssButton() {
  const [text,setText]=useState("Click Me");
  const [bg,setBg]=useState("#06B6D4");
  const [hoverBg,setHoverBg]=useState("#0891B2");
  const [textColor,setTextColor]=useState("#000000");
  const [fontSize,setFontSize]=useState(15);
  const [paddingV,setPaddingV]=useState(12);
  const [paddingH,setPaddingH]=useState(28);
  const [radius,setRadius]=useState(8);
  const [bold,setBold]=useState(true);
  const [borderWidth,setBorderWidth]=useState(0);
  const [borderColor,setBorderColor]=useState("#06B6D4");
  const [shadow,setShadow]=useState(true);
  const [shadowColor,setShadowColor]=useState("#06B6D444");
  const [hovered,setHovered]=useState(false);

  const btnStyle={display:"inline-flex",alignItems:"center",justifyContent:"center",padding:`${paddingV}px ${paddingH}px`,background:hovered?hoverBg:bg,color:textColor,fontSize,fontWeight:bold?700:400,borderRadius:radius,border:borderWidth?`${borderWidth}px solid ${borderColor}`:"none",boxShadow:shadow?`0 4px 15px ${shadowColor}`:"none",cursor:"pointer",transition:"all 0.2s ease",fontFamily:"'Plus Jakarta Sans',sans-serif"};
  const css=`.button {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: ${paddingV}px ${paddingH}px;\n  background: ${bg};\n  color: ${textColor};\n  font-size: ${fontSize}px;\n  font-weight: ${bold?700:400};\n  border-radius: ${radius}px;\n  border: ${borderWidth?`${borderWidth}px solid ${borderColor}`:"none"};\n  box-shadow: ${shadow?`0 4px 15px ${shadowColor}`:"none"};\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n\n.button:hover {\n  background: ${hoverBg};\n}`;

  return (
    <VStack>
      <Grid2>
        <div><Label>Button Text</Label><Input value={text} onChange={setText}/></div>
        <Slider label="Font Size" value={fontSize} onChange={setFontSize} min={12} max={24} unit="px"/>
      </Grid2>
      <Grid3>
        <ColorPicker label="Background" value={bg} onChange={setBg}/>
        <ColorPicker label="Hover Background" value={hoverBg} onChange={setHoverBg}/>
        <ColorPicker label="Text Color" value={textColor} onChange={setTextColor}/>
      </Grid3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12}}>
        <Slider label="Pad V" value={paddingV} onChange={setPaddingV} min={4} max={32} unit="px"/>
        <Slider label="Pad H" value={paddingH} onChange={setPaddingH} min={8} max={64} unit="px"/>
        <Slider label="Radius" value={radius} onChange={setRadius} min={0} max={50} unit="px"/>
        <Slider label="Border" value={borderWidth} onChange={setBorderWidth} min={0} max={4} unit="px"/>
      </div>
      <div style={{display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:C.text}}><input type="checkbox" checked={bold} onChange={e=>setBold(e.target.checked)}/> Bold text</label>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:C.text}}><input type="checkbox" checked={shadow} onChange={e=>setShadow(e.target.checked)}/> Box shadow</label>
        {borderWidth>0&&<ColorPicker value={borderColor} onChange={setBorderColor}/>}
        {shadow&&<ColorPicker label="Shadow Color" value={shadowColor} onChange={setShadowColor}/>}
      </div>
      <PreviewBox height={120}>
        <button style={btnStyle} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>{text}</button>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 12. CSS TYPOGRAPHY ────────────────────────────────────────────────────────
function CssTypography() {
  const [fontFamily,setFontFamily]=useState("'Sora', sans-serif");
  const [fontSize,setFontSize]=useState(18);
  const [fontWeight,setFontWeight]=useState("400");
  const [lineHeight,setLineHeight]=useState(1.6);
  const [letterSpacing,setLetterSpacing]=useState(0);
  const [wordSpacing,setWordSpacing]=useState(0);
  const [color,setColor]=useState("#E2E8F0");
  const [align,setAlign]=useState("left");
  const [transform,setTransform]=useState("none");
  const [decoration,setDecoration]=useState("none");
  const [preview,setPreview]=useState("The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.");

  const families=["'Sora', sans-serif","'Plus Jakarta Sans', sans-serif","Georgia, serif","'Times New Roman', serif","'Courier New', monospace","'JetBrains Mono', monospace","Impact, sans-serif","Verdana, sans-serif"];
  const css=`font-family: ${fontFamily};\nfont-size: ${fontSize}px;\nfont-weight: ${fontWeight};\nline-height: ${lineHeight};\nletter-spacing: ${letterSpacing}px;\nword-spacing: ${wordSpacing}px;\ncolor: ${color};\ntext-align: ${align};\ntext-transform: ${transform};\ntext-decoration: ${decoration};`;

  return (
    <VStack>
      <div><Label>Font Family</Label><SelectInput value={fontFamily} onChange={setFontFamily} options={families.map(f=>({value:f,label:f.split(",")[0].replace(/'/g,"")}))}/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        <Slider label="Font Size" value={fontSize} onChange={setFontSize} min={10} max={72} unit="px"/>
        <Slider label="Line Height" value={lineHeight} onChange={setLineHeight} min={1} max={3} step={0.1} unit=""/>
        <Slider label="Letter Spacing" value={letterSpacing} onChange={setLetterSpacing} min={-2} max={10} step={0.5} unit="px"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div><Label>Font Weight</Label><SelectInput value={fontWeight} onChange={setFontWeight} options={["100","200","300","400","500","600","700","800","900"].map(v=>({value:v,label:v}))}/></div>
        <div><Label>Text Align</Label><SelectInput value={align} onChange={setAlign} options={["left","center","right","justify"].map(v=>({value:v,label:v}))}/></div>
        <div><Label>Text Transform</Label><SelectInput value={transform} onChange={setTransform} options={["none","uppercase","lowercase","capitalize"].map(v=>({value:v,label:v}))}/></div>
        <div><Label>Text Decoration</Label><SelectInput value={decoration} onChange={setDecoration} options={["none","underline","overline","line-through"].map(v=>({value:v,label:v}))}/></div>
      </div>
      <ColorPicker label="Text Color" value={color} onChange={setColor}/>
      <div><Label>Preview Text</Label><textarea value={preview} onChange={e=>setPreview(e.target.value)} rows={3} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical"}}/></div>
      <div style={{padding:20,background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:10,fontFamily,fontSize,fontWeight,lineHeight,letterSpacing,wordSpacing,color,textAlign:align,textTransform:transform,textDecoration:decoration,minHeight:80}}>
        {preview}
      </div>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 13. CSS CLIP-PATH ─────────────────────────────────────────────────────────
function CssClipPath() {
  const [shape,setShape]=useState("polygon");
  const [color,setColor]=useState("#06B6D4");
  const presets={
    circle:{value:"circle(50% at 50% 50%)",label:"Circle"},
    ellipse:{value:"ellipse(50% 30% at 50% 50%)",label:"Ellipse"},
    triangle:{value:"polygon(50% 0%, 0% 100%, 100% 100%)",label:"Triangle"},
    diamond:{value:"polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",label:"Diamond"},
    pentagon:{value:"polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",label:"Pentagon"},
    hexagon:{value:"polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",label:"Hexagon"},
    star:{value:"polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",label:"Star"},
    arrow:{value:"polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)",label:"Arrow"},
    message:{value:"polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)",label:"Message"},
    custom:{value:"polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",label:"Custom"},
  };
  const [customVal,setCustomVal]=useState(presets.diamond.value);
  const current=shape==="custom"?customVal:(presets[shape]?.value||"none");
  const css=`clip-path: ${current};`;

  return (
    <VStack>
      <div>
        <Label>Shape Preset</Label>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
          {Object.entries(presets).map(([k,{label}])=>(
            <Btn key={k} size="sm" variant={shape===k?"primary":"secondary"} onClick={()=>setShape(k)}>{label}</Btn>
          ))}
        </div>
      </div>
      {shape==="custom"&&<div><Label>Custom clip-path value</Label><Input value={customVal} onChange={setCustomVal} mono/></div>}
      <ColorPicker label="Element Color" value={color} onChange={setColor}/>
      <PreviewBox height={200}>
        <div style={{width:180,height:160,background:color,clipPath:current,transition:"clip-path .3s ease"}}/>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 14. GLASSMORPHISM ─────────────────────────────────────────────────────────
function CssGlassmorphism() {
  const [blur,setBlur]=useState(12);
  const [bgOpacity,setBgOpacity]=useState(15);
  const [bgColor,setBgColor]=useState("#ffffff");
  const [borderOpacity,setBorderOpacity]=useState(30);
  const [borderWidth,setBorderWidth]=useState(1);
  const [radius,setRadius]=useState(16);
  const [saturation,setSaturation]=useState(180);
  const [gradientBg,setGradientBg]=useState("linear-gradient(135deg, #06B6D4, #8B5CF6, #EC4899)");

  const hex2rgb=h=>{const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return`${r},${g},${b}`;};
  const bgRgba=`rgba(${hex2rgb(bgColor)}, ${bgOpacity/100})`;
  const borderRgba=`rgba(${hex2rgb(bgColor)}, ${borderOpacity/100})`;
  const css=`.glass {\n  background: ${bgRgba};\n  backdrop-filter: blur(${blur}px) saturate(${saturation}%);\n  -webkit-backdrop-filter: blur(${blur}px) saturate(${saturation}%);\n  border: ${borderWidth}px solid ${borderRgba};\n  border-radius: ${radius}px;\n}`;

  return (
    <VStack>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Slider label="Blur" value={blur} onChange={setBlur} min={0} max={40} unit="px"/>
        <Slider label="Saturation" value={saturation} onChange={setSaturation} min={100} max={300} unit="%"/>
        <Slider label="BG Opacity" value={bgOpacity} onChange={setBgOpacity} min={0} max={80} unit="%"/>
        <Slider label="Border Opacity" value={borderOpacity} onChange={setBorderOpacity} min={0} max={100} unit="%"/>
        <Slider label="Border Width" value={borderWidth} onChange={setBorderWidth} min={0} max={4} unit="px"/>
        <Slider label="Border Radius" value={radius} onChange={setRadius} min={0} max={40} unit="px"/>
      </div>
      <ColorPicker label="Glass Color (base)" value={bgColor} onChange={setBgColor}/>
      <div><Label>Background Gradient</Label><Input value={gradientBg} onChange={setGradientBg} mono/></div>
      <PreviewBox height={200}>
        <div style={{width:"100%",height:"100%",background:gradientBg,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:260,height:140,background:bgRgba,backdropFilter:`blur(${blur}px) saturate(${saturation}%)`,WebkitBackdropFilter:`blur(${blur}px) saturate(${saturation}%)`,border:`${borderWidth}px solid ${borderRgba}`,borderRadius:radius,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:6}}>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:700,color:"#fff"}}>Glass Card</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.7)"}}>Glassmorphism effect</div>
          </div>
        </div>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 15. NEUMORPHISM ───────────────────────────────────────────────────────────
function CssNeumorphism() {
  const [bg,setBg]=useState("#e0e5ec");
  const [distance,setDistance]=useState(10);
  const [blur2,setBlur2]=useState(20);
  const [intensity,setIntensity]=useState(0.2);
  const [radius,setRadius]=useState(16);
  const [type,setType]=useState("flat");
  const [shape,setShape]=useState("rectangle");

  function hexToRgb(hex){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return{r,g,b};}
  function adjustColor(hex,amount){const{r,g,b}=hexToRgb(hex);const adj=v=>Math.max(0,Math.min(255,Math.round(v+amount)));return`rgb(${adj(r)},${adj(g)},${adj(b)})`;}
  const shadowDark=adjustColor(bg,-255*intensity);
  const shadowLight=adjustColor(bg,255*intensity);

  let shadow="";
  if(type==="flat"){shadow=`${distance}px ${distance}px ${blur2}px ${shadowDark}, -${distance}px -${distance}px ${blur2}px ${shadowLight}`;}
  else if(type==="pressed"){shadow=`inset ${distance}px ${distance}px ${blur2}px ${shadowDark}, inset -${distance}px -${distance}px ${blur2}px ${shadowLight}`;}
  else{shadow=`${distance}px ${distance}px ${blur2}px ${shadowDark}, -${distance}px -${distance}px ${blur2}px ${shadowLight}, inset ${distance/2}px ${distance/2}px ${blur2/2}px ${shadowLight}, inset -${distance/2}px -${distance/2}px ${blur2/2}px ${shadowDark}`;}

  const css=`.neumorphic {\n  background: ${bg};\n  border-radius: ${shape==="circle"?"50%":`${radius}px`};\n  box-shadow: ${shadow};\n}`;

  return (
    <VStack>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {[["flat","Flat"],["pressed","Pressed"],["concave","Concave"]].map(([v,l])=>(
          <Btn key={v} size="sm" variant={type===v?"primary":"secondary"} onClick={()=>setType(v)}>{l}</Btn>
        ))}
        {[["rectangle","Rectangle"],["circle","Circle"]].map(([v,l])=>(
          <Btn key={v} size="sm" variant={shape===v?"primary":"secondary"} onClick={()=>setShape(v)}>{l}</Btn>
        ))}
      </div>
      <ColorPicker label="Base Background Color" value={bg} onChange={setBg}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        <Slider label="Distance" value={distance} onChange={setDistance} min={2} max={30} unit="px"/>
        <Slider label="Blur" value={blur2} onChange={setBlur2} min={4} max={60} unit="px"/>
        <Slider label="Intensity" value={Math.round(intensity*100)} onChange={v=>setIntensity(v/100)} min={5} max={40} unit="%"/>
      </div>
      {shape!=="circle"&&<Slider label="Border Radius" value={radius} onChange={setRadius} min={0} max={40} unit="px"/>}
      <PreviewBox height={200}>
        <div style={{width:"100%",height:"100%",background:bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:shape==="circle"?120:180,height:shape==="circle"?120:90,background:bg,borderRadius:shape==="circle"?"50%":`${radius}px`,boxShadow:shadow,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:13,fontWeight:600,color:adjustColor(bg,-60)}}>Element</span>
          </div>
        </div>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 16. CSS SCROLLBAR ─────────────────────────────────────────────────────────
function CssScrollbar() {
  const [width,setWidth]=useState(8);
  const [trackColor,setTrackColor]=useState("#0D1117");
  const [thumbColor,setThumbColor]=useState("#06B6D4");
  const [thumbHover,setThumbHover]=useState("#22D3EE");
  const [radius,setRadius]=useState(4);
  const [selector,setSelector]=useState("*");

  const css=`${selector}::-webkit-scrollbar {\n  width: ${width}px;\n}\n\n${selector}::-webkit-scrollbar-track {\n  background: ${trackColor};\n}\n\n${selector}::-webkit-scrollbar-thumb {\n  background: ${thumbColor};\n  border-radius: ${radius}px;\n}\n\n${selector}::-webkit-scrollbar-thumb:hover {\n  background: ${thumbHover};\n}`;

  const demoStyle={width:"100%",height:140,overflowY:"scroll",padding:12,background:C.surface,borderRadius:8,fontSize:12,color:C.muted,lineHeight:1.8};
  const scrollbarStyle=`#sb-preview::-webkit-scrollbar{width:${width}px}#sb-preview::-webkit-scrollbar-track{background:${trackColor}}#sb-preview::-webkit-scrollbar-thumb{background:${thumbColor};border-radius:${radius}px}#sb-preview::-webkit-scrollbar-thumb:hover{background:${thumbHover}}`;

  return (
    <VStack>
      <style>{scrollbarStyle}</style>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Slider label="Scrollbar Width" value={width} onChange={setWidth} min={2} max={24} unit="px"/>
        <Slider label="Thumb Radius" value={radius} onChange={setRadius} min={0} max={12} unit="px"/>
      </div>
      <Grid3>
        <ColorPicker label="Track Color" value={trackColor} onChange={setTrackColor}/>
        <ColorPicker label="Thumb Color" value={thumbColor} onChange={setThumbColor}/>
        <ColorPicker label="Thumb Hover" value={thumbHover} onChange={setThumbHover}/>
      </Grid3>
      <div><Label>CSS Selector</Label><Input value={selector} onChange={setSelector} mono placeholder="* or body or .container"/></div>
      <div>
        <Label>Preview (scrollable area)</Label>
        <div id="sb-preview" style={demoStyle}>
          {Array.from({length:20},(_,i)=><div key={i}>Line {i+1} — Scroll to see the custom scrollbar in action. This is sample content to make the area scrollable.</div>)}
        </div>
      </div>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 17. CSS VARIABLES ─────────────────────────────────────────────────────────
function CssVariables() {
  const [tokens,setTokens]=useState([
    {name:"color-primary",value:"#06B6D4",type:"color"},
    {name:"color-secondary",value:"#8B5CF6",type:"color"},
    {name:"color-accent",value:"#EC4899",type:"color"},
    {name:"color-bg",value:"#06090F",type:"color"},
    {name:"color-surface",value:"#0D1117",type:"color"},
    {name:"color-text",value:"#E2E8F0",type:"color"},
    {name:"radius-sm",value:"4px",type:"text"},
    {name:"radius-md",value:"8px",type:"text"},
    {name:"radius-lg",value:"16px",type:"text"},
    {name:"spacing-sm",value:"8px",type:"text"},
    {name:"spacing-md",value:"16px",type:"text"},
    {name:"spacing-lg",value:"32px",type:"text"},
    {name:"font-sans",value:"'Plus Jakarta Sans', sans-serif",type:"text"},
    {name:"font-mono",value:"'JetBrains Mono', monospace",type:"text"},
  ]);
  const addToken=()=>setTokens(t=>[...t,{name:"new-token",value:"#ffffff",type:"color"}]);
  const update=(i,k,v)=>setTokens(t=>t.map((x,j)=>j===i?{...x,[k]:v}:x));
  const remove=i=>setTokens(t=>t.filter((_,j)=>j!==i));

  const css=`:root {\n${tokens.map(t=>`  --${t.name}: ${t.value};`).join("\n")}\n}`;

  return (
    <VStack>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <Label>Design Tokens ({tokens.length})</Label>
        <Btn size="sm" variant="secondary" onClick={addToken}>+ Add Token</Btn>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:340,overflowY:"auto"}}>
        {tokens.map((t,i)=>(
          <div key={i} style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{color:C.muted,fontSize:12,minWidth:12}}>--</span>
            <Input value={t.name} onChange={v=>update(i,"name",v)} mono style={{flex:1}}/>
            <span style={{color:C.muted,fontSize:12}}>:</span>
            {t.type==="color"?(
              <div style={{display:"flex",gap:6,alignItems:"center",flex:1}}>
                <input type="color" value={t.value.startsWith("#")?t.value:"#000000"} onChange={e=>update(i,"value",e.target.value)} style={{width:36,height:36,borderRadius:6,border:`1px solid ${C.border}`,padding:2,background:"none",cursor:"pointer"}}/>
                <Input value={t.value} onChange={v=>update(i,"value",v)} mono style={{flex:1}}/>
              </div>
            ):<Input value={t.value} onChange={v=>update(i,"value",v)} mono style={{flex:1}}/>}
            <SelectInput value={t.type} onChange={v=>update(i,"type",v)} options={[{value:"color",label:"color"},{value:"text",label:"text"}]} style={{width:80}}/>
            <Btn size="sm" variant="ghost" onClick={()=>remove(i)}>×</Btn>
          </div>
        ))}
      </div>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 18. CSS LOADER ────────────────────────────────────────────────────────────
function CssLoader() {
  const [type,setType]=useState("spinner");
  const [color,setColor]=useState("#06B6D4");
  const [size,setSize]=useState(48);
  const [speed,setSpeed]=useState(1);
  const [trackColor,setTrackColor]=useState("#1e293b");

  const loaders={
    spinner:{
      preview:<div style={{width:size,height:size,border:`4px solid ${trackColor}`,borderTopColor:color,borderRadius:"50%",animation:`spin ${speed}s linear infinite`}}/>,
      css:`.spinner {\n  width: ${size}px;\n  height: ${size}px;\n  border: 4px solid ${trackColor};\n  border-top-color: ${color};\n  border-radius: 50%;\n  animation: spin ${speed}s linear infinite;\n}\n\n@keyframes spin {\n  to { transform: rotate(360deg); }\n}`,
    },
    dots:{
      preview:<div style={{display:"flex",gap:8,alignItems:"center"}}>{[0,0.2,0.4].map((d,i)=><div key={i} style={{width:size/4,height:size/4,borderRadius:"50%",background:color,animation:`dotBounce ${speed}s ease-in-out ${d}s infinite`}}/>)}</div>,
      css:`.dots {\n  display: flex;\n  gap: 8px;\n  align-items: center;\n}\n\n.dot {\n  width: ${size/4}px;\n  height: ${size/4}px;\n  border-radius: 50%;\n  background: ${color};\n  animation: dotBounce ${speed}s ease-in-out infinite;\n}\n.dot:nth-child(2) { animation-delay: 0.2s; }\n.dot:nth-child(3) { animation-delay: 0.4s; }\n\n@keyframes dotBounce {\n  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }\n  40% { transform: scale(1); opacity: 1; }\n}`,
    },
    pulse:{
      preview:<div style={{width:size,height:size,borderRadius:"50%",background:color,animation:`pulse ${speed}s ease-in-out infinite`}}/>,
      css:`.pulse {\n  width: ${size}px;\n  height: ${size}px;\n  border-radius: 50%;\n  background: ${color};\n  animation: pulse ${speed}s ease-in-out infinite;\n}\n\n@keyframes pulse {\n  0%, 100% { transform: scale(0.8); opacity: 0.6; }\n  50% { transform: scale(1.2); opacity: 1; }\n}`,
    },
    bars:{
      preview:<div style={{display:"flex",gap:4,alignItems:"center",height:size}}>{[0,0.1,0.2,0.3].map((d,i)=><div key={i} style={{width:size/6,height:"100%",background:color,borderRadius:3,animation:`barPulse ${speed}s ease-in-out ${d}s infinite`}}/>)}</div>,
      css:`.bars {\n  display: flex;\n  gap: 4px;\n  align-items: center;\n  height: ${size}px;\n}\n\n.bar {\n  width: ${Math.round(size/6)}px;\n  height: 100%;\n  background: ${color};\n  border-radius: 3px;\n  animation: barPulse ${speed}s ease-in-out infinite;\n}\n.bar:nth-child(2){animation-delay:0.1s}\n.bar:nth-child(3){animation-delay:0.2s}\n.bar:nth-child(4){animation-delay:0.3s}\n\n@keyframes barPulse {\n  0%,100%{transform:scaleY(0.4);opacity:0.6}\n  50%{transform:scaleY(1);opacity:1}\n}`,
    },
    ring:{
      preview:<div style={{width:size,height:size,borderRadius:"50%",border:`4px solid ${color}`,animation:`ringPulse ${speed}s ease-out infinite`}}/>,
      css:`.ring {\n  width: ${size}px;\n  height: ${size}px;\n  border-radius: 50%;\n  border: 4px solid ${color};\n  animation: ringPulse ${speed}s ease-out infinite;\n}\n\n@keyframes ringPulse {\n  0% { transform: scale(0.5); opacity: 1; }\n  100% { transform: scale(1.5); opacity: 0; }\n}`,
    },
  };

  const spinKeyframes=`@keyframes spin{to{transform:rotate(360deg)}}@keyframes dotBounce{0%,80%,100%{transform:scale(0.6);opacity:0.5}40%{transform:scale(1);opacity:1}}@keyframes pulse{0%,100%{transform:scale(0.8);opacity:0.6}50%{transform:scale(1.2);opacity:1}}@keyframes barPulse{0%,100%{transform:scaleY(0.4);opacity:0.6}50%{transform:scaleY(1);opacity:1}}@keyframes ringPulse{0%{transform:scale(0.5);opacity:1}100%{transform:scale(1.5);opacity:0}}`;

  return (
    <VStack>
      <style>{spinKeyframes}</style>
      <div>
        <Label>Loader Type</Label>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
          {Object.keys(loaders).map(k=><Btn key={k} size="sm" variant={type===k?"primary":"secondary"} onClick={()=>setType(k)}>{k}</Btn>)}
        </div>
      </div>
      <Grid3>
        <Slider label="Size" value={size} onChange={setSize} min={20} max={96} unit="px"/>
        <Slider label="Speed" value={speed} onChange={setSpeed} min={0.3} max={3} step={0.1} unit="s"/>
        <ColorPicker label="Color" value={color} onChange={setColor}/>
      </Grid3>
      {type==="spinner"&&<ColorPicker label="Track Color" value={trackColor} onChange={setTrackColor}/>}
      <PreviewBox height={160}>
        {loaders[type]?.preview}
      </PreviewBox>
      <CSSOutput css={loaders[type]?.css||""}/>
    </VStack>
  );
}

// ── 19. CSS TRIANGLE ──────────────────────────────────────────────────────────
function CssTriangle() {
  const [direction,setDirection]=useState("up");
  const [width,setWidth]=useState(60);
  const [height,setHeight]=useState(60);
  const [color,setColor]=useState("#06B6D4");

  const dirs={
    up:   {borderLeft:`${width/2}px solid transparent`,borderRight:`${width/2}px solid transparent`,borderBottom:`${height}px solid ${color}`,width:0,height:0},
    down: {borderLeft:`${width/2}px solid transparent`,borderRight:`${width/2}px solid transparent`,borderTop:`${height}px solid ${color}`,width:0,height:0},
    left: {borderTop:`${height/2}px solid transparent`,borderBottom:`${height/2}px solid transparent`,borderRight:`${width}px solid ${color}`,width:0,height:0},
    right:{borderTop:`${height/2}px solid transparent`,borderBottom:`${height/2}px solid transparent`,borderLeft:`${width}px solid ${color}`,width:0,height:0},
    "up-left":  {borderTop:`${height}px solid ${color}`,borderRight:`${width}px solid transparent`,width:0,height:0},
    "up-right": {borderTop:`${height}px solid ${color}`,borderLeft:`${width}px solid transparent`,width:0,height:0},
    "down-left":{borderBottom:`${height}px solid ${color}`,borderRight:`${width}px solid transparent`,width:0,height:0},
    "down-right":{borderBottom:`${height}px solid ${color}`,borderLeft:`${width}px solid transparent`,width:0,height:0},
  };

  const d=dirs[direction];
  const cssProps=Object.entries(d).filter(([,v])=>v!==0).map(([k,v])=>`  ${k.replace(/([A-Z])/g,"-$1").toLowerCase()}: ${v};`).join("\n");
  const css=`.triangle {\n  width: 0;\n  height: 0;\n${cssProps}\n}`;

  return (
    <VStack>
      <div>
        <Label>Direction</Label>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
          {Object.keys(dirs).map(d=><Btn key={d} size="sm" variant={direction===d?"primary":"secondary"} onClick={()=>setDirection(d)}>{d}</Btn>)}
        </div>
      </div>
      <Grid3>
        <Slider label="Width" value={width} onChange={setWidth} min={10} max={200} unit="px"/>
        <Slider label="Height" value={height} onChange={setHeight} min={10} max={200} unit="px"/>
        <ColorPicker label="Color" value={color} onChange={setColor}/>
      </Grid3>
      <PreviewBox height={200}>
        <div style={{...d,transition:"border .2s"}}/>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 20. CSS COLOR PALETTE ─────────────────────────────────────────────────────
function CssColorPalette() {
  const [baseColor,setBaseColor]=useState("#06B6D4");
  const [mode,setMode]=useState("analogous");

  function hexToHsl(hex){
    let r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;
    const max=Math.max(r,g,b),min=Math.min(r,g,b);let h,s,l=(max+min)/2;
    if(max===min){h=s=0;}else{const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break;}}
    return[Math.round(h*360),Math.round(s*100),Math.round(l*100)];
  }
  function hslToHex(h,s,l){h/=360;s/=100;l/=100;let r,g,b;if(s===0){r=g=b=l;}else{const hue2rgb=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;r=hue2rgb(p,q,h+1/3);g=hue2rgb(p,q,h);b=hue2rgb(p,q,h-1/3);}return`#${[r,g,b].map(v=>Math.round(v*255).toString(16).padStart(2,"0")).join("")}`;}

  const palette=useMemo(()=>{
    const[h,s,l]=hexToHsl(baseColor);
    const schemes={
      analogous:[hslToHex((h-30+360)%360,s,l),hslToHex((h-15+360)%360,s,l),baseColor,hslToHex((h+15)%360,s,l),hslToHex((h+30)%360,s,l)],
      complementary:[baseColor,hslToHex((h+180)%360,s,l),hslToHex(h,s,Math.max(20,l-20)),hslToHex(h,s,Math.min(80,l+20)),hslToHex((h+180)%360,s,Math.max(20,l-20))],
      triadic:[baseColor,hslToHex((h+120)%360,s,l),hslToHex((h+240)%360,s,l),hslToHex(h,Math.max(20,s-20),l),hslToHex(h,s,Math.min(80,l+15))],
      monochromatic:[hslToHex(h,s,Math.max(10,l-30)),hslToHex(h,s,Math.max(10,l-15)),baseColor,hslToHex(h,s,Math.min(90,l+15)),hslToHex(h,s,Math.min(90,l+30))],
      "split-complementary":[baseColor,hslToHex((h+150)%360,s,l),hslToHex((h+210)%360,s,l),hslToHex(h,Math.max(30,s-10),Math.min(75,l+10)),hslToHex(h,s,Math.max(25,l-10))],
    };
    return schemes[mode]||schemes.analogous;
  },[baseColor,mode]);

  const css=`:root {\n${palette.map((c,i)=>`  --color-${i+1}: ${c};`).join("\n")}\n}\n\n/* Palette: ${mode} */\n/* Base: ${baseColor} */`;

  return (
    <VStack>
      <ColorPicker label="Base Color" value={baseColor} onChange={setBaseColor}/>
      <div>
        <Label>Color Harmony</Label>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
          {["analogous","complementary","triadic","monochromatic","split-complementary"].map(m=>(
            <Btn key={m} size="sm" variant={mode===m?"primary":"secondary"} onClick={()=>setMode(m)}>{m}</Btn>
          ))}
        </div>
      </div>
      <div>
        <Label>Generated Palette</Label>
        <div style={{display:"flex",height:100,borderRadius:10,overflow:"hidden",marginTop:6}}>
          {palette.map((c,i)=>(
            <div key={i} style={{flex:1,background:c,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",padding:"6px 4px",cursor:"pointer"}} onClick={()=>navigator.clipboard.writeText(c)}>
              <span style={{fontSize:9,color:"rgba(0,0,0,0.6)",fontFamily:"'JetBrains Mono',monospace",background:"rgba(255,255,255,0.5)",borderRadius:3,padding:"1px 4px"}}>{c}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {palette.map((c,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:6}}>
            <div style={{width:16,height:16,borderRadius:3,background:c}}/>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:C.text}}>{c}</span>
            <Btn size="sm" variant="ghost" onClick={()=>navigator.clipboard.writeText(c)}>Copy</Btn>
          </div>
        ))}
      </div>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 21. PX TO REM CONVERTER ───────────────────────────────────────────────────
function PxToRem() {
  const [root,setRoot]=useState(16);
  const [px,setPx]=useState("24");
  const [rem,setRem]=useState("1.5");
  const [batch,setBatch]=useState("12, 16, 18, 24, 32, 48");

  const rootNum=parseFloat(root)||16;
  const fmt=n=>Number.isFinite(n)?parseFloat(n.toFixed(4)).toString():"—";

  const pxNum=parseFloat(px);
  const pxToRemVal=Number.isFinite(pxNum)?fmt(pxNum/rootNum):"—";
  const remNum=parseFloat(rem);
  const remToPxVal=Number.isFinite(remNum)?fmt(remNum*rootNum):"—";

  const batchRows=useMemo(()=>{
    return (batch.match(/-?\d*\.?\d+/g)||[]).map(v=>{
      const n=parseFloat(v);
      return {px:fmt(n),rem:fmt(n/rootNum)};
    });
  },[batch,rootNum]);
  const batchCss=batchRows.map(r=>`/* ${r.px}px */ ${r.rem}rem`).join("\n")||"/* enter px values above */";

  return (
    <VStack>
      <div style={{maxWidth:220}}>
        <Label>Root Font Size (px)</Label>
        <Input value={root} onChange={setRoot} type="number" mono/>
      </div>
      <Grid2>
        <Card style={{padding:16}}>
          <Label>PX → REM</Label>
          <Input value={px} onChange={setPx} type="number" mono style={{marginTop:6}}/>
          <div style={{marginTop:12,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,fontWeight:600,color:C.cyan}}>{pxToRemVal==="—"?"—":`${pxToRemVal}rem`}</span>
            <CopyBtn text={pxToRemVal==="—"?"":`${pxToRemVal}rem`}/>
          </div>
        </Card>
        <Card style={{padding:16}}>
          <Label>REM → PX</Label>
          <Input value={rem} onChange={setRem} type="number" mono style={{marginTop:6}}/>
          <div style={{marginTop:12,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,fontWeight:600,color:C.cyan}}>{remToPxVal==="—"?"—":`${remToPxVal}px`}</span>
            <CopyBtn text={remToPxVal==="—"?"":`${remToPxVal}px`}/>
          </div>
        </Card>
      </Grid2>
      <div>
        <Label>Batch Convert (paste px values, comma / space / newline separated)</Label>
        <textarea value={batch} onChange={e=>setBatch(e.target.value)} rows={3}
          style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontSize:13,fontFamily:"'JetBrains Mono',monospace",outline:"none",resize:"vertical"}}/>
      </div>
      {batchRows.length>0&&(
        <div>
          <Label>Conversion Table (root = {rootNum}px)</Label>
          <div style={{border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",background:"rgba(255,255,255,0.03)",fontSize:12,fontWeight:600,color:C.muted}}>
              <div style={{padding:"8px 14px"}}>PX</div><div style={{padding:"8px 14px"}}>REM</div>
            </div>
            {batchRows.map((r,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr",fontFamily:"'JetBrains Mono',monospace",fontSize:13,borderTop:`1px solid ${C.border}`}}>
                <div style={{padding:"7px 14px",color:C.text}}>{r.px}px</div>
                <div style={{padding:"7px 14px",color:C.cyan}}>{r.rem}rem</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <CSSOutput css={batchCss}/>
    </VStack>
  );
}

// ── 22. CSS SPECIFICITY CALCULATOR ────────────────────────────────────────────
function cmpSpecificity(x,y){ if(x.a!==y.a)return x.a-y.a; if(x.b!==y.b)return x.b-y.b; return x.c-y.c; }
function splitSelectorList(input){
  const out=[]; let depth=0,cur="";
  for(const ch of input){
    if(ch==="("||ch==="[")depth++;
    else if(ch===")"||ch==="]")depth=Math.max(0,depth-1);
    if(ch===","&&depth===0){out.push(cur);cur="";}
    else cur+=ch;
  }
  if(cur.trim())out.push(cur);
  return out.map(s=>s.trim()).filter(Boolean);
}
function scoreSpecificity(selector){
  const notes=[];
  let a=0,b=0,c=0;
  let s=(selector||"").trim();
  if(!s) return {a,b,c,notes};
  // 1. Functional pseudo-classes :is() :not() :where() :has()
  const funcRe=/:(is|not|where|has)\(([^()]*)\)/i;
  let m;
  while((m=s.match(funcRe))){
    const fn=m[1].toLowerCase(), args=m[2];
    if(fn==="where"){
      notes.push(`:where(${args}) → contributes (0,0,0)`);
    } else {
      const argSels=splitSelectorList(args);
      let best={a:0,b:0,c:0}, bestSel="";
      argSels.forEach(as=>{ const sc=scoreSpecificity(as); if(cmpSpecificity(sc,best)>0){best={a:sc.a,b:sc.b,c:sc.c};bestSel=as;} });
      a+=best.a; b+=best.b; c+=best.c;
      notes.push(`:${fn}(${args}) → most specific argument "${bestSel}" adds (${best.a},${best.b},${best.c})`);
    }
    s=s.slice(0,m.index)+" "+s.slice(m.index+m[0].length);
  }
  // 2. Pseudo-elements (::x and legacy single-colon forms) → c
  s=s.replace(/::[\w-]+/g,x=>{c++;notes.push(`${x} → pseudo-element (c)`);return " ";});
  s=s.replace(/:(before|after|first-line|first-letter|selection|placeholder|marker|backdrop)\b/gi,x=>{c++;notes.push(`${x} → pseudo-element (c)`);return " ";});
  // 3. IDs → a
  s=s.replace(/#[\w-]+/g,x=>{a++;notes.push(`${x} → ID selector (a)`);return " ";});
  // 4. Classes → b
  s=s.replace(/\.[\w-]+/g,x=>{b++;notes.push(`${x} → class (b)`);return " ";});
  // 5. Attribute selectors → b
  s=s.replace(/\[[^\]]*\]/g,x=>{b++;notes.push(`${x} → attribute (b)`);return " ";});
  // 6. Remaining pseudo-classes (single colon, maybe with args) → b
  s=s.replace(/:[\w-]+(\([^()]*\))?/g,x=>{b++;notes.push(`${x} → pseudo-class (b)`);return " ";});
  // 7. Type/element selectors → c (universal * is ignored)
  s=s.replace(/[>+~]/g," ");
  const typeRe=/[a-zA-Z][\w-]*/g; let tm;
  while((tm=typeRe.exec(s))){ c++; notes.push(`${tm[0]} → type/element (c)`); }
  return {a,b,c,notes};
}

function CssSpecificity() {
  const [input,setInput]=useState("#nav .item a:hover");
  const results=useMemo(()=>splitSelectorList(input).map(sel=>({sel,...scoreSpecificity(sel)})),[input]);

  return (
    <VStack>
      <div>
        <Label>CSS Selector (comma-separate to score several)</Label>
        <Input value={input} onChange={setInput} mono placeholder="#nav .item a:hover"/>
      </div>
      {results.length===0&&<div style={{fontSize:13,color:C.muted}}>Enter a selector above to score it.</div>}
      {results.map((r,i)=>(
        <Card key={i} style={{padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:12}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,color:C.text,wordBreak:"break-all"}}>{r.sel}</span>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              {[["a",r.a,"purple"],["b",r.b,"cyan"],["c",r.c,"green"]].map(([k,v,col])=>(
                <div key={k} style={{textAlign:"center"}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:700,color:{purple:C.purple,cyan:C.cyan,green:C.green}[col]}}>{v}</div>
                  <div style={{fontSize:10,color:C.muted,textTransform:"uppercase"}}>{k}</div>
                </div>
              ))}
              <span style={{margin:"0 6px",fontSize:22,color:C.muted}}>=</span>
              <Badge color="cyan">{r.a},{r.b},{r.c}</Badge>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {r.notes.length?r.notes.map((n,j)=>(
              <div key={j} style={{fontSize:12,color:C.muted,fontFamily:"'JetBrains Mono',monospace"}}>• {n}</div>
            )):<div style={{fontSize:12,color:C.muted}}>No specificity contributions (0,0,0).</div>}
          </div>
        </Card>
      ))}
    </VStack>
  );
}

// ── 23. CSS PATTERN GENERATOR ─────────────────────────────────────────────────
function CssPattern() {
  const [preset,setPreset]=useState("stripes");
  const [stripeDir,setStripeDir]=useState("diagonal");
  const [c1,setC1]=useState("#0D1117");
  const [c2,setC2]=useState("#06B6D4");
  const [size,setSize]=useState(40);

  const build=()=>{
    const h=Math.round(size/2), q=Math.round(size/4), r=Math.max(2,Math.round(size/6));
    if(preset==="stripes"){
      const ang=stripeDir==="vertical"?"90deg":stripeDir==="horizontal"?"0deg":"45deg";
      return {
        style:{backgroundImage:`repeating-linear-gradient(${ang}, ${c1} 0, ${c1} ${h}px, ${c2} ${h}px, ${c2} ${size}px)`},
        css:`background-image: repeating-linear-gradient(${ang}, ${c1} 0, ${c1} ${h}px, ${c2} ${h}px, ${c2} ${size}px);`
      };
    }
    if(preset==="dots"){
      return {
        style:{backgroundColor:c1,backgroundImage:`radial-gradient(${c2} ${r}px, transparent ${r}px)`,backgroundSize:`${size}px ${size}px`},
        css:`background-color: ${c1};\nbackground-image: radial-gradient(${c2} ${r}px, transparent ${r}px);\nbackground-size: ${size}px ${size}px;`
      };
    }
    if(preset==="checkerboard"){
      const img=`linear-gradient(45deg, ${c2} 25%, transparent 25%, transparent 75%, ${c2} 75%), linear-gradient(45deg, ${c2} 25%, transparent 25%, transparent 75%, ${c2} 75%)`;
      const pos=`0 0, ${h}px ${h}px`;
      return {
        style:{backgroundColor:c1,backgroundImage:img,backgroundSize:`${size}px ${size}px`,backgroundPosition:pos},
        css:`background-color: ${c1};\nbackground-image: linear-gradient(45deg, ${c2} 25%, transparent 25%, transparent 75%, ${c2} 75%),\n  linear-gradient(45deg, ${c2} 25%, transparent 25%, transparent 75%, ${c2} 75%);\nbackground-size: ${size}px ${size}px;\nbackground-position: ${pos};`
      };
    }
    if(preset==="grid"){
      const img=`linear-gradient(${c2} 1px, transparent 1px), linear-gradient(90deg, ${c2} 1px, transparent 1px)`;
      return {
        style:{backgroundColor:c1,backgroundImage:img,backgroundSize:`${size}px ${size}px`},
        css:`background-color: ${c1};\nbackground-image: linear-gradient(${c2} 1px, transparent 1px),\n  linear-gradient(90deg, ${c2} 1px, transparent 1px);\nbackground-size: ${size}px ${size}px;`
      };
    }
    // zigzag
    const img=`linear-gradient(135deg, ${c2} 25%, transparent 25%), linear-gradient(225deg, ${c2} 25%, transparent 25%), linear-gradient(45deg, ${c2} 25%, transparent 25%), linear-gradient(315deg, ${c2} 25%, transparent 25%)`;
    const pos=`${h}px 0, ${h}px 0, 0 0, 0 0`;
    return {
      style:{backgroundColor:c1,backgroundImage:img,backgroundSize:`${size}px ${size}px`,backgroundPosition:pos},
      css:`background-color: ${c1};\nbackground-image: linear-gradient(135deg, ${c2} 25%, transparent 25%),\n  linear-gradient(225deg, ${c2} 25%, transparent 25%),\n  linear-gradient(45deg, ${c2} 25%, transparent 25%),\n  linear-gradient(315deg, ${c2} 25%, transparent 25%);\nbackground-size: ${size}px ${size}px;\nbackground-position: ${pos};`
    };
  };
  const {style,css}=build();

  return (
    <VStack>
      <div>
        <Label>Pattern</Label>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
          {["stripes","dots","checkerboard","grid","zigzag"].map(p=>(
            <Btn key={p} size="sm" variant={preset===p?"primary":"secondary"} onClick={()=>setPreset(p)}>{p}</Btn>
          ))}
        </div>
      </div>
      {preset==="stripes"&&(
        <div><Label>Stripe Direction</Label>
          <SelectInput value={stripeDir} onChange={setStripeDir} options={["diagonal","vertical","horizontal"].map(v=>({value:v,label:v}))}/>
        </div>
      )}
      <Grid2>
        <ColorPicker label="Color 1 (base)" value={c1} onChange={setC1}/>
        <ColorPicker label="Color 2 (pattern)" value={c2} onChange={setC2}/>
      </Grid2>
      <Slider label="Pattern Size" value={size} onChange={setSize} min={8} max={120} unit="px"/>
      <PreviewBox height={200}>
        <div style={{position:"absolute",inset:0,...style}}/>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 24. CUBIC BEZIER EDITOR ───────────────────────────────────────────────────
function CubicBezier() {
  const presets={
    ease:[0.25,0.1,0.25,1], "ease-in":[0.42,0,1,1], "ease-out":[0,0,0.58,1],
    "ease-in-out":[0.42,0,0.58,1], linear:[0,0,1,1],
    "smooth":[0.25,0.46,0.45,0.94], "back-out":[0.34,1.56,0.64,1],
    "back-in":[0.36,0,0.66,-0.56], "bounce":[0.68,-0.55,0.27,1.55],
  };
  const [x1,setX1]=useState(0.25);
  const [y1,setY1]=useState(0.1);
  const [x2,setX2]=useState(0.25);
  const [y2,setY2]=useState(1);

  const clampX=v=>Math.max(0,Math.min(1,v));
  const clampY=v=>Math.max(-1,Math.min(2,v));
  const num=v=>{const n=parseFloat(v);return Number.isFinite(n)?n:0;};
  const applyPreset=k=>{const[a,b,c,d]=presets[k];setX1(a);setY1(b);setX2(c);setY2(d);};

  const cx1=clampX(x1),cy1=clampY(y1),cx2=clampX(x2),cy2=clampY(y2);
  const bez=`cubic-bezier(${cx1}, ${cy1}, ${cx2}, ${cy2})`;
  const css=`transition-timing-function: ${bez};\n\n/* shorthand example */\ntransition: transform 0.6s ${bez};`;

  // SVG mapping: unit square 0..100, y flipped (CSS y goes up)
  const sx=v=>+(v*100).toFixed(2);
  const sy=v=>+((1-v)*100).toFixed(2);
  const path=`M ${sx(0)} ${sy(0)} C ${sx(cx1)} ${sy(cy1)}, ${sx(cx2)} ${sy(cy2)}, ${sx(1)} ${sy(1)}`;

  const numInput=(val,setter,clamp)=>(
    <input type="number" step="0.01" value={val}
      onChange={e=>setter(clamp(num(e.target.value)))}
      style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,fontFamily:"'JetBrains Mono',monospace",outline:"none"}}/>
  );

  return (
    <VStack>
      <style>{`@keyframes cbMove{from{left:2px}to{left:calc(100% - 26px)}}`}</style>
      <div>
        <Label>Presets</Label>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
          {Object.keys(presets).map(k=><Btn key={k} size="sm" variant="secondary" onClick={()=>applyPreset(k)}>{k}</Btn>)}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12}}>
        <div><Label>x1</Label>{numInput(x1,setX1,clampX)}</div>
        <div><Label>y1</Label>{numInput(y1,setY1,clampY)}</div>
        <div><Label>x2</Label>{numInput(x2,setX2,clampX)}</div>
        <div><Label>y2</Label>{numInput(y2,setY2,clampY)}</div>
      </div>
      <Grid2>
        <div>
          <Label>Curve</Label>
          <div style={{background:"#0B0F17",border:`1px solid ${C.border}`,borderRadius:10,padding:16}}>
            <svg viewBox="-8 -28 116 156" style={{width:"100%",height:180,overflow:"visible"}}>
              <rect x="0" y="0" width="100" height="100" fill="none" stroke="rgba(255,255,255,0.08)"/>
              <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)"/>
              <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.05)"/>
              <line x1={sx(0)} y1={sy(0)} x2={sx(cx1)} y2={sy(cy1)} stroke={C.purple} strokeWidth="0.8" strokeDasharray="3 2"/>
              <line x1={sx(1)} y1={sy(1)} x2={sx(cx2)} y2={sy(cy2)} stroke={C.pink} strokeWidth="0.8" strokeDasharray="3 2"/>
              <path d={path} fill="none" stroke={C.cyan} strokeWidth="1.6"/>
              <circle cx={sx(0)} cy={sy(0)} r="2" fill={C.muted}/>
              <circle cx={sx(1)} cy={sy(1)} r="2" fill={C.muted}/>
              <circle cx={sx(cx1)} cy={sy(cy1)} r="2.6" fill={C.purple}/>
              <circle cx={sx(cx2)} cy={sy(cy2)} r="2.6" fill={C.pink}/>
            </svg>
          </div>
        </div>
        <div>
          <Label>Animated Preview (1.5s loop)</Label>
          <div style={{background:"#0B0F17",border:`1px solid ${C.border}`,borderRadius:10,padding:16,display:"flex",flexDirection:"column",justifyContent:"center",height:212,gap:20}}>
            <div style={{position:"relative",height:20}}>
              <div style={{position:"absolute",top:2,width:20,height:16,borderRadius:4,background:C.cyan,left:0,animationName:"cbMove",animationDuration:"1.5s",animationIterationCount:"infinite",animationDirection:"alternate",animationTimingFunction:bez}}/>
            </div>
            <div style={{position:"relative",height:20}}>
              <div style={{position:"absolute",top:2,width:16,height:16,borderRadius:"50%",background:C.pink,left:0,animationName:"cbMove",animationDuration:"1.5s",animationIterationCount:"infinite",animationDirection:"alternate",animationTimingFunction:bez}}/>
            </div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:C.muted,textAlign:"center"}}>{bez}</div>
          </div>
        </div>
      </Grid2>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 25. CSS TEXT STROKE ───────────────────────────────────────────────────────
function CssTextStroke() {
  const [text,setText]=useState("OUTLINE");
  const [width,setWidth]=useState(2);
  const [strokeColor,setStrokeColor]=useState("#06B6D4");
  const [hollow,setHollow]=useState(true);
  const [fillColor,setFillColor]=useState("#0D1117");
  const [fontSize,setFontSize]=useState(64);
  const [bg,setBg]=useState("#0D1117");

  const fill=hollow?"transparent":fillColor;
  const css=`-webkit-text-stroke: ${width}px ${strokeColor};\ntext-stroke: ${width}px ${strokeColor};\ncolor: ${fill};`;

  return (
    <VStack>
      <Grid2>
        <div><Label>Preview Text</Label><Input value={text} onChange={setText} placeholder="Your Text"/></div>
        <Slider label="Stroke Width" value={width} onChange={setWidth} min={0} max={12} unit="px"/>
      </Grid2>
      <Grid2>
        <ColorPicker label="Stroke Color" value={strokeColor} onChange={setStrokeColor}/>
        <Slider label="Font Size" value={fontSize} onChange={setFontSize} min={24} max={140} unit="px"/>
      </Grid2>
      <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:C.text}}>
        <input type="checkbox" checked={hollow} onChange={e=>setHollow(e.target.checked)}/> Hollow text (transparent fill)
      </label>
      {!hollow&&<Grid2><ColorPicker label="Fill Color" value={fillColor} onChange={setFillColor}/><ColorPicker label="Background" value={bg} onChange={setBg}/></Grid2>}
      {hollow&&<ColorPicker label="Background" value={bg} onChange={setBg}/>}
      <PreviewBox height={160}>
        <div style={{width:"100%",height:"100%",background:bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize,fontWeight:800,fontFamily:"'Sora',sans-serif",color:fill,WebkitTextStroke:`${width}px ${strokeColor}`}}>{text||"OUTLINE"}</span>
        </div>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 26. CSS OUTLINE ───────────────────────────────────────────────────────────
function CssOutline() {
  const [width,setWidth]=useState(3);
  const [style,setStyle]=useState("solid");
  const [color,setColor]=useState("#EC4899");
  const [offset,setOffset]=useState(4);
  const [elemColor,setElemColor]=useState("#0D1117");

  const css=`outline: ${width}px ${style} ${color};\noutline-offset: ${offset}px;`;

  return (
    <VStack>
      <Grid2>
        <Slider label="Outline Width" value={width} onChange={setWidth} min={0} max={20} unit="px"/>
        <Slider label="Outline Offset" value={offset} onChange={setOffset} min={-10} max={30} unit="px"/>
      </Grid2>
      <div><Label>Outline Style</Label>
        <SelectInput value={style} onChange={setStyle} options={["solid","dashed","dotted","double","groove","ridge","inset","outset"].map(v=>({value:v,label:v}))}/>
      </div>
      <Grid2>
        <ColorPicker label="Outline Color" value={color} onChange={setColor}/>
        <ColorPicker label="Element Color" value={elemColor} onChange={setElemColor}/>
      </Grid2>
      <PreviewBox height={180}>
        <div style={{width:130,height:80,borderRadius:10,background:elemColor,outline:`${width}px ${style} ${color}`,outlineOffset:offset,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:C.muted}}>box</div>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 27. CSS BACKDROP FILTER ───────────────────────────────────────────────────
function CssBackdropFilter() {
  const [blur,setBlur]=useState(8);
  const [brightness,setBrightness]=useState(110);
  const [contrast,setContrast]=useState(100);
  const [saturate,setSaturate]=useState(120);
  const [tint,setTint]=useState("#ffffff22");

  const parts=[];
  if(blur>0) parts.push(`blur(${blur}px)`);
  if(brightness!==100) parts.push(`brightness(${brightness}%)`);
  if(contrast!==100) parts.push(`contrast(${contrast}%)`);
  if(saturate!==100) parts.push(`saturate(${saturate}%)`);
  const val=parts.length?parts.join(" "):"none";
  const css=`background: ${tint};\nbackdrop-filter: ${val};\n-webkit-backdrop-filter: ${val};`;

  return (
    <VStack>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Slider label="Blur" value={blur} onChange={setBlur} min={0} max={30} unit="px"/>
        <Slider label="Brightness" value={brightness} onChange={setBrightness} min={0} max={200} unit="%"/>
        <Slider label="Contrast" value={contrast} onChange={setContrast} min={0} max={200} unit="%"/>
        <Slider label="Saturate" value={saturate} onChange={setSaturate} min={0} max={300} unit="%"/>
      </div>
      <ColorPicker label="Glass Tint (rgba/hex)" value={tint} onChange={setTint}/>
      <PreviewBox height={200}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#8B5CF6,#EC4899 50%,#F59E0B)"}}/>
        <div style={{position:"relative",width:180,height:110,borderRadius:14,border:`1px solid ${C.border}`,background:tint,backdropFilter:val,WebkitBackdropFilter:val,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:700}}>Glass Panel</div>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 28. CSS BLEND MODE ────────────────────────────────────────────────────────
function CssBlendMode() {
  const [mode,setMode]=useState("multiply");
  const [c1,setC1]=useState("#06B6D4");
  const [c2,setC2]=useState("#EC4899");
  const modes=["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity"];
  const css=`mix-blend-mode: ${mode};`;

  return (
    <VStack>
      <div><Label>Blend Mode</Label>
        <SelectInput value={mode} onChange={setMode} options={modes.map(v=>({value:v,label:v}))}/>
      </div>
      <Grid2>
        <ColorPicker label="Shape 1 Color" value={c1} onChange={setC1}/>
        <ColorPicker label="Shape 2 Color" value={c2} onChange={setC2}/>
      </Grid2>
      <PreviewBox height={200}>
        <div style={{width:"100%",height:"100%",background:"#0D1117",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
          <div style={{width:100,height:100,borderRadius:"50%",background:c1,position:"absolute",transform:"translateX(-28px)"}}/>
          <div style={{width:100,height:100,borderRadius:"50%",background:c2,position:"absolute",transform:"translateX(28px)",mixBlendMode:mode}}/>
        </div>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 29. CSS MASK FADE ─────────────────────────────────────────────────────────
function CssMaskFade() {
  const [dir,setDir]=useState("to bottom");
  const [start,setStart]=useState(50);
  const [end,setEnd]=useState(100);
  const dirs=[["to bottom","Fade bottom"],["to top","Fade top"],["to right","Fade right"],["to left","Fade left"],["to bottom right","Fade corner"]];
  const grad=`linear-gradient(${dir}, black ${start}%, transparent ${end}%)`;
  const css=`mask-image: ${grad};\n-webkit-mask-image: ${grad};`;

  return (
    <VStack>
      <div><Label>Fade Direction</Label>
        <SelectInput value={dir} onChange={setDir} options={dirs.map(([v,l])=>({value:v,label:l}))}/>
      </div>
      <Grid2>
        <Slider label="Solid Until" value={start} onChange={v=>setStart(Math.min(v,end))} min={0} max={100} unit="%"/>
        <Slider label="Transparent At" value={end} onChange={v=>setEnd(Math.max(v,start))} min={0} max={100} unit="%"/>
      </Grid2>
      <PreviewBox height={200}>
        <div style={{position:"absolute",inset:0,background:"repeating-conic-gradient(#1a1a2e 0% 25%, #0d1117 0% 50%) 50%/22px 22px"}}/>
        <div style={{position:"relative",width:180,height:160,borderRadius:10,background:"linear-gradient(135deg,#06B6D4,#8B5CF6)",maskImage:grad,WebkitMaskImage:grad}}/>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 30. CSS 3D PERSPECTIVE ─────────────────────────────────────────────────────
function CssPerspective() {
  const [persp,setPersp]=useState(600);
  const [rotateX,setRotateX]=useState(15);
  const [rotateY,setRotateY]=useState(-25);
  const [color,setColor]=useState("#06B6D4");

  const transform=`perspective(${persp}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  const css=`transform: ${transform};\ntransform-style: preserve-3d;`;

  return (
    <VStack>
      <Slider label="Perspective (depth)" value={persp} onChange={setPersp} min={100} max={2000} step={10} unit="px"/>
      <Grid2>
        <Slider label="Rotate X" value={rotateX} onChange={setRotateX} min={-90} max={90} unit="°"/>
        <Slider label="Rotate Y" value={rotateY} onChange={setRotateY} min={-90} max={90} unit="°"/>
      </Grid2>
      <ColorPicker label="Element Color" value={color} onChange={setColor}/>
      <PreviewBox height={220}>
        <div style={{width:140,height:90,borderRadius:12,background:color,transform,transition:"transform .1s",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#000",boxShadow:"0 20px 40px rgba(0,0,0,0.4)"}}>3D</div>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 31. CSS ASPECT RATIO ──────────────────────────────────────────────────────
function CssAspectRatio() {
  const presets=[[16,9],[4,3],[1,1],[3,2],[21,9],[9,16]];
  const [w,setW]=useState(16);
  const [h,setH]=useState(9);
  const safeW=w>0?w:1, safeH=h>0?h:1;
  const pct=(+((safeH/safeW*100)).toFixed(4)).toString();
  const modern=`aspect-ratio: ${safeW} / ${safeH};\nwidth: 100%;`;
  const fallback=`/* padding-hack fallback for old browsers */\n.wrap {\n  position: relative;\n  width: 100%;\n  padding-top: ${pct}%;\n}\n.wrap > * {\n  position: absolute;\n  inset: 0;\n}`;
  const css=`${modern}\n\n${fallback}`;

  return (
    <VStack>
      <div><Label>Common Ratios</Label>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
          {presets.map(([pw,ph])=><Btn key={pw+":"+ph} size="sm" variant={w===pw&&h===ph?"primary":"secondary"} onClick={()=>{setW(pw);setH(ph);}}>{pw}:{ph}</Btn>)}
        </div>
      </div>
      <Grid2>
        <div><Label>Width Ratio</Label><Input type="number" value={w} onChange={v=>setW(Math.max(0,parseInt(v)||0))} mono/></div>
        <div><Label>Height Ratio</Label><Input type="number" value={h} onChange={v=>setH(Math.max(0,parseInt(v)||0))} mono/></div>
      </Grid2>
      <div style={{display:"flex",alignItems:"center",gap:10,fontSize:13,color:C.muted}}>
        Padding-top fallback: <Badge color="cyan">{pct}%</Badge>
      </div>
      <PreviewBox height={200}>
        <div style={{width:"70%",aspectRatio:`${safeW} / ${safeH}`,maxHeight:"85%",background:"linear-gradient(135deg,#06B6D4,#8B5CF6)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:700}}>{safeW} : {safeH}</div>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 32. CSS MULTI-COLUMN ──────────────────────────────────────────────────────
function CssColumns() {
  const [count,setCount]=useState(3);
  const [gap,setGap]=useState(24);
  const [ruleWidth,setRuleWidth]=useState(1);
  const [ruleStyle,setRuleStyle]=useState("solid");
  const [ruleColor,setRuleColor]=useState("#334155");

  let css=`column-count: ${count};\ncolumn-gap: ${gap}px;`;
  if(ruleWidth>0) css+=`\ncolumn-rule: ${ruleWidth}px ${ruleStyle} ${ruleColor};`;
  const sample="ToolsRift bundles hundreds of privacy-friendly browser tools. Multi-column layout flows text automatically across the columns you define, balancing content like a newspaper without any JavaScript.";

  return (
    <VStack>
      <Grid2>
        <Slider label="Column Count" value={count} onChange={setCount} min={1} max={6} step={1} unit=""/>
        <Slider label="Column Gap" value={gap} onChange={setGap} min={0} max={60} unit="px"/>
      </Grid2>
      <Grid2>
        <Slider label="Rule Width" value={ruleWidth} onChange={setRuleWidth} min={0} max={8} unit="px"/>
        <div><Label>Rule Style</Label><SelectInput value={ruleStyle} onChange={setRuleStyle} options={["solid","dashed","dotted","double"].map(v=>({value:v,label:v}))}/></div>
      </Grid2>
      <ColorPicker label="Rule Color" value={ruleColor} onChange={setRuleColor}/>
      <PreviewBox height={180} label="Preview">
        <div style={{width:"100%",height:"100%",overflow:"auto",padding:14,columnCount:count,columnGap:gap,columnRule:ruleWidth>0?`${ruleWidth}px ${ruleStyle} ${ruleColor}`:"none",fontSize:12,color:C.text,lineHeight:1.6,textAlign:"justify"}}>{sample}</div>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 33. CSS OBJECT FIT ────────────────────────────────────────────────────────
function CssObjectFit() {
  const [fit,setFit]=useState("cover");
  const [posX,setPosX]=useState(50);
  const [posY,setPosY]=useState(50);
  const [imgUrl,setImgUrl]=useState("https://picsum.photos/seed/objectfit/600/300");
  const css=`object-fit: ${fit};\nobject-position: ${posX}% ${posY}%;`;

  return (
    <VStack>
      <div><Label>object-fit</Label>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
          {["fill","contain","cover","none","scale-down"].map(v=><Btn key={v} size="sm" variant={fit===v?"primary":"secondary"} onClick={()=>setFit(v)}>{v}</Btn>)}
        </div>
      </div>
      <Grid2>
        <Slider label="Position X" value={posX} onChange={setPosX} min={0} max={100} unit="%"/>
        <Slider label="Position Y" value={posY} onChange={setPosY} min={0} max={100} unit="%"/>
      </Grid2>
      <div><Label>Sample Image URL</Label><Input value={imgUrl} onChange={setImgUrl} placeholder="https://…"/></div>
      <PreviewBox height={200}>
        <div style={{width:200,height:130,borderRadius:8,overflow:"hidden",border:`1px solid ${C.border}`,background:"#0D1117"}}>
          <img src={imgUrl} alt="object-fit preview" style={{width:"100%",height:"100%",objectFit:fit,objectPosition:`${posX}% ${posY}%`}} onError={e=>e.target.style.display="none"}/>
        </div>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 34. CSS LINE CLAMP ────────────────────────────────────────────────────────
function CssLineClamp() {
  const [lines,setLines]=useState(3);
  const [text,setText]=useState("ToolsRift is a large, privacy-first collection of free online tools. Line clamping truncates long text to a fixed number of lines and appends an ellipsis so cards and previews stay tidy no matter how long the content is.");
  const css=`display: -webkit-box;\n-webkit-line-clamp: ${lines};\n-webkit-box-orient: vertical;\noverflow: hidden;`;

  return (
    <VStack>
      <Slider label="Max Lines" value={lines} onChange={setLines} min={1} max={8} step={1} unit=""/>
      <div><Label>Sample Text</Label><Input value={text} onChange={setText}/></div>
      <PreviewBox height={140} label="Preview">
        <div style={{width:"80%"}}>
          <div style={{display:"-webkit-box",WebkitLineClamp:lines,WebkitBoxOrient:"vertical",overflow:"hidden",fontSize:14,color:C.text,lineHeight:1.6}}>{text}</div>
        </div>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 35. CSS WRITING MODE ──────────────────────────────────────────────────────
function CssWritingMode() {
  const [mode,setMode]=useState("vertical-rl");
  const [orient,setOrient]=useState("mixed");
  const [text,setText]=useState("ToolsRift Vertical");
  let css=`writing-mode: ${mode};`;
  if(mode!=="horizontal-tb") css+=`\ntext-orientation: ${orient};`;

  return (
    <VStack>
      <div><Label>writing-mode</Label>
        <SelectInput value={mode} onChange={setMode} options={["horizontal-tb","vertical-rl","vertical-lr","sideways-rl","sideways-lr"].map(v=>({value:v,label:v}))}/>
      </div>
      {mode!=="horizontal-tb"&&(
        <div><Label>text-orientation</Label>
          <SelectInput value={orient} onChange={setOrient} options={["mixed","upright","sideways"].map(v=>({value:v,label:v}))}/>
        </div>
      )}
      <div><Label>Sample Text</Label><Input value={text} onChange={setText}/></div>
      <PreviewBox height={200}>
        <span style={{writingMode:mode,textOrientation:orient,fontSize:24,fontWeight:700,fontFamily:"'Sora',sans-serif",color:C.cyan}}>{text||"Sample"}</span>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 36. CSS IMAGE RENDERING ───────────────────────────────────────────────────
function CssImageRendering() {
  const [mode,setMode]=useState("pixelated");
  const [scale,setScale]=useState(8);
  const css=`image-rendering: ${mode};`;
  // tiny SVG data URI (8x8 checker) to upscale
  const tiny="data:image/svg+xml;utf8,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" shape-rendering="crispEdges"><rect width="8" height="8" fill="#0D1117"/><rect width="4" height="4" fill="#06B6D4"/><rect x="4" y="4" width="4" height="4" fill="#EC4899"/><rect x="4" width="4" height="4" fill="#8B5CF6"/><rect y="4" width="4" height="4" fill="#F59E0B"/></svg>');

  return (
    <VStack>
      <div><Label>image-rendering</Label>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
          {["auto","smooth","high-quality","crisp-edges","pixelated"].map(v=><Btn key={v} size="sm" variant={mode===v?"primary":"secondary"} onClick={()=>setMode(v)}>{v}</Btn>)}
        </div>
      </div>
      <Slider label="Preview Zoom" value={scale} onChange={setScale} min={2} max={16} step={1} unit="×"/>
      <PreviewBox height={200}>
        <img src={tiny} alt="rendering preview" style={{width:8*scale,height:8*scale,imageRendering:mode}}/>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 37. CSS TYPE SCALE ────────────────────────────────────────────────────────
function CssTypeScale() {
  const ratios=[["1.067","Minor Second"],["1.125","Major Second"],["1.2","Minor Third"],["1.25","Major Third"],["1.333","Perfect Fourth"],["1.414","Augmented Fourth"],["1.5","Perfect Fifth"],["1.618","Golden Ratio"]];
  const [base,setBase]=useState(16);
  const [ratio,setRatio]=useState(1.25);
  const [up,setUp]=useState(5);
  const [down,setDown]=useState(2);
  const names=["xs","sm","base","md","lg","xl","2xl","3xl","4xl","5xl","6xl"];

  const steps=useMemo(()=>{
    const arr=[];
    for(let n=down;n>=1;n--) arr.push({step:-n});
    arr.push({step:0});
    for(let n=1;n<=up;n++) arr.push({step:n});
    return arr.map((s,i)=>({...s,size:+(base*Math.pow(ratio,s.step)).toFixed(2),name:names[i]||`step-${i}`}));
  },[base,ratio,up,down]);

  const css=":root {\n"+steps.map(s=>`  --fs-${s.name}: ${s.size}px;`).join("\n")+"\n}";

  return (
    <VStack>
      <Grid2>
        <Slider label="Base Size" value={base} onChange={setBase} min={10} max={24} unit="px"/>
        <div><Label>Scale Ratio</Label>
          <SelectInput value={String(ratio)} onChange={v=>setRatio(parseFloat(v))} options={ratios.map(([v,l])=>({value:v,label:`${l} (${v})`}))}/>
        </div>
      </Grid2>
      <Grid2>
        <Slider label="Steps Up" value={up} onChange={setUp} min={1} max={8} step={1} unit=""/>
        <Slider label="Steps Down" value={down} onChange={setDown} min={0} max={4} step={1} unit=""/>
      </Grid2>
      <PreviewBox height={220} label="Preview">
        <div style={{width:"100%",height:"100%",overflow:"auto",padding:14,display:"flex",flexDirection:"column",gap:2,alignItems:"flex-start"}}>
          {steps.map(s=>(
            <div key={s.name} style={{display:"flex",alignItems:"baseline",gap:10,maxWidth:"100%"}}>
              <span style={{fontSize:Math.min(s.size,44),fontWeight:600,color:C.text,fontFamily:"'Sora',sans-serif",whiteSpace:"nowrap"}}>Aa</span>
              <span style={{fontSize:11,color:C.muted,fontFamily:"'JetBrains Mono',monospace"}}>--fs-{s.name}: {s.size}px</span>
            </div>
          ))}
        </div>
      </PreviewBox>
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ── 38. CSS HEX TO RGBA ───────────────────────────────────────────────────────
function hexToRgbParts(hex){
  let h=(hex||"").trim().replace(/^#/,"");
  if(/^[0-9a-fA-F]{3}$/.test(h)) h=h.split("").map(c=>c+c).join("");
  if(/^[0-9a-fA-F]{8}$/.test(h)) h=h.slice(0,6);
  if(!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)};
}
function CssHexToRgba() {
  const [hex,setHex]=useState("#06B6D4");
  const [alpha,setAlpha]=useState(100);
  const parts=hexToRgbParts(hex);
  const a=+(Math.max(0,Math.min(100,alpha))/100).toFixed(2);
  const valid=!!parts;
  const rgba=valid?`rgba(${parts.r}, ${parts.g}, ${parts.b}, ${a})`:null;
  const rgb=valid?`rgb(${parts.r}, ${parts.g}, ${parts.b})`:null;
  const css=valid?`color: ${rgba};`:"/* Enter a valid 3, 6 or 8-digit hex color */";

  return (
    <VStack>
      <Grid2>
        <ColorPicker label="Hex Color" value={/^#?[0-9a-fA-F]{6}$/.test(hex)?(hex[0]==="#"?hex:"#"+hex):"#06B6D4"} onChange={setHex}/>
        <Slider label="Alpha (opacity)" value={alpha} onChange={setAlpha} min={0} max={100} unit="%"/>
      </Grid2>
      <div><Label>Hex Input (3, 6 or 8 digits)</Label><Input value={hex} onChange={setHex} mono placeholder="#06B6D4"/></div>
      {!valid&&<div style={{fontSize:13,color:C.amber}}>Enter a valid hex color like #06B6D4, #fff or #06B6D480.</div>}
      {valid&&(
        <>
          <PreviewBox height={120}>
            <div style={{position:"absolute",inset:0,background:"repeating-conic-gradient(#1a1a2e 0% 25%, #0d1117 0% 50%) 50%/22px 22px"}}/>
            <div style={{position:"relative",width:"70%",height:"70%",borderRadius:10,background:rgba,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:"#fff",textShadow:"0 1px 2px rgba(0,0,0,0.5)"}}>{rgba}</div>
          </PreviewBox>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <Badge color="cyan">R {parts.r}</Badge><Badge color="green">G {parts.g}</Badge><Badge color="blue">B {parts.b}</Badge><Badge color="purple">A {a}</Badge>
          </div>
          <div style={{fontSize:12,color:C.muted,fontFamily:"'JetBrains Mono',monospace"}}>{rgb}</div>
        </>
      )}
      <CSSOutput css={css}/>
    </VStack>
  );
}

// ─── COMPONENT MAP ────────────────────────────────────────────────────────────
const TOOL_COMPONENTS = {
  "css-gradient":      CssGradient,
  "css-box-shadow":    CssBoxShadow,
  "css-text-shadow":   CssTextShadow,
  "css-border-radius": CssBorderRadius,
  "css-flexbox":       CssFlexbox,
  "css-grid":          CssGrid,
  "css-animation":     CssAnimation,
  "css-filter":        CssFilter,
  "css-transform":     CssTransform,
  "css-transition":    CssTransition,
  "css-button":        CssButton,
  "css-typography":    CssTypography,
  "css-clip-path":     CssClipPath,
  "css-glassmorphism": CssGlassmorphism,
  "css-neumorphism":   CssNeumorphism,
  "css-scrollbar":     CssScrollbar,
  "css-variables":     CssVariables,
  "css-loader":        CssLoader,
  "css-triangle":      CssTriangle,
  "css-color-palette": CssColorPalette,
  "px-to-rem-converter":        PxToRem,
  "css-specificity-calculator": CssSpecificity,
  "css-pattern-generator":      CssPattern,
  "cubic-bezier-editor":        CubicBezier,
  "css-text-stroke":            CssTextStroke,
  "css-outline":                CssOutline,
  "css-backdrop-filter":        CssBackdropFilter,
  "css-blend-mode":             CssBlendMode,
  "css-mask-fade":              CssMaskFade,
  "css-perspective":            CssPerspective,
  "css-aspect-ratio":           CssAspectRatio,
  "css-columns":                CssColumns,
  "css-object-fit":             CssObjectFit,
  "css-line-clamp":             CssLineClamp,
  "css-writing-mode":           CssWritingMode,
  "css-image-rendering":        CssImageRendering,
  "css-type-scale":             CssTypeScale,
  "css-hex-to-rgba":            CssHexToRgba,
};

// ─── PAGE SHELLS ──────────────────────────────────────────────────────────────
function Breadcrumb({ tool }) {
  const cat=CATEGORIES.find(c=>c.id===tool.cat);
  return (
    <>
      <nav style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:C.muted,marginBottom:20}}>
        <a href="https://toolsrift.com" style={{color:C.muted,textDecoration:"none"}}>🏠 ToolsRift</a><span>›</span>
        <a href={`#/category/${tool.cat}`} style={{color:C.muted,textDecoration:"none"}}>{cat?.name}</a><span>›</span>
        <span style={{color:C.text}}>{tool.name}</span>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolsrift.com" },
          { "@type": "ListItem", "position": 2, "name": "CSS Generators", "item": "https://toolsrift.com/css" },
          { "@type": "ListItem", "position": 3, "name": tool?.name || tool?.id || "" }
        ]
      }) }} />
    </>
  );
}

function FaqSection({ faqs }) {
  if(!faqs?.length) return null;
  return (
    <section style={{marginTop:32}}>
      <h2 style={{...T.h2,marginBottom:14}}>Frequently Asked Questions</h2>
      <VStack gap={8}>
        {faqs.map(([q,a],i)=>(
          <details key={i} style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${C.border}`,borderRadius:8}}>
            <summary style={{padding:"12px 16px",cursor:"pointer",fontSize:13,fontWeight:600,color:C.text,listStyle:"none",display:"flex",justifyContent:"space-between"}}>
              <h3 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:13,fontWeight:600,margin:0}}>{q}</h3><span style={{color:C.muted}}>+</span>
            </summary>
            <div style={{padding:"0 16px 14px",fontSize:13,color:C.muted,lineHeight:1.7}}>{a}</div>
          </details>
        ))}
      </VStack>
    </section>
  );
}

function RelatedTools({ currentId }) {
  const current=TOOLS.find(t=>t.id===currentId);
  const related=TOOLS.filter(t=>t.id!==currentId&&t.cat===current?.cat).slice(0,4);
  if(!related.length) return null;
  return (
    <section style={{marginTop:32}}>
      <h2 style={{...T.h2,marginBottom:14}}>Related CSS Tools</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
        {related.map(t=>(
          <a key={t.id} href={`#/tool/${t.id}`} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(255,255,255,0.02)",border:`1px solid ${C.border}`,borderRadius:8,textDecoration:"none",transition:"border-color .15s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(6,182,212,0.4)"} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <span style={{fontSize:20}}>{t.icon}</span>
            <div><div style={{fontSize:13,fontWeight:600,color:C.text}}>{t.name}</div><div style={{fontSize:11,color:C.muted}}>{t.desc}</div></div>
          </a>
        ))}
      </div>
    </section>
  );
}

function ToolPage({ toolId }) {
  const tool = TOOLS.find(t => t.id === toolId);
  const meta = TOOL_META[toolId];
  const ToolComp = TOOL_COMPONENTS[toolId];
  useEffect(() => {
    document.title = meta?.title || `${tool?.name} – Free CSS Generator | ToolsRift`;
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
  const cat=CATEGORIES.find(c=>c.id===catId);
  const tools=TOOLS.filter(t=>t.cat===catId);
  useEffect(()=>{document.title=`${cat?.name} – Free CSS Generators | ToolsRift`;},[catId]);
  if(!cat) return <div style={{padding:40,textAlign:"center",color:C.muted}}>Not found. <a href="#/" style={{color:C.cyan}}>← Home</a></div>;
  return (
    <div style={{maxWidth:1000,margin:"0 auto",padding:"24px 20px 60px"}}>
      <nav style={{fontSize:12,color:C.muted,marginBottom:20}}><a href="#/" style={{color:C.muted,textDecoration:"none"}}>🏠 ToolsRift</a> › <span style={{color:C.text}}>{cat.name}</span></nav>
      <h1 style={{...T.h1,marginBottom:6}}>{cat.icon} {cat.name}</h1>
      <p style={{fontSize:14,color:C.muted,marginBottom:28}}>{cat.desc} — {tools.length} free tools</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
        {tools.map(t=>(
          <a key={t.id} href={`#/tool/${t.id}`} style={{display:"flex",gap:12,padding:"14px 16px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,textDecoration:"none",alignItems:"flex-start",transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(6,182,212,0.4)";e.currentTarget.style.transform="translateY(-1px)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="";}}>
            <span style={{fontSize:24,marginTop:2}}>{t.icon}</span>
            <div><div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:3}}>{t.name}</div><div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>{t.desc}</div></div>
          </a>
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  useEffect(()=>{document.title="Free CSS Generator Tools – Online CSS Builders | ToolsRift";},[]);
  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search CSS generators..."
      />
    </CategoryLayout>
  );
}

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
    <div style={{maxWidth:860,margin:"0 auto",padding:"32px 20px 28px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <span style={{fontSize:11,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em"}}>Explore More Tools</span>
        <a href="/" style={{fontSize:12,color:"#3B82F6",textDecoration:"none",fontWeight:600}}>← Back to Home</a>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
        {pages.map(p=>(
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

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [isDark] = useState(true);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 24px",height:56,borderBottom:`1px solid ${scrolled?"rgba(6,182,212,0.2)":C.border}`,position:"sticky",top:0,background:`rgba(6,9,15,${scrolled?0.97:0.85})`,backdropFilter:"blur(12px)",zIndex:100,transition:"background 0.2s,border-color 0.2s"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <a href="/" aria-label="ToolsRift home" style={{display:"flex",alignItems:"center",flexShrink:0}}><img src="/logo.svg" alt="ToolsRift" style={{height:26,display:"block"}}/></a>
        <span style={{color:"rgba(255,255,255,0.2)",fontSize:14}}>›</span>
        <a href="#/" style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:13,fontWeight:500,color:C.cyan,textDecoration:"none"}}>{THEME?.name||"CSS Generators"}</a>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <div className="tr-nav-cats">
          {CATEGORIES.map(c=>(
            <a key={c.id} href={`#/category/${c.id}`} title={c.name} style={{padding:"5px 8px",borderRadius:6,fontSize:18,color:C.muted,textDecoration:"none",transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.color=C.text;e.currentTarget.style.background="rgba(255,255,255,0.04)";}} onMouseLeave={e=>{e.currentTarget.style.color=C.muted;e.currentTarget.style.background="transparent";}}>
              {c.icon}
            </a>
          ))}
        </div>
        <span className="tr-nav-badge" style={{background:"rgba(6,182,212,0.12)",color:C.cyan,fontSize:11,fontWeight:700,fontFamily:"'Plus Jakarta Sans',sans-serif",padding:"3px 10px",borderRadius:20,letterSpacing:"0.02em",border:"1px solid rgba(6,182,212,0.25)"}}>{TOOLS.length} tools</span>
        {/* PHASE 2: <UsageCounter/> */}
        <a href="/" style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600,color:"#E2E8F0",textDecoration:"none",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)"}}>🏠 Home</a>
      </div>
    </nav>
  );
}

function ToolsRiftCss() {
  const route=useAppRouter();
  const showChrome = route.page !== 'home' && route.page !== 'tool';
  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{GLOBAL_CSS}</style>
      {showChrome && <Nav/>}
      {route.page==="home"&&<HomePage/>}
      {route.page==="tool"&&<ToolPage toolId={route.toolId}/>}
      {route.page==="category"&&<CategoryPage catId={route.catId}/>}
      {showChrome && <SiteFooter currentPage="css"/>}
    </div>
  );
}

export default ToolsRiftCss;
