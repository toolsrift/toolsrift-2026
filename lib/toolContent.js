// ── ToolsRift long-form tool content ─────────────────────────────────────────
// WHY THIS FILE EXISTS
// Google applied a scaled-content action in August 2026 (see lib/coreTools.js).
// The remedy was to noindex all but ~250 core tools, but an audit on 2026-09-21
// showed those survivors are themselves thin: the server-rendered article is a
// single how-to sentence (median 131 characters, 244 of 252 under 200) plus
// three short FAQ answers — roughly 100 words of text unique to the page. That
// is not a page that can rank for "merge pdf", and it is the same pattern that
// caused the action in the first place.
//
// This file is the fix: genuinely distinct, useful prose per tool, written by
// hand, server-rendered above the FAQ on pages/[slug].js. It is NOT a template.
// Anything that reads as the same paragraph with the nouns swapped belongs
// nowhere near this file — that is precisely what Google penalised.
//
// SCHEMA (every field optional except intro)
//   intro     string   2-4 sentences. What the tool does and who it is for.
//                      Must be specific to THIS tool, not the category.
//   sections  [{ h, p }]  2-4 short sections of real explanation: how it works,
//                      what the options mean, the trade-offs, the gotchas.
//   steps     [string] Numbered usage steps. Replaces the generic how-to line.
//   notes     [string] Short factual bullets: limits, formats, edge cases.
//   faq       [[q, a]] Extra questions, merged AFTER the ones in lib/toolSeo.js.
//                      Answer real questions, not restatements of the intro.
//
// HOW TO ADD A TOOL
//   1. Use the tool. Write what someone actually needs to know.
//   2. Keep it honest: every ToolsRift tool runs client-side, so claims about
//      privacy are true — but do not pad every entry with the same privacy
//      paragraph. Say it where it matters (files, passwords) and skip it where
//      it does not (unit conversion).
//   3. `npm run content:report` shows coverage and flags entries that look
//      templated (high similarity to a sibling).
//
// Coverage is deliberately partial and grows by hand. A page without an entry
// still renders exactly as before.

