import * as path from "path";
import * as fs from "fs";
import { IMPKConfig } from "../index.d";

export default function loadConfig(configFile: string): IMPKConfig {
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
    const defaultMpk = {
        styleName: "style",
        distPath: "dist",
        template: "src/templates",
        htmlInjects: {},
        publicPath: {
            dev: "/",
            prod: "/"
        },
        devHost: "localhost",
        devPort: 9000,
        // 前置包Entries
        prePackages: ["babel-polyfill"],
        // 预编译的Entries
        initEntries: [],
        // Entries所在文件夹(绝对路径或相对项目根目录)
        entryRoot: "src/entries"
    };

    const defaultWebpack = {
        resolve: {
            extensions: [
                ".json",
                ".js",
                ".jsx",
                ".ts",
                ".tsx",
                ".css",
                ".less",
                ".scss"
            ],
            modules: ["node_modules"]
        },
        target: "web"
    };
    return Object.assign(
        {},
        { mpk: defaultMpk, webpack: defaultWebpack },
        config
    );
}
