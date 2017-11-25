import * as path from "path";
import baseConf from "./base";

export default function getDevConfig(mpkConfig) {
    let devConfig: any = baseConf(mpkConfig);
    const { devHost, devPort, prePackages } = mpkConfig.mpk;
    const { entry } = mpkConfig.webpack;
    const hmrEntry = [
        `webpack-hot-middleware/client?path=${
            devHost.startsWith("http") ? devHost : "http://" + devHost
        }:${devPort}/__webpack_hmr&overlay=false`,
        ...prePackages
    ];

    if (Array.isArray(entry)) {
        devConfig.entry = Array.from(new Set(hmrEntry.concat(entry)));
    } else {
        devConfig.entry = {};
        Object.keys(entry).forEach(key => {
            const chunkEntry = entry[key];
            if (Array.isArray(chunkEntry)) {
                devConfig.entry[key] = Array.from(
                    new Set(hmrEntry.concat(chunkEntry))
                );
            } else {
                devConfig.entry[key] = Array.from(
                    new Set(hmrEntry.concat(chunkEntry))
                );
            }
        });
    }

    devConfig.output = {
        path: path.resolve(mpkConfig.root, mpkConfig.mpk.distPath),
        publicPath: mpkConfig.mpk.publicPath.dev,
        filename: "js/[name].js",
        chunkFilename: "js/[name].chunk.js"
    };

    devConfig.devtool = "#source-map"; // '#eval-source-map'
    devConfig.devServer = {
        contentBase: path.resolve(mpkConfig.root, mpkConfig.mpk.distPath),
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
            chunks: false, // Makes the build much quieter
            chunkModules: false,
            modules: false,
            children: true,
            errorDetails: true,
            colors: true
        },
        headers: {
            "X-Pack-With": "MPK"
        }
        // openPage: "index.html",
        // publicPath: "http://localhost:9001/"
    };

    return devConfig;
}
