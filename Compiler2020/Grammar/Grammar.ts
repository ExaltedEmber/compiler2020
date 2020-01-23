import { error } from "util";

class Grammar {
    grammarMap: Map<string, string> = new Map();
    constructor(s: string) {
        let lines = s.split("\n");

        for (let exp in lines) {
            let s2 = exp.split("->");
            if (this.grammarMap.has(s2[1])) {
                throw new error("Identifier already exists");
            }
            else {
                this.grammarMap.set(s2[1], s2[2]);
            }
        }



    }



}