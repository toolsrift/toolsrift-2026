import Head from 'next/head'
import dynamic from 'next/dynamic';
const C = dynamic(() => import('../components/toolsrift-devtools'), { ssr: false });
export default function P() {
  return (
    <>
      <Head>
        <title>Free Developer Tools — Regex, Diff, JWT, Cron | ToolsRift</title>
        <meta name="description" content="40+ free developer tools. Regex tester, JSON diff, JWT debugger, cron expression builder, chmod calculator, color scheme generator and more." />
        <meta property="og:title" content="Free Developer Tools — Regex, Diff, JWT, Cron | ToolsRift" />
        <meta property="og:description" content="40+ free developer tools. Regex tester, JSON diff, JWT debugger, cron expression builder, chmod calculator, color scheme generator and more." />
        <meta property="og:url" content="https://toolsrift.com/devtools" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/devtools" />
      </Head>
      <C />
    </>
  );
}
