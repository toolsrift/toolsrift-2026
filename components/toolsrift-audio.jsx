import { useState, useEffect, useRef } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolPageLayout from './shared/ToolPageLayout';

const THEME = getCategoryById("audio");
const PAGE_THEME = getCategoryById("audio");
const BRAND = { name: "ToolsRift", tagline: "Audio Tools" };

const C = {
  bg: "#06090F", surface: "#0D1117", border: "rgba(255,255,255,0.06)",
  accent: "#9333EA", accentD: "#7E22CE",
  text: "#E2E8F0", muted: "#64748B",
  success: "#10B981", warn: "#F59E0B", danger: "#EF4444",
};

const GLOBAL_CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px} ::selection{background:rgba(147,51,234,0.3)} button:hover{filter:brightness(1.1)} select option{background:#0D1117} textarea{resize:vertical} .fade-in{animation:fadeIn .25s ease} @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}} @keyframes trShake{0%,100%{transform:translate(0,0) rotate(0)}20%{transform:translate(-6px,4px) rotate(-4deg)}40%{transform:translate(6px,-4px) rotate(4deg)}60%{transform:translate(-5px,-3px) rotate(-3deg)}80%{transform:translate(5px,3px) rotate(3deg)}} .tr-nav-cats{display:flex;gap:4px;align-items:center} .tr-nav-badge{display:inline-flex} @media(max-width:640px){ .tr-nav-cats{display:none!important} .tr-nav-badge{display:none!important} }`;

const T = {
  body: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, color:C.text },
  mono: { fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
  label: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
  h1: { fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:C.text },
  h2: { fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:C.text },
};

// ── Shared UI ────────────────────────────────────────────────────────────────
function Badge({ children, color = "rose" }) {
  const map = { rose:"rgba(147,51,234,0.15)", blue:"rgba(59,130,246,0.15)", green:"rgba(16,185,129,0.15)", amber:"rgba(245,158,11,0.15)", red:"rgba(239,68,68,0.15)" };
  const textMap = { rose:"#FDA4AF", blue:"#60A5FA", green:"#34D399", amber:"#FCD34D", red:"#FCA5A5" };
  return (
    <span style={{ background:map[color]||map.rose, color:textMap[color]||textMap.rose, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant="primary", size="md", href, disabled, style={} }) {
  const ACCENT = C.accent; const ACCENTD = C.accentD;
  const base = { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, border:"none", cursor:disabled?"not-allowed":"pointer", borderRadius:8, fontWeight:600, transition:"all .15s", fontFamily:"'Plus Jakarta Sans',sans-serif", textDecoration:"none", opacity:disabled?0.5:1 };
  const sz = { sm:{padding:"6px 14px",fontSize:12}, md:{padding:"9px 20px",fontSize:13}, lg:{padding:"12px 28px",fontSize:14} }[size];
  const v = {
    primary:{ background:`linear-gradient(135deg,${ACCENT},${ACCENTD})`, color:"#fff", boxShadow:`0 2px 8px rgba(147,51,234,0.25)` },
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
      onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.border} />
  );
}

function Textarea({ value, onChange, placeholder, rows=6, mono=false, style={} }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:13, fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif", outline:"none", lineHeight:1.6, ...style }}
      onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.border} />
  );
}

function SelectInput({ value, onChange, options, style={} }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 14px", color:C.text, fontSize:13, fontFamily:"'Plus Jakarta Sans',sans-serif", outline:"none", cursor:"pointer", ...style }}>
      {options.map((o) => Array.isArray(o) ? { value: o[0], label: o[1] } : (typeof o === "string" ? { value: o, label: o } : o)).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
    <div style={{ textAlign:"center", padding:"20px 16px", background:"rgba(147,51,234,0.08)", border:`1px solid rgba(147,51,234,0.2)`, borderRadius:10 }}>
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:32, fontWeight:700, color:C.accent }}>{value}</div>
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
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:700, color:C.accent }}>{value}</div>
      <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{label}</div>
    </div>
  );
}

