import Head from 'next/head'
import dynamic from 'next/dynamic'
const ToolChecker = dynamic(() => import('../components/tool-checker'), { ssr: false })
export default function Checker() {
  return (
    <>
      <Head>
        <title>Tool Checker — ToolsRift</title>
        <meta name="description" content="Internal tool checker for ToolsRift — verify tool availability and status across all 544+ free online tools." />
        <meta property="og:title" content="Tool Checker — ToolsRift" />
        <meta property="og:description" content="Internal tool checker for ToolsRift — verify tool availability and status." />
        <meta property="og:url" content="https://toolsrift.com/checker" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/checker" />
      </Head>
      <ToolChecker />
    </>
  )
}
