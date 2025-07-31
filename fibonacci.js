// [AI]
/**
 * Fibonacci sequence generator with multiple implementation approaches
 */

/**
 * Generates fibonacci sequence up to n numbers (iterative approach - most efficient)
 * @param {number} n - Number of fibonacci numbers to generate
 * @returns {number[]} Array of fibonacci numbers
 */
function fibonacci(n) {
  if (n <= 0) return [];
  if (n === 1) return [0];
  if (n === 2) return [0, 1];
  
  const sequence = [0, 1];
  for (let i = 2; i < n; i++) {
    sequence[i] = sequence[i - 1] + sequence[i - 2];
  }
  return sequence;
}

/**
 * Gets the nth fibonacci number (recursive approach - elegant but slower)
 * @param {number} n - Position in fibonacci sequence (0-indexed)
 * @returns {number} The nth fibonacci number
 */
function fibonacciNth(n) {
  if (n <= 1) return n;
  return fibonacciNth(n - 1) + fibonacciNth(n - 2);
}

/**
 * Gets the nth fibonacci number (memoized recursive approach - faster)
 * @param {number} n - Position in fibonacci sequence (0-indexed)
 * @param {Map} memo - Memoization cache
 * @returns {number} The nth fibonacci number
 */
function fibonacciMemo(n, memo = new Map()) {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n);
  
  const result = fibonacciMemo(n - 1, memo) + fibonacciMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}

/**
 * Generates fibonacci numbers up to a maximum value
 * @param {number} maxValue - Maximum value to generate up to
 * @returns {number[]} Array of fibonacci numbers up to maxValue
 */
function fibonacciUpTo(maxValue) {
  if (maxValue < 0) return [];
  
  const sequence = [0];
  if (maxValue >= 1) sequence.push(1);
  
  let current = 1;
  let previous = 0;
  
  while (true) {
    const next = current + previous;
    if (next > maxValue) break;
    
    sequence.push(next);
    previous = current;
    current = next;
  }
  
  return sequence;
}

// Example usage and demonstrations
console.log('Fibonacci Examples:');
console.log('==================');

console.log('First 10 fibonacci numbers:', fibonacci(10));
console.log('8th fibonacci number (recursive):', fibonacciNth(8));
console.log('8th fibonacci number (memoized):', fibonacciMemo(8));
console.log('Fibonacci numbers up to 100:', fibonacciUpTo(100));

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fibonacci,
    fibonacciNth,
    fibonacciMemo,
    fibonacciUpTo
  };
}
// [/AI]


const humancode = () => {
  console.log('Hello, world!');
  const a = 1;
  const b = 2;
  const c = a + b;
  console.log(c);
}

humancode();