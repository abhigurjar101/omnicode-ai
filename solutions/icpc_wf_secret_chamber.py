import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    m = int(input_data[0])
    n = int(input_data[1])
    ptr = 2
    reach = {chr(i): {chr(i)} for i in range(ord('a'), ord('z') + 1)}
    for _ in range(m):
        u = input_data[ptr]
        v = input_data[ptr+1]
        reach[u].add(v)
        ptr += 2
    letters = [chr(i) for i in range(ord('a'), ord('z') + 1)]
    for k in letters:
        for i in letters:
            if k in reach[i]:
                reach[i].update(reach[k])
    out = []
    for _ in range(n):
        w1 = input_data[ptr]
        w2 = input_data[ptr+1]
        ptr += 2
        if len(w1) != len(w2):
            out.append('no')
            continue
        ok = True
        for c1, c2 in zip(w1, w2):
            if c2 not in reach[c1]:
                ok = False
                break
        out.append('yes' if ok else 'no')
    print('\n'.join(out))

if __name__ == '__main__':
    solve()
