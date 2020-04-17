export

class Grammar
{
    terminals: Map<string, RegExp> = new Map(); //Above empty line
    nonterminals: Map<string, string[][]> = new Map();  //after empty line
    nullable: Set<string> = new Set(); // nullables
    //first and follow sets go here too 
    first: Map<string, Set<string>> = new Map();
    follow: Map<string, Set<string>> = new Map();
    constructor(s: string)
    {
        let lines = s.split("\n");
        let terminalPhase = true;  

        for (let num = 0; num < lines.length - 1; num++) {

            if (lines[num] == "")
            {
                terminalPhase = false; //!terminalPhase
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
                        if (z != "" && z != "lambda") {
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

        this.getNullable();
        this.getFirst();

     

        /*
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
        }*/

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
        let stable = true;
        do {
            stable = true;
            for (let N of this.nonterminals.keys()) {
                if (!this.nullable.has(N)) {
                    //for all productions P with lhs of N:
                    for (let P of this.nonterminals.get(N)) {
                        if (P.length > 0) {
                            if (P.every((sym: string) => { return this.nullable.has(sym) })) {
                                if (!this.nullable.has(N)) {
                                    this.nullable.add(N);
                                    stable = false;
                                }
                            }
                        }
                        else {
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

    getFirst() {
        for (let t of this.terminals.keys()) {
            this.first.set(t, new Set<string>().add(t));
        }
        let count = 0;
        let stable = true;
        do {
            stable = true;
            for (let N of this.nonterminals.keys()) {
                let s = this.first.get(N);
                if (s == undefined) {
                    s = new Set<string>();
                }
                let startSize = s.size;
                for (let P of this.nonterminals.get(N)) {
                    for (let x of P) {
                        if (x == N) {
                            break;
                        }
                        else if (!this.nonterminals.has(x)) {
                            s.add(x);
                            stable = false;
                            break;
                        }
                        else{
                            if (this.first.has(x)) {
                                let s2 = this.first.get(x);
                                s2.forEach(s.add, s)

                            }
                            if (!this.nullable.has(x))
                                break;
                        }
                    }
                }
                if (startSize < this.first.size) {
                    stable = false;
                    this.first.set(N, s);
                }
            }
            count++;
        }
        while(!stable && count <= this.nonterminals.size + 50)
        return this.first;
    }

    getFollow() {
        this.follow.set(this.nonterminals.keys().next().value, new Set<string>().add("$"));
        let stable = true;
        let didBreak = false;
        do {
            stable = true;
            for (let N of this.nonterminals.keys()) {
                for (let P of this.nonterminals.get(N)) {
                    for (let i = 0; i < P.length; i++) {        
                        let x = P[i];
                        if (this.nonterminals.has(x)) {
                            let xFollow = this.follow.get(x);
                            if (xFollow == undefined) {
                                xFollow = new Set<string>();
                            }

                            for (let j = i + 1; j < P.length; j++) {
                                let y = P[j];
                                if (this.nonterminals.has(y)) {
                                   
                                    let yFirst = this.first.get(y);
                                    for (let z of yFirst) {
                                        if (!xFollow.has(z)) {
                                            xFollow.add(z);
                                            stable = false;
                                        }
                                    }

                                    if (!this.nullable.has(y)) {
                                        break;
                                    }

                                }
                                else {

                                    if (!xFollow.has(y)) {
                                        xFollow.add(y);
                                        stable = false;
                                    }
                                    break;
                                }
                                if (j == P.length - 1) {
                                    if (this.follow.has(N)) {
                                        for (let nf of this.follow.get(N)) {
                                            if (!xFollow.has(nf)) {
                                                xFollow.add(nf);
                                                stable = false;
                                            }
                                        }
                                    }
                                    else {
                                        stable = false
                                    }
                                }
                            }
                            if (i == P.length - 1 && this.nonterminals.has(x)) {
                                if (this.follow.has(N)) {
                                    for (let nf of this.follow.get(N)) {
                                        if (!xFollow.has(nf)) {
                                            xFollow.add(nf);
                                            stable = false;
                                        }
                                    }
                                }
                                else {
                                    stable = false
                                }
                            }
                            this.follow.set(x, xFollow);
                        }
                    }
                }
            }
        }
        while (!stable)
        return this.follow;

    }


    printTest() {

        console.log(this.nullable);
        for (let p of this.nonterminals.keys()) {
            console.log(p + "=> \t" + this.nonterminals.get(p));
            console.log("first: \t");
            console.log(this.first.get(p));
            console.log("follow: \t");
            console.log(this.follow.get(p));
            console.log("\n");

        }
    }

}
