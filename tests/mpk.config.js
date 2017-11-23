const path = require("path");

const isDev = process.env.NODE_ENV !== "production";

module.exports = {
    name: "test",
    root: "",
    mpk: {
        venders: ["react"], // array or key-array value pair
        // in production, all styles will be extract to one css file
        styleName: "style",
        distPath: "dist",
        template: "tests/proj/src/templates", // relative to project root
        htmlInjects: { key: "value" }, // key-value pairs
        publicPath: {
            dev: "/",
            prod: "https://assets.example.com/"
        },
        devHost: "localhost",
        devPort: "9000",
        preEntries: ["babel-polyfill"],
        initEntries: ["businessA.ts"],
        entryRoot: "tests/proj/src/entries"
    },
    webpack: {
        // entry: {
        //     businessA: [
        //         // "babel-polyfill",
        //         path.resolve(__dirname, "proj/src/entries/businessA.ts")
        //     ]
        // },
        output: {
            path: path.resolve(__dirname, "../dist/assets/js"),
            publicPath: isDev
                ? "/assets/js/"
                : "https://assets.example.com/assets/js/",
            filename: "[name].[chunkhash:8].js",
            library: "[name]_[chunkhash:8]"
        },
        node: {
            __filename: false,
            __dirname: false
        },
        resolve: {
            extensions: [
                ".json",
                ".js",
                ".jsx",
                ".ts",
                ".tsx",
                ".css",
                ".less"
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
        },
        module: {
            rules: []
        },
        plugins: []
    }
};