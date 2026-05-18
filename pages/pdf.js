import Head from 'next/head'
import dynamic from 'next/dynamic';
const ToolsRiftPDF = dynamic(() => import('../components/toolsrift-pdf'), { ssr: false });
export default function PDFPage() {
  return (
    <>
      <Head>
        <title>Free PDF Tools — Merge, Split, Compress &amp; Convert PDFs | ToolsRift</title>
        <meta name="description" content="28+ free online PDF tools. Merge PDFs, split pages, compress PDF files, convert PDF to text and more. 100% browser-based, no file uploads." />
        <meta property="og:title" content="Free PDF Tools — Merge, Split, Compress &amp; Convert PDFs | ToolsRift" />
        <meta property="og:description" content="28+ free online PDF tools. Merge PDFs, split pages, compress PDF files, convert PDF to text and more. 100% browser-based, no file uploads." />
        <meta property="og:url" content="https://toolsrift.com/pdf" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/pdf" />
      </Head>
      <ToolsRiftPDF />
    </>
  );
}
