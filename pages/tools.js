import Head from 'next/head'
import dynamic from 'next/dynamic'

const ToolsRiftAllTools = dynamic(
  () => import('../components/toolsrift-tools').catch(err => {
    console.error('Dynamic import failed:', err)
    return { default: () => <div style={{ color: 'red', padding: 40 }}>Error: {String(err)}</div> }
  }),
  {
    ssr: false,
    loading: () => <div style={{ background: '#06090F', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>Loading…</div>
  }
)

export default function Tools() {
  return (
    <>
      <Head>
        <title>All Free Tools — Browse 24 Categories | ToolsRift</title>
        <meta name="description" content="Browse every free tool on ToolsRift across 24 categories — calculators, PDF, image, code, design, dev. Pick a category and jump straight in." />
        <meta property="og:title" content="All Free Tools — Browse 24 Categories | ToolsRift" />
        <meta property="og:description" content="Browse every free tool on ToolsRift across 24 categories. No signup, instant results." />
        <meta property="og:url" content="https://toolsrift.com/tools" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:image" content="https://toolsrift.com/og-image.png" />
        <meta property="og:image:width" content="1500" />
        <meta property="og:image:height" content="782" />
        <meta name="twitter:image" content="https://toolsrift.com/og-image.png" />
        <link rel="canonical" href="https://toolsrift.com/tools" />
      </Head>
      <ToolsRiftAllTools />
    </>
  )
}
