import { Compiler } from "webpack";

// manage html-webpack-plugin assets to match the right js/css file in production
export default class HtmlAssetsWebpackPlugin {
    public constructor() {}

    public apply(compiler: Compiler) {
        compiler.plugin("make", (compilation, callback) => {
            compilation.plugin(
                "html-webpack-plugin-before-html-processing",
                function(htmlPluginData, callback) {
                    const { assets } = htmlPluginData;
                    const { chunks } = assets;
                    const entryName = htmlPluginData.outputName.substr(
                        0,
                        htmlPluginData.outputName.length - 5
                    );
                    if (chunks[entryName]) {
                        htmlPluginData.assets.js = [chunks[entryName].entry];
                    }
                    callback(null, htmlPluginData);
                }
            );

            callback();
        });
    }
}
