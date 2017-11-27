import * as path from "path";
import * as vfs from "vinyl-fs";
import { mkdirSync, writeFileSync, readFileSync } from "fs";
import * as prettier from "prettier";
import * as inquirer from "inquirer";
import log from "../utils/log";
import { getPackagePath } from "../utils/path";

function writeMpkConfig(filePath) {
    const prettierConfig = {
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
        bracketSpacing: true,
        parser: "javascript"
    };

    const code = readFileSync(
        path.resolve(getPackagePath(), "./src/resources/mpk.config-sample.js")
    );

    writeFileSync(filePath, prettier.format(code, prettierConfig));
}

function writeSampleEntryAndView(srcFolder) {
    const prettierConfig = {
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
        bracketSpacing: true,
        parser: "typescript"
    };

    const entryCode = readFileSync(
        path.resolve(getPackagePath(), "./src/resources/sampleEntry.ts")
    );

    const viewCode = readFileSync(
        path.resolve(getPackagePath(), "./src/resources/sampleView.tsx")
    );

    writeFileSync(
        path.join(srcFolder, "entries/A.ts"),
        prettier.format(entryCode, prettierConfig)
    );
    writeFileSync(
        path.join(srcFolder, "views/A.ts"),
        prettier.format(viewCode, prettierConfig)
    );
}

function writeSampleTemplate(filePath) {
    const prettierConfig = {
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
        bracketSpacing: true,
        parser: "html"
    };

    const html = readFileSync(
        path.resolve(getPackagePath(), "./src/resources/index.html")
    );

    writeFileSync(filePath, prettier.format(html, prettierConfig));
}

function copyFile(from, to) {
    vfs.src(from).pipe(vfs.dest(to));
}

export default async function init() {
    const answers = await inquirer.prompt([
        {
            type: "confirm",
            name: "confirm",
            default: false,
            message:
                "Are you sure to initialize a multi-entries webpack project in current folder?"
        }
    ]);

    if (!answers.confirm) {
        return;
    }

    const currentPath = process.cwd();
    try {
        mkdirSync(path.join(currentPath, "src"));
        mkdirSync(path.join(currentPath, "src/assets"));
        mkdirSync(path.join(currentPath, "src/assets/styles"));
        mkdirSync(path.join(currentPath, "src/assets/styles/global"));
        writeFileSync(
            path.join(currentPath, "src/assets/styles/global/index.less"),
            `*,
        *:before,
        *:after {
            box-sizing: border-box;
        }`
        );
        mkdirSync(path.join(currentPath, "src/assets/images"));
        mkdirSync(path.join(currentPath, "src/assets/fonts"));
        mkdirSync(path.join(currentPath, "src/entries"));
        writeSampleEntryAndView(path.join(currentPath, "src"));
        mkdirSync(path.join(currentPath, "src/templates"));
        writeSampleTemplate(path.join(currentPath, "src/templates/index.html"));
        mkdirSync(path.join(currentPath, "src/views"));
        writeMpkConfig(path.join(currentPath, "mpk.config.js"));
        copyFile(
            path.join(getPackagePath(), "src/resources/entry.yml"),
            currentPath
        );
        copyFile(
            path.join(getPackagePath(), "src/resources/tsconfig.json"),
            currentPath
        );
        copyFile(
            path.join(getPackagePath(), "src/resources/package.json"),
            currentPath
        );
        copyFile(
            path.join(getPackagePath(), "src/resources/Makefile"),
            currentPath
        );
    } catch (err) {
        log.error(err.message || err.toString());
        return;
    }

    log.success(`\r\n🎉  Initialize project done.`);
}
