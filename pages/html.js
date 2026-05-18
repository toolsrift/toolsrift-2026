import Head from 'next/head'
import dynamic from 'next/dynamic';
const ToolsRiftHTML = dynamic(() => import('../components/toolsrift-html'), { ssr: false });
export default function HTMLPage() {
  return (
    <>
      <Head>
        <title>Free HTML Tools — Format, Minify, Validate | ToolsRift</title>
        <meta name="description" content="25+ free HTML tools. Format, minify, validate and convert HTML. HTML encoder/decoder, table generator, meta tag generator and more." />
        <meta property="og:title" content="Free HTML Tools — Format, Minify, Validate | ToolsRift" />
        <meta property="og:description" content="25+ free HTML tools. Format, minify, validate and convert HTML. HTML encoder/decoder, table generator, meta tag generator and more." />
        <meta property="og:url" content="https://toolsrift.com/html" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/html" />
      </Head>
      <ToolsRiftHTML />
    </>
  );
}
