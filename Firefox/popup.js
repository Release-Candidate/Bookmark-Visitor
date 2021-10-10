/* eslint-disable no-magic-numbers */
// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2021 Roland Csaszar
//
// Project:  bookmark-visitor
// File:     popup.js
// Date:     04.Oct.2021
//
//=============================================================================
// `browser` is unknown to eslint
/* eslint-disable no-undef */
// File is too long.
/* eslint-disable max-lines */

const idTreeRoot = "root________"

let folderDiv = document.getElementById("folders")

let titleElem = document.getElementById("title")
let titleDiv = document.getElementById("titleDiv")

document.querySelectorAll("[data-locale]").forEach((elem) => {
    elem.innerText = browser.i18n.getMessage(elem.dataset.locale)
})

const langShort = browser.i18n.getMessage("languageName")
document.documentElement.lang = langShort

let urlAnchor = document.getElementById("urlA")
urlAnchor.addEventListener("click", async () => {
    runOnCurrentItem(async (currentItem) => {
        browser.tabs.create({
            active: false,
            url: getURL(currentItem),
        })
    })
})

let nextButton = document.getElementById("nextButton")
nextButton.addEventListener("click", async () => {
    browser.storage.local.get("currentItemId", async ({ currentItemId }) => {
        await displayNextId(currentItemId)
    })
})

let deleteButton = document.getElementById("deleteButton")
deleteButton.addEventListener("click", async () => {
    runOnCurrentItemId(async (currentItemId) => {
        if (
            // eslint-disable-next-line no-alert
            window.confirm(
                browser.i18n.getMessage("deleteMessage", titleElem.innerText)
            )
        ) {
            await displayNextId(currentItemId)
            await browser.bookmarks.remove(currentItemId)
        }
    })
})

browser.storage.local.get("currentItemId", mainEntry)

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
        browser.storage.local.set({ currentItemId: currentItem.id })
        resetFolderDropdown()
        await getParents(currentItem)
    }
}

/**
 * Removes all parent folder drop-downs from the popup view.
 */
function resetFolderDropdown() {
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
    const [currentItem] = await browser.bookmarks.getSubTree(currentItemId)
    const [parent] = await browser.bookmarks.getSubTree(currentItem.parentId)

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
    browser.storage.local.get("currentItemId", async ({ currentItemId }) => {
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
        await browser.bookmarks.get(currentItemId)
        return currentItemId
    } catch {
        return idTreeRoot
    }
}

/**
 * Recursively add drop-downs with the parent folders of the given bookmark or
 * folder to the popup view.
 *
 * @param {*} item The bookmark or folder to get the parents of.
 */
async function getParents(item) {
    if (item.id === idTreeRoot) {
        return
    }
    const [parent] = await browser.bookmarks.getSubTree(item.parentId)
    addFolderDropdown(parent)
    getParents(parent)
}

/**
 * Return a list of siblings of the item `item˙, includes the item `item` in
 * the list. If `item` is a folder, only return folders, else return only
 * bookmarks.
 *
 * @param {*} item The item to return the siblings of.
 * @returns a list of siblings of the item `item˙, including `item`.
 */
async function getSiblings(item) {
    if (item.id === idTreeRoot) {
        return []
    }
    let childArray = []
    const [parent] = await browser.bookmarks.getSubTree(item.parentId)
    if (parent.children) {
        for (child of parent.children) {
            if (!item.url && !child.url) {
                childArray.push(child)
            } else if (item.url && child.url) {
                childArray.push(child)
            }
        }
    }
    return childArray.sort((a, b) => a.id - b.id)
}

/**
 * Add a dropdown (HTML `select`) containing a list of sibling folders of the
 * folder `item`, including `item`.
 *
 * @param {*} item The folder to add the siblings of to the dropdown.
 */
async function addFolderDropdown(item) {
    const currentTitle = getTitle(item)
    if (currentTitle !== "") {
        let folderDropdown = document.createElement("select")
        addSiblingList(item, folderDropdown)
        const { firstChild } = folderDiv
        folderDiv.insertBefore(folderDropdown, firstChild)
    }
}

/**
 * Adds a list of siblings of the item `item` to the dropdown
 * `itemDropdown`. If the item `item` is a folder, only add folders, if it is a
 * bookmark, only add bookmarks.
 *
 * @param {*} item The item to add the siblings of and itself to the list of
 * siblings.
 * @param {*} itemDropdown The dropdown to add the list of items to.
 */
async function addSiblingList(item, itemDropdown) {
    const siblings = await getSiblings(item)
    for (sibling of siblings) {
        let parentOption = document.createElement("option")
        itemDropdown.appendChild(parentOption)
        parentOption.innerText = getTitle(sibling)
        parentOption.id = sibling.id
        if (sibling.id === item.id) {
            parentOption.selected = true
        }
    }
    itemDropdown.addEventListener("change", async () => {
        await mainEntry({
            currentItemId: itemDropdown.options[itemDropdown.selectedIndex].id,
        })
    })
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
    const items = await browser.bookmarks.getSubTree(itemId)

    for (item of items) {
        if (item.url) {
            urlAnchor.href = getURL(item)
            urlAnchor.text = getURL(item)
            addBookmarkTitles()
            return item
            // eslint-disable-next-line no-magic-numbers
        } else if (item.children && item.children.length !== 0) {
            // eslint-disable-next-line no-magic-numbers
            return getFirstBookmark(item.children[0].id)
        }
    }
    return null
}

function addBookmarkTitles() {
    while (titleDiv.firstChild) {
        titleDiv.removeChild(titleDiv.firstChild)
    }
    titleElem.innerText = getTitle(item)
    let titleDropdown = document.createElement("select")
    addSiblingList(item, titleDropdown)
    titleDiv.appendChild(titleDropdown)
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
    if (typeof item.title === "undefined") {
        return ""
    }
    return item.title.length > 100
        ? item.title.slice(0, 100) + " ..."
        : item.title
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
