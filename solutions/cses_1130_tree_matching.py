import sys

def solve():
    sys.setrecursionlimit(300000)
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    if n <= 1:
        print(0)
        return
    adj = [[] for _ in range(n + 1)]
    idx = 1
    for _ in range(n - 1):
        u, v = int(data[idx]), int(data[idx+1])
        adj[u].append(v)
        adj[v].append(u)
        idx += 2
    visited = [False] * (n + 1)
    matched = [False] * (n + 1)
    order = []
    stack = [(1, 0)]
    parent = [0] * (n + 1)
    visited[1] = True
    while stack:
        node, p = stack.pop()
        order.append(node)
        parent[node] = p
        for nxt in adj[node]:
            if not visited[nxt]:
                visited[nxt] = True
                stack.append((nxt, node))
    ans = 0
    for u in reversed(order):
        p = parent[u]
        if p != 0 and not matched[u] and not matched[p]:
            matched[u] = True
            matched[p] = True
            ans += 1
    print(ans)

if __name__ == '__main__':
    solve()
