import Head from 'next/head'
import dynamic from 'next/dynamic'
import CategoryContent from '../components/CategoryContent'
import categoryContent from '../lib/categoryContent'
import CategoryLoading from '../components/CategoryLoading'
const ToolsRiftText = dynamic(() => import('../components/toolsrift-text'), { ssr: false, loading: CategoryLoading })

// NOTE: getServerSideProps was removed on purpose.
// It only computed an `isApp` prop that the tool component never used,
// and it forced this page to be server-rendered on every request.
// Now the page is fully static — served instantly from Vercel's edge cache.

export default function Text() {
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
      <ToolsRiftText />
      <CategoryContent data={categoryContent.text} />
    </>
  )
}
