import * as path from "path";
import * as webpack from "webpack";
import { Compiler } from "webpack";
import * as inquirer from "inquirer";
import * as SearchCheckbox from "inquirer-search-checkbox";
import getDllConfig from "../webpack/dll";
import getDevConfig from "../webpack/dev";
import getProdConfig from "../webpack/prod";
import { IEntry, scanEntries } from "../utils/entry";
import { getEmptyEntry } from "../utils/path";
import log from "../utils/log";

inquirer.registerPrompt("SearchCheckbox", SearchCheckbox);

export interface IBuildResult {
    compiler: Compiler;
    webpackConfig;
    allEntries: IEntry[];
    entries: IEntry[];
}

function _build(
    config,
    cb?: (
        compiler: Compiler,
        webpackConfig,
        allEntries: IEntry[],
        entries: IEntry[]
    ) => void
) {
    const dllConfig = getDllConfig(config);
    let generalConfig;

    const { root, mpk } = config;
    const { entryRoot, initEntries } = mpk;

    // all entries exist in entry folder
    const allEntries = scanEntries(path.resolve(root, entryRoot));

    // prebuildEntries is entries auto built before dev server run under development env, or the select entries to publish under production env
    const prebuildEntries = allEntries.filter(
        entry =>
            initEntries.includes(entry.name) ||
            initEntries.some(item => item.split(".")[0] === entry.name)
    );

    let webpackEntry;

    if (process.env.NODE_ENV === "production") {
        webpackEntry = prebuildEntries.reduce((prev, curr) => {
            prev[curr.name] = curr.path;
            return prev;
        }, {});
    } else {
        webpackEntry = {};
        webpackEntry["empty"] = getEmptyEntry();
    }

    config.webpack.entry = webpackEntry;
    config.webpack.node = {
        __filename: false,
        __dirname: false
    };

    const callback = function(err, stats, end: boolean = true) {
        if (err) {
            throw new Error(err);
        } else {
            console.log(
                "\r\n" +
                    stats.toString({
                        version: false,
                        timings: false,
                        assets: true,
                        chunks: false, // Makes the build much quieter
                        chunkModules: false,
                        modules: false,
                        children: false,
                        errorDetails: true,
                        colors: true
                    }) +
                    "\r\n"
            );
        }

        if (end && cb) {
            cb(this, generalConfig, allEntries, prebuildEntries);
        }
    };

    webpack(dllConfig, function(err, stats) {
        callback(err, stats, false);
        // build others when dll build finished
        if (!err) {
            generalConfig =
                process.env.NODE_ENV !== "production"
                    ? getDevConfig(config)
                    : getProdConfig(config);
            const compiler = webpack(generalConfig);
            compiler.run(callback.bind(compiler));
        }
    });
}

export default async function build(config) {
    const { root, mpk } = config;
    const { entryRoot } = mpk;

    if (!entryRoot) {
        throw new Error("Entries folder is not defined in config");
    }

    if (process.env.NODE_ENV === "production") {
        try {
            // all entries exist in entry folder
            const allEntries = scanEntries(path.resolve(root, entryRoot));
            const allEntryKeys = allEntries.map(e => e.name);
            const entryKeys = ["All"].concat(allEntryKeys);
            const answers = await inquirer.prompt([
                {
                    type: "SearchCheckbox",
                    name: "key",
                    message: `Select entries to build (${entryKeys.length})`,
                    choices: entryKeys.map(name => ({ name })),
                    pageSize: 5,
                    validate: function(answer) {
                        if (answer.length < 1) {
                            return "You must choose at least one entry.";
                        }
                        return true;
                    }
                }
            ]);

            if (!answers.key || answers.key.length < 1) {
                log.warning("No entry select");
            }

            config.mpk.initEntries = answers.key.includes("All")
                ? allEntryKeys
                : answers.key;
        } catch (err) {
            log.error(err.message || err.toString());
            return;
        }
    }

    return new Promise<IBuildResult>((resolve, reject) => {
        try {
            _build(
                config,
                (
                    compiler: Compiler,
                    webpackConfig: any,
                    allEntries: IEntry[],
                    entries: IEntry[]
                ) => {
                    resolve({
                        compiler,
                        webpackConfig,
                        allEntries,
                        entries
                    });
                }
            );
        } catch (err) {
            reject(err);
        }
    });
}
