export

class Grammar
{
    terminals: Map<string, RegExp> = new Map(); //Above empty line
    nonterminals: Map<string, string[][]> = new Map();  //after empty line
    nullable: Set<string> = new Set(); // nullables
    //first and follow sets go here too 
    constructor(s: string)
    {
        let lines = s.split("\n");
        let terminalPhase = true;

        for (let num = 0; num < lines.length - 1; num++) {

            if (lines[num] == "")
            {
                terminalPhase = !terminalPhase;
                continue;
            }

            let s2 = lines[num].split("->");
            let lhs = s2[0].trim();
            let rhs = s2[1].trim();

            if (terminalPhase) { // TERMINALS (as in previous labs)
                if (this.terminals.has(lhs)) {
                    throw new console.error("terminal already exists");
                }
                else {
                    try {
                        //console.log(rhs);
                        let r = new RegExp(rhs, "gy");
                        this.terminals.set(lhs, r);
                    }
                    catch (e) {
                        throw new console.error("Invalid Regex");
                    }
                }
            }
            else {

                if (this.terminals.has(lhs))
                    throw new console.error("nonterminal exists as terminal");

                let endArray = [];
                let rhsSplit = rhs.split("|");
                for (let elem of rhsSplit) {
                    let innerArray = elem.split(" ");
                    let cleanArray = []
                    for (let z of innerArray)
                        if (z != "") {
                            cleanArray.push(z);
                        }

                    endArray.push(cleanArray);
                }
                if (!this.nonterminals.has(lhs)) {
                    this.nonterminals.set(lhs, endArray);
                }
                else {
                    for (let a of endArray)
                        this.nonterminals.get(lhs).push(a);
                }
            }

        }

        let visited = new Set<string>();
        this.searchGrammar(visited, this.nonterminals.keys().next().value);
        
        for (let t of this.terminals)
            if (!visited.has(t[0]))
                throw new console.error("Unused Terminal");

        for (let t of this.nonterminals)
            if (!visited.has(t[0]))
                throw new console.error("Unused Nonterminal");

        for (let t of visited)
            if (!this.terminals.has(t) && !this.nonterminals.has(t))
                throw new console.error("Undefined Symbol");

        if (!this.terminals.has("WHITESPACE")) {
            let r = new RegExp("\\s+", "gy");
            this.terminals.set("WHITESPACE", r);
        }

    }

    searchGrammar(visited: Set<string>, curr: string)
    {
        if (visited.has(curr))
            return;
        visited.add(curr);
        if (this.terminals.has(curr))
            return;
        for (let prod of this.nonterminals.get(curr)) {
            for (let elem of prod) {
                this.searchGrammar(visited, elem)
            }
        }
    }

    getNullable(){
        this.nullable = new Set()
        //repeat                 until nullable stabilizes
        /*        
        let nullable = empty set
        repeat
        for each nonterminal N:
            if N not in nullable:
                for all productions P with lhs of N:
                    if all symbols in P are nullable:
                         if N is not in nullable:
                            nullable = union(nullable, N)
        until nullable stabilizes*/

        let stable = true;
        do {
            stable = true;
            for (let N of this.nonterminals.keys()) {
                if (!this.nullable.has(N)) {
                    //for all productions P with lhs of N:
                    for (let P of this.nonterminals.get(N)) {
                        if (P.every((sym: string) => { return this.nullable.has(sym) || sym == "lambda" })) {
                            if (!this.nullable.has(N)) {
                                this.nullable.add(N);
                                stable = false;
                            }
                        }
                    }
                }
            }
        }
        while (!stable)

        return this.nullable;
    }
}