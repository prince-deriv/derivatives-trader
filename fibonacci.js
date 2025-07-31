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
// Fibonacci sequence implementations in JavaScript

/**
 * Iterative Fibonacci implementation (most efficient)
 * @param {number} n - The position in the Fibonacci sequence
 * @returns {number} The Fibonacci number at position n
 */
function fibonacciIterative(n) {
  if (n <= 1) return n;
  
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}

/**
 * Recursive Fibonacci implementation (simple but inefficient for large n)
 * @param {number} n - The position in the Fibonacci sequence
 * @returns {number} The Fibonacci number at position n
 */
function fibonacciRecursive(n) {
  if (n <= 1) return n;
  return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
}




const humancode = () => {
  console.log('Hello, world!');
  const a = 1;
  const b = 2;
  const c = a + b;
  console.log(c);
}

humancode();