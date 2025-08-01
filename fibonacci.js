// [AI]
/**
 * Fibonacci Utilities
 * A comprehensive collection of Fibonacci sequence functions with different approaches
 */

class FibonacciUtils {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Calculate nth Fibonacci number using simple recursion (slow for large n)
   */
  static fibonacciRecursive(n) {
    if (n < 0) throw new Error('Fibonacci is not defined for negative numbers');
    if (n <= 1) return n;
    return this.fibonacciRecursive(n - 1) + this.fibonacciRecursive(n - 2);
  }

  /**
   * Calculate nth Fibonacci number using iteration (efficient)
   */
  static fibonacciIterative(n) {
    if (n < 0) throw new Error('Fibonacci is not defined for negative numbers');
    if (n <= 1) return n;
    
    let a = 0, b = 1, temp;
    for (let i = 2; i <= n; i++) {
      temp = a + b;
      a = b;
      b = temp;
    }
    return b;
  }

  /**
   * Calculate nth Fibonacci number using memoization (fast and efficient)
   */
  fibonacciMemoized(n) {
    if (n < 0) throw new Error('Fibonacci is not defined for negative numbers');
    if (n <= 1) return n;
    
    if (this.cache.has(n)) {
      return this.cache.get(n);
    }
    
    const result = this.fibonacciMemoized(n - 1) + this.fibonacciMemoized(n - 2);
    this.cache.set(n, result);
    return result;
  }

  /**
   * Generate Fibonacci sequence up to n terms
   */
  static generateSequence(n) {
    if (n < 0) throw new Error('Number of terms cannot be negative');
    if (n === 0) return [];
    if (n === 1) return [0];
    
    const sequence = [0, 1];
    for (let i = 2; i < n; i++) {
      sequence.push(sequence[i - 1] + sequence[i - 2]);
    }
    return sequence;
  }

  /**
   * Generate Fibonacci sequence up to a maximum value
   */
  static generateUpToValue(maxValue) {
    if (maxValue < 0) return [];
    
    const sequence = [0];
    if (maxValue >= 1) sequence.push(1);
    
    let a = 0, b = 1;
    while (true) {
      const next = a + b;
      if (next > maxValue) break;
      sequence.push(next);
      a = b;
      b = next;
    }
    return sequence;
  }

  /**
   * Check if a number is a Fibonacci number
   */
  static isFibonacci(num) {
    if (num < 0) return false;
    if (num === 0 || num === 1) return true;
    
    let a = 0, b = 1;
    while (b < num) {
      const temp = a + b;
      a = b;
      b = temp;
    }
    return b === num;
  }

  /**
   * Find the position of a Fibonacci number in the sequence
   */
  static findPosition(num) {
    if (num < 0) return -1;
    if (num === 0) return 0;
    if (num === 1) return 1;
    
    let a = 0, b = 1, position = 1;
    while (b < num) {
      const temp = a + b;
      a = b;
      b = temp;
      position++;
    }
    return b === num ? position : -1;
  }

  /**
   * Calculate Fibonacci using Binet's formula (mathematical approach)
   */
  static fibonacciBinet(n) {
    if (n < 0) throw new Error('Fibonacci is not defined for negative numbers');
    
    const phi = (1 + Math.sqrt(5)) / 2;
    const psi = (1 - Math.sqrt(5)) / 2;
    return Math.round((Math.pow(phi, n) - Math.pow(psi, n)) / Math.sqrt(5));
  }

  /**
   * Calculate golden ratio approximation using consecutive Fibonacci numbers
   */
  static goldenRatio(n = 20) {
    if (n < 2) return 1;
    const fib = this.generateSequence(n);
    return fib[n - 1] / fib[n - 2];
  }

