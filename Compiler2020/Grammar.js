"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
class Grammar {
    constructor(s) {
        this.grammarMap = new Map();
        let lines = s.split("\n");
        for (let num = 0; num < lines.length - 1; num++) {
            let s2 = lines[num].split("->");
            let lhs = s2[0].trim();
            let rhs = s2[1].trim();
            if (this.grammarMap.has(lhs)) {
                throw new util_1.error("Identifier already exists");
            }
            else {
                try {
                    //console.log(rhs);
                    let r = new RegExp(rhs);
                    this.grammarMap.set(lhs, r);
                }
                catch (e) {
                    throw new util_1.error("Invalid Regex");
                }
            }
        }
    }
}
exports.Grammar = Grammar;
//# sourceMappingURL=Grammar.js.map