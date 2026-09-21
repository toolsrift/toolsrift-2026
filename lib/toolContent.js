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

  // ── HASH ──────────────────────────────────────────────────────────────────────
  'md5-hash': {
    intro:
      'MD5 turns any text into a 32-character hexadecimal fingerprint, and it is still ' +
      'everywhere: file checksums, cache keys, Gravatar URLs, database shard selection. It has ' +
      'also been cryptographically broken since 2004, which matters enormously in some of those ' +
      'uses and not at all in others. This page generates the digest and explains which case ' +
      'you are in.',
    sections: [
      {
        h: 'What those 32 characters are',
        p: 'MD5 reads your input in 512-bit blocks and stirs each one into a 128-bit internal state; ' +
           'the final state, printed as hexadecimal, is the digest. It is deterministic, so the same ' +
           'input produces the same 32 characters on every machine and in every language. It is also ' +
           'an avalanche function: change one letter and roughly half the output bits flip, which is ' +
           'why two digests are either identical or look completely unrelated. There is no key and ' +
           'no reverse operation — the input is compressed to 128 bits, and most of it is simply ' +
           'gone.',
      },
      {
        h: 'What “broken” actually means for MD5',
        p: 'MD5 lost collision resistance, not preimage resistance. Collisions — two different ' +
           'inputs with the same digest — can be constructed in seconds on a laptop, and researchers ' +
           'have used that to build two PDFs, two executables and even two TLS certificates that ' +
           'hash identically. Preimages are a different story: nobody can take a digest and compute ' +
           'an input that produces it. So MD5 will still reliably tell you whether a file changed by ' +
           'accident. It will not tell you whether a file was changed on purpose by someone who ' +
           'wanted the digest to match.',
      },
      {
        h: 'Where MD5 is still the right tool',
        p: 'Anywhere the input is not attacker-controlled and you only need a cheap, stable ' +
           'identifier: HTTP ETags, cache and CDN keys, de-duplicating a photo library, choosing a ' +
           'database partition, Gravatar image URLs (which are the MD5 of a lowercased email ' +
           'address). Anywhere an adversary picks the input, use SHA-256 instead — and for passwords ' +
           'use neither, because both are fast by design. Password storage wants bcrypt, scrypt or ' +
           'Argon2, which are deliberately slow and salted.',
      },
      {
        h: 'Hashing text is not hashing a file',
        p: 'This tool hashes the text in the box, encoded as UTF-8. A download page that publishes ' +
           'an MD5 checksum has hashed the file\'s raw bytes, so pasting the filename or the file\'s ' +
           'text content here will not reproduce it. The other classic mismatch is a trailing ' +
           'newline: most editors add one when you save, so hashing a file gives a different digest ' +
           'from hashing the text you copied out of it.',
      },
    ],
    steps: [
      'Type or paste the text you want to fingerprint — the digest updates as you type.',
      'Copy the 32-character result with the copy button.',
      'To verify something, paste the expected digest next to yours and compare the whole ' +
       'string; hex digests are conventionally lowercase, so compare case-insensitively.',
    ],
    notes: [
      'MD5 output is always 128 bits — 32 hexadecimal characters — no matter how long the input ' +
       'is.',
      'The digest of the empty string is d41d8cd98f00b204e9800998ecf8427e; seeing it means the ' +
       'input box was empty.',
      'Everything runs in your browser. The text you hash is never sent anywhere.',
    ],
    faq: [
      ['Can an MD5 hash be decrypted back to the original text?',
       'No. MD5 is not encryption — there is no key and no inverse. Any input, however long, is ' +
       'crushed into 128 bits, so the original information no longer exists in the digest. Sites ' +
       'advertising MD5 “decryption” are searching a precomputed table of common inputs. Short ' +
       'words, names and ordinary passwords are all in those tables already, which is exactly ' +
       'why MD5 is unfit for storing passwords.'],
      ['Why does another tool give a different MD5 for the same text?',
       'Almost always a trailing newline or a different character encoding. Hashing “hello” and ' +
       '“hello\\n” gives completely different digests, and text saved as UTF-16 or Latin-1 hashes ' +
       'differently from the same text as UTF-8.'],
      ['Is MD5 fast enough for large inputs?',
       'Yes — MD5 is one of the fastest hashes in common use, which is a virtue for checksums ' +
       'and a fatal flaw for password hashing, where a GPU can try billions of candidates per ' +
       'second.'],
    ],
  },
  'sha256-hash': {
    intro:
      'SHA-256 produces a 64-character hexadecimal digest, and it is the hash the modern ' +
      'internet actually runs on — TLS certificates, software signing, Bitcoin, Linux ' +
      'distribution checksums and the HS256 signatures on JSON Web Tokens all sit on top of it. ' +
      'This tool computes it with your browser\'s own cryptography engine.',
    sections: [
      {
        h: 'SHA-2, and why the number is the output length',
        p: 'SHA-256 is a member of the SHA-2 family published by NIST in 2001; the 256 is the digest ' +
           'length in bits, printed as 64 hex characters. Its siblings differ in more than length: ' +
           'SHA-224 is SHA-256 truncated with a different starting state, while SHA-512 and SHA-384 ' +
           'use 64-bit internal words, which makes SHA-512 often *faster* than SHA-256 in pure ' +
           'software on a 64-bit CPU despite producing twice the output. SHA-3 is a completely ' +
           'different construction (Keccak), kept in reserve rather than as a replacement.',
      },
      {
        h: 'It runs on the browser\'s real crypto engine',
        p: 'The digest comes from crypto.subtle.digest — the Web Crypto API — which is the same ' +
           'implementation your browser uses for HTTPS, not a JavaScript reimplementation. On any ' +
           'recent processor it is hardware-accelerated through the SHA instruction-set extensions, ' +
           'so even megabytes of text hash instantly. Web Crypto is only available in a secure ' +
           'context, which is why this page is served over HTTPS.',
      },
      {
        h: 'Still not a password hash',
        p: 'SHA-256 is unbroken but it is also extremely fast, and speed is the enemy when what you ' +
           'are hashing is a human-chosen password. Commodity hardware tries billions of SHA-256 ' +
           'guesses a second; that is literally what Bitcoin mining is. Password storage needs a ' +
           'deliberately slow, salted, memory-hard function — Argon2id, scrypt or bcrypt. Where you ' +
           'need a keyed hash for authenticating a message, use HMAC-SHA-256 rather than hashing the ' +
           'key and message together.',
      },
      {
        h: 'Comparing a checksum properly',
        p: 'When you verify a download, compare all 64 characters, not the first six. Collisions are ' +
           'not the realistic worry — a truncated comparison is, because it is easy to make two ' +
           'digests agree on a short prefix. Note also that a published checksum is over the file\'s ' +
           'bytes; hashing text you pasted out of a file will not match, and a checksum served from ' +
           'the same compromised page as the download proves nothing.',
      },
    ],
    steps: [
      'Paste the text you want to hash.',
      'The 64-character digest appears immediately — copy it with the copy button.',
      'To verify, paste the expected digest alongside and compare the entire string, ' +
       'case-insensitively.',
    ],
    notes: [
      'Output is always 256 bits — 64 hexadecimal characters — regardless of input size.',
      'The digest of the empty string is ' +
       'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855.',
      'Input is encoded as UTF-8 before hashing, which is what nearly every other tool and ' +
       'library does by default.',
    ],
    faq: [
      ['Has SHA-256 ever been broken?',
       'No. There is no published collision and no preimage attack on the full function. The ' +
       'best public cryptanalysis reaches about 31 of its 64 rounds, which is a long way from a ' +
       'practical break. It is considered safe for new designs today.'],
      ['SHA-256 or SHA-512 — which should I use?',
       'Either is fine. SHA-512 has a larger security margin and is frequently faster on 64-bit ' +
       'hardware; SHA-256 is smaller to store and transmit and is what most protocols already ' +
       'specify. Match whatever the system you are talking to expects.'],
      ['Can I recover the original text from a SHA-256 hash?',
       'No. It is one-way. As with MD5, so-called reverse lookup services are just dictionaries ' +
       'of previously hashed common strings — which is why unsalted hashes of predictable inputs ' +
       'leak information even when the algorithm is sound.'],
    ],
  },
  'password-generator': {
    intro:
      'Generates random passwords from your browser\'s cryptographic random number generator, ' +
      'with control over length, which character sets are used and which characters to exclude ' +
      '— and it shows the resulting entropy in bits, so you can see what each choice actually ' +
      'buys you.',
    sections: [
      {
        h: 'What the entropy figure means',
        p: 'Entropy here is length × log₂(pool size): the number of bits of genuine randomness in ' +
           'the password. With all four sets enabled the pool is 88 characters, worth about 6.46 ' +
           'bits each, so a 16-character password carries roughly 103 bits. That is not a number any ' +
           'amount of computing power reaches. The figure is only meaningful because the characters ' +
           'are drawn at random — a human-invented password that looks equally complicated, like a ' +
           'word with letters swapped for symbols, may carry twenty bits, because the guessing ' +
           'attack knows the rules people use.',
      },
      {
        h: 'Excluding lookalike characters is nearly free',
        p: 'Striking out 0, O, l, 1 and I drops the pool from 88 characters to 83, which costs about ' +
           '0.08 bits per character — roughly one bit on a 16-character password. If you will ever ' +
           'read the password off a screen, dictate it over a phone, or type it on a TV remote, that ' +
           'is a trade worth making every time. The entropy figure updates to reflect whatever you ' +
           'exclude.',
      },
      {
        h: 'Length beats complexity, consistently',
        p: 'Adding one character to a full-pool password adds about 6.5 bits. Turning on the symbol ' +
           'set for a 16-character alphanumeric password adds about 11 bits in total. Going from 16 ' +
           'characters to 20 adds 26. If a site rejects symbols — and plenty still do — the fix is ' +
           'not to agonise over the character set, it is to make the password longer.',
      },
      {
        h: 'What to do with it once it exists',
        p: 'A password this random cannot be remembered, which is the point: it belongs in a ' +
           'password manager, entered once and never typed again. Reserve the passwords you memorise ' +
           'for the handful of secrets that unlock everything else — the manager itself, your device ' +
           'login, your email. Nothing generated here is transmitted or stored; it exists only in ' +
           'this tab, so copy it before you navigate away.',
      },
    ],
    steps: [
      'Set the length with the slider — anywhere from 8 to 64 characters.',
      'Toggle the character sets the destination site will accept.',
      'Optionally list characters to exclude, such as 0Ol1I.',
      'Choose how many passwords to produce at once, then press Generate and copy the one you ' +
       'want.',
    ],
    notes: [
      'Randomness comes from crypto.getRandomValues, the browser\'s cryptographically secure ' +
       'generator — not Math.random.',
      'Each password is guaranteed to contain at least one character from every set you ' +
       'enabled, so it passes the usual site validation rules on the first try.',
      'Generate 5, 10 or 20 at a time when you are setting up several accounts in one sitting.',
    ],
    faq: [
      ['Are the generated passwords sent anywhere or saved?',
       'No. They are produced in your browser and never leave the page — no request is made and ' +
       'nothing is written to storage. Closing or reloading the tab destroys them, so copy one ' +
       'into your password manager before you leave.'],
      ['Why does it force a character from each selected set?',
       'Because a genuinely random 16-character password has a real chance of containing no ' +
       'digit, and a great many sites reject it for that. Constraining one position per set ' +
       'narrows the search space by a fraction of a bit at these lengths — an invisible cost ' +
       'next to retrying the form.'],
      ['Is 16 characters enough in 2026?',
       'For a random password, comfortably. Sixteen characters from a mixed pool is about 103 ' +
       'bits; the entire Bitcoin network would need vastly longer than the age of the universe ' +
       'to search it. Real accounts are lost to reuse, phishing and breaches — not to brute ' +
       'force — which is why a unique password per site matters more than another four ' +
       'characters.'],
    ],
  },

  // ── UNITS ─────────────────────────────────────────────────────────────────────
  'temperature-converter': {
    intro:
      'Converts between Celsius, Fahrenheit, Kelvin, Rankine, Réaumur and Rømer, showing every ' +
      'scale at once as you type. Enter 180 in Celsius and you get the oven setting in ' +
      'Fahrenheit, the absolute temperature in kelvin, and three historical scales alongside.',
    sections: [
      {
        h: 'Temperature is the one conversion with an offset',
        p: 'Every other unit conversion is a single multiplication: a metre is always 3.28 feet, and ' +
           'half a metre is half of that. Temperature scales disagree about where zero sits as well ' +
           'as how big a degree is, so converting a reading needs both a ratio and an offset. The ' +
           'practical consequence catches people out constantly: you cannot convert a temperature ' +
           '*difference* the same way you convert a temperature. A rise of 10°C is a rise of 18°F, ' +
           'not 50°F — for differences you apply the ratio (9/5) and skip the offset entirely.',
      },
      {
        h: 'The six scales, and who still uses them',
        p: 'Celsius is the everyday metric scale, fixed to water\'s freezing and boiling points at ' +
           'one atmosphere. Fahrenheit remains in ordinary use in the United States and a few ' +
           'Caribbean territories. Kelvin is the SI unit, starting at absolute zero, with degrees ' +
           'the same size as Celsius — and written without a degree sign. Rankine is the same idea ' +
           'applied to Fahrenheit-sized degrees and survives in American thermodynamics and ' +
           'aerospace work. Réaumur, which puts water\'s boiling point at 80°, is why some Italian ' +
           'and Swiss cheesemaking recipes carry numbers that look wrong, and it appears throughout ' +
           '19th-century Russian and French literature. Rømer, from 1701, is the scale Fahrenheit ' +
           'was adapting when he devised his own.',
      },
      {
        h: 'Reference points worth memorising',
        p: '−40° is the single point where Celsius and Fahrenheit agree. Absolute zero is 0 K, ' +
           '−273.15°C, −459.67°F. Water freezes at 0°C / 32°F and boils at 100°C / 212°F at sea ' +
           'level — noticeably lower up a mountain. A moderate oven is 180°C / 356°F, and a hot one ' +
           '220°C / 428°F. Normal body temperature is 37°C, which is 98.6°F.',
      },
      {
        h: 'About the decimals',
        p: 'Celsius to Fahrenheit multiplies by 9/5, which does not terminate in decimal, so most ' +
           'conversions are rounded for display rather than exact. For cooking and weather this is ' +
           'irrelevant; for laboratory work, convert once at the end rather than round-tripping ' +
           'through several scales, since each rounding compounds.',
      },
    ],
    steps: [
      'Type the temperature you have into the input box.',
      'Pick the scale it is measured in.',
      'Read the equivalent on every other scale — the results update live, with no button to ' +
       'press.',
    ],
    notes: [
      'Kelvin and Rankine are absolute scales, so negative values are physically impossible; a ' +
       'negative kelvin reading means the input scale is set wrongly.',
      'Kelvin takes no degree symbol: 310 K, never 310°K.',
      'Conversion works in both directions — change which scale the input is in and everything ' +
       'recalculates.',
    ],
    faq: [
      ['What is the formula for Celsius to Fahrenheit?',
       'F = C × 9/5 + 32. In your head, double the Celsius figure and add 30: it lands within ' +
       'about 3 degrees across normal weather, which is close enough to decide on a jacket. ' +
       'Going the other way, C = (F − 32) × 5/9.'],
      ['Why is normal body temperature quoted as 98.6°F?',
       'Because it is 37°C converted exactly. Carl Wunderlich\'s 19th-century average was about ' +
       '36.8°C, rounded to 37 for convenience; converting that rounded figure produced a number ' +
       'with a spurious extra digit of precision. Modern studies put the average nearer 36.6°C, ' +
       'and healthy individuals vary by a degree over the course of a day.'],
      ['What is Réaumur and will I ever meet it?',
       'An 18th-century scale with water freezing at 0° and boiling at 80°, so one Réaumur ' +
       'degree equals 1.25 Celsius degrees. You will meet it in old European recipes, ' +
       'particularly Italian and Swiss cheesemaking, and in Russian novels — which is exactly ' +
       'when you need a converter.'],
    ],
  },
  'weight-converter': {
    intro:
      'Converts between kilograms, grams, milligrams, micrograms, metric tons, pounds, ounces, ' +
      'stones, US and UK tons, carats and grains — every unit shown at once, in both ' +
      'directions. It exists mainly because three different things are all called a “ton” and ' +
      'two different things are called an “ounce”.',
    sections: [
      {
        h: 'This converts mass, which is not quite weight',
        p: 'Strictly, a kilogram is a mass and weight is a force — what gravity does to that mass, ' +
           'measured in newtons. Bathroom scales, shipping manifests and recipes all say weight but ' +
           'record mass, which is why your reading is the same in Delhi and Denver and would be the ' +
           'same on the Moon. Every conversion here is a mass conversion, so it holds anywhere. The ' +
           'distinction only bites in physics problems and in engineering units like kilogram-force.',
      },
      {
        h: 'The pound is defined from the kilogram, exactly',
        p: 'Since the international yard and pound agreement of 1959, one avoirdupois pound is ' +
           'exactly 0.45359237 kilograms — a definition, not a measurement. Imperial mass units have ' +
           'been metric underneath for nearly seventy years. Going the other way, one kilogram is ' +
           '2.2046226 pounds, which is where the familiar “multiply by 2.2” comes from; the shortcut ' +
           'is about 0.2% low, so 100 kg is 220.5 lb rather than 220.',
      },
      {
        h: 'Three tons, and a 10% error waiting to happen',
        p: 'A metric ton (tonne) is 1,000 kg. A US short ton is 2,000 pounds, or about 907 kg. A UK ' +
           'long ton is 2,240 pounds, about 1,016 kg. Freight quotes, emissions figures and ' +
           'commodity prices usually mean metric, but American domestic shipping often means short — ' +
           'a 10% difference that turns into real money at scale. If a document does not say which, ' +
           'it is worth asking.',
      },
      {
        h: 'Ounces, carats and grains',
        p: 'The ounce in this converter is the avoirdupois ounce, 28.3495 g, used for food and ' +
           'postage. Precious metals are priced in troy ounces, 31.1035 g, which is why a “one ' +
           'ounce” gold coin is about 10% heavier than a kitchen ounce — and a fluid ounce is a ' +
           'volume and belongs to a different converter altogether. A carat is exactly 0.2 g and ' +
           'applies to gemstones; the karat that measures gold purity is a different word for a ' +
           'different thing. Grains, at 0.0648 g, still measure bullets, arrows and some ' +
           'pharmaceutical doses.',
      },
    ],
    steps: [
      'Enter the number you have.',
      'Choose its unit from the list.',
      'Read every other unit at once — or set the target unit if you only want one conversion.',
    ],
    notes: [
      'Metric prefixes are exact powers of ten; the imperial conversions use the exact 1959 ' +
       'definitions rounded for display.',
      'One stone is 14 pounds, or 6.35029 kg — still the standard way body weight is quoted in ' +
       'Britain and Ireland.',
      'For very small or very large values the results switch to scientific notation rather ' +
       'than silently rounding to zero.',
    ],
    faq: [
      ['How do I convert kilograms to pounds?',
       'Multiply by 2.20462. So 70 kg is 154.3 lb and 80 kg is 176.4 lb. For a rough figure, ' +
       'double it and add a tenth: 70 → 140 + 14 = 154, which is accurate to well under a pound ' +
       'in the human range.'],
      ['Is a metric ton the same as a ton?',
       'No, and the gap is not small. A metric ton is 1,000 kg; a US short ton is 907 kg and a ' +
       'UK long ton is 1,016 kg. Carbon figures, shipping weights and most international trade ' +
       'mean metric tons — but American domestic contexts frequently mean short tons.'],
      ['Why is a gold ounce heavier than a kitchen ounce?',
       'They are different units. Bullion uses the troy ounce at 31.1035 g; food and post use ' +
       'the avoirdupois ounce at 28.3495 g — about 10% lighter. This converter uses avoirdupois, ' +
       'so divide a bullion weight by 31.1035 to get grams rather than using the ounce field.'],
    ],
  },

  // ── JSON ──────────────────────────────────────────────────────────────────────
  'json-minifier': {
    intro:
      'Strips every byte of insignificant whitespace from JSON, producing the smallest ' +
      'spec-compliant form of the same data. It parses your input first, so anything invalid is ' +
      'reported as an error rather than silently mangled.',
    sections: [
      {
        h: 'Minifying is parse-then-restringify, not find-and-replace',
        p: 'The tool runs your text through a real JSON parser and re-serialises the result with no ' +
           'indentation. That matters, because a regular expression that deleted whitespace would ' +
           'also delete the spaces inside your string values. It also has consequences worth knowing ' +
           'before you diff the output against the input: key order is preserved, but duplicate keys ' +
           'collapse to the last occurrence, and numbers come back in JavaScript\'s canonical form — ' +
           '1.0 becomes 1, 1e3 becomes 1000, and 0.30000000000000004 stays exactly that. The upside ' +
           'is that the output is guaranteed to be valid JSON.',
      },
      {
        h: 'How much you actually save, honestly',
        p: 'Pretty-printed JSON with two-space indentation is typically 15–30% whitespace, and ' +
           'deeply nested structures with short values are at the high end. But whitespace is the ' +
           'single most compressible thing in a file: once gzip or Brotli has run over it, the ' +
           'difference between minified and formatted JSON is usually a couple of percent. Minifying ' +
           'pays off where the JSON is stored or embedded *uncompressed* — localStorage quotas, a ' +
           'data attribute in HTML, a database column, an environment variable, the payload of a QR ' +
           'code, a URL fragment.',
      },
      {
        h: 'What it deliberately does not do',
        p: 'It does not shorten or rename keys, strip null or empty values, reorder anything, or ' +
           'change your structure in any way. Minification is purely a change of representation, and ' +
           'it is fully reversible — running the output through the JSON formatter gives you an ' +
           'indented document back. If you need the payload genuinely smaller rather than merely ' +
           'tidier, that is a schema problem: shorter key names, or a binary format such as ' +
           'MessagePack or CBOR.',
      },
    ],
    steps: [
      'Paste the JSON you want to compress.',
      'The minified output appears immediately, with the before and after byte counts.',
      'Copy the result, or fix the reported syntax error if the input would not parse.',
    ],
    notes: [
      'JSON has no comments. If your file has // or /* */ in it, it is JSONC or JSON5 and will ' +
       'fail to parse here — strip the comments first.',
      'Integers beyond 2⁵³ lose precision when parsed, because JSON numbers become IEEE-754 ' +
       'doubles. Large IDs should travel as strings.',
      'Everything runs in the browser, so API responses and config files with credentials in ' +
       'them are never transmitted.',
    ],
    faq: [
      ['Does minifying change my data?',
       'The values stay the same, but their representation can be normalised: numbers are ' +
       're-emitted in canonical form, escape sequences in strings may be written differently, ' +
       'and duplicate keys — which JSON permits but nothing sensible relies on — collapse to the ' +
       'last one. If you need a byte-for-byte reversible round trip, do not minify.'],
      ['Will minified JSON break my API or parser?',
       'No. Whitespace between tokens carries no meaning in JSON, so every conforming parser ' +
       'reads the minified form identically. It is only harder for humans.'],
      ['Is it worth minifying if my server already gzips responses?',
       'For bandwidth, barely — compression removes almost all of what minification would have ' +
       'removed. It is still worth it for anything stored uncompressed, and it slightly reduces ' +
       'the work the parser does on very large documents.'],
    ],
  },
  'json-diff': {
    intro:
      'Compares two JSON documents key by key and lists exactly what was added, removed and ' +
      'changed, with a dotted path to each difference. It is meant for the moment when two API ' +
      'responses should be identical and are not, and a text diff drowns you in reformatting ' +
      'noise.',
    sections: [
      {
        h: 'Formatting and key order are invisible to it',
        p: 'Both sides are parsed before anything is compared, so indentation, line endings, ' +
           'trailing commas in your editor and the order the keys happen to appear in never show up ' +
           'as differences. That is the whole reason to use a structural diff: run two versions of ' +
           'the same API response through a text diff and you will spend most of your attention on ' +
           'lines that only moved. Here, if the data is the same, the result says so.',
      },
      {
        h: 'How nesting is handled — and how arrays are not',
        p: 'The comparison recurses into nested objects, so you get precise paths like ' +
           'user.address.city rather than a note that “user changed”. Arrays are treated as single ' +
           'values: change one element of a fifty-item list and you get one changed row showing both ' +
           'arrays in full, not an element-by-element diff. This is a deliberate limitation — ' +
           'diffing arrays properly means guessing whether an item was edited, inserted or moved, ' +
           'and guessing wrong is worse than not guessing. For array-heavy payloads, compare a ' +
           'single element at a time, or sort both sides by a stable key first.',
      },
      {
        h: 'Reading the output',
        p: 'A green + is a key present only in the second document, a red − is one present only in ' +
           'the first, and an amber ~ is a key in both whose value differs, printed as old → new. ' +
           'Keys that match are counted in the summary but left out of the list, so a long document ' +
           'with one change produces one line. A type change — the string "1" becoming the number 1 ' +
           '— shows as a change, which is usually the bug you were looking for.',
      },
      {
        h: 'What people use it for',
        p: 'Catching an API regression between staging and production. Finding configuration drift ' +
           'between two environments that are supposed to match. Confirming that a data migration ' +
           'touched only the fields it was meant to. Reviewing what a dependency update did to ' +
           'package.json or tsconfig.json. Checking that a refactor left a serialised payload ' +
           'unchanged.',
      },
    ],
    steps: [
      'Paste the original document into the left panel.',
      'Paste the version you are comparing against into the right panel.',
      'Read the added, removed and changed counts, then work down the list of paths — it ' +
       'updates as you edit either side.',
    ],
    notes: [
      'Both inputs must be valid JSON; a syntax error on either side stops the comparison ' +
       'rather than producing a partial result.',
      'A top-level array is compared as a single value, so wrap arrays in an object if you need ' +
       'per-key detail.',
      'Nothing is uploaded — both documents stay in the page, which matters when you are ' +
       'comparing production payloads.',
    ],
    faq: [
      ['Does the order of keys count as a difference?',
       'No. JSON objects are unordered by definition, and the tool parses before comparing, so ' +
       'reordered keys produce no differences at all. Only added, removed and genuinely changed ' +
       'values are reported.'],
      ['Why is my whole array reported as one change?',
       'Because arrays are compared as complete values rather than element by element. It is an ' +
       'honest limitation: inferring whether an array item was edited, inserted or moved ' +
       'requires assumptions this tool does not make. Compare individual elements when you need ' +
       'that detail.'],
      ['Can it compare more than two documents?',
       'Not at once — it compares a pair. For three versions, diff A against B and then B ' +
       'against C; the two result sets together tell you what moved at each step.'],
    ],
  },

  // ── TEXT ──────────────────────────────────────────────────────────────────────
  'character-counter': {
    intro:
      'Counts characters with and without spaces as you type, alongside words, lines, unique ' +
      'characters and digits, and checks your text live against the limits that actually bite — ' +
      'X/Twitter, SMS, meta description, title tag, Instagram and LinkedIn — plus any custom ' +
      'limit you set.',
    sections: [
      {
        h: 'Why two character counters can disagree',
        p: 'JavaScript counts UTF-16 code units, which is what almost every character counter on the ' +
           'web reports. Ordinary letters are one each, but most emoji are two, and a composed emoji ' +
           'such as a family with a skin-tone modifier can be eight or more. Accented letters can be ' +
           'one or two depending on how they were typed: é entered directly is a single precomposed ' +
           'character, while é pasted from some editors is an e followed by a combining accent. So a ' +
           'count here is an accurate count of code units — and a tool that counts visible glyphs ' +
           'will give you a different, equally correct number. When a platform enforces a limit, it ' +
           'is worth knowing which of the two it counts.',
      },
      {
        h: 'The SMS limit is not really 160',
        p: 'A single SMS holds 160 characters only while every character is in the GSM-7 alphabet. ' +
           'One character outside it — an emoji, a curly quote pasted from a word processor, most ' +
           'non-Latin scripts — switches the entire message to UCS-2 encoding, and the limit drops ' +
           'to 70. Longer messages are split into concatenated segments, and each segment gives up ' +
           'space to a header, leaving 153 characters per part (67 in UCS-2). The practical ' +
           'consequence: adding one emoji to a 160-character marketing message can turn one billed ' +
           'message into three.',
      },
      {
        h: 'Search snippet limits are measured in pixels',
        p: 'Google truncates titles and descriptions by rendered width, not character count, so the ' +
           'familiar 60 and 160 are rules of thumb rather than rules. A title in wide capitals is ' +
           'cut earlier than one in narrow lowercase, and mobile and desktop results truncate at ' +
           'different points. Treat the presets here as targets: get the important words in early ' +
           'enough that the meaning survives truncation, rather than optimising to the last ' +
           'character.',
      },
      {
        h: 'What counts as a word and a line',
        p: 'Words are runs of characters separated by whitespace, so a hyphenated compound counts as ' +
           'one and an em dash with spaces around it counts as one more. Lines count newline ' +
           'characters, so a long paragraph that wraps on screen is still a single line. Unique ' +
           'characters are case-insensitive and ignore whitespace, which makes them a quick way to ' +
           'spot an unexpected character in a string you are debugging.',
      },
    ],
    steps: [
      'Type or paste your text — every figure updates on each keystroke.',
      'Enter a custom limit if the platform you are writing for is not in the presets; a ' +
       'progress bar shows how much room is left and turns red when you go over.',
      'Watch the platform cards to see at a glance which limits you are already past.',
    ],
    notes: [
      'Counting is live — there is no button and no submit step.',
      'Your text stays in the page; nothing is sent to a server, so drafts and client copy are ' +
       'safe to paste.',
      'X/Twitter counts every URL as a fixed 23 characters regardless of its real length; this ' +
       'tool counts the characters you actually typed, so a post with long links has more ' +
       'headroom than it appears.',
    ],
    faq: [
      ['Do spaces count toward a character limit?',
       'On X/Twitter, SMS and meta descriptions, yes — spaces are characters like any other. ' +
       'Some academic and publishing word limits are specified without spaces, which is why this ' +
       'tool shows both figures side by side.'],
      ['Why does one emoji add two to my count?',
       'Because most emoji sit outside the Basic Multilingual Plane and are stored as a ' +
       'surrogate pair — two UTF-16 code units. Emoji built from several parts, such as flags or ' +
       'family groups joined by zero-width joiners, add considerably more.'],
      ['How long should a meta description be?',
       'Aim for 150–160 characters, and make sure the sentence still makes sense if it is cut at ' +
       '120 — Google rewrites or truncates descriptions routinely, and rewrites them more often ' +
       'when they do not match the query. A title is safest around 50–60.'],
    ],
  },

  // ── EVERYDAY ──────────────────────────────────────────────────────────────────
  'stopwatch': {
    intro:
      'A stopwatch that counts in hundredths of a second, records lap times, and shows the ' +
      'reading big enough to read from across a room. Start, pause and resume without losing ' +
      'the elapsed total.',
    sections: [
      {
        h: 'It uses a monotonic clock, not the wall clock',
        p: 'Timing is taken from performance.now(), a counter that only ever moves forward, rather ' +
           'than the system clock. That means an NTP correction, a daylight-saving change, a ' +
           'timezone switch or someone adjusting the device clock mid-run cannot corrupt the ' +
           'measurement — all of which can and do happen to a naive timer built on the current date. ' +
           'For a run measured in hours, this is the difference between a reliable result and a ' +
           'mysterious one.',
      },
      {
        h: 'What happens when you switch tabs',
        p: 'The display is driven by the browser\'s animation loop, which is throttled or suspended ' +
           'entirely in a background tab to save battery, so the digits may freeze while you are ' +
           'elsewhere. The measurement does not. Elapsed time is recalculated from the start ' +
           'timestamp on every frame rather than accumulated tick by tick, so when you come back the ' +
           'reading jumps straight to the correct value. You can safely leave it running in another ' +
           'tab. Phones are less forgiving: locking the screen may suspend the page altogether, so ' +
           'keep the display awake for a long timed run.',
      },
      {
        h: 'Laps are totals, not splits',
        p: 'Pressing Lap records the total elapsed time at that instant, newest at the top. To get ' +
           'the duration of an individual lap, subtract the row below it — so laps at 1:02.40 and ' +
           '2:08.15 mean a second lap of 1:05.75. Recording cumulative times is the convention in ' +
           'athletics because it avoids the rounding drift you get from adding up individually ' +
           'rounded splits.',
      },
      {
        h: 'How precise it really is',
        p: 'The readout shows hundredths. Browsers deliberately coarsen their high-resolution timers ' +
           '— usually to somewhere between 100 microseconds and a millisecond — as a defence against ' +
           'timing side-channel attacks, which is still far finer than the display. The genuine ' +
           'limit is you: human reaction time on a start or stop press is around two tenths of a ' +
           'second, so treat the hundredths as tidy rather than authoritative for anything ' +
           'hand-triggered.',
      },
    ],
    steps: [
      'Press Start to begin.',
      'Press Lap at each checkpoint — times are listed newest first.',
      'Pause to stop temporarily; pressing Start again continues from where it stopped.',
      'Reset clears both the clock and the lap list.',
    ],
    notes: [
      'Pause preserves the elapsed total — only Reset clears it.',
      'Works offline once the page has loaded.',
      'Closing the tab ends the run; switching to another tab does not.',
    ],
    faq: [
      ['Does the stopwatch keep running if I switch to another tab?',
       'Yes. The on-screen digits may stop updating because browsers throttle background tabs, ' +
       'but the elapsed time is derived from the start timestamp, so the moment you return it ' +
       'shows the correct figure. Closing the tab is what ends the run.'],
      ['Is it accurate enough for sports timing?',
       'For training, intervals and cooking, comfortably. For competitive results it is not, and ' +
       'neither is any hand-pressed stopwatch — official timing uses electronic gates precisely ' +
       'because a human finger costs a couple of tenths at each end.'],
      ['Can I keep my lap times after closing the page?',
       'No — the laps live in the page and are lost on reload. Copy or screenshot the table ' +
       'before you leave if you need to keep them.'],
    ],
  },
  'coin-flip': {
    intro:
      'Flips a fair virtual coin, with a short spin animation, a running tally of heads and ' +
      'tails, and a history of your last twenty results. Useful for settling a decision, ' +
      'splitting teams, or demonstrating what randomness actually looks like.',
    sections: [
      {
        h: 'The randomness is cryptographic, not Math.random',
        p: 'Each flip draws from crypto.getRandomValues, which is fed by the operating system\'s ' +
           'entropy pool, rather than the ordinary pseudo-random generator built into JavaScript. ' +
           'For deciding who buys coffee the difference is academic; the reason to do it anyway is ' +
           'that a pseudo-random sequence is reproducible in principle from its seed, while this one ' +
           'is not predictable by anyone — including whoever wrote this page.',
      },
      {
        h: 'A real coin is not quite 50/50; this one is',
        p: 'Physical coin flips carry a small bias. Diaconis, Holmes and Montgomery showed in 2007 ' +
           'that a flipped coin tends to land on the same face it started on slightly more often ' +
           'than not, because it precesses rather than tumbling cleanly about a fixed axis. A 2023 ' +
           'study that recorded 350,757 flips by hand measured that same-side bias at about 50.8%. ' +
           'Spinning a coin on a table is far worse — the milled edge makes some coins land tails ' +
           'around 80% of the time. A virtual flip has no physics to be biased by.',
      },
      {
        h: 'Streaks are normal, and the counter will not even out',
        p: 'In twenty flips, a run of four identical results is more likely than not. Eight heads in ' +
           'a row has a probability of one in 256, which over an evening of flipping is ' +
           'unremarkable. The heads and tails tallies shown here will not converge on equality ' +
           'either: the expected *proportion* approaches half, but the expected *gap* between the ' +
           'two counts grows roughly with the square root of the number of flips. After a hundred ' +
           'flips a 57–43 split is ordinary. Nothing corrects a streak — each flip has no memory of ' +
           'the ones before it.',
      },
      {
        h: 'The honest use for a coin flip',
        p: 'Assign the options before you flip, then notice how you feel when the result lands. If ' +
           'you are disappointed, you already knew which one you wanted and the coin has told you ' +
           'something more useful than the answer it gave. For genuinely equivalent options, take ' +
           'the result and move on — the cost of deliberating further exceeds the difference between ' +
           'them.',
      },
    ],
    steps: [
      'Decide which option is heads and which is tails before flipping.',
      'Press Flip Coin and wait for the spin to settle.',
      'Check the tally and the recent-results strip if you are flipping repeatedly.',
    ],
    notes: [
      'The history keeps the last twenty results; older ones drop off.',
      'The spin is animation only — the outcome is drawn when the animation ends, and holding ' +
       'the button down or flipping faster changes nothing.',
      'Works offline once the page has loaded.',
    ],
    faq: [
      ['Is this coin flip genuinely 50/50?',
       'Yes. Every flip draws a fresh value from the browser\'s cryptographic random number ' +
       'generator and maps it to two equally sized outcomes. There is no weighting and no memory ' +
       'of previous flips — which, as it happens, makes it fairer than a real coin.'],
      ['Can the outcome be predicted or influenced?',
       'No. The values come from the operating system\'s entropy pool, not from a seed anyone can ' +
       'observe or reproduce. Pressing at a particular moment or flipping repeatedly does not ' +
       'shift the odds.'],
      ['Why did I just get seven tails in a row?',
       'Because that has a probability of about one in 128, and unlikely things happen ' +
       'constantly when you repeat a trial. A run like that is not evidence of bias, and it does ' +
       'not make heads more likely next time — believing it does is the gambler\'s fallacy.'],
    ],
  },
  'length-converter': {
    intro:
      'Converts between kilometres, metres, centimetres, millimetres, micrometres, nanometres, ' +
      'miles, yards, feet, inches, nautical miles, astronomical units and light years — every ' +
      'unit at once, in both directions. Most visits are one of two questions: how many ' +
      'centimetres is an inch, and how many kilometres is a mile.',
    sections: [
      {
        h: 'The imperial units are metric by definition',
        p: 'Since 1959 an inch is exactly 2.54 centimetres, a foot exactly 0.3048 m, a yard exactly ' +
           '0.9144 m and a mile exactly 1609.344 m. These are definitions agreed between the ' +
           'English-speaking standards bodies, not measurements, so inch-to-centimetre conversions ' +
           'are exact rather than approximate. The one holdout is the US survey foot, very slightly ' +
           'larger, which was used for land surveying until it was formally retired at the end of ' +
           '2022 — it differs by about 3 mm per kilometre, which is nothing for a room and a great ' +
           'deal for a county boundary.',
      },
      {
        h: 'Nautical miles are not a rounding of miles',
        p: 'A nautical mile is 1852 m exactly, defined as one minute of latitude, which is why it ' +
           'survives in marine and aviation navigation: a degree of latitude is sixty nautical miles ' +
           'anywhere on Earth, so distance and chart position share a scale. A knot is one nautical ' +
           'mile per hour. It is about 15% longer than a statute mile, enough that mixing them up in ' +
           'a flight plan matters.',
      },
      {
        h: 'Where the big units come from',
        p: 'An astronomical unit is 149,597,870,700 m exactly — formerly the Earth–Sun distance, now ' +
           'a fixed number, because the actual distance varies over a year. A light year is the ' +
           'distance light travels in a Julian year, about 9.46 trillion kilometres. Both are ' +
           'included here mostly for homework and curiosity; professional astronomy tends to use ' +
           'parsecs.',
      },
      {
        h: 'Height, and the trap of decimal feet',
        p: 'Converting 175 cm gives 5.74 feet, which is not 5 feet 7 inches — the 0.74 is a fraction ' +
           'of a foot, so multiply it by 12 to get 8.9 inches, making 5\'9". This catches people out ' +
           'constantly with height and with timber measurements. Work in inches and divide by 12 at ' +
           'the end if you want feet-and-inches rather than decimal feet.',
      },
    ],
    steps: [
      'Type the measurement you have.',
      'Choose the unit it is in.',
      'Read the equivalent in every other unit — results update as you type, with no button.',
    ],
    notes: [
      'Metric conversions are exact powers of ten; imperial conversions use the exact 1959 ' +
       'definitions.',
      'Very large or very small results switch to scientific notation rather than rounding to ' +
       'zero.',
      'One inch is exactly 2.54 cm, and one mile is exactly 1.609344 km — both by definition.',
    ],
    faq: [
      ['How many centimetres are in an inch?',
       'Exactly 2.54. It is a definition rather than a measured value, so the conversion never ' +
       'carries any error. Going the other way, a centimetre is about 0.3937 inches.'],
      ['How do I convert kilometres to miles in my head?',
       'Multiply by 0.62, or take the kilometre figure, halve it and add a tenth: 80 km → 40 + 8 ' +
       '= 48 miles, against a true 49.7. The Fibonacci trick also works oddly well — consecutive ' +
       'Fibonacci numbers are roughly km and miles, so 8 km ≈ 5 miles and 13 km ≈ 8 miles.'],
      ['Why does my height come out as a decimal?',
       'Because feet and inches are two units, and the converter returns one number. Convert to ' +
       'inches, take the whole number of feet by dividing by 12, and the remainder is the ' +
       'inches: 175 cm is 68.9 inches, which is 5 feet and 8.9 inches.'],
    ],
  },
  'uuid-generator': {
    intro:
      'Generates version 4 UUIDs — 128-bit identifiers built entirely from random bits — in ' +
      'batches, with optional uppercase and brace formatting. These are the identifiers you ' +
      'reach for when two systems must each invent a unique key without talking to each other.',
    sections: [
      {
        h: 'What the 122 random bits buy you',
        p: 'A UUID is 128 bits, but six are fixed: four mark it as version 4 (the 13th hex digit is ' +
           'always 4) and two mark the variant (the 17th is always 8, 9, a or b). That leaves 122 ' +
           'bits of randomness, drawn here from crypto.getRandomValues. The practical upshot is that ' +
           'you can generate a billion UUIDs a second for a century and the chance of a single ' +
           'collision stays negligible — which is why systems can mint identifiers offline, on a ' +
           'phone in flight mode, and safely merge them into a shared database later.',
      },
      {
        h: 'Version 4 is not the only option, and sometimes not the best one',
        p: 'Version 1 UUIDs encode a timestamp and the machine\'s MAC address, which makes them ' +
           'sortable but leaks where and when they were made. Version 7, standardised in 2024, keeps ' +
           'the sortability by putting a millisecond timestamp in the high bits while filling the ' +
           'rest with randomness. That matters if you use UUIDs as primary keys: random v4 keys ' +
           'scatter inserts across a B-tree index and fragment it, while time-ordered keys append. ' +
           'For most application-level identifiers v4 is the right, boring default.',
      },
      {
        h: 'Formatting: hyphens, braces and case',
        p: 'The canonical text form is 36 characters, lowercase, in 8-4-4-4-12 groups. Microsoft ' +
           'ecosystems traditionally wrap GUIDs in braces and often uppercase them, and some ' +
           'databases store the 32 hex digits with the hyphens stripped. All are the same 128 bits, ' +
           'so compare UUIDs case-insensitively and normalise before storing. Postgres has a native ' +
           'uuid type that stores 16 bytes rather than 36 characters — worth using.',
      },
    ],
    steps: [
      'Choose how many UUIDs you want.',
      'Toggle uppercase or braces if the system you are feeding expects them.',
      'Press generate, then copy individually or take the whole batch at once.',
    ],
    notes: [
      'Every UUID is generated with crypto.getRandomValues, not Math.random — so they are ' +
       'suitable as unguessable identifiers, though not as secrets in their own right.',
      'The version and variant bits are set correctly, so these validate as RFC-compliant v4 ' +
       'UUIDs.',
      'Generation happens entirely in your browser; nothing is logged or sent anywhere.',
    ],
    faq: [
      ['Can two UUIDs ever be the same?',
       'In principle yes, in practice no. With 122 random bits you would need to generate about ' +
       '2.7 quintillion UUIDs before reaching a one-in-a-billion chance of any collision. The ' +
       'realistic failure mode is not mathematics but a weak random source — which is why this ' +
       'tool uses the cryptographic generator rather than Math.random.'],
      ['Is a UUID safe to use in a public URL?',
       'As an identifier, yes — a v4 UUID is unguessable, so it will not leak how many records ' +
       'you have the way sequential integers do. But unguessable is not the same as ' +
       'access-controlled: anyone who obtains the URL has the record, so do not treat it as ' +
       'authentication for anything sensitive.'],
      ['What is the difference between a UUID and a GUID?',
       'Nothing, technically. GUID is Microsoft\'s name for the same 128-bit identifier; the ' +
       'differences you see are formatting conventions — braces and uppercase — not different ' +
       'values.'],
    ],
  },

  // ── TEXT ──────────────────────────────────────────────────────────────────────
  'url-slug': {
    intro:
      'Turns a headline into a clean URL slug: lowercase, accents folded to plain ASCII, ' +
      'punctuation removed and spaces collapsed to a single hyphen or underscore. It shows the ' +
      'result as a full URL so you can see the shape of the link before you commit to it.',
    sections: [
      {
        h: 'What gets stripped, and why',
        p: 'Uppercase becomes lowercase, because URLs are case-sensitive after the domain and having ' +
           '/About and /about resolve to different pages is a reliable source of duplicate-content ' +
           'problems. Accented Latin characters are folded to their base letter — café becomes cafe, ' +
           'straße becomes strasse, æ becomes ae — rather than percent-encoded, which would turn a ' +
           'readable slug into %C3%A9 soup. Punctuation, quotation marks and emoji are removed ' +
           'outright, and any run of spaces, hyphens or underscores collapses into one separator.',
      },
      {
        h: 'Hyphens, not underscores',
        p: 'Google has said for years that it treats a hyphen as a word separator and an underscore ' +
           'as a word joiner, so my_blog_post can be read as one token while my-blog-post is three ' +
           'words. Hyphens are also the overwhelming convention, which matters when someone types ' +
           'your URL from memory. The underscore option is here for the cases where a platform or an ' +
           'existing URL scheme forces your hand — not as a coin toss.',
      },
      {
        h: 'How long a slug should be',
        p: 'Short enough to read in a search result and specific enough to be guessable. Three to ' +
           'six meaningful words is a good band. Strip the stop words that carry nothing — a, the, ' +
           'of, how-to — unless removing them makes the slug ambiguous. Dates are usually a mistake: ' +
           '/2024/03/guide ages your article visibly and makes it awkward to refresh the content ' +
           'later without either lying or breaking the URL.',
      },
      {
        h: 'Changing a slug later is not free',
        p: 'A published URL accumulates links, bookmarks and search history. If you must change one, ' +
           'serve a 301 redirect from the old slug to the new one and keep it indefinitely — the ' +
           'ranking signals transfer, but only through the redirect. Getting it right the first time ' +
           'is cheaper than maintaining a redirect table, which is the actual reason to think about ' +
           'the slug before publishing rather than after.',
      },
    ],
    steps: [
      'Paste your title or heading.',
      'Pick hyphen or underscore as the separator — hyphen unless something forces otherwise.',
      'Copy the slug, or the full example URL shown beneath it.',
    ],
    notes: [
      'Accented Latin characters are transliterated; non-Latin scripts such as Cyrillic, ' +
       'Devanagari or Chinese are removed rather than transliterated, so those titles need a ' +
       'slug written by hand.',
      'Numbers are kept — useful for version numbers and years when you actually want them.',
      'Conversion is instant as you type; nothing is sent to a server.',
    ],
    faq: [
      ['Should a URL slug match the page title exactly?',
       'It should match the meaning, not the words. Titles carry punctuation, brand names and ' +
       'clickbait that add nothing to a URL. “The 7 Best Ways to Merge PDFs (2026 Guide)” makes ' +
       'a better slug as merge-pdf-guide — shorter, no year to go stale, and the important words ' +
       'come first.'],
      ['Do hyphens in URLs hurt SEO?',
       'No — they are the recommended separator. What hurts is the alternatives: spaces become ' +
       '%20, underscores may be read as joining words, and camelCase collides with ' +
       'case-sensitive paths. A hyphenated lowercase slug is the safe default everywhere.'],
      ['What happens to non-English characters?',
       'Accented Latin letters are folded to their ASCII base. Other scripts are dropped, ' +
       'because there is no single correct romanisation and guessing produces worse URLs than ' +
       'asking. If you publish in a non-Latin script, either write the slug yourself or use the ' +
       'native characters — modern browsers handle them, although they appear percent-encoded ' +
       'when copied.'],
    ],
  },
  'find-replace': {
    intro:
      'Find and replace across a whole block of text, with optional case sensitivity and full ' +
      'regular-expression matching, and a count of how many replacements were made. It is the ' +
      'tool for the edit that is too big for a text box and too small to justify opening an ' +
      'editor.',
    sections: [
      {
        h: 'Literal mode is genuinely literal',
        p: 'With the regex box unticked, every character you type in the search field is escaped ' +
           'before matching, so searching for c:\\Users\\ or a price like $9.99 or an expression like ' +
           '(a+b) finds exactly that text. This is the difference from pasting a search term into a ' +
           'tool that always treats input as a pattern, where a stray dot or bracket silently ' +
           'matches the wrong thing. The replacement is literal too: a $ in the replacement field ' +
           'stays a $.',
      },
      {
        h: 'What regex mode adds',
        p: 'Tick the box and the search field becomes a JavaScript regular expression, so you can ' +
           'match patterns rather than strings: \\s+ for runs of whitespace, ^\\s+ for leading ' +
           'indentation, \\d{4} for a year, (\\w+)@(\\w+) for the parts of an address. Capture groups ' +
           'work in the replacement field — $1 is the first group, $2 the second, $& the whole ' +
           'match, and $$ a literal dollar sign. Swapping “John Smith” to “Smith, John” is (\\w+) ' +
           '(\\w+) replaced with $2, $1. An invalid pattern is reported rather than applied.',
      },
      {
        h: 'Replacement counts are the safety net',
        p: 'The badge showing how many replacements were made is the fastest way to catch a mistake. ' +
           'Expecting twelve and seeing four means your pattern is too narrow; expecting twelve and ' +
           'seeing two hundred means it is too broad and is matching inside words. Check the count ' +
           'before you copy the result, particularly with regex — the classic error is replacing a ' +
           'short word like “is” and quietly mangling “this” and “list” as well.',
      },
      {
        h: 'Matching is global by default',
        p: 'Every occurrence is replaced, not just the first. Case sensitivity is off unless you ' +
           'turn it on, so searching for “the” also finds “The” — convenient for cleaning up prose, ' +
           'dangerous when you are editing code or data where case carries meaning. Turn it on for ' +
           'anything machine-readable.',
      },
    ],
    steps: [
      'Paste your text into the input panel.',
      'Type what to find and what to replace it with — leave the replacement empty to delete ' +
       'matches.',
      'Tick regex or case sensitive if you need them, then press Find & Replace.',
      'Check the replacement count, then copy the result.',
    ],
    notes: [
      'Leaving the replacement field empty deletes every match — a quick way to strip unwanted ' +
       'characters.',
      'Regex syntax is JavaScript\'s, so lookbehind, named groups and Unicode property escapes ' +
       'are all available in current browsers.',
      'The original text stays in the left panel, so you can adjust the pattern and run it ' +
       'again without re-pasting.',
    ],
    faq: [
      ['Can I use capture groups like $1 in the replacement?',
       'Yes, in regex mode. $1 to $99 insert capture groups, $& inserts the whole match and $$ ' +
       'inserts a literal dollar. In literal mode the replacement is inserted exactly as typed, ' +
       'so a $1 stays a $1.'],
      ['How do I delete every blank line?',
       'Turn on regex and search for ^\\s*$\\n with an empty replacement. To collapse runs of ' +
       'several blank lines into one instead, search for \\n{3,} and replace with two newlines.'],
      ['Is my text sent to a server?',
       'No. The replacement runs in your browser, which is why this is a reasonable place to ' +
       'clean up a log file, an export or a document you would not paste into an online editor.'],
    ],
  },
  'remove-duplicates': {
    intro:
      'Removes repeated lines from a list, keeping the first occurrence of each and preserving ' +
      'the original order, with a count of how many were dropped. Case sensitivity is optional, ' +
      'which is the setting that decides whether Gmail.com and gmail.com are the same line.',
    sections: [
      {
        h: 'First occurrence wins, and order is kept',
        p: 'Lines are checked in order and the first time a value appears it is kept; every later ' +
           'copy is dropped. Nothing is sorted, so a list that was in a meaningful order — priority, ' +
           'chronology, the order a database returned it — stays that way. That is the difference ' +
           'from the usual command-line approach of sort | uniq, which requires sorting first and ' +
           'destroys whatever order you had.',
      },
      {
        h: 'Whitespace makes lines different',
        p: 'Comparison is exact apart from case, so “admin” and “admin ” with a trailing space are ' +
           'two different lines, as are a line indented with a tab and the same line indented with ' +
           'spaces. This trips people up on data pasted out of a spreadsheet or a PDF, where ' +
           'trailing spaces are invisible and common. If the output still looks duplicated, trim the ' +
           'whitespace first — that is almost always the explanation.',
      },
      {
        h: 'When to turn case sensitivity on',
        p: 'Off is right for email addresses, domains, tags and most human-entered lists, where ' +
           'Contact@Example.com and contact@example.com are the same thing and keeping both is the ' +
           'bug. On is right for anything where case carries meaning: identifiers, file paths on a ' +
           'case-sensitive filesystem, API keys, base64 strings, or a word list where you genuinely ' +
           'want both “Polish” and “polish”.',
      },
    ],
    steps: [
      'Paste your list, one entry per line.',
      'Decide whether case should matter and tick the box accordingly.',
      'Press Remove Duplicates, check the kept and removed counts, then copy the cleaned list.',
    ],
    notes: [
      'Blank lines count as lines — several consecutive blanks collapse to one.',
      'Order is preserved; the tool never sorts your list.',
      'Everything happens in your browser, so mailing lists and exported customer data are safe ' +
       'to paste.',
    ],
    faq: [
      ['Does it keep the first or the last copy of a duplicate?',
       'The first. Everything after it is removed, so if your list is in priority or ' +
       'chronological order the entry that survives is the earliest one.'],
      ['Why are lines that look identical not being removed?',
       'Almost always invisible whitespace — a trailing space or tab from a spreadsheet paste — ' +
       'or a case difference with case sensitivity turned on. A non-breaking space copied from a ' +
       'web page is another frequent culprit, since it looks exactly like a space but is a ' +
       'different character.'],
      ['Can it remove duplicate words rather than duplicate lines?',
       'Not directly — it works line by line. Put one word per line first (find and replace each ' +
       'space with a newline), deduplicate, and join them back up.'],
    ],
  },
  'text-sorter': {
    intro:
      'Sorts lines alphabetically, by length, numerically or into a genuinely random order, ' +
      'with an option to drop duplicates in the same pass. Useful for tidying lists, ordering ' +
      'CSV columns and turning an unstructured dump into something you can scan.',
    sections: [
      {
        h: 'Alphabetical sorting is locale-aware',
        p: 'A to Z uses the browser\'s locale comparison rather than raw character codes, so accented ' +
           'letters land where a reader expects rather than after z, and ä sorts next to a. Raw ' +
           'code-point sorting — what a naive implementation does — puts all uppercase before all ' +
           'lowercase, so Zebra comes before apple. Comparison here is case-insensitive, so apple, ' +
           'Banana and cherry interleave the way you would write them down.',
      },
      {
        h: 'Numeric sorting is not alphabetical sorting',
        p: 'Sorted as text, 10 comes before 9, because the comparison is character by character. The ' +
           'numeric mode parses the start of each line as a number instead, so 2, 9, 10, 100 sort ' +
           'properly. It reads the leading number and ignores the rest, which means lines like “3 ' +
           'apples” sort correctly but lines beginning with text do not sort at all — put the number ' +
           'first if you can.',
      },
      {
        h: 'Sorting by length, and shuffling',
        p: 'Length sorting is handy for spotting outliers: the malformed row in an export, the one ' +
           'URL with a tracking query attached, the password that got truncated. Random shuffle uses ' +
           'a Fisher–Yates pass, which produces every ordering with equal probability — worth ' +
           'stating because the common one-line trick of sorting with a random comparator does not, ' +
           'and leaves items suspiciously close to where they started.',
      },
    ],
    steps: [
      'Paste your lines.',
      'Choose the order: A→Z, Z→A, by length, numeric or random shuffle.',
      'Tick remove duplicates if you want them dropped in the same pass.',
      'Press Sort Lines and copy the result.',
    ],
    notes: [
      'Duplicate removal runs after sorting, and keeps the first of each group.',
      'Blank lines sort to the top in alphabetical mode — delete them first if that is noise.',
      'Leading whitespace is part of the line, so indented entries sort with the indentation ' +
       'included.',
    ],
    faq: [
      ['Why is 10 sorting before 2?',
       'Because alphabetical mode compares text, and the character 1 comes before 2. Switch to ' +
       'numeric mode, which parses each line as a number before comparing.'],
      ['Does sorting change the text of my lines?',
       'No — it only reorders them. Removing duplicates deletes whole lines but never edits the ' +
       'ones it keeps.'],
      ['Is the random shuffle actually random?',
       'Yes. It uses a Fisher–Yates shuffle, so every permutation is equally likely. It draws ' +
       'from the ordinary random generator rather than the cryptographic one, which is right for ' +
       'shuffling a list and would not be right for a lottery draw.'],
    ],
  },
  'email-extractor': {
    intro:
      'Pulls every email address out of a block of text — a pasted page, an export, a sign-up ' +
      'thread, a wall of HTML — removes duplicates and hands you a clean list, one per line.',
    sections: [
      {
        h: 'How it finds addresses, and what it will miss',
        p: 'The scan is a pattern match for a local part, an @, a domain and a dot-suffix of at ' +
           'least two letters. That catches essentially every address written normally, including ' +
           'those wrapped in HTML tags or buried in a mailto: link, because the surrounding markup ' +
           'does not match the pattern and is simply skipped. It will not catch deliberately ' +
           'obfuscated ones — “name (at) example (dot) com” is not an email address as far as any ' +
           'pattern is concerned — nor addresses assembled by JavaScript after the page loads, which ' +
           'is exactly why sites obfuscate them.',
      },
      {
        h: 'Duplicates are removed, case is preserved',
        p: 'Each distinct address appears once, in the order it was first seen. The comparison is ' +
           'exact, so Contact@Example.com and contact@example.com both survive as separate entries ' +
           'even though most mail servers treat the local part case-insensitively in practice. If ' +
           'you are building a mailing list, lowercase the result afterwards and deduplicate again — ' +
           'the domain half is definitively case-insensitive, the local part is only conventionally ' +
           'so.',
      },
      {
        h: 'Extracted is not the same as valid, or permitted',
        p: 'A pattern match confirms the shape of an address, not that the mailbox exists or that ' +
           'anyone reads it. Expect role accounts, spam traps and long-dead addresses in any scrape. ' +
           'And the legal point, which matters more than the technical one: harvesting addresses ' +
           'from websites to email without consent is prohibited under GDPR in Europe, PECR in the ' +
           'UK and CAN-SPAM in the United States. The defensible uses of this tool are your own data ' +
           '— cleaning an export, recovering contacts from an old thread, pulling addresses out of a ' +
           'form dump you already own.',
      },
    ],
    steps: [
      'Paste the text, HTML or export containing the addresses.',
      'Press Extract Emails.',
      'Copy individual addresses, or the whole deduplicated list at once.',
    ],
    notes: [
      'Works on raw HTML — there is no need to strip the tags first.',
      'Addresses with plus-addressing (name+tag@example.com) and with subdomains are matched ' +
       'correctly.',
      'Nothing is uploaded; the text stays in your browser, which matters when the source is a ' +
       'customer export.',
    ],
    faq: [
      ['Can it extract addresses from a PDF or a spreadsheet?',
       'Not directly — paste the text in. Open the file, select all, copy, and paste here; the ' +
       'extraction does not care about the layout or the stray formatting that comes with it.'],
      ['Why did it miss an address I can see on the page?',
       'Either it is obfuscated (“at” and “dot” spelled out, or the @ inserted as an HTML ' +
       'entity), or it is written into the page by JavaScript after load, so it is not in the ' +
       'text you copied. Both are deliberate anti-harvesting measures.'],
      ['Is it legal to use extracted addresses for marketing?',
       'Generally no. Sending unsolicited commercial email to addresses collected from websites ' +
       'breaches GDPR, the UK\'s PECR and CAN-SPAM, with real penalties attached. Use this to ' +
       'clean and recover contacts you already have a relationship with or consent from.'],
    ],
  },

  // ── EVERYDAY ──────────────────────────────────────────────────────────────────
  'countdown-timer': {
    intro:
      'A countdown timer you set in minutes and seconds, with a display big enough to read ' +
      'across a kitchen, a colour change in the final ten seconds, and the remaining time ' +
      'mirrored in the browser tab title so you can watch it from another tab.',
    sections: [
      {
        h: 'The tab title is the useful part',
        p: 'While the timer runs, the page title shows the time remaining, and changes to a ' +
           'time\'s-up marker when it finishes. That means you can start a timer, switch to whatever ' +
           'you were doing, and still see the countdown in the tab strip without coming back — which ' +
           'is most of the point of a browser timer as opposed to the one on your phone.',
      },
      {
        h: 'What it is good for',
        p: 'Cooking, where hands are dirty and a phone is not. Timed exercises and stretches. ' +
           'Teaching and presentations, where a visible countdown does the work of nagging for you. ' +
           'Interviews and exams. Timeboxing a task you would otherwise let sprawl — twenty-five ' +
           'minutes on the clock is the entire mechanism of the Pomodoro technique, which has a ' +
           'dedicated tool here if you want the breaks tracked too.',
      },
      {
        h: 'Keep the tab alive',
        p: 'Browsers aggressively throttle timers in background tabs to save battery, and a phone ' +
           'may suspend the page completely when you lock the screen, so a countdown running in a ' +
           'backgrounded mobile tab can drift or stall. On a desktop, a background tab is usually ' +
           'fine. For anything where a missed alarm has a real cost — an oven, a test — keep the tab ' +
           'visible, or use a device alarm that survives the screen going off.',
      },
    ],
    steps: [
      'Enter the minutes and seconds you want to count down from.',
      'Press Start — the display turns amber for the final ten seconds.',
      'Pause to hold the remaining time, or Reset to return to the value you set.',
    ],
    notes: [
      'The countdown is visual: the display turns red and shows a time\'s-up message, so keep ' +
       'the tab where you can see it.',
      'Changing the minutes or seconds while stopped updates the starting value immediately.',
      'Works offline once the page has loaded.',
    ],
    faq: [
      ['Does the timer keep running if I switch tabs?',
       'On a desktop browser, yes, and the tab title keeps showing the remaining time. On a ' +
       'phone the page may be suspended when you switch apps or lock the screen, so use your ' +
       'device\'s own alarm for anything that must not be missed.'],
      ['Can I set a countdown longer than an hour?',
       'Yes — enter the total in minutes. Ninety minutes is 90, two hours is 120. The display ' +
       'counts in minutes and seconds rather than showing an hours column.'],
      ['Is there a sound when it finishes?',
       'The alert is visual: the digits turn red and a time\'s-up message appears. Browsers block ' +
       'audio that a page starts on its own, so a reliable sound would need a click first — keep ' +
       'the tab in view instead.'],
    ],
  },

  // ── CSS ───────────────────────────────────────────────────────────────────────
  'css-animation': {
    intro:
      'Builds a CSS keyframe animation — pulse, spin, bounce, shake, fade, glow or slide-in — ' +
      'with live controls for duration, delay, easing, direction and iteration count, and gives ' +
      'you the @keyframes block and the animation shorthand ready to paste.',
    sections: [
      {
        h: 'Animate transform and opacity, not layout',
        p: 'The presets here move things with transform and opacity for a reason: those two ' +
           'properties are composited on the GPU without the browser recalculating layout or ' +
           'repainting. Animating width, height, top, left or margin forces a reflow on every frame, ' +
           'which is what a janky animation on a mid-range phone actually is. If you need something ' +
           'to move, translate it rather than changing its position; if you need it to grow, scale ' +
           'it rather than changing its width.',
      },
      {
        h: 'What the easing choice actually changes',
        p: 'Easing is the curve mapping elapsed time to progress. linear is constant speed and looks ' +
           'mechanical — correct for a spinner, wrong for almost everything else, because nothing in ' +
           'the physical world starts and stops instantly. ease-out starts fast and settles, which ' +
           'suits things arriving on screen. ease-in suits things leaving. ease-in-out is the safe ' +
           'default for anything that loops. You can substitute your own cubic-bezier in the ' +
           'generated code if a preset is close but not quite right.',
      },
      {
        h: 'Iteration count, direction and where the element ends up',
        p: 'infinite is right for a loading indicator and wrong for anything a user has to read past ' +
           '— perpetual movement in peripheral vision is genuinely tiring. alternate runs every ' +
           'second cycle backwards, which turns a one-way keyframe list into a smooth there-and-back ' +
           'without writing the return frames. When an animation runs a fixed number of times the ' +
           'element snaps back to its original styling at the end unless you add ' +
           'animation-fill-mode: forwards, which is the single most common surprise with CSS ' +
           'animation.',
      },
      {
        h: 'Respect reduced motion',
        p: 'Some people get motion sickness from parallax and spin effects, and every operating ' +
           'system has a reduce-motion setting that browsers expose. Wrap decorative animation in a ' +
           'media query — @media (prefers-reduced-motion: reduce) { animation: none; } — and leave ' +
           'functional indicators such as loading spinners alone. It is three lines, and it is the ' +
           'difference between a site somebody can use and one they cannot.',
      },
    ],
    steps: [
      'Pick a preset animation and watch the live preview.',
      'Adjust duration, delay, easing, direction and iteration count until it feels right.',
      'Copy the generated @keyframes block and the animation shorthand into your stylesheet.',
      'Apply the class to your element — the keyframe name is included in the generated code.',
    ],
    notes: [
      'The generated CSS needs no vendor prefixes — unprefixed animation has been supported ' +
       'everywhere for years.',
      'A keyframe name must be unique within the document; rename it if you are generating more ' +
       'than one animation.',
      'Durations under about 150ms read as an abrupt jump rather than a movement; 200–400ms ' +
       'suits most interface transitions.',
    ],
    faq: [
      ['Why does my element jump back at the end of the animation?',
       'Because an animation only overrides styles while it is running. Add animation-fill-mode: ' +
       'forwards to hold the final keyframe, or set the end state on the element itself and ' +
       'animate from the starting state.'],
      ['Should I use a CSS animation or a transition?',
       'A transition for a change between two states triggered by something — hover, a class ' +
       'being added, focus. An animation for anything with intermediate steps, that loops, or ' +
       'that should run on its own without a trigger. Transitions are simpler; reach for ' +
       'keyframes when you need more than start and end.'],
      ['Do CSS animations hurt performance?',
       'Not when they animate transform and opacity, which the compositor handles without ' +
       'touching layout. They do when they animate geometry — width, height, top, left — or ' +
       'box-shadow, which repaints. Many simultaneous animations also cost, particularly on ' +
       'low-end phones.'],
    ],
  },

  // ── BUSINESS ──────────────────────────────────────────────────────────────────
  'invoice-gen': {
    intro:
      'Builds a clean, printable invoice from your details, your client\'s, a list of line items ' +
      'and a tax rate, with the totals calculated as you type. Print to PDF when it looks ' +
      'right. Nothing is uploaded, nothing is stored, and there is no account to create before ' +
      'you can send a bill.',
    sections: [
      {
        h: 'What an invoice legally has to carry',
        p: 'The exact requirements depend on where you are registered, but the common core is: the ' +
           'word “invoice”, a unique sequential number, the date of issue, your business name and ' +
           'address, the client\'s name and address, a description of what was supplied, the amount ' +
           'due, the tax rate and amount, and the total. Where you are registered for VAT or GST you ' +
           'must also show your registration number and the client\'s where the reverse charge ' +
           'applies. A missing invoice number is the most common reason a client\'s accounts ' +
           'department sends one back.',
      },
      {
        h: 'Numbering, and why sequence matters',
        p: 'Invoice numbers should be unique and unbroken. Tax authorities in most countries treat a ' +
           'gap in the sequence as a question to answer, and it is genuinely useful for you too — ' +
           'you can tell at a glance whether one is missing. A prefix per client or per year ' +
           '(2026-014, ACME-007) stays sequential while making the invoice easier to talk about on ' +
           'the phone. Never reuse a number: if an invoice was wrong, issue a credit note and a new ' +
           'invoice rather than editing and resending the old one.',
      },
      {
        h: 'Payment terms are the part that gets you paid',
        p: '“Due on receipt” is ambiguous and invites delay. Write a date. Net 30 from the invoice ' +
           'date is the common default; Net 14 is entirely reasonable for a small supplier and is ' +
           'worth asking for. Put your bank details, your accepted payment methods and any ' +
           'late-payment terms in the notes field. In the UK and EU you have a statutory right to ' +
           'charge interest on late commercial payments whether or not you mention it — saying so on ' +
           'the invoice tends to make it unnecessary.',
      },
      {
        h: 'Printing and keeping records',
        p: 'The print button uses your browser\'s print dialogue, so choose “Save as PDF” as the ' +
           'destination to get a file. Keep a copy of every invoice you issue: most jurisdictions ' +
           'require six or seven years of records. Because this tool keeps nothing, the PDF you save ' +
           'is your only record — file it somewhere backed up before you move on to the next one.',
      },
    ],
    steps: [
      'Fill in your business details and your client\'s.',
      'Set the invoice number, issue date and due date.',
      'Add a line item for each service or product, with quantity and rate — line totals, ' +
       'subtotal and tax calculate as you type.',
      'Set the tax rate and add payment terms in the notes.',
      'Check the live preview, then Print / Save as PDF.',
    ],
    notes: [
      'Totals recalculate on every keystroke — there is no calculate button to forget.',
      'Everything stays in your browser; client names, rates and addresses are never ' +
       'transmitted.',
      'Because nothing is saved, refreshing the page clears the form — export the PDF before ' +
       'you navigate away.',
    ],
    faq: [
      ['Is an invoice made with this tool legally valid?',
       'An invoice is valid on its content, not on the software that produced it — a correctly ' +
       'detailed invoice written by hand is enforceable. Check that yours carries whatever your ' +
       'jurisdiction requires (typically a unique number, both parties\' details, dates, a ' +
       'description, tax and total) and it will stand. Where you are VAT or GST registered, add ' +
       'your registration number, which this tool does not prompt for.'],
      ['How do I add my logo?',
       'There is no logo upload — the business name is set in type instead. If you need ' +
       'branding, save the PDF and add the logo in a PDF editor, or use the letterhead your ' +
       'accounting software already produces. For most freelance work a clear, correct invoice ' +
       'matters far more to getting paid than a logo does.'],
      ['Can I invoice in a currency other than dollars?',
       'The preview formats amounts with a dollar sign. The numbers are correct in any currency, ' +
       'so for now the practical workaround is to state the currency explicitly in the notes ' +
       'field (“All amounts in INR”), which is good practice on any cross-border invoice ' +
       'regardless.'],
    ],
  },
  'receipt-gen': {
    intro:
      'Produces an itemised payment receipt — what was paid, by whom, for what, when and by ' +
      'which method — ready to print or save as a PDF. A receipt is the acknowledgement that ' +
      'money arrived, which is a different document from the invoice that asked for it.',
    sections: [
      {
        h: 'Receipt, invoice, bill: three different documents',
        p: 'An invoice requests payment and creates a debt. A receipt confirms payment was made and ' +
           'discharges it. A bill is the informal word for either, which is why the three get ' +
           'muddled. The practical difference is timing and tense: an invoice says “please pay $400 ' +
           'by the 30th”, a receipt says “$400 received on the 28th by bank transfer”. Issue both — ' +
           'the invoice is your claim, the receipt is your client\'s proof for their own accounts.',
      },
      {
        h: 'What belongs on it',
        p: 'A receipt number, the date payment was received (not the date of the invoice), who paid, ' +
           'what it was for, the amount, the payment method, and the invoice number it settles. That ' +
           'last one is the field people leave out and then regret: without it, reconciling a run of ' +
           'payments against a run of invoices becomes guesswork. If the payment was partial, say so ' +
           'and state the balance remaining.',
      },
      {
        h: 'Why customers ask for them',
        p: 'Expense claims, tax deductions, warranty claims and proof of purchase in a dispute. A ' +
           'customer who asks for a receipt usually needs it to satisfy somebody else — an employer, ' +
           'an accountant, a tax authority — so the details that matter are the ones that make it ' +
           'verifiable: your business name, the date, the amount and what was supplied. Vagueness ' +
           'here is what gets an expense claim rejected.',
      },
    ],
    steps: [
      'Enter your business details and the payer\'s name.',
      'Add a line for each item or service paid for.',
      'Set the receipt number, the date payment was received and the payment method.',
      'Check the preview, then print or save as a PDF and send it on.',
    ],
    notes: [
      'Use a separate number series from your invoices so the two cannot be confused.',
      'Record the date the money arrived, which is frequently not the invoice date.',
      'Everything runs in your browser — customer names and amounts are not transmitted ' +
       'anywhere.',
    ],
    faq: [
      ['What is the difference between a receipt and an invoice?',
       'An invoice asks for money and is issued before payment; a receipt confirms money was ' +
       'received and is issued after. The same transaction normally generates both, and the ' +
       'receipt should reference the invoice number it settles.'],
      ['Do I have to issue a receipt?',
       'Rules vary, but in many jurisdictions a customer is entitled to one on request, and for ' +
       'cash transactions some countries require one unconditionally. Regardless of the law, ' +
       'issuing one closes the loop cleanly and prevents the awkward follow-up about whether a ' +
       'payment landed.'],
      ['Can I use this for a rent or cash receipt?',
       'Yes. Put the period covered in the item description (“Rent, 1–31 March 2026”), set the ' +
       'payment method to cash, and both parties have a dated record. For cash in particular, a ' +
       'written receipt is the only evidence the payment happened.'],
    ],
  },
  'resume-builder': {
    intro:
      'Builds a clean single-column resume from structured fields — summary, skills, ' +
      'experience, education — with a live preview and a print-to-PDF button. The single column ' +
      'is deliberate: it is the layout automated screening systems can actually read.',
    sections: [
      {
        h: 'Why the layout is plain',
        p: 'Most medium and large employers run applications through an applicant tracking system ' +
           'before a person sees them, and those systems parse the PDF into text. Two-column ' +
           'layouts, text inside graphics, headers and footers, tables and icons are the things that ' +
           'parse badly — skills end up interleaved with dates, or vanish. A single column with ' +
           'conventional section headings (Summary, Skills, Experience, Education) parses reliably ' +
           'everywhere. The designed template that looks impressive on a designer\'s portfolio is ' +
           'frequently the one that arrives as scrambled text.',
      },
      {
        h: 'Write achievements, not duties',
        p: '“Responsible for managing the social media accounts” tells a reader what your job title ' +
           'already told them. “Grew Instagram following from 2,000 to 18,000 in eleven months; ' +
           'three posts drove 40% of quarterly signups” tells them what you can do. Lead with the ' +
           'verb, attach a number wherever one exists, and put the outcome before the method. If you ' +
           'have no numbers, scope works instead: how many people, how large a budget, how many ' +
           'customers.',
      },
      {
        h: 'Tailor the summary and the skills to the posting',
        p: 'These are the two sections worth rewriting for each application. Screening systems and ' +
           'recruiters both match against the words in the job description, so if the posting says ' +
           '“PostgreSQL” do not write “SQL databases”. That is not gaming the system, it is ' +
           'answering the question that was asked — but only claim what you can discuss in an ' +
           'interview. The experience section should stay broadly stable; if you find yourself ' +
           'rewriting it substantially for every role, you are applying too broadly.',
      },
      {
        h: 'Length, and what to leave out',
        p: 'One page for under ten years of experience, two at most beyond that. Leave out your ' +
           'photograph, date of birth, marital status and full address — in the UK, US and much of ' +
           'Europe these invite discrimination claims and recruiters are trained to ignore them ' +
           '(norms differ elsewhere, so check locally). A city and country is enough. Drop the ' +
           'objective statement, references-available-on-request, and any skill you would not want ' +
           'to be tested on.',
      },
    ],
    steps: [
      'Fill in your name, target job title and contact details.',
      'Write a two-to-three-sentence summary aimed at the role you are applying for.',
      'List your skills, comma separated — they render as tags.',
      'Add each role with company, title, dates and two or three achievement bullets, most ' +
       'recent first.',
      'Add your education, then check the preview and print to PDF.',
    ],
    notes: [
      'Save as PDF rather than printing to paper — PDF preserves the layout, and a Word file ' +
       'reflows differently on the reader\'s machine.',
      'Name the file with your own name (jane-mehta-resume.pdf); a file called resume.pdf is ' +
       'indistinguishable from forty others in a recruiter\'s downloads folder.',
      'Nothing is stored, so keep the PDF — reloading the page clears the form.',
    ],
    faq: [
      ['Will this resume pass an applicant tracking system?',
       'The layout is built for it: one column, standard section headings, real selectable text, ' +
       'no tables or graphics. What you write still matters more than the format — systems match ' +
       'against the words in the job description, so mirror the posting\'s terminology in your ' +
       'summary and skills.'],
      ['How long should a resume be?',
       'One page if you have under about ten years of experience, and it is the stronger choice ' +
       'even slightly beyond that. Two pages is the ceiling. Cutting is not loss: nobody reads ' +
       'the third page, and a tight one-page resume signals judgement about what matters.'],
      ['Should I include a photo?',
       'Not for the UK, Ireland, the US, Canada or Australia — employers there often discard ' +
       'resumes with photos to protect against discrimination claims. It remains conventional in ' +
       'parts of continental Europe, Asia and Latin America. Check the norm where you are ' +
       'applying rather than where you are sitting.'],
    ],
  },
  'cover-letter-gen': {
    intro:
      'Assembles a properly structured cover letter — your details, the employer\'s, a dated ' +
      'salutation and three paragraphs that do three different jobs — ready to print or save as ' +
      'a PDF alongside your resume.',
    sections: [
      {
        h: 'The three paragraphs, and what each is for',
        p: 'The opening states which role you are applying for and gives one concrete reason you are ' +
           'writing to this employer specifically — a product you use, a problem they have ' +
           'described, someone who suggested you get in touch. The middle picks one or two things ' +
           'from your experience that map directly onto what the posting asks for, with enough ' +
           'detail to be credible. The close says what you want to happen next. That is the whole ' +
           'structure; everything else people add is padding.',
      },
      {
        h: 'What makes a cover letter get read',
        p: 'Specificity about the employer in the first two lines. A hiring manager can tell a ' +
           'templated letter from the opening sentence, because the template has to stay vague ' +
           'enough to fit any company. One accurate detail — why this role, why this organisation — ' +
           'buys you the rest of the page. Naming a person in the salutation helps where you can ' +
           'find one; “Dear Hiring Manager” is a perfectly acceptable fallback and far better than a ' +
           'wrong name.',
      },
      {
        h: 'What to leave out',
        p: 'Do not restate your resume; the reader has it. Do not open with “I am writing to apply ' +
           'for”, which spends your strongest sentence on something the subject line already said. ' +
           'Avoid apologising for gaps or missing requirements — address a genuine gap in one ' +
           'factual sentence if it is unavoidable, and otherwise spend the space on what you do ' +
           'bring. Keep it to one page; three tight paragraphs beat six thorough ones.',
      },
    ],
    steps: [
      'Enter your contact details and the employer\'s, plus the role you are applying for.',
      'Write the opening: the role, and one specific reason for this employer.',
      'Write the middle: one or two experiences that match what the posting asks for.',
      'Write the close: what you would like to happen next.',
      'Check the preview, then print or save as a PDF.',
    ],
    notes: [
      'Match the file format and naming of your resume so the two arrive as an obvious pair.',
      'Where an application form has a free-text box instead of an upload, paste the body text ' +
       'without the letterhead.',
      'Nothing is saved — export the PDF before leaving the page.',
    ],
    faq: [
      ['Does anyone actually read cover letters?',
       'Sometimes not for high-volume junior roles, and almost always for senior, specialist or ' +
       'small-company hiring, where one person reads every application. The asymmetry is what ' +
       'settles it: a good letter costs you twenty minutes and occasionally wins the interview; ' +
       'skipping it saves twenty minutes and occasionally loses one.'],
      ['How long should a cover letter be?',
       'Three paragraphs, under 400 words, one page. If it runs longer you are restating your ' +
       'resume — cut until every sentence is either about this employer or about evidence the ' +
       'resume does not already carry.'],
      ['Should I use the same letter for every application?',
       'The structure, yes; the content of the first and second paragraphs, no. Those are the ' +
       'two that prove you read the posting, and they are the two a reader uses to decide ' +
       'whether to keep going.'],
    ],
  },

  // ── JSON ──────────────────────────────────────────────────────────────────────
  'json-to-csv': {
    intro:
      'Converts a JSON array of objects into CSV that opens correctly in Excel, Google Sheets ' +
      'or Numbers — with proper quoting, so values containing commas, quotation marks or line ' +
      'breaks survive the trip instead of shifting your columns.',
    sections: [
      {
        h: 'Where the columns come from',
        p: 'The header row is the union of every key across every object, in the order each key is ' +
           'first seen. That matters when your objects are not uniform — an API that omits null ' +
           'fields, or a export where later records gained a column. Taking the keys from the first ' +
           'object alone, which is the usual shortcut, silently drops those later columns. Objects ' +
           'missing a key get an empty cell rather than a shifted row.',
      },
      {
        h: 'Quoting is what makes the file actually open',
        p: 'CSV has one real rule and it is easy to get wrong: a field containing a comma, a double ' +
           'quote or a line break must be wrapped in double quotes, and any quote inside it doubled. ' +
           'Without that, an address field with a comma in it becomes two columns and every ' +
           'subsequent column in that row shifts left. This converter applies the RFC 4180 rules, so ' +
           'a value like he said "hi" or a multi-line note imports as one cell. It also preserves 0 ' +
           'and false, which naive converters turn into blanks.',
      },
      {
        h: 'Nested objects and arrays',
        p: 'CSV is flat and JSON is not, so nested values are written as their JSON text inside a ' +
           'single cell rather than expanded into columns. That keeps the data rather than losing ' +
           'it, but a deeply nested payload is a poor fit for a spreadsheet either way — if you need ' +
           'the nested fields as columns, flatten the JSON first so each leaf has its own top-level ' +
           'key.',
      },
      {
        h: 'Opening it without Excel mangling it',
        p: 'Excel will interpret anything that looks like a date, so an ID like 03-04 becomes 3 ' +
           'April and a long number loses its trailing digits to scientific notation. The reliable ' +
           'fix is to use Data → From Text/CSV rather than double-clicking the file, and set those ' +
           'columns to Text during the import. Google Sheets is better behaved but does the same to ' +
           'long numeric IDs.',
      },
    ],
    steps: [
      'Paste a JSON array of objects — the top level must be an array, not a single object.',
      'Press convert; syntax errors are reported rather than guessed at.',
      'Copy the CSV, or save it as a .csv file and import it into your spreadsheet.',
    ],
    notes: [
      'The input must be an array. Wrap a single object in square brackets, or extract the ' +
       'array your API nested it inside.',
      'Nested objects and arrays are written as JSON text within one cell.',
      'Conversion runs in your browser, so exported customer or transaction data is not ' +
       'uploaded anywhere.',
    ],
    faq: [
      ['Why does my JSON not convert?',
       'The commonest reason is that the top level is an object rather than an array — many APIs ' +
       'return { "data": [ ... ] }, and you need the inner array. The other is invalid JSON, ' +
       'usually a trailing comma or a comment, which JSON does not permit; the error message ' +
       'names the position.'],
      ['Will commas inside my data break the CSV?',
       'No. Any value containing a comma, a double quote or a newline is quoted according to RFC ' +
       '4180, and internal quotes are doubled, so spreadsheets read it as a single cell.'],
      ['Why do my long ID numbers change when I open the file?',
       'That is Excel, not the CSV. Numbers beyond fifteen digits lose precision and long digit ' +
       'strings get converted to scientific notation. Import via Data → From Text/CSV and mark ' +
       'those columns as Text, or prefix them with an apostrophe.'],
    ],
  },

  // ── ENCODERS ──────────────────────────────────────────────────────────────────
  'base64-decode': {
    intro:
      'Decodes Base64 back to readable text, accepting both the standard alphabet and the ' +
      'URL-safe variant, ignoring line breaks and treating padding as optional. Useful for ' +
      'reading a JWT payload, a data URI, an email header or a config value someone encoded ' +
      'before storing.',
    sections: [
      {
        h: 'Standard and URL-safe, and why there are two',
        p: 'Standard Base64 uses + and / as its last two characters, which both carry meaning inside ' +
           'a URL — + is a space in a query string and / is a path separator. The URL-safe variant ' +
           'substitutes - and _ so the result can be dropped into a URL or a filename unescaped. ' +
           'This decoder accepts either, converting - and _ back before decoding, so a JWT segment ' +
           'and an email attachment header both work without you having to know which you have.',
      },
      {
        h: 'Padding and whitespace',
        p: 'The trailing = characters pad the output to a multiple of four and are strictly required ' +
           'by the specification, but plenty of systems strip them — JWTs always do. This tool adds ' +
           'them back automatically, which is why a token segment pasted straight out of a browser\'s ' +
           'network tab decodes without complaint. Line breaks and spaces are ignored too, so Base64 ' +
           'wrapped at 76 characters, as email standards require, pastes in fine.',
      },
      {
        h: 'It is not encryption, and reading it proves that',
        p: 'Base64 has no key. It is a way of carrying arbitrary bytes through a channel that only ' +
           'handles text — email bodies, JSON strings, URLs, HTML attributes. Anything ' +
           'Base64-encoded is readable by anyone who pastes it into this page, which is worth ' +
           'remembering twice over: once when you find a password stored “encoded” in a config file, ' +
           'and once before you paste someone else\'s token anywhere. A JWT\'s payload is Base64, so ' +
           'its contents are public; only its signature is protected.',
      },
      {
        h: 'When decoding produces nonsense',
        p: 'If the output is a jumble of symbols, the input was probably binary rather than text — ' +
           'an image, a PDF or a compressed blob, all of which are commonly Base64-encoded. Decoding ' +
           'those to text is meaningless; you want a data-URI viewer or a file decoder instead. The ' +
           'other cause is text that was encoded from a non-UTF-8 source, which decodes to mojibake.',
      },
    ],
    steps: [
      'Paste the Base64 string — line breaks and missing padding are fine.',
      'The decoded text appears immediately.',
      'Copy the result, or fix the input if the error message says it is not valid Base64.',
    ],
    notes: [
      'Both standard (+/) and URL-safe (-_) alphabets are accepted, and mixed input works too.',
      'To read a JWT, paste just the middle segment — the part between the two dots.',
      'Decoding happens in your browser, so tokens and config values are not sent anywhere.',
    ],
    faq: [
      ['How can I tell if a string is Base64?',
       'It uses only A–Z, a–z, 0–9 and two symbols (+/ or -_), its length is usually a multiple ' +
       'of four, and it may end in one or two = signs. That said, plenty of ordinary text fits ' +
       'that description — the reliable test is to decode it and see whether the result means ' +
       'anything.'],
      ['Is Base64 secure?',
       'No, and it is not meant to be. It is an encoding, not encryption: anyone can reverse it ' +
       'in one step, as this page demonstrates. Never treat Base64 as protection for a password, ' +
       'key or token.'],
      ['Why does my decoded text contain strange characters?',
       'Either the original data was binary rather than text — an image or a PDF encoded for ' +
       'transport — or it was encoded from text in a non-UTF-8 character set. Binary data has no ' +
       'meaningful text form; decode it to a file instead.'],
    ],
  },
  'binary-encode': {
    intro:
      'Converts text into its binary representation, eight bits per byte, with your choice of ' +
      'separator. It encodes as UTF-8, so accented letters, Devanagari, Chinese and emoji all ' +
      'convert correctly and decode back to exactly what you typed.',
    sections: [
      {
        h: 'Bytes, not characters',
        p: 'The count shown is bytes, not letters, and for anything beyond the ASCII range those ' +
           'differ. UTF-8 uses one byte for the Latin alphabet and the ASCII punctuation, two for ' +
           'most accented European letters and Greek and Cyrillic, three for Devanagari, Chinese, ' +
           'Japanese and Korean, and four for emoji and the rarer scripts. So “Hi” is 16 bits, ' +
           '“café” is 40, and a single emoji is 32 on its own. A converter that assumed one byte per ' +
           'character would mangle all but the first of those.',
      },
      {
        h: 'Reading the output',
        p: 'Each group of eight bits is one byte, written most significant bit first. 01001000 is ' +
           '72, which is capital H. Uppercase letters run from 01000001 (A, 65) to 01011010 (Z, 90) ' +
           'and lowercase from 01100001 (a, 97) — which is why the only difference between A and a ' +
           'in binary is the third bit, and why case conversion in older code was a single bitwise ' +
           'operation. A space is 00100000.',
      },
      {
        h: 'What it is actually useful for',
        p: 'Teaching and homework, mostly, where seeing text as bits makes character encoding ' +
           'concrete. Puzzle and capture-the-flag challenges, where binary is a common first layer. ' +
           'Occasionally debugging, when you need to see the exact bytes of a string that looks ' +
           'right but compares unequal — a non-breaking space, a byte-order mark or a curly quote is ' +
           'obvious in binary and invisible on screen.',
      },
    ],
    steps: [
      'Type or paste your text.',
      'Choose a separator: spaces between bytes are the most readable, none is the most ' +
       'compact.',
      'Copy the binary — and use the binary decoder to convert it back.',
    ],
    notes: [
      'Encoding is UTF-8, the standard for the web, so output matches what other correct tools ' +
       'produce.',
      'The byte count is shown alongside the output, which is the honest measure of length for ' +
       'non-English text.',
      'Everything runs in your browser.',
    ],
    faq: [
      ['How do I convert binary back to text?',
       'Use the binary decoder, which reads the same eight-bit groups and reassembles multi-byte ' +
       'characters. Separators can be spaces, commas or newlines, and it copes with unseparated ' +
       'streams as long as they are a whole number of bytes.'],
      ['Why does one emoji produce four groups?',
       'Because UTF-8 encodes it as four bytes. Emoji live outside the range that fits in one or ' +
       'two bytes, and some — flags, skin tones, family groups — are several code points joined ' +
       'together, so they take considerably more.'],
      ['Is this the same as ASCII to binary?',
       'For plain English text, yes — UTF-8 and ASCII are byte-for-byte identical for the first ' +
       '128 characters. They diverge the moment you use an accent, a curly quote or any ' +
       'non-Latin script, where UTF-8 produces multiple bytes and ASCII simply cannot represent ' +
       'the character.'],
    ],
  },

  // ── DEV ───────────────────────────────────────────────────────────────────────
  'hmac-generator': {
    intro:
      'Computes an HMAC — a hash keyed with a shared secret — using SHA-1, SHA-256, SHA-384 or ' +
      'SHA-512, with hex or Base64 output. This is what webhook signatures, API request signing ' +
      'and signed cookies are built from, and what you need when you are debugging why a ' +
      'signature does not match.',
    sections: [
      {
        h: 'What HMAC adds that a plain hash does not',
        p: 'A hash proves a message has not changed. It does not prove who sent it, because anyone ' +
           'can hash anything. HMAC mixes a secret key into the hash in a specific two-pass ' +
           'construction, so only someone holding the key can produce a valid digest for a message — ' +
           'and anyone holding the key can verify one. That is why every webhook provider signs its ' +
           'payloads this way: the signature in the header proves the request came from them and ' +
           'arrived intact.',
      },
      {
        h: 'Why the construction matters, not just the ingredients',
        p: 'The obvious approach — hashing the key followed by the message — is broken for the SHA-1 ' +
           'and SHA-2 families, because their internal structure lets an attacker append data to a ' +
           'message and compute a valid digest for the longer version without knowing the key. That ' +
           'is the length-extension attack. HMAC\'s two nested hashes with padded key variants close ' +
           'it. The practical lesson is to use HMAC rather than inventing a scheme, even a plausible ' +
           'one.',
      },
      {
        h: 'Debugging a signature mismatch',
        p: 'When a webhook signature will not verify, it is almost never the algorithm. In order of ' +
           'likelihood: you are hashing the parsed and re-serialised body instead of the exact raw ' +
           'bytes received; the output encoding differs (hex against Base64, or uppercase against ' +
           'lowercase hex); the key has trailing whitespace from a copy-paste or a .env file; or the ' +
           'provider signs a constructed string — timestamp plus a dot plus body — rather than the ' +
           'body alone. Reproduce it here with a known payload before you change any code.',
      },
      {
        h: 'Choosing the algorithm, and comparing safely',
        p: 'SHA-256 is the default nearly everywhere and the right choice for new work. HMAC-SHA1 is ' +
           'still in wide use and, unusually, is not considered broken — HMAC\'s security does not ' +
           'rest on the collision resistance that SHA-1 lost — but there is no reason to choose it ' +
           'now. Whichever you use, compare signatures with a constant-time comparison in production ' +
           'code: a normal string comparison returns early on the first differing byte, which leaks ' +
           'enough timing information to forge a signature byte by byte.',
      },
    ],
    steps: [
      'Pick the algorithm the other system uses — SHA-256 unless its documentation says ' +
       'otherwise.',
      'Enter the shared secret key exactly, with no added whitespace.',
      'Paste the exact message being signed — the raw body, not a reformatted copy.',
      'Choose hex or Base64 to match the format you are comparing against, then copy the ' +
       'result.',
    ],
    notes: [
      'Computed with the Web Crypto API, the browser\'s own cryptographic implementation.',
      'Hex output is lowercase; some providers publish uppercase, so compare ' +
       'case-insensitively.',
      'The key and message stay in your browser — but treat any secret pasted into any web page ' +
       'as worth rotating afterwards if it is a production key.',
    ],
    faq: [
      ['What is the difference between HMAC and a plain hash?',
       'A plain hash takes only the message, so anyone can compute it and it proves only ' +
       'integrity. HMAC takes a message and a secret key, so a valid digest proves both ' +
       'integrity and that the sender knows the key — authentication as well as integrity.'],
      ['Is HMAC-SHA1 still safe?',
       'For HMAC specifically, yes — the attacks that broke SHA-1 target collision resistance, ' +
       'which HMAC\'s security does not depend on, and HMAC-SHA1 remains unbroken and is still ' +
       'used in TOTP and older AWS signatures. Use SHA-256 for anything new all the same; there ' +
       'is no cost to it.'],
      ['My webhook signature will not verify. What should I check first?',
       'The raw body. Most frameworks parse JSON before your handler sees it, and re-serialising ' +
       'changes whitespace and key order, which changes the digest. Capture the unmodified ' +
       'bytes, then check the encoding (hex or Base64), then check the key for stray whitespace, ' +
       'then check whether the provider signs a timestamp-prefixed string rather than the body ' +
       'alone.'],
    ],
  },

  // ── UNITS ─────────────────────────────────────────────────────────────────────
  'area-converter': {
    intro:
      'Converts between square kilometres, square metres, square centimetres and millimetres, ' +
      'hectares, acres, square miles, square yards, square feet and square inches — every unit ' +
      'at once. Most of the traffic here is property: square feet to square metres, and acres ' +
      'to hectares.',
    sections: [
      {
        h: 'Squared units scale by the square of the ratio',
        p: 'This is the mistake that costs money. A metre is about 3.28 feet, so it is tempting to ' +
           'assume a square metre is 3.28 square feet — it is 10.76, because the ratio applies in ' +
           'both directions at once. The same trap doubles in volume, where the ratio is cubed. If a ' +
           'conversion looks surprisingly large, check whether you squared the ratio; if it looks ' +
           'surprisingly small, check whether you forgot to.',
      },
      {
        h: 'Acres and hectares',
        p: 'An acre is 4,840 square yards — historically the area a yoke of oxen could plough in a ' +
           'day, which is why it is an awkward number rather than a round one. A hectare is 10,000 ' +
           'square metres, a clean 100 m by 100 m, and is about 2.47 acres. Agricultural land is ' +
           'quoted in hectares almost everywhere except the United States and parts of the UK, so ' +
           'converting between them is the most common farmland arithmetic there is. A football ' +
           'pitch is a useful anchor: roughly 0.7 hectares, or about 1.75 acres.',
      },
      {
        h: 'Property area, and what it includes',
        p: 'A square foot is 0.0929 square metres and a square metre is 10.764 square feet, exactly, ' +
           'since both derive from the defined inch. The harder problem is not the conversion but ' +
           'what was measured: carpet area, built-up area and super built-up area in India, or gross ' +
           'internal against net internal in the UK, can differ by 25% or more for the same flat. ' +
           'Converting a number accurately does not tell you the two numbers describe the same thing ' +
           '— always check which measure a listing quotes.',
      },
    ],
    steps: [
      'Enter the area you have.',
      'Select its unit.',
      'Read every other unit at once — results update as you type.',
    ],
    notes: [
      'Imperial area conversions here are exact, derived from the defined inch of 2.54 cm.',
      'One hectare is exactly 10,000 m²; one acre is exactly 4,046.8564224 m².',
      'For land, remember that a stated area and a measured area often differ — check which one ' +
       'your document quotes.',
    ],
    faq: [
      ['How many square feet are in a square metre?',
       '10.7639, exactly (the square of 3.280839...). Going the other way, a square foot is ' +
       '0.092903 square metres. For a quick estimate, multiply square metres by 10 and add 8% — ' +
       '50 m² becomes 500 + 40 = 540 ft², against a true 538.'],
      ['How many acres are in a hectare?',
       'About 2.471. So 10 hectares is 24.7 acres, and 100 acres is 40.5 hectares. The rough ' +
       'conversion — hectares times two and a half — is within 1.2%, which is close enough for ' +
       'conversation and not close enough for a contract.'],
      ['Why is a square mile not 1,760 times a square yard?',
       'Because a mile is 1,760 yards in one dimension, and area works in two. A square mile is ' +
       '1,760² = 3,097,600 square yards, or 640 acres — which is where the American survey ' +
       '“section” of land comes from.'],
    ],
  },
  'pressure-converter': {
    intro:
      'Converts between pascals, kilopascals and megapascals, bar and millibar, atmospheres, ' +
      'PSI, torr, inches of mercury and inches of water. Tyre pressures, weather charts, dive ' +
      'tables and engineering specifications each use a different one of these, which is the ' +
      'whole reason the tool exists.',
    sections: [
      {
        h: 'The pascal is small, which is why nobody quotes it',
        p: 'One pascal is one newton per square metre — roughly the pressure a sheet of paper exerts ' +
           'lying flat. Atmospheric pressure is about 101,325 of them, so real-world figures in ' +
           'pascals are unwieldy and everyone reaches for a multiple instead: kilopascals for tyres ' +
           'and gas, bar for hydraulics and diving, hectopascals or millibars for weather (they are ' +
           'the same size, which is why a forecast reading of 1013 works in either), and megapascals ' +
           'for material strength.',
      },
      {
        h: 'Gauge pressure and absolute pressure are different numbers',
        p: 'A tyre gauge reading 32 PSI means 32 PSI above the surrounding air, not 32 PSI in total ' +
           '— the absolute pressure is about 46.7 PSI. That is gauge pressure, written PSIG; ' +
           'absolute is PSIA. A flat tyre reads zero on a gauge and still contains air at one ' +
           'atmosphere. This converter works on whatever number you type, so the conversion is ' +
           'correct either way, but adding 14.7 PSI (or 101.3 kPa) at the wrong moment is how gauge ' +
           'and absolute figures get mixed up in a calculation.',
      },
      {
        h: 'Where each unit still lives',
        p: 'PSI: tyres, compressed air and plumbing in the United States. kPa: tyres and gas ' +
           'pressure almost everywhere else, and tyre placards in many cars show both. bar: ' +
           'hydraulics, espresso machines (nine bar at the group head), scuba cylinders (200 or 300 ' +
           'bar). Millibar and hectopascal: meteorology. Inches of mercury: American aviation ' +
           'altimeters and older barometers. Torr, which is a millimetre of mercury: vacuum work and ' +
           'blood pressure, where 120/80 means millimetres of mercury. Inches of water: very low ' +
           'pressures such as ventilation ducts and gas appliance regulators.',
      },
    ],
    steps: [
      'Enter the pressure reading.',
      'Pick the unit it was measured in.',
      'Read the equivalent in every other unit — updates live as you type.',
    ],
    notes: [
      'One standard atmosphere is exactly 101,325 Pa, which is 1.01325 bar or 14.6959 PSI.',
      'Millibar and hectopascal are identical in size — a weather chart reading of 1013 mbar is ' +
       '1013 hPa.',
      'Tyre and gauge readings are pressure above atmospheric; add one atmosphere to get ' +
       'absolute pressure.',
    ],
    faq: [
      ['How do I convert PSI to bar?',
       'Divide by 14.5038. So 32 PSI is 2.21 bar, and 100 PSI is 6.89 bar. For a rough figure, ' +
       'divide by 15 — within about 3%, which is fine for a tyre and not fine for a pressure ' +
       'vessel.'],
      ['What tyre pressure is 32 PSI in kPa?',
       '220 kPa, or 2.2 bar. Car tyre placards commonly list both; 30–35 PSI (207–241 kPa) ' +
       'covers most passenger cars, but use the figure on your door pillar rather than a general ' +
       'range, and measure when the tyres are cold.'],
      ['Is 1 bar the same as 1 atmosphere?',
       'Very nearly, but not exactly. One bar is 100,000 Pa by definition; one standard ' +
       'atmosphere is 101,325 Pa, about 1.3% higher. The two are interchangeable for everyday ' +
       'purposes and are not for anything calibrated.'],
    ],
  },

  // ── COLOR ─────────────────────────────────────────────────────────────────────
  'color-contrast': {
    intro:
      'Measures the contrast ratio between a text colour and its background and tells you which ' +
      'WCAG levels it passes, with a live preview at three text sizes. This is the single ' +
      'accessibility check that catches the most real-world problems, and the one most often ' +
      'failed by a brand palette signed off on a designer\'s calibrated monitor.',
    sections: [
      {
        h: 'What the ratio actually measures',
        p: 'It is not a perceptual judgement, it is arithmetic. Each colour is converted to relative ' +
           'luminance — the sRGB channels are linearised, then weighted 0.2126 red, 0.7152 green, ' +
           '0.0722 blue, because the eye is far more sensitive to green than to blue. The ratio is ' +
           '(lighter + 0.05) / (darker + 0.05), which runs from 1:1 for identical colours to 21:1 ' +
           'for black on white. The 0.05 term models ambient light reflecting off a screen, which is ' +
           'why pure black on pure white does not score infinity.',
      },
      {
        h: 'The thresholds, and which one applies',
        p: 'WCAG 2.1 level AA wants 4.5:1 for normal text and 3:1 for large text — large meaning ' +
           '18pt (24px) or 14pt (18.66px) bold and above. Level AAA raises those to 7:1 and 4.5:1. A ' +
           'separate 3:1 rule covers non-text essentials: icon shapes, form field borders, focus ' +
           'outlines, chart segments you have to distinguish. AA is the level referenced by most ' +
           'legislation — the European Accessibility Act, the US Section 508 standard, the UK public ' +
           'sector regulations — so treat 4.5:1 as the floor rather than the goal.',
      },
      {
        h: 'Where teams usually fail',
        p: 'Grey placeholder text inside form inputs, almost universally. Disabled button labels, ' +
           'which WCAG exempts but users still need to read. White text on a mid-tone brand colour — ' +
           'the classic failure, because brand colours are chosen for saturation rather than ' +
           'luminance, and saturation contributes nothing to the ratio. Text over a photograph, ' +
           'where the ratio varies across the image. And link text distinguished from body text by ' +
           'colour alone, which needs 3:1 against the surrounding text as well as 4.5:1 against the ' +
           'background, or an underline.',
      },
      {
        h: 'The ratio is a floor, not a design target',
        p: 'Passing at 4.6:1 is not the same as being comfortable to read. Thin weights, small ' +
           'sizes, long lines and low-quality screens all cost legibility that the ratio does not ' +
           'capture, and a very high ratio has its own cost — pure black on pure white causes ' +
           'halation for some dyslexic and light-sensitive readers, which is why many designs use ' +
           'near-black on off-white. WCAG 3 is drafting a new model (APCA) that accounts for text ' +
           'size and weight; until then, pass AA and then use your eyes.',
      },
    ],
    steps: [
      'Set the foreground (text) colour and the background colour.',
      'Read the ratio and the pass or fail for each WCAG level.',
      'Check the live preview — the 12px sample is the honest test.',
      'If it fails, adjust the lightness of one colour rather than its hue; saturation will not ' +
       'help.',
    ],
    notes: [
      'Large text means 24px, or 18.66px bold, and above.',
      'The 3:1 non-text rule applies to icons, input borders, focus rings and anything a user ' +
       'must be able to make out.',
      'Semi-transparent text is measured against whatever shows through — compute the blended ' +
       'colour first, or the ratio will be optimistic.',
    ],
    faq: [
      ['What contrast ratio do I actually need?',
       '4.5:1 for body text and 3:1 for large text to meet WCAG AA, which is the level most ' +
       'accessibility law points at. 7:1 and 4.5:1 for AAA, which is worth aiming for on ' +
       'long-form reading. Anything below 3:1 is hard for a significant number of people in ' +
       'ordinary daylight.'],
      ['Why does my bright brand colour fail with white text?',
       'Because contrast depends on luminance, not vividness, and green contributes about 72% of ' +
       'perceived luminance. A saturated mid-tone — most brand oranges, teals and pinks — sits ' +
       'close to white in luminance however vivid it looks. Darken it for text backgrounds and ' +
       'keep the bright version for large decorative areas.'],
      ['Does contrast matter in dark mode too?',
       'Yes, and it is checked the same way — the formula is symmetric. Dark themes fail in the ' +
       'opposite direction: mid-grey text on a near-black background is extremely common and ' +
       'frequently lands under 4.5:1. Pure white on pure black also tends to look harsh, so most ' +
       'good dark themes use a light grey around #E8E8E8 on a #121212 surface.'],
    ],
  },
  'color-picker': {
    intro:
      'Pick a colour and see it immediately in every notation you might need — HEX, RGB, HSL ' +
      'and the rest — each one ready to copy. Useful when you have a colour in one format and ' +
      'the thing you are editing wants another.',
    sections: [
      {
        h: 'HEX and RGB are the same numbers',
        p: '#3B82F6 is just rgb(59, 130, 246) written in base 16, two digits per channel. Neither is ' +
           'more precise or more modern; HEX is compact and pastes cleanly into a stylesheet, RGB is ' +
           'readable and lets you adjust one channel by eye. Three-digit HEX like #F0C is shorthand ' +
           'where each digit doubles, so it can express only 4,096 of the 16.7 million colours. ' +
           'Adding two more HEX digits gives you alpha: #3B82F680 is the same blue at 50% opacity.',
      },
      {
        h: 'HSL is the one worth learning',
        p: 'HSL describes the same colour as a hue angle on a wheel, a saturation percentage and a ' +
           'lightness percentage — and it is far easier to reason about. Building a palette means ' +
           'holding the hue and walking the lightness: 220° at 95% lightness is your background ' +
           'tint, at 50% your button, at 25% your hover state. Doing that in HEX means guessing at ' +
           'six digits. The catch is that HSL lightness is not perceptual: yellow at 50% lightness ' +
           'looks much brighter than blue at 50%, which is what perceptual spaces like OKLCH were ' +
           'invented to fix.',
      },
      {
        h: 'When the colour on screen is not the colour in the file',
        p: 'A colour picked from a photograph or a screenshot is affected by JPEG compression, the ' +
           'display\'s colour profile and any filter in between, so it will rarely match the original ' +
           'design file exactly. For brand work, take the value from the brand guidelines rather ' +
           'than sampling a rendering of it. And bear in mind that wide-gamut displays can show ' +
           'colours that sRGB cannot express — a colour sampled on one may be clipped when it ' +
           'reaches another screen.',
      },
    ],
    steps: [
      'Choose a colour with the picker, or paste a value you already have.',
      'Read the equivalent notations — they update together.',
      'Copy the one your stylesheet, design tool or app expects.',
    ],
    notes: [
      'HEX is case-insensitive: #3b82f6 and #3B82F6 are identical.',
      'Eight-digit HEX carries alpha in the last two digits, where 00 is transparent and FF is ' +
       'opaque.',
      'Use the contrast checker before committing a colour to body text — a colour that looks ' +
       'readable to you may not be.',
    ],
    faq: [
      ['What is the difference between HEX, RGB and HSL?',
       'HEX and RGB are the same red, green and blue values in different notations. HSL restates ' +
       'that colour as hue, saturation and lightness, which is much easier to adjust ' +
       'deliberately — it is the format to use when you are building a palette rather than ' +
       'recording one.'],
      ['How do I add transparency to a HEX colour?',
       'Append two hex digits for alpha: #3B82F6FF is fully opaque, #3B82F680 is about 50%, ' +
       '#3B82F600 is invisible. Every current browser supports it. The alternative is rgba() or ' +
       'hsl() with a slash-separated alpha.'],
      ['Why does the colour look different on my phone?',
       'Screens differ in colour profile, brightness and gamut, and phones apply their own ' +
       'adaptive-brightness and warmth adjustments. The value in the file is exact; the ' +
       'rendering is not. This is also why contrast ratios matter more than how a colour looks ' +
       'on your own monitor.'],
    ],
  },

  // ── CSS ───────────────────────────────────────────────────────────────────────
  'css-box-shadow': {
    intro:
      'Builds a CSS box-shadow with live controls for offset, blur, spread, colour and inset, ' +
      'and supports several stacked layers — which is how shadows that look real are actually ' +
      'made. Copy the generated declaration straight into your stylesheet.',
    sections: [
      {
        h: 'What the four numbers do',
        p: 'The first two are the horizontal and vertical offset: where the shadow sits relative to ' +
           'the element. The third is blur radius, how soft the edge is — zero gives a hard-edged ' +
           'duplicate. The fourth is spread, which grows or shrinks the shadow before blurring; a ' +
           'negative spread pulls the shadow in, which is the trick for a shadow that appears only ' +
           'below an element rather than haloing all four sides. Inset draws the whole thing inside ' +
           'the border instead, for a recessed or pressed look.',
      },
      {
        h: 'One shadow looks fake; three look real',
        p: 'Physical shadows are not one uniform smear. Light comes from multiple directions and ' +
           'bounces, producing a tight dark contact shadow directly under the object and a wide ' +
           'faint one further out. That is why a single 0 4px 24px rgba(0,0,0,0.4) reads as a ' +
           'graphic effect, while stacking a small tight layer, a medium layer and a large diffuse ' +
           'one reads as depth. Shadows are drawn in order with the first on top, so put the ' +
           'tightest layer first.',
      },
      {
        h: 'Keep them dark, transparent and subtle',
        p: 'The most common mistake is a shadow that is too opaque and too grey. Real shadows are ' +
           'not grey, they are the background colour darkened, so a black shadow at low alpha (0.05 ' +
           'to 0.15) layered up beats a solid #888 every time. Tinting the shadow toward your ' +
           'background\'s hue is better still. And keep the vertical offset larger than the ' +
           'horizontal unless you are modelling a specific light source — interfaces conventionally ' +
           'light from above.',
      },
      {
        h: 'Performance and the alternatives',
        p: 'Box-shadow is cheap to paint once and expensive to animate, because changing it repaints ' +
           'the element on every frame. To animate a hover lift, transform the element and ' +
           'cross-fade between two pre-rendered shadow layers rather than animating the shadow ' +
           'values. For shadows that follow an element\'s transparency — an icon or a PNG with a ' +
           'cut-out — box-shadow will square it off; use filter: drop-shadow() instead, which traces ' +
           'the alpha channel.',
      },
    ],
    steps: [
      'Set the X and Y offsets, blur and spread while watching the preview.',
      'Pick a shadow colour — start from black at low opacity.',
      'Add a second and third layer for depth: tight and dark first, wide and faint last.',
      'Toggle inset for a recessed effect, then copy the generated CSS.',
    ],
    notes: [
      'Multiple shadows are comma-separated; the first in the list is drawn on top.',
      'A negative spread shrinks the shadow, which is how you get a soft shadow only beneath an ' +
       'element.',
      'box-shadow follows the element\'s border-radius automatically — no extra work for rounded ' +
       'cards.',
    ],
    faq: [
      ['What is the difference between blur and spread?',
       'Blur softens the shadow\'s edge, fading it out over that distance. Spread changes the ' +
       'shadow\'s size before any blurring — positive makes it larger than the element, negative ' +
       'smaller. Use spread to control how far the shadow reaches and blur to control how sharp ' +
       'it is.'],
      ['How do I make a shadow on only one side?',
       'Give it a vertical offset and a negative spread roughly equal to the blur. For example 0 ' +
       '8px 12px -6px rgba(0,0,0,0.3) puts a soft shadow under the element with almost nothing ' +
       'at the sides.'],
      ['Should I use box-shadow or filter: drop-shadow?',
       'box-shadow for rectangles and rounded boxes — it is cheaper and respects border-radius. ' +
       'drop-shadow when the element has transparency you want the shadow to follow, such as a ' +
       'PNG logo, an SVG icon or an irregular clipped shape, where box-shadow would draw a ' +
       'rectangle.'],
    ],
  },

  // ── TEXT ──────────────────────────────────────────────────────────────────────
  'text-diff': {
    intro:
      'Compares two blocks of text line by line and shows what was added and removed, with ' +
      'counts. It matches lines by content rather than by position, so inserting a paragraph at ' +
      'the top marks one insertion instead of flagging everything below it as changed.',
    sections: [
      {
        h: 'Why matching by content matters',
        p: 'The naive approach compares line 1 with line 1, line 2 with line 2 and so on. Add a ' +
           'single sentence at the top of a document and every subsequent line is off by one, so the ' +
           'whole file appears rewritten — which is exactly when you most need a diff to be ' +
           'readable. This tool computes the longest common subsequence between the two versions ' +
           'first, so unchanged lines are recognised wherever they moved to, and only the genuine ' +
           'insertions and deletions are highlighted.',
      },
      {
        h: 'It works on lines, not words',
        p: 'A changed line shows as one removal and one addition, not as the few characters that ' +
           'differ. For prose, where a paragraph is one long line, that means an edited paragraph ' +
           'shows in full on both sides and you have to spot the difference yourself. The workaround ' +
           'is to put each sentence on its own line before comparing, which is also why technical ' +
           'writers keep one sentence per line in source files — it makes every diff legible.',
      },
      {
        h: 'What it is good for',
        p: 'Checking what changed between two versions of a contract, a policy or a piece of copy ' +
           'that came back from review. Comparing a config file against a known-good one. Seeing ' +
           'what a find-and-replace actually did before you keep the result. Verifying that an ' +
           'export matches what you sent. Anywhere you have two versions and the question is not ' +
           'whether they differ but where.',
      },
    ],
    steps: [
      'Paste the original version on the left.',
      'Paste the revised version on the right.',
      'Read the added and removed counts, then scan the highlighted lines — it updates as you ' +
       'edit either side.',
    ],
    notes: [
      'Comparison is exact, so a trailing space or a changed line ending counts as a ' +
       'difference.',
      'Very large inputs fall back to a simpler positional comparison to stay responsive.',
      'Both versions stay in your browser — safe for contracts and unreleased copy.',
    ],
    faq: [
      ['Can it show me which words changed within a line?',
       'No — it works at line granularity, so an edited line appears as a removal plus an ' +
       'addition. Splitting the text into one sentence per line before comparing gets you most ' +
       'of the way there and makes the output much easier to read.'],
      ['Does formatting or indentation affect the comparison?',
       'Yes. Lines are compared exactly, so a changed indent, a trailing space or a switch ' +
       'between Windows and Unix line endings all register as differences. Normalise whitespace ' +
       'first if you only care about the words.'],
      ['Is this the same as a git diff?',
       'The same idea and the same underlying algorithm family. Git adds context lines, hunk ' +
       'headers, rename detection and word-level highlighting; this is the plain version for ' +
       'text that is not in a repository.'],
    ],
  },
  'remove-extra-spaces': {
    intro:
      'Collapses runs of repeated spaces into one and optionally trims the whitespace from the ' +
      'start and end of every line. It is the fix for text that came out of a PDF, a ' +
      'spreadsheet cell or a word processor carrying invisible padding.',
    sections: [
      {
        h: 'Where the extra spaces come from',
        p: 'Copying out of a PDF is the usual culprit: PDFs position glyphs rather than storing ' +
           'words, so extraction tools insert spaces to approximate the gaps, and justified text ' +
           'produces several where there should be one. Spreadsheet cells accumulate trailing spaces ' +
           'from manual entry. Word processors leave double spaces after full stops — a typewriter ' +
           'convention that modern typesetting handles automatically and that now just looks like an ' +
           'error. Copying out of a chat or email client adds leading indentation from quoting.',
      },
      {
        h: 'Why it matters beyond tidiness',
        p: 'Trailing whitespace breaks exact comparisons silently: two lines that look identical do ' +
           'not match, deduplication misses copies, a spreadsheet lookup returns nothing, and a ' +
           'login fails because the username carries a space you cannot see. It also breaks CSV ' +
           'imports and makes diffs noisy. Cleaning whitespace before any comparison, import or ' +
           'deduplication step saves the ten minutes you would otherwise spend wondering why two ' +
           'identical things are not equal.',
      },
      {
        h: 'What it leaves alone',
        p: 'Single spaces between words are untouched, and line breaks are preserved — your ' +
           'paragraph structure survives. Tabs are not collapsed into spaces, since in code and in ' +
           'tab-separated data they are significant. Blank lines are kept as blank lines. If you ' +
           'need to collapse line breaks as well, or convert tabs, use the find and replace tool ' +
           'with a regular expression.',
      },
    ],
    steps: [
      'Paste the text you want to clean.',
      'Leave trim-lines ticked to remove leading and trailing whitespace on every line.',
      'Press the button and copy the cleaned text.',
    ],
    notes: [
      'Runs of two or more spaces become one; single spaces are left as they are.',
      'Line breaks and blank lines are preserved.',
      'A non-breaking space copied from a web page looks like a space but is a different ' +
       'character and is not collapsed — use find and replace for those.',
    ],
    faq: [
      ['Will it remove my line breaks or paragraph spacing?',
       'No. Only spaces within and around lines are affected; newlines are preserved, so ' +
       'paragraphs keep their structure.'],
      ['Why are some double spaces still there afterwards?',
       'Almost certainly non-breaking spaces (U+00A0) or another Unicode space character, which ' +
       'web pages and word processors insert and which look identical on screen. Use find and ' +
       'replace in regex mode with \\u00a0 to convert them first.'],
      ['Does it fix double spaces after a full stop?',
       'Yes — those are just runs of two spaces and collapse to one. Single-spacing after a ' +
       'sentence is the standard in every current style guide; the double space is a leftover ' +
       'from monospaced typewriters.'],
    ],
  },
  'palindrome-checker': {
    intro:
      'Checks whether a word, phrase or sentence reads the same backwards, ignoring case, ' +
      'spaces and punctuation — and also picks out every individual word in your text that is ' +
      'itself a palindrome.',
    sections: [
      {
        h: 'What counts, and what is ignored',
        p: 'The check strips everything except letters and digits, then lowercases the rest, so “A ' +
           'man, a plan, a canal: Panama” reads as amanaplanacanalpanama and passes. That is the ' +
           'standard convention for phrase palindromes — punctuation and word boundaries are treated ' +
           'as typography rather than content. A strict character-for-character check, which would ' +
           'fail that phrase on the comma alone, is rarely what anyone means.',
      },
      {
        h: 'Palindromes worth knowing',
        p: 'The shortest interesting ones are everyday words: level, rotor, kayak, racecar, deified. ' +
           'The famous phrases are “A man, a plan, a canal: Panama” and “Never odd or even”. ' +
           'Napoleon is supposed to have said “Able was I ere I saw Elba”, which he did not. Numeric ' +
           'palindromes matter in programming interviews and in recreational mathematics — the ' +
           'Lychrel problem asks whether repeatedly reversing and adding a number always eventually ' +
           'produces a palindrome, and for 196 nobody knows.',
      },
      {
        h: 'Why programmers keep meeting this problem',
        p: 'Palindrome checking is the standard first exercise for two-pointer technique: walk one ' +
           'index from each end, compare, move inward. It runs in linear time with constant extra ' +
           'space, unlike the obvious reverse-and-compare, which allocates a second copy of the ' +
           'string — exactly what this tool does, because for text a person typed the difference is ' +
           'irrelevant. Interviewers like it because the naive answer is correct but not optimal, ' +
           'which gives the conversation somewhere to go.',
      },
    ],
    steps: [
      'Type or paste a word, phrase or sentence.',
      'The verdict appears immediately, with the cleaned string it actually tested.',
      'Check the word list underneath for individual palindromic words inside longer text.',
    ],
    notes: [
      'Case, spaces and punctuation are ignored; letters and digits are all that count.',
      'Single letters are technically palindromes but are excluded from the word list as noise.',
      'Accented characters are not folded, so “é” and “e” are treated as different letters.',
    ],
    faq: [
      ['Is “A man, a plan, a canal: Panama” a palindrome?',
       'Yes, by the usual convention. Stripping punctuation, spaces and case leaves ' +
       'amanaplanacanalpanama, which reads identically in both directions. It was composed by ' +
       'Leigh Mercer in 1948.'],
      ['Do numbers count as palindromes?',
       'Yes — 12321 and 2002 both qualify, and digits are included in the check. Palindromic ' +
       'numbers turn up constantly in puzzles and in number theory, where palindromic primes ' +
       'such as 131 and 10301 are a studied curiosity.'],
      ['What is the longest palindromic word in English?',
       '“Tattarrattat”, coined by James Joyce in Ulysses for a knock at the door, at twelve ' +
       'letters. Among words in ordinary dictionaries, “redivider” at nine is usually cited, and ' +
       '“detartrated” at eleven appears in chemistry.'],
    ],
  },

  // ── ENCODERS ──────────────────────────────────────────────────────────────────
  'url-decode': {
    intro:
      'Decodes percent-encoded URLs and query strings back to readable text, converting + to a ' +
      'space as query strings require, with an optional second pass for values that were ' +
      'encoded twice. Useful for reading a redirect chain, a tracking parameter or an error ' +
      'message buried in a URL.',
    sections: [
      {
        h: 'What percent-encoding is for',
        p: 'URLs may only carry a restricted set of ASCII characters, so anything else — a space, a ' +
           'non-Latin script, or a reserved character like & or ? used as data rather than as syntax ' +
           '— is written as % followed by the hexadecimal value of each UTF-8 byte. A space becomes ' +
           '%20, an ampersand inside a value becomes %26, and é becomes %C3%A9 because it is two ' +
           'bytes in UTF-8. Decoding reverses that, which is why a long redirect URL becomes legible ' +
           'the moment you paste it here.',
      },
      {
        h: 'Plus signs, and why they are special',
        p: 'In a query string, + historically means a space, a legacy of HTML form encoding. In a ' +
           'URL path, + is a literal plus. This decoder converts + to a space, which is right for ' +
           'the query strings that make up most of what people paste — but it means a path segment ' +
           'containing a genuine plus will come back wrong. If you are decoding a path rather than a ' +
           'query, replace the + with %2B before decoding.',
      },
      {
        h: 'Double encoding, and how to spot it',
        p: 'When a URL is passed through a redirect service or embedded as a parameter inside ' +
           'another URL, it often gets encoded twice, so a space becomes %2520 — the % of %20 itself ' +
           'encoded as %25. Seeing %25 followed by two more hex digits is the giveaway. Tick the ' +
           'decode-twice option and it resolves in one step. Triple encoding happens in badly built ' +
           'redirect chains; run the output through again if %25 survives the first pass.',
      },
      {
        h: 'Where malformed input comes from',
        p: 'A lone % that is not followed by two hex digits is invalid and will report an error — ' +
           'usually because the URL was truncated in an email, wrapped by a client, or contains a ' +
           'literal percent sign that was never encoded. Check for a line break inserted in the ' +
           'middle of the string, which is the commonest cause when a URL was copied out of a ' +
           'message.',
      },
    ],
    steps: [
      'Paste the encoded URL or query-string value.',
      'The decoded text appears immediately.',
      'If you see %25 in the output, tick decode twice and it resolves.',
    ],
    notes: [
      'Plus signs become spaces, which is correct for query strings and wrong for path ' +
       'segments.',
      'Percent-encoding is defined over UTF-8 bytes, so one non-Latin character can be three or ' +
       'four percent groups.',
      'Decoding happens in your browser, so tracking URLs and tokens are not transmitted.',
    ],
    faq: [
      ['What does %20 mean in a URL?',
       'A space. Space is not a legal URL character, so it is percent-encoded as its ASCII value ' +
       'in hexadecimal, 0x20. In a query string it may alternatively appear as a plus sign.'],
      ['Why does my decoded text still contain % signs?',
       'It was encoded more than once. %2520 is %20 that has itself been encoded, which happens ' +
       'when a URL is embedded inside another URL. Use the decode-twice option, and run it ' +
       'through again if the % survives.'],
      ['Is URL encoding the same as HTML encoding?',
       'No. URL encoding uses %XX for bytes not allowed in a URL. HTML encoding uses named or ' +
       'numeric entities like &amp; and &#39; to escape characters that would otherwise be ' +
       'markup. They solve similar problems in different places and are not interchangeable.'],
    ],
  },

  // ── UNITS ─────────────────────────────────────────────────────────────────────
  'time-converter': {
    intro:
      'Converts between nanoseconds, microseconds, milliseconds, seconds, minutes, hours, days, ' +
      'weeks, months, years, decades and centuries, all shown at once. The small units are for ' +
      'performance work; the large ones are for the question of how many hours are in a ' +
      'quarter.',
    sections: [
      {
        h: 'The large units are approximations, deliberately',
        p: 'Seconds through weeks are exact: sixty, sixty, twenty-four, seven. Beyond that, ' +
           'calendars stop cooperating. A month here is 30 days and a year is 365, which is the ' +
           'convention for back-of-envelope work — but real months run 28 to 31 days, and a ' +
           'Gregorian year averages 365.2425 days because of the leap rule (every four years, except ' +
           'centuries, except centuries divisible by 400). Over a decade that difference is about ' +
           'two and a half days. For contracts, billing periods and anything where a date must land ' +
           'correctly, count calendar days rather than converting.',
      },
      {
        h: 'Numbers worth having in your head',
        p: 'A day is 86,400 seconds. A week is 604,800. A 365-day year is 31,536,000 — close enough ' +
           'to π × 10⁷ (31,415,927) that the approximation is a long-running engineering joke, and ' +
           'accurate to 0.4%. A working year at 40 hours a week over 52 weeks is 2,080 hours, which ' +
           'is the basis of nearly every hourly-to-salary conversion. A million seconds is about ' +
           'eleven and a half days; a billion seconds is about 31.7 years.',
      },
      {
        h: 'Where milliseconds and below matter',
        p: 'Web performance budgets are written in milliseconds: 100 ms feels instantaneous, 1 ' +
           'second keeps a user\'s train of thought, 10 seconds loses them. Video runs at 16.7 ms per ' +
           'frame at 60fps, 33.3 ms at 30fps. Network round trips within a data centre are ' +
           'sub-millisecond; across an ocean they are 100–200 ms, which no amount of optimisation ' +
           'reduces because it is the speed of light in fibre. Microseconds and nanoseconds belong ' +
           'to CPU work — a memory access is tens of nanoseconds, an SSD read tens of microseconds.',
      },
    ],
    steps: [
      'Enter the duration you have.',
      'Select its unit.',
      'Read every other unit at once — updates live as you type.',
    ],
    notes: [
      'Months are treated as 30 days and years as 365 — fine for estimates, not for dates.',
      'Units up to a week are exact.',
      'For an exact interval between two dates, use a date difference calculator rather than ' +
       'converting a duration.',
    ],
    faq: [
      ['How many seconds are in a day?',
       '86,400 — 60 × 60 × 24. Occasionally 86,401, when a leap second is added to keep atomic ' +
       'time aligned with the Earth\'s rotation, although the practice is being phased out by ' +
       '2035.'],
      ['How many hours are in a year?',
       '8,760 for a 365-day year, and 8,784 in a leap year. A standard working year is 2,080 ' +
       'hours (40 hours × 52 weeks), which drops to roughly 1,880 once typical holiday and ' +
       'public holidays are deducted.'],
      ['Why is a month treated as 30 days here?',
       'Because a month has no fixed length — it runs from 28 to 31 days — so any converter has ' +
       'to choose a convention. Thirty days is the usual one for estimates. When the exact ' +
       'number matters, count the calendar days between the two actual dates instead.'],
    ],
  },
  'energy-converter': {
    intro:
      'Converts between joules, kilojoules and megajoules, calories and kilocalories, ' +
      'watt-hours and kilowatt-hours, BTU, electronvolts, foot-pounds and ergs. The two ' +
      'questions it mostly answers are what a food label means and what a kilowatt-hour costs.',
    sections: [
      {
        h: 'The calorie on your food label is a kilocalorie',
        p: 'A scientific calorie is the energy to raise one gram of water by one degree — 4.184 ' +
           'joules. A food Calorie, capitalised, is a thousand of those. So a 250-Calorie snack is ' +
           '250 kcal, or just over a megajoule. European labels sidestep the confusion by printing ' +
           'kilojoules alongside, which is why the same chocolate bar shows both 230 kcal and 962 ' +
           'kJ. When converting, check which calorie you have: an order of magnitude of three ' +
           'separates them.',
      },
      {
        h: 'Energy and power are different quantities',
        p: 'A watt is a rate — one joule per second. A watt-hour is an amount — what a one-watt ' +
           'device consumes in an hour, which is 3,600 joules. Electricity is billed in ' +
           'kilowatt-hours because what you pay for is the amount, not the rate. A 2,000 W kettle ' +
           'running for six minutes uses 0.2 kWh; a 5 W LED bulb left on all day uses 0.12 kWh. ' +
           'Confusing the two is why “kW” and “kWh” get swapped in energy reporting constantly, and ' +
           'the difference is not cosmetic.',
      },
      {
        h: 'A sense of scale',
        p: 'One joule is roughly the energy of dropping an apple a metre. A kilowatt-hour — 3.6 ' +
           'million joules — runs a fridge for a day or boils about ten kettles. A BTU, the unit air ' +
           'conditioning is rated in, is 1,055 joules, so a 12,000 BTU/hour unit is drawing about ' +
           '3.5 kW of cooling. An electronvolt, at 1.6 × 10⁻¹⁹ joules, is the natural unit for ' +
           'particle physics and semiconductor band gaps; silicon\'s is 1.1 eV, which is why solar ' +
           'cells respond to the wavelengths they do.',
      },
    ],
    steps: [
      'Enter the energy value.',
      'Select the unit it is given in.',
      'Read every other unit at once.',
    ],
    notes: [
      'One food Calorie equals one kilocalorie equals 4,184 joules.',
      'One kilowatt-hour is exactly 3.6 megajoules.',
      'The electronvolt uses the exact SI value, 1.602176634 × 10⁻¹⁹ J, fixed by definition ' +
       'since 2019.',
    ],
    faq: [
      ['How many joules are in a calorie?',
       '4.184 joules in a scientific (small) calorie, and 4,184 in a food Calorie, which is a ' +
       'kilocalorie. Food labels mean the large one, so a 500-Calorie meal is about 2.1 ' +
       'megajoules.'],
      ['What is a kilowatt-hour in joules?',
       '3,600,000 — 3.6 megajoules. One kilowatt sustained for one hour, and 3,600 seconds times ' +
       '1,000 joules per second.'],
      ['What is the difference between kW and kWh on my electricity bill?',
       'kW is the rate at which something draws power; kWh is the quantity of energy consumed ' +
       'and what you are charged for. A 3 kW heater running for two hours uses 6 kWh. Bills are ' +
       'in kWh; appliance ratings are in kW.'],
    ],
  },

  // ── NUMBERS ───────────────────────────────────────────────────────────────────
  'number-to-words': {
    intro:
      'Spells a number out in English words, in either the international system (thousand, ' +
      'million, billion) or the Indian system (thousand, lakh, crore). Decimals are read digit ' +
      'by digit after “point”, and negatives are prefixed — which is the convention cheques and ' +
      'legal documents expect.',
    sections: [
      {
        h: 'Two numbering systems, two sets of groupings',
        p: 'The international system groups digits in threes: 1,000,000 is one million. The Indian ' +
           'system groups the first three and then in twos: 10,00,000 is ten lakh, and 1,00,00,000 ' +
           'is one crore. So 2,500,000 is “two point five million” to one reader and “twenty-five ' +
           'lakh” to another — the same quantity, differently parsed. If you are writing for an ' +
           'Indian audience, lakh and crore are not a translation but the normal way the number is ' +
           'said, and using millions reads as foreign.',
      },
      {
        h: 'Why anyone needs a number spelled out',
        p: 'Cheques, which require the amount in words as a fraud control, because words cannot be ' +
           'altered with a pen stroke the way a digit can. Contracts and invoices, where the words ' +
           'govern if they conflict with the figures. Legal drafting generally. Accessibility, where ' +
           'a screen reader handles a written-out figure more predictably than a long digit string. ' +
           'And language learning, where saying a large number aloud correctly is a genuine skill.',
      },
      {
        h: 'Conventions worth following',
        p: 'On a cheque, write the amount in words followed by “only” and strike out the remaining ' +
           'space, so nothing can be appended. Decimals are read digit by digit — 3.14 as “three ' +
           'point one four”, never “three point fourteen” — except for currency, where you write the ' +
           'fractional part as its own unit: “one thousand five hundred rupees and fifty paise”, or ' +
           '“and 50/100” on a US cheque. English does not put “and” between hundreds and tens in ' +
           'American usage but does in British usage: one hundred five against one hundred and five. ' +
           'Either is understood.',
      },
    ],
    steps: [
      'Type the number — decimals and a leading minus sign are both accepted.',
      'Choose international or Indian numbering.',
      'Copy the result.',
    ],
    notes: [
      'Decimal places are read out digit by digit after the word point.',
      'Negative numbers are prefixed with “negative”.',
      'The Indian system switches to lakh at 100,000 and crore at 10,000,000, with grouping to ' +
       'match.',
    ],
    faq: [
      ['How do I write an amount in words on a cheque?',
       'Write the whole amount, then the currency, then the fractional part, then “only” — for ' +
       'example “One Lakh Twenty-Five Thousand Rupees Only” or “One Thousand Five Hundred and ' +
       '50/100 Dollars”. Fill the remaining space with a line so nothing can be added after it.'],
      ['What is a crore in millions?',
       'One crore is ten million, and one lakh is one hundred thousand. So 5 crore is 50 ' +
       'million, and 25 lakh is 2.5 million. The switch between the systems happens at the lakh: ' +
       'below 100,000 the two count identically.'],
      ['How should decimals be spoken?',
       'Digit by digit after “point”: 3.14 is “three point one four”. Reading it as “three point ' +
       'fourteen” is ambiguous, since 3.14 and 3.014 would sound similar. Currency is the ' +
       'exception — there the fraction is named as its own unit, such as cents or paise.'],
    ],
  },

  // ── TOKENS ────────────────────────────────────────────────────────────────────
  'jwt-decoder': {
    intro:
      'Decodes a JSON Web Token and shows you its header, its payload and whether it has ' +
      'expired, with the time since it was issued. It reads the token; it does not verify the ' +
      'signature — and understanding why those are different operations is most of what there ' +
      'is to know about JWTs.',
    sections: [
      {
        h: 'Three parts, two of them public',
        p: 'A JWT is three Base64url segments joined by dots. The header says which algorithm signed ' +
           'it. The payload carries the claims — who the token is about, who issued it, when it ' +
           'expires, and whatever else the issuer added. The signature is computed over the first ' +
           'two. Only the signature is protected: header and payload are encoded, not encrypted, so ' +
           'anybody holding the token can read them, as this page demonstrates in one paste. Never ' +
           'put a password, a card number or anything else confidential in a JWT payload.',
      },
      {
        h: 'The registered claims, and which ones matter',
        p: 'exp is the expiry as a Unix timestamp in seconds — the one this tool checks. iat is when ' +
           'it was issued, nbf the earliest time it is valid, sub the subject (usually a user id), ' +
           'iss the issuer, aud the intended audience and jti a unique token id used for revocation ' +
           'lists. A correct verifier checks exp, nbf, iss and aud, not just the signature: a ' +
           'perfectly signed token issued by the wrong party for a different audience is still a ' +
           'valid signature and an invalid token.',
      },
      {
        h: 'Decoding is not verifying',
        p: 'This tool tells you what a token says. It cannot tell you whether the token is genuine, ' +
           'because verification needs the secret or the public key, which only the server has. That ' +
           'distinction is the source of the most serious JWT vulnerabilities: libraries that ' +
           'decoded without verifying, and libraries that trusted the header\'s alg field — letting ' +
           'an attacker set it to “none” and strip the signature, or switch an RS256 token to HS256 ' +
           'and sign it with the public key as the secret. Always verify against an algorithm your ' +
           'server chose, never the one the token claims.',
      },
      {
        h: 'What to do about an expired token',
        p: 'An expired access token is normal and expected — short lifetimes (5 to 15 minutes) limit ' +
           'the damage if one leaks, which is why they exist. The client exchanges a longer-lived ' +
           'refresh token for a new one. If you are debugging a 401, check exp here first: a clock ' +
           'skew of a few minutes between your machine and the issuer is a common and confusing ' +
           'cause, which is why most verifiers allow a small leeway.',
      },
    ],
    steps: [
      'Paste the token, or load the sample to see the structure.',
      'Read the header to see the signing algorithm, and the payload for the claims.',
      'Check the expiry status and the issued-at age.',
      'To verify the signature rather than read the token, use your server\'s library and key — ' +
       'not a web page.',
    ],
    notes: [
      'Header and payload are Base64url encoded, not encrypted — treat everything in them as ' +
       'public.',
      'exp, iat and nbf are Unix timestamps in seconds, not milliseconds; a token that looks ' +
       'like it expires in 1970 usually has milliseconds by mistake.',
      'Decoding happens in your browser, but a production token pasted into any web page should ' +
       'be treated as worth revoking.',
    ],
    faq: [
      ['Is it safe to paste a JWT into a decoder?',
       'This one decodes entirely in your browser and sends nothing anywhere. The general habit ' +
       'is still worth keeping: a token is a credential, so prefer an expired or test token when ' +
       'debugging, and rotate anything live that you pasted into a tool you have not checked.'],
      ['Can I change a claim and reuse the token?',
       'No. Editing the payload changes the bytes the signature was computed over, so any ' +
       'correct verifier rejects it. That is the entire point of the signature — and why the ' +
       'historical attacks targeted verifiers that could be tricked into skipping the check ' +
       'rather than the cryptography itself.'],
      ['Why does my token show as expired when the server accepts it?',
       'Clock difference. exp is compared against your browser\'s clock here and against the ' +
       'server\'s clock there; a few minutes of drift flips the verdict either way. Most ' +
       'verifiers allow a leeway of 30 to 60 seconds for exactly this reason.'],
    ],
  },

  // ── JSON ──────────────────────────────────────────────────────────────────────
  'json-validator': {
    intro:
      'Checks whether text is valid JSON and, when it is not, says what is wrong and where. ' +
      'Most invalid JSON fails for one of about five reasons, and the error message plus the ' +
      'position is usually enough to spot which.',
    sections: [
      {
        h: 'The five things JSON does not allow',
        p: 'Trailing commas after the last element of an object or array — legal in JavaScript, ' +
           'illegal in JSON, and by far the most common failure. Comments of any kind. Single-quoted ' +
           'strings; JSON requires double quotes. Unquoted keys, so {name: "x"} is invalid where ' +
           '{"name": "x"} is fine. And the JavaScript literals undefined, NaN and Infinity, none of ' +
           'which exist in JSON — use null. If your file has comments or trailing commas by design, ' +
           'it is JSONC or JSON5, which needs a different parser.',
      },
      {
        h: 'Reading the error position',
        p: 'The parser reports the character offset where it gave up, which is where the problem ' +
           'became unrecoverable rather than necessarily where it started. A missing closing brace ' +
           'is usually reported at the end of the file; an unescaped quote inside a string is ' +
           'reported at the next structural character. Work backwards from the reported position to ' +
           'the last point the document was definitely well formed.',
      },
      {
        h: 'Valid is not the same as correct',
        p: 'A document can parse perfectly and still be wrong for its purpose: a field missing, a ' +
           'number sent as a string, a date in the wrong format, an array where an object was ' +
           'expected. That is what JSON Schema is for — a separate document describing which fields ' +
           'must exist and what shape they take, checked by a validator that understands it. Syntax ' +
           'validation, which is what this tool does, is the first gate, not the only one.',
      },
    ],
    steps: [
      'Paste the JSON you want to check.',
      'Read the verdict — valid, or the error message with its position.',
      'Fix the reported problem and re-check; one syntax error frequently masks another.',
    ],
    notes: [
      'Numbers are parsed as IEEE-754 doubles, so integers beyond 2⁵³ lose precision even ' +
       'though the document is syntactically valid.',
      'Duplicate keys are permitted by the specification and resolve to the last occurrence — ' +
       'valid, and almost always a mistake.',
      'Validation runs in your browser, so API payloads and config files stay local.',
    ],
    faq: [
      ['Why is my JSON invalid when it looks fine?',
       'Check for a trailing comma before a closing brace or bracket, a comment, single quotes ' +
       'instead of double, or an unquoted key. All four are legal JavaScript and illegal JSON, ' +
       'which is why code copied out of a source file so often fails to parse.'],
      ['Can JSON have comments?',
       'No. The specification has no comment syntax, deliberately. Formats that allow them — ' +
       'JSONC, used by VS Code settings, and JSON5 — are extensions, and a standard parser ' +
       'rejects them. Strip comments before validating.'],
      ['Does the order of keys matter?',
       'Not for validity, and not for meaning — JSON objects are unordered by definition. Most ' +
       'parsers do preserve insertion order in practice, but nothing should depend on it. ' +
       'Arrays, by contrast, are ordered and their order is significant.'],
    ],
  },
  'json-to-yaml': {
    intro:
      'Converts JSON into YAML, which is what Kubernetes manifests, GitHub Actions workflows, ' +
      'Docker Compose files and most modern configuration formats expect. The data is ' +
      'identical; only the punctuation changes.',
    sections: [
      {
        h: 'YAML is a superset of JSON, which makes this safe',
        p: 'Every valid JSON document is already valid YAML, so the conversion is a reformatting ' +
           'rather than a translation — nothing needs to be approximated or dropped. Braces and ' +
           'brackets become indentation, quotes around keys disappear, and array elements get a ' +
           'leading dash. The resulting file is typically shorter and considerably easier to read ' +
           'and to review in a pull request, which is why configuration migrated to it.',
      },
      {
        h: 'Indentation is the syntax, so it has to be spaces',
        p: 'YAML uses indentation for structure, and tab characters are forbidden outright — a tab ' +
           'anywhere in the document is a parse error, not a style problem. Two spaces per level is ' +
           'the near-universal convention. Because whitespace carries meaning, a YAML file is far ' +
           'easier to break by accident than a JSON one: a single misaligned line changes which ' +
           'parent a key belongs to, and the result often parses cleanly into the wrong structure ' +
           'rather than failing.',
      },
      {
        h: 'The Norway problem, and other YAML surprises',
        p: 'YAML 1.1 treats a bare no as the boolean false, which famously turned Norway\'s country ' +
           'code NO into false in more than one production system. Bare yes, on, off and y are ' +
           'booleans too. A version number written as 1.10 becomes the number 1.1, and a MAC address ' +
           'or a time like 22:30 can be read as a sexagesimal integer. The fix is always the same: ' +
           'quote any string that could be mistaken for something else. YAML 1.2 narrowed the ' +
           'boolean rules, but many parsers still implement 1.1.',
      },
      {
        h: 'When to keep the JSON',
        p: 'YAML is better to write and review; JSON is better to generate and parse. ' +
           'Machine-to-machine payloads, API responses and anything a program produces should stay ' +
           'JSON — it is unambiguous, every language parses it identically, and it has no whitespace ' +
           'to corrupt. Reach for YAML where a human edits the file by hand and wants comments, ' +
           'which JSON cannot have.',
      },
    ],
    steps: [
      'Paste your JSON on the left.',
      'The YAML equivalent appears on the right as you type.',
      'Copy it, and quote any value that might be read as a boolean or a number.',
    ],
    notes: [
      'Indentation is two spaces per level; never replace it with tabs.',
      'Comments cannot survive a round trip — JSON has none, so converting YAML to JSON and ' +
       'back loses them permanently.',
      'Conversion runs in your browser; secrets in a config file are not transmitted.',
    ],
    faq: [
      ['Is YAML better than JSON?',
       'For files people edit by hand, usually — it is less noisy and supports comments. For ' +
       'data exchanged between programs, no: JSON is unambiguous, universally supported and has ' +
       'no whitespace sensitivity. They are suited to different jobs rather than competing.'],
      ['Why did my value change when I converted it?',
       'YAML infers types from unquoted text. no and off become false, 1.10 becomes 1.1, 007 may ' +
       'become 7, and 22:30 can become an integer. Wrap anything that must stay a string in ' +
       'quotes.'],
      ['Can I convert YAML back to JSON?',
       'Yes — use the YAML to JSON tool. The data round-trips exactly, with one loss: any ' +
       'comments in the YAML disappear, because JSON has nowhere to put them.'],
    ],
  },

  // ── EVERYDAY ──────────────────────────────────────────────────────────────────
  'date-difference': {
    intro:
      'Works out the time between two dates in years, months and days, and also as a plain ' +
      'total of days and weeks, with an option to count the end date itself. The two figures ' +
      'answer different questions, and using the wrong one is where most date arithmetic goes ' +
      'astray.',
    sections: [
      {
        h: 'Total days and calendar months are not convertible',
        p: 'The total-days figure is exact: one subtraction. The years-months-days breakdown is ' +
           'calendar arithmetic, and months vary from 28 to 31 days, so 1 January to 1 March is “two ' +
           'months” and either 59 or 60 days depending on the year. Neither is wrong — they answer ' +
           'different questions. Use total days for anything you are billing, accruing or counting; ' +
           'use the breakdown for anything you would say out loud, like how long a project ran.',
      },
      {
        h: 'Inclusive or exclusive: the off-by-one that costs money',
        p: 'From the 1st to the 5th is four days if you count the gaps and five if you count the ' +
           'days themselves. Hotels charge for nights, so four; a contractor invoicing days worked ' +
           'means five; a notice period usually excludes the day it was served but includes the last ' +
           'day. Neither convention is the default — which one applies depends on the document. The ' +
           'include-end-date option switches between them, and it is worth deciding deliberately ' +
           'rather than accepting whatever comes out.',
      },
      {
        h: 'Leap years, and the 29 February problem',
        p: 'A leap year is every year divisible by four, except centuries, except centuries ' +
           'divisible by 400 — so 2000 was a leap year and 1900 was not. The calculation here ' +
           'handles that automatically. What no calculation can settle is what an anniversary of 29 ' +
           'February means in a common year: different jurisdictions and contracts treat it as 28 ' +
           'February or 1 March, and if it matters to yours, the contract has to say which.',
      },
      {
        h: 'What people use it for',
        p: 'Counting notice periods and probation. Visa and residency day-counts, where the rules ' +
           'are usually inclusive and the consequences of miscounting are real. Project durations ' +
           'and invoicing. Time until a deadline, a launch or a due date. Working out an exact age ' +
           'in days, or how long ago something happened when “a couple of years” is not precise ' +
           'enough.',
      },
    ],
    steps: [
      'Pick the start date and the end date — order does not matter, they are sorted for you.',
      'Choose whether the end date itself counts.',
      'Read the years-months-days breakdown, the total days and the weeks.',
    ],
    notes: [
      'Dates are compared as calendar dates, so time zones and daylight saving do not shift the ' +
       'result.',
      'The weeks figure is total days divided by seven, including the fraction — not whole ' +
       'weeks.',
      'Everything is computed locally; no dates are sent anywhere.',
    ],
    faq: [
      ['Should I include the end date?',
       'It depends what you are counting. Nights in a hotel: no. Days worked on an invoice, or ' +
       'days present for a visa calculation: usually yes. Notice periods vary by jurisdiction ' +
       'and contract. When money or a legal deadline is involved, check the wording rather than ' +
       'assuming.'],
      ['Why does the months figure not match total days divided by 30?',
       'Because calendar months are not 30 days. The breakdown walks the actual calendar — ' +
       'counting whole months from the start date and then the remaining days — so a period ' +
       'spanning February and a period spanning July give different day totals for the same ' +
       '“number of months”.'],
      ['Does it count working days?',
       'No — it counts calendar days, weekends and holidays included. Business-day counts need a ' +
       'holiday calendar for the specific country and often the specific region, which is a ' +
       'different calculation.'],
    ],
  },

  // ── CSS ───────────────────────────────────────────────────────────────────────
  'css-flexbox': {
    intro:
      'Builds a flexbox layout visually — direction, wrapping, and alignment on both axes — ' +
      'with a live preview and the CSS to copy. Flexbox governs one dimension at a time, which ' +
      'is the single idea that makes the property names stop being confusing.',
    sections: [
      {
        h: 'Main axis and cross axis, and why the names change meaning',
        p: 'justify-content aligns along the main axis; align-items aligns across it. Which ' +
           'direction those are depends entirely on flex-direction: with row, the main axis is ' +
           'horizontal, so justify-content moves things left and right. Switch to column and the ' +
           'same property now moves them up and down. Nearly every moment of confusion with flexbox ' +
           'comes from reaching for justify-content when the direction has changed under you. Learn ' +
           'the pair as “along” and “across” rather than as horizontal and vertical.',
      },
      {
        h: 'The centring problem, solved',
        p: 'display: flex with justify-content: center and align-items: center centres a child both ' +
           'ways, in two lines, on a container of any size. This was genuinely difficult before ' +
           'flexbox — the old approaches involved absolute positioning with negative margins, or ' +
           'table-cell display, and none worked for content of unknown height. If you learn one ' +
           'flexbox pattern, learn this one.',
      },
      {
        h: 'flex-wrap, and the three-number shorthand',
        p: 'By default flex items refuse to wrap and shrink instead, which is why a row of cards ' +
           'gets narrower and narrower on a phone rather than stacking. flex-wrap: wrap lets them ' +
           'move to a new line. On the items themselves, flex is shorthand for grow, shrink and ' +
           'basis: flex: 1 means grow to fill the space, flex: 0 0 auto means keep your natural ' +
           'size, and flex: 1 1 300px means start at 300px and flex from there — which, with wrap, ' +
           'is the whole recipe for a responsive card grid without a media query.',
      },
      {
        h: 'When to use grid instead',
        p: 'Flexbox lays out one dimension; grid lays out two. If you are aligning a row of buttons, ' +
           'centring something, spacing a navbar, or distributing items along a line, flexbox is ' +
           'simpler and right. If you need rows and columns to align with each other — a page ' +
           'layout, a dashboard, a genuine table of cards where column three lines up across every ' +
           'row — that is grid. They compose: a grid of cards whose contents are each laid out with ' +
           'flex is entirely normal.',
      },
    ],
    steps: [
      'Set flex-direction to row or column — this decides what the other properties mean.',
      'Adjust justify-content to distribute items along that axis.',
      'Adjust align-items to align them across it.',
      'Turn on wrapping if items should move to a new line, then copy the generated CSS.',
    ],
    notes: [
      'gap works in flexbox in every current browser — use it instead of margins on children.',
      'align-content only has an effect when items wrap onto multiple lines; on a single line ' +
       'it does nothing, which is a frequent source of confusion with align-items.',
      'An item\'s own align-self overrides the container\'s align-items for that item alone.',
    ],
    faq: [
      ['How do I centre a div horizontally and vertically?',
       'Put display: flex, justify-content: center and align-items: center on the parent, and ' +
       'give the parent a height. That is the whole answer, and it works whatever size the child ' +
       'is.'],
      ['What is the difference between justify-content and align-items?',
       'justify-content distributes items along the main axis, align-items aligns them across ' +
       'it. With flex-direction: row the main axis is horizontal; with column it is vertical, ' +
       'and the two swap roles. Think along and across, not horizontal and vertical.'],
      ['Should I use flexbox or CSS grid?',
       'Flexbox for one dimension — a row, a column, a navbar, centring. Grid when you need rows ' +
       'and columns to line up with one another. Nesting flex containers inside grid cells is ' +
       'normal and often the cleanest answer.'],
    ],
  },

  // ── ENCODERS ──────────────────────────────────────────────────────────────────
  'html-decode': {
    intro:
      'Converts HTML entities back into the characters they stand for — &amp;amp; to &, ' +
      '&amp;lt; to &lt;, &amp;#39; to an apostrophe, &amp;nbsp; to a space. Useful when text ' +
      'has come out of a CMS, an RSS feed or a database with its markup escaping still ' +
      'attached.',
    sections: [
      {
        h: 'Why entities exist at all',
        p: 'Four characters cannot appear literally in HTML where they would be read as markup: <, ' +
           '>, & and, inside attributes, the quote characters. Escaping them as entities is what ' +
           'stops a user\'s comment containing a script tag from becoming a script tag — it is the ' +
           'foundation of cross-site scripting defence. Entities also cover characters that are hard ' +
           'to type or invisible, such as &amp;nbsp; for a non-breaking space and &amp;mdash; for an ' +
           'em dash.',
      },
      {
        h: 'Double encoding, and how to recognise it',
        p: 'Seeing &amp;amp;lt; in your output means the text was escaped twice: the & of &amp;lt; ' +
           'was itself escaped. It happens when text passes through two layers that each escape ' +
           'defensively — a CMS that escapes on save and a template that escapes on render. Decoding ' +
           'once gives you &amp;lt;; decoding again gives you <. The fix in the code is to escape at ' +
           'exactly one layer, normally at output, and never at storage.',
      },
      {
        h: 'Named, decimal and hexadecimal forms',
        p: 'The same character can be written three ways: &amp;amp;, &amp;#38; and &amp;#x26; are ' +
           'all an ampersand. Named entities are readable but only cover a defined list; numeric ' +
           'forms work for any Unicode code point, which is why exported content often uses them for ' +
           'anything beyond ASCII. This decoder handles all three. Note that only &amp;amp;, ' +
           '&amp;lt;, &amp;gt;, &amp;quot; and &amp;apos; are defined in XML — an XML parser will ' +
           'reject &amp;nbsp;, which is a common surprise when HTML content is pasted into an XML ' +
           'feed.',
      },
      {
        h: 'The non-breaking space problem',
        p: '&amp;nbsp; decodes to U+00A0, which looks exactly like an ordinary space and behaves ' +
           'differently: it does not collapse, does not break a line, and does not match a space in ' +
           'a search or a comparison. Text pasted from a web page is full of them, and they are the ' +
           'usual reason two apparently identical strings do not match, or a whitespace cleaner ' +
           'leaves double spaces behind. Convert them explicitly if you are cleaning text for ' +
           'storage.',
      },
    ],
    steps: [
      'Paste the text containing HTML entities.',
      'The decoded text appears immediately.',
      'If entities remain in the output, it was double-encoded — run the result through again.',
    ],
    notes: [
      'Named, decimal and hexadecimal entities are all recognised.',
      '&amp;nbsp; becomes a non-breaking space, not a regular one — they look identical and ' +
       'compare differently.',
      'Decoding runs in your browser; content is not uploaded.',
    ],
    faq: [
      ['What does &amp;nbsp; mean?',
       'A non-breaking space: a space that browsers will not collapse with its neighbours and ' +
       'will not break a line at. It is used to keep “10 kg” or “Mr Smith” together. It decodes ' +
       'to a real character, U+00A0, which is not the same as the ordinary space you type.'],
      ['Why do I still see &amp;amp; after decoding?',
       'The text was encoded twice. Decode it a second time and the remaining entities resolve. ' +
       'In code, the cure is to escape at exactly one point in the pipeline rather than ' +
       'defensively at several.'],
      ['Is HTML decoding safe?',
       'Decoding text is safe. Inserting decoded text back into a page is not — that is ' +
       'precisely how cross-site scripting works. Decode for reading and processing; re-escape ' +
       'before rendering, and never assign decoded user content to innerHTML.'],
    ],
  },
  'hex-encode': {
    intro:
      'Converts text to its hexadecimal representation, two digits per byte, encoding as UTF-8. ' +
      'Hex is how bytes are written whenever they need to be readable — in a hex editor, a ' +
      'protocol dump, a colour value, a hash, a memory address.',
    sections: [
      {
        h: 'Why base 16 and not base 10',
        p: 'One hex digit is exactly four bits, so a byte is always exactly two hex digits with no ' +
           'padding decisions and no ambiguity. Decimal does not divide into bytes cleanly: 255 is ' +
           'three digits and 7 is one, so a decimal byte dump needs separators and alignment. In ' +
           'hex, every byte occupies the same two columns, which is why every hex editor, packet ' +
           'capture and memory dump uses it. It also makes bit patterns visible — 0xF0 is obviously ' +
           'the top four bits set.',
      },
      {
        h: 'Bytes, not characters',
        p: 'Encoding is UTF-8, so ASCII takes one byte and two hex digits, most accented European ' +
           'letters take two bytes, Devanagari and CJK three, and emoji four. “Hi” is 4869; “café” ' +
           'is 636166c3a9 — ten hex digits for four letters, because é is two bytes. A tool that ' +
           'assumed one byte per character would produce output that could not be decoded back.',
      },
      {
        h: 'Where you meet hex in practice',
        p: 'Colour values: #3B82F6 is three bytes, red then green then blue. Hashes: an MD5 is 16 ' +
           'bytes shown as 32 hex digits, a SHA-256 is 32 bytes as 64. MAC addresses are six bytes. ' +
           'Unicode code points are conventionally written U+0041. In debugging, hex is how you spot ' +
           'the invisible: a byte-order mark shows as EFBBBF at the start of a file, a non-breaking ' +
           'space as C2A0, and a Windows line ending as 0D0A where Unix has just 0A.',
      },
    ],
    steps: [
      'Type or paste your text.',
      'The hexadecimal output appears immediately.',
      'Copy it — and use the hex decoder to convert back.',
    ],
    notes: [
      'Two hex digits per byte, encoded as UTF-8.',
      'Hex is case-insensitive: 4A and 4a are the same byte. Lowercase is the more common ' +
       'convention for hashes, uppercase for colour codes.',
      'Everything runs in your browser.',
    ],
    faq: [
      ['What is hex encoding used for?',
       'Writing raw bytes in a form people can read and copy: hashes, colour codes, MAC ' +
       'addresses, memory dumps, protocol traces, binary file inspection. It is not compression ' +
       'or encryption — hex output is exactly twice the size of the input and trivially ' +
       'reversible.'],
      ['What is the difference between hex and Base64?',
       'Both represent bytes as text. Hex uses 16 characters and takes two per byte, so the ' +
       'output doubles in size but each byte is readable at a glance. Base64 uses 64 characters ' +
       'and packs three bytes into four, so it grows by only a third — better for transport, ' +
       'worse for reading. Hex for inspection, Base64 for moving data.'],
      ['Why does one character produce more than two digits?',
       'Because it takes more than one byte in UTF-8. Only the ASCII range is one byte per ' +
       'character; accented letters are two, most Asian scripts three, emoji four.'],
    ],
  },

  // ── TEXT ──────────────────────────────────────────────────────────────────────
  'rot13': {
    intro:
      'Applies ROT13, the substitution that rotates each letter thirteen places through the ' +
      'alphabet. Because thirteen is half of twenty-six, encoding and decoding are the same ' +
      'operation — run any text through twice and you get the original back.',
    sections: [
      {
        h: 'What it does and does not touch',
        p: 'Letters rotate: A becomes N, N becomes A, a becomes n. Case is preserved. Digits, ' +
           'spaces, punctuation and every non-Latin character pass through unchanged, which is why ' +
           'ROT13 text is instantly recognisable — the word shapes and punctuation survive, so it ' +
           'reads as plausible gibberish rather than as random bytes. The classic demonstration is ' +
           'that “WKXKXKX” and “JXKXKXK” are each other\'s ROT13.',
      },
      {
        h: 'It is not encryption, and was never meant to be',
        p: 'There is no key. Anyone who recognises ROT13 can reverse it, and a computer can break it ' +
           'instantly by trying all 25 rotations. Its actual purpose, on Usenet from the early 1980s ' +
           'onward, was social: hiding a spoiler, a punchline or an offensive joke behind one ' +
           'deliberate step, so that reading it was a choice. It is a politeness convention wearing ' +
           'the costume of a cipher, and using it to protect anything real is a well-known category ' +
           'error.',
      },
      {
        h: 'ROT13 and the Caesar cipher family',
        p: 'ROT13 is the Caesar cipher with a shift of thirteen. Caesar reportedly used a shift of ' +
           'three; any shift from 1 to 25 works the same way, and all are broken by frequency ' +
           'analysis or simple brute force. Thirteen is special only because it is self-inverse, ' +
           'which saves having separate encode and decode functions. The variant ROT47 extends the ' +
           'idea across 94 printable ASCII characters, so it scrambles digits and punctuation too — ' +
           'and is equally unprotective.',
      },
    ],
    steps: [
      'Type or paste your text.',
      'The rotated text appears immediately.',
      'To decode, paste the rotated text in — the operation is its own inverse.',
    ],
    notes: [
      'Only A–Z and a–z are affected; numbers, punctuation and other scripts are untouched.',
      'Applying it twice returns the original text exactly.',
      'Everything runs in your browser.',
    ],
    faq: [
      ['How do I decode ROT13?',
       'Paste the encoded text into the same tool. Thirteen plus thirteen is twenty-six, a full ' +
       'rotation, so encoding and decoding are identical operations. There is no separate decode ' +
       'button because there is no need for one.'],
      ['Is ROT13 secure?',
       'Not remotely, and it does not claim to be. It has no key and is reversed by anyone who ' +
       'notices what it is. Use it to hide a spoiler, never to protect information.'],
      ['What is ROT47?',
       'A variant that rotates 94 printable ASCII characters by 47 instead of rotating 26 ' +
       'letters by 13, so digits and punctuation are scrambled as well. It is also self-inverse, ' +
       'and also provides no security.'],
    ],
  },

  // ── UNITS ─────────────────────────────────────────────────────────────────────
  'digital-converter': {
    intro:
      'Converts between bits and bytes, kilobytes through petabytes, the binary kibi/mebi/gibi ' +
      'units, and network speeds in kilobits, megabits and gigabits per second. It exists ' +
      'because “GB” means two different numbers depending on who wrote it.',
    sections: [
      {
        h: '1000 or 1024: the reason your drive looks smaller',
        p: 'A kilobyte is 1,000 bytes under the SI definition and 1,024 under the older computing ' +
           'convention. Drive manufacturers use 1,000; Windows reports using 1,024 while still ' +
           'writing “GB”. The gap compounds with each step — 2.4% at kilobytes, 7.4% at gigabytes, ' +
           '10% at terabytes — so a 1 TB drive shows as about 931 GB in Windows and nothing is ' +
           'missing. macOS and Linux switched to the SI meaning years ago, which is why the same ' +
           'drive reports differently on different machines.',
      },
      {
        h: 'KiB, MiB and GiB are the unambiguous ones',
        p: 'IEC introduced the binary prefixes in 1998 precisely to end this: a kibibyte (KiB) is ' +
           'exactly 1,024 bytes, a mebibyte 1,048,576, a gibibyte 1,073,741,824. Both families are ' +
           'in this converter so you can move between them. Memory is genuinely binary — an 8 GB RAM ' +
           'module is 8 GiB, because addressing works in powers of two — while storage and file ' +
           'sizes are usually decimal. When precision matters, write KiB and MiB and the ambiguity ' +
           'disappears.',
      },
      {
        h: 'Bits and bytes: the factor of eight that halves your broadband',
        p: 'A byte is eight bits. Storage is quoted in bytes with a capital B; network speed is ' +
           'quoted in bits with a lowercase b. So a 100 Mbps connection transfers at most about 12.5 ' +
           'MB per second, and a 1 Gbps line gives roughly 125 MB/s — before protocol overhead, ' +
           'which takes another few percent. This is not a swindle, it is a genuine convention ' +
           'difference: networks have always counted bits because they transmit serially. It is also ' +
           'why a download that “should” take one second takes eight.',
      },
      {
        h: 'A sense of scale',
        p: 'A page of plain text is a few kilobytes. A high-quality photograph is 3–6 MB, a RAW file ' +
           '25–50 MB. A minute of 1080p video is roughly 100 MB, of 4K roughly 400 MB. A dual-layer ' +
           'Blu-ray is 50 GB. A petabyte is a thousand terabytes — around 20 million four-drawer ' +
           'filing cabinets of text, or every photograph a large phone manufacturer\'s cloud takes in ' +
           'a few hours.',
      },
    ],
    steps: [
      'Enter the size or speed you have.',
      'Select its unit — note whether you need the decimal (KB) or binary (KiB) family.',
      'Read every other unit at once.',
    ],
    notes: [
      'KB, MB, GB use powers of 1,000 here; KiB, MiB, GiB use powers of 1,024.',
      'Lowercase b is bits, uppercase B is bytes — the difference is a factor of eight.',
      'Network speeds (Kbps, Mbps, Gbps) are bits per second, so divide by eight for bytes per ' +
       'second.',
    ],
    faq: [
      ['Why does my 1 TB hard drive show as 931 GB?',
       'Because the manufacturer counted 1,000,000,000,000 bytes and Windows divides by 1,024 ' +
       'three times while still labelling the result GB. Nothing is lost — the same drive ' +
       'reports as 1 TB on macOS, which uses the decimal definition. In IEC terms it is 931 GiB.'],
      ['How fast is 100 Mbps in megabytes per second?',
       'About 12.5 MB/s at the theoretical maximum, since there are eight bits in a byte. Real ' +
       'throughput is a little lower once TCP and other protocol overhead is accounted for — ' +
       'expect roughly 11–12 MB/s.'],
      ['What is the difference between MB and MiB?',
       'A megabyte (MB) is 1,000,000 bytes; a mebibyte (MiB) is 1,048,576 — about 4.9% more. MiB ' +
       'is the unambiguous binary unit; MB is often used loosely for either, which is exactly ' +
       'the confusion the IEC prefixes were created to fix.'],
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
