"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const config_1 = require("./config");
const build_1 = require("./cmd/build");
const config = config_1.default("tests/mpk.config.js");
config.root = path.resolve(process.cwd());
build_1.default(config);
