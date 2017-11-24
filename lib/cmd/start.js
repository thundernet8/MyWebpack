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
const events_1 = require("events");
var EntryTaskStatus;
(function(EntryTaskStatus) {
    EntryTaskStatus[(EntryTaskStatus["BUILT"] = 0)] = "BUILT";
    EntryTaskStatus[(EntryTaskStatus["BUILDING"] = 1)] = "BUILDING";
    EntryTaskStatus[(EntryTaskStatus["UNBUILD"] = 2)] = "UNBUILD";
})(EntryTaskStatus || (EntryTaskStatus = {}));
class EntryTaskManager {
    constructor(
        mpkConfig,
        compiler,
        devMiddleware,
        hotMiddleware,
        allEntries,
        builtEntryNames
    ) {
        this.allEntries = [];
        this.allEntryNames = [];
        this.builtEntryNames = [];
        this.entryTaskQueue = [];
        this.emitter = new events_1.EventEmitter();
        this.htmlPageQueue = [];
        this.mpkConfig = mpkConfig;
        this.compiler = compiler;
        this.devMiddleware = devMiddleware;
        this.hotMiddleware = hotMiddleware;
        this.allEntries = allEntries;
        this.allEntryNames = allEntries.map(e => e.name);
        this.builtEntryNames = builtEntryNames;
        this.hookupCompiler();
    }
    execEntryTask(entryName) {
        if (
            !this.allEntryNames.includes(entryName) ||
            this.builtEntryNames.includes(entryName)
        ) {
            return Promise.resolve();
        }
        gutil.log(`🛠️ Building new entry: ${entryName}`);
        this.addEntryTask(entryName);
        this.compiler.apply(
            base_1.getHtmlWebpackPluginInstance(
                this.mpkConfig,
                "index.html",
                entryName + ".html"
            )
        );
        this.devMiddleware.invalidate();
        return new Promise((resolve, reject) => {
            this.emitter.once("done", () => {
                this.builtEntryNames.push(entryName);
                resolve();
            });
            this.emitter.once("error", err => {
                reject(err);
            });
        });
    }
    addEntryTask(entryName) {
        const { entryTaskQueue } = this;
        entryTaskQueue.push(entryName);
        this.entryTaskQueue = Array.from(new Set(entryTaskQueue));
    }
    hookupCompiler() {
        const {
            mpkConfig,
            compiler,
            emitter,
            devMiddleware,
            hotMiddleware,
            allEntries,
            builtEntryNames
        } = this;
        compiler.plugin("compile", function(params) {
            console.log("The compiler is starting to compile...");
        });
        compiler.plugin("emit", function(compilation, callback) {
            console.log("The compilation is going to emit files...");
            callback();
        });
        compiler.plugin("after-compile", function(compilation, callback) {
            console.log("The compiler is done compile...");
            callback();
        });
        compiler.plugin("make", (compilation, done) => {
            log_1.default("make");
            let promise;
            const newEntryNames = this.entryTaskQueue.filter(
                n => !builtEntryNames.includes(n)
            );
            log_1.default("task");
            log_1.default(this.entryTaskQueue.join("---"));
            log_1.default(typeof hotMiddleware);
            if (newEntryNames.length > 0) {
                promise = Promise.all(
                    newEntryNames.map(n => {
                        const e = allEntries.find(item => item.name === n);
                        return entry_1
                            .addWebpackEntry(
                                compilation,
                                this["context"],
                                e.name,
                                e.path
                            )
                            .then(() => e);
                    })
                ).then(entries => {
                    entries.forEach(e => {});
                    log_1.default(
                        JSON.stringify(Object.keys(compilation.entries))
                    );
                });
            } else {
                promise = Promise.resolve();
            }
            promise.then(done).catch(err => {
                emitter.emit("error", err);
            });
        });
        compiler.plugin("done", stats => {
            console.log("done");
            if (stats) {
                const { assets, chunks } = stats.toJson();
                console.log(Object.keys(assets));
                console.log(Object.keys(chunks));
            }
            log_1.default("done");
            log_1.default(compiler["context"]);
            log_1.default("devMiddleware.invalidate");
            this.entryTaskQueue = [];
            log_1.default(this.htmlPageQueue.join("---"));
            if (this.htmlPageQueue.length > 0) {
                this.htmlPageQueue.forEach(page => {
                    compiler.apply(
                        base_1.getHtmlWebpackPluginInstance(
                            mpkConfig,
                            "index.html",
                            page
                        )
                    );
                });
                this.htmlPageQueue = [];
                devMiddleware.invalidate();
            } else {
                emitter.emit("done");
            }
        });
    }
}
function start(config) {
    const entryStatus = {};
    build_1.default(config, function(
        compiler,
        webpackConfig,
        allEntries,
        entries
    ) {
        allEntries.forEach(e => {
            entryStatus[e.name] = EntryTaskStatus.UNBUILD;
        });
        entries.forEach(e => {
            entryStatus[e.name] = EntryTaskStatus.BUILT;
        });
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
        const taskManager = new EntryTaskManager(
            config,
            compiler,
            devMiddleware,
            hotMiddleware,
            allEntries,
            entries.map(e => e.name)
        );
        server.use((req, res, next) => {
            const urlObj = req._parsedUrl;
            if (urlObj.pathname.endsWith(".html")) {
                const entryName = urlObj.pathname.substring(
                    1,
                    urlObj.pathname.length - 5
                );
                taskManager
                    .execEntryTask(entryName)
                    .then(next)
                    .catch(err => log_1.default(err.toString()));
            } else {
                next();
            }
        });
        server.use(devMiddleware);
        server.use(hotMiddleware);
        server.use("/", express.static(config.mpk.distPath));
        server.locals.env = process.env.NODE_ENV;
        devMiddleware.waitUntilValid(() => {
            gutil.log(
                `Starting dev server on ${devServerOptions.host}:${
                    devServerOptions.port
                }\r\n`
            );
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
