"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer = require("inquirer");
const SearchCheckbox = require("inquirer-search-checkbox");
inquirer.registerPrompt("SearchCheckbox", SearchCheckbox);
const entryKeys = ["A", "B"];
inquirer
    .prompt([
    {
        type: "SearchCheckbox",
        name: "key",
        message: `Select entries to build (${entryKeys.length})`,
        choices: entryKeys.map(name => ({ name })),
        pageSize: 5,
        validate: function (answer) {
            if (answer.length < 1) {
                return "You must choose at least one entry.";
            }
            return true;
        }
    }
])
    .then(x => {
    console.log(x);
});
