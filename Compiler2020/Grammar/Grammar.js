"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
class Grammar {
    constructor(s) {
        this.grammarMap = new Map();
        let lines = s.split("\n");
        for (let exp in lines) {
            let s2 = exp.split("->");
            if (this.grammarMap.has(s2[1])) {
                throw new util_1.error("Identifier already exists");
            }
            else {
                this.grammarMap.set(s2[1], s2[2]);
            }
        }
    }
}
//# sourceMappingURL=Grammar.js.map