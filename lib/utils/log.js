"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
function log(log) {
    fs.writeFileSync(".mpk/test.log", log + "\r\n", { flag: "a" });
}
exports.default = log;
