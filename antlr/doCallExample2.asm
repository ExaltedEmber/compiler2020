
; equivalent C program:
;   #include <time.h>
;   #include <stdio.h>
;   FILE* fp;
;   int v = 42;
;   int main(){
;       fp = fopen("ex","w");
;       fprintf(fp,"The number is: %d\n",v);
;       fclose(fp);
;       return 123;
;   }


default rel
section .text

%include "doCall.asm"

global main
main:
    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    ; fp = fopen("ex","w");
    mov arg0, ex
    mov arg1, w
    ffcall fopen
    mov [fp], rax
    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    ; fprintf(fp,"The number is: %d\n",v);
    mov arg0, [fp]
    mov arg1, message
    mov arg2, [v]
    ffvcall fprintf,0
    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    ; fclose(fp)
    mov arg0, [fp]
    ffcall fclose
    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    mov rax,123
    ret
    
section .data

message:    db "The number is: %d",10,0        ;nasm doesn't support \n; must use 10
ex:         db "ex",0
w:          db "w",0
fp:         dq 0
v:          dq 42
