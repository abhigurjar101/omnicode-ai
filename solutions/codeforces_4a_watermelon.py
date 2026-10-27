import sys

def solve():
    data = sys.stdin.read().strip()
    if not data:
        return
    w = int(data)
    if w > 2 and w % 2 == 0:
        print('YES')
    else:
        print('NO')

if __name__ == '__main__':
    solve()
