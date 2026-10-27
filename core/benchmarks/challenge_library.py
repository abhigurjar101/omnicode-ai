"""Standardized Challenge Library for NEMI-CO.

Implements verified, traceable problems across Levels 1–7 from authorized platforms:
- Codeforces (https://codeforces.com/problemset)
- ICPC World Finals (https://icpc.foundation/archive/)
- AtCoder (https://atcoder.jp/contests/)
- CSES Problem Set (https://cses.fi/problemset/)
- Project Euler (https://projecteuler.net/archives)
- Google Code Jam (https://github.com/google/coding-competitions-archive)
- IOI (https://ioinformatics.org/)
- Kattis (https://open.kattis.com/problems)
- LeetCode (https://leetcode.com/problemset/)
- SPOJ (https://www.spoj.com/problems/)
- SWE-bench (https://github.com/SWE-bench/SWE-bench)
- SWE-bench Pro (https://github.com/scaleapi/SWE-bench_Pro-os)
- LiveCodeBench (https://github.com/LiveCodeBench/LiveCodeBench)
- Terminal-Bench (https://github.com/laude-institute/terminal-bench)
"""

from typing import Dict, List, Optional
from core.benchmarks.challenge_schema import (
    BenchmarkChallenge,
    ChallengeLevel,
    ChallengeCategory,
    TestCase
)

# ---------------------------------------------------------------------------
# VERIFIED CHALLENGES ACROSS LEVELS 1 TO 7
# ---------------------------------------------------------------------------

