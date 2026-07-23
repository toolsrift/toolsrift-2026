import Head from 'next/head'
import dynamic from 'next/dynamic'
import CategoryLoading from '../components/CategoryLoading'
import CategoryContent from '../components/CategoryContent'
import categoryContent from '../lib/categoryContent'
const ToolsRiftAudio = dynamic(() => import('../components/toolsrift-audio'), { ssr: false, loading: CategoryLoading })

export default function Audio() {
  return (
    <>
      <Head>
        <title>Free Audio Tools — Trimmer, Converter, Recorder & Text to Speech | ToolsRift</title>
        <meta name="description" content="Free online audio tools that never upload your files. Trim and cut audio, convert MP3/WAV/OGG, merge, normalize volume, record your voice, text to speech, BPM and tone generators." />
        <meta property="og:title" content="Free Audio Tools — Trimmer, Converter, Recorder & Text to Speech | ToolsRift" />
        <meta property="og:description" content="Trim, convert, merge, normalize and record audio entirely in your browser. Nothing is uploaded, no signup, no limits." />
        <meta property="og:url" content="https://toolsrift.com/audio" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/audio" />
      </Head>
      <ToolsRiftAudio />
      <CategoryContent data={categoryContent.audio} />
    </>
  )
}
