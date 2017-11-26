"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = require("yargs");
const path = require("path");
const config_1 = require("./config");
const start_1 = require("./cmd/start");
const build_1 = require("./cmd/build");
const publish_1 = require("./cmd/publish");
const version = require("../package.json").version;
yargs
    .version(version)
    .alias("v", "version")
    .alias("h", "help")
    .alias("c", "config")
    .command("$0", "The default command", args => args, argv => {
    console.log(`Please specify a command, e.g ${argv.$0} start/build/publish`);
})
    .command(["start"], "Start dev server", args => args, argv => {
    const config = config_1.default(argv.config);
    config.root = path.resolve(process.cwd());
    start_1.default(config);
})
    .command(["build"], "Build project", args => args, argv => {
    const config = config_1.default(argv.config);
    config.root = path.resolve(process.cwd());
    build_1.default(config);
})
    .command(["publish"], "Publish project", args => args, argv => {
    console.log("Build && Publish project");
    const config = config_1.default(argv.config);
    config.root = path.resolve(process.cwd());
    publish_1.default(config);
})
    .usage("Usage: $0 <command> [options]")
    .default("c", "mpk.config.js")
    .describe("c", "Specify the configuration file path")
    .epilog("Copyright " + new Date().getFullYear())
    .help().argv;
