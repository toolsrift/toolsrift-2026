import Head from 'next/head'
import dynamic from 'next/dynamic'
import CategoryLoading from '../components/CategoryLoading'
import CategoryContent from '../components/CategoryContent'
import categoryContent from '../lib/categoryContent'
const ToolsRiftStudy = dynamic(() => import('../components/toolsrift-study'), { ssr: false, loading: CategoryLoading })

export default function Study() {
  return (
    <>
      <Head>
        <title>Free Study Tools — Flashcards, Citations, Quizzes & Periodic Table | ToolsRift</title>
        <meta name="description" content="Free study and education tools for students and teachers. Flashcard maker, quiz generator, APA/MLA/Chicago citation generator, grade calculators, periodic table and study timers." />
        <meta property="og:title" content="Free Study Tools — Flashcards, Citations, Quizzes & Periodic Table | ToolsRift" />
        <meta property="og:description" content="Flashcards, quizzes, citations, grade calculators and science reference tables — free, no signup, works on mobile." />
        <meta property="og:url" content="https://toolsrift.com/study" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/study" />
      </Head>
      <ToolsRiftStudy />
      <CategoryContent data={categoryContent.study} />
    </>
  )
}
