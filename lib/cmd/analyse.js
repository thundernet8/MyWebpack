"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const build_1 = require("./build");
function analyze(config) {
    return build_1.default(config);
}
exports.default = analyze;
