"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const base_1 = require("./base");
function getProdConfig(mpkConfig) {
    let prodConfig = base_1.default(mpkConfig);
    prodConfig.entry = mpkConfig.webpack.entry;
    prodConfig.output = {
        path: path.resolve(mpkConfig.root, mpkConfig.mpk.distPath),
        publicPath: mpkConfig.mpk.publicPath.prod,
        filename: "js/[name].[chunkhash:8].js",
        chunkFilename: "js/[name].[chunkhash:8].chunk.js"
    };
    Object.keys(mpkConfig.webpack).forEach(key => {
        if (![
            "entry",
            "output",
            "module",
            "plugins",
            "node",
            "resolve"
        ].includes(key)) {
            prodConfig[key] = mpkConfig.webpack[key];
        }
    });
    return prodConfig;
}
exports.default = getProdConfig;
