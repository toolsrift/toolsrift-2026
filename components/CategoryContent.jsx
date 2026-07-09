import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import TOOL_REGISTRY from '../lib/toolRegistry'
import SiteFooter from './SiteFooter'

const C = {
  bg: '#06090F',
  surface: '#0D1117',
  surface2: '#111827',
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.05)',
  text: '#F1F5F9',
  muted: '#94A3B8',
  dim: '#64748B',
  blue: '#3B82F6',
  indigo: '#6366F1',
  emerald: '#10B981',
  amber: '#F59E0B',
}

function Section({ children, maxWidth = 920 }) {
  return (
    <section style={{ padding: '0 24px', maxWidth, margin: '0 auto' }}>
      {children}
    </section>
  )
}

function Eyebrow({ children, color = C.indigo }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase',
      letterSpacing: '0.12em', marginBottom: 10
    }}>
      {children}
    </div>
  )
}

function H2({ children }) {
  return (
    <h2 style={{
      fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 800, color: C.text,
      fontFamily: "'Sora', sans-serif", margin: '0 0 16px', lineHeight: 1.25
    }}>
      {children}
    </h2>
  )
}

/* Server-rendered H1 — the page's primary heading for SEO.
   Tool widgets load with ssr:false, so without this the HTML
   Google receives has no <h1> at all. Styled identically to H2. */
function H1({ children }) {
  return (
    <h1 style={{
      fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 800, color: C.text,
      fontFamily: "'Sora', sans-serif", margin: '0 0 16px', lineHeight: 1.25
    }}>
      {children}
    </h1>
  )
}

function Paragraph({ children, dim }) {
  return (
    <p style={{
      fontSize: 15, color: dim ? C.dim : C.muted, lineHeight: 1.85,
      margin: '0 0 16px'
    }}>
      {children}
    </p>
  )
}

