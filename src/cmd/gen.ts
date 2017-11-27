import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import * as prettier from "prettier";

export default function gen(config) {
    const { entryRoot } = config.mpk;

    // generate entries
    const yamlFile = fs.readFileSync(path.join(process.cwd(), "routes.yaml"));
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
                .map((item, index) => (index === 0 ? item.toUpperCase() : item))
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

        function render(App: any) {
            const target: HTMLElement = document.getElementById("app") as HTMLElement;
            ReactDOM.unmountComponentAtNode(target);
            ReactDOM.render(App, target);
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
                path.join(process.cwd(), `${entryRoot}/${route.chunk}.ts`)
            ),
            prettier.format(code.join(""), prettierConfig)
        );
    });
}
