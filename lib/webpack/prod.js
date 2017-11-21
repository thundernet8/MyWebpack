"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const webpack = require("webpack");
const base_1 = require("./base");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
function getProdConfig(config) {
    const plugins = [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production")
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false },
            sourceMap: true
        }),
        new ExtractTextPlugin({
            filename: `css/${config.mpk.styleName}.[contenthash:8].css`,
            disable: false,
            allChunks: true
        }),
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.css$/g,
            cssProcessor: require("cssnano"),
            cssProcessorOptions: { discardComments: { removeAll: true } },
            canPrint: true
        })
    ];
    const loaders = [
        {
            test: /\.css$/,
            include: [/global/, /node_modules/],
            loader: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: "css-loader?sourceMap!postcss-loader"
            })
        },
        {
            test: /\.css$/,
            exclude: [/global/, /node_modules/],
            loader: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: "css-loader?modules&sourceMap&importLoaders=1&localIdentName=__[hash:base64:5]!postcss-loader"
            })
        },
        {
            test: /\.less$/,
            include: [/global/, /node_modules/],
            loader: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: "css-loader?sourceMap!postcss-loader!less-loader"
            })
        },
        {
            test: /\.less$/,
            exclude: [/global/, /node_modules/],
            loader: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: "css-loader?modules&sourceMap&importLoaders=1&localIdentName=__[hash:base64:5]!postcss-loader!less-loader"
            })
        }
    ];
    let prodConfig = base_1.default(plugins, loaders, config.root);
    prodConfig.entry = config.webpack.entry;
    prodConfig.output = {
        path: path.resolve(config.root, config.mpk.distPath),
        publicPath: config.mpk.publicPath.prod,
        filename: "js/[name].[chunkhash:8].js",
        chunkFilename: "js/[name].[chunkhash:8].chunk.js"
    };
    return prodConfig;
}
exports.default = getProdConfig;
