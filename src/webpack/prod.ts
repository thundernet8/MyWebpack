import * as path from "path";
import baseConf from "./base";
import { IMPKConfig } from "../index.d";
import HtmlAssetsWebpackPlugin from "../utils/htmlAssetsWebpackPlugin";

export default function getProdConfig(rawConfig: IMPKConfig) {
    let prodConfig: any = baseConf(rawConfig);
    const { prePackages } = rawConfig.mpk;
    const { entry } = rawConfig.webpack;

    if (Array.isArray(entry)) {
        prodConfig.entry = Array.from(new Set(prePackages.concat(entry)));
    } else {
        prodConfig.entry = {};
        Object.keys(entry).forEach(key => {
            const chunkEntry = entry[key];
            if (Array.isArray(chunkEntry)) {
                prodConfig.entry[key] = Array.from(
                    new Set(prePackages.concat(chunkEntry))
                );
            } else {
                prodConfig.entry[key] = Array.from(
                    new Set(prePackages.concat(chunkEntry))
                );
            }
        });
    }

    prodConfig.entry = rawConfig.webpack.entry;
    prodConfig.output = {
        path: path.resolve(rawConfig.root, rawConfig.mpk.distPath),
        publicPath: rawConfig.mpk.publicPath.prod,
        filename: "js/[name].[chunkhash:8].js",
        chunkFilename: "js/[name].[chunkhash:8].chunk.js"
    };

    prodConfig.plugins.push(new HtmlAssetsWebpackPlugin());

    Object.keys(rawConfig.webpack).forEach(key => {
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
            prodConfig[key] = rawConfig.webpack[key];
        }
    });

    return prodConfig;
}
