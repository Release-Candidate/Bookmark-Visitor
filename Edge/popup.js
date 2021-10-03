// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2021 Roland Csaszar
//
// Project:  notoy-browser_extensions
// File:     popup.js
// Date:     11.Aug.2021
//
//=============================================================================
// `chrome` is unknown to eslint
/* eslint-disable no-undef */

// File suffixes of the document formats.
const fileSuffix = {
    MARKDOWN: ".md",
    ORG_MODE: ".org",
    TEXT: ".txt",
}

// MIME type of the various document formats.
const mimeTypes = {
    MARKDOWN: "text/markdown",
    ORG_MODE: "text/org",
    TEXT: "text/plain",
}

// File type, MIME type and suffix needed to generate the document.
const fileInfo = {
    MARKDOWN: {
        type: formats.MARKDOWN,
        suffix: fileSuffix.MARKDOWN,
        mime: mimeTypes.MARKDOWN,
    },
    ORG_MODE: {
        type: formats.ORG_MODE,
        suffix: fileSuffix.ORG_MODE,
        mime: mimeTypes.ORG_MODE,
    },
    TEXT: {
        type: formats.TEXT,
        suffix: fileSuffix.TEXT,
        mime: mimeTypes.TEXT,
    },
}

// The format of the document to generate.
let documentFormat = fileInfo.MARKDOWN

// Unicode regex for 'not a letter'
const unicodeNotWordRegex = /(\P{L})+/giu

document.querySelectorAll("[data-locale]").forEach((elem) => {
    elem.innerText = chrome.i18n.getMessage(elem.dataset.locale)
})

// Title input field in the extension's popup.
let titleText = document.getElementById("titleText")
titleText.addEventListener("input", async () => {
    chrome.storage.local.set({ tabTitle: titleText.value })
})

// URL input field in the extension's popup.
let pageURL = document.getElementById("pageURL")
pageURL.addEventListener("input", async () => {
    chrome.storage.local.set({ tabUrl: pageURL.value })
})

// Keywords input field in the extension's popup.
let keyWords = document.getElementById("keyWords")
keyWords.addEventListener("input", async () => {
    chrome.storage.local.set({ tabKeywords: keyWords.value })
})

// Description input field in the extension's popup.
let descriptionText = document.getElementById("descriptionText")
descriptionText.addEventListener("input", async () => {
    chrome.storage.local.set({ tabDescription: descriptionText.value })
})

// Description input field in the extension's popup.
let longText = document.getElementById("longText")
longText.addEventListener("input", async () => {
    chrome.storage.local.set({ tabText: longText.value })
})

// Save button in the extension's popup.
let saveButton = document.getElementById("saveButton")

chrome.storage.local.get("tabUrl", ({ tabUrl }) => {
    pageURL.value = tabUrl
})

chrome.storage.local.get("tabTitle", ({ tabTitle }) => {
    titleText.value = tabTitle
})

chrome.storage.local.get("tabKeywords", ({ tabKeywords }) => {
    keyWords.value = tabKeywords
})

chrome.storage.local.get("tabDescription", ({ tabDescription }) => {
    descriptionText.value = tabDescription
})

chrome.storage.local.get("tabText", ({ tabText }) => {
    longText.value = tabText
})

let addTimestamp = true
chrome.storage.sync.get("optionTimestamp", ({ optionTimestamp }) => {
    addTimestamp = optionTimestamp
})

let addYaml = false
chrome.storage.sync.get("optionYaml", ({ optionYaml }) => {
    addYaml = optionYaml
})

chrome.storage.sync.get("optionFormat", ({ optionFormat }) => {
    switch (optionFormat) {
        case formats.TEXT:
            documentFormat = fileInfo.TEXT
            break

        case formats.ORG_MODE:
            documentFormat = fileInfo.ORG_MODE
            break

        // Fall through
        case formats.MARKDOWN:
        default:
            documentFormat = fileInfo.MARKDOWN
    }
})

// Download the data.
saveButton.addEventListener("click", async () => {
    const tabData = {
        url: pageURL.value,
        title: titleText.value,
        keywords: keyWords.value,
        description: descriptionText.value,
        text: longText.value,
        addTimestamp,
        addYaml,
        format: documentFormat,
    }

    const data = getData(tabData)
    const dataUrl = URL.createObjectURL(data)
    chrome.downloads.download({
        url: dataUrl,
        filename:
            titleText.value.replace(unicodeNotWordRegex, "_") +
            tabData.format.suffix,
        saveAs: true,
    })
})

/**
 * Return the given data as  formatted 'Blob', depending on the format of the
 * given data - `tabData.format`.
 *
 * @param {*} tabData  The data to put into the document.
 * @returns The given data as a formatted `Blob`, suitable to download.
 */
function getData(tabData) {
    let documentString = ""

    switch (tabData.format) {
        case fileInfo.MARKDOWN:
            documentString = getMarkdown(tabData)
            break

        case fileInfo.ORG_MODE:
            documentString = getOrgMode(tabData)
            break

        // Fall through
        case fileInfo.TEXT:
        default:
            documentString = getPlainText(tabData)
    }

    return new Blob([documentString], { type: tabData.format.mime })
}
