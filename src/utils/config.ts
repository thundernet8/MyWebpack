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
        devPort: 9000
    };
    return Object.assign({}, { mpk: defaultMpk }, config);
}