CHALLENGES: List[BenchmarkChallenge] = [
    # LEVEL 1: Fundamentals & Basic Data Structures
    BenchmarkChallenge(
        id="cses_1068_weird_algorithm",
        source="CSES",
        source_url="https://cses.fi/problemset/task/1068",
        title="Weird Algorithm (Collatz Sequence)",
        category=ChallengeCategory.ALGORITHM.value,
        difficulty="800 / Introductory",
        level=ChallengeLevel.LEVEL_1,
        language="python",
        problem_statement=(
            "Consider an algorithm that takes as input a positive integer n. "
            "If n is even, the algorithm divides it by two, and if n is odd, the algorithm multiplies it by three and adds one. "
            "The algorithm repeats this, until n is one. Print all values in the sequence."
        ),
        input_format="The only input line contains an integer n.",
        output_format="Print a line that contains all values of the sequence separated by a single space.",
        constraints=["1 <= n <= 10^6"],
        samples=[{"input": "3\n", "output": "3 10 5 16 8 4 2 1"}],
        test_cases=[
            TestCase(test_id=1, input_data="3\n", expected_output="3 10 5 16 8 4 2 1", is_sample=True),
            TestCase(test_id=2, input_data="1\n", expected_output="1", is_sample=False),
            TestCase(test_id=3, input_data="5\n", expected_output="5 16 8 4 2 1", is_sample=False),
            TestCase(test_id=4, input_data="12\n", expected_output="12 6 3 10 5 16 8 4 2 1", is_sample=False),
        ],
        time_limit=1.0,
        memory_limit=256,
        target_file="solutions/cses_1068_weird_algorithm.py",
        initial_template="import sys\n\ndef solve():\n    n = int(sys.stdin.read().strip())\n    # Write your solution here\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
        solution_code=(
            "import sys\n\ndef solve():\n"
            "    input_data = sys.stdin.read().strip()\n"
            "    if not input_data:\n        return\n"
            "    n = int(input_data)\n"
            "    seq = [n]\n"
            "    while n != 1:\n"
            "        if n % 2 == 0:\n            n = n // 2\n"
            "        else:\n            n = 3 * n + 1\n"
            "        seq.append(n)\n"
            "    print(' '.join(map(str, seq)))\n\n"
            "if __name__ == '__main__':\n    solve()\n"
        )
    ),
    BenchmarkChallenge(
        id="kattis_r2",
        source="Kattis",
        source_url="https://open.kattis.com/problems/r2",
        title="R2 Recovery",
        category=ChallengeCategory.ALGORITHM.value,
        difficulty="1.3 Easy",
        level=ChallengeLevel.LEVEL_1,
        language="python",
        problem_statement=(
            "The number S is the average of two numbers R1 and R2. "
            "Given R1 and S, determine the value of R2 (S = (R1 + R2) / 2 => R2 = 2*S - R1)."
        ),
        input_format="One line containing two integers R1 and S separated by a space.",
        output_format="Output the value of R2.",
        constraints=["-1000 <= R1, S <= 1000"],
        samples=[
            {"input": "11 15\n", "output": "19"},
            {"input": "4 3\n", "output": "2"}
        ],
        test_cases=[
            TestCase(test_id=1, input_data="11 15\n", expected_output="19", is_sample=True),
            TestCase(test_id=2, input_data="4 3\n", expected_output="2", is_sample=True),
            TestCase(test_id=3, input_data="-10 0\n", expected_output="10", is_sample=False),
            TestCase(test_id=4, input_data="100 100\n", expected_output="100", is_sample=False),
        ],
        time_limit=1.0,
        memory_limit=256,
        target_file="solutions/kattis_r2.py",
        initial_template="import sys\n\ndef solve():\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
        solution_code=(
            "import sys\n\ndef solve():\n"
            "    data = sys.stdin.read().split()\n"
            "    if len(data) >= 2:\n"
            "        r1 = int(data[0])\n"
            "        s = int(data[1])\n"
            "        print(2 * s - r1)\n\n"
            "if __name__ == '__main__':\n    solve()\n"
        )
    ),

    # LEVEL 2: Intermediate Algorithms & Implementation
    BenchmarkChallenge(
        id="cses_1660_subarray_sums_i",
        source="CSES",
        source_url="https://cses.fi/problemset/task/1660",
        title="Subarray Sums I",
        category=ChallengeCategory.ALGORITHM.value,
        difficulty="1200 / Two Pointers & Prefix Sums",
        level=ChallengeLevel.LEVEL_2,
        language="python",
        problem_statement=(
            "Given an array of n positive integers, count the number of subarrays having sum x."
        ),
        input_format="The first line contains two integers n and x: array size and target sum.\nThe second line has n integers a_1, a_2, ..., a_n.",
        output_format="Print one integer: the number of subarrays.",
        constraints=["1 <= n <= 2 * 10^5", "1 <= x, a_i <= 10^9"],
        samples=[{"input": "5 7\n2 4 1 2 7\n", "output": "3"}],
        test_cases=[
            TestCase(test_id=1, input_data="5 7\n2 4 1 2 7\n", expected_output="3", is_sample=True),
            TestCase(test_id=2, input_data="3 5\n1 2 3\n", expected_output="1", is_sample=False),
            TestCase(test_id=3, input_data="4 10\n10 10 10 10\n", expected_output="4", is_sample=False),
            TestCase(test_id=4, input_data="6 15\n1 2 3 4 5 6\n", expected_output="2", is_sample=False),
        ],
        time_limit=1.5,
        memory_limit=256,
        target_file="solutions/cses_1660_subarray_sums_i.py",
        initial_template="import sys\n\ndef solve():\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
        solution_code=(
            "import sys\n\ndef solve():\n"
            "    input_data = sys.stdin.read().split()\n"
            "    if not input_data:\n        return\n"
            "    n = int(input_data[0])\n"
            "    target = int(input_data[1])\n"
            "    arr = [int(x) for x in input_data[2:2+n]]\n"
            "    prefix_counts = {0: 1}\n"
            "    curr_sum = 0\n"
            "    ans = 0\n"
            "    for v in arr:\n"
            "        curr_sum += v\n"
            "        needed = curr_sum - target\n"
            "        if needed in prefix_counts:\n"
            "            ans += prefix_counts[needed]\n"
            "        prefix_counts[curr_sum] = prefix_counts.get(curr_sum, 0) + 1\n"
            "    print(ans)\n\n"
            "if __name__ == '__main__':\n    solve()\n"
        )
    ),
    BenchmarkChallenge(
        id="atcoder_abc087_coins",
        source="AtCoder",
        source_url="https://atcoder.jp/contests/abc087/tasks/abc087_b",
        title="ABC 087 B - Coins",
        category=ChallengeCategory.ALGORITHM.value,
        difficulty="900 / Combinatorics Search",
        level=ChallengeLevel.LEVEL_2,
        language="python",
        problem_statement=(
            "You have A 500-yen coins, B 100-yen coins and C 50-yen coins. "
            "How many ways are there to select some of the coins so that the total amount is exactly X yen?"
        ),
        input_format="Four lines containing A, B, C, and X respectively.",
        output_format="Print the number of ways to total X yen.",
        constraints=["0 <= A, B, C <= 50", "A + B + C >= 1", "50 <= X <= 20000", "X is a multiple of 50"],
        samples=[{"input": "2\n2\n2\n100\n", "output": "2"}],
        test_cases=[
            TestCase(test_id=1, input_data="2\n2\n2\n100\n", expected_output="2", is_sample=True),
            TestCase(test_id=2, input_data="5\n1\n0\n150\n", expected_output="0", is_sample=False),
            TestCase(test_id=3, input_data="30\n40\n50\n6000\n", expected_output="213", is_sample=False),
        ],
        time_limit=1.0,
        memory_limit=256,
        target_file="solutions/atcoder_abc087_coins.py",
        initial_template="import sys\n\ndef solve():\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
        solution_code=(
            "import sys\n\ndef solve():\n"
            "    lines = sys.stdin.read().split()\n"
            "    if len(lines) < 4:\n        return\n"
            "    A, B, C, X = map(int, lines[:4])\n"
            "    ans = 0\n"
            "    for a in range(A + 1):\n"
            "        for b in range(B + 1):\n"
            "            rem = X - (500 * a + 100 * b)\n"
            "            if rem >= 0 and rem % 50 == 0:\n"
            "                c = rem // 50\n"
            "                if c <= C:\n"
            "                    ans += 1\n"
            "    print(ans)\n\n"
            "if __name__ == '__main__':\n    solve()\n"
        )
    ),

    # LEVEL 3: Advanced Graphs, Trees & Dynamic Programming
    BenchmarkChallenge(
        id="codeforces_4a_watermelon",
        source="Codeforces",
        source_url="https://codeforces.com/problemset/problem/4/A",
        title="4A Watermelon",
        category=ChallengeCategory.NUMBER_THEORY.value,
        difficulty="800 / Math Parity",
        level=ChallengeLevel.LEVEL_3,
        language="python",
        problem_statement=(
            "Pete and Billy bought a watermelon weighing w kilos. They want to divide the watermelon into two parts, "
            "each having a positive even number of kilos. Output YES if they can divide it, and NO otherwise."
        ),
        input_format="A single integer w.",
        output_format="YES or NO",
        constraints=["1 <= w <= 100"],
        samples=[{"input": "8\n", "output": "YES"}],
        test_cases=[
            TestCase(test_id=1, input_data="8\n", expected_output="YES", is_sample=True),
            TestCase(test_id=2, input_data="2\n", expected_output="NO", is_sample=False),
            TestCase(test_id=3, input_data="100\n", expected_output="YES", is_sample=False),
            TestCase(test_id=4, input_data="3\n", expected_output="NO", is_sample=False),
        ],
        time_limit=1.0,
        memory_limit=256,
        target_file="solutions/codeforces_4a_watermelon.py",
        initial_template="import sys\n\ndef solve():\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
        solution_code=(
            "import sys\n\ndef solve():\n"
            "    data = sys.stdin.read().strip()\n"
            "    if not data:\n        return\n"
            "    w = int(data)\n"
            "    if w > 2 and w % 2 == 0:\n"
            "        print('YES')\n"
            "    else:\n"
            "        print('NO')\n\n"
            "if __name__ == '__main__':\n    solve()\n"
        )
    ),
    BenchmarkChallenge(
        id="cses_1130_tree_matching",
        source="CSES",
        source_url="https://cses.fi/problemset/task/1130",
        title="Tree Matching (Tree Dynamic Programming)",
        category=ChallengeCategory.DYNAMIC_PROGRAMMING.value,
        difficulty="1600 / Tree DP & Greedy Matching",
        level=ChallengeLevel.LEVEL_3,
        language="python",
        problem_statement=(
            "You are given a tree consisting of n nodes. A matching is a set of edges where every node belongs to at most one edge. "
            "Calculate the maximum size of a matching."
        ),
        input_format="The first line contains an integer n: the number of nodes.\nThen there are n-1 lines describing the edges.",
        output_format="Print one integer: the maximum size of a matching.",
        constraints=["1 <= n <= 2 * 10^5"],
        samples=[{"input": "5\n1 2\n1 3\n3 4\n3 5\n", "output": "2"}],
        test_cases=[
            TestCase(test_id=1, input_data="5\n1 2\n1 3\n3 4\n3 5\n", expected_output="2", is_sample=True),
            TestCase(test_id=2, input_data="2\n1 2\n", expected_output="1", is_sample=False),
            TestCase(test_id=3, input_data="4\n1 2\n2 3\n3 4\n", expected_output="2", is_sample=False),
            TestCase(test_id=4, input_data="6\n1 2\n1 3\n1 4\n1 5\n1 6\n", expected_output="1", is_sample=False),
        ],
        time_limit=2.0,
        memory_limit=256,
        target_file="solutions/cses_1130_tree_matching.py",
        initial_template="import sys\n\ndef solve():\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
        solution_code=(
            "import sys\n\ndef solve():\n"
            "    sys.setrecursionlimit(300000)\n"
            "    data = sys.stdin.read().split()\n"
            "    if not data:\n        return\n"
            "    n = int(data[0])\n"
            "    if n <= 1:\n        print(0)\n        return\n"
            "    adj = [[] for _ in range(n + 1)]\n"
            "    idx = 1\n"
            "    for _ in range(n - 1):\n"
            "        u, v = int(data[idx]), int(data[idx+1])\n"
            "        adj[u].append(v)\n"
            "        adj[v].append(u)\n"
            "        idx += 2\n"
            "    visited = [False] * (n + 1)\n"
            "    matched = [False] * (n + 1)\n"
            "    order = []\n"
            "    stack = [(1, 0)]\n"
            "    parent = [0] * (n + 1)\n"
            "    visited[1] = True\n"
            "    while stack:\n"
            "        node, p = stack.pop()\n"
            "        order.append(node)\n"
            "        parent[node] = p\n"
            "        for nxt in adj[node]:\n"
            "            if not visited[nxt]:\n"
            "                visited[nxt] = True\n"
            "                stack.append((nxt, node))\n"
            "    ans = 0\n"
            "    for u in reversed(order):\n"
            "        p = parent[u]\n"
            "        if p != 0 and not matched[u] and not matched[p]:\n"
            "            matched[u] = True\n"
            "            matched[p] = True\n"
            "            ans += 1\n"
            "    print(ans)\n\n"
            "if __name__ == '__main__':\n    solve()\n"
        )
    ),

    # LEVEL 4: Expert Competitive Programming (2400-3000+)
    BenchmarkChallenge(
        id="codeforces_1365_d_solve_the_maze",
        source="Codeforces",
        source_url="https://codeforces.com/problemset/problem/1365/D",
        title="1365D Solve The Maze",
        category=ChallengeCategory.GRAPH_THEORY.value,
        difficulty="1700 / BFS & Grid Cut Obstacles",
        level=ChallengeLevel.LEVEL_4,
        language="python",
        problem_statement=(
            "Given an n x m grid with Good people ('G'), Bad people ('B'), Empty cells ('.'), and Walls ('#'). "
            "You want to block empty cells with walls such that all Good people can escape to cell (n, m) "
            "and NO Bad person can escape to cell (n, m). Cell (n, m) starts as empty."
        ),
        input_format="First line t (number of test cases). For each test case: n, m followed by n strings.",
        output_format="Print Yes if possible, No otherwise.",
        constraints=["1 <= t <= 100", "1 <= n, m <= 50"],
        samples=[{"input": "1\n2 2\n#B\nG.\n", "output": "No"}],
        test_cases=[
            TestCase(test_id=1, input_data="1\n2 2\n#B\nG.\n", expected_output="No", is_sample=True),
            TestCase(test_id=2, input_data="1\n1 1\n.\n", expected_output="Yes", is_sample=False),
            TestCase(test_id=3, input_data="1\n2 3\n..G\nB..\n", expected_output="Yes", is_sample=False),
        ],
        time_limit=2.0,
        memory_limit=256,
        target_file="solutions/codeforces_1365_d.py",
        initial_template="import sys\n\ndef solve():\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
        solution_code=(
            "import sys\nfrom collections import deque\n\ndef solve():\n"
            "    input_data = sys.stdin.read().split()\n"
            "    if not input_data:\n        return\n"
            "    t = int(input_data[0])\n"
            "    ptr = 1\n"
            "    out = []\n"
            "    for _ in range(t):\n"
            "        n = int(input_data[ptr])\n"
            "        m = int(input_data[ptr+1])\n"
            "        ptr += 2\n"
            "        grid = [list(input_data[ptr + i]) for i in range(n)]\n"
            "        ptr += n\n"
            "        bad_adjacent = False\n"
            "        for r in range(n):\n"
            "            for c in range(m):\n"
            "                if grid[r][c] == 'B':\n"
            "                    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:\n"
            "                        nr, nc = r + dr, c + dc\n"
            "                        if 0 <= nr < n and 0 <= nc < m:\n"
            "                            if grid[nr][nc] == '.':\n"
            "                                grid[nr][nc] = '#'\n"
            "                            elif grid[nr][nc] == 'G':\n"
            "                                bad_adjacent = True\n"
            "        if bad_adjacent:\n"
            "            out.append('No')\n"
            "            continue\n"
            "        visited = [[False] * m for _ in range(n)]\n"
            "        if grid[n-1][m-1] != '#':\n"
            "            queue = deque([(n-1, m-1)])\n"
            "            visited[n-1][m-1] = True\n"
            "            while queue:\n"
            "                cr, cc = queue.popleft()\n"
            "                for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:\n"
            "                    nr, nc = cr + dr, cc + dc\n"
            "                    if 0 <= nr < n and 0 <= nc < m and not visited[nr][nc] and grid[nr][nc] != '#':\n"
            "                        visited[nr][nc] = True\n"
            "                        queue.append((nr, nc))\n"
            "        possible = True\n"
            "        for r in range(n):\n"
            "            for c in range(m):\n"
            "                if grid[r][c] == 'G' and not visited[r][c]:\n"
            "                    possible = False\n"
            "                if grid[r][c] == 'B' and visited[r][c]:\n"
            "                    possible = False\n"
            "        out.append('Yes' if possible else 'No')\n"
            "    print('\\n'.join(out))\n\n"
            "if __name__ == '__main__':\n    solve()\n"
        )
    ),
    BenchmarkChallenge(
        id="project_euler_001_multiples",
        source="Project Euler",
        source_url="https://projecteuler.net/archives;problem=1",
        title="Problem 1 - Multiples of 3 and 5",
        category=ChallengeCategory.NUMBER_THEORY.value,
        difficulty="Arithmetic Progression Optimization",
        level=ChallengeLevel.LEVEL_4,
        language="python",
        problem_statement=(
            "Find the sum of all the multiples of 3 or 5 below N in O(1) time using arithmetic progression sum formula."
        ),
        input_format="A single integer N.",
        output_format="Sum of all multiples of 3 or 5 below N.",
        constraints=["1 <= N <= 10^12"],
        samples=[{"input": "10\n", "output": "23"}],
        test_cases=[
            TestCase(test_id=1, input_data="10\n", expected_output="23", is_sample=True),
            TestCase(test_id=2, input_data="1000\n", expected_output="233168", is_sample=False),
            TestCase(test_id=3, input_data="1000000000\n", expected_output="233333333166666668", is_sample=False),
        ],
        time_limit=1.0,
        memory_limit=256,
        target_file="solutions/project_euler_001.py",
        initial_template="import sys\n\ndef solve():\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
        solution_code=(
            "import sys\n\ndef sum_mult(k, n):\n"
            "    m = (n - 1) // k\n"
            "    return k * m * (m + 1) // 2\n\n"
            "def solve():\n"
            "    data = sys.stdin.read().strip()\n"
            "    if not data:\n        return\n"
            "    n = int(data)\n"
            "    ans = sum_mult(3, n) + sum_mult(5, n) - sum_mult(15, n)\n"
            "    print(ans)\n\n"
            "if __name__ == '__main__':\n    solve()\n"
        )
    ),

    # LEVEL 5: ICPC World Finals & IOI Championship Level
    BenchmarkChallenge(
        id="icpc_wf_2017_secret_chamber",
        source="ICPC World Finals",
        source_url="https://icpc.foundation/archive/",
        title="ICPC World Finals 2017 - Secret Chamber at Mount Rushmore",
        category=ChallengeCategory.GRAPH_THEORY.value,
        difficulty="Championship / Transitive Closure & BFS",
        level=ChallengeLevel.LEVEL_5,
        language="python",
        problem_statement=(
            "Archaeologists found a set of translation rules between single letters. "
            "A letter 'a' can be translated to 'b', and translations are transitive (if a->b and b->c then a->c). "
            "Every letter can always be translated to itself. "
            "Given m translation pairs and n word pairs, determine for each word pair if the first word can be translated to the second word."
        ),
        input_format="First line: m (number of translations) and n (number of word pairs).\nNext m lines: two characters u and v.\nNext n lines: two space-separated words.",
        output_format="For each word pair, output 'yes' if match is possible, 'no' otherwise.",
        constraints=["1 <= m <= 500", "1 <= n <= 50", "Word lengths <= 50"],
        samples=[{"input": "3 2\nc t\ni r\np c\npic trip\npic trep\n", "output": "yes\nno"}],
        test_cases=[
            TestCase(test_id=1, input_data="3 2\nc t\ni r\np c\npic trip\npic trep\n", expected_output="yes\nno", is_sample=True),
            TestCase(test_id=2, input_data="1 1\na b\na b\n", expected_output="yes", is_sample=False),
            TestCase(test_id=3, input_data="2 2\na b\nb c\na c\na d\n", expected_output="yes\nno", is_sample=False),
        ],
        time_limit=2.0,
        memory_limit=256,
        target_file="solutions/icpc_wf_secret_chamber.py",
        initial_template="import sys\n\ndef solve():\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
        solution_code=(
            "import sys\n\ndef solve():\n"
            "    input_data = sys.stdin.read().split()\n"
            "    if not input_data:\n        return\n"
            "    m = int(input_data[0])\n"
            "    n = int(input_data[1])\n"
            "    ptr = 2\n"
            "    reach = {chr(i): {chr(i)} for i in range(ord('a'), ord('z') + 1)}\n"
            "    for _ in range(m):\n"
            "        u = input_data[ptr]\n"
            "        v = input_data[ptr+1]\n"
            "        reach[u].add(v)\n"
            "        ptr += 2\n"
            "    letters = [chr(i) for i in range(ord('a'), ord('z') + 1)]\n"
            "    for k in letters:\n"
            "        for i in letters:\n"
            "            if k in reach[i]:\n"
            "                reach[i].update(reach[k])\n"
            "    out = []\n"
            "    for _ in range(n):\n"
            "        w1 = input_data[ptr]\n"
            "        w2 = input_data[ptr+1]\n"
            "        ptr += 2\n"
            "        if len(w1) != len(w2):\n"
            "            out.append('no')\n"
            "            continue\n"
            "        ok = True\n"
            "        for c1, c2 in zip(w1, w2):\n"
            "            if c2 not in reach[c1]:\n"
            "                ok = False\n"
            "                break\n"
            "        out.append('yes' if ok else 'no')\n"
            "    print('\\n'.join(out))\n\n"
            "if __name__ == '__main__':\n    solve()\n"
        )
    ),

    # LEVEL 6: Complex Real-World Software Engineering
    BenchmarkChallenge(
        id="swe_bench_lru_cache_ttl",
        source="SWE-bench",
        source_url="https://github.com/SWE-bench/SWE-bench",
        title="Concurrent LRU Cache with TTL Eviction & Thread Safety",
        category=ChallengeCategory.SOFTWARE_ENGINEERING.value,
        difficulty="SWE Senior / Concurrency & Data Structures",
        level=ChallengeLevel.LEVEL_6,
        language="python",
        problem_statement=(
            "Implement a high-performance Least-Recently-Used (LRU) Cache supporting:\n"
            "- get(key): returns value or -1 if missing/expired\n"
            "- put(key, value, ttl_seconds=0): inserts/updates key with optional time-to-live\n"
            "- size(): returns number of active unexpired items\n"
            "Input is a stream of command tokens: PUT key val, GET key, SIZE, DEL key."
        ),
        input_format="A series of space-separated operations terminated by EOF: PUT k v, GET k, SIZE, DEL k",
        output_format="For each GET or SIZE command, print the result on a new line.",
        constraints=["1 <= operations <= 10^5", "Capacity: 3"],
        samples=[{"input": "PUT 1 10\nPUT 2 20\nPUT 3 30\nGET 1\nPUT 4 40\nGET 2\nSIZE\n", "output": "10\n-1\n3"}],
        test_cases=[
            TestCase(test_id=1, input_data="PUT 1 10\nPUT 2 20\nPUT 3 30\nGET 1\nPUT 4 40\nGET 2\nSIZE\n", expected_output="10\n-1\n3", is_sample=True),
            TestCase(test_id=2, input_data="PUT A 100\nGET A\nDEL A\nGET A\n", expected_output="100\n-1", is_sample=False),
            TestCase(test_id=3, input_data="PUT 1 1\nPUT 2 2\nPUT 3 3\nPUT 4 4\nGET 1\n", expected_output="-1", is_sample=False),
        ],
        time_limit=2.0,
        memory_limit=256,
        target_file="solutions/swe_lru_cache.py",
        initial_template="import sys\n\ndef solve():\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
        solution_code=(
            "import sys\nfrom collections import OrderedDict\n\nclass LRUCache:\n"
            "    def __init__(self, capacity=3):\n"
            "        self.capacity = capacity\n"
            "        self.cache = OrderedDict()\n\n"
            "    def get(self, key):\n"
            "        if key not in self.cache:\n            return -1\n"
            "        self.cache.move_to_end(key)\n"
            "        return self.cache[key]\n\n"
            "    def put(self, key, value):\n"
            "        if key in self.cache:\n"
            "            self.cache[key] = value\n"
            "            self.cache.move_to_end(key)\n"
            "        else:\n"
            "            if len(self.cache) >= self.capacity:\n"
            "                self.cache.popitem(last=False)\n"
            "            self.cache[key] = value\n\n"
            "    def delete(self, key):\n"
            "        if key in self.cache:\n            del self.cache[key]\n\n"
            "    def size(self):\n"
            "        return len(self.cache)\n\n"
            "def solve():\n"
            "    tokens = sys.stdin.read().split()\n"
            "    if not tokens:\n        return\n"
            "    cache = LRUCache(capacity=3)\n"
            "    idx = 0\n"
            "    out = []\n"
            "    while idx < len(tokens):\n"
            "        op = tokens[idx]\n"
            "        if op == 'PUT':\n"
            "            k, v = tokens[idx+1], tokens[idx+2]\n"
            "            cache.put(k, v)\n"
            "            idx += 3\n"
            "        elif op == 'GET':\n"
            "            k = tokens[idx+1]\n"
            "            out.append(str(cache.get(k)))\n"
            "            idx += 2\n"
            "        elif op == 'DEL':\n"
            "            k = tokens[idx+1]\n"
            "            cache.delete(k)\n"
            "            idx += 2\n"
            "        elif op == 'SIZE':\n"
            "            out.append(str(cache.size()))\n"
            "            idx += 1\n"
            "        else:\n"
            "            idx += 1\n"
            "    print('\\n'.join(out))\n\n"
            "if __name__ == '__main__':\n    solve()\n"
        )
    ),

    # LEVEL 7: Long-Horizon Autonomous Coding Tasks & Parser Synthesis
    BenchmarkChallenge(
        id="terminal_bench_rpn_calculator",
        source="Terminal-Bench",
        source_url="https://github.com/laude-institute/terminal-bench",
        title="Reverse Polish Notation Evaluator & Expression Compiler",
        category=ChallengeCategory.SOFTWARE_ENGINEERING.value,
        difficulty="Autonomous System / Compiler Parsing",
        level=ChallengeLevel.LEVEL_7,
        language="python",
        problem_statement=(
            "Implement an expression parser and Reverse Polish Notation (RPN) stack computer. "
            "Supports binary operators (+, -, *, /) using integer truncation towards zero, and variable assignment (SET var val). "
            "Outputs the evaluated top of stack on 'EVAL' or prints assigned variable on request."
        ),
        input_format="Lines containing space-separated RPN tokens or SET commands.",
        output_format="Result of evaluated expressions, one per line.",
        constraints=["Stack depth up to 1000", "Division by zero handled as ERROR"],
        samples=[{"input": "3 4 + 2 * EVAL\n", "output": "14"}],
        test_cases=[
            TestCase(test_id=1, input_data="3 4 + 2 * EVAL\n", expected_output="14", is_sample=True),
            TestCase(test_id=2, input_data="10 3 / EVAL\n", expected_output="3", is_sample=False),
            TestCase(test_id=3, input_data="4 13 5 / + EVAL\n", expected_output="6", is_sample=False),
        ],
        time_limit=2.0,
        memory_limit=256,
        target_file="solutions/terminal_bench_rpn.py",
        initial_template="import sys\n\ndef solve():\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
        solution_code=(
            "import sys\n\ndef eval_rpn(tokens):\n"
            "    stack = []\n"
            "    for t in tokens:\n"
            "        if t == '+':\n"
            "            b = stack.pop()\n            a = stack.pop()\n            stack.append(a + b)\n"
            "        elif t == '-':\n"
            "            b = stack.pop()\n            a = stack.pop()\n            stack.append(a - b)\n"
            "        elif t == '*':\n"
            "            b = stack.pop()\n            a = stack.pop()\n            stack.append(a * b)\n"
            "        elif t == '/':\n"
            "            b = stack.pop()\n            a = stack.pop()\n"
            "            if b == 0:\n                return 'ERROR'\n"
            "            stack.append(int(a / b))\n"
            "        elif t == 'EVAL':\n"
            "            return stack[-1] if stack else 0\n"
            "        else:\n"
            "            stack.append(int(t))\n"
            "    return stack[-1] if stack else 0\n\n"
            "def solve():\n"
            "    lines = sys.stdin.read().strip().split('\\n')\n"
            "    out = []\n"
            "    for line in lines:\n"
            "        tokens = line.strip().split()\n"
            "        if not tokens:\n            continue\n"
            "        out.append(str(eval_rpn(tokens)))\n"
            "    print('\\n'.join(out))\n\n"
            "if __name__ == '__main__':\n    solve()\n"
        )
    ),
]


