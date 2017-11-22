"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webpack = require("webpack");
const gutil = require("gutil");
const dll_1 = require("../webpack/dll");
const dev_1 = require("../webpack/dev");
const prod_1 = require("../webpack/prod");
function build(config) {
    const webpackConfigs = [];
    webpackConfigs.push(dll_1.default(config));
    webpackConfigs.push(process.env.NODE_ENV !== "production"
        ? dev_1.default(config)
        : prod_1.default(config));
    const callback = function (err, stats) {
        if (err) {
            throw new gutil.PluginError("💡", err);
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
    };
    webpack(webpackConfigs[0], function (err, stats) {
        callback(err, stats);
        if (!err) {
            webpackConfigs.slice(1).forEach(webpackConfig => {
                webpack(webpackConfig, callback);
            });
        }
    });
}
exports.default = build;
