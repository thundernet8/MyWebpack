export as namespace MyWebpack;

export = MyWebpack;

declare namespace MyWebpack {
    export interface IMPKConfig {
        name: string;
        root?: string;
        mpk: {
            // dll packages
            venders: string[];
            // in production, all styles will be extract to one css file
            styleName?: string;
            // distribution files folder(relative to project root)
            distPath?: string;
            // html templates folder(relative to project root)
            template: string;
            // values inject to generated html
            htmlInjects?: { [key: string]: any };
            // webpack publicPath
            publicPath: {
                dev: string;
                prod: string;
            };
            // repository path for publishing assets
            publishPath: {
                dev: string;
                prod: string;
            };
            // dev server host
            devHost?: string;
            // dev server port
            devPort?: string;
            // prepared packages for each webpack entry
            prePackages?: string[];
            // pre build entries for dev
            initEntries?: string[];
            // entries folder(relative to project root)
            entryRoot: string;
        };
        webpack: {
            resolve?: {
                extensions?: [
                    ".json",
                    ".js",
                    ".jsx",
                    ".ts",
                    ".tsx",
                    ".css",
                    ".less",
                    ".scss"
                ];
                alias?: { [aliaName: string]: string };
                modules?: string[];
            };
            target?: string;
            externals?: { [library: string]: string };
        };
    }
}
