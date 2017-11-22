import * as path from "path";
import baseConf from "./base";

export default function getDevConfig(
    mpkConfig,
    output: { template: string; filename: string }
) {
    let devConfig: any = baseConf(mpkConfig, [output]);
    devConfig.entry = mpkConfig.webpack.entry;
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
        host: "localhost",
        port: 9001,
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
        openPage: "index.html",
        publicPath: "http://localhost:9001/"
    };

    return devConfig;
}