function DataTable({ columns=[], rows=[] }) {
  return (
    <div style={{ overflowX:"auto", border:`1px solid ${C.border}`, borderRadius:10 }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:"'JetBrains Mono',monospace", fontSize:13 }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={{ textAlign:"left", padding:"10px 14px", color:C.muted, fontWeight:600, borderBottom:`1px solid ${C.border}`, background:"rgba(255,255,255,0.02)" }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {(Array.isArray(row) ? row : [row]).map((cell, ci) => (
                <td key={ci} style={{ padding:"10px 14px", color:C.text, borderBottom:ri < rows.length-1 ? `1px solid ${C.border}` : "none" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
          ...(cat ? [{ "@type": "ListItem", "position": 2, "name": cat.name, "item": `https://toolsrift.com/audio` }] : []),
          ...(tool ? [{ "@type": "ListItem", "position": 3, "name": tool.name || tool.id || "" }] : [])
        ]
      }) }} />
    </>
  );
}

const bigBtn = (bg) => ({ padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "'Sora',sans-serif", color: "#fff", background: bg });

// Cryptographically-strong uniform random integer in [0, max).
const secureRandom = (max) => {
  if (max <= 0) return 0;
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] % max;
};
// Fisher–Yates shuffle using secure randomness.
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureRandom(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function useAppRouter() {
  const parse = () => {
    const h = window.location.hash || "#/";
    const path = h.replace(/^#/, "") || "/";
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

// ── Tool registry ────────────────────────────────────────────────────────────
const TOOLS = [
  // ── edit ───────────────────────────────────────────────────────────────────
  { id:"audio-trimmer", cat:"edit", name:"Audio Trimmer", desc:"Cut and trim MP3, WAV, OGG or M4A audio using a visual waveform with live preview and WAV export — nothing is ever uploaded.", icon:"✂️", free:true },
  { id:"audio-merger", cat:"edit", name:"Audio Merger", desc:"Join two or more audio files into one continuous track in the order you choose, then download the result as a WAV file.", icon:"🔗", free:true },
  { id:"audio-volume-changer", cat:"edit", name:"Audio Volume Changer", desc:"Raise or lower the volume of an audio file by a precise amount in decibels, with a clipping warning before you export.", icon:"🔊", free:true },
  { id:"audio-normalizer", cat:"edit", name:"Audio Normalizer", desc:"Normalize audio so its loudest peak lands on a target dBFS level, evening out quiet recordings without uploading a byte.", icon:"📊", free:true },
  { id:"audio-fade-in-out", cat:"edit", name:"Audio Fade In & Out", desc:"Add a smooth fade in at the start and a fade out at the end of any audio file, with the fade length and curve you choose.", icon:"🎚️", free:true },
  { id:"audio-silence-remover", cat:"edit", name:"Audio Silence Remover", desc:"Automatically strip silent gaps below a threshold you set from podcasts, voice notes and recordings, and see the time saved.", icon:"🤫", free:true },
  { id:"audio-speed-changer", cat:"edit", name:"Audio Speed Changer", desc:"Speed audio up or slow it down from 0.25x to 4x, either the classic way that shifts pitch or with the pitch preserved.", icon:"⏩", free:true },
  { id:"audio-pitch-shifter", cat:"edit", name:"Audio Pitch Shifter", desc:"Shift the pitch of any audio up or down by semitones while keeping the original length, for transposing songs and vocals.", icon:"🎼", free:true },
  { id:"audio-reverser", cat:"edit", name:"Audio Reverser", desc:"Play any audio file backwards and export the reversed track as a WAV — perfect for backmasking and sound design experiments.", icon:"⏪", free:true },
  { id:"audio-cropper-loop", cat:"edit", name:"Audio Loop Maker", desc:"Extract one section of an audio file and repeat it a chosen number of times to build a loop you can download as a WAV.", icon:"🔁", free:true },

  // ── convert ────────────────────────────────────────────────────────────────
  { id:"audio-converter", cat:"convert", name:"Audio Converter", desc:"Re-encode audio to WAV, WebM/Opus or OGG using only your browser's built-in codecs, with live detection of supported formats.", icon:"🔄", free:true },
  { id:"audio-to-wav", cat:"convert", name:"Audio to WAV Converter", desc:"Convert MP3, M4A, OGG, FLAC, WebM or any decodable audio into an uncompressed 16-bit PCM WAV file with no upload.", icon:"💿", free:true },
  { id:"video-audio-extractor", cat:"convert", name:"Video to Audio Extractor", desc:"Extract the audio track from an MP4, WebM or MOV video and save it as a WAV file — the video never leaves your device.", icon:"🎬", free:true },
  { id:"audio-mono-stereo", cat:"convert", name:"Mono to Stereo Converter", desc:"Convert stereo audio down to mono or expand a mono track to stereo, with a left/right balance control, fully offline.", icon:"🎧", free:true },
  { id:"audio-sample-rate", cat:"convert", name:"Audio Sample Rate Converter", desc:"Resample audio to 8, 16, 22.05, 32, 44.1, 48 or 96 kHz with the browser's high quality resampler and export as WAV.", icon:"📶", free:true },
  { id:"audio-channel-splitter", cat:"convert", name:"Audio Channel Splitter", desc:"Split a stereo file into two separate mono WAV files — one for the left channel and one for the right — in a single click.", icon:"↔️", free:true },
  { id:"audio-base64", cat:"convert", name:"Audio to Base64 Converter", desc:"Convert an audio file into a Base64 data URI you can paste into HTML or CSS, and turn a data URI back into a playable file.", icon:"🔤", free:true },
  { id:"ringtone-maker", cat:"convert", name:"Ringtone Maker", desc:"Trim any song down to a 30-second ringtone-length clip with fades, preview it, and download it ready for your phone.", icon:"📱", free:true },

  // ── voice ──────────────────────────────────────────────────────────────────
  { id:"voice-recorder", cat:"voice", name:"Online Voice Recorder", desc:"Record your voice or any microphone input straight in the browser, play it back and download it — nothing is uploaded.", icon:"🎙️", free:true },
  { id:"text-to-speech", cat:"voice", name:"Text to Speech", desc:"Turn text into spoken audio with your device's built-in voices, choosing the voice, speaking rate, pitch and volume.", icon:"🗣️", free:true },
  { id:"audio-playback-tester", cat:"voice", name:"Speaker & Headphone Tester", desc:"Check your speakers or headphones by playing test tones through the left channel, the right channel or both at a safe level.", icon:"🔈", free:true },
  { id:"microphone-tester", cat:"voice", name:"Microphone Tester", desc:"Check that your microphone works with a live input level meter, peak reading and a list of the input devices available.", icon:"🎤", free:true },

  // ── analyze ────────────────────────────────────────────────────────────────
  { id:"waveform-viewer", cat:"analyze", name:"Waveform Viewer", desc:"Render the waveform of any audio file and read its duration, sample rate, channel count and peak level with no upload.", icon:"〰️", free:true },
  { id:"audio-spectrum-analyzer", cat:"analyze", name:"Audio Spectrum Analyzer", desc:"Watch a live FFT frequency spectrum of your microphone or of an audio file you load, drawn in real time on a canvas.", icon:"📉", free:true },
  { id:"bpm-detector", cat:"analyze", name:"BPM Detector", desc:"Estimate the tempo of a song in beats per minute using onset energy analysis of the low frequencies, entirely in-browser.", icon:"🥁", free:true },
  { id:"audio-metadata-viewer", cat:"analyze", name:"Audio Metadata Viewer", desc:"Inspect an audio file's duration, channels, sample rate, size, estimated bitrate and, for WAV files, its true bit depth.", icon:"🏷️", free:true },
  { id:"tone-generator", cat:"analyze", name:"Tone Generator", desc:"Generate a pure sine, square, sawtooth or triangle tone at any frequency, play it live and export it as a WAV file.", icon:"🎵", free:true },
  { id:"noise-generator", cat:"analyze", name:"Noise Generator", desc:"Generate white, pink or brown noise for testing speakers, masking distractions or sound design, with WAV export.", icon:"🌊", free:true },
  { id:"hearing-test", cat:"analyze", name:"Hearing Frequency Test", desc:"Step through a frequency sweep from 500 Hz to 20 kHz to find roughly where your hearing rolls off. For curiosity only.", icon:"👂", free:true },
  { id:"binaural-beat-generator", cat:"analyze", name:"Binaural Beat Generator", desc:"Play two slightly different tones, one in each ear, to create a binaural beat at the offset you pick. Not a medical device.", icon:"🧘", free:true },
];

const CATEGORIES = [
  { id:"edit", name:"Edit & Trim", icon:"✂️", desc:"Trim, merge, fade and normalize audio files." },
  { id:"convert", name:"Convert & Export", icon:"🔄", desc:"Change audio format, channels and sample rate." },
  { id:"voice", name:"Voice & Speech", icon:"🎙️", desc:"Record your voice and turn text into speech." },
  { id:"analyze", name:"Analyze & Generate", icon:"📈", desc:"Waveforms, BPM, tone and noise generators." },
];

const TOOL_META = {
  "audio-trimmer": {
    title: "Audio Trimmer — Cut MP3 & WAV Online Free | ToolsRift",
    desc: "Free online audio trimmer. Drag on the waveform to select a section, preview it instantly and export a trimmed WAV. Your file is decoded in your browser only.",
    keywords: "audio trimmer, cut mp3 online, trim audio file, wav trimmer, online audio cutter, waveform editor",
    faq: [
      ["Where is my audio file processed?", "Entirely inside your browser. The file is read with the FileReader API and decoded with the Web Audio API on your own device — it is never uploaded to ToolsRift or any other server, so even large private recordings stay local."],
      ["Which formats can I trim?", "Any format your browser can decode, which normally covers MP3, WAV, OGG, M4A/AAC, FLAC and WebM. The trimmed result is always exported as an uncompressed 16-bit WAV, because that is the one format guaranteed to be written correctly without a codec library."],
      ["How precise is the selection?", "You can drag on the waveform for a rough selection and then type exact start and end times in seconds with three decimal places. The cut is made at the nearest audio sample, so it is accurate to a fraction of a millisecond."],
    ],
    howTo: "Choose an audio file, then drag across the waveform or type exact start and end times. Press Preview to hear only the selected part, then Export WAV to download the trimmed clip.",
  },
  "audio-merger": {
    title: "Audio Merger — Join Audio Files Online Free | ToolsRift",
    desc: "Free online audio merger. Add several MP3, WAV or M4A files, put them in order and join them into one continuous WAV track. Everything runs in your browser.",
    keywords: "audio merger, join audio files, combine mp3 online, concatenate audio, merge wav files, audio joiner",
    faq: [
      ["Can I mix files with different sample rates?", "Yes. Each file is scheduled into a single offline rendering context, and the browser's resampler converts every clip to the highest sample rate found among your files, so mismatched inputs still line up correctly."],
      ["Is there a limit on how many files I can join?", "There is no fixed limit, but everything is held in memory as raw audio, so very long combined tracks can run out of RAM on low-end devices. Joining a handful of songs or a dozen voice clips is comfortable on most machines."],
      ["Are the files uploaded to merge them?", "No. All decoding, joining and WAV writing happens locally with the Web Audio API. Nothing is transmitted, which is why merging works even if you go offline after the page loads."],
    ],
    howTo: "Select two or more audio files, check the order in the list and remove anything you do not want. Press Merge to render one continuous track, then download it as a WAV.",
  },
  "audio-volume-changer": {
    title: "Audio Volume Changer — Boost or Lower Volume | ToolsRift",
    desc: "Free online volume changer for audio files. Apply an exact gain in decibels, see a clipping warning before you export, and download the louder or quieter WAV.",
    keywords: "audio volume changer, increase mp3 volume, make audio louder, reduce audio volume, gain adjust audio, decibel boost",
    faq: [
      ["What does the clipping warning mean?", "Digital audio cannot go above full scale. If your chosen gain would push the loudest peak past 0 dBFS the tool warns you and shows the resulting peak, because clipped samples turn into audible distortion that cannot be undone later."],
      ["What is the soft limiter option?", "When enabled, samples that would exceed full scale are gently rounded off instead of being hard-clipped. It keeps a boosted track listenable, though for the cleanest result you should lower the gain until no clipping is reported at all."],
      ["Does boosting volume add noise?", "Raising the gain raises the recording's own background hiss by exactly the same amount, because every sample is multiplied by the same factor. Volume change never adds new noise, it just makes existing noise more audible."],
    ],
    howTo: "Load an audio file and drag the gain slider to the number of decibels you want to add or remove. Check the predicted peak, then press Apply and download the new WAV.",
  },
  "audio-normalizer": {
    title: "Audio Normalizer — Normalize Peak Volume Online | ToolsRift",
    desc: "Free online audio normalizer. Scale any recording so its loudest peak sits exactly at your target dBFS level, then export a balanced WAV. No upload, no signup.",
    keywords: "audio normalizer, normalize audio online, peak normalization, dbfs normalize, fix quiet audio, level audio file",
    faq: [
      ["What is peak normalization?", "The tool finds the single loudest sample in your file and multiplies the whole recording by whatever factor puts that peak on your target level, usually -1 or -3 dBFS. The balance between loud and quiet parts is unchanged, only the overall level moves."],
      ["Why choose -1 dBFS rather than 0?", "Leaving a small amount of headroom avoids inter-sample peaks that can distort when the audio is later encoded to MP3 or AAC. -1 dBFS is a safe default for most uses and -3 dBFS is safer still if the file will be re-encoded."],
      ["Is this the same as loudness normalization?", "No. This is peak normalization, which targets the highest sample. Perceived loudness standards such as LUFS measure average loudness over time and require a different, much heavier analysis than a purely local browser tool performs."],
    ],
    howTo: "Load your audio file, pick a target peak level in dBFS, and press Normalize. The tool reports the original peak and the gain it applied, then you download the normalized WAV.",
  },
  "audio-fade-in-out": {
    title: "Audio Fade In and Fade Out Online Free | ToolsRift",
    desc: "Free online fade in and fade out tool. Add smooth linear or exponential fades of any length to the start and end of an audio file and export it as WAV.",
    keywords: "audio fade in, fade out audio online, add fade to mp3, audio fader, smooth audio ending, crossfade tool",
    faq: [
      ["What is the difference between linear and exponential fades?", "A linear fade changes amplitude at a constant rate, which can sound like it drops off quickly at the end. An exponential fade follows a curve closer to how we perceive loudness, so it generally sounds smoother on music."],
      ["Can I fade only one end of the track?", "Yes. Set the fade you do not want to zero seconds and only the other end is processed. This is handy when a song already ends cleanly but starts with an abrupt cut."],
      ["Does the fade change the file length?", "No. Fades are applied to the existing samples by scaling their amplitude, so the exported file has exactly the same duration as the original — only the first and last moments become quieter."],
    ],
    howTo: "Load an audio file, set the fade in and fade out durations in seconds and pick a curve. Press Apply Fades to render the result and download it as a WAV.",
  },
  "audio-silence-remover": {
    title: "Silence Remover — Cut Silent Gaps From Audio | ToolsRift",
    desc: "Free online silence remover for podcasts and voice notes. Set a threshold and minimum gap, strip dead air automatically, and see how much time you saved.",
    keywords: "remove silence from audio, silence remover online, cut dead air, trim silence podcast, audio gap remover, shorten voice recording",
    faq: [
      ["How does the tool decide what counts as silence?", "The audio is scanned in ten millisecond windows and the RMS level of each window is compared with your threshold in dBFS. Runs of quiet windows longer than your minimum gap are removed, and everything else is kept."],
      ["What threshold should I use?", "Start around -45 dBFS for a clean studio recording and raise it towards -35 dBFS for noisier rooms. If words are being clipped off, lower the threshold; if pauses survive, raise it. The report tells you exactly how much was removed each time."],
      ["Why keep a little padding around speech?", "Cutting exactly at the threshold chops the natural attack and tail of words and sounds unnatural. The tool keeps a short pad on both sides of each kept region so speech still breathes while long silences disappear."],
    ],
    howTo: "Load a recording, set the silence threshold in dBFS and the shortest gap worth removing, then press Remove Silence. Review the time saved and download the shortened WAV.",
  },
  "audio-speed-changer": {
    title: "Audio Speed Changer — Speed Up or Slow Down | ToolsRift",
    desc: "Free online audio speed changer. Play any file from 0.25x to 4x, either the classic way that shifts pitch or with pitch preserved for natural speech. No upload.",
    keywords: "audio speed changer, slow down audio, speed up mp3, change tempo without pitch, audio time stretch, playback rate tool",
    faq: [
      ["What does pitch preservation actually do?", "In preserve mode the tool time-stretches the waveform using overlapping grains that are cross-faded together, so the recording gets shorter or longer without the frequencies moving. Speech stays natural instead of turning into a chipmunk or a growl."],
      ["When should I use the classic mode instead?", "Classic mode simply resamples, exactly like changing the speed of a tape, so pitch rises when you speed up. That is what you want for sound design, for matching an old recording's pitch, or when the artefact-free result matters more than pitch."],
      ["Does time stretching lose quality?", "Granular stretching is a real-time-friendly approximation, so extreme settings can introduce a slight flutter on tonal music. Between roughly 0.7x and 1.6x the result is usually transparent for speech and very close for music."],
    ],
    howTo: "Load an audio file, choose a speed between 0.25x and 4x and pick classic or pitch-preserving mode. Press Apply, listen to the preview, then download the new WAV.",
  },
  "audio-pitch-shifter": {
    title: "Audio Pitch Shifter — Change Pitch, Keep Length | ToolsRift",
    desc: "Free online pitch shifter. Transpose any audio up or down by semitones while keeping the original duration, then export the shifted track as a WAV file.",
    keywords: "pitch shifter online, change audio pitch, transpose song semitones, pitch changer free, key changer audio, vocal pitch shift",
    faq: [
      ["How is the length kept the same?", "The tool first time-stretches the audio by the pitch ratio and then resamples it back by the same ratio. The two operations cancel out in duration but not in frequency, which leaves the pitch shifted and the length untouched."],
      ["How far can I shift before it sounds odd?", "Two or three semitones in either direction is usually transparent. Beyond about six semitones the granular stretching becomes audible as a slight warble, especially on sustained tones, so use large shifts deliberately as an effect."],
      ["Can I use this to change a song's key for practice?", "Yes, that is one of the most common uses — shift a backing track down two semitones to suit your vocal range and the tempo stays exactly the same, so you can still play along with the original timing."],
    ],
    howTo: "Load an audio file, set the shift in semitones between -12 and +12, and press Apply. Preview the shifted result in the player and download it as a WAV when it sounds right.",
  },
  "audio-reverser": {
    title: "Audio Reverser — Play Audio Backwards Online | ToolsRift",
    desc: "Free online audio reverser. Flip any MP3, WAV or M4A so it plays backwards, listen to the result instantly and export the reversed track as a WAV file.",
    keywords: "reverse audio online, play audio backwards, backmasking tool, reverse mp3, backwards sound effect, audio reverser free",
    faq: [
      ["Does reversing lose any quality?", "No. Reversing simply writes the decoded samples in the opposite order, which is a lossless rearrangement. The only quality change comes from the original decode of a compressed source such as MP3, not from the reversal itself."],
      ["What is reversed audio useful for?", "Backmasking experiments, reversed cymbal swells and risers in music production, spooky sound design for videos and games, and the classic party trick of checking what a song sounds like played backwards."],
      ["Can I reverse just part of a file?", "Reverse the whole file here and use the Audio Trimmer first if you only want a section. Trim to the region you want, export it, then load that clip into the reverser for a reversed excerpt."],
    ],
    howTo: "Load an audio file and press Reverse. The whole track is rewritten back to front, appears in the player for an instant listen, and can be downloaded as a WAV.",
  },
  "audio-cropper-loop": {
    title: "Audio Loop Maker — Crop and Repeat a Section | ToolsRift",
    desc: "Free online loop maker. Crop a section of any audio file, repeat it as many times as you like with an optional crossfade, and export the loop as a WAV.",
    keywords: "audio loop maker, loop a sound online, repeat audio section, seamless loop generator, crop and repeat audio, loop creator free",
    faq: [
      ["How do I get a seamless loop?", "Choose start and end points at zero crossings — the quiet moments between beats — and enable the short crossfade option. The crossfade blends the tail of each repeat into the head of the next so the seam stops clicking."],
      ["How many repeats can I make?", "Up to fifty repeats, which is more than enough for a background bed or a practice loop. Long loops are held in memory as raw audio, so a short source repeated many times is much lighter than a long source repeated a few times."],
      ["What are loops like this used for?", "Background beds for videos, practice loops for learning an instrument part, ambience for games, and test material for audio equipment. Because it exports plain WAV, the loop imports cleanly into any editor or game engine."],
    ],
    howTo: "Load an audio file, drag on the waveform to pick the section you want, set how many repeats and whether to crossfade the joins. Press Build Loop and download the WAV.",
  },
  "audio-converter": {
    title: "Audio Converter — Convert Audio Format Online | ToolsRift",
    desc: "Free online audio converter using only your browser's built-in codecs. Convert to WAV always, plus WebM/Opus or OGG when supported, with live format detection.",
    keywords: "audio converter online, convert audio format, mp3 to wav converter, webm opus encoder, ogg converter free, browser audio conversion",
    faq: [
      ["Why is WAV always available but other formats are not?", "WAV is written directly by this tool from the decoded samples, so it never depends on a codec. Compressed formats rely on the browser's MediaRecorder, and each browser ships a different set, so the tool asks your browser at runtime which ones it can actually produce."],
      ["Why can it not export MP3?", "No mainstream browser exposes an MP3 encoder, and adding one would mean loading a large third-party library. ToolsRift deliberately ships no external libraries, so WAV and the browser's own Opus-based formats are offered instead."],
      ["Why does compressed export take as long as the track?", "MediaRecorder encodes a live stream, so the audio has to be played through it in real time. A three minute song therefore takes about three minutes to encode, and the progress bar shows exactly where it has reached."],
    ],
    howTo: "Load an audio file and pick a target format from the list, which only shows what your browser supports. Press Convert, wait for the progress bar, then download the converted file.",
  },
  "audio-to-wav": {
    title: "Audio to WAV Converter — MP3 to WAV Online | ToolsRift",
    desc: "Free MP3 to WAV converter that runs in your browser. Turn MP3, M4A, OGG, FLAC or WebM into uncompressed 16-bit PCM WAV with no upload and no watermark.",
    keywords: "audio to wav, mp3 to wav converter, m4a to wav online, convert to wav free, pcm wav export, lossless wav converter",
    faq: [
      ["Does converting MP3 to WAV restore lost quality?", "No. MP3 compression discards information permanently, so the WAV is a faithful copy of the decoded MP3 rather than of the original master. WAV is still useful because it edits and imports cleanly without repeated lossy re-encoding."],
      ["What WAV format is written?", "A standard RIFF/WAVE file with 16-bit signed PCM samples at the source file's own sample rate and channel count. That combination opens in every editor, DAW, game engine and operating system without extra codecs."],
      ["Why are WAV files so much bigger?", "WAV stores every sample uncompressed, roughly 10 MB per minute of stereo CD-quality audio, while MP3 throws away most of that data. The size is the price of a format that never degrades when you edit and re-save it."],
    ],
    howTo: "Choose any audio file your browser can decode and press Convert to WAV. The file is decoded locally, written to a proper RIFF/WAVE container and offered as a download.",
  },
  "video-audio-extractor": {
    title: "Video to Audio — Extract Sound From Video Free | ToolsRift",
    desc: "Free video to audio extractor. Pull the sound out of an MP4, WebM or MOV file and save it as a WAV, processed entirely in your browser with no upload.",
    keywords: "video to audio, extract audio from video, mp4 to wav, rip sound from video, video sound extractor, webm audio extract",
    faq: [
      ["Which video files work?", "Anything whose audio track your browser can decode, which in practice covers most MP4/AAC, WebM/Opus and many MOV files. If a file fails, the container or codec is not supported by your browser and a different browser may succeed."],
      ["Is the video uploaded anywhere?", "No. The file is read locally and only its audio stream is decoded with the Web Audio API. Nothing is transmitted, which matters when the source is private footage, an interview or unreleased material."],
      ["Why is the output a WAV and not an MP3?", "Browsers do not ship an MP3 encoder, so writing WAV directly from the decoded samples is the only way to guarantee a correct file without third-party libraries. You can compress the WAV afterwards in any editor if you need a smaller file."],
    ],
    howTo: "Select a video file, wait for its audio track to be decoded, then press Extract Audio. The extracted sound appears in a player and downloads as a WAV file.",
  },
  "audio-mono-stereo": {
    title: "Mono to Stereo Converter — Change Channels Free | ToolsRift",
    desc: "Free online mono and stereo converter. Fold a stereo file down to a single mono channel or expand mono to stereo with balance control, then export as WAV.",
    keywords: "mono to stereo converter, stereo to mono online, audio channel converter, downmix audio, dual mono wav, fix one sided audio",
    faq: [
      ["Why would I convert stereo to mono?", "Mono halves the file size, guarantees that nothing disappears when a listener uses a single speaker, and fixes recordings where a microphone landed on only one channel. It is also standard for voiceovers and phone-system prompts."],
      ["How is the downmix calculated?", "The left and right channels are averaged sample by sample, which preserves the overall level and avoids the doubling you would get by simply summing them. Content that is out of phase between channels can still cancel, which is normal for any mono fold-down."],
      ["Does mono to stereo add real stereo width?", "No, and it honestly cannot. Expanding mono copies the same signal to both channels so it plays correctly on stereo systems, but the extra spatial information was never recorded and cannot be invented."],
    ],
    howTo: "Load an audio file and choose whether to convert to mono or to stereo. Adjust the balance if you are expanding to stereo, press Convert and download the resulting WAV.",
  },
  "audio-sample-rate": {
    title: "Sample Rate Converter — Resample Audio Online | ToolsRift",
    desc: "Free online sample rate converter. Resample audio to 8, 16, 22.05, 32, 44.1, 48 or 96 kHz with the browser's own high quality resampler and export a WAV.",
    keywords: "sample rate converter, resample audio online, 48khz to 44.1khz, downsample audio, audio resampler free, change sample rate wav",
    faq: [
      ["Which sample rate should I pick?", "44.1 kHz is the standard for music and 48 kHz for video work. 16 kHz or 22.05 kHz are common for speech and voice assistants because they cut file size sharply while keeping speech perfectly intelligible."],
      ["Does downsampling lose quality?", "It removes frequencies above half the new sample rate, so going to 16 kHz discards everything above 8 kHz. For speech that is usually inaudible; for music with cymbals and air it is clearly noticeable, so downsample deliberately."],
      ["Does upsampling improve anything?", "No. Upsampling interpolates new samples but adds no detail that was not already there. It is only useful for matching the rate of a project or device that requires a specific value."],
    ],
    howTo: "Load an audio file, read its current sample rate and pick the target rate you need. Press Resample and download the converted WAV at the new rate.",
  },
  "audio-channel-splitter": {
    title: "Audio Channel Splitter — Split Stereo to Mono Files | ToolsRift",
    desc: "Free online stereo splitter. Separate a stereo file into two independent mono WAV files, one for the left channel and one for the right, with no upload at all.",
    keywords: "audio channel splitter, split stereo to mono, separate left right channel, extract one channel audio, stereo separator, dual mono export",
    faq: [
      ["When is splitting channels useful?", "Interview recorders often put each microphone on its own channel, so splitting gives you a clean track per speaker. It also rescues recordings where one channel is damaged and the other is fine."],
      ["What happens with a mono file?", "A mono source has only one channel, so the tool tells you that and offers the single track for download rather than producing two identical files. Nothing is silently duplicated."],
      ["Does splitting change the audio?", "No. Each channel's samples are copied out unchanged into its own WAV file at the original sample rate, so the split tracks are bit-for-bit the same audio you started with."],
    ],
    howTo: "Load a stereo audio file and press Split Channels. The left and right tracks appear as separate players, each with its own download button for a mono WAV.",
  },
  "audio-base64": {
    title: "Audio to Base64 Converter — Encode & Decode Free | ToolsRift",
    desc: "Free audio to Base64 converter. Turn any audio file into a data URI you can embed in HTML or CSS, and decode a data URI back into a playable, downloadable file.",
    keywords: "audio to base64, base64 audio encoder, data uri audio, decode base64 audio, embed sound in html, base64 to mp3",
    faq: [
      ["What is an audio data URI for?", "It embeds a sound directly in HTML, CSS or JavaScript so the page needs no extra network request. That suits tiny interface sounds, email-safe assets, and offline single-file demos."],
      ["Why does the Base64 string look so large?", "Base64 represents three bytes with four characters, so encoded data is about 33 percent bigger than the original file. That is why data URIs suit short clips and are a poor choice for full songs."],
      ["Is my audio uploaded during encoding?", "No. The file is read with FileReader and converted to Base64 in your browser's memory. The resulting string only ever exists on your device unless you paste it somewhere yourself."],
    ],
    howTo: "In Encode mode choose an audio file and copy the generated data URI. In Decode mode paste a data URI or raw Base64, then play the result and download it as a file.",
  },
  "ringtone-maker": {
    title: "Ringtone Maker — Make a 30 Second Ringtone Free | ToolsRift",
    desc: "Free online ringtone maker. Pick the best 30 seconds of any song, add fades, preview the clip and download a ringtone-length WAV — all inside your browser.",
    keywords: "ringtone maker, make ringtone from mp3, 30 second ringtone, custom ringtone creator, cut song for ringtone, free ringtone cutter",
    faq: [
      ["Why is the clip limited to 30 seconds?", "Thirty seconds is the classic ringtone length and the limit iPhones enforce for custom tones. Keeping to it means the clip will be accepted by phone tooling without a second trim."],
      ["How do I get this onto my phone?", "The tool exports a WAV. Android accepts WAV files copied into the Ringtones folder directly. iPhone needs an M4R, so convert the WAV in your usual desktop tool and import it through your phone's sync software."],
      ["Should I add fades?", "Usually yes. A ringtone that starts mid-note is jarring, and a short fade in and out makes the loop sound intentional when the phone repeats it. A quarter of a second at each end is plenty."],
    ],
    howTo: "Load a song, drag the start point to the hook you want and set a length up to 30 seconds. Add fades, press Preview to check it, then download your ringtone clip.",
  },
  "voice-recorder": {
    title: "Online Voice Recorder — Record & Download Free | ToolsRift",
    desc: "Free online voice recorder with no signup. Record from your microphone, watch the level meter, play the take back and download it — the audio never leaves your device.",
    keywords: "online voice recorder, record voice in browser, free audio recorder, microphone recorder online, record and download audio, browser dictaphone",
    faq: [
      ["Where does the recording go?", "Nowhere but your own device. Audio captured through getUserMedia is held in browser memory and written to a local file only when you press download. There is no server involved at any point."],
      ["Why does the browser ask for microphone permission?", "Browsers require explicit consent before any page can access a microphone. If you decline, the recorder simply cannot start; you can re-enable access from the padlock or camera icon in your address bar and reload."],
      ["What format is the recording?", "The recorder uses MediaRecorder with the best format your browser offers, usually WebM with Opus audio on Chrome and Firefox and MP4/AAC on Safari. The tool shows which one is in use before you record."],
    ],
    howTo: "Press Record and allow microphone access when your browser asks. Speak while watching the level meter, press Stop, then play the take back and download it.",
  },
  "text-to-speech": {
    title: "Text to Speech — Free Online TTS Voice Reader | ToolsRift",
    desc: "Free text to speech tool using your device's built-in voices. Choose a voice, speaking rate, pitch and volume, then listen to any text read aloud instantly.",
    keywords: "text to speech, free tts online, read text aloud, speech synthesis voices, tts voice generator, text reader online",
    faq: [
      ["Where do the voices come from?", "They are the voices already installed on your operating system, exposed through the Web Speech API. That is why the list differs between Windows, macOS, Android and iOS, and why installing more system voices adds more options here."],
      ["Is my text sent anywhere?", "On most browsers the synthesis is fully local and nothing leaves your device. Some browsers do route certain premium or network-marked voices through an online voice service, so the tool labels those voices so you can choose a local one for sensitive text."],
      ["Can I download the spoken audio?", "The Web Speech API plays speech through the system audio path and does not expose a downloadable stream, so no browser tool can save it directly. Use the Voice Recorder with a loopback input, or your operating system's own recorder, if you need a file."],
    ],
    howTo: "Paste or type your text, pick a voice from the list and adjust the rate, pitch and volume sliders. Press Speak to hear it, and Stop at any time to cancel playback.",
  },
  "audio-playback-tester": {
    title: "Speaker Test — Test Left and Right Channels Free | ToolsRift",
    desc: "Free online speaker and headphone test. Play a safe test tone through the left channel, the right channel or both to confirm your audio output is working properly.",
    keywords: "speaker test online, headphone left right test, audio output tester, stereo channel test, test speakers browser, sound check tool",
    faq: [
      ["What should I hear during the test?", "A steady tone from only the channel you selected. If the left button produces sound on the right, your cable or system balance is swapped; if one side is silent, that driver, cable or output channel has a fault."],
      ["Is the test volume safe?", "The tool caps its output gain well below full scale and ramps the tone in and out rather than starting abruptly. Still, start with your system volume low and raise it gradually, especially on headphones."],
      ["Can I choose which output device is used?", "Browsers play through whatever output your operating system has selected, and only some expose per-page device switching. Change the default output in your system sound settings if the test plays through the wrong device."],
    ],
    howTo: "Turn your volume down first, then press Left, Right or Both to play a short test tone. Confirm the sound comes from the expected side and stop the tone at any time.",
  },
  "microphone-tester": {
    title: "Microphone Test — Check Your Mic Online Free | ToolsRift",
    desc: "Free online microphone test with a live level meter and peak reading. Confirm your mic is detected and picking up sound before a call — nothing is recorded or uploaded.",
    keywords: "microphone test online, mic tester free, check microphone browser, audio input level meter, test mic before call, webcam mic check",
    faq: [
      ["Is anything recorded while I test?", "No. The live signal is analysed to draw the level meter and is then discarded. Nothing is written to a file, stored, or sent anywhere, so the test is safe to run before a confidential call."],
      ["The meter stays flat — what should I check?", "First confirm you allowed microphone access when prompted. Then check that the right input device is selected in your system settings, that the microphone is not muted in hardware, and that no other application has exclusive use of it."],
      ["Why are the device names blank?", "Browsers hide device labels until a page has been granted microphone permission, to prevent silent fingerprinting. Allow access once and the list fills in with the real device names."],
    ],
    howTo: "Press Start Test and allow microphone access. Speak normally and watch the level meter and peak readout respond, then press Stop when you are satisfied.",
  },
  "waveform-viewer": {
    title: "Waveform Viewer — See Any Audio File Waveform | ToolsRift",
    desc: "Free online waveform viewer. Render the waveform of any audio file and read its duration, sample rate, channel count and peak level, all decoded in your browser.",
    keywords: "waveform viewer, audio waveform online, visualize audio file, see sound wave, audio peak level, waveform generator free",
    faq: [
      ["What does the waveform actually show?", "The vertical extent at each point is the range between the quietest and loudest sample in that slice of time. Tall sections are loud, flat sections are near silence, so you can spot dead air, clipping and song structure at a glance."],
      ["What is the peak level in dBFS?", "It is the loudest single sample expressed relative to digital full scale, where 0 dBFS is the maximum. A track peaking at -12 dBFS has plenty of headroom; one peaking at exactly 0.0 dBFS may already be clipped."],
      ["Can I view very long files?", "Yes, though the whole file is decoded into memory first, so hour-long recordings need a capable machine. The waveform itself is drawn from summarised peaks, so rendering stays fast once decoding finishes."],
    ],
    howTo: "Choose an audio file and the waveform is drawn automatically once decoding finishes. Read the duration, sample rate, channels and peak level shown beneath it.",
  },
  "audio-spectrum-analyzer": {
    title: "Audio Spectrum Analyzer — Live FFT Display Free | ToolsRift",
    desc: "Free real-time audio spectrum analyzer. Watch a live FFT frequency display of your microphone input or of any audio file you load, drawn in your browser.",
    keywords: "spectrum analyzer online, audio fft analyzer, real time frequency display, sound spectrum visualizer, audio frequency meter, live eq analyzer",
    faq: [
      ["What am I looking at?", "Each bar is a frequency band, with low frequencies on the left and high on the right, and the bar height is how much energy the signal currently holds in that band. Bass shows as tall bars on the left, cymbals and sibilance on the right."],
      ["What is FFT size and why change it?", "The FFT size sets how many frequency bands are computed. Larger sizes give finer frequency detail but respond more slowly to change, while smaller sizes react instantly but blur nearby frequencies together."],
      ["Does the microphone mode record me?", "No. The live input is passed to an analyser node purely to compute the display and is never stored or transmitted. Stopping the analyser releases the microphone straight away."],
    ],
    howTo: "Pick microphone or file as the source, grant permission or load a file, then press Start. The spectrum animates live and you can change the FFT size while it runs.",
  },
  "bpm-detector": {
    title: "BPM Detector — Find a Song's Tempo Online Free | ToolsRift",
    desc: "Free online BPM detector. Load a track and the tool estimates its tempo in beats per minute from low-frequency onset energy, entirely inside your browser.",
    keywords: "bpm detector, find song tempo, bpm counter online, detect beats per minute, tempo analyzer free, song bpm finder",
    faq: [
      ["How does the detection work?", "The track is downsampled and low-pass filtered to isolate the kick and bass, an onset energy envelope is built from it, and that envelope is autocorrelated to find the interval that repeats most strongly. That interval is converted into beats per minute."],
      ["How accurate is the result?", "For music with a steady drum pattern the estimate is usually within one BPM. Sparse, rubato or heavily syncopated material is much harder, which is why the tool also shows the half-time and double-time candidates for you to judge."],
      ["Why does it sometimes report double or half the real tempo?", "Autocorrelation cannot tell a beat from every second beat, so a 90 BPM track can score strongly at 180 BPM. Compare the reported value with the alternatives shown and pick the one that matches how you would tap along."],
    ],
    howTo: "Load a music file and press Detect BPM. The tool analyses the low-frequency onsets and reports the most likely tempo along with half-time and double-time alternatives.",
  },
  "audio-metadata-viewer": {
    title: "Audio File Info Viewer — Bitrate, Channels, Rate | ToolsRift",
    desc: "Free audio metadata viewer. Inspect duration, channels, sample rate, file size, estimated bitrate and, for WAV files, the true bit depth and PCM encoding.",
    keywords: "audio metadata viewer, audio file info, check audio bitrate, wav bit depth, sample rate checker, audio properties online",
    faq: [
      ["Why is the bitrate an estimate?", "For compressed formats the tool divides the file size by the duration, which gives the true average bitrate but cannot distinguish constant from variable bitrate encoding. Container overhead and embedded artwork also nudge the figure slightly."],
      ["Why is bit depth only shown for WAV files?", "The Web Audio API always hands back 32-bit float samples regardless of the source, so the original bit depth is lost during decoding. For WAV the tool reads the RIFF header directly and reports the real stored bit depth and PCM format."],
      ["Does this read ID3 tags like artist and album?", "No, it reports technical properties rather than tag metadata. The focus is the information you need for editing and compatibility decisions: duration, channels, sample rate, size and encoding."],
    ],
    howTo: "Select an audio file and its technical properties are listed immediately after decoding. WAV files additionally show the bit depth and PCM format read from the header.",
  },
  "tone-generator": {
    title: "Tone Generator — Sine, Square, Saw & Triangle Free | ToolsRift",
    desc: "Free online tone generator. Play a pure sine, square, sawtooth or triangle wave at any frequency from 20 Hz to 20 kHz and export it as a WAV of any length.",
    keywords: "tone generator online, sine wave generator, test tone 440hz, frequency generator free, square wave audio, audio test tone wav",
    faq: [
      ["What is a tone generator used for?", "Tuning instruments against a reference pitch, testing speakers and room response, checking equipment for buzz at specific frequencies, calibrating levels, and creating raw source material for synthesis."],
      ["Which waveform should I choose?", "Sine is a single pure frequency and is best for tuning and testing. Square, sawtooth and triangle add harmonics, which makes them louder-sounding and more useful for synthesis or for hearing how a system handles complex content."],
      ["Is playback volume safe?", "The output gain is capped well below full scale and the tone is ramped in and out to avoid clicks. High frequencies at high volume are still fatiguing, so start quiet and raise your system volume gradually."],
    ],
    howTo: "Choose a waveform, set the frequency and volume, then press Play to hear the tone live. Set a duration and press Export WAV to save the tone as a file.",
  },
  "noise-generator": {
    title: "Noise Generator — White, Pink and Brown Noise Free | ToolsRift",
    desc: "Free online noise generator. Play white, pink or brown noise for focus, sleep, speaker testing or sound design, and export any length of it as a WAV file.",
    keywords: "white noise generator, pink noise online, brown noise player, noise generator free, sound masking tool, test noise wav",
    faq: [
      ["What is the difference between white, pink and brown noise?", "White noise holds equal energy at every frequency and sounds bright and hissy. Pink noise falls by 3 dB per octave and sounds balanced, close to rainfall. Brown noise falls faster still and sounds deep, like distant surf."],
      ["Which one is best for concentration?", "Most people find pink or brown noise easier to tolerate for long periods because they are less harsh in the treble, while white noise masks sudden sounds more aggressively. Try each at low volume and keep whichever fades into the background fastest."],
      ["Why is pink noise used to test speakers?", "Its energy per octave is constant, which matches how measurement and hearing are organised, so a flat-sounding system reproduces pink noise evenly across the range. White noise looks and sounds treble-heavy in the same test."],
    ],
    howTo: "Pick white, pink or brown noise, set the volume and press Play for continuous playback. To keep a copy, set a duration and press Export WAV.",
  },
  "hearing-test": {
    title: "Hearing Frequency Test — Find Your Upper Limit Free | ToolsRift",
    desc: "Free online hearing frequency test. Step from 500 Hz up to 20 kHz and mark the point where tones become inaudible. For general interest only, not a medical test.",
    keywords: "hearing test online, high frequency hearing test, hearing range checker, can you hear this frequency, upper hearing limit, mosquito tone test",
    faq: [
      ["Is this a real hearing test?", "No. It is a curiosity tool, not a medical device and not a diagnostic instrument. Consumer speakers, headphones, browser volume and room noise all affect the result, and only a qualified audiologist with calibrated equipment can assess your hearing."],
      ["What is a typical upper limit?", "Young listeners often hear to around 17-20 kHz, and the ceiling usually falls with age, commonly to 14-16 kHz by middle age. Many headphones and laptop speakers also roll off before 18 kHz, so the equipment may be the limit rather than your ears."],
      ["How do I stay safe while testing?", "Turn your system volume well down before starting and raise it only until the first tone is comfortably audible. Never push the volume up to chase a tone you cannot hear — that is exactly how high-frequency hearing gets damaged."],
    ],
    howTo: "Lower your volume, put on headphones and press Start. For each tone press whether you can hear it; the test steps upward until you stop hearing and reports the frequency reached.",
  },
  "binaural-beat-generator": {
    title: "Binaural Beat Generator — Custom Frequency Tones | ToolsRift",
    desc: "Free binaural beat generator. Play two slightly detuned tones, one per ear, to create a beat at the offset you choose. For general interest, not a medical device.",
    keywords: "binaural beat generator, binaural beats online, alpha theta tones, brainwave tone generator, custom binaural frequency, headphone beat tones",
    faq: [
      ["What is a binaural beat?", "When each ear receives a slightly different frequency, the auditory system perceives a pulsing at the difference between them — 200 Hz and 204 Hz produce a 4 Hz beat. The pulse exists only in perception, not in the air."],
      ["Do binaural beats have proven effects?", "Claims about focus, relaxation and sleep are popular but the research is mixed and far from settled. This tool is offered for general interest and experimentation and is explicitly not a medical device, a treatment, or a diagnostic instrument."],
      ["Why are headphones required?", "The effect depends on each ear receiving a different tone. Speakers let both signals reach both ears, which produces an ordinary acoustic beat in the room rather than a binaural one, so the effect disappears."],
    ],
    howTo: "Put on headphones and turn your volume down. Set a carrier frequency and the beat offset in hertz, then press Play; the two tones fade in gently and stop whenever you press Stop.",
  },
};

// ══════════════════════════════════════════════════════════════════════════════
//  TOOLS
// ══════════════════════════════════════════════════════════════════════════════

// ── Audio helpers (native browser APIs only — no libraries, no uploads) ──────
const canWebAudio = () => typeof window !== "undefined" && !!(window.AudioContext || window.webkitAudioContext);
const canOffline = () => typeof window !== "undefined" && !!(window.OfflineAudioContext || window.webkitOfflineAudioContext);
const canMic = () => typeof navigator !== "undefined" && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
const canRecord = () => typeof window !== "undefined" && typeof window.MediaRecorder !== "undefined";
const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;

const newAC = () => new (window.AudioContext || window.webkitAudioContext)();
const newOAC = (ch, len, sr) => new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
  Math.max(1, ch), Math.max(1, Math.ceil(len)), Math.min(96000, Math.max(8000, Math.round(sr)))
);
const makeBuffer = (ch, len, sr) => {
  const n = Math.max(1, Math.ceil(len));
  return newOAC(ch, n, sr).createBuffer(Math.max(1, ch), n, Math.min(96000, Math.max(8000, Math.round(sr))));
};

const fmtTime = (s) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = s - m * 60;
  return `${m}:${sec < 10 ? "0" : ""}${sec.toFixed(2)}`;
};
const fmtBytes = (b) => {
  if (b == null) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(2)} MB`;
};
const toDb = (v) => (v <= 0 ? -Infinity : 20 * Math.log10(v));
const fmtDb = (v) => (v <= 0 ? "-∞ dBFS" : `${toDb(v).toFixed(2)} dBFS`);

function peakOf(buf) {
  let p = 0;
  for (let c = 0; c < buf.numberOfChannels; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (a > p) p = a; }
  }
  return p;
}

// Write a real RIFF/WAVE container (16-bit PCM) from an AudioBuffer.
function audioBufferToWav(buffer) {
  const numCh = buffer.numberOfChannels;
  const sr = buffer.sampleRate;
  const len = buffer.length;
  const dataBytes = len * numCh * 2;
  const ab = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(ab);
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, "RIFF"); view.setUint32(4, 36 + dataBytes, true); ws(8, "WAVE");
  ws(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, numCh, true); view.setUint32(24, sr, true);
  view.setUint32(28, sr * numCh * 2, true); view.setUint16(32, numCh * 2, true); view.setUint16(34, 16, true);
  ws(36, "data"); view.setUint32(40, dataBytes, true);
  const chans = [];
  for (let c = 0; c < numCh; c++) chans.push(buffer.getChannelData(c));
  let off = 44;
  for (let i = 0; i < len; i++) {
    for (let c = 0; c < numCh; c++) {
      let s = chans[c][i];
      if (!(s >= -1)) s = s > 1 ? 1 : (s < -1 ? -1 : 0);
      view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      off += 2;
    }
  }
  return new Blob([ab], { type: "audio/wav" });
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function baseName(name, ext) {
  const n = (name || "audio").replace(/\.[^.]+$/, "");
  return `${n}${ext}`;
}

function sliceBuffer(buf, startSec, endSec) {
  const sr = buf.sampleRate;
  const s = Math.max(0, Math.min(buf.length, Math.floor(startSec * sr)));
  const e = Math.max(s + 1, Math.min(buf.length, Math.floor(endSec * sr)));
  const out = makeBuffer(buf.numberOfChannels, e - s, sr);
  for (let c = 0; c < buf.numberOfChannels; c++) out.copyToChannel(buf.getChannelData(c).slice(s, e), c);
  return out;
}

function mapBuffer(buf, fn) {
  const out = makeBuffer(buf.numberOfChannels, buf.length, buf.sampleRate);
  for (let c = 0; c < buf.numberOfChannels; c++) {
    const src = buf.getChannelData(c);
    const dst = new Float32Array(src.length);
    fn(src, dst, c, buf.sampleRate);
    out.copyToChannel(dst, c);
  }
  return out;
}

// Overlap-add granular time stretch. factor > 1 makes the audio longer.
function olaStretch(buf, factor) {
  const sr = buf.sampleRate;
  const grain = Math.max(64, Math.round(0.08 * sr));
  const half = Math.round(grain / 2);
  const outLen = Math.max(1, Math.round(buf.length * factor));
  const out = makeBuffer(buf.numberOfChannels, outLen, sr);
  const win = new Float32Array(grain);
  for (let k = 0; k < grain; k++) win[k] = 0.5 - 0.5 * Math.cos((2 * Math.PI * k) / (grain - 1));
  for (let c = 0; c < buf.numberOfChannels; c++) {
    const inD = buf.getChannelData(c);
    const o = new Float32Array(outLen);
    let outPos = 0, inPos = 0;
    const inHop = half / factor;
    while (outPos < outLen) {
      const i0 = Math.round(inPos);
      if (i0 >= inD.length) break;
      for (let k = 0; k < grain; k++) {
        const oi = outPos + k; if (oi >= outLen) break;
        const si = i0 + k; if (si >= inD.length) break;
        o[oi] += inD[si] * win[k];
      }
      outPos += half; inPos += inHop;
    }
    out.copyToChannel(o, c);
  }
  return out;
}

// Render a buffer through an offline graph at a chosen rate / length.
async function renderOffline(buf, { sampleRate, playbackRate = 1, channels, lengthSec } = {}) {
  const sr = sampleRate || buf.sampleRate;
  const ch = channels || buf.numberOfChannels;
  const dur = lengthSec != null ? lengthSec : buf.duration / playbackRate;
  const oac = newOAC(ch, dur * sr, sr);
  const src = oac.createBufferSource();
  src.buffer = buf;
  if (playbackRate !== 1) src.playbackRate.value = playbackRate;
  src.connect(oac.destination);
  src.start(0);
  return await oac.startRendering();
}

// Real-time encode through MediaRecorder (the only compressed encoders a browser exposes).
function supportedRecordTypes() {
  if (!canRecord()) return [];
  const cands = [
    ["audio/webm;codecs=opus", "WebM (Opus)"],
    ["audio/webm", "WebM"],
    ["audio/ogg;codecs=opus", "OGG (Opus)"],
    ["audio/ogg", "OGG (Vorbis/Opus)"],
    ["audio/mp4", "MP4 (AAC)"],
  ];
  const seen = new Set();
  return cands.filter(([m, l]) => {
    if (!window.MediaRecorder.isTypeSupported || !window.MediaRecorder.isTypeSupported(m)) return false;
    if (seen.has(l)) return false;
    seen.add(l); return true;
  });
}

function encodeWithRecorder(buffer, mimeType, onProgress) {
  return new Promise((resolve, reject) => {
    try {
      const ac = newAC();
      const dest = ac.createMediaStreamDestination();
      const src = ac.createBufferSource();
      src.buffer = buffer;
      src.connect(dest);
      const rec = new MediaRecorder(dest.stream, { mimeType });
      const chunks = [];
      let timer = null;
      rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onerror = () => { if (timer) clearInterval(timer); try { ac.close(); } catch (e) {} reject(new Error("The browser's encoder failed on this format.")); };
      rec.onstop = () => {
        if (timer) clearInterval(timer);
        try { ac.close(); } catch (e) {}
        resolve(new Blob(chunks, { type: mimeType }));
      };
      const t0 = ac.currentTime;
      rec.start(200);
      src.start();
      timer = setInterval(() => {
        const p = Math.min(1, (ac.currentTime - t0) / buffer.duration);
        onProgress && onProgress(p);
      }, 200);
      src.onended = () => { onProgress && onProgress(1); setTimeout(() => { try { rec.stop(); } catch (e) {} }, 250); };
    } catch (e) { reject(e); }
  });
}

// ── Shared audio UI ─────────────────────────────────────────────────────────
function Notice({ children, tone = "info" }) {
  const map = {
    info: ["rgba(147,51,234,0.08)", "rgba(147,51,234,0.25)", "#C4B5FD"],
    warn: ["rgba(245,158,11,0.08)", "rgba(245,158,11,0.28)", "#FCD34D"],
    danger: ["rgba(239,68,68,0.08)", "rgba(239,68,68,0.28)", "#FCA5A5"],
    ok: ["rgba(16,185,129,0.08)", "rgba(16,185,129,0.28)", "#6EE7B7"],
  }[tone] || [];
  return (
    <div style={{ background: map[0], border: `1px solid ${map[1]}`, color: map[2], borderRadius: 10, padding: "10px 14px", fontSize: 12.5, lineHeight: 1.6 }}>
      {children}
    </div>
  );
}

function Unsupported({ what }) {
  return <Notice tone="danger">Your browser does not support {what}, so this tool cannot run here. Try the latest Chrome, Edge, Firefox or Safari.</Notice>;
}

function PrivacyNote({ children }) {
  return <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.6 }}>🔒 {children || "Your file is decoded in your browser with the Web Audio API. Nothing is uploaded to any server."}</div>;
}

function Slider({ value, onChange, min, max, step = 1, suffix = "", label }) {
  return (
    <div>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={T.label}>{label}</span>
          <span style={{ ...T.mono, color: C.accent, fontSize: 12 }}>{value}{suffix}</span>
        </div>
      )}
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: C.accent, cursor: "pointer" }} />
    </div>
  );
}

function NumField({ value, onChange, min, max, step = 1, suffix }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input type="number" value={value} min={min} max={max} step={step}
        onChange={(e) => onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.text, fontSize: 13, fontFamily: "'JetBrains Mono',monospace", outline: "none" }} />
      {suffix && <span style={{ fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>{suffix}</span>}
    </div>
  );
}

function useAudioLoader() {
  const [file, setFile] = useState(null);
  const [buf, setBuf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async (f) => {
    if (!f) return;
    setErr(""); setBuf(null); setFile(f); setLoading(true);
    let ac = null;
    try {
      if (!canWebAudio()) throw new Error("no-webaudio");
      ac = newAC();
      const ab = await f.arrayBuffer();
      const decoded = await new Promise((res, rej) => {
        let settled = false;
        const ok = (b) => { if (!settled) { settled = true; res(b); } };
        const bad = (e) => { if (!settled) { settled = true; rej(e || new Error("decode")); } };
        const p = ac.decodeAudioData(ab, ok, bad);
        if (p && typeof p.then === "function") p.then(ok, bad);
      });
      setBuf(decoded);
    } catch (e) {
      setErr(e && e.message === "no-webaudio"
        ? "This browser does not support the Web Audio API."
        : "Could not decode this file. Try a WAV, MP3, OGG, M4A, FLAC or WebM file that your browser can play.");
    } finally {
      if (ac) { try { ac.close(); } catch (e) {} }
      setLoading(false);
    }
  };

  const reset = () => { setFile(null); setBuf(null); setErr(""); };
  return { file, buf, loading, err, load, reset };
}

function AudioIn({ loader, accept = "audio/*", label = "Choose an audio file", multiple = false, onFiles }) {
  const ref = useRef(null);
  const pick = (e) => {
    const fs = Array.from(e.target.files || []);
    if (!fs.length) return;
    if (multiple && onFiles) onFiles(fs); else loader.load(fs[0]);
    e.target.value = "";
  };
  return (
    <div>
      <input ref={ref} type="file" accept={accept} multiple={multiple} onChange={pick} style={{ display: "none" }} />
      <div onClick={() => ref.current && ref.current.click()}
        style={{ border: `1px dashed rgba(147,51,234,0.35)`, background: "rgba(147,51,234,0.04)", borderRadius: 12, padding: "22px 16px", textAlign: "center", cursor: "pointer" }}>
        <div style={{ fontSize: 26, marginBottom: 6 }}>🎵</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</div>
        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>Processed locally — never uploaded</div>
      </div>
      {loader && loader.loading && <div style={{ marginTop: 10, fontSize: 12.5, color: C.accent }}>⏳ Decoding audio…</div>}
      {loader && loader.err && <div style={{ marginTop: 10 }}><Notice tone="danger">{loader.err}</Notice></div>}
      {loader && loader.file && loader.buf && (
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: "6px 18px", fontSize: 12, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>
          <span style={{ color: C.text }}>📄 {loader.file.name}</span>
          <span>⏱ {fmtTime(loader.buf.duration)}</span>
          <span>💾 {fmtBytes(loader.file.size)}</span>
          <span>🎚 {loader.buf.numberOfChannels === 1 ? "mono" : `${loader.buf.numberOfChannels} ch`}</span>
          <span>📶 {loader.buf.sampleRate} Hz</span>
        </div>
      )}
    </div>
  );
}

function Waveform({ buffer, height = 96, start, end, onRange, playhead }) {
  const ref = useRef(null);
  const dragRef = useRef(null);
  const [, force] = useState(0);

  useEffect(() => {
    const onResize = () => force((n) => n + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const cv = ref.current;
    if (!cv || !buffer) return;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(120, cv.clientWidth || 600);
    cv.width = Math.round(w * dpr); cv.height = Math.round(height * dpr);
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, height);
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, w, height);
    const data = buffer.getChannelData(0);
    const step = Math.max(1, Math.floor(data.length / w));
    const mid = height / 2;
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      let mn = 1, mx = -1;
      const s0 = x * step;
      for (let i = 0; i < step; i++) {
        const v = data[s0 + i];
        if (v === undefined) break;
        if (v < mn) mn = v;
        if (v > mx) mx = v;
      }
      if (mn > mx) { mn = 0; mx = 0; }
      ctx.moveTo(x + 0.5, mid - mx * mid * 0.94);
      ctx.lineTo(x + 0.5, mid - mn * mid * 0.94);
    }
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
    if (start != null && end != null && buffer.duration > 0) {
      const x1 = (start / buffer.duration) * w;
      const x2 = (end / buffer.duration) * w;
      ctx.fillStyle = "rgba(6,9,15,0.66)";
      ctx.fillRect(0, 0, Math.max(0, x1), height);
      ctx.fillRect(Math.min(w, x2), 0, Math.max(0, w - x2), height);
      ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x1, 0); ctx.lineTo(x1, height); ctx.moveTo(x2, 0); ctx.lineTo(x2, height); ctx.stroke();
    }
    if (playhead != null && buffer.duration > 0) {
      const px = (playhead / buffer.duration) * w;
      ctx.strokeStyle = C.success; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, height); ctx.stroke();
    }
  });

  const posToSec = (e) => {
    const r = ref.current.getBoundingClientRect();
    const cx = (e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX);
    return Math.max(0, Math.min(buffer.duration, ((cx - r.left) / r.width) * buffer.duration));
  };
  const down = (e) => { if (!onRange) return; dragRef.current = posToSec(e); };
  const move = (e) => {
    if (!onRange || dragRef.current == null) return;
    const s = posToSec(e);
    onRange(Math.min(s, dragRef.current), Math.max(s, dragRef.current));
  };
  const up = () => { dragRef.current = null; };

  if (!buffer) return null;
  return (
    <canvas ref={ref}
      onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up}
      onTouchStart={down} onTouchMove={move} onTouchEnd={up}
      style={{ width: "100%", height, display: "block", borderRadius: 10, border: `1px solid ${C.border}`, cursor: onRange ? "crosshair" : "default", touchAction: "none" }} />
  );
}

function ResultAudio({ blob, name, note }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!blob) { setUrl(null); return undefined; }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  if (!blob || !url) return null;
  return (
    <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.22)", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ ...T.h2, color: C.success }}>✓ Ready</span>
        <span style={{ ...T.mono, fontSize: 12, color: C.muted }}>{fmtBytes(blob.size)}</span>
      </div>
      <audio src={url} controls style={{ width: "100%", marginBottom: 12 }} />
      <Btn onClick={() => downloadBlob(blob, name)}>⬇ Download {name.split(".").pop().toUpperCase()}</Btn>
      {note && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 10, lineHeight: 1.6 }}>{note}</div>}
    </div>
  );
}

function Busy({ on, text = "Processing…" }) {
  if (!on) return null;
  return <Notice tone="info">⏳ {text} Large files can take a few seconds — the page is not frozen.</Notice>;
}

function useProcessor() {
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState(null);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const run = async (fn) => {
    setBusy(true); setErr(""); setOut(null); setInfo("");
    await new Promise((r) => setTimeout(r, 20));
    try {
      const r = await fn(setInfo);
      setOut(r);
    } catch (e) {
      setErr((e && e.message) || "Processing failed. Try a different file or smaller selection.");
    }
    setBusy(false);
  };
  return { busy, out, err, info, run, setOut, setInfo };
}

function Err({ msg }) { return msg ? <Notice tone="danger">{msg}</Notice> : null; }

// ══════════════════════════════════════════════════════════════════════════════
//  EDIT
// ══════════════════════════════════════════════════════════════════════════════

function AudioTrimmer() {
  const L = useAudioLoader();
  const P = useProcessor();
  const [range, setRange] = useState([0, 0]);
  const [playing, setPlaying] = useState(false);
  const acRef = useRef(null); const srcRef = useRef(null);

  useEffect(() => { if (L.buf) { setRange([0, L.buf.duration]); P.setOut(null); } }, [L.buf]);
  useEffect(() => () => { try { srcRef.current && srcRef.current.stop(); } catch (e) {} try { acRef.current && acRef.current.close(); } catch (e) {} }, []);

  if (!canWebAudio()) return <Unsupported what="the Web Audio API" />;

  const [start, end] = range;
  const setR = (a, b) => setRange([a, Math.max(a + 0.02, b)]);

  const stop = () => { try { srcRef.current && srcRef.current.stop(); } catch (e) {} srcRef.current = null; setPlaying(false); };
  const preview = () => {
    if (!L.buf) return;
    stop();
    const ac = acRef.current || (acRef.current = newAC());
    if (ac.state === "suspended") ac.resume();
    const s = ac.createBufferSource();
    s.buffer = L.buf; s.connect(ac.destination);
    s.onended = () => setPlaying(false);
    s.start(0, start, Math.max(0.02, end - start));
    srcRef.current = s; setPlaying(true);
  };

  return (
    <VStack gap={16}>
      <AudioIn loader={L} label="Choose an audio file to trim" />
      {L.buf && (
        <>
          <Card>
            <Label>Drag across the waveform to select</Label>
            <Waveform buffer={L.buf} start={start} end={end} onRange={setR} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
              <div><Label>Start (seconds)</Label><NumField value={+start.toFixed(3)} min={0} max={L.buf.duration} step={0.01} onChange={(v) => setR(Math.max(0, Math.min(v || 0, end - 0.02)), end)} /></div>
              <div><Label>End (seconds)</Label><NumField value={+end.toFixed(3)} min={0} max={L.buf.duration} step={0.01} onChange={(v) => setR(start, Math.min(L.buf.duration, Math.max(v || 0, start + 0.02)))} /></div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <Btn variant="secondary" onClick={playing ? stop : preview}>{playing ? "⏹ Stop" : "▶ Preview selection"}</Btn>
              <Btn onClick={() => P.run(async () => audioBufferToWav(sliceBuffer(L.buf, start, end)))} disabled={P.busy}>✂️ Export trimmed WAV</Btn>
              <Btn variant="ghost" onClick={() => setR(0, L.buf.duration)}>Reset selection</Btn>
            </div>
            <div style={{ ...T.mono, fontSize: 12, color: C.muted, marginTop: 12 }}>Selection: {fmtTime(start)} → {fmtTime(end)} ({(end - start).toFixed(2)}s of {L.buf.duration.toFixed(2)}s)</div>
          </Card>
          <Busy on={P.busy} text="Rendering the trimmed clip." />
          <Err msg={P.err} />
          <ResultAudio blob={P.out} name={baseName(L.file && L.file.name, "-trimmed.wav")} />
        </>
      )}
      <PrivacyNote />
    </VStack>
  );
}

function AudioMerger() {
  const P = useProcessor();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const ref = useRef(null);

  if (!canOffline()) return <Unsupported what="the OfflineAudioContext API" />;

  const addFiles = async (files) => {
    setErr(""); setLoading(true); P.setOut(null);
    const added = [];
    for (const f of files) {
      let ac = null;
      try {
        ac = newAC();
        const ab = await f.arrayBuffer();
        const b = await new Promise((res, rej) => {
          let done = false;
          const ok = (x) => { if (!done) { done = true; res(x); } };
          const bad = (e) => { if (!done) { done = true; rej(e); } };
          const p = ac.decodeAudioData(ab, ok, bad);
          if (p && p.then) p.then(ok, bad);
        });
        added.push({ name: f.name, size: f.size, buf: b });
      } catch (e) {
        setErr(`Could not decode “${f.name}”. Your browser cannot read that format.`);
      } finally { if (ac) { try { ac.close(); } catch (e) {} } }
    }
    setItems((cur) => cur.concat(added));
    setLoading(false);
  };

  const move = (i, d) => setItems((cur) => {
    const a = cur.slice(); const j = i + d;
    if (j < 0 || j >= a.length) return cur;
    [a[i], a[j]] = [a[j], a[i]]; return a;
  });

  const merge = () => P.run(async () => {
    if (items.length < 2) throw new Error("Add at least two audio files to merge.");
    const sr = Math.max(...items.map((i) => i.buf.sampleRate));
    const ch = Math.max(...items.map((i) => i.buf.numberOfChannels));
    const total = items.reduce((a, i) => a + i.buf.duration, 0);
    const oac = newOAC(ch, total * sr + sr * 0.01, sr);
    let t = 0;
    items.forEach((it) => {
      const s = oac.createBufferSource();
      s.buffer = it.buf; s.connect(oac.destination); s.start(t);
      t += it.buf.duration;
    });
    return audioBufferToWav(await oac.startRendering());
  });

  const total = items.reduce((a, i) => a + i.buf.duration, 0);

  return (
    <VStack gap={16}>
      <input ref={ref} type="file" accept="audio/*" multiple style={{ display: "none" }}
        onChange={(e) => { const fs = Array.from(e.target.files || []); e.target.value = ""; if (fs.length) addFiles(fs); }} />
      <div onClick={() => ref.current && ref.current.click()}
        style={{ border: "1px dashed rgba(147,51,234,0.35)", background: "rgba(147,51,234,0.04)", borderRadius: 12, padding: "22px 16px", textAlign: "center", cursor: "pointer" }}>
        <div style={{ fontSize: 26, marginBottom: 6 }}>🔗</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Add audio files to join</div>
        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>Select several at once — all decoded locally</div>
      </div>
      {loading && <Notice tone="info">⏳ Decoding files…</Notice>}
      <Err msg={err} />
      {items.length > 0 && (
        <Card>
          <Label>Order ({items.length} files · {fmtTime(total)} total)</Label>
          <VStack gap={8}>
            {items.map((it, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px" }}>
                <span style={{ ...T.mono, color: C.accent, fontSize: 12 }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</span>
                <span style={{ ...T.mono, fontSize: 11, color: C.muted }}>{fmtTime(it.buf.duration)}</span>
                <Btn size="sm" variant="ghost" onClick={() => move(i, -1)}>↑</Btn>
                <Btn size="sm" variant="ghost" onClick={() => move(i, 1)}>↓</Btn>
                <Btn size="sm" variant="danger" onClick={() => setItems((c) => c.filter((_, k) => k !== i))}>✕</Btn>
              </div>
            ))}
          </VStack>
          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <Btn onClick={merge} disabled={P.busy || items.length < 2}>🔗 Merge into one WAV</Btn>
            <Btn variant="ghost" onClick={() => { setItems([]); P.setOut(null); }}>Clear all</Btn>
          </div>
        </Card>
      )}
      <Busy on={P.busy} text="Joining your files." />
      <Err msg={P.err} />
      <ResultAudio blob={P.out} name="merged.wav" />
      <PrivacyNote />
    </VStack>
  );
}

function AudioVolumeChanger() {
  const L = useAudioLoader();
  const P = useProcessor();
  const [db, setDb] = useState(6);
  const [limit, setLimit] = useState(true);
  useEffect(() => { P.setOut(null); }, [L.buf]);
  if (!canWebAudio()) return <Unsupported what="the Web Audio API" />;

  const gain = Math.pow(10, db / 20);
  const peak = L.buf ? peakOf(L.buf) : 0;
  const newPeak = peak * gain;
  const clips = newPeak > 1;

  const apply = () => P.run(async () => {
    const out = mapBuffer(L.buf, (src, dst) => {
      for (let i = 0; i < src.length; i++) {
        let v = src[i] * gain;
        if (limit) v = Math.tanh(v * 0.9) / Math.tanh(0.9);
        if (v > 1) v = 1; else if (v < -1) v = -1;
        dst[i] = v;
      }
    });
    return audioBufferToWav(out);
  });

  return (
    <VStack gap={16}>
      <AudioIn loader={L} label="Choose an audio file" />
      {L.buf && (
        <>
          <Card>
            <Slider label="Gain" value={db} onChange={setDb} min={-40} max={24} step={0.5} suffix=" dB" />
            <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
              <StatBox value={fmtDb(peak).replace(" dBFS", "")} label="Original peak (dBFS)" />
              <StatBox value={newPeak > 0 ? toDb(newPeak).toFixed(2) : "-∞"} label="New peak (dBFS)" />
              <StatBox value={`${(gain * 100).toFixed(0)}%`} label="Linear gain" />
            </div>
            <div style={{ marginTop: 14 }}>
              {clips
                ? <Notice tone="warn">⚠️ Clipping: this gain pushes the peak to {toDb(newPeak).toFixed(2)} dBFS, above the 0 dBFS ceiling. Lower the gain by about {toDb(newPeak).toFixed(1)} dB, or leave the soft limiter on.</Notice>
                : <Notice tone="ok">✓ No clipping — the loudest peak stays inside the digital ceiling.</Notice>}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 12.5, color: C.text, cursor: "pointer" }}>
              <input type="checkbox" checked={limit} onChange={(e) => setLimit(e.target.checked)} style={{ accentColor: C.accent }} />
              Soft limiter (rounds off peaks instead of hard clipping)
            </label>
            <div style={{ marginTop: 14 }}><Btn onClick={apply} disabled={P.busy}>🔊 Apply volume change</Btn></div>
          </Card>
          <Busy on={P.busy} />
          <Err msg={P.err} />
          <ResultAudio blob={P.out} name={baseName(L.file && L.file.name, "-volume.wav")} />
        </>
      )}
      <PrivacyNote />
    </VStack>
  );
}

function AudioNormalizer() {
  const L = useAudioLoader();
  const P = useProcessor();
  const [target, setTarget] = useState(-1);
  useEffect(() => { P.setOut(null); }, [L.buf]);
  if (!canWebAudio()) return <Unsupported what="the Web Audio API" />;

  const peak = L.buf ? peakOf(L.buf) : 0;
  const targetLin = Math.pow(10, target / 20);
  const gain = peak > 0 ? targetLin / peak : 1;

  const apply = () => P.run(async () => {
    if (peak <= 0) throw new Error("This file appears to be completely silent, so there is nothing to normalize.");
    const out = mapBuffer(L.buf, (src, dst) => {
      for (let i = 0; i < src.length; i++) {
        const v = src[i] * gain;
        dst[i] = v > 1 ? 1 : (v < -1 ? -1 : v);
      }
    });
    return audioBufferToWav(out);
  });

  return (
    <VStack gap={16}>
      <AudioIn loader={L} label="Choose an audio file to normalize" />
      {L.buf && (
        <>
          <Card>
            <Slider label="Target peak level" value={target} onChange={setTarget} min={-24} max={0} step={0.5} suffix=" dBFS" />
            <Grid3>
              <StatBox value={peak > 0 ? toDb(peak).toFixed(2) : "-∞"} label="Current peak dBFS" />
              <StatBox value={target.toFixed(1)} label="Target dBFS" />
              <StatBox value={`${gain >= 1 ? "+" : ""}${toDb(gain).toFixed(2)}`} label="Gain applied dB" />
            </Grid3>
            <div style={{ marginTop: 14 }}>
              <Notice tone="info">Peak normalization scales the whole file by one factor, so the balance between loud and quiet passages is untouched. -1 dBFS leaves safe headroom for later MP3 or AAC encoding.</Notice>
            </div>
            <div style={{ marginTop: 14 }}><Btn onClick={apply} disabled={P.busy}>📊 Normalize audio</Btn></div>
          </Card>
          <Busy on={P.busy} />
          <Err msg={P.err} />
          <ResultAudio blob={P.out} name={baseName(L.file && L.file.name, "-normalized.wav")} />
        </>
      )}
      <PrivacyNote />
    </VStack>
  );
}

function AudioFadeInOut() {
  const L = useAudioLoader();
  const P = useProcessor();
  const [fin, setFin] = useState(2);
  const [fout, setFout] = useState(3);
  const [curve, setCurve] = useState("exp");
  useEffect(() => { P.setOut(null); }, [L.buf]);
  if (!canWebAudio()) return <Unsupported what="the Web Audio API" />;

  const apply = () => P.run(async () => {
    const sr = L.buf.sampleRate;
    const n = L.buf.length;
    const inS = Math.min(n, Math.round(fin * sr));
    const outS = Math.min(n, Math.round(fout * sr));
    const shape = (x) => (curve === "exp" ? x * x : x);
    const out = mapBuffer(L.buf, (src, dst) => {
      for (let i = 0; i < n; i++) {
        let g = 1;
        if (inS > 0 && i < inS) g *= shape(i / inS);
        if (outS > 0 && i > n - outS) g *= shape((n - i) / outS);
        dst[i] = src[i] * g;
      }
    });
    return audioBufferToWav(out);
  });

  return (
    <VStack gap={16}>
      <AudioIn loader={L} label="Choose an audio file" />
      {L.buf && (
        <>
          <Card>
            <Waveform buffer={L.buf} height={80} />
            <div style={{ marginTop: 16 }}>
              <Slider label="Fade in" value={fin} onChange={setFin} min={0} max={Math.max(1, Math.floor(L.buf.duration / 2))} step={0.1} suffix=" s" />
            </div>
            <div style={{ marginTop: 14 }}>
              <Slider label="Fade out" value={fout} onChange={setFout} min={0} max={Math.max(1, Math.floor(L.buf.duration / 2))} step={0.1} suffix=" s" />
            </div>
            <div style={{ marginTop: 14 }}>
              <Label>Fade curve</Label>
              <SelectInput value={curve} onChange={setCurve} options={[["exp", "Exponential (smoother for music)"], ["lin", "Linear (constant rate)"]]} style={{ width: "100%" }} />
            </div>
            <div style={{ marginTop: 14 }}><Btn onClick={apply} disabled={P.busy}>🎚️ Apply fades</Btn></div>
          </Card>
          <Busy on={P.busy} />
          <Err msg={P.err} />
          <ResultAudio blob={P.out} name={baseName(L.file && L.file.name, "-faded.wav")} note="The file length is unchanged — only the amplitude at each end has been shaped." />
        </>
      )}
      <PrivacyNote />
    </VStack>
  );
}

function AudioSilenceRemover() {
  const L = useAudioLoader();
  const P = useProcessor();
  const [thr, setThr] = useState(-45);
  const [minGap, setMinGap] = useState(400);
  const [pad, setPad] = useState(80);
  const [report, setReport] = useState(null);
  useEffect(() => { P.setOut(null); setReport(null); }, [L.buf]);
  if (!canWebAudio()) return <Unsupported what="the Web Audio API" />;

  const apply = () => P.run(async () => {
    const buf = L.buf, sr = buf.sampleRate, ch = buf.numberOfChannels;
    const win = Math.max(1, Math.round(sr * 0.01));
    const nWin = Math.floor(buf.length / win);
    const thrLin = Math.pow(10, thr / 20);
    const loud = new Uint8Array(nWin);
    const chans = [];
    for (let c = 0; c < ch; c++) chans.push(buf.getChannelData(c));
    for (let w = 0; w < nWin; w++) {
      let sum = 0;
      for (let c = 0; c < ch; c++) {
        const d = chans[c];
        for (let i = 0; i < win; i++) { const v = d[w * win + i]; sum += v * v; }
      }
      loud[w] = Math.sqrt(sum / (win * ch)) >= thrLin ? 1 : 0;
    }
    const padW = Math.round(pad / 10);
    const keep = new Uint8Array(nWin);
    for (let w = 0; w < nWin; w++) {
      if (!loud[w]) continue;
      for (let k = Math.max(0, w - padW); k <= Math.min(nWin - 1, w + padW); k++) keep[k] = 1;
    }
    const minW = Math.round(minGap / 10);
    // A short silent run between kept regions stays, only long gaps go.
    let w = 0;
    while (w < nWin) {
      if (keep[w]) { w++; continue; }
      let e = w;
      while (e < nWin && !keep[e]) e++;
      if (e - w < minW) for (let k = w; k < e; k++) keep[k] = 1;
      w = e;
    }
    let kept = 0;
    for (let i = 0; i < nWin; i++) if (keep[i]) kept++;
    if (kept === 0) throw new Error("Everything fell below the threshold. Raise the threshold (a less negative dBFS value) and try again.");
    const out = makeBuffer(ch, kept * win, sr);
    for (let c = 0; c < ch; c++) {
      const src = chans[c];
      const dst = new Float32Array(kept * win);
      let o = 0;
      for (let k = 0; k < nWin; k++) {
        if (!keep[k]) continue;
        dst.set(src.subarray(k * win, k * win + win), o);
        o += win;
      }
      out.copyToChannel(dst, c);
    }
    setReport({ before: buf.duration, after: out.duration });
    return audioBufferToWav(out);
  });

  return (
    <VStack gap={16}>
      <AudioIn loader={L} label="Choose a recording to de-silence" />
      {L.buf && (
        <>
          <Card>
            <Slider label="Silence threshold" value={thr} onChange={setThr} min={-70} max={-15} step={1} suffix=" dBFS" />
            <div style={{ marginTop: 14 }}><Slider label="Shortest gap worth removing" value={minGap} onChange={setMinGap} min={100} max={3000} step={50} suffix=" ms" /></div>
            <div style={{ marginTop: 14 }}><Slider label="Padding kept around speech" value={pad} onChange={setPad} min={0} max={300} step={10} suffix=" ms" /></div>
            <div style={{ marginTop: 14 }}><Btn onClick={apply} disabled={P.busy}>🤫 Remove silence</Btn></div>
          </Card>
          <Busy on={P.busy} text="Scanning for silent windows." />
          <Err msg={P.err} />
          {report && (
            <Grid3>
              <StatBox value={fmtTime(report.before)} label="Before" />
              <StatBox value={fmtTime(report.after)} label="After" />
              <StatBox value={`${Math.max(0, 100 - (report.after / report.before) * 100).toFixed(1)}%`} label="Time removed" />
            </Grid3>
          )}
          <ResultAudio blob={P.out} name={baseName(L.file && L.file.name, "-nosilence.wav")} />
        </>
      )}
      <PrivacyNote />
    </VStack>
  );
}

function AudioSpeedChanger() {
  const L = useAudioLoader();
  const P = useProcessor();
  const [speed, setSpeed] = useState(1.5);
  const [mode, setMode] = useState("preserve");
  useEffect(() => { P.setOut(null); }, [L.buf]);
  if (!canOffline()) return <Unsupported what="the OfflineAudioContext API" />;

  const apply = () => P.run(async () => {
    if (speed === 1) throw new Error("Choose a speed other than 1x.");
    if (mode === "resample") {
      const r = await renderOffline(L.buf, { playbackRate: speed });
      return audioBufferToWav(r);
    }
    return audioBufferToWav(olaStretch(L.buf, 1 / speed));
  });

  return (
    <VStack gap={16}>
      <AudioIn loader={L} label="Choose an audio file" />
      {L.buf && (
        <>
          <Card>
            <Slider label="Playback speed" value={speed} onChange={setSpeed} min={0.25} max={4} step={0.05} suffix="x" />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                <Btn key={s} size="sm" variant={speed === s ? "primary" : "secondary"} onClick={() => setSpeed(s)}>{s}x</Btn>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <Label>Mode</Label>
              <SelectInput value={mode} onChange={setMode} style={{ width: "100%" }}
                options={[["preserve", "Preserve pitch (natural speech)"], ["resample", "Classic (pitch shifts with speed)"]]} />
            </div>
            <div style={{ marginTop: 14 }}>
              <Notice tone="info">New length: about {fmtTime(L.buf.duration / speed)} (was {fmtTime(L.buf.duration)}). Pitch-preserving mode uses overlapping cross-faded grains, so extreme settings can add a slight flutter.</Notice>
            </div>
            <div style={{ marginTop: 14 }}><Btn onClick={apply} disabled={P.busy}>⏩ Apply speed change</Btn></div>
          </Card>
          <Busy on={P.busy} text="Re-timing your audio." />
          <Err msg={P.err} />
          <ResultAudio blob={P.out} name={baseName(L.file && L.file.name, `-${speed}x.wav`)} />
        </>
      )}
      <PrivacyNote />
    </VStack>
  );
}

function AudioPitchShifter() {
  const L = useAudioLoader();
  const P = useProcessor();
  const [semi, setSemi] = useState(2);
  useEffect(() => { P.setOut(null); }, [L.buf]);
  if (!canOffline()) return <Unsupported what="the OfflineAudioContext API" />;

  const ratio = Math.pow(2, semi / 12);
  const apply = () => P.run(async () => {
    if (semi === 0) throw new Error("Choose a shift other than 0 semitones.");
    const stretched = olaStretch(L.buf, ratio);
    const r = await renderOffline(stretched, { playbackRate: ratio, lengthSec: L.buf.duration });
    return audioBufferToWav(r);
  });

  return (
    <VStack gap={16}>
      <AudioIn loader={L} label="Choose an audio file to transpose" />
      {L.buf && (
        <>
          <Card>
            <Slider label="Pitch shift" value={semi} onChange={setSemi} min={-12} max={12} step={1} suffix=" semitones" />
            <Grid3>
              <StatBox value={`${semi > 0 ? "+" : ""}${semi}`} label="Semitones" />
              <StatBox value={`${ratio.toFixed(3)}x`} label="Frequency ratio" />
              <StatBox value={fmtTime(L.buf.duration)} label="Length (unchanged)" />
            </Grid3>
            <div style={{ marginTop: 14 }}>
              <Notice tone="info">The audio is time-stretched by the pitch ratio and then resampled back, so the duration stays identical while the pitch moves. Shifts within ±6 semitones sound the most natural.</Notice>
            </div>
            <div style={{ marginTop: 14 }}><Btn onClick={apply} disabled={P.busy}>🎼 Shift pitch</Btn></div>
          </Card>
          <Busy on={P.busy} text="Stretching and resampling." />
          <Err msg={P.err} />
          <ResultAudio blob={P.out} name={baseName(L.file && L.file.name, `-pitch${semi > 0 ? "+" : ""}${semi}.wav`)} />
        </>
      )}
      <PrivacyNote />
    </VStack>
  );
}

function AudioReverser() {
  const L = useAudioLoader();
  const P = useProcessor();
  useEffect(() => { P.setOut(null); }, [L.buf]);
  if (!canWebAudio()) return <Unsupported what="the Web Audio API" />;

  const apply = () => P.run(async () => {
    const out = mapBuffer(L.buf, (src, dst) => {
      const n = src.length;
      for (let i = 0; i < n; i++) dst[i] = src[n - 1 - i];
    });
    return audioBufferToWav(out);
  });

  return (
    <VStack gap={16}>
      <AudioIn loader={L} label="Choose an audio file to reverse" />
      {L.buf && (
        <>
          <Card>
            <Waveform buffer={L.buf} height={80} />
            <div style={{ marginTop: 14 }}>
              <Notice tone="info">Reversing rewrites the decoded samples back to front. It is a lossless rearrangement — nothing is re-encoded and no quality is lost.</Notice>
            </div>
            <div style={{ marginTop: 14 }}><Btn onClick={apply} disabled={P.busy}>⏪ Reverse audio</Btn></div>
          </Card>
          <Busy on={P.busy} />
          <Err msg={P.err} />
          <ResultAudio blob={P.out} name={baseName(L.file && L.file.name, "-reversed.wav")} />
        </>
      )}
      <PrivacyNote />
    </VStack>
  );
}

function AudioCropperLoop() {
  const L = useAudioLoader();
  const P = useProcessor();
  const [range, setRange] = useState([0, 0]);
  const [reps, setReps] = useState(4);
  const [xfade, setXfade] = useState(true);
  useEffect(() => { if (L.buf) { setRange([0, Math.min(L.buf.duration, 4)]); P.setOut(null); } }, [L.buf]);
  if (!canWebAudio()) return <Unsupported what="the Web Audio API" />;

  const [start, end] = range;
  const setR = (a, b) => setRange([a, Math.max(a + 0.05, b)]);

  const build = () => P.run(async () => {
    const clip = sliceBuffer(L.buf, start, end);
    const sr = clip.sampleRate, ch = clip.numberOfChannels;
    const fadeS = xfade ? Math.min(Math.round(sr * 0.02), Math.floor(clip.length / 4)) : 0;
    const step = clip.length - fadeS;
    const total = step * reps + fadeS;
    if (total > sr * 60 * 20) throw new Error("That loop would be longer than 20 minutes. Use fewer repeats or a shorter section.");
    const out = makeBuffer(ch, total, sr);
    for (let c = 0; c < ch; c++) {
      const src = clip.getChannelData(c);
      const dst = new Float32Array(total);
      for (let r = 0; r < reps; r++) {
        const base = r * step;
        for (let i = 0; i < src.length; i++) {
          let g = 1;
          if (fadeS > 0) {
            if (i < fadeS && r > 0) g = i / fadeS;
            else if (i >= src.length - fadeS && r < reps - 1) g = (src.length - i) / fadeS;
          }
          dst[base + i] += src[i] * g;
        }
      }
      out.copyToChannel(dst, c);
    }
    return audioBufferToWav(out);
  });

  return (
    <VStack gap={16}>
      <AudioIn loader={L} label="Choose an audio file to loop" />
      {L.buf && (
        <>
          <Card>
            <Label>Drag to select the section to loop</Label>
            <Waveform buffer={L.buf} start={start} end={end} onRange={setR} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
              <div><Label>Start (s)</Label><NumField value={+start.toFixed(3)} step={0.01} min={0} max={L.buf.duration} onChange={(v) => setR(Math.max(0, Math.min(v || 0, end - 0.05)), end)} /></div>
              <div><Label>End (s)</Label><NumField value={+end.toFixed(3)} step={0.01} min={0} max={L.buf.duration} onChange={(v) => setR(start, Math.min(L.buf.duration, Math.max(v || 0, start + 0.05)))} /></div>
            </div>
            <div style={{ marginTop: 14 }}><Slider label="Repeats" value={reps} onChange={(v) => setReps(Math.round(v))} min={1} max={50} step={1} suffix="x" /></div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 12.5, cursor: "pointer" }}>
              <input type="checkbox" checked={xfade} onChange={(e) => setXfade(e.target.checked)} style={{ accentColor: C.accent }} />
              Crossfade the joins (20 ms) to remove clicks
            </label>
            <div style={{ ...T.mono, fontSize: 12, color: C.muted, marginTop: 12 }}>Loop length ≈ {fmtTime((end - start) * reps)}</div>
            <div style={{ marginTop: 14 }}><Btn onClick={build} disabled={P.busy}>🔁 Build loop</Btn></div>
          </Card>
          <Busy on={P.busy} text="Building your loop." />
          <Err msg={P.err} />
          <ResultAudio blob={P.out} name={baseName(L.file && L.file.name, "-loop.wav")} />
        </>
      )}
      <PrivacyNote />
    </VStack>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONVERT
// ══════════════════════════════════════════════════════════════════════════════

function AudioConverter() {
  const L = useAudioLoader();
  const P = useProcessor();
  const [fmt, setFmt] = useState("wav");
  const [prog, setProg] = useState(0);
  const [types, setTypes] = useState([]);
  useEffect(() => { setTypes(supportedRecordTypes()); }, []);
  useEffect(() => { P.setOut(null); setProg(0); }, [L.buf]);
  if (!canWebAudio()) return <Unsupported what="the Web Audio API" />;

  const opts = [["wav", "WAV — 16-bit PCM (always available)"]].concat(types.map(([m, l]) => [m, `${l} — browser encoder`]));

  const convert = () => P.run(async () => {
    setProg(0);
    if (fmt === "wav") return audioBufferToWav(L.buf);
    return await encodeWithRecorder(L.buf, fmt, setProg);
  });

  const ext = fmt === "wav" ? ".wav" : (fmt.indexOf("ogg") >= 0 ? ".ogg" : (fmt.indexOf("mp4") >= 0 ? ".m4a" : ".webm"));

  return (
    <VStack gap={16}>
      <AudioIn loader={L} label="Choose an audio file to convert" />
      <Notice tone="info">
        <strong>Formats your browser can actually write:</strong> WAV always (this tool builds the RIFF header itself), plus{" "}
        {types.length ? types.map(([, l]) => l).join(", ") : "no compressed formats — MediaRecorder is unavailable here"}.
        No browser exposes an MP3 encoder, and ToolsRift loads no external libraries, so MP3 export is not offered.
      </Notice>
      {L.buf && (
        <>
          <Card>
            <Label>Output format</Label>
            <SelectInput value={fmt} onChange={setFmt} options={opts} style={{ width: "100%" }} />
            {fmt !== "wav" && <div style={{ marginTop: 12 }}><Notice tone="warn">Compressed export runs through MediaRecorder in real time, so it takes about as long as the track itself ({fmtTime(L.buf.duration)}).</Notice></div>}
            <div style={{ marginTop: 14 }}><Btn onClick={convert} disabled={P.busy}>🔄 Convert</Btn></div>
            {P.busy && fmt !== "wav" && (
              <div style={{ marginTop: 14 }}>
                <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${Math.round(prog * 100)}%`, height: "100%", background: C.accent, transition: "width .2s" }} />
                </div>
                <div style={{ ...T.mono, fontSize: 11.5, color: C.muted, marginTop: 6 }}>Encoding… {Math.round(prog * 100)}%</div>
              </div>
            )}
          </Card>
          <Busy on={P.busy && fmt === "wav"} />
          <Err msg={P.err} />
          <ResultAudio blob={P.out} name={baseName(L.file && L.file.name, ext)} />
        </>
      )}
      <PrivacyNote />
    </VStack>
  );
}

