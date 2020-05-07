import { TreeNode } from"./parser";

enum VarType {
    INTEGER,
    FLOAT,
    STRING,
    VOID
}

class VarInfo {
    type: VarType;
    location: string; //asm label
    constructor(t: VarType, location: string) {
        this.location = location;
        this.type = t;
    }

}

class SymbolTable {
    table: Map<string, VarInfo>;
    constructor() {
        this.table = new Map();
    }
    get(name: string) {
        if (!this.table.has(name))
            throw new console.error("DNE");
        return this.table.get(name);
    }
    set(name: string, v: VarInfo) {
        if (this.table.has(name))
            throw new console.error("Redeclaration");
        this.table.set(name, v);
    }
    has(name: string) {
        return this.table.has(name);
    }
}

let asmCode: string[] = [];
//----------------------------------these shouldn't be up here I guess bc redeclaration
let symtable = new SymbolTable();
let stringPool= new Map<string, string>();    //key=string const, val=label

function emit(instr: string) {
    asmCode.push(instr);
}

function ICE() {
    throw new console.error("Internal Compiler Error");
}

export function makeAsm(root: TreeNode) {
    symtable = new SymbolTable;
    stringPool = new Map<string, string>();
    asmCode = [];
    labelCounter = 0;
    emit("%include \"doCall.asm\" ");
    emit("default rel");
    emit("section .text");
    emit("global main");
    emit("main:");
    emit("mov arg0, 0");
    emit("mov arg1, string_r");
    emit("ffcall fdopen");
    emit("mov [stdin], rax");
    emit("mov arg0, 1");
    emit("mov arg1, string_w");
    emit("ffcall fdopen");
    emit("mov [stdout], rax");

    programNodeCode(root);
    emit("ret");
    emit("section .data");
    emit("stdin: dq 0");
    emit("stdout: dq 0");
    emit("string_r: db 'r', 0");
    emit("string_w: db 'w', 0");
    emit("string_a: db 'a', 0");
    emit("string_rplus db 'r+', 0");
    emit("string_percent_s: db '%s', 0");
    emit("string_percent_d: db '%d', 0");
    emit("fgets_buffer: times 64 db 0");
    emit("now: dq 0");
    emit("nowAsTm: dq 0");
    emit("p: dq 0");
    outputSymbolTableInfo();
    outputStringPoolInfo();
    return asmCode.join("\n");
}


function programNodeCode(n: TreeNode) {
    //program -> var_decl_list braceblock
    if (n.sym != "program")
        ICE();
    vardecllistNodeCode(n.children[0]);
    braceblockNodeCode(n.children[1]);
}

function braceblockNodeCode(n: TreeNode) {
    //braceblock -> LBR stmts RBR
    stmtsNodeCode(n.children[1]);
}

function stmtsNodeCode(n: TreeNode) {
    //stmts -> stmt stmts | lambda
    if (n.children.length == 0)
        return;
    stmtNodeCode(n.children[0]);
    stmtsNodeCode(n.children[1]);
}

function stmtNodeCode(n: TreeNode) {
    //stmt -> cond | loop | return_stmt SEMI | assign SEMI
    let c = n.children[0];
    switch (c.sym) {
        case "cond":
            condNodeCode(c); break;
        case "loop":
            loopNodeCode(c); break;
        case "return_stmt":
            returnstmtNodeCode(c); break;
        case "assign":
            assignNodeCode(c); break;
        case "func_call":
            funccallNodeCode(c); break;
        default:
            ICE();
    }
}

function assignNodeCode(n: TreeNode) {
    // assign -> ID EQ expr
    let t: VarType = exprNodeCode(n.children[2]);
    let vname = n.children[0].token.lexeme;
    if (symtable.get(vname).type !== t)
        throw new console.error("Type Mismatch");
    moveBytesFromStackToLocation(symtable.get(vname).location);
}

function vardecllistNodeCode(n: TreeNode)
{
    //var_decl_list -> var_decl SEMI var_decl_list | ;
    if (n.children.length == 0)
        return;
    vardeclNodeCode(n.children[0]);
    vardecllistNodeCode(n.children[2]);
}


