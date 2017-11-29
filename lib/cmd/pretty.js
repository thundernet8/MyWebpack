"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs_1 = require("fs");
const fs_tools_1 = require("fs-tools");
const prettier = require("prettier");
const log_1 = require("../utils/log");
function pretty(config) {
    const scriptPrettierConfig = {
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
        bracketSpacing: true,
        parser: "typescript"
    };
    const jsonPrettierConfig = {
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
        bracketSpacing: true,
        parser: "json"
    };
    const scanDir = path.join(config ? config.root : process.cwd(), "src");
    log_1.default.info(`\r\nScanning foloder: ${scanDir}\r\n`);
    const walk = () => fs_tools_1.walkSync(path.join(scanDir), ".(ts|tsx|js|jsx|json)$", (filePath, stats) => {
        if (stats.isFile()) {
            if (/\.(ts|tsx|js|jsx)$/i.test(filePath)) {
                const code = fs_1.readFileSync(filePath).toString();
                fs_1.writeFileSync(filePath, prettier.format(code, scriptPrettierConfig));
                console.log(`Pretty: ${filePath}`);
            }
            else if (/\.json$/i.test(filePath)) {
                const code = fs_1.readFileSync(filePath).toString();
                fs_1.writeFileSync(filePath, prettier.format(code, jsonPrettierConfig));
                console.log(`Pretty: ${filePath}`);
            }
        }
    });
    try {
        walk();
        log_1.default.success("\r\n🎉   Pretty code successfully.");
    }
    catch (err) {
        log_1.default.error(err.message || err.toString());
        process.exit(1);
    }
}
exports.default = pretty;
