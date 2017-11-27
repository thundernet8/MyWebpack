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
            prod: "/"
        },
        devHost: "localhost",
        devPort: 9000,
        prePackages: ["babel-polyfill"],
        initEntries: [],
        entryRoot: "src/entries"
    };
    const defaultWebpack = {
        resolve: {
            extensions: [
                ".json",
                ".js",
                ".jsx",
                ".ts",
                ".tsx",
                ".css",
                ".less",
                ".scss"
            ],
            modules: ["node_modules"]
        },
        target: "web"
    };
    return Object.assign({}, {
        mpk: defaultMpk,
        webpack: defaultWebpack,
        root: path.resolve(process.cwd())
    }, config);
}
