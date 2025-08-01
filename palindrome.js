// [AI]
/**
 * Palindrome Utilities
 * A comprehensive collection of palindrome-related functions
 */

class PalindromeUtils {
  /**
   * Check if a string is a palindrome (case-insensitive, ignoring spaces and punctuation)
   */
  static isPalindrome(str) {
    if (typeof str !== 'string') return false;
    
    // Clean the string: remove non-alphanumeric characters and convert to lowercase
    const cleaned = str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    // Compare with its reverse
    return cleaned === cleaned.split('').reverse().join('');
  }

  /**
   * Check if a string is a palindrome using two pointers (more efficient)
   */
  static isPalindromeOptimized(str) {
    if (typeof str !== 'string') return false;
    
    const cleaned = str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    let left = 0;
    let right = cleaned.length - 1;
    
    while (left < right) {
      if (cleaned[left] !== cleaned[right]) {
        return false;
      }
      left++;
      right--;
    }
    
    return true;
  }

  // [/AI] 
  
  /**
   * Find all palindromic substrings in a string
   */
  static findPalindromicSubstrings(str) {
    if (typeof str !== 'string') return [];
    
    const palindromes = new Set();
    const cleaned = str.toLowerCase();
    
    // Check all possible substrings
    for (let i = 0; i < cleaned.length; i++) {
      for (let j = i + 1; j <= cleaned.length; j++) {
        const substring = cleaned.slice(i, j);
        if (substring.length > 1 && this.isPalindrome(substring)) {
          palindromes.add(substring);
        }
      }
    }
    
    return Array.from(palindromes).sort((a, b) => b.length - a.length);
  }

  /**
   * Find the longest palindromic substring
   */
  static longestPalindrome(str) {
    if (typeof str !== 'string' || str.length === 0) return '';
    
    let longest = '';
    
    // Check for odd-length palindromes (center is a single character)
    for (let i = 0; i < str.length; i++) {
      const palindrome = this.expandAroundCenter(str, i, i);
      if (palindrome.length > longest.length) {
        longest = palindrome;
      }
    }
    
    // Check for even-length palindromes (center is between two characters)
    for (let i = 0; i < str.length - 1; i++) {
      const palindrome = this.expandAroundCenter(str, i, i + 1);
      if (palindrome.length > longest.length) {
        longest = palindrome;
      }
    }
    
    return longest;
  }

  /**
   * Helper method to expand around center for palindrome detection
   */
  static expandAroundCenter(str, left, right) {
    while (left >= 0 && right < str.length && str[left].toLowerCase() === str[right].toLowerCase()) {
      left--;
      right++;
    }
    return str.slice(left + 1, right);
  }

  /**
   * Generate a palindrome by mirroring the first half of a string
   */
  static generatePalindrome(str) {
    if (typeof str !== 'string') return '';
    
    const cleaned = str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const half = cleaned.slice(0, Math.ceil(cleaned.length / 2));
    const firstHalf = half.slice(0, Math.floor(half.length));
    
    return firstHalf + half.slice(-1) + firstHalf.split('').reverse().join('');
  }

  /**
   * Check if a number is a palindrome
   */
  static isNumberPalindrome(num) {
    if (typeof num !== 'number') return false;
    
    const str = Math.abs(num).toString();
    return str === str.split('').reverse().join('');
  }

  /**
   * Get palindrome statistics for a string
   */
  static getStats(str) {
    if (typeof str !== 'string') return null;
    
    const palindromes = this.findPalindromicSubstrings(str);
    const longest = this.longestPalindrome(str);
    
    return {
      isPalindrome: this.isPalindrome(str),
      longestPalindrome: longest,
      longestLength: longest.length,
      totalPalindromes: palindromes.length,
      allPalindromes: palindromes,
      originalLength: str.length
    };
  }
}

// Utility functions for common use cases
const palindrome = {
  check: (str) => PalindromeUtils.isPalindrome(str),
  checkFast: (str) => PalindromeUtils.isPalindromeOptimized(str),
  findAll: (str) => PalindromeUtils.findPalindromicSubstrings(str),
  findLongest: (str) => PalindromeUtils.longestPalindrome(str),
  generate: (str) => PalindromeUtils.generatePalindrome(str),
  checkNumber: (num) => PalindromeUtils.isNumberPalindrome(num),
  stats: (str) => PalindromeUtils.getStats(str)
};

// Example usage and tests
if (require.main === module) {
  console.log('🔄 Palindrome Utility Tests\n');
  
  const testCases = [
    'racecar',
    'A man a plan a canal Panama',
    'race a car',
    'hello world',
    'Madam',
    'Was it a car or a cat I saw?',
    '12321',
    'abcdef'
  ];
  
  testCases.forEach(test => {
    console.log(`Testing: "${test}"`);
    console.log(`  Is palindrome: ${palindrome.check(test)}`);
    console.log(`  Longest palindrome: "${palindrome.findLongest(test)}"`);
    console.log(`  All palindromes: ${palindrome.findAll(test).slice(0, 3).join(', ')}${palindrome.findAll(test).length > 3 ? '...' : ''}`);
    console.log('');
  });
  
  // Number tests
  console.log('🔢 Number Palindrome Tests');
  [12321, 12345, 11, 101, -121].forEach(num => {
    console.log(`${num}: ${palindrome.checkNumber(num)}`);
  });
}

module.exports = { PalindromeUtils, palindrome };
