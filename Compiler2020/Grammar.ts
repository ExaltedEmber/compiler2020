export

    class Grammar {
    terminals: Map<string, RegExp> = new Map();
    
    constructor(s: string) {
        let lines = s.split("\n");

        for (let num = 0; num < lines.length - 1; num++) {
            let s2 = lines[num].split("->");
            let lhs = s2[0].trim();
            let rhs = s2[1].trim();
            if (this.terminals.has(lhs)) {
                throw new console.error("Identifier already exists");
            }
            else {
                try {
                    //console.log(rhs);
                    let r = new RegExp(rhs, "gy");
                    this.terminals.set(lhs, r);
                }
                catch(e)
                {
                    throw new console.error("Invalid Regex")
                }
            }
        }

        if (!this.terminals.has("WHITESPACE")) {
            let r = new RegExp("\\s+", "gy");
            this.terminals.set("WHITESPACE", r);
        }

    }
}