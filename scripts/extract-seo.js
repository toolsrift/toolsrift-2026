/**
 * extract-seo.js — Regenerates lib/toolSeo.js from each category component's
 * TOOL_META (or SEO) object, so the server-rendered tool page can emit the
 * UNIQUE per-tool <title>, meta description, keywords and FAQ instead of a
 * generic template. Run after adding tools or editing TOOL_META:
 *   node scripts/extract-seo.js
 *
 * How it works: TOOL_META lives inside client-only (ssr:false) component
 * files, so getStaticProps can't import them. This script statically lifts
 * the `TOOLS` array + the meta expression out of each file's source and
 * evaluates just those two in an isolated vm sandbox (pure JS — the meta
 * templates only reference t.id/t.name/t.desc). No React/browser code runs.
 */
const fs = require('fs')
const path = require('path')
const vm = require('vm')

process.chdir(path.join(__dirname, '..'))

// category slug -> component file (mirror of scripts/extract-tools.py MAP)
const MAP = {
  business: 'toolsrift-business', colors: 'toolsrift-colors', converters2: 'toolsrift-converters2',
  css: 'toolsrift-css', devgen: 'toolsrift-gen-devconfig', devtools: 'toolsrift-devtools',
  encoders: 'toolsrift-encoders', encoding: 'toolsrift-encoding', everyday: 'toolsrift-everyday',
  fancy: 'toolsrift-fancy', financecalc: 'toolsrift-calc-finance', formatters: 'toolsrift-formatters',
  generators: 'toolsrift-gen-security', generators2: 'toolsrift-gen-content', hash: 'toolsrift-hash',
  html: 'toolsrift-html', images: 'toolsrift-images', js: 'toolsrift-js', json: 'toolsrift-json',
  mathcalc: 'toolsrift-calc-math', pdf: 'toolsrift-pdf', random: 'toolsrift-random',
  text: 'toolsrift-text', units: 'toolsrift-units',
  audio: 'toolsrift-audio', office: 'toolsrift-office', data: 'toolsrift-data',
  study: 'toolsrift-study', video: 'toolsrift-video',
}

// Read a balanced expression starting at `start` (which must point at an
// opening bracket in openers). String/template literals are skipped so
// brackets/semicolons inside them never affect depth. Returns end index
// (inclusive of the closing bracket).
function readBalanced(src, start) {
  const pairs = { '(': ')', '[': ']', '{': '}' }
  const stack = []
  let i = start
  const N = src.length
  while (i < N) {
    const ch = src[i]
    if (ch === "'" || ch === '"') { i = skipString(src, i, ch); continue }
    if (ch === '`') { i = skipTemplate(src, i); continue }
    if (ch === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i); if (i < 0) i = N; continue }
    if (ch === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i + 2) + 2; continue }
    if (pairs[ch]) stack.push(pairs[ch])
    else if (ch === ')' || ch === ']' || ch === '}') {
      stack.pop()
      if (stack.length === 0) return i
    }
    i++
  }
  return N - 1
}

function skipString(src, i, quote) {
  i++
  while (i < src.length) {
    if (src[i] === '\\') { i += 2; continue }
    if (src[i] === quote) return i + 1
    i++
  }
  return i
}

// Skip a `template ${expr}` literal, honoring nested braces/strings inside ${}.
function skipTemplate(src, i) {
  i++ // past opening backtick
  while (i < src.length) {
    const ch = src[i]
    if (ch === '\\') { i += 2; continue }
    if (ch === '`') return i + 1
    if (ch === '$' && src[i + 1] === '{') {
      // read the ${ ... } expression with balanced braces
      let depth = 1; i += 2
      while (i < src.length && depth > 0) {
        const c = src[i]
        if (c === "'" || c === '"') { i = skipString(src, i, c); continue }
        if (c === '`') { i = skipTemplate(src, i); continue }
        if (c === '{') depth++
        else if (c === '}') depth--
        i++
      }
      continue
    }
    i++
  }
  return i
}

// Capture `const TOOLS = [ ... ]` source (the array literal, with brackets).
// Also returns the index just past its closing bracket, so callers can scan
// the region between TOOLS and the meta declaration for helper consts.
function extractToolsArray(src) {
  const k = src.indexOf('const TOOLS')
  if (k < 0) return null
  const b = src.indexOf('[', k)
  if (b < 0) return null
  const end = readBalanced(src, b)
  return { src: src.slice(b, end + 1), endIdx: end + 1 }
}

