import '../styles/globals.css'
import Head from 'next/head'
import Script from 'next/script'
import { useEffect } from 'react'
import ScrollToTop from '../components/ScrollToTop'
import CookieConsent from '../components/CookieConsent'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    try {
      localStorage.removeItem('tr_theme');
      document.documentElement.setAttribute('data-theme', 'dark');
    } catch (e) {}
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        {/* Site-wide defaults. Each carries a `key` so a category section page
            (components/site/SectionHead.jsx) can replace it with its own. */}
        <link key="manifest" rel="manifest" href="/manifest.json" />
        <meta key="theme-color" name="theme-color" content="#06090F" />
        <meta key="apple-mobile-web-app-title" name="apple-mobile-web-app-title" content="ToolsRift" />
        <meta key="og:image" property="og:image" content="https://toolsrift.com/og-image.png" />
        <meta key="og:image:width" property="og:image:width" content="1500" />
        <meta key="og:image:height" property="og:image:height" content="782" />
        <meta key="og:image:alt" property="og:image:alt" content="ToolsRift — 1,136+ Free Online Tools" />
        <meta key="twitter:image" name="twitter:image" content="https://toolsrift.com/og-image.png" />
        <meta key="twitter:image:alt" name="twitter:image:alt" content="ToolsRift — 1,136+ Free Online Tools" />
      </Head>

      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-F9RKQYMPR5"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-F9RKQYMPR5');
        `}
      </Script>

      <Component {...pageProps} />
      <ScrollToTop />
      <CookieConsent />
    </>
  )
}
