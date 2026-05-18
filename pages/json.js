import Head from 'next/head'
import dynamic from 'next/dynamic'
const ToolsRiftJson = dynamic(() => import('../components/toolsrift-json'), { ssr: false })
export default function Json() {
  return (<><Head>
        <title>Free JSON Tools — Format, Validate, Minify | ToolsRift</title>
        <meta name="description" content="25+ free JSON tools. Format, validate, minify, compare and convert JSON. JSON to CSV, YAML, XML converter. JSONPath tester and more." />
        <meta property="og:title" content="Free JSON Tools — Format, Validate, Minify | ToolsRift" />
        <meta property="og:description" content="25+ free JSON tools. Format, validate, minify, compare and convert JSON. JSON to CSV, YAML, XML converter. JSONPath tester and more." />
        <meta property="og:url" content="https://toolsrift.com/json" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/json" />
      </Head><ToolsRiftJson /></>)
}
