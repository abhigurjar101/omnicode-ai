import sys

def eval_rpn(tokens):
    stack = []
    for t in tokens:
        if t == '+':
            b = stack.pop()
            a = stack.pop()
            stack.append(a + b)
        elif t == '-':
            b = stack.pop()
            a = stack.pop()
            stack.append(a - b)
        elif t == '*':
            b = stack.pop()
            a = stack.pop()
            stack.append(a * b)
        elif t == '/':
            b = stack.pop()
            a = stack.pop()
            if b == 0:
                return 'ERROR'
            stack.append(int(a / b))
        elif t == 'EVAL':
            return stack[-1] if stack else 0
        else:
            stack.append(int(t))
    return stack[-1] if stack else 0

def solve():
    lines = sys.stdin.read().strip().split('\n')
    out = []
    for line in lines:
        tokens = line.strip().split()
        if not tokens:
            continue
        out.append(str(eval_rpn(tokens)))
    print('\n'.join(out))

if __name__ == '__main__':
    solve()