function vardeclNodeCode(n: TreeNode) {
    //var-decl -> TYPE var_decl_chain | TYPE assign
    if (n.children[1].sym == "var_decl_chain") {
        let vtype = typeNodeCode(n.children[0]);
        vardeclchainNodeCode(n.children[1], vtype);
    }
    else {
        let vtype = typeNodeCode(n.children[0]);
        let vname = n.children[1].children[0].token.lexeme;
        symtable.set(vname, new VarInfo(vtype, label()));
        assignNodeCode(n.children[1]);

    }
}

function vardeclchainNodeCode(n: TreeNode, vtype: VarType) {
    //var_decl_chain -> ID | ID COMMA var_decl_chain
    if (n.children.length == 1) {
        let vname = n.children[0].token.lexeme;
        symtable.set(vname, new VarInfo(vtype, label()));
    }
    else {
        let vname = n.children[0].token.lexeme;
        symtable.set(vname, new VarInfo(vtype, label()));
        vardeclchainNodeCode(n.children[2], vtype);
    }

}


function typeNodeCode(n: TreeNode): VarType {
    //TYPE
    switch (n.token.lexeme) {
        case "int": return VarType.INTEGER; break;
        case "double": return VarType.FLOAT; break;
        case "string": return VarType.STRING; break;
    }
}

function returnstmtNodeCode(n: TreeNode): VarType {
    //return_stmt -> RETURN expr
    let exprType = exprNodeCode(n.children[1]);    // move result from expr to rax

    if (exprType == VarType.INTEGER) {
        emit("pop rax");
        emit("ret");
    }
    else if (exprType == VarType.FLOAT) {
        emit("movq xmm0, [rsp]");
        emit("add rsp, 8");
        emit("cvtsd2si rax, xmm0");
        emit("ret");
    }
    return VarType.INTEGER;
}

function exprNodeCode(n: TreeNode): VarType {
    return orexpNodeCode(n.children[0]);
}

function orexpNodeCode(n: TreeNode): VarType {
    //orexp -> orexp OR andexp | andexp
    if (n.children.length === 1) {
        return andexpNodeCode(n.children[0]);
    } else {
    //more code
        let orexpType = orexpNodeCode(n.children[0]);
        convertStackTopToZeroOrOneInteger(orexpType);
        let lbl = label();
        emit("cmp qword [rsp], 0");
        emit(`jne ${lbl}`);
        emit("add rsp,8");      //discard left result (0)
        let andexpType = andexpNodeCode(n.children[2]);
        convertStackTopToZeroOrOneInteger(andexpType);
        emit(`${lbl}:`);
        return VarType.INTEGER;   //always integer, even if float operands

    }
}


function andexpNodeCode(n: TreeNode): VarType {
    //andexp -> andexp AND notexp | notexp
    if (n.children.length === 1) {
        return notexpNodeCode(n.children[0]);
    } else {
        //more code
        let andexpType = andexpNodeCode(n.children[0]);
        convertStackTopToZeroOrOneInteger(andexpType);
        let lbl = label();
        emit("cmp qword [rsp], 0");
        emit(`je ${lbl}`);
        emit("add rsp,8");      //discard left result (1)
        let notexpType = notexpNodeCode(n.children[2]);
        convertStackTopToZeroOrOneInteger(andexpType);
        emit(`${lbl}:`);
        return VarType.INTEGER;   //always integer, even if float operands
    }
}

function notexpNodeCode(n: TreeNode): VarType {
    //notexp -> NOT notexp | rel
    if (n.children.length === 1) {
        return relNodeCode(n.children[0]);
    } else {
        let notexpType = notexpNodeCode(n.children[1]);
        convertStackTopToZeroOrOneInteger(notexpType);
        emit("xor qword [rsp], 1");
        return VarType.INTEGER;   //always integer, even if float operands
    }
}

