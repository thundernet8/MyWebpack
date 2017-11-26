import * as path from "path";
import loadConfig from "./config";
// import start from "./cmd/publish";
import build from "./cmd/build";

const config = loadConfig("tests/mpk.config.js");
config.root = path.resolve(process.cwd());
build(config);
