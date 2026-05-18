import Head from 'next/head'
import dynamic from 'next/dynamic';
const C = dynamic(() => import('../components/toolsrift-converters2'), { ssr: false });
export default function P() {
  return (
    <>
      <Head>
        <title>Free Unit Converters — Electrical, Sizes &amp; More | ToolsRift</title>
        <meta name="description" content="20+ free specialty unit converters. Electrical units, clothing sizes, paper sizes, physical constants and more conversion tools." />
        <meta property="og:title" content="Free Unit Converters — Electrical, Sizes &amp; More | ToolsRift" />
        <meta property="og:description" content="20+ free specialty unit converters. Electrical units, clothing sizes, paper sizes, physical constants and more conversion tools." />
        <meta property="og:url" content="https://toolsrift.com/converters2" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/converters2" />
      </Head>
      <C />
    </>
  );
}
