import Head from 'next/head'
import dynamic from 'next/dynamic'
const ToolsRiftUnits = dynamic(() => import('../components/toolsrift-units'), { ssr: false })
export default function Units() {
  return (<><Head>
        <title>Free Unit Converter — Length, Weight, Temperature &amp; More | ToolsRift</title>
        <meta name="description" content="25+ free unit conversion tools. Convert length, weight, temperature, speed, area, volume, time and more. Instant conversions with precision." />
        <meta property="og:title" content="Free Unit Converter — Length, Weight, Temperature &amp; More | ToolsRift" />
        <meta property="og:description" content="25+ free unit conversion tools. Convert length, weight, temperature, speed, area, volume, time and more. Instant conversions with precision." />
        <meta property="og:url" content="https://toolsrift.com/units" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/units" />
      </Head><ToolsRiftUnits /></>)
}
