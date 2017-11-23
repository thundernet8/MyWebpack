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

export default function start(config) {
    let allEntries: IEntry[];
    let builtEntries: IEntry[];
    let buildingEntries: IEntry[] = [];

    build(config, function(
        compiler,
        webpackConfig,
        _allEntries: IEntry[],
        entries: IEntry[]
    ) {
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

        // force page reload when html-webpack-plugin template changes
        compiler.plugin("compilation", function(compilation) {
            compilation.plugin("html-webpack-plugin-after-emit", function(
                data,
                cb
            ) {
                console.log("html-webpack-plugin-after-emit");
                log("html-webpack-plugin-after-emit");
                hotMiddleware.publish({ action: "reload" });
                cb();
            });
        });

        compiler.plugin("make", function addEntry(compilation, done) {
            console.log("make");
            log("make");
            let promise: Promise<any>;
            if (buildingEntries.length) {
                promise = Promise.all(
                    buildingEntries.map(e => {
                        return addWebpackEntry(
                            compilation,
                            this["context"],
                            e.name,
                            e.path
                        );
                    })
                );
            } else {
                promise = Promise.resolve();
            }
            promise.then(done).catch(done);
        });
        compiler.plugin("done", function emitWebpackDone() {
            console.log("done");
            log("done");
            log(compiler["context"]);
            log("devMiddleware.invalidate");
            devMiddleware.invalidate();
        });

        server.use((req, res, next) => {
            const urlObj: url.URL = req._parsedUrl;
            if (urlObj.pathname.endsWith(".html")) {
                const entryName = urlObj.pathname.substring(
                    1,
                    urlObj.pathname.length - 5
                );
                if (
                    builtEntries.findIndex(e => e.name === entryName) < 0 &&
                    allEntries.findIndex(e => e.name === entryName) >= 0
                ) {
                    gutil.log(`> Building new entry: ${entryName}`);
                    const entry = allEntries.find(e => e.name === entryName);
                    compiler.apply(
                        getHtmlWebpackPluginInstance(
                            config,
                            "index.html",
                            entry.name + ".html"
                        )
                    );
                    buildingEntries.push(entry);
                    // devMiddleware.invalidate();
                    // TODO next on callback of emitter
                }
            }

            next();
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
