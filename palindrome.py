def is_palindrome(s: str) -> bool:
    """Checks if a string is a palindrome, ignoring case and non-alphanumeric characters."""
    # Clean the string: convert to lowercase and keep only alphanumeric characters
    clean_s = ''.join(filter(str.isalnum, s)).lower()
    
    # Check if the cleaned string is equal to its reverse
    return clean_s == clean_s[::-1]

# --- Test Cases ---
if __name__ == "__main__":
    # Test 1: Simple palindrome
    print(f"'racecar' is a palindrome: {is_palindrome('racecar')}") # Expected: True
    
    # Test 2: Case insensitive palindrome
    print(f"'Madam' is a palindrome: {is_palindrome('Madam')}") # Expected: True
    
    # Test 3: Palindrome with punctuation and spaces
    print(f"'A man, a plan, a canal: Panama' is a palindrome: {is_palindrome('A man, a plan, a canal: Panama')}") # Expected: True
    
    # Test 4: Not a palindrome
    print(f"'hello' is a palindrome: {is_palindrome('hello')}") # Expected: False
    
    # Test 5: Empty string (considered a palindrome)
    print(f"'' is a palindrome: {is_palindrome('')}") # Expected: True
    
    # Test 6: Single character
    print(f"'a' is a palindrome: {is_palindrome('a')}") # Expected: True