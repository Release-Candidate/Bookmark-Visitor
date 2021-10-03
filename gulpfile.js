// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2021 Roland Csaszar
//
// Project:  notoy-browser_extensions
// File:     gulpfile.js
// Date:     03.Oct.2021
//
//=============================================================================

// eslint-disable-next-line no-undef
const { series, parallel } = require("gulp")

// eslint-disable-next-line no-undef
const { src, dest } = require("gulp")

// eslint-disable-next-line no-undef
const del = require("delete")

// eslint-disable-next-line no-undef
const zip = require("gulp-zip")

// eslint-disable-next-line no-undef
const replace = require("gulp-string-replace")

// eslint-disable-next-line no-undef
const fs = require("fs")

//=============================================================================
// Replace Version

function scanChangelogVersion() {
    let version = ""
    try {
        const data = fs.readFileSync("./CHANGELOG.md", "utf8")
        const match = data
            .toString()
            .match(/##\s+Version\s+(?<versionMatch>[0-9]+.[0-9]+.[0-9]+)/u)
        version = match.groups.versionMatch
    } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err)
    }

    return version
}

function replaceVersion(dirName, version) {
    return src("./" + dirName + "/manifest.json")
        .pipe(
            replace(
                /"version":\s+"[0-9]+.[0-9]+.[0-9]+",/gu,
                '"version": "' + version + '",'
            )
        )
        .pipe(dest("./" + dirName))
}

function replaceVersionChrome() {
    return replaceVersion("Chrome", scanChangelogVersion())
}

function replaceVersionEdge() {
    return replaceVersion("Edge", scanChangelogVersion())
}

function replaceVersionFirefox() {
    return replaceVersion("Firefox", scanChangelogVersion())
}

//=============================================================================
// Copy Directories

function copyDir(dirName) {
    return src("./" + dirName + "/**/*")
        .pipe(dest("./Chrome/" + dirName))
        .pipe(dest("./Edge/" + dirName))
        .pipe(dest("./Firefox/" + dirName))
}

function copyImages() {
    return copyDir("images")
}

function copyTranslations() {
    return copyDir("_locales")
}

//=============================================================================
// Zip Directories

function zipDir(dirName) {
    return src("./" + dirName + "/**/*")
        .pipe(zip("notoy-" + dirName + ".zip"))
        .pipe(dest("./"))
}

function zipChrome() {
    return zipDir("Chrome")
}

function zipEdge() {
    return zipDir("Edge")
}

function zipFirefox() {
    return zipDir("Firefox")
}

//=============================================================================
// Delete Directories and Zip Files

function delDirectory(dirName, cb) {
    del([dirName], cb)
}

function delChromeDir(dirName, cb) {
    delDirectory("./Chrome/" + dirName, cb)
}

function delEdgeDir(dirName, cb) {
    delDirectory("./Edge/" + dirName, cb)
}

function delFirefoxDir(dirName, cb) {
    delDirectory("./Firefox/" + dirName, cb)
}

function cleanChrome(cb) {
    delChromeDir("images", cb)
    delChromeDir("_locales", cb)
    del(["notoy-Chrome.zip"], cb)
    cb()
}

function cleanEdge(cb) {
    delEdgeDir("images", cb)
    delEdgeDir("_locales", cb)
    del(["notoy-Edge.zip"], cb)
    cb()
}

function cleanFirefox(cb) {
    delFirefoxDir("images", cb)
    delFirefoxDir("_locales", cb)
    del(["notoy-Firefox.zip"], cb)
    cb()
}

//=============================================================================

// eslint-disable-next-line no-undef
exports.clean = parallel(cleanChrome, cleanEdge, cleanFirefox)

// eslint-disable-next-line no-undef
exports.default = series(
    parallel(
        copyImages,
        copyTranslations,
        replaceVersionChrome,
        replaceVersionEdge,
        replaceVersionFirefox
    ),
    parallel(zipChrome, zipEdge, zipFirefox)
)
