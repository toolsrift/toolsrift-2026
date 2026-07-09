import Head from 'next/head'
import dynamic from 'next/dynamic';
import CategoryLoading from '../components/CategoryLoading'
import CategoryContent from '../components/CategoryContent'
import categoryContent from '../lib/categoryContent'
const C = dynamic(() => import('../components/toolsrift-calc-math'), { ssr: false, loading: CategoryLoading });
export default function P() {
  return (
    <>
      <Head>
        <title>Free Math Calculators — Geometry, Algebra, Trig | ToolsRift</title>
        <meta name="description" content="35+ free math calculators. Solve geometry, algebra, trigonometry, matrix operations, number theory and statistics problems instantly." />
        <meta property="og:title" content="Free Math Calculators — Geometry, Algebra, Trig | ToolsRift" />
        <meta property="og:description" content="35+ free math calculators. Solve geometry, algebra, trigonometry, matrix operations, number theory and statistics problems instantly." />
        <meta property="og:url" content="https://toolsrift.com/mathcalc" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/mathcalc" />
      </Head>
      <C />
      <CategoryContent data={categoryContent.mathcalc} />
    </>
  );
}
