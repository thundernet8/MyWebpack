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
(function (EntryTaskStatus) {
    EntryTaskStatus[EntryTaskStatus["BUILT"] = 0] = "BUILT";
    EntryTaskStatus[EntryTaskStatus["BUILDING"] = 1] = "BUILDING";
    EntryTaskStatus[EntryTaskStatus["UNBUILD"] = 2] = "UNBUILD";
})(EntryTaskStatus || (EntryTaskStatus = {}));
class EntryTaskManager {
    constructor(mpkConfig, compiler, devMiddleware, allEntries, prebuildEntryNames) {
        this.allEntries = [];
        this.allEntryNames = [];
        this.prebuildEntryNames = [];
        this.builtEntryNames = [];
        this.entryTaskQueue = [];
        this.emitter = new events_1.EventEmitter();
        this.entryStatus = {};
        this.mpkConfig = mpkConfig;
        this.compiler = compiler;
        this.devMiddleware = devMiddleware;
        this.allEntries = allEntries;
        this.allEntryNames = allEntries.map(e => e.name);
        this.prebuildEntryNames = prebuildEntryNames;
        this.builtEntryNames = [];
        this.hookupCompiler();
    }
    execEntryTask(entryName) {
        if (!this.allEntryNames.includes(entryName) ||
            this.entryStatus[entryName] === EntryTaskStatus.BUILDING ||
            this.entryStatus[entryName] === EntryTaskStatus.BUILT) {
            return Promise.resolve();
        }
        this.entryStatus[entryName] = EntryTaskStatus.BUILDING;
        gutil.log(`🛠️ Building new entry: ${entryName}`);
        this.addEntryTask(entryName);
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
        this.addHtmlPage(entryName);
    }
    addHtmlPage(entryName) {
        if (this.builtEntryNames.includes(entryName)) {
            return;
        }
        this.compiler.apply(base_1.getHtmlWebpackPluginInstance(this.mpkConfig, "index.html", entryName + ".html"));
    }
    hookupCompiler() {
        const { compiler, emitter, allEntries, builtEntryNames } = this;
        compiler.plugin("make", (compilation, done) => {
            let promise;
            const newEntryNames = this.entryTaskQueue.filter(n => !builtEntryNames.includes(n));
            if (newEntryNames.length > 0) {
                promise = Promise.all(newEntryNames.map(n => {
                    const e = allEntries.find(item => item.name === n);
                    return entry_1.addWebpackEntry(compilation, this["context"], e.name, e.path);
                })).then(() => { });
            }
            else {
                promise = Promise.resolve();
            }
            promise.then(done).catch(err => {
                emitter.emit("error", err);
            });
        });
        compiler.plugin("done", stats => {
            this.entryTaskQueue = [];
            emitter.emit("done");
        });
    }
    checkPrebuildEntries() {
        const { prebuildEntryNames, builtEntryNames } = this;
        const entries = prebuildEntryNames.filter(e => !builtEntryNames.includes(e));
        if (entries.length > 0) {
            gutil.log(`🛠️ Pre-Building entries: ${entries.join(" ")}`);
            entries.forEach(e => {
                this.entryStatus[e] = EntryTaskStatus.BUILDING;
                this.addEntryTask(e);
            });
            this.devMiddleware.invalidate();
            return new Promise((resolve, reject) => {
                this.emitter.once("done", () => {
                    this.builtEntryNames = []
                        .concat(this.builtEntryNames)
                        .concat(entries);
                    resolve();
                });
                this.emitter.once("error", err => {
                    reject(err);
                });
            });
        }
        else {
            return Promise.resolve({});
        }
    }
}
function start(config) {
    const entryStatus = {};
    build_1.default(config, function (compiler, webpackConfig, allEntries, prebuildEntries) {
        allEntries.forEach(e => {
            entryStatus[e.name] = EntryTaskStatus.UNBUILD;
        });
        prebuildEntries.forEach(e => {
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
        const taskManager = new EntryTaskManager(config, compiler, devMiddleware, allEntries, prebuildEntries.map(e => e.name));
        server.use((req, res, next) => {
            const urlObj = req._parsedUrl;
            if (urlObj.pathname.endsWith(".html")) {
                const entryName = urlObj.pathname.substring(1, urlObj.pathname.length - 5);
                taskManager
                    .execEntryTask(entryName)
                    .then(next)
                    .catch(err => log_1.default(err.toString()));
            }
            else {
                next();
            }
        });
        server.use(devMiddleware);
        server.use(hotMiddleware);
        server.locals.env = process.env.NODE_ENV;
        devMiddleware.waitUntilValid(() => {
            taskManager
                .checkPrebuildEntries()
                .then(() => {
                gutil.log(`Starting dev server on ${devServerOptions.host}:${devServerOptions.port}\r\n`);
            })
                .catch(e => {
                throw e;
            });
        });
        server.listen(devServerOptions.port, "0.0.0.0");
    });
}
exports.default = start;
