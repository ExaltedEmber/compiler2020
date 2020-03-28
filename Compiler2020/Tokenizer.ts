//in Tokenizer.ts

import { Token } from "./Token"
import { Grammar } from "./Grammar"

export class Tokenizer {
    grammar: Grammar;
    inputData: string;
    idx: number;    //index of next unparsed char in inputData
    lineNumber: number;

    constructor(grammar: Grammar) {
        this.grammar = grammar;
    }
    setInput(inputData: string) {
        this.inputData = inputData;
        this.lineNumber = 1;
        this.idx = 0;
    }
    next(): Token {

        if (this.idx >= this.inputData.length-1) {
            //special "end of file" metatoken
            return new Token("$", undefined, this.lineNumber);
        } 

        //this.grammar.terminals.forEach((value: RegExp, key: string) => {
        for (let sym of this.grammar.terminals.keys())
        {
            let rex = this.grammar.terminals.get(sym);     //RegExp
            rex.lastIndex = this.idx;   //tell where to start searching
            let m = rex.exec(this.inputData);   //do the search
            if (m) {
                let lexeme = m[0];

                let tempLineNum = this.lineNumber;
                let newline = lexeme.split('\n');
                this.lineNumber += newline.length - 1;

                this.idx += lexeme.length;

                if (sym !== "WHITESPACE" && sym !== "COMMENT") {
                    //return new Token using sym, lexeme, and line number
                    return new Token(sym, lexeme, tempLineNum);

                } else {
                    //skip whitespace and get next real token
                    return this.next();
                }
            }
        }
        //no match; syntax error
        throw new Error("No Match, Syntax Error");

    }
}