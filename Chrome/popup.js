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

let indentGlobal = 0

const idTreeRoot = "0"

const numIndentSpaces = 4

const folderSeparator = "/"

let folderDiv = document.getElementById("folders")

let titleDiv = document.getElementById("title")

let urlDiv = document.getElementById("url")

document.querySelectorAll("[data-locale]").forEach((elem) => {
    elem.innerText = chrome.i18n.getMessage(elem.dataset.locale)
})

let nextButton = document.getElementById("nextButton")
nextButton.addEventListener("click", async () => {
    chrome.storage.local.get("currentItemId", async ({ currentItemId }) => {
        folderDiv.innerText = ""
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
            let [grandParent] = await chrome.bookmarks.getSubTree(
                parent.parentId
            )
            let found = false
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
            await mainEntry({ currentItemId: itemIdToSave })
        }
    })
})

let deleteButton = document.getElementById("deleteButton")

chrome.storage.local.get("currentItemId", mainEntry)

//=============================================================================

/**
 *
 * @param {*} currentItemId
 */
async function mainEntry({ currentItemId }) {
    let currentId = ""
    if (typeof currentItemId === "undefined") {
        currentId = idTreeRoot
    } else {
        currentId = currentItemId
    }

    let currentItem = await getFirstBookmark(currentId)
    if (currentItem) {
        chrome.storage.local.set({ currentItemId: currentItem.id })
        getParents(currentItem)
    }
}

async function getParents(item) {
    if (item.id === idTreeRoot) {
        return
    }
    let [parent] = await chrome.bookmarks.getSubTree(item.parentId)
    folderDiv.innerText =
        getTitle(parent) + folderSeparator + folderDiv.innerText
    getParents(parent)
}

async function getFirstBookmark(itemId) {
    let items = await chrome.bookmarks.getSubTree(itemId)

    for (item of items) {
        if (item.url) {
            urlDiv.innerText = `<a href="${getURL(item)}">${getURL(item)}</a>`
            // let anchor = document.createElement("a")
            // anchor.href = URL.createObjectURL(getURL(item))

            // anchor.textContent = getURL(item)
            // anchor.hidden = false
            // urlDiv.appendChild(anchor)
            titleDiv.innerText = getTitle(item)
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

function getId(item) {
    return typeof item === "undefined" ? idTreeRoot : item.id
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
