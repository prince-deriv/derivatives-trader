// [AI]
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

/**
 * Memoized recursive Fibonacci (efficient recursive approach)
 * @param {number} n - The position in the Fibonacci sequence
 * @param {Map} memo - Memoization cache
 * @returns {number} The Fibonacci number at position n
 */
function fibonacciMemoized(n, memo = new Map()) {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n);
  
  const result = fibonacciMemoized(n - 1, memo) + fibonacciMemoized(n - 2, memo);
  memo.set(n, result);
  return result;
}

/**
 * Generate Fibonacci sequence up to n terms
 * @param {number} terms - Number of terms to generate
 * @returns {number[]} Array of Fibonacci numbers
 */
function generateFibonacciSequence(terms) {
  if (terms <= 0) return [];
  if (terms === 1) return [0];
  if (terms === 2) return [0, 1];
  
  const sequence = [0, 1];
  for (let i = 2; i < terms; i++) {
    sequence[i] = sequence[i - 1] + sequence[i - 2];
  }
  return sequence;
}

/**
 * Check if a number is a Fibonacci number
 * @param {number} num - Number to check
 * @returns {boolean} True if the number is a Fibonacci number
 */
function isFibonacci(num) {
  if (num < 0) return false;
  
  let a = 0, b = 1;
  if (num === a || num === b) return true;
  
  while (b < num) {
    const temp = a + b;
    a = b;
    b = temp;
    if (b === num) return true;
  }
  return false;
}

// Example usage and testing
console.log('🔢 Fibonacci Implementations Demo\n');

// Test different implementations
const testNumber = 10;
console.log(`Testing with n = ${testNumber}:`);
console.log(`Iterative: ${fibonacciIterative(testNumber)}`);
console.log(`Recursive: ${fibonacciRecursive(testNumber)}`);
console.log(`Memoized: ${fibonacciMemoized(testNumber)}`);

// Generate sequence
console.log('\n📋 First 15 Fibonacci numbers:');
const sequence = generateFibonacciSequence(15);
console.log(sequence.join(', '));

// Test Fibonacci checker
console.log('\n✅ Fibonacci number checker:');
const testNumbers = [0, 1, 2, 3, 5, 8, 13, 21, 22, 34];
testNumbers.forEach(num => {
  console.log(`${num}: ${isFibonacci(num) ? '✓' : '✗'}`);
});

// Performance comparison
console.log('\n⚡ Performance comparison (n=35):');
const n = 35;

console.time('Iterative');
const iterResult = fibonacciIterative(n);
console.timeEnd('Iterative');

console.time('Memoized');
const memoResult = fibonacciMemoized(n);
console.timeEnd('Memoized');

console.log(`Result: ${iterResult} (both methods should give same result: ${iterResult === memoResult})`);

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fibonacciIterative,
    fibonacciRecursive,
    fibonacciMemoized,
    generateFibonacciSequence,
    isFibonacci
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