function AudioToWav() {
  const L = useAudioLoader();
  const P = useProcessor();
  useEffect(() => { P.setOut(null); }, [L.buf]);
  if (!canWebAudio()) return <Unsupported what="the Web Audio API" />;
  return (
    <VStack gap={16}>
      <AudioIn loader={L} label="Choose an MP3, M4A, OGG, FLAC or WebM file" />
      {L.buf && (
        <>
          <Card>
            <Grid3>
              <StatBox value={fmtTime(L.buf.duration)} label="Duration" />
              <StatBox value={`${L.buf.sampleRate} Hz`} label="Sample rate" />
              <StatBox value={L.buf.numberOfChannels} label="Channels" />
            </Grid3>
            <div style={{ marginTop: 14 }}>
              <Notice tone="info">The WAV is written as standard RIFF/WAVE with 16-bit signed PCM at the source sample rate — roughly {fmtBytes(Math.round(L.buf.length * L.buf.numberOfChannels * 2 + 44))} once written.</Notice>
            </div>
            <div style={{ marginTop: 14 }}><Btn onClick={() => P.run(async () => audioBufferToWav(L.buf))} disabled={P.busy}>💿 Convert to WAV</Btn></div>
          </Card>
          <Busy on={P.busy} />
          <Err msg={P.err} />
          <ResultAudio blob={P.out} name={baseName(L.file && L.file.name, ".wav")} />
        </>
      )}
      <PrivacyNote />
    </VStack>
  );
}

