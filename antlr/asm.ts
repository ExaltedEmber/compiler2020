import { TreeNode } from"./parser";


let asmCode: string[] = [];

function emit(instr: string) {
    asmCode.push(instr);
}

function ICE() {
    throw new console.error("Internal Compiler Error");
}

export function makeAsm(root: TreeNode) {
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


function programNodeCode(n: TreeNode) {
    //program -> braceblock
    if (n.sym != "program")
        ICE();
    braceblockNodeCode(n.children[0]);
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
    //stmt -> cond | loop | return_stmt SEMI
    let c = n.children[0];
    switch (c.sym) {
        case "cond":
            condNodeCode(c); break;
        case "loop":
            loopNodeCode(c); break;
        case "return_stmt":
            returnstmtNodeCode(c); break;
        default:
            ICE();
    }
}

function returnstmtNodeCode(n: TreeNode) {
    //return_stmt -> RETURN expr
    exprNodeCode(n.children[1]);    // move result from expr to rax
    emit("ret");
}

function exprNodeCode(n: TreeNode) {
    //expr -> NUM
    let d = parseInt(n.children[0].token.lexeme, 10);
    emit(`mov rax, ${d}`);
}

function condNodeCode(n: TreeNode) {
    //cond -> IF LP expr RP braceblock |
    //  IF LP expr RP braceblock ELSE braceblock

    if (n.children.length === 5) {
        //no 'else'
        exprNodeCode(n.children[2]);    //leaves result in rax
        emit("cmp rax, 0");
        var endifLabel = label();
        emit(`je ${endifLabel}`);
        braceblockNodeCode(n.children[4]);
        emit(`${endifLabel}:`);
    } else {
        // 'else'
        exprNodeCode(n.children[2]);    //leaves result in rax
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
    emit("cmp rax, 0");
    emit(`je ${exitLoop}`);
    braceblockNodeCode(n.children[4]);
    emit(`jmp ${topLoop}`);
    emit(`${exitLoop}:`)
}

let labelCounter = 0;
function label() {
    let s = "lbl" + labelCounter;
    labelCounter++;
    return s;
}