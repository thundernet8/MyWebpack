"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const base_1 = require("./base");
function getDevConfig(mpkConfig) {
    let devConfig = base_1.default(mpkConfig);
    devConfig.entry = mpkConfig.webpack.entry;
    devConfig.output = {
        path: path.resolve(mpkConfig.root, mpkConfig.mpk.distPath),
        publicPath: mpkConfig.mpk.publicPath.dev,
        filename: "js/[name].js",
        chunkFilename: "js/[name].chunk.js"
    };
    devConfig.devtool = "#source-map";
    devConfig.devServer = {
        contentBase: path.resolve(mpkConfig.root, mpkConfig.mpk.distPath),
        compress: true,
        host: "localhost",
        port: 9001,
        hot: true,
        open: true,
        historyApiFallback: {
            index: "index.html"
        }
    };
    return devConfig;
}
exports.default = getDevConfig;
