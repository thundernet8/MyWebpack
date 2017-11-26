import build from "./build";
import * as gutil from "gutil";
// import { IEntry } from "../utils/entry";
// import { Compiler } from "webpack";
import * as colors from "colors";
import GitHelper from "../utils/git";
import * as inquirer from "inquirer";
import * as path from "path";
import { isDirectory } from "../utils/path";
import * as vfs from "vinyl-fs";
import * as fse from "fs-extra";

export default async function publish(config) {
    const { publishPath, distPath } = config.mpk;
    const currentPath = config.root;
    const distFullPath = path.resolve(currentPath, distPath);

    const currentRepo = new GitHelper(currentPath);
    const currentBranch = await currentRepo.getCurrentBranch();
    const isProd = currentBranch === "master";

    let publishRepoPath;

    if (isProd) {
        const answers = await inquirer.prompt([
            {
                type: "confirm",
                name: "isProd",
                default: false,
                message: "Are you sure to publish changes to production repo?"
            }
        ]);

        if (!answers.isProd) {
            return;
        }

        publishRepoPath = publishPath.prod;
    } else {
        publishRepoPath = publishPath.dev;
    }

    publishRepoPath = path.resolve(config.root, publishRepoPath);

    if (!await isDirectory(publishRepoPath)) {
        gutil.log(colors.red(`Failure: ${publishRepoPath} does not exist`));
        return;
    }

    const publishRepo = new GitHelper(publishRepoPath);

    try {
        const stats = await publishRepo.checkStatus();
        if (stats.files.length > 0) {
            gutil.log(colors.red(`Failure: ${publishRepoPath} is not clean`));
            return;
        }
    } catch (e) {
        gutil.log(
            colors.red(`Failure: ${publishRepoPath} is not a git repository`)
        );
        return;
    }

    try {
        await publishRepo.pull("master");
    } catch (err) {
        gutil.log(colors.red(`Failure: ${err.message || err.toString()}`));
        return;
    }

    await fse.emptyDir(distFullPath);
    await build(config);

    gutil.log("\r\n🎉   " + colors.green(`Build successfully.`));

    vfs.src(path.join(distFullPath, "**/*")).pipe(vfs.dest(publishRepoPath));

    const answers = await inquirer.prompt([
        {
            type: "confirm",
            name: "isPublish",
            default: false,
            message: "Publish online:"
        }
    ]);

    if (answers.isPublish) {
        try {
            await publishRepo.add("./*");
            await publishRepo.commit(
                `Auto publish ${config.name} on branch ${currentBranch}`
            );
            await publishRepo.pull("master", {
                "--rebase": "true"
            });
            await publishRepo.push("master");
            gutil.log(
                colors.green(
                    `\r\n🎉   Publish ${
                        isProd ? "production" : "test"
                    } build successfully`
                )
            );
        } catch (err) {
            gutil.log(colors.red(`\r\n Publish assets failed`));
        }
    }
}
