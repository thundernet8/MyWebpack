"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const build_1 = require("./build");
const WebpackDevServer = require("webpack-dev-server");
const gutil = require("gutil");
function start(config) {
    build_1.default(config, function (compiler, webpackConfig) {
        const devServerOptions = Object.assign({}, webpackConfig.devServer, {
            before: function (app) {
                app.use((req, res, next) => {
                    next();
                });
            }
        });
        const server = new WebpackDevServer(compiler, devServerOptions);
        server.listen(devServerOptions.port, devServerOptions.host, function () {
            gutil.log(`Starting dev server on ${devServerOptions.host}:${devServerOptions.port}`);
        });
    });
}
exports.default = start;
