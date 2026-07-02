import '../styles/globals.css'
import Head from 'next/head'
import Script from 'next/script'
import { useEffect } from 'react'

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
    </>
  )
}