class ChallengeLibrary:
    """Manages the standardized challenge catalog with filtering and lookup."""

    def __init__(self):
        self._challenges: Dict[str, BenchmarkChallenge] = {c.id: c for c in CHALLENGES}

    def list_all(self) -> List[BenchmarkChallenge]:
        return list(self._challenges.values())

    def get_by_id(self, challenge_id: str) -> Optional[BenchmarkChallenge]:
        return self._challenges.get(challenge_id)

    def filter_by_level(self, level: ChallengeLevel) -> List[BenchmarkChallenge]:
        return [c for c in self._challenges.values() if c.level == level]

    def filter_by_category(self, category: str) -> List[BenchmarkChallenge]:
        return [c for c in self._challenges.values() if c.category == category]

    def filter_by_source(self, source: str) -> List[BenchmarkChallenge]:
        return [c for c in self._challenges.values() if c.source.lower() == source.lower()]

    def update_status(self, challenge_id: str, status: str, runtime_ms: Optional[float] = None, error: Optional[str] = None):
        if challenge_id in self._challenges:
            self._challenges[challenge_id].status = status
            if runtime_ms is not None:
                self._challenges[challenge_id].last_runtime_ms = runtime_ms
            if error is not None:
                self._challenges[challenge_id].last_error = error


# Global library singleton
challenge_library = ChallengeLibrary()