function VideoToAudio() {
  const L = useAudioLoader();
  const P = useProcessor();
  useEffect(() => { P.setOut(null); }, [L.buf]);
  if (!canWebAudio()) return <Unsupported what="the Web Audio API" />;
  return (
    <VStack gap={16}>
      <AudioIn loader={L} accept="video/*,audio/*" label="Choose a video file (MP4, WebM, MOV)" />
      {L.err && <Notice tone="warn">If your browser cannot decode this container, try converting it to MP4 or WebM first, or open this page in a different browser — decoding support varies between browsers.</Notice>}
      {L.buf && (
        <>
          <Card>
            <Grid3>
              <StatBox value={fmtTime(L.buf.duration)} label="Audio duration" />
              <StatBox value={`${L.buf.sampleRate} Hz`} label="Sample rate" />
              <StatBox value={L.buf.numberOfChannels} label="Channels" />
            </Grid3>
            <div style={{ marginTop: 14 }}><Btn onClick={() => P.run(async () => audioBufferToWav(L.buf))} disabled={P.busy}>🎬 Extract audio as WAV</Btn></div>
          </Card>
          <Busy on={P.busy} text="Extracting the audio track." />
          <Err msg={P.err} />
          <ResultAudio blob={P.out} name={baseName(L.file && L.file.name, "-audio.wav")} />
        </>
      )}
      <PrivacyNote>Your video is read straight from disk and only its audio stream is decoded, in your browser. The video is never uploaded.</PrivacyNote>
    </VStack>
  );
}

