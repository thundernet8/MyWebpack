import * as path from "path";
import * as fse from "fs-extra";

const pkg = require("../../package.json");

export function getPackagePath(isTest: boolean = false) {
    const projectRoot = process.cwd();
    if (isTest) {
        return projectRoot;
    }
    return path.resolve(projectRoot, `./node_modules/${pkg.name}`);
}

export function getEmptyEntry() {
    const isTest = pkg.name === "mywebpack";
    const pkgPath = getPackagePath(isTest);
    return path.resolve(pkgPath, "./src/resources/empty.ts");
}

export function isDirectory(dirPathName) {
    return fse
        .stat(dirPathName)
        .then(stats => {
            if (stats) {
                return stats.isDirectory();
            }

            return false;
        })
        .catch(() => false);
}
