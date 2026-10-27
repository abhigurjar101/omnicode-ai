import sys
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity=3):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache[key] = value
            self.cache.move_to_end(key)
        else:
            if len(self.cache) >= self.capacity:
                self.cache.popitem(last=False)
            self.cache[key] = value

    def delete(self, key):
        if key in self.cache:
            del self.cache[key]

    def size(self):
        return len(self.cache)

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    cache = LRUCache(capacity=3)
    idx = 0
    out = []
    while idx < len(tokens):
        op = tokens[idx]
        if op == 'PUT':
            k, v = tokens[idx+1], tokens[idx+2]
            cache.put(k, v)
            idx += 3
        elif op == 'GET':
            k = tokens[idx+1]
            out.append(str(cache.get(k)))
            idx += 2
        elif op == 'DEL':
            k = tokens[idx+1]
            cache.delete(k)
            idx += 2
        elif op == 'SIZE':
            out.append(str(cache.size()))
            idx += 1
        else:
            idx += 1
    print('\n'.join(out))

if __name__ == '__main__':
    solve()
