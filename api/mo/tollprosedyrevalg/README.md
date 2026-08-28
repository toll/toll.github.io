# Procedure table generator

Data is split into three layers so a table is generated on demand instead
of copy-pasted:

- `data/field-definitions.json` — the row/group skeleton: keys, labels
  (field names like `importProcedure` aren't translated, so these stay
  fixed), kodeverk anchors, and each row's `valueType` (tells the renderer
  how to turn a canonical value into text).
- `data/variants.json` — **canonical, language-independent** values per
  variant: codes (`"TRE"`, `"CUDE"`), booleans, and enums (`"ONE_OF"`).
  No display text at all.
- `data/locales/<lang>.json` — everything that IS language-specific:
  column headers, boilerplate templates (`"must be = {code}"`), enum-to-
  text maps, kodeverk link-text overrides, and free-text variant
  descriptions.
- `generate-table.js` — combines all three into an HTML table for
  whichever variants, field groups, and language you ask for.

## Usage

```bash
# Everything, Norwegian (default)
node generate-table.js > full.html

# English, a couple of variants
node generate-table.js --lang en --variants 1,3 > out.html

# Norwegian, one field group across all variants
node generate-table.js --lang nb --groups previousDocuments > out.html

# Combine all three filters
node generate-table.js --lang en --variants 1,4 --groups exportFromEU > out.html
```

Valid group keys: `importProcedure`, `previousDocuments`, `exportFromEU`,
`validationMessages`. Currently available languages: `nb`, `en`.

## Why variants aren't split by language

A variant (e.g. "Variant 3") is a business rule — which procedures and
documents are required. That rule doesn't change with language, so it
isn't duplicated per language. Only the *display text* is
language-specific, and that lives entirely in `data/locales/`. This means:

- Adding a language = adding one new file under `data/locales/`. You never
  touch `variants.json` or `generate-table.js`.
- Fixing a business rule (e.g. Variant 3 now also requires `exportId`)
  is one edit in `variants.json`, and it's automatically correct in every
  language.

**Trade-off:** most values are templated (`typeOfReferenceTemplate:
"must be = {code}"`), but variant *descriptions* are free-text sentences
that can't be templated — those must be hand-translated and added to each
locale file's `variantDescriptions`. If a variant is requested in a
language whose description hasn't been added yet, the script fails with a
clear error rather than guessing or leaving a blank cell. Right now `en`
only has descriptions for variants 1–4 — add 19–22's English text to
`data/locales/en.json` when you have it.

## Sub-columns (half/merged columns)

Some variants (e.g. Variant 3, Variant 4) have two valid ways of
satisfying one field group — shown in the original HTML as `colspan='2'`
on rows where that doesn't matter, splitting into two plain cells where it
does.

This is modelled with `subColumns` on the variant, plus a convention for
each field's value:

- **Plain scalar** (string/boolean/code) → shared across all sub-columns,
  rendered as one `<td colspan=N>`.
- **Flat array** (length `subColumns`) → one distinct value per
  sub-column, rendered as separate `<td>`s.
- For fields whose *own* value is naturally a list (`incompleteDocumentationReason`,
  and `typeOfExport` when its `valueType` is `codeListOrNone`): a flat
  array of codes is a *shared* list in one cell; a nested array (array of
  arrays) is a *per-sub-column* list.

## Group applicability (fields that only exist for some variants)

Some field groups only apply to a subset of variants — e.g. `goodsItem`
(VOEC-specific fields: `value`, `numberOfItems`, `harmonizedSystemSubheadingCode`,
`vatIdentificationNumber`) only applies to variants 7–10. A group is
considered to apply to a variant if that variant's `values` defines at
least one of the group's real fields. Where it doesn't apply, the group's
header and any of its fields render as `-` automatically — you don't need
to add placeholder values to every other variant.

A row can also be `"kind": "subheader"` instead of having a `valueType`:
it's a bold in-group caption (used by `goodsItem` for its nested
sub-sections) rather than a real per-variant value. It shows the same
"must be filled out" label as the group's own header, or `-` if the group
doesn't apply to that variant.

## Description paragraphs with links or classes

A `variantDescriptions` entry is usually an array of plain strings
(rendered as `<p>text</p>`). Where the source has a styled or linked
paragraph (e.g. the "Digitoll med godsnummer" transitional notice in
variants 23–26), use an object instead:

```json
{ "class": "link-color", "html": "Overgangsordning fram til 01.03.2027, se <a href=\"...\">Digitoll med godsnummer - Tolletaten</a>" }
```

## Current variant/language coverage

All 33 variants (1–33) are defined in `variants.json` with canonical
values. `variantDescriptions` in `nb.json` covers all 33; `en.json`
currently only covers 1–4 (the only ones translated so far) — requesting
`--lang en` for any other variant fails with a clear error rather than
guessing a translation.

## Adding a new field/row

1. Add it to the relevant group in `field-definitions.json` — key, label,
   `valueType`, kodeverk anchors.
2. If it needs a template (like `typeOfReferenceTemplate`), add the
   template string to each locale file under `templates`, with a `{code}`
   or `{codes}` placeholder.
3. Add a value for that key under `values` in every variant in
   `variants.json`.

## Adding a new variant

1. Add an entry to `variants.json` with canonical values only (codes,
   booleans, enums — no display text). Set `subColumns` if it needs more
   than one.
2. Add its free-text description to `variantDescriptions` in every locale
   file you want to render it in.

## Adding a new language

1. Copy `data/locales/en.json` to `data/locales/<code>.json`.
2. Translate every string under `ui` and `templates`, set `hrefSuffix` to
   match that language's kodeverk page, and add `kodeverkTextOverrides`
   for any code-list link whose *name* is translated (not its anchor —
   anchors stay the same across languages).
3. Translate `variantDescriptions` for whichever variants you want
   available in that language.
4. Run with `--lang <code>`. No changes to `generate-table.js` needed.
