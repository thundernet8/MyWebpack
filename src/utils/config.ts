import * as path from "path";
import * as fs from "fs";

export default function loadConfig(configFile: string) {
    const filePath = path.resolve(configFile);
    if (!fs.existsSync(filePath)) {
        throw new Error(
            `The specified config file is not exist on path: ${filePath}`
        );
    }

    const config = require(filePath);
    return defaults(config);
}

function defaults(config) {
    // TODO
    const defaultMpk = {
        styleName: "style",
        distPath: "dist",
        template: "src/templates",
        htmlInjects: {},
        publicPath: {
            dev: "/",
            prod: "https://assets.example.com/"
        },
        devHost: "localhost",
        devPort: 9000,
        // 前置包Entries
        prePackages: ["babel-polyfill"],
        // 预编译的Entries
        initEntries: ["index.ts"],
        // Entries所在文件夹(绝对路径或相对项目根目录)
        entryRoot: "src/entries"
    };
    return Object.assign({}, { mpk: defaultMpk }, config);
}
