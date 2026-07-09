import Head from 'next/head'
import dynamic from 'next/dynamic'
import CategoryLoading from '../components/CategoryLoading'
import CategoryContent from '../components/CategoryContent'
import categoryContent from '../lib/categoryContent'
const ToolsRiftBusiness = dynamic(() => import('../components/toolsrift-business'), { ssr: false, loading: CategoryLoading })
export default function Business() {
  return (<><Head>
        <title>Free Business Tools — Invoices, Resumes &amp; More | ToolsRift</title>
        <meta name="description" content="15+ free business tools. Invoice generator, receipt maker, resume builder, cover letter generator, SWOT analysis, UTM builder and more." />
        <meta property="og:title" content="Free Business Tools — Invoices, Resumes &amp; More | ToolsRift" />
        <meta property="og:description" content="15+ free business tools. Invoice generator, receipt maker, resume builder, cover letter generator, SWOT analysis, UTM builder and more." />
        <meta property="og:url" content="https://toolsrift.com/business" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/business" />
      </Head><ToolsRiftBusiness /><CategoryContent data={categoryContent.business} /></>)
}
