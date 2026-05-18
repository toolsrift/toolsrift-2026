import Head from 'next/head'
import dynamic from 'next/dynamic';
const ToolsRiftImages = dynamic(() => import('../components/toolsrift-images'), { ssr: false });
export default function ImagesPage() {
  return (
    <>
      <Head>
        <title>Free Image Tools — Resize, Compress, Convert &amp; Edit Online | ToolsRift</title>
        <meta name="description" content="50+ free online image tools. Resize, compress, crop, convert, flip and filter images. Works in your browser — no uploads to any server." />
        <meta property="og:title" content="Free Image Tools — Resize, Compress, Convert &amp; Edit Online | ToolsRift" />
        <meta property="og:description" content="50+ free online image tools. Resize, compress, crop, convert, flip and filter images. Works in your browser — no uploads to any server." />
        <meta property="og:url" content="https://toolsrift.com/images" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/images" />
      </Head>
      <ToolsRiftImages />
    </>
  );
}