function AudioMonoStereo() {
  const L = useAudioLoader();
  const P = useProcessor();
  const [mode, setMode] = useState("mono");
  const [bal, setBal] = useState(0);
  useEffect(() => { P.setOut(null); }, [L.buf]);
  if (!canWebAudio()) return <Unsupported what="the Web Audio API" />;

  const apply = () => P.run(async () => {
    const buf = L.buf, n = buf.length, sr = buf.sampleRate, ch = buf.numberOfChannels;
    if (mode === "mono") {
      const out = makeBuffer(1, n, sr);
      const mix = new Float32Array(n);
      for (let c = 0; c < ch; c++) {
        const d = buf.getChannelData(c);
        for (let i = 0; i < n; i++) mix[i] += d[i] / ch;
      }
      out.copyToChannel(mix, 0);
      return audioBufferToWav(out);
    }
    const out = makeBuffer(2, n, sr);
    const src = buf.getChannelData(0);
    const src2 = ch > 1 ? buf.getChannelData(1) : src;
    const lG = bal <= 0 ? 1 : 1 - bal;
    const rG = bal >= 0 ? 1 : 1 + bal;
    const l = new Float32Array(n), r = new Float32Array(n);
    for (let i = 0; i < n; i++) { l[i] = src[i] * lG; r[i] = src2[i] * rG; }
    out.copyToChannel(l, 0); out.copyToChannel(r, 1);
    return audioBufferToWav(out);
  });

  return (
    <VStack gap={16}>
      <AudioIn loader={L} label="Choose an audio file" />
      {L.buf && (
        <>
          <Card>
            <Notice tone="info">This file currently has {L.buf.numberOfChannels === 1 ? "1 channel (mono)" : `${L.buf.numberOfChannels} channels`}.</Notice>
            <div style={{ marginTop: 14 }}>
              <Label>Convert to</Label>
              <SelectInput value={mode} onChange={setMode} style={{ width: "100%" }}
                options={[["mono", "Mono — average all channels into one"], ["stereo", "Stereo — two channels"]]} />
            </div>
            {mode === "stereo" && (
              <div style={{ marginTop: 14 }}>
                <Slider label="Balance (−1 full left, +1 full right)" value={bal} onChange={setBal} min={-1} max={1} step={0.05} />
              </div>
            )}
            <div style={{ marginTop: 14 }}><Btn onClick={apply} disabled={P.busy}>🎧 Convert channels</Btn></div>
          </Card>
          <Busy on={P.busy} />
          <Err msg={P.err} />
          <ResultAudio blob={P.out} name={baseName(L.file && L.file.name, mode === "mono" ? "-mono.wav" : "-stereo.wav")}
            note={mode === "stereo" ? "Expanding mono to stereo copies the same signal to both channels — it plays correctly everywhere but cannot invent real stereo width." : null} />
        </>
      )}
      <PrivacyNote />
    </VStack>
  );
}

