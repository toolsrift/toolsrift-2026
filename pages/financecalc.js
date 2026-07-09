import Head from 'next/head'
import dynamic from 'next/dynamic';
import CategoryLoading from '../components/CategoryLoading'
import CategoryContent from '../components/CategoryContent'
import categoryContent from '../lib/categoryContent'
const C = dynamic(() => import('../components/toolsrift-calc-finance'), { ssr: false, loading: CategoryLoading });
export default function P() {
  return (
    <>
      <Head>
        <title>Free Finance &amp; Health Calculators — EMI, TDEE, Tax &amp; More | ToolsRift</title>
        <meta name="description" content="35+ free finance and health calculators. EMI calculator, TDEE calculator, tax estimator, investment returns, calorie calculator and more." />
        <meta property="og:title" content="Free Finance &amp; Health Calculators — EMI, TDEE, Tax &amp; More | ToolsRift" />
        <meta property="og:description" content="35+ free finance and health calculators. EMI calculator, TDEE calculator, tax estimator, investment returns, calorie calculator and more." />
        <meta property="og:url" content="https://toolsrift.com/financecalc" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/financecalc" />
      </Head>
      <C />
      <CategoryContent data={categoryContent.financecalc} />
    </>
  );
}
