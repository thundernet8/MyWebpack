import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import * as prettier from "prettier";
import log from "../utils/log";
import { IMPKConfig } from "../index.d";

export default function gen(config: IMPKConfig) {
    const { entryRoot } = config.mpk;

    // generate entries
    const yamlFile = fs.readFileSync(path.join(process.cwd(), "entry.yaml"));
    const yamlContent = yaml.safeLoad(yamlFile);

    const entries = yamlContent.map(item => {
        let { path: routePath, module: moduleName, chunk, exact } = item;
        return {
            routePath,
            moduleName,
            chunk,
            exact,
            componentName: chunk
                .split("")
                .map(
                    (letter, index) =>
                        index === 0 ? letter.toUpperCase() : letter
                )
                .join("")
        };
    });

    const header = `/**\r\n * Generated on ${new Date().toUTCString()} \r\n * 本文件由entry.yaml模板生成, 请不要直接修改\r\n */\r\n\r\n`;
    const prettierConfig = {
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
        bracketSpacing: true,
        parser: "typescript"
    };

    entries.forEach(route => {
        if (!route.routePath) {
            route.routePath = "";
        }

        let code = [header];

        code.push(`import * as React from "react";
        import * as ReactDOM from "react-dom";
        import ${route.componentName} from "../views/${route.chunk}";

        declare var module;

        function render(App: React.ReactElement<any>) {
            const target: HTMLElement = document.getElementById("app") as HTMLElement;
            ReactDOM.unmountComponentAtNode(target);
            ReactDOM.render(<App />, target);
        }

        render(${route.componentName});

        if (module.hot) {
            module.hot.accept(() => {
                render(${route.componentName});
            });
        }
        `);

        // entries
        fs.writeFileSync(
            path.join(
                path.join(process.cwd(), `${entryRoot}/${route.chunk}.tsx`)
            ),
            prettier.format(code.join(""), prettierConfig)
        );
    });

    log.success(`\r\n🎉  Generated ${entries.length} entries successfully.`);
}
