"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fse = require("fs-extra");
const pkg = require("../../package.json");
function getPackagePath(isTest = false) {
    const projectRoot = process.cwd();
    if (isTest) {
        return projectRoot;
    }
    return path.resolve(projectRoot, `./node_modules/${pkg.name}`);
}
exports.getPackagePath = getPackagePath;
function getEmptyEntry() {
    const isTest = pkg.name === "mywebpack";
    const pkgPath = getPackagePath(isTest);
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
