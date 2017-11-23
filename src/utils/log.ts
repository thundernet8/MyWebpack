import * as fs from "fs";
// import * as path from "path";

export default function log(log) {
    fs.writeFileSync(".mpk/test.log", log + "\r\n", { flag: "a" });
}
