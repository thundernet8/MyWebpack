import * as webpack from "webpack";
import getDllConfig from "../webpack/dll";
import getDevConfig from "../webpack/dev";
import getProdConfig from "../webpack/prod";

export default function build(config) {
    const compilers = [];
    compilers.push(webpack(getDllConfig(config)));

    compilers.push(
        webpack(
            process.env.NODE_ENV !== "production"
                ? getDevConfig(config)
                : getProdConfig(config)
        )
    );

    compilers.forEach(compiler => {
        compiler.run(function(err, stats) {
            if (err) {
                throw err;
            } else {
                console.log(stats);
            }
        });
    });
}