const TOOL_CONTENT = {
  // ── PDF ────────────────────────────────────────────────────────────────────
  'pdf-merger': {
    intro:
      'Combine several PDFs into one file, in the order you choose, without uploading anything. ' +
      'The merge runs in your browser using pdf-lib, so contracts, bank statements and scanned ' +
      'IDs never leave the machine you are sitting at.',
    sections: [
      {
        h: 'What merging actually does to your file',
        p: 'A PDF is a container of page objects plus a cross-reference table that says where each ' +
           'object lives. Merging rebuilds that table and copies the page objects across, so text ' +
           'stays selectable and vector graphics stay sharp — nothing is re-rendered to an image. ' +
           'Fonts embedded in the source files are carried over and de-duplicated where two ' +
           'documents share the same face, which is why a merged file is usually smaller than the ' +
           'sum of its parts.',
      },
      {
        h: 'Order, rotation and page ranges',
        p: 'Files merge top to bottom in the list, and you can drag to reorder before merging. ' +
           'Pages keep the rotation stored in the source document, so a landscape scan stays ' +
           'landscape. If you only need part of a document, split it first and merge the piece — ' +
           'merging a 400-page file just to keep two pages wastes memory in the browser tab.',
      },
      {
        h: 'What it cannot do',
        p: 'Password-protected PDFs must be unlocked before they can be merged, because the page ' +
           'objects are encrypted until the password is supplied. Forms merge, but two documents ' +
           'with fields of the same name will collide and the second one wins. Digital signatures ' +
           'are invalidated by merging — that is the signature doing its job, since the document it ' +
           'signed no longer exists.',
      },
    ],
    steps: [
      'Drop in two or more PDFs, or click to pick them from your device.',
      'Drag the files into the order you want them to appear.',
      'Click Merge. The work happens locally, so large files depend on your machine, not a server queue.',
      'Download the combined PDF.',
    ],
    notes: [
      'Works offline once the page has loaded.',
      'No file size cap other than the memory your browser tab can use, typically around 2 GB.',
      'Encrypted PDFs need unlocking first.',
    ],
    faq: [
      ['Does merging reduce the quality of scanned pages?',
       'No. Scanned pages are images inside the PDF and they are copied across untouched, at their ' +
       'original resolution. If you need a smaller file afterwards, compress it as a separate step ' +
       'so you control how much quality you trade away.'],
      ['Can I merge a PDF with a Word document or an image?',
       'Not directly. Convert the other file to PDF first, then merge. Images can go through the ' +
       'JPG to PDF tool, which keeps them at full resolution rather than downscaling to fit.'],
    ],
  },

  'pdf-splitter': {
    intro:
      'Split one PDF into separate files by page range, or pull a single page out of a long ' +
      'document. Useful when a bank sends twelve months of statements as one file and your ' +
      'accountant wants them month by month.',
    sections: [
      {
        h: 'Ranges versus every page',
        p: 'Splitting by range gives you a file per range you define, which is what you usually ' +
           'want: pages 1-4 as the contract, 5-6 as the annexe. Splitting every page produces one ' +
           'file per page and is mostly useful when you are going to re-order or distribute pages ' +
           'individually. Page numbers here are positions in the file, not the numbers printed on ' +
           'the page, which often differ when a document has unnumbered front matter.',
      },
      {
        h: 'Why the pieces are not proportionally smaller',
        p: 'A ten-page split from a hundred-page file is rarely a tenth of the size. Embedded fonts ' +
           'and colour profiles are copied into every output file that needs them, and a single ' +
           'scanned page can outweigh fifty pages of text. If size matters, compress the pieces ' +
           'after splitting.',
      },
    ],
    steps: [
      'Load the PDF you want to split.',
      'Choose split by range and enter the ranges, or choose to split every page.',
      'Click Split and download the files, individually or as a zip.',
    ],
    notes: [
      'Page numbering starts at 1 and follows file order, not printed page numbers.',
      'Bookmarks pointing outside a range are dropped from that piece.',
    ],
    faq: [
      ['Does splitting change the remaining pages?',
       'The original file is never modified. Splitting reads it and writes new files, so whatever ' +
       'you started with is still on your device unchanged.'],
    ],
  },

  // ── Images ─────────────────────────────────────────────────────────────────
  'image-compressor': {
    intro:
      'Make an image smaller in bytes while deciding for yourself how much quality to give up. ' +
      'The compression runs on a canvas in your browser, so the photo is never uploaded and you ' +
      'can see the result before you keep it.',
    sections: [
      {
        h: 'Lossy and lossless are different jobs',
        p: 'JPEG and WebP are lossy: they discard detail the eye is poor at noticing, and the ' +
           'quality slider decides how much. PNG is lossless, so the only savings come from better ' +
           'encoding of the same pixels, which is why a PNG photo barely shrinks while a PNG ' +
           'screenshot of flat colour shrinks a lot. If a photo is stuck as a large PNG, converting ' +
           'it to JPEG or WebP will do far more than any PNG optimiser.',
      },
      {
        h: 'Where the quality slider stops helping',
        p: 'Between 100 and about 80 the file shrinks fast and the difference is hard to see. ' +
           'Below roughly 60, JPEG starts showing blocky artefacts around sharp edges and text, ' +
           'and halos along high-contrast lines. For photographs destined for the web, 75-85 is ' +
           'the usual sweet spot; for an image with text in it, stay high or use PNG.',
      },
      {
        h: 'Resize before you compress',
        p: 'The largest single saving is usually dimensions, not quality. A 4000px photo displayed ' +
           'in a 800px column carries twenty-five times the pixels it needs. Resize to the size it ' +
           'will actually be shown at, then compress; doing it the other way round throws away ' +
           'quality you then discard anyway.',
      },
    ],
    steps: [
      'Choose an image, or drop it onto the page.',
      'Pick the output format. Keep PNG only if you need transparency or the image is flat colour.',
      'Move the quality slider and watch the estimated size and preview update.',
      'Download when the trade-off looks right.',
    ],
    notes: [
      'Transparency survives in PNG and WebP, and is flattened to white in JPEG.',
      'EXIF metadata, including GPS location, is dropped on re-encode.',
    ],
    faq: [
      ['Why did my PNG get bigger?',
       'Re-encoding a PNG that was already optimised can add bytes, because the encoder here is ' +
       'tuned for speed in a browser rather than for the exhaustive search a dedicated optimiser ' +
       'does. If the output is larger, keep the original — the tool shows both sizes so you can tell.'],
      ['Does compressing remove the location data from my photo?',
       'Yes. Re-encoding writes a fresh file with no EXIF block, so camera model, timestamp and GPS ' +
       'coordinates are all gone from the output. That is usually what you want before posting a ' +
       'photo publicly.'],
    ],
  },

  'image-resizer': {
    intro:
      'Change the pixel dimensions of an image, with the aspect ratio locked or free. Runs on a ' +
      'canvas in your browser, so nothing is uploaded and there is no queue.',
    sections: [
      {
        h: 'Upscaling cannot invent detail',
        p: 'Making an image larger interpolates between the pixels you already have. The result is ' +
           'bigger and softer, never sharper — the detail was not captured, so it cannot be ' +
           'recovered. Doubling is usually the practical limit before the softness is obvious. ' +
           'Downscaling, by contrast, is genuinely lossless in appearance and is the single most ' +
           'effective thing you can do to a web image.',
      },
      {
        h: 'Aspect ratio, cropping and stretching',
        p: 'With the ratio locked, setting one dimension computes the other and the image is never ' +
           'distorted. Unlocking lets you set both, which stretches the picture — occasionally what ' +
           'you want for a background texture, almost never what you want for a photograph. If you ' +
           'need exact dimensions with a different ratio, crop first and then resize.',
      },
    ],
    steps: [
      'Load your image.',
      'Enter a width or a height. With the ratio locked, the other fills in automatically.',
      'Download the resized image.',
    ],
    notes: [
      'Common targets: 1200px wide for a blog header, 1080px for Instagram, 32px for a favicon.',
      'Downscaling in one step gives a cleaner result than several small steps.',
    ],
    faq: [
      ['What size should an image be for a website?',
       'Match the widest box it will be displayed in, then double it only if you are serving a ' +
       'high-density version for retina screens. For most content images 1200-1600px wide is ' +
       'plenty, and anything above 2000px is usually wasted bandwidth.'],
    ],
  },

  // ── Text ───────────────────────────────────────────────────────────────────
  'word-counter-pro': {
    intro:
      'Count words, characters, sentences and paragraphs as you type, with reading time and a ' +
      'keyword breakdown. Built for people working to a limit: essays, meta descriptions, ' +
      'abstracts, application forms.',
    sections: [
      {
        h: 'What counts as a word',
        p: 'Words are split on whitespace, so hyphenated compounds like "state-of-the-art" count ' +
           'as one and an em dash between words does not join them. Numbers count as words. This ' +
           'matches how Word and Google Docs count, which matters when a university or a client ' +
           'specifies a limit — the figure here should agree with theirs.',
      },
      {
        h: 'Characters with and without spaces',
        p: 'Both are shown because different places want different ones. Meta descriptions and ' +
           'tweets count everything including spaces; some publishers and translators quote per ' +
           'character excluding them. Note that an emoji or an accented character may count as more ' +
           'than one character in systems that measure bytes rather than letters.',
      },
      {
        h: 'Reading time is an estimate, not a measurement',
        p: 'The figure assumes roughly 200-250 words per minute, which is typical for an adult ' +
           'reading prose on a screen. Dense technical writing runs slower and dialogue runs ' +
           'faster, so treat it as a guide for pacing a talk or a blog post rather than a promise.',
      },
    ],
    steps: [
      'Type or paste your text into the box.',
      'Counts update on every keystroke — nothing to submit.',
      'Open the keyword breakdown to see the most frequent terms and their density.',
    ],
    notes: [
      'Text stays in the browser tab and is never sent anywhere.',
      'Works offline once loaded.',
    ],
    faq: [
      ['Why does my word count differ from Microsoft Word?',
       'Usually because of what sits in headers, footers, footnotes or text boxes, which Word ' +
       'counts separately and which never makes it into a copy and paste. Check whether Word is ' +
       'reporting the whole document or just a selection.'],
      ['Is there a word limit?',
       'No fixed limit. Very large documents, past a few hundred thousand words, may make the live ' +
       'keyword analysis feel sluggish because it recalculates as you type.'],
    ],
  },

  // ── JSON ───────────────────────────────────────────────────────────────────
  'json-formatter': {
    intro:
      'Paste minified or messy JSON and get it back indented and readable, with syntax errors ' +
      'pointed at the line and column where the parser gave up. Formatting happens locally, which ' +
      'matters when the payload is an API response containing customer data or a token.',
    sections: [
      {
        h: 'Formatting is not validation, but you get both',
        p: 'A formatter must parse the document before it can re-print it, so anything that comes ' +
           'out formatted is by definition valid JSON. When it cannot parse, the error names the ' +
           'position — and the real mistake is often a line or two earlier than the position ' +
           'reported, because that is where the parser started expecting something it never got.',
      },
      {
        h: 'The mistakes that account for most errors',
        p: 'A trailing comma after the last item, which JavaScript allows and JSON does not. ' +
           'Single quotes instead of double. Unquoted keys, which is JavaScript object syntax, not ' +
           'JSON. Comments, which JSON has no syntax for. A stray control character pasted from a ' +
           'terminal. NaN or Infinity, which are not JSON numbers.',
      },
      {
        h: 'Key order and duplicate keys',
        p: 'Formatting preserves the order keys appeared in, because JSON objects are ordered on ' +
           'the wire even though most parsers treat them as unordered maps. If the same key appears ' +
           'twice, the last one wins after parsing and the earlier one silently disappears from the ' +
           'output — worth knowing when a config file mysteriously ignores a setting.',
      },
    ],
    steps: [
      'Paste your JSON, or load a .json file.',
      'Choose an indent of two or four spaces, or tabs.',
      'Copy the formatted result, or download it.',
    ],
    notes: [
      'Large documents are handled in the tab, so a multi-megabyte file depends on your machine.',
      'Nothing is uploaded, so tokens and personal data in a payload stay local.',
    ],
    faq: [
      ['What does "Unexpected token } in JSON at position 214" mean?',
       'The parser reached a closing brace while it was still expecting a value or another key. ' +
       'Nine times out of ten there is a comma after the final property, or a property whose value ' +
       'was deleted but whose comma was left behind.'],
      ['Can it format JSON Lines or NDJSON?',
       'Not as a single document, because each line is its own JSON value rather than one array. ' +
       'Wrap the lines in brackets and separate them with commas to treat the file as one array.'],
    ],
  },

  // ── Encoders ───────────────────────────────────────────────────────────────
  'base64-encode': {
    intro:
      'Turn text or a file into Base64, the encoding used to carry binary data through channels ' +
      'that only accept text: email attachments, data URIs, JSON fields, environment variables.',
    sections: [
      {
        h: 'Base64 is encoding, not encryption',
        p: 'Anyone can decode Base64 in a second, with no key and no effort. It exists to make ' +
           'arbitrary bytes survive a text-only transport, not to hide them. Putting a password in ' +
           'Base64 protects nothing — it only makes the password invisible to a casual glance, ' +
           'which is often worse than leaving it obviously in the clear.',
      },
      {
        h: 'Why the output is a third larger',
        p: 'Base64 represents three bytes as four printable characters, so the result is about 133% ' +
           'of the input, plus padding. That overhead is the reason inlining a large image as a ' +
           'data URI usually makes a page slower rather than faster: you trade one HTTP request for ' +
           'a third more bytes that cannot be cached separately.',
      },
      {
        h: 'Standard alphabet and the URL-safe variant',
        p: 'Standard Base64 uses + and / as its last two characters, both of which have meaning in ' +
           'a URL and get escaped. The URL-safe variant swaps them for - and _ and usually drops ' +
           'the = padding. JWTs use the URL-safe form, which is why a token pasted into a standard ' +
           'decoder sometimes fails.',
      },
    ],
    steps: [
      'Type or paste your text, or choose a file.',
      'Pick the standard or URL-safe alphabet.',
      'Copy the encoded result.',
    ],
    notes: [
      'Text is encoded as UTF-8 before Base64, so accents and emoji round-trip correctly.',
      'Encoding happens in the browser; files are never uploaded.',
    ],
    faq: [
      ['Why does my Base64 string end in one or two equals signs?',
       'That is padding. Base64 works in blocks of three input bytes; when the last block is short, ' +
       '= characters fill it out so the length is a multiple of four. One or two are normal, three ' +
       'is always a sign of something wrong.'],
      ['Can I Base64 a whole image and use it in CSS?',
       'Yes, as a data URI, and it is worth it only for very small assets such as an icon of a few ' +
       'hundred bytes. Past a kilobyte or two the size penalty and the loss of separate caching ' +
       'outweigh saving one request.'],
    ],
  },

  // ── Generators ─────────────────────────────────────────────────────────────
  'strong-password-gen': {
    intro:
      'Generate a random password of the length and character set you choose. Randomness comes ' +
      'from the browser\'s crypto API, not Math.random, and the password is never transmitted — ' +
      'it is generated on your device and stays there until you copy it.',
    sections: [
      {
        h: 'Length beats complexity',
        p: 'Every character you add multiplies the number of possibilities; adding symbol types ' +
           'only widens the base. A sixteen-character lowercase-and-digit password has more ' +
           'combinations than an eight-character one using every symbol on the keyboard, and it is ' +
           'far easier to type on a phone. If you have to pick one dial to turn, turn length.',
      },
      {
        h: 'Where the randomness comes from',
        p: 'The generator uses crypto.getRandomValues, which draws from the operating system\'s ' +
           'entropy pool — the same source used for TLS keys. Math.random is not used anywhere, ' +
           'because it is a predictable pseudo-random generator that was never designed for ' +
           'secrets and can be reconstructed from a handful of outputs.',
      },
      {
        h: 'A generated password needs somewhere to live',
        p: 'The practical failure mode is not a weak password, it is a strong one written on paper ' +
           'or reused because it was the only one you could remember. Generate into a password ' +
           'manager. For the handful of passwords you must type from memory, a passphrase of four ' +
           'or five random words is easier to remember and stronger than the usual substitutions.',
      },
    ],
    steps: [
      'Set the length. Sixteen or more is a sensible default for an account that matters.',
      'Choose which character types to include, and exclude look-alike characters if you will have to read it aloud.',
      'Generate and copy it straight into your password manager.',
    ],
    notes: [
      'Nothing is logged, stored or sent. Reloading the page loses the password for good.',
      'Some banks still cap length or ban symbols; the character toggles exist for those forms.',
    ],
    faq: [
      ['Is it safe to generate a password on a website?',
       'It depends entirely on whether generation happens in your browser or on the server. Here it ' +
       'is in the browser, and you can verify that: open your developer tools, switch to the ' +
       'network tab, and generate. No request is made. A generator that posts to a server has, by ' +
       'definition, seen your password.'],
      ['How long should a password be?',
       'Sixteen characters is a good default and twenty for anything holding money or email. Email ' +
       'deserves the strongest one you have, because whoever controls the inbox can reset ' +
       'everything else.'],
    ],
  },
};

/** True when a tool has hand-written long-form content on its page. */
function hasDepth(id) {
  return Object.prototype.hasOwnProperty.call(TOOL_CONTENT, id);
}

/** Rough count of words unique to this tool's article, for the coverage report. */
function depthWords(id) {
  const c = TOOL_CONTENT[id];
  if (!c) return 0;
  const parts = [
    c.intro || '',
    ...(c.sections || []).flatMap(s => [s.h || '', s.p || '']),
    ...(c.steps || []),
    ...(c.notes || []),
    ...(c.faq || []).flatMap(([q, a]) => [q, a]),
  ];
  return parts.join(' ').trim().split(/\s+/).filter(Boolean).length;
}

module.exports = { TOOL_CONTENT, hasDepth, depthWords };
module.exports.default = TOOL_CONTENT;
