"use strict";
//in Tokenizer.ts
Object.defineProperty(exports, "__esModule", { value: true });
const Token_1 = require("./Token");
class Tokenizer {
    constructor(grammar) {
        this.grammar = grammar;
    }
    setInput(inputData) {
        this.inputData = inputData;
        this.lineNumber = 1;
        this.idx = 0;
    }
    next() {
        if (this.idx >= this.inputData.length - 1) {
            //special "end of file" metatoken
            return new Token_1.Token("$", undefined, this.lineNumber);
        }
        //this.grammar.terminals.forEach((value: RegExp, key: string) => {
        for (let sym of this.grammar.terminals.keys()) {
            let rex = this.grammar.terminals.get(sym); //RegExp
            rex.lastIndex = this.idx; //tell where to start searching
            let m = rex.exec(this.inputData); //do the search
            if (m) {
                let lexeme = m[0];
                let tempLineNum = this.lineNumber;
                let newline = lexeme.split('\n');
                this.lineNumber += newline.length - 1;
                this.idx += lexeme.length;
                if (sym !== "WHITESPACE" && sym !== "COMMENT") {
                    //return new Token using sym, lexeme, and line number
                    return new Token_1.Token(sym, lexeme, tempLineNum);
                }
                else {
                    //skip whitespace and get next real token
                    return this.next();
                }
            }
        }
        //no match; syntax error
        throw new Error("No Match, Syntax Error");
    }
}
exports.Tokenizer = Tokenizer;
//# sourceMappingURL=Tokenizer.js.map