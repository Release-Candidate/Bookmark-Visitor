// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2021 Roland Csaszar
//
// Project:  bookmark-visitor
// File:     gulpfile.js
// Date:     04.Oct.2021
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
const sass = require("gulp-sass")(require("sass"))

// eslint-disable-next-line no-undef
const rename = require("gulp-rename")

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

function replaceVersionFirefox() {
    return replaceVersion("Firefox", scanChangelogVersion())
}

//=============================================================================
// Copy Directories and files

function copyFilesInDir(dirName) {
    return src("./" + dirName + "/*")
        .pipe(dest("./Chrome/"))
        .pipe(dest("./Firefox/"))
}

function copyDir(dirName) {
    return src("./" + dirName + "/**/*")
        .pipe(dest("./Chrome/" + dirName))
        .pipe(dest("./Firefox/" + dirName))
}

function copyHTML() {
    return copyFilesInDir("./extension_html")
}

function copyImages() {
    return copyDir("images")
}

function copyTranslations() {
    return copyDir("_locales")
}

//=============================================================================
// Run SASS to generate CSS

function runSassBrowser(browserName) {
    return src("./sass/" + browserName.toLowerCase() + "_*.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(
            rename((path) => {
                path.basename = path.basename.replace(
                    browserName.toLowerCase() + "_",
                    ""
                )
                path.extname = ".css"
            })
        )
        .pipe(dest("./" + browserName + "/"))
}

function runSassChrome() {
    return runSassBrowser("Chrome")
}

function runSassFirefox() {
    return runSassBrowser("Firefox")
}

//=============================================================================
// Zip Directories

function zipDir(dirName) {
    return src("./" + dirName + "/**/*")
        .pipe(zip("bookmark-visitor-" + dirName + ".zip"))
        .pipe(dest("./"))
}

function zipChrome() {
    return zipDir("Chrome")
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
    delDirectory("./Chrome/*.html", cb)
    delDirectory("./Chrome/*.css", cb)
}

function delFirefoxDir(dirName, cb) {
    delDirectory("./Firefox/" + dirName, cb)
    delDirectory("./Firefox/*.html", cb)
    delDirectory("./Firefox/*.css", cb)
}

function cleanChrome(cb) {
    delChromeDir("images", cb)
    delChromeDir("_locales", cb)
    del(["bookmark-visitor-Chrome.zip"], cb)
    cb()
}

function cleanFirefox(cb) {
    delFirefoxDir("images", cb)
    delFirefoxDir("_locales", cb)
    del(["bookmark-visitor-Firefox.zip"], cb)
    cb()
}

//=============================================================================

// eslint-disable-next-line no-undef
exports.clean = parallel(cleanChrome, cleanFirefox)

// eslint-disable-next-line no-undef
exports.default = series(
    parallel(
        runSassChrome,
        runSassFirefox,
        copyHTML,
        copyImages,
        copyTranslations,
        replaceVersionChrome,
        replaceVersionFirefox
    ),
    parallel(zipChrome, zipFirefox)
)
