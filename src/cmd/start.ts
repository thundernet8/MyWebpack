import * as express from "express";
import { EventEmitter } from "events";
import { Compiler } from "webpack";
import * as url from "url";
import * as webpackDevMiddleware from "webpack-dev-middleware";
import * as webpackHotMiddleware from "webpack-hot-middleware";
import { IEntry, addWebpackEntry } from "../utils/entry";
import { getHtmlWebpackPluginInstance } from "../webpack/base";
import log from "../utils/log";
import build from "./build";

enum EntryTaskStatus {
    BUILT,
    BUILDING,
    UNBUILD
}

class EntryTaskManager {
    private mpkConfig;
    private webpackConfig;
    private compiler: Compiler & { context: string };
    private devMiddleware;
    private allEntries: IEntry[] = [];
    private allEntryNames: string[] = [];
    private prebuildEntryNames: string[] = [];
    private builtEntryNames: string[] = [];
    private entryTaskQueue: string[] = [];
    private emitter: EventEmitter = new EventEmitter();
    private entryStatus: { [entryName: string]: EntryTaskStatus } = {};
    private prePackagesBuilt: boolean = false;

    public constructor(
        mpkConfig,
        webpackConfig,
        compiler: Compiler & { context: string },
        devMiddleware,
        allEntries: IEntry[],
        prebuildEntryNames: string[]
    ) {
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

    public execEntryTask(entryName: string): Promise<void> {
        if (
            !this.allEntryNames.includes(entryName) ||
            this.entryStatus[entryName] === EntryTaskStatus.BUILDING ||
            this.entryStatus[entryName] === EntryTaskStatus.BUILT
        ) {
            return Promise.resolve();
        }

        if (!this.builtEntryNames.includes(entryName)) {
            log.warning(
                `\r\n🛠️  Building new entry: ${entryName}
                    \r\n`
            );
            this.addHtmlPage(entryName);
        }
        this.addEntryTask(entryName);

        this.entryStatus[entryName] = EntryTaskStatus.BUILDING;
        this.devMiddleware.invalidate();

        return new Promise<void>((resolve, reject) => {
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

    private addEntryTask(entryName) {
        const { entryTaskQueue } = this;
        entryTaskQueue.push(entryName);
        this.entryTaskQueue = Array.from(new Set(entryTaskQueue));
    }

    private addHtmlPage(entryName) {
        const { publicPath, filename } = this.webpackConfig.output;
        this.compiler.apply(
            getHtmlWebpackPluginInstance(this.mpkConfig, {
                template: `${entryName}.html`,
                name: entryName,
                src: publicPath + filename.replace("[name]", entryName)
            })
        );
    }

    private toggleEntryStatus(entryName: string, status: EntryTaskStatus) {
        const { entryStatus } = this;
        entryStatus[entryName] = status;
        this.entryStatus = Object.assign({}, entryStatus);
    }

    private hookupCompiler() {
        const {
            // webpackConfig,
            compiler,
            emitter,
            allEntries,
            builtEntryNames
        } = this;
        // const { publicPath, filename } = webpackConfig.output;

        compiler.plugin("make", (compilation, done) => {
            let promise: Promise<any>;
            const newEntryNames = this.entryTaskQueue.filter(
                n => !builtEntryNames.includes(n)
            );

            if (newEntryNames.length > 0) {
                promise = Promise.all(
                    newEntryNames.map(n => {
                        const e = allEntries.find(item => item.name === n);
                        const { mpk } = this.mpkConfig;
                        const { devHost, devPort, prePackages } = mpk;
                        const hmrEntry = [
                            `webpack-hot-middleware/client?path=${
                                devHost.startsWith("http")
                                    ? devHost
                                    : "http://" + devHost
                            }:${devPort}/__webpack_hmr&overlay=false`,
                            ...prePackages
                        ];
                        hmrEntry.push(e.path);
                        return addWebpackEntry(
                            compilation,
                            compiler.context,
                            e.name,
                            hmrEntry
                        );
                    })
                ).then(() => {});
            } else {
                promise = Promise.resolve();
            }
            promise.then(done).catch(err => {
                emitter.emit("error", err);
            });
        });

        compiler.plugin("done", stats => {
            this.entryTaskQueue = [];
            emitter.emit("done");
            if (this.prePackagesBuilt) {
                log.success("\r\n🎉   Building successfully.");
            }
        });
    }

    public checkPrebuildEntries() {
        const { prebuildEntryNames, builtEntryNames } = this;
        const entries = prebuildEntryNames.filter(
            e => !builtEntryNames.includes(e)
        );
        if (entries.length > 0) {
            log.warning(
                `\r\n🛠️  Pre-Building entries: ${entries.join(" ")}\r\n`
            );
            entries.forEach(e => {
                this.toggleEntryStatus(e, EntryTaskStatus.BUILDING);
                this.addEntryTask(e);
                this.addHtmlPage(e);
            });

            this.devMiddleware.invalidate();

            return new Promise<void>((resolve, reject) => {
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
        } else {
            return Promise.resolve();
        }
    }
}

export default function start(config) {
    return build(config).then(result => {
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

        const taskManager = new EntryTaskManager(
            config,
            webpackConfig,
            compiler,
            devMiddleware,
            allEntries,
            prebuildEntries.map(e => e.name)
        );

        server.use((req, res, next) => {
            const urlObj: url.URL = req._parsedUrl;
            if (urlObj.pathname.endsWith(".html")) {
                const entryName = urlObj.pathname.substring(
                    1,
                    urlObj.pathname.length - 5
                );

                taskManager
                    .execEntryTask(entryName)
                    // .then(() => {
                    //     hotMiddleware.publish({ action: "reload" });
                    // })
                    .then(next)
                    .catch(err => log.error(err.message || err.toString()));
            } else {
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
                    log.success(
                        `\r\n📡  Starting dev server on ${
                            devServerOptions.host
                        }:${devServerOptions.port}
                            \r\n`
                    );
                })
                .catch(e => {
                    throw e;
                });
        });

        server.listen(devServerOptions.port, "0.0.0.0");
    });
}
