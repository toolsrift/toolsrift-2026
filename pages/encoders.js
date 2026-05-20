import Head from 'next/head'
import dynamic from 'next/dynamic'
import CategoryContent from '../components/CategoryContent'
import categoryContent from '../lib/categoryContent'
const ToolsRiftEncoders = dynamic(() => import('../components/toolsrift-encoders'), { ssr: false })
export default function Encoders() {
  return (<><Head>
        <title>Free Encoder &amp; Decoder — Base64, URL, JWT | ToolsRift</title>
        <meta name="description" content="25+ free encoding and decoding tools. Base64, URL encode/decode, HTML entities, JWT decoder, hex converter and more. Works entirely in your browser." />
        <meta property="og:title" content="Free Encoder &amp; Decoder — Base64, URL, JWT | ToolsRift" />
        <meta property="og:description" content="25+ free encoding and decoding tools. Base64, URL encode/decode, HTML entities, JWT decoder, hex converter and more. Works entirely in your browser." />
        <meta property="og:url" content="https://toolsrift.com/encoders" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/encoders" />
      </Head><ToolsRiftEncoders /><CategoryContent data={categoryContent.encoders} /></>)
}