function sumNodeCode(n: TreeNode): VarType {
    //sum -> sum PLUS term | sum MINUS term | term
    if (n.children.length === 1)
        return termNodeCode(n.children[0]);
    else {
        let sumType = sumNodeCode(n.children[0]);
        let termType = termNodeCode(n.children[2]);
        if (sumType != termType)
            throw new console.error("Bad Type");
        if (sumType == VarType.INTEGER) {
            emit("pop rbx");    //second operand
            emit("pop rax");    //first operand
            switch (n.children[1].sym) {
                case "PLUS":
                    emit("add rax, rbx");
                    break;
                case "MINUS":
                    emit("sub rax, rbx");
                    break;
                default:
                    ICE
            }
            emit("push rax");
            return VarType.INTEGER;
        }
        else if (sumType == VarType.FLOAT) {
            emit("movq xmm1, [rsp]");    //second operand
            emit("add rsp, 8");
            emit("movq xmm0, [rsp]");    //first operand
            emit("add rsp, 8");

            switch (n.children[1].sym) {
                case "PLUS":
                    emit("addsd xmm0, xmm1");
                    break;
                case "MINUS":
                    emit("subsd xmm0, xmm1");
                    break;
                default:
                    ICE
            }
            emit("sub rsp,8");
            emit("movq [rsp], xmm0");
            return VarType.FLOAT;
        }
    }
}

function termNodeCode(n: TreeNode): VarType {
    //term -> term MULOP neg | neg
    if (n.children.length == 1)
        return negNodeCode(n.children[0]);
    else {
        let termType = termNodeCode(n.children[0]);
        let negType = negNodeCode(n.children[2]);
        if (negType != termType)
            throw new console.error("Bad Type");
        if (negType == VarType.INTEGER) {
            emit("pop rbx");    //second operand
            emit("pop rax");    //first operand
            switch (n.children[1].token.lexeme) {
                case "*":
                    emit("imul rax, rbx");
                    emit("push rax");
                    break;
                case "/":
                    emit("xor qword rdx, rdx");
                    emit("idiv rbx");
                    emit("push rax");
                    break;
                case "%":
                    emit("xor qword rdx, rdx");
                    emit("idiv rbx");
                    emit("push rdx");
                    break;
                default:
                    ICE
            }
            return VarType.INTEGER;
        }
        else if (negType == VarType.FLOAT) {
            emit("movq xmm1, [rsp]");   //2nd
            emit("add rsp, 8");
            emit("movq xmm0, [rsp]"); //1st
            emit("add rsp, 8");
            switch (n.children[1].token.lexeme) {
                case "*":
                    emit("mulsd xmm0, xmm1");
                    break;
                case "/":
                    emit("divsd xmm0, xmm1");
                    break;
                default:
                    ICE
            }
            emit("sub rsp, 8");
            emit("movq [rsp], xmm0");
            return VarType.FLOAT;
        }
    }
}

function negNodeCode(n: TreeNode): VarType {
    //neg -> MINUS neg | typecast
    if (n.children.length == 1)
        return typecastNodeCode(n.children[0]);
    else {
        let negType = negNodeCode(n.children[1]);
        if (negType == VarType.INTEGER) {
            emit("pop rax");
            emit("xor qword rbx, rbx"); //0
            emit("sub rbx, rax");   //0 - number
            emit("push rbx");
            return VarType.INTEGER;
        }
        else if (negType == VarType.FLOAT) {
            emit("movq xmm0, [rsp]");
            emit("xorps xmm1, xmm1");
            emit("subsd xmm1, xmm0");
            emit("movq [rsp], xmm1");
            return VarType.FLOAT;
        }
    }
}

function typecastNodeCode(n: TreeNode): VarType {
    //typecast -> LP TYPE RP typecast | factor
    if (n.children.length == 1)
        return factorNodeCode(n.children[0]);
    else {
        let typecastType = typecastNodeCode(n.children[3]);
        switch (n.children[1].token.lexeme) {
            case "int":
                if (typecastType == VarType.INTEGER)
                    return VarType.INTEGER;
                emit("movq xmm0, [rsp]");
                emit("add rsp, 8");
                emit("roundsd xmm0, xmm0, 3")
                emit("cvtsd2si rax, xmm0");
                emit("push rax");
                return VarType.INTEGER;
                break;
            case "double":
                if (typecastType == VarType.FLOAT)
                    return VarType.FLOAT;
                emit("pop rax");
                emit("cvtsi2sd xmm0, rax");
                emit("sub rsp, 8");
                emit("movq [rsp], xmm0");
                return VarType.FLOAT;
                break;
            default:
                ICE();
        }

    }
}


