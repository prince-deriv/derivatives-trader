// [AI]
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

function fibonacciNumber(n) {
    if (n <= 0) return 0;
    if (n === 1) return 0;
    if (n === 2) return 1;
    
    let a = 0, b = 1;
    for (let i = 2; i < n; i++) {
        [a, b] = [b, a + b];
    }
    return b;
}

// Example usage
console.log('Fibonacci sequence (first 10 numbers):', fibonacci(10));
console.log('The 10th Fibonacci number:', fibonacciNumber(10));

module.exports = { fibonacci, fibonacciNumber };
// [/AI]