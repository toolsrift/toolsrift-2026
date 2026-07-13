import Head from 'next/head'
import dynamic from 'next/dynamic'
import CategoryLoading from '../components/CategoryLoading'
import CategoryContent from '../components/CategoryContent'
import categoryContent from '../lib/categoryContent'
const ToolsRiftRandom = dynamic(() => import('../components/toolsrift-random'), { ssr: false, loading: CategoryLoading })

export default function Random() {
  return (
    <>
      <Head>
        <title>Free Randomizers & Games — Spinner Wheel, Dice, Random Picker | ToolsRift</title>
        <meta name="description" content="10 free randomizer and game tools — spinner wheel of names, random team generator, dice roller, random number & letter generators, magic 8 ball, bingo card maker and more. No signup, runs in your browser." />
        <meta property="og:title" content="Free Randomizers & Games — Spinner Wheel, Dice, Random Picker | ToolsRift" />
        <meta property="og:description" content="10 free randomizer and game tools — spinner wheel, random team generator, dice roller, magic 8 ball and more. Instant results, no signup." />
        <meta property="og:url" content="https://toolsrift.com/random" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/random" />
      </Head>
      <ToolsRiftRandom />
      <CategoryContent data={categoryContent.random} />
    </>
  )
}
