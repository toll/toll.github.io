#!/usr/bin/env node
/**
 * generate-table.js
 *
 * Builds an HTML procedure table from a subset of variants and/or field
 * groups, in a chosen language, looked up by key (id) instead of by
 * column position.
 *
 * Usage:
 *   node generate-table.js --lang en --variants 1,3 > out.html
 *   node generate-table.js --lang nb --variants 19,21 --groups previousDocuments > out.html
 *   node generate-table.js --lang en > out.html   (all variants that have an EN description)
 *
 * Default --lang is "nb". Adding a language means adding one file under
 * data/locales/, not touching variants.json or field-definitions.json.
 *
 * DATA MODEL
 * ----------
 * variants.json holds only canonical, language-independent values: codes
 * (e.g. "TRE", "CUDE"), booleans, and enums (e.g. "ONE_OF"). It has no
 * display text.
 *
 * data/locales/<lang>.json holds everything that IS language-specific:
 * column headers, boilerplate templates ("must be = {code}"), enum-to-text
 * maps for header notes, and free-text variant descriptions (these can't
 * be templated, so they're maintained by hand per language).
 *
 * Each field row in field-definitions.json has a `valueType` that tells
 * the renderer how to turn a canonical value into localized text:
 *   - rawCode        -> printed as-is (codes aren't translated)
 *   - rawBoolean     -> printed as "true"/"false" (not translated)
 *   - requiredFlag   -> true/false -> templates.requiredPlaceholder / notApplicable
 *   - codeOrNone     -> a code string or null -> template with {code}, or notApplicable
 *   - codeListOrNone -> an array of codes or null -> template with {codes}, or notApplicable
 *
 * SUB-COLUMNS
 * -----------
 * Unchanged from before: a variant can have `subColumns` > 1. A plain
 * scalar value is shared (colspan=N); an array of length N is one value
 * per sub-column. For list-valued fields (isMultiValue rows, and
 * codeListOrNone rows), a flat array is a SHARED list; a nested array
 * (array of arrays) is a PER-SUB-COLUMN list.
 */

const fs = require("fs");
const path = require("path");

const fieldDefs = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "field-definitions.json"), "utf8")
);
const variantData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "variants.json"), "utf8")
);

