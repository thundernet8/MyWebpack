"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
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
