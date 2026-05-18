import Head from 'next/head'
import dynamic from 'next/dynamic';
const C = dynamic(() => import('../components/toolsrift-gen-devconfig'), { ssr: false });
export default function P() {
  return (
    <>
      <Head>
        <title>Free Dev Config Gen — gitignore, Docker, nginx | ToolsRift</title>
        <meta name="description" content="30+ free developer config generators. Create .gitignore, Dockerfile, nginx config, package.json, .env templates and more in seconds." />
        <meta property="og:title" content="Free Dev Config Gen — gitignore, Docker, nginx | ToolsRift" />
        <meta property="og:description" content="30+ free developer config generators. Create .gitignore, Dockerfile, nginx config, package.json, .env templates and more in seconds." />
        <meta property="og:url" content="https://toolsrift.com/devgen" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/devgen" />
      </Head>
      <C />
    </>
  );
}
