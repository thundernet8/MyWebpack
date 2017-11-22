import build from "./build";
import * as WebpackDevServer from "webpack-dev-server";
import * as gutil from "gutil";

export default function start(config) {
    build(config, function(compiler, webpackConfig) {
        const devServerOptions = Object.assign({}, webpackConfig.devServer, {
            before: function(app) {
                app.use((req, res, next) => {
                    // console.log(`Using middleware for ${req.url}`);
                    next();
                });
            }
        });
        const server = new WebpackDevServer(compiler, devServerOptions);

        server.listen(devServerOptions.port, devServerOptions.host, function() {
            gutil.log(
                `Starting dev server on ${devServerOptions.host}:${
                    devServerOptions.port
                }`
            );
        });
    });
}
