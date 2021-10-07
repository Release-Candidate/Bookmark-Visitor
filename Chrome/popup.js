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
        await displayNextId(currentItemId)
    })
})

let deleteButton = document.getElementById("deleteButton")
deleteButton.addEventListener("click", async () => {
    runOnCurrentItemId(async (currentItemId) => {
        if (
            // eslint-disable-next-line no-alert
            window.confirm(
                chrome.i18n.getMessage("deleteMessage", titleElem.innerText)
            )
        ) {
            await displayNextId(currentItemId)
            await chrome.bookmarks.remove(currentItemId)
        }
    })
})

chrome.storage.local.get("currentItemId", mainEntry)

//=============================================================================

/**
 * The main function of the script, `async`.
 * Displays the current bookmark in the popup window.
 *
 * @param {*} currentItemId The ID (string) of the current bookmark to display.
 */
async function mainEntry({ currentItemId }) {
    const currentItem = await getCheckedId(currentItemId).then(
        async (currentId) => getFirstBookmark(currentId)
    )

    if (currentItem) {
        chrome.storage.local.set({ currentItemId: currentItem.id })
        resetFolderButtons()
        await getParents(currentItem)
    }
}

/**
 * Removes all parent folder buttons from the popup view.
 */
function resetFolderButtons() {
    while (folderDiv.firstChild) {
        folderDiv.removeChild(folderDiv.firstChild)
    }
}

/**
 * Display the next bookmark after the bookmark with ID `currentItemId` in the
 * popup window.
 *
 * @param {*} currentItemId The ID of the current bookmark.
 */
async function displayNextId(currentItemId) {
    await getNextID({
        currentItemId,
        func: async (nextItemId) => {
            await mainEntry({ currentItemId: nextItemId })
        },
    })
}

/**
 * Run the given callback `func` with the next bookmark ID after `currentItemId`.
 *
 * @param {*} currentItemId The ID of the current bookmark
 * @param {*} func The function to call with the ID of the next bookmark after
 *  the current one.
 */
async function getNextID({ currentItemId, func }) {
    const [currentItem] = await chrome.bookmarks.getSubTree(currentItemId)
    const [parent] = await chrome.bookmarks.getSubTree(currentItem.parentId)

    let { found, itemIdToSave } = searchChildren(currentItem, parent)
    if (found) {
        await func(itemIdToSave)
    }
    if (!found) {
        await getNextID({ currentItemId: parent.id, func })
    }
}

/**
 * Search all sibling nodes for one with a greater index. If no such sibling
 * exists, search recursively in the parent nodes.
 *
 * @param {*} currentItem The current bookmark to find the successor of.
 * @param {*} parent The parent node containing the sibling elements.
 *
 * @returns `true` in `found` if such a successor has been found, false else.
 *  If a successor has been found, it's ID is returned in `itemIdToSave`.
 */
function searchChildren(currentItem, parent) {
    let found = false
    let itemIdToSave = currentItem.id
    for (child of parent.children) {
        // eslint-disable-next-line no-magic-numbers
        if (child.index === currentItem.index + 1) {
            found = true
            itemIdToSave = child.id
            break
        }
    }
    return { found, itemIdToSave }
}

/**
 * Calls the given callback with the ID of the current bookmark as argument.
 *
 * @param {*} func The function to call with the ID of the current bookmark as
 * argument.
 */
async function runOnCurrentItemId(func) {
    chrome.storage.local.get("currentItemId", async ({ currentItemId }) => {
        const itemId = await getCheckedId(currentItemId)
        func(itemId)
    })
}

/**
 * Calls the given callback with the current bookmark as argument.
 *
 * @param {*} func The function to call with the current bookmark as argument.
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
 * Return a sanitized bookmark ID. Either the given one, `currentItemId` or the
 * ID of the root of the bookmark tree.
 *
 * @param {*} currentItemId The Bookmark ID to sanitize.
 *
 * @returns `currentItemId`, if this is a valid bookmark ID.
 * The ID of the root of the bookmark tree else
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
 * Recursively add buttons with the parent folders of the given bookmark or
 * folder. Add clickable buttons with the parent folders to the popup window.
 *
 * @param {*} item The bookmark or folder to get the parents of.
 */
async function getParents(item) {
    if (item.id === idTreeRoot) {
        return
    }
    const [parent] = await chrome.bookmarks.getSubTree(item.parentId)
    addButton(parent)
    getParents(parent)
}

/**
 * Add a button with of the folder `parent` to the popup view.
 *
 * @param {*} parent The folder to switch to if the button is pressed.
 */
function addButton(parent) {
    const buttonTitle = getTitle(parent)
    if (buttonTitle !== "") {
        let parentButton = document.createElement("Button")
        parentButton.addEventListener("click", async () => {
            await mainEntry({ currentItemId: parent.id })
        })
        parentButton.innerText = buttonTitle
        const { firstChild } = folderDiv
        folderDiv.insertBefore(parentButton, firstChild)
    }
}

/**
 * Return the first bookmark, that is the first item in the bookmark tree that
 * is not a folder, beginning at the node with ID `itemId`.
 *
 * @param {*} itemId The ID of the folder or bookmark to start the search from.
 *
 * @returns The first bookmark in the bookmark tree with or after the item with
 * ID `itemId`.
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
 * Return the title of the bookmark or folder, the empty string ("") if the
 * item doesn't have a title.
 *
 * @param {*} item The bookmark item to return the title of.
 *
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
 *
 * @returns The bookmarks URL or an empty string, if the item isn't a bookmark,
 * but a folder.
 */
function getURL(item) {
    return typeof item.url === "undefined" ? "" : item.url
}
