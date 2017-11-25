"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const config_1 = require("./utils/config");
const publish_1 = require("./cmd/publish");
const config = config_1.default("tests/mpk.config.js");
config.root = path.resolve(process.cwd());
publish_1.default(config);
