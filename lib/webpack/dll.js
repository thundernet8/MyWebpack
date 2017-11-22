"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const webpack = require("webpack");
const AssetsPlugin = require("assets-webpack-plugin");
const SimpleProgressWebpackPlugin = require("customized-progress-webpack-plugin");
const isDev = process.env.NODE_ENV !== "production";
function getDllConfig(rawConfig) {
    console.log(rawConfig.root);
    const getPlugins = function () {
        let plugins = [
            new webpack.DllPlugin({
                context: rawConfig.root,
                path: ".mpk/manifest.json",
                name: "[name]_[chunkhash:8]"
            }),
            new AssetsPlugin({
                filename: ".mpk/venders-config.json",
                path: "./"
            }),
            new webpack.HashedModuleIdsPlugin(),
            new SimpleProgressWebpackPlugin()
        ];
        if (!isDev) {
            plugins.push(new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                },
                sourceMap: true
            }));
        }
        return plugins;
    };
    let publicPath = isDev
        ? rawConfig.mpk.publicPath.dev
        : rawConfig.mpk.publicPath.prod;
    if (!publicPath.endsWith("/")) {
        publicPath += "/";
    }
    const config = Object.assign({}, rawConfig.webpack, {
        entry: {
            venders: Array.from(new Set(rawConfig.mpk.venders.concat("babel-polyfill")))
        },
        output: {
            path: path.resolve(rawConfig.root, rawConfig.mpk.distPath),
            publicPath,
            filename: "js/[name].[chunkhash:8].js",
            chunkFilename: "js/[name].[chunkhash:8].chunk.js",
            library: "[name]_[chunkhash:8]"
        },
        module: { rules: [] },
        plugins: getPlugins()
    });
    if (isDev && !config.devtool) {
        config.devtool = "#source-map";
    }
    return config;
}
exports.default = getDllConfig;
