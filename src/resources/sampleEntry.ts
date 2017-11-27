import * as React from "react";
import * as ReactDOM from "react-dom";

import A from "../views/A";

declare var module;

function render(App: any) {
    const target: HTMLElement = document.getElementById("app") as HTMLElement;
    ReactDOM.unmountComponentAtNode(target);
    ReactDOM.render(App, target);
}

render(A);

//accept self
if (module.hot) {
    module.hot.accept(() => {
        render(A);
    });
}
