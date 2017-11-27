import * as path from "path";
import * as fse from "fs-extra";

export function getPackagePath() {
    return path.resolve(__dirname, `../..`);
}

export function getEmptyEntry() {
    const pkgPath = getPackagePath();
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

export function isFile(filePath) {
    return fse
        .stat(filePath)
        .then(stats => {
            if (stats) {
                return stats.isFile();
            }

            return false;
        })
        .catch(() => false);
}