function AudioSampleRate() {
  const L = useAudioLoader();
  const P = useProcessor();
  const [sr, setSr] = useState("44100");
  useEffect(() => { P.setOut(null); if (L.buf) setSr(String(L.buf.sampleRate)); }, [L.buf]);
  if (!canOffline()) return <Unsupported what="the OfflineAudioContext API" />;

  const apply = () => P.run(async () => {
    const target = parseInt(sr, 10);
    if (target === L.buf.sampleRate) throw new Error("That is already the file's sample rate. Choose a different one.");
    const r = await renderOffline(L.buf, { sampleRate: target, lengthSec: L.buf.duration });
    return audioBufferToWav(r);
  });

  return (
    <VStack gap={16}>
      <AudioIn loader={L} label="Choose an audio file to resample" />
      {L.buf && (
        <>
          <Card>
            <Grid2>
              <StatBox value={`${L.buf.sampleRate} Hz`} label="Current rate" />
              <StatBox value={`${sr} Hz`} label="Target rate" />
            </Grid2>
            <div style={{ marginTop: 14 }}>
              <Label>Target sample rate</Label>
              <SelectInput value={sr} onChange={setSr} style={{ width: "100%" }}
                options={[["8000", "8 000 Hz — telephone"], ["16000", "16 000 Hz — speech / voice AI"], ["22050", "22 050 Hz — low-bandwidth"], ["32000", "32 000 Hz — broadcast"], ["44100", "44 100 Hz — CD / music"], ["48000", "48 000 Hz — video / pro audio"], ["96000", "96 000 Hz — high resolution"]]} />
            </div>
            <div style={{ marginTop: 14 }}>
              {parseInt(sr, 10) < L.buf.sampleRate
                ? <Notice tone="warn">Downsampling removes every frequency above {Math.round(parseInt(sr, 10) / 2)} Hz. That is fine for speech but audible on music with cymbals and air.</Notice>
                : <Notice tone="info">Upsampling interpolates extra samples but adds no new detail — useful only for matching a project or device requirement.</Notice>}
            </div>
            <div style={{ marginTop: 14 }}><Btn onClick={apply} disabled={P.busy}>📶 Resample</Btn></div>
          </Card>
          <Busy on={P.busy} text="Resampling." />
          <Err msg={P.err} />
          <ResultAudio blob={P.out} name={baseName(L.file && L.file.name, `-${sr}hz.wav`)} />
        </>
      )}
      <PrivacyNote />
    </VStack>
  );
}

function AudioChannelSplitter() {
  const L = useAudioLoader();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [outs, setOuts] = useState(null);
  useEffect(() => { setOuts(null); setErr(""); }, [L.buf]);
  if (!canWebAudio()) return <Unsupported what="the Web Audio API" />;

  const split = async () => {
    setBusy(true); setErr(""); setOuts(null);
    await new Promise((r) => setTimeout(r, 20));
    try {
      const buf = L.buf;
      const res = [];
      const names = ["left", "right", "ch3", "ch4", "ch5", "ch6"];
      for (let c = 0; c < buf.numberOfChannels; c++) {
        const out = makeBuffer(1, buf.length, buf.sampleRate);
        out.copyToChannel(buf.getChannelData(c), 0);
        res.push({ label: names[c] || `ch${c + 1}`, blob: audioBufferToWav(out) });
      }
      setOuts(res);
    } catch (e) { setErr("Could not split this file."); }
    setBusy(false);
  };

  return (
    <VStack gap={16}>
      <AudioIn loader={L} label="Choose a stereo audio file" />
      {L.buf && (
        <>
          <Card>
            {L.buf.numberOfChannels === 1
              ? <Notice tone="warn">This file is mono — it has a single channel, so there is nothing to split. Splitting would only produce an identical copy.</Notice>
              : <Notice tone="info">This file has {L.buf.numberOfChannels} channels. Each one will be exported as its own mono WAV at {L.buf.sampleRate} Hz, sample for sample unchanged.</Notice>}
            <div style={{ marginTop: 14 }}><Btn onClick={split} disabled={busy || L.buf.numberOfChannels < 2}>↔️ Split channels</Btn></div>
          </Card>
          <Busy on={busy} />
          <Err msg={err} />
          {outs && outs.map((o) => (
            <ResultAudio key={o.label} blob={o.blob} name={baseName(L.file && L.file.name, `-${o.label}.wav`)} note={`Channel: ${o.label}`} />
          ))}
        </>
      )}
      <PrivacyNote />
    </VStack>
  );
}

function AudioBase64() {
  const [mode, setMode] = useState("encode");
  const [b64, setB64] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [meta, setMeta] = useState(null);
  const [decoded, setDecoded] = useState(null);
  const [input, setInput] = useState("");
  const ref = useRef(null);

  const encode = (f) => {
    if (!f) return;
    setBusy(true); setErr(""); setB64(""); setMeta(null);
    const fr = new FileReader();
    fr.onload = () => { setB64(String(fr.result)); setMeta({ name: f.name, size: f.size, type: f.type || "audio/*" }); setBusy(false); };
    fr.onerror = () => { setErr("Could not read that file."); setBusy(false); };
    fr.readAsDataURL(f);
  };

  const decode = () => {
    setErr(""); setDecoded(null);
    try {
      const raw = input.trim();
      if (!raw) throw new Error("Paste a Base64 string or data URI first.");
      let mime = "audio/mpeg", payload = raw;
      const m = raw.match(/^data:([^;,]+);base64,(.*)$/s);
      if (m) { mime = m[1]; payload = m[2]; }
      const bin = atob(payload.replace(/\s+/g, ""));
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      setDecoded({ blob: new Blob([arr], { type: mime }), mime });
    } catch (e) {
      setErr("That does not look like valid Base64 audio. Check that you pasted the whole string.");
    }
  };

  const ext = decoded ? (decoded.mime.indexOf("wav") >= 0 ? ".wav" : decoded.mime.indexOf("ogg") >= 0 ? ".ogg" : decoded.mime.indexOf("webm") >= 0 ? ".webm" : decoded.mime.indexOf("mp4") >= 0 ? ".m4a" : ".mp3") : ".mp3";

  return (
    <VStack gap={16}>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn variant={mode === "encode" ? "primary" : "secondary"} onClick={() => { setMode("encode"); setErr(""); }}>Audio → Base64</Btn>
        <Btn variant={mode === "decode" ? "primary" : "secondary"} onClick={() => { setMode("decode"); setErr(""); }}>Base64 → Audio</Btn>
      </div>
      {mode === "encode" ? (
        <>
          <input ref={ref} type="file" accept="audio/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; encode(f); }} />
          <div onClick={() => ref.current && ref.current.click()}
            style={{ border: "1px dashed rgba(147,51,234,0.35)", background: "rgba(147,51,234,0.04)", borderRadius: 12, padding: "22px 16px", textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>🔤</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Choose an audio file to encode</div>
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>Read locally with FileReader — never uploaded</div>
          </div>
          <Busy on={busy} text="Encoding to Base64." />
          <Err msg={err} />
          {meta && (
            <Card>
              <Grid3>
                <StatBox value={fmtBytes(meta.size)} label="Original size" />
                <StatBox value={fmtBytes(b64.length)} label="Data URI size" />
                <StatBox value={`+${Math.round((b64.length / Math.max(1, meta.size) - 1) * 100)}%`} label="Overhead" />
              </Grid3>
              {meta.size > 500000 && <div style={{ marginTop: 12 }}><Notice tone="warn">This file is large. Data URIs are best kept under a few hundred kilobytes — bigger ones bloat your HTML or CSS badly.</Notice></div>}
              <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Label>Data URI</Label>
                <CopyBtn text={b64} />
              </div>
              <Textarea value={b64} onChange={() => {}} rows={7} mono />
            </Card>
          )}
        </>
      ) : (
        <>
          <Card>
            <Label>Paste a data URI or raw Base64</Label>
            <Textarea value={input} onChange={setInput} rows={7} mono placeholder="data:audio/mpeg;base64,SUQzB..." />
            <div style={{ marginTop: 12 }}><Btn onClick={decode}>▶ Decode to audio</Btn></div>
          </Card>
          <Err msg={err} />
          {decoded && <ResultAudio blob={decoded.blob} name={`decoded${ext}`} note={`Detected MIME type: ${decoded.mime}`} />}
        </>
      )}
      <PrivacyNote>Encoding and decoding both happen in your browser's memory. Nothing you paste or select is transmitted anywhere.</PrivacyNote>
    </VStack>
  );
}

function RingtoneMaker() {
  const L = useAudioLoader();
  const P = useProcessor();
  const [start, setStart] = useState(0);
  const [len, setLen] = useState(30);
  const [fade, setFade] = useState(true);
  useEffect(() => { if (L.buf) { setStart(0); setLen(Math.min(30, L.buf.duration)); P.setOut(null); } }, [L.buf]);
  if (!canWebAudio()) return <Unsupported what="the Web Audio API" />;

  const maxStart = L.buf ? Math.max(0, L.buf.duration - 1) : 0;
  const end = L.buf ? Math.min(L.buf.duration, start + len) : 0;

  const build = () => P.run(async () => {
    let clip = sliceBuffer(L.buf, start, end);
    if (fade) {
      const sr = clip.sampleRate, n = clip.length;
      const f = Math.min(Math.round(sr * 0.25), Math.floor(n / 4));
      clip = mapBuffer(clip, (src, dst) => {
        for (let i = 0; i < n; i++) {
          let g = 1;
          if (i < f) g *= i / f;
          if (i > n - f) g *= (n - i) / f;
          dst[i] = src[i] * g;
        }
      });
    }
    return audioBufferToWav(clip);
  });

  return (
    <VStack gap={16}>
      <AudioIn loader={L} label="Choose a song to turn into a ringtone" />
      {L.buf && (
        <>
          <Card>
            <Waveform buffer={L.buf} start={start} end={end} onRange={(a) => { setStart(Math.min(a, maxStart)); }} />
            <div style={{ marginTop: 16 }}><Slider label="Start point" value={+start.toFixed(1)} onChange={setStart} min={0} max={maxStart} step={0.1} suffix=" s" /></div>
            <div style={{ marginTop: 14 }}><Slider label="Ringtone length" value={len} onChange={setLen} min={3} max={30} step={1} suffix=" s" /></div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 12.5, cursor: "pointer" }}>
              <input type="checkbox" checked={fade} onChange={(e) => setFade(e.target.checked)} style={{ accentColor: C.accent }} />
              Add a quarter-second fade in and out
            </label>
            <div style={{ ...T.mono, fontSize: 12, color: C.muted, marginTop: 12 }}>Clip: {fmtTime(start)} → {fmtTime(end)}</div>
            <div style={{ marginTop: 14 }}><Btn onClick={build} disabled={P.busy}>📱 Make ringtone</Btn></div>
          </Card>
          <Busy on={P.busy} />
          <Err msg={P.err} />
          <ResultAudio blob={P.out} name={baseName(L.file && L.file.name, "-ringtone.wav")}
            note="Android accepts WAV files copied into the Ringtones folder. iPhone needs an M4R, so convert this WAV with your usual desktop tool before importing." />
        </>
      )}
      <PrivacyNote />
    </VStack>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  VOICE
// ══════════════════════════════════════════════════════════════════════════════

function micErrorMessage(e) {
  const n = e && e.name;
  if (n === "NotAllowedError" || n === "SecurityError") return "Microphone access was blocked. Click the padlock or camera icon in your browser's address bar, allow microphone access for this page, then reload and try again.";
  if (n === "NotFoundError" || n === "DevicesNotFoundError") return "No microphone was found. Plug in or enable an input device and try again.";
  if (n === "NotReadableError") return "Your microphone is busy — another app or tab may already be using it. Close it and try again.";
  return "Could not start the microphone. Check your browser permissions and that a microphone is connected.";
}

function VoiceRecorder() {
  const [rec, setRec] = useState(null);
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState(null);
  const [err, setErr] = useState("");
  const [secs, setSecs] = useState(0);
  const [level, setLevel] = useState(0);
  const streamRef = useRef(null); const acRef = useRef(null); const rafRef = useRef(null); const timerRef = useRef(null);

  const mimeType = (supportedRecordTypes()[0] || ["", "—"])[0];
  const label = (supportedRecordTypes()[0] || ["", "—"])[1];

  const cleanup = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (acRef.current) { try { acRef.current.close(); } catch (e) {} acRef.current = null; }
    streamRef.current = null;
  };
  useEffect(() => cleanup, []);

  if (!canMic() || !canRecord()) return <Unsupported what="microphone recording (getUserMedia and MediaRecorder)" />;

  const start = async () => {
    setErr(""); setBlob(null); setSecs(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ac = newAC(); acRef.current = ac;
      const an = ac.createAnalyser(); an.fftSize = 1024;
      ac.createMediaStreamSource(stream).connect(an);
      const data = new Uint8Array(an.fftSize);
      const tick = () => {
        an.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
        setLevel(Math.min(1, Math.sqrt(sum / data.length) * 3));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
      const r = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks = [];
      r.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      r.onstop = () => { setBlob(new Blob(chunks, { type: mimeType || "audio/webm" })); cleanup(); setLevel(0); };
      r.start();
      setRec(r); setRecording(true);
      timerRef.current = setInterval(() => setSecs((s) => s + 1), 1000);
    } catch (e) { setErr(micErrorMessage(e)); cleanup(); }
  };

  const stop = () => { if (rec && rec.state !== "inactive") rec.stop(); setRecording(false); };
  const ext = mimeType.indexOf("mp4") >= 0 ? ".m4a" : mimeType.indexOf("ogg") >= 0 ? ".ogg" : ".webm";

  return (
    <VStack gap={16}>
      <Card>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 40, fontWeight: 700, color: recording ? C.danger : C.text }}>
            {String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}
          </div>
          <div style={{ height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 5, overflow: "hidden", margin: "16px 0" }}>
            <div style={{ width: `${Math.round(level * 100)}%`, height: "100%", background: `linear-gradient(90deg,${C.success},${C.warn},${C.danger})`, transition: "width .06s" }} />
          </div>
          <Btn size="lg" variant={recording ? "danger" : "primary"} onClick={recording ? stop : start}>
            {recording ? "⏹ Stop recording" : "🎙️ Start recording"}
          </Btn>
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 12 }}>Recording format: {label}</div>
        </div>
      </Card>
      <Err msg={err} />
      {blob && <ResultAudio blob={blob} name={`recording${ext}`} />}
      <PrivacyNote>Audio captured from your microphone stays in browser memory and is written to a file only when you press download. Nothing is sent to a server.</PrivacyNote>
    </VStack>
  );
}

function TextToSpeech() {
  const [text, setText] = useState("ToolsRift turns your text into speech using the voices already installed on this device.");
  const [voices, setVoices] = useState([]);
  const [voice, setVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [vol, setVol] = useState(1);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!canSpeak()) return undefined;
    const load = () => {
      const v = window.speechSynthesis.getVoices() || [];
      setVoices(v);
      setVoice((cur) => cur || (v[0] ? v[0].name : ""));
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { try { window.speechSynthesis.cancel(); window.speechSynthesis.onvoiceschanged = null; } catch (e) {} };
  }, []);

  if (!canSpeak()) return <Unsupported what="the Web Speech API (speechSynthesis)" />;

  const speak = () => {
    const ss = window.speechSynthesis;
    ss.cancel();
    if (!text.trim()) return;
    const u = new SpeechSynthesisUtterance(text);
    const v = voices.find((x) => x.name === voice);
    if (v) { u.voice = v; u.lang = v.lang; }
    u.rate = rate; u.pitch = pitch; u.volume = vol;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    ss.speak(u);
  };
  const stop = () => { window.speechSynthesis.cancel(); setSpeaking(false); };

  const sel = voices.find((v) => v.name === voice);

  return (
    <VStack gap={16}>
      <Card>
        <Label>Text to speak</Label>
        <Textarea value={text} onChange={setText} rows={6} placeholder="Type or paste the text you want read aloud…" />
        <div style={{ marginTop: 14 }}>
          <Label>Voice ({voices.length} available on this device)</Label>
          <SelectInput value={voice} onChange={setVoice} style={{ width: "100%" }}
            options={voices.length ? voices.map((v) => [v.name, `${v.name} — ${v.lang}${v.localService ? " · local" : " · network"}`]) : [["", "No voices reported by this browser yet"]]} />
        </div>
        <div style={{ marginTop: 14 }}><Slider label="Speaking rate" value={rate} onChange={setRate} min={0.5} max={2} step={0.05} suffix="x" /></div>
        <div style={{ marginTop: 14 }}><Slider label="Pitch" value={pitch} onChange={setPitch} min={0} max={2} step={0.05} /></div>
        <div style={{ marginTop: 14 }}><Slider label="Volume" value={vol} onChange={setVol} min={0} max={1} step={0.05} /></div>
        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <Btn onClick={speak}>🗣️ Speak</Btn>
          <Btn variant="secondary" onClick={stop} disabled={!speaking}>⏹ Stop</Btn>
        </div>
      </Card>
      {sel && !sel.localService && <Notice tone="warn">The voice “{sel.name}” is marked as a network voice, which means this browser may send the text to an online voice service to synthesise it. Pick a voice labelled “local” to keep sensitive text entirely on your device.</Notice>}
      <Notice tone="info">Speech is produced by the voices installed on your operating system, so the list differs between Windows, macOS, Android and iOS. The Web Speech API does not expose a downloadable audio stream, so no browser tool can save the result as a file.</Notice>
    </VStack>
  );
}

