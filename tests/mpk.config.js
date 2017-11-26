const path = require("path");

module.exports = {
    name: "test",
    root: "",
    mpk: {
        venders: ["react"], // array or key-array value pair
        // in production, all styles will be extract to one css file
        styleName: "style",
        distPath: "dist",
        template: "tests/proj/src/templates", // relative to project root
        htmlInjects: { key1: "value" }, // key-value pairs
        publicPath: {
            dev: "/",
            prod: "https://assets.example.com/"
        },
        publishPath: {
            dev: "../testRepo",
            prod: "../publishRepo"
        },
        devHost: "localhost",
        devPort: "9000",
        prePackages: ["babel-polyfill"],
        initEntries: ["businessA.ts", "businessB.ts"],
        entryRoot: "tests/proj/src/entries"
    },
    webpack: {
        resolve: {
            extensions: [
                ".json",
                ".js",
                ".jsx",
                ".ts",
                ".tsx",
                ".css",
                ".less",
                ".scss"
            ],
            alias: {
                IMG: path.resolve(__dirname, "../src/assets/images/"),
                STYLES: path.resolve(__dirname, "../src/assets/styles"),
                FONTS: path.resolve(__dirname, "../src/assets/fonts")
            },
            modules: ["node_modules", path.resolve(__dirname, "../src/shared")]
        },
        target: "web",
        externals: {
            jquery: "jQuery"
        }
        // module: {
        //     rules: []
        // },
        // plugins: []
    }
};
