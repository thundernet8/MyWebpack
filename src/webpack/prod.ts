import * as path from "path";
import baseConf from "./base";
import HtmlAssetsWebpackPlugin from "../utils/htmlAssetsWebpackPlugin";

export default function getProdConfig(mpkConfig) {
    let prodConfig: any = baseConf(mpkConfig);
    const { preEntries } = mpkConfig.mpk;
    const { entry } = mpkConfig.webpack;

    if (Array.isArray(entry)) {
        prodConfig.entry = Array.from(new Set(preEntries.concat(entry)));
    } else {
        prodConfig.entry = {};
        Object.keys(entry).forEach(key => {
            const chunkEntry = entry[key];
            if (Array.isArray(chunkEntry)) {
                prodConfig.entry[key] = Array.from(
                    new Set(preEntries.concat(chunkEntry))
                );
            } else {
                prodConfig.entry[key] = Array.from(
                    new Set(preEntries.concat(chunkEntry))
                );
            }
        });
    }

    prodConfig.entry = mpkConfig.webpack.entry;
    prodConfig.output = {
        path: path.resolve(mpkConfig.root, mpkConfig.mpk.distPath),
        publicPath: mpkConfig.mpk.publicPath.prod,
        filename: "js/[name].[chunkhash:8].js",
        chunkFilename: "js/[name].[chunkhash:8].chunk.js"
    };

    prodConfig.plugins.push(new HtmlAssetsWebpackPlugin());

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
