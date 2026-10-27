import sys

def solve():
    input_data = sys.stdin.read().strip()
    if not input_data:
        return
    n = int(input_data)
    seq = [n]
    while n != 1:
        if n % 2 == 0:
            n = n // 2
        else:
            n = 3 * n + 1
        seq.append(n)
    print(' '.join(map(str, seq)))

if __name__ == '__main__':
    solve()
