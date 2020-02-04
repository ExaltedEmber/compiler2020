import { error } from "console";
export

    class Grammar {
    grammarMap: Map<string, RegExp> = new Map();
    constructor(s: string) {
        let lines = s.split("\n");

        for (let num = 0; num < lines.length - 1; num++) {
            let s2 = lines[num].split("->");
            let lhs = s2[0].trim();
            let rhs = s2[1].trim();
            if (this.grammarMap.has(lhs)) {
                throw new error("Identifier already exists");
            }
            else {
                try {
                    //console.log(rhs);
                    let r = new RegExp(rhs);
                    this.grammarMap.set(lhs, r);
                }
                catch(e)
                {
                    throw new error("Invalid Regex")
                }
            }
        }
    }
}