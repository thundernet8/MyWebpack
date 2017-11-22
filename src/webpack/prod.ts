import * as path from "path";
import baseConf from "./base";

export default function getProdConfig(mpkConfig) {
    let prodConfig: any = baseConf(mpkConfig);
    prodConfig.entry = mpkConfig.webpack.entry;
    prodConfig.output = {
        path: path.resolve(mpkConfig.root, mpkConfig.mpk.distPath),
        publicPath: mpkConfig.mpk.publicPath.prod,
        filename: "js/[name].[chunkhash:8].js",
        chunkFilename: "js/[name].[chunkhash:8].chunk.js"
    };

    Object.keys(mpkConfig.webpack).forEach(key => {
        if (
            ![
                "entry",
                "output",
                "module",
                "plugins",
                "node",
                "resolve"
            ].includes(key)
        ) {
            prodConfig[key] = mpkConfig.webpack[key];
        }
    });

    return prodConfig;
}
