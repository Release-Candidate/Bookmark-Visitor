// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2021 Roland Csaszar
//
// Project:  bookmark-visitor
// File:     popup.js
// Date:     04.Oct.2021
//
//=============================================================================
// `chrome` is unknown to eslint
/* eslint-disable no-undef */

const idTreeRoot = "0"

const numIndentSpaces = 4

const folderSeparator = "/"

let folderDiv = document.getElementById("folders")

let titleElem = document.getElementById("title")

document.querySelectorAll("[data-locale]").forEach((elem) => {
    elem.innerText = chrome.i18n.getMessage(elem.dataset.locale)
})

let urlAnchor = document.getElementById("urlA")
urlAnchor.addEventListener("click", async () => {
    runOnCurrentItem(async (currentItem) => {
        chrome.tabs.create({
            active: false,
            url: getURL(currentItem),
        })
    })
})

let nextButton = document.getElementById("nextButton")
nextButton.addEventListener("click", async () => {
    chrome.storage.local.get("currentItemId", async ({ currentItemId }) => {
        folderDiv.innerText = ""

        await setToNextId(currentItemId)
    })
})

let deleteButton = document.getElementById("deleteButton")
deleteButton.addEventListener("click", async () => {
    runOnCurrentItemId(async (currentItemId) => {
        if (
            // eslint-disable-next-line no-alert
            window.confirm(
                "Really delete Bookmark '" + titleElem.innerText + "'?"
            )
        ) {
            await setToNextId(currentItemId)
            await chrome.bookmarks.remove(currentItemId)
        }
    })
})

chrome.storage.local.get("currentItemId", mainEntry)

//=============================================================================

/**
 *
 * @param {*} currentItemId
 */
async function setToNextId(currentItemId) {
    await getNextID({
        currentItemId,
        func: async (nextItemId) => {
            await mainEntry({ currentItemId: nextItemId })
        },
    })
}

/**
 *
 * @param {*} param0
 */
async function getNextID({ currentItemId, func }) {
    let [currentItem] = await chrome.bookmarks.getSubTree(currentItemId)
    let [parent] = await chrome.bookmarks.getSubTree(currentItem.parentId)
    let found = false
    let itemIdToSave = currentItemId
    for (child of parent.children) {
        if (child.index === currentItem.index + 1) {
            chrome.storage.local.set({ currentItemId: child.id })
            found = true
            itemIdToSave = child.id
            break
        }
    }
    if (!found) {
        let [grandParent] = await chrome.bookmarks.getSubTree(parent.parentId)
        found = false
        for (child of grandParent.children) {
            if (child.index === parent.index + 1) {
                chrome.storage.local.set({ currentItemId: child.id })
                found = true
                itemIdToSave = child.id
                break
            }
        }
    }
    if (found) {
        await func(itemIdToSave)
    }
}

/**
 *
 * @param {*} func
 */
async function runOnCurrentItemId(func) {
    chrome.storage.local.get("currentItemId", async ({ currentItemId }) => {
        const itemId = await getCheckedId(currentItemId)
        func(itemId)
    })
}

/**
 *
 * @param {*} func
 */
async function runOnCurrentItem(func) {
    runOnCurrentItemId(async (currentItemId) => {
        const itemId = await getCheckedId(currentItemId)

        const currentItem = await getFirstBookmark(itemId)
        if (currentItem) {
            await func(currentItem)
        }
    })
}

/**
 *
 * @param {*} currentItemId
 */
async function mainEntry({ currentItemId }) {
    const currentItem = await getCheckedId(currentItemId).then(
        async (currentId) => getFirstBookmark(currentId)
    )

    if (currentItem) {
        chrome.storage.local.set({ currentItemId: currentItem.id })
        await getParents(currentItem)
    }
}

/**
 *
 * @param {*} currentItemId
 * @returns
 */
async function getCheckedId(currentItemId) {
    if (typeof currentItemId === "undefined") {
        return idTreeRoot
    }
    try {
        await chrome.bookmarks.get(currentItemId)
        return currentItemId
    } catch {
        return idTreeRoot
    }
}

/**
 *
 * @param {*} item
 * @returns
 */
async function getParents(item) {
    if (item.id === idTreeRoot) {
        return
    }
    const [parent] = await chrome.bookmarks.getSubTree(item.parentId)
    folderDiv.innerText =
        getTitle(parent) + folderSeparator + folderDiv.innerText
    getParents(parent)
}

/**
 *
 * @param {*} itemId
 * @returns
 */
async function getFirstBookmark(itemId) {
    const items = await chrome.bookmarks.getSubTree(itemId)

    for (item of items) {
        if (item.url) {
            urlAnchor.href = getURL(item)
            urlAnchor.text = getURL(item)
            titleElem.innerText = getTitle(item)
            return item
        } else if (item.children) {
            // eslint-disable-next-line no-magic-numbers
            return getFirstBookmark(item.children[0].id)
        }
    }
    return null
}

/**
 * Return a couple of spaces to indicate the current level of indentation.
 *
 * @param {*} level The indentation level.
 * @returns A number of spaces to indicate the current indentation level.
 */
function getIndent(level) {
    return " ".repeat(level * numIndentSpaces)
}

/**
 * Return the title of the bookmark or folder, the empty string ("") if the
 * item doesn't have a title.
 *
 * @param {*} item The bookmark item to return the title of.
 * @returns The title of the bookmark or folder, the empty string ("") if the
 * item doesn't have a title.
 */
function getTitle(item) {
    return typeof item.title === "undefined" ? "" : item.title
}

/**
 * Return the bookmarks URL or an empty string, if the item isn't a bookmark,
 * but a folder.
 *
 * @param {*} item The bookmark item to return the URL of, if it isn't a folder.
 * @returns The bookmarks URL or an empty string, if the item isn't a bookmark,
 * but a folder.
 */
function getURL(item) {
    return typeof item.url === "undefined" ? "" : item.url
}
