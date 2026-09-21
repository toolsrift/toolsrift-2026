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
