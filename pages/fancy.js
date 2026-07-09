import Head from 'next/head'
import dynamic from 'next/dynamic';
import CategoryLoading from '../components/CategoryLoading'
import CategoryContent from '../components/CategoryContent'
import categoryContent from '../lib/categoryContent'
const ToolsRiftFancy = dynamic(() => import('../components/toolsrift-fancy'), { ssr: false, loading: CategoryLoading });
export default function FancyPage() {
  return (
    <>
      <Head>
        <title>Free Fancy Text — Bold, Italic, Unicode Fonts | ToolsRift</title>
        <meta name="description" content="20+ free fancy text generators. Create bold, italic, cursive, gothic, bubbles and 15+ Unicode text styles for Instagram, Twitter and more." />
        <meta property="og:title" content="Free Fancy Text — Bold, Italic, Unicode Fonts | ToolsRift" />
        <meta property="og:description" content="20+ free fancy text generators. Create bold, italic, cursive, gothic, bubbles and 15+ Unicode text styles for Instagram, Twitter and more." />
        <meta property="og:url" content="https://toolsrift.com/fancy" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/fancy" />
      </Head>
      <ToolsRiftFancy />
      <CategoryContent data={categoryContent.fancy} />
    </>
  );
}
