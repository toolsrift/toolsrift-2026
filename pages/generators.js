import Head from 'next/head'
import dynamic from 'next/dynamic';
const C = dynamic(() => import('../components/toolsrift-gen-security'), { ssr: false });
export default function P() {
  return (
    <>
      <Head>
        <title>Free Generator Tools — Password, UUID, QR Code &amp; More | ToolsRift</title>
        <meta name="description" content="35+ free generator tools. Password generator, UUID generator, QR code generator, barcode generator, fake data generator and more." />
        <meta property="og:title" content="Free Generator Tools — Password, UUID, QR Code &amp; More | ToolsRift" />
        <meta property="og:description" content="35+ free generator tools. Password generator, UUID generator, QR code generator, barcode generator, fake data generator and more." />
        <meta property="og:url" content="https://toolsrift.com/generators" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/generators" />
      </Head>
      <C />
    </>
  );
}
