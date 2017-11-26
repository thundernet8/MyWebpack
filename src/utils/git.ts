// import * as path from "path";
import * as git from "simple-git/promise";

export interface IPullOption {
    "--rebase"?: "true" | "false";
}

export default class GitHelper {
    private git;

    public constructor(path?: string) {
        this.git = git(path);
    }

    public checkStatus() {
        return this.git.status();
    }

    public pull(
        branch: string,
        options?: IPullOption,
        remote: string = "origin"
    ) {
        return this.git.pull(remote, branch, options);
    }

    public add(fileGlog: string) {
        return this.git.add(fileGlog);
    }

    public commit(msg: string) {
        return this.git.commit(msg);
    }

    public async push(branch?: string, remote: string = "origin") {
        if (!branch) {
            branch = await this.getCurrentBranch();
        }
        return this.git.push(remote, branch);
    }

    // helpers
    public async getCurrentBranch() {
        const stats = await this.checkStatus();
        return stats.current;
    }

    public getLatestCommit(): Promise<string> {
        return this.git.log(["-1"]).then(log => log.latest.hash);
    }
}
