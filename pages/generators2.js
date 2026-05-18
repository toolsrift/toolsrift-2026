import Head from 'next/head'
import dynamic from 'next/dynamic';
const C = dynamic(() => import('../components/toolsrift-gen-content'), { ssr: false });
export default function P() {
  return (
    <>
      <Head>
        <title>Free Content Generators — Legal Docs, SVG Art, Ad Copy | ToolsRift</title>
        <meta name="description" content="35+ free content generator tools. Privacy policy generator, terms of service, SVG pattern art, marketing copy generators and more." />
        <meta property="og:title" content="Free Content Generators — Legal Docs, SVG Art, Ad Copy | ToolsRift" />
        <meta property="og:description" content="35+ free content generator tools. Privacy policy generator, terms of service, SVG pattern art, marketing copy generators and more." />
        <meta property="og:url" content="https://toolsrift.com/generators2" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/generators2" />
      </Head>
      <C />
    </>
  );
}
