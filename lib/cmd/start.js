"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const build_1 = require("./build");
const gutil = require("gutil");
const express = require("express");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const entry_1 = require("../utils/entry");
const base_1 = require("../webpack/base");
const log_1 = require("../utils/log");
function start(config) {
    let allEntries;
    let builtEntries;
    let buildingEntries = [];
    build_1.default(config, function (compiler, webpackConfig, _allEntries, entries) {
        allEntries = _allEntries;
        builtEntries = entries;
        const devServerOptions = webpackConfig.devServer;
        const server = express();
        const devMiddleware = webpackDevMiddleware(compiler, {
            publicPath: webpackConfig.output.publicPath,
            noInfo: true,
            quiet: true,
            headers: Object.assign({}, devServerOptions.headers || {}, {
                "Access-Control-Allow-Origin": "*"
            })
        });
        const hotMiddleware = webpackHotMiddleware(compiler);
        compiler.plugin("compilation", function (compilation) {
            compilation.plugin("html-webpack-plugin-after-emit", function (data, cb) {
                console.log("html-webpack-plugin-after-emit");
                log_1.default("html-webpack-plugin-after-emit");
                hotMiddleware.publish({ action: "reload" });
                cb();
            });
        });
        compiler.plugin("make", function addEntry(compilation, done) {
            console.log("make");
            log_1.default("make");
            let promise;
            if (buildingEntries.length) {
                promise = Promise.all(buildingEntries.map(e => {
                    return entry_1.addWebpackEntry(compilation, this["context"], e.name, e.path);
                }));
            }
            else {
                promise = Promise.resolve();
            }
            promise.then(done).catch(done);
        });
        compiler.plugin("done", function emitWebpackDone() {
            console.log("done");
            log_1.default("done");
            log_1.default(compiler["context"]);
            log_1.default("devMiddleware.invalidate");
            devMiddleware.invalidate();
        });
        server.use((req, res, next) => {
            const urlObj = req._parsedUrl;
            if (urlObj.pathname.endsWith(".html")) {
                const entryName = urlObj.pathname.substring(1, urlObj.pathname.length - 5);
                if (builtEntries.findIndex(e => e.name === entryName) < 0 &&
                    allEntries.findIndex(e => e.name === entryName) >= 0) {
                    gutil.log(`> Building new entry: ${entryName}`);
                    const entry = allEntries.find(e => e.name === entryName);
                    compiler.apply(base_1.getHtmlWebpackPluginInstance(config, "index.html", entry.name + ".html"));
                    buildingEntries.push(entry);
                }
            }
            next();
        });
        server.use(devMiddleware);
        server.use(hotMiddleware);
        server.use("/", express.static(config.mpk.distPath));
        server.locals.env = process.env.NODE_ENV;
        devMiddleware.waitUntilValid(() => {
            gutil.log(`Starting dev server on ${devServerOptions.host}:${devServerOptions.port}\r\n`);
        });
        console.log("xxxxxx");
        console.log("xxxxxx");
        console.log("xxxxxx");
        server.listen(devServerOptions.port, "0.0.0.0");
        process.on("SIGTERM", () => {
            gutil.log("Stopping dev server");
            devMiddleware.close();
            server.close(() => {
                process.exit(0);
            });
        });
    });
}
exports.default = start;
