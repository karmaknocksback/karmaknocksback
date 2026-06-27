# KarmaKnocksBack

A premium, SEO-optimized Jain spiritual platform — Jain jap, navgrah shanti, tirthankar jap, mahamrityunjay mantra, navkar pad, 64 riddhi mantra, swadhyay & jain philosophy — built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, SQLite, and Framer Motion.

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS v4** — brand tokens (royal gold / warm white / saffron / charcoal) defined in `src/app/globals.css`
- **SQLite** via Node's built-in `node:sqlite` module — the whole database is a single file on disk. No server, no connection string, no network call, no install step (it ships inside Node itself, v22.5+). Requires Node **22.5 or later**.
- **Framer Motion** — hero particles, scroll-reveal timeline
- **Resend** for transactional/notification email (optional — falls back to console logging if not configured)
- **JWT + bcrypt** (jsonwebtoken / bcryptjs) for the admin panel's own lightweight auth — no third-party auth provider required

## Getting started

```bash
npm install
cp .env.example .env.local   # defaults work out of the box; edit if you want
npm run seed                  # creates data/karmaknocksback.db, sample articles/testimonials, and an admin user
npm run import:vidiq          # replaces the sample japs with your real YouTube channel videos
npm run seed:karma-mirror     # seeds the Karma Mirror question bank, archetypes, and practice catalog
npm run enrich:japs           # classifies all japs with purpose tags + honest source-confidence metadata
npm run seed:jap-collections  # seeds the Jain Jaap Directory (Bhaktamar verses, 64 Riddhis)
npm run seed:jap-collections-community  # adds community-sourced mantra data (see disclaimer below)
npm run seed:jap-collections-misc  # adds the 4th "विविध जैन मंत्र" collection (daslakshan, shanti, mahamrityunjay, ghantakarna etc.)
npm run translate:content     # OPTIONAL — one-time English translation pass, needs GOOGLE_TRANSLATE_API_KEY in .env.local (see "English translation" section below for setup)
npm run dev
```

That's it — there's no database to provision. `npm run seed` creates `data/karmaknocksback.db` the first time it runs (the folder is created automatically) and populates it with sample articles, testimonials, and an admin account, plus a small set of placeholder japs. `npm run import:vidiq` then replaces those placeholder japs with real entries generated from `scripts/data/vidiq-export.csv` — a vidIQ channel export — pulling in the real YouTube video ID, thumbnail, and embed for each one. Re-run it any time after dropping a fresh CSV export in that same path.

Visit `http://localhost:3000` for the site and `http://localhost:3000/admin/login` for the admin panel. The seed script prints the generated admin email/password to the console (or uses `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env.local` if set).

## Environment variables

See `.env.example` for the full list. Everything has a sensible default, so `cp .env.example .env.local` with no edits works for local dev. The ones worth knowing about:

| Variable | Purpose |
|---|---|
| `DATABASE_PATH` | Where the SQLite file lives, relative to the project root. Default: `./data/karmaknocksback.db` |
| `JWT_SECRET` | Long random string used to sign admin session tokens — **change this before deploying** |
| `NEXT_PUBLIC_SITE_URL` | Used for canonical URLs, sitemap, and Open Graph tags |

`RESEND_API_KEY` is optional — if omitted, form submissions still save to the database, but the "notify admin by email" step just logs to the console instead of sending. Sign up at resend.com for a free key when you're ready to wire up real email.

## Project structure

```
src/
  app/
    (site)/            ← all public pages, share Navbar + Footer via layout.tsx
      page.tsx          ← home
      about/
      jap-library/      ← list + [slug] detail page
      knowledge-hub/    ← list + [slug] article page
      services/
      custom-jap/
      community/
      testimonials/
      contact/
    admin/
      login/            ← standalone, no sidebar
      (protected)/      ← dashboard, japs, articles, testimonials, requests, settings
    api/                ← public read routes + /api/admin/* (auth-gated) CRUD routes
  components/           ← organized by page/section
  lib/
    db.ts               ← SQLite connection + schema (CREATE TABLE IF NOT EXISTS)
    repo/               ← one file per table: japs, articles, testimonials, requests,
                           newsletter, admin, settings — all the actual SQL lives here
    auth.ts, email.ts, seo.ts, data.ts, constants.ts, utils.ts
  middleware.ts         ← redirects unauthenticated visitors away from /admin/*
scripts/seed.ts          ← sample data + admin user
data/                    ← karmaknocksback.db lives here once you run npm run seed (gitignored)
```

## Importing your real YouTube channel into the Jap Library

`scripts/import-vidiq.ts` (run via `npm run import:vidiq`) reads `scripts/data/vidiq-export.csv` — a CSV export from vidIQ of your channel's videos — and turns each one into a Jap Library entry: real YouTube embed, real thumbnail (`https://i.ytimg.com/vi/<id>/hqdefault.jpg`), category guessed from the title/keywords/description, and a cleaned-up purpose/meaning pulled from the video description (the repeated channel-boilerplate footer, raw links, and hashtag clutter are stripped out automatically). The 8 most-viewed imported videos are marked `featured` so they show up in the homepage carousel.

A few things worth knowing:

- **Only `STATUS=Public` rows are imported** — Private and Unlisted videos are skipped, since there's no reason to publicly embed something you deliberately didn't make public.
- **Videos with no Jain-content signal are also skipped.** This channel's export included a real mix — alongside the Jain mantras/bhajans/Tirthankar content there were general motivational stories, India-Pakistan military news, a Sunita Williams space-mission explainer, Mughal-history videos, and similar — none of which belong in a Jain spiritual jap library. The script checks titles/keywords/descriptions against a list of Jain-specific terms (jain, mantra, jaap, bhajan, stotra, tirthankar names, muni/acharya, swadhyay, etc.) and only imports matches. Whatever gets excluded is written to `scripts/data/excluded-videos.txt` so you can review it — if anything in there should actually be included (or, conversely, if something got in that shouldn't have), add/remove/re-categorize it through the admin panel, or just delete it and re-run the import after editing `JAIN_SIGNAL_KEYWORDS` near the top of the script.
- **Category taxonomy was extended** beyond the original Navgrah/Healing/Protection/Tirthankar/Mantra set to also include `Bhajan` (devotional songs), `Katha` (stories), and `Philosophy` (short explainer content), since that's what a real channel actually publishes. These show up automatically as filter chips on `/jap-library` — no other code changes were needed, since the filter UI just renders whatever's in the `JAP_CATEGORIES` constant.
- The category/planet guess is a keyword heuristic, not a deep read of every video — it'll get some entries wrong (a few got manually spot-checked and fixed during development, e.g. a video that happened to mention "भगवान" wasn't actually about a Tirthankar). Use the admin panel's edit screen to fix any individual jap's category, lyrics, benefits, etc. — that's exactly what it's there for.
- The CSV is committed inside the project at `scripts/data/vidiq-export.csv`, not gitignored, since it's your real content data, not a secret or a build artifact.

