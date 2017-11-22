import * as path from "path";
import baseConf from "./base";

export default function getDevConfig(
    mpkConfig,
    output: { template: string; filename: string }
) {
    let devConfig: any = baseConf(mpkConfig, [output]);
    const entry = mpkConfig.webpack.entry;
    const devHost = mpkConfig.mpk.devHost;
    const devPort = mpkConfig.mpk.devPort;
    const wdsEntries = [
        `${mpkConfig.root}/node_modules/webpack-dev-server/client/index.js?${
            devHost.startsWith("http") ? devHost : "http://" + devHost
        }:${devPort}`,
        "webpack/hot/dev-server"
    ];
    if (Array.isArray(entry)) {
        devConfig.entry = wdsEntries.concat(entry);
    } else {
        devConfig.entry = {};
        Object.keys(entry).forEach(key => {
            const chunkEntry = entry[key];
            if (Array.isArray(chunkEntry)) {
                devConfig.entry[key] = wdsEntries.concat(chunkEntry);
            } else {
                devConfig.entry[key] = wdsEntries.concat([chunkEntry]);
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
        host: devHost,
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
        }
        // openPage: "index.html",
        // publicPath: "http://localhost:9001/"
    };

    return devConfig;
}
