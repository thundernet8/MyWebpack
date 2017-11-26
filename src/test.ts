import * as inquirer from "inquirer";
import * as SearchCheckbox from "inquirer-search-checkbox";

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
            validate: function(answer) {
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
