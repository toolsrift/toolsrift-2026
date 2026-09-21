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

  // ── CSV ───────────────────────────────────────────────────────────────────────
  'csv-to-json': {
    intro:
      'Converts CSV into a JSON array of objects, using the header row for keys, with a choice ' +
      'of delimiter. It parses properly — quoted fields may contain commas and line breaks — ' +
      'and it is deliberately cautious about turning text into numbers.',
    sections: [
      {
        h: 'Quoted fields, commas and line breaks',
        p: 'CSV allows a field to contain the delimiter, a quotation mark or a newline, provided the ' +
           'field is wrapped in double quotes and internal quotes are doubled. That means a correct ' +
           'parser cannot simply split the file on newlines first: a record containing a multi-line ' +
           'address would be torn in half. This one scans the whole document character by character, ' +
           'tracking whether it is inside a quoted field, so “12 Main St, Apt 4” stays one value and ' +
           'a note spanning two lines stays one record.',
      },
      {
        h: 'Why it does not convert everything that looks numeric',
        p: 'The obvious approach — run each field through parseFloat and keep the result if it is ' +
           'not NaN — silently destroys data, because parseFloat reads a leading prefix and stops. ' +
           '“12 Main Street” becomes 12; a version string “1.2.3” becomes 1.2. This converter only ' +
           'converts when the entire field is a valid number. It also leaves leading-zero values ' +
           'alone, so a postcode of 01234 stays a string instead of becoming 1234, and leaves ' +
           'integers beyond 2⁵³ as strings, because JSON numbers are doubles and a 19-digit id would ' +
           'lose its last digits.',
      },
      {
        h: 'Type inference is per-cell, which surprises people',
        p: 'Each field is judged on its own, so a postcode column can come back with “01234” as a ' +
           'string and 90210 as a number in the same dataset — both correct decisions individually, ' +
           'inconsistent as a column. CSV carries no type information, so no converter can do better ' +
           'without being told the schema. If a column must be uniformly typed, quote every value in ' +
           'the source or post-process the JSON; for ids and codes, treating the whole column as ' +
           'text is nearly always right.',
      },
      {
        h: 'Delimiters, encodings and the Excel export problem',
        p: 'Comma is the default, but exports from European locales commonly use semicolons, because ' +
           'the comma is the decimal separator there — switch the delimiter rather than fighting the ' +
           'file. Tab-separated exports paste cleanly too. If the first key comes back with strange ' +
           'characters in front of it, the file begins with a UTF-8 byte-order mark; strip the first ' +
           'character. And a file saved from Excel as “CSV” on Windows may be Windows-1252 rather ' +
           'than UTF-8, which shows up as mangled accented letters.',
      },
    ],
    steps: [
      'Paste your CSV, including the header row.',
      'Choose the delimiter — comma, semicolon, tab or pipe.',
      'Leave “first row is header” ticked to get objects; untick it for arrays of values.',
      'Copy the JSON output.',
    ],
    notes: [
      'Quoted fields may contain the delimiter, doubled quotes and line breaks.',
      'Empty cells become null rather than empty strings, so a missing value is distinguishable ' +
       'from a blank one.',
      'Conversion runs in your browser, so exported customer data is never uploaded.',
    ],
    faq: [
      ['Why is my postcode or ID being kept as a string?',
       'Deliberately. A value with a leading zero loses information the moment it becomes a ' +
       'number — 01234 would become 1234 — and an integer beyond 2⁵³ cannot be represented ' +
       'exactly in JSON. Keeping them as text is the only lossless choice.'],
      ['Can it handle a field containing a comma?',
       'Yes, as long as that field is quoted, which is what any correct CSV writer does. Line ' +
       'breaks inside quoted fields work too — the parser reads the whole document rather than ' +
       'splitting on newlines.'],
      ['My European CSV imports as one column. Why?',
       'It almost certainly uses semicolons as the delimiter, because the comma is the decimal ' +
       'separator in that locale. Switch the delimiter to semicolon and it will parse correctly.'],
    ],
  },
  'xml-to-json': {
    intro:
      'Converts XML into JSON, turning elements into keys and repeated siblings into arrays. ' +
      'The two formats do not map onto each other cleanly, so the useful part is knowing which ' +
      'compromises any converter has to make.',
    sections: [
      {
        h: 'XML carries things JSON has no slot for',
        p: 'An XML element can have attributes as well as child elements; JSON objects have only ' +
           'keys. XML preserves the order of mixed content and distinguishes an empty element from ' +
           'an absent one; JSON does neither. XML has namespaces, comments, processing instructions ' +
           'and CDATA sections. Every XML-to-JSON converter therefore invents conventions — ' +
           'typically prefixing attributes with @ and putting text content under a key such as #text ' +
           '— and no two converters agree on them. Round-tripping XML through JSON and back is not ' +
           'reliable.',
      },
      {
        h: 'The single-element array problem',
        p: 'This is the one that breaks production code. Repeated child elements become a JSON ' +
           'array, so three <item> elements give you a list. But a document with exactly one <item> ' +
           'gives an object, not an array of one — there is nothing in the XML to say the element ' +
           'repeats. Code written against a multi-item sample then crashes on a single-item ' +
           'response. Either normalise with a schema that declares which elements are collections, ' +
           'or write consuming code that accepts both shapes.',
      },
      {
        h: 'Types are your problem, not XML\'s',
        p: 'Everything in XML is text. <age>28</age> is the string “28” unless a schema says ' +
           'otherwise, so a converter either leaves everything as strings — safe, and annoying — or ' +
           'guesses, which reintroduces the problem of version numbers and leading zeros becoming ' +
           'numbers. When the output feeds code you control, prefer strings and convert explicitly ' +
           'at the point of use.',
      },
    ],
    steps: [
      'Paste your XML.',
      'The JSON equivalent appears alongside it.',
      'Check how repeated elements and attributes were mapped before writing code against the ' +
       'shape.',
    ],
    notes: [
      'Attributes and text content need distinct conventions in JSON; check the output shape ' +
       'rather than assuming.',
      'Comments, processing instructions and namespace declarations do not survive the ' +
       'conversion.',
      'An element that appears once produces an object; the same element repeated produces an ' +
       'array.',
    ],
    faq: [
      ['Can I convert the JSON back to the original XML?',
       'Not faithfully. Attribute conventions, element order, namespaces, comments and the ' +
       'empty-versus-absent distinction are lost or approximated, so the XML you get back will ' +
       'be structurally similar rather than identical. Treat the conversion as one-way.'],
      ['Why did my list become an object?',
       'Because it contained exactly one element. XML cannot express “this is a collection that ' +
       'happens to have one member” without a schema, so converters produce an object. Write ' +
       'consuming code that handles both, or normalise the shape after conversion.'],
      ['What happens to XML attributes?',
       'They are mapped into the object alongside child elements, conventionally with a prefix ' +
       'such as @ to keep them from colliding with element names. Since conventions differ ' +
       'between tools, inspect the output rather than assuming a particular one.'],
    ],
  },

  // ── NUMBERS ───────────────────────────────────────────────────────────────────
  'roman-numeral-converter': {
    intro:
      'Converts numbers to Roman numerals and back, covering 1 to 3999 — the range classical ' +
      'Roman notation can express without the overline system. Useful for clock faces, film ' +
      'copyright dates, chapter numbering, monarchs and tattoos.',
    sections: [
      {
        h: 'The seven symbols and the subtraction rule',
        p: 'I is 1, V is 5, X is 10, L is 50, C is 100, D is 500 and M is 1000. Values are added ' +
           'left to right, except that a smaller symbol before a larger one is subtracted: IV is 4, ' +
           'IX is 9, XL is 40, XC is 90, CD is 400, CM is 900. Only those six subtractive pairs are ' +
           'valid in the standard form — I can precede only V and X, X only L and C, C only D and M. ' +
           'That is why 99 is XCIX rather than IC, which is the single most common mistake.',
      },
      {
        h: 'Why it stops at 3999',
        p: 'M is the largest symbol, and standard notation allows at most three of any symbol in a ' +
           'row, so MMMCMXCIX — 3999 — is the ceiling. Larger numbers used a vinculum, an overline ' +
           'meaning multiply by a thousand, so V with a bar is 5,000. Since the overline cannot be ' +
           'typed reliably, most converters, including this one, stop at 3999. There is no zero: the ' +
           'concept did not exist in the system, which is one reason Roman arithmetic was so ' +
           'unwieldy and why positional notation displaced it.',
      },
      {
        h: 'Where you still meet them',
        p: 'Clock and watch faces, where 4 is traditionally written IIII rather than IV for visual ' +
           'balance with VIII opposite — an exception so widespread it has its own name, the ' +
           'clockmaker\'s four. Film and television copyright dates in end credits. Monarchs and ' +
           'popes. Super Bowl numbering. Book prefaces and outline levels. Chemistry, for oxidation ' +
           'states. And the years on foundation stones, which is how most people end up needing a ' +
           'converter.',
      },
      {
        h: 'Writing a year correctly',
        p: 'Break it into thousands, hundreds, tens and units and write each separately: 2026 is MM ' +
           '+ XX + VI = MMXXVI. 1994 is M + CM + XC + IV = MCMXCIV, which packs three subtractive ' +
           'pairs into one year and is the standard worked example. 1888 is the longest year in the ' +
           'common era at MDCCCLXXXVIII, thirteen characters — worth knowing before committing one ' +
           'to a tattoo.',
      },
    ],
    steps: [
      'Choose a direction: number to Roman, or Roman to number.',
      'Type the value — 1 to 3999 for numbers, or the numeral for the reverse.',
      'Copy the result; the working is shown alongside it.',
    ],
    notes: [
      'Valid range is 1 to 3999; there is no Roman numeral for zero or for negatives.',
      'Only the six standard subtractive pairs are used — IV, IX, XL, XC, CD, CM.',
      'Numerals are conventionally written in uppercase; lowercase appears in book prefaces and ' +
       'outline numbering.',
    ],
    faq: [
      ['How do I write 2026 in Roman numerals?',
       'MMXXVI — MM for 2000, XX for 20 and VI for 6. Build any year the same way, largest place ' +
       'value first.'],
      ['Why is 99 written XCIX and not IC?',
       'Because subtraction is only allowed between adjacent place values: I may precede V and X ' +
       'only, so IC is invalid. 99 is 90 (XC) followed by 9 (IX), giving XCIX.'],
      ['Why do clocks show IIII instead of IV?',
       'Convention rather than error. IIII balances the VIII directly opposite on the dial, ' +
       'makes the numerals easier to read at a glance, and suits how numerals were cast in sets. ' +
       'It has been standard in clockmaking for centuries, and Big Ben is the famous exception ' +
       'that uses IV.'],
    ],
  },

  // ── SECURITY ──────────────────────────────────────────────────────────────────
  'otp-generator': {
    intro:
      'Generates a live TOTP code from a Base32 secret — the same six digits your authenticator ' +
      'app shows — refreshing every thirty seconds. It implements RFC 6238 properly: HMAC-SHA1 ' +
      'over the time counter, truncated to six digits.',
    sections: [
      {
        h: 'How a six-digit code is derived from a shared secret',
        p: 'The server and your device share a secret once, at setup, in that QR code. From then on ' +
           'nothing is transmitted. Both sides take the current Unix time, divide by thirty to get a ' +
           'counter, compute HMAC-SHA1 of that counter with the shared secret, and take a four-byte ' +
           'window from the result using the last nibble as an offset — dynamic truncation. The ' +
           'number modulo one million gives six digits. Because both sides compute independently ' +
           'from the clock, the code works offline, on a plane, with the phone in flight mode.',
      },
      {
        h: 'Why the code is not really a second factor here',
        p: 'TOTP is meant to be something you have, held on a separate device. A code generated on ' +
           'the same machine where you type the password, from a secret stored in the same password ' +
           'manager, is closer to a second copy of the same factor: one compromise takes both. That ' +
           'trade is sometimes worth making, and it is a real improvement over no second factor at ' +
           'all, but it is worth knowing what you have chosen. Use this tool for testing an ' +
           'integration, recovering access, or checking that a secret was transcribed correctly — ' +
           'not as your day-to-day authenticator for anything that matters.',
      },
      {
        h: 'Clock drift is the usual failure',
        p: 'If your device\'s clock is more than about thirty seconds out, every code you generate ' +
           'will be rejected, because both sides derive the counter from the time. Servers normally ' +
           'accept the previous and next window to allow for this, giving roughly ninety seconds of ' +
           'tolerance. When an authenticator suddenly stops working, the clock is the first thing to ' +
           'check — enabling automatic network time usually fixes it outright.',
      },
      {
        h: 'Handling the secret',
        p: 'The secret is Base32 — A to Z and 2 to 7 — because it has to survive being typed by hand ' +
           'when a QR code will not scan. Spaces and lowercase are accepted and normalised. That ' +
           'secret is the whole credential: anyone who has it can generate valid codes forever. ' +
           'Store it where you would store a password, save the recovery codes the service offered ' +
           'at setup, and remember that a secret pasted into any web page should be regarded as ' +
           'worth rotating.',
      },
    ],
    steps: [
      'Paste the Base32 secret from your provider\'s setup screen — the text shown under the QR ' +
       'code.',
      'The current code appears, with a countdown to the next one.',
      'Enter it before the countdown runs out; if it is close, wait for the next.',
    ],
    notes: [
      'Standard parameters: 30-second period, 6 digits, HMAC-SHA1 — what almost every service ' +
       'uses.',
      'The secret is Base32, not Base64: only A–Z and 2–7, with optional = padding.',
      'Computed in your browser with the Web Crypto API; nothing is transmitted.',
    ],
    faq: [
      ['Why is my code being rejected?',
       'Nearly always clock drift — TOTP derives the code from the current time, so a device ' +
       'clock more than half a minute out produces codes for the wrong window. Turn on automatic ' +
       'time sync. Otherwise check the secret was copied completely, and that the service does ' +
       'not use non-standard settings such as eight digits or a sixty-second period.'],
      ['Is this as secure as an authenticator app?',
       'The mathematics is identical, but the security model is not: an app on a separate device ' +
       'keeps the secret away from the machine you log in on. Generating codes in the same ' +
       'browser collapses two factors into one point of compromise. Use this for testing and ' +
       'recovery, and a phone app for accounts that matter.'],
      ['What is the difference between TOTP and HOTP?',
       'TOTP counts time windows, so codes expire every thirty seconds. HOTP counts events, so a ' +
       'code stays valid until used and the two sides can drift out of step if codes are ' +
       'generated without being submitted. TOTP is what almost every service uses today.'],
    ],
  },
  'hash-all': {
    intro:
      'Hashes one piece of text with every common algorithm at once — MD5, SHA-1, SHA-256, ' +
      'SHA-384, SHA-512 — so you can compare a checksum without having to know in advance which ' +
      'one produced it. Digest length is usually the giveaway.',
    sections: [
      {
        h: 'Identifying a hash by its length',
        p: 'Hex digests have a fixed width per algorithm, which is the quickest way to identify an ' +
           'unlabelled checksum. 32 characters is MD5. 40 is SHA-1. 56 is SHA-224, 64 is SHA-256, 96 ' +
           'is SHA-384 and 128 is SHA-512. If it is 60 characters and starts with $2a$ or $2b$ it is ' +
           'bcrypt, which is a password hash with its cost and salt embedded and cannot be ' +
           'reproduced here. Anything ending in = is probably Base64 rather than hex, so decode it ' +
           'first.',
      },
      {
        h: 'Which of these you should actually use',
        p: 'SHA-256 for anything new. SHA-512 where you want a larger margin, and it is often faster ' +
           'on 64-bit hardware. SHA-1 only to verify something legacy — it has practical collisions ' +
           'and browsers and certificate authorities dropped it years ago. MD5 only for ' +
           'non-adversarial checksums: cache keys, deduplication, spotting accidental corruption. ' +
           'For passwords, none of these: they are all far too fast, and you want Argon2id, scrypt ' +
           'or bcrypt.',
      },
      {
        h: 'Comparing two digests properly',
        p: 'Compare the whole string, case-insensitively — hex is conventionally lowercase but some ' +
           'tools print uppercase, and both are the same value. A digest matching on the first eight ' +
           'characters proves nothing. Also check you are hashing the same thing: a published ' +
           'checksum covers a file\'s raw bytes, while this tool hashes the text you paste, and a ' +
           'trailing newline is enough to change every digit of the result.',
      },
    ],
    steps: [
      'Paste the text you want to fingerprint.',
      'All digests compute at once as you type.',
      'Copy the one you need, or match an unknown checksum by its length.',
    ],
    notes: [
      'Input is encoded as UTF-8 before hashing, which is what other tools and libraries ' +
       'default to.',
      'SHA algorithms use the browser\'s Web Crypto implementation; MD5 is computed in ' +
       'JavaScript since Web Crypto deliberately omits it.',
      'Nothing is uploaded — the text stays in the page.',
    ],
    faq: [
      ['How can I tell which algorithm produced a hash?',
       'By length: 32 hex characters is MD5, 40 is SHA-1, 64 is SHA-256, 128 is SHA-512. Hash ' +
       'your known input here and compare against all of them at once — whichever matches ' +
       'identifies the algorithm.'],
      ['Which hash should I use for passwords?',
       'None of these. Every algorithm here is designed to be fast, which is exactly wrong for ' +
       'passwords — a GPU tries billions per second. Use Argon2id, scrypt or bcrypt, which are ' +
       'deliberately slow, salted and memory-hard.'],
      ['Why does my hash not match the one on the download page?',
       'The download\'s checksum covers the file\'s bytes, not text you copied out of it, and a ' +
       'trailing newline alone changes the entire digest. Use a file-checksum tool for files, ' +
       'and verify the checksum came from a source you trust independently of the download ' +
       'itself.'],
    ],
  },

  // ── MATH ──────────────────────────────────────────────────────────────────────
  'gcd-lcm-calc': {
    intro:
      'Finds the greatest common divisor and least common multiple of two or more numbers, with ' +
      'the working shown. The GCD is what reduces a fraction to lowest terms; the LCM is what ' +
      'gives two fractions a common denominator.',
    sections: [
      {
        h: 'How the GCD is actually computed',
        p: 'Not by factorising — that is slow. Euclid\'s algorithm repeatedly replaces the larger ' +
           'number with its remainder when divided by the smaller, until the remainder is zero; the ' +
           'last non-zero value is the GCD. For 48 and 18: 48 mod 18 is 12, 18 mod 12 is 6, 12 mod 6 ' +
           'is 0, so the answer is 6. It takes only a handful of steps even for enormous numbers, ' +
           'which is why it is around 2,300 years old and still the algorithm every computer uses.',
      },
      {
        h: 'The LCM comes free',
        p: 'Once you have the GCD, the LCM is a × b ÷ GCD. For 4 and 6: 24 ÷ 2 = 12. The ' +
           'relationship is exact and holds for any pair, which is why no separate algorithm is ' +
           'needed. For more than two numbers, fold: the LCM of a, b and c is the LCM of (the LCM of ' +
           'a and b) and c. Note that a × b can overflow long before the LCM does, so careful ' +
           'implementations divide before multiplying.',
      },
      {
        h: 'What each one is for',
        p: 'GCD reduces fractions: 18/24 divided through by their GCD of 6 gives 3/4. It also ' +
           'answers tiling and cutting questions — the largest square tile that fills a 48 by 18 ' +
           'room without cutting is 6 units. It is the basis of the RSA key-generation step that ' +
           'checks an exponent is coprime to the totient. LCM finds common denominators, and answers ' +
           'the recurrence question: two buses leaving every 12 and 18 minutes coincide every 36.',
      },
      {
        h: 'Coprime numbers',
        p: 'When the GCD is 1 the numbers are coprime — they share no factor but 1, even if neither ' +
           'is prime. 8 and 15 are coprime. That property matters more than it looks: coprime gear ' +
           'tooth counts spread wear evenly rather than mating the same pair each revolution, ' +
           'coprime hash table strides visit every slot, and coprimality is the condition that makes ' +
           'modular inverses exist, which is what public-key cryptography rests on.',
      },
    ],
    steps: [
      'Enter two or more whole numbers.',
      'Read the GCD and LCM, with the Euclidean steps shown.',
      'Use the GCD to reduce a fraction, or the LCM to find a common denominator.',
    ],
    notes: [
      'The GCD of any number and 0 is that number; the LCM of anything with 0 is 0.',
      'A GCD of 1 means the numbers are coprime.',
      'Negative inputs are treated by magnitude — divisors are conventionally positive.',
    ],
    faq: [
      ['What is the fastest way to find the GCD by hand?',
       'Euclid\'s algorithm. Divide the larger by the smaller, keep the remainder, repeat with ' +
       'the smaller and the remainder until it divides evenly. The last divisor is the GCD. It ' +
       'is far quicker than listing factors, especially for large numbers.'],
      ['How do I use the GCD to simplify a fraction?',
       'Divide numerator and denominator by their GCD. 18/24 have a GCD of 6, so it reduces to ' +
       '3/4 in one step — dividing by anything smaller leaves more work to do.'],
      ['What does it mean if the GCD is 1?',
       'The numbers are coprime: they share no common factor other than 1. Neither needs to be ' +
       'prime — 8 and 15 are coprime. A fraction with coprime numerator and denominator is ' +
       'already in lowest terms.'],
    ],
  },

  // ── ENCODERS ──────────────────────────────────────────────────────────────────
  'base64-image': {
    intro:
      'Converts an image file into a Base64 data URI you can paste directly into HTML or CSS, ' +
      'and back again. The file never leaves your browser — it is read locally and encoded in ' +
      'the page.',
    sections: [
      {
        h: 'What a data URI is',
        p: 'A data URI carries the file\'s bytes inline instead of pointing at a location: ' +
           'data:image/png;base64, followed by the encoded content. Put it in an img src or a CSS ' +
           'background-image and the browser decodes it directly, with no network request. That is ' +
           'the entire appeal — one fewer round trip, and an asset that cannot 404 because it ' +
           'travels with the markup.',
      },
      {
        h: 'It makes the file about a third bigger',
        p: 'Base64 represents three bytes as four characters, so encoded output is roughly 133% of ' +
           'the original, plus a little for the header. A 40 KB logo becomes about 54 KB of text. ' +
           'That cost is worth paying for something small that would otherwise need its own request ' +
           '— an icon, a tiny placeholder, a signature in an email template. It is not worth paying ' +
           'for a photograph, where you have added a third to the payload and lost the browser ' +
           'cache, since an inlined image is re-sent with every copy of the page that contains it.',
      },
      {
        h: 'Where inlining genuinely helps',
        p: 'Email templates, where external images are blocked by default in most clients and ' +
           'inlining sidesteps it — though some clients block data URIs too, so test. Single-file ' +
           'HTML documents meant to be emailed or archived. Small icons in a CSS file. Low-quality ' +
           'image placeholders that show while the real photograph loads. Anything that must work ' +
           'offline with no asset pipeline. For ordinary web images, a normal file with proper ' +
           'caching beats inlining almost every time.',
      },
      {
        h: 'SVG is the exception worth noting',
        p: 'An SVG is text, so it does not need Base64 at all — you can inline it as a URL-encoded ' +
           'data URI, or better, drop the markup straight into the page, which keeps it smaller and ' +
           'lets CSS style it. Base64-encoding an SVG makes it a third larger for no benefit. ' +
           'Reserve this tool for raster formats: PNG, JPEG, GIF, WebP.',
      },
    ],
    steps: [
      'Choose an image file, or drop one onto the page.',
      'Copy the data URI, or just the Base64 portion if you need it without the prefix.',
      'Paste it into an img src, a CSS background-image, or your email template.',
    ],
    notes: [
      'Encoded output is about 33% larger than the original file.',
      'Keep the data:image/...;base64, prefix — without it the browser will not know how to ' +
       'decode the content.',
      'The file is read locally with the FileReader API; nothing is uploaded.',
    ],
    faq: [
      ['Is there a size limit for Base64 images?',
       'No hard limit, but practicality bites early. Anything above roughly 10 KB is usually ' +
       'better as a normal file, because inlined data cannot be cached separately and is ' +
       're-downloaded with every page that embeds it. Very long data URIs also make HTML and CSS ' +
       'painful to read and diff.'],
      ['Do Base64 images work in email?',
       'Sometimes. Inlining avoids the image-blocking that hits externally hosted images, but ' +
       'several clients — Outlook in particular — handle data URIs poorly or not at all. The ' +
       'reliable approach for email is a CID attachment; test in your target clients before ' +
       'committing.'],
      ['Does encoding reduce image quality?',
       'No. Base64 is a lossless re-encoding of the exact bytes, so the decoded image is ' +
       'identical to the original. It only changes the size of the representation, upward by ' +
       'about a third.'],
    ],
  },

  // ── EVERYDAY ──────────────────────────────────────────────────────────────────
  'dice-roller': {
    intro:
      'Rolls virtual dice — any number of them, any number of sides — and shows each result and ' +
      'the total. For board games with lost dice, for tabletop roleplaying, and for any ' +
      'decision that deserves more than a coin flip.',
    sections: [
      {
        h: 'A fair die, which a real one is not quite',
        p: 'The results come from the browser\'s cryptographic random source, so every face is ' +
           'equally likely and no roll is influenced by the last. Physical dice are not quite fair: ' +
           'the pips are drilled out, so the 6 face is marginally lighter than the 1, which biases a ' +
           'cheap die very slightly toward 6. Casino dice compensate by filling the pips with ' +
           'material of the same density, which is why they are transparent and sharp-edged. A ' +
           'virtual die has none of this to correct for.',
      },
      {
        h: 'Rolling several dice does not give a flat distribution',
        p: 'One d6 is uniform — every number 1 to 6 equally likely. Two d6 are not: seven comes up ' +
           'on six of the thirty-six combinations and twelve on only one, so seven is six times more ' +
           'likely. That triangular distribution is the whole design of backgammon, craps and ' +
           'Monopoly. Three or more dice cluster even harder around the middle, which is why 3d6 for ' +
           'a roleplaying statistic produces mostly average characters and the occasional memorable ' +
           'extreme.',
      },
      {
        h: 'Dice notation',
        p: 'The standard shorthand is NdS: 2d6 is two six-sided dice, 1d20 is one twenty-sided. A ' +
           'modifier follows, so 1d8+3 means roll a d8 and add three. Tabletop games use a standard ' +
           'set — d4, d6, d8, d10, d12 and d20, the five Platonic solids plus the d10 — and d100 is ' +
           'usually two d10 read as tens and units. Advantage, in modern roleplaying rules, means ' +
           'rolling two d20 and taking the higher, which shifts the average from 10.5 to about 13.8.',
      },
    ],
    steps: [
      'Choose how many dice and how many sides.',
      'Roll, and read the individual results and the total.',
      'Roll again as often as you need — each roll is independent.',
    ],
    notes: [
      'Each die is rolled independently from the browser\'s cryptographic random source.',
      'Non-standard side counts work too, for games using a d3 or a d30.',
      'Works offline once the page has loaded.',
    ],
    faq: [
      ['Are these dice actually random?',
       'Yes. Each result is drawn from the browser\'s cryptographic random number generator ' +
       'rather than a seeded pseudo-random one, so the sequence is not reproducible or ' +
       'predictable, and every face is equally likely on every roll.'],
      ['Why does 7 come up so often with two dice?',
       'Because more combinations produce it: 1+6, 2+5, 3+4 and their reverses give six ways out ' +
       'of thirty-six, while twelve has only one. Seven is the most likely total with two ' +
       'six-sided dice, at one in six.'],
      ['What does 2d6 mean?',
       'Two six-sided dice, rolled and added. The notation is NdS — number of dice, then sides — ' +
       'with any modifier after it, so 1d20+5 is one twenty-sided die plus five.'],
    ],
  },
  'random-name-picker': {
    intro:
      'Picks a name at random from a list you paste in — one per line — with a short spin ' +
      'before the result. For classroom cold-calling, raffle draws, standup order, assigning a ' +
      'chore, or any moment when the selection needs to be visibly not your choice.',
    sections: [
      {
        h: 'The point is that everyone can see it was not you',
        p: 'Most uses of a name picker are not really about randomness; they are about legitimacy. ' +
           'Choosing who presents first, who takes the unpopular task, who wins the prize — a ' +
           'visible draw removes the suspicion of favouritism in a way that a private decision ' +
           'cannot. That is also why the brief spin matters: a result appearing instantly feels ' +
           'asserted, while one that visibly settles feels drawn.',
      },
      {
        h: 'Random means names can repeat across draws',
        p: 'Each draw is independent, so the same name can come up twice in a row, and over a term ' +
           'some students will be picked noticeably more than others. That is genuine randomness, ' +
           'not a fault — but it is frequently not what a teacher wants. If everyone should get a ' +
           'turn before anyone repeats, remove each name as it is drawn, which turns random ' +
           'selection into a shuffle. That is a different and usually better tool for a classroom.',
      },
      {
        h: 'Running a draw people will accept',
        p: 'Show the full list before drawing, so nobody can claim a name was missing. Draw once and ' +
           'accept the result — re-rolling until you like the answer is the failure mode this is ' +
           'supposed to prevent, and people notice. For anything with real stakes, have someone else ' +
           'press the button, or record the screen. For a prize draw of any size or legal weight, ' +
           'use a documented process with a verifiable seed; a web page is the right tool for a ' +
           'classroom, not for a regulated promotion.',
      },
    ],
    steps: [
      'Paste your names, one per line.',
      'Press the button and wait for the spin to settle.',
      'Remove the drawn name before the next draw if everyone should get a turn.',
    ],
    notes: [
      'Selection uses the browser\'s cryptographic random source, so it is not a predictable ' +
       'sequence.',
      'Blank lines are ignored; duplicate names get proportionally more chances, which is one ' +
       'way to weight a draw.',
      'The list stays in your browser and is not saved — keep a copy elsewhere if you need it ' +
       'again.',
    ],
    faq: [
      ['Can it avoid picking the same name twice?',
       'Not automatically — each draw is independent. Delete a name from the list once it has ' +
       'been drawn and the remaining draws cover everyone. Without that, repeats are expected ' +
       'and perfectly normal.'],
      ['Is the selection genuinely fair?',
       'Yes. Every line has an equal chance on every draw, using the browser\'s cryptographic ' +
       'random generator. Note that a name appearing twice in the list gets two chances, which ' +
       'can be useful deliberately and is a mistake accidentally.'],
      ['Can I use this for a prize draw?',
       'For an informal one, yes — show the list first and accept the first result. For a ' +
       'promotion with legal requirements, no: those usually need a documented, auditable ' +
       'process, and a web page cannot prove afterwards what it did.'],
    ],
  },

  // ── CSS ───────────────────────────────────────────────────────────────────────
  'css-gradient': {
    intro:
      'Builds linear and radial CSS gradients with live controls for angle, colour stops and ' +
      'stop positions, and gives you the declaration to paste. Gradients are one of the few CSS ' +
      'properties where a small change in the numbers is the difference between looking ' +
      'designed and looking cheap.',
    sections: [
      {
        h: 'Angles in CSS gradients are not maths angles',
        p: '0deg points up and the angle increases clockwise, so 90deg runs left to right and 180deg ' +
           'runs top to bottom. That is not the convention you learned in trigonometry, where zero ' +
           'points right and angles increase anticlockwise, and it is why a gradient so often comes ' +
           'out rotated ninety degrees from what was intended. You can also write directions in ' +
           'words — to right, to bottom left — which is clearer and, for corner directions on a ' +
           'non-square element, not the same as the equivalent angle: the corner keyword adjusts so ' +
           'the gradient line actually meets the corner.',
      },
      {
        h: 'The grey dead zone, and how to avoid it',
        p: 'Browsers interpolate between colour stops in sRGB, which takes an unfortunate route ' +
           'between complementary colours: blue to yellow passes through a muddy grey, and so does ' +
           'most blue-to-orange. The classic fix is to add a midpoint stop in a colour you choose ' +
           'rather than the one the maths picks — a saturated purple or teal between them. Modern ' +
           'CSS also lets you name the interpolation space, so linear-gradient(in oklab, blue, ' +
           'yellow) stays vivid across the transition. Where browser support matters, the extra stop ' +
           'is still the safe answer.',
      },
      {
        h: 'Stop positions do the real work',
        p: 'Two evenly spaced stops give the flat, obviously-a-gradient look. Moving them changes ' +
           'everything: putting both stops close together produces a sharp band, and putting them at ' +
           'the same position produces a hard edge with no blend at all — which is how you make ' +
           'stripes with a single gradient. For backgrounds that read as light rather than as a ' +
           'colour wash, keep the two colours close in hue and vary the lightness instead, and bias ' +
           'the stops so most of the element is one colour with the transition in the last third.',
      },
      {
        h: 'Performance and where gradients belong',
        p: 'A gradient is painted once and costs nothing afterwards, so a gradient background is ' +
           'cheaper than an image and always crisp at any resolution. Animating one is a different ' +
           'matter: gradients cannot be interpolated by the compositor, so animating colour stops ' +
           'repaints every frame. To animate a gradient, animate background-position on an oversized ' +
           'gradient, or cross-fade two stacked layers with opacity — both stay on the GPU.',
      },
    ],
    steps: [
      'Choose linear or radial.',
      'Set the angle or direction — remember 0deg is up, not right.',
      'Add and drag colour stops; move them off the even spacing to shape the blend.',
      'Copy the generated CSS into your stylesheet.',
    ],
    notes: [
      'Two stops at the same position create a hard edge — the basis for stripes and colour ' +
       'bands.',
      'Gradients are images in CSS terms, so they go in background-image and can be layered ' +
       'with commas.',
      'For text, apply the gradient to the background and clip it with background-clip: text ' +
       'and a transparent text colour.',
    ],
    faq: [
      ['Why does my gradient go the wrong direction?',
       'Because CSS gradient angles start at 0deg pointing up and increase clockwise, which is ' +
       'different from standard mathematical convention. 90deg is left to right, 180deg is top ' +
       'to bottom. Using the keywords — to right, to bottom — avoids the confusion entirely.'],
      ['How do I stop my gradient looking grey in the middle?',
       'Add a colour stop in the middle in a colour you pick, rather than letting the browser ' +
       'interpolate through sRGB, which passes through grey between complementary colours. Or ' +
       'specify a better interpolation space with linear-gradient(in oklab, ...) where you can ' +
       'rely on support.'],
      ['Can I use a gradient on text?',
       'Yes. Set the gradient as background-image on the element, then add background-clip: text ' +
       'and color: transparent. Keep a solid colour as a fallback, and be careful with contrast ' +
       '— gradient text is harder to read and a contrast check has to pass at the lightest ' +
       'point.'],
    ],
  },
  'css-border-radius': {
    intro:
      'Builds border-radius values with independent control of each corner and a live preview, ' +
      'including the two-value elliptical syntax that produces organic blob shapes rather than ' +
      'plain rounded rectangles.',
    sections: [
      {
        h: 'One property, up to eight numbers',
        p: 'border-radius: 8px rounds all four corners. Give it four values and they apply clockwise ' +
           'from the top left. Add a slash and four more — border-radius: 30% 70% 70% 30% / 30% 30% ' +
           '70% 70% — and the numbers before the slash are the horizontal radii while those after ' +
           'are the vertical ones, making each corner an ellipse rather than a circle. That second ' +
           'form is how every organic blob shape you have seen in a hero section is made, and it is ' +
           'a single property rather than an SVG.',
      },
      {
        h: 'Percentages versus pixels',
        p: 'A pixel radius is fixed, so the same value looks proportionally larger on a small ' +
           'element than a large one. A percentage is relative to the element\'s own dimensions, so ' +
           '50% on all corners turns a square into a circle and a rectangle into a pill — and stays ' +
           'correct at every size. Use pixels for cards and buttons where you want a consistent ' +
           'corner across different-sized elements, and percentages for shapes that should scale ' +
           'with the box. 9999px is the common trick for a pill button, since the browser caps the ' +
           'radius at half the shorter side.',
      },
      {
        h: 'Nested corners need different radii',
        p: 'A rounded element inside another rounded element looks wrong when both use the same ' +
           'value: the inner corner appears too square against the outer curve. The rule designers ' +
           'use is that the inner radius should be the outer radius minus the padding between them. ' +
           'A card with a 16px radius and 8px of padding wants 8px on the inner element. Getting ' +
           'this right is a large part of why some interfaces look carefully made and others do not.',
      },
    ],
    steps: [
      'Set a single radius for all corners, or unlock the corners to set each one.',
      'Switch on the elliptical (two-value) mode for blob shapes.',
      'Watch the preview, then copy the generated CSS.',
    ],
    notes: [
      'Four values run clockwise from the top left: top-left, top-right, bottom-right, ' +
       'bottom-left.',
      'The browser caps a radius at half the shorter side, so any very large value gives a pill ' +
       'or a circle.',
      'border-radius clips backgrounds and borders, and box-shadow follows it automatically — ' +
       'but child content needs overflow: hidden to be clipped too.',
    ],
    faq: [
      ['How do I make a perfect circle?',
       'border-radius: 50% on an element with equal width and height. On a rectangle the same ' +
       'value gives an ellipse; for a pill shape use 9999px, which the browser caps at half the ' +
       'shorter side.'],
      ['What does the slash in border-radius mean?',
       'It separates horizontal from vertical radii. The values before the slash set how far ' +
       'each corner\'s curve extends horizontally, and those after set the vertical extent, ' +
       'making each corner elliptical. It is what produces asymmetric, organic shapes.'],
      ['Why is my image not following the rounded corners?',
       'A child element is not clipped by its parent\'s radius unless you ask. Add overflow: ' +
       'hidden to the rounded parent, or apply the same border-radius to the image itself.'],
    ],
  },

  // ── UNITS ─────────────────────────────────────────────────────────────────────
  'volume-converter': {
    intro:
      'Converts between litres and millilitres, cubic metres, US and UK gallons, quarts, pints, ' +
      'cups, fluid ounces, tablespoons, teaspoons and cubic feet and inches. Mostly it exists ' +
      'because American and British recipes use the same words for different quantities.',
    sections: [
      {
        h: 'A US gallon and a UK gallon are not the same',
        p: 'A US gallon is 3.785 litres; an imperial gallon is 4.546 litres, about 20% more. Every ' +
           'unit below them inherits the difference: a US pint is 473 ml while a UK pint is 568 ml, ' +
           'which is why a pint of beer in London is noticeably larger than one in New York. A US ' +
           'fluid ounce is 29.57 ml and a UK one is 28.41 ml — the only pair where the US measure is ' +
           'the larger, because the two systems divide their gallons differently (128 US fl oz ' +
           'against 160 imperial).',
      },
      {
        h: 'Cups are the real problem in recipes',
        p: 'A US cup is 236.6 ml, but a US legal cup on nutrition labels is 240 ml, a metric cup in ' +
           'Australia and New Zealand is 250 ml, and a Japanese cup is 200 ml. A recipe that says ' +
           '“one cup” without a nationality is ambiguous by up to 6%. Worse, a cup measures volume ' +
           'while baking depends on mass: a cup of flour is anywhere from 120 to 150 grams depending ' +
           'on whether it was scooped or spooned and levelled. For baking, weigh — it is the single ' +
           'change that most improves consistency.',
      },
      {
        h: 'Fluid ounces are volume, ounces are mass',
        p: 'They are different quantities that share a name, and they only coincide for water, ' +
           'roughly. A fluid ounce of honey weighs about 1.5 ounces; a fluid ounce of oil weighs ' +
           'about 0.9. Any recipe mixing “oz” and “fl oz” needs you to know which is meant, and a ' +
           'converter cannot tell you — converting between them requires the density of the specific ' +
           'ingredient.',
      },
      {
        h: 'Cubic units, and the ratio-cubed trap',
        p: 'A cubic metre is 1,000 litres and a cubic foot is 28.3 litres. As with area, the ' +
           'conversion factor is the length ratio cubed, so a metre being 3.28 feet makes a cubic ' +
           'metre 35.3 cubic feet, not 3.28. This is where shipping volumes, aquarium capacities and ' +
           'concrete orders go wrong by a factor of thirty.',
      },
    ],
    steps: [
      'Enter the volume you have.',
      'Select its unit — check whether you need US or UK where both exist.',
      'Read every other unit at once.',
    ],
    notes: [
      'US and UK gallons, quarts, pints and fluid ounces are all different sizes.',
      'Teaspoons and tablespoons here are US measures: 4.93 ml and 14.79 ml.',
      'For baking, convert to grams with an ingredient-specific density rather than by volume.',
    ],
    faq: [
      ['How many millilitres are in a cup?',
       '236.6 ml for a US customary cup, 240 ml for the US legal cup used on nutrition labels, ' +
       '250 ml for a metric cup in Australia and New Zealand, and 200 ml in Japan. If a recipe ' +
       'does not say, the author\'s country is your best clue.'],
      ['Why is a UK pint bigger than a US pint?',
       'Because the gallons they come from differ. An imperial gallon is 4.546 litres and a US ' +
       'gallon 3.785, and both divide into eight pints — giving 568 ml against 473 ml, a ' +
       'difference of nearly 20%.'],
      ['Is a fluid ounce the same as an ounce?',
       'No. A fluid ounce measures volume and an ounce measures mass. They roughly coincide for ' +
       'water and diverge for everything else — a fluid ounce of honey weighs about half as much ' +
       'again as one of water.'],
    ],
  },

  // ── TEXT ──────────────────────────────────────────────────────────────────────
  'reading-time': {
    intro:
      'Estimates how long a piece of text takes to read silently and to deliver aloud, with ' +
      'adjustable words-per-minute for both, plus an approximate page count. Useful for article ' +
      'badges, talk timing and coursework limits.',
    sections: [
      {
        h: 'Where the numbers come from',
        p: 'Silent reading of ordinary prose runs around 200–250 words per minute for an adult, ' +
           'which is why 225 is the usual default and why most “5 min read” badges assume something ' +
           'in that band. Speaking is much slower: 130–150 words per minute is a comfortable ' +
           'presentation pace, audiobooks are narrated around 150, and auctioneers and sports ' +
           'commentators reach 250 or more. If your estimate consistently misses, adjust the rate ' +
           'rather than the text — technical material with code and formulae reads far slower than ' +
           'narrative.',
      },
      {
        h: 'Why a reading-time badge is worth having',
        p: 'Medium popularised it, and the reason it works is expectation-setting: a reader deciding ' +
           'whether to start an article is weighing an unknown cost, and naming it reduces the ' +
           'bounce. Studies of publisher data have found modest but real improvements in completion ' +
           'rate. Keep it honest — an under-stated estimate on a long piece is worse than none, ' +
           'because the reader who committed to four minutes and is still going at twelve leaves ' +
           'annoyed.',
      },
      {
        h: 'Speaking time is not reading time',
        p: 'A fifteen-minute conference talk is roughly 1,950 words at 130 wpm — and that is before ' +
           'pauses, audience laughter, a demo going wrong, or the questions you take during rather ' +
           'than after. Most speakers write too much. A reliable rule is to draft for about 80% of ' +
           'your slot and rehearse aloud with a timer: silent reading of your own script will ' +
           'underestimate the delivery by a third or more.',
      },
      {
        h: 'The page count is a rough guide',
        p: 'A “page” here is about 275 words, which approximates double-spaced 12-point Times New ' +
           'Roman with one-inch margins — the academic standard in much of the English-speaking ' +
           'world. Single-spaced is roughly 500 words to the page. If a submission specifies pages ' +
           'rather than words, check the required font, spacing and margins, since those three ' +
           'choices can change the page count by a factor of two for identical text.',
      },
    ],
    steps: [
      'Paste your text.',
      'Adjust the reading and speaking rates if your audience or material is unusual.',
      'Read the two estimates and the approximate page count.',
    ],
    notes: [
      'Words are counted as whitespace-separated runs, the same convention word processors use.',
      'Technical writing, poetry and anything with code or equations reads considerably slower ' +
       'than the default rate assumes.',
      'Text stays in your browser — safe for unpublished drafts.',
    ],
    faq: [
      ['What is the average reading speed?',
       'Around 200–250 words per minute for an adult reading ordinary prose, which is why 225 is ' +
       'a common default. Comprehension falls off above roughly 400 wpm, and claims of thousands ' +
       'of words per minute from speed-reading courses have not survived testing.'],
      ['How many words is a 10-minute presentation?',
       'About 1,300 at a comfortable 130 wpm, and less once you allow for pauses, transitions ' +
       'and interruptions. Aim for around 1,100 words of script for a ten-minute slot and ' +
       'rehearse with a timer — nearly everyone writes too much.'],
      ['How many pages is 1,000 words?',
       'About four pages double-spaced or two single-spaced, in 12-point Times New Roman with ' +
       'one-inch margins. Change the font, spacing or margins and that answer changes ' +
       'substantially, which is why word counts are the more reliable specification.'],
    ],
  },

  // ── SECURITY ──────────────────────────────────────────────────────────────────
  'passphrase-gen': {
    intro:
      'Generates a passphrase from randomly chosen words — the diceware approach — with a ' +
      'configurable word count and separator. The result is long, strong, and unlike a random ' +
      'string of symbols, something you can actually memorise and type.',
    sections: [
      {
        h: 'Where the strength comes from',
        p: 'Each word contributes the entropy of the list it was drawn from, not the entropy of its ' +
           'letters. Drawing from a 7,776-word list — the classic diceware size, being 6⁵ — gives ' +
           'about 12.9 bits per word, so six words is around 77 bits and seven is 90. The critical ' +
           'condition is that the words are chosen at random by a machine. A phrase you invented ' +
           'yourself carries a fraction of that, because human word choice is enormously ' +
           'predictable: attackers run dictionaries of song lyrics, film quotes and common phrases ' +
           'precisely because people pick them.',
      },
      {
        h: 'Why length beats symbol soup',
        p: '“P@ssw0rd!23” is eleven characters of misery to type and perhaps 30 bits of real ' +
           'entropy, because the substitution rules are in every cracking dictionary. “correct horse ' +
           'battery staple” is four random words, far easier to remember, and stronger. That ' +
           'comparison is the point of the famous xkcd strip, and it holds up: the way these fail in ' +
           'practice is not brute force but reuse and phishing, and a passphrase you can remember is ' +
           'one you will not write on a sticky note.',
      },
      {
        h: 'Where passphrases are the right tool',
        p: 'The handful of secrets you must type from memory rather than paste from a manager: the ' +
           'master password for the manager itself, your device login and disk encryption, an SSH ' +
           'key passphrase, a recovery phrase. For ordinary site logins, a long random string in a ' +
           'password manager is better — you never type it, so memorability buys you nothing and the ' +
           'character variety buys you a little. Use each where it fits.',
      },
      {
        h: 'Practical notes on choosing',
        p: 'Six words is a sensible floor and seven or eight is better for a master password. Keep ' +
           'the separator simple; some systems reject spaces, in which case hyphens are fine and ' +
           'cost nothing in strength. Do not “improve” the generated phrase by rearranging the words ' +
           'into something that makes sense — that is exactly the human predictability the method ' +
           'exists to avoid. If a word is one you cannot spell, generate again rather than editing.',
      },
    ],
    steps: [
      'Choose how many words — six or more for anything that matters.',
      'Pick a separator that the target system will accept.',
      'Generate, and regenerate until you get a phrase you find easy to picture.',
      'Store it in a password manager, or commit it to memory if it is the master.',
    ],
    notes: [
      'Words are selected with crypto.getRandomValues, not Math.random.',
      'Regenerating to get a more memorable phrase is safe — you are still taking a random ' +
       'draw, not choosing words yourself.',
      'Nothing is transmitted or stored; the phrase exists only in this tab.',
    ],
    faq: [
      ['How many words should a passphrase have?',
       'Six as a minimum for anything valuable, seven or eight for a password-manager master or ' +
       'disk encryption. Six random words from a large list is roughly 77 bits of entropy, which ' +
       'is beyond offline brute force; four words is memorable but light for a high-value ' +
       'secret.'],
      ['Is a passphrase really stronger than a complex password?',
       'For the same memorisation effort, yes, comfortably. Length contributes more entropy than ' +
       'character variety, and the substitution patterns people use to make short passwords ' +
       '“complex” are in every cracking dictionary. The condition is that the words are ' +
       'machine-chosen at random.'],
      ['Can I change the words to make it easier to remember?',
       'Rearranging the order is harmless. Swapping a word for one you prefer is not — your ' +
       'choice is predictable in a way the random draw is not, and enough such edits collapse ' +
       'the strength. Generate again instead; it costs nothing.'],
    ],
  },

  // ── UNITS ─────────────────────────────────────────────────────────────────────
  'paper-size-converter': {
    intro:
      'Lists every ISO A and B paper size and the North American sizes side by side, in ' +
      'millimetres, centimetres and inches. Mostly it answers one question: what A4 is in ' +
      'inches, and why a document laid out for it does not print properly on Letter.',
    sections: [
      {
        h: 'Why the A series halves so neatly',
        p: 'Every A size has the same aspect ratio, 1:√2, which is the only ratio that keeps its ' +
           'proportions when you fold it in half. So A4 is exactly half of A3, which is half of A2, ' +
           'and A0 is defined as the sheet of that ratio with an area of exactly one square metre. ' +
           'That is what makes scaling trivial: printing two A4 pages onto one A3 sheet, or reducing ' +
           'A3 to A4 at 71%, loses no margin and distorts nothing. The B series fills the gaps ' +
           'between A sizes using the same ratio, and is mostly used for posters, books and ' +
           'envelopes.',
      },
      {
        h: 'A4 and Letter are close enough to cause trouble',
        p: 'A4 is 210 × 297 mm; US Letter is 216 × 279 mm. Letter is 6 mm wider and 18 mm shorter — ' +
           'near enough that a document looks fine on screen and wrong on paper. Printing A4 content ' +
           'on Letter clips the bottom or shrinks the page; printing Letter on A4 leaves an odd band ' +
           'at the foot. If a document crosses the Atlantic, either set generous margins that ' +
           'survive both or export a PDF with the target size chosen deliberately. North America, ' +
           'and parts of Central and South America and the Philippines, use Letter; almost ' +
           'everywhere else uses A4.',
      },
      {
        h: 'Sizes worth memorising',
        p: 'A4 is 210 × 297 mm, or 8.27 × 11.69 inches — a page of writing. A3 is double it, for ' +
           'posters and spreads. A5 is half, for notebooks and flyers. A6 is a postcard. A0 is the ' +
           'square-metre poster used for academic conferences. US Letter is 8.5 × 11 inches, Legal ' +
           'is 8.5 × 14, and Tabloid is 11 × 17, the Letter equivalent of A3.',
      },
      {
        h: 'Millimetres, inches and the resolution question',
        p: 'Paper sizes are defined in millimetres and the inch figures are conversions, which is ' +
           'why A4 in inches is an awkward 8.27 × 11.69 rather than a round number. For print work ' +
           'you also need a resolution: A4 at 300 dpi, the standard for commercial printing, is ' +
           '2,480 × 3,508 pixels; at 150 dpi for office printing it is half that. Designing to pixel ' +
           'dimensions without fixing the dpi is how artwork ends up the wrong physical size.',
      },
    ],
    steps: [
      'Pick a size from the list.',
      'Read its dimensions in millimetres, centimetres and inches.',
      'Compare against the other sizes in the table to find the nearest equivalent.',
    ],
    notes: [
      'ISO sizes are defined in millimetres; inch values are rounded conversions.',
      'Every A and B size shares the 1:√2 ratio, so folding one in half gives the next size ' +
       'down.',
      'A4 at 300 dpi is 2480 × 3508 pixels; at 150 dpi it is 1240 × 1754.',
    ],
    faq: [
      ['What is A4 in inches?',
       '8.27 × 11.69 inches, from 210 × 297 mm. The odd numbers are because the A series is ' +
       'defined metrically — A0 has an area of exactly one square metre — rather than converted ' +
       'from imperial measures.'],
      ['What is the difference between A4 and Letter?',
       'Letter (216 × 279 mm) is about 6 mm wider and 18 mm shorter than A4 (210 × 297 mm). The ' +
       'difference is small enough to look fine on screen and cause clipped or shifted content ' +
       'when printed on the other size.'],
      ['Why is A3 exactly twice A4?',
       'Because the A series uses a 1:√2 aspect ratio, the only ratio preserved when a sheet is ' +
       'halved along its longer side. That is what allows any A size to scale to any other ' +
       'without changing proportions or leaving unused margin.'],
    ],
  },

  // ── PDF ───────────────────────────────────────────────────────────────────────
  'pdf-watermark': {
    intro:
      'Stamps text across every page of a PDF — DRAFT, CONFIDENTIAL, a name, a date — with ' +
      'control over size, angle and opacity. The file is processed in your browser and never ' +
      'uploaded, which matters given what usually needs watermarking.',
    sections: [
      {
        h: 'What a watermark does and does not do',
        p: 'A watermark marks provenance and intent. It tells a reader this is a draft, or that the ' +
           'copy was issued to a particular person, and it makes casual reuse of a screenshot ' +
           'obviously improper. What it does not do is protect the document: the text is a layer on ' +
           'top of the page, and anyone with a PDF editor can remove it in a minute. Treat it as a ' +
           'label, not a lock. If a document must not be redistributed, control who receives it ' +
           'rather than relying on a stamp.',
      },
      {
        h: 'Making it readable without ruining the document',
        p: 'The usual failure is opacity. Too dark and the text underneath is hard to read and the ' +
           'printed copy is a mess; too light and it may as well not be there. Somewhere between 10% ' +
           'and 25% grey is the practical band for a large diagonal stamp. A 45-degree angle across ' +
           'the page is conventional because it crosses the text block without following any line of ' +
           'it, and it survives being cropped. Keep the wording short — a single word at large size ' +
           'reads at a glance where a sentence becomes noise.',
      },
      {
        h: 'Per-recipient watermarking',
        p: 'The genuinely useful version is putting the recipient\'s name and the date on each copy, ' +
           'so that a leaked document identifies its source. Law firms, investors\' data rooms and ' +
           'pre-release review copies all work this way, and the deterrent is social rather than ' +
           'technical — people behave differently when their own name is on every page. It only ' +
           'works if each copy is stamped individually before sending, which means doing it at ' +
           'distribution time rather than once at creation.',
      },
      {
        h: 'What browser-side processing means here',
        p: 'The PDF is read, modified and re-saved entirely in this page using the file APIs; no ' +
           'bytes are sent to a server. For the documents people actually watermark — contracts ' +
           'before signature, financial statements, unreleased reports, medical records — that is ' +
           'not a convenience but the whole reason to use a tool like this rather than an ' +
           'upload-based service.',
      },
    ],
    steps: [
      'Choose your PDF.',
      'Type the watermark text — short works best.',
      'Set size, angle and opacity, and check the preview.',
      'Download the watermarked copy; the original is untouched.',
    ],
    notes: [
      'The watermark is added as a layer, so it can be removed by anyone with a PDF editor — it ' +
       'is a label, not protection.',
      'Very large files may be slow, because the whole document is held in browser memory.',
      'Keep the original: the download is a new file, and the watermark cannot be undone from ' +
       'it here.',
    ],
    faq: [
      ['Can a watermark be removed from a PDF?',
       'Yes, by anyone with a PDF editor — it sits as a separate content layer. Watermarks deter ' +
       'casual misuse and establish provenance; they do not secure a document. For real ' +
       'restrictions you need encryption and access control, and even those are limited once ' +
       'someone can read the file.'],
      ['What opacity should a watermark be?',
       'Roughly 10–25% for a large diagonal stamp — visible on every page without fighting the ' +
       'text beneath it. Check a printed page as well as the screen, since printers render light ' +
       'greys differently and a watermark that looks right on a monitor can vanish or blotch on ' +
       'paper.'],
      ['Is my file uploaded anywhere?',
       'No. The PDF is opened and modified inside your browser and the result is written back to ' +
       'your device. Nothing is transmitted, which is why this is a reasonable tool for ' +
       'contracts and confidential reports.'],
    ],
  },

  // ── FANCY ─────────────────────────────────────────────────────────────────────
  'cursive-text': {
    intro:
      'Converts ordinary text into Unicode script characters — the flowing, handwritten-looking ' +
      'letters you see in social media bios. These are real characters, not a font, so they ' +
      'keep their appearance wherever you paste them.',
    sections: [
      {
        h: 'It is not a font, it is different characters',
        p: 'A font changes how a character is drawn; this changes which character you are using. The ' +
           'output uses the Mathematical Script block — 𝒜 through 𝒵 — which Unicode encoded for ' +
           'mathematical notation, where a script capital H means something specific and different ' +
           'from a plain H. Because the distinction lives in the character itself, the styling ' +
           'survives being pasted into Instagram, X, TikTok or a Discord name, none of which let you ' +
           'choose a font.',
      },
      {
        h: 'What that costs you',
        p: 'Search engines, site search and Ctrl+F do not match script characters against ordinary ' +
           'letters, so a name written this way is effectively unsearchable. Screen readers handle ' +
           'them badly: many announce them character by character, or as “mathematical script small ' +
           'a”, which makes a bio incomprehensible to a blind user. Some platforms strip or reject ' +
           'them in usernames, and older Android builds show empty boxes. Use them for decoration on ' +
           'a line or two — never for your actual name, a call to action, or anything someone needs ' +
           'to read or find.',
      },
      {
        h: 'Where it works and where it breaks',
        p: 'Reliable in Instagram bios and captions, X display names and posts, TikTok, Discord, ' +
           'WhatsApp and most modern browsers. Unreliable in email subject lines, where spam filters ' +
           'treat unusual Unicode as a signal; in legal documents and forms with character ' +
           'validation; and in anything that will be printed, since not every font contains the ' +
           'script block and missing glyphs render as boxes.',
      },
    ],
    steps: [
      'Type or paste your text.',
      'The script version appears immediately.',
      'Copy it and paste it wherever you want it — the styling travels with the characters.',
    ],
    notes: [
      'Only A–Z and a–z convert; digits, punctuation and accented letters pass through ' +
       'unchanged.',
      'Not searchable and poorly handled by screen readers — keep your real name in plain text.',
      'Some platforms reject these characters in usernames even where they allow them in bios.',
    ],
    faq: [
      ['Why does my cursive text show as boxes?',
       'The device or app lacks a font containing those Unicode characters, so it draws the ' +
       'missing-glyph box. It is most common on older Android versions and in some desktop ' +
       'applications. Nothing is wrong with the text — it simply cannot be displayed there.'],
      ['Is this safe to use in an Instagram bio?',
       'Yes, bios and captions handle it reliably. Keep it to decorative lines: a bio written ' +
       'entirely in script cannot be found by search and is unreadable to anyone using a screen ' +
       'reader.'],
      ['Can I use cursive text in my username?',
       'Often not. Many platforms restrict usernames to ASCII, and those that allow Unicode may ' +
       'reject these blocks specifically. Display names are usually more permissive than ' +
       'usernames — and a searchable username is worth more than a decorative one.'],
    ],
  },
  'bubble-text': {
    intro:
      'Turns text into circled Unicode characters — ⓑⓤⓑⓑⓛⓔ letters — for social media bios, ' +
      'comments and usernames. Like the other Unicode text styles, these are characters rather ' +
      'than a font, so the effect survives copy and paste.',
    sections: [
      {
        h: 'Two bubble styles, and the gap in the alphabet',
        p: 'Unicode has an Enclosed Alphanumerics block containing Ⓐ–ⓩ and ⓪–⓴, plus a separate set ' +
           'of negative (filled) circled characters. The filled set is the incomplete one: it covers ' +
           'capital letters and digits but not lowercase, so a filled-bubble rendering of mixed-case ' +
           'text falls back to outline forms for the lowercase letters. That inconsistency is not a ' +
           'bug in the converter, it is a gap in the standard — the characters simply do not exist.',
      },
      {
        h: 'Zero is the awkward character',
        p: 'The circled digit set runs ① to ⑨ for 1 to 9, and zero was added later as ⓪ in a ' +
           'different part of the block. Some fonts render it noticeably differently in size or ' +
           'weight from the other digits, which is why a bubble-styled year or phone number often ' +
           'looks slightly wrong. Circled numbers continue past 20 in various forms, but support for ' +
           'those thins out quickly.',
      },
      {
        h: 'Use it decoratively, not structurally',
        p: 'As with every Unicode text style, the appearance costs searchability and accessibility. ' +
           'Circled characters do not match their plain equivalents in search or Ctrl+F, and screen ' +
           'readers announce them inconsistently — sometimes as “circled letter b” for each ' +
           'character, which is unusable for a whole sentence. A decorative line in a bio is fine; a ' +
           'whole profile is not, and neither is anything you want found.',
      },
    ],
    steps: [
      'Type or paste your text.',
      'The bubble version appears immediately.',
      'Copy and paste it where you want it.',
    ],
    notes: [
      'Letters and digits convert; punctuation and spaces pass through unchanged.',
      'The filled (negative) style has no lowercase in Unicode, so mixed-case text mixes ' +
       'styles.',
      'Not searchable, and read out awkwardly by screen readers — keep important text plain.',
    ],
    faq: [
      ['Why are some of my bubble letters filled and some not?',
       'Because Unicode\'s filled circled set covers uppercase and digits but has no lowercase ' +
       'letters. Converters fall back to the outline forms for those, producing a mix. Typing in ' +
       'all capitals gives a consistent filled look.'],
      ['Will bubble text work on Instagram and TikTok?',
       'Yes, in bios, captions and comments on both, and on most modern platforms. Usernames are ' +
       'more often restricted, and some older devices show boxes where the font lacks the ' +
       'glyphs.'],
      ['Does bubble text affect my reach or SEO?',
       'It cannot be matched by search, so a bio or caption written in it is invisible to anyone ' +
       'searching those words — including platform search. Keep your keywords in plain text and ' +
       'use the styling for decoration only.'],
    ],
  },

  // ── CSS ───────────────────────────────────────────────────────────────────────
  'css-grid': {
    intro:
      'Builds a CSS Grid layout visually — columns, rows, gaps and alignment — with a live ' +
      'preview and the CSS to copy. Grid handles two dimensions at once, which is what ' +
      'separates it from flexbox and what makes page-level layout straightforward for the first ' +
      'time.',
    sections: [
      {
        h: 'fr is the unit that makes grid worth using',
        p: 'A fraction unit distributes whatever space is left after fixed sizes and gaps are ' +
           'subtracted. grid-template-columns: 200px 1fr gives a fixed sidebar and a main column ' +
           'that takes the rest; 1fr 2fr splits the remainder one-third and two-thirds. This is why ' +
           'grid replaced percentage widths: percentages do not know about your gap, so 50% + 50% + ' +
           'a 20px gap overflows, while 1fr 1fr with a gap simply works. Nothing needs recalculating ' +
           'when the gap changes.',
      },
      {
        h: 'A responsive grid with no media queries',
        p: 'grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) fits as many 240px-minimum ' +
           'columns as the container allows and stretches them to fill it — four across on a ' +
           'desktop, two on a tablet, one on a phone, with no breakpoints written anywhere. It is ' +
           'the single most useful line in CSS layout. auto-fill is the near-identical alternative: ' +
           'it keeps empty tracks where auto-fit collapses them, which matters only when you have ' +
           'fewer items than columns.',
      },
      {
        h: 'Named areas make layouts readable',
        p: 'grid-template-areas lets you draw the layout in the stylesheet as strings — “header ' +
           'header” / “sidebar main” / “footer footer” — and assign each element with grid-area: ' +
           'header. Six months later that is instantly legible in a way that line numbers are not, ' +
           'and rearranging the layout for a breakpoint means rewriting three strings rather than ' +
           'renumbering every child. Note that source order still governs reading order for screen ' +
           'readers and keyboard navigation, so do not use grid placement to reorder anything ' +
           'meaningful.',
      },
      {
        h: 'Grid or flexbox',
        p: 'Grid when the layout is two-dimensional and things must line up across rows and columns: ' +
           'page structure, dashboards, card galleries with consistent columns, forms with aligned ' +
           'labels. Flexbox when it is one-dimensional: a navbar, a button row, centring, a list ' +
           'that wraps. They are complementary rather than competing, and a grid whose cells each ' +
           'use flex internally is the normal arrangement rather than a compromise.',
      },
    ],
    steps: [
      'Set the number of columns and rows, or write a template with fr units.',
      'Set the gap — one value for both axes, or separate row and column gaps.',
      'Adjust justify and align to position items within their tracks.',
      'Copy the generated CSS.',
    ],
    notes: [
      'gap replaced grid-gap years ago and works in flexbox too; the old name still works but ' +
       'is deprecated.',
      'An fr track will not shrink below its content unless you set minmax(0, 1fr) — the usual ' +
       'cause of a grid overflowing its container.',
      'Grid placement does not change source order for assistive technology or tab order.',
    ],
    faq: [
      ['How do I make a responsive grid without media queries?',
       'grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)). The browser fits as many ' +
       'columns of at least 240px as will go and shares the remaining space between them, ' +
       'reflowing at every width with no breakpoints.'],
      ['What is the difference between auto-fit and auto-fill?',
       'Both create as many tracks as fit. auto-fill keeps empty tracks, so items stay at their ' +
       'minimum width with space left over; auto-fit collapses empty tracks so existing items ' +
       'stretch to fill the row. With more items than columns they behave identically.'],
      ['Why is my grid overflowing its container?',
       'Almost always a 1fr track holding content wider than the track — a long word, a ' +
       'pre-formatted block, an image. An fr track has an automatic minimum size of its content. ' +
       'Use minmax(0, 1fr) to let it shrink properly.'],
    ],
  },

  // ── SECURITY ──────────────────────────────────────────────────────────────────
  'password-strength': {
    intro:
      'Analyses a password\'s length, character variety and uniqueness, estimates its entropy ' +
      'and shows an indicative time to crack. It checks structure, not memorability — and the ' +
      'difference between those two things is the most important thing on this page.',
    sections: [
      {
        h: 'What the entropy figure assumes, and when it lies',
        p: 'The calculation is length × log₂(character set size): a 12-character password using all ' +
           'four classes scores about 79 bits. That is correct only if the password was chosen at ' +
           'random. “Password123!” has the same length and the same four classes and scores the same ' +
           '— and a real attacker breaks it in under a second, because it is in every cracking ' +
           'dictionary and the capital-at-the-start, digits-and-bang-at-the-end pattern is the first ' +
           'thing tried. Read a high score here as “structurally adequate”, never as “safe”.',
      },
      {
        h: 'What a dictionary attack actually does',
        p: 'Nobody brute-forces from aaaa upward. They start with leaked password lists — hundreds ' +
           'of millions of real passwords from real breaches — then apply transformation rules: ' +
           'capitalise the first letter, append a year, swap a for @, swap o for 0, add an ' +
           'exclamation mark. Those rules exist because they describe what people actually do. A ' +
           'password built from a word and a pattern falls to this regardless of how many character ' +
           'classes it contains, which is why randomness matters more than complexity.',
      },
      {
        h: 'The crack-time estimate is a rough upper bound',
        p: 'It assumes exhaustive search at a billion guesses a second, which is a reasonable figure ' +
           'for a fast hash on consumer GPU hardware. Reality varies enormously in both directions: ' +
           'against bcrypt with a decent cost factor, offline guessing is thousands of times slower, ' +
           'while a well-resourced attacker with many GPUs is far faster. And a password in a breach ' +
           'dictionary takes no time at all, whatever this says. Treat the figure as an order of ' +
           'magnitude for random passwords and as meaningless for guessable ones.',
      },
      {
        h: 'What actually protects an account',
        p: 'In order of real-world impact: a different password for every site, so one breach stays ' +
           'contained; two-factor authentication, which defeats a stolen password outright; a ' +
           'password manager, which makes the first two practical; and length. Brute force is near ' +
           'the bottom of the list of how accounts are actually lost — reuse, phishing and breaches ' +
           'are the top three, and none of them care how many symbols you used.',
      },
    ],
    steps: [
      'Type or paste a password — use the reveal toggle if you need to check what you typed.',
      'Read the strength rating, the entropy estimate and which checks passed.',
      'Treat a weak result as decisive and a strong result as provisional: if the password ' +
       'contains a word, a name or a date, it is weaker than the score suggests.',
    ],
    notes: [
      'The analysis runs entirely in your browser — nothing is transmitted, logged or stored.',
      'Scoring is structural: it does not check the password against breach dictionaries or ' +
       'detect common patterns and substitutions.',
      'Check whether a password has appeared in a known breach separately, using a service that ' +
       'does that specifically.',
    ],
    faq: [
      ['My password scored Very Strong. Is it safe?',
       'Only if you chose it randomly. The score measures length and character variety, which ' +
       '“Summer2026!” satisfies while being among the first few thousand guesses any attacker ' +
       'makes. A generated random password with the same score genuinely is strong; one you ' +
       'invented probably is not.'],
      ['Is it safe to type my real password into this page?',
       'The analysis is entirely local — no request is made and nothing is stored. As a general ' +
       'habit, be wary of typing live passwords into any web page, and prefer testing the ' +
       'pattern rather than the actual secret.'],
      ['How long should a password be in 2026?',
       'Sixteen random characters for ordinary accounts, twenty or more for a password manager\'s ' +
       'master password or anything holding money. But uniqueness matters more than length: a ' +
       '16-character password reused across five sites is weaker in practice than a 12-character ' +
       'one used nowhere else.'],
    ],
  },

  // ── ENCODERS ──────────────────────────────────────────────────────────────────
  'caesar-cipher': {
    intro:
      'Shifts each letter a chosen number of places through the alphabet — the cipher Julius ' +
      'Caesar reportedly used with a shift of three. It is the simplest substitution cipher ' +
      'there is, which makes it perfect for teaching and puzzles and useless for secrecy.',
    sections: [
      {
        h: 'How it works, and the one thing to remember',
        p: 'Pick a shift from 1 to 25. Each letter moves that many places, wrapping from Z back to ' +
           'A. Case is preserved and non-letters pass through untouched. Decoding is the same ' +
           'operation with the negative shift, so a message encoded with 5 is decoded with 21 — or ' +
           'with −5, which is the same thing. A shift of 13 is ROT13, the special case where ' +
           'encoding and decoding are identical because 13 is half of 26.',
      },
      {
        h: 'Why it falls immediately',
        p: 'There are only 25 possible keys, so brute force means trying all of them and reading ' +
           'which one makes sense — a second by hand, instantaneous by computer. Even without brute ' +
           'force, frequency analysis breaks it: E is the most common letter in English by a wide ' +
           'margin, so whichever letter appears most in the ciphertext is almost certainly E ' +
           'shifted, and the key follows from one observation. Al-Kindi described this attack in the ' +
           'ninth century, which makes the Caesar cipher securely broken for roughly 1,200 years.',
      },
      {
        h: 'Its place in the history of cryptography',
        p: 'The Caesar cipher is the ancestor of every substitution cipher, and the whole subsequent ' +
           'history is a response to its weaknesses. The Vigenère cipher uses a different shift per ' +
           'letter driven by a keyword, defeating simple frequency analysis for three centuries ' +
           'until Kasiski broke it in 1863. The Enigma machine is a mechanised substitution cipher ' +
           'whose wiring changed with every keypress. The modern descendant is the one-time pad: a ' +
           'random shift per character, never reused, which is the only cipher with a mathematical ' +
           'proof of unbreakability — and is impractical precisely because the key must be as long ' +
           'as the message.',
      },
      {
        h: 'What it is genuinely good for',
        p: 'Teaching, where it makes keys, ciphertext and cryptanalysis concrete in ten minutes. ' +
           'Puzzle hunts, escape rooms and capture-the-flag challenges, where a shifted string is a ' +
           'standard first layer. Spoiler hiding, usually as ROT13. Geocaching hints, which are ' +
           'conventionally ROT13 so you can choose whether to read them. It is a game, and an ' +
           'excellent one; it is not a security control.',
      },
    ],
    steps: [
      'Enter your text.',
      'Choose the shift — 3 for the classical Caesar, 13 for ROT13.',
      'To decode, apply the opposite shift, or 26 minus the original.',
      'If you do not know the shift, try each one and read for sense.',
    ],
    notes: [
      'Only A–Z and a–z shift; digits, punctuation, spaces and other scripts pass through ' +
       'unchanged.',
      'A shift of 13 is self-inverse: encoding twice returns the original.',
      'A shift of 26 (or 0) changes nothing.',
    ],
    faq: [
      ['How do I decrypt a Caesar cipher without the key?',
       'Try all 25 shifts and read which produces English — it takes seconds. For longer text, ' +
       'frequency analysis is faster: find the most common letter, assume it is E, and the shift ' +
       'is the distance between them.'],
      ['What shift did Caesar actually use?',
       'Three, according to Suetonius, so A became D. His nephew Augustus reportedly used a ' +
       'shift of one, without wrapping — he wrote AA for Z, which is an odd variant that would ' +
       'not survive a modern implementation.'],
      ['Is the Caesar cipher ever secure?',
       'No. With 25 possible keys it falls to brute force instantly, and to frequency analysis ' +
       'on any text of reasonable length. It has been broken since the ninth century. Use it for ' +
       'puzzles and teaching, never for anything you need kept private.'],
    ],
  },

  // ── PDF ───────────────────────────────────────────────────────────────────────
  'pdf-compressor': {
    intro:
      'Rebuilds a PDF\'s internal structure more efficiently and gives you the result, with the ' +
      'before and after sizes. How much it saves depends entirely on what is inside your file — ' +
      'and for the most common case, a scanned document, the honest answer is very little.',
    sections: [
      {
        h: 'What this actually does',
        p: 'It loads the document and re-saves it using object streams, which pack the PDF\'s ' +
           'internal objects — the cross-reference table, fonts metadata, page structure, ' +
           'annotations — more compactly, and discards anything orphaned. That is genuine, lossless ' +
           'compression of the file\'s scaffolding. Every byte of page content is preserved exactly: ' +
           'text stays selectable, images are untouched, nothing is re-rendered or degraded.',
      },
      {
        h: 'Why a scanned document barely shrinks',
        p: 'In most large PDFs the images are the file. A scanned contract is a JPEG per page ' +
           'wrapped in a thin PDF container, so the structure this tool optimises might be 2% of the ' +
           'total and the other 98% is image data it does not touch. Squeezing the scaffolding of a ' +
           '20 MB scan gets you a 19.8 MB scan. Real reduction there requires re-encoding the images ' +
           'at a lower quality or resolution, which is lossy by definition and a different operation ' +
           'from the one happening here.',
      },
      {
        h: 'Where it does help',
        p: 'Files generated by software rather than scanners: exports from Word, LaTeX, design tools ' +
           'and report generators, which often carry bloated structure, duplicated font subsets and ' +
           'leftover objects from editing. Documents that have been edited and re-saved repeatedly ' +
           'accumulate exactly this kind of debris. Forms and text-heavy reports. On those, savings ' +
           'of 10–30% are common, and occasionally much more on a file with a long revision history.',
      },
      {
        h: 'If you need a genuinely smaller file',
        p: 'Reduce the source before it becomes a PDF: scan at 200–300 dpi rather than 600, export ' +
           'images at the size they are displayed, and use grayscale for documents that are not in ' +
           'colour. Export from the original application with a “smallest file size” or “screen” ' +
           'preset, which downsamples images deliberately. For an existing scan, a tool that ' +
           're-encodes images is the only thing that will move the number meaningfully, and it will ' +
           'cost you some quality.',
      },
    ],
    steps: [
      'Choose your PDF.',
      'Press compress — the rebuilt file downloads automatically.',
      'Compare the before and after sizes; if the saving is negligible, your file is ' +
       'image-heavy and needs image re-encoding instead.',
    ],
    notes: [
      'Compression here is lossless — no page content is altered, downsampled or re-rendered.',
      'Image-heavy and scanned PDFs will show little or no reduction. That is expected, not a ' +
       'failure.',
      'The file is processed in your browser and never uploaded, which matters for contracts ' +
       'and statements.',
    ],
    faq: [
      ['Why did my PDF barely get smaller?',
       'Because its size is in its images, and this compresses structure rather than image data. ' +
       'A scanned document is essentially a stack of JPEGs, and shrinking the PDF scaffolding ' +
       'around them changes almost nothing. Getting that file smaller means re-encoding the ' +
       'images, which loses quality.'],
      ['Does compressing reduce the quality of my PDF?',
       'No. This is lossless — text, fonts and images come through byte-identical, and only the ' +
       'document\'s internal structure is repacked. Tools that achieve dramatic reductions on ' +
       'scans are doing something different and lossy.'],
      ['Is my PDF uploaded to a server?',
       'No. It is read, rebuilt and saved entirely within your browser. Nothing is transmitted, ' +
       'which is the main reason to use a browser-based tool for a document you would not want ' +
       'on someone else\'s server.'],
    ],
  },

  // ── MATH ──────────────────────────────────────────────────────────────────────
  'percentage-advanced': {
    intro:
      'Handles the percentage questions that are easy to state and easy to get wrong: what ' +
      'percentage one number is of another, percentage increase and decrease, reversing a ' +
      'percentage change, and adding or removing a percentage from a total.',
    sections: [
      {
        h: 'Percentage change is not symmetric',
        p: 'A price rising 50% and then falling 50% does not return to where it started — it ends ' +
           '25% down, because the second percentage is taken from the larger number. 100 → 150 → 75. ' +
           'This is the single most common percentage mistake, and it runs in both directions: a ' +
           'stock that falls 50% needs to rise 100% to recover. Whenever a percentage is quoted, the ' +
           'question that matters is what it is a percentage of.',
      },
      {
        h: 'Removing a percentage means dividing, not subtracting',
        p: 'To get the pre-tax price from a total that includes 20% VAT, divide by 1.2 — do not ' +
           'subtract 20%. A £120 total is £100 plus £20 of tax; subtracting 20% of 120 gives £96, ' +
           'which is wrong by four pounds. The same applies to discounts: a price after a 30% ' +
           'discount divides by 0.7 to recover the original. Getting this backwards is a common ' +
           'source of invoice disputes and mispriced listings.',
      },
      {
        h: 'Percentage points are a different unit',
        p: 'If an interest rate moves from 4% to 5%, that is a rise of one percentage point and a ' +
           'rise of 25%. Both statements are true and they describe the same change, which is why ' +
           'journalists and marketers can mislead without lying. When you read a percentage change ' +
           'of a figure that is itself a percentage, find out which is meant — the difference ' +
           'between “up two points” and “up two percent” on a 4% rate is a factor of twenty-five.',
      },
      {
        h: 'Successive percentages multiply',
        p: 'Three consecutive 10% increases are not 30% — they are 1.1³, or 33.1%. Compounding works ' +
           'the same way for discounts: 20% off, then a further 10% off, is 0.8 × 0.9 = 0.72, so 28% ' +
           'off rather than 30%. This is also why an annual rate quoted monthly is not simply ' +
           'divided by twelve, and why small percentage differences in a long-running investment ' +
           'matter far more than they look.',
      },
    ],
    steps: [
      'Choose the type of calculation you need.',
      'Enter the two numbers.',
      'Read the result and the working, which shows the formula applied.',
    ],
    notes: [
      'To add p%, multiply by (1 + p/100); to remove it from a total, divide by (1 + p/100).',
      'Percentage change uses the original value as the denominator — which value is “original” ' +
       'determines the answer.',
      'Division by zero is reported rather than producing infinity.',
    ],
    faq: [
      ['How do I remove VAT or sales tax from a total?',
       'Divide by 1 plus the rate. For 20% VAT, divide the gross by 1.2; for 18% GST, divide by ' +
       '1.18. Subtracting the percentage from the total gives the wrong answer, because the tax ' +
       'was calculated on the smaller net figure.'],
      ['What is the difference between percent and percentage points?',
       'A move from 4% to 5% is one percentage point and 25 percent. Percentage points measure ' +
       'the absolute gap between two percentages; percent measures the relative change. The ' +
       'distinction matters most for interest rates, tax rates and poll results.'],
      ['Why does a 50% loss need a 100% gain to recover?',
       'Because the gain is calculated on the reduced amount. 100 falling by 50% gives 50, and ' +
       'getting from 50 back to 100 is a 100% increase. The larger the loss, the more ' +
       'disproportionate the recovery: a 90% fall needs a 900% rise.'],
    ],
  },

  // ── FANCY ─────────────────────────────────────────────────────────────────────
  'upside-down-text': {
    intro:
      'Flips text upside down by substituting rotated Unicode characters and reversing the ' +
      'order, so “hello” becomes “oןlǝɥ”. It is a character trick rather than a font, so it ' +
      'survives being pasted anywhere.',
    sections: [
      {
        h: 'How the illusion is built',
        p: 'There is no upside-down alphabet in Unicode. The effect is assembled from characters ' +
           'that happen to look like inverted Latin letters, borrowed from wherever they exist: ɐ is ' +
           'a turned a from the phonetic alphabet, ן is a Hebrew final nun standing in for l, ǝ is a ' +
           'turned e, ɹ a turned r. The string is then reversed so it reads correctly when the whole ' +
           'line is flipped. Because the substitutes come from unrelated blocks, some are better ' +
           'matches than others and the result is convincing rather than exact.',
      },
      {
        h: 'The characters carry baggage',
        p: 'Borrowing a Hebrew letter to stand in for an inverted l means the text contains a ' +
           'right-to-left character, which can confuse text layout in unpredictable ways — cursor ' +
           'movement, selection and line wrapping can all behave oddly around it. Phonetic ' +
           'characters are announced by screen readers with their real names, so an upside-down bio ' +
           'is read aloud as a string of IPA symbols. Some platforms filter these blocks in ' +
           'usernames for exactly these reasons.',
      },
      {
        h: 'Where it works',
        p: 'Social bios and captions, chat, and comment sections on most modern platforms. Not in ' +
           'usernames on many services, not in email subject lines without raising spam scores, and ' +
           'not in anything printed, where a font missing the substitute glyphs will show boxes. As ' +
           'with every Unicode text style, it is unsearchable: nobody will find your post by ' +
           'searching the words in it.',
      },
    ],
    steps: [
      'Type or paste your text.',
      'The flipped version appears immediately, already reversed.',
      'Copy it and paste it wherever you want it.',
    ],
    notes: [
      'Characters without a plausible inverted counterpart pass through unchanged.',
      'The output is reversed as well as substituted, which is what makes it read correctly ' +
       'when flipped.',
      'Unsearchable and awkward for screen readers — decorative use only.',
    ],
    faq: [
      ['How do I turn upside-down text back to normal?',
       'Paste it into the same tool. The substitutions are reversible and the string reverses ' +
       'back, so the operation undoes itself — with the occasional character lost where two ' +
       'letters share one inverted lookalike.'],
      ['Why do some characters not flip?',
       'Because no Unicode character resembles their inverted form. Digits, many accented ' +
       'letters and most punctuation have no convincing counterpart, so they are left as they ' +
       'are rather than substituted with something wrong.'],
      ['Can I use upside-down text in my username?',
       'Often not — many platforms restrict usernames to ASCII, and some filter these blocks ' +
       'specifically because they include right-to-left characters. Display names and bios are ' +
       'usually more permissive.'],
    ],
  },

  // ── FORMATTERS ────────────────────────────────────────────────────────────────
  'yaml-formatter': {
    intro:
      'Reformats YAML with consistent indentation and structure, and reports a parse error with ' +
      'its location when the document is invalid. Since YAML\'s indentation *is* its syntax, ' +
      'formatting it is closer to validation than to cosmetics.',
    sections: [
      {
        h: 'Indentation errors that parse successfully',
        p: 'The dangerous YAML mistake is not the one that fails — it is the one that parses into ' +
           'the wrong structure. Indent a key two spaces too far and it becomes a child of the line ' +
           'above instead of a sibling, and the file loads cleanly with your setting quietly nested ' +
           'under something else. Reformatting surfaces this: when the output nests a key you ' +
           'expected at the top level, you have found a real bug that no error message would have ' +
           'told you about.',
      },
      {
        h: 'Tabs are forbidden, and the error rarely says so',
        p: 'YAML prohibits tab characters for indentation outright. An editor configured to insert ' +
           'tabs produces a file that fails to parse with a message about an unexpected character, ' +
           'which sends people hunting for a typo. If a YAML file will not load and you cannot see ' +
           'why, check for tabs first — turn on whitespace display, or run the file through a ' +
           'formatter like this one, which normalises everything to spaces.',
      },
      {
        h: 'Quoting, and the values that change type',
        p: 'YAML infers types from unquoted text, which is convenient until it is not. A bare no or ' +
           'off becomes the boolean false, which famously turned Norway\'s country code into a false ' +
           'value in real systems. 1.10 becomes the number 1.1, losing a version number\'s meaning. A ' +
           'time like 22:30 can be read as a number in some parsers. Anything that must remain a ' +
           'string — version numbers, country codes, IDs, times, anything with a leading zero — ' +
           'should be quoted, and a formatter will not add those quotes for you.',
      },
      {
        h: 'Anchors, aliases and multi-line strings',
        p: 'YAML can define a block once with an anchor (&name) and reuse it with an alias (*name), ' +
           'which is how Docker Compose and CI configurations avoid repeating themselves. Multi-line ' +
           'strings come in two flavours: | keeps the line breaks, > folds them into spaces. Both ' +
           'are preserved through formatting, and both are worth knowing because a shell script ' +
           'embedded in a CI file behaves very differently depending on which you used.',
      },
    ],
    steps: [
      'Paste your YAML.',
      'Read the formatted output, or the parse error and its location.',
      'Check that the nesting in the output matches what you intended — that check is the real ' +
       'value.',
    ],
    notes: [
      'Two-space indentation is the convention; tabs are invalid YAML anywhere in the document.',
      'Comments may not survive reformatting, since most parsers discard them — keep the ' +
       'original.',
      'Formatting runs in your browser, so CI configuration and secrets are not transmitted.',
    ],
    faq: [
      ['Why does my YAML fail with an unexpected-character error?',
       'Check for tab characters. YAML forbids tabs for indentation and the resulting message ' +
       'rarely names them. An editor set to insert tabs will produce this every time; switch the ' +
       'file to spaces.'],
      ['How many spaces should YAML be indented?',
       'Two per level, by near-universal convention. YAML permits any consistent amount, but ' +
       'every widely used configuration format — Kubernetes, Docker Compose, GitHub Actions — ' +
       'uses two, and consistency within a file is mandatory.'],
      ['Will formatting change my values?',
       'It should not change data, but it can expose that a value was never what you thought: an ' +
       'unquoted no was already the boolean false before formatting. If a value looks different ' +
       'afterwards, quote it in the source — the formatter revealed the problem rather than ' +
       'creating it.'],
    ],
  },

  // ── CONTENT ───────────────────────────────────────────────────────────────────
  'instagram-caption-gen': {
    intro:
      'Generates caption options for a post from a topic and a tone, as a starting point rather ' +
      'than a finished line. The useful part is having six directions to react to instead of ' +
      'staring at an empty field.',
    sections: [
      {
        h: 'The first line is the whole caption',
        p: 'Instagram truncates captions after roughly 125 characters behind a “more” link, and the ' +
           'overwhelming majority of readers never tap it. Whatever matters — the hook, the ' +
           'question, the offer — has to be in front of that cut. Everything after it is for the ' +
           'minority who expanded, which is the right place for context, credits and a longer story, ' +
           'but not for the point.',
      },
      {
        h: 'What actually drives reach',
        p: 'Saves and shares weigh more than likes, and comments weigh more than both, because they ' +
           'signal that the post was worth someone\'s time rather than their thumb. That is why a ' +
           'caption ending in a genuine question outperforms one ending in a full stop, and why ' +
           '“double tap if you agree” performs worse than it used to — the platform learned to ' +
           'discount solicited engagement. Write the question you actually want answered; generic ' +
           'prompts read as generic.',
      },
      {
        h: 'Hashtags, honestly',
        p: 'Instagram\'s own guidance is now three to five relevant hashtags rather than the ' +
           'thirty-tag blocks that worked years ago, and keyword-based search has taken over much of ' +
           'the discovery that hashtags used to handle. That means the words in your caption matter ' +
           'for search in a way they did not before — write what the post is about in plain ' +
           'language. A wall of tags in a first comment is no longer a trick, just clutter.',
      },
      {
        h: 'Use generated captions as drafts',
        p: 'A caption written by a generator sounds like a caption written by a generator, and ' +
           'audiences are now well calibrated to that. The value is the starting shape: pick the ' +
           'direction that fits, then rewrite it in your own voice with a specific detail only you ' +
           'could supply — what happened, where, what went wrong. Specificity is what separates a ' +
           'post that reads as a person from one that reads as a content calendar.',
      },
    ],
    steps: [
      'Enter your topic or what the post shows.',
      'Choose a tone.',
      'Generate several options and pick a direction rather than a finished line.',
      'Rewrite it in your own voice, front-loading the hook into the first 125 characters.',
    ],
    notes: [
      'Captions are cut at about 125 characters in the feed — put the hook first.',
      'Line breaks improve readability; Instagram preserves them if you type them directly.',
      'Three to five relevant hashtags is current guidance, not thirty.',
    ],
    faq: [
      ['How long should an Instagram caption be?',
       'As long as it earns. The limit is 2,200 characters but only the first 125 or so show ' +
       'before the fold, so short captions work when the image carries the message and long ones ' +
       'work when the story is the point. What does not work is a long caption whose first line ' +
       'gives no reason to expand it.'],
      ['How many hashtags should I use?',
       'Three to five relevant ones, which is Instagram\'s own current guidance. The era of ' +
       'thirty tags is over, and keyword search now does much of what hashtags used to — so ' +
       'describing the post in plain words in the caption matters more than the tag count.'],
      ['Do generated captions hurt engagement?',
       'Used as a final draft, often yes — they read as generic and audiences notice. Used as a ' +
       'starting point you then rewrite with a specific detail of your own, they save time ' +
       'without costing voice. The generator is for beating the blank field, not for filling it.'],
    ],
  },

  // ── IMAGES ────────────────────────────────────────────────────────────────────
  'favicon-generator': {
    intro:
      'Resizes an image to 32×32 and gives you a PNG — which is all a favicon needs to be in ' +
      'every browser shipping today. The .ico container everyone still asks for has not been ' +
      'required for years.',
    sections: [
      {
        h: 'You almost certainly do not need an .ico file',
        p: 'The .ico format exists because Internet Explorer looked for /favicon.ico at the site ' +
           'root and understood nothing else. Every current browser reads a PNG referenced with ' +
           '<link rel="icon" type="image/png" href="/favicon.png"> and prefers it, because PNG ' +
           'supports proper alpha and better compression. The one remaining reason to keep a ' +
           'favicon.ico at the root is that some feed readers, link-preview bots and older crawlers ' +
           'still request that exact path — a nice-to-have, not a requirement for browsers.',
      },
      {
        h: 'Design for 16 pixels, not for 512',
        p: 'The favicon is displayed at roughly 16×16 in a tab and 32×32 on a high-density screen. ' +
           'At that size a detailed logo becomes a grey smudge. What survives is a single letter, a ' +
           'simple geometric mark, or one strong silhouette — with high contrast against both light ' +
           'and dark browser chrome, since users have both. Test it by shrinking your image to 16 ' +
           'pixels and looking at it from arm\'s length; if you cannot tell what it is, neither can ' +
           'anyone glancing at a tab.',
      },
      {
        h: 'The full set, if you want one',
        p: 'A complete modern set is smaller than the generators of a decade ago suggested: a 32×32 ' +
           'PNG for browsers, a 180×180 apple-touch-icon for iOS home screens, and 192×192 plus ' +
           '512×512 PNGs referenced from a web app manifest for Android. An SVG icon with rel="icon" ' +
           'is worth adding where you have one, because it scales to any density and can respond to ' +
           'dark mode with a media query inside the file. The dozens of sizes older tools produced ' +
           'were for devices nobody uses now.',
      },
      {
        h: 'Why your new favicon is not showing',
        p: 'Browsers cache favicons far more aggressively than pages, sometimes ignoring a normal ' +
           'hard refresh entirely. Add a query string to the href to force a re-fetch, open the icon ' +
           'URL directly to confirm it is being served, and check the path is absolute from the site ' +
           'root rather than relative to the current page. If the tab still shows the old icon after ' +
           'all that, it is almost always cached rather than missing.',
      },
    ],
    steps: [
      'Choose your source image — square, with generous padding around the mark.',
      'Generate and download the 32×32 PNG.',
      'Put it at your site root and reference it with a link tag in the head.',
      'Add a 180×180 apple-touch-icon and manifest icons if you want home-screen support.',
    ],
    notes: [
      'A square source works best; a rectangular image will be squashed rather than cropped.',
      'Use a transparent background so the icon sits correctly on light and dark browser ' +
       'chrome.',
      'The image is processed in your browser — nothing is uploaded.',
    ],
    faq: [
      ['What size should a favicon be?',
       '32×32 covers browsers, including high-density displays where a 16×16 would look soft. ' +
       'Add 180×180 for the iOS home screen and 192×192 plus 512×512 for Android if you have a ' +
       'web app manifest. There is no need for the long list of sizes older generators produced.'],
      ['Do I still need favicon.ico?',
       'Not for browsers — every current one prefers a PNG referenced by a link tag. Keeping a ' +
       'favicon.ico at the site root is still mildly useful because some crawlers and feed ' +
       'readers request that exact path without reading your HTML.'],
      ['Why is my new favicon not updating?',
       'Favicon caching is unusually aggressive and often survives a hard refresh. Append a ' +
       'query string to the href, load the icon URL directly to confirm it is being served, and ' +
       'make sure the path is absolute from the root.'],
    ],
  },
  'pdf-to-image': {
    intro:
      'Renders PDF pages to PNG images in your browser, one file per page. Useful when you need ' +
      'a page as a picture — for a slide, a document you cannot edit, a thumbnail, or a form ' +
      'you want to annotate in an image editor.',
    sections: [
      {
        h: 'Rendering is a one-way conversion',
        p: 'A PDF page is a set of drawing instructions: text with font references, vector paths, ' +
           'embedded images. Rendering executes those instructions onto a bitmap, which means the ' +
           'result is pixels and nothing else. Text stops being selectable and searchable, vectors ' +
           'stop being scalable, and there is no route back — converting the image to PDF again ' +
           'gives you a picture of a page, not the page. Keep the original whenever you might need ' +
           'to edit or search it.',
      },
      {
        h: 'Resolution is the setting that matters',
        p: 'The output size depends on the scale you render at. Screen use is fine at 1× to 2×; ' +
           'printing wants roughly 300 dpi, which for an A4 page means around 2,480×3,508 pixels. ' +
           'Going higher does not add detail that is not in the source — a page whose content is a ' +
           'low-resolution scan will not sharpen — but it does multiply memory use, which is the ' +
           'usual reason a browser tab struggles on a long document.',
      },
      {
        h: 'PNG or JPEG',
        p: 'PNG is lossless and the right choice for pages that are mostly text, diagrams or line ' +
           'art, where JPEG artefacts show as fringing around letter edges and make small text look ' +
           'dirty. JPEG is much smaller for pages that are photographs. A text page saved as PNG ' +
           'will often be smaller than the same page as a high-quality JPEG anyway, because large ' +
           'flat areas compress extremely well in PNG.',
      },
      {
        h: 'Memory limits in the browser',
        p: 'Every rendered page is held as an uncompressed bitmap before it is encoded, and an A4 ' +
           'page at 300 dpi is about 35 megabytes in memory. A hundred-page document at that ' +
           'resolution will exhaust a browser tab. Render in batches, or drop the scale for long ' +
           'documents — that is a limit of doing the work locally, and the trade you get in return ' +
           'is that the file never leaves your machine.',
      },
    ],
    steps: [
      'Choose your PDF.',
      'Set the scale — higher for print, lower for screen or long documents.',
      'Render, then download the pages you need.',
    ],
    notes: [
      'Output is raster: text in the images is no longer selectable or searchable.',
      'Long documents at high resolution can exhaust browser memory — work in batches.',
      'Rendering happens locally; the PDF is never uploaded.',
    ],
    faq: [
      ['Can I convert the images back into a searchable PDF?',
       'Not directly — rendering discards the text layer. Putting the images into a PDF gives ' +
       'you a scanned-looking document. Recovering searchable text needs OCR, which is a ' +
       'different process and introduces its own errors. Keep the original PDF.'],
      ['What resolution should I use?',
       '1× to 2× for anything viewed on screen, and around 300 dpi for print — roughly 2480×3508 ' +
       'pixels for A4. Rendering beyond the source\'s own detail adds file size without adding ' +
       'sharpness.'],
      ['Why does my browser slow down on a long PDF?',
       'Each page becomes an uncompressed bitmap in memory before encoding, and at print ' +
       'resolution that is tens of megabytes per page. Render fewer pages at a time, or reduce ' +
       'the scale.'],
    ],
  },

  // ── COLOR ─────────────────────────────────────────────────────────────────────
  'color-palette': {
    intro:
      'Generates a colour palette from a base colour using the classical harmony relationships ' +
      '— complementary, analogous, triadic, split-complementary — with the hex value of every ' +
      'swatch ready to copy.',
    sections: [
      {
        h: 'What the harmonies actually are',
        p: 'They are positions on the hue wheel, nothing more mysterious. Complementary is the hue ' +
           'directly opposite, 180° away, giving maximum contrast and tension. Analogous takes ' +
           'neighbours 30° either side, which is calm and cohesive because the hues share a family. ' +
           'Triadic takes two hues 120° apart for vivid balance. Split-complementary takes the two ' +
           'neighbours of the complement, keeping most of the contrast while softening the clash. ' +
           'They are starting points, not rules — a palette that follows a harmony exactly often ' +
           'looks mechanical.',
      },
      {
        h: 'A harmony is not yet a usable interface palette',
        p: 'Five equally saturated hues will make an unusable product. Real interface palettes are ' +
           'mostly neutral: a near-white background, a near-black text colour, three or four greys, ' +
           'one accent used sparingly for actions, and semantic colours for success, warning and ' +
           'danger. The 60-30-10 guideline is the useful version of this — 60% dominant neutral, 30% ' +
           'secondary, 10% accent. Use the harmony to pick the accent and its supporting tone, then ' +
           'build the neutrals around them.',
      },
      {
        h: 'Hue harmony does not guarantee readable contrast',
        p: 'Two colours can be perfectly complementary and completely unreadable together, because ' +
           'contrast depends on luminance rather than hue. Saturated red text on a saturated green ' +
           'background is a textbook complementary pair and fails WCAG badly. Every colour pair ' +
           'intended for text has to be checked separately against a contrast ratio, and it is worth ' +
           'doing before you commit to a palette rather than after the design is built around it.',
      },
      {
        h: 'Building tints and shades',
        p: 'A palette needs more than one value per hue: a button needs a hover state, a background ' +
           'needs a subtle variant, a border needs something between. The reliable way is to hold ' +
           'the hue and saturation and walk the lightness in even steps — which is exactly what HSL ' +
           'makes easy and hex makes impossible to do by eye. Be aware that equal lightness steps ' +
           'are not equally spaced perceptually; yellows look much brighter than blues at the same ' +
           'HSL lightness.',
      },
    ],
    steps: [
      'Choose a base colour, usually your brand or accent hue.',
      'Pick a harmony and review the generated swatches.',
      'Copy the hex values you want, then check any text pair with the contrast checker.',
      'Build tints and shades by varying lightness on the hues you kept.',
    ],
    notes: [
      'Harmonies are hue rotations: complementary 180°, triadic 120°, analogous ±30°.',
      'A generated palette is a starting point — most good interface palettes are mostly ' +
       'neutral with one accent.',
      'Always verify text and background pairs against WCAG contrast before using them.',
    ],
    faq: [
      ['How many colours should a palette have?',
       'For an interface: one accent, one or two neutrals with several steps, plus semantic ' +
       'colours for success, warning and error. That is usually enough. Palettes of six equally ' +
       'weighted vivid colours look striking on a swatch card and are very hard to build a ' +
       'usable product with.'],
      ['What is the difference between complementary and analogous?',
       'Complementary colours sit opposite on the wheel, giving strong contrast and energy but ' +
       'fighting each other if used in equal amounts. Analogous colours are neighbours, giving a ' +
       'calm, cohesive look that can be too flat without an accent from elsewhere.'],
      ['Can I use any two colours from the palette for text?',
       'Only after checking. Harmony is about hue and readability is about luminance, so plenty ' +
       'of harmonious pairs fail accessibility outright. Run any text-on-background combination ' +
       'through a contrast checker and aim for at least 4.5:1.'],
    ],
  },
  'color-gradient': {
    intro:
      'Generates a smooth run of colours between two or more stops and gives you every ' +
      'intermediate value. Useful for chart scales, heat maps, data visualisation ramps and ' +
      'generating a tint series from a brand colour.',
    sections: [
      {
        h: 'Why the middle of a blend goes muddy',
        p: 'Interpolating in sRGB means averaging the red, green and blue channels, and that path ' +
           'frequently passes through grey. Blue to yellow is the notorious example: the midpoint of ' +
           'the two channel sets is a desaturated sludge, because the route between them in RGB ' +
           'space goes near the centre where all colours are grey. Perceptual spaces such as OKLCH ' +
           'and Lab take a path that keeps saturation, which is why modern design tools and CSS\'s ' +
           'newer interpolation keywords produce visibly better blends between distant hues.',
      },
      {
        h: 'Colour ramps for data are a different problem',
        p: 'A gradient that looks attractive can badly misrepresent data. The classic rainbow scale ' +
           'is the worst offender: it has sharp perceptual boundaries at yellow and cyan that invent ' +
           'structure in the data, and it becomes unreadable in greyscale and for colour-blind ' +
           'readers. Sequential data wants a ramp that increases monotonically in lightness — ' +
           'viridis, magma, or a simple single-hue light-to-dark. Diverging data with a meaningful ' +
           'midpoint wants two hues meeting at a neutral. Categorical data wants distinct hues, not ' +
           'a gradient at all.',
      },
      {
        h: 'Generating a tint scale from one brand colour',
        p: 'A practical use: blend your accent toward white for the light steps and toward a very ' +
           'dark neutral for the dark ones, taking evenly spaced samples to get a 50–900 scale like ' +
           'the ones design systems ship. Blending toward pure white and pure black gives washed-out ' +
           'and muddy ends; blending toward a very light tinted white and a near-black that carries ' +
           'a little of the hue keeps the scale coherent.',
      },
    ],
    steps: [
      'Set the start and end colours, and any intermediate stops.',
      'Choose how many steps you want.',
      'Copy the hex values, or the CSS gradient if you want it as a background.',
    ],
    notes: [
      'Blending complementary colours in sRGB passes through grey — add a midpoint stop you ' +
       'choose.',
      'For data visualisation, prefer a ramp whose lightness increases steadily rather than a ' +
       'rainbow.',
      'Check any step used behind text against a contrast ratio; a smooth ramp crosses the ' +
       'readable threshold somewhere in the middle.',
    ],
    faq: [
      ['Why does my gradient look grey in the middle?',
       'Because sRGB interpolation takes a path near the centre of the colour space between ' +
       'distant hues. Add a midpoint stop in a saturated colour you choose, or interpolate in a ' +
       'perceptual space such as OKLCH where support allows.'],
      ['What is the best colour scale for a heat map?',
       'A perceptually uniform sequential scale such as viridis or magma, where lightness ' +
       'increases steadily. These stay readable in greyscale and for colour-blind viewers, and ' +
       'they do not create false boundaries the way a rainbow scale does.'],
      ['How do I make a tint scale from my brand colour?',
       'Blend it toward a very light tinted white for the light end and a near-black carrying a ' +
       'trace of the hue for the dark end, then take evenly spaced samples. Blending to pure ' +
       'white and pure black gives ends that look washed out and muddy.'],
    ],
  },

  // ── MATH ──────────────────────────────────────────────────────────────────────
  'quadratic-solver': {
    intro:
      'Solves ax² + bx + c = 0 for any coefficients, showing the discriminant, the roots ' +
      'including complex ones, and the working. It also gives the vertex, which is what you ' +
      'usually want when the quadratic is modelling something real.',
    sections: [
      {
        h: 'The discriminant tells you the shape of the answer',
        p: 'b² − 4ac decides everything before you compute a root. Positive means two distinct real ' +
           'roots, so the parabola crosses the x-axis twice. Zero means one repeated root, where the ' +
           'curve touches the axis at its vertex. Negative means no real roots — the parabola misses ' +
           'the axis entirely and the solutions are a complex conjugate pair. Checking the ' +
           'discriminant first tells you what kind of answer to expect and catches an arithmetic ' +
           'slip before you finish.',
      },
      {
        h: 'Completing the square, and where the formula comes from',
        p: 'The quadratic formula is not arbitrary: it is what you get by completing the square on ' +
           'the general form. Divide through by a, move c across, add (b/2a)² to both sides to make ' +
           'a perfect square, and take the root. That derivation is worth doing once, because it ' +
           'explains the ±, explains why the vertex sits at x = −b/2a, and makes the formula ' +
           'something you can reconstruct rather than something you have to remember.',
      },
      {
        h: 'The vertex is usually the interesting answer',
        p: 'Roots tell you where a quantity is zero. In most word problems — projectile height, ' +
           'profit against price, area against a fixed perimeter — the question is really about the ' +
           'maximum or minimum, which is the vertex at x = −b/2a. If a is positive the parabola ' +
           'opens upward and the vertex is a minimum; if negative it opens downward and the vertex ' +
           'is a maximum. Many students find the roots correctly and then answer the wrong question.',
      },
      {
        h: 'Where the formula loses precision',
        p: 'When b² is much larger than 4ac, one root involves subtracting two nearly equal numbers, ' +
           'and floating-point arithmetic loses significant digits doing it — catastrophic ' +
           'cancellation. Numerical libraries avoid it by computing the well-conditioned root with ' +
           'the formula and the other as c/(a·x₁), using the relationship that the product of the ' +
           'roots is c/a. It rarely matters for homework and matters a great deal in simulation ' +
           'code.',
      },
    ],
    steps: [
      'Enter the coefficients a, b and c — a cannot be zero, or the equation is linear.',
      'Read the discriminant to see what kind of roots to expect.',
      'Read the roots and the vertex, with the working shown.',
    ],
    notes: [
      'If a is 0 the equation is linear, not quadratic, and has a single root at −c/b.',
      'Complex roots are returned as a conjugate pair when the discriminant is negative.',
      'The sum of the roots is −b/a and their product is c/a — a quick way to check an answer.',
    ],
    faq: [
      ['What does it mean if the discriminant is negative?',
       'The parabola never crosses the x-axis, so there are no real solutions — the roots are a ' +
       'complex conjugate pair, a ± bi. If the problem is modelling something physical, a ' +
       'negative discriminant usually means the situation described cannot happen: the ' +
       'projectile never reaches that height, the profit never hits that target.'],
      ['How do I find the vertex of a parabola?',
       'x = −b/2a, then substitute that back to get y. It sits exactly halfway between the roots ' +
       'when they are real, which is worth remembering as a check. It is the maximum if a is ' +
       'negative and the minimum if a is positive.'],
      ['Can I solve a quadratic without the formula?',
       'Often, and faster. Factoring works when the roots are rational — try it first for tidy ' +
       'coefficients. Completing the square always works and is where the formula comes from. ' +
       'The formula is the fallback that never fails, which is why it is worth memorising even ' +
       'though it is rarely the quickest route.'],
    ],
  },

  // ── ENCODERS ──────────────────────────────────────────────────────────────────
  'html-encode': {
    intro:
      'Converts characters that would otherwise be read as markup into HTML entities — & to ' +
      '&amp;amp;, < to &amp;lt;, > to &amp;gt;, quotes to &amp;quot; and &amp;#39;. This is the ' +
      'operation that stops user content from becoming executable markup.',
    sections: [
      {
        h: 'The five characters that matter',
        p: '& must be escaped first, because escaping it after the others would double-escape their ' +
           'entities. Then < and >, which open and close tags. Inside an attribute value, the quote ' +
           'characters matter too: a double quote in an unescaped attribute closes it early and lets ' +
           'an attacker add their own attributes, including event handlers. Escaping those five in ' +
           'the right order is the whole of basic HTML escaping, and getting the ampersand order ' +
           'wrong is the classic implementation bug.',
      },
      {
        h: 'Escaping is contextual, and one function is not enough',
        p: 'HTML escaping protects text in an HTML body. It does not protect a value going into a ' +
           'JavaScript string, a URL, a CSS property or an unquoted attribute — each needs its own ' +
           'escaping, and using HTML entities in those places is both ineffective and visibly ' +
           'broken. This is why every serious security guide talks about context-aware output ' +
           'encoding rather than “sanitising input”. A value is not safe or unsafe in itself; it is ' +
           'safe or unsafe for a particular destination.',
      },
      {
        h: 'Escape at output, not at input',
        p: 'Storing escaped text in your database seems defensive and causes lasting trouble: the ' +
           'value is now wrong for every non-HTML use — an email, a CSV export, a search index, an ' +
           'API response — and passing it through a second escaping layer produces the &amp;amp;lt; ' +
           'you see on badly built sites. Store exactly what the user typed, escape when you render, ' +
           'and escape for the context you are rendering into. Modern template engines do this ' +
           'automatically, which is why the bugs cluster around the places where developers ' +
           'deliberately bypass it.',
      },
      {
        h: 'Where it is used legitimately',
        p: 'Displaying code samples on a page, which is the commonest non-security use — a snippet ' +
           'of HTML has to be escaped or the browser renders it. Putting arbitrary text into an ' +
           'attribute. Including user-supplied names in a page. Preparing content for an XML feed, ' +
           'where only five entities are defined and &amp;nbsp; will cause a parse error.',
      },
    ],
    steps: [
      'Paste the text you want to escape.',
      'The encoded version appears immediately.',
      'Copy it into your HTML, template or code sample.',
    ],
    notes: [
      'The ampersand must be escaped before the other characters, or their entities get ' +
       'double-escaped.',
      'XML defines only five entities — &amp;amp;, &amp;lt;, &amp;gt;, &amp;quot; and ' +
       '&amp;apos; — so HTML-specific ones like &amp;nbsp; break an XML parser.',
      'Encoding runs in your browser; content is not transmitted.',
    ],
    faq: [
      ['Which characters have to be escaped in HTML?',
       '&, < and > in body text, plus the quote characters inside attribute values. Escaping ' +
       'those five covers the cases that turn text into markup. Everything else is optional and ' +
       'mostly unnecessary in a UTF-8 document.'],
      ['Does escaping HTML prevent XSS?',
       'It prevents the common case of injecting markup into body text, and it is not sufficient ' +
       'on its own. A value placed into a JavaScript context, a URL, a CSS value or an unquoted ' +
       'attribute needs different escaping. Escape for the destination, and never assign ' +
       'untrusted content to innerHTML.'],
      ['Should I escape text before saving it to my database?',
       'No. Store what the user actually typed and escape at the point of rendering. Escaping on ' +
       'input corrupts the value for every non-HTML use and leads to double-escaped output when ' +
       'it is escaped again on the way out.'],
    ],
  },

  // ── TEXT ──────────────────────────────────────────────────────────────────────
  'text-reverser': {
    intro:
      'Reverses text — by characters, by words, or line by line. Simple in principle, and a ' +
      'surprisingly good demonstration of why “reverse a string” is a harder problem in Unicode ' +
      'than it looks.',
    sections: [
      {
        h: 'Three different reversals',
        p: 'Character reversal turns “hello world” into “dlrow olleh”. Word reversal keeps each word ' +
           'intact and reverses their order, giving “world hello” — which is what you usually want ' +
           'for prose. Line reversal flips the order of lines while leaving each one alone, useful ' +
           'for turning a chronological log or a list into reverse order. They are genuinely ' +
           'different operations and people often ask for one while meaning another.',
      },
      {
        h: 'Why reversing a string is a classic trick question',
        p: 'Reversing an array of characters is trivial until Unicode is involved. An emoji is ' +
           'stored as a surrogate pair, and reversing the code units splits it into two invalid ' +
           'halves. A composed character — e followed by a combining acute — reverses into the ' +
           'accent attached to the wrong letter. A flag emoji is two regional indicator symbols; ' +
           'reversed, it becomes a different country\'s flag. Fully correct reversal means working in ' +
           'grapheme clusters, which is why the interview question is more interesting than it first ' +
           'appears.',
      },
      {
        h: 'What people actually use it for',
        p: 'Puzzles and word games, where reversed text is a standard obfuscation. Checking whether ' +
           'something is a palindrome by eye. Creating mirror-writing effects for design. Reversing ' +
           'a list that came out in the wrong order when no sort key is available. And testing how ' +
           'software handles unusual text — reversed strings with combining characters are a good ' +
           'quick probe for rendering bugs.',
      },
    ],
    steps: [
      'Paste your text.',
      'Choose whether to reverse characters, words or lines.',
      'Copy the result.',
    ],
    notes: [
      'Character reversal works on code points, so ordinary letters, digits and punctuation ' +
       'reverse cleanly.',
      'Emoji built from several code points — flags, skin tones, family groups — may not ' +
       'survive character-level reversal intact.',
      'Word reversal preserves each word\'s spelling and only changes their order.',
    ],
    faq: [
      ['How do I reverse the order of words instead of letters?',
       'Choose word mode. Character mode spells every word backwards; word mode keeps each word ' +
       'as it is and reverses their sequence, which is what you want for readable output.'],
      ['Why does my emoji break when reversed?',
       'Because many emoji are made of several code points joined together — a flag is two ' +
       'regional indicators, a family is several people joined by zero-width joiners. Reversing ' +
       'that sequence produces a different or invalid character. Plain text reverses without ' +
       'trouble.'],
      ['Can I use this to check for a palindrome?',
       'You can compare the reversed text against the original by eye, but the palindrome ' +
       'checker does it properly — it ignores case, spaces and punctuation, which is the ' +
       'convention for phrase palindromes and what makes “A man, a plan, a canal: Panama” count.'],
    ],
  },
  'url-extractor': {
    intro:
      'Pulls every URL out of a block of text — raw HTML, an email, a chat export, a document — ' +
      'removes duplicates and gives you a clean list. It reads the text you paste; it does not ' +
      'fetch or crawl anything.',
    sections: [
      {
        h: 'What it finds, and what it misses',
        p: 'The scan matches http and https URLs wherever they appear, including inside HTML ' +
           'attributes and markdown link syntax, because the surrounding markup does not match the ' +
           'pattern and is skipped. What it cannot find is anything not written as a URL in the text ' +
           'you pasted: relative links like /about, protocol-relative ones starting //, links ' +
           'assembled by JavaScript after the page loads, and addresses written as “example dot ' +
           'com”. If a page looked full of links and the result is short, view-source rather than ' +
           'copying the rendered page.',
      },
      {
        h: 'Where the trailing punctuation goes',
        p: 'URLs at the end of a sentence collect the full stop, and URLs in brackets collect the ' +
           'closing bracket, because both are legal URL characters and no pattern can reliably tell ' +
           'intent from syntax. Wikipedia URLs containing genuine parentheses are the standard ' +
           'example of why this cannot be solved perfectly. Scan the tail of each extracted link ' +
           'before using the list programmatically.',
      },
      {
        h: 'Practical uses',
        p: 'Auditing which external sites a page links to. Pulling every link out of a newsletter or ' +
           'an email thread to check or archive them. Extracting the URLs from a chat export or a ' +
           'document before migrating it. Building a list to feed into a link checker. Recovering ' +
           'the links from an HTML export when you no longer have the source.',
      },
    ],
    steps: [
      'Paste the text, HTML or export containing the links.',
      'Press extract.',
      'Copy individual URLs or the whole deduplicated list.',
    ],
    notes: [
      'Works directly on raw HTML — no need to strip tags first.',
      'Only absolute http and https URLs are matched; relative paths are not.',
      'Nothing is fetched or visited — the tool only reads the text you provide.',
    ],
    faq: [
      ['Does it follow the links or check if they work?',
       'No. It extracts the text of URLs and nothing more — no requests are made. Feed the ' +
       'resulting list into a link checker if you need to know which ones still resolve.'],
      ['Why are relative links missing?',
       'Because a relative path like /about is not a complete URL and cannot be resolved without ' +
       'knowing the page it came from. Only absolute http and https addresses are matched.'],
      ['Can I extract links from a web page?',
       'Paste the page\'s HTML source rather than the rendered text — use view-source or copy ' +
       'from your browser\'s developer tools. Copying what you see on screen gives you the link ' +
       'text, not the addresses behind it.'],
    ],
  },

  // ── JSON ──────────────────────────────────────────────────────────────────────
  'json-to-typescript': {
    intro:
      'Generates TypeScript interfaces from a sample JSON object, naming nested objects and ' +
      'typing arrays. It saves the tedious part of consuming an API you have a response from ' +
      'and no types for — as a starting point you then correct.',
    sections: [
      {
        h: 'What a single sample can and cannot tell you',
        p: 'Types are inferred from one example, so the result describes that example rather than ' +
           'the API. A field that happened to be null in your sample is typed null; a field the ' +
           'server sometimes omits is typed as required; a number that is usually an integer but ' +
           'occasionally a float is just number, which is fine, while an id that is sometimes a ' +
           'string and sometimes a number will be typed from whichever you happened to catch. ' +
           'Generate from a response with every optional field populated, then go through and mark ' +
           'the optional ones with a question mark yourself.',
      },
      {
        h: 'Arrays are typed from their first element',
        p: 'An array of objects produces an interface named after the key with Item appended, built ' +
           'from element zero. If later elements carry fields the first does not, those fields are ' +
           'missing from the type — and TypeScript will then reject perfectly valid code that reads ' +
           'them. This is the commonest correction needed. An empty array cannot be inspected at ' +
           'all, so it becomes unknown[], which is honest and needs replacing by hand.',
      },
      {
        h: 'Keys that are not identifiers',
        p: 'JSON keys can contain hyphens, spaces and leading digits; TypeScript property names ' +
           'cannot. Those keys are emitted quoted — "content-type": string — which is valid ' +
           'TypeScript and accessed with bracket notation rather than a dot. If you control the API, ' +
           'this is a good argument for camelCase keys; if you do not, consider a mapping layer at ' +
           'the boundary so the awkward names do not spread through your codebase.',
      },
      {
        h: 'Generated types are not validation',
        p: 'A TypeScript interface disappears at compile time. It tells your editor what to expect; ' +
           'it does nothing at runtime, so a server that changes its response shape will produce an ' +
           'application that type-checks perfectly and breaks anyway. For data crossing a network ' +
           'boundary, pair the type with a runtime validator such as Zod or Valibot — or define the ' +
           'schema there and derive the type from it, which keeps the two from drifting apart.',
      },
    ],
    steps: [
      'Paste a representative JSON response — ideally one with every optional field present.',
      'Set the root interface name.',
      'Copy the generated interfaces.',
      'Mark optional fields with ?, widen any union types, and check arrays whose elements ' +
       'vary.',
    ],
    notes: [
      'Nested objects become their own named interfaces; arrays of objects get an Item suffix.',
      'Keys that are not valid TypeScript identifiers are quoted automatically.',
      'An empty array becomes unknown[], and a null value becomes null — both need a human ' +
       'decision.',
    ],
    faq: [
      ['How do I mark fields as optional?',
       'By hand, with a question mark: name?: string. A single sample cannot reveal which fields ' +
       'the server sometimes omits, so no generator can infer this correctly. If you have ' +
       'several responses, the fields that differ between them are your optional ones.'],
      ['Why is my array typed from only the first item?',
       'Because that is the only element inspected. If later objects in the array carry extra ' +
       'fields, add them to the generated interface — marked optional if they are not always ' +
       'present.'],
      ['Should I use interfaces or types?',
       'Either works here. Interfaces can be merged and extended, which suits object shapes; ' +
       'type aliases handle unions and mapped types, which interfaces cannot. For API responses ' +
       'the difference rarely matters — consistency within a codebase matters more.'],
    ],
  },

  // ── CSS ───────────────────────────────────────────────────────────────────────
  'px-to-rem-converter': {
    intro:
      'Converts pixels to rem and back against a configurable root font size, with a batch mode ' +
      'for converting a whole spacing scale at once. The reason to bother is accessibility: rem ' +
      'respects the reader\'s own font-size setting and px does not.',
    sections: [
      {
        h: 'Why rem matters more than it looks',
        p: 'A rem is relative to the root font size, which the browser sets to 16px by default and ' +
           'the user can change in their browser settings. Someone who has set their default to 20px ' +
           'because they find 16 hard to read gets your whole interface scaled up if you sized it in ' +
           'rem, and gets nothing at all if you sized it in px. That setting is the main ' +
           'accessibility control browsers expose for text, and px silently overrides it. Zoom still ' +
           'works either way, but zoom scales everything including layout; the font-size preference ' +
           'is the one that just makes text bigger.',
      },
      {
        h: 'rem, em and the compounding trap',
        p: 'rem is always relative to the root. em is relative to the current element\'s font size, ' +
           'so it compounds: a list item at 0.9em inside a list at 0.9em inside a section at 0.9em ' +
           'is 0.729 of the base, and nested menus shrink to nothing. Use rem for font sizes and ' +
           'spacing so values stay predictable, and reserve em for things that should scale with ' +
           'their own element — padding inside a button that should grow with the button\'s text, or ' +
           'a letter-spacing value.',
      },
      {
        h: 'Keep 16 as the root, and divide by it',
        p: 'There was a fashion for setting html { font-size: 62.5% } to make the root 10px so ' +
           '1.6rem means 16px. It makes the arithmetic easier and breaks the accessibility benefit ' +
           'for anyone who has changed their default, because you have overridden their setting with ' +
           'a percentage of it. Leave the root alone and divide by 16: 24px is 1.5rem, 12px is ' +
           '0.75rem, 32px is 2rem. Most spacing scales are multiples of 4 or 8, which divide ' +
           'cleanly.',
      },
      {
        h: 'What should stay in pixels',
        p: 'Not everything benefits from scaling. Hairline borders look wrong at 0.0625rem and ' +
           'should stay 1px. Media query breakpoints are conventionally written in px or em, and em ' +
           'breakpoints behave differently from rem ones because media queries ignore the root ' +
           'element entirely. Shadow offsets, tiny radii and anything that is a visual detail rather ' +
           'than a measure of text can stay in px without harming anyone.',
      },
    ],
    steps: [
      'Set the root font size — 16px unless you have deliberately changed it.',
      'Enter a pixel value to get rem, or a rem value to get pixels.',
      'Use the batch field to convert a whole spacing scale in one go.',
    ],
    notes: [
      'The browser default root is 16px; 1rem is 16px, 1.5rem is 24px, 0.75rem is 12px.',
      'rem ignores the font size of ancestor elements; em does not, and compounds when nested.',
      'Media queries are not affected by the root font size, so em and rem behave identically ' +
       'there.',
    ],
    faq: [
      ['What is 16px in rem?',
       '1rem, at the default root size. The conversion is simply pixels divided by the root: ' +
       '24px is 1.5rem, 12px is 0.75rem, 32px is 2rem.'],
      ['Should I use rem or em?',
       'rem for font sizes and layout spacing, because it is predictable and does not compound. ' +
       'em where something should scale relative to its own element\'s text — padding inside a ' +
       'button, or an icon sized to match adjacent type.'],
      ['Is it bad to set the root font size to 62.5%?',
       'It makes the maths tidier and costs you the accessibility benefit, because you have ' +
       'rescaled whatever default the user chose. Leave the root at the browser default and ' +
       'divide by 16 — a converter removes the only real objection to doing it properly.'],
    ],
  },

  // ── ENCODERS ──────────────────────────────────────────────────────────────────
  'url-encode': {
    intro:
      'Percent-encodes text so it can travel safely in a URL — spaces, ampersands, slashes, ' +
      'accented letters and anything else outside the permitted ASCII set. Essential when you ' +
      'are building a query string or passing one URL inside another.',
    sections: [
      {
        h: 'Reserved characters are the point',
        p: 'A URL\'s punctuation carries meaning: ? starts the query, & separates parameters, = joins ' +
           'a key to its value, # begins the fragment, / separates path segments. When those ' +
           'characters appear inside a *value* rather than as structure, they must be encoded or the ' +
           'URL is misread — a search term containing an ampersand silently becomes two parameters. ' +
           'That is the single most common URL bug, and it is why you encode each parameter value ' +
           'individually rather than encoding the finished URL.',
      },
      {
        h: 'encodeURIComponent, not encodeURI',
        p: 'JavaScript has two functions and picking the wrong one is the usual mistake. ' +
           'encodeURIComponent escapes everything that is not unreserved, including / ? & = # — ' +
           'which is what you want for a value going into a parameter. encodeURI leaves the ' +
           'structural characters alone because it is meant for escaping a whole URL that is already ' +
           'assembled. Use encodeURIComponent on each value, then join them with the & and = ' +
           'yourself.',
      },
      {
        h: 'Spaces: %20 or +',
        p: 'Both appear, and they are not interchangeable. %20 is correct anywhere in a URL. The ' +
           'plus sign means a space only in a query string, as a legacy of HTML form encoding, and ' +
           'is a literal plus everywhere else — including in a path segment. Encoding a value ' +
           'containing a genuine plus, such as a phone number or a base64 string, is exactly where ' +
           'this bites: encode it as %2B or it will arrive as a space.',
      },
      {
        h: 'Encoding is per-byte, and UTF-8',
        p: 'Each character outside the safe set becomes one or more percent groups, one per UTF-8 ' +
           'byte. An accented Latin letter is two groups; most Asian scripts three; an emoji four. ' +
           'So a short non-English search term can produce a surprisingly long URL, and URL length ' +
           'limits — around 2,000 characters in practice — arrive sooner than the character count ' +
           'suggests.',
      },
    ],
    steps: [
      'Paste the text or value you want to encode.',
      'Copy the encoded result into your query string or path.',
      'Encode each parameter value separately — never the assembled URL.',
    ],
    notes: [
      'Unreserved characters (A–Z, a–z, 0–9, - . _ ~) are never encoded.',
      'Encode a literal plus sign as %2B if it might land in a query string.',
      'Encoding runs in your browser; values are not transmitted.',
    ],
    faq: [
      ['What is the difference between encodeURI and encodeURIComponent?',
       'encodeURIComponent escapes the structural characters (/ ? & = #) as well, which is what ' +
       'a parameter value needs. encodeURI leaves them intact because it is for a complete URL. ' +
       'Using encodeURI on a value is the classic cause of parameters splitting unexpectedly.'],
      ['Should a space be %20 or a plus sign?',
       '%20 is always correct. A plus means a space only in a query string, and is a literal ' +
       'plus in a path. If your value might contain a real plus sign, encode it as %2B.'],
      ['Do I need to encode a URL I am putting in a parameter?',
       'Yes, and fully. A URL contains :, /, ? and & — all structural characters that will be ' +
       'read as part of the outer URL otherwise. Encode the whole inner URL as a single value; ' +
       'that is why redirect parameters look like a wall of %3A and %2F.'],
    ],
  },

  // ── HASH ──────────────────────────────────────────────────────────────────────
  'sha1-hash': {
    intro:
      'Generates a SHA-1 digest — 40 hexadecimal characters — using the browser\'s own ' +
      'cryptography engine. SHA-1 is broken for anything an adversary can influence, and still ' +
      'in daily use everywhere from Git to legacy APIs, which is why the tool exists.',
    sections: [
      {
        h: 'How broken it is, precisely',
        p: 'Collision resistance is gone. Google and CWI demonstrated the first practical collision ' +
           'in 2017 with SHAttered — two different PDFs with the same SHA-1 — and the 2020 SHA-1 is ' +
           'a Shambles work produced a chosen-prefix collision, which is the dangerous kind, for ' +
           'around $45,000 of cloud compute. That cost has only fallen since. Preimage resistance is ' +
           'intact: you still cannot take a digest and find an input that produces it. So SHA-1 ' +
           'remains adequate for non-adversarial integrity checking and is unfit for signatures, ' +
           'certificates or anything where someone benefits from a forgery.',
      },
      {
        h: 'Where you still legitimately meet it',
        p: 'Git object names are SHA-1, which is why every commit hash is 40 hex characters. Git has ' +
           'known about this since 2017 and mitigates with collision detection, and SHA-256 ' +
           'repositories exist, but the transition is slow and most repositories today are still ' +
           'SHA-1. HMAC-SHA1 is used in TOTP and in older AWS request signing, and — importantly — ' +
           'is not broken, because HMAC\'s security does not rest on collision resistance. Legacy ' +
           'APIs and checksums for older archives make up most of the rest.',
      },
      {
        h: 'What replaced it',
        p: 'SHA-256 for new work, everywhere. Certificate authorities stopped issuing SHA-1 ' +
           'certificates in 2016 and browsers stopped accepting them in 2017. NIST formally ' +
           'deprecated SHA-1 in 2022 with a 2030 end date for federal use. If you are choosing today ' +
           'there is no argument for SHA-1: SHA-256 is unbroken, widely supported and no slower in ' +
           'any way that matters.',
      },
    ],
    steps: [
      'Paste the text you want to hash.',
      'The 40-character digest appears immediately.',
      'Copy it, and compare the whole string case-insensitively when verifying.',
    ],
    notes: [
      'Output is always 160 bits — 40 hexadecimal characters.',
      'The digest of the empty string is da39a3ee5e6b4b0d3255bfef95601890afd80709.',
      'Computed with Web Crypto in your browser; nothing is transmitted.',
    ],
    faq: [
      ['Is SHA-1 still safe to use?',
       'Not for anything an attacker can influence — practical chosen-prefix collisions exist ' +
       'and are affordable. It is still fine for non-adversarial integrity checks and for HMAC, ' +
       'whose security does not depend on collision resistance. Use SHA-256 for anything new.'],
      ['Why does Git still use SHA-1?',
       'History and inertia. Git predates the practical attacks, and object names are woven ' +
       'through the format. Git added collision detection in 2017 that rejects the known attack ' +
       'patterns, and SHA-256 repositories are supported, but converting existing history is ' +
       'disruptive so most repositories remain SHA-1.'],
      ['How long is a SHA-1 hash?',
       '160 bits, written as 40 hexadecimal characters. That length is the quickest way to tell ' +
       'a SHA-1 digest from an MD5 (32 characters) or a SHA-256 (64).'],
    ],
  },

  // ── COLOR ─────────────────────────────────────────────────────────────────────
  'image-colors': {
    intro:
      'Extracts the dominant colours from an image and gives you their hex values — useful for ' +
      'building a palette from a photograph, matching a design to a product shot, or pulling ' +
      'brand colours out of a logo you have only as a picture.',
    sections: [
      {
        h: 'How dominant colours are found',
        p: 'The image is drawn to a canvas, sampled pixel by pixel, and the colours are grouped into ' +
           'clusters so that near-identical shades count as one. Without that grouping a photograph ' +
           'returns thousands of distinct values, since a gradient of sky is a different colour in ' +
           'every pixel. The clusters are then ranked by how much of the image they cover, which is ' +
           'why a large flat background usually dominates the result even when it is the least ' +
           'interesting colour in the picture.',
      },
      {
        h: 'What you get is not the designer\'s original value',
        p: 'A colour sampled from a JPEG has been through lossy compression, which shifts pixel ' +
           'values especially near edges, and through whatever colour profile the file carries. A ' +
           'logo screenshotted from a website has additionally been through the browser\'s rendering ' +
           'and possibly a scaling step. The result is close, and it is not the brand\'s specified ' +
           'hex. For brand work, get the value from the guidelines; use extraction for inspiration ' +
           'and for matching to an image you are actually displaying.',
      },
      {
        h: 'Turning extracted colours into a usable palette',
        p: 'The dominant colours of a photograph are rarely a good interface palette on their own — ' +
           'they tend to cluster in lightness and saturation, because that is what makes a ' +
           'photograph look coherent. Take one or two as your accent, then build neutrals separately ' +
           'and check every text pairing for contrast. A palette derived from an image looks ' +
           'harmonious precisely because its colours are close together, which is the opposite of ' +
           'what text readability needs.',
      },
    ],
    steps: [
      'Choose an image, or drop one onto the page.',
      'Read the extracted colours and their share of the image.',
      'Copy the hex values you want, then check any text pairing for contrast.',
    ],
    notes: [
      'Large flat areas dominate the result — crop to the region you care about for a better ' +
       'sample.',
      'Values from a JPEG are approximate, because compression shifts pixels near edges.',
      'The image is processed in your browser and never uploaded.',
    ],
    faq: [
      ['Why are the extracted colours slightly different from the original design?',
       'Lossy compression, colour profiles and any scaling the image has been through all shift ' +
       'pixel values. The extracted colour is what is in the file, which is close to but not ' +
       'identical to the value the designer specified. Use the brand guidelines when exactness ' +
       'matters.'],
      ['How do I get better colours from a photograph?',
       'Crop to the part you actually want. Whole-image extraction is dominated by whatever ' +
       'covers the most area, usually a background or a sky, so cropping to the subject gives a ' +
       'far more useful result.'],
      ['Can I use these colours directly as my site palette?',
       'As a starting point. Colours pulled from one image tend to sit close together in ' +
       'lightness, which looks harmonious and fails contrast requirements for text. Take an ' +
       'accent or two, build your neutrals separately, and check every text pair against WCAG.'],
    ],
  },

  // ── IMAGES ────────────────────────────────────────────────────────────────────
  'placeholder-image': {
    intro:
      'Generates a placeholder image at any dimensions, with the size labelled on it, as a PNG ' +
      'you can download. For wireframes, layout testing and mockups where you need the shape of ' +
      'an image without the image.',
    sections: [
      {
        h: 'Why generate rather than use a service',
        p: 'The familiar placeholder services work by URL, which means every mockup carries an ' +
           'external dependency: the images vanish when the service goes down, when it changes its ' +
           'URL format, or when the file is opened offline or behind a firewall. Several popular ' +
           'ones have closed over the years and broken years of archived mockups. A generated PNG ' +
           'sits in your project and keeps working. It also keeps client work private, since no ' +
           'request is made carrying your dimensions or your page\'s referrer.',
      },
      {
        h: 'Placeholders reveal layout bugs that real images hide',
        p: 'The label showing the dimensions is the useful part: when a 400×300 placeholder renders ' +
           'at 300×300, you can see the distortion immediately, where a photograph would just look ' +
           'slightly off. Test with the aspect ratios you will actually receive rather than the ones ' +
           'you designed for — users upload portrait phone photos into slots designed for landscape ' +
           'hero images, and the layout that only works at 16:9 fails on the first real upload.',
      },
      {
        h: 'What to check while the placeholders are in',
        p: 'Set explicit width and height attributes so the browser reserves space before the image ' +
           'loads — without them the page reflows as images arrive, which is what Cumulative Layout ' +
           'Shift measures and penalises. Check the alt text is written, not left empty or filled ' +
           'with the filename. And decide the object-fit behaviour now: cover crops, contain ' +
           'letterboxes, and the wrong choice is much more obvious in a placeholder than in a ' +
           'photograph.',
      },
    ],
    steps: [
      'Set the width and height you need.',
      'Generate and download the PNG.',
      'Drop it into your mockup with explicit width and height attributes.',
    ],
    notes: [
      'The dimensions are drawn on the image, which makes scaling problems visible at a glance.',
      'Generated locally as a PNG — no external service and no network request.',
      'Use the aspect ratios you expect to receive, not only the ones you designed for.',
    ],
    faq: [
      ['Why not just use a placeholder URL service?',
       'Because it is an external dependency in your mockup. Those services change URL formats ' +
       'and close down, breaking archived work, and the images do not load offline or behind a ' +
       'strict firewall. A downloaded PNG keeps working.'],
      ['What size placeholder should I use?',
       'The size the real image will be, at the density you will serve it — so double the CSS ' +
       'dimensions if you are targeting high-DPI screens. Testing at the wrong size hides both ' +
       'scaling artefacts and layout problems.'],
      ['Do placeholder images affect page speed testing?',
       'Yes, and usefully: a generated PNG of the right dimensions reserves the same layout ' +
       'space as the real image, so layout-shift measurements are meaningful. Its file size will ' +
       'differ from a real photograph, so treat loading-time figures as provisional until the ' +
       'real assets are in.'],
    ],
  },

  // ── FANCY ─────────────────────────────────────────────────────────────────────
  'small-caps': {
    intro:
      'Converts text to Unicode small capital letters — ᴛʜᴇsE ʀᴇᴀᴅ ʟɪᴋᴇ ᴛʜɪs — for bios, ' +
      'headings and usernames. Real characters rather than a font, so the styling survives copy ' +
      'and paste.',
    sections: [
      {
        h: 'The alphabet is incomplete, and always will be',
        p: 'These characters come from the phonetic extensions blocks, where linguists needed small ' +
           'capitals to notate specific sounds. Unicode encoded the ones the International Phonetic ' +
           'Alphabet uses and no others, so there is no small-capital Q or X — those letters fall ' +
           'back to their ordinary forms and the result is visibly inconsistent. Every small-caps ' +
           'generator has this gap because the characters genuinely do not exist, not because the ' +
           'tool is incomplete.',
      },
      {
        h: 'Typographic small caps are a different thing entirely',
        p: 'Real small caps are a feature of the font: proper small capitals are drawn with the same ' +
           'stroke weight as lowercase so they sit evenly in a line of text. Unicode small capitals ' +
           'are borrowed glyphs of varying design, often lighter and inconsistently sized, which is ' +
           'why they look slightly wrong in a run of text. On the web the correct approach is ' +
           'font-variant-caps: small-caps, which asks the font for its own small capitals — use that ' +
           'where you control the CSS, and these characters only where you do not, such as a social ' +
           'media bio.',
      },
      {
        h: 'The usual Unicode-styling trade',
        p: 'As with every character-substitution style: unsearchable, because small capitals do not ' +
           'match ordinary letters in search or Ctrl+F, and awkward for screen readers, which may ' +
           'announce them by their phonetic names. Fine for a decorative line; wrong for your name, ' +
           'your call to action, or anything a person needs to find. Some platforms also reject ' +
           'these blocks in usernames while allowing them in display names and bios.',
      },
    ],
    steps: [
      'Type or paste your text.',
      'The small-caps version appears immediately.',
      'Copy it and paste it where you want it.',
    ],
    notes: [
      'There is no small-capital Q or X in Unicode — those letters stay as they are.',
      'For a web page, prefer the CSS font-variant-caps: small-caps, which uses the font\'s real ' +
       'small capitals.',
      'Unsearchable and read out oddly by screen readers — decorative use only.',
    ],
    faq: [
      ['Why do some letters not convert?',
       'Because Unicode has no small-capital form for them. The characters come from phonetic ' +
       'notation blocks, which cover only the letters the IPA needed — Q and X among the ' +
       'missing. Nothing can be done about it short of the standard adding them.'],
      ['Is this the same as CSS small caps?',
       'No. font-variant-caps: small-caps asks the font to render real small capitals, properly ' +
       'weighted and spaced, while leaving your text as ordinary searchable letters. That is ' +
       'strictly better wherever you control the CSS. These Unicode characters exist for places ' +
       'where you cannot, such as a social media profile.'],
      ['Will small caps work in my Instagram bio?',
       'Yes, bios and captions handle them. Usernames are more often restricted. Keep any ' +
       'keyword you want found in plain text, since styled characters are invisible to search.'],
    ],
  },

  // ── CONTENT ───────────────────────────────────────────────────────────────────
  'business-name-gen': {
    intro:
      'Generates business name candidates from a keyword and a style — compound words, invented ' +
      'words, prefixes and suffixes. It is a divergence tool: its job is to get fifty options ' +
      'in front of you so the good one has something to stand out against.',
    sections: [
      {
        h: 'The check that matters comes before you fall in love',
        p: 'A name you cannot own is not a name. Before getting attached, check: the domain in the ' +
           'extensions you actually want; the trademark registers in every country you will trade in ' +
           '(the USPTO, the UKIPO, the EUIPO and India\'s IP India all search free); the company ' +
           'register where you will incorporate; and the handles on the platforms you will use. A ' +
           'name that fails any of those will cost far more to abandon later than to reject now. ' +
           'Doing this in an evening is normal; skipping it and rebranding in year two is expensive.',
      },
      {
        h: 'What separates a workable name from a clever one',
        p: 'It should survive being said aloud down a phone line without spelling it out. It should ' +
           'not be confusable with an existing company in your sector, which is both a trademark ' +
           'problem and a marketing one. It should not lock you in — a name naming your first ' +
           'product ages badly when the second one arrives, and a name containing a city stops you ' +
           'moving. And it should mean nothing unfortunate in the other languages your customers ' +
           'speak, which is a cheap check and a famous category of mistake.',
      },
      {
        h: 'Descriptive, suggestive or invented',
        p: 'Descriptive names say what you do and are easy to understand and nearly impossible to ' +
           'trademark, because you cannot stop competitors describing themselves accurately. ' +
           'Suggestive names hint at a benefit and are the usual sweet spot — protectable, and they ' +
           'still tell people something. Invented names are the most defensible and the most ' +
           'expensive, since you have to teach the market what the word means before it carries any ' +
           'meaning at all. Pick deliberately according to how much marketing budget you have.',
      },
      {
        h: 'Use the list as raw material',
        p: 'Generated names are combinatorial, and it shows — nobody should ship one unedited. Their ' +
           'value is in the collisions: a prefix from one and a root from another, or a word that ' +
           'reminds you of something better. Generate a lot, keep ten, sleep on it, read them aloud ' +
           'to someone who does not know your business, and see which one they remember the next ' +
           'day. That last test is worth more than any amount of deliberation.',
      },
    ],
    steps: [
      'Enter a keyword describing what you do.',
      'Pick a style and generate a batch.',
      'Shortlist ten, then check domains, trademarks and handles before narrowing further.',
      'Say the survivors aloud and see which one someone remembers tomorrow.',
    ],
    notes: [
      'Nothing here is checked for availability — domain, trademark and handle checks are ' +
       'separate and essential.',
      'Shorter names are easier to say, spell and remember, and harder to find available.',
      'Avoid names tied to one product, one city or one technology unless you mean to stay ' +
       'there.',
    ],
    faq: [
      ['Are generated business names free to use?',
       'The generator does not create any rights, and it does not check for existing ones. A ' +
       'generated name may already be a registered trademark, a registered company or a taken ' +
       'domain. Search the trademark registers for your markets and your company register before ' +
       'committing — all of them offer free searches.'],
      ['How do I check whether a business name is taken?',
       'Four separate checks: your national company register, the trademark databases for every ' +
       'country you will trade in, domain availability in the extensions you want, and social ' +
       'handles. A name can be free on one and taken on another, and trademark is the one with ' +
       'teeth.'],
      ['Does my business name need to match my domain?',
       'Exactly matching is ideal and increasingly hard. A close variant is fine — adding the ' +
       'product category, or using a newer extension — as long as it is easy to say aloud and ' +
       'hard to mistype. What is not fine is a domain people will consistently get wrong, ' +
       'because every piece of word-of-mouth marketing then leaks.'],
    ],
  },

  // ── DEV ───────────────────────────────────────────────────────────────────────
  'regex-tester': {
    intro:
      'Tests a regular expression against sample text live, highlighting every match and its ' +
      'capture groups as you type. Building a pattern against real input is the only way to get ' +
      'one right, and far faster than guessing and re-running your program.',
    sections: [
      {
        h: 'The flags change what the pattern means',
        p: 'g finds every match rather than stopping at the first, and is what you want for testing. ' +
           'i ignores case. m makes ^ and $ match at each line rather than only at the start and end ' +
           'of the whole string, which is the flag people forget when a multi-line pattern silently ' +
           'matches nothing. s makes the dot match newlines too, which it otherwise does not — the ' +
           'usual reason a pattern works on one line and fails across two. u enables proper Unicode ' +
           'handling, which you need for property escapes and for matching characters outside the ' +
           'basic plane.',
      },
      {
        h: 'Greedy, lazy, and the classic HTML mistake',
        p: 'Quantifiers are greedy by default: .* takes as much as it can and then backtracks. So ' +
           '<.*> against <b>bold</b> matches the entire string rather than just <b>, because the ' +
           'greedy .* runs to the end and gives back only enough to find a final >. Adding a ' +
           'question mark makes it lazy — <.*?> stops at the first > and matches <b>. Better still, ' +
           'be explicit about what you are not matching: <[^>]*> is faster and cannot run away.',
      },
      {
        h: 'Capture groups and lookarounds',
        p: 'Parentheses capture, so (\\d{4})-(\\d{2}) gives you the year and month separately, ' +
           'available as $1 and $2 in a replacement. (?:...) groups without capturing, which keeps ' +
           'your group numbers tidy. Named groups — (?<year>\\d{4}) — are more readable and survive a ' +
           'pattern being edited. Lookahead (?=...) and lookbehind (?<=...) assert that something is ' +
           'or is not there without consuming it, which is how you match a price only when it ' +
           'follows a currency symbol without swallowing the symbol.',
      },
      {
        h: 'Catastrophic backtracking is a real denial-of-service',
        p: 'Nested quantifiers over overlapping alternatives — (a+)+$ is the textbook example — can ' +
           'take exponential time on a string that nearly matches. A 30-character input can hang a ' +
           'server for minutes. Real outages have been caused by exactly this, including a ' +
           'well-known Cloudflare incident in 2019. If a pattern is slow here on a short string, it ' +
           'will be catastrophic on a long one: rewrite it to avoid nested quantifiers, and never ' +
           'run a user-supplied regex on a server.',
      },
    ],
    steps: [
      'Type your pattern, without the surrounding slashes.',
      'Set the flags — g for all matches, i for case-insensitive, m for multi-line.',
      'Paste realistic test text, including the awkward cases you expect.',
      'Check the highlighted matches and capture groups, then adjust.',
    ],
    notes: [
      'Syntax here is JavaScript\'s; other languages differ, notably in lookbehind support and ' +
       'Unicode escapes.',
      'An invalid pattern is reported rather than silently matching nothing.',
      'Test with input that should NOT match as well as input that should — most regex bugs are ' +
       'false positives.',
    ],
    faq: [
      ['Why does my pattern not match across lines?',
       'The dot does not match a newline by default — add the s flag. And ^ and $ match only at ' +
       'the start and end of the whole string unless you add the m flag, which makes them match ' +
       'at each line.'],
      ['What is the difference between greedy and lazy matching?',
       'Greedy quantifiers (*, +) take as much as possible and backtrack; lazy ones (*?, +?) ' +
       'take as little as possible and extend. For matching a single tag or quoted string, lazy ' +
       'is usually what you want — though a negated character class like [^>]* is both clearer ' +
       'and faster.'],
      ['Can I use a regex to parse HTML?',
       'For a quick one-off extraction from known, well-formed markup, sometimes. For anything ' +
       'general, no — HTML nesting is not a regular language, so no regex can handle it ' +
       'correctly. Use a parser; the browser\'s own DOMParser is built in.'],
    ],
  },

  // ── TEXT ──────────────────────────────────────────────────────────────────────
  'case-converter': {
    intro:
      'Converts text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, ' +
      'PascalCase, snake_case and kebab-case. The first four are for prose, the last four for ' +
      'code, and knowing which convention belongs where is most of the value.',
    sections: [
      {
        h: 'The programming cases, and where each is conventional',
        p: 'camelCase for JavaScript variables and functions, and for Java methods. PascalCase for ' +
           'classes and React components in nearly every language, and for TypeScript types. ' +
           'snake_case for Python variables and functions, database columns and JSON keys in many ' +
           'APIs. SCREAMING_SNAKE_CASE for constants and environment variables. kebab-case for URLs, ' +
           'CSS class names, HTML attributes and npm package names — it cannot be used for ' +
           'identifiers in most languages because the hyphen reads as minus.',
      },
      {
        h: 'Title Case is not one rule',
        p: 'Style guides disagree about which words to capitalise. AP style capitalises words of ' +
           'four letters or more; Chicago capitalises everything except articles, coordinating ' +
           'conjunctions and prepositions regardless of length; APA capitalises words of four ' +
           'letters or more plus all major words. All three capitalise the first and last word ' +
           'whatever it is. A converter applies one interpretation, so check headline capitalisation ' +
           'by hand if you are writing to a specific style guide.',
      },
      {
        h: 'Sentence case is winning for interfaces',
        p: 'Google, Apple and Microsoft all now specify sentence case for buttons, menus and ' +
           'headings in their design guidance. It reads faster, it avoids the Title Case questions ' +
           'above, and it translates better — many languages do not capitalise words mid-sentence at ' +
           'all, so a Title Case interface becomes inconsistent the moment it is localised. If you ' +
           'are deciding for a product rather than a document, sentence case is the safer default.',
      },
      {
        h: 'What conversion cannot recover',
        p: 'Converting to lowercase destroys information you cannot get back: NASA becomes nasa, and ' +
           'no amount of Title Casing turns it into NASA again. Acronyms, proper nouns and brand ' +
           'capitalisation such as iPhone or eBay all survive only if you avoid the round trip. ' +
           'Convert from the original wherever possible, and check the result for names the ' +
           'converter could not know about.',
      },
    ],
    steps: [
      'Paste your text.',
      'Pick the target case.',
      'Copy the result — and check any acronyms or proper nouns.',
    ],
    notes: [
      'Programming cases strip punctuation and spaces; prose cases preserve them.',
      'Converting to lowercase is lossy for acronyms and proper nouns — keep the original.',
      'Turkish is the classic locale trap: uppercasing i gives İ rather than I, which breaks ' +
       'case-insensitive comparison if you lowercase before comparing.',
    ],
    faq: [
      ['What is the difference between camelCase and PascalCase?',
       'Only the first letter. camelCase starts lowercase (userName) and PascalCase starts ' +
       'uppercase (UserName). By convention camelCase names variables and functions, and ' +
       'PascalCase names classes, types and React components.'],
      ['Which case should I use for URLs?',
       'kebab-case, lowercase. Hyphens are read as word separators by search engines where ' +
       'underscores may not be, and lowercase avoids the duplicate-content problem of /About and ' +
       '/about resolving as different pages.'],
      ['Should interface labels be Title Case or sentence case?',
       'Sentence case, by the current guidance of Google, Apple and Microsoft alike. It reads ' +
       'faster, sidesteps the disagreement between style guides, and localises better into ' +
       'languages that do not capitalise mid-sentence.'],
    ],
  },

  // ── JS ────────────────────────────────────────────────────────────────────────
  'js-formatter': {
    intro:
      'Reformats JavaScript with consistent indentation, spacing and line breaks, so minified ' +
      'or badly formatted code becomes readable. Useful for inspecting a bundle, tidying a ' +
      'snippet, or making sense of code pasted out of a chat.',
    sections: [
      {
        h: 'Formatting is not the same as unminifying',
        p: 'A formatter restores whitespace and line structure, which makes minified code readable ' +
           'but does not bring back what minification removed. Variable names stay as a, b and ' +
           '_0x3f: the original names are gone from the file and nothing can recover them. Comments ' +
           'are gone too. If the bundle ships a source map, that is the thing that genuinely ' +
           'restores the original — load it in your browser\'s developer tools rather than formatting ' +
           'the output.',
      },
      {
        h: 'Semicolons and automatic insertion',
        p: 'JavaScript inserts semicolons at line ends in most cases, which is why omitting them ' +
           'usually works. The exceptions bite: a line starting with ( or [ continues the previous ' +
           'line, so a statement followed by an immediately-invoked function or an array literal ' +
           'parses as a call or an index. That is why semicolon-free styles prefix such lines with ' +
           'one. Formatting does not change semantics — but it can make an existing ASI bug visible ' +
           'by putting the two statements on separate lines where you can see them.',
      },
      {
        h: 'Formatting in a project belongs in a tool, not a web page',
        p: 'For one-off inspection, a web formatter is exactly right. For a codebase, use Prettier ' +
           'or your editor\'s formatter with a committed configuration and a pre-commit hook, so ' +
           'everyone\'s output is identical and formatting never appears in a diff. The single ' +
           'biggest benefit of an automatic formatter is not prettiness — it is that code review ' +
           'stops containing arguments about style.',
      },
    ],
    steps: [
      'Paste your JavaScript.',
      'Read the formatted output.',
      'Copy it, or use a source map instead if you are trying to read a production bundle.',
    ],
    notes: [
      'Formatting changes whitespace only; it never changes what the code does.',
      'Minified variable names cannot be restored — only a source map recovers those.',
      'Syntax errors are reported rather than formatted around.',
    ],
    faq: [
      ['Can this recover the original source of a minified file?',
       'Only its shape. Indentation and line breaks come back; original variable names and ' +
       'comments do not, because minification deleted them from the file. A source map is the ' +
       'only thing that restores the real source.'],
      ['Does formatting change how my code runs?',
       'No. Only whitespace and line breaks change. The one thing to watch is that a file ' +
       'relying on automatic semicolon insertion has always been fragile — formatting can make ' +
       'an existing bug easier to spot, but it does not introduce one.'],
      ['Should I use this or Prettier?',
       'This for a quick look at a snippet. Prettier for a project, with the configuration ' +
       'committed and run on save or in a pre-commit hook, so formatting is consistent across ' +
       'the team and never shows up as diff noise.'],
    ],
  },
  'js-obfuscator': {
    intro:
      'Renames local variables and escapes string literals to make JavaScript harder to read at ' +
      'a glance. It is a deterrent against casual inspection, not protection — and it is worth ' +
      'being clear about which of those you are buying.',
    sections: [
      {
        h: 'Obfuscation cannot protect client-side code',
        p: 'Anything running in a browser is on the user\'s machine, and can be read, stepped through ' +
           'in a debugger and modified. Obfuscation raises the effort from seconds to perhaps an ' +
           'hour for someone motivated; there are automated deobfuscators that reverse the common ' +
           'transforms in one pass. So never obfuscate to hide an API key, a secret or a licence ' +
           'check — those must live on a server you control. Obfuscate to deter casual copying of ' +
           'logic you would rather not hand over, and accept that a determined reader will get it.',
      },
      {
        h: 'What this transformation actually does, and its limits',
        p: 'It renames declared variables to hexadecimal identifiers and rewrites string literals as ' +
           'escape sequences, which removes the two things a reader scans first: meaningful names ' +
           'and readable text. It works by pattern matching rather than parsing, which sets a real ' +
           'boundary: a name that also appears as an object property is left alone deliberately, ' +
           'because renaming a key without renaming every access to it would produce code that runs ' +
           'and silently returns undefined. Fewer renames, working output.',
      },
      {
        h: 'Test the output before you ship it',
        p: 'Any regex-based transformation of a language as context-dependent as JavaScript is ' +
           'approximate. Run the obfuscated file and exercise the paths that matter before deploying ' +
           'it, and keep the original in version control — the obfuscated form is a build artefact, ' +
           'not a source file. If you find yourself debugging the obfuscated output, you have ' +
           'already lost more time than the obfuscation was worth.',
      },
      {
        h: 'What to use for real projects',
        p: 'A proper obfuscator works on the parsed syntax tree rather than the text, so it can ' +
           'rename safely, flatten control flow, split strings into lookup arrays and insert ' +
           'anti-debugging traps. Bundlers already do the name-mangling part as a side effect of ' +
           'minification, which gets you most of the readability loss for free. The genuine answer ' +
           'to protecting logic remains the same: move it to the server.',
      },
    ],
    steps: [
      'Paste your JavaScript.',
      'Obfuscate, then copy the result.',
      'Run it and test the important paths before deploying — always keep the original.',
    ],
    notes: [
      'Names also used as object properties are skipped on purpose, to keep the output working.',
      'String escaping handles characters beyond ASCII correctly, so non-English text survives.',
      'Obfuscated code is a build output — commit the source, not this.',
    ],
    faq: [
      ['Can obfuscated JavaScript be reversed?',
       'Yes. Automated deobfuscators undo the common transformations, and a formatter plus a ' +
       'debugger gets a person most of the way regardless. Obfuscation buys time against casual ' +
       'inspection and nothing against a determined reader.'],
      ['Is it safe to obfuscate an API key in my frontend?',
       'No, and this is the most important thing on the page. Anything in the browser is ' +
       'retrievable — if not from the source then from the network tab when it is used. Keys ' +
       'belong on a server that proxies the request.'],
      ['Will obfuscating slow my site down?',
       'Slightly. Escaped strings and longer identifiers grow the file, and heavier obfuscators ' +
       'add runtime indirection that costs real performance. Minification shrinks and mangles at ' +
       'the same time, which is usually the better trade.'],
    ],
  },

  // ── IMAGES ────────────────────────────────────────────────────────────────────
  'image-cropper': {
    intro:
      'Crops an image to a selection or a fixed aspect ratio, entirely in your browser. Useful ' +
      'for profile pictures, thumbnails, and trimming a screenshot before sharing it.',
    sections: [
      {
        h: 'Cropping removes pixels; it does not resize them',
        p: 'Cropping keeps a rectangle of the original at its original resolution and discards the ' +
           'rest, so the result has fewer pixels but the same detail per pixel. Resizing changes the ' +
           'pixel count of the whole image. That distinction matters when you crop tightly and then ' +
           'display large: a 200×200 crop blown up to 800×800 is soft, because the detail was never ' +
           'captured. Crop first, then check the remaining dimensions are enough for where it will ' +
           'be shown.',
      },
      {
        h: 'The aspect ratios worth knowing',
        p: '1:1 for profile pictures on nearly every platform. 16:9 for video thumbnails and slides. ' +
           '4:5 for the tallest image Instagram will show in the feed without cropping it further. ' +
           '1.91:1 for link preview cards, which is why Open Graph images are 1200×630. 3:2 for most ' +
           'camera output. Choosing the ratio before you crop saves the platform choosing it for ' +
           'you, usually by cutting off exactly the part you cared about.',
      },
      {
        h: 'Check what happens to the metadata',
        p: 'A photograph carries EXIF data: camera model, timestamp, settings, and often GPS ' +
           'coordinates. Re-encoding through a canvas discards it, which is a privacy improvement — ' +
           'a photo shared straight from a phone can tell a stranger where it was taken. It also ' +
           'discards the orientation flag, which is why an image that looked upright in a photo ' +
           'viewer can appear rotated after processing: the flag was doing the rotating, and ' +
           'browsers now handle it, but older files still surprise people.',
      },
    ],
    steps: [
      'Choose your image.',
      'Drag to select the area, or pick a fixed aspect ratio.',
      'Check the resulting dimensions, then download.',
    ],
    notes: [
      'Cropping is lossless in the sense that kept pixels are unchanged, but the file is ' +
       're-encoded on save.',
      'EXIF metadata, including GPS location, is removed by the re-encode.',
      'The image is processed in your browser and never uploaded.',
    ],
    faq: [
      ['Does cropping reduce image quality?',
       'The pixels you keep are unchanged, but saving re-encodes the file. Save as PNG for a ' +
       'lossless result; a JPEG save applies another round of lossy compression on top of ' +
       'whatever the original already had.'],
      ['What size should a profile picture be?',
       'Square, and at least 400×400 — most platforms display around 200px but serve a larger ' +
       'file to high-density screens. Crop tighter than feels natural: profile pictures are ' +
       'usually displayed very small, and a face that fills the frame reads better than a full ' +
       'portrait.'],
      ['Is my photo uploaded anywhere?',
       'No. It is read and processed in your browser and the result is saved to your device. ' +
       'Nothing is transmitted, which also means the EXIF location data in the original never ' +
       'leaves your machine.'],
    ],
  },
  'image-to-pdf': {
    intro:
      'Combines images into a single PDF, one page per image, in the order you choose. The ' +
      'usual reason is that someone has asked for a document and you have photographs of one.',
    sections: [
      {
        h: 'Page size and orientation',
        p: 'Each image is placed on a page sized to fit it, or scaled to a standard page, depending ' +
           'on the option you choose. Mixing portrait and landscape photographs into a fixed page ' +
           'size leaves large margins on one or the other — usually acceptable for a document that ' +
           'will be read on screen, and worth thinking about if it will be printed. For a document ' +
           'that must look like a scan, use a consistent orientation and A4 or Letter throughout.',
      },
      {
        h: 'The output is a picture of a document, not a document',
        p: 'The resulting PDF contains images, so its text is not selectable, not searchable, and ' +
           'not copyable. Anyone receiving it cannot find a phrase in it, and automated systems ' +
           'cannot read it. If the recipient needs to extract the content, either send the original ' +
           'file or run the PDF through OCR afterwards. Many institutions specifically require ' +
           'searchable PDFs, and a photograph of a page will be rejected.',
      },
      {
        h: 'Photographing documents well',
        p: 'Flat, evenly lit and square-on. Shadows from your own hands are the usual problem, so ' +
           'light from the side rather than overhead. Fill the frame with the page, which both ' +
           'improves resolution and avoids the desk. Most phones have a document scanning mode that ' +
           'deskews and flattens the perspective, and its output is markedly better than a plain ' +
           'photograph — worth using before bringing the images here.',
      },
      {
        h: 'File size',
        p: 'Phone photographs are large: ten pages can easily exceed 40 MB, which many email systems ' +
           'and upload forms reject. Scale the images down before combining — a page of text is ' +
           'perfectly legible at around 1,500 pixels on the long edge, which is a fraction of what a ' +
           'modern phone camera produces. Doing it before the PDF is built is far more effective ' +
           'than trying to compress it afterwards.',
      },
    ],
    steps: [
      'Select your images, in the order you want the pages.',
      'Set the page size and orientation.',
      'Generate and download the PDF.',
    ],
    notes: [
      'Text in the resulting PDF is not selectable or searchable — it is a picture.',
      'Large photographs make large PDFs; resize before combining if the file has to be ' +
       'emailed.',
      'Everything runs in your browser, so identity documents and statements are not uploaded.',
    ],
    faq: [
      ['Will the text in my PDF be searchable?',
       'No. The pages are images, so the text cannot be selected, searched or copied. Run the ' +
       'result through OCR if the recipient needs the text, or send the original document if you ' +
       'still have it.'],
      ['How do I reduce the file size?',
       'Resize the images before combining them. A page of text is readable at about 1,500 ' +
       'pixels on the long edge, against the 4,000-plus a phone produces — that alone typically ' +
       'cuts the PDF by 80% or more.'],
      ['What image formats can I use?',
       'JPEG and PNG work everywhere. JPEG is the right choice for photographs of documents; PNG ' +
       'is better for screenshots and anything with sharp text or line art, where JPEG artefacts ' +
       'make small type look dirty.'],
    ],
  },

  // ── UNITS ─────────────────────────────────────────────────────────────────────
  'speed-converter': {
    intro:
      'Converts between metres per second, kilometres per hour, miles per hour, knots, feet per ' +
      'second, Mach and the speed of light. The two everyday questions are km/h to mph for ' +
      'driving and m/s to km/h for physics homework.',
    sections: [
      {
        h: 'The conversions worth memorising',
        p: 'm/s to km/h is multiply by 3.6, exactly — 3,600 seconds in an hour over 1,000 metres in ' +
           'a kilometre. km/h to mph is multiply by 0.621, or a useful mental shortcut: halve it and ' +
           'add a tenth, so 100 km/h becomes 50 + 10 = 60, against a true 62. Motorway speeds in ' +
           'Europe of 120 or 130 km/h are 75 and 81 mph. A knot is 1.852 km/h exactly, being one ' +
           'nautical mile per hour.',
      },
      {
        h: 'Mach is not a fixed speed',
        p: 'Mach 1 is the local speed of sound, which depends on air temperature — not on pressure ' +
           'or altitude directly, but on temperature, which falls with altitude. It is about 1,225 ' +
           'km/h at sea level at 15°C and around 1,062 km/h in the stratosphere. This converter uses ' +
           'the sea level figure. That is why an aircraft\'s Mach number and its ground speed are ' +
           'different numbers that pilots track separately, and why the sound barrier is easier to ' +
           'break high up.',
      },
      {
        h: 'Pace and speed are reciprocals',
        p: 'Runners and cyclists usually think in pace — minutes per kilometre or per mile — rather ' +
           'than speed. They are inverses: 12 km/h is 5:00 per km, and 10 km/h is 6:00 per km. The ' +
           'arithmetic is 60 divided by the speed, giving decimal minutes, so the 0.5 in 6.5 is ' +
           'thirty seconds and not fifty. Getting that wrong by treating the decimal as seconds is ' +
           'the most common mistake in race planning.',
      },
    ],
    steps: [
      'Enter the speed.',
      'Select its unit.',
      'Read every other unit at once.',
    ],
    notes: [
      'm/s to km/h is exactly ×3.6; a knot is exactly 1.852 km/h.',
      'Mach here is referenced to sea level at 15°C; the real figure falls with temperature.',
      'The speed of light is exactly 299,792,458 m/s — it is a definition, not a measurement.',
    ],
    faq: [
      ['How do I convert km/h to mph?',
       'Multiply by 0.6214. In your head, halve it and add ten percent: 100 km/h becomes 50 + 10 ' +
       '= 60 mph, close to the true 62. Going the other way, multiply mph by 1.609.'],
      ['What is Mach 1 in km/h?',
       'About 1,225 km/h at sea level at 15°C, and roughly 1,062 km/h at cruising altitude where ' +
       'the air is much colder. Mach is a ratio to the local speed of sound rather than a fixed ' +
       'speed, which is why the number changes with temperature.'],
      ['How do I convert speed to running pace?',
       'Divide 60 by the speed in km/h to get minutes per kilometre. 12 km/h gives 5.0, which is ' +
       '5:00 per km. Remember the decimal is a fraction of a minute, so 6.5 means 6:30, not ' +
       '6:50.'],
    ],
  },

  // ── COLOR ─────────────────────────────────────────────────────────────────────
  'hex-rgba': {
    intro:
      'Converts between hex colour notation and rgba(), including the alpha channel in both ' +
      'directions — eight-digit hex to rgba and back. Useful whenever a design tool gives you ' +
      'one form and your code wants the other.',
    sections: [
      {
        h: 'Eight-digit hex is alpha, and it is well supported',
        p: '#3B82F680 is the same colour as rgba(59, 130, 246, 0.5): the last two digits are the ' +
           'alpha channel, from 00 for fully transparent to FF for fully opaque. Every browser in ' +
           'current use supports it, so the old habit of converting to rgba() purely for ' +
           'transparency is no longer necessary. The one thing to watch is order: CSS puts alpha ' +
           'last, while some other ecosystems — notably Android — put it first, so #803B82F6 in an ' +
           'Android resource is the same colour written the other way round.',
      },
      {
        h: 'The alpha values worth knowing',
        p: 'FF is 100%, BF is 75%, 80 is 50%, 40 is 25%, 1A is 10% and 0D is 5%. The conversion is ' +
           'simply the percentage of 255 in hexadecimal, and those six cover most interface work: ' +
           'overlays, hover tints, disabled states and shadows. Note that CSS alpha is a decimal ' +
           'from 0 to 1, not a percentage, though modern CSS accepts a percentage too.',
      },
      {
        h: 'Transparency versus a solid blend',
        p: 'A semi-transparent colour composites against whatever is behind it, so the same value ' +
           'looks different on white and on a photograph. That is usually what you want for an ' +
           'overlay and usually not what you want for text, where you should compute the resulting ' +
           'blended colour and check *that* against the background for contrast — a contrast checker ' +
           'fed the transparent colour gives an optimistic answer. For a fixed background, blending ' +
           'to a solid hex also renders marginally faster and avoids the compositing entirely.',
      },
    ],
    steps: [
      'Enter a hex value, with or without alpha, or an rgba() string.',
      'Read the equivalent in the other notation.',
      'Copy whichever form your stylesheet or design tool expects.',
    ],
    notes: [
      'CSS puts alpha last in eight-digit hex; Android resources put it first.',
      '80 is 50% alpha, 1A is 10%, FF is opaque — the value is the percentage of 255.',
      'Check contrast on the blended result, not on the transparent colour.',
    ],
    faq: [
      ['How do I add transparency to a hex colour?',
       'Append two hex digits: #3B82F6 becomes #3B82F680 at about 50%. Every current browser ' +
       'supports eight-digit hex, so there is no need to convert to rgba() just for an alpha ' +
       'channel.'],
      ['What is 50% opacity in hex?',
       '80. The alpha byte is the percentage of 255, so 50% is 127.5 which rounds to 0x80. 75% ' +
       'is BF, 25% is 40 and 10% is 1A.'],
      ['Does a transparent colour affect accessibility contrast?',
       'Yes, and a contrast checker given the transparent value will be optimistic. Work out the ' +
       'colour that actually results once it composites over the background, and check that. ' +
       'Against a varying background, such as a photograph, check the worst case.'],
    ],
  },

  // ── MATH ──────────────────────────────────────────────────────────────────────
  'matrix-calc': {
    intro:
      'Adds, subtracts, multiplies and transposes matrices, and finds the determinant and ' +
      'inverse for square matrices. Enter each matrix as rows of numbers separated by spaces, ' +
      'one row per line.',
    sections: [
      {
        h: 'Matrix multiplication is not commutative, and the dimensions have to agree',
        p: 'AB and BA are generally different matrices, and frequently one of them is not even ' +
           'defined. To multiply, the number of columns in the first must equal the number of rows ' +
           'in the second, and the result takes the rows of the first and the columns of the second. ' +
           'This non-commutativity is not a quirk — it is the whole point. Matrices represent ' +
           'transformations, and rotating then scaling genuinely is not the same as scaling then ' +
           'rotating.',
      },
      {
        h: 'What the determinant tells you',
        p: 'Geometrically it is the factor by which the transformation scales area in two dimensions ' +
           'or volume in three. A determinant of 2 doubles areas; a determinant of −1 reflects ' +
           'without changing size. A determinant of zero means the transformation collapses space ' +
           'onto a lower dimension — a plane onto a line — and that is irreversible, which is ' +
           'exactly why a matrix with determinant zero has no inverse. Checking the determinant ' +
           'first tells you whether an inverse exists before you try to compute one.',
      },
      {
        h: 'Inverses, and why numerical code avoids them',
        p: 'The inverse undoes the transformation, and AA⁻¹ is the identity. It is the natural way ' +
           'to write the solution of a linear system as x = A⁻¹b — and it is not how numerical ' +
           'software actually solves one. Computing an explicit inverse is slower and less accurate ' +
           'than factorising and substituting, and for a matrix that is nearly singular the inverse ' +
           'contains enormous values that amplify rounding error. Useful for understanding and for ' +
           'small exact work; avoid it in code.',
      },
      {
        h: 'Where matrices show up',
        p: 'Computer graphics, where every rotation, scale and translation is a matrix and a ' +
           'pipeline composes them by multiplication. Solving systems of linear equations. Markov ' +
           'chains, where the matrix holds transition probabilities. Neural networks, which are ' +
           'largely matrix multiplications with a nonlinearity between them — the reason GPUs, built ' +
           'for graphics matrices, turned out to be the right hardware for machine learning.',
      },
    ],
    steps: [
      'Choose the matrix size and the operation.',
      'Enter each matrix as rows of numbers separated by spaces, one row per line.',
      'Read the result with the working shown.',
    ],
    notes: [
      'Multiplication requires the first matrix\'s column count to equal the second\'s row count.',
      'Only square matrices have a determinant or an inverse.',
      'A determinant of zero means the matrix is singular and cannot be inverted.',
    ],
    faq: [
      ['Why can I not multiply these two matrices?',
       'Their dimensions do not line up. The first matrix\'s number of columns must equal the ' +
       'second\'s number of rows. A 2×3 can multiply a 3×4 to give a 2×4; it cannot multiply ' +
       'another 2×3.'],
      ['What does a determinant of zero mean?',
       'The matrix is singular: it collapses space onto a lower dimension, so the transformation ' +
       'cannot be undone and no inverse exists. For a system of equations it means there is ' +
       'either no solution or infinitely many, never exactly one.'],
      ['Is AB the same as BA?',
       'Almost never. Matrix multiplication is not commutative, and often only one order is even ' +
       'defined. This reflects reality: composing two transformations in a different order gives ' +
       'a different result.'],
    ],
  },
  'factorial-calc': {
    intro:
      'Computes n! for whole numbers up to 20, showing the full multiplication. The limit is ' +
      'not arbitrary — 21! is the first factorial that cannot be represented exactly in a ' +
      'JavaScript number.',
    sections: [
      {
        h: 'Why it stops at 20',
        p: 'JavaScript numbers are IEEE-754 doubles, which hold integers exactly only up to 2⁵³, ' +
           'about 9.007 quadrillion. 20! is 2,432,902,008,176,640,000, comfortably inside that. 21! ' +
           'is 51,090,942,171,709,440,000, which is not — so a calculator that kept going would ' +
           'return confidently wrong digits. Refusing is better than lying. Beyond 20, exact ' +
           'factorials need arbitrary-precision arithmetic, which JavaScript provides through ' +
           'BigInt.',
      },
      {
        h: 'How fast it grows',
        p: 'Factorial growth outruns exponential growth. 10! is 3.6 million; 20! is 2.4 quintillion; ' +
           '70! already exceeds the number of atoms in the observable universe. This is why ' +
           'brute-force algorithms with factorial complexity are hopeless: the travelling salesman ' +
           'problem checked exhaustively over 20 cities is 20! routes, which at a billion per second ' +
           'takes 77 years. Over 25 cities it outlives the solar system.',
      },
      {
        h: 'Why 0! is 1',
        p: 'It looks like a convention and it is forced. The recurrence n! = n × (n−1)! with 1! = 1 ' +
           'requires 0! = 1. Combinatorially, n! counts the arrangements of n objects, and there is ' +
           'exactly one way to arrange nothing — the empty arrangement. It also makes the binomial ' +
           'coefficient formula work at its edges without special cases, which is the practical ' +
           'reason it is defined that way rather than left undefined.',
      },
      {
        h: 'Where factorials are used',
        p: 'Permutations and combinations, which is most of discrete probability. The binomial ' +
           'coefficient n!/(k!(n−k)!) counting how many ways to choose k from n. Taylor series, ' +
           'where factorials sit in every denominator. And the gamma function, which extends ' +
           'factorial to non-integers and gives the famous result that the factorial of a half is ' +
           'half the square root of pi.',
      },
    ],
    steps: [
      'Enter a whole number from 0 to 20.',
      'Read the result and the full multiplication.',
    ],
    notes: [
      '0! is 1, by definition and by necessity.',
      'The 20 limit is where exact integer representation ends in a double — beyond it, results ' +
       'would be silently wrong.',
      'Factorials of negative numbers are undefined; the gamma function extends to non-integers ' +
       'but not to negative integers.',
    ],
    faq: [
      ['Why can I not calculate 21 factorial?',
       'Because it exceeds the largest integer a JavaScript number represents exactly (2⁵³). The ' +
       'calculator would return a number that looks precise and is wrong in its final digits, so ' +
       'it declines instead. Exact values beyond 20! need arbitrary-precision arithmetic.'],
      ['What is 0 factorial?',
       '1. The recurrence relation requires it, and combinatorially there is exactly one way to ' +
       'arrange zero objects. It also keeps the binomial coefficient formula valid at its ' +
       'boundaries.'],
      ['How big does a factorial get?',
       'Extremely fast. 10! is 3.6 million, 20! is 2.4 quintillion, and 70! exceeds the ' +
       'estimated number of atoms in the observable universe. Factorial growth outpaces any ' +
       'exponential, which is why factorial-time algorithms are unusable beyond tiny inputs.'],
    ],
  },

  // ── IMAGES ────────────────────────────────────────────────────────────────────
  'qr-code-generator': {
    intro:
      'Generates a QR code from a URL, text, or anything else you can put in a string, with a ' +
      'choice of error-correction level, ready to download. Generated in your browser, so the ' +
      'content never reaches a server.',
    sections: [
      {
        h: 'Error correction is a genuine trade',
        p: 'QR codes use Reed-Solomon coding so they still scan when damaged. Level L recovers about ' +
           '7% of the code, M 15%, Q 25% and H 30%. Higher correction means more data modules, so ' +
           'the code becomes denser at the same physical size and each module smaller — which makes ' +
           'it harder to scan, not easier, unless you print it larger. M is the sensible default. Go ' +
           'to H only when you are placing a logo over the centre, which is exactly what that ' +
           'redundancy pays for, or when the code will be printed on something that gets handled.',
      },
      {
        h: 'Size, quiet zone and contrast',
        p: 'The specification requires a clear margin of four modules around the code — the quiet ' +
           'zone — and scanners genuinely fail without it, which is the commonest reason a code ' +
           'printed flush against a design element will not read. As a rule of thumb the code should ' +
           'be at least a tenth of the scanning distance: 3 cm for arm\'s length, 30 cm for a poster ' +
           'read from three metres. Keep it dark-on-light; inverted codes work on some scanners and ' +
           'not others, and there is no reason to find out which.',
      },
      {
        h: 'Shorter content scans more easily',
        p: 'The amount of data determines the version, and higher versions pack in more, smaller ' +
           'modules. A 25-character URL produces a sparse, forgiving code; a 300-character one ' +
           'produces a dense grid that needs a good camera and steady hands. If your URL is long, ' +
           'shorten it first — the gain in scannability is substantial and immediately visible in ' +
           'the code\'s appearance. Numeric-only content packs far more efficiently than mixed case ' +
           'and punctuation.',
      },
      {
        h: 'QR codes are not static once printed, unless you make them so',
        p: 'The code encodes exactly what you put in it and cannot be changed afterwards — a printed ' +
           'code pointing at a URL points there forever. If the destination might change, encode a ' +
           'URL you control that redirects, so you can repoint it without reprinting. That is the ' +
           'entire product some QR services sell, and you can do it with any short link you own. Be ' +
           'aware of the other side of this: a QR code gives a person no way to see where it leads ' +
           'before they tap, which is why malicious codes stuck over legitimate ones have become a ' +
           'common scam.',
      },
    ],
    steps: [
      'Enter the URL or text to encode.',
      'Pick an error-correction level — M unless you are adding a logo.',
      'Generate, check it scans with your own phone, then download.',
    ],
    notes: [
      'Always leave the quiet zone — four modules of clear margin on every side.',
      'Test the printed size at the distance people will actually scan from.',
      'Generated locally; the URL or text you encode is not sent anywhere.',
    ],
    faq: [
      ['Do QR codes expire?',
       'The code itself never expires — it is a fixed pattern encoding fixed data. What expires ' +
       'is whatever it points at. Codes sold as “dynamic” simply encode a redirect URL the ' +
       'seller controls, and stop working if you stop paying them.'],
      ['What error correction level should I use?',
       'M for most uses. Higher levels make the code denser and therefore harder to scan at a ' +
       'given size, so only go to Q or H when you are covering part of the code with a logo or ' +
       'printing on something that will be scuffed.'],
      ['Why will my QR code not scan?',
       'Most often no quiet zone — the four-module clear margin is required. After that: printed ' +
       'too small for the scanning distance, too much data making the modules tiny, low ' +
       'contrast, or inverted colours. Test with more than one phone before printing a thousand.'],
    ],
  },
  'barcode-generator': {
    intro:
      'Generates linear barcodes in the common retail and logistics symbologies, ready to ' +
      'download. Which symbology you need is decided by what will scan it, and picking the ' +
      'wrong one is the usual reason a barcode fails at a till.',
    sections: [
      {
        h: 'The symbologies, and where each belongs',
        p: 'EAN-13 is the global retail standard, thirteen digits including a check digit, and is ' +
           'what a supermarket scanner expects. UPC-A is its twelve-digit North American sibling. ' +
           'Code 128 encodes the full ASCII set at high density and is the workhorse of shipping and ' +
           'warehousing. Code 39 is older and less dense but encodes letters and is still common in ' +
           'industrial and military settings. ITF-14 goes on outer cartons. If you are labelling ' +
           'internal inventory, Code 128 is almost always the right answer.',
      },
      {
        h: 'Retail barcodes need numbers you do not own',
        p: 'An EAN-13 that scans is not an EAN-13 you may use. Retail numbers are allocated through ' +
           'GS1, which issues a company prefix you then extend with your own product codes; the last ' +
           'digit is a check digit computed from the rest. Generating a plausible-looking number and ' +
           'printing it will produce a barcode that scans and collides with somebody else\'s product, ' +
           'and retailers will reject it. For internal stock control, where nothing leaves your own ' +
           'system, any scheme you like is fine.',
      },
      {
        h: 'Printing so it actually scans',
        p: 'Keep the quiet zone — the clear margin either side, around ten times the narrow bar ' +
           'width for most symbologies. Do not stretch the image: changing the aspect ratio distorts ' +
           'bar widths, which are the data. Print at a decent resolution; a barcode scaled up from a ' +
           'low-resolution image has fuzzy bar edges that defeat the scanner. Keep it dark on light, ' +
           'avoid glossy laminate that reflects the scanner\'s own light back at it, and never print ' +
           'across a fold or a curved seam.',
      },
    ],
    steps: [
      'Pick the symbology your scanner expects.',
      'Enter the data — digits only for EAN and UPC, any ASCII for Code 128.',
      'Generate, download, and test-scan a printed copy at real size.',
    ],
    notes: [
      'EAN-13 and UPC-A include a check digit; an invalid number produces a barcode that fails ' +
       'validation.',
      'Leave the quiet zone either side, and never stretch the image out of proportion.',
      'Generated in your browser; product data is not transmitted.',
    ],
    faq: [
      ['Can I make my own retail barcode?',
       'Not one you may legitimately sell with. Retail barcode numbers come from GS1, which ' +
       'allocates a company prefix to you; numbers you invent may already belong to another ' +
       'product and retailers will reject them. Internal-only inventory codes are entirely up to ' +
       'you.'],
      ['Which barcode type should I use?',
       'EAN-13 for retail outside North America, UPC-A inside it, and Code 128 for shipping, ' +
       'warehousing and internal labels — it is dense and handles letters as well as digits. ' +
       'Match whatever your scanner or your customer specifies.'],
      ['Why will my printed barcode not scan?',
       'Usually the quiet zone is missing, the image has been stretched so the bar widths are ' +
       'wrong, or it has been printed too small or at too low a resolution. Glossy surfaces and ' +
       'printing over a fold also defeat scanners.'],
    ],
  },
  'exif-remover': {
    intro:
      'Strips the metadata from a photograph by redrawing it, discarding the EXIF block that ' +
      'carries the camera model, timestamp, settings and frequently the GPS coordinates of ' +
      'where the picture was taken.',
    sections: [
      {
        h: 'What your photographs are telling people',
        p: 'A photo straight from a phone typically carries the exact latitude and longitude, to ' +
           'within a few metres, plus the date and time to the second and the device model and ' +
           'serial-adjacent identifiers. Posted publicly, that is your home address attached to a ' +
           'picture of your living room. Most large social platforms now strip EXIF on upload, but ' +
           'plenty of forums, marketplaces, messaging apps and file-sharing services do not, and ' +
           'attachments sent by email keep everything.',
      },
      {
        h: 'How stripping works here, and what it costs',
        p: 'The image is decoded and redrawn onto a canvas, then re-encoded. The metadata is simply ' +
           'not carried across — there is nothing to delete, because the new file is built from ' +
           'pixels alone. That is thorough, and it has a cost: the output is re-encoded as PNG, so a ' +
           'JPEG photograph comes out substantially larger, and a second JPEG save would add another ' +
           'round of lossy compression. For a photograph destined for the web, resize it afterwards, ' +
           'which you were probably going to do anyway.',
      },
      {
        h: 'What is lost besides the location',
        p: 'The orientation flag goes too, which is usually invisible because browsers apply it ' +
           'before drawing, but occasionally means an image appears rotated after processing. Colour ' +
           'profile information is not carried, so a wide-gamut photograph may look slightly ' +
           'flatter. Copyright and author fields go as well — worth knowing if you are a ' +
           'photographer, since those are the fields that assert your authorship. And the capture ' +
           'date is gone, so keep an original if the photographs are records rather than posts.',
      },
    ],
    steps: [
      'Choose the photograph.',
      'Process, then download the cleaned copy.',
      'Keep the original if you need its date, orientation or copyright fields.',
    ],
    notes: [
      'Output is PNG, so a JPEG photograph will grow — resize afterwards for web use.',
      'GPS, timestamp, camera model, orientation and copyright fields are all discarded.',
      'The photograph never leaves your browser, which matters given what you are removing.',
    ],
    faq: [
      ['Does removing EXIF change how the photo looks?',
       'Essentially no — the pixels are unchanged. Two edge cases: an orientation flag that was ' +
       'rotating the image is gone, so a file relying on it can appear rotated; and colour ' +
       'profile information is not carried, which can flatten a wide-gamut image very slightly.'],
      ['Do social media sites remove EXIF automatically?',
       'The major ones generally do on upload. Many forums, marketplaces, chat apps and ' +
       'file-sharing services do not, and an email attachment keeps everything. If you do not ' +
       'know what the destination does, strip it yourself.'],
      ['Can EXIF be recovered after stripping?',
       'Not from the stripped file — the data was never written into it. It remains in your ' +
       'original, which is why keeping the original matters if the capture date or authorship ' +
       'fields have any value to you.'],
    ],
  },
  'image-converter': {
    intro:
      'Converts images between formats — PNG, JPEG and WebP — in your browser. The right choice ' +
      'is decided by what is in the image, and getting it wrong costs either file size or ' +
      'visible quality.',
    sections: [
      {
        h: 'Choose by content, not by habit',
        p: 'JPEG is lossy and built for photographs: smooth tonal gradients compress beautifully, ' +
           'and its artefacts hide in detail. PNG is lossless and built for flat colour, sharp edges ' +
           'and transparency — screenshots, logos, line art, anything with text in it. Put a ' +
           'screenshot through JPEG and the text grows coloured fringing; put a photograph through ' +
           'PNG and the file is several times larger for no visible gain. WebP does both, typically ' +
           '25–35% smaller than the equivalent JPEG or PNG, and is supported by every browser in ' +
           'current use.',
      },
      {
        h: 'Lossy conversions do not undo',
        p: 'Converting JPEG to PNG does not restore anything — it losslessly preserves the artefacts ' +
           'already baked in, in a larger file. Worse, converting a JPEG to a JPEG re-compresses it, ' +
           'and every generation degrades further, which is the visible decay in images that have ' +
           'been saved and re-shared many times. Always convert from the highest-quality original ' +
           'you have, and never use a lossy format as a working file.',
      },
      {
        h: 'Transparency survives only some routes',
        p: 'JPEG has no alpha channel, so converting a transparent PNG to JPEG fills the ' +
           'transparency — usually with black or white, which is rarely what anyone wants and is a ' +
           'frequent unpleasant surprise with logos. PNG and WebP both support alpha. If you need ' +
           'transparency and small files, WebP is the answer; if you need transparency and maximum ' +
           'compatibility with very old software, PNG.',
      },
      {
        h: 'Where AVIF and SVG fit',
        p: 'AVIF compresses better than WebP again, often dramatically, with browser support now ' +
           'effectively universal but encoding that is slower and tooling that is patchier. SVG is ' +
           'not comparable: it is vector, so it scales to any size without loss and should be the ' +
           'format for logos and icons wherever you have the original artwork. Converting a ' +
           'photograph to SVG is not meaningful; converting a logo to PNG throws away its main ' +
           'advantage.',
      },
    ],
    steps: [
      'Choose your image.',
      'Pick the target format.',
      'Convert and download — compare the file size before committing to it.',
    ],
    notes: [
      'JPEG has no transparency; converting a transparent PNG to JPEG fills the transparent ' +
       'areas.',
      'Every JPEG save re-compresses, so avoid repeated round trips.',
      'Conversion runs in your browser — nothing is uploaded.',
    ],
    faq: [
      ['Should I use PNG or JPEG?',
       'JPEG for photographs, PNG for screenshots, logos, line art and anything containing text ' +
       'or needing transparency. The wrong choice either bloats the file or visibly degrades the ' +
       'image — text through JPEG compression is the most obvious symptom.'],
      ['Is WebP better than JPEG and PNG?',
       'Usually, on size — typically 25–35% smaller at comparable quality, with transparency and ' +
       'animation support, and it works in every current browser. The reasons to keep JPEG or ' +
       'PNG are compatibility with older software and workflows that do not read WebP.'],
      ['Will converting JPEG to PNG improve the quality?',
       'No. The compression artefacts are already part of the image, and PNG preserves them ' +
       'perfectly in a much larger file. Quality is only ever lost, never recovered — go back to ' +
       'the original if you have it.'],
    ],
  },
  'image-watermark': {
    intro:
      'Adds a text watermark to an image, with control over position, size and opacity. Useful ' +
      'for marking proofs, claiming authorship on work you are sharing, and labelling images ' +
      'before they leave your hands.',
    sections: [
      {
        h: 'What a watermark is for, and what it cannot do',
        p: 'It attributes and it deters. A visible mark makes casual reuse obviously improper and ' +
           'keeps your name attached as an image travels. It does not protect the image: a ' +
           'determined person can crop it out, clone over it, or these days remove it with ' +
           'generative editing in seconds. Treat it as a signature rather than a lock, and do not ' +
           'let it substitute for sending low-resolution proofs and holding the full-quality file ' +
           'back until you are paid.',
      },
      {
        h: 'Placement, and the crop problem',
        p: 'A mark in a corner is unobtrusive and trivially cropped away. A mark across the centre ' +
           'survives cropping and ruins the image, which is exactly right for a proof and wrong for ' +
           'anything you want seen. The usual compromise for portfolio work is a discreet mark in ' +
           'the lower third, sized so that removing it would visibly damage the composition. For ' +
           'proofs sent to a client before payment, a large diagonal at low opacity across the whole ' +
           'frame is the honest choice — they can judge the picture and cannot use it.',
      },
      {
        h: 'Opacity and legibility',
        p: 'Around 30–50% works for a signature-style mark: readable without competing with the ' +
           'image. The difficulty is that a single colour cannot read on both light and dark areas ' +
           'of a photograph, which is why white text with a subtle shadow, or a mark placed in a ' +
           'deliberately chosen flat area, is more reliable than picking a colour and hoping. Check ' +
           'the result at the size people will actually view it, not at full resolution.',
      },
    ],
    steps: [
      'Choose your image.',
      'Enter the watermark text — a name, a URL, or PROOF.',
      'Set position, size and opacity, and check it reads against the actual image.',
      'Download the watermarked copy; the original is untouched.',
    ],
    notes: [
      'A corner watermark is easily cropped; a central one is not, but dominates the image.',
      'Keep the unmarked original — the watermark cannot be removed from the download here.',
      'Everything runs in your browser; client work is not uploaded anywhere.',
    ],
    faq: [
      ['Can a watermark be removed from an image?',
       'Yes, with increasing ease — cropping handles a corner mark, cloning handles a small one, ' +
       'and generative tools handle most of the rest. A watermark deters casual reuse and ' +
       'asserts authorship; it does not prevent theft. Withholding the high-resolution file is ' +
       'the protection that works.'],
      ['What opacity should I use?',
       'Around 30–50% for a signature-style mark — legible without fighting the image. Proofs ' +
       'meant to be unusable want something larger and more central rather than more opaque.'],
      ['Does watermarking reduce image quality?',
       'The image is re-encoded on save, so a JPEG output adds a compression generation. The ' +
       'watermark itself only affects the pixels it covers. Keep the original and watermark from ' +
       'it each time rather than watermarking an already-watermarked copy.'],
    ],
  },

  // ── TEXT ──────────────────────────────────────────────────────────────────────
  'strip-html-tags': {
    intro:
      'Removes HTML markup and returns the readable text, decoding entities and keeping ' +
      'paragraph breaks. Script and style contents are discarded rather than left behind as ' +
      'stray code, which is where most simple tag strippers fall down.',
    sections: [
      {
        h: 'Why removing only the tags is not enough',
        p: 'A naive stripper deletes anything between angle brackets, which leaves the *contents* of ' +
           'script and style elements sitting in the output — so pasting a web page gives you its ' +
           'JavaScript and CSS mixed into the prose. This tool removes those elements whole, along ' +
           'with HTML comments, before stripping the remaining tags. It also converts block-level ' +
           'closing tags to line breaks, because otherwise every paragraph and list item runs into ' +
           'the next as one wall of text.',
      },
      {
        h: 'Entities are decoded after the tags go',
        p: 'Escaped markup in the source — &lt;b&gt; written as text rather than as a tag — should ' +
           'survive as visible text, so entities are decoded last. Doing it the other way round ' +
           'would turn that escaped example into a real tag and then strip it, silently losing ' +
           'content. The same order matters for &amp;, which must be decoded after the others or it ' +
           're-creates entities that have already been resolved.',
      },
      {
        h: 'What it is useful for',
        p: 'Getting the text out of an HTML email or a newsletter. Recovering copy from an exported ' +
           'page when the original document is gone. Counting the real words in a piece of formatted ' +
           'content. Cleaning a rich-text paste before putting it into a plain-text field. Preparing ' +
           'content for a search index or a text analysis tool that would otherwise count markup as ' +
           'words.',
      },
      {
        h: 'For rendering rather than reading, this is the wrong tool',
        p: 'Stripping tags is a way to read text, not a way to make untrusted HTML safe to display. ' +
           'If you are taking user-submitted HTML and putting it back into a page, you need a ' +
           'sanitiser that keeps the safe markup and removes the dangerous parts — DOMPurify is the ' +
           'standard answer. Stripping everything and re-inserting is both lossy and, done ' +
           'carelessly, still unsafe.',
      },
    ],
    steps: [
      'Paste your HTML.',
      'The plain text appears immediately, with paragraphs separated.',
      'Copy the result.',
    ],
    notes: [
      'Script, style and comment contents are removed entirely, not just their tags.',
      'Block-level elements become line breaks so paragraphs and list items stay separate.',
      'Processing runs in your browser — email content and drafts are not transmitted.',
    ],
    faq: [
      ['Why did my output contain JavaScript before?',
       'Because a simple tag stripper removes the <script> tags and leaves everything between ' +
       'them. This tool removes those elements whole, along with <style> blocks and HTML ' +
       'comments, so only readable text comes through.'],
      ['Does it keep paragraph breaks?',
       'Yes. Closing block-level tags and <br> become line breaks, so paragraphs, headings and ' +
       'list items stay on separate lines rather than running together.'],
      ['Can I use this to sanitise user input for my website?',
       'No — different job. Stripping tags gives you plain text; safely displaying ' +
       'user-submitted HTML means keeping the harmless markup and removing the rest, which needs ' +
       'a real sanitiser such as DOMPurify.'],
    ],
  },

  // ── HTML ──────────────────────────────────────────────────────────────────────
  'markdown-to-html': {
    intro:
      'Converts Markdown to HTML — headings, emphasis, lists, links, images, code blocks and ' +
      'tables — with the output ready to paste into a page or a template.',
    sections: [
      {
        h: 'There is no single Markdown',
        p: 'John Gruber\'s 1.0 description from 2004 left plenty ambiguous, and implementations ' +
           'diverged. CommonMark is the strict specification that settles those cases. GitHub ' +
           'Flavored Markdown adds tables, task lists, strikethrough and automatic linking on top of ' +
           'it, and is what most people mean when they say Markdown today. Notion, Obsidian, Discord ' +
           'and Slack each add or omit things. So Markdown that renders correctly in one place can ' +
           'render differently in another, particularly around nested lists and line breaks.',
      },
      {
        h: 'The line-break rule that surprises everyone',
        p: 'A single newline in Markdown does not produce a line break — consecutive lines are ' +
           'joined into one paragraph, which is deliberate, so that prose can be wrapped in a source ' +
           'file without affecting output. To force a break you need either two trailing spaces at ' +
           'the end of the line, which are invisible and get eaten by editors that trim whitespace, ' +
           'or a backslash, or a blank line to start a new paragraph. GitHub renders single newlines ' +
           'as breaks in comments and issues but not in files, which is why the same text behaves ' +
           'differently in two places on the same site.',
      },
      {
        h: 'Markdown allows raw HTML, and that matters for safety',
        p: 'You can drop HTML directly into Markdown, and most converters pass it straight through. ' +
           'That is convenient for a video embed or an attribute a converter cannot express — and it ' +
           'means Markdown from an untrusted source is exactly as dangerous as untrusted HTML. If ' +
           'you accept Markdown from users, sanitise the rendered output; do not assume the format ' +
           'is safe because it looks like plain text.',
      },
      {
        h: 'Where the output still needs work',
        p: 'Converted HTML carries no classes, so it inherits whatever your stylesheet says about ' +
           'bare h2, p and ul elements — which in a modern CSS reset is usually nothing. Either ' +
           'write styles for a wrapping class, or use a typography plugin. Images come through ' +
           'without width and height attributes, so add them to avoid layout shift. And code blocks ' +
           'come through as plain pre and code without syntax highlighting, which is a separate ' +
           'step.',
      },
    ],
    steps: [
      'Paste your Markdown.',
      'The HTML appears alongside it.',
      'Copy it into your page or template, and add styling for the bare elements.',
    ],
    notes: [
      'A single newline joins lines into a paragraph; use a blank line or two trailing spaces ' +
       'for a break.',
      'Raw HTML in the Markdown passes through — sanitise anything user-supplied.',
      'The output has no classes and no image dimensions; both usually need adding.',
    ],
    faq: [
      ['Why are my line breaks being ignored?',
       'Because Markdown joins consecutive lines into one paragraph by design. Use a blank line ' +
       'for a new paragraph, or end a line with two spaces or a backslash to force a break. ' +
       'GitHub comments are an exception and do break on single newlines, which is why the ' +
       'behaviour seems inconsistent.'],
      ['Can I use HTML inside Markdown?',
       'Yes — raw HTML is passed through, which is how people embed videos and elements Markdown ' +
       'cannot express. The corollary is that Markdown from an untrusted source is as dangerous ' +
       'as untrusted HTML and needs sanitising.'],
      ['Which Markdown flavour does this follow?',
       'The common GitHub-flavoured set: headings, emphasis, lists, links, images, code blocks ' +
       'and tables. Extensions specific to one tool — Obsidian\'s wikilinks, Notion\'s blocks — ' +
       'are not part of it and will come through as plain text.'],
    ],
  },

  // ── DEV ───────────────────────────────────────────────────────────────────────
  'diff-checker': {
    intro:
      'Compares two blocks of text and shows what was added and removed. The same underlying ' +
      'comparison a version control system uses, without needing the text to be in a ' +
      'repository.',
    sections: [
      {
        h: 'Matching by content, not position',
        p: 'The comparison finds the longest common subsequence between the two versions, so ' +
           'unchanged lines are recognised wherever they have moved to. Insert a paragraph at the ' +
           'top and you see one insertion, not an entire document marked as rewritten. That property ' +
           'is what makes a diff readable at all, and it is the difference between a structural ' +
           'comparison and simply lining the two texts up side by side.',
      },
      {
        h: 'Line granularity, and how to work around it',
        p: 'Comparison is line by line, so a changed line appears as a removal plus an addition ' +
           'rather than highlighting the few characters that differ. For prose, where a paragraph is ' +
           'one long line, that means an edited paragraph shows in full on both sides. Putting one ' +
           'sentence per line before comparing makes the output dramatically more readable — which ' +
           'is exactly why technical writers keep source files that way, and why the practice is ' +
           'called semantic line breaking.',
      },
      {
        h: 'What counts as a difference',
        p: 'Everything, exactly: a trailing space, a changed indent, a tab where there was a space, ' +
           'and a switch between Windows and Unix line endings all register. That last one is the ' +
           'classic confusion — a file that appears entirely rewritten after being opened on a ' +
           'different operating system usually has nothing changed but its line endings. Normalise ' +
           'whitespace first if you only care about the words.',
      },
      {
        h: 'Where it helps',
        p: 'Comparing two versions of a contract, a policy or copy that came back from review. ' +
           'Checking configuration drift between two environments. Verifying what a bulk edit ' +
           'actually did. Comparing an export against what you expected. Checking whether two files ' +
           'that should be identical really are — for which a hash is quicker, but a diff tells you ' +
           'what differs rather than merely that something does.',
      },
    ],
    steps: [
      'Paste the original on one side and the revised version on the other.',
      'Read the added and removed counts, then work through the highlighted lines.',
      'Split long paragraphs into one sentence per line first if the output is hard to read.',
    ],
    notes: [
      'Comparison is exact — whitespace and line endings count as differences.',
      'A changed line shows as one removal and one addition, not a character-level highlight.',
      'Both versions stay in your browser, so contracts and unreleased copy are safe to paste.',
    ],
    faq: [
      ['Why does the whole file show as changed?',
       'Almost always line endings — a file edited on Windows and compared against a Unix ' +
       'version differs on every line invisibly. Trailing whitespace and a change of indentation ' +
       'do the same. Normalise both sides first.'],
      ['Can it highlight which words changed within a line?',
       'No, it works at line granularity. Splitting the text so each sentence is on its own line ' +
       'gets you most of the way there and makes the result far easier to scan.'],
      ['Is this the same as git diff?',
       'The same algorithm family and the same idea. Git adds context lines, hunk headers, ' +
       'rename detection and word-level highlighting, and operates on tracked files; this is the ' +
       'plain version for any two pieces of text.'],
    ],
  },

  // ── IMAGES ────────────────────────────────────────────────────────────────────
  'avatar-generator': {
    intro:
      'Generates a simple avatar image — initials on a coloured background — for profile ' +
      'placeholders, team pages and seeded accounts. The kind of image every application needs ' +
      'before a user has uploaded one.',
    sections: [
      {
        h: 'Why initials beat a generic silhouette',
        p: 'A default avatar that is the same grey person for everybody makes a list of users ' +
           'unscannable. Initials on a colour derived from the name give each person a distinct, ' +
           'stable marker that is recognisable at 24 pixels, which is where avatars usually live. ' +
           'Deriving the colour from a hash of the name rather than randomly is the important ' +
           'detail: the same person gets the same colour every time, on every device, with nothing ' +
           'stored.',
      },
      {
        h: 'Getting initials right is harder than it looks',
        p: 'Taking the first letter of the first and last space-separated words works for most ' +
           'European names and fails elsewhere. Many cultures write the family name first, some ' +
           'people have one name, some have four, and prefixes like van, de and bin are not ' +
           'initials. Non-Latin scripts have no meaningful notion of an initial at all — a single ' +
           'Chinese character is already the whole surname. The safest general approach is one or ' +
           'two characters from the start of the display name, which degrades gracefully in every ' +
           'case.',
      },
      {
        h: 'Contrast, at avatar size',
        p: 'Initials are small, so the text-to-background contrast has to be strong — 4.5:1 as a ' +
           'minimum, more in practice because the glyphs are tiny. A palette of mid-tone backgrounds ' +
           'with white text is the common solution and works because it is checkable: pick colours ' +
           'dark enough that white always passes, rather than generating an arbitrary hue and ' +
           'hoping. The same accessibility rule as anywhere else, and easier to forget on an element ' +
           'this small.',
      },
    ],
    steps: [
      'Enter the name or initials.',
      'Choose the colour and size.',
      'Generate and download the PNG.',
    ],
    notes: [
      'Square output; most platforms crop avatars to a circle, so keep the initials centred and ' +
       'away from the corners.',
      'Generate at twice the display size for high-density screens.',
      'Generated locally as a PNG — nothing is uploaded.',
    ],
    faq: [
      ['What size should an avatar be?',
       'At least twice the display size, so 96×96 for a 48px avatar, to stay sharp on ' +
       'high-density screens. Most interfaces display avatars between 24 and 48 pixels, which is ' +
       'why legibility at small sizes matters more than detail.'],
      ['Should I derive the colour from the name?',
       'Yes — hash the name to pick from a fixed palette. The same person then gets the same ' +
       'colour everywhere without anything being stored, and the colour becomes a recognition ' +
       'cue in a list. Random colours per render do the opposite.'],
      ['How should initials be taken from a name?',
       'Carefully, and conservatively. First-plus-last only works for a subset of naming ' +
       'conventions; single names, family-name-first ordering, particles like van or de, and ' +
       'non-Latin scripts all break it. One or two characters from the start of the display name ' +
       'degrades gracefully everywhere.'],
    ],
  },

  // ── COLOR ─────────────────────────────────────────────────────────────────────
  'cmyk-rgb-converter': {
    intro:
      'Converts CMYK ink percentages to RGB and hex, and back again. The arithmetic is exact; ' +
      'the match between what you see and what comes off a press is not, and understanding why ' +
      'saves expensive reprints.',
    sections: [
      {
        h: 'Two models that work in opposite directions',
        p: 'RGB is additive: screens emit light, and all three channels at full strength give white. ' +
           'CMYK is subtractive: ink absorbs light reflected off paper, and more ink means darker, ' +
           'with no ink at all giving whatever colour the paper is. That is why a screen can show a ' +
           'luminous cyan that no printer reproduces — the screen is emitting light and the page can ' +
           'only fail to absorb it. The K channel exists because mixing C, M and Y to make black ' +
           'produces a muddy brown, wastes ink and soaks the paper.',
      },
      {
        h: 'Why the conversion is an approximation',
        p: 'The formula here is the standard mathematical one, and real print colour depends on the ' +
           'specific ink set, the paper, the press and the ICC profile that ties them together. The ' +
           'same CMYK values print noticeably differently on coated and uncoated stock, because ' +
           'uncoated paper absorbs ink and dulls it. Professional workflows convert through a ' +
           'profile such as FOGRA39 or GRACoL, not through arithmetic. Treat this tool as a close ' +
           'estimate for getting into the right region, and proof properly before a print run.',
      },
      {
        h: 'The gamut problem, in the direction that hurts',
        p: 'CMYK\'s gamut is smaller than sRGB\'s, so a vivid screen colour — bright orange, saturated ' +
           'green, electric blue — has no ink equivalent and comes back noticeably duller. This is ' +
           'the call people get from their printer. If a brand colour matters, choose it from a ' +
           'printed swatch book rather than on screen, and consider a Pantone spot colour, which is ' +
           'premixed ink rather than a halftone of four and reproduces exactly at the cost of an ' +
           'extra plate.',
      },
      {
        h: 'Practical rules for print files',
        p: 'Black text should be 100% K alone, never a four-colour mix: registration on a press is ' +
           'never perfect, and small text built from four plates shows colour fringing. Large solid ' +
           'blacks want a rich black, typically around 60C 40M 40Y 100K, which looks genuinely black ' +
           'rather than washed out. Keep total ink coverage under about 300% or the sheet will not ' +
           'dry properly. And supply files in CMYK if the printer asks for CMYK — letting them ' +
           'convert means they choose, not you.',
      },
    ],
    steps: [
      'Enter CMYK percentages, or an RGB or hex value.',
      'Read the conversion in the other model.',
      'For anything going to print, check the result against a physical swatch rather than your ' +
       'screen.',
    ],
    notes: [
      'CMYK values are ink coverage percentages from 0 to 100.',
      'Round-tripping RGB to CMYK and back shifts slightly — the smaller gamut and ' +
       'whole-percent rounding both lose a little.',
      'Pure black text should be K only; a rich black mix is for large solid areas.',
    ],
    faq: [
      ['Why do my colours look duller when printed?',
       'Because CMYK covers a smaller range of colours than a screen. Saturated oranges, greens ' +
       'and blues simply have no ink equivalent, so the closest printable colour is duller. ' +
       'Choosing brand colours from a printed swatch book instead of a monitor avoids the ' +
       'surprise.'],
      ['Should I design in RGB or CMYK?',
       'CMYK if the final output is print, so you see the limits as you work rather than at ' +
       'proofing. RGB for anything on screen, which has the wider gamut. Designing in RGB and ' +
       'converting at the end is common and workable, as long as you check the vivid colours ' +
       'survive.'],
      ['Is CMYK to RGB conversion exact?',
       'The arithmetic is deterministic; the colour match is not. Real print output depends on ' +
       'ink, paper, press and ICC profile, which a formula cannot know. Use this to get close, ' +
       'and a proper proof to be sure.'],
    ],
  },
  'color-converter': {
    intro:
      'Converts a colour between every notation at once — hex, RGB, HSL, HSV and CMYK — so you ' +
      'can take a value from one tool and use it in another without doing the arithmetic ' +
      'yourself.',
    sections: [
      {
        h: 'Which notation to think in',
        p: 'Hex and RGB describe the same thing: how much red, green and blue. They are what you ' +
           'store and what code expects, and they are almost impossible to adjust by eye — nobody ' +
           'can tell you what #3B82F6 looks like 10% lighter. HSL and HSV describe hue, saturation ' +
           'and a brightness dimension, which is how people actually think about colour and what ' +
           'design tools give you sliders for. Work in HSL, store in hex.',
      },
      {
        h: 'HSL and HSV differ in what the third number means',
        p: 'In HSL, lightness runs from black at 0 through the pure hue at 50 to white at 100. In ' +
           'HSV, value runs from black at 0 to the brightest version of the hue at 100, and you ' +
           'reach white by dropping saturation instead. So 100% lightness in HSL is always white, ' +
           'while 100% value in HSV is a vivid colour. Photoshop\'s picker is HSV, CSS uses HSL, and ' +
           'confusing the two is why a value copied between them can come out completely wrong.',
      },
      {
        h: 'None of these are perceptually uniform',
        p: 'Equal numeric steps do not look like equal visual steps. Yellow at 50% HSL lightness ' +
           'looks far brighter than blue at 50%, because the models weight the channels equally ' +
           'while the eye does not. That is why a palette built by stepping lightness evenly looks ' +
           'uneven, and why OKLCH and Lab exist — they are built so that equal numbers mean equal ' +
           'perceived change. Modern CSS supports OKLCH, and it is worth using for generated ' +
           'palettes and gradients.',
      },
    ],
    steps: [
      'Enter a colour in any of the supported notations.',
      'Read it in all the others — they update together.',
      'Copy the one your tool, stylesheet or print file expects.',
    ],
    notes: [
      'Hex and RGB are the same values in different bases; HSL and HSV are genuinely different ' +
       'coordinates.',
      'CMYK conversion here is the standard formula — real print colour needs an ICC profile.',
      'Round-tripping through CMYK or through whole-number HSL loses a little precision.',
    ],
    faq: [
      ['What is the difference between HSL and HSV?',
       'The third component. HSL lightness goes black → pure hue → white, so 100% is always ' +
       'white. HSV value goes black → brightest hue, and white comes from reducing saturation ' +
       'instead. CSS uses HSL; most design software pickers are HSV.'],
      ['Which colour format should I use in CSS?',
       'Hex for stored brand values, HSL when you are generating variants by adjusting ' +
       'lightness, and OKLCH where you want perceptually even steps across a scale. All are well ' +
       'supported; the choice is about which is easiest to reason about for the job.'],
      ['Why does converting back and forth change my colour slightly?',
       'Rounding. Each notation has a different precision — hex is whole bytes, HSL is usually ' +
       'whole percentages, CMYK is whole percentages of a smaller gamut — so a round trip loses ' +
       'a little each way. Keep one canonical value and convert from it rather than chaining ' +
       'conversions.'],
    ],
  },

  // ── FORMATTERS ────────────────────────────────────────────────────────────────
  'sql-formatter': {
    intro:
      'Reformats SQL with consistent keyword casing, indentation and line breaks, turning a ' +
      'query that arrived as one long line into something you can read and review.',
    sections: [
      {
        h: 'Why formatted SQL matters more than formatted code',
        p: 'SQL is read under pressure — usually when something is slow or wrong, often in a ' +
           'production incident. A three-hundred-character single-line query with four joins and a ' +
           'nested subquery is genuinely hard to reason about, and the bug is nearly always in a ' +
           'join condition or a WHERE clause that is hard to see. Putting each clause on its own ' +
           'line and indenting the joins makes the structure visible, which is most of the ' +
           'debugging.',
      },
      {
        h: 'The conventions worth adopting',
        p: 'Keywords uppercase, identifiers lowercase — the contrast makes the shape of the query ' +
           'scannable at a glance. One column per line in a long SELECT, so a diff shows which ' +
           'column changed rather than rewriting the line. Leading commas are divisive but genuinely ' +
           'reduce diff noise and make a missing comma obvious. Each JOIN on its own line with its ' +
           'ON condition indented beneath it. None of this is enforced by any database; it is all ' +
           'for the next person to read it.',
      },
      {
        h: 'Formatting is not optimisation',
        p: 'A prettier query runs at exactly the same speed — the parser does not care about ' +
           'whitespace. What formatting does is make the expensive parts visible: a correlated ' +
           'subquery in a SELECT list, a join with no condition, a function wrapped around an ' +
           'indexed column that stops the index being used. Read the formatted query, then read the ' +
           'EXPLAIN plan, which is the only thing that actually tells you what the database will do.',
      },
      {
        h: 'Dialects differ, and formatters generalise',
        p: 'PostgreSQL, MySQL, SQL Server, Oracle and SQLite each have syntax the others do not — ' +
           'window function clauses, LIMIT against TOP against FETCH FIRST, different quoting rules ' +
           'for identifiers, and wildly different date functions. A general formatter handles ' +
           'standard SQL well and may indent dialect-specific constructs oddly. If your query uses ' +
           'something unusual, check the output rather than assuming, and never let a formatter be ' +
           'the last step before running something destructive.',
      },
    ],
    steps: [
      'Paste your SQL.',
      'Read the formatted output.',
      'Copy it back into your query tool or migration file.',
    ],
    notes: [
      'Formatting changes whitespace and casing only — never what the query does.',
      'Very dialect-specific syntax may be indented oddly; check the output.',
      'Queries stay in your browser, which matters when they contain real table and column ' +
       'names.',
    ],
    faq: [
      ['Does formatting SQL affect performance?',
       'No. Whitespace and keyword case are discarded by the parser. Formatting helps you find ' +
       'the performance problem by making the query\'s structure visible — the fix itself is in ' +
       'the query plan, not the layout.'],
      ['Should SQL keywords be uppercase?',
       'It is the long-standing convention and worth keeping: uppercase keywords against ' +
       'lowercase identifiers make the query\'s shape readable at a glance. No database requires ' +
       'it, and some modern style guides prefer all-lowercase — consistency within a codebase ' +
       'matters more than which you pick.'],
      ['Can it format queries with template placeholders?',
       'Usually, if the placeholders look like ordinary tokens — ? and $1 pass through fine. ' +
       'Templating syntax that is not valid SQL, such as {{variable}} or a Jinja block, may ' +
       'confuse the parser. Format the raw SQL before templating it where you can.'],
    ],
  },

  // ── HTML ──────────────────────────────────────────────────────────────────────
  'html-to-markdown': {
    intro:
      'Converts HTML into Markdown, turning headings, lists, links, emphasis and code blocks ' +
      'back into plain-text syntax. Useful for moving content out of a CMS, into a ' +
      'documentation repo, or into any tool that speaks Markdown.',
    sections: [
      {
        h: 'What survives and what does not',
        p: 'Markdown expresses a small, deliberate subset of HTML: headings, paragraphs, emphasis, ' +
           'lists, links, images, blockquotes, code and — by extension — tables. Anything outside ' +
           'that has nowhere to go. Classes, ids, inline styles, data attributes, divs and spans, ' +
           'iframes, form elements and most of the structure of a modern web page simply vanish, ' +
           'because Markdown has no way to say them. That is the point of the conversion rather than ' +
           'a failure of it, but it means converting a full page gives you the article and none of ' +
           'the furniture.',
      },
      {
        h: 'Nested and complex structures are where it gets ugly',
        p: 'Markdown handles a nested list well and a table containing a list badly, because ' +
           'Markdown tables cannot contain block elements at all. A table with paragraphs in its ' +
           'cells has to stay as HTML — which is legal in Markdown, and is what a good converter ' +
           'falls back to. Deeply nested blockquotes, definition lists and figures with captions all ' +
           'come through approximately at best. Check anything structurally unusual by eye.',
      },
      {
        h: 'Round-tripping is lossy in one direction',
        p: 'Markdown to HTML and back is roughly stable. HTML to Markdown and back is not: the ' +
           'second HTML will be simpler than the first, having lost every attribute and wrapper. So ' +
           'converting a page to Markdown to edit it and then publishing the re-rendered HTML will ' +
           'quietly strip your styling hooks. Convert when you are moving to a Markdown-native ' +
           'system for good, not as a temporary editing step.',
      },
    ],
    steps: [
      'Paste your HTML.',
      'The Markdown appears alongside it.',
      'Check tables, nested lists and anything unusual before using the result.',
    ],
    notes: [
      'Classes, ids, styles and layout elements are dropped — Markdown cannot express them.',
      'Complex tables may come through as raw HTML, which is valid Markdown and usually the ' +
       'right answer.',
      'Conversion runs in your browser, so unpublished content is not transmitted.',
    ],
    faq: [
      ['Why did my styling disappear?',
       'Markdown has no syntax for classes, ids or inline styles, so they cannot be represented. ' +
       'Only the structural meaning survives — headings stay headings, emphasis stays emphasis. ' +
       'If you need the presentation, keep the HTML.'],
      ['Can I convert a whole web page?',
       'You can, and you will get the article text plus whatever navigation, footer and sidebar ' +
       'text was in the markup. Extract the main content element first for a usable result — ' +
       'converting the whole document gives you the menus too.'],
      ['What happens to tables?',
       'Simple tables become Markdown table syntax. Tables containing paragraphs, lists or other ' +
       'block elements cannot be expressed that way and stay as HTML, which Markdown permits and ' +
       'every renderer handles.'],
    ],
  },

  // ── MATH ──────────────────────────────────────────────────────────────────────
  'prime-checker': {
    intro:
      'Tests whether a number is prime and shows its factors when it is not. Prime numbers are ' +
      'the multiplicative atoms of arithmetic and the foundation of most public-key ' +
      'cryptography, which is a lot of weight for something defined by what it cannot be ' +
      'divided by.',
    sections: [
      {
        h: 'How primality is actually tested',
        p: 'Not by trying every number below it. You only need to test divisors up to the square ' +
           'root, because any factor above the square root must pair with one below it — so checking ' +
           'up to √10000 = 100 settles a five-digit number. Skipping even numbers after 2 halves the ' +
           'work again, and testing only 6k±1 candidates removes multiples of 3 as well. For ' +
           'genuinely large numbers, trial division is hopeless and probabilistic tests such as ' +
           'Miller-Rabin are used instead: they can be wrong, with a probability you choose, and you ' +
           'make it smaller than the chance of a cosmic ray flipping the answer.',
      },
      {
        h: 'Why 1 is not prime',
        p: 'It looks like an arbitrary exclusion and it is a load-bearing one. The fundamental ' +
           'theorem of arithmetic says every integer above 1 has a unique prime factorisation — and ' +
           'if 1 were prime, 12 could be 2²×3 or 1×2²×3 or 1⁵×2²×3, and uniqueness would be lost. ' +
           'Mathematicians did count 1 as prime into the early twentieth century; it was excluded ' +
           'precisely because keeping it broke more theorems than it served.',
      },
      {
        h: 'The primes that keep the internet working',
        p: 'RSA multiplies two large primes to get a public modulus, and its security rests on ' +
           'factoring that product being hard while multiplying was easy. A 2048-bit RSA key uses ' +
           'two primes of about 300 digits each, found by generating random odd numbers and testing ' +
           'them — the prime number theorem says roughly one in every 700 numbers that size is ' +
           'prime, so this takes seconds. Nobody has factored a 2048-bit modulus, and a sufficiently ' +
           'large quantum computer would, which is the entire motivation for post-quantum ' +
           'cryptography.',
      },
      {
        h: 'Curiosities worth knowing',
        p: 'There are infinitely many primes — Euclid proved it around 300 BC with an argument that ' +
           'still fits in two lines. They thin out but never stop: the density near n is about ' +
           '1/ln(n). Twin primes such as 11 and 13 appear to go on forever, but nobody has proved ' +
           'it. Mersenne primes, of the form 2ⁿ−1, are where the largest known primes come from, and ' +
           'the current record has over 41 million digits.',
      },
    ],
    steps: [
      'Enter a whole number.',
      'Read whether it is prime, and its factors if it is not.',
    ],
    notes: [
      '1 is not prime, and neither is any number below it; 2 is the only even prime.',
      'Trial division only needs to reach the square root of the number.',
      'Very large numbers exceed exact integer representation in JavaScript — ' +
       'cryptographic-scale primality testing needs arbitrary-precision arithmetic.',
    ],
    faq: [
      ['Is 1 a prime number?',
       'No. A prime has exactly two distinct divisors, 1 and itself, and 1 has only one. The ' +
       'deeper reason is that unique prime factorisation would fail if 1 counted — every number ' +
       'would have infinitely many factorisations differing only by factors of 1.'],
      ['What is the fastest way to check if a number is prime?',
       'Test divisibility by 2 and 3, then by candidates of the form 6k±1 up to the square root. ' +
       'That is enough for anything you would type by hand. Numbers of cryptographic size use ' +
       'probabilistic tests such as Miller-Rabin instead.'],
      ['Why do prime numbers matter for encryption?',
       'Because multiplying two large primes is fast and factoring the result is not, as far as ' +
       'anyone knows. RSA builds a public key from that asymmetry. The security is an assumption ' +
       'about difficulty rather than a proof, which is why a quantum algorithm that factors ' +
       'efficiently would break it.'],
    ],
  },
  'volume-calc': {
    intro:
      'Calculates the volume of common solids — cube, cuboid, cylinder, sphere, cone and ' +
      'pyramid — from their dimensions, with the formula and the working shown.',
    sections: [
      {
        h: 'The relationships worth remembering instead of the formulas',
        p: 'A cone is exactly one third of the cylinder that contains it, and a pyramid is one third ' +
           'of its prism — the same factor, for the same reason. A sphere is two thirds of the ' +
           'cylinder it fits inside exactly, which Archimedes considered his finest result and had ' +
           'carved on his tomb. Knowing those three relationships means you can derive most of the ' +
           'formulas from the cylinder, and it gives you a sanity check: if your cone comes out ' +
           'bigger than a third of the cylinder, something is wrong.',
      },
      {
        h: 'Units are cubed, which is where the errors are',
        p: 'Volume scales with the cube of the length ratio. A metre is 100 centimetres, so a cubic ' +
           'metre is a million cubic centimetres, not a hundred. Double every dimension of a box and ' +
           'the volume increases eightfold. This catches people out constantly in aquarium ' +
           'capacities, concrete orders and shipping quotes — and it is the same trap as squared ' +
           'units for area, one power worse. Convert all dimensions to the same unit before ' +
           'calculating, never after.',
      },
      {
        h: 'Litres, cubic centimetres and the useful coincidence',
        p: 'One litre is exactly 1,000 cubic centimetres, and one cubic metre is exactly 1,000 ' +
           'litres. That makes tank and container arithmetic easy in metric: a box 20 × 30 × 40 cm ' +
           'is 24,000 cm³, so 24 litres. One cubic centimetre of water weighs almost exactly one ' +
           'gram, which is how the metric system was designed and why these conversions are clean ' +
           'rather than coincidental.',
      },
      {
        h: 'Real containers hold less than the maths says',
        p: 'Wall thickness, rounded internal corners, the fill line, and whatever is already inside ' +
           'all reduce usable capacity. An aquarium\'s stated volume is typically its external ' +
           'dimensions, and the water it actually holds once gravel and the gap below the rim are ' +
           'accounted for is noticeably less — often 10–15%. Calculate from internal dimensions ' +
           'where you can, and leave headroom where you cannot.',
      },
    ],
    steps: [
      'Choose the shape.',
      'Enter its dimensions — all in the same unit.',
      'Read the volume and the formula applied.',
    ],
    notes: [
      'All dimensions must use the same unit; the result is in that unit cubed.',
      '1 litre = 1,000 cm³, and 1 m³ = 1,000 litres.',
      'A cone is one third of its cylinder; a sphere is two thirds of the cylinder that ' +
       'encloses it.',
    ],
    faq: [
      ['How do I convert cubic centimetres to litres?',
       'Divide by 1,000. So 24,000 cm³ is 24 litres, and 1 m³ is 1,000 litres. A cubic metre is ' +
       'a million cubic centimetres, not a hundred — the factor is cubed.'],
      ['What is the volume of a cylinder?',
       'πr²h — the area of the circular base times the height. A cone with the same base and ' +
       'height is exactly one third of that, which is worth remembering as a check on your ' +
       'arithmetic.'],
      ['Why does my tank hold less than the calculated volume?',
       'Because the calculation uses the dimensions you gave it, and a real container has wall ' +
       'thickness, rounded corners and a fill line below the rim. Measure internally and expect ' +
       'to lose another 10% or so to practical headroom.'],
    ],
  },

  // ── JS ────────────────────────────────────────────────────────────────────────
  'js-to-typescript': {
    intro:
      'Adds basic TypeScript annotations to JavaScript — a starting point for a migration ' +
      'rather than a finished conversion. What it cannot do is as important as what it can, ' +
      'because a half-typed file that claims to be typed is worse than an untyped one.',
    sections: [
      {
        h: 'Migrate incrementally, which TypeScript is designed for',
        p: 'You do not convert a codebase in one pass. Rename a file to .ts, let the compiler tell ' +
           'you what it cannot infer, fix those, and move on — with allowJs on so typed and untyped ' +
           'files coexist. Start at the leaves, with utilities and types that nothing depends on, ' +
           'and work toward the entry points; converting a module before its dependencies means ' +
           'writing types twice. The compiler is the migration tool, and a converter only saves you ' +
           'the mechanical first pass.',
      },
      {
        h: 'any is a hole in the type system, and it spreads',
        p: 'Annotating something as any turns off checking for it and everything derived from it, ' +
           'which makes the error go away and removes the value you converted for. unknown is the ' +
           'honest alternative: it accepts anything, like any, but forces you to narrow it before ' +
           'use, so the check happens where the data enters rather than nowhere. Turn on ' +
           'noImplicitAny early, before the codebase fills with silent anys that are painful to find ' +
           'later.',
      },
      {
        h: 'The compiler options that decide how much this is worth',
        p: 'strict is the one that matters, and it is worth turning on at the start of a migration ' +
           'rather than after, because retrofitting strictness to a large converted codebase is ' +
           'miserable. Its most valuable component is strictNullChecks, which separates a value from ' +
           'a value-or-null and catches the single most common class of runtime error in JavaScript. ' +
           'Without it, TypeScript will happily let you call a method on something that might be ' +
           'undefined.',
      },
      {
        h: 'Types vanish at runtime',
        p: 'TypeScript compiles to JavaScript by deleting the annotations. There is no runtime ' +
           'checking whatsoever, so a server that returns something other than what your interface ' +
           'promises produces an application that compiled cleanly and crashes anyway. Anything ' +
           'crossing a boundary — an API response, a form submission, parsed JSON, a message from ' +
           'another window — needs a runtime validator. Zod and Valibot let you define the schema ' +
           'once and derive the type from it, which keeps them from drifting apart.',
      },
    ],
    steps: [
      'Paste your JavaScript.',
      'Read the annotated output as a first draft.',
      'Rename the file, run the compiler, and fix what it reports — that is the real ' +
       'conversion.',
    ],
    notes: [
      'Inferred types are a starting point; the compiler, not a converter, does the real work.',
      'Prefer unknown to any when you cannot determine a type — it forces narrowing rather than ' +
       'disabling checks.',
      'Types are erased at compile time and provide no runtime validation.',
    ],
    faq: [
      ['Can I convert a whole project automatically?',
       'Not meaningfully. Tools produce a mechanical first pass, and the value of TypeScript ' +
       'comes from the types the compiler cannot infer — function contracts, union types, ' +
       'nullability. Convert file by file with allowJs enabled, starting from the dependency ' +
       'leaves.'],
      ['What is the difference between any and unknown?',
       'any disables type checking for that value and everything derived from it. unknown also ' +
       'accepts anything, but will not let you use it until you narrow it to a specific type. ' +
       'unknown is almost always the right choice when you genuinely do not know.'],
      ['Does TypeScript check types at runtime?',
       'No. Annotations are erased during compilation, leaving plain JavaScript. A type is a ' +
       'promise about your own code, not a guarantee about data arriving from outside it — use a ' +
       'runtime validator at every boundary.'],
    ],
  },

  // ── CSS ───────────────────────────────────────────────────────────────────────
  'cubic-bezier-editor': {
    intro:
      'Edits a cubic-bezier easing curve by dragging its two control points, with a live ' +
      'preview of the motion and the CSS value to copy. Easing is what separates animation that ' +
      'feels designed from animation that feels mechanical.',
    sections: [
      {
        h: 'What the four numbers mean',
        p: 'cubic-bezier(x1, y1, x2, y2) gives the two control points of a curve from (0,0) to ' +
           '(1,1). The horizontal axis is elapsed time and the vertical is progress, so the curve\'s ' +
           'steepness at any point is the speed at that moment. A straight diagonal is linear. ' +
           'Pulling the first control point right delays the start; pulling the second point left ' +
           'makes it settle early. The x values must stay between 0 and 1 — time cannot run ' +
           'backwards — but y values may go outside it, which is how you get overshoot and ' +
           'anticipation.',
      },
      {
        h: 'The named easings are just presets',
        p: 'ease is cubic-bezier(0.25, 0.1, 0.25, 1) and is the CSS default — a slightly odd curve ' +
           'nobody would choose deliberately. ease-in is (0.42, 0, 1, 1), ease-out is (0, 0, 0.58, ' +
           '1), ease-in-out is (0.42, 0, 0.58, 1). Knowing this means you can start from a named ' +
           'easing and adjust rather than beginning from scratch, and it explains why custom curves ' +
           'so often look better: the defaults were chosen for compatibility, not for feel.',
      },
      {
        h: 'Which curve for which motion',
        p: 'ease-out for anything entering the screen or responding to a click: fast at first, ' +
           'settling gently, which feels responsive because the user sees movement immediately. ' +
           'ease-in for things leaving, where accelerating away reads as departure. ease-in-out for ' +
           'anything that moves and stops within view. Linear only for continuous rotation such as a ' +
           'spinner — anywhere else it reads as robotic, because nothing physical starts at full ' +
           'speed. A y value above 1 in the second control point produces overshoot, which suits ' +
           'playful interfaces and irritates in a form.',
      },
      {
        h: 'Duration matters as much as the curve',
        p: 'Under about 150ms reads as an instant jump rather than a movement; over 500ms a user is ' +
           'waiting for your animation to finish. Most interface transitions belong in 200–300ms, ' +
           'with larger movements taking slightly longer than small ones, which matches physical ' +
           'intuition. And wrap decorative motion in a prefers-reduced-motion query — a beautifully ' +
           'eased animation is still nauseating to someone with a vestibular disorder.',
      },
    ],
    steps: [
      'Drag the two control points, or start from a named easing and adjust.',
      'Watch the preview — the feel matters more than the shape of the curve.',
      'Copy the cubic-bezier value into your transition or animation.',
    ],
    notes: [
      'x values must be between 0 and 1; y values may exceed it to produce overshoot.',
      'ease-out suits things arriving, ease-in things leaving, linear only continuous rotation.',
      '200–300ms suits most interface transitions; test on a slow device, not just yours.',
    ],
    faq: [
      ['What is the best easing for UI animation?',
       'ease-out for most of it — elements entering, menus opening, anything responding to a ' +
       'tap. It starts fast, so the interface feels immediately responsive, and settles gently. ' +
       'Reserve ease-in for things leaving and linear for spinners.'],
      ['How do I make an animation overshoot and bounce back?',
       'Push the second control point\'s y value above 1, for example cubic-bezier(0.34, 1.56, ' +
       '0.64, 1). The curve passes beyond the end value and comes back, which reads as a spring. ' +
       'Use it sparingly; it draws attention every time.'],
      ['Why does my animation feel sluggish?',
       'Usually duration rather than curve — anything over about 400ms for a small interface ' +
       'movement feels slow. Also check you are not using ease-in for something arriving, which ' +
       'delays the visible start and reads as lag.'],
    ],
  },

  // ── IMAGES ────────────────────────────────────────────────────────────────────
  'image-base64': {
    intro:
      'Converts an image to a Base64 data URI and back, entirely in your browser. The encoded ' +
      'string can be pasted straight into HTML, CSS, JSON or an email template with no separate ' +
      'file to host.',
    sections: [
      {
        h: 'What you gain and what you pay',
        p: 'You gain one fewer network request, an asset that cannot 404, and a file that travels ' +
           'inside the document. You pay about 33% in size, because Base64 encodes three bytes as ' +
           'four characters, and you lose separate caching — an inlined image is re-downloaded with ' +
           'every page that embeds it, where a normal file is fetched once and cached across the ' +
           'whole site. That trade is good for something small and bad for a photograph.',
      },
      {
        h: 'Where inlining is genuinely the right answer',
        p: 'Email templates, where externally hosted images are blocked by default in most clients. ' +
           'Single-file HTML documents meant to be archived or emailed. Tiny icons in a stylesheet. ' +
           'Low-quality image placeholders shown while the real photograph loads. Anything that must ' +
           'work with no network at all. The rough threshold is a few kilobytes: below it, inlining ' +
           'usually wins; above it, a normal cached file does.',
      },
      {
        h: 'Reading a data URI',
        p: 'The format is data:[media type];base64,[payload]. The media type must be right — an ' +
           'image/png prefix on JPEG bytes will not display, and this is the commonest reason a ' +
           'pasted data URI shows nothing. The payload is the file\'s bytes, unchanged, so decoding ' +
           'gives you back a byte-identical image; Base64 is a re-encoding, never a lossy step.',
      },
      {
        h: 'SVG does not need this',
        p: 'An SVG is already text. Base64-encoding one makes it a third larger for no benefit — ' +
           'either inline the markup directly into your HTML, where CSS can then style it, or use a ' +
           'URL-encoded data URI, which is smaller than Base64 and still works in CSS. Reserve this ' +
           'tool for raster formats.',
      },
    ],
    steps: [
      'Choose an image to encode, or paste a data URI to decode.',
      'Copy the data URI, or download the decoded image.',
      'Paste it into an img src, a CSS background-image, or your template.',
    ],
    notes: [
      'Encoded output is about 33% larger than the original file.',
      'Keep the data:image/...;base64, prefix and make sure its media type matches the real ' +
       'format.',
      'The file is read locally — nothing is uploaded.',
    ],
    faq: [
      ['When should I inline an image as Base64?',
       'For small assets — icons, tiny placeholders, images in email templates — where saving a ' +
       'request is worth the 33% size increase and the loss of caching. For anything larger than ' +
       'a few kilobytes, a normal file that the browser can cache is better.'],
      ['Does Base64 encoding reduce image quality?',
       'No. It is a lossless re-encoding of the exact bytes, so decoding returns an identical ' +
       'file. It only changes the size of the representation, upward by about a third.'],
      ['Why is my data URI not displaying?',
       'Most often the media type in the prefix does not match the actual format — ' +
       'data:image/png in front of JPEG bytes will not render. After that: a truncated payload, ' +
       'or a line break inserted somewhere in the string when it was copied.'],
    ],
  },

  // ── DEV ───────────────────────────────────────────────────────────────────────
  'ip-info': {
    intro:
      'Analyses an IPv4 or IPv6 address you type in — its class, whether it is private or ' +
      'public, its decimal integer form and its binary representation. It reads the address you ' +
      'give it; it does not look up your own or query any service.',
    sections: [
      {
        h: 'Private ranges, and why they exist',
        p: 'Three IPv4 ranges are reserved for private networks and never routed on the public ' +
           'internet: 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16. Your home router almost ' +
           'certainly hands out addresses in the last of those. They exist because IPv4 has only 4.3 ' +
           'billion addresses, and the world ran out — private ranges plus network address ' +
           'translation let an entire household or office share one public address. That is also why ' +
           'you cannot reach a device on someone else\'s 192.168.1.10: the address is meaningful only ' +
           'inside their network, and millions of networks use the same one.',
      },
      {
        h: 'Address classes are history, but the vocabulary survives',
        p: 'Classes A, B and C divided the address space by fixed boundaries, and were replaced by ' +
           'CIDR in 1993 because they wasted enormous blocks — an organisation needing 300 addresses ' +
           'had to take a class B of 65,536. CIDR allows any prefix length, written as /24 or /19, ' +
           'which is how allocation has worked for thirty years. The class terminology persists in ' +
           'conversation and in tools like this one, but nothing routes by it any more.',
      },
      {
        h: 'Special addresses worth recognising',
        p: '127.0.0.1 is loopback — the machine talking to itself, and the whole 127.0.0.0/8 block ' +
           'is reserved for it. 0.0.0.0 means “any address” when a server binds to it and “unknown” ' +
           'as a source. 169.254.x.x is link-local, assigned automatically when DHCP fails, and ' +
           'seeing it means the machine never got an address from the router — a useful diagnosis. ' +
           '255.255.255.255 is the broadcast address. In IPv6, ::1 is loopback and fe80:: is ' +
           'link-local.',
      },
      {
        h: 'IPv6 in brief',
        p: '128 bits against IPv4\'s 32, which is 340 undecillion addresses — enough that every ' +
           'device can have a globally routable one and network address translation becomes ' +
           'unnecessary. Written as eight groups of four hex digits, with one run of zero groups ' +
           'abbreviated to a double colon. Adoption passed 40% of Google\'s traffic years ago and ' +
           'continues to climb, which is why any code parsing addresses should handle both families ' +
           'rather than assuming four dot-separated numbers.',
      },
    ],
    steps: [
      'Type an IPv4 or IPv6 address.',
      'Read its version, type, class and numeric representations.',
      'Use the binary form when working out subnet boundaries by hand.',
    ],
    notes: [
      'This analyses the address you enter; it does not detect your own IP or query a ' +
       'geolocation service.',
      'Private addresses are meaningful only within their own network — the same one exists on ' +
       'millions of others.',
      'The decimal integer form is what databases often store, since it sorts and ranges more ' +
       'efficiently than text.',
    ],
    faq: [
      ['What does an IP address starting with 192.168 mean?',
       'It is a private address, from the range reserved for local networks. Your router assigns ' +
       'them to devices in your home or office, and they are not routable on the public internet ' +
       '— which is why the same address exists simultaneously on millions of separate networks.'],
      ['Why does my computer show 169.254.x.x?',
       'That is a link-local address, assigned automatically when the machine failed to get one ' +
       'from a DHCP server. In practice it means the router did not answer — check the cable, ' +
       'the Wi-Fi connection, or the router itself.'],
      ['Are IP address classes still used?',
       'Not for routing. CIDR replaced classful addressing in 1993 because the fixed class ' +
       'boundaries wasted huge blocks of address space. The terms survive in conversation and in ' +
       'reference tools, but allocation and routing work on prefix lengths.'],
    ],
  },

  // ── ENCODING ──────────────────────────────────────────────────────────────────
  'binary-text': {
    intro:
      'Converts between text and binary in both directions, eight bits per byte, using UTF-8. ' +
      'Paste text to see its bits, or paste bits to read them back as text.',
    sections: [
      {
        h: 'Reading binary by eye',
        p: 'Each group of eight is one byte, most significant bit first. 01001000 is 72, capital H. ' +
           'The ASCII ranges are worth recognising: uppercase letters run 01000001 to 01011010 ' +
           '(65–90), lowercase 01100001 to 01111010 (97–122), and digits 00110000 to 00111001 ' +
           '(48–57). Notice that uppercase and lowercase differ only in the third bit — 65 and 97 ' +
           'are 32 apart, which is a single bit — and that is why older code converted case with a ' +
           'bitwise operation rather than a lookup.',
      },
      {
        h: 'Bytes, not characters',
        p: 'Anything outside ASCII takes more than one byte in UTF-8: two for most accented European ' +
           'letters and Cyrillic, three for Devanagari and CJK, four for emoji. So the number of ' +
           'eight-bit groups is not the number of characters you typed, and a decoder has to ' +
           'reassemble multi-byte sequences rather than treating each group as one character. A ' +
           'converter that got that wrong would turn any non-English text into mojibake on the round ' +
           'trip.',
      },
      {
        h: 'Where this is actually used',
        p: 'Teaching, mostly — seeing text as bits makes character encoding concrete in a way no ' +
           'explanation does. Puzzle hunts and capture-the-flag challenges, where binary is a ' +
           'standard first layer. And occasionally real debugging: when two strings look identical ' +
           'but compare unequal, the binary shows you the byte-order mark, the non-breaking space, ' +
           'or the Windows line ending that you cannot see on screen.',
      },
    ],
    steps: [
      'Paste text to convert it to binary, or binary to convert it back.',
      'Separators can be spaces, commas or newlines — all are accepted when decoding.',
      'Copy the result.',
    ],
    notes: [
      'Encoding is UTF-8, so output matches what other correct tools produce.',
      'Decoding needs a whole number of eight-bit groups; a truncated stream cannot be read.',
      'Everything runs in your browser.',
    ],
    faq: [
      ['How do I convert binary to text?',
       'Paste the binary in — the tool reads eight-bit groups separated by spaces, commas or ' +
       'newlines, and reassembles multi-byte UTF-8 sequences so non-English text comes back ' +
       'intact.'],
      ['Why does one character produce more than eight bits?',
       'Because it takes more than one byte in UTF-8. Only ASCII is a single byte; accented ' +
       'letters are two, most Asian scripts three, and emoji four.'],
      ['Is binary the same as ASCII?',
       'For plain English text the bytes are identical, since UTF-8 matches ASCII for the first ' +
       '128 characters. They diverge as soon as you use an accent, a curly quote or any ' +
       'non-Latin script — UTF-8 handles those and ASCII cannot represent them at all.'],
    ],
  },
  'braille-translator': {
    intro:
      'Converts text to Braille Unicode characters and back, letter by letter. It is a teaching ' +
      'and curiosity tool — producing something that could actually be embossed and read is a ' +
      'different and much larger problem, explained below.',
    sections: [
      {
        h: 'What Braille actually is',
        p: 'Each cell is a rectangle of six dot positions, two across and three down, giving 64 ' +
           'combinations. Unicode encodes all of them, plus an eight-dot extension used in ' +
           'computing, as the Braille Patterns block — which is why Braille can be represented as ' +
           'text at all. Louis Braille devised the system in 1824, aged fifteen, adapting a military ' +
           'night-writing code. Numbers are not separate cells: a number sign precedes the letters a ' +
           'to j, which then stand for 1 to 0.',
      },
      {
        h: 'Letter-for-letter is Grade 1, and it is not what readers use',
        p: 'This tool produces uncontracted Braille, where each printed letter becomes one cell. ' +
           'Fluent readers use Grade 2, which contracts common words and letter groups into single ' +
           'cells — “the”, “and”, “for” and around 180 others each have their own sign. Grade 2 is ' +
           'roughly a third shorter, which matters enormously when a printed page becomes several ' +
           'embossed ones. Converting to Grade 2 requires a contraction engine and knowledge of the ' +
           'language, and producing Grade 1 where Grade 2 is expected reads as oddly as writing ' +
           'English without contractions.',
      },
      {
        h: 'Do not use this for real accessibility',
        p: 'Braille Unicode characters displayed on a screen are not accessible to a blind reader — ' +
           'a screen reader announces them as “Braille pattern dots-1-2-5” or similar, which is far ' +
           'worse than the plain text it came from. Actual Braille access comes from a refreshable ' +
           'Braille display driven by the screen reader reading your ordinary text, or from an ' +
           'embosser fed properly transcribed files. Writing a web page in Braille characters makes ' +
           'it less accessible, not more.',
      },
      {
        h: 'Where it is genuinely useful',
        p: 'Learning the alphabet and understanding how the system works. Designing signage, where ' +
           'you need to see the cell patterns before sending artwork to a manufacturer — though the ' +
           'final file should come from a proper transcription service, and signage in most ' +
           'countries has legally specified dot dimensions and spacing. Puzzles and escape rooms. ' +
           'And explaining to sighted people why a Braille book is so much larger than a printed ' +
           'one.',
      },
    ],
    steps: [
      'Choose a direction — text to Braille, or Braille to text.',
      'Type or paste your input.',
      'Copy the result.',
    ],
    notes: [
      'Output is uncontracted (Grade 1) Braille — one cell per letter.',
      'Numbers use the number sign followed by the letters a–j.',
      'Braille characters on screen are not accessible to screen reader users; plain text is.',
    ],
    faq: [
      ['Is this real Braille?',
       'It is real Braille Unicode, and it is Grade 1 — one cell per printed letter. Fluent ' +
       'readers use Grade 2, which contracts common words and letter groups and is about a third ' +
       'shorter. For anything that will be embossed and read, use a proper transcription ' +
       'service.'],
      ['Can blind people read Braille characters on a website?',
       'No, and this surprises people. A screen reader announces each character by its dot ' +
       'pattern rather than the letter it represents. Blind readers access web pages through a ' +
       'screen reader reading the ordinary text, optionally to a refreshable Braille display. ' +
       'Plain text is the accessible format.'],
      ['How do numbers work in Braille?',
       'A number sign is placed before the digits, and the letters a through j then represent 1 ' +
       'through 0. So the cells for “ab” preceded by a number sign read as 12.'],
    ],
  },

  // ── GENERATORS ────────────────────────────────────────────────────────────────
  'random-number-gen': {
    intro:
      'Generates random numbers in a range you set, singly or in bulk, using the browser\'s ' +
      'cryptographic random source rather than an ordinary pseudo-random generator.',
    sections: [
      {
        h: 'Where the randomness comes from',
        p: 'crypto.getRandomValues draws from the operating system\'s entropy pool, which is seeded ' +
           'from genuinely unpredictable physical sources — timing jitter, interrupt patterns, ' +
           'hardware generators on modern processors. Math.random, by contrast, is a deterministic ' +
           'algorithm seeded once per page: statistically fine for a shuffle, and predictable in ' +
           'principle to anyone who can observe enough output. For a lottery, a giveaway or anything ' +
           'anyone might want to challenge, the cryptographic source costs nothing and removes the ' +
           'argument.',
      },
      {
        h: 'The modulo bias, and why careful code avoids it',
        p: 'Turning a random 32-bit number into a range by taking the remainder introduces a subtle ' +
           'unfairness whenever the range does not divide evenly into 2³² — the low values in the ' +
           'range come up very slightly more often. For dice and giveaways the effect is far too ' +
           'small to observe; for cryptographic key material it is a real weakness. The correct ' +
           'approach is rejection sampling: draw, discard anything in the uneven tail, and draw ' +
           'again.',
      },
      {
        h: 'Random does not mean evenly spread',
        p: 'A genuinely random sequence contains clusters and gaps, and people reliably judge such ' +
           'sequences to be “not random enough”. Ask a person to write twenty random digits and they ' +
           'will avoid repeats and spread things out, producing something a statistical test spots ' +
           'immediately. Expect repeats: in a bulk draw of 20 numbers from 1 to 100, a duplicate is ' +
           'more likely than not — the birthday problem — and that is correct behaviour, not a ' +
           'fault.',
      },
    ],
    steps: [
      'Set the minimum and maximum — both are included in the range.',
      'Choose how many numbers you want.',
      'Generate, and copy the result.',
    ],
    notes: [
      'Both endpoints are inclusive, so 1 to 6 can produce 1 and 6.',
      'Bulk draws are independent, so duplicates are expected and normal.',
      'Generated in your browser with crypto.getRandomValues — nothing is transmitted.',
    ],
    faq: [
      ['Are these numbers truly random?',
       'They come from the operating system\'s entropy pool via the browser\'s cryptographic ' +
       'generator, which is unpredictable in practice and not reproducible from any seed an ' +
       'observer could obtain. That is as good as software randomness gets without dedicated ' +
       'hardware.'],
      ['Can I get unique numbers with no duplicates?',
       'Not from a plain range draw, where each number is independent. For unique values, draw ' +
       'more than you need and remove duplicates, or shuffle a list of the whole range and take ' +
       'from the front — which is how a lottery draw works.'],
      ['Why did I get the same number twice in a row?',
       'Because each draw is independent and has no memory of the last. Repeats are expected: ' +
       'across enough draws they are guaranteed, and a sequence that never repeated would be ' +
       'evidence the generator was not random.'],
    ],
  },

  // ── JS ────────────────────────────────────────────────────────────────────────
  'js-minifier': {
    intro:
      'Strips comments and unnecessary whitespace from JavaScript to reduce its size. Useful ' +
      'for a quick look at what minification saves, and worth understanding against what a real ' +
      'build tool does.',
    sections: [
      {
        h: 'Whitespace removal is the smallest part of minification',
        p: 'A production minifier such as terser or esbuild does considerably more: it renames local ' +
           'variables to single letters, removes code that can never run, inlines single-use ' +
           'functions, collapses constant expressions, shortens boolean literals and drops function ' +
           'arguments that are never read. Whitespace and comments are typically 20–30% of a source ' +
           'file; full minification often reaches 60% or more, and mangled names are most of the ' +
           'difference.',
      },
      {
        h: 'Compression does most of the work anyway',
        p: 'Any competent server sends JavaScript with gzip or Brotli, and repeated whitespace ' +
           'compresses to almost nothing — so removing it before compression saves far less over the ' +
           'wire than the raw byte counts suggest. Where minification still pays is in what ' +
           'compression cannot fix: shorter identifiers genuinely reduce the compressed size, and ' +
           'less code means less for the browser to parse and compile, which on a mid-range phone is ' +
           'a real part of startup time.',
      },
      {
        h: 'Ship a source map, or debugging becomes guesswork',
        p: 'Minified code in a production error report gives you a stack trace pointing at column ' +
           '4,812 of a single line, which tells you nothing. A source map lets the browser and your ' +
           'error tracker map that back to the original file and line. Generate one in the build, ' +
           'upload it to your error service, and either keep it off the public server or serve it ' +
           'only to authenticated users if the source itself is sensitive.',
      },
      {
        h: 'Automatic semicolon insertion is where hand-minification bites',
        p: 'Joining lines changes where JavaScript would have inserted semicolons. Code that relies ' +
           'on them — legal, common, and fine when each statement is on its own line — can change ' +
           'meaning when collapsed, particularly when a line begins with a parenthesis or a bracket. ' +
           'A parser-based minifier understands this and inserts semicolons correctly; a regex-based ' +
           'one can silently produce different behaviour. Always test minified output rather than ' +
           'assuming.',
      },
    ],
    steps: [
      'Paste your JavaScript.',
      'Read the minified output and the size saved.',
      'Test it before deploying — and use a build tool for anything that ships regularly.',
    ],
    notes: [
      'This removes comments and whitespace; it does not rename variables or eliminate dead ' +
       'code.',
      'Minify from the original source, never from already-minified code.',
      'Your code stays in the browser — nothing is uploaded.',
    ],
    faq: [
      ['How much smaller will minification make my file?',
       'Whitespace and comment removal typically saves 20–30%. A full minifier that also mangles ' +
       'names and removes dead code commonly reaches 60% or more. After gzip the difference ' +
       'between the two narrows considerably, because whitespace compresses almost to nothing.'],
      ['Should I minify if my server already uses gzip?',
       'Yes, but for the parsing rather than the bytes. Compression handles whitespace well and ' +
       'cannot shorten identifiers, so minification still reduces the compressed payload — and ' +
       'less code means less for the browser to parse, which matters on slow devices.'],
      ['Can minified code be un-minified?',
       'Formatting restores the layout, but the original variable names and comments are gone ' +
       'from the file and cannot be recovered. A source map is the only thing that genuinely ' +
       'maps back to the original source.'],
    ],
  },

  // ── PDF ───────────────────────────────────────────────────────────────────────
  'jpg-to-pdf': {
    intro:
      'Combines JPEG images into a single PDF, one page per image. The common case is turning ' +
      'photographs of a document into something an institution will accept as a document.',
    sections: [
      {
        h: 'Photograph the pages properly first',
        p: 'Everything about the result is decided before the conversion. Lay the page flat, light ' +
           'it from the side rather than overhead so your own shadow stays out of frame, and shoot ' +
           'square-on rather than at an angle — perspective distortion is the single most common ' +
           'reason a submitted document gets rejected. Fill the frame with the page. Most phones ' +
           'have a document scanning mode that corrects perspective and flattens the lighting ' +
           'automatically, and its output is markedly better than a plain photograph.',
      },
      {
        h: 'The result is not searchable, and sometimes that matters',
        p: 'The pages are images, so the text cannot be selected, searched or copied, and automated ' +
           'systems cannot read it. Plenty of institutions specifically require searchable PDFs and ' +
           'will reject a photographed one. If that applies, run the output through OCR, or find the ' +
           'original digital file — a PDF exported from the source document is better than any ' +
           'photograph of a printout of it.',
      },
      {
        h: 'Size is the usual problem',
        p: 'Phone photographs are 3–8 MB each, so ten pages easily exceeds 40 MB — above the limit ' +
           'of most email systems and many upload forms. Resize before combining: a page of text is ' +
           'perfectly legible at around 1,500 pixels on its long edge, a fraction of what a modern ' +
           'camera produces. Doing it beforehand is far more effective than trying to compress the ' +
           'finished PDF, where the images are already embedded.',
      },
      {
        h: 'Page order and orientation',
        p: 'Pages appear in the order the files are selected, which is not always the order you ' +
           'expect — check before downloading, particularly if the filenames sort unusually (page10 ' +
           'before page2 is the classic). Mixing portrait and landscape photographs into a fixed ' +
           'page size leaves uneven margins; keeping the orientation consistent throughout produces ' +
           'something that reads as a document rather than an album.',
      },
    ],
    steps: [
      'Select your images in page order.',
      'Set the page size and orientation.',
      'Generate and download the PDF, checking the page order before you send it.',
    ],
    notes: [
      'Text in the output is not selectable or searchable — it is a picture of a page.',
      'Resize images to around 1,500 pixels on the long edge before combining, for a far ' +
       'smaller file.',
      'Processing happens in your browser, so identity documents and statements are never ' +
       'uploaded.',
    ],
    faq: [
      ['Why is my PDF so large?',
       'Because phone photographs are several megabytes each and are embedded at full ' +
       'resolution. Resize them to about 1,500 pixels on the long edge before combining — the ' +
       'text stays perfectly readable and the file typically drops by 80% or more.'],
      ['Can I make the text searchable?',
       'Not from images alone — that needs OCR, which is a separate step and introduces its own ' +
       'transcription errors. If a searchable PDF is required, exporting from the original ' +
       'document is always better than photographing a printout.'],
      ['What image format should I use?',
       'JPEG for photographs of documents, which is what a phone produces anyway. PNG for ' +
       'screenshots or anything with sharp text and line art, where JPEG compression makes small ' +
       'type look dirty.'],
    ],
  },
  'pdf-rotator': {
    intro:
      'Rotates PDF pages in 90-degree steps — all of them, or selected ones — and saves the ' +
      'result. The usual cause is a scanner that fed pages the wrong way round, or a document ' +
      'mixing portrait and landscape.',
    sections: [
      {
        h: 'Rotation is metadata, not pixels',
        p: 'A PDF page carries a rotation attribute, and changing it tells any reader to display the ' +
           'page turned. Nothing is re-rendered: the text stays selectable, vectors stay sharp, and ' +
           'the file size barely changes. This is why rotating is lossless and instant even on a ' +
           'large document, and why it is entirely reversible — rotate back and you have the ' +
           'original bytes in all but the attribute.',
      },
      {
        h: 'Why a page sometimes looks right and prints wrong',
        p: 'Some readers honour the rotation attribute and some historically did not, and a few ' +
           'printers apply their own auto-rotation on top. If a document displays correctly and ' +
           'prints sideways, the rotation is probably being applied twice or ignored once. The ' +
           'reliable test is to open the saved file in a different reader before sending it to a ' +
           'print shop.',
      },
      {
        h: 'Rotating scans of mixed orientation',
        p: 'A batch scan of a document containing both portrait and landscape pages — a report with ' +
           'a wide table in it — comes out with some pages sideways. Rotate only those pages rather ' +
           'than the whole document, which is why selective rotation exists. Read the page numbers ' +
           'off the preview first; scanners often insert blank pages from duplex scanning that shift ' +
           'the numbering from what you expect.',
      },
    ],
    steps: [
      'Choose your PDF.',
      'Select the pages to rotate, or all of them.',
      'Pick the direction, check the preview, and download.',
    ],
    notes: [
      'Rotation is lossless — it changes a page attribute, not the content.',
      'Rotating is fully reversible; the original content is untouched.',
      'The file is processed in your browser and never uploaded.',
    ],
    faq: [
      ['Does rotating a PDF reduce its quality?',
       'No. It changes a rotation attribute on the page rather than re-rendering anything, so ' +
       'text stays selectable, vectors stay sharp and the file size is essentially unchanged.'],
      ['Why does my rotated PDF still print the wrong way?',
       'Either the printer is applying its own auto-rotate on top, or a reader in the chain is ' +
       'ignoring the rotation attribute. Open the saved file in a second reader to check which, ' +
       'and look for an auto-rotate option in the print dialogue.'],
      ['Can I rotate just one page?',
       'Yes — select the pages you want rather than applying the rotation to the whole document. ' +
       'That is the normal case with batch scans, where only some pages came out sideways.'],
    ],
  },
  'pdf-to-text': {
    intro:
      'Extracts the text layer from a PDF in your browser. Whether it returns anything depends ' +
      'entirely on whether the PDF has text in it, which is the distinction most people ' +
      'discover at this point.',
    sections: [
      {
        h: 'Two kinds of PDF that look identical',
        p: 'A PDF generated from a document — exported from a word processor, a report generator, ' +
           'LaTeX — contains actual text objects, and extraction returns them. A scanned PDF ' +
           'contains photographs of pages, with no text anywhere in the file, and extraction returns ' +
           'nothing at all. Both look the same on screen. The quick test is to try selecting text in ' +
           'your PDF reader: if you can highlight a word, extraction will work; if your cursor draws ' +
           'a box, the page is an image and you need OCR.',
      },
      {
        h: 'Why the layout usually comes out wrong',
        p: 'A PDF stores each run of text with coordinates on the page, not as paragraphs in reading ' +
           'order. Extraction reconstructs a sequence from those positions, and it goes wrong ' +
           'exactly where you would expect: two-column layouts interleave the columns, tables lose ' +
           'their structure, headers and footers appear mid-paragraph, and hyphenated line breaks ' +
           'stay hyphenated. The text is all there; its order is a reconstruction, and the more ' +
           'visually complex the page, the worse the reconstruction.',
      },
      {
        h: 'What to do with a scanned document',
        p: 'Optical character recognition converts the page images to text. It is a genuinely ' +
           'different process, it takes far longer, and it introduces transcription errors — ' +
           'accuracy on a clean printed scan is high but never perfect, and on a photographed or ' +
           'skewed page it degrades quickly. Always proofread OCR output against the original for ' +
           'anything that matters, particularly numbers, where a misread digit is invisible and ' +
           'consequential.',
      },
      {
        h: 'Extraction is not permission',
        p: 'That a PDF\'s text can be extracted says nothing about whether you may use it. Copyright ' +
           'applies to the content regardless of the format it is in, and many documents carry usage ' +
           'restrictions that a technical measure does not enforce. Extracting for quotation, search ' +
           'or accessibility is ordinarily fine; republishing extracted text is the same act as ' +
           'republishing the document.',
      },
    ],
    steps: [
      'Choose your PDF.',
      'Extract, and copy or download the text.',
      'If nothing comes out, the pages are images — use OCR instead.',
    ],
    notes: [
      'Scanned PDFs contain no text layer and will return nothing; that is the file, not a ' +
       'fault in the tool.',
      'Multi-column layouts and tables lose their structure, because position is reconstructed ' +
       'rather than stored as reading order.',
      'The document is processed in your browser and never uploaded.',
    ],
    faq: [
      ['Why did my PDF produce no text?',
       'It is a scan — the pages are images with no text layer. Try selecting a word in your PDF ' +
       'reader: if you cannot, there is nothing to extract and you need OCR.'],
      ['Why is the extracted text out of order?',
       'Because a PDF stores text with page coordinates rather than in reading order, so the ' +
       'sequence has to be reconstructed. Two-column layouts, tables and pages with sidebars are ' +
       'where that reconstruction most often gets it wrong.'],
      ['Is my document uploaded anywhere?',
       'No. Extraction runs entirely in your browser, which is why this is a reasonable tool for ' +
       'contracts, statements and anything else you would not want on someone else\'s server.'],
    ],
  },

  // ── SECURITY ──────────────────────────────────────────────────────────────────
  'bcrypt-hash': {
    intro:
      'Generates a real bcrypt hash with a configurable cost factor and a cryptographically ' +
      'random salt embedded in the output. Unlike the general-purpose hashes, bcrypt is ' +
      'designed for exactly one job: storing passwords in a way that survives a database ' +
      'breach.',
    sections: [
      {
        h: 'Why a password hash has to be slow',
        p: 'SHA-256 is designed to be fast, and a GPU computes billions a second — which is the ' +
           'whole problem when the input is a human-chosen password from a list of a few hundred ' +
           'million. bcrypt is deliberately slow, and the cost factor controls how slow. Each ' +
           'increment doubles the work: cost 10 is roughly 100ms, cost 12 about 400ms, cost 14 about ' +
           '1.6 seconds. That is imperceptible for one login and catastrophic for an attacker trying ' +
           'a dictionary, which is precisely the asymmetry you are buying.',
      },
      {
        h: 'Reading the hash string',
        p: 'A bcrypt hash looks like $2b$12$R9h/cIPz0gi... and is self-describing. $2b$ is the ' +
           'algorithm version, 12 is the cost factor, the next 22 characters are the salt, and the ' +
           'rest is the digest. Everything needed to verify a password is in that one string, which ' +
           'is why you store a single column and never a separate salt. It also means the cost is ' +
           'recorded per hash, so you can raise it for new passwords and rehash old ones on next ' +
           'login without breaking anyone.',
      },
      {
        h: 'The salt is the reason rainbow tables fail',
        p: 'Every hash gets a fresh random salt, so the same password hashed twice produces two ' +
           'completely different strings. That defeats precomputed tables outright — an attacker ' +
           'cannot build one table and test it against every account, they must attack each password ' +
           'separately. It also means two users with the identical password have no visible ' +
           'relationship in your database, which unsalted hashes leak immediately.',
      },
      {
        h: 'Where bcrypt now sits',
        p: 'It has one real limitation: input is truncated at 72 bytes, so a very long passphrase is ' +
           'silently cut short — which matters if you allow long inputs and assume they all count. ' +
           'Argon2id is the current recommendation from OWASP and the winner of the Password Hashing ' +
           'Competition, because it is memory-hard as well as slow, which resists custom hardware in ' +
           'a way bcrypt does not. scrypt is a reasonable middle ground. bcrypt remains entirely ' +
           'acceptable and is not broken — if you already use it at a sensible cost, that is not the ' +
           'weak point in your system.',
      },
    ],
    steps: [
      'Enter the password to hash.',
      'Choose a cost factor — 12 is a reasonable default on current hardware.',
      'Generate, and store the entire output string in one column.',
    ],
    notes: [
      'The salt is generated randomly and embedded in the output — do not store one separately.',
      'Each cost increment doubles the computation time; aim for 200–500ms on your production ' +
       'hardware.',
      'bcrypt truncates input at 72 bytes, which matters if you accept long passphrases.',
    ],
    faq: [
      ['What cost factor should I use?',
       'Pick the highest that keeps a login under about 250ms on your actual production hardware ' +
       '— usually 12 today, sometimes 13 or 14 on fast servers. Measure rather than guessing: ' +
       'the right cost depends on your machine, and it should be raised as hardware improves.'],
      ['Why does the same password give a different hash each time?',
       'Because a fresh random salt is generated per hash and embedded in the output. That is ' +
       'the point: identical passwords produce unrelated hashes, so precomputed tables are ' +
       'useless and your database does not reveal which users share a password.'],
      ['Should I use bcrypt or Argon2?',
       'Argon2id for new systems — it is the current OWASP recommendation and memory-hard, which ' +
       'resists GPU and custom-hardware attacks better. bcrypt is not broken and remains a ' +
       'perfectly defensible choice, particularly if it is already in place; migrating is lower ' +
       'priority than most other security work.'],
    ],
  },

  // ── DEV ───────────────────────────────────────────────────────────────────────
  'cron-parser': {
    intro:
      'Explains a cron expression in plain language and shows when it will next run. Cron ' +
      'syntax is terse, easy to misread, and the mistakes are invisible until a job runs two ' +
      'thousand times more often than intended.',
    sections: [
      {
        h: 'The five fields, and the one that catches everyone',
        p: 'Minute, hour, day-of-month, month, day-of-week — in that order. The trap is that ' +
           'day-of-month and day-of-week are ORed, not ANDed, when both are set. So `0 0 1 * 1` does ' +
           'not mean “the first of the month if it is a Monday”, it means “the first of the month ' +
           'AND every Monday”. If you want one of them, set the other to `*`. This single rule is ' +
           'behind a large share of jobs that run more often than their author expected.',
      },
      {
        h: 'Step values and the difference between * and 0',
        p: '`*/5` in the minute field is every five minutes. `0` is on the hour, once. The common ' +
           'disaster is writing `* * * * *` when you meant `0 * * * *` — the first runs every ' +
           'minute, 1,440 times a day; the second runs hourly. The other frequent error is `*/5` in ' +
           'the hour field with `*` left in minutes, which runs every minute for one hour in five ' +
           'rather than once every five hours.',
      },
      {
        h: 'Time zones and the hours that repeat or vanish',
        p: 'Most cron implementations run in the server\'s local time, and many cloud schedulers — ' +
           'Vercel and GitHub Actions among them — use UTC regardless. Converting a local time to ' +
           'UTC can cross midnight, which means shifting the day fields too, not just the hour. ' +
           'Where cron does run in local time, daylight saving bites: a job at 02:30 either runs ' +
           'twice or not at all on the two days a year the clock jumps. Scheduling outside ' +
           '01:00–03:00 local avoids the question entirely.',
      },
      {
        h: 'Cron does not guarantee it ran',
        p: 'It fires a command at a time; it does not check that the last run finished, retry a ' +
           'failure, or tell you when nothing happened. Overlapping runs of a slow job are a classic ' +
           'production incident — use a lock file or a scheduler that enforces non-concurrency. And ' +
           'a job that silently stops running is invisible by design, which is why anything ' +
           'important should report completion to a dead-man\'s-switch monitor that alerts when the ' +
           'check-in does not arrive.',
      },
    ],
    steps: [
      'Paste your cron expression.',
      'Read the plain-language description and the next scheduled runs.',
      'Check the next-run times against what you intended — that is where the error shows up.',
    ],
    notes: [
      'Day-of-month and day-of-week are ORed when both are specified, not ANDed.',
      'Many cloud schedulers evaluate cron in UTC; convert local times before writing the ' +
       'expression.',
      'Some implementations add a sixth seconds field at the front — check which yours expects.',
    ],
    faq: [
      ['What does * * * * * mean?',
       'Every minute of every hour of every day — 1,440 runs a day. It is almost never what ' +
       'anyone wants, and it is the most common cron mistake. Hourly is `0 * * * *`; the leading ' +
       'zero is what pins it to the top of the hour.'],
      ['How do I run a job every 15 minutes?',
       '`*/15 * * * *`, which fires at :00, :15, :30 and :45. For every 15 minutes during ' +
       'working hours only, `*/15 9-17 * * 1-5`.'],
      ['Why did my job run on a day I did not expect?',
       'Almost certainly the day-of-month and day-of-week rule: when both are set to something ' +
       'other than `*`, cron runs if EITHER matches. Set the one you do not care about to `*`.'],
    ],
  },

  // ── DEVGEN ────────────────────────────────────────────────────────────────────
  'dockerfile-gen': {
    intro:
      'Generates a Dockerfile for common stacks, with the base image, dependency install and ' +
      'start command laid out in the right order. A starting point that already avoids the ' +
      'mistakes that make images slow to build and large to ship.',
    sections: [
      {
        h: 'Layer order is what makes builds fast',
        p: 'Docker caches each instruction and invalidates everything after the first change. So ' +
           'copying your whole source tree before installing dependencies means every source edit ' +
           'reinstalls every package — minutes per build, forever. Copy the manifest first ' +
           '(package.json, requirements.txt, go.mod), install, then copy the source. Dependencies ' +
           'change rarely and source changes constantly, so ordering by rate of change turns a ' +
           'three-minute rebuild into a five-second one.',
      },
      {
        h: 'Multi-stage builds, and why your image is 1.2 GB',
        p: 'A build needs compilers, dev dependencies and toolchains; running needs none of them. A ' +
           'multi-stage build compiles in one stage and copies only the artefacts into a clean ' +
           'runtime image, which routinely takes a Node image from 1.2 GB to under 200 MB and a Go ' +
           'one to under 20 MB. Smaller images pull faster, start faster, and — the part people ' +
           'forget — contain far less software for a vulnerability scanner to find.',
      },
      {
        h: 'Pin the base image, and do not run as root',
        p: '`FROM node:latest` means your build is not reproducible and can break overnight when the ' +
           'tag moves. Pin at least the major and minor version, and for anything that matters pin ' +
           'the digest. Separately: containers run as root by default, so a container escape starts ' +
           'with root on the host. Add a non-root user and `USER` it before the final command — two ' +
           'lines, and it is the single highest-value hardening step in a Dockerfile.',
      },
      {
        h: 'Secrets do not belong in the image',
        p: 'Every layer is stored and every layer is readable. A secret added in one instruction and ' +
           'deleted in the next is still in the image history, retrievable by anyone who pulls it — ' +
           'this is a recurring source of leaked credentials in public registries. Use build ' +
           'secrets, runtime environment variables, or a secrets manager. And write a ' +
           '`.dockerignore`: without one you will copy `.git`, `node_modules` and `.env` into the ' +
           'image, which is both bloat and a leak.',
      },
    ],
    steps: [
      'Pick your stack and runtime version.',
      'Review the generated stages and adjust the start command.',
      'Add a .dockerignore, pin the base image, and set a non-root USER before shipping it.',
    ],
    notes: [
      'Copy dependency manifests and install before copying source — it is the difference ' +
       'between a 5-second and a 3-minute rebuild.',
      'Multi-stage builds typically cut image size by 80% or more.',
      'Never put a secret in any layer; deleting it in a later instruction does not remove it.',
    ],
    faq: [
      ['Why is my Docker image so large?',
       'Usually build tooling left in the runtime image, plus a base image larger than needed. ' +
       'Use a multi-stage build so only the artefacts reach the final stage, and prefer a slim ' +
       'or alpine base where your dependencies allow it.'],
      ['Why does every build reinstall all my dependencies?',
       'Because the source is copied before the install step, so any source change invalidates ' +
       'the cached install layer. Copy only the manifest, run the install, then copy the source.'],
      ['Should containers run as root?',
       'No. It is the default and it is worth changing: create a non-root user and switch to it ' +
       'with USER before the final command. It costs two lines and removes the most direct path ' +
       'from a container compromise to host root.'],
    ],
  },
  'json-schema-gen': {
    intro:
      'Generates a JSON Schema from a sample document, inferring types and structure. A first ' +
      'draft for validating API payloads, config files and form submissions — which then needs ' +
      'the constraints only you know.',
    sections: [
      {
        h: 'What a schema buys you that a type does not',
        p: 'A TypeScript interface disappears at compile time and validates nothing at runtime. A ' +
           'JSON Schema is data, checked while the program runs, so it catches the case that ' +
           'actually breaks things: an upstream service changing its response shape. It is also ' +
           'portable — the same schema validates in JavaScript, Python, Go and Java, documents the ' +
           'API, and can generate types in several languages. One artefact, several jobs.',
      },
      {
        h: 'Inference gets you the shape and none of the rules',
        p: 'From one sample a generator can see that `age` is a number and `email` is a string. It ' +
           'cannot know that age must be between 0 and 130, that email needs a format constraint, ' +
           'that `status` is one of four values rather than any string, or which fields are ' +
           'genuinely optional. Those constraints are where the value is — a schema that only ' +
           'records types catches a field disappearing and nothing else. Treat the output as ' +
           'scaffolding and add `required`, `enum`, `minimum`, `maxLength` and `format` by hand.',
      },
      {
        h: 'additionalProperties is the decision to make deliberately',
        p: 'By default a schema permits properties it does not mention, so an object with unexpected ' +
           'extra fields validates happily. Setting `additionalProperties: false` rejects them, ' +
           'which catches typos in config files and stops unexpected data flowing through your ' +
           'system. The trade is that it breaks forward compatibility: a client validating a ' +
           'server\'s response strictly will reject it the day the server adds a field. Strict for ' +
           'config and inbound data you own; permissive for responses from services you do not ' +
           'control.',
      },
      {
        h: 'Choose the draft version and say which it is',
        p: 'JSON Schema has several drafts — Draft 7 is the most widely supported, and 2020-12 is ' +
           'current, with real differences in how `$ref`, `items` and tuple validation work. Declare ' +
           '`$schema` at the top so validators know which rules to apply, and check that your chosen ' +
           'library actually supports that draft. Mismatched assumptions here produce schemas that ' +
           'pass in one validator and fail in another.',
      },
    ],
    steps: [
      'Paste a representative JSON document.',
      'Copy the generated schema.',
      'Add required fields, enums, ranges and formats — that is where the validation lives.',
      'Decide on additionalProperties deliberately rather than leaving the default.',
    ],
    notes: [
      'Inference reads one sample: it cannot tell optional from present-this-time.',
      'Arrays are typed from their elements; an empty array gives no information at all.',
      'Declare $schema so validators apply the right draft\'s rules.',
    ],
    faq: [
      ['How do I mark fields as required?',
       'With a `required` array listing the property names, at the level of the object ' +
       'containing them. A generator cannot infer this from one sample — if you have several ' +
       'documents, the fields present in all of them are your candidates.'],
      ['What is the difference between JSON Schema and TypeScript types?',
       'TypeScript checks at compile time and vanishes at runtime; JSON Schema is data validated ' +
       'while the program runs, so it catches bad input from outside your code. They complement ' +
       'each other — several tools generate TypeScript types from a schema, which keeps one ' +
       'source of truth.'],
      ['Should I set additionalProperties to false?',
       'For configuration and data you control, yes — it catches typos and unexpected fields. ' +
       'For responses from a service you do not control, no: strict validation breaks the day ' +
       'they add a field, which they are entitled to do.'],
    ],
  },

  // ── HTML ──────────────────────────────────────────────────────────────────────
  'html-table-generator': {
    intro:
      'Builds an HTML table from rows and columns you define, with proper header cells and ' +
      'structure. The markup matters more than it looks — a table built out of divs is ' +
      'invisible to a screen reader user.',
    sections: [
      {
        h: 'What makes a table accessible',
        p: 'A screen reader announces a properly marked-up table\'s dimensions, then reads the column ' +
           'and row headers with each cell, so a blind user can navigate it the way a sighted user ' +
           'scans it. That depends on real elements: `th` with a `scope` of col or row, `thead` and ' +
           '`tbody` separating headers from data, and a `caption` naming what the table shows. A ' +
           'grid of divs with CSS gives none of that — it is read as an undifferentiated stream of ' +
           'text, and the relationships that make a table meaningful are simply gone.',
      },
      {
        h: 'Use tables for data, and nothing else',
        p: 'Tables were used for page layout throughout the 1990s and early 2000s because CSS could ' +
           'not do it. Flexbox and grid solved that fifteen years ago, and layout tables are now ' +
           'purely harmful: they confuse assistive technology, they resist responsive design, and ' +
           'they are verbose. The one surviving exception is HTML email, where client support is so ' +
           'poor that table layout remains the only reliable approach — and there you should add ' +
           '`role="presentation"` so screen readers ignore the structure.',
      },
      {
        h: 'Making a table work on a phone',
        p: 'A wide table cannot shrink to 360 pixels without becoming unreadable, and the usual ' +
           'responses are all compromises. Horizontal scroll inside a wrapper is the simplest and ' +
           'keeps the data intact — give the wrapper `overflow-x: auto` and a `tabindex` of 0 so ' +
           'keyboard users can scroll it. Stacking each row into a card works for a few columns and ' +
           'falls apart beyond that. Hiding columns loses data. Pick deliberately; there is no ' +
           'option that costs nothing.',
      },
      {
        h: 'The styling details that make a table readable',
        p: '`border-collapse: collapse` removes the doubled borders that make a table look like a ' +
           'spreadsheet from 1998. Right-align numeric columns so the digits line up and magnitudes ' +
           'are comparable at a glance, and use a tabular-figures font feature so the columns do not ' +
           'jitter. Generous vertical padding beats horizontal rules for separating rows. And zebra ' +
           'striping helps on wide tables and adds noise on narrow ones.',
      },
    ],
    steps: [
      'Set the number of rows and columns and fill in the cells.',
      'Mark the header row so it generates th elements with scope.',
      'Copy the markup, add a caption, and wrap it for horizontal scroll on small screens.',
    ],
    notes: [
      'Use th with scope="col" or scope="row" — that is what makes a table navigable by screen ' +
       'reader.',
      'A caption element names the table for everyone, and is better than a preceding ' +
       'paragraph.',
      'Never use a table for page layout, except inside HTML email.',
    ],
    faq: [
      ['Should I use a table or divs with CSS grid?',
       'A table for tabular data — anything with rows and columns whose relationships matter. ' +
       'Grid for page layout. A grid of divs carries no semantics, so a screen reader cannot ' +
       'associate a cell with its headers, and the table becomes unusable non-visually.'],
      ['How do I make a table responsive?',
       'The most reliable approach is a wrapper with overflow-x: auto and tabindex="0", which ' +
       'keeps the data intact and lets both mouse and keyboard users scroll. Stacking rows into ' +
       'cards works for narrow tables; hiding columns loses information.'],
      ['Are tables bad for SEO?',
       'No — data tables are fine and search engines read them. What was penalised was using ' +
       'tables for page layout, which is a different practice and obsolete for other reasons ' +
       'anyway. A well-marked-up table can even earn a rich result.'],
    ],
  },

  // ── CONVERTERS ────────────────────────────────────────────────────────────────
  'shoe-size-converter': {
    intro:
      'Converts shoe sizes between US, UK, EU and Japanese scales for men and women. It gets ' +
      'you into the right region — and the honest answer is that no conversion table reliably ' +
      'predicts fit across brands.',
    sections: [
      {
        h: 'Four scales that measure different things',
        p: 'UK sizes are based on barleycorns — a third of an inch — counting up from a child\'s ' +
           'zero. US sizes use the same increment offset differently, which is why a US men\'s size ' +
           'is roughly one more than the UK equivalent. EU sizes use Paris points, two thirds of a ' +
           'centimetre, and count the length of the last rather than the foot. Japanese sizing is ' +
           'the only sensible one: it states the foot length in centimetres. That is why EU-to-US ' +
           'conversions never come out as whole numbers and every table rounds differently.',
      },
      {
        h: 'Men\'s and women\'s scales are offset, and the offset is not universal',
        p: 'In US sizing a women\'s size is conventionally about 1.5 larger than the men\'s equivalent ' +
           'for the same foot, so a women\'s 8.5 is roughly a men\'s 7. In the UK the two scales are ' +
           'nearly the same number. The EU uses one scale for both. This is why unisex shoes are ' +
           'usually listed in men\'s sizing with a conversion note, and why buying across the men\'s ' +
           'and women\'s ranges of the same brand needs care.',
      },
      {
        h: 'Measure your foot instead',
        p: 'The reliable approach is length in centimetres: stand on paper with your heel against a ' +
           'wall, mark the longest toe, measure. Do it in the evening, when feet are largest, and ' +
           'measure both — most people have one foot up to half a size larger, and you fit the ' +
           'larger one. Compare that measurement against the brand\'s own size chart, which nearly ' +
           'every manufacturer publishes and which beats any general conversion table.',
      },
      {
        h: 'Why the same size fits differently',
        p: 'Shoes are built on a last, a foot-shaped form, and lasts differ enormously between ' +
           'brands and even between models from one brand. Running shoes are typically half a size ' +
           'large to allow for foot swell; dress shoes run small; Italian brands are famously ' +
           'narrow. Width is a separate dimension that most conversion tables ignore entirely, and a ' +
           'shoe of the right length in the wrong width fits badly. Read recent reviews for the ' +
           'specific model — they are more useful than any chart.',
      },
    ],
    steps: [
      'Choose men\'s or women\'s sizing.',
      'Enter the size you know.',
      'Read the equivalents — then check the brand\'s own chart before ordering.',
    ],
    notes: [
      'Japanese sizes are foot length in centimetres, which is the most directly useful number.',
      'Conversions round differently between tables, so a half size either way is within the ' +
       'noise.',
      'Width is a separate dimension that conversion tables do not address.',
    ],
    faq: [
      ['What is a US 9 in UK sizes?',
       'About a UK 8 in men\'s sizing — US men\'s sizes run roughly one number above UK. Women\'s ' +
       'scales differ: a US women\'s 9 is about a UK 7. Check the brand\'s chart, since the offset ' +
       'varies slightly between manufacturers.'],
      ['How do I measure my foot for shoe size?',
       'Stand on paper with your heel to a wall, mark the tip of your longest toe, and measure ' +
       'the distance in centimetres. Do it in the evening and measure both feet, fitting the ' +
       'larger. That number maps directly to Japanese sizing and to every brand\'s own chart.'],
      ['Why does the same size fit differently between brands?',
       'Because each is built on a different last. Running shoes tend to run half a size large, ' +
       'dress shoes small, and some brands are consistently narrow. Length is only one dimension ' +
       '— width matters as much and appears on almost no conversion table.'],
    ],
  },
  'clothing-size-converter': {
    intro:
      'Converts clothing sizes between US, UK, EU and international lettered scales. Like shoe ' +
      'sizes, the conversion is approximate — and here the underlying numbers are even less ' +
      'standardised.',
    sections: [
      {
        h: 'Clothing sizes are not standardised anywhere',
        p: 'There is no legal or industry standard behind a women\'s size 10. Manufacturers set their ' +
           'own measurements, and a study of high-street retailers has repeatedly found the same ' +
           'nominal size varying by several inches in the waist between brands. UK sizes run about 4 ' +
           'above US for women; EU sizes run about 30 above US. Those offsets are conventions rather ' +
           'than rules, and plenty of brands ignore them.',
      },
      {
        h: 'Vanity sizing, and why old clothes seem to shrink',
        p: 'Sizes have drifted larger for decades: a garment labelled size 8 today is several inches ' +
           'bigger than one labelled size 8 in the 1960s, because flattering a customer sells ' +
           'clothes. The practice is well documented and shows no sign of stopping, which means a ' +
           'size that fits from one era tells you little about another, and it is one reason vintage ' +
           'shopping requires measurements rather than labels.',
      },
      {
        h: 'Measure and compare against the garment chart',
        p: 'The numbers that actually predict fit are chest or bust, waist, hip and inside leg. ' +
           'Measure with a soft tape over light clothing, keeping it level and not pulled tight. ' +
           'Then use the specific brand\'s size chart, which nearly all publish — those charts are ' +
           'the only place sizes are defined, and comparing your measurements against them is far ' +
           'more reliable than any cross-country conversion.',
      },
      {
        h: 'Where lettered sizes come from',
        p: 'S, M, L and XL are ranges rather than measurements, and the ranges differ by brand, ' +
           'country and garment type. A medium in a fitted shirt and a medium in an oversized ' +
           'sweatshirt are not the same measurement even from the same manufacturer. Asian lettered ' +
           'sizes commonly run one to two sizes smaller than European or American ones, which is the ' +
           'most frequent surprise in online ordering.',
      },
    ],
    steps: [
      'Choose the garment type and the scale you know.',
      'Enter your size.',
      'Read the equivalents, then check the brand\'s measurements before ordering.',
    ],
    notes: [
      'No standard governs clothing sizes — conversions are conventions, not rules.',
      'Chest, waist, hip and inside leg predict fit; a size label does not.',
      'Asian lettered sizes commonly run one to two sizes smaller than Western equivalents.',
    ],
    faq: [
      ['What is a US size 8 in UK sizes?',
       'About a UK 12 for women — the conventional offset is four. EU would be around 38–40. ' +
       'Treat all of these as starting points and check the brand\'s own chart, since the offsets ' +
       'are conventions that plenty of manufacturers ignore.'],
      ['Why do sizes vary so much between brands?',
       'Because nothing requires them to agree. Each manufacturer sets its own measurements for ' +
       'each size, and vanity sizing has pushed them steadily larger over decades. The only ' +
       'reliable numbers are the garment measurements in the brand\'s own chart.'],
      ['How should I measure myself for clothing?',
       'Chest or bust at the fullest point, waist at the narrowest, hips at the fullest, and ' +
       'inside leg from crotch to floor. Use a soft tape, keep it level, do not pull tight, and ' +
       'measure over light clothing. Compare those figures to the brand\'s chart rather than ' +
       'relying on a size label.'],
    ],
  },

  // ── FORMATTERS ────────────────────────────────────────────────────────────────
  'php-formatter': {
    intro:
      'Reformats PHP with consistent indentation, brace placement and spacing. Useful for ' +
      'reading inherited code, tidying a snippet, or seeing what a file looks like under a ' +
      'standard style.',
    sections: [
      {
        h: 'PSR-12 is the standard worth following',
        p: 'PHP-FIG\'s PSR-12 settles the questions teams otherwise argue about: four spaces rather ' +
           'than tabs, opening brace on the same line for control structures and on its own line for ' +
           'classes and methods, one space after control keywords, visibility declared on every ' +
           'property and method. Practically every modern PHP project follows it, which means code ' +
           'written to it reads as familiar to anyone joining. It superseded PSR-2, which you will ' +
           'still see referenced in older documentation.',
      },
      {
        h: 'The closing tag you should omit',
        p: 'In a file containing only PHP, leave off the closing `?>`. Any whitespace or newline ' +
           'after it is sent to the browser as output, and that is the classic cause of “headers ' +
           'already sent” errors — a trailing blank line in an included file, invisible in the ' +
           'editor, breaking every redirect and cookie on the site. Omitting the tag makes the whole ' +
           'class of bug impossible. PSR-12 requires it.',
      },
      {
        h: 'Use a real tool in a real project',
        p: 'PHP-CS-Fixer and PHP_CodeSniffer with the PSR-12 ruleset do this properly, understand ' +
           'PHP\'s syntax, and can be run in a pre-commit hook and in CI so formatting never appears ' +
           'in a diff. A web formatter is for a snippet you are reading. The value of automatic ' +
           'formatting is not tidiness — it is that code review stops containing style arguments and ' +
           'starts being about the code.',
      },
    ],
    steps: [
      'Paste your PHP, including the opening tag.',
      'Read the formatted output.',
      'Copy it back, or set up PHP-CS-Fixer for anything you maintain.',
    ],
    notes: [
      'Formatting changes whitespace only — never behaviour.',
      'Omit the closing ?> in files containing only PHP; trailing whitespace after it breaks ' +
       'headers.',
      'Your code stays in the browser and is not transmitted.',
    ],
    faq: [
      ['What is PSR-12?',
       'The PHP-FIG coding style standard: four-space indentation, defined brace placement, ' +
       'explicit visibility, and rules for imports and line length. It is what nearly all modern ' +
       'PHP projects follow, and it superseded PSR-2.'],
      ['Should PHP files end with a closing tag?',
       'Not if the file is pure PHP. Any whitespace after `?>` is emitted as output and causes ' +
       '“headers already sent” errors that are extremely hard to trace, because the offending ' +
       'character is invisible. PSR-12 requires omitting it.'],
      ['Does formatting affect performance?',
       'No. Whitespace is discarded when the file is parsed, and opcode caches store the ' +
       'compiled result regardless. Formatting is entirely for the people reading the code.'],
    ],
  },
  'xml-formatter': {
    intro:
      'Reformats XML with consistent indentation and line breaks, and reports where the ' +
      'document is malformed. XML is strict in ways HTML is not, which makes a formatter a ' +
      'useful first diagnostic.',
    sections: [
      {
        h: 'Well-formed and valid are different claims',
        p: 'Well-formed means the syntax is correct: every element closed, properly nested, ' +
           'attributes quoted, one root element, special characters escaped. Valid means it ' +
           'additionally conforms to a schema — an XSD or DTD saying which elements may appear ' +
           'where. A formatter checks the first and knows nothing of the second, so a document that ' +
           'formats cleanly can still be rejected by a system expecting a particular structure.',
      },
      {
        h: 'Where whitespace is significant, and where it is not',
        p: 'Reformatting adds indentation inside elements, which is harmless for element-only ' +
           'content and not harmless for text. A document where `<name>John Smith</name>` becomes ' +
           'indented across lines now contains a name with newlines in it, which some parsers ' +
           'preserve. `xml:space="preserve"` marks content that must not be touched. Be careful ' +
           'reformatting documents with mixed content — elements containing both text and child ' +
           'elements are where this bites.',
      },
      {
        h: 'The five entities, and the namespace problem',
        p: 'XML defines exactly five entities: &amp;amp;, &amp;lt;, &amp;gt;, &amp;quot; and ' +
           '&amp;apos;. HTML entities such as &amp;nbsp; are not defined and cause a parse error, ' +
           'which is the most common failure when HTML content is pasted into an XML feed. ' +
           'Namespaces are the other frequent confusion: a prefix is only meaningful through its ' +
           'declaration, so the same document can use different prefixes for the same namespace and ' +
           'be identical in meaning.',
      },
    ],
    steps: [
      'Paste your XML.',
      'Read the formatted output, or the error and its position.',
      'Copy the result — checking any elements whose text content matters.',
    ],
    notes: [
      'Only five entities are defined in XML; HTML entities like &nbsp; will not parse.',
      'Indentation added inside text-bearing elements changes their content — check mixed ' +
       'content carefully.',
      'Formatting checks well-formedness, not conformance to a schema.',
    ],
    faq: [
      ['What is the difference between well-formed and valid XML?',
       'Well-formed means syntactically correct — closed, nested and quoted properly. Valid ' +
       'means it also matches a schema defining which elements may appear and where. A formatter ' +
       'checks well-formedness only.'],
      ['Why does my XML fail with an entity error?',
       'Almost certainly an HTML entity such as &nbsp;. XML defines only &amp;, &lt;, &gt;, ' +
       '&quot; and &apos; — anything else must be a numeric character reference or declared in a ' +
       'DTD.'],
      ['Will formatting break my XML?',
       'It can, for elements containing text, because added indentation becomes part of that ' +
       'text. Documents that are purely structural reformat safely; check anything with mixed ' +
       'content, and respect xml:space="preserve" where it appears.'],
    ],
  },

  // ── LEGAL ─────────────────────────────────────────────────────────────────────
  'terms-conditions-gen': {
    intro:
      'Drafts a standard set of website terms and conditions from your company name, site, ' +
      'contact address and governing jurisdiction. A serviceable starting document — and a ' +
      'template, not legal advice, which matters more here than on any other page of this site.',
    sections: [
      {
        h: 'What terms and conditions actually do',
        p: 'They form a contract between you and your users, and their practical job is to limit ' +
           'your liability, set out acceptable use, state who owns the content, and say which ' +
           'country\'s courts decide a dispute. That last clause is the one people skip and the one ' +
           'that decides everything else: without a governing law and jurisdiction clause, a dispute ' +
           'with a user abroad becomes a question about where it can even be heard.',
      },
      {
        h: 'Browsewrap, clickwrap, and enforceability',
        p: 'A link in your footer that a user never interacts with — browsewrap — is frequently held ' +
           'unenforceable, because courts ask whether the user had reasonable notice and agreed. ' +
           'Clickwrap, where a user ticks a box or presses a button next to a visible link before ' +
           'proceeding, has been upheld far more consistently. If your terms matter, put them behind ' +
           'an affirmative action at sign-up and keep a record of when each user accepted which ' +
           'version. A generated document nobody agreed to protects nobody.',
      },
      {
        h: 'Where a template is genuinely not enough',
        p: 'If you take payment, hold personal data, operate in the EU or UK, serve consumers rather ' +
           'than businesses, allow user-generated content, or run anything subscription-based, the ' +
           'generic clauses here will not cover your obligations. Consumer protection law overrides ' +
           'contrary terms in most jurisdictions, so a clause disclaiming all liability to a ' +
           'consumer is commonly void rather than merely unenforceable. Data protection is governed ' +
           'separately and needs a privacy policy, not a terms clause.',
      },
      {
        h: 'Keep it honest and keep it current',
        p: 'Terms that describe practices you do not follow are worse than none — they are evidence ' +
           'of what you said you would do. Read the generated document and delete anything that does ' +
           'not describe your site: a clause about user accounts on a site with no accounts, or ' +
           'about refunds where you sell nothing. Date it, version it, and tell users when it ' +
           'changes, which several jurisdictions require for material changes.',
      },
    ],
    steps: [
      'Enter your company name, website, contact email and governing jurisdiction.',
      'Generate and read the whole document — every clause of it.',
      'Delete what does not apply to you and add what is missing.',
      'Have it reviewed before you rely on it, and present it as clickwrap rather than a footer ' +
       'link.',
    ],
    notes: [
      'This is a template, not legal advice, and it is not tailored to your business or ' +
       'jurisdiction.',
      'Terms only bind users who demonstrably agreed to them — a footer link often is not ' +
       'enough.',
      'Data protection needs a separate privacy policy; terms and conditions do not cover it.',
    ],
    faq: [
      ['Are generated terms and conditions legally binding?',
       'They can be, if the user agreed to them in a way a court accepts — typically a tick box ' +
       'or button at sign-up with the terms visible, and a record of who agreed to which ' +
       'version. The document\'s origin matters less than its content and the evidence of ' +
       'acceptance.'],
      ['Do I need terms and conditions for a website?',
       'Not usually required by law for a simple informational site, but strongly advisable as ' +
       'soon as you have accounts, payments, user content or downloads. A privacy policy, by ' +
       'contrast, is legally required nearly everywhere the moment you collect personal data, ' +
       'including through analytics.'],
      ['Can I copy another company\'s terms?',
       'No. They are a copyrighted work, and they describe that company\'s business, jurisdiction ' +
       'and risks rather than yours. Copying them produces a document that is both an ' +
       'infringement and a poor fit — which is what a generator avoids, as a starting point to ' +
       'edit.'],
    ],
  },
  'nda-gen': {
    intro:
      'Drafts a simple non-disclosure agreement — mutual or one-way — from both parties\' names, ' +
      'an effective date and a term. Enough to paper a conversation about a project; not a ' +
      'substitute for advice on anything substantial.',
    sections: [
      {
        h: 'Mutual or one-way, and how to choose',
        p: 'A one-way NDA protects one party disclosing to another: an employer briefing a ' +
           'contractor, a company sending a specification to a supplier. A mutual NDA protects both, ' +
           'which is right whenever the conversation might run in either direction — a partnership ' +
           'discussion, acquisition talks, two companies exploring integration. Mutual is the easier ' +
           'one to get signed, because it asks the other side for nothing you have not also given, ' +
           'and it is usually the honest description of an exploratory conversation anyway.',
      },
      {
        h: 'The clauses that actually matter',
        p: 'The definition of confidential information: too narrow and real secrets fall outside it, ' +
           'too broad and courts decline to enforce it. The standard exclusions — information ' +
           'already public, already known, independently developed, or lawfully received from ' +
           'someone else — which are expected and whose absence makes an agreement look ' +
           'unreasonable. The term: how long obligations last, commonly two to five years, sometimes ' +
           'indefinite for trade secrets. And what happens at the end: return or destruction of ' +
           'materials.',
      },
      {
        h: 'What an NDA cannot do',
        p: 'It cannot stop someone using general skill and knowledge they gained, which is a real ' +
           'limit on protecting ideas rather than documents. It cannot prevent disclosure legally ' +
           'compelled by a court or regulator. In several jurisdictions it cannot lawfully prevent ' +
           'reporting unlawful conduct, and in the US the Defend Trade Secrets Act requires a ' +
           'whistleblower notice — an NDA purporting to silence a report of a crime can be void and ' +
           'can itself be unlawful. And practically: enforcement means proving breach and proving ' +
           'loss, both hard and expensive.',
      },
      {
        h: 'It is a starting point for a conversation, not a shield',
        p: 'An NDA signed before a meeting is normal professional hygiene and worth having. If what ' +
           'you are protecting is genuinely valuable — an acquisition, a patent-pending process, a ' +
           'substantial commercial arrangement — the agreement should be drafted for that situation ' +
           'by someone who will be accountable for it. Template NDAs are for ordinary exploratory ' +
           'conversations, and that is a real and common use.',
      },
    ],
    steps: [
      'Choose mutual or one-way.',
      'Enter both parties\' legal names, the effective date and the term.',
      'Generate, read it in full, and adjust the definition of confidential information to fit ' +
       'what you are actually sharing.',
      'Have both parties sign and each keep a copy.',
    ],
    notes: [
      'This is a template, not legal advice, and it is not tailored to your jurisdiction.',
      'Use each party\'s full legal entity name, not a trading name — an agreement with a ' +
       'non-existent entity is difficult to enforce.',
      'An NDA cannot lawfully prevent reporting unlawful conduct, whatever it says.',
    ],
    faq: [
      ['What is the difference between a mutual and a one-way NDA?',
       'One-way protects information flowing in a single direction; mutual protects both ' +
       'parties. Mutual is the right choice for any exploratory conversation where either side ' +
       'might share something, and it is generally easier to get signed.'],
      ['How long should an NDA last?',
       'Two to five years covers most commercial situations. Trade secrets are sometimes ' +
       'protected indefinitely, but very long terms on ordinary business information can be seen ' +
       'as unreasonable. Match the term to how long the information stays genuinely valuable.'],
      ['Is a template NDA enough?',
       'For an ordinary exploratory conversation, generally yes — that is what NDAs mostly do. ' +
       'For an acquisition, a substantial partnership, or anything where the information is the ' +
       'core of your business, have one drafted for the situation. The cost is small next to ' +
       'what it protects.'],
    ],
  },

  // ── DEV ───────────────────────────────────────────────────────────────────────
  'unix-timestamp': {
    intro:
      'Converts between Unix timestamps and human-readable dates in both directions, including ' +
      'the current time. The format almost every system stores time in, and the one nobody can ' +
      'read at a glance.',
    sections: [
      {
        h: 'Seconds or milliseconds',
        p: 'A Unix timestamp counts from midnight UTC on 1 January 1970. Unix tools, databases and ' +
           'most APIs use seconds; JavaScript\'s Date.now() and Java use milliseconds. Ten digits is ' +
           'seconds, thirteen is milliseconds — that is the quick check. Feeding milliseconds to ' +
           'something expecting seconds lands you in the year 56000; the reverse lands you in ' +
           'January 1970, which is why a date of 1 Jan 1970 in a UI almost always means a timestamp ' +
           'arrived as zero or in the wrong unit.',
      },
      {
        h: 'It is always UTC, which is the point',
        p: 'A timestamp is an absolute instant with no time zone attached. That is exactly why it is ' +
           'the right thing to store: no ambiguity, no daylight saving, no locale. Time zones are a ' +
           'presentation concern, applied when you display the value to a particular person. Storing ' +
           'local times is the root of an enormous class of bugs — the hour that happens twice in ' +
           'autumn, the hour that does not exist in spring, and the server that was moved to a ' +
           'different region.',
      },
      {
        h: 'The 2038 problem is real and mostly handled',
        p: 'A signed 32-bit timestamp overflows on 19 January 2038, wrapping to 1901. Modern systems ' +
           'use 64-bit values, which are good for 292 billion years, and the Linux kernel completed ' +
           'its transition years ago. What remains is embedded hardware, old file formats and ' +
           'database columns typed as 32-bit integers — the same shape of problem as Y2K, quietly ' +
           'fixed in most places and still lurking in a few.',
      },
      {
        h: 'Leap seconds, and what Unix time does about them',
        p: 'Unix time pretends leap seconds do not exist: a day is always exactly 86,400 seconds, so ' +
           'when one is inserted the same timestamp is used twice. That keeps the arithmetic simple ' +
           'and makes the value very slightly not a count of elapsed seconds. It matters for ' +
           'high-precision timing and not for anything else — and the practice of inserting them is ' +
           'being phased out by 2035.',
      },
    ],
    steps: [
      'Paste a timestamp to convert it to a date, or pick a date to get its timestamp.',
      'Check whether your source uses seconds or milliseconds — 10 digits against 13.',
      'Copy the value you need.',
    ],
    notes: [
      'Timestamps are always UTC; the time zone is applied when displaying, not when storing.',
      'Ten digits is seconds, thirteen is milliseconds.',
      'Zero is 1 January 1970 — seeing that date in a UI usually means a missing or mis-parsed ' +
       'value.',
    ],
    faq: [
      ['Is a Unix timestamp in seconds or milliseconds?',
       'Depends on the source. Unix tools, most databases and most APIs use seconds; JavaScript ' +
       'and Java use milliseconds. Count the digits: ten is seconds, thirteen is milliseconds.'],
      ['What time zone is a Unix timestamp in?',
       'UTC, always. It is an absolute instant with no zone attached, which is why it is the ' +
       'right format to store. Convert to a local time only when displaying it to someone.'],
      ['What is the 2038 problem?',
       'A signed 32-bit timestamp runs out on 19 January 2038 and wraps to 1901. 64-bit systems ' +
       'are unaffected and are now the norm; the remaining risk is in embedded devices, old file ' +
       'formats and database columns still typed as 32-bit integers.'],
    ],
  },

  // ── HTML ──────────────────────────────────────────────────────────────────────
  'html-minifier': {
    intro:
      'Strips comments and unnecessary whitespace from HTML to reduce its size. Useful for ' +
      'seeing what minification saves, and worth knowing where HTML whitespace is significant ' +
      'before you ship the result.',
    sections: [
      {
        h: 'HTML whitespace is not always insignificant',
        p: 'Unlike JSON, HTML has places where whitespace matters. A space between two inline ' +
           'elements is a real space in the rendered output, so removing it runs words together — ' +
           '`<b>one</b> <i>two</i>` becomes “onetwo”. Content inside `<pre>` and `<textarea>` is ' +
           'preserved verbatim and must not be touched at all. Elements with `white-space: pre` in ' +
           'CSS have the same constraint, which a minifier cannot see because it does not read your ' +
           'stylesheet. This is why aggressive HTML minification occasionally produces visible ' +
           'layout bugs where JavaScript minification does not.',
      },
      {
        h: 'The savings are smaller than they look',
        p: 'Removing whitespace from a typical HTML document saves 10–20% of the raw bytes, and most ' +
           'of that is recovered by gzip or Brotli anyway, since repeated indentation compresses ' +
           'extremely well. The real page-weight wins are elsewhere: images, which are usually the ' +
           'bulk of a page; JavaScript, which costs parse and execution time as well as bytes; and ' +
           'web fonts. Minifying HTML is worth doing in a build because it is free, and it is not ' +
           'where a slow page gets fixed.',
      },
      {
        h: 'Do it in the build, never by hand',
        p: 'Minified HTML is unreadable and undiffable, so it should be a build output rather than ' +
           'something you commit. Every static site generator and bundler does it, as do most CDNs ' +
           'at the edge. If you are minifying by hand and pasting the result back into your source, ' +
           'you have made the file permanently harder to maintain to save bytes that compression was ' +
           'already handling.',
      },
    ],
    steps: [
      'Paste your HTML.',
      'Read the minified output and the size saved.',
      'Check inline elements and any pre or textarea content before using it.',
    ],
    notes: [
      'Whitespace between inline elements is significant — removing it joins words together.',
      'Content in pre and textarea must be preserved exactly.',
      'Keep minification in your build; do not commit minified HTML as source.',
    ],
    faq: [
      ['How much smaller does minifying HTML make a page?',
       'Typically 10–20% of the raw bytes, and considerably less after gzip or Brotli, which ' +
       'already compress repeated whitespace very efficiently. Images and JavaScript are where ' +
       'page weight actually lives.'],
      ['Can minifying HTML break my page?',
       'It can. Whitespace between inline elements is rendered, so removing it joins words; ' +
       'content in pre and textarea must be left alone; and elements styled with white-space: ' +
       'pre are invisible to a minifier. Check the rendered result rather than only the markup.'],
      ['Should I minify HTML if my server uses compression?',
       'It is worth keeping in a build because it costs nothing, but expect a small gain — ' +
       'compression already handles whitespace well. Do not spend effort here while images and ' +
       'scripts are unoptimised.'],
    ],
  },

  // ── JS ────────────────────────────────────────────────────────────────────────
  'json-to-js': {
    intro:
      'Converts JSON into a JavaScript object literal — unquoting keys that are valid ' +
      'identifiers, and switching to single quotes. Useful when pasting API data into source ' +
      'code as a fixture or a default.',
    sections: [
      {
        h: 'What actually differs between the two',
        p: 'JSON is a strict subset of JavaScript object syntax with the corners removed. JavaScript ' +
           'allows unquoted keys where they are valid identifiers, single quotes, trailing commas, ' +
           'comments, template literals, functions as values, `undefined`, `NaN`, `Infinity` and ' +
           'comment blocks. JSON allows none of those — double-quoted keys and strings, no trailing ' +
           'comma, no comments, `null` and nothing else. Converting JSON to JS is therefore always ' +
           'safe; converting JS to JSON is not.',
      },
      {
        h: 'Keys that cannot be unquoted',
        p: 'A key only loses its quotes if it is a valid JavaScript identifier: letters, digits, ' +
           'underscore and dollar, not starting with a digit. So `content-type`, `user name` and ' +
           '`2fa` keep their quotes and are accessed with bracket notation. Reserved words are fine ' +
           'as property names in modern JavaScript, so `class` and `default` can be unquoted, though ' +
           'quoting them anyway reads more clearly.',
      },
      {
        h: 'Numbers are where a round trip loses data',
        p: 'JSON numbers become IEEE-754 doubles when parsed, so an integer beyond 2⁵³ loses ' +
           'precision — a 19-digit id like a Twitter snowflake or a database bigint comes back with ' +
           'its last digits changed, silently. If your data contains such values, keep them as ' +
           'strings or use BigInt literals in the JavaScript, which JSON cannot represent at all. ' +
           'This is the one conversion hazard worth checking for before pasting an API response into ' +
           'code.',
      },
    ],
    steps: [
      'Paste your JSON.',
      'Copy the JavaScript object literal.',
      'Check any very large integers, which lose precision as JSON numbers.',
    ],
    notes: [
      'Keys that are not valid identifiers keep their quotes — that is correct, not a ' +
       'limitation.',
      'Integers beyond 2⁵³ lose precision; keep them as strings.',
      'Conversion runs in your browser; API data is not transmitted.',
    ],
    faq: [
      ['Is JSON valid JavaScript?',
       'Essentially yes — JSON is a subset of JavaScript object literal syntax, with two ' +
       'historical edge cases around unescaped line separators that were fixed in ES2019. ' +
       'Pasting JSON into JavaScript as an object literal works.'],
      ['Why do some of my keys still have quotes?',
       'Because they are not valid JavaScript identifiers. Anything containing a hyphen or ' +
       'space, or starting with a digit, must stay quoted and is accessed with bracket notation ' +
       'rather than a dot.'],
      ['Can I convert JavaScript back to JSON?',
       'Only if it contains nothing JSON lacks. Functions, undefined, NaN, Infinity, comments, ' +
       'trailing commas and BigInt values have no JSON equivalent, so a JavaScript object using ' +
       'any of them cannot round-trip.'],
    ],
  },

  // ── PDF ───────────────────────────────────────────────────────────────────────
  'pdf-page-numbering': {
    intro:
      'Adds page numbers to a PDF, with control over position and starting number. Useful for ' +
      'documents assembled from several sources, where the numbering either restarted or never ' +
      'existed.',
    sections: [
      {
        h: 'Position, and why the outer corner',
        p: 'Bottom centre is the safe default and works for anything. For a document that will be ' +
           'printed double-sided and bound, the convention is the outer corner — which alternates ' +
           'between left and right as the reader turns pages, so the number is always visible at the ' +
           'edge without opening the book flat. Avoid the inner margin entirely: on a bound document ' +
           'that is where the numbers disappear into the gutter.',
      },
      {
        h: 'Starting numbers and front matter',
        p: 'Formal documents conventionally number front matter — title page, contents, foreword — ' +
           'in lowercase Roman numerals and start Arabic numbering at the first page of the body. If ' +
           'your PDF already contains front matter, set the starting number so the body\'s page 1 ' +
           'lands where a reader would expect, which usually means starting the count several pages ' +
           'in. Court filings, theses and formal reports often have rules about this that are worth ' +
           'checking before you commit.',
      },
      {
        h: 'Numbering is drawn on, not structural',
        p: 'The number is added as page content at fixed coordinates. It does not change the PDF\'s ' +
           'internal page labels, so a reader\'s page navigation box may still show a different ' +
           'number from the one printed on the page — which is exactly the mismatch that makes a ' +
           'numbered PDF confusing to navigate. Where it matters, some tools can set the document\'s ' +
           'page labels as well; visually adding numbers is the common case and usually sufficient.',
      },
    ],
    steps: [
      'Choose your PDF.',
      'Pick the position and the starting number.',
      'Check the preview, particularly the first and last pages, then download.',
    ],
    notes: [
      'Numbers are drawn onto the page content and cannot be removed afterwards — keep the ' +
       'original.',
      'For double-sided printing, the outer corner alternates sides; avoid the inner margin.',
      'Processing runs in your browser and the file is never uploaded.',
    ],
    faq: [
      ['Can I start numbering from a page other than the first?',
       'Yes — set the starting number so the body\'s first page shows 1. That is the normal ' +
       'arrangement for documents with a title page and contents, which are conventionally ' +
       'numbered separately or not at all.'],
      ['Where should page numbers go?',
       'Bottom centre is safe for everything. For bound double-sided documents, the outer corner ' +
       'is the convention, since it stays visible at the edge. Never the inner margin, where ' +
       'binding swallows it.'],
      ['Can page numbers be removed later?',
       'Not easily — they become part of the page content rather than metadata. Keep the ' +
       'unnumbered original, which is the only reliable way back.'],
    ],
  },
  'pdf-to-jpg': {
    intro:
      'Renders each page of a PDF as a JPEG image. The right choice when the pages are ' +
      'photographic; PNG is better when they are text, and the difference is visible.',
    sections: [
      {
        h: 'JPEG or PNG for a page of text',
        p: 'JPEG compresses smooth tonal variation well and sharp edges badly, so text rendered to ' +
           'JPEG picks up coloured fringing around the letters — most visible at small sizes and on ' +
           'thin strokes. A page of text often comes out both larger and worse as a JPEG than as a ' +
           'PNG, because PNG compresses the large flat white areas almost to nothing. Use JPEG when ' +
           'the pages are photographs or scans of photographs, and PNG when they are documents.',
      },
      {
        h: 'Resolution decides everything downstream',
        p: 'Rendering scale determines the output dimensions. 1× to 2× suits screen use; print wants ' +
           'around 300 dpi, which for A4 is roughly 2,480×3,508 pixels. Rendering higher than the ' +
           'source\'s own detail adds file size and no sharpness — a PDF whose content is already a ' +
           'low-resolution scan will not improve. Each rendered page also occupies its full ' +
           'uncompressed size in browser memory before encoding, which is why long documents at high ' +
           'resolution exhaust a tab.',
      },
      {
        h: 'This is a one-way conversion',
        p: 'Rendering executes the page\'s drawing instructions onto a bitmap, so text stops being ' +
           'selectable and searchable and vectors stop being scalable. There is no route back: ' +
           'reassembling the images into a PDF gives you a picture of a document. Keep the original ' +
           'whenever you might need to search, edit or extract from it.',
      },
    ],
    steps: [
      'Choose your PDF.',
      'Set the scale — higher for print, lower for screen or long documents.',
      'Render and download the pages you need.',
    ],
    notes: [
      'For pages of text, PNG is usually both smaller and sharper than JPEG.',
      'Output is raster: text is no longer selectable or searchable.',
      'Rendering happens locally; the PDF is never uploaded.',
    ],
    faq: [
      ['Should I convert PDF pages to JPG or PNG?',
       'JPEG for photographic pages, PNG for documents. JPEG compression puts visible fringing ' +
       'around text, and a text page frequently ends up larger as a JPEG than as a PNG because ' +
       'PNG handles the flat white background so efficiently.'],
      ['What resolution should I render at?',
       '1× to 2× for screen, around 300 dpi for print — roughly 2480×3508 pixels for an A4 page. ' +
       'Rendering beyond the detail actually present in the PDF only grows the file.'],
      ['Can I convert the images back to a PDF?',
       'You can combine them, but the result is a picture of a document: no selectable text, no ' +
       'search. Keep the original PDF if any of that matters.'],
    ],
  },

  // ── CONTENT ───────────────────────────────────────────────────────────────────
  'blog-title-gen': {
    intro:
      'Generates headline options from a topic and a format — lists, how-tos, questions, ' +
      'comparisons. A tool for escaping a blank page, not for choosing the headline you ' +
      'publish.',
    sections: [
      {
        h: 'Write the headline for the search result, not the page',
        p: 'Most people meet your headline in a search result or a feed, where it competes with nine ' +
           'others and is truncated by width. Google cuts titles at roughly 600 pixels, commonly ' +
           'around 55–60 characters. So the specific, distinguishing words belong at the front: not ' +
           '“A Complete Guide to Understanding How to Merge PDFs” but “Merge PDFs: 4 methods ' +
           'compared”. Everything after the cut is decoration.',
      },
      {
        h: 'The formats that work, and why',
        p: 'Numbered lists set an expectation of scope and finiteness, which is why they keep ' +
           'working despite being tired. How-tos match the way people phrase searches. Questions ' +
           'match it even more directly, and can earn a featured snippet if the article answers them ' +
           'in the first paragraph. Comparisons capture high-intent traffic from people close to a ' +
           'decision. What fails is vagueness — a headline that could sit on a hundred other ' +
           'articles gives nobody a reason to choose yours.',
      },
      {
        h: 'Curiosity gaps and the bounce they cause',
        p: 'Withholding the answer to force a click raises the click-through rate and raises the ' +
           'bounce rate with it, and search engines measure the second. A headline that promises ' +
           'more than the article delivers loses more in reduced dwell time and lost trust than it ' +
           'gains in clicks. Specificity outperforms intrigue over any period longer than a week — ' +
           'name the number, name the outcome, name who it is for.',
      },
      {
        h: 'Match the headline to search intent',
        p: 'Someone searching “merge pdf” wants a tool, not an article about merging PDFs, and an ' +
           'essay will lose to a tool page every time. Someone searching “best way to merge pdf ' +
           'without losing quality” wants an explanation. Look at what currently ranks for your ' +
           'target phrase before writing the headline: the results tell you what the search engine ' +
           'has concluded people want, and a headline that fights that conclusion does not win.',
      },
    ],
    steps: [
      'Enter your topic and choose a format.',
      'Generate a batch and pick a direction rather than a finished line.',
      'Rewrite it with a specific number, outcome or audience.',
      'Check it survives truncation at about 60 characters.',
    ],
    notes: [
      'Aim for 50–60 characters so the headline survives truncation in search results.',
      'Front-load the distinguishing words; everything after the cut is invisible.',
      'The page title and the H1 can differ — write the title for search and the H1 for the ' +
       'reader.',
    ],
    faq: [
      ['How long should a blog title be?',
       '50–60 characters for the page title, since Google truncates by pixel width around there. ' +
       'The on-page H1 can be longer, because it is read in context rather than in a competitive ' +
       'list — and it is entirely normal for the two to differ.'],
      ['Do numbered list headlines still work?',
       'Yes, because they promise a defined scope, which is genuinely useful information. What ' +
       'fails is a number attached to nothing specific. “7 ways” beats “some ways”; “7 ways to ' +
       'cut your PDF file size in half” beats both.'],
      ['Should the title tag match the H1?',
       'Not necessarily. The title competes in a search result and should be tight and ' +
       'front-loaded; the H1 greets a reader who has already arrived and can be longer and ' +
       'warmer. Keep them consistent in meaning, not identical in wording.'],
    ],
  },

  // ── VIDEO ─────────────────────────────────────────────────────────────────────
  'video-converter': {
    intro:
      'Converts video between MP4, WebM, MOV, AVI and MKV entirely in your browser, using ' +
      'FFmpeg compiled to WebAssembly. Nothing is uploaded — which is the whole reason to use ' +
      'it, and also why it is slower than a desktop tool.',
    sections: [
      {
        h: 'Container and codec are different things',
        p: 'MP4, WebM and MKV are containers — wrappers holding a video stream, an audio stream and ' +
           'metadata. H.264, VP9 and AAC are codecs, the actual compression. A file can be an MP4 ' +
           'containing H.264 video and AAC audio, or an MP4 containing something a given device ' +
           'cannot decode. That is why a “converted to MP4” file sometimes still will not play: the ' +
           'container changed and the codec inside it did not match what the player supports. This ' +
           'tool sets both — MP4 and MOV get H.264 and AAC, WebM gets VP8 and Vorbis.',
      },
      {
        h: 'Why it is slow, and when to use something else',
        p: 'FFmpeg here runs as WebAssembly in a browser tab, single-threaded, without access to the ' +
           'hardware video encoder your machine has. Re-encoding is computationally expensive, so ' +
           'expect minutes rather than seconds, and expect a long clip to be impractical. The trade ' +
           'is explicit: for a short clip that you would rather not upload — anything personal, ' +
           'confidential or not yet released — waiting is worth it. For a feature-length file, ' +
           'install FFmpeg or HandBrake and use the hardware.',
      },
      {
        h: 'Every conversion is a generation loss',
        p: 'Converting between lossy formats decodes and re-encodes, so quality drops each time, ' +
           'even at a nominally high setting. Convert from the highest-quality source you have ' +
           'rather than from something already converted, and convert once rather than experimenting ' +
           'through several formats. If all you need is a different container with the same streams ' +
           'inside, remuxing copies them without re-encoding and is both instant and lossless — a ' +
           'different operation from what happens here.',
      },
      {
        h: 'Which format to target',
        p: 'MP4 with H.264 is the safe answer: it plays on essentially everything, including old ' +
           'phones, smart TVs and embedded players. WebM with VP9 compresses better at the same ' +
           'quality and is well supported in browsers but poorly outside them. MOV is an Apple ' +
           'container, mostly the same content as MP4. AVI and MKV are legacy and enthusiast choices ' +
           'respectively. If you do not have a specific reason, choose MP4.',
      },
    ],
    steps: [
      'Choose your video file.',
      'Pick the target format — MP4 unless you have a reason not to.',
      'Convert, and wait; the progress bar reflects real work rather than a guess.',
      'Download the result.',
    ],
    notes: [
      'Conversion happens in your browser — the file is never uploaded anywhere.',
      'Expect minutes, not seconds: WebAssembly FFmpeg cannot use your machine\'s hardware ' +
       'encoder.',
      'Large files may exhaust browser memory; trim before converting where you can.',
    ],
    faq: [
      ['Why is conversion so slow compared to a desktop app?',
       'Because it runs as WebAssembly inside a browser tab, single-threaded and without access ' +
       'to hardware video encoding. A desktop tool uses your GPU\'s dedicated encoder and every ' +
       'CPU core. You are trading speed for the file never leaving your machine.'],
      ['Which video format should I use?',
       'MP4 with H.264 for maximum compatibility — it plays almost everywhere. WebM with VP9 is ' +
       'smaller at equivalent quality and is best for web embedding, but support outside ' +
       'browsers is patchy.'],
      ['Does converting reduce video quality?',
       'Yes. Both formats are lossy, so decoding and re-encoding loses a little each time. ' +
       'Always convert from the original rather than from a previous conversion, and avoid ' +
       'converting back and forth.'],
    ],
  },

  // ── EVERYDAY ──────────────────────────────────────────────────────────────────
  'age-calculator': {
    intro:
      'Works out an exact age from a date of birth — years, months and days, plus totals in ' +
      'weeks and days — and shows when the next birthday falls.',
    sections: [
      {
        h: 'Calendar age is not a simple subtraction',
        p: 'Age counts completed years, then completed months from that anniversary, then the ' +
           'remaining days. That is why a person born on 31 January is 1 month old on 28 February in ' +
           'a common year but the arithmetic gets awkward — months have different lengths, so “one ' +
           'month later” is not a fixed number of days. The years-months-days figure is the one ' +
           'people mean conversationally; the total-days figure is the one to use for anything you ' +
           'are calculating with.',
      },
      {
        h: 'Leap years and the 29 February birthday',
        p: 'A leap year is every year divisible by four, except centuries, except centuries ' +
           'divisible by 400 — so 2000 was one and 1900 was not. Someone born on 29 February has a ' +
           'legal birthday that differs by jurisdiction: in the UK they turn 18 on 1 March, in New ' +
           'Zealand on 28 February, and several US states differ from each other. For age ' +
           'calculation the day count is unambiguous; it is the anniversary that needs a rule.',
      },
      {
        h: 'Age reckoning is not universal',
        p: 'The system here is international age, counting from birth. Traditional Korean age ' +
           'counted a person as one at birth and added a year every New Year, which could make a ' +
           'baby born in December two years old in January — South Korea standardised on ' +
           'international age in June 2023. East Asian age reckoning more broadly follows similar ' +
           'conventions, and they still appear informally. Worth knowing if a stated age and a birth ' +
           'date seem not to match.',
      },
      {
        h: 'Where exact age matters',
        p: 'Legal thresholds — majority, licensing, pensions — where a day either side changes ' +
           'eligibility. Medical dosing for children, which is often calculated by age in months. ' +
           'Insurance and actuarial pricing, where some insurers use age at nearest birthday rather ' +
           'than last. Visa and residency applications, which usually count days precisely. For ' +
           'anything of that kind, use the day count rather than the rounded years.',
      },
    ],
    steps: [
      'Enter the date of birth.',
      'Read the age in years, months and days, plus the totals.',
      'Check the next-birthday date if that is what you needed.',
    ],
    notes: [
      'Ages are computed as calendar dates, so time zones and daylight saving do not affect ' +
       'them.',
      'Leap years are handled automatically, including the century rule.',
      'Everything is computed locally; no dates are transmitted.',
    ],
    faq: [
      ['How is age calculated exactly?',
       'Completed years since birth, then completed months since that anniversary, then the ' +
       'remaining days. Month lengths vary, so the same number of days can be a different ' +
       'months-and-days figure depending on where in the year it falls.'],
      ['When does someone born on 29 February have a birthday?',
       'It depends on jurisdiction. The UK treats 1 March as the legal anniversary in a common ' +
       'year; New Zealand uses 28 February; US states vary. Socially, people choose. The day ' +
       'count is unambiguous either way.'],
      ['How many days old am I?',
       'Enter your date of birth and read the total-days figure. It counts calendar days ' +
       'precisely, leap years included — which is the number to use for visa day counts and ' +
       'anything else where rounding to years is not good enough.'],
    ],
  },

  // ── LEGAL ─────────────────────────────────────────────────────────────────────
  'privacy-policy-gen': {
    intro:
      'Drafts a privacy policy from your company details, the data you collect and the services ' +
      'you use. A privacy policy is legally required nearly everywhere the moment you collect ' +
      'personal data — which includes running analytics.',
    sections: [
      {
        h: 'You almost certainly need one',
        p: 'GDPR in the EU and UK, CCPA and CPRA in California, PIPEDA in Canada, the DPDP Act in ' +
           'India, LGPD in Brazil and a long list of others all require a privacy notice when you ' +
           'process personal data. That threshold is lower than people assume: an IP address is ' +
           'personal data under GDPR, so a site running Google Analytics or serving ads is ' +
           'processing it. Apple and Google both require a policy URL before an app goes on their ' +
           'stores, which is how most people discover the obligation.',
      },
      {
        h: 'It has to describe what you actually do',
        p: 'A generated policy listing practices you do not follow is worse than none — it is a ' +
           'written record of what you claimed. Read every clause and cut what does not apply. Then ' +
           'add what the template cannot know: every third-party service that receives data. ' +
           'Analytics, ad networks, payment processors, email providers, error tracking, session ' +
           'recording, chat widgets and CDNs are all disclosable, and the list is longer than most ' +
           'site owners expect until they audit their own script tags.',
      },
      {
        h: 'The rights section is the operative part',
        p: 'GDPR gives people the right to access their data, correct it, have it deleted, take it ' +
           'elsewhere and object to processing — and a right to complain to a supervisory authority. ' +
           'CCPA gives Californians rights to know, delete and opt out of sale or sharing. A policy ' +
           'has to name these and give a working route to exercise them. That is the part with ' +
           'operational consequences: you need a monitored address and a process, because the ' +
           'response deadlines are statutory — one month under GDPR, 45 days under CCPA.',
      },
      {
        h: 'Consent, cookies, and the banner',
        p: 'A policy is a notice, not consent. Under GDPR and the ePrivacy rules, non-essential ' +
           'cookies and similar technologies need consent obtained before they are set — which means ' +
           'a banner that actually blocks them until a choice is made, with refusing as easy as ' +
           'accepting. Regulators across Europe have fined sites for banners where “accept” was one ' +
           'click and “reject” was buried. Analytics and advertising cookies are not essential, ' +
           'whatever convenience suggests.',
      },
    ],
    steps: [
      'Enter your company name, website and contact address.',
      'Select the data you collect and the services you use.',
      'Generate, then read it in full and cut every clause that does not describe you.',
      'Add every third-party service that receives data, and publish it at a stable URL.',
    ],
    notes: [
      'This is a template, not legal advice, and it is not tailored to your jurisdiction.',
      'Analytics and advertising make you a processor of personal data — an IP address counts.',
      'A policy is a notice; cookie consent is a separate obligation needing a real choice.',
    ],
    faq: [
      ['Do I need a privacy policy for a simple website?',
       'If you collect any personal data, yes — and analytics, contact forms, comments and ads ' +
       'all qualify. A purely static site with no analytics and no forms arguably does not, ' +
       'which describes very few sites. App stores require one regardless.'],
      ['Is a generated privacy policy legally sufficient?',
       'It can be a sound starting point, and it is not sufficient unedited. A policy must ' +
       'accurately describe your actual data practices and the specific third parties involved — ' +
       'things no generator knows. An inaccurate policy is evidence against you rather than ' +
       'protection.'],
      ['What is the difference between a privacy policy and cookie consent?',
       'The policy tells people what you do with their data. Consent is permission obtained ' +
       'before setting non-essential cookies, and under GDPR it must be freely given, specific ' +
       'and as easy to refuse as to accept. Publishing a policy does not satisfy the consent ' +
       'requirement.'],
    ],
  },

  // ── DEV ───────────────────────────────────────────────────────────────────────
  'uuid-inspector': {
    intro:
      'Parses a UUID and tells you its version and variant, plus the timestamp where the ' +
      'version carries one. Useful when you are handed an identifier and need to know what it ' +
      'is and what it leaks.',
    sections: [
      {
        h: 'Reading the version and variant by eye',
        p: 'The 13th hexadecimal digit is the version and the 17th is the variant. So in ' +
           'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx, the 4 says version 4 (random) and the 8 says the ' +
           'standard RFC variant — that position is always 8, 9, a or b for a conforming UUID. Once ' +
           'you know where to look you can identify a UUID\'s version from a glance at the string, ' +
           'without any tool.',
      },
      {
        h: 'What each version encodes, and what it leaks',
        p: 'Version 1 embeds a 60-bit timestamp and the generating machine\'s MAC address, which ' +
           'makes it sortable and makes it disclose where and when it was created — a genuine ' +
           'privacy consideration, and famously how the Melissa virus author was traced. Version 3 ' +
           'and 5 are deterministic hashes of a namespace and a name, so the same input always gives ' +
           'the same UUID. Version 4 is 122 random bits and reveals nothing. Version 7, standardised ' +
           'in 2024, puts a millisecond timestamp in the high bits with the rest random — sortable ' +
           'like v1 without the MAC address.',
      },
      {
        h: 'Why version matters for database keys',
        p: 'Random v4 keys scatter inserts across a B-tree index, which fragments it and hurts write ' +
           'throughput and cache locality on large tables. Time-ordered keys append instead, which ' +
           'is why v7 exists and why people previously invented ULIDs and similar schemes. If a ' +
           'table is small the difference is invisible; at tens of millions of rows it is ' +
           'measurable, and changing key format later is painful.',
      },
      {
        h: 'When a UUID is not a UUID',
        p: 'Plenty of things that look like UUIDs are not conforming ones — a random 32-hex string ' +
           'formatted with hyphens will fail the version and variant check, even though it works ' +
           'fine as an identifier. That matters when a library validates strictly and rejects an id ' +
           'that your system generated happily for years. Checking the version and variant digits is ' +
           'the quickest way to tell whether an identifier will survive strict parsing.',
      },
    ],
    steps: [
      'Paste the UUID.',
      'Read its version, variant and, where present, the embedded timestamp.',
      'Note whether it conforms — the version and variant digits decide it.',
    ],
    notes: [
      'The 13th hex digit is the version; the 17th is the variant and should be 8, 9, a or b.',
      'Version 1 embeds a MAC address and creation time — treat it as disclosing both.',
      'Parsing happens in your browser; identifiers are not transmitted.',
    ],
    faq: [
      ['How do I tell which version a UUID is?',
       'Look at the 13th hexadecimal character — the first digit of the third group. A 4 there ' +
       'means version 4, a 1 means version 1, and so on. The 17th character is the variant and ' +
       'should be 8, 9, a or b.'],
      ['Can I get the creation time out of a UUID?',
       'From version 1 and version 7, yes — both embed a timestamp. From version 4 no, because ' +
       'it is entirely random, and from versions 3 and 5 no, because they are hashes of an ' +
       'input.'],
      ['Is it a problem that version 1 UUIDs contain a MAC address?',
       'It can be. A v1 UUID discloses the generating machine\'s network card and the time of ' +
       'creation, which is information you may not intend to publish in an API response or a ' +
       'URL. Use version 4 where you want no metadata, or version 7 where you want sortability ' +
       'without the MAC address.'],
    ],
  },

  // ── DEVGEN ────────────────────────────────────────────────────────────────────
  'robots-txt-gen': {
    intro:
      'Generates a robots.txt for your site — which crawlers may fetch what, and where your ' +
      'sitemap lives. A small file with an outsized ability to remove a site from search if it ' +
      'is wrong.',
    sections: [
      {
        h: 'Disallow is not noindex, and this trips up everyone',
        p: 'robots.txt controls crawling, not indexing. A page you disallow can still appear in ' +
           'search results — typically with no description, because Google was told not to read it ' +
           'but found it linked elsewhere. Worse, if you disallow a page you also want de-indexed, ' +
           'the crawler cannot see your noindex tag, so the page stays indexed indefinitely. To ' +
           'remove a page: let it be crawled and serve a noindex meta tag or header. To save crawl ' +
           'budget on pages already out of the index: disallow.',
      },
      {
        h: 'The rule that takes a site offline',
        p: '`User-agent: *` followed by `Disallow: /` blocks everything. It is the correct content ' +
           'for a staging site and catastrophic on production, and it has repeatedly gone live ' +
           'during a deploy when the staging file was copied across. If organic traffic disappears ' +
           'overnight, this is the first file to check. Note that a blank Disallow value means allow ' +
           'everything, which is the opposite of what it looks like.',
      },
      {
        h: 'What it cannot do',
        p: 'It is a request, not an access control. Well-behaved crawlers honour it; malicious ' +
           'scrapers and email harvesters ignore it entirely. Worse, robots.txt is public, so ' +
           'listing /admin/ or /private-backups/ as disallowed advertises exactly where the ' +
           'interesting directories are. Never put anything in it that you would not want a stranger ' +
           'to read as a map. Protect sensitive paths with authentication.',
      },
      {
        h: 'Crawlers worth naming explicitly',
        p: 'Googlebot and Bingbot for search. GPTBot, ClaudeBot, CCBot, PerplexityBot and ' +
           'Google-Extended for AI training and retrieval — each honours robots.txt and each has its ' +
           'own token, so blocking AI crawlers while allowing search is a deliberate and common ' +
           'choice worth making consciously rather than by default. Also include the full sitemap ' +
           'URL, which is the one line in robots.txt that actively helps discovery rather than ' +
           'restricting it.',
      },
    ],
    steps: [
      'Choose which crawlers to allow or block.',
      'Add any paths to disallow — and check none of them are pages you want indexed.',
      'Include your full sitemap URL.',
      'Save it at the site root, at /robots.txt, and fetch it in a browser to confirm it ' +
       'serves.',
    ],
    notes: [
      'It must live at the root of the domain; a subdirectory location is ignored entirely.',
      'Each subdomain needs its own file — one on the apex domain does not cover them.',
      'Disallow prevents crawling, never indexing; use a noindex tag to remove a page from ' +
       'results.',
    ],
    faq: [
      ['Will robots.txt remove a page from Google?',
       'No, and this is the most common misunderstanding. It stops crawling, so a disallowed ' +
       'page can still be indexed from external links — and because the crawler cannot read the ' +
       'page, it will never see a noindex tag. Allow crawling and serve noindex instead.'],
      ['Where does robots.txt go?',
       'At the root of each domain or subdomain: example.com/robots.txt. A file anywhere else is ' +
       'ignored, and a file on the apex domain does not apply to shop.example.com, which needs ' +
       'its own.'],
      ['Should I block AI crawlers?',
       'It is a genuine choice rather than a default. GPTBot, ClaudeBot, CCBot, PerplexityBot ' +
       'and Google-Extended all honour robots.txt and can be named individually, so you can ' +
       'block training while allowing search indexing. Decide deliberately — some of these ' +
       'crawlers also drive referral traffic.'],
    ],
  },

  // ── ENCODING ──────────────────────────────────────────────────────────────────
  'nato-alphabet': {
    intro:
      'Converts text into the NATO phonetic alphabet — Alfa, Bravo, Charlie — for reading ' +
      'letters aloud over a phone line or radio without being misheard.',
    sections: [
      {
        h: 'Why it exists, and why those particular words',
        p: 'B, C, D, E, G, P, T, V and Z all sound alike over a poor connection, and a misheard ' +
           'reference number or callsign has real consequences in aviation and shipping. The current ' +
           'alphabet was adopted by NATO and the ICAO in 1956 after extensive testing across ' +
           'speakers of different native languages — the words were chosen because they remained ' +
           'distinguishable when distorted, not because they sound nice. Alfa and Juliett are ' +
           'deliberately misspelled so that speakers of French and other languages do not drop the ' +
           'final sound.',
      },
      {
        h: 'Where it is actually used',
        p: 'Aviation, where every callsign and runway designation is spoken this way. Maritime ' +
           'radio. Emergency services. And, far more commonly than any of those, ordinary customer ' +
           'service — reading a booking reference, a postcode or a card number down a phone line. ' +
           'Learning it takes an afternoon and it removes an entire category of frustrating ' +
           'conversation, which is why call-centre staff pick it up quickly whether or not they are ' +
           'trained in it.',
      },
      {
        h: 'Numbers and the ones people get wrong',
        p: 'Digits are mostly spoken normally, with two exceptions in aviation usage: nine is ' +
           '“niner”, so it is not confused with the German nein, and three is often “tree”. Decimal ' +
           'points are spoken as “decimal” rather than “point”. The letters most often misremembered ' +
           'are X-ray, which takes no separate word, and the fact that it is Alfa rather than Alpha ' +
           '— correcting someone on that is a reliable way to identify a pilot.',
      },
    ],
    steps: [
      'Type or paste your text.',
      'Read the phonetic version aloud.',
      'Copy it if you need it written down.',
    ],
    notes: [
      'Alfa and Juliett are spelled that way on purpose, for non-English speakers.',
      'Nine is spoken “niner” in aviation usage to distinguish it from the German nein.',
      'Non-letter characters pass through unchanged.',
    ],
    faq: [
      ['Why is it spelled Alfa and not Alpha?',
       'Because “ph” is not pronounced as an f in many languages, and the alphabet was designed ' +
       'to work across speakers of many native tongues. Juliett has the doubled t for the same ' +
       'reason — French speakers would otherwise not sound the final letter.'],
      ['Is the NATO alphabet the same as the police alphabet?',
       'Not always. The NATO/ICAO alphabet is the international standard used in aviation and ' +
       'shipping, but several police forces — notably in the US — use their own local variants ' +
       'with different words. If you are dealing with aviation or international radio, NATO is ' +
       'the one.'],
      ['How do you say numbers in the NATO alphabet?',
       'Digits are spoken as ordinary numbers with two aviation exceptions: nine is “niner” and ' +
       'three is often “tree”. A decimal point is spoken as “decimal”.'],
    ],
  },

  // ── SECURITY ──────────────────────────────────────────────────────────────────
  'api-key-gen': {
    intro:
      'Generates random API keys in hex, UUID or base58 formats, using the browser\'s ' +
      'cryptographic random source. Suitable for real use — and how you store and transmit the ' +
      'key matters more than how you generated it.',
    sections: [
      {
        h: 'How long a key needs to be',
        p: '128 bits of randomness is the practical floor and 256 bits is comfortable. In hex that ' +
           'is 32 and 64 characters; base58 packs the same entropy into fewer characters, which is ' +
           'why cryptocurrency addresses use it. What matters is the entropy, not the length of the ' +
           'string — a 64-character key built from a predictable pattern is worth nothing, while 32 ' +
           'random hex characters is beyond any brute force.',
      },
      {
        h: 'Prefix your keys, and make them recognisable',
        p: 'Stripe\'s sk_live_ and pk_test_ convention has been widely copied because it solves real ' +
           'problems: a developer can tell a secret key from a publishable one at a glance, a live ' +
           'key from a test key, and — crucially — automated secret scanners can recognise the ' +
           'pattern and alert when one is committed to a public repository. GitHub\'s secret scanning ' +
           'partners with providers on exactly these prefixes. A bare random string has none of ' +
           'that.',
      },
      {
        h: 'Store a hash, not the key',
        p: 'Treat API keys like passwords: store a hash in your database and show the key to the ' +
           'user exactly once, at creation. If your database leaks, hashed keys are useless to the ' +
           'attacker. Because keys are high-entropy random strings rather than human-chosen ' +
           'passwords, a fast hash such as SHA-256 is adequate here — the dictionary attacks that ' +
           'make bcrypt necessary for passwords do not apply. Store a prefix and a last-four in ' +
           'plaintext so users can identify which key is which.',
      },
      {
        h: 'Rotation, scoping and expiry',
        p: 'Issue keys that can be revoked individually rather than one shared secret, so a ' +
           'compromise is contained and rotation does not break everything at once. Scope them to ' +
           'the minimum permissions needed — a read-only key for a reporting integration cannot be ' +
           'used to delete anything. Set expiry dates, log last-used timestamps so you can spot keys ' +
           'that are no longer needed, and allow two active keys during a rotation so customers can ' +
           'migrate without downtime.',
      },
    ],
    steps: [
      'Choose a format — hex is the safe default, base58 for a shorter string.',
      'Set the length; 32 hex characters is 128 bits, 64 is 256.',
      'Generate and copy the key straight into your secrets store.',
      'Store a hash of it server-side, never the key itself.',
    ],
    notes: [
      'Generated with crypto.getRandomValues, so suitable for production use.',
      'Base58 omits 0, O, I and l, which makes keys safer to read aloud and retype.',
      'The key exists only in this tab — copy it before navigating away.',
    ],
    faq: [
      ['How long should an API key be?',
       'At least 128 bits of entropy — 32 hex characters — and 256 bits is a reasonable default. ' +
       'Beyond that you gain nothing: the entropy is what matters, and no attacker is ' +
       'brute-forcing 128 random bits.'],
      ['Should I store API keys hashed?',
       'Yes. Hash them like passwords and show the key once at creation. Because keys are ' +
       'high-entropy random strings, a fast hash such as SHA-256 is sufficient — bcrypt\'s ' +
       'slowness exists to defeat dictionary attacks on human-chosen passwords, which do not ' +
       'apply here.'],
      ['Is it safe to generate an API key in a browser?',
       'The randomness is sound — crypto.getRandomValues draws from the operating system\'s ' +
       'entropy pool and is suitable for cryptographic use. The practical caution is the same as ' +
       'for any secret handled outside your own systems: copy it straight into your secrets ' +
       'store, and rotate if you have any doubt about the machine.'],
    ],
  },
  'pin-gen': {
    intro:
      'Generates random numeric PINs of 4, 6 or 8 digits from the browser\'s cryptographic ' +
      'random source. The point of a random PIN is that it is not one of the handful people ' +
      'actually choose.',
    sections: [
      {
        h: 'Human-chosen PINs are astonishingly predictable',
        p: 'Analysis of leaked PIN datasets has consistently found that 1234 alone accounts for ' +
           'around 10% of all four-digit PINs, and the top twenty cover roughly a quarter of them. ' +
           '1111, 0000, 1212 and repeated pairs make up much of the rest, and a large block of the ' +
           'remainder are years between 1950 and 2000 — which is why a birth year is a poor choice. ' +
           'An attacker with three attempts and a list of the twenty commonest PINs succeeds far ' +
           'more often than the one-in-3,333 that random guessing would suggest.',
      },
      {
        h: 'Four digits is only 10,000 combinations',
        p: 'That is nothing against an offline attack and adequate against an online one, purely ' +
           'because the system locks after a few failures. This is why a bank card PIN is safe at ' +
           'four digits and a password is not at four characters: the security comes from the ' +
           'lockout, not the PIN. Where there is no lockout, four digits is meaningless. Six digits ' +
           'gives a million combinations and is the sensible choice wherever the system allows it.',
      },
      {
        h: 'Avoid the patterns you cannot see',
        p: 'A random generator will occasionally produce 1234 or 1111, which are perfectly random ' +
           'and terrible choices — generate again if you get one. Also avoid anything derived from ' +
           'you: a birth year, a house number, part of a phone number. And consider the physical ' +
           'channel: on a keypad, adjacent digits are easier to shoulder-surf, and a worn keypad can ' +
           'reveal which four digits are in use, which reduces 10,000 possibilities to 24.',
      },
    ],
    steps: [
      'Choose the length — 6 digits where the system allows it.',
      'Generate, and regenerate if you get an obvious pattern.',
      'Memorise it rather than storing it near the thing it protects.',
    ],
    notes: [
      'Generated with crypto.getRandomValues rather than Math.random.',
      'A random generator can still produce 1234 — regenerate if it does.',
      'Four digits is 10,000 combinations; security comes from the lockout, not the length.',
    ],
    faq: [
      ['What is the most common PIN?',
       '1234, by a wide margin — studies of leaked datasets put it at around 10% of all ' +
       'four-digit PINs on its own. 1111, 0000 and 1212 follow. The twenty commonest cover ' +
       'roughly a quarter of all PINs, which is why random selection matters.'],
      ['Is a 4-digit PIN secure enough?',
       'Only because the system locks out after a few wrong attempts. Ten thousand combinations ' +
       'falls instantly to an offline attack. Use six digits wherever the system allows it, and ' +
       'never reuse a PIN across a card and a phone.'],
      ['Should I use my birth year as a PIN?',
       'No. Years between 1950 and 2000 are among the most commonly chosen PINs, so attackers ' +
       'try them early, and your birth year is often discoverable. The same applies to house ' +
       'numbers and phone digits.'],
    ],
  },

  // ── DEV ───────────────────────────────────────────────────────────────────────
  'jwt-debugger': {
    intro:
      'Decodes a JSON Web Token into its header and payload and shows the claims in readable ' +
      'form, with expiry checked against the clock. It reads the token; verifying the signature ' +
      'needs the key, which only your server has.',
    sections: [
      {
        h: 'Debugging a token that will not authenticate',
        p: 'Work through it in order. Is it expired? `exp` is in seconds, and a clock difference of ' +
           'a minute between your machine and the issuer flips the verdict either way — which is why ' +
           'most verifiers allow leeway. Is `nbf` in the future? A token issued with a not-before in ' +
           'the future is valid and not yet usable. Does `aud` match what your server expects, and ' +
           '`iss` name the issuer you trust? A perfectly signed token for a different audience is a ' +
           'valid signature and an invalid token.',
      },
      {
        h: 'Timestamps in seconds, not milliseconds',
        p: 'Every time claim in a JWT — exp, iat, nbf — is a Unix timestamp in seconds. JavaScript\'s ' +
           'Date.now() returns milliseconds, so a token minted with `exp: Date.now() + 3600000` ' +
           'expires in the year 56000 and one read as milliseconds appears to have expired in 1970. ' +
           'Both are common bugs and both are visible here immediately: a nonsensical date means the ' +
           'wrong unit, not a broken token.',
      },
      {
        h: 'The attacks that shaped how verifiers work',
        p: 'Early libraries trusted the `alg` field in the header, which the attacker controls. ' +
           'Setting it to `none` and stripping the signature produced a token that some libraries ' +
           'accepted. Switching an RS256 token to HS256 let an attacker sign it with the public key ' +
           'as the shared secret, since the library picked its verification method from the header. ' +
           'The fix in both cases is the same: your server decides the algorithm, and a token ' +
           'claiming a different one is rejected before anything else happens.',
      },
      {
        h: 'What belongs in a token, and what does not',
        p: 'The payload is Base64, not encrypted — anyone holding the token reads it, as this page ' +
           'demonstrates. So no passwords, no card numbers, nothing you would not put in a URL. Keep ' +
           'tokens small, because they travel on every request: a fat payload with a permissions ' +
           'array costs bandwidth on every call. And keep access tokens short-lived, since a JWT ' +
           'cannot be revoked before it expires without a server-side blocklist, which defeats much ' +
           'of the point of using one.',
      },
    ],
    steps: [
      'Paste the token.',
      'Read the header for the algorithm, and the payload for the claims.',
      'Check exp, nbf, iss and aud — in that order — against what your server expects.',
      'Verify the signature on your server with your key, never in a web page.',
    ],
    notes: [
      'Header and payload are encoded, not encrypted — treat everything in them as public.',
      'All time claims are Unix seconds; a date in 1970 or the far future means a unit ' +
       'mismatch.',
      'Decoding runs in your browser, but a production token pasted anywhere is worth rotating.',
    ],
    faq: [
      ['Why is my JWT rejected when it looks valid?',
       'Check in order: expiry against the clock (allowing for skew), not-before, the audience ' +
       'claim, and the issuer. A correctly signed token for the wrong audience or from an ' +
       'unexpected issuer is still invalid, and that is the check people forget.'],
      ['Can I verify a signature here?',
       'No — verification needs the secret or public key, which belongs on your server. A web ' +
       'page that asked for your signing key would be a bad idea regardless of who wrote it. ' +
       'This tool shows you what the token says.'],
      ['Should I store sensitive data in a JWT?',
       'No. The payload is Base64-encoded and readable by anyone holding the token. Store an ' +
       'identifier and look the sensitive data up server-side.'],
    ],
  },

  // ── HTML ──────────────────────────────────────────────────────────────────────
  'meta-tag-generator': {
    intro:
      'Generates the meta tags a page needs — title, description, canonical, viewport and ' +
      'robots — ready to paste into your head. A small block of markup that decides how your ' +
      'page appears in search results.',
    sections: [
      {
        h: 'Title and description are advertising copy, not labels',
        p: 'The title is the clickable line in a search result and the single strongest on-page ' +
           'signal you control. Google truncates by pixel width at roughly 600px, which is about ' +
           '55–60 characters, so the distinguishing words go first and the brand goes last. The ' +
           'description is not a ranking factor and it is the copy that persuades someone to click — ' +
           '150–160 characters, written as a promise the page keeps. Google rewrites descriptions ' +
           'perhaps 70% of the time, more often when yours does not match the query, which is an ' +
           'argument for writing one that does rather than for skipping it.',
      },
      {
        h: 'The canonical tag prevents you competing with yourself',
        p: 'The same content reachable at several URLs — with and without a trailing slash, with ' +
           'tracking parameters, with and without www — splits ranking signals between them. A ' +
           'canonical tag names the version you want indexed and consolidates the rest into it. Use ' +
           'an absolute URL, make every page self-canonical by default, and make sure the canonical ' +
           'points at a page that actually returns 200: a canonical to a redirect or a 404 is ' +
           'ignored, and the page is treated as having none.',
      },
      {
        h: 'The robots tag, and its difference from robots.txt',
        p: '`<meta name="robots" content="noindex">` removes a page from search results, and works ' +
           'only if the crawler can reach the page to read it. That is why disallowing a page in ' +
           'robots.txt while also trying to noindex it fails — the crawler never sees the tag. Other ' +
           'useful values: `nofollow` for links you do not endorse, `noarchive` to suppress the ' +
           'cached copy, and `max-snippet` to control how much text can be shown.',
      },
      {
        h: 'The meta tags that no longer do anything',
        p: 'The keywords meta tag has been ignored by Google since 2009 and by Bing for almost as ' +
           'long; filling it in signals nothing except that the page was built from an old ' +
           'checklist. Meta `author`, `revisit-after` and `distribution` are equally inert for ' +
           'search. The tags that genuinely matter are few: title, description, canonical, viewport, ' +
           'robots, and the Open Graph set for social sharing.',
      },
    ],
    steps: [
      'Enter your page title, description and canonical URL.',
      'Set the robots directive if the page should not be indexed.',
      'Copy the block into your head, above any scripts.',
      'Check the rendered source of the live page, not just the template.',
    ],
    notes: [
      'Titles truncate around 55–60 characters and descriptions around 150–160 — both by pixel ' +
       'width, not character count.',
      'Canonical URLs must be absolute and must resolve with a 200 status.',
      'The keywords meta tag does nothing; leave it out.',
    ],
    faq: [
      ['How long should a meta description be?',
       '150–160 characters, and write it so the meaning survives truncation at 120. Google ' +
       'rewrites descriptions most of the time, and it rewrites yours less often when it already ' +
       'answers the query well.'],
      ['Does the meta keywords tag still matter?',
       'No. Google has ignored it since 2009 and every other major engine followed. It carries ' +
       'no benefit and marks a page as built from outdated advice.'],
      ['What is a canonical tag for?',
       'It names the preferred URL when the same content is reachable at several, consolidating ' +
       'ranking signals rather than splitting them. Every page should carry one pointing at ' +
       'itself, using an absolute URL that returns 200.'],
    ],
  },
  'og-tag-generator': {
    intro:
      'Generates Open Graph and Twitter Card tags, which control how your page looks when ' +
      'someone shares it — the image, title and description in the preview card on social ' +
      'platforms and in messaging apps.',
    sections: [
      {
        h: 'The image is what people actually see',
        p: 'In a feed the card image occupies far more space than the text, and it is what decides ' +
           'whether anyone stops. 1200×630 is the standard, a 1.91:1 ratio, and it must be an ' +
           'absolute URL — relative paths are the single most common reason a preview shows nothing. ' +
           'Keep it under about 5 MB, use PNG or JPEG, and remember platforms crop differently: keep ' +
           'text away from the edges, and do not rely on small text surviving the thumbnail.',
      },
      {
        h: 'Open Graph covers nearly everything, with one addition',
        p: 'Facebook created Open Graph, and LinkedIn, WhatsApp, Slack, Discord, Pinterest and most ' +
           'messaging apps read the same tags — so og:title, og:description, og:image, og:url and ' +
           'og:type cover the majority of sharing. Twitter/X reads Open Graph as a fallback but ' +
           'prefers its own, so adding `twitter:card` with `summary_large_image` is the one extra ' +
           'tag worth having. Without it you get the small square card rather than the wide one.',
      },
      {
        h: 'Caching is why your fix does not show',
        p: 'Platforms cache scraped previews aggressively, often for days, so correcting a tag does ' +
           'not change an existing preview. Each has a debugger that re-scrapes on demand: ' +
           'Facebook\'s Sharing Debugger, LinkedIn\'s Post Inspector, and Twitter\'s card validator. ' +
           'Run them after any change. If a link has already circulated with a broken preview, that ' +
           'preview is what people will keep seeing until the cache expires — which is an argument ' +
           'for testing before launch rather than after.',
      },
      {
        h: 'Tags must be in the raw HTML',
        p: 'Scrapers fetch the page and read the markup; most do not execute JavaScript. So tags ' +
           'injected client-side by a single-page app are invisible to them, which is why a React or ' +
           'Vue site can look perfect in a browser and produce an empty preview everywhere. They ' +
           'must be server-rendered or pre-rendered into the HTML that the scraper receives. View ' +
           'source rather than the inspector to check — the inspector shows the tags after ' +
           'JavaScript has run.',
      },
    ],
    steps: [
      'Enter the title, description, absolute image URL and page URL.',
      'Copy the block into your head, server-rendered rather than injected.',
      'Run the platform debuggers to force a re-scrape and confirm the preview.',
    ],
    notes: [
      'og:image must be an absolute URL — the commonest cause of a blank preview.',
      '1200×630 is the standard size; keep important text away from the edges.',
      'Add twitter:card=summary_large_image or X shows the small square card.',
    ],
    faq: [
      ['Why is my link preview not showing an image?',
       'Almost always a relative og:image URL — it must be absolute, including the protocol. ' +
       'After that: the image is too large, requires authentication, or the tags are injected by ' +
       'JavaScript and the scraper never executes it.'],
      ['What size should an Open Graph image be?',
       '1200×630 pixels, a 1.91:1 ratio, under about 5 MB. Platforms crop it differently, so ' +
       'keep text and faces away from the edges.'],
      ['I fixed my tags but the preview is still wrong. Why?',
       'The platform cached the old scrape. Use Facebook\'s Sharing Debugger, LinkedIn\'s Post ' +
       'Inspector or X\'s card validator to force a re-fetch — otherwise the stale preview can ' +
       'persist for days.'],
    ],
  },

  // ── DEVGEN ────────────────────────────────────────────────────────────────────
  'gitignore-gen': {
    intro:
      'Generates a .gitignore for your language and tooling, covering the build artefacts, ' +
      'dependency directories and editor files that should never reach a repository.',
    sections: [
      {
        h: 'Ignoring a file does not remove it from history',
        p: 'This is the mistake that matters. Adding a path to .gitignore only stops Git tracking it ' +
           'from now on — a file already committed stays tracked, and stays in every previous commit ' +
           'forever. `git rm --cached` untracks it going forward and leaves the history intact. To ' +
           'remove something from history entirely you need git-filter-repo or BFG, and a force-push ' +
           'that rewrites every commit hash and breaks everyone\'s clone. Which is why the only real ' +
           'answer for a committed secret is to rotate it.',
      },
      {
        h: 'The three categories worth ignoring',
        p: 'Dependencies that a manifest can reconstruct: node_modules, vendor, venv. Build output: ' +
           'dist, build, target, .next. And machine-specific files: .env, .DS_Store, .idea, editor ' +
           'swap files. The principle is that anything reproducible from what is committed, or ' +
           'specific to one developer\'s machine, does not belong in the repository. Committing ' +
           'node_modules is the classic beginner error and makes every clone enormous and every diff ' +
           'unreadable.',
      },
      {
        h: 'Editor and OS files belong in a global ignore',
        p: 'Your .DS_Store and .idea/ are your problem, not the project\'s — a colleague on Linux ' +
           'using Vim should not have to carry them in the repository\'s ignore file. Configure a ' +
           'personal global gitignore with `git config --global core.excludesfile` and put OS and ' +
           'editor noise there once. The project\'s .gitignore then covers only what the project ' +
           'genuinely produces, which keeps it short and reviewable.',
      },
      {
        h: 'Lock files are the exception people get wrong',
        p: 'package-lock.json, yarn.lock, Gemfile.lock, poetry.lock and Cargo.lock should be ' +
           'committed, not ignored. They pin exact dependency versions so that every developer and ' +
           'every CI run installs identical trees — which is the entire point of having them. The ' +
           'one debated case is a published library rather than an application, where some ' +
           'maintainers omit the lock file so consumers resolve their own versions.',
      },
    ],
    steps: [
      'Pick your language, framework and editor.',
      'Review the generated rules and add anything specific to your project.',
      'Save it as .gitignore at the repository root, before the first commit if you can.',
    ],
    notes: [
      'Already-tracked files are unaffected — use git rm --cached to untrack them.',
      'Commit your lock files; ignoring them defeats the purpose of having them.',
      'Put OS and editor noise in a global excludesfile rather than the project\'s ignore.',
    ],
    faq: [
      ['Why is my file still tracked after adding it to .gitignore?',
       'Because .gitignore only affects untracked files. Once something is committed, Git keeps ' +
       'tracking it. Run `git rm --cached <file>` to untrack it going forward — and note that it ' +
       'remains in the history.'],
      ['How do I remove a committed secret?',
       'Rotate it first — assume it is compromised the moment it was pushed. Removing it from ' +
       'history needs git-filter-repo or BFG plus a force-push that rewrites every commit and ' +
       'breaks existing clones, and even then forks and caches may retain it.'],
      ['Should I commit package-lock.json?',
       'Yes, for applications — it guarantees everyone installs the same dependency versions, ' +
       'which is what it exists for. Published libraries are the debated exception, where some ' +
       'maintainers omit it so consumers resolve their own.'],
    ],
  },

  // ── DEV ───────────────────────────────────────────────────────────────────────
  'curl-builder': {
    intro:
      'Builds a curl command from a URL, method, headers and body — correctly quoted, ready to ' +
      'paste into a terminal. Useful for testing an API endpoint or producing a reproducible ' +
      'example for a bug report.',
    sections: [
      {
        h: 'The flags worth knowing',
        p: '`-X` sets the method, though curl infers POST when you pass a body. `-H` adds a header ' +
           'and repeats for each one. `-d` sends a body and implies POST; `--data-raw` avoids curl ' +
           'interpreting an `@` as a filename, which surprises people sending JSON that starts with ' +
           'one. `-i` includes response headers, `-v` shows the whole exchange including the TLS ' +
           'handshake, and `-L` follows redirects, which curl does not do by default — the usual ' +
           'reason a command returns an empty 301 body.',
      },
      {
        h: 'Quoting is where commands break',
        p: 'JSON contains double quotes, so the body needs single quotes around it in bash — and if ' +
           'the JSON itself contains a single quote, you are into escaping that no one enjoys. ' +
           'Windows cmd flips the convention, requiring double quotes with internal ones escaped, ' +
           'which is why a curl command copied from a Linux example frequently fails there. ' +
           'PowerShell aliases curl to Invoke-WebRequest entirely, so a genuine curl command needs ' +
           'curl.exe. For anything complex, put the body in a file and use `-d @body.json`.',
      },
      {
        h: 'Do not paste your production token into a shared example',
        p: 'A curl command carrying an Authorization header is a credential in plain text. It ends ' +
           'up in shell history, in bug reports, in screenshots and in chat logs, which is a steady ' +
           'source of leaked keys. Substitute a placeholder before sharing, use `-H "Authorization: ' +
           'Bearer $TOKEN"` so the value comes from the environment, and rotate anything that has ' +
           'been pasted somewhere you do not control.',
      },
      {
        h: 'Getting a working command straight from the browser',
        p: 'Your browser\'s network tab has “Copy as cURL” on any request, which reproduces the exact ' +
           'call including every header and cookie. That is usually faster than building one by hand ' +
           'when you are trying to reproduce something the page did — and a reminder that those ' +
           'copied commands carry session cookies, so they should be treated as credentials too.',
      },
    ],
    steps: [
      'Enter the URL and choose the method.',
      'Add headers and a request body.',
      'Copy the command — replacing any real token with a placeholder before sharing it.',
    ],
    notes: [
      'curl does not follow redirects unless you add -L.',
      'Use -i to see response headers, -v for the full exchange.',
      'Windows cmd and PowerShell quote differently; PowerShell needs curl.exe for real curl.',
    ],
    faq: [
      ['Why does my curl command return nothing?',
       'Often a redirect — curl does not follow them by default, so a 301 returns an empty body. ' +
       'Add -L. Use -i to see the status and headers, which tells you immediately whether that ' +
       'is what happened.'],
      ['How do I send JSON with curl?',
       'Set the content type and pass the body: -H "Content-Type: application/json" -d ' +
       '\'{"key":"value"}\'. Use single quotes around the JSON in bash, and put it in a file with ' +
       '-d @body.json once it gets long or contains quotes of its own.'],
      ['Why does my command fail on Windows?',
       'Quoting. cmd requires double quotes with internal ones escaped, the opposite of bash. ' +
       'PowerShell additionally aliases curl to Invoke-WebRequest, so you need curl.exe to run ' +
       'the real thing.'],
    ],
  },

  // ── DEVGEN ────────────────────────────────────────────────────────────────────
  'readme-gen': {
    intro:
      'Generates a README skeleton with the sections a project needs — description, ' +
      'installation, usage, licence. The README is the first and often only documentation ' +
      'anyone reads.',
    sections: [
      {
        h: 'The first screen decides whether anyone continues',
        p: 'A visitor gives a README about ten seconds to answer two questions: what is this, and is ' +
           'it for me. So the opening should be one sentence naming the thing and the problem it ' +
           'solves, without jargon and without history. Badges, a table of contents and an origin ' +
           'story belong below that, not above it. The most common failure is a README that opens by ' +
           'explaining how to install something the reader has not yet decided they want.',
      },
      {
        h: 'Show usage before configuration',
        p: 'The fastest path to someone understanding your project is a working example they can ' +
           'copy. Put a minimal, complete, runnable snippet immediately after the description — not ' +
           'a fragment with ellipses, but something that works when pasted. Options, configuration ' +
           'and API details come after. People learn from the concrete example and then read the ' +
           'reference; almost nobody does it the other way round.',
      },
      {
        h: 'The sections that save you time later',
        p: 'Installation with the exact command. Requirements, including version constraints, which ' +
           'is the commonest cause of an issue that was never a bug. A licence, without which nobody ' +
           'can legally use your code — no licence means all rights reserved, which is the opposite ' +
           'of what most people posting publicly intend. Contributing guidelines if you accept pull ' +
           'requests. And a troubleshooting section, which you write by noticing the same question ' +
           'arriving three times.',
      },
      {
        h: 'Keep it honest about state',
        p: 'If a project is unmaintained, say so at the top — it saves people hours and costs you ' +
           'nothing. If a feature is experimental, label it. If something in the README no longer ' +
           'works, that is worse than not documenting it at all, because the reader debugs their ' +
           'setup rather than distrusting the docs. A short accurate README beats a long ' +
           'aspirational one every time.',
      },
    ],
    steps: [
      'Enter the project name, description and installation command.',
      'Add a minimal working usage example — the most valuable part.',
      'Pick a licence and include the file, not only the name.',
      'Save as README.md in the repository root.',
    ],
    notes: [
      'GitHub renders README.md automatically on the repository home page.',
      'Without a licence file, others have no legal right to use the code, whatever the README ' +
       'implies.',
      'Relative links to files in the repo work; relative image paths break when the README is ' +
       'rendered elsewhere, such as on npm.',
    ],
    faq: [
      ['What should a README include?',
       'A one-sentence description, a working usage example, installation instructions, ' +
       'requirements and a licence. Everything else is optional. The description and the example ' +
       'are what people actually read.'],
      ['Does my project need a licence?',
       'If you want anyone to use it, yes. Code published without a licence is all rights ' +
       'reserved by default, so nobody can legally copy, modify or distribute it — which is ' +
       'rarely what someone publishing openly intends. MIT and Apache 2.0 are the common ' +
       'permissive choices.'],
      ['How long should a README be?',
       'Long enough to answer what it is, how to install it and how to use it — often under 200 ' +
       'lines. Beyond that, split reference material into a docs directory and link to it. A ' +
       'wall of text gets skimmed and the important parts get missed.'],
    ],
  },

  // ── CONVERTERS ────────────────────────────────────────────────────────────────
  'ring-size-converter': {
    intro:
      'Converts ring sizes between US, UK and EU scales, with the inside diameter and ' +
      'circumference in millimetres. The millimetre figures are the ones that mean anything — ' +
      'the letters and numbers are just labels for them.',
    sections: [
      {
        h: 'Size is inside circumference, and the EU scale says so directly',
        p: 'A ring\'s size is defined by the inside circumference of the band. The EU/ISO scale ' +
           'simply states that circumference in millimetres, which is why it is the only one that is ' +
           'self-explanatory: EU 54 is a 54 mm inside circumference. US sizes are a numeric scale ' +
           'with half sizes, UK sizes use letters with halves. Diameter and circumference relate by ' +
           'π, so if you have measured one you have the other.',
      },
      {
        h: 'Measuring accurately is harder than it sounds',
        p: 'The reliable method is to measure an existing ring that fits: lay it on a ruler and read ' +
           'the inside diameter across the widest point. A paper strip around the finger works but ' +
           'consistently reads large, because paper does not have to pass over a knuckle. If the ' +
           'knuckle is much wider than the base of the finger — which is common — the ring must fit ' +
           'over the knuckle and will then be loose at the base, which is a fit problem no ' +
           'measurement solves.',
      },
      {
        h: 'Fingers change size, by more than a size',
        p: 'Warmth makes fingers swell and cold shrinks them, so the same finger can vary by half a ' +
           'size or more across a day, and more across seasons. Salt, alcohol, exercise, pregnancy ' +
           'and time of day all move it. Measure in the evening at normal room temperature, which is ' +
           'the middle of the range. Do not size a ring after a run or on a cold morning, which are ' +
           'the two extremes.',
      },
      {
        h: 'Band width changes the size you need',
        p: 'A wide band sits against more of the finger and feels tighter than a narrow one of the ' +
           'same measurement. The usual allowance is half a size up for bands over about 6 mm. ' +
           'Comfort-fit bands, which are domed on the inside, run the other way and often need half ' +
           'a size down. This is why the same nominal size from two jewellers can fit differently, ' +
           'and why resizing is common even when the measurement was right.',
      },
    ],
    steps: [
      'Select a size you know in any scale.',
      'Read the equivalents and the millimetre measurements.',
      'Check against a ring that already fits by measuring its inside diameter.',
    ],
    notes: [
      'EU/ISO size is the inside circumference in millimetres — the most directly useful ' +
       'number.',
      'Measure in the evening at room temperature; fingers vary by half a size through the day.',
      'Wide bands usually need half a size up; comfort-fit bands often half a size down.',
    ],
    faq: [
      ['How do I measure my ring size at home?',
       'Measure a ring that already fits: lay it flat and read the inside diameter across the ' +
       'widest point, then convert. That is far more accurate than a paper strip around the ' +
       'finger, which reads large because it never has to pass a knuckle.'],
      ['What is a US size 7 in UK sizes?',
       'About a UK N to N½, roughly EU 54, with an inside diameter near 17.3 mm. Half sizes and ' +
       'letter conventions vary slightly between jewellers, so use the millimetre figure when ' +
       'ordering.'],
      ['Why does my ring fit differently at different times?',
       'Fingers swell with heat, salt, alcohol and exercise, and shrink in the cold. Half a size ' +
       'of variation through a day is normal. Size in the evening at room temperature for the ' +
       'most representative fit.'],
    ],
  },
  'wire-gauge-converter': {
    intro:
      'Converts American Wire Gauge to diameter in millimetres and cross-sectional area in ' +
      'square millimetres, in both directions. The gauge number is inverse to the size, which ' +
      'is the first thing to get used to.',
    sections: [
      {
        h: 'Why the numbers run backwards',
        p: 'AWG counts drawing operations: wire is pulled through progressively smaller dies, and ' +
           'the gauge number is how many times it was drawn. More draws means thinner wire, so a ' +
           'higher number is a smaller conductor. 4/0 (written 0000) is the thickest in common use ' +
           'and 40 AWG is hair-fine. The scale is logarithmic — every 6 gauges roughly halves or ' +
           'doubles the diameter, and every 3 gauges halves or doubles the cross-sectional area, ' +
           'which is a useful pair of rules to carry.',
      },
      {
        h: 'Area is what carries current, not diameter',
        p: 'Current capacity scales with cross-sectional area, and area goes as the square of ' +
           'diameter. So a wire twice the diameter carries roughly four times the current, and the ' +
           '3-gauge rule above is the practical form of that. Metric cable is specified directly in ' +
           'mm² for the same reason, which makes it the more transparent system — AWG 12 is 3.31 ' +
           'mm², and the metric label tells you that without a conversion.',
      },
      {
        h: 'Ampacity depends on far more than the wire',
        p: 'A gauge does not have a single safe current. It depends on insulation temperature ' +
           'rating, ambient temperature, whether the conductor is in free air or bundled in a ' +
           'conduit with others, the length of the run, and whether the load is continuous. ' +
           'Electrical codes — the NEC in the US, BS 7671 in the UK, and their equivalents elsewhere ' +
           '— set the figures, and they include derating tables for exactly these conditions. This ' +
           'converter gives you dimensions, not a current rating.',
      },
      {
        h: 'Voltage drop is what actually sizes a long run',
        p: 'Over distance, resistance causes voltage drop, and a wire adequate for the current can ' +
           'still be too thin for the length. The usual design target is under 3% drop for a branch ' +
           'circuit, and long runs — a shed, an outbuilding, low-voltage lighting — are routinely ' +
           'sized up by several gauges for that reason alone. Twelve-volt systems are the worst ' +
           'case, because the same absolute drop is a far larger proportion of the supply.',
      },
    ],
    steps: [
      'Enter an AWG number, or a diameter or area in metric.',
      'Read the equivalents in the other units.',
      'Use a code-compliant ampacity table — not this — to choose a wire for a real circuit.',
    ],
    notes: [
      'Higher gauge numbers mean thinner wire; 4/0 is written 0000 and is the thickest common ' +
       'size.',
      'Every 6 gauges roughly doubles or halves the diameter; every 3 gauges does the same to ' +
       'area.',
      'This gives dimensions only — safe current depends on insulation, ambient temperature, ' +
       'bundling and run length.',
    ],
    faq: [
      ['What is 12 AWG in mm²?',
       'About 3.31 mm², with a diameter near 2.05 mm. Metric cable is specified by area ' +
       'directly, which is why the nearest standard metric size is usually quoted as 2.5 mm² or ' +
       '4 mm² rather than an exact match.'],
      ['Why do higher AWG numbers mean thinner wire?',
       'Because the number counts how many times the wire was drawn through a die to reach that ' +
       'size. More draws produces thinner wire, so the scale runs inversely — a historical ' +
       'artefact of the manufacturing process.'],
      ['What gauge wire do I need for a given current?',
       'That is not answerable from the gauge alone. It depends on insulation rating, ambient ' +
       'temperature, whether the wire is bundled, the run length and the local electrical code. ' +
       'Use a code-compliant ampacity table and derate for your conditions.'],
    ],
  },

  // ── HEALTH ────────────────────────────────────────────────────────────────────
  'bmi-calculator': {
    intro:
      'Calculates body mass index from height and weight in metric or imperial units, and shows ' +
      'the category under both the WHO thresholds and the lower Asian-Indian ones. The second ' +
      'set matters more than most calculators acknowledge.',
    sections: [
      {
        h: 'Why there are two sets of thresholds',
        p: 'The WHO cut-offs — 25 for overweight, 30 for obese — were derived largely from European ' +
           'populations. Research through the 2000s found that South Asian, Chinese and other Asian ' +
           'populations develop type 2 diabetes and cardiovascular disease at substantially lower ' +
           'BMIs, because the same BMI corresponds to more visceral fat and less muscle. India\'s ' +
           'national guidelines accordingly set overweight at 23 and obesity at 25. Someone of South ' +
           'Asian descent at a BMI of 24 is in the normal range by WHO and overweight by the ' +
           'guidelines that apply to them — which is why this page shows both.',
      },
      {
        h: 'What BMI cannot see',
        p: 'It is a ratio of weight to height squared and knows nothing about what the weight is ' +
           'made of. Muscle is denser than fat, so athletes are routinely classified as overweight ' +
           'or obese while carrying very little fat. It also misses where fat is distributed, and ' +
           'visceral fat around the organs is far more strongly associated with metabolic disease ' +
           'than subcutaneous fat elsewhere. Waist circumference, or waist-to-height ratio, captures ' +
           'that and BMI does not — keeping your waist under half your height is a simple screen ' +
           'that adds real information.',
      },
      {
        h: 'It was designed for populations, not people',
        p: 'Adolphe Quetelet devised the formula in the 1830s as a way of describing the ' +
           'distribution of a population, explicitly not as a measure of individual fatness. It ' +
           'remains genuinely useful for exactly that: comparing groups, tracking trends, screening ' +
           'at scale cheaply. Applied to one person it is a crude first indicator that suggests ' +
           'whether a closer look is warranted — which is how clinicians use it, alongside blood ' +
           'pressure, blood glucose, lipids and waist measurement.',
      },
      {
        h: 'Children, older adults and pregnancy',
        p: 'For anyone under 20, adult categories do not apply at all: children are assessed against ' +
           'age-and-sex percentile charts because body composition changes throughout growth. Older ' +
           'adults lose height and muscle, which distorts the figure, and a slightly higher BMI is ' +
           'associated with better outcomes after about 65. BMI is not meaningful during pregnancy. ' +
           'In all three cases, use the appropriate clinical tool rather than this one.',
      },
    ],
    steps: [
      'Choose metric or imperial units.',
      'Enter height and weight.',
      'Read the BMI and both category sets — use the one appropriate to your ancestry.',
    ],
    notes: [
      'Metric: kg ÷ m². Imperial: 703 × lb ÷ in².',
      'Asian-Indian thresholds are 23 for overweight and 25 for obese, against WHO\'s 25 and 30.',
      'Not valid for children, during pregnancy, or as a measure of body composition in ' +
       'athletes.',
    ],
    faq: [
      ['Why does this show two different BMI categories?',
       'Because the WHO thresholds were derived largely from European populations, and South ' +
       'Asian and East Asian populations develop metabolic disease at lower BMIs. India\'s ' +
       'guidelines set overweight at 23 rather than 25. Use the set that matches your ancestry — ' +
       'the difference is clinically meaningful.'],
      ['Is BMI accurate for muscular people?',
       'No. It cannot distinguish muscle from fat, so athletes and anyone who lifts seriously ' +
       'are frequently classified as overweight or obese with very low body fat. Waist ' +
       'measurement or a body composition assessment is far more informative for them.'],
      ['What is a healthy BMI?',
       '18.5 to 24.9 under WHO thresholds, and 18.5 to 22.9 under the Asian-Indian ones. Treat ' +
       'it as a screening indicator rather than a target — waist circumference, blood pressure ' +
       'and blood markers say more about health than the ratio does.'],
    ],
  },
  'tdee-calc': {
    intro:
      'Estimates total daily energy expenditure — the calories you burn in a day — from the ' +
      'Mifflin-St Jeor equation plus an activity multiplier. A starting number to test against ' +
      'reality, not a measurement.',
    sections: [
      {
        h: 'What the two numbers mean',
        p: 'BMR is what you would burn lying still all day: breathing, circulation, brain, organ ' +
           'function. It is the large majority of most people\'s expenditure, which surprises those ' +
           'who assume exercise dominates. TDEE multiplies BMR by an activity factor to account for ' +
           'movement, exercise and the energy cost of digestion. Mifflin-St Jeor is used here ' +
           'because it has consistently outperformed the older Harris-Benedict equation in ' +
           'validation studies, though both are population averages.',
      },
      {
        h: 'The activity multiplier is where the error lives',
        p: 'BMR estimates are typically within 10% for most people. The activity multiplier is far ' +
           'cruder: the gap between “moderately active” and “very active” is several hundred ' +
           'calories, and people overwhelmingly overestimate their own activity. Three gym sessions ' +
           'a week is usually 1.375, not 1.55. If you have a desk job and train four times a week ' +
           'you are probably lightly active in this scheme, not very active — and choosing the ' +
           'higher multiplier is the commonest reason a calculated deficit produces no weight ' +
           'change.',
      },
      {
        h: 'Use it as a hypothesis and correct from the scale',
        p: 'The honest way to use any TDEE figure is as a starting estimate you then test. Eat at ' +
           'the calculated maintenance for two to three weeks, weigh yourself consistently — same ' +
           'time, same conditions — and average across each week to cut through daily water ' +
           'fluctuation. If weight is stable, the estimate was right. If it moved, adjust by 100–200 ' +
           'calories and repeat. Two weeks of your own data beats any equation, because it is ' +
           'measuring you rather than a population.',
      },
      {
        h: 'Metabolic adaptation is real and often overstated',
        p: 'Sustained calorie restriction does reduce expenditure beyond what the weight loss alone ' +
           'predicts — partly through reduced non-exercise movement, which happens unconsciously, ' +
           'and partly through hormonal changes. The effect is real and modest, typically in the low ' +
           'hundreds of calories, not the metabolic shutdown sometimes described. The larger ' +
           'practical problem is that self-reported intake is consistently underestimated, often by ' +
           '20% or more, which looks identical to a stalled metabolism from the inside.',
      },
    ],
    steps: [
      'Enter age, sex, height and weight.',
      'Choose an activity level — honestly, and probably one step lower than you first think.',
      'Use the result as a starting point, then adjust from two to three weeks of weight data.',
    ],
    notes: [
      'Uses the Mifflin-St Jeor equation, which validates better than Harris-Benedict.',
      'BMR is usually within about 10%; the activity multiplier carries far more uncertainty.',
      'This is a population estimate, not a measurement — individual variation is substantial.',
    ],
    faq: [
      ['How accurate is a TDEE calculator?',
       'The BMR component is typically within 10% for most people. The activity multiplier is ' +
       'much rougher and is where most of the error comes from, because people overestimate ' +
       'their activity. Treat the total as a starting estimate to verify against your own weight ' +
       'data.'],
      ['Which activity level should I choose?',
       'Lower than you think. Sedentary suits a desk job with little deliberate exercise; ' +
       'lightly active covers a few sessions a week; very active usually means physical work or ' +
       'daily training. Picking too high is the commonest reason a deficit does not produce ' +
       'results.'],
      ['Why am I not losing weight at my calculated deficit?',
       'Most often intake is higher than recorded — underestimation of 20% or more is well ' +
       'documented and does not feel like dishonesty. After that, the activity multiplier was ' +
       'likely too generous. Track carefully for two weeks and adjust from what the scale ' +
       'actually does.'],
    ],
  },

  // ── FINANCE ───────────────────────────────────────────────────────────────────
  'tip-calc': {
    intro:
      'Works out a tip and splits the total between any number of people, with per-person ' +
      'amounts rounded sensibly. Useful at the end of a meal when nobody wants to do ' +
      'arithmetic.',
    sections: [
      {
        h: 'Tipping norms vary enormously by country',
        p: 'The United States is the outlier: 15–20% is expected in restaurants, and service staff ' +
           'are often paid a sub-minimum wage on the assumption that tips make up the difference. In ' +
           'the UK and much of Europe, 10–12.5% is generous and service is frequently included ' +
           'already — check the bill before adding anything. Japan and South Korea do not tip at ' +
           'all, and attempting to can cause genuine awkwardness. Much of Asia, Australia and New ' +
           'Zealand sit between: rounding up is appreciated, a percentage is not expected.',
      },
      {
        h: 'Tip on the pre-tax amount',
        p: 'Where sales tax or VAT is added to the bill, the conventional base for a tip is the ' +
           'pre-tax subtotal — you are tipping on the service, not on the government\'s share. In ' +
           'practice many people tip on the total and the difference is small, but on a large bill ' +
           'in a high-tax jurisdiction it is not trivial. Card terminals that suggest tip ' +
           'percentages almost always calculate them on the post-tax total, which quietly raises the ' +
           'effective rate.',
      },
      {
        h: 'Splitting a bill fairly',
        p: 'An even split is simplest and works when everyone ordered comparably. It stops being ' +
           'fair when one person had a starter and three drinks and another had soup. The practical ' +
           'compromise that avoids an itemised argument is to split evenly but let anyone who ' +
           'ordered substantially more volunteer the difference. Note also that rounding each share ' +
           'up by a small amount covers the awkward remainder and usually rounds the tip up ' +
           'slightly, which nobody objects to.',
      },
    ],
    steps: [
      'Enter the bill amount.',
      'Choose a tip percentage, or enter one.',
      'Set the number of people to split between.',
      'Read the tip, total and per-person amounts.',
    ],
    notes: [
      'Tip conventionally applies to the pre-tax subtotal where tax is added separately.',
      'Check whether service is already included before adding a tip — common in Europe.',
      'Card terminals usually suggest percentages on the post-tax total.',
    ],
    faq: [
      ['How much should I tip?',
       'It depends entirely on where you are. 15–20% is standard in US restaurants; 10–12.5% is ' +
       'generous in the UK and much of Europe, where service is often already included; and ' +
       'Japan and South Korea do not tip at all. Check the local norm rather than exporting your ' +
       'own.'],
      ['Should I tip on the pre-tax or post-tax amount?',
       'Conventionally pre-tax, since the tip is for the service rather than the tax. The ' +
       'difference is small on a modest bill and meaningful on a large one — and card terminals ' +
       'almost always suggest percentages of the post-tax total.'],
      ['How do I split a bill unevenly?',
       'Calculate the tip on the full bill, then divide in proportion to what each person ' +
       'ordered. For most groups an even split with a voluntary adjustment from anyone who ' +
       'ordered substantially more is faster and causes less friction than itemising.'],
    ],
  },
  'budget-calc': {
    intro:
      'Breaks monthly income into needs, wants and savings, and shows what is left. A framework ' +
      'for seeing where money goes, which is the part most people have never actually looked ' +
      'at.',
    sections: [
      {
        h: 'The 50/30/20 rule, and when it does not fit',
        p: 'Half of after-tax income to needs, 30% to wants, 20% to savings and debt repayment. It ' +
           'is a useful default because it is simple enough to follow, and it fails in expensive ' +
           'cities where housing alone exceeds 50%. When that is the case the rule is not telling ' +
           'you that you are doing it wrong; it is telling you that housing costs are structurally ' +
           'high and the other categories must absorb it. Adjust the proportions to something you ' +
           'can actually sustain — a budget nobody follows is worse than a rough one they do.',
      },
      {
        h: 'The line between needs and wants is where budgets fail',
        p: 'Rent, utilities, groceries, insurance, minimum debt payments and transport to work are ' +
           'needs. Streaming subscriptions, restaurants, the upgraded phone and most of what arrives ' +
           'by delivery are wants. The distinction is uncomfortable precisely because the wants are ' +
           'the enjoyable part, and the common failure is reclassifying a want as a need to make the ' +
           'numbers work. If it could be cancelled next month without changing your ability to live ' +
           'and earn, it is a want.',
      },
      {
        h: 'Pay yourself first, automatically',
        p: 'Budgets built on saving whatever remains at the end of the month reliably save nothing, ' +
           'because spending expands to fill the available money. Reversing it — moving savings out ' +
           'on payday, before anything else — works because the remaining balance becomes the ' +
           'budget. A standing order on the day you are paid takes five minutes to set up and ' +
           'removes the monthly decision entirely, which is the point: it stops depending on ' +
           'willpower.',
      },
      {
        h: 'The order to put money in',
        p: 'A small emergency buffer first, perhaps one month of expenses, so an unexpected bill ' +
           'does not become debt. Then any employer pension match, which is an immediate guaranteed ' +
           'return and the closest thing to free money most people encounter. Then high-interest ' +
           'debt, because paying off 20% interest beats any investment return reliably available. ' +
           'Then build the emergency fund to three to six months. Then longer-term investing. The ' +
           'order matters more than the amounts.',
      },
    ],
    steps: [
      'Enter your monthly after-tax income.',
      'List your fixed needs, then your discretionary spending.',
      'Compare the split against 50/30/20 and adjust the proportions to what you can sustain.',
      'Set up an automatic transfer on payday for the savings figure.',
    ],
    notes: [
      'Use after-tax income — budgeting from gross pay overstates what you have by a large ' +
       'margin.',
      'Annual costs (insurance, road tax, subscriptions) should be divided by twelve and ' +
       'treated as monthly.',
      'Nothing is stored; figures stay in your browser.',
    ],
    faq: [
      ['What is the 50/30/20 budget rule?',
       '50% of after-tax income to needs, 30% to wants, 20% to savings and debt repayment. It is ' +
       'a starting framework rather than a prescription — in high-cost housing markets the needs ' +
       'share is often unavoidably larger, and the right response is to adjust the other two ' +
       'rather than abandon budgeting.'],
      ['Should I pay off debt or save first?',
       'Build a small emergency buffer first so a surprise does not create new debt, then take ' +
       'any employer pension match, then attack high-interest debt. Paying down 20% interest ' +
       'beats any reliable investment return, so that debt comes before further saving.'],
      ['How much should I have in an emergency fund?',
       'Three to six months of essential expenses is the usual guidance, more if your income is ' +
       'irregular or your household has a single earner. Start with one month — the first ' +
       'thousand is the one that stops small emergencies becoming debt.'],
    ],
  },
  'net-worth-calc': {
    intro:
      'Totals assets and subtracts liabilities to give net worth — the single number that ' +
      'summarises financial position, and the one that actually matters over time.',
    sections: [
      {
        h: 'Why net worth beats income as a measure',
        p: 'Income is a flow and net worth is a stock. A high earner who spends everything has no ' +
           'net worth, and a modest earner who saves consistently accumulates one. Because net worth ' +
           'responds to the gap between earning and spending rather than to earning alone, it is the ' +
           'figure that reflects financial decisions over time — which is exactly why it moves ' +
           'slowly and why tracking it quarterly is more informative than obsessing monthly.',
      },
      {
        h: 'Count assets honestly',
        p: 'At realistic sale value, not what you paid or what you feel it is worth. A car is worth ' +
           'its trade-in price, which is markedly less than its insured value. A house is worth what ' +
           'it would sell for minus the costs of selling, which are several percent. Furniture, ' +
           'clothes and electronics are worth close to nothing second-hand and are usually better ' +
           'excluded entirely. Overstating assets produces a comforting number that misleads you ' +
           'specifically.',
      },
      {
        h: 'Include every liability, including the ones you round away',
        p: 'Mortgage, car finance, student loans, credit card balances, buy-now-pay-later ' +
           'instalments, family loans and any tax owed. The instalment plans are the easiest to ' +
           'overlook because each is small, and collectively they are frequently not. Note that a ' +
           'mortgage on a home worth more than the loan still contributes positively overall — it is ' +
           'the loan itself that is the liability, not the ownership.',
      },
      {
        h: 'Negative net worth is normal at certain points',
        p: 'A recent graduate with student debt and no assets has negative net worth, and so does ' +
           'anyone early in a mortgage in a flat market. It is a snapshot rather than a verdict. ' +
           'What matters is the direction: a number improving by a consistent amount each quarter ' +
           'tells you the plan works, and one flat or falling while income is steady tells you ' +
           'spending has absorbed it. Track the trend, not the absolute figure.',
      },
    ],
    steps: [
      'List your assets at realistic sale value.',
      'List every liability, including small instalment plans.',
      'Read the total, and record it so you can compare next quarter.',
    ],
    notes: [
      'Value assets at what they would actually sell for, minus selling costs.',
      'Depreciating personal items are usually better excluded than optimistically valued.',
      'Figures stay in your browser — nothing is stored or transmitted.',
    ],
    faq: [
      ['What counts as an asset?',
       'Cash, savings, investments, pensions, property and vehicles — valued at what they would ' +
       'realistically sell for. Personal possessions are usually worth so little second-hand ' +
       'that including them adds noise rather than information.'],
      ['Is negative net worth bad?',
       'Not in itself, and it is common early in a career or a mortgage. The direction matters ' +
       'far more than the level: consistent quarterly improvement means the approach is working, ' +
       'whatever the starting point.'],
      ['How often should I calculate net worth?',
       'Quarterly is enough. It moves slowly by nature, and checking monthly mostly captures ' +
       'market noise and invites reacting to it. Recording the same figure four times a year ' +
       'makes the trend visible without the distraction.'],
    ],
  },

  // ── VIDEO ─────────────────────────────────────────────────────────────────────
  'video-to-gif': {
    intro:
      'Converts a clip of video into an animated GIF in your browser. GIF is a poor video ' +
      'format by every technical measure and remains the only one that plays everywhere without ' +
      'a player, which is why it survives.',
    sections: [
      {
        h: 'Why GIFs are so large',
        p: 'GIF compresses each frame independently and supports only 256 colours per frame. Modern ' +
           'video codecs encode the differences between frames, which is why a ten-second MP4 can be ' +
           '200 KB and the same clip as a GIF is 8 MB. There is no quality setting to fix that — the ' +
           'format simply has no inter-frame compression. Every technique for shrinking a GIF is ' +
           'therefore about removing data: fewer frames, fewer pixels, fewer colours.',
      },
      {
        h: 'The three levers, in order of effect',
        p: 'Dimensions matter most, because file size scales with area: halving the width and height ' +
           'quarters the pixel count. Frame rate is next — 10 to 15 fps is usually acceptable for a ' +
           'UI demo or a reaction clip, against 30 for the source, and that alone halves the size. ' +
           'Duration is the third: under five seconds is the practical target. Reducing the palette ' +
           'helps for flat graphics and hurts noticeably on photographic content, where banding ' +
           'appears.',
      },
      {
        h: 'Use a video file where you can',
        p: 'Every platform that matters now accepts MP4 or WebM, and several — including X, Reddit ' +
           'and Discord — silently convert uploaded GIFs to video anyway, because it saves them ' +
           'enormous bandwidth. A looping, muted, autoplaying MP4 gives better quality at a fraction ' +
           'of the size. GIF earns its place in a few specific spots: email, where video does not ' +
           'play; documentation and README files, where GitHub renders GIFs inline and video poorly; ' +
           'and chat platforms where a GIF drops in without a click.',
      },
    ],
    steps: [
      'Choose your video and set the start and end of the clip.',
      'Reduce the dimensions and frame rate before worrying about anything else.',
      'Convert, check the file size, and go smaller if it is above a couple of megabytes.',
    ],
    notes: [
      'GIF is limited to 256 colours per frame, which causes banding on photographic content.',
      'Dimensions affect size most, then frame rate, then duration.',
      'Conversion runs in your browser — the video is never uploaded.',
    ],
    faq: [
      ['Why is my GIF so large?',
       'Because GIF has no compression between frames — every frame is stored almost ' +
       'independently. Reduce the dimensions first, then the frame rate to 10–15 fps, then the ' +
       'duration. There is no quality slider that solves it.'],
      ['Should I use a GIF or a video?',
       'A video, almost always — it is far smaller at better quality and every major platform ' +
       'supports it, with several converting your GIF to video on upload regardless. GIF is ' +
       'right for email, for GitHub README files, and for chat platforms where it plays without ' +
       'a click.'],
      ['What frame rate should a GIF use?',
       '10–15 fps is usually indistinguishable for screen recordings and reaction clips, and ' +
       'halves the file size against 30. Go higher only for fast motion where the judder is ' +
       'obvious.'],
    ],
  },
  'video-to-audio': {
    intro:
      'Extracts the audio track from a video file and saves it separately, in your browser. ' +
      'Useful for lectures, interviews, podcasts recorded on video, and anything you would ' +
      'rather listen to than watch.',
    sections: [
      {
        h: 'Extraction can be lossless, and often is not',
        p: 'A video file contains an already-encoded audio stream. Copying that stream out unchanged ' +
           'is lossless and instant — no re-encoding, no quality change. Converting it to a ' +
           'different format means decoding and re-encoding, which loses a little. Where the source ' +
           'audio is already AAC and you want an M4A, copying is the right operation; converting to ' +
           'MP3 is a generation loss for no benefit unless something in your chain specifically ' +
           'needs MP3.',
      },
      {
        h: 'What bitrate is enough',
        p: 'For speech — lectures, interviews, podcasts — 64 to 96 kbps mono is entirely adequate ' +
           'and produces small files, which matters when the recording is two hours long. Music ' +
           'wants 192 kbps or more in a lossy format. Re-encoding above the source bitrate gains ' +
           'nothing: you cannot add information that was never there, and a 128 kbps source ' +
           'converted to 320 kbps is simply a larger file containing the same audio.',
      },
      {
        h: 'Copyright applies to the audio as much as the video',
        p: 'Extracting the soundtrack from something you did not create and redistributing it is ' +
           'infringement, and the fact that it is technically easy changes nothing about that. The ' +
           'defensible uses are your own recordings, material you have licensed, content under a ' +
           'permissive licence, and personal-use extraction where local law allows it. Worth stating ' +
           'plainly, because this is a tool whose obvious use case is often the impermissible one.',
      },
    ],
    steps: [
      'Choose your video file.',
      'Pick the output format — copying the existing stream is lossless where available.',
      'Extract and download.',
    ],
    notes: [
      'Speech is fine at 64–96 kbps mono; music wants 192 kbps or above.',
      'Re-encoding above the source bitrate adds file size and no quality.',
      'Processing runs in your browser — recordings are never uploaded.',
    ],
    faq: [
      ['Does extracting audio reduce quality?',
       'Not if the existing stream is copied unchanged — that is lossless. Converting to a ' +
       'different format decodes and re-encodes, which loses a little. Keep the original format ' +
       'where your player supports it.'],
      ['What bitrate should I use for a lecture recording?',
       '64–96 kbps mono is plenty for speech and keeps a long recording manageable. Stereo and ' +
       'higher bitrates are wasted on a single voice and can double or triple the file size for ' +
       'no audible gain.'],
      ['Is it legal to extract audio from a video?',
       'From your own recordings or licensed material, yes. From copyrighted content you do not ' +
       'own it is infringement to redistribute, and personal-use rules vary by country. The tool ' +
       'does not change the copyright position.'],
    ],
  },

  // ── MATH ──────────────────────────────────────────────────────────────────────
  'area-calc': {
    intro:
      'Calculates the area of common shapes — rectangle, triangle, circle, trapezoid, ' +
      'parallelogram and more — from their dimensions, with the formula shown.',
    sections: [
      {
        h: 'Height means perpendicular height, and this is the usual error',
        p: 'For a triangle or a parallelogram, the height is the perpendicular distance from the ' +
           'base to the opposite vertex or side — not the length of a slanted side. On a leaning ' +
           'parallelogram the slanted side is longer than the perpendicular height, and using it ' +
           'overstates the area. For a triangle where you know all three sides but no height, ' +
           'Heron\'s formula gives the area directly from the sides, which is often easier than ' +
           'constructing the height.',
      },
      {
        h: 'Squared units, and the mistake that costs money',
        p: 'Area scales with the square of the length ratio. A metre is 100 centimetres, so a square ' +
           'metre is 10,000 square centimetres, not 100. Double every dimension and the area ' +
           'quadruples. This is where flooring orders, paint quantities and land measurements go ' +
           'wrong, and the error is always in the same direction — under-ordering by a factor that ' +
           'looks plausible until the materials arrive. Convert all dimensions to one unit before ' +
           'calculating, never after.',
      },
      {
        h: 'Breaking an awkward shape into simple ones',
        p: 'Most real rooms and plots are not single shapes. The reliable method is to divide them ' +
           'into rectangles and triangles, calculate each, and add — or calculate the enclosing ' +
           'rectangle and subtract the missing corners, which is often fewer steps. For a genuinely ' +
           'irregular boundary, the surveyor\'s approach is to split it into triangles from one ' +
           'vertex and use Heron\'s formula on each.',
      },
      {
        h: 'Real-world area needs waste allowance',
        p: 'Calculated area is the minimum. Flooring and tiling conventionally add 10% for cuts and ' +
           'breakage, and more for a diagonal layout or a room with many angles, where offcuts are ' +
           'larger. Paint coverage figures on the tin assume a smooth primed surface; textured or ' +
           'porous walls absorb considerably more. Wallpaper is bought in whole rolls with pattern ' +
           'repeat waste. Ordering exactly the calculated area is how a job stops halfway through.',
      },
    ],
    steps: [
      'Choose the shape.',
      'Enter its dimensions, all in the same unit.',
      'Read the area and the formula applied — then add a waste allowance for real materials.',
    ],
    notes: [
      'Triangle and parallelogram height is the perpendicular height, not a slanted side.',
      '1 m² = 10,000 cm², and 1 km² = 1,000,000 m² — the factor is squared.',
      'Add roughly 10% for flooring and tiling waste, more for diagonal layouts.',
    ],
    faq: [
      ['How do I calculate the area of an irregular room?',
       'Divide it into rectangles and triangles, work out each, and add them. For a shape that ' +
       'is nearly rectangular with a bite taken out, calculating the full rectangle and ' +
       'subtracting the missing part is usually quicker.'],
      ['What is the height of a triangle?',
       'The perpendicular distance from the base to the opposite vertex — not the length of a ' +
       'sloping side. If you know all three sides but no height, use Heron\'s formula, which ' +
       'gives the area from the sides alone.'],
      ['How many square feet are in a square metre?',
       '10.764, which is 3.28 squared. The ratio applies in both dimensions, which is why it is ' +
       'not 3.28 — that is the single most common area conversion error.'],
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
