%include "doCall.asm" 
default rel
section .text
global main
main:
mov arg0, 0
mov arg1, string_r
ffcall fdopen
mov [stdin], rax
mov arg0, 1
mov arg1, string_w
ffcall fdopen
mov [stdout], rax
mov arg0, 0
ffcall time
mov [now], rax
mov arg0, now
ffcall localtime
mov [nowAsTm], rax
mov arg0, [nowAsTm]
ffcall asctime
mov [p], rax
push rax
pop rax
mov [lbl0], rax
push qword lbl1
pop arg1
mov arg0, string_percent_s
ffvcall printf,0
mov arg0, 0
ffcall fflush
push qword [lbl0]
pop arg1
mov arg0, string_percent_s
ffvcall printf,0
mov arg0, 0
ffcall fflush
push qword lbl2
pop arg1
mov arg0, string_percent_s
ffvcall printf,0
mov arg0, 0
ffcall fflush
push qword 0
pop rax
ret
ret
section .data
stdin: dq 0
stdout: dq 0
string_r: db 'r', 0
string_w: db 'w', 0
string_a: db 'a', 0
string_rplus db 'r+', 0
string_percent_s: db '%s', 0
string_percent_d: db '%d', 0
fgets_buffer: times 64 db 0
now: dq 0
nowAsTm: dq 0
p: dq 0
lbl0:
dq 0
lbl1:
db 73
db 116
db 32
db 105
db 115
db 32
db 110
db 111
db 119
db 32
db 0
lbl2:
db 46
db 46
db 46
db 10
db 0