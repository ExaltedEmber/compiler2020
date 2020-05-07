
; equivalent C program:
;   #include <time.h>
;   #include <stdio.h>
;   time_t now;
;   struct tm* nowAsTm;
;   char* p;
;   int main(){
;       now = time(NULL);
;       nowAsTm = localtime(&now);
;       p = asctime( nowAsTm );
;       fp = fopen("ex","w");
;       printf("%s\n",p);
;       return 123;
;   }


default rel
section .text

%include "doCall.asm"

global main
main:
    ; now = time(0);
    mov arg0, 0     ;NULL == 0
    ffcall time     ;call time(0)
    ;rax now holds current time as number of seconds since epoch
    mov [now], rax  ;return value to 'now'
    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    ; nowAsTm = localtime(&now);
    mov arg0, now       ;address of 'now' -> argument zero
    ffcall localtime
    ; rax holds address of tm struct
    mov [nowAsTm], rax  ;copy address of tm struct to nowAsTm
    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    ; p = asctime( &nowAsTm );
    mov arg0, [nowAsTm]   ;address of tm struct to argument 0
    ffcall asctime
    ;rax now holds address in memory where string begins
    mov [p], rax    ;store address of string to p
    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    ; printf("%s\n",p);
    mov arg0, percent_s
    mov arg1, [p]   ;put address of string as arg 1
    ffvcall printf,0    ;0=no float args
    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    mov rax,123
    ret
    
section .data

now:        dq 0
nowAsTm:    dq 0
p:          dq 0
percent_s:  db "%s",10,0        ;nasm doesn't support \n; must use 10
