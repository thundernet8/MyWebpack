"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const DynamicEntryPlugin = require("webpack/lib/DynamicEntryPlugin");
function scanEntries(folder) {
    const files = fs.readdirSync(folder);
    if (files.length === 0) {
        throw new Error(`No entry files found in ${folder}`);
    }
    const paths = files.map(file => path.resolve(folder, file));
    return paths.map(p => {
        const basename = path.basename(p);
        const extname = path.extname(p);
        const name = basename.substring(0, basename.length - extname.length);
        return {
            name,
            path: p
        };
    });
}
exports.scanEntries = scanEntries;
function addWebpackEntry(compilation, context, entryName, entryPath) {
    return new Promise((resolve, reject) => {
        const dep = DynamicEntryPlugin.createDependency(entryPath, entryName);
        compilation.addEntry(context, dep, name, err => {
            if (err)
                return reject(err);
            resolve();
        });
    });
}
exports.addWebpackEntry = addWebpackEntry;
exports.default = {
    scanEntries,
    addWebpackEntry
};
