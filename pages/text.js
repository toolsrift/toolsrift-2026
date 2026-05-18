import Head from 'next/head'
import dynamic from 'next/dynamic'
const ToolsRiftText = dynamic(() => import('../components/toolsrift-text'), { ssr: false })

export async function getServerSideProps(context) {
  const host = context.req.headers.host || ''
  const isApp = host.startsWith('text.')
  return { props: { isApp } }
}

export default function Text({ isApp }) {
  return (
    <>
      <Head>
        <title>Free Text Tools — Word Counter, Case, Lorem Ipsum | ToolsRift</title>
        <meta name="description" content="45+ free online text tools. Word counter, character counter, case converter, lorem ipsum generator, readability checker, and more. Instant results, no signup." />
        <meta property="og:title" content="Free Text Tools — Word Counter, Case, Lorem Ipsum | ToolsRift" />
        <meta property="og:description" content="45+ free online text tools. Word counter, character counter, case converter, lorem ipsum generator, readability checker, and more. Instant results, no signup." />
        <meta property="og:url" content="https://toolsrift.com/text" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/text" />
      </Head>
      <ToolsRiftText isApp={isApp} />
    </>
  )
}
