import build from "./build";
// import * as WebpackDevServer from "webpack-dev-server";
import * as gutil from "gutil";
import * as express from "express";
import * as webpackDevMiddleware from "webpack-dev-middleware";
import * as webpackHotMiddleware from "webpack-hot-middleware";
import { IEntry, addWebpackEntry } from "../utils/entry";
import * as url from "url";
import { getHtmlWebpackPluginInstance } from "../webpack/base";
import log from "../utils/log";
import { EventEmitter } from "events";
import { Compiler } from "webpack";

enum EntryTaskStatus {
    BUILT,
    BUILDING,
    UNBUILD
}

class EntryTaskManager {
    private mpkConfig;
    private compiler: Compiler;
    private devMiddleware;
    private hotMiddleware;
    private allEntries: IEntry[] = [];
    private allEntryNames: string[] = [];
    private builtEntryNames: string[] = [];
    private entryTaskQueue: string[] = [];
    private emitter: EventEmitter = new EventEmitter();

    private htmlPageQueue: string[] = [];

    public constructor(
        mpkConfig,
        compiler: Compiler,
        devMiddleware,
        hotMiddleware,
        allEntries: IEntry[],
        builtEntryNames: string[]
    ) {
        this.mpkConfig = mpkConfig;
        this.compiler = compiler;
        this.devMiddleware = devMiddleware;
        this.hotMiddleware = hotMiddleware;
        this.allEntries = allEntries;
        this.allEntryNames = allEntries.map(e => e.name);
        this.builtEntryNames = builtEntryNames;
        this.hookupCompiler();
    }

    public execEntryTask(entryName: string): Promise<void> {
        if (
            !this.allEntryNames.includes(entryName) ||
            this.builtEntryNames.includes(entryName)
        ) {
            return Promise.resolve();
        }
        gutil.log(`🛠️ Building new entry: ${entryName}`);
        this.addEntryTask(entryName);

        //
        this.compiler.apply(
            getHtmlWebpackPluginInstance(
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

    private addEntryTask(entryName) {
        const { entryTaskQueue } = this;
        entryTaskQueue.push(entryName);
        this.entryTaskQueue = Array.from(new Set(entryTaskQueue));
    }

    private hookupCompiler() {
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
            log("make");
            let promise: Promise<any>;
            const newEntryNames = this.entryTaskQueue.filter(
                n => !builtEntryNames.includes(n)
            );
            log("task");
            log(this.entryTaskQueue.join("---"));
            log(typeof hotMiddleware);
            // force page reload when html-webpack-plugin template changes
            // compilation.plugin("html-webpack-plugin-after-emit", function(
            //     data,
            //     cb
            // ) {
            //     log("html-webpack-plugin-after-emit");
            //     hotMiddleware.publish({ action: "reload" });
            //     cb();
            // });

            if (newEntryNames.length > 0) {
                promise = Promise.all(
                    newEntryNames.map(n => {
                        const e = allEntries.find(item => item.name === n);
                        return addWebpackEntry(
                            compilation,
                            this["context"],
                            e.name,
                            e.path
                        ).then(() => e);
                    })
                ).then((entries: IEntry[]) => {
                    entries.forEach(e => {
                        //this.htmlPageQueue.push(e.name + ".html");
                    });
                    log(JSON.stringify(Object.keys(compilation.entries)));
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
            log("done");
            log(compiler["context"]);
            log("devMiddleware.invalidate");
            this.entryTaskQueue = [];
            log(this.htmlPageQueue.join("---"));
            if (this.htmlPageQueue.length > 0) {
                this.htmlPageQueue.forEach(page => {
                    compiler.apply(
                        getHtmlWebpackPluginInstance(
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

export default function start(config) {
    const entryStatus: { [entryName: string]: EntryTaskStatus } = {};

    build(config, function(
        compiler,
        webpackConfig,
        allEntries: IEntry[],
        entries: IEntry[]
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
            const urlObj: url.URL = req._parsedUrl;
            if (urlObj.pathname.endsWith(".html")) {
                const entryName = urlObj.pathname.substring(
                    1,
                    urlObj.pathname.length - 5
                );
                // if (
                //     !builtEntryNames.includes(entryName) &&
                //     allEntryNames.includes(entryName)
                // ) {
                //     gutil.log(`🛠️ Building new entry: ${entryName}`);
                //     // compiler.apply(
                //     //     getHtmlWebpackPluginInstance(
                //     //         config,
                //     //         "index.html",
                //     //         entry.name + ".html"
                //     //     )
                //     // );
                //     entryStatus[entryName] = EntryTaskStatus.UNBUILD;
                //     buildingEntryNames.push(entryName);
                //     devMiddleware.invalidate();
                //     // TODO next on callback of emitter
                // } else {
                //     next();
                // }
                taskManager
                    .execEntryTask(entryName)
                    .then(next)
                    .catch(err => log(err.toString()));
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
