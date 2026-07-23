import Head from 'next/head'
import dynamic from 'next/dynamic'
import CategoryLoading from '../components/CategoryLoading'
import CategoryContent from '../components/CategoryContent'
import categoryContent from '../lib/categoryContent'
const ToolsRiftVideo = dynamic(() => import('../components/toolsrift-video'), { ssr: false, loading: CategoryLoading })

export default function Video() {
  return (
    <>
      <Head>
        <title>Free Video Tools — Trim, Convert, Compress, GIF & Record | ToolsRift</title>
        <meta name="description" content="Free online video tools that never upload your files. Trim and merge clips, convert MP4/WebM/MOV, compress video, extract audio or frames, make GIFs, and record your webcam or screen." />
        <meta property="og:title" content="Free Video Tools — Trim, Convert, Compress, GIF & Record | ToolsRift" />
        <meta property="og:description" content="Trim, convert, compress and record video entirely in your browser. Nothing is uploaded, no signup, no watermark." />
        <meta property="og:url" content="https://toolsrift.com/video" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/video" />
      </Head>
      <ToolsRiftVideo />
      <CategoryContent data={categoryContent.video} />
    </>
  )
}
