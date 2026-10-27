import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    target = int(input_data[1])
    arr = [int(x) for x in input_data[2:2+n]]
    prefix_counts = {0: 1}
    curr_sum = 0
    ans = 0
    for v in arr:
        curr_sum += v
        needed = curr_sum - target
        if needed in prefix_counts:
            ans += prefix_counts[needed]
        prefix_counts[curr_sum] = prefix_counts.get(curr_sum, 0) + 1
    print(ans)

if __name__ == '__main__':
    solve()
