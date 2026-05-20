import Head from 'next/head'
import dynamic from 'next/dynamic';
import CategoryContent from '../components/CategoryContent'
import categoryContent from '../lib/categoryContent'
const ToolsRiftEncoding = dynamic(() => import('../components/toolsrift-encoding'), { ssr: false });
export default function EncodingPage() {
  return (
    <>
      <Head>
        <title>Free Text Encoding — Morse, Binary, Caesar | ToolsRift</title>
        <meta name="description" content="11+ free text encoding tools. Convert to/from Morse code, binary, octal, NATO alphabet, Caesar cipher, ROT13 and more." />
        <meta property="og:title" content="Free Text Encoding — Morse, Binary, Caesar | ToolsRift" />
        <meta property="og:description" content="11+ free text encoding tools. Convert to/from Morse code, binary, octal, NATO alphabet, Caesar cipher, ROT13 and more." />
        <meta property="og:url" content="https://toolsrift.com/encoding" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/encoding" />
      </Head>
      <ToolsRiftEncoding />
      <CategoryContent data={categoryContent.encoding} />
    </>
  );
}
