"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const SimpleProgressWebpackPlugin = require("customized-progress-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
    .BundleAnalyzerPlugin;
const WebpackStableChunkId = require("webpackstablechunkid");
const isDev = process.env.NODE_ENV !== "production";
function default_1(mpkConfig, outputs) {
    outputs = outputs || [{ template: "index.html", filename: "index.html" }];
    const getPlugins = function () {
        const vendersConfig = require(path.resolve(mpkConfig.root, ".mpk/venders-config.json"));
        const venders = Object.keys(vendersConfig).map(key => vendersConfig[key].js.substr(1));
        let plugins = [
            new webpack.DefinePlugin({
                "process.env": {
                    NODE_ENV: isDev
                        ? JSON.stringify("development")
                        : JSON.stringify("production")
                }
            }),
            new webpack.HashedModuleIdsPlugin(),
            new SimpleProgressWebpackPlugin(),
            new webpack.DllReferencePlugin({
                context: __dirname,
                manifest: require(path.resolve(mpkConfig.root, ".mpk/manifest.json"))
            }),
            new WebpackStableChunkId()
        ];
        outputs.forEach(output => {
            plugins.push(new HtmlWebpackPlugin({
                filename: path.resolve(mpkConfig.mpk.distPath, output.filename),
                template: path.resolve(mpkConfig.root, mpkConfig.mpk.template, output.template),
                inject: true,
                venders,
                meta: "",
                htmlDom: "",
                state: ""
            }));
        });
        if (isDev) {
            plugins = plugins.concat([
                new webpack.HotModuleReplacementPlugin()
            ]);
        }
        else {
            plugins = plugins.concat([
                new webpack.optimize.UglifyJsPlugin({
                    compress: { warnings: false },
                    sourceMap: true
                }),
                new ExtractTextPlugin({
                    filename: `css/${mpkConfig.mpk.styleName}.[contenthash:8].css`,
                    disable: false,
                    allChunks: true
                }),
                new OptimizeCssAssetsPlugin({
                    assetNameRegExp: /\.css$/g,
                    cssProcessor: require("cssnano"),
                    cssProcessorOptions: {
                        discardComments: { removeAll: true }
                    },
                    canPrint: true
                })
            ]);
        }
        if (!!process.env.ANALYZE_ENV) {
            plugins.push(new BundleAnalyzerPlugin());
        }
        if (mpkConfig.webpack.plugins) {
            plugins = plugins.concat(mpkConfig.webpack.plugins);
        }
        return plugins;
    };
    const getRules = function () {
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
        if (isDev) {
            rules = rules.concat([
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
            ]);
        }
        else {
            rules = rules.concat([
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
            ]);
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
            rules: getRules()
        },
        plugins: getPlugins()
    };
    return config;
}
exports.default = default_1;
