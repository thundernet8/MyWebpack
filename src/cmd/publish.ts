import build from "./build";
import * as gutil from "gutil";
import { IEntry } from "../utils/entry";
import log from "../utils/log";
import { Compiler } from "webpack";
import * as colors from "colors";

export default function publish(config) {
    build(config, function(
        compiler: Compiler,
        webpackConfig,
        allEntries: IEntry[],
        builtEntries: IEntry[]
    ) {
        gutil.log("\r\n🎉   " + colors.green(`Build successfully.`));
        log("publish");
        // TODO publish
    });
}
