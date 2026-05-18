import Head from 'next/head'
import dynamic from 'next/dynamic'
const ToolsRiftColors = dynamic(() => import('../components/toolsrift-colors'), { ssr: false })
export default function Colors() {
  return (<><Head>
        <title>Free Color Tools — Picker, Converter, Palette Generator | ToolsRift</title>
        <meta name="description" content="20+ free color tools. HEX to RGB, HSL, CMYK converter. Color palette generator, gradient maker, contrast checker and accessibility tools." />
        <meta property="og:title" content="Free Color Tools — Picker, Converter, Palette Generator | ToolsRift" />
        <meta property="og:description" content="20+ free color tools. HEX to RGB, HSL, CMYK converter. Color palette generator, gradient maker, contrast checker and accessibility tools." />
        <meta property="og:url" content="https://toolsrift.com/colors" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/colors" />
      </Head><ToolsRiftColors /></>)
}
