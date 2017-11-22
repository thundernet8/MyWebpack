import * as webpack from "webpack";
import * as gutil from "gutil";
import getDllConfig from "../webpack/dll";
import getDevConfig from "../webpack/dev";
import getProdConfig from "../webpack/prod";
import { Compiler } from "webpack";

export default function build(
    config,
    cb?: (compiler: Compiler, webpackConfig) => void
) {
    const webpackConfigs = [];
    webpackConfigs.push(getDllConfig(config));
    webpackConfigs.push(
        process.env.NODE_ENV !== "production"
            ? getDevConfig(config, {
                  filename: "index.html",
                  template: "index.html"
              })
            : getProdConfig(config)
    );

    const callback = function(err, stats, end: boolean = true) {
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

        if (end && cb) {
            cb(this, webpackConfigs[1]);
        }
    };

    webpack(webpackConfigs[0], function(err, stats) {
        callback(err, stats, false);
        // build others when dll build finished
        if (!err) {
            const compiler = webpack(webpackConfigs[1]);
            compiler.run(callback.bind(compiler));
        }
    });
}
