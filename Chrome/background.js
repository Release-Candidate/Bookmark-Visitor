// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2021 Roland Csaszar
//
// Project:  notoy-browser_extensions
// File:     background.js
// Date:     10.Aug.2021
//
//=============================================================================
// `chrome` is unknown to eslint
/* eslint-disable no-undef */

let tabTitle = "Title"
let tabUrl = "about:blank"
let tabText = ""

/**
 * Initialization of the extension.
 */
chrome.runtime.onInstalled.addListener(() => {
    let tabDescription = ""
    let tabKeywords = ""

    chrome.storage.local.set({ tabUrl })
    chrome.storage.local.set({ tabTitle })
    chrome.storage.local.set({ tabDescription })
    chrome.storage.local.set({ tabKeywords })
    chrome.storage.local.set({ tabText })

    chrome.tabs.query({ active: true, currentWindow: true }, ([currTab]) => {
        getTabInformation(currTab)
    })
})

/**
 * Function that does the main work, gets the current tab's URL and title text
 * and injects the function `getContentInfo` in the current tab to get the
 * tab's content info.
 * Called if the active tab has changed.
 */
chrome.tabs.onActivated.addListener(() => {
    chrome.tabs.query(
        { active: true, lastFocusedWindow: true },
        ([currTab]) => {
            getTabInformation(currTab)
        }
    )
})

/**
 * Function that does the main work, gets the current tab's URL and title text
 * and injects the function `getContentInfo` in the current tab to get the
 * tab's content info.
 * Called if the active tab's URL has changed.
 */
chrome.tabs.onUpdated.addListener(() => {
    chrome.tabs.query(
        { active: true, lastFocusedWindow: true },
        ([currTab]) => {
            getTabInformation(currTab)
        }
    )
})

/**
 * Sets the storage from data of the given current tab.
 * @param {*} currTab The current tab to get the information about.
 */
function getTabInformation(currTab) {
    let tabDescription = ""
    let tabKeywords = ""
    tabTitle = currTab.title
    tabUrl = currTab.url

    chrome.storage.local.set({ tabUrl })
    chrome.storage.local.set({ tabTitle })
    chrome.storage.local.set({ tabText })

    chrome.scripting.executeScript(
        {
            target: { tabId: currTab.id },
            function: getContentInfo,
        },
        () => {
            if (chrome.runtime.lastError) {
                chrome.storage.local.set({ tabDescription })
                chrome.storage.local.set({ tabKeywords })
            }
        }
    )
}

/**
 * Function that is injected into the current tab to get information about the
 * content, like the description in `<meta name="description" ...>`.
 */
function getContentInfo() {
    let tabDescription = ""
    let tabKeywords = ""

    const desc = document.querySelector('meta[name="description"]')
    if (desc !== null) {
        tabDescription = desc.getAttribute("content")
    }

    const tags = document.querySelector('meta[name="keywords"]')
    if (tags !== null) {
        tabKeywords = tags.getAttribute("content")
    }

    chrome.storage.local.set({ tabDescription })
    chrome.storage.local.set({ tabKeywords })
}
