// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2021 Roland Csaszar
//
// Project:  notoy-browser_extensions
// File:     options.js
// Date:     16.Sep.2021
//
//=============================================================================
// eslint doesn't know `chrome`
/* eslint-disable no-undef */

const url = "https://github.com/Release-Candidate/Notoy-BrowserExtensions"
const title = "Release-Candidate/Notoy-BrowserExtensions"
const keywords = `${transName}, ${transBrowserExtension}`
const description = transPreviewDescription
const text = transPreviewText

let previewFormat = formats.MARKDOWN
let previewUseYaml = false
let previewUseTimestamp = true

document.querySelectorAll("[data-locale]").forEach((elem) => {
    elem.innerText = chrome.i18n.getMessage(elem.dataset.locale)
})

chrome.storage.sync.get("optionFormat", ({ optionFormat }) => {
    previewFormat = optionFormat
    let markdownCheck = document.getElementById("markdown")
    let orgModeCheck = document.getElementById("orgMode")
    let textCheck = document.getElementById("text")
    switch (optionFormat) {
        case formats.ORG_MODE:
            markdownCheck.checked = false
            orgModeCheck.checked = true
            textCheck.checked = false
            break

        case formats.TEXT:
            markdownCheck.checked = false
            orgModeCheck.checked = false
            textCheck.checked = true
            break

        // Fall through
        case formats.MARKDOWN:
        default:
            markdownCheck.checked = true
            orgModeCheck.checked = false
            textCheck.checked = false
    }
})

let formatParent = document.getElementById("formatParent")
formatParent.addEventListener("change", async (event) => {
    const optionFormat = event.target.value
    chrome.storage.sync.set({ optionFormat })
    previewFormat = optionFormat
    setPreview({
        addYaml: previewUseYaml,
        addTimestamp: previewUseTimestamp,
        format: previewFormat,
    })
})

let useTimestamp = document.getElementById("timestampInput")
chrome.storage.sync.get("optionTimestamp", ({ optionTimestamp }) => {
    useTimestamp.checked = optionTimestamp
    previewUseTimestamp = optionTimestamp
})
useTimestamp.addEventListener("click", async (event) => {
    const optionTimestamp = event.target.checked
    chrome.storage.sync.set({ optionTimestamp })
    previewUseTimestamp = optionTimestamp
    setPreview({
        addYaml: previewUseYaml,
        addTimestamp: previewUseTimestamp,
        format: previewFormat,
    })
})

let useYamlFrontMatter = document.getElementById("yamlFrontMatter")
chrome.storage.sync.get("optionYaml", ({ optionYaml }) => {
    useYamlFrontMatter.checked = optionYaml
    previewUseYaml = optionYaml
    setPreview({
        addYaml: previewUseYaml,
        addTimestamp: previewUseTimestamp,
        format: previewFormat,
    })
})
useYamlFrontMatter.addEventListener("click", async (event) => {
    const optionYaml = event.target.checked
    chrome.storage.sync.set({ optionYaml })
    previewUseYaml = optionYaml
    setPreview({
        addYaml: previewUseYaml,
        addTimestamp: previewUseTimestamp,
        format: previewFormat,
    })
})

/**
 * Function to fill the preview part of the option page with an example of a
 * note formatted with the given options.
 *
 * @param {*} addYaml
 * @param {*} addTimestamp
 * @param {*} format
 */
function setPreview({ addYaml, addTimestamp, format }) {
    let previewText = ""

    switch (format) {
        case formats.ORG_MODE:
            previewText = getOrgMode({
                url,
                title,
                keywords,
                description,
                text,
                addTimestamp,
            })
            break

        case formats.TEXT:
            previewText = getPlainText({
                url,
                title,
                keywords,
                description,
                text,
                addTimestamp,
                addYaml,
            })
            break

        // Fall through
        case formats.MARKDOWN:
        default:
            previewText = getMarkdown({
                url,
                title,
                keywords,
                description,
                text,
                addTimestamp,
                addYaml,
            })
    }

    let previewPart = document.getElementById("preview")
    previewPart.innerHTML = previewText
        .split("\n")
        .join("<br/>")
        .replace(/\s\s/gu, "&nbsp;&nbsp;")
}
