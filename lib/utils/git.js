"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const git = require("simple-git/promise");
class GitHelper {
    constructor(path) {
        this.git = git(path);
    }
    checkStatus() {
        return this.git.status();
    }
    pull(branch, options, remote = "origin") {
        return this.git.pull(remote, branch, options);
    }
    add(fileGlog) {
        return this.git.add(fileGlog);
    }
    commit(msg) {
        return this.git.commit(msg);
    }
    push(branch, remote = "origin") {
        return __awaiter(this, void 0, void 0, function* () {
            if (!branch) {
                branch = yield this.getCurrentBranch();
            }
            return this.git.push(remote, branch);
        });
    }
    getCurrentBranch() {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield this.checkStatus();
            return stats.current;
        });
    }
    getLatestCommit() {
        return this.git.log(["-1"]).then(log => log.latest.hash);
    }
}
exports.default = GitHelper;
