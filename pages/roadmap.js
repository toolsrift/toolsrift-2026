import Head from 'next/head'
import dynamic from 'next/dynamic'
const ToolsRiftRoadmap = dynamic(() => import('../components/toolsrift-roadmap'), { ssr: false })
export default function Roadmap() {
  return (
    <>
      <Head>
        <title>Roadmap — ToolsRift Development Plans</title>
        <meta name="description" content="ToolsRift development roadmap — 544+ free online tools already built, with 1600+ more coming soon across 34 categories." />
        <meta property="og:title" content="Roadmap — ToolsRift Development Plans" />
        <meta property="og:description" content="ToolsRift development roadmap — 544+ free online tools already built, with 1600+ more coming soon." />
        <meta property="og:url" content="https://toolsrift.com/roadmap" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/roadmap" />
      </Head>
      <ToolsRiftRoadmap />
    </>
  )
}
