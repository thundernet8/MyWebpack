"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HtmlAssetsWebpackPlugin {
    constructor() { }
    apply(compiler) {
        compiler.plugin("make", (compilation, callback) => {
            compilation.plugin("html-webpack-plugin-before-html-processing", function (htmlPluginData, callback) {
                const { assets } = htmlPluginData;
                const { chunks } = assets;
                const entryName = htmlPluginData.outputName.substr(0, htmlPluginData.outputName.length - 5);
                if (chunks[entryName]) {
                    htmlPluginData.assets.js = [chunks[entryName].entry];
                }
                callback(null, htmlPluginData);
            });
            callback();
        });
    }
}
exports.default = HtmlAssetsWebpackPlugin;
