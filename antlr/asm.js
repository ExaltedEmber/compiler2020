"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VarType;
(function (VarType) {
    VarType[VarType["INTEGER"] = 0] = "INTEGER";
    VarType[VarType["FLOAT"] = 1] = "FLOAT";
    VarType[VarType["STRING"] = 2] = "STRING";
})(VarType || (VarType = {}));
let asmCode = [];
function emit(instr) {
    asmCode.push(instr);
}
function ICE() {
    throw new console.error("Internal Compiler Error");
}
function makeAsm(root) {
    asmCode = [];
    labelCounter = 0;
    emit("default rel");
    emit("section .text");
    emit("global main");
    emit("main:");
    programNodeCode(root);
    emit("ret");
    emit("section .data");
    return asmCode.join("\n");
}
exports.makeAsm = makeAsm;
function programNodeCode(n) {
    //program -> braceblock
    if (n.sym != "program")
        ICE();
    braceblockNodeCode(n.children[0]);
}
function braceblockNodeCode(n) {
    //braceblock -> LBR stmts RBR
    stmtsNodeCode(n.children[1]);
}
function stmtsNodeCode(n) {
    //stmts -> stmt stmts | lambda
    if (n.children.length == 0)
        return;
    stmtNodeCode(n.children[0]);
    stmtsNodeCode(n.children[1]);
}
function stmtNodeCode(n) {
    //stmt -> cond | loop | return_stmt SEMI
    let c = n.children[0];
    switch (c.sym) {
        case "cond":
            condNodeCode(c);
            break;
        case "loop":
            loopNodeCode(c);
            break;
        case "return_stmt":
            returnstmtNodeCode(c);
            break;
        default:
            ICE();
    }
}
function returnstmtNodeCode(n) {
    //return_stmt -> RETURN expr
    let exprType = exprNodeCode(n.children[1]); // move result from expr to rax
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
function exprNodeCode(n) {
    return orexpNodeCode(n.children[0]);
}
function orexpNodeCode(n) {
    //orexp -> orexp OR andexp | andexp
    if (n.children.length === 1) {
        return andexpNodeCode(n.children[0]);
    }
    else {
        //more code
        let orexpType = orexpNodeCode(n.children[0]);
        convertStackTopToZeroOrOneInteger(orexpType);
        let lbl = label();
        emit("cmp qword [rsp], 0");
        emit(`jne ${lbl}`);
        emit("add rsp,8"); //discard left result (0)
        let andexpType = andexpNodeCode(n.children[2]);
        convertStackTopToZeroOrOneInteger(andexpType);
        emit(`${lbl}:`);
        return VarType.INTEGER; //always integer, even if float operands
    }
}
function andexpNodeCode(n) {
    //andexp -> andexp AND notexp | notexp
    if (n.children.length === 1) {
        return notexpNodeCode(n.children[0]);
    }
    else {
        //more code
        let andexpType = andexpNodeCode(n.children[0]);
        convertStackTopToZeroOrOneInteger(andexpType);
        let lbl = label();
        emit("cmp qword [rsp], 0");
        emit(`je ${lbl}`);
        emit("add rsp,8"); //discard left result (1)
        let notexpType = notexpNodeCode(n.children[2]);
        convertStackTopToZeroOrOneInteger(andexpType);
        emit(`${lbl}:`);
        return VarType.INTEGER; //always integer, even if float operands
    }
}
function notexpNodeCode(n) {
    //notexp -> NOT notexp | rel
    if (n.children.length === 1) {
        return relNodeCode(n.children[0]);
    }
    else {
        let notexpType = notexpNodeCode(n.children[1]);
        convertStackTopToZeroOrOneInteger(notexpType);
        emit("xor qword [rsp], 1");
        return VarType.INTEGER; //always integer, even if float operands
    }
}
function sumNodeCode(n) {
    //sum -> sum PLUS term | sum MINUS term | term
    if (n.children.length === 1)
        return termNodeCode(n.children[0]);
    else {
        let sumType = sumNodeCode(n.children[0]);
        let termType = termNodeCode(n.children[2]);
        if (sumType != termType)
            throw new console.error("Bad Type");
        if (sumType == VarType.INTEGER) {
            emit("pop rbx"); //second operand
            emit("pop rax"); //first operand
            switch (n.children[1].sym) {
                case "PLUS":
                    emit("add rax, rbx");
                    break;
                case "MINUS":
                    emit("sub rax, rbx");
                    break;
                default:
                    ICE;
            }
            emit("push rax");
            return VarType.INTEGER;
        }
        else if (sumType == VarType.FLOAT) {
            emit("movq xmm1, [rsp]"); //second operand
            emit("add rsp, 8");
            emit("movq xmm0, [rsp]"); //first operand
            emit("add rsp, 8");
            switch (n.children[1].sym) {
                case "PLUS":
                    emit("addsd xmm0, xmm1");
                    break;
                case "MINUS":
                    emit("subsd xmm0, xmm1");
                    break;
                default:
                    ICE;
            }
            emit("sub rsp,8");
            emit("movq [rsp], xmm0");
            return VarType.FLOAT;
        }
    }
}
function termNodeCode(n) {
    //term -> term MULOP neg | neg
    if (n.children.length == 1)
        return negNodeCode(n.children[0]);
    else {
        let termType = termNodeCode(n.children[0]);
        let negType = negNodeCode(n.children[2]);
        if (negType != termType)
            throw new console.error("Bad Type");
        if (negType == VarType.INTEGER) {
            emit("pop rbx"); //second operand
            emit("pop rax"); //first operand
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
                    ICE;
            }
            return VarType.INTEGER;
        }
        else if (negType == VarType.FLOAT) {
            emit("movq xmm1, [rsp]"); //2nd
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
                    ICE;
            }
            emit("sub rsp, 8");
            emit("movq [rsp], xmm0");
            return VarType.FLOAT;
        }
    }
}
function negNodeCode(n) {
    //neg -> MINUS neg | typecast
    if (n.children.length == 1)
        return typecastNodeCode(n.children[0]);
    else {
        let negType = negNodeCode(n.children[1]);
        if (negType == VarType.INTEGER) {
            emit("pop rax");
            emit("xor qword rbx, rbx"); //0
            emit("sub rbx, rax"); //0 - number
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
function typecastNodeCode(n) {
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
                emit("roundsd xmm0, xmm0, 3");
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
function factorNodeCode(n) {
    //factor -> NUM | FPNUM | LP expr RP
    let child = n.children[0];
    switch (child.sym) {
        case "NUM":
            let v = parseInt(child.token.lexeme, 10);
            emit(`push qword ${v}`);
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
        default:
            ICE();
    }
}
function relNodeCode(n) {
    //rel -> sum RELOP sum | sum
    if (n.children.length === 1)
        return sumNodeCode(n.children[0]);
    else {
        let sum1Type = sumNodeCode(n.children[0]);
        let sum2Type = sumNodeCode(n.children[2]);
        if (sum1Type != sum2Type)
            throw new console.error("Type Erorr");
        if (sum1Type == VarType.INTEGER) {
            emit("pop rax"); //second operand
            //first operand is on stack
            emit("cmp [rsp],rax"); //do the compare
            switch (n.children[1].token.lexeme) {
                case ">=":
                    emit("setge al");
                    break;
                case "<=":
                    emit("setle al");
                    break;
                case ">":
                    emit("setg  al");
                    break;
                case "<":
                    emit("setl  al");
                    break;
                case "==":
                    emit("sete  al");
                    break;
                case "!=":
                    emit("setne al");
                    break;
                default: ICE();
            }
            emit("movzx qword rax, al"); //move with zero extend
            emit("mov [rsp], rax");
            return VarType.INTEGER;
        }
        else if (sum1Type = VarType.FLOAT) {
            emit("movq xmm1, [rsp]"); //rhs operand
            emit("add rsp, 8");
            emit("movq xmm0, [rsp]"); //lhs operand
            switch (n.children[1].token.lexeme) {
                case ">=":
                    emit("cmpnlesd  xmm0, xmm1");
                    break;
                case "<=":
                    emit("cmplesd  xmm0, xmm1");
                    break;
                case ">":
                    emit("cmpnltsd  xmm0, xmm1");
                    break;
                case "<":
                    emit("cmpltsd  xmm0, xmm1");
                    break;
                case "==":
                    emit("cmpeqsd  xmm0, xmm1");
                    break;
                case "!=":
                    emit("cmpneqsd  xmm0, xmm1");
                    break;
                default: ICE();
            }
            emit("movq [rsp], xmm0"); // store into memory
            emit("and qword [rsp], 1"); // retain only lowest bit: 0 or 1 int64
            return VarType.INTEGER;
        }
    }
}
function condNodeCode(n) {
    //cond -> IF LP expr RP braceblock |
    //  IF LP expr RP braceblock ELSE braceblock
    if (n.children.length === 5) {
        //no 'else'
        exprNodeCode(n.children[2]); //leaves result in rax
        emit("pop rax");
        emit("cmp rax, 0");
        var endifLabel = label();
        emit(`je ${endifLabel}`);
        braceblockNodeCode(n.children[4]);
        emit(`${endifLabel}:`);
    }
    else {
        // 'else'
        exprNodeCode(n.children[2]); //leaves result in rax
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
function loopNodeCode(n) {
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
    emit(`${exitLoop}:`);
}
let labelCounter = 0;
function label() {
    let s = "lbl" + labelCounter;
    labelCounter++;
    return s;
}
function convertStackTopToZeroOrOneInteger(type) {
    if (type == VarType.INTEGER) {
        emit("cmp qword [rsp], 0");
        emit("setne al");
        emit("movzx rax, al");
        emit("mov [rsp], rax");
    }
    else if (type == VarType.FLOAT) {
        emit("movq xmm0, [rsp]");
        emit("add rsp, 8"); //pop off stack, put into xmm0
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
//# sourceMappingURL=asm.js.map