function Card({ children, accent }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${accent ? accent + '33' : C.borderLight}`,
      borderRadius: 16,
      padding: 'clamp(24px,3vw,36px)',
    }}>
      {children}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: C.borderLight, maxWidth: 1100, margin: '64px auto' }} />
}

/**
 * CategoryContent
 * Renders rich, server-side educational content beneath the tool widget.
 * Crawlers (AdSense, Google Search) see this as real article content.
 *
 * Props:
 *   data: {
 *     categoryName: string             // "Text Tools"
 *     categorySlug: string             // "text"
 *     heroTagline: string              // short subtitle for the content block
 *     intro: string[]                  // 2-3 paragraphs
 *     whyToolsRift: string[]           // 2 paragraphs
 *     howToUse: { title: string, body: string }[]   // 3-5 steps
 *     useCases: string[]               // 6-8 bullets
 *     faqs: [string, string][]         // 5-7 Q&A pairs
 *     related: { name: string, href: string, desc: string }[]   // 4-6 cross-links
 *   }
 */
export default function CategoryContent({ data }) {
  // Hide on tool detail pages (#/tool/X) — the tool component renders its own
  // layout with footer, and CategoryContent would appear AFTER that footer.
  // Detect both initial load and hash changes.
  const [onToolPage, setOnToolPage] = useState(false)
  useEffect(() => {
    const check = () => setOnToolPage(/^#\/tool\//.test(window.location.hash))
    check()
    window.addEventListener('hashchange', check)
    return () => window.removeEventListener('hashchange', check)
  }, [])

  if (!data || onToolPage) return null
  const {
    categoryName, categorySlug, heroTagline,
    intro = [], whyToolsRift = [], howToUse = [],
    useCases = [], faqs = [], related = [],
  } = data

  return (
    <>
      <Head>
        {faqs.length > 0 && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(([q, a]) => ({
              "@type": "Question",
              "name": q,
              "acceptedAnswer": { "@type": "Answer", "text": a }
            }))
          })}} />
        )}
        {howToUse.length > 0 && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": `How to use ${categoryName} on ToolsRift`,
            "step": howToUse.map((s, i) => ({
              "@type": "HowToStep",
              "position": i + 1,
              "name": s.title,
              "text": s.body,
            }))
          })}} />
        )}
      </Head>

      <div style={{
        background: C.bg,
        color: C.text,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        padding: '64px 0 24px',
        borderTop: `1px solid ${C.borderLight}`,
      }}>

        {/* INTRO — uses <h1> so every category page has a server-rendered H1 */}
        <Section>
          <Eyebrow color={C.indigo}>About {categoryName}</Eyebrow>
          <H1>{heroTagline || `Everything you need to know about ${categoryName.toLowerCase()}`}</H1>
          {intro.map((p, i) => <Paragraph key={i}>{p}</Paragraph>)}
        </Section>

        <Divider />

        {/* ALL TOOLS — server-rendered links to every tool's own URL.
            This is how Google DISCOVERS the /[category]/[tool] pages:
            crawlable <a href> links in the initial HTML. Without this
            block the tool pages would exist but never get found. */}
        {TOOL_REGISTRY[categorySlug]?.tools?.length > 0 && (
          <>
            <Section maxWidth={1100}>
              <Eyebrow color={C.emerald}>All {categoryName}</Eyebrow>
              <H2>Browse every tool in this category</H2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: 12, marginTop: 8,
              }}>
                {TOOL_REGISTRY[categorySlug].tools.map(t => (
                  <Link key={t.id} href={`/${categorySlug}/${t.id}`} style={{
                    display: 'block', padding: '12px 16px', background: C.surface,
                    border: `1px solid ${C.borderLight}`, borderRadius: 10,
                    textDecoration: 'none',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>{t.name}</div>
                    <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.5 }}>{t.desc}</div>
                  </Link>
                ))}
              </div>
            </Section>

            <Divider />
          </>
        )}

        {/* WHY TOOLSRIFT */}
        <Section>
          <Eyebrow color={C.emerald}>Why ToolsRift</Eyebrow>
          <H2>Why our {categoryName.toLowerCase()} are different</H2>
          <Card accent={C.emerald}>
            {whyToolsRift.map((p, i) => <Paragraph key={i}>{p}</Paragraph>)}
          </Card>
        </Section>

        <Divider />

        {/* HOW TO USE */}
        {howToUse.length > 0 && (
          <>
            <Section>
              <Eyebrow color={C.amber}>How It Works</Eyebrow>
              <H2>How to use {categoryName.toLowerCase()}</H2>
              <div style={{ display: 'grid', gap: 14, marginTop: 8 }}>
                {howToUse.map((step, i) => (
                  <div key={i} style={{
                    display: 'grid',
                    gridTemplateColumns: '44px 1fr',
                    gap: 16,
                    padding: '20px 22px',
                    background: C.surface,
                    border: `1px solid ${C.borderLight}`,
                    borderRadius: 14,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'rgba(245,158,11,0.12)',
                      color: C.amber, fontWeight: 800, fontSize: 15,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Sora', sans-serif",
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{
                        fontSize: 15, fontWeight: 700, color: C.text,
                        fontFamily: "'Sora', sans-serif", marginBottom: 6,
                      }}>
                        {step.title}
                      </div>
                      <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.75 }}>
                        {step.body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Divider />
          </>
        )}

        {/* USE CASES */}
        {useCases.length > 0 && (
          <>
            <Section>
              <Eyebrow color="#EC4899">Use Cases</Eyebrow>
              <H2>Who uses {categoryName.toLowerCase()}?</H2>
              <Paragraph dim>From everyday tasks to professional workflows — here are some of the most common ways people use these tools.</Paragraph>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
                gap: 12,
                marginTop: 24,
              }}>
                {useCases.map((uc, i) => (
                  <div key={i} style={{
                    padding: '16px 18px',
                    background: C.surface,
                    border: `1px solid ${C.borderLight}`,
                    borderRadius: 12,
                    fontSize: 14,
                    color: C.muted,
                    lineHeight: 1.7,
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                  }}>
                    <span style={{ color: '#EC4899', fontWeight: 800, flexShrink: 0 }}>›</span>
                    <span>{uc}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Divider />
          </>
        )}

        {/* FAQs */}
        {faqs.length > 0 && (
          <>
            <Section maxWidth={820}>
              <Eyebrow color="#06B6D4">FAQ</Eyebrow>
              <H2>Frequently Asked Questions</H2>
              <Paragraph dim>Answers to common questions about our {categoryName.toLowerCase()}.</Paragraph>
              <div style={{ marginTop: 24 }}>
                {faqs.map(([q, a], i) => (
                  <details key={i} style={{
                    background: C.surface,
                    border: `1px solid ${C.borderLight}`,
                    borderRadius: 12,
                    marginBottom: 10,
                    overflow: 'hidden',
                  }}>
                    <summary style={{
                      padding: '18px 22px',
                      fontSize: 15,
                      fontWeight: 700,
                      color: C.text,
                      fontFamily: "'Sora', sans-serif",
                      cursor: 'pointer',
                      listStyle: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 16,
                    }}>
                      <span>{q}</span>
                      <span style={{ color: '#06B6D4', fontSize: 18, fontWeight: 400 }}>+</span>
                    </summary>
                    <div style={{
                      padding: '0 22px 20px',
                      fontSize: 14,
                      color: C.muted,
                      lineHeight: 1.85,
                      borderTop: `1px solid ${C.borderLight}`,
                      paddingTop: 16,
                    }}>
                      {a}
                    </div>
                  </details>
                ))}
              </div>
            </Section>

            <Divider />
          </>
        )}

        {/* RELATED */}
        {related.length > 0 && (
          <Section>
            <Eyebrow color="#8B5CF6">Explore More</Eyebrow>
            <H2>Related tool categories</H2>
            <Paragraph dim>Continue exploring ToolsRift with these related tool collections.</Paragraph>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))',
              gap: 12,
              marginTop: 24,
            }}>
              {related.map(r => (
                <a key={r.href} href={r.href} style={{
                  display: 'block',
                  padding: '20px 22px',
                  background: C.surface,
                  border: `1px solid ${C.borderLight}`,
                  borderRadius: 14,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = C.borderLight
                  e.currentTarget.style.transform = 'translateY(0)'
                }}>
                  <div style={{
                    fontSize: 15, fontWeight: 700, color: C.text,
                    fontFamily: "'Sora', sans-serif", marginBottom: 6,
                  }}>
                    {r.name} →
                  </div>
                  <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.65 }}>
                    {r.desc}
                  </div>
                </a>
              ))}
            </div>
          </Section>
        )}

      </div>

      {/* Footer at the very bottom of the category landing page (server-rendered).
          On tool detail pages this component returns null and CategoryLayout
          renders the footer instead — so there is exactly one, always last. */}
      <SiteFooter accent={C.blue} />
    </>
  )
}
