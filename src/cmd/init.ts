import * as path from "path";
import * as vfs from "vinyl-fs";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import * as prettier from "prettier";
import * as inquirer from "inquirer";
import log from "../utils/log";
import { getPackagePath, isDirectory } from "../utils/path";

const pkg = require("../../package.json");

async function safeMkdir(dir) {
    const isDir = await isDirectory(dir);
    if (!isDir) {
        mkdirSync(dir);
    }
}

function writeMpkConfig(filePath) {
    const prettierConfig = {
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
        bracketSpacing: true,
        parser: "typescript"
    };

    const code = readFileSync(
        path.resolve(getPackagePath(), "./src/resources/mpk.config-sample.js")
    );

    writeFileSync(filePath, prettier.format(code.toString(), prettierConfig));
}

function writePackageJson(filePath) {
    if (existsSync(filePath)) {
        const json = JSON.parse(readFileSync(filePath).toString());
        const sampleJson = JSON.parse(
            readFileSync(
                path.join(getPackagePath(), "src/resources/package.json")
            ).toString()
        );
        json.scripts = Object.assign(
            {},
            json.scripts || {},
            sampleJson.scripts
        );
        json.dependencies = json.dependencies || {};
        json.devDependencies = Object.assign(
            {},
            json.devDependencies || {},
            sampleJson.devDependencies,
            { mywebpack: "^" + pkg.version }
        );

        json["lint-staged"] = {
            "src/**/*.{ts,tsx}": ["lint-staged:ts"]
        };
        json["pre-commit"] = "lint-staged";

        const prettierConfig = {
            tabWidth: 2,
            useTabs: false,
            singleQuote: false,
            bracketSpacing: true,
            parser: "json"
        };

        writeFileSync(
            filePath,
            prettier.format(JSON.stringify(json), prettierConfig)
        );
    } else {
        copyFile(
            path.join(getPackagePath(), "src/resources/package.json"),
            path.dirname(filePath)
        );
    }
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
        path.resolve(getPackagePath(), "./src/resources/sampleEntry.tsx")
    );

    const viewCode = readFileSync(
        path.resolve(getPackagePath(), "./src/resources/sampleView.tsx")
    );

    writeFileSync(
        path.join(srcFolder, "entries/A.ts"),
        prettier.format(entryCode.toString(), prettierConfig)
    );
    writeFileSync(
        path.join(srcFolder, "views/A.tsx"),
        prettier.format(viewCode.toString(), prettierConfig)
    );
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
        await safeMkdir(path.join(currentPath, "src"));
        await safeMkdir(path.join(currentPath, "src/assets"));
        await safeMkdir(path.join(currentPath, "src/assets/styles"));
        await safeMkdir(path.join(currentPath, "src/assets/styles/global"));
        writeFileSync(
            path.join(currentPath, "src/assets/styles/global/index.less"),
            `*,*:before,*:after { box-sizing: border-box;}`
        );
        await safeMkdir(path.join(currentPath, "src/assets/images"));
        await safeMkdir(path.join(currentPath, "src/assets/fonts"));
        await safeMkdir(path.join(currentPath, "src/entries"));
        await safeMkdir(path.join(currentPath, "src/views"));
        writeSampleEntryAndView(path.join(currentPath, "src"));
        await safeMkdir(path.join(currentPath, "src/templates"));
        writeMpkConfig(path.join(currentPath, "mpk.config.js"));
        writePackageJson(path.join(currentPath, "package.json"));
        copyFile(
            path.join(getPackagePath(), "./src/resources/index.html"),
            path.join(currentPath, "src/templates")
        );
        copyFile(
            path.join(getPackagePath(), "src/resources/entry.yaml"),
            currentPath
        );
        copyFile(
            path.join(getPackagePath(), "src/resources/tsconfig.json"),
            currentPath
        );
        copyFile(
            path.join(getPackagePath(), "src/resources/tslintrc.json"),
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
