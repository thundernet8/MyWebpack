import * as path from "path";
import * as webpack from "webpack";
const AssetsPlugin = require("assets-webpack-plugin");
const WebpackStableChunkId = require("webpackstablechunkid");

const isDev = process.env.NODE_ENV !== "production";

export default function getDllConfig(rawConfig) {
    const getPlugins = function() {
        let plugins = [
            new webpack.DllPlugin({
                context: rawConfig.root,
                path: ".mpk/manifest.json",
                name: "[name]_[chunkhash:8]"
            }),
            new AssetsPlugin({
                filename: ".mpk/venders-config.json",
                path: "./"
            })
        ];

        if (!isDev) {
            plugins = plugins.concat([
                new WebpackStableChunkId(),
                new webpack.HashedModuleIdsPlugin(),
                new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false
                    },
                    sourceMap: true
                })
            ]);
        }
        return plugins;
    };

    let publicPath: string = isDev
        ? rawConfig.mpk.publicPath.dev
        : rawConfig.mpk.publicPath.prod;
    if (!publicPath.endsWith("/")) {
        publicPath += "/";
    }

    const entry = Array.isArray(rawConfig.mpk.venders)
        ? {
              venders: Array.from(
                  new Set(rawConfig.mpk.venders.concat("babel-polyfill"))
              )
          }
        : rawConfig.mpk.venders;

    const config = Object.assign({}, rawConfig.webpack, {
        entry,
        output: {
            path: path.resolve(rawConfig.root, rawConfig.mpk.distPath),
            publicPath,
            filename: isDev ? "js/[name].js" : "js/[name].[chunkhash:8].js",
            chunkFilename: isDev
                ? "js/[name].chunk.js"
                : "js/[name].[chunkhash:8].chunk.js",
            library: isDev ? "[name]" : "[name]_[chunkhash:8]"
        },
        module: { rules: [] },
        plugins: getPlugins()
    });

    if (isDev && !config.devtool) {
        config.devtool = "#source-map"; // '#eval-source-map'
    }

    return config;
}
