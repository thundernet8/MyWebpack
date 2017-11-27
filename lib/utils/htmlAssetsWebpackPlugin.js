"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HtmlAssetsWebpackPlugin {
    constructor() { }
    apply(compiler) {
        compiler.plugin("make", (compilation, makeCallback) => {
            compilation.plugin("html-webpack-plugin-before-html-processing", function (htmlPluginData, callback) {
                const { assets } = htmlPluginData;
                const { chunks } = assets;
                const entryName = htmlPluginData.outputName.substr(0, htmlPluginData.outputName.length - 5);
                if (chunks[entryName]) {
                    const { css, entry } = chunks[entryName];
                    htmlPluginData.assets.js = [entry];
                    htmlPluginData.assets.css = css;
                }
                callback(null, htmlPluginData);
            });
            makeCallback();
        });
    }
}
exports.default = HtmlAssetsWebpackPlugin;