function factorNodeCode(n: TreeNode): VarType {
    //factor -> NUM | FPNUM | LP expr RP | STRING_CONSTANT | ID | func-call
    let child = n.children[0];
    switch (child.sym) {
        case "NUM":
            let v = parseInt(child.token.lexeme, 10);
            emit(`push qword ${v}`)
            return VarType.INTEGER;
        case "LP":
            return exprNodeCode(n.children[1]);
        case "FPNUM":
            let f = parseFloat(child.token.lexeme);
            let fs = f.toString();
            if (!fs.includes("."))
                fs = fs.concat(".0");
            emit(`mov rax, __float64__(${fs})`);
            emit(`push rax`);
            return VarType.FLOAT;
        case "ID":
            //make sure ID exists, unnecessary check but doesn't hurt
            if (!symtable.has(child.token.lexeme))
                throw new console.error("ID does not exist");
            let v2 = symtable.get(child.token.lexeme);  //pull value from memory (if var is number, var holds value. if var is string, var holds address);
            emit(`push qword [${v2.location}]`);        //push to stack 
            return symtable.get(child.token.lexeme).type;
        case "STRING_CONSTANT":
            let adr = stringconstantNodeCode(n.children[0]);
            emit(`push qword ${adr}`);  // Push address to stack
            return VarType.STRING;
        case "func_call":
            let type = funccallNodeCode(n.children[0]);
            if (type === VarType.VOID)
                throw new console.error("No Void");
                //error: Can't use void in expression
            emit("push rax");
            return type;
            break;        default:
            ICE();
    }
}

function stringconstantNodeCode(n: TreeNode) {
    let s = n.token.lexeme;
    //strip leading and trailing quotation marks
    s = s.substring(1, s.length-1)
    let s2 = "";
    //handle backslash escapes    // \\ \n \"
    for (let i = 0; i < s.length; i++) {
        if (s[i] === "\\") {
            if (s[i + 1] === "\"") {
                s2 += "\"";
                i += 1;
            }
            else if (s[i + 1] === "n") {
                s2 += "\n";
                i += 1;
            }
            else if (s[i + 1] == "\\") {
                s2 += "\\"
                i += 1;
            }
            else {
                s2 += s[i];
            }
        }
        else {
            s2 += s[i];
        }
    }
    if (!stringPool.has(s2))
        stringPool.set(s2, label());
    return stringPool.get(s2); // return the label
}


function relNodeCode(n: TreeNode): VarType {
    //rel -> sum RELOP sum | sum
    if (n.children.length === 1)
        return sumNodeCode(n.children[0]);
    else {
        let sum1Type = sumNodeCode(n.children[0]);
        let sum2Type = sumNodeCode(n.children[2]);
        if (sum1Type != sum2Type)
            throw new console.error("Type Erorr");
        if (sum1Type == VarType.INTEGER) {
            emit("pop rax");    //second operand
            //first operand is on stack
            emit("cmp [rsp],rax");    //do the compare
            switch (n.children[1].token.lexeme) {
                case ">=": emit("setge al"); break;
                case "<=": emit("setle al"); break;
                case ">": emit("setg  al"); break;
                case "<": emit("setl  al"); break;
                case "==": emit("sete  al"); break;
                case "!=": emit("setne al"); break;
                default: ICE()
            }
            emit("movzx qword rax, al");   //move with zero extend
            emit("mov [rsp], rax");
            return VarType.INTEGER;
        }
        else if (sum1Type = VarType.FLOAT) {
            emit("movq xmm1, [rsp]");    //rhs operand
            emit("add rsp, 8");
            emit("movq xmm0, [rsp]"); //lhs operand
            switch (n.children[1].token.lexeme) {
                case ">=": emit("cmpnlesd  xmm0, xmm1"); break;
                case "<=": emit("cmplesd  xmm0, xmm1"); break;
                case ">": emit("cmpnltsd  xmm0, xmm1"); break;
                case "<": emit("cmpltsd  xmm0, xmm1"); break;
                case "==": emit("cmpeqsd  xmm0, xmm1"); break;
                case "!=": emit("cmpneqsd  xmm0, xmm1"); break;
                default: ICE()
            }
            emit("movq [rsp], xmm0");      // store into memory
            emit("and qword [rsp], 1");   // retain only lowest bit: 0 or 1 int64
            return VarType.INTEGER;
        }
    }
}

