
; this provides two macros:
;   ffcall  -   call a foreign function
;               Requires one argument: The name of the foreign function
;   ffvcall - call a variadic foreign function
;               Requires two arguments: The name of the foreign function and
;               the number of floating point registers used

; these macros only handle integer parameters

%ifidn __OUTPUT_FORMAT__, win64
    %define doCall_platform 1
%elifidn __OUTPUT_FORMAT__, elf64
    %define doCall_platform 2
%elifidn __OUTPUT_FORMAT__, macho64
    %define doCall_platform 2
%endif

%ifndef doCall_platform
    %error Unknown doCall_platform
%endif

%if doCall_platform == 1
    ;windows
    %define arg0 rcx
    %define arg1 rdx
    %define arg2 r8
    %define arg3 r9
%endif

%if doCall_platform == 2
    ;linux/mac
    %define arg0 rdi
    %define arg1 rsi
    %define arg2 rdx
    %define arg3 rcx
%endif

%macro ffcall 1
    mov r15,rsp
    and rsp, -16
    %if doCall_platform == 1
        sub rsp,32
    %endif
    extern %1
    call %1
    ;this also undoes the sub
    mov rsp,r15
%endmacro

%macro ffvcall 2
    mov r15,rsp
    and rsp, -16
    %if doCall_platform == 1
        sub rsp,32
    %endif
    mov rax, %2
    extern %1
    call %1
    ;this also undoes the sub
    mov rsp,r15
%endmacro


