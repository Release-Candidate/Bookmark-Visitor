// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2021 Roland Csaszar
//
// Project:  notoy-browser_extensions
// File:     inject.js
// Date:     30.Sep.2021
//
//=============================================================================
// Eslint doesn't know `chrome`.
/* eslint-disable no-undef */

/* Script may be injected more than once, so don't use `let` or `const` :( */

tabDescription = ""
tabKeywords = ""

desc = document.querySelector('meta[name="description"]')
if (desc !== null) {
    tabDescription = desc.getAttribute("content")
}

tags = document.querySelector('meta[name="keywords"]')
if (tags !== null) {
    tabKeywords = tags.getAttribute("content")
}

chrome.storage.local.set({ tabDescription })
chrome.storage.local.set({ tabKeywords })