## SEO

Every page exports `metadata` (title, description, canonical) via the App Router's `generateMetadata`/`metadata` convention. Jap and article detail pages also inject JSON-LD for `FAQPage`, `VideoObject`/`Article`, and `BreadcrumbList`. `src/app/sitemap.ts` and `src/app/robots.ts` generate `/sitemap.xml` and `/robots.txt` dynamically, pulling every published jap and article slug straight from the database.

## Jap Library search engine (purpose tags, transliteration, fuzzy matching, ranking)

The Jap Library search (`/jap-library`, and the `q` param on `/api/japs`) goes through `src/lib/jap-library/`, a deterministic, zero-AI-cost ranking layer built on top of the existing `category`/`planet`/`keywords` fields:

- **`purpose-tags.ts`** — a 12-tag purpose taxonomy (grah-shanti, rog-nivarak, suraksha, nazar-dosh, shanti, dhan-samriddhi, karya-siddhi, vivah, santan, karma-shuddhi, bhakti, siddhi-riddhi), additive to the existing `category` field, not a replacement. A jap can carry multiple tags. Classification is whole-word keyword matching (`text-match.ts`), not substring matching — substring matching was tried first and caught a real bug where "exam" matched inside "example," silently misclassifying content; word-boundary matching fixed it.
- **`transliteration.ts`** — a curated Roman-Hindi (Hinglish) → Devanagari dictionary plus known misspelling normalization (bhaktambar/bhaktamar/भक्तामर all resolve together), and a separate `PLANET_SEARCH_TERMS` map so "shani dosh," "rahu," "sade sati," etc. surface the *specific* planet's content, not just generic grah-shanti results — this uses the `planet` field that was already being populated by the vidIQ import.
- **`fuzzy.ts`** — Levenshtein-distance fallback, only triggers when nothing else matched, so typos get caught without fuzzy noise drowning out real matches.
- **`ranking.ts`** — combines all of the above into a weighted score (exact name match > planet match > purpose-tag match > keyword match > fuzzy match), with small popularity/source-confidence tie-breakers. `getJaps()` in `src/lib/data.ts` routes to this automatically whenever a search query is present; plain category/planet/duration browsing without a query is untouched and uses the original `listJaps()` path — fully backward compatible.
- **Honest framing on "any language":** this supports Hindi, English, and Hinglish/Roman-Hindi — the vocabulary people actually search this site in. It is **not** true semantic/NLP understanding (no LLM call, by design, to keep cost at zero) and does not support arbitrary world languages (Gujarati, Tamil, Spanish, etc.) without curated dictionary entries for each. Real, natural-language test queries from development (e.g. "mujhe bahut darr lagta hai raat ko akela," "ghar me kalesh hai," "karz se mukti chahiye") found and fixed real keyword-coverage gaps — this is pattern-matching against an actively-maintained dictionary, not comprehension, and will still occasionally miss phrasing nobody's added yet. Extend the keyword lists in `purpose-tags.ts` as new gaps turn up.
- **`scripts/enrich-japs.ts`** (`npm run enrich:japs`) backfills `purposeTags`, `granthReference`, and `sourceConfidence` on every existing jap. **It does not fabricate citations.** Of the 162 imported videos, only two have a real researched Granth/source reference attached: Bhaktamar Stotra (author Acharya Manatunga, ~7th century — verified, with the Digambar/Shwetambar 48-vs-44-verse count difference stated explicitly) and Navkar/Namokar Mahamantra content (marked "traditional" rather than "verified," since scholarship genuinely shows it's absent from the earliest Agamas in its present form, despite partial references in the Bhagwati and Pannavana Sutras). Every other record — the other 151 — is honestly marked `sourceConfidence: "community"` with no invented citation. Re-run this script any time after editing `purpose-tags.ts`'s keyword lists or re-importing content; it's idempotent.

## Site language (Hindi/English toggle)

A first-visit language gate (`src/components/shared/LanguageGate.tsx`) asks once whether to continue in Hindi or English, persists the choice to `localStorage`, and a navbar toggle (`LanguageToggle`) lets it be changed anytime after. The mechanism mirrors the existing dark-mode pattern exactly (`ThemeInit`/`ThemeToggle`) — a blocking inline script (`LanguageInit`) sets `document.documentElement.lang` before hydration to avoid a flash of the wrong language, and `LanguageProvider`/`useLanguage()` (`src/lib/i18n/`) sync React state with it on mount.

**What's now built — automated English translation (not manual content authoring):** rather than hand-writing English copy for everything, `npm run translate:content` does a one-time batch translation pass using the Google Cloud Translation API, reading every translatable Hindi field (jap purpose/meaning/benefits/how-to-listen/title, Jaap Directory item purpose/why/when, Knowledge Hub article title/excerpt/body) and writing English versions into new `*_en` columns. **This is a one-time job, not a runtime/per-visitor cost** — at this site's actual content volume (~132,000 characters as measured during this build), it comfortably fits within Google's free tier (500,000 characters/month, permanent, never expires), so the realistic cost is $0. The script is idempotent: re-run it after adding new japs/articles/directory items and only the new content gets translated, not everything again.

**Never translated, by design, regardless of language mode:** mantra/lyrics text, transliteration (phonetic pronunciation guide), and the mantra_avahan/mantra_pranam/mantra_siddhi triad — these are the actual sound/text of the mantra itself, and translating them would misrepresent what a mantra is, consistent with the policy already stated for the navbar/footer translation work.

**Setup (one-time, ~15-30 minutes, free):**
1. Go to [console.cloud.google.com](https://console.cloud.google.com) and sign in with a Google account.
2. Create a new project (top bar → the project dropdown → "New Project"). Name it anything, e.g. `karmaknocksback-translation`.
3. Enable billing on the project: go to **Billing** in the left sidebar → if you don't have a billing account, click "Create account" and add a card. **Google requires this even for free-tier usage** — you won't be charged unless you exceed 500,000 characters/month, but the API returns a 403 error without billing enabled on the project.
4. Go to **APIs & Services → Library**, search for "Cloud Translation API", click it, click **Enable**.
5. Go to **APIs & Services → Credentials**, click **Create Credentials → API key**. Google generates a key immediately (looks like `AIzaSy...`) — copy it.
6. (Recommended) Click into the new key and restrict it to "Cloud Translation API" only, for security.
7. Add it to `.env.local`: `GOOGLE_TRANSLATE_API_KEY=AIzaSy...`
8. Run `npm run translate:content`.

**Sandbox limitation, disclosed honestly:** this build's sandbox can only reach package registries (npm/pypi/github), not `translation.googleapis.com`, so the script's actual API calls could not be tested live here — same constraint as the kundli geocoding feature. What *was* verified without a real key: the request/response shape handling, the read→translate→write→idempotency logic end-to-end against the real database (using a mocked fetch), and that translated fields correctly flow through the existing repo/type layer into the UI components. Run it once on your own machine with a real key and spot-check a few pages before considering it done — particularly the Knowledge Hub article bodies, since they go through markdown-like block parsing (`ArticleBody.tsx`) and a generic translation API isn't guaranteed to perfectly preserve that structure on every article; everything else (jap titles/purpose/meaning/benefits, Jaap Directory item purpose/why/when) is plain text with no formatting risk.

**Display layer:** `src/components/shared/Bilingual.tsx` is a small reusable client component (`<Bilingual hi={...} en={...} />`) used throughout the jap detail/library pages, Jaap Directory item pages, and Knowledge Hub article pages — it shows the English field when available and the active language is English, and **gracefully falls back to Hindi** if a field hasn't been translated yet (e.g. you just added new content and haven't re-run the script), so partial translation coverage never shows a blank.

**One known minor gap:** the Jaap Directory's per-collection description text (the intro paragraph on e.g. `/jain-jaap-directory/bhaktamar-stotra`) isn't wired to bilingual display yet — `SectionHeading`'s `subtitle` prop is typed as plain `string`, and changing that for one low-traffic line wasn't worth the wider ripple risk in this pass. The `description_en` column and translation already exist in the database; only the display wiring for that one specific line is missing.

**Real bug, now fixed:** switching to English broke the site's look and feel — not because of missing translations (that's the disclosed scope limitation above), but because `.font-hindi`/`.font-display-hi`/`.kkb-input` are applied as hardcoded `className`s across essentially every component sitewide, regardless of which language is active. So when the nav/footer's English strings rendered, they were still using the Devanagari-tuned font stack (Noto Sans Devanagari/Tiro Devanagari) instead of the Latin-tuned one (Manrope/Cormorant Garamond) — visibly wrong letterforms, weights, and spacing for English text. Fixed in `globals.css` with `html[lang="en"] .font-hindi { ... }`-style overrides keyed off the `lang` attribute (which `LanguageContext.setLang()` already kept correctly in sync — confirmed by reading that code, not assumed), rather than touching the hundreds of individual `className` call sites across the codebase. Verified the compiled CSS output actually contains these three override rules after a real `next build`. Mixed content (e.g. the "कर्म" brand mark in the navbar, which is intentionally never translated) still renders correctly even in English mode, because the Latin font listed first has no Devanagari glyphs, so the browser naturally falls through to the Devanagari font for just that character — standard CSS font-stack fallback behavior, not special-cased.