  /**
   * Matrix multiplication approach for Fibonacci (very efficient for large n)
   */
  static fibonacciMatrix(n) {
    if (n < 0) throw new Error('Fibonacci is not defined for negative numbers');
    if (n <= 1) return n;
    
    function matrixMultiply(a, b) {
      return [
        [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
        [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]]
      ];
    }
    
    function matrixPower(matrix, power) {
      if (power === 1) return matrix;
      if (power % 2 === 0) {
        const half = matrixPower(matrix, power / 2);
        return matrixMultiply(half, half);
      }
      return matrixMultiply(matrix, matrixPower(matrix, power - 1));
    }
    
    const fibMatrix = [[1, 1], [1, 0]];
    const result = matrixPower(fibMatrix, n);
    return result[0][1];
  }

  /**
   * Performance comparison of different approaches
   */
  static performanceTest(n = 30) {
    const utils = new FibonacciUtils();
    const results = {};
    
    // Test iterative approach
    const iterativeStart = performance.now();
    const iterativeResult = this.fibonacciIterative(n);
    const iterativeTime = performance.now() - iterativeStart;
    results.iterative = { result: iterativeResult, time: iterativeTime };
    
    // Test memoized approach
    const memoizedStart = performance.now();
    const memoizedResult = utils.fibonacciMemoized(n);
    const memoizedTime = performance.now() - memoizedStart;
    results.memoized = { result: memoizedResult, time: memoizedTime };
    
    // Test matrix approach
    const matrixStart = performance.now();
    const matrixResult = this.fibonacciMatrix(n);
    const matrixTime = performance.now() - matrixStart;
    results.matrix = { result: matrixResult, time: matrixTime };
    
    // Test Binet's formula
    const binetStart = performance.now();
    const binetResult = this.fibonacciBinet(n);
    const binetTime = performance.now() - binetStart;
    results.binet = { result: binetResult, time: binetTime };
    
    // Only test recursive for small n (it's too slow)
    if (n <= 35) {
      const recursiveStart = performance.now();
      const recursiveResult = this.fibonacciRecursive(n);
      const recursiveTime = performance.now() - recursiveStart;
      results.recursive = { result: recursiveResult, time: recursiveTime };
    }
    
    return results;
  }
}

// Simplified API for common use cases
const fibonacci = {
  nth: (n) => FibonacciUtils.fibonacciIterative(n),
  sequence: (n) => FibonacciUtils.generateSequence(n),
  upTo: (max) => FibonacciUtils.generateUpToValue(max),
  isNumber: (num) => FibonacciUtils.isFibonacci(num),
  position: (num) => FibonacciUtils.findPosition(num),
  golden: (n) => FibonacciUtils.goldenRatio(n),
  fast: (n) => FibonacciUtils.fibonacciMatrix(n),
  test: (n) => FibonacciUtils.performanceTest(n)
};

// Example usage and demonstrations
if (require.main === module) {
  console.log('🔢 Fibonacci Utility Tests\n');
  
  // Basic sequence generation
  console.log('First 15 Fibonacci numbers:');
  console.log(fibonacci.sequence(15).join(', '));
  console.log('');
  
  // Check specific positions
  const testPositions = [10, 20, 30];
  testPositions.forEach(n => {
    console.log(`F(${n}) = ${fibonacci.nth(n)}`);
  });
  console.log('');
  
  // Test if numbers are Fibonacci
  const testNumbers = [0, 1, 8, 13, 20, 21, 55, 89];
  console.log('Testing if numbers are Fibonacci:');
  testNumbers.forEach(num => {
    const isFib = fibonacci.isNumber(num);
    const position = fibonacci.position(num);
    console.log(`${num}: ${isFib} ${position >= 0 ? `(position ${position})` : ''}`);
  });
  console.log('');
  
  // Golden ratio approximation
  console.log('Golden ratio approximations:');
  [10, 15, 20, 25].forEach(n => {
    console.log(`Using F(${n})/F(${n-1}): ${fibonacci.golden(n).toFixed(8)}`);
  });
  console.log('Actual golden ratio: 1.61803398\n');
  
  // Performance comparison
  console.log('Performance test for F(30):');
  const perfResults = fibonacci.test(30);
  Object.entries(perfResults).forEach(([method, data]) => {
    console.log(`${method}: ${data.result} (${data.time.toFixed(4)}ms)`);
  });
}

module.exports = { FibonacciUtils, fibonacci };
// [/AI] 