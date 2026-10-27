import sys

def solve():
    data = sys.stdin.read().split()
    if len(data) >= 2:
        r1 = int(data[0])
        s = int(data[1])
        print(2 * s - r1)

if __name__ == '__main__':
    solve()
