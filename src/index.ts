import * as yargs from "yargs";
import * as path from "path";
import loadConfig from "./utils/config";
import start from "./cmd/start";
import build from "./cmd/build";
import publish from "./cmd/publish";

const version = require("../package.json").version;

yargs
    .version(version)
    .alias("v", "version")
    .alias("h", "help")
    .alias("c", "config")
    .command(
        "$0",
        "The default command",
        args => args,
        argv => {
            console.log(
                `Please specify a command, e.g ${argv.$0} start/build/publish`
            );
        }
    )
    .command(
        ["start"],
        "Start dev server",
        args => args,
        argv => {
            const config = loadConfig(argv.config);
            config.root = path.resolve(process.cwd());
            start(config);
        }
    )
    .command(
        ["build"],
        "Build project",
        args => args,
        argv => {
            const config = loadConfig(argv.config);
            config.root = path.resolve(process.cwd());
            build(config);
        }
    )
    .command(
        ["publish"],
        "Publish project",
        args => args,
        argv => {
            console.log("Build && Publish project");
            const config = loadConfig(argv.config);
            config.root = path.resolve(process.cwd());
            publish(config);
        }
    )
    .usage("Usage: $0 <command> [options]")
    .default("c", "mpk.config.js")
    .describe("c", "Specify the configuration file path")
    .epilog("Copyright " + new Date().getFullYear())
    .help().argv;
