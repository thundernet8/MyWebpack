import * as vfs from "vinyl-fs";
import * as fse from "fs-extra";
import * as path from "path";
import * as inquirer from "inquirer";
import build from "./build";
import log from "../utils/log";
import GitHelper from "../utils/git";
import { isDirectory } from "../utils/path";
import { IMPKConfig } from "../index.d";

export default async function publish(config: IMPKConfig) {
    const { publishPath, distPath } = config.mpk;
    const currentPath = config.root;
    const distFullPath = path.resolve(currentPath, distPath);

    const currentRepo = new GitHelper(currentPath);
    const currentBranch = await currentRepo.getCurrentBranch();
    const isProd = currentBranch === "master";

    let publishRepoPath;
    let answers;

    if (isProd) {
        answers = await inquirer.prompt([
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
        log.error(`Failure: ${publishRepoPath} does not exist`);
        return;
    }

    const publishRepo = new GitHelper(publishRepoPath);

    try {
        const stats = await publishRepo.checkStatus();
        if (stats.files.length > 0) {
            log.error(`Failure: ${publishRepoPath} is not clean`);
            return;
        }
    } catch (e) {
        log.error(`Failure: ${publishRepoPath} is not a git repository`);
        return;
    }

    try {
        await publishRepo.pull("master");
    } catch (err) {
        log.error(`Failure: ${err.message || err.toString()}`);
        return;
    }

    await fse.emptyDir(distFullPath);
    const result = await build(config);
    if (!result) {
        return;
    }

    log.success("\r\n🎉   Build successfully.");

    vfs.src(path.join(distFullPath, "**/*")).pipe(vfs.dest(publishRepoPath));

    answers = await inquirer.prompt([
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
            log.success(
                `\r\n🎉   Publish ${
                    isProd ? "production" : "test"
                } build successfully`
            );
        } catch (err) {
            log.error(`\r\n Publish assets failed`);
        }
    }
}
