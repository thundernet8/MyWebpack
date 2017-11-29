"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vfs = require("vinyl-fs");
const fs_1 = require("fs");
const prettier = require("prettier");
const inquirer = require("inquirer");
const log_1 = require("../utils/log");
const path_1 = require("../utils/path");
const pkg = require("../../package.json");
function safeMkdir(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        const isDir = yield path_1.isDirectory(dir);
        if (!isDir) {
            fs_1.mkdirSync(dir);
        }
    });
}
function writeMpkConfig(filePath) {
    const prettierConfig = {
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
        bracketSpacing: true,
        parser: "typescript"
    };
    const code = fs_1.readFileSync(path.resolve(path_1.getPackagePath(), "./src/resources/mpk.config-sample.js"));
    fs_1.writeFileSync(filePath, prettier.format(code.toString(), prettierConfig));
}
function writePackageJson(filePath) {
    if (fs_1.existsSync(filePath)) {
        const json = JSON.parse(fs_1.readFileSync(filePath).toString());
        const sampleJson = JSON.parse(fs_1.readFileSync(path.join(path_1.getPackagePath(), "src/resources/package.json")).toString());
        json.scripts = Object.assign({}, json.scripts || {}, sampleJson.scripts);
        json.dependencies = json.dependencies || {};
        json.devDependencies = Object.assign({}, json.devDependencies || {}, sampleJson.devDependencies, { mywebpack: "^" + pkg.version });
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
        fs_1.writeFileSync(filePath, prettier.format(JSON.stringify(json), prettierConfig));
    }
    else {
        copyFile(path.join(path_1.getPackagePath(), "src/resources/package.json"), path.dirname(filePath));
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
    const entryCode = fs_1.readFileSync(path.resolve(path_1.getPackagePath(), "./src/resources/sampleEntry.tsx"));
    const viewCode = fs_1.readFileSync(path.resolve(path_1.getPackagePath(), "./src/resources/sampleView.tsx"));
    fs_1.writeFileSync(path.join(srcFolder, "entries/A.ts"), prettier.format(entryCode.toString(), prettierConfig));
    fs_1.writeFileSync(path.join(srcFolder, "views/A.tsx"), prettier.format(viewCode.toString(), prettierConfig));
}
function copyFile(from, to) {
    vfs.src(from).pipe(vfs.dest(to));
}
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const answers = yield inquirer.prompt([
            {
                type: "confirm",
                name: "confirm",
                default: false,
                message: "Are you sure to initialize a multi-entries webpack project in current folder?"
            }
        ]);
        if (!answers.confirm) {
            return;
        }
        const currentPath = process.cwd();
        try {
            yield safeMkdir(path.join(currentPath, "src"));
            yield safeMkdir(path.join(currentPath, "src/assets"));
            yield safeMkdir(path.join(currentPath, "src/assets/styles"));
            yield safeMkdir(path.join(currentPath, "src/assets/styles/global"));
            fs_1.writeFileSync(path.join(currentPath, "src/assets/styles/global/index.less"), `*,*:before,*:after { box-sizing: border-box;}`);
            yield safeMkdir(path.join(currentPath, "src/assets/images"));
            yield safeMkdir(path.join(currentPath, "src/assets/fonts"));
            yield safeMkdir(path.join(currentPath, "src/entries"));
            yield safeMkdir(path.join(currentPath, "src/views"));
            writeSampleEntryAndView(path.join(currentPath, "src"));
            yield safeMkdir(path.join(currentPath, "src/templates"));
            writeMpkConfig(path.join(currentPath, "mpk.config.js"));
            writePackageJson(path.join(currentPath, "package.json"));
            copyFile(path.join(path_1.getPackagePath(), "./src/resources/index.html"), path.join(currentPath, "src/templates"));
            copyFile(path.join(path_1.getPackagePath(), "src/resources/entry.yaml"), currentPath);
            copyFile(path.join(path_1.getPackagePath(), "src/resources/tsconfig.json"), currentPath);
            copyFile(path.join(path_1.getPackagePath(), "src/resources/tslintrc.json"), currentPath);
            copyFile(path.join(path_1.getPackagePath(), "src/resources/Makefile"), currentPath);
        }
        catch (err) {
            log_1.default.error(err.message || err.toString());
            return;
        }
        log_1.default.success(`\r\n🎉  Initialize project done.`);
    });
}
exports.default = init;
