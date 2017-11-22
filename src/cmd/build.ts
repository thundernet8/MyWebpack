import * as webpack from "webpack";
import * as gutil from "gutil";
import getDllConfig from "../webpack/dll";
import getDevConfig from "../webpack/dev";
import getProdConfig from "../webpack/prod";

export default function build(config) {
    const webpackConfigs = [];
    webpackConfigs.push(getDllConfig(config));
    webpackConfigs.push(
        process.env.NODE_ENV !== "production"
            ? getDevConfig(config)
            : getProdConfig(config)
    );

    const callback = function(err, stats) {
        if (err) {
            throw new gutil.PluginError("💡", err);
        } else {
            gutil.log(
                "🎉  " +
                    stats.toString({
                        timings: false,
                        assets: true,
                        chunks: false, // Makes the build much quieter
                        chunkModules: false,
                        modules: false,
                        children: true,
                        errorDetails: true,
                        colors: true
                    }) +
                    "\r\n\r\n"
            );
        }
    };

    webpack(webpackConfigs[0], function(err, stats) {
        callback(err, stats);
        // build others when dll build finished
        if (!err) {
            webpackConfigs.slice(1).forEach(webpackConfig => {
                webpack(webpackConfig, callback);
            });
        }
    });
}
