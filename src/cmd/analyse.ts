import build from "./build";
import { IMPKConfig } from "../index.d";

export default function analyze(config: IMPKConfig) {
    return build(config);
}
