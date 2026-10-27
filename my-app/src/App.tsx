def is_palindrome(text: str) -> bool:
    """Checks if a string is a palindrome, ignoring case and punctuation."""
    cleaned = ''.join(char.lower() for char in text if char.isalnum())
    return cleaned == cleaned[::-1]

if __name__ == '__main__':
    test_cases = [
        ('racecar', True),
        ('radar', True),
        ('level', True),
        ('hello', False),
        ('A man, a plan, a canal: Panama', True),
    ]
    all_passed = True
    for word, expected in test_cases:
        actual = is_palindrome(word)
        status = 'PASS' if actual == expected else 'FAIL'
        if actual != expected: all_passed = False
        print(f'[{status}] {word} -> {actual}')
    if all_passed:
        print('\nALL PALINDROME TESTS PASSED.')
    else:
        print('\nTESTS FAILED.')
        exit(1)