// Capture the RHS expression of `const <NAME> = <RHS>;` (object literal,
// Object.fromEntries(...), TOOLS.reduce(...), etc.).
function extractMetaExpr(src, name) {
  const decl = new RegExp('const\\s+' + name + '\\s*=\\s*')
  const m = decl.exec(src)
  if (!m) return null
  let i = m.index + m[0].length
  // Skip leading whitespace
  while (/\s/.test(src[i])) i++
  const startCh = src[i]
  if (startCh === '{' || startCh === '[' || startCh === '(') {
    // Pure literal or parenthesised — one balanced read is enough only for
    // literals; for calls like Object.fromEntries(...) the identifier comes
    // first, so fall through to the generic statement scan below instead.
  }
  // Generic: read until the top-level `;` that ends the statement.
  const N = src.length
  let depth = 0
  let j = i
  while (j < N) {
    const ch = src[j]
    if (ch === "'" || ch === '"') { j = skipString(src, j, ch); continue }
    if (ch === '`') { j = skipTemplate(src, j); continue }
    if (ch === '/' && src[j + 1] === '/') { j = src.indexOf('\n', j); if (j < 0) j = N; continue }
    if (ch === '/' && src[j + 1] === '*') { j = src.indexOf('*/', j + 2) + 2; continue }
    if (ch === '(' || ch === '[' || ch === '{') depth++
    else if (ch === ')' || ch === ']' || ch === '}') depth--
    else if (ch === ';' && depth === 0) break
    j++
  }
  return src.slice(i, j).trim()
}

