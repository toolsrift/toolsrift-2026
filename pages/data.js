import Head from 'next/head'
import dynamic from 'next/dynamic'
import CategoryLoading from '../components/CategoryLoading'
import CategoryContent from '../components/CategoryContent'
import categoryContent from '../lib/categoryContent'
const ToolsRiftData = dynamic(() => import('../components/toolsrift-data'), { ssr: false, loading: CategoryLoading })

export default function Data() {
  return (
    <>
      <Head>
        <title>Free Chart Maker & Data Tools — Bar, Line, Pie & CSV Utilities | ToolsRift</title>
        <meta name="description" content="Free online chart maker and CSV tools. Build bar, line, pie, donut, area and scatter charts and export SVG or PNG. Clean, split, merge and summarise CSV data — nothing uploaded." />
        <meta property="og:title" content="Free Chart Maker & Data Tools — Bar, Line, Pie & CSV Utilities | ToolsRift" />
        <meta property="og:description" content="Turn pasted numbers into clean charts and tidy CSV files, entirely in your browser. No signup, no watermark." />
        <meta property="og:url" content="https://toolsrift.com/data" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/data" />
      </Head>
      <ToolsRiftData />
      <CategoryContent data={categoryContent.data} />
    </>
  )
}
