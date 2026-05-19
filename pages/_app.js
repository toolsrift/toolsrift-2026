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

  // Tools use hash routing (#/tool/foo) inside each category app shell.
  // Hash changes don't trigger a real page navigation, so the viewport
  // stays wherever the user clicked. Scroll to top whenever the new hash
  // is a tool route, so every tool opens at the top of the page.
  useEffect(() => {
    const onHashChange = () => {
      const h = window.location.hash || '';
      if (h.startsWith('#/tool/') || h === '#/' || h === '') {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
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
