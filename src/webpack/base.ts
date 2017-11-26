import * as path from "path";
import * as webpack from "webpack";
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
    .BundleAnalyzerPlugin;
const WebpackStableChunkId = require("webpackstablechunkid");

export interface IEntryInfo {
    template: string;
    name: string;
    src?: string;
}

const isDev = process.env.NODE_ENV !== "production";

export function getHtmlWebpackPluginInstance(mpkConfig, entry: IEntryInfo) {
    const vendersConfig = require(path.resolve(
        mpkConfig.root,
        ".mpk/venders-config.json"
    ));

    const venders = Object.keys(vendersConfig).map(
        key => vendersConfig[key].js
    );

    const { htmlInjects } = mpkConfig.mpk;

    return new HtmlWebpackPlugin(
        Object.assign({}, htmlInjects, {
            title: entry.name,
            filename: path.resolve(
                mpkConfig.mpk.distPath,
                entry.name + ".html"
            ),
            template: path.resolve(
                mpkConfig.root,
                mpkConfig.mpk.template,
                entry.template
            ),
            inject: !isDev,
            cache: true,
            scripts: isDev ? venders.concat([entry.src]) : venders
        })
    );
}

export default function(
    mpkConfig
    // outputs?: { template: string; filename: string }[]
) {
    // outputs = outputs || [{ template: "index.html", filename: "index.html" }];

    const getPlugins = function() {
        let plugins = [
            new webpack.DefinePlugin({
                "process.env": {
                    NODE_ENV: isDev
                        ? JSON.stringify("development")
                        : JSON.stringify("production")
                }
            }),
            // new SimpleProgressWebpackPlugin(),
            new webpack.DllReferencePlugin({
                context: __dirname,
                manifest: require(path.resolve(
                    mpkConfig.root,
                    ".mpk/manifest.json"
                ))
            })

            // new webpack.optimize.CommonsChunkPlugin({
            //     name: "app"
            // }),
        ];

        const { initEntries } = mpkConfig.mpk;
        if (!isDev && Array.isArray(initEntries) && initEntries.length > 0) {
            initEntries.forEach(e => {
                const entryName = e.split(".")[0];
                plugins.push(
                    getHtmlWebpackPluginInstance(mpkConfig, {
                        template: "index.html",
                        name: entryName
                    })
                );
            });
        }

        if (isDev) {
            plugins = plugins.concat([
                new webpack.NamedModulesPlugin(),
                new webpack.HotModuleReplacementPlugin()
            ]);
        } else {
            plugins = plugins.concat([
                new webpack.HashedModuleIdsPlugin(),
                new webpack.optimize.UglifyJsPlugin({
                    compress: { warnings: false },
                    sourceMap: true
                }),
                new ExtractTextPlugin({
                    filename: `css/${
                        mpkConfig.mpk.styleName
                    }.[contenthash:8].css`,
                    disable: false,
                    allChunks: true
                }),
                new OptimizeCssAssetsPlugin({
                    assetNameRegExp: /\.css$/g,
                    cssProcessor: require("cssnano"), // eslint-disable-line global-require
                    cssProcessorOptions: {
                        discardComments: { removeAll: true }
                    },
                    canPrint: true
                }),
                new WebpackStableChunkId()
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

    const getRules = function() {
        let rules: any[] = [
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
                    test: /\.jsx?$/,
                    loader: "react-hot-loader/webpack!babel-loader",
                    exclude: /node_modules/
                },
                {
                    test: /\.tsx?$/,
                    loader: "react-hot-loader/webpack!babel-loader!ts-loader",
                    exclude: /node_modules/
                },
                {
                    test: /\.css$/,
                    include: [/global/, /node_modules/],
                    loader: "style-loader!css-loader?sourceMap"
                },
                {
                    test: /\.css$/,
                    exclude: [/global/, /node_modules/],
                    loader:
                        "style-loader!css-loader?modules&sourceMap&importLoaders=1&localIdentName=[local]_[name]__[hash:base64:5]"
                },
                {
                    test: /\.less$/,
                    include: [/global/, /node_modules/],
                    loader: "style-loader!css-loader?sourceMap!less-loader"
                },
                {
                    test: /\.less$/,
                    exclude: [/global/, /node_modules/],
                    loader:
                        "style-loader!css-loader?modules&sourceMap&importLoaders=1&localIdentName=[local]_[name]__[hash:base64:5]!less-loader"
                }
            ]);
        } else {
            rules = rules.concat([
                {
                    test: /\.jsx?$/,
                    loader:
                        "babel-loader?presets[]=es2015&presets[]=react&presets[]=stage-2",
                    exclude: /node_modules/
                },
                {
                    test: /\.tsx?$/,
                    loader:
                        "babel-loader?presets[]=es2015&presets[]=react&presets[]=stage-2!ts-loader",
                    exclude: /node_modules/
                },
                {
                    test: /\.css$/,
                    include: [/global/, /node_modules/],
                    loader: ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use: "css-loader?sourceMap"
                    })
                },
                {
                    test: /\.css$/,
                    exclude: [/global/, /node_modules/],
                    loader: ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use:
                            "css-loader?modules&sourceMap&importLoaders=1&localIdentName=__[hash:base64:5]"
                    })
                },
                {
                    test: /\.less$/,
                    include: [/global/, /node_modules/],
                    loader: ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use: "css-loader?sourceMap!less-loader"
                    })
                },
                {
                    test: /\.less$/,
                    exclude: [/global/, /node_modules/],
                    loader: ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use:
                            "css-loader?modules&sourceMap&importLoaders=1&localIdentName=__[hash:base64:5]!less-loader"
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
