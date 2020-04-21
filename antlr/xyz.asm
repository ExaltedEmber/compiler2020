default rel
section .text
global main
main:
push qword 42
pop rax
mov [lbl0], rax
push qword 10
pop rax
mov [lbl1], rax
push qword 0
pop rax
mov [lbl2], rax
push qword [lbl2]
pop rax
cmp rax, 0
je lbl3
push qword [lbl0]
push qword [lbl1]
pop rbx
pop rax
add rax, rbx
push rax
pop rax
ret
jmp lbl4
lbl3:
push qword [lbl0]
push qword [lbl1]
pop rbx
pop rax
sub rax, rbx
push rax
pop rax
ret
lbl4:
ret
section .data
lbl0:
dq 0
lbl1:
dq 0
lbl2:
dq 0