import Head from 'next/head'
import dynamic from 'next/dynamic'
const ToolsRiftCss = dynamic(() => import('../components/toolsrift-css'), { ssr: false })
export default function Css() {
  return (<><Head>
        <title>Free CSS Generators — Gradient, Shadow, Radius | ToolsRift</title>
        <meta name="description" content="20+ free CSS generator tools. Create CSS gradients, box shadows, border radius, animations, flexbox and grid layouts with live preview." />
        <meta property="og:title" content="Free CSS Generators — Gradient, Shadow, Radius | ToolsRift" />
        <meta property="og:description" content="20+ free CSS generator tools. Create CSS gradients, box shadows, border radius, animations, flexbox and grid layouts with live preview." />
        <meta property="og:url" content="https://toolsrift.com/css" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/css" />
      </Head><ToolsRiftCss /></>)
}
