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
function writeMpkConfig(filePath) {
    const prettierConfig = {
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
        bracketSpacing: true,
        parser: "javascript"
    };
    const code = fs_1.readFileSync(path.resolve(path_1.getPackagePath(), "./src/resources/mpk.config-sample.js"));
    fs_1.writeFileSync(filePath, prettier.format(code, prettierConfig));
}
function writeSampleEntryAndView(srcFolder) {
    const prettierConfig = {
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
        bracketSpacing: true,
        parser: "typescript"
    };
    const entryCode = fs_1.readFileSync(path.resolve(path_1.getPackagePath(), "./src/resources/sampleEntry.ts"));
    const viewCode = fs_1.readFileSync(path.resolve(path_1.getPackagePath(), "./src/resources/sampleView.tsx"));
    fs_1.writeFileSync(path.join(srcFolder, "entries/A.ts"), prettier.format(entryCode, prettierConfig));
    fs_1.writeFileSync(path.join(srcFolder, "views/A.ts"), prettier.format(viewCode, prettierConfig));
}
function writeSampleTemplate(filePath) {
    const prettierConfig = {
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
        bracketSpacing: true,
        parser: "html"
    };
    const html = fs_1.readFileSync(path.resolve(path_1.getPackagePath(), "./src/resources/index.html"));
    fs_1.writeFileSync(filePath, prettier.format(html, prettierConfig));
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
            fs_1.mkdirSync(path.join(currentPath, "src"));
            fs_1.mkdirSync(path.join(currentPath, "src/assets"));
            fs_1.mkdirSync(path.join(currentPath, "src/assets/styles"));
            fs_1.mkdirSync(path.join(currentPath, "src/assets/styles/global"));
            fs_1.writeFileSync(path.join(currentPath, "src/assets/styles/global/index.less"), `*,
        *:before,
        *:after {
            box-sizing: border-box;
        }`);
            fs_1.mkdirSync(path.join(currentPath, "src/assets/images"));
            fs_1.mkdirSync(path.join(currentPath, "src/assets/fonts"));
            fs_1.mkdirSync(path.join(currentPath, "src/entries"));
            writeSampleEntryAndView(path.join(currentPath, "src"));
            fs_1.mkdirSync(path.join(currentPath, "src/templates"));
            writeSampleTemplate(path.join(currentPath, "src/templates/index.html"));
            fs_1.mkdirSync(path.join(currentPath, "src/views"));
            writeMpkConfig(path.join(currentPath, "mpk.config.js"));
            copyFile(path.join(path_1.getPackagePath(), "src/resources/entry.yml"), currentPath);
            copyFile(path.join(path_1.getPackagePath(), "src/resources/tsconfig.json"), currentPath);
            copyFile(path.join(path_1.getPackagePath(), "src/resources/package.json"), currentPath);
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
