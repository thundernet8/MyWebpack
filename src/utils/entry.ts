import * as fs from "fs";
import * as path from "path";
import * as DynamicEntryPlugin from "webpack/lib/DynamicEntryPlugin";

export interface IEntry {
    name: string;
    path: string;
}

export function scanEntries(folder: string): IEntry[] {
    const files = fs.readdirSync(folder);
    if (files.length === 0) {
        throw new Error(`No entry files found in ${folder}`);
    }

    const paths = files.map(file => path.resolve(folder, file));

    return paths.map(p => {
        const basename = path.basename(p);
        const extname = path.extname(p);
        const name = basename.substring(0, basename.length - extname.length);
        return {
            name,
            path: p
        };
    });
}

export function addWebpackEntry(
    compilation,
    context,
    entryName,
    entryPath
): Promise<void> {
    return new Promise((resolve, reject) => {
        const dep = DynamicEntryPlugin.createDependency(entryPath, entryName);
        compilation.addEntry(context, dep, entryName, err => {
            if (err) {
                return reject(err);
            } else {
                return resolve();
            }
        });
    });
}

export default {
    scanEntries,
    addWebpackEntry
};
