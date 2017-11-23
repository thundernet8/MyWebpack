"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const build_1 = require("./build");
const gutil = require("gutil");
const express = require("express");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
function start(config) {
    build_1.default(config, function (compiler, webpackConfig) {
        const devServerOptions = Object.assign({}, webpackConfig.devServer, {
            before: function (app) {
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
        compiler.plugin("compilation", function (compilation) {
            compilation.plugin("html-webpack-plugin-after-emit", function (data, cb) {
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
            gutil.log(`Starting dev server on ${devServerOptions.host}:${devServerOptions.port}\r\n`);
        });
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
