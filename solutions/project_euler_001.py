import sys

def sum_mult(k, n):
    m = (n - 1) // k
    return k * m * (m + 1) // 2

def solve():
    data = sys.stdin.read().strip()
    if not data:
        return
    n = int(data)
    ans = sum_mult(3, n) + sum_mult(5, n) - sum_mult(15, n)
    print(ans)

if __name__ == '__main__':
    solve()
