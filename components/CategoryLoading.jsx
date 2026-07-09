// Full-height loading placeholder for a category page's ssr:false dashboard.
// Reserves ~100vh so the server-rendered CategoryContent ("About X Tools" SEO
// block) stays BELOW the fold while the dashboard chunk mounts — otherwise it
// would be the only thing on screen and flash at the top of the page.
export default function CategoryLoading() {
  return (
    <div className="tr-cat-loading">
      <div className="tr-spinner" aria-label="Loading" role="status" />
    </div>
  )
}
