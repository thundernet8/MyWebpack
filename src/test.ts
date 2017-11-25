import * as path from "path";
import loadConfig from "./utils/config";
import start from "./cmd/publish";

const config = loadConfig("tests/mpk.config.js");
config.root = path.resolve(process.cwd());
start(config);
