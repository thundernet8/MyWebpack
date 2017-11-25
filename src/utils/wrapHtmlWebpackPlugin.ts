import { Compiler } from "webpack";

const HtmlWebpackPlugin = require("html-webpack-plugin");

class DynamicWrapHtmlWebpackPlugin {
    private originPlugin;
    public constructor(template: string, filename: string, venders) {
        this.originPlugin = new HtmlWebpackPlugin({
            filename,
            template,
            venders
        });
    }

    public apply(compiler: Compiler) {}
}

module.exports = WrapHtmlWebpackPlugin;
