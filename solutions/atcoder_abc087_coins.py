import sys

def solve():
    lines = sys.stdin.read().split()
    if len(lines) < 4:
        return
    A, B, C, X = map(int, lines[:4])
    ans = 0
    for a in range(A + 1):
        for b in range(B + 1):
            rem = X - (500 * a + 100 * b)
            if rem >= 0 and rem % 50 == 0:
                c = rem // 50
                if c <= C:
                    ans += 1
    print(ans)

if __name__ == '__main__':
    solve()
