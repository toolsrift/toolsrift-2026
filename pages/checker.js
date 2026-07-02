import Head from 'next/head'
import dynamic from 'next/dynamic'
const ToolChecker = dynamic(() => import('../components/tool-checker'), { ssr: false })
export default function Checker() {
  return (
    <>
      <Head>
        <title>Tool Checker — ToolsRift</title>
        {/* Internal admin tool — must NEVER be indexed by search engines */}
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
      </Head>
      <ToolChecker />
    </>
  )
}
