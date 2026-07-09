import Head from 'next/head'
import dynamic from 'next/dynamic'
import CategoryLoading from '../components/CategoryLoading'
import CategoryContent from '../components/CategoryContent'
import categoryContent from '../lib/categoryContent'
const ToolsRiftEveryday = dynamic(() => import('../components/toolsrift-everyday'), { ssr: false, loading: CategoryLoading })

export default function Everyday() {
  return (
    <>
      <Head>
        <title>Free Everyday Tools — Age Calculator, Timer, Typing Test | ToolsRift</title>
        <meta name="description" content="12 free everyday tools — age calculator, date difference, countdown timer, stopwatch, Pomodoro timer, typing speed test, dice roller, coin flip and more. No signup, runs in your browser." />
        <meta property="og:title" content="Free Everyday Tools — Age Calculator, Timer, Typing Test | ToolsRift" />
        <meta property="og:description" content="12 free everyday tools — age calculator, timers, typing speed test, dice roller and more. Instant results, no signup." />
        <meta property="og:url" content="https://toolsrift.com/everyday" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/everyday" />
      </Head>
      <ToolsRiftEveryday />
      <CategoryContent data={categoryContent.everyday} />
    </>
  )
}
