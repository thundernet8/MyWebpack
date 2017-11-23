"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
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
exports.default = scanEntries;
