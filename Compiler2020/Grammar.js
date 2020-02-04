"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const console_1 = require("console");
class Grammar {
    constructor(s) {
        this.grammarMap = new Map();
        let lines = s.split("\n");
        for (let num = 0; num < lines.length - 1; num++) {
            let s2 = lines[num].split("->");
            let lhs = s2[0].trim();
            let rhs = s2[1].trim();
            if (this.grammarMap.has(lhs)) {
                throw new console_1.error("Identifier already exists");
            }
            else {
                try {
                    //console.log(rhs);
                    let r = new RegExp(rhs);
                    this.grammarMap.set(lhs, r);
                }
                catch (e) {
                    throw new console_1.error("Invalid Regex");
                }
            }
        }
    }
}
exports.Grammar = Grammar;
//# sourceMappingURL=Grammar.js.map