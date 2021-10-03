// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2021 Roland Csaszar
//
// Project:  notoy-browser_extensions
// File:     formatContent.js
// Date:     27.Sep.2021
//
//=============================================================================
// Shared functions and data used by the files `options.js` and ˙popup.js`.
// `chrome` is unknown to eslint
/* eslint-disable no-undef */
// Most names are not locally used.
/* eslint-disable no-unused-vars */

//=============================================================================
// Translation constants

const transName = chrome.i18n.getMessage("extensionName")

const transBrowserExtension = chrome.i18n.getMessage("browserExtension")

const transPreviewDescription = chrome.i18n.getMessage("previewDescription")

const transPreviewText = chrome.i18n.getMessage("previewText")

const transKeywords = chrome.i18n.getMessage("keywords")

//=============================================================================

// Valid document formats to save.
const formats = {
    MARKDOWN: "markdown",
    ORG_MODE: "orgMode",
    TEXT: "text",
}

/**
 * Return the given `tabData` as a Markdown formatted string
 *
 * @param {*} tabData The data to put into the Markdown document.
 * @returns The given data as a Markdown formatted string.
 */
function getMarkdown({
    url,
    title,
    keywords,
    description,
    text,
    addTimestamp,
    addYaml,
} = {}) {
    return `${getYamlFrontMatter({ title, keywords, addYaml })}# ${title}

${getTimestamp(addTimestamp)}${transKeywords} ${tagifyKeywords(keywords)}

${description}
[${title}](${url})

${text}
`
}

/**
 * Return the given `tabData` as a Org-Mode formatted string.
 *
 * @param {*} tabData The data to put into the Org-Mode document.
 * @returns The given data as a Org-Mode formatted string.
 */
function getOrgMode({
    url,
    title,
    keywords,
    description,
    text,
    addTimestamp,
} = {}) {
    return `#+title:  ${title}
#+date:   ${getDateString()}
#+FILETAGS: ${orgifyKeywords(keywords)}

* ${title}

${getTimestamp(addTimestamp)}${transKeywords} ${keywords}

${description}
[[${url}][${title}]]

${text}
`
}

/**
 * Return the given `tabData` as a 'plain text' formatted string.
 *
 * @param {*} tabData The data to put into the 'plain text' document.
 * @returns The given data as a 'plain text' formatted string.
 */
function getPlainText({
    url,
    title,
    keywords,
    description,
    text,
    addTimestamp,
    addYaml,
} = {}) {
    return `${getYamlFrontMatter({ title, keywords, addYaml })}${title}

${getTimestamp(addTimestamp)}${transKeywords} ${keywords}

${description}
${url}

${text}
`
}

/**
 * Add a hashtag ("#") to every keyword in the comma separated list of keywords,
 * replace spaces in keywords by an underline ("_").
 * @param {*} keywords The comma separated list of keywords to 'tagify'.
 * @returns The 'tagized' keywords, separated by commas.
 */
function tagifyKeywords(keywords) {
    return keywords
        .replace(/(\s*,\s*)/gu, ", #")
        .replace(/^\s*/gu, "#")
        .replace(/([^\s,]+)\s+/gu, "$1_")
}

/**
 * Add a colon (":") before every keyword in the comma separated list of
 * keywords and replace spaces in keywords by an underline ("_").
 * @param {*} keywords The comma separated list of keywords to 'orgify'.
 * @returns The keywords, separated by colons, and with a colon at the start
 * and end.
 */
function orgifyKeywords(keywords) {
    return keywords
        .replace(/(\s*,\s*)/gu, ":")
        .replace(/^\s*/gu, ":")
        .replace(/\s*$/gu, ":")
        .replace(/([^\s,]+)\s+/gu, "$1_")
}

/**
 * Return the given comma separated keywords as a YAML list of keywords.
 * @param {*} keywords The string containing the comma separated keywords.
 * @returns `keywords` as a YAML list of keywords.
 */
function getKeywordsYAML(keywords) {
    return keywords.replace(/^|(\s*,\s*)/gu, "\n  - ")
}

/**
 * Return the YAML front matter containing the given title and comma separated
 * keywords if `addYaml` is `true` and the empty string else.
 * @param {*} title The title to set.
 * @param {*} keywords The keywords to use as a comma separated list.
 * @param {*} addYaml If this is `true`, the filled YAML front matter is
 *            returned. If this is `false`, the empty string ("") is returned.
 * @returns The YAML front matter containing the given title and comma separated
 * keywords if `addYaml` is `true` and the empty string else.
 */
function getYamlFrontMatter({ title, keywords, addYaml }) {
    const yamlString = `---
title: "${title}"
author:
  -
keywords: ${getKeywordsYAML(keywords)}
lang: ${chrome.i18n.getUILanguage()}
---`
    return addYaml ? yamlString + "\n\n" : ""
}

/**
 * Returns the current date as string or an empty string.
 *
 * @param {*} addTimestamp If this is `true`, a date string is returned, else
 * the empty string.
 * @returns The current date as string, if `addTimestamp` is `true`, the empty
 * string ("") else.
 */
function getTimestamp(addTimestamp) {
    return addTimestamp ? getDateString() + "\n\n" : ""
}

/**
 * Return the current date in ISO format, "YYYY-MM-DD".
 *
 * @returns The current date in ISO format, "YYYY-MM-DD".
 */
function getDateString() {
    function pad0s(n) {
        // eslint-disable-next-line no-magic-numbers
        return n < 10 ? "0" + n : n
    }
    const today = new Date()

    return (
        today.getFullYear() +
        "-" +
        // eslint-disable-next-line no-magic-numbers
        pad0s(today.getMonth() + 1) +
        "-" +
        pad0s(today.getDate())
    )
}