function condNodeCode(n: TreeNode) {
    //cond -> IF LP expr RP braceblock |
    //  IF LP expr RP braceblock ELSE braceblock

    if (n.children.length === 5) {
        //no 'else'
        exprNodeCode(n.children[2]);    //leaves result in rax
        emit("pop rax");
        emit("cmp rax, 0");
        var endifLabel = label();
        emit(`je ${endifLabel}`);
        braceblockNodeCode(n.children[4]);
        emit(`${endifLabel}:`);
    } else {
        // 'else'
        exprNodeCode(n.children[2]);    //leaves result in rax
        emit("pop rax");
        emit("cmp rax, 0");
        var endifLabel = label();
        var endelseLabel = label();
        emit(`je ${endifLabel}`);
        braceblockNodeCode(n.children[4]);
        emit(`jmp ${endelseLabel}`);
        emit(`${endifLabel}:`);
        braceblockNodeCode(n.children[6]);
        emit(`${endelseLabel}:`);
    }
}

function loopNodeCode(n: TreeNode) {
    // loop -> WHILE LP expr RP braceblock;
    var topLoop = label();
    var exitLoop = label();
    emit(`${topLoop}:`);
    exprNodeCode(n.children[2]);
    emit("pop rax");
    emit("cmp rax, 0");
    emit(`je ${exitLoop}`);
    braceblockNodeCode(n.children[4]);
    emit(`jmp ${topLoop}`);
    emit(`${exitLoop}:`)
}

function funccallNodeCode(n: TreeNode): VarType {
    return builtinfunccallNodeCode(n.children[0]);
}

