import Head from 'next/head'
import dynamic from 'next/dynamic';
const ToolsRiftJS = dynamic(() => import('../components/toolsrift-js'), { ssr: false });
export default function JSPage() {
  return (
    <>
      <Head>
        <title>Free JavaScript Tools — Formatter, Minifier, Validator | ToolsRift</title>
        <meta name="description" content="10+ free JavaScript tools. Format, minify, validate and obfuscate JavaScript code. JSON to JS object converter and more." />
        <meta property="og:title" content="Free JavaScript Tools — Formatter, Minifier, Validator | ToolsRift" />
        <meta property="og:description" content="10+ free JavaScript tools. Format, minify, validate and obfuscate JavaScript code. JSON to JS object converter and more." />
        <meta property="og:url" content="https://toolsrift.com/js" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/js" />
      </Head>
      <ToolsRiftJS />
    </>
  );
}
