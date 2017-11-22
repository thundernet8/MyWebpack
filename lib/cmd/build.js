"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webpack = require("webpack");
const dll_1 = require("../webpack/dll");
const dev_1 = require("../webpack/dev");
const prod_1 = require("../webpack/prod");
function build(config) {
    const compilers = [];
    compilers.push(webpack(dll_1.default(config)));
    compilers.push(webpack(process.env.NODE_ENV !== "production"
        ? dev_1.default(config)
        : prod_1.default(config)));
    console.log(prod_1.default(config));
    compilers.forEach(compiler => {
        compiler.run(function (err, stats) {
            if (err) {
                throw err;
            }
            else {
            }
        });
    });
}
exports.default = build;