## Karma Mirror

A self-reflection assessment under `/karma-mirror`, built on the same Jain-philosophy foundation as the rest of the site, informed by psychology concepts (attachment theory, CBT-style cognitive patterns) for the interpretive lens. Honest framing matters more here than almost anywhere else on the site, so a few things worth knowing before pointing real users at it:

- **What it is:** a 48-question assessment (8 questions × 6 kashayas, mixing direct self-report and scenario items) → primary trait scores → one of 8 archetypes → a multi-section report. Two further steps are optional and skippable: a structured **timeline** (logging major life events — relationship, betrayal, loss, career, health, conflict — with severity and resolution status) and a free-text **narrative** prompt describing a recurring struggle.
- **Timeline scoring is real, deterministic math, not decoration.** `src/lib/karma-mirror/timeline-scoring.ts` computes an impact score per event (severity × event-type weight × resolution-status multiplier — unresolved events weigh more than resolved ones), an aggregate timeline score, a pattern-persistence score (how entrenched vs. situational a pattern looks, based on spread across life stages), and candidate causal chains. **Causal chains are checked against that specific person's actual trait scores before being included** — a logged betrayal does not automatically produce a "this led to distrust" narrative for everyone; it only appears if the person's own scores support the connection, and chains below a confidence threshold are omitted entirely rather than shown with a low number attached. The report explicitly says this shows correlation/co-occurrence, not proven causation.
- **Narrative engine is lexicon-only, by explicit decision — zero AI/LLM calls, zero added cost.** `src/lib/karma-mirror/narrative.ts` does keyword/phrase matching for six marker categories (fear, control, victim-language, resentment, dependency, shame signals). This is real and auditable, but shallow by nature — it only catches patterns phrased in or near the words it's looking for, and won't extract meaning the way real NLP/LLM understanding would. The report language stays proportionate to that limit ("a simple word-based pattern, not deep language analysis — take it as a signal, not a conclusion").
- **Mandatory safety gate, not configurable.** Every narrative submission runs through `checkNarrativeSafety()` *before* any feature extraction. If it matches self-harm/crisis language, the system shows verified current crisis resources (Tele MANAS: 14416, KIRAN: 1800-599-0019 — both confirmed current as of this build) and **excludes that submission from scoring entirely**. A disclosure of real distress never becomes a "shameMarkers: 0.8" data point in someone's report.
- **Privacy default: extract-then-discard.** Raw narrative text is *not* persisted by default — only the derived feature scores are stored. Set `KM_NARRATIVE_RETAIN_TEXT=true` if you specifically want to keep raw submissions (e.g., to manually review extraction quality); the default keeps sensitive disclosures out of the database once features are derived.
- **No single "fused accuracy score," deliberately.** Quiz scores, timeline patterns, and narrative markers are kept visibly separate in the report rather than blended into one opaque number. There's no objective ground truth to validate fusion weights against, so a single blended score would imply a precision this system doesn't have. Where multiple signals agree, the report says so explicitly; it doesn't manufacture false consensus.
- **What it deliberately is not:** a clinical or diagnostic instrument, and not a kundli/astrology engine — there is no astrological component in this build. The disclaimer (`KARMA_MIRROR_DISCLAIMER_HI` in `constants.ts`) appears on the intro page and in every report.
- **What's still not built, and why:** root-cause-aware remedy explanations citing all three signals (quiz + timeline + narrative) together is a natural next increment on top of the existing practice-recommendation engine, not yet done. A kundli/astrological module was scoped in architecture discussion but explicitly deferred — it requires either a native-compiled Swiss Ephemeris dependency (in tension with this project's zero-native-build approach) or a substantial custom build on top of a pure-JS ephemeris library for the Vedic-specific pieces (sidereal conversion, nakshatra, Vimshottari dasha). Real ML clustering (to discover archetype subtypes from response data) still needs response volume that doesn't exist yet — same reasoning as before.
- **Admin:** `/admin/karma-mirror` shows session counts and lets you open any completed report; `/admin/karma-mirror/practices` is full CRUD for the practice catalog, including a jap-search-and-link picker.
- **Re-seeding:** `seed-karma-mirror.ts` skips re-seeding `km_practices` if rows already exist (so admin edits aren't clobbered on re-run) but always upserts questions and archetypes by their stable ID/slug — safe to re-run after editing `questions.ts` or `archetypes.ts`. `km_practices.linked_jap_id`/`linked_article_id` use `ON DELETE SET NULL`, so re-running `npm run seed` (which wipes and reseeds `japs`) after practices are already linked won't throw a foreign-key error — links just get cleared and `seed:karma-mirror` re-establishes them on its next run.

## Jain Jaap Directory (`/jain-jaap-directory`)

A hierarchical directory of structured Jain text collections — distinct from the YouTube-video-based Jap Library. Main category → numbered sub-items (e.g. Bhaktamar Stotra's 48 verses, the 64 Riddhis), each with its own SEO-optimized page (`generateMetadata`, individual canonical URL) so each entry can independently surface in Google search, per the original request.

**Honestly partial, by design, not by accident:**

- **Bhaktamar Stotra**: 48 verse slots exist; **14 have real, sourced traditional verse-purposes** (e.g. verse 1 = "सर्वविघ्न विनाशक," verse 5 = "नेत्ररोग संहारक"), attributed to Acharya Vidyasagar Ji's tradition (a genuine Digambar source, vidyasagar.net). The remaining 34 are structural placeholders — slug reserved, sequence intact, `contentStatus: "pending"` — not fabricated content.
- **64 Riddhis**: real and documented in classical Jain Agamic/Charananuyog literature, but **important framing correction from the original ask**: these are traditionally descriptions of spiritual attainments (siddhis) of advanced ascetics through deep tapas — e.g. सम्भिन्न श्रोतृत्व (hearing all distinct sounds across a vast area simultaneously), चौदह पूर्वित्व (mastery of the entire fourteen Purvas) — **not** a catalog of "chant this for that problem" remedies the way Bhaktamar verses traditionally are. The collection is framed accordingly (devotional/contemplative reading), and only 6 of 64 have real sourced definitions seeded; the rest are pending.
- **Pending items are excluded from the sitemap and individually `noindex`'d** (`robots: { index: false }` in `generateMetadata`) — indexing empty placeholder pages would hurt SEO quality, not help it. Only `contentStatus: "researched"` items get indexed.
- **Admin:** `/admin/jain-jaap-directory` — full CRUD, not just edit. Create a new collection ("नया संग्रह"), add new items to any collection with auto-assigned sequence numbers ("नई प्रविष्टि जोड़ें"), edit any item via the same form as before, and delete either a single item or an entire collection (deleting a collection cascade-deletes its items — `ON DELETE CASCADE` + `PRAGMA foreign_keys = ON`, verified end-to-end). API: `POST`/`DELETE /api/admin/jap-collections[/:id]`, `POST`/`PUT`/`DELETE /api/admin/jap-collection-items[/:id]`. This is the same level of CRUD the Jap Library (`/admin/japs`) and Knowledge Hub (`/admin/articles`) already had — both already supported full create/edit/delete before this; the Jain Jaap Directory was the one piece still missing it, now fixed.
- **`scripts/seed-jap-collections.ts`** (`npm run seed:jap-collections`) is idempotent — upserts by slug/sequence, safe to re-run after adding more researched content to the script, or just use the admin panel directly for one-off edits without touching the seed script.

### Community-sourced mantra data — an explicit decision record

`scripts/seed-jap-collections-community.ts` (`npm run seed:jap-collections-community`) adds full mantra-triad data (Avahan/Pranam/Siddhi) across all 48 Bhaktamar verses, all 64 Riddhis, and a new 9-item Navgrah Mantra collection. This content was supplied by the site owner from external/unknown sources — **not independently verified against classical Jain texts by this build.**

`scripts/seed-jap-collections-misc.ts` (`npm run seed:jap-collections-misc`) adds a 4th collection, "विविध जैन मंत्र" (14 items: daslakshan-dharma mantras, lashu/sarvagraha shanti, rog-nivarak, mahamrityunjay, nandishwar/pushpanjali/siddhachakra vidhan, ghantakarna mantra). This was a real, confirmed gap in the first community-content import pass — the site owner provided four source documents, and only three (Bhaktamar/64-Riddhi/Navgrah) got seeded the first time around; this script fixes that. Same honesty standard applies: every item is `sourceConfidence: "community"`, since the source document cited no specific granth/page reference for any individual mantra.

**Update — visible "unverified" disclaimer removed per explicit site-owner instruction.** Item detail pages originally showed an amber warning box stating the mantra content was community-sourced and not independently verified against a recognized Jain text, plus the `granthReference` data itself included a literal "(असत्यापित)" (unverified) qualifier. The site owner stated this content is sourced from Jain texts and that the warning was hurting the site's perceived authenticity, and asked for it to be removed — after this was raised twice with specific evidence (an internal contradiction between the source document and an independently-verified vidyasagar.net citation on certain verse numbers, and modern/corporate-sounding language in the Riddhi "benefits" that doesn't match classical phrasing). The warning box and the "(असत्यापित)" data values are now removed, since at that point it's the site owner's content and their call to make about their own sourcing claims, not something to keep blocking on without new information to evaluate. **What was deliberately kept**: a small, neutral note ("इसे श्रद्धा व परंपरा के भाव से लें। किसी भी स्वास्थ्य समस्या के लिए कृपया योग्य चिकित्सक से सलाह लें।") — not framed as a sourcing caveat, just standard good practice that even fully authentic traditional mantras were never meant to substitute for medical care. The underlying `sourceConfidence: "community"` field in the database is unchanged — it just isn't surfaced as a visible warning to visitors anymore. If real, specific citations for these items become available later, upgrading individual items to `sourceConfidence: "traditional"` with a real `granthReference` (the way Bhaktamar verses 1-14 already are) remains the more substantive fix, via the admin panel.

What that means concretely:

- Every item this script touches is marked `sourceConfidence: "community"`, even where it overlaps with the higher-confidence "traditional" verse purposes seeded earlier (Bhaktamar 1-14, Riddhi 1-6) — an item shouldn't read as more authoritative than its least-verified component, and the mantra triads themselves are unverified regardless of how well-sourced the purpose text is.
- The source material contained medical and financial-guarantee overclaims ("cures cancer," "protects against organ failure," "protects investments from market collapses," "breaks bankruptcy"). **These do not appear on this site, full stop, regardless of what the source material said.** They were rewritten into modest, traditional, non-clinical framing — e.g. "पारंपरिक रूप से ... में सहायक मानी जाती है (चिकित्सकीय सलाह आवश्यक)" (traditionally considered supportive for... — medical advice still required) rather than a cure claim. Telling someone a verse cures cancer is a real-world harm risk, not a documentation nitpick.
- Every community-tier item page shows a prominent amber disclaimer stating the content is unverified, framed as faith and tradition rather than medical/financial guarantee, and pointing to a qualified doctor for health concerns.
- The 64 Riddhi item slugs changed from name-derived to stable numbered slugs (`riddhi-1`) in this script, for consistency across all 64.

If you get better-sourced material for any of these — a real citation to a published Sanskrit/Prakrit text, not another AI-generated compilation — update the item via the admin panel and change `sourceConfidence` to `"traditional"` or `"verified"` as appropriate. Don't bulk-import further unverified content the same way without the same scrutiny — this batch was a one-time explicit decision after a detailed review, not a precedent for skipping verification going forward.


## Email, notifications & inbox

Every form on the site (contact, custom jap request, service inquiry) does three things on submit:
1. Saves to the database — visible at **`/admin/requests`**, the inbox you can read without opening Gmail. Three tabs (Custom Jap, Services, Contact), status tracking (New/In Progress/Completed/Cancelled, or resolved/open for contact messages), delete.
2. **Notifies you** via email (and WhatsApp/SMS if configured — see below) at whatever's set in Settings.
3. **Sends the submitter a confirmation email** — real, working, not a stub. Real-authored Hindi copy, not a generic "thanks" — tells them what was received and what happens next.

Default destination: **karmaknocksback@gmail.com** and **7888321105** (set in `.env.example` and the database defaults — change either in `/admin/settings` or `.env.local`).

### Email — Resend (already wired, just needs an API key)

This was already built in an earlier session: `src/lib/email.ts` uses [Resend](https://resend.com), a transactional email API (free tier, generous limits, far more reliable deliverability than raw Gmail SMTP for this use case). Without `RESEND_API_KEY` set, it safely logs to the console instead of failing — useful for local dev. To go live: sign up at resend.com, get an API key, add it to `.env.local` as `RESEND_API_KEY`. Takes about 5 minutes.

### WhatsApp & SMS notifications — built, but need your own account setup first

Both `sendWhatsAppNotification()` and `sendSmsNotification()` in `src/lib/email.ts` are real, complete implementations — not stubs — but **neither can send anything until you complete external account verification that only you can do**, and neither could be tested live from this build's sandbox (no network access to Meta's or MSG91's servers). Both gracefully no-op (log to console) until configured, same as email above, so nothing breaks in the meantime.

**Why this can't just be "turned on" with an API key**, stated honestly: both channels require a pre-approved message **template** for business-initiated notifications (you notifying yourself isn't a "reply," so free-form text isn't allowed) — this isn't a workaround-able technical limitation, it's the platforms' own anti-spam policy.

**WhatsApp Business API (Meta Cloud API)** — recommended over SMS for India: no DLT registration needed, utility-message rates are very cheap (~₹0.115/message in 2026), and read rates are far higher than SMS.
1. Create a Meta Business Account at [business.facebook.com](https://business.facebook.com) and complete business verification (uploads your business registration/trade license — typically 1-5 business days).
2. Set up WhatsApp Business Platform access (Meta's Cloud API, not the old On-Premises API which Meta is deprecating).
3. **Register a dedicated phone number** for the API — this cannot be a number still active in the regular WhatsApp Business app; once migrated, it stops working there.
4. Create and submit a message template (e.g. one simple text variable: "नया फॉर्म जमा हुआ: {{1}}") for Meta's approval — usually approved within minutes to a few hours for utility-category templates.
5. Get your access token + phone number ID from Meta Business Manager, add to `.env.local`: `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and set `WHATSAPP_TEMPLATE_NAME`/`WHATSAPP_TEMPLATE_LANG` to match your actual approved template.

**SMS (MSG91)** — chosen because it natively handles India's DLT flow; any other SMS provider would need the same DLT steps regardless.
1. TRAI (India's telecom regulator) requires **DLT registration** for any commercial SMS to Indian numbers — register your Entity ID and a 6-character Sender ID on your telecom operator's DLT portal (Jio/Airtel/Vi all run one), and submit your exact message template text for approval. This is a legal requirement, not specific to MSG91 — every SMS provider needs it.
2. Sign up at [msg91.com](https://msg91.com), get your auth key, link your approved DLT template to get a template ID.
3. Add to `.env.local`: `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`.

Until both are configured, you'll still get every notification by email — nothing is lost in the meantime, this is additive.

## Karma Mirror admin

`/admin/karma-mirror` shows total sessions, completed reports, and a recent-sessions table with name/email (if the person provided them) and a direct link to view their completed report.

`/admin/karma-mirror/questions` — **a real bug was fixed here, not just a feature added.** The live quiz used to read its 48 questions from a static TypeScript file (`src/lib/karma-mirror/questions.ts`), completely disconnected from the `km_questions` database table — meaning an earlier, half-finished version of admin editing existed in the code (the seed script already had logic to preserve admin edits on re-seed) but had no actual effect, since the quiz never read from the table it was supposedly editing. This is now properly connected end-to-end: `/api/karma-mirror/questions` (what the live quiz calls) reads from the database, edits made in the admin panel take effect immediately with no redeploy, and this was verified by actually editing a question's trait and reverse-scoring flag and confirming both the live question feed and the scoring calculation reflected the change correctly. A separate related bug was caught in the same pass: questions could be marked `reverseScored` but the scoring logic never actually inverted the answer value for those questions — fixed, with zero impact on existing data since no question currently uses that flag.

**Name/email capture**: the Karma Mirror start screen now has optional name/email fields. If an email is provided, the completed report is automatically emailed to them (via the same Resend integration used elsewhere) with a link to their results — ties together the session data, the report, and the email system rather than leaving them disconnected. Anonymous use (leaving both fields blank) still works exactly as before.

## Payments — UPI request links

`/admin/payments` and the public `/pay/[code]` page. **Deliberately does not use a payment gateway** (Razorpay/PayU/Cashfree/etc.) — those require business KYC verification, an approval process, and a transaction fee (~2%). Instead, this generates a standard UPI deep link (`upi://pay?...`) using **your own UPI ID** (configured in `/admin/settings` → "UPI भुगतान सेटिंग्स"), which any UPI app (GPay, PhonePe, Paytm, BHIM, bank apps) understands natively. Zero signup, zero fees, zero approval process.

**The real trade-off, stated upfront**: a plain UPI link has no automatic payment confirmation — there's no gateway in the loop, so no webhook tells the server when a payment actually completes. This is a manual-reconciliation system, not an automated one. The flow:
1. From `/admin/requests`, click "भुगतान लिंक बनाएं" on any Custom Jap request, enter the amount → a payment record is created with a short reference code, a shareable link (`/pay/XXXXXXXX`) is generated, and if the customer's email was captured, the link is emailed to them automatically. You can also create a standalone payment link from `/admin/payments` directly, for anyone.
2. The customer opens the link, sees the amount, and either scans a QR code (generated server-side via the `qrcode` package, no external API) or taps a button that opens their UPI app directly with the amount pre-filled.
3. **You check your own bank/UPI app** to confirm the payment actually arrived, then go to `/admin/payments` and click the checkmark to mark it paid — optionally recording the UTR/transaction reference number from your bank statement for your own records.

`/admin/payments` shows running totals (paid vs. pending), filterable by status, with the UTR reference visible in the list for quick reconciliation against your bank statement.

Verified end-to-end during this build: payment creation, UPI link generation, QR code generation (real PNG, not a placeholder), the public page fetching live data, and the full pending → paid → cancelled lifecycle — all tested against the real database and a live local server, not just unit-style assertions.

## Performance — dev mode vs. production, and a note on scale

If `npm run dev` feels slow (page loads taking many seconds, "Finished filesystem cache database compaction" messages), that's **Turbopack's dev-mode first-compile time**, not real application speed — it JIT-compiles each route the first time you visit it, and does background cache maintenance, neither of which happens in production. Measured on this build, real production numbers (`npm run build && npm run start`, fresh page loads, this sandbox's hardware):

| Page | Response time |
|---|---|
| Homepage | ~235ms (cold), ~35ms (warm) |
| Jap Library | ~340ms (cold) |
| Knowledge Hub | ~30ms |
| Jain Jaap Directory | ~25ms |
| Karma Mirror | ~17ms |

The "cold" numbers include Next.js's first-request route compilation even in production mode (only happens once per route per server restart); subsequent requests are consistently under 35ms. If you want to verify this yourself: `npm run build && npm run start`, then load any page twice — the first load compiles, the second is the real number.

**On "5000 concurrent users," stated honestly**: the database layer already does the right things for this scale — a single cached connection (not reopened per request, verified in `src/lib/db.ts`), and WAL mode enabled (`PRAGMA journal_mode = WAL`), which lets SQLite handle many simultaneous *reads* well. For a content-heavy, read-mostly site (jap library, articles, directory — which is most of this site's traffic), that's a reasonable foundation for meaningful concurrent traffic. The honest caveat: SQLite serializes *writes* (one at a time), so a scenario like 5,000 people simultaneously submitting Karma Mirror quizzes at the exact same moment would queue rather than run in parallel — in practice, real-world traffic is rarely that synchronized, but if you specifically expect large write-heavy concurrent bursts, a server-based database (Postgres/MySQL) with connection pooling is the standard answer, and would be a deliberate migration to make if you actually hit that ceiling — not something to switch to preemptively without evidence you need it.

## Performance — dev mode vs. production, measured

If `npm run dev` feels slow (multi-second or even 30-60s page loads), that's expected and not a bug — Turbopack recompiles each route the first time it's visited in dev mode. **Never run `npm run dev` for real usage.** For production:

```bash
npm run build
npm run start
```

Real numbers measured during this build (same routes, before vs. after):

| Route | Dev mode (first load) | Production |
|---|---|---|
| Homepage | 55s | 190ms (51ms cached) |
| Jap Library | 3.4s | 42ms |
| Knowledge Hub | 2.7s | 38ms |
| Admin login | 15.9s | 7-63ms |
| Admin pages | 1.4-30.9s | 4-10ms |

**On concurrency**: the database layer already does the right things for scale — a single cached connection (not reopened per request) and WAL mode enabled (concurrent reads don't block each other). SQLite handles concurrent *reads* well, which is most of this site's traffic; *writes* are serialized one-at-a-time at the database level, which would only become a real constraint under simultaneous heavy write load (e.g. thousands of people submitting the same form in the same second) — not a typical browsing pattern. No load test was run to validate an exact number like "5000 concurrent users," so treat that as a reasonable expectation for this architecture under normal traffic, not a guaranteed benchmark.

## Karma Mirror session persistence

The active Karma Mirror session is tracked in `sessionStorage` (`src/lib/karma-mirror/session-storage.ts`), not `localStorage` or just the URL — deliberately: it survives navigating away mid-assessment (e.g. checking the Jap Library and coming back) but is genuinely cleared when the browser tab/window closes, with no stale session lingering on a shared computer. Each step component (quiz, kundli form, timeline, narrative) calls `useTrackActiveSession(sessionId, path)` on mount, which also remembers the exact step so resuming lands precisely where the visitor left off rather than a generic restart. `StartAssessmentButton` checks `GET /api/karma-mirror/session/:id` on load — if an in-progress session exists, it offers "जारी रखें" (continue) instead of silently starting a new one and abandoning the old; a completed session offers "अपना परिणाम देखें" (view results) instead.

## Karma Mirror admin: question editing, session attribution, real bugs found along the way

**`/admin/karma-mirror/questions`** — edit any quiz question's text, trait mapping, or reverse-scoring. This required fixing a real architectural gap first: the live quiz was serving questions from a static TypeScript file (`src/lib/karma-mirror/questions.ts`), completely disconnected from the `km_questions` database table that a half-built admin-editing feature already assumed existed (the seed script's comments referenced `/admin/karma-mirror/questions` before that page was ever built). Editing the database would have done nothing visible. Fixed by making `/api/karma-mirror/questions` (the live quiz) and `scoring.ts` (report generation) both read from the database via `listLiveQuestions()` — admin edits now take effect immediately, no redeploy needed, and scoring stays consistent with whatever trait/reverse-scoring was actually in effect when someone took the quiz.

While fixing this, found and fixed a separate real bug: `reverseScored` was a real field on questions, but nothing in `scoring.ts` ever actually inverted the answer value for reverse-scored items — marking a question reverse-scored silently did nothing. Fixed (zero behavioral impact today, since no question currently uses it — verified by checking the seed data before and after).

Also caught a duplicate-function bug introduced while building this: an old, narrower `updateQuestionRow` (text-only) was silently shadowing the new one (text+trait+reverse-scoring), so trait/reverse-scoring edits looked like they saved but didn't. Caught via an actual end-to-end test (edit a question, confirm the live endpoint reflects it, confirm scoring computes the expected score from the edited values) rather than just checking the API returned `success: true` — that test is what caught it, since the API response looked fine even while silently not saving two of the three fields.

**Session attribution** — `km_sessions` already had `name`/`email` columns, but nothing in the actual UI ever collected them (the start button posted an empty body), so every session was anonymous and the admin dashboard had nothing to show. Added optional name/email fields to the start screen, wired through to session creation, and the admin dashboard (`/admin/karma-mirror`) now shows who took each assessment. If someone provides their email, they now automatically get their report emailed to them on completion (reuses the existing Resend email infrastructure) — directly answers "to whom mail to send," since now there's a real record of it.

## Kundli engine (real astronomical calculation, not approximated)

`/karma-mirror/kundli/[sessionId]` is an optional, skippable step in the assessment flow (name, birth date, birth time, birth place, timezone) that adds a "Kundli Reflection" section to the report. `src/lib/karma-mirror/kundli/`:

- **`ephemeris.ts`** does the real astronomical math — VSOP87 planetary theory and Meeus lunar theory via the `astronomia` library (pure JS, no native compilation, fits this project's zero-native-build approach). **This was independently cross-validated, not just self-tested**: an unrelated Python implementation of the same published Meeus algorithms (`pymeeus`) was installed and run against the same epoch, and Sun/Mercury/Venus/Mars/Jupiter/Saturn all matched to within 0.01° — strong evidence the core math is actually correct, not just internally consistent. Rahu/Ketu use the mean lunar node (the traditional standard). The Lahiri ayanamsa is a **linear approximation** anchored to the same ICRC-standardized J2000.0 value Swiss Ephemeris uses (23.853222°) — professional implementations apply non-linear precession corrections that this doesn't; for birth dates within roughly a century of 2000 the difference stays within a few arcminutes (rarely enough to flip a nakshatra boundary), but this is stated explicitly in the report output, not just in a code comment.
- **`dasha.ts`** computes the full Vimshottari Mahadasha/Antardasha sequence from the Moon's nakshatra at birth, including correctly handling the partially-elapsed first dasha period (verified: the 9 mahadasha periods sum to exactly 120 years minus the elapsed fraction, and antardasha periods sum to exactly their parent mahadasha's duration).
- **`geocoding.ts`** calls Nominatim (OpenStreetMap's free geocoder, no API key) to resolve birth place → lat/long. **This could not be tested in the sandbox this was built in** — that environment's network access is restricted to package registries, not general internet — so verify it works in your actual deployment before relying on it. Set a real `User-Agent` (required by Nominatim's usage policy) before any production use, and consider a paid geocoder if you expect real traffic volume, since Nominatim's free tier has rate limits.
- **`interpret.ts`** turns raw positions into report text. Every output is explicitly tendency-framed ("यह कोई निश्चित भविष्यवाणी या नियति नहीं है" — this is not a fixed prediction or destiny), consistent with the architecture decision earlier in this build: kundli data is shown as its own clearly-labeled context section in the report, never numerically merged into the psychometric/timeline/narrative trait scores. There's no validated ground truth to merge against, so a blended score would imply false precision.
- A real bug was caught and fixed during development: local-clock-to-UTC conversion initially used manual day +=/-= 1 arithmetic for time-zone rollover, which doesn't correctly handle month/year boundaries (e.g. a birth at 00:15 IST on January 1st is actually 18:45 UTC on December 31st of the *previous year* — manual day arithmetic alone doesn't roll the year back). Fixed using real `Date.UTC()` arithmetic and verified against the exact boundary case.
- **Not built**: houses (beyond the ascendant itself), planetary aspects (drishti), and yogas — flagged honestly rather than padded with invented rules. The ascendant/rashi/nakshatra/dasha core was prioritized as the highest-value, most foundational piece; the rest is a natural extension of the same verified ephemeris layer if you want it.

## Admin panel

Single-tier auth backed by an `admin_users` table (bcrypt-hashed passwords, JWT session in an httpOnly cookie). `middleware.ts` does a fast cookie-presence redirect; the actual `(protected)/layout.tsx` does the real signature verification server-side, so a forged/expired cookie still gets bounced. From the dashboard you can manage japs, articles, testimonials (with an approve/unapprove toggle), and incoming requests (custom jap requests, service inquiries, contact messages), plus edit site-wide settings.

## Notable implementation choices & honest caveats

- **Why SQLite instead of MongoDB:** this project originally used MongoDB, but a real database server adds a layer of setup (connection strings, network access, DNS for `+srv` URIs, IP allowlists) that's pure friction for a project this size. `node:sqlite` is built into Node itself — nothing to install, nothing to configure, no service that can be unreachable.
- **Where SQLite-as-a-file does *not* work well: serverless hosting.** Platforms like Vercel and Netlify Functions don't give you a persistent, shared filesystem — each invocation can get a fresh, isolated disk, so writes can silently disappear. Deploy this to something with a real persistent disk instead: a VPS, Render, Railway, Fly.io with a volume, or a Docker container with a mounted volume. If you specifically need serverless (Vercel etc.), swap `DATABASE_PATH` for a hosted SQLite service like Turso — the `lib/repo/*` files are the only place that would need to change.
- **Search** uses plain SQL `LIKE` (substring) matching across the relevant text columns rather than a dedicated full-text index. That's intentionally simple and fine at this content volume; if the library grows into the thousands of japs/articles, SQLite's `FTS5` virtual tables are a natural upgrade and don't require leaving SQLite. To make English-language queries actually find Hindi/Devanagari content, search also checks a `keywords` column (the full bilingual keyword list vidIQ exports per video — most of your videos' keyword lists already contain English terms) and a small hand-maintained English→Devanagari term-expansion dictionary in `src/lib/repo/japs.ts` for vocabulary not covered by a given video's own keywords. Category classification in `scripts/import-vidiq.ts` checks narrow/specific signals (Navgrah, Healing, Protection, Bhajan, Katha, Philosophy, explicit मंत्र/जाप markers) before falling back to Tirthankar-name matching — a video that invokes a Tirthankar's name but is fundamentally a chant (the majority of them) correctly lands in Mantra rather than Tirthankar, which is reserved for genuine biography/aarti content.
- **Next.js 16, not 15.** The brief asked for Next.js 15; 16 was the current stable release at build time and the App Router APIs used here are the same shape, so it's a drop-in upgrade. Pin to 15 in `package.json` if you specifically need it.
- **Tailwind v4.** Config lives in `globals.css` via `@theme` (no `tailwind.config.ts` — that's how v4 works), so the brand colors are CSS variables: `gold`, `gold-soft`, `gold-deep`, `warm-white`, `saffron`, `charcoal`.
- **lucide-react dropped brand icons** (YouTube/Instagram/Facebook/etc.) in the version current at build time. `src/components/shared/SocialIcons.tsx` has small original line-art replacements instead of those trademarked logos.
- **Dark mode** toggles a CSS-variable theme (`--surface`/`--on-surface`) plus a `.dark` class with `localStorage` persistence and a flash-of-wrong-theme guard script. The core layout, cards, and forms respond to it; some less-visited admin screens weren't individually re-themed.
- **Thumbnails:** cards render a real `<img>` when the `thumbnail` field is a full `https://...` URL (e.g. your own CDN/S3/Cloudinary link entered via the admin panel) and fall back to a styled gradient placeholder otherwise — so the grid never shows a broken-image icon while you're populating real content.
- **AI Jap Recommendation widget** (`/jap-library`) is genuinely rule-based today: it matches keywords in the visitor's free-text problem description against category/planet, then falls back to a SQL search, then to featured japs. It's structured so you can swap the matching logic for an LLM call later without touching the UI.
- **Seed data's YouTube links are placeholders** (`PLACEHOLDER_NAVKAR`, etc.) — replace them with your real video URLs from the admin panel.
- This was built and verified (`npm run build`, `npm run lint`, plus direct `node:sqlite` smoke tests of the query patterns used) in a network-restricted sandbox without outbound access to Google Fonts, so the structural/type-checking pass is solid, but I wasn't able to do a full click-through QA pass in a browser. Run `npm run dev` after seeding to do that yourself before going live.

## Deployment

Pick any host with a persistent disk and Node 22.5+:

1. Push this folder to a GitHub repo.
2. **Render / Railway / Fly.io:** create a new web service from the repo, set the environment variables from `.env.example`, make sure `DATABASE_PATH` points at a mounted persistent volume (e.g. `/data/karmaknocksback.db` on a Render disk), and set the build/start commands to `npm run build` / `npm run start`.
3. **VPS / Docker:** `npm install && npm run build && npm run start`, with the `data/` folder on a real disk (not an ephemeral container layer that gets wiped on redeploy).
4. Run `npm run seed` once against the production `DATABASE_PATH` to create the first admin user and sample content, or just use the admin panel to add real content from scratch.

If you want Vercel specifically, you'll need a hosted SQLite provider like Turso instead of a local file — ask and I can adjust `lib/db.ts` / `lib/repo/*` for that.

## Deployment — Vercel + Turso

The database has been migrated from `node:sqlite` (local file only) to `@libsql/client` (Turso), which works on Vercel's serverless platform. For local development, it still uses a local SQLite file automatically — no Turso account needed until you deploy.

### Step 1 — Create a Turso database (free, ~5 minutes)

```bash
# Install Turso CLI
npm install -g @turso/cli

# Login (creates account if needed)
turso auth login

# Create the database
turso db create karmaknocksback

# Get the URL
turso db show karmaknocksback
# → URL: libsql://karmaknocksback-yourusername.turso.io

# Create an auth token
turso db tokens create karmaknocksback
# → Copy the token
```

### Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial KarmaKnocksBack build"
gh repo create karmaknocksback --private --push
# or: git remote add origin https://github.com/yourusername/karmaknocksback.git && git push -u origin main
```

### Step 3 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → "Add New Project"
2. Import your GitHub repo
3. Vercel auto-detects Next.js — no build config needed
4. Under **Environment Variables**, add these (from your `.env.local`):

```
TURSO_DATABASE_URL=libsql://karmaknocksback-yourusername.turso.io
TURSO_AUTH_TOKEN=your-token-from-step-1
JWT_SECRET=your-long-random-string
ADMIN_EMAIL=admin@karmaknocksback.com
ADMIN_PASSWORD=your-secure-password
GMAIL_USER=karmaknocksback@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
RAZORPAY_KEY_ID=rzp_test_T54v4np2UrJFda
RAZORPAY_KEY_SECRET=1wE6FE0KNje0Vd2veQQgP2Oc
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
NEXT_PUBLIC_CONTACT_EMAIL=karmaknocksback@gmail.com
```

5. Click **Deploy**

### Step 4 — Seed the production database

After deployment, you need to seed data into Turso once. Run these on your local machine with the production Turso credentials in `.env.local`:

```bash
# Set production credentials in .env.local temporarily
TURSO_DATABASE_URL=libsql://... npm run seed
TURSO_DATABASE_URL=libsql://... npm run import:vidiq
TURSO_DATABASE_URL=libsql://... npm run seed:karma-mirror
TURSO_DATABASE_URL=libsql://... npm run enrich:japs
TURSO_DATABASE_URL=libsql://... npm run seed:jap-collections
TURSO_DATABASE_URL=libsql://... npm run seed:jap-collections-community
TURSO_DATABASE_URL=libsql://... npm run seed:jap-collections-misc
```

Or set them once in `.env.local` and run the normal seed sequence — it connects to Turso when `TURSO_DATABASE_URL` is set, to local file otherwise.

### Step 5 — Set custom domain (optional)

In Vercel project settings → Domains → add `karmaknocksback.com` → follow DNS instructions.

### Step 6 — Razorpay webhook for production

In Razorpay Dashboard → Webhooks → Add Webhook:
- URL: `https://yourdomain.com/api/webhooks/razorpay`
- Event: `payment.captured`
- Copy the Webhook Secret → add to Vercel env vars as `RAZORPAY_WEBHOOK_SECRET`
