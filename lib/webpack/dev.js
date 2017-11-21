"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const webpack = require("webpack");
const base_1 = require("./base");
function getDevConfig(config) {
    const plugins = [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("development")
            }
        }),
        new webpack.HotModuleReplacementPlugin()
    ];
    const loaders = [
        {
            test: /\.css$/,
            include: [/global/, /node_modules/],
            loader: "style-loader!css-loader?sourceMap!postcss-loader"
        },
        {
            test: /\.css$/,
            exclude: [/global/, /node_modules/],
            loader: "style-loader!css-loader?modules&sourceMap&importLoaders=1&localIdentName=[local]_[name]__[hash:base64:5]!postcss-loader"
        },
        {
            test: /\.less$/,
            include: [/global/, /node_modules/],
            loader: "style-loader!css-loader?sourceMap!postcss-loader!less-loader"
        },
        {
            test: /\.less$/,
            exclude: [/global/, /node_modules/],
            loader: "style-loader!css-loader?modules&sourceMap&importLoaders=1&localIdentName=[local]_[name]__[hash:base64:5]!postcss-loader!less-loader"
        }
    ];
    let devConfig = base_1.default(plugins, loaders, config.root);
    devConfig.entry = config.webpack.entry;
    devConfig.output = {
        path: path.resolve(config.root, config.mpk.distPath),
        publicPath: config.mpk.publicPath.dev,
        filename: "js/[name].js",
        chunkFilename: "js/[name].chunk.js"
    };
    devConfig.devtool = "#source-map";
    devConfig.devServer = {
        contentBase: path.resolve(config.root, config.mpk.distPath),
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
