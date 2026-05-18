// ── ToolsRift Motion Primitives ──────────────────────────────────────────────
// Reusable framer-motion building blocks. Heavy animation budget approved.
// All primitives respect prefers-reduced-motion via globals.css / designTokens.

import { useEffect, useRef, useState, useMemo } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useInView,
  useReducedMotion,
} from 'framer-motion';
import { MOTION, EASE, SPRING } from '../../lib/designTokens';

// ── FadeUp — single element, scroll-triggered ───────────────────────────────
export function FadeUp({ children, delay = 0, y = 24, once = true, style, ...rest }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: '-10% 0px' });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.6, ease: EASE.snap, delay }}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// ── BlurUp — entry with blur+lift, used for hero copy ───────────────────────
export function BlurUp({ children, delay = 0, style, ...rest }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.85, ease: EASE.snap, delay }}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// ── Stagger container — children animate in sequence ────────────────────────
export function Stagger({ children, gap = 0.06, delay = 0.05, once = true, style, ...rest }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: '-8% 0px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: gap, delayChildren: delay } } }}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// Item that lives inside a Stagger
export function StaggerItem({ children, y = 16, style, ...rest }) {
  return (
    <motion.div
      variants={{
        hidden:  { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE.snap } },
      }}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// ── ScaleIn — for cards/tiles ───────────────────────────────────────────────
export function ScaleIn({ children, delay = 0, style, ...rest }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ ...SPRING.smooth, delay }}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// ── MagneticBtn — button that drifts toward the cursor ──────────────────────
export function MagneticBtn({ children, strength = 0.25, style, onClick, ...rest }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING.snappy);
  const sy = useSpring(y, SPRING.snappy);
  const reduce = useReducedMotion();

  const onMove = (e) => {
    if (reduce) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{ x: sx, y: sy, ...style }}
      whileTap={{ scale: 0.96 }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

// ── HoverLift — card hover with lift + glow ─────────────────────────────────
export function HoverLift({ children, glow, lift = -6, style, ...rest }) {
  return (
    <motion.div
      whileHover={{ y: lift, boxShadow: glow || '0 16px 40px rgba(0,0,0,0.5)' }}
      transition={SPRING.smooth}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// ── Tilt3D — subtle 3D card tilt on cursor ──────────────────────────────────
export function Tilt3D({ children, max = 8, style, ...rest }) {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, SPRING.smooth);
  const sry = useSpring(ry, SPRING.smooth);
  const reduce = useReducedMotion();

  const onMove = (e) => {
    if (reduce) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * max * 2);
    rx.set(-(py - 0.5) * max * 2);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d', ...style }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// ── GradientBlob — animated background orb (decorative) ─────────────────────
export function GradientBlob({ color, color2, size = 480, x = '20%', y = '10%', delay = 0, opacity = 0.55, style }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity, scale: 1 }}
      transition={{ duration: 1.6, delay, ease: EASE.snap }}
      style={{
        position: 'absolute',
        left: x, top: y,
        width: size, height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${color} 0%, ${color2 || 'transparent'} 60%, transparent 75%)`,
        filter: 'blur(60px)',
        pointerEvents: 'none',
        animation: 'tr-orbBreathe 12s ease-in-out infinite',
        animationDelay: `${delay}s`,
        zIndex: 0,
        ...style,
      }}
    />
  );
}

// ── Marquee — infinite horizontal scroll ────────────────────────────────────
export function Marquee({ children, speed = 40, reverse = false, gap = 24, style }) {
  return (
    <div style={{ overflow: 'hidden', width: '100%', maskImage: 'linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)', ...style }}>
      <div style={{
        display: 'flex',
        gap,
        width: 'max-content',
        animation: `${reverse ? 'tr-marqueeRev' : 'tr-marquee'} ${speed}s linear infinite`,
      }}>
        {children}
        {children}
      </div>
    </div>
  );
}

// ── Typewriter — cycles through phrases char-by-char ────────────────────────
export function Typewriter({ words = [], speed = 70, pause = 1400, style }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [del, setDel] = useState(false);

  useEffect(() => {
    if (!words.length) return;
    const current = words[i % words.length];
    if (!del && text === current) {
      const t = setTimeout(() => setDel(true), pause);
      return () => clearTimeout(t);
    }
    if (del && text === '') {
      setDel(false); setI(v => v + 1); return;
    }
    const t = setTimeout(() => {
      setText(prev => del ? prev.slice(0, -1) : current.slice(0, prev.length + 1));
    }, del ? speed / 2 : speed);
    return () => clearTimeout(t);
  }, [text, del, i, words, speed, pause]);

  return (
    <span style={style}>
      {text}
      <span style={{ display: 'inline-block', width: '0.6ch', animation: 'tr-blink 1s step-end infinite' }}>|</span>
    </span>
  );
}

// ── CountUp — animated number on scroll-in ──────────────────────────────────
export function CountUp({ to = 100, duration = 1.6, prefix = '', suffix = '', style }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min((t - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return <span ref={ref} style={style}>{prefix}{n.toLocaleString()}{suffix}</span>;
}

// ── ParallaxY — translate Y with scroll ─────────────────────────────────────
export function ParallaxY({ children, speed = 0.3, style, ...rest }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -100 * speed * 4]);
  return (
    <motion.div ref={ref} style={{ y, ...style }} {...rest}>
      {children}
    </motion.div>
  );
}

// ── ScanlineOverlay — for glitch/dev categories ─────────────────────────────
export function ScanlineOverlay({ color = 'rgba(34,211,238,0.08)' }) {
  return (
    <div aria-hidden style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1,
    }}>
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        animation: 'tr-scanline 6s linear infinite',
      }} />
    </div>
  );
}

// ── ParticlesField — small floating dots, theme-tinted ──────────────────────
export function ParticlesField({ color = 'rgba(255,255,255,0.4)', count = 20, style }) {
  const dots = useMemo(() =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
      delay: Math.random() * 6,
      dur: 8 + Math.random() * 8,
    })), [count]);

  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', ...style }}>
      {dots.map(d => (
        <span key={d.id} style={{
          position: 'absolute',
          left: `${d.x}%`, top: `${d.y}%`,
          width: d.size, height: d.size,
          borderRadius: '50%',
          background: color,
          animation: `tr-floatSlow ${d.dur}s ease-in-out ${d.delay}s infinite`,
          opacity: 0.6,
        }} />
      ))}
    </div>
  );
}

// ── PageTransition — wrap pages for soft enter/exit ─────────────────────────
export function PageTransition({ children, keyId }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyId}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4, ease: EASE.snap }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Re-export for convenience
export { motion, AnimatePresence, useInView, useScroll, useTransform, useReducedMotion };