function builtinfunccallNodeCode(n: TreeNode): VarType {
    //builtin-func-call -> PRINT LP expr RP | INPUT LP RP |
    //OPEN LP expr RP | READ LP expr RP | WRITE LP expr CMA expr RP CLOSE LP expr RP | NOW LP RP
    switch (n.children[0].sym) {
        case "OPEN":
            {
                let type = exprNodeCode(n.children[2]);
                if (type !== VarType.STRING)
                    throw new console.error("must be string");
                //tmp = fopen( filename, "a" );
                emit("mov arg0, [rsp]");        //filename (string)
                emit("mov arg1, string_a");    //next slide
                emit("ffcall fopen");
                //fclose(tmp)
                emit("mov arg0, rax")
                emit("ffcall fclose");
                //fopen( filename, "r+" )
                emit("pop arg0");        //filename; remove from stack
                emit("mov arg1, string_rplus"); //next slide
                emit("ffcall fopen");     //result is in rax
                return VarType.INTEGER;
            }
        case "CLOSE":
            {
                let type = exprNodeCode(n.children[2]);
                if (type !== VarType.INTEGER)
                    throw new console.error("requires numeric arg");
                emit("pop arg0"); //argument for fclose
                emit("ffcall fclose");
                return VarType.VOID;
            }
        case "WRITE":
            {
                // WRITE LP expr CMA expr RP
                // fprintf( fp, "%s", str )  or  fprintf( fp, "%d", num )
                let handletype = exprNodeCode(n.children[2]);
                if (handletype !== VarType.INTEGER)
                    throw new console.error("must be int");
                let outputtype = exprNodeCode(n.children[4]);
                let fmt: string;
                if (outputtype === VarType.INTEGER)
                    fmt = "string_percent_d";
                else if (outputtype === VarType.STRING)
                    fmt = "string_percent_s";
                else
                    throw new console.error("must be int or str");
                emit("pop arg2");   //the thing to print
                emit(`mov arg1, ${fmt}`);
                emit("pop arg0");   //the handle
                emit("ffvcall fprintf,0");
                //need to call fflush(NULL)
                emit("mov arg0, 0");
                emit("ffcall fflush");
                return VarType.VOID;
            }
        case "INPUT":
            {
                //INPUT LP RP
                //fgets( ptr, size, stream)
                //strtol( ptr, eptr, base )
                emit("mov arg0, fgets_buffer");
                emit("mov arg1, 64");
                emit("mov arg2, [stdin]");
                emit("ffcall fgets");
                //should do error checking...
                emit("mov arg0, fgets_buffer");
                emit("mov arg1, 0");
                emit("mov arg2, 10");
                emit("ffcall strtol");  //result is in rax
                return VarType.INTEGER;
            }
        case "READ":
            {
                //READ LP expr RP 
                //fgets( ptr, size, stream)
                //strtol( ptr, eptr, base )
                let exprtype = exprNodeCode(n.children[2]);
                if (exprtype !== VarType.INTEGER)
                    throw new console.error("must be int");

                emit("mov arg0, fgets_buffer");
                emit("mov arg1, 64");
                emit("pop arg2");
                emit("ffcall fgets");
                //should do error checking...
                emit("mov arg0, fgets_buffer");
                emit("mov arg1, 0");
                emit("mov arg2, 10");
                emit("ffcall strtol");  //result is in rax
                return VarType.INTEGER;
            }
        case "PRINT":
            {
                //PRINT LP expr RP
                let handletype = exprNodeCode(n.children[2]);
                let fmt: string;
                if (handletype === VarType.INTEGER)
                    fmt = "string_percent_d";
                else if (handletype === VarType.STRING)
                    fmt = "string_percent_s";
                else
                    throw new console.error("must be int or str");
                emit("pop arg1");   //the thing to print
                emit(`mov arg0, ${fmt}`);
                emit("ffvcall printf,0");
                //need to call fflush(NULL)
                emit("mov arg0, 0");
                emit("ffcall fflush");
                return VarType.VOID;
            }
        case "NOW":
            {
                emit("mov arg0, 0");
                emit("ffcall time");
                emit("mov [now], rax");
                emit("mov arg0, now");
                emit("ffcall localtime");
                emit("mov [nowAsTm], rax");
                emit("mov arg0, [nowAsTm]");
                emit("ffcall asctime");
                emit("mov [p], rax");
                return VarType.STRING;
            }
    }

}


let labelCounter = 0;
function label() {
    let s = "lbl" + labelCounter;
    labelCounter++;
    return s;
}

function convertStackTopToZeroOrOneInteger(type: VarType) {
    if (type == VarType.INTEGER) {
        emit("cmp qword [rsp], 0");
        emit("setne al");
        emit("movzx rax, al");
        emit("mov [rsp], rax");
    }
    else if (type == VarType.FLOAT) {
        emit("movq xmm0, [rsp]");
        emit("add rsp, 8");         //pop off stack, put into xmm0
        emit("xorps xmm1, xmm1");       
        emit("cmpneqsd xmm0, xmm1"); //comparison with 0
        emit("movq rax, xmm0");     
        emit("and qword rax, 1");   
        emit("push rax");
    }
    else {
        throw new console.error("bad type");
    }
}

function moveBytesFromStackToLocation(loc: string) {
    emit("pop rax");
    emit(`mov [${loc}], rax`);
}

function outputSymbolTableInfo() {
    for (let vname of symtable.table.keys()) {
        let vinfo = symtable.get(vname);
        emit(`${vinfo.location}:`);
        emit("dq 0");
    }
}
function outputStringPoolInfo() {
    for (let key of stringPool.keys()) {
        let lbl = stringPool.get(key);
        emit(`${lbl}:`);
        for (let i = 0; i < key.length; ++i) {
            emit(`db ${key.charCodeAt(i)}`);
        }
        emit("db 0");   //null terminator
    }
}
