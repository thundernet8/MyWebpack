import * as yargs from "yargs";
import loadConfig from "./config";
import start from "./cmd/start";
import build from "./cmd/build";
import publish from "./cmd/publish";
import analyze from "./cmd/analyse";
import init from "./cmd/init";
import gen from "./cmd/gen";

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
            process.env.NODE_ENV = "development";
            start(config);
        }
    )
    .command(
        ["build"],
        "Build project",
        args => args,
        argv => {
            const config = loadConfig(argv.config);
            process.env.NODE_ENV = "production";
            build(config);
        }
    )
    .command(
        ["publish"],
        "Publish project",
        args => args,
        argv => {
            console.log("Build & Publish project");
            process.env.NODE_ENV = "production";
            const config = loadConfig(argv.config);
            publish(config);
        }
    )
    .command(
        ["analyze"],
        "Build and analyze",
        args => args,
        argv => {
            console.log("Build & Analyze package bundles");
            process.env.ANALYZE_ENV = "true";
            process.env.NODE_ENV = "production";
            const config = loadConfig(argv.config);
            analyze(config);
        }
    )
    .command(
        ["init"],
        "Initialize multi-entries webpack project",
        args => args,
        argv => {
            console.log("Initialize multi-entries webpack project");
            init();
        }
    )
    .command(
        ["gen"],
        "Generate entries",
        args => args,
        argv => {
            console.log("Generate routes and entries from routes.yml");
            const config = loadConfig(argv.config);
            gen(config);
        }
    )
    .usage("Usage: $0 <command> [options]")
    .default("c", "mpk.config.js")
    .describe("c", "Specify the configuration file path")
    .epilog("Copyright " + new Date().getFullYear())
    .help().argv;