function AudioPlaybackTester() {
  const [playing, setPlaying] = useState("");
  const [devices, setDevices] = useState([]);
  const [vol, setVol] = useState(0.15);
  const acRef = useRef(null); const nodesRef = useRef(null);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((d) => setDevices(d.filter((x) => x.kind === "audiooutput"))).catch(() => {});
    }
    return () => { if (acRef.current) { try { acRef.current.close(); } catch (e) {} } };
  }, []);

  if (!canWebAudio()) return <Unsupported what="the Web Audio API" />;

  const stop = () => {
    if (nodesRef.current) {
      try { nodesRef.current.osc.stop(); } catch (e) {}
      nodesRef.current = null;
    }
    setPlaying("");
  };

  const play = (side) => {
    stop();
    const ac = acRef.current || (acRef.current = newAC());
    if (ac.state === "suspended") ac.resume();
    const osc = ac.createOscillator();
    osc.type = "sine"; osc.frequency.value = 440;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, Math.min(0.3, vol)), ac.currentTime + 0.08);
    const merger = ac.createChannelMerger(2);
    const silent = ac.createGain(); silent.gain.value = 0;
    osc.connect(g);
    if (side === "left") { g.connect(merger, 0, 0); silent.connect(merger, 0, 1); }
    else if (side === "right") { silent.connect(merger, 0, 0); g.connect(merger, 0, 1); }
    else { g.connect(merger, 0, 0); g.connect(merger, 0, 1); }
    osc.connect(silent);
    merger.connect(ac.destination);
    osc.start();
    osc.onended = () => setPlaying("");
    nodesRef.current = { osc, g };
    setPlaying(side);
    // auto-stop after 3 seconds with a gentle release
    setTimeout(() => {
      if (nodesRef.current && nodesRef.current.osc === osc) {
        try { g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.1); osc.stop(ac.currentTime + 0.15); } catch (e) {}
        nodesRef.current = null;
      }
    }, 3000);
  };

  return (
    <VStack gap={16}>
      <Notice tone="warn">Turn your system volume down before you start, then raise it gradually. The tone is capped well below full scale, but sudden loud tones are unpleasant on headphones.</Notice>
      <Card>
        <Slider label="Test tone volume (capped)" value={vol} onChange={setVol} min={0.02} max={0.3} step={0.01} />
        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <Btn variant={playing === "left" ? "primary" : "secondary"} onClick={() => play("left")}>◀ Left channel</Btn>
          <Btn variant={playing === "both" ? "primary" : "secondary"} onClick={() => play("both")}>◀▶ Both</Btn>
          <Btn variant={playing === "right" ? "primary" : "secondary"} onClick={() => play("right")}>Right channel ▶</Btn>
          <Btn variant="danger" onClick={stop} disabled={!playing}>⏹ Stop</Btn>
        </div>
        <div style={{ fontSize: 12.5, color: C.muted, marginTop: 14, lineHeight: 1.6 }}>
          Each test plays a 440 Hz sine for about three seconds. If the left button sounds on the right, your cable or system balance is swapped; if one side is silent, that driver or channel has a fault.
        </div>
      </Card>
      <Card>
        <Label>Output devices your browser can see</Label>
        {devices.length ? (
          <VStack gap={6}>
            {devices.map((d, i) => (
              <div key={d.deviceId || i} style={{ ...T.mono, fontSize: 12, color: C.text }}>🔈 {d.label || `Output device ${i + 1} (name hidden until permission is granted)`}</div>
            ))}
          </VStack>
        ) : <div style={{ fontSize: 12.5, color: C.muted }}>No output devices reported. Browsers often hide this list entirely — change your default output in your system sound settings instead.</div>}
      </Card>
    </VStack>
  );
}

function MicrophoneTester() {
  const [on, setOn] = useState(false);
  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  const [err, setErr] = useState("");
  const [devices, setDevices] = useState([]);
  const streamRef = useRef(null); const acRef = useRef(null); const rafRef = useRef(null);

  const cleanup = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (acRef.current) { try { acRef.current.close(); } catch (e) {} acRef.current = null; }
    streamRef.current = null;
  };
  useEffect(() => cleanup, []);

  if (!canMic()) return <Unsupported what="microphone access (getUserMedia)" />;

  const start = async () => {
    setErr(""); setPeak(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ac = newAC(); acRef.current = ac;
      const an = ac.createAnalyser(); an.fftSize = 2048;
      ac.createMediaStreamSource(stream).connect(an);
      const data = new Uint8Array(an.fftSize);
      const tick = () => {
        an.getByteTimeDomainData(data);
        let sum = 0, mx = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
          if (Math.abs(v) > mx) mx = Math.abs(v);
        }
        const rms = Math.sqrt(sum / data.length);
        setLevel(Math.min(1, rms * 4));
        setPeak((p) => Math.max(p, mx));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
      setOn(true);
      if (navigator.mediaDevices.enumerateDevices) {
        const d = await navigator.mediaDevices.enumerateDevices();
        setDevices(d.filter((x) => x.kind === "audioinput"));
      }
    } catch (e) { setErr(micErrorMessage(e)); cleanup(); setOn(false); }
  };
  const stop = () => { cleanup(); setOn(false); setLevel(0); };

  return (
    <VStack gap={16}>
      <Card>
        <Label>Live input level</Label>
        <div style={{ height: 20, background: "rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden" }}>
          <div style={{ width: `${Math.round(level * 100)}%`, height: "100%", background: `linear-gradient(90deg,${C.success},${C.warn},${C.danger})`, transition: "width .05s" }} />
        </div>
        <Grid2>
          <StatBox value={`${Math.round(level * 100)}%`} label="Current level" />
          <StatBox value={peak > 0 ? `${toDb(peak).toFixed(1)} dB` : "—"} label="Peak since start" />
        </Grid2>
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <Btn onClick={on ? stop : start} variant={on ? "danger" : "primary"}>{on ? "⏹ Stop test" : "🎤 Start test"}</Btn>
        </div>
      </Card>
      <Err msg={err} />
      {devices.length > 0 && (
        <Card>
          <Label>Input devices</Label>
          <VStack gap={6}>
            {devices.map((d, i) => <div key={d.deviceId || i} style={{ ...T.mono, fontSize: 12 }}>🎤 {d.label || `Input device ${i + 1}`}</div>)}
          </VStack>
        </Card>
      )}
      <PrivacyNote>Nothing is recorded. The live signal is analysed to draw the meter and then discarded, so this test is safe to run before a confidential call.</PrivacyNote>
    </VStack>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ANALYZE & GENERATE
// ══════════════════════════════════════════════════════════════════════════════

function WaveformViewer() {
  const L = useAudioLoader();
  if (!canWebAudio()) return <Unsupported what="the Web Audio API" />;
  const peak = L.buf ? peakOf(L.buf) : 0;
  return (
    <VStack gap={16}>
      <AudioIn loader={L} label="Choose an audio file to visualise" />
      {L.buf && (
        <>
          <Card>
            <Label>Waveform (channel 1)</Label>
            <Waveform buffer={L.buf} height={140} />
          </Card>
          <Grid3>
            <StatBox value={fmtTime(L.buf.duration)} label="Duration" />
            <StatBox value={`${L.buf.sampleRate} Hz`} label="Sample rate" />
            <StatBox value={L.buf.numberOfChannels} label="Channels" />
          </Grid3>
          <Grid3>
            <StatBox value={peak > 0 ? `${toDb(peak).toFixed(2)}` : "-∞"} label="Peak dBFS" />
            <StatBox value={L.buf.length.toLocaleString()} label="Samples" />
            <StatBox value={fmtBytes(L.file && L.file.size)} label="File size" />
          </Grid3>
          {peak >= 0.999 && <Notice tone="warn">The peak reaches digital full scale, which often means the file is already clipped or has been limited hard.</Notice>}
        </>
      )}
      <PrivacyNote />
    </VStack>
  );
}

function AudioSpectrumAnalyzer() {
  const L = useAudioLoader();
  const [src, setSrc] = useState("mic");
  const [running, setRunning] = useState(false);
  const [fft, setFft] = useState("2048");
  const [err, setErr] = useState("");
  const cv = useRef(null);
  const acRef = useRef(null); const rafRef = useRef(null); const streamRef = useRef(null); const nodeRef = useRef(null);

  const cleanup = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (nodeRef.current) { try { nodeRef.current.stop(); } catch (e) {} nodeRef.current = null; }
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (acRef.current) { try { acRef.current.close(); } catch (e) {} acRef.current = null; }
    streamRef.current = null;
  };
  useEffect(() => cleanup, []);

  if (!canWebAudio()) return <Unsupported what="the Web Audio API" />;

  const draw = (an) => {
    const bins = new Uint8Array(an.frequencyBinCount);
    const loop = () => {
      an.getByteFrequencyData(bins);
      const c = cv.current;
      if (c) {
        const dpr = window.devicePixelRatio || 1;
        const w = Math.max(160, c.clientWidth), h = 200;
        c.width = w * dpr; c.height = h * dpr;
        const ctx = c.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "rgba(255,255,255,0.02)"; ctx.fillRect(0, 0, w, h);
        const n = Math.min(bins.length, 256);
        const bw = w / n;
        for (let i = 0; i < n; i++) {
          const v = bins[Math.floor((i / n) * bins.length)] / 255;
          const bh = v * (h - 4);
          const g = ctx.createLinearGradient(0, h, 0, h - bh);
          g.addColorStop(0, "#7E22CE"); g.addColorStop(1, "#E879F9");
          ctx.fillStyle = g;
          ctx.fillRect(i * bw, h - bh, Math.max(1, bw - 1), bh);
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
  };

  const start = async () => {
    setErr(""); cleanup();
    try {
      const ac = newAC(); acRef.current = ac;
      const an = ac.createAnalyser();
      an.fftSize = parseInt(fft, 10);
      an.smoothingTimeConstant = 0.8;
      if (src === "mic") {
        if (!canMic()) throw Object.assign(new Error("nomic"), { name: "NotFoundError" });
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        ac.createMediaStreamSource(stream).connect(an);
      } else {
        if (!L.buf) throw new Error("Load an audio file first, then press Start.");
        const s = ac.createBufferSource();
        s.buffer = L.buf;
        s.connect(an); an.connect(ac.destination);
        s.onended = () => { setRunning(false); cleanup(); };
        s.start();
        nodeRef.current = s;
      }
      setRunning(true);
      draw(an);
    } catch (e) {
      setErr(e && e.message && e.message.indexOf("Load an audio") === 0 ? e.message : micErrorMessage(e));
      cleanup(); setRunning(false);
    }
  };
  const stop = () => { cleanup(); setRunning(false); };

  return (
    <VStack gap={16}>
      <Card>
        <Grid2>
          <div>
            <Label>Source</Label>
            <SelectInput value={src} onChange={(v) => { stop(); setSrc(v); }} style={{ width: "100%" }}
              options={[["mic", "Microphone (live)"], ["file", "Audio file"]]} />
          </div>
          <div>
            <Label>FFT size</Label>
            <SelectInput value={fft} onChange={setFft} style={{ width: "100%" }}
              options={[["512", "512 — fastest response"], ["1024", "1024"], ["2048", "2048 — balanced"], ["4096", "4096"], ["8192", "8192 — finest detail"]]} />
          </div>
        </Grid2>
        {src === "file" && <div style={{ marginTop: 14 }}><AudioIn loader={L} label="Choose an audio file to analyse" /></div>}
        <div style={{ marginTop: 16 }}>
          <Btn onClick={running ? stop : start} variant={running ? "danger" : "primary"}>{running ? "⏹ Stop" : "▶ Start analyser"}</Btn>
        </div>
      </Card>
      <Err msg={err} />
      <Card>
        <Label>Live spectrum — low frequencies left, high right</Label>
        <canvas ref={cv} style={{ width: "100%", height: 200, display: "block", borderRadius: 10, border: `1px solid ${C.border}` }} />
      </Card>
      <PrivacyNote>Microphone audio is passed to an analyser node purely to draw the display. It is never recorded, stored or transmitted.</PrivacyNote>
    </VStack>
  );
}

function BpmDetector() {
  const L = useAudioLoader();
  const P = useProcessor();
  const [bpm, setBpm] = useState(null);
  useEffect(() => { setBpm(null); }, [L.buf]);
  if (!canOffline()) return <Unsupported what="the OfflineAudioContext API" />;

  const detect = () => P.run(async () => {
    const sr = 8000;
    const oac = newOAC(1, L.buf.duration * sr, sr);
    const s = oac.createBufferSource(); s.buffer = L.buf;
    const lp = oac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 160; lp.Q.value = 1;
    s.connect(lp); lp.connect(oac.destination); s.start();
    const r = await oac.startRendering();
    const d = r.getChannelData(0);
    const win = Math.round(sr * 0.01);
    const n = Math.floor(d.length / win);
    if (n < 200) throw new Error("This clip is too short for a reliable tempo estimate — try at least 10 seconds of music.");
    const env = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < win; j++) { const v = d[i * win + j]; sum += v * v; }
      env[i] = Math.sqrt(sum / win);
    }
    const on = new Float32Array(n);
    for (let i = 1; i < n; i++) on[i] = Math.max(0, env[i] - env[i - 1]);
    let mean = 0;
    for (let i = 0; i < n; i++) mean += on[i];
    mean /= n;
    for (let i = 0; i < n; i++) on[i] -= mean;
    let best = -Infinity, bestBpm = 0;
    for (let b = 60; b <= 200; b += 0.25) {
      const lag = Math.round(60 / b / 0.01);
      if (lag < 2 || lag >= n - 10) continue;
      let sum = 0;
      for (let i = 0; i + lag < n; i++) sum += on[i] * on[i + lag];
      sum /= (n - lag);
      if (sum > best) { best = sum; bestBpm = b; }
    }
    if (!bestBpm) throw new Error("No steady beat could be found in this file.");
    setBpm(bestBpm);
    return null;
  });

  return (
    <VStack gap={16}>
      <AudioIn loader={L} label="Choose a music file" />
      {L.buf && (
        <>
          <Card>
            <Btn onClick={detect} disabled={P.busy}>🥁 Detect BPM</Btn>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 12, lineHeight: 1.6 }}>
              The track is downsampled and low-pass filtered to isolate the kick and bass, then the onset energy envelope is autocorrelated to find the strongest repeating interval.
            </div>
          </Card>
          <Busy on={P.busy} text="Analysing onsets." />
          <Err msg={P.err} />
          {bpm != null && (
            <>
              <BigResult value={bpm.toFixed(1)} label="Estimated BPM" />
              <Grid2>
                <StatBox value={(bpm / 2).toFixed(1)} label="Half time" />
                <StatBox value={(bpm * 2).toFixed(1)} label="Double time" />
              </Grid2>
              <Notice tone="info">Autocorrelation cannot tell a beat from every second beat, so compare these three values and pick whichever matches how you would tap along.</Notice>
            </>
          )}
        </>
      )}
      <PrivacyNote />
    </VStack>
  );
}

function AudioMetadataViewer() {
  const L = useAudioLoader();
  const [wav, setWav] = useState(null);
  useEffect(() => {
    setWav(null);
    if (!L.file) return;
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const v = new DataView(fr.result);
        const tag = String.fromCharCode(v.getUint8(0), v.getUint8(1), v.getUint8(2), v.getUint8(3));
        if (tag !== "RIFF") return;
        const fmts = { 1: "PCM (uncompressed)", 3: "IEEE float", 6: "A-law", 7: "µ-law", 65534: "WAVE_FORMAT_EXTENSIBLE" };
        setWav({
          format: fmts[v.getUint16(20, true)] || `code ${v.getUint16(20, true)}`,
          bits: v.getUint16(34, true),
          byteRate: v.getUint32(28, true),
        });
      } catch (e) { /* not a readable WAV header */ }
    };
    fr.readAsArrayBuffer(L.file.slice(0, 64));
  }, [L.file]);

  if (!canWebAudio()) return <Unsupported what="the Web Audio API" />;
  const b = L.buf;
  const rows = b ? [
    ["File name", L.file.name],
    ["Reported MIME type", L.file.type || "not reported by the OS"],
    ["File size", `${fmtBytes(L.file.size)} (${L.file.size.toLocaleString()} bytes)`],
    ["Duration", `${fmtTime(b.duration)} (${b.duration.toFixed(3)} s)`],
    ["Channels", b.numberOfChannels === 1 ? "1 (mono)" : b.numberOfChannels === 2 ? "2 (stereo)" : String(b.numberOfChannels)],
    ["Sample rate", `${b.sampleRate.toLocaleString()} Hz`],
    ["Total samples per channel", b.length.toLocaleString()],
    ["Average bitrate (estimated)", `${Math.round((L.file.size * 8) / b.duration / 1000)} kbps`],
    ["Peak level", fmtDb(peakOf(b))],
    ["Bit depth", wav ? `${wav.bits}-bit` : "not exposed — the Web Audio API decodes everything to 32-bit float"],
    ["Encoding", wav ? wav.format : "compressed or non-RIFF container"],
  ] : [];

  return (
    <VStack gap={16}>
      <AudioIn loader={L} label="Choose an audio file to inspect" />
      {b && (
        <>
          <DataTable columns={["Property", "Value"]} rows={rows} />
          {!wav && <Notice tone="info">Bit depth and PCM encoding are read directly from the RIFF header, so they are only available for WAV files. Every other format is decoded to 32-bit float before this tool can see it.</Notice>}
        </>
      )}
      <PrivacyNote />
    </VStack>
  );
}

function ToneGenerator() {
  const [type, setType] = useState("sine");
  const [freq, setFreq] = useState(440);
  const [vol, setVol] = useState(0.15);
  const [dur, setDur] = useState(5);
  const [playing, setPlaying] = useState(false);
  const P = useProcessor();
  const acRef = useRef(null); const nRef = useRef(null);
  useEffect(() => () => { if (nRef.current) { try { nRef.current.osc.stop(); } catch (e) {} } if (acRef.current) { try { acRef.current.close(); } catch (e) {} } }, []);

  if (!canWebAudio()) return <Unsupported what="the Web Audio API" />;

  const stop = () => {
    if (nRef.current) {
      const { osc, g, ac } = nRef.current;
      try { g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.08); osc.stop(ac.currentTime + 0.12); } catch (e) {}
      nRef.current = null;
    }
    setPlaying(false);
  };
  const play = () => {
    stop();
    const ac = acRef.current || (acRef.current = newAC());
    if (ac.state === "suspended") ac.resume();
    const osc = ac.createOscillator(); osc.type = type; osc.frequency.value = freq;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, Math.min(0.4, vol)), ac.currentTime + 0.05);
    osc.connect(g); g.connect(ac.destination); osc.start();
    nRef.current = { osc, g, ac };
    setPlaying(true);
  };

  const exportWav = () => P.run(async () => {
    const sr = 44100, n = Math.round(dur * sr);
    const buf = makeBuffer(1, n, sr);
    const d = new Float32Array(n);
    const amp = Math.min(0.9, Math.max(0.01, vol * 2));
    for (let i = 0; i < n; i++) {
      const t = (i / sr) * freq;
      const ph = t - Math.floor(t);
      let v;
      if (type === "sine") v = Math.sin(2 * Math.PI * ph);
      else if (type === "square") v = ph < 0.5 ? 1 : -1;
      else if (type === "sawtooth") v = 2 * ph - 1;
      else v = 4 * Math.abs(ph - 0.5) - 1;
      let env = 1;
      const f = Math.round(sr * 0.01);
      if (i < f) env = i / f;
      if (i > n - f) env = (n - i) / f;
      d[i] = v * amp * env;
    }
    buf.copyToChannel(d, 0);
    return audioBufferToWav(buf);
  });

  return (
    <VStack gap={16}>
      <Card>
        <Label>Waveform</Label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[["sine", "∿ Sine"], ["square", "⊓ Square"], ["sawtooth", "◺ Sawtooth"], ["triangle", "△ Triangle"]].map(([v, l]) => (
            <Btn key={v} size="sm" variant={type === v ? "primary" : "secondary"} onClick={() => setType(v)}>{l}</Btn>
          ))}
        </div>
        <div style={{ marginTop: 16 }}><Slider label="Frequency" value={freq} onChange={(v) => setFreq(Math.round(v))} min={20} max={20000} step={1} suffix=" Hz" /></div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          {[100, 440, 1000, 4000, 10000].map((f) => <Btn key={f} size="sm" variant="ghost" onClick={() => setFreq(f)}>{f} Hz</Btn>)}
        </div>
        <div style={{ marginTop: 16 }}><Slider label="Volume (capped for safety)" value={vol} onChange={setVol} min={0.01} max={0.4} step={0.01} /></div>
        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <Btn onClick={playing ? stop : play} variant={playing ? "danger" : "primary"}>{playing ? "⏹ Stop tone" : "▶ Play tone"}</Btn>
        </div>
      </Card>
      <Card>
        <Slider label="Export length" value={dur} onChange={(v) => setDur(Math.round(v))} min={1} max={120} step={1} suffix=" s" />
        <div style={{ marginTop: 14 }}><Btn variant="secondary" onClick={exportWav} disabled={P.busy}>⬇ Export tone as WAV</Btn></div>
      </Card>
      <Busy on={P.busy} />
      <Err msg={P.err} />
      <ResultAudio blob={P.out} name={`tone-${freq}hz-${type}.wav`} />
      <Notice tone="warn">Start with your system volume low. Sustained tones, especially at high frequencies, are fatiguing and can be uncomfortable on headphones.</Notice>
    </VStack>
  );
}

