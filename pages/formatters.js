import Head from 'next/head'
import dynamic from 'next/dynamic';
const ToolsRiftFormatters = dynamic(() => import('../components/toolsrift-formatters'), { ssr: false });
export default function FormattersPage() {
  return (
    <>
      <Head>
        <title>Free Code Formatters — CSS, SQL, XML, YAML, JSON &amp; More | ToolsRift</title>
        <meta name="description" content="25+ free code formatter tools. Format CSS, SQL, XML, YAML, Markdown and more. One-click code beautifiers for every language." />
        <meta property="og:title" content="Free Code Formatters — CSS, SQL, XML, YAML, JSON &amp; More | ToolsRift" />
        <meta property="og:description" content="25+ free code formatter tools. Format CSS, SQL, XML, YAML, Markdown and more. One-click code beautifiers for every language." />
        <meta property="og:url" content="https://toolsrift.com/formatters" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/formatters" />
      </Head>
      <ToolsRiftFormatters />
    </>
  );
}