function loadLocale(lang) {
  const p = path.join(__dirname, "data", "locales", `${lang}.json`);
  if (!fs.existsSync(p)) {
    const available = fs
      .readdirSync(path.join(__dirname, "data", "locales"))
      .map((f) => f.replace(/\.json$/, ""));
    throw new Error(`Unknown language "${lang}". Available: ${available.join(", ")}`);
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function parseArgs(argv) {
  const args = { variants: null, groups: null, lang: "nb" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--variants") args.variants = argv[++i].split(",");
    else if (argv[i] === "--groups") args.groups = argv[++i].split(",");
    else if (argv[i] === "--lang") args.lang = argv[++i];
  }
  return args;
}

function selectVariants(ids, locale) {
  const allIds = Object.keys(variantData);
  const chosen = ids && ids.length ? ids : allIds;
  const missing = chosen.filter((id) => !variantData[id]);
  if (missing.length) {
    throw new Error(`Unknown variant id(s): ${missing.join(", ")}`);
  }
  const missingDescriptions = chosen.filter((id) => !locale.variantDescriptions[id]);
  if (missingDescriptions.length) {
    throw new Error(
      `No "${locale.code}" description for variant(s): ${missingDescriptions.join(", ")}. ` +
        `Add them to data/locales/${locale.code}.json under "variantDescriptions" before rendering.`
    );
  }
  return chosen;
}

function selectGroups(keys) {
  const allKeys = fieldDefs.groups.map((g) => g.key);
  const chosen = keys && keys.length ? keys : allKeys;
  const missing = chosen.filter((k) => !allKeys.includes(k));
  if (missing.length) {
    throw new Error(`Unknown group key(s): ${missing.join(", ")}. Valid keys: ${allKeys.join(", ")}`);
  }
  return fieldDefs.groups.filter((g) => chosen.includes(g.key));
}

function kodeverkLinks(links, locale) {
  if (!links || !links.length) return "";
  return links
    .map((l) => {
      const text = (l.localeText && l.localeText[locale.code]) || l.defaultText;
      const href = `mo-kodeverk${locale.hrefSuffix}.html#${l.anchor}`;
      return `<a href="${href}">${text}</a>`;
    })
    .join(", ");
}

function subColumnsOf(id) {
  return variantData[id].subColumns || 1;
}

function tdOpen(colspan, style) {
  const cs = colspan > 1 ? ` colspan='${colspan}'` : "";
  const st = style ? ` style='${style}'` : "";
  return `<td${cs}${st}>`;
}

/** Render a single canonical value to display text, given its valueType. */
function renderScalar(value, valueType, template, locale) {
  switch (valueType) {
    case "rawCode":
      return String(value);
    case "rawBoolean":
      return String(value);
    case "requiredFlag":
      return value ? locale.templates.requiredPlaceholder : locale.templates.notApplicable;
    case "codeOrNone":
      return value == null ? locale.templates.notApplicable : locale.templates[template].replace("{code}", value);
    case "codeListOrNone":
      return value == null
        ? locale.templates.notApplicable
        : locale.templates[template].replace("{codes}", value.join(", "));
    default:
      return String(value);
  }
}

/**
 * Resolve a field value into one or more { html, colspan } cells,
 * given the variant's sub-column count, its valueType, and whether this
 * is the multi-value (list-of-codes) field.
 */
function resolveCells(value, subColumns, row, locale, isMultiValue) {
  if (isMultiValue) {
    if (subColumns > 1 && Array.isArray(value) && Array.isArray(value[0])) {
      return value.map((codes) => ({
        html: codes.map((c) => `<p>${c}</p>`).join("\n                        "),
        colspan: 1,
      }));
    }
    const codes = value || [];
    return [
      {
        html: codes.map((c) => `<p>${c}</p>`).join("\n                        "),
        colspan: subColumns,
      },
    ];
  }

  const isListType = row.valueType === "codeListOrNone";
  if (subColumns > 1 && Array.isArray(value) && (isListType ? Array.isArray(value[0]) : true) && !isListType) {
    // Non-list field, plain array of length subColumns => per-sub-column scalars.
    if (value.length !== subColumns) {
      throw new Error(
        `Value array length (${value.length}) doesn't match subColumns (${subColumns}) for row "${row.key}": ${JSON.stringify(value)}`
      );
    }
    return value.map((v) => ({ html: `<p>${renderScalar(v, row.valueType, row.template, locale)}</p>`, colspan: 1 }));
  }
  if (isListType && subColumns > 1 && Array.isArray(value) && Array.isArray(value[0])) {
    // List-type field, per-sub-column divergent lists.
    return value.map((v) => ({ html: `<p>${renderScalar(v, row.valueType, row.template, locale)}</p>`, colspan: 1 }));
  }

  // Shared scalar (or shared list, for list-type fields).
  return [{ html: `<p>${renderScalar(value, row.valueType, row.template, locale)}</p>`, colspan: subColumns }];
}

function renderDescriptionRow(variantIds, locale) {
  const cells = variantIds
    .map((id) => {
      const sc = subColumnsOf(id);
      const paras = locale.variantDescriptions[id].map((p) => `<p>${p}</p>`).join("\n");
      return `                    ${tdOpen(sc)}\n${paras}\n                    </td>`;
    })
    .join("\n");
  return `                <tr>\n                    <td colspan='2'>\n                        <p><strong>${locale.ui.descriptionHeader}</strong></p>\n                    </td>\n${cells}\n                </tr>`;
}

function renderHeaderRow(variantIds, locale) {
  const cells = variantIds
    .map((id) => {
      const sc = subColumnsOf(id);
      const cs = sc > 1 ? ` colspan='${sc}'` : "";
      return `                    <th${cs}>Variant ${id}</th>`;
    })
    .join("\n");
  return `                <tr>\n                    <th>${locale.ui.fieldColumnHeader}</th>\n                    <th>${locale.ui.codeListColumnHeader}</th>\n${cells}\n                </tr>`;
}

function renderGroupHeaderRow(group, variantIds, locale) {
  const bg = `var(--background-color-${group.color})`;

  if (group.key === "validationMessages") {
    const kodeverkCell = kodeverkLinks(group.rows[0].kodeverk, locale);
    const cells = variantIds
      .map((id) => {
        const sc = subColumnsOf(id);
        const value = variantData[id].values.incompleteDocumentationReason;
        const resolved = resolveCells(value, sc, group.rows[0], locale, true);
        return resolved
          .map(
            (c) =>
              `                    ${tdOpen(c.colspan, "background:#D5DCE4;")}\n                        ${c.html}\n                    </td>`
          )
          .join("\n");
      })
      .join("\n");
    return `                <tr>\n                    <td style='background:#D5DCE4;'>\n                        <p><strong>${locale.ui[group.labelFrom]}</strong></p>\n                    </td>\n                    <td style='background:#D5DCE4;'>\n                        <p>${kodeverkCell}</p>\n                    </td>\n${cells}\n                </tr>`;
  }

  if (!group.headerNoteType) return "";

  const cells = variantIds
    .map((id) => {
      const sc = subColumnsOf(id);
      let note;
      if (group.headerNoteType === "constant") {
        note = locale.ui.importProcedureHeaderNote;
      } else {
        const templateName = group.headerNoteType.split(":")[1];
        const rawEnum = variantData[id].headerNotes[group.key];
        note = Array.isArray(rawEnum)
          ? rawEnum.map((e) => locale.templates[templateName][e])
          : locale.templates[templateName][rawEnum];
      }
      const resolved = Array.isArray(note)
        ? note.map((n) => ({ html: n, colspan: 1 }))
        : [{ html: note, colspan: sc }];
      return resolved
        .map(
          (c) =>
            `                    ${tdOpen(c.colspan, `background:${bg};`)}\n                        <p><strong>${c.html}</strong></p>\n                    </td>`
        )
        .join("\n");
    })
    .join("\n");

  return `                <tr>\n                    <td style='background:${bg};'>\n                        <p><strong>${group.label}</strong></p>\n                    </td>\n                    <td style='background:${bg};'></td>\n${cells}\n                </tr>`;
}

function renderFieldRow(group, row, variantIds, locale) {
  const bg = `var(--background-color-${group.color})`;
  const kodeverkCell = kodeverkLinks(row.kodeverk, locale);

  const cells = variantIds
    .map((id) => {
      const sc = subColumnsOf(id);
      const value = variantData[id].values[row.key];
      const resolved = resolveCells(value, sc, row, locale, false);
      return resolved
        .map((c) => `                    ${tdOpen(c.colspan)}\n                        ${c.html}\n                    </td>`)
        .join("\n");
    })
    .join("\n");

  return `                <tr>\n                    <td style='background:${bg};'>\n                        <p>${row.label}</p>\n                    </td>\n                    <td style='background:${bg};'>\n                        <p>${kodeverkCell}</p>\n                    </td>\n${cells}\n                </tr>`;
}

function renderTable(variantIds, groups, locale) {
  const rows = [renderDescriptionRow(variantIds, locale), renderHeaderRow(variantIds, locale)];

  for (const group of groups) {
    if (group.key === "validationMessages") {
      rows.push(renderGroupHeaderRow(group, variantIds, locale));
      continue;
    }
    const headerRow = renderGroupHeaderRow(group, variantIds, locale);
    if (headerRow) rows.push(headerRow);
    for (const row of group.rows) {
      rows.push(renderFieldRow(group, row, variantIds, locale));
    }
  }

  return `<div class="table-responsive">\n            <table class="procedure-table">\n${rows.join("\n")}\n            </table>\n        </div>\n`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const locale = loadLocale(args.lang);
  const variantIds = selectVariants(args.variants, locale);
  const groups = selectGroups(args.groups);
  process.stdout.write(renderTable(variantIds, groups, locale));
}

main();
