"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const build_1 = require("./build");
const gutil = require("gutil");
const express = require("express");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const entry_1 = require("../utils/entry");
const base_1 = require("../webpack/base");
const events_1 = require("events");
const colors = require("colors");
var EntryTaskStatus;
(function (EntryTaskStatus) {
    EntryTaskStatus[EntryTaskStatus["BUILT"] = 0] = "BUILT";
    EntryTaskStatus[EntryTaskStatus["BUILDING"] = 1] = "BUILDING";
    EntryTaskStatus[EntryTaskStatus["UNBUILD"] = 2] = "UNBUILD";
})(EntryTaskStatus || (EntryTaskStatus = {}));
class EntryTaskManager {
    constructor(mpkConfig, webpackConfig, compiler, devMiddleware, allEntries, prebuildEntryNames) {
        this.allEntries = [];
        this.allEntryNames = [];
        this.prebuildEntryNames = [];
        this.builtEntryNames = [];
        this.entryTaskQueue = [];
        this.emitter = new events_1.EventEmitter();
        this.entryStatus = {};
        this.prePackagesBuilt = false;
        this.mpkConfig = mpkConfig;
        this.webpackConfig = webpackConfig;
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
        if (!this.builtEntryNames.includes(entryName)) {
            gutil.log("\r\n🛠️  " +
                colors.yellow(`Building new entry: ${entryName}`) +
                "\r\n");
            this.addHtmlPage(entryName);
        }
        this.addEntryTask(entryName);
        this.entryStatus[entryName] = EntryTaskStatus.BUILDING;
        this.devMiddleware.invalidate();
        return new Promise((resolve, reject) => {
            this.emitter.once("done", () => {
                this.builtEntryNames.push(entryName);
                this.toggleEntryStatus(entryName, EntryTaskStatus.BUILT);
                resolve();
            });
            this.emitter.once("error", err => {
                this.toggleEntryStatus(entryName, EntryTaskStatus.UNBUILD);
                reject(err);
            });
        });
    }
    addEntryTask(entryName) {
        const { entryTaskQueue } = this;
        entryTaskQueue.push(entryName);
        this.entryTaskQueue = Array.from(new Set(entryTaskQueue));
    }
    addHtmlPage(entryName) {
        const { publicPath, filename } = this.webpackConfig.output;
        this.compiler.apply(base_1.getHtmlWebpackPluginInstance(this.mpkConfig, {
            template: "index.html",
            name: entryName,
            src: publicPath + filename.replace("[name]", entryName)
        }));
    }
    toggleEntryStatus(entryName, status) {
        const { entryStatus } = this;
        entryStatus[entryName] = status;
        this.entryStatus = Object.assign({}, entryStatus);
    }
    hookupCompiler() {
        const { compiler, emitter, allEntries, builtEntryNames } = this;
        compiler.plugin("make", (compilation, done) => {
            let promise;
            const newEntryNames = this.entryTaskQueue.filter(n => !builtEntryNames.includes(n));
            if (newEntryNames.length > 0) {
                promise = Promise.all(newEntryNames.map(n => {
                    const e = allEntries.find(item => item.name === n);
                    const { mpk } = this.mpkConfig;
                    const { devHost, devPort, prePackages } = mpk;
                    const hmrEntry = [
                        `webpack-hot-middleware/client?path=${devHost.startsWith("http")
                            ? devHost
                            : "http://" + devHost}:${devPort}/__webpack_hmr&overlay=false`,
                        ...prePackages
                    ];
                    hmrEntry.push(e.path);
                    return entry_1.addWebpackEntry(compilation, this["context"], e.name, hmrEntry);
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
            this.prePackagesBuilt &&
                gutil.log("\r\n🎉   " + colors.green(`Building successfully.`));
        });
    }
    checkPrebuildEntries() {
        const { prebuildEntryNames, builtEntryNames } = this;
        const entries = prebuildEntryNames.filter(e => !builtEntryNames.includes(e));
        if (entries.length > 0) {
            gutil.log("\r\n🛠️  " +
                colors.yellow(`Pre-Building entries: ${entries.join(" ")}`) +
                "\r\n");
            entries.forEach(e => {
                this.toggleEntryStatus(e, EntryTaskStatus.BUILDING);
                this.addEntryTask(e);
                this.addHtmlPage(e);
            });
            this.devMiddleware.invalidate();
            return new Promise((resolve, reject) => {
                this.emitter.once("done", () => {
                    this.builtEntryNames = []
                        .concat(this.builtEntryNames)
                        .concat(entries);
                    this.prePackagesBuilt = true;
                    entries.forEach(e => {
                        this.toggleEntryStatus(e, EntryTaskStatus.BUILT);
                        this.addEntryTask(e);
                    });
                    resolve();
                });
                this.emitter.once("error", err => {
                    entries.forEach(e => {
                        this.toggleEntryStatus(e, EntryTaskStatus.UNBUILD);
                        this.addEntryTask(e);
                    });
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
    return build_1.default(config).then(result => {
        const { compiler, webpackConfig, allEntries } = result;
        const prebuildEntries = result.entries;
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
        const taskManager = new EntryTaskManager(config, webpackConfig, compiler, devMiddleware, allEntries, prebuildEntries.map(e => e.name));
        server.use((req, res, next) => {
            const urlObj = req._parsedUrl;
            if (urlObj.pathname.endsWith(".html")) {
                const entryName = urlObj.pathname.substring(1, urlObj.pathname.length - 5);
                taskManager
                    .execEntryTask(entryName)
                    .then(next)
                    .catch(err => gutil.log(err.toString()));
            }
            else {
                next();
            }
        });
        server.use(devMiddleware);
        server.use(hotMiddleware);
        server.use("/", express.static(config.mpk.distPath));
        server.locals.env = process.env.NODE_ENV;
        devMiddleware.waitUntilValid(() => {
            taskManager
                .checkPrebuildEntries()
                .then(() => {
                gutil.log("\r\n📡  " +
                    colors.green(`Starting dev server on ${devServerOptions.host}:${devServerOptions.port}`) +
                    "\r\n");
            })
                .catch(e => {
                throw e;
            });
        });
        server.listen(devServerOptions.port, "0.0.0.0");
    });
}
exports.default = start;
