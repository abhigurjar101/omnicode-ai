import sys
from collections import deque

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    t = int(input_data[0])
    ptr = 1
    out = []
    for _ in range(t):
        n = int(input_data[ptr])
        m = int(input_data[ptr+1])
        ptr += 2
        grid = [list(input_data[ptr + i]) for i in range(n)]
        ptr += n
        bad_adjacent = False
        for r in range(n):
            for c in range(m):
                if grid[r][c] == 'B':
                    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nr, nc = r + dr, c + dc
                        if 0 <= nr < n and 0 <= nc < m:
                            if grid[nr][nc] == '.':
                                grid[nr][nc] = '#'
                            elif grid[nr][nc] == 'G':
                                bad_adjacent = True
        if bad_adjacent:
            out.append('No')
            continue
        visited = [[False] * m for _ in range(n)]
        if grid[n-1][m-1] != '#':
            queue = deque([(n-1, m-1)])
            visited[n-1][m-1] = True
            while queue:
                cr, cc = queue.popleft()
                for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nr, nc = cr + dr, cc + dc
                    if 0 <= nr < n and 0 <= nc < m and not visited[nr][nc] and grid[nr][nc] != '#':
                        visited[nr][nc] = True
                        queue.append((nr, nc))
        possible = True
        for r in range(n):
            for c in range(m):
                if grid[r][c] == 'G' and not visited[r][c]:
                    possible = False
                if grid[r][c] == 'B' and visited[r][c]:
                    possible = False
        out.append('Yes' if possible else 'No')
    print('\n'.join(out))

if __name__ == '__main__':
    solve()
