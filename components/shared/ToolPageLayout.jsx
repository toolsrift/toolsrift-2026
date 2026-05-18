// ── ToolsRift ToolPageLayout (v2) ────────────────────────────────────────────
// Universal tool page shell. Mobile-first, theme-aware, app-ready.
// Injects WebApplication, BreadcrumbList, and FAQPage JSON-LD schemas.

import { useState, useRef } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS, RADIUS, FS, MQ, SPRING } from '../../lib/designTokens';
import { FadeUp, Stagger, StaggerItem } from './motion';

// ── JSON-LD schema injection ────────────────────────────────────────────────
export function ToolSchemas({ theme, tool }) {
  const baseUrl   = 'https://toolsrift.com';
  const toolUrl   = `${baseUrl}${theme.pageRoute}#/tool/${tool.id}`;

  const webApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    url: toolUrl,
    description: tool.description || theme.description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    creator: { '@type': 'Organization', name: 'ToolsRift', url: baseUrl },
  };

  const crumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ToolsRift',  item: baseUrl },
      { '@type': 'ListItem', position: 2, name: theme.name,   item: `${baseUrl}${theme.pageRoute}` },
      { '@type': 'ListItem', position: 3, name: tool.name },
    ],
  };

  const faqPage = tool.faq?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.faq.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  } : null;

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />
      {faqPage && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
        />
      )}
    </Head>
  );
}

// ── Ad slot placeholder (kept as a no-op stub for forward compatibility) ────
// Renders nothing. The previous visual placeholder was removed at user request.
function AdSlot() { return null; }

// ── Breadcrumb ──────────────────────────────────────────────────────────────
function Breadcrumb({ theme, toolName }) {
  const crumbs = [
    { label: 'ToolsRift', href: '/' },
    { label: theme.name,  href: theme.pageRoute },
    { label: toolName },
  ];
  return (
    <nav aria-label="Breadcrumb" style={{
      display: 'flex', alignItems: 'center', flexWrap: 'wrap',
      gap: 6, fontSize: 13, fontFamily: theme.fonts.body,
      color: COLORS.dim, marginBottom: 24,
    }}>
      {crumbs.map((c, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {c.href ? (
            <a href={c.href} style={{ color: COLORS.dim, textDecoration: 'none', transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = theme.color}
              onMouseLeave={e => e.currentTarget.style.color = COLORS.dim}>
              {c.label}
            </a>
          ) : (
            <span style={{ color: theme.color }}>{c.label}</span>
          )}
          {i < crumbs.length - 1 && <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 11 }}>›</span>}
        </span>
      ))}
    </nav>
  );
}

// ── Tool header ─────────────────────────────────────────────────────────────
function ToolHeader({ theme, tool }) {
  return (
    <FadeUp>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 28 }}>
        <div style={{
          width: 4, borderRadius: 4, alignSelf: 'stretch', flexShrink: 0,
          minHeight: 48, background: theme.gradient, boxShadow: theme.glowSoft,
        }} />
        <div style={{ minWidth: 0 }}>
          <h1 style={{
            fontFamily: theme.fonts.head, fontWeight: 700,
            fontSize: FS['3xl'], color: COLORS.textBright,
            margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.15,
          }}>
            {tool.name}
          </h1>
          <p style={{
            fontFamily: theme.fonts.body, fontSize: FS.md,
            color: COLORS.muted, margin: 0, lineHeight: 1.55,
          }}>
            {tool.description}
          </p>
        </div>
      </div>
    </FadeUp>
  );
}

// ── Section heading ─────────────────────────────────────────────────────────
function SectionH2({ theme, children }) {
  return (
    <h2 style={{
      fontFamily: theme.fonts.head, fontSize: FS['2xl'], fontWeight: 700,
      color: COLORS.textBright, margin: '0 0 20px',
      letterSpacing: '-0.015em', lineHeight: 1.2,
    }}>
      {children}
    </h2>
  );
}

// ── Tool card (the input/output container) ──────────────────────────────────
function ToolCard({ theme, children }) {
  return (
    <FadeUp>
      <div style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: RADIUS.xl,
        padding: 'clamp(20px, 4vw, 32px)',
        marginBottom: 48,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle theme accent ribbon at top */}
        <div aria-hidden style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: theme.gradient, opacity: 0.6,
        }} />
        {children}
      </div>
    </FadeUp>
  );
}

