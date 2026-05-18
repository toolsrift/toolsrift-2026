import Head from 'next/head'
import dynamic from 'next/dynamic'
const ToolsRiftHash = dynamic(() => import('../components/toolsrift-hash'), { ssr: false })
export default function Hash() {
  return (<><Head>
        <title>Free Hash Generator — MD5, SHA1, SHA256, SHA512 &amp; More | ToolsRift</title>
        <meta name="description" content="25+ free cryptographic hash and security tools. Generate MD5, SHA-1, SHA-256, HMAC hashes. Bcrypt generator, UUID generator and more." />
        <meta property="og:title" content="Free Hash Generator — MD5, SHA1, SHA256, SHA512 &amp; More | ToolsRift" />
        <meta property="og:description" content="25+ free cryptographic hash and security tools. Generate MD5, SHA-1, SHA-256, HMAC hashes. Bcrypt generator, UUID generator and more." />
        <meta property="og:url" content="https://toolsrift.com/hash" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/hash" />
      </Head><ToolsRiftHash /></>)
}
