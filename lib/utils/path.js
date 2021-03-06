"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
function getPackagePath() {
    return path.resolve(__dirname, `../..`);
}
exports.getPackagePath = getPackagePath;
function getEmptyEntry() {
    const pkgPath = getPackagePath();
    return path.resolve(pkgPath, "./src/resources/empty.ts");
}
exports.getEmptyEntry = getEmptyEntry;
function isDirectory(dirPathName) {
    return fse
        .stat(dirPathName)
        .then(stats => {
        if (stats) {
            return stats.isDirectory();
        }
        return false;
    })
        .catch(() => false);
}
exports.isDirectory = isDirectory;
function isFile(filePath) {
    return fse
        .stat(filePath)
        .then(stats => {
        if (stats) {
            return stats.isFile();
        }
        return false;
    })
        .catch(() => false);
}
exports.isFile = isFile;
function isFileSync(filePath) {
    try {
        const stats = fs.lstatSync(filePath);
        return stats.isFile();
    }
    catch (e) {
        return false;
    }
}
exports.isFileSync = isFileSync;
