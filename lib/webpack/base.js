"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const webpack = require("webpack");
const SimpleProgressWebpackPlugin = require("customized-progress-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
    .BundleAnalyzerPlugin;
function default_1(morePlugins, moreRules, root) {
    const getPlugins = function (morePlugins) {
        let plugins = [
            new webpack.HashedModuleIdsPlugin(),
            new SimpleProgressWebpackPlugin(),
            new webpack.DllReferencePlugin({
                context: __dirname,
                manifest: require(path.resolve(root, ".mpk/manifest.json"))
            })
        ];
        if (!!process.env.ANALYZE_ENV) {
            plugins.push(new BundleAnalyzerPlugin());
        }
        if (morePlugins) {
            plugins = plugins.concat(morePlugins);
        }
        return plugins;
    };
    const getRules = function (moreRules) {
        let rules = [
            {
                test: /\.jsx?$/,
                loader: "babel-loader",
                exclude: /node_modules/
            },
            {
                test: /\.tsx?$/,
                loader: "babel-loader!ts-loader",
                exclude: /node_modules/
            },
            {
                test: /\.json$/,
                loader: "json-loader",
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|gif)$/,
                exclude: /node_modules/,
                loader: "url-loader",
                query: {
                    limit: 2000,
                    name: "img/[name].[ext]"
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf|svg)/,
                exclude: /node_modules/,
                loader: "url-loader",
                query: {
                    limit: 10000,
                    name: "fonts/[name].[ext]"
                }
            }
        ];
        if (moreRules) {
            rules = rules.concat(moreRules);
        }
        return rules;
    };
    let config = {
        node: {
            __filename: false,
            __dirname: false
        },
        resolve: {
            extensions: [
                ".json",
                ".js",
                ".jsx",
                ".ts",
                ".tsx",
                ".css",
                ".less",
                ".scss"
            ]
        },
        target: "web",
        module: {
            rules: getRules(moreRules)
        },
        plugins: getPlugins(morePlugins)
    };
    return config;
}
exports.default = default_1;
