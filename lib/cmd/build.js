"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webpack = require("webpack");
const gutil = require("gutil");
const dll_1 = require("../webpack/dll");
const dev_1 = require("../webpack/dev");
const prod_1 = require("../webpack/prod");
const entry_1 = require("../utils/entry");
const path = require("path");
const path_1 = require("../utils/path");
function build(config, cb) {
    const dllConfig = dll_1.default(config);
    let generalConfig;
    const { root, mpk } = config;
    const { entryRoot, initEntries } = mpk;
    if (!entryRoot) {
        throw new Error("Entries folder is not defined in config");
    }
    const allEntries = entry_1.scanEntries(path.resolve(root, entryRoot));
    const prebuildEntries = allEntries.filter(entry => initEntries.includes(entry.name) ||
        initEntries.some(item => item.split(".")[0] === entry.name));
    let webpackEntry;
    let outputs;
    if (process.env.NODE_ENV === "production") {
        webpackEntry = prebuildEntries.reduce((prev, curr) => {
            prev[curr.name] = curr.path;
            return prev;
        }, {});
        outputs = prebuildEntries.map(e => {
            return {
                filename: e.name + ".html",
                template: "index.html"
            };
        });
    }
    else {
        webpackEntry = {};
        webpackEntry["empty"] = path_1.getEmptyEntry(true);
        outputs = [];
    }
    config.webpack.entry = webpackEntry;
    const callback = function (err, stats, end = true) {
        if (err) {
            throw new Error(err);
        }
        else {
            gutil.log("🎉  " +
                stats.toString({
                    timings: false,
                    assets: true,
                    chunks: false,
                    chunkModules: false,
                    modules: false,
                    children: true,
                    errorDetails: true,
                    colors: true
                }) +
                "\r\n\r\n");
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
                    ? dev_1.default(config, outputs)
                    : prod_1.default(config, outputs);
            const compiler = webpack(generalConfig);
            compiler.run(callback.bind(compiler));
        }
    });
}
exports.default = build;