// Capture top-level `const IDENT = ...;` declarations between the end of
// `const TOOLS = [...]` and the start of the meta declaration (e.g.
// `const TOOL_META = ...`) — but ONLY the ones the meta expression actually
// references by name (checked against metaSrc after this returns; see
// caller). TOOL_META is allowed to reference a helper lookup table of
// per-tool `howTo` text or FAQ questions, for instance, instead of being
// forced into one giant inline literal.
//
// This file's region between TOOLS and TOOL_META often also holds things
// TOOL_META does NOT reference — e.g. a TOOL_COMPONENTS map wiring tool ids
// to component functions defined earlier in the file. Sweeping those in
// unconditionally breaks the eval (the component functions aren't part of
// this isolated sandbox), so the caller filters this list down to only the
// names that appear as identifiers in metaSrc.
function extractHelperConsts(src, toolsEnd, metaStart) {
  const region = src.slice(toolsEnd, metaStart)
  const decls = []
  const N = region.length
  // A `const NAME = ` data lookup, or a `function name(...) { ... }` helper
  // (e.g. a small mergeHowTo() that stitches a howTo lookup onto a
  // hand-written TOOL_META literal without touching every entry).
  const constRe = /^const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*/
  const fnRe = /^function\s+([A-Za-z][A-Za-z0-9_]*)\s*\(/
  let i = 0
  let depth = 0 // brace/paren/bracket nesting relative to this region's start
  while (i < N) {
    const ch = region[i]
    if (ch === "'" || ch === '"') { i = skipString(region, i, ch); continue }
    if (ch === '`') { i = skipTemplate(region, i); continue }
    if (ch === '/' && region[i + 1] === '/') { i = region.indexOf('\n', i); if (i < 0) i = N; continue }
    if (ch === '/' && region[i + 1] === '*') { i = region.indexOf('*/', i + 2) + 2; continue }
    // Only look for a top-level declaration when we are NOT nested inside
    // some other block — e.g. inside a component function's body, which is
    // exactly where an unrelated local `const P = ...` (loan-math scratch
    // variables, etc.) would otherwise be misread as a helper declaration.
    if (depth === 0) {
      const cm = constRe.exec(region.slice(i))
      if (cm) {
        let j = i + cm[0].length
        let d2 = 0
        while (j < N) {
          const c = region[j]
          if (c === "'" || c === '"') { j = skipString(region, j, c); continue }
          if (c === '`') { j = skipTemplate(region, j); continue }
          if (c === '(' || c === '[' || c === '{') d2++
          else if (c === ')' || c === ']' || c === '}') d2--
          else if (c === ';' && d2 === 0) break
          j++
        }
        decls.push({ name: cm[1], code: `const ${cm[1]} = ${region.slice(i + cm[0].length, j).trim()};` })
        i = j + 1
        continue
      }
      const fm = fnRe.exec(region.slice(i))
      if (fm) {
        const braceIdx = region.indexOf('{', i)
        if (braceIdx >= 0) {
          const end = readBalanced(region, braceIdx)
          decls.push({ name: fm[1], code: region.slice(i, end + 1) })
          i = end + 1
          continue
        }
      }
    }
    if (ch === '(' || ch === '[' || ch === '{') depth++
    else if (ch === ')' || ch === ']' || ch === '}') depth--
    i++
  }
  return decls
}

function evalMeta(toolsSrc, helperSrc, metaSrc) {
  const code = `(function(){ const TOOLS = ${toolsSrc}; ${helperSrc}\n const M = ${metaSrc}; return M; })()`
  const sandbox = {}
  return vm.runInNewContext(code, sandbox, { timeout: 5000 })
}

function normalize(entry) {
  if (!entry || typeof entry !== 'object') return null
  const out = {}
  if (entry.title) out.title = String(entry.title)
  if (entry.desc) out.desc = String(entry.desc)
  if (entry.keywords) out.keywords = String(entry.keywords)
  if (entry.howTo) out.howTo = String(entry.howTo)
  if (Array.isArray(entry.faq) && entry.faq.length) {
    out.faq = entry.faq
      .map(f => Array.isArray(f) ? [String(f[0]), String(f[1])] : null)
      .filter(Boolean)
  }
  return Object.keys(out).length ? out : null
}

const seo = {}
let files = 0, tools = 0, skipped = []
for (const [slug, comp] of Object.entries(MAP)) {
  const file = `components/${comp}.jsx`
  const src = fs.readFileSync(file, 'utf8')
  const toolsArr = extractToolsArray(src)
  // Prefer TOOL_META; fall back to SEO (business file).
  const name = /const\s+TOOL_META\s*=/.test(src) ? 'TOOL_META'
             : /const\s+SEO\s*=/.test(src) ? 'SEO' : null
  if (!toolsArr || !name) { skipped.push(`${slug} (no ${!toolsArr ? 'TOOLS' : 'meta'})`); continue }
  const metaDeclMatch = new RegExp('const\\s+' + name + '\\s*=').exec(src)
  const metaSrc = extractMetaExpr(src, name)
  // Only keep helper consts/functions that are actually reachable from
  // TOOL_META's own expression — see extractHelperConsts for why an
  // unfiltered sweep is unsafe. Reachability is transitive: a helper
  // function (e.g. a small mergeHowTo() that stitches a howTo lookup onto a
  // hand-written TOOL_META literal) is referenced by name in metaSrc, but
  // the HOWTO lookup it actually uses is only referenced from *inside that
  // function's own body* — so this is a fixed-point walk, not a single pass.
  const helperDecls = metaDeclMatch
    ? extractHelperConsts(src, toolsArr.endIdx, metaDeclMatch.index)
    : []
  const included = new Set()
  let frontier = metaSrc
  let grew = true
  while (grew) {
    grew = false
    for (const d of helperDecls) {
      if (included.has(d.name)) continue
      if (new RegExp('\\b' + d.name + '\\b').test(frontier)) {
        included.add(d.name)
        frontier += '\n' + d.code
        grew = true
      }
    }
  }
  const helperSrc = helperDecls
    .filter(d => included.has(d.name))
    .map(d => d.code)
    .join('\n')
  let obj
  try {
    obj = evalMeta(toolsArr.src, helperSrc, metaSrc)
  } catch (e) {
    skipped.push(`${slug} (eval failed: ${e.message})`); continue
  }
  const cat = {}
  for (const [id, entry] of Object.entries(obj || {})) {
    const n = normalize(entry)
    if (n) { cat[id] = n; tools++ }
  }
  seo[slug] = cat
  files++
  console.log(`${slug.padEnd(14)} ${Object.keys(cat).length} meta entries`)
}

if (skipped.length) console.log('SKIPPED:', skipped.join('; '))
console.log(`TOTAL: ${tools} tool-meta entries across ${files} categories`)

const out =
  '// AUTO-GENERATED by scripts/extract-seo.js — do not edit by hand.\n' +
  '// Per-tool SEO (title/desc/keywords/faq/howTo) lifted from each category\n' +
  '// component\'s TOOL_META so the server-rendered tool page can emit it.\n' +
  'const TOOL_SEO = ' + JSON.stringify(seo, null, 1) + ';\n\n' +
  'export default TOOL_SEO;\n'
fs.writeFileSync('lib/toolSeo.js', out)
console.log('lib/toolSeo.js written')
