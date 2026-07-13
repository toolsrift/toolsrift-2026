// ── ToolsRift shared SiteFooter ─────────────────────────────────────────────
// Server-safe (no hooks, no framer-motion) so it renders in the initial HTML
// for SEO/AdSense. Used at the END of the server-rendered SEO blocks
// (CategoryContent, HomepageContent) and on tool detail pages via CategoryLayout,
// so the footer is always the LAST thing on the page — never stranded mid-page.

const LINK_GROUPS = [
  {
    title: 'Tools',
    links: [
      ['All categories', '/'],
      ['PDF Tools', '/pdf'],
      ['Image Tools', '/images'],
      ['Text Tools', '/text'],
      ['Developer Tools', '/devtools'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About', '/about'],
      ['Contact', '/contact'],
    ],
  },
  {
    title: 'Legal',
    links: [
      ['Privacy Policy', '/privacy-policy'],
      ['Terms of Service', '/terms'],
      ['Cookie Policy', '/cookies'],
      ['Disclaimer', '/disclaimer'],
    ],
  },
];

const C = {
  text: '#F1F5F9',
  muted: '#94A3B8',
  dim: '#64748B',
  borderLight: 'rgba(255,255,255,0.06)',
};

export default function SiteFooter({ accent = '#3B82F6', fonts }) {
  const head = (fonts && fonts.head) || "'Sora', sans-serif";
  const body = (fonts && fonts.body) || "'Plus Jakarta Sans', system-ui, sans-serif";

  return (
    <footer
      style={{
        borderTop: `1px solid ${C.borderLight}`,
        background: `linear-gradient(180deg, transparent, ${accent}08)`,
        padding: '48px clamp(16px, 4vw, 32px) 28px',
        marginTop: 64,
        fontFamily: body,
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gap: 32,
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            marginBottom: 36,
          }}
        >
          <div>
            <a
              href="/"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 12 }}
            >
              <img src="/logo.svg" alt="ToolsRift" style={{ height: 28 }} />
            </a>
            <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.65, margin: 0, maxWidth: 280 }}>
              767+ free online tools across 23 categories. Runs in your browser. No sign-up.
            </p>
          </div>

          {LINK_GROUPS.map((g) => (
            <div key={g.title}>
              <div
                style={{
                  color: C.text, fontSize: 12, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14,
                  fontFamily: head,
                }}
              >
                {g.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {g.links.map(([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    style={{ color: C.muted, fontSize: 13, textDecoration: 'none' }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            paddingTop: 22,
            borderTop: `1px solid ${C.borderLight}`,
            display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
            color: C.dim, fontSize: 12,
          }}
        >
          <span>© 2026 ToolsRift · Free online tools, powered by ads.</span>
          <span>Made with ♥ in Hyderabad, India</span>
        </div>
      </div>
    </footer>
  );
}
