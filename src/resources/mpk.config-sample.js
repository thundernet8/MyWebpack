const path = require("path");

module.exports = {
    name: "your app name",
    mpk: {
        // dll packages
        venders: ["react", "react-dom", "babel-polyfill"],
        // in production, all styles will be extract to one css file
        styleName: "style",
        // distribution files folder(relative to project root)
        distPath: "dist",
        // html templates folder(relative to project root)
        // note: search template html file with same name of entryName first, and `index.html` as alternative
        template: "src/templates",
        // values inject to generated html
        htmlInjects: {},
        // webpack publicPath
        publicPath: {
            dev: "/",
            prod: "http://assets.example.com/assets/"
        },
        // repository path for publishing assets
        publishPath: {
            dev: "../devDeployRepo",
            prod: "../prodDeployRepo"
        },
        // dev server host
        devHost: "http://localhost",
        // dev server port
        devPort: 9000,
        // prepared packages for each webpack entry
        prePackages: ["babel-polyfill"],
        // pre build entries for dev
        initEntries: [],
        // entries folder(relative to project root)
        entryRoot: "src/entries"
    },
    webpack: {
        target: "web",
        externals: {}
    }
};
