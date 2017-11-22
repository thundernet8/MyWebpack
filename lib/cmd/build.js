"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webpack = require("webpack");
const gutil = require("gutil");
const dll_1 = require("../webpack/dll");
const dev_1 = require("../webpack/dev");
const prod_1 = require("../webpack/prod");
function build(config, cb) {
    const dllConfig = dll_1.default(config);
    let generalConfig;
    const callback = function (err, stats, end = true) {
        if (err) {
            console.log(gutil);
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
            cb(this, generalConfig);
        }
    };
    webpack(dllConfig, function (err, stats) {
        callback(err, stats, false);
        if (!err) {
            generalConfig =
                process.env.NODE_ENV !== "production"
                    ? dev_1.default(config, {
                        filename: "index.html",
                        template: "index.html"
                    })
                    : prod_1.default(config);
            const compiler = webpack(generalConfig);
            compiler.run(callback.bind(compiler));
        }
    });
}
exports.default = build;
