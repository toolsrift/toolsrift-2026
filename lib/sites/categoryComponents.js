// ── Registry slug → category widget (client-only dynamic import) ─────────────
// Shared by the standalone site pages (pages/index.js, pages/[slug].js) so the
// list of category components lives in exactly one place for them.
// pages/[slug]/[tool].js keeps its own identical map on purpose: it is the
// live hub's most sensitive file and is left byte-for-byte as it was.

import dynamic from 'next/dynamic';
import CategoryLoading from '../../components/CategoryLoading';


const CATEGORY_COMPONENTS = {
  business:    dynamic(() => import('../../components/toolsrift-business'), { ssr: false, loading: CategoryLoading }),
  colors:      dynamic(() => import('../../components/toolsrift-colors'), { ssr: false, loading: CategoryLoading }),
  converters2: dynamic(() => import('../../components/toolsrift-converters2'), { ssr: false, loading: CategoryLoading }),
  css:         dynamic(() => import('../../components/toolsrift-css'), { ssr: false, loading: CategoryLoading }),
  devgen:      dynamic(() => import('../../components/toolsrift-gen-devconfig'), { ssr: false, loading: CategoryLoading }),
  devtools:    dynamic(() => import('../../components/toolsrift-devtools'), { ssr: false, loading: CategoryLoading }),
  encoders:    dynamic(() => import('../../components/toolsrift-encoders'), { ssr: false, loading: CategoryLoading }),
  encoding:    dynamic(() => import('../../components/toolsrift-encoding'), { ssr: false, loading: CategoryLoading }),
  everyday:    dynamic(() => import('../../components/toolsrift-everyday'), { ssr: false, loading: CategoryLoading }),
  fancy:       dynamic(() => import('../../components/toolsrift-fancy'), { ssr: false, loading: CategoryLoading }),
  financecalc: dynamic(() => import('../../components/toolsrift-calc-finance'), { ssr: false, loading: CategoryLoading }),
  formatters:  dynamic(() => import('../../components/toolsrift-formatters'), { ssr: false, loading: CategoryLoading }),
  generators:  dynamic(() => import('../../components/toolsrift-gen-security'), { ssr: false, loading: CategoryLoading }),
  generators2: dynamic(() => import('../../components/toolsrift-gen-content'), { ssr: false, loading: CategoryLoading }),
  hash:        dynamic(() => import('../../components/toolsrift-hash'), { ssr: false, loading: CategoryLoading }),
  html:        dynamic(() => import('../../components/toolsrift-html'), { ssr: false, loading: CategoryLoading }),
  images:      dynamic(() => import('../../components/toolsrift-images'), { ssr: false, loading: CategoryLoading }),
  js:          dynamic(() => import('../../components/toolsrift-js'), { ssr: false, loading: CategoryLoading }),
  json:        dynamic(() => import('../../components/toolsrift-json'), { ssr: false, loading: CategoryLoading }),
  mathcalc:    dynamic(() => import('../../components/toolsrift-calc-math'), { ssr: false, loading: CategoryLoading }),
  pdf:         dynamic(() => import('../../components/toolsrift-pdf'), { ssr: false, loading: CategoryLoading }),
  random:      dynamic(() => import('../../components/toolsrift-random'), { ssr: false, loading: CategoryLoading }),
  text:        dynamic(() => import('../../components/toolsrift-text'), { ssr: false, loading: CategoryLoading }),
  units:       dynamic(() => import('../../components/toolsrift-units'), { ssr: false, loading: CategoryLoading }),
  audio:       dynamic(() => import('../../components/toolsrift-audio'), { ssr: false, loading: CategoryLoading }),
  office:      dynamic(() => import('../../components/toolsrift-office'), { ssr: false, loading: CategoryLoading }),
  data:        dynamic(() => import('../../components/toolsrift-data'), { ssr: false, loading: CategoryLoading }),
  study:       dynamic(() => import('../../components/toolsrift-study'), { ssr: false, loading: CategoryLoading }),
  video:       dynamic(() => import('../../components/toolsrift-video'), { ssr: false, loading: CategoryLoading }),
};

export default CATEGORY_COMPONENTS;
