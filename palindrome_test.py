def is_palindrome(text):
    # Normalize the string: convert to lowercase and remove non-alphanumeric characters
    processed_text = ''.join(filter(str.isalnum, text)).lower()
    # Check if the processed string is equal to its reverse
    return processed_text == processed_text[::-1]

def is_palindrome(text):
    # Normalize the string: convert to lowercase and remove non-alphanumeric characters
    processed_text = ''.join(filter(str.isalnum, text)).lower()
    # Check if the processed string is equal to its reverse
    return processed_text == processed_text[::-1]

if __name__ == "__main__":
    # Test cases
    test_cases = [
        ("racecar", True),
        ("A man, a plan, a canal: Panama", True),
        ("hello", False),
        ("madam", True),
        ("121", True),
        ("not a palindrome", False)
    ]

    print("--- Palindrome Checker Test ---")
    all_passed = True
    for text, expected in test_cases:
        result = is_palindrome(text)
        if result == expected:
            print(f"PASS: '{text}' -> {result}")
        else:
            print(f"FAIL: '{text}' - Expected {expected}, Got {result}")
            all_passed = False

    if all_passed:
        print("\nAll test cases passed successfully!")
    else:
        print("\nSome test cases failed.")