// ── How to use ──────────────────────────────────────────────────────────────
function HowToUse({ theme, text }) {
  return (
    <FadeUp>
      <div style={{ marginBottom: 48 }}>
        <SectionH2 theme={theme}>How to use</SectionH2>
        <p style={{
          fontFamily: theme.fonts.body, fontSize: FS.md,
          color: COLORS.muted, lineHeight: 1.7, margin: 0,
        }}>
          {text}
        </p>
      </div>
    </FadeUp>
  );
}

// ── FAQ accordion ───────────────────────────────────────────────────────────
function FAQItem({ theme, question, answer, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: `1px solid ${COLORS.borderLight}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none',
          padding: '18px 0', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer', gap: 12, textAlign: 'left',
          fontFamily: 'inherit',
          minHeight: 44,
        }}
      >
        <span style={{
          fontFamily: theme.fonts.body, fontSize: FS.md, fontWeight: 600,
          color: open ? COLORS.textBright : COLORS.text,
          lineHeight: 1.4, transition: 'color .15s',
        }}>
          {question}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0, color: open ? theme.color : COLORS.dim }}
          transition={SPRING.snappy}
          style={{ fontSize: 20, flexShrink: 0, lineHeight: 1, fontWeight: 300 }}
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{
              fontFamily: theme.fonts.body, fontSize: FS.base,
              color: COLORS.muted, lineHeight: 1.7,
              margin: '0 0 18px', paddingRight: 32,
            }}>
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQSection({ theme, faq }) {
  if (!faq?.length) return null;
  return (
    <FadeUp>
      <div style={{ marginBottom: 48 }}>
        <SectionH2 theme={theme}>Frequently asked questions</SectionH2>
        <div style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: RADIUS.lg,
          padding: '0 22px',
        }}>
          {faq.map(([q, a], i) => (
            <FAQItem key={i} theme={theme} question={q} answer={a} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </FadeUp>
  );
}

// ── Related tools ───────────────────────────────────────────────────────────
function RelatedTools({ theme, related = [] }) {
  if (!related.length) return null;
  return (
    <FadeUp>
      <div style={{ marginBottom: 48 }}>
        <SectionH2 theme={theme}>More {theme.name.toLowerCase()}</SectionH2>
        <Stagger
          gap={0.04}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))',
            gap: 12,
          }}
        >
          {related.slice(0, 8).map((t) => (
            <StaggerItem key={t.id}>
              <motion.a
                href={`${theme.pageRoute}#/tool/${t.id}`}
                whileHover={{ y: -3, borderColor: theme.color, background: theme.tint06 }}
                transition={SPRING.smooth}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: RADIUS.md,
                  padding: '14px 16px',
                  color: COLORS.text,
                  textDecoration: 'none',
                  fontFamily: theme.fonts.body,
                  fontSize: 14, fontWeight: 600,
                  minHeight: 56,
                }}
              >
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28, borderRadius: 8,
                  background: theme.tint12, color: theme.color,
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>
                  {(t.icon || theme.motif || '·').slice(0, 2)}
                </span>
                <span style={{
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{t.name}</span>
              </motion.a>
            </StaggerItem>
          ))}
        </Stagger>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <a href={theme.pageRoute} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: theme.color, fontSize: 13, fontWeight: 600,
            textDecoration: 'none', fontFamily: theme.fonts.body,
          }}>
            See all {theme.toolCount} {theme.name.toLowerCase()} →
          </a>
        </div>
      </div>
    </FadeUp>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────
export default function ToolPageLayout({ theme, tool, related, children }) {
  return (
    <div style={{ padding: '32px 0 96px' }}>
      <ToolSchemas theme={theme} tool={tool} />
      <Breadcrumb theme={theme} toolName={tool.name} />
      <ToolHeader theme={theme} tool={tool} />
      <ToolCard theme={theme}>{children}</ToolCard>
      {tool.howTo && <HowToUse theme={theme} text={tool.howTo} />}
      <FAQSection theme={theme} faq={tool.faq} />
      <RelatedTools theme={theme} related={related} />
    </div>
  );
}

// AdSlot kept as a no-op for backward compatibility with old imports.
export { AdSlot };

// ToolSchemas is exported above for use by bespoke ToolPage components
