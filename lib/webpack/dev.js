"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const base_1 = require("./base");
function getDevConfig(rawConfig) {
    let devConfig = base_1.default(rawConfig);
    const { devHost, devPort, prePackages } = rawConfig.mpk;
    const { entry } = rawConfig.webpack;
    const hmrEntry = [
        `webpack-hot-middleware/client?path=${devHost.startsWith("http") ? devHost : "http://" + devHost}:${devPort}/__webpack_hmr&overlay=false`,
        ...prePackages
    ];
    if (Array.isArray(entry)) {
        devConfig.entry = Array.from(new Set(hmrEntry.concat(entry)));
    }
    else {
        devConfig.entry = {};
        Object.keys(entry).forEach(key => {
            const chunkEntry = entry[key];
            if (Array.isArray(chunkEntry)) {
                devConfig.entry[key] = Array.from(new Set(hmrEntry.concat(chunkEntry)));
            }
            else {
                devConfig.entry[key] = Array.from(new Set(hmrEntry.concat(chunkEntry)));
            }
        });
    }
    devConfig.output = {
        path: path.resolve(rawConfig.root, rawConfig.mpk.distPath),
        publicPath: rawConfig.mpk.publicPath.dev,
        filename: "js/[name].js",
        chunkFilename: "js/[name].chunk.js"
    };
    devConfig.devtool = "#source-map";
    devConfig.devServer = {
        contentBase: path.resolve(rawConfig.root, rawConfig.mpk.distPath),
        compress: true,
        host: devHost.startsWith("http") ? devHost : "http://" + devHost,
        port: devPort,
        inline: true,
        hot: true,
        open: true,
        historyApiFallback: {
            index: "index.html"
        },
        stats: {
            timings: false,
            assets: true,
            chunks: false,
            chunkModules: false,
            modules: false,
            children: true,
            errorDetails: true,
            colors: true
        },
        headers: {
            "X-Pack-With": "MPK"
        }
    };
    return devConfig;
}
exports.default = getDevConfig;
