"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const build_1 = require("./build");
const gutil = require("gutil");
const log_1 = require("../utils/log");
const colors = require("colors");
function publish(config) {
    build_1.default(config, function (compiler, webpackConfig, allEntries, builtEntries) {
        gutil.log("\r\n🎉   " + colors.green(`Build successfully.`));
        log_1.default("publish");
    });
}
exports.default = publish;
