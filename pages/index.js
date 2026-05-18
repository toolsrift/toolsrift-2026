import Head from 'next/head'
import dynamic from 'next/dynamic'

const ToolsRiftMain = dynamic(
  () => import('../components/toolsrift-main').catch(err => {
    console.error('Dynamic import failed:', err)
    return { default: () => <div style={{ color: 'red', padding: 40 }}>Error: {String(err)}</div> }
  }),
  {
    ssr: false,
    loading: () => <div style={{ background: '#06090F', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>Loading...</div>
  }
)

export default function Home() {
  return (
    <>
      <Head>
        <title>ToolsRift — 1600+ Free Online Tools</title>
        <meta name="description" content="ToolsRift offers 1600+ free online tools including calculators, converters, text tools, PDF tools, image tools and more. No signup required." />
        <meta property="og:title" content="ToolsRift — 1600+ Free Online Tools" />
        <meta property="og:description" content="Free online tools for everyone. Calculators, converters, text tools, and more." />
        <meta property="og:url" content="https://toolsrift.com" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:image" content="https://toolsrift.com/og-image.svg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:image" content="https://toolsrift.com/og-image.svg" />
        <link rel="canonical" href="https://toolsrift.com" />
      </Head>
      <ToolsRiftMain />
    </>
  )
}
