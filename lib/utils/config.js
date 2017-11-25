"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
function loadConfig(configFile) {
    const filePath = path.resolve(configFile);
    if (!fs.existsSync(filePath)) {
        throw new Error(`The specified config file is not exist on path: ${filePath}`);
    }
    const config = require(filePath);
    return defaults(config);
}
exports.default = loadConfig;
function defaults(config) {
    const defaultMpk = {
        styleName: "style",
        distPath: "dist",
        template: "src/templates",
        htmlInjects: {},
        publicPath: {
            dev: "/",
            prod: "https://assets.example.com/"
        },
        devHost: "localhost",
        devPort: 9000,
        prePackages: ["babel-polyfill"],
        initEntries: ["index.ts"],
        entryRoot: "src/entries"
    };
    return Object.assign({}, { mpk: defaultMpk }, config);
}
