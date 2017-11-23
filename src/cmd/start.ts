import build from "./build";
// import * as WebpackDevServer from "webpack-dev-server";
import * as gutil from "gutil";
import * as express from "express";
import * as webpackDevMiddleware from "webpack-dev-middleware";
import * as webpackHotMiddleware from "webpack-hot-middleware";
import scanEntries from "../utils/entry";
import * as path from "path";

export default function start(config) {
    const { root, mpk } = config;
    const { entryRoot, initEntries } = mpk;

    if (!entryRoot) {
        throw new Error("Entries folder is not defined in config");
    }

    const entries = scanEntries(path.resolve(root, entryRoot)).filter(
        entry =>
            initEntries.includes(entry.name) ||
            initEntries.some(item => item.split(".")[0] === entry.name)
    );

    if (!entries || Object.keys(entries).length < 1) {
        throw new Error("Should add at least initial entry");
    }

    config.webpack.entry = entries.reduce((prev, curr) => {
        prev[curr.name] = curr.path;
        return prev;
    }, {});

    build(config, function(compiler, webpackConfig) {
        const devServerOptions = Object.assign({}, webpackConfig.devServer, {
            before: function(app) {
                app.use((req, res, next) => {
                    console.log(`Using middleware for ${req.url}`);
                    next();
                });
            }
        });

        const server = express();
        const devMiddleware = webpackDevMiddleware(compiler, {
            publicPath: webpackConfig.output.publicPath,
            noInfo: true,
            quiet: true,
            headers: Object.assign({}, devServerOptions.headers || {}, {
                "Access-Control-Allow-Origin": "*"
            })
        });
        const hotMiddleware = webpackHotMiddleware(compiler, {
            log: () => {
                gutil.log("hot middleware");
            }
        });

        // force page reload when html-webpack-plugin template changes
        compiler.plugin("compilation", function(compilation) {
            compilation.plugin("html-webpack-plugin-after-emit", function(
                data,
                cb
            ) {
                hotMiddleware.publish({ action: "reload" });
                cb();
            });
        });

        server.use((req, res, next) => {
            console.log(req.url);
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