function makeNoise(kind, n) {
  const d = new Float32Array(n);
  if (kind === "white") {
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  } else if (kind === "pink") {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.016898;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  } else {
    let last = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    }
  }
  let p = 0;
  for (let i = 0; i < n; i++) { const a = Math.abs(d[i]); if (a > p) p = a; }
  if (p > 0) for (let i = 0; i < n; i++) d[i] /= p;
  return d;
}

function NoiseGenerator() {
  const [kind, setKind] = useState("pink");
  const [vol, setVol] = useState(0.15);
  const [dur, setDur] = useState(30);
  const [playing, setPlaying] = useState(false);
  const P = useProcessor();
  const acRef = useRef(null); const nRef = useRef(null);
  useEffect(() => () => { if (nRef.current) { try { nRef.current.src.stop(); } catch (e) {} } if (acRef.current) { try { acRef.current.close(); } catch (e) {} } }, []);

  if (!canWebAudio()) return <Unsupported what="the Web Audio API" />;

  const stop = () => {
    if (nRef.current) { try { nRef.current.src.stop(); } catch (e) {} nRef.current = null; }
    setPlaying(false);
  };
  const play = () => {
    stop();
    const ac = acRef.current || (acRef.current = newAC());
    if (ac.state === "suspended") ac.resume();
    const n = Math.round(ac.sampleRate * 3);
    const b = ac.createBuffer(1, n, ac.sampleRate);
    b.copyToChannel(makeNoise(kind, n), 0);
    const src = ac.createBufferSource(); src.buffer = b; src.loop = true;
    const g = ac.createGain(); g.gain.value = Math.min(0.4, vol);
    src.connect(g); g.connect(ac.destination); src.start();
    nRef.current = { src, g };
    setPlaying(true);
  };

  const exportWav = () => P.run(async () => {
    const sr = 44100, n = Math.round(dur * sr);
    const buf = makeBuffer(1, n, sr);
    const d = makeNoise(kind, n);
    const amp = Math.min(0.9, vol * 3);
    for (let i = 0; i < n; i++) d[i] *= amp;
    buf.copyToChannel(d, 0);
    return audioBufferToWav(buf);
  });

  return (
    <VStack gap={16}>
      <Card>
        <Label>Noise colour</Label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[["white", "⚪ White — bright hiss"], ["pink", "🌸 Pink — balanced, rain-like"], ["brown", "🟤 Brown — deep, surf-like"]].map(([v, l]) => (
            <Btn key={v} size="sm" variant={kind === v ? "primary" : "secondary"} onClick={() => { setKind(v); if (playing) setTimeout(play, 0); }}>{l}</Btn>
          ))}
        </div>
        <div style={{ marginTop: 16 }}><Slider label="Volume (capped)" value={vol} onChange={(v) => { setVol(v); if (nRef.current) nRef.current.g.gain.value = Math.min(0.4, v); }} min={0.01} max={0.4} step={0.01} /></div>
        <div style={{ marginTop: 16 }}><Btn onClick={playing ? stop : play} variant={playing ? "danger" : "primary"}>{playing ? "⏹ Stop" : "▶ Play continuously"}</Btn></div>
      </Card>
      <Card>
        <Slider label="Export length" value={dur} onChange={(v) => setDur(Math.round(v))} min={5} max={300} step={5} suffix=" s" />
        <div style={{ marginTop: 14 }}><Btn variant="secondary" onClick={exportWav} disabled={P.busy}>⬇ Export noise as WAV</Btn></div>
        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 10 }}>A 300-second stereo-free WAV is roughly 26 MB — generation runs entirely on your device.</div>
      </Card>
      <Busy on={P.busy} text="Generating noise." />
      <Err msg={P.err} />
      <ResultAudio blob={P.out} name={`${kind}-noise-${dur}s.wav`} />
    </VStack>
  );
}

const HEARING_STEPS = [500, 1000, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 15000, 16000, 17000, 18000, 19000, 20000];

function HearingTest() {
  const [idx, setIdx] = useState(-1);
  const [result, setResult] = useState(null);
  const [vol, setVol] = useState(0.1);
  const acRef = useRef(null); const nRef = useRef(null);
  useEffect(() => () => { stopTone(); if (acRef.current) { try { acRef.current.close(); } catch (e) {} } }, []);

  if (!canWebAudio()) return <Unsupported what="the Web Audio API" />;

  function stopTone() {
    if (nRef.current) {
      const { osc, g, ac } = nRef.current;
      try { g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.08); osc.stop(ac.currentTime + 0.12); } catch (e) {}
      nRef.current = null;
    }
  }
  const playAt = (i) => {
    stopTone();
    const ac = acRef.current || (acRef.current = newAC());
    if (ac.state === "suspended") ac.resume();
    const osc = ac.createOscillator(); osc.type = "sine"; osc.frequency.value = HEARING_STEPS[i];
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, Math.min(0.2, vol)), ac.currentTime + 0.1);
    osc.connect(g); g.connect(ac.destination); osc.start();
    nRef.current = { osc, g, ac };
  };

  const begin = () => { setResult(null); setIdx(0); playAt(0); };
  const heard = () => {
    const next = idx + 1;
    if (next >= HEARING_STEPS.length) { stopTone(); setResult(HEARING_STEPS[HEARING_STEPS.length - 1]); setIdx(-1); return; }
    setIdx(next); playAt(next);
  };
  const notHeard = () => { stopTone(); setResult(idx > 0 ? HEARING_STEPS[idx - 1] : 0); setIdx(-1); };

  return (
    <VStack gap={16}>
      <Notice tone="danger">
        <strong>Not a medical device.</strong> This is a curiosity tool, not a hearing test, diagnosis or screening instrument. Consumer headphones, browser volume and background noise all affect the result. If you are concerned about your hearing, see a qualified audiologist.
      </Notice>
      <Notice tone="warn">Turn your system volume right down before you press Start, then raise it only until the first tone is comfortably audible. Never turn the volume up to chase a tone you cannot hear.</Notice>
      <Card>
        <Slider label="Tone volume (capped)" value={vol} onChange={(v) => { setVol(v); if (nRef.current) { try { nRef.current.g.gain.value = Math.min(0.2, v); } catch (e) {} } }} min={0.01} max={0.2} step={0.01} />
        {idx < 0 ? (
          <div style={{ marginTop: 16 }}><Btn size="lg" onClick={begin}>👂 Start the sweep</Btn></div>
        ) : (
          <div style={{ marginTop: 16 }}>
            <BigResult value={`${HEARING_STEPS[idx] >= 1000 ? (HEARING_STEPS[idx] / 1000).toFixed(1) + " kHz" : HEARING_STEPS[idx] + " Hz"}`} label={`Step ${idx + 1} of ${HEARING_STEPS.length}`} />
            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <Btn onClick={heard}>✓ I can hear it — next</Btn>
              <Btn variant="secondary" onClick={notHeard}>✕ I cannot hear it</Btn>
              <Btn variant="ghost" onClick={() => { stopTone(); setIdx(-1); }}>Cancel</Btn>
            </div>
          </div>
        )}
        {result != null && (
          <div style={{ marginTop: 16 }}>
            <BigResult value={result >= 1000 ? `${(result / 1000).toFixed(1)} kHz` : `${result} Hz`} label="Highest tone you reported hearing" />
            <div style={{ marginTop: 12 }}>
              <Notice tone="info">Many headphones and laptop speakers roll off before 18 kHz, so the equipment may well be the limit rather than your ears. Treat this as a fun benchmark, nothing more.</Notice>
            </div>
          </div>
        )}
      </Card>
      <PrivacyNote>Tones are synthesised locally with an oscillator. No audio is recorded and no result is stored or sent anywhere.</PrivacyNote>
    </VStack>
  );
}

function BinauralBeatGenerator() {
  const [carrier, setCarrier] = useState(200);
  const [beat, setBeat] = useState(6);
  const [vol, setVol] = useState(0.1);
  const [playing, setPlaying] = useState(false);
  const acRef = useRef(null); const nRef = useRef(null);
  useEffect(() => () => { stopAll(); if (acRef.current) { try { acRef.current.close(); } catch (e) {} } }, []);

  if (!canWebAudio()) return <Unsupported what="the Web Audio API" />;

  function stopAll() {
    if (nRef.current) {
      const { l, r, g, ac } = nRef.current;
      try {
        g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.3);
        l.stop(ac.currentTime + 0.35); r.stop(ac.currentTime + 0.35);
      } catch (e) {}
      nRef.current = null;
    }
    setPlaying(false);
  }
  const play = () => {
    stopAll();
    const ac = acRef.current || (acRef.current = newAC());
    if (ac.state === "suspended") ac.resume();
    const l = ac.createOscillator(); l.type = "sine"; l.frequency.value = carrier;
    const r = ac.createOscillator(); r.type = "sine"; r.frequency.value = carrier + beat;
    const merger = ac.createChannelMerger(2);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, Math.min(0.2, vol)), ac.currentTime + 1.2);
    l.connect(merger, 0, 0); r.connect(merger, 0, 1);
    merger.connect(g); g.connect(ac.destination);
    l.start(); r.start();
    nRef.current = { l, r, g, ac };
    setPlaying(true);
  };

  const bands = [["Delta 1–4 Hz", 2], ["Theta 4–8 Hz", 6], ["Alpha 8–13 Hz", 10], ["Beta 13–30 Hz", 18]];

  return (
    <VStack gap={16}>
      <Notice tone="danger">
        <strong>Not a medical device.</strong> Binaural beats are offered here for general interest and experimentation only. They are not a treatment, therapy or diagnostic tool, the research on their effects is mixed, and nothing here should replace medical advice.
      </Notice>
      <Notice tone="warn">Headphones are required — on speakers both tones reach both ears and the effect disappears. Turn your volume down before pressing Play; the tones fade in gently over about a second.</Notice>
      <Card>
        <Slider label="Carrier frequency (left ear)" value={carrier} onChange={(v) => { setCarrier(Math.round(v)); if (nRef.current) { nRef.current.l.frequency.value = Math.round(v); nRef.current.r.frequency.value = Math.round(v) + beat; } }} min={80} max={500} step={1} suffix=" Hz" />
        <div style={{ marginTop: 16 }}>
          <Slider label="Beat frequency (difference between ears)" value={beat} onChange={(v) => { setBeat(v); if (nRef.current) nRef.current.r.frequency.value = carrier + v; }} min={0.5} max={30} step={0.5} suffix=" Hz" />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          {bands.map(([l, v]) => <Btn key={l} size="sm" variant={beat === v ? "primary" : "ghost"} onClick={() => { setBeat(v); if (nRef.current) nRef.current.r.frequency.value = carrier + v; }}>{l}</Btn>)}
        </div>
        <div style={{ marginTop: 16 }}><Slider label="Volume (capped)" value={vol} onChange={(v) => { setVol(v); if (nRef.current) { try { nRef.current.g.gain.value = Math.min(0.2, v); } catch (e) {} } }} min={0.01} max={0.2} step={0.01} /></div>
        <Grid2>
          <StatBox value={`${carrier} Hz`} label="Left ear" />
          <StatBox value={`${(carrier + beat).toFixed(1)} Hz`} label="Right ear" />
        </Grid2>
        <div style={{ marginTop: 16 }}>
          <Btn size="lg" onClick={playing ? stopAll : play} variant={playing ? "danger" : "primary"}>{playing ? "⏹ Stop" : "▶ Play binaural beat"}</Btn>
        </div>
      </Card>
      <PrivacyNote>Both tones are synthesised live in your browser with oscillator nodes. Nothing is downloaded, recorded or sent anywhere.</PrivacyNote>
    </VStack>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
const TOOL_COMPONENTS = {
  // edit
  "audio-trimmer": AudioTrimmer,
  "audio-merger": AudioMerger,
  "audio-volume-changer": AudioVolumeChanger,
  "audio-normalizer": AudioNormalizer,
  "audio-fade-in-out": AudioFadeInOut,
  "audio-silence-remover": AudioSilenceRemover,
  "audio-speed-changer": AudioSpeedChanger,
  "audio-pitch-shifter": AudioPitchShifter,
  "audio-reverser": AudioReverser,
  "audio-cropper-loop": AudioCropperLoop,
  // convert
  "audio-converter": AudioConverter,
  "audio-to-wav": AudioToWav,
  "video-audio-extractor": VideoToAudio,
  "audio-mono-stereo": AudioMonoStereo,
  "audio-sample-rate": AudioSampleRate,
  "audio-channel-splitter": AudioChannelSplitter,
  "audio-base64": AudioBase64,
  "ringtone-maker": RingtoneMaker,
  // voice
  "voice-recorder": VoiceRecorder,
  "text-to-speech": TextToSpeech,
  "audio-playback-tester": AudioPlaybackTester,
  "microphone-tester": MicrophoneTester,
  // analyze
  "waveform-viewer": WaveformViewer,
  "audio-spectrum-analyzer": AudioSpectrumAnalyzer,
  "bpm-detector": BpmDetector,
  "audio-metadata-viewer": AudioMetadataViewer,
  "tone-generator": ToneGenerator,
  "noise-generator": NoiseGenerator,
  "hearing-test": HearingTest,
  "binaural-beat-generator": BinauralBeatGenerator,
};

// ── Page shells ──────────────────────────────────────────────────────────────
function ToolPage({ toolId }) {
  const tool = TOOLS.find(t => t.id === toolId);
  const meta = TOOL_META[toolId];
  const ToolComp = TOOL_COMPONENTS[toolId];
  useEffect(() => {
    document.title = meta?.title || `${tool?.name} – Free Online Tool | ToolsRift`;
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
  const cat = CATEGORIES.find(c => c.id === catId);
  const catTools = TOOLS.filter(t => t.cat === catId);

  useEffect(() => {
    document.title = `${cat?.name || 'Category'} – Audio Tools | ToolsRift`;
  }, [catId, cat]);

  if (!cat) return (
    <div style={{ padding:40, textAlign:"center", color:C.muted }}>
      <div style={{ fontSize:48, marginBottom:16 }}>📁</div>
      <div style={{ fontSize:16, marginBottom:8, color:C.text }}>Category not found</div>
      <a href="#/" style={{ color:C.accent }}>← Back to home</a>
    </div>
  );

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 20px 60px" }}>
      <Breadcrumb cat={cat} />
      <div style={{ marginBottom:32 }}>
        <h1 style={{ ...T.h1, marginBottom:8, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:32 }}>{cat.icon}</span> {cat.name}
        </h1>
        <p style={{ fontSize:14, color:C.muted, lineHeight:1.6 }}>{cat.desc}</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16 }}>
        {catTools.map(tool => (
          <a key={tool.id} href={`#/tool/${tool.id}`} style={{ textDecoration:"none", display:"block" }}>
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20, transition:"all .2s", cursor:"pointer" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontSize:32, marginBottom:10 }}>{tool.icon}</div>
              <div style={{ fontSize:15, fontWeight:600, color:C.text, marginBottom:6 }}>{tool.name}</div>
              <div style={{ fontSize:12, color:C.muted, lineHeight:1.5, marginBottom:10 }}>{tool.desc}</div>
              <Badge color={tool.free?"green":"amber"}>{tool.free?"Free":"Pro"}</Badge>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  useEffect(() => {
    document.title = "Free Audio Tools – Trimmer, Converter, Text to Speech | ToolsRift";
  }, []);
  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search audio tools..."
      />
    </CategoryLayout>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 24px", height:56, borderBottom:`1px solid ${scrolled?"rgba(147,51,234,0.2)":C.border}`, position:"sticky", top:0, background:`rgba(6,9,15,${scrolled?0.97:0.85})`, backdropFilter:"blur(12px)", zIndex:100, transition:"background 0.2s,border-color 0.2s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <a href="/" aria-label="ToolsRift home" style={{display:"flex",alignItems:"center",flexShrink:0}}><img src="/logo.svg" alt="ToolsRift" style={{height:26,display:"block"}}/></a>
        <span style={{ color:"rgba(255,255,255,0.2)", fontSize:14 }}>›</span>
        <a href="#/" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:500, color:C.accent, textDecoration:"none" }}>{THEME?.name||"Audio Tools"}</a>
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <span className="tr-nav-badge" style={{ background:"rgba(147,51,234,0.12)", color:C.accent, fontSize:11, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", padding:"3px 10px", borderRadius:20, letterSpacing:"0.02em", border:"1px solid rgba(147,51,234,0.25)" }}>{TOOLS.length} tools</span>
        {/* PHASE 2: <UsageCounter/> */}
        <a href="/" style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 14px", borderRadius:8, fontSize:12, fontWeight:600, color:"#E2E8F0", textDecoration:"none", background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}` }}>🏠 Home</a>
      </div>
    </nav>
  );
}

function SiteFooter({ currentPage }) {
  const pages = [
    {href:"/everyday",icon:"🧰",label:"Everyday Tools"},
    {href:"/business",icon:"💼",label:"Business"},
    {href:"/text",icon:"✍️",label:"Text Tools"},
    {href:"/json",icon:"🧑‍💻",label:"JSON Tools"},
    {href:"/encoders",icon:"🔐",label:"Encoders"},
    {href:"/colors",icon:"🎨",label:"Color Tools"},
    {href:"/units",icon:"📏",label:"Unit Converters"},
    {href:"/hash",icon:"🔒",label:"Hash & Crypto"},
    {href:"/css",icon:"✨",label:"CSS Tools"},
    {href:"/images",icon:"🖼️",label:"Image Tools"},
    {href:"/pdf",icon:"📄",label:"PDF Tools"},
    {href:"/html",icon:"🌐",label:"HTML Tools"},
    {href:"/js",icon:"⚡",label:"JS Tools"},
    {href:"/formatters",icon:"🔧",label:"Code Formatters"},
    {href:"/fancy",icon:"✨",label:"Fancy Text"},
    {href:"/generators",icon:"⚡",label:"Generators"},
    {href:"/generators2",icon:"✍️",label:"Content Gen"},
    {href:"/devgen",icon:"⚙️",label:"Dev Config"},
    {href:"/mathcalc",icon:"📐",label:"Math Calc"},
    {href:"/financecalc",icon:"💰",label:"Finance Calc"},
    {href:"/devtools",icon:"🛠️",label:"Dev Tools"},
    {href:"/converters2",icon:"🔄",label:"More Converters"},
    { href: "/about", icon: "ℹ️", label: "About" },
    { href: "/privacy-policy", icon: "🔏", label: "Privacy Policy" },
  ].filter(p => !p.href.endsWith("/"+currentPage));

  return (
    <div style={{maxWidth:860,margin:"0 auto",padding:"32px 20px 28px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <span style={{fontSize:11,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em"}}>Explore More Tools</span>
        <a href="/" style={{fontSize:12,color:C.accent,textDecoration:"none",fontWeight:600}}>← Back to Home</a>
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

function ToolsRiftAudio() {
  const route = useAppRouter();
  const showChrome = route.page !== 'home' && route.page !== 'tool';
  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>
      {showChrome && <Nav />}
      {route.page==="home" && <HomePage />}
      {route.page==="tool" && <ToolPage toolId={route.toolId} />}
      {route.page==="category" && <CategoryPage catId={route.catId} />}
      {showChrome && <SiteFooter currentPage="audio"/>}
    </div>
  );
}

export default ToolsRiftAudio;
