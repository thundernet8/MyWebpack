import * as path from "path";
import { writeFileSync, readFileSync } from "fs";
import { walkSync } from "fs-tools";
import * as prettier from "prettier";
import { IMPKConfig } from "../index.d";
import log from "../utils/log";

export default function pretty(config?: IMPKConfig) {
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
    log.info(`\r\nScanning foloder: ${scanDir}\r\n`);

    const walk = () =>
        walkSync(
            path.join(scanDir),
            ".(ts|tsx|js|jsx|json)$",
            (path: string, stats) => {
                if (stats.isFile()) {
                    if (/\.(ts|tsx|js|jsx)$/i.test(path)) {
                        const code = readFileSync(path).toString();
                        writeFileSync(
                            path,
                            prettier.format(code, scriptPrettierConfig)
                        );
                        console.log(`Pretty: ${path}`);
                    } else if (/\.json$/i.test(path)) {
                        const code = readFileSync(path).toString();
                        writeFileSync(
                            path,
                            prettier.format(code, jsonPrettierConfig)
                        );
                        console.log(`Pretty: ${path}`);
                    }
                }
            }
        );

    try {
        walk();
        log.success("\r\n🎉   Pretty code successfully.");
    } catch (err) {
        log.error(err.message || err.toString());
        process.exit(1);
    }
}
