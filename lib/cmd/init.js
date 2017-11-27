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
const inquirer = require("inquirer");
const path = require("path");
const fs_1 = require("fs");
const log_1 = require("../utils/log");
function writeMpkConfig(path) {
}
function writeSampleTemplate(path) {
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
            fs_1.mkdirSync(path.join(currentPath, "src/templates"));
            writeSampleTemplate(path.join(currentPath, "src/templates/index.html"));
            fs_1.mkdirSync(path.join(currentPath, "src/views"));
            writeMpkConfig(path.join(currentPath, "mpk.config.js"));
        }
        catch (err) {
            log_1.default.error(err.message || err.toString());
            return;
        }
    });
}
exports.default = init;
