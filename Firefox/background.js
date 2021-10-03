// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2021 Roland Csaszar
//
// Project:  notoy-browser_extensions
// File:     background.js
// Date:     10.Aug.2021
//
//=============================================================================
// `browser` is unknown to eslint
/* eslint-disable no-undef */

let tabTitle = "Title"
let tabUrl = "about:blank"
let tabText = ""

/**
 * Initialization of the extension.
 */
browser.runtime.onInstalled.addListener(() => {
    let tabDescription = ""
    let tabKeywords = ""

    browser.storage.local.set({ tabUrl })
    browser.storage.local.set({ tabTitle })
    browser.storage.local.set({ tabDescription })
    browser.storage.local.set({ tabKeywords })
    browser.storage.local.set({ tabText })

    browser.tabs.query({ active: true, currentWindow: true }, ([currTab]) => {
        getTabInformation(currTab)
    })
})

/**
 * Function that does the main work, gets the current tab's URL and title text
 * and injects the function `getContentInfo` in the current tab to get the
 * tab's content info.
 * Called when the current tab has changed.
 */
browser.tabs.onActivated.addListener(() => {
    browser.tabs.query(
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
 * Called when the current tab has been updated, like the URL has changed.
 */
browser.tabs.onUpdated.addListener(() => {
    browser.tabs.query(
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
    tabTitle = currTab.title
    tabUrl = currTab.url

    browser.storage.local.set({ tabUrl })
    browser.storage.local.set({ tabTitle })
    browser.storage.local.set({ tabText })

    browser.tabs
        .executeScript(currTab.id, {
            file: "./inject.js",
        })
        .then(
            (value) => value,
            // eslint-disable-next-line no-unused-vars
            (err) => {
                let tabDescription = ""
                let tabKeywords = ""
                chrome.storage.local.set({ tabDescription })
                chrome.storage.local.set({ tabKeywords })
            }
        )
}
