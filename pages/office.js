import Head from 'next/head'
import dynamic from 'next/dynamic'
import CategoryLoading from '../components/CategoryLoading'
import CategoryContent from '../components/CategoryContent'
import categoryContent from '../lib/categoryContent'
const ToolsRiftOffice = dynamic(() => import('../components/toolsrift-office'), { ssr: false, loading: CategoryLoading })

export default function Office() {
  return (
    <>
      <Head>
        <title>Free Office & Productivity Tools — vCard, iCal, QR Code, Notes | ToolsRift</title>
        <meta name="description" content="Free office and productivity tools. Generate vCard contact cards, .ics calendar invites, WiFi and contact QR codes, signature PNGs, address labels, certificates and printable planners." />
        <meta property="og:title" content="Free Office & Productivity Tools — vCard, iCal, QR Code, Notes | ToolsRift" />
        <meta property="og:description" content="vCards, calendar invites, QR codes, notes, labels and signatures — generated in your browser with no account." />
        <meta property="og:url" content="https://toolsrift.com/office" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/office" />
      </Head>
      <ToolsRiftOffice />
      <CategoryContent data={categoryContent.office} />
    </>
  )
}
