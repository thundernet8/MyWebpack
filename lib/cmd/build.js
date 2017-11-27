"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const webpack = require("webpack");
const inquirer = require("inquirer");
const SearchCheckbox = require("inquirer-search-checkbox");
const dll_1 = require("../webpack/dll");
const dev_1 = require("../webpack/dev");
const prod_1 = require("../webpack/prod");
const entry_1 = require("../utils/entry");
const path_1 = require("../utils/path");
const log_1 = require("../utils/log");
inquirer.registerPrompt("SearchCheckbox", SearchCheckbox);
function _build(config, cb) {
    const dllConfig = dll_1.default(config);
    let generalConfig;
    const { root, mpk } = config;
    const { entryRoot, initEntries } = mpk;
    const allEntries = entry_1.scanEntries(path.resolve(root, entryRoot));
    const prebuildEntries = allEntries.filter(entry => initEntries.includes(entry.name) ||
        initEntries.some(item => item.split(".")[0] === entry.name));
    let webpackEntry;
    if (process.env.NODE_ENV === "production") {
        webpackEntry = prebuildEntries.reduce((prev, curr) => {
            prev[curr.name] = curr.path;
            return prev;
        }, {});
    }
    else {
        webpackEntry = {};
        webpackEntry.empty = path_1.getEmptyEntry();
    }
    config.webpack.entry = webpackEntry;
    config.webpack.node = {
        __filename: false,
        __dirname: false
    };
    const callback = function (err, stats, end = true) {
        if (err) {
            throw new Error(err);
        }
        else {
            console.log("\r\n" +
                stats.toString({
                    version: false,
                    timings: false,
                    assets: true,
                    chunks: false,
                    chunkModules: false,
                    modules: false,
                    children: false,
                    errorDetails: true,
                    colors: true
                }) +
                "\r\n");
        }
        if (end && cb) {
            cb(this, generalConfig, allEntries, prebuildEntries);
        }
    };
    webpack(dllConfig, function (err, stats) {
        callback(err, stats, false);
        if (!err) {
            generalConfig =
                process.env.NODE_ENV !== "production"
                    ? dev_1.default(config)
                    : prod_1.default(config);
            const compiler = webpack(generalConfig);
            compiler.run(callback.bind(compiler));
        }
    });
}
function build(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const { root, mpk } = config;
        const { entryRoot } = mpk;
        if (!entryRoot) {
            throw new Error("Entries folder is not defined in config");
        }
        if (process.env.NODE_ENV === "production") {
            try {
                const allEntries = entry_1.scanEntries(path.resolve(root, entryRoot));
                const allEntryKeys = allEntries.map(e => e.name);
                const entryKeys = ["All"].concat(allEntryKeys);
                const answers = yield inquirer.prompt([
                    {
                        type: "SearchCheckbox",
                        name: "key",
                        message: `Select entries to build (${entryKeys.length})`,
                        choices: entryKeys.map(name => ({ name })),
                        pageSize: 5,
                        validate: function (answer) {
                            if (answer.length < 1) {
                                return "You must choose at least one entry.";
                            }
                            return true;
                        }
                    }
                ]);
                if (!answers.key || answers.key.length < 1) {
                    log_1.default.warning("No entry select");
                }
                config.mpk.initEntries = answers.key.includes("All")
                    ? allEntryKeys
                    : answers.key;
            }
            catch (err) {
                log_1.default.error(err.message || err.toString());
                return;
            }
        }
        return new Promise((resolve, reject) => {
            try {
                _build(config, (compiler, webpackConfig, allEntries, entries) => {
                    resolve({
                        compiler,
                        webpackConfig,
                        allEntries,
                        entries
                    });
                });
            }
            catch (err) {
                reject(err);
            }
        });
    });
}
exports.default = build;
