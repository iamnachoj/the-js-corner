---
title: Memoizing... what?
excerpt: Memoizing is all around us in CS, but what can we do about it?
image: memoizing-what.jpeg
isFeatured: false
date: '2024-6-24'
---

# Memoizing in JavaScript

Memoization is a technique used to speed up your code by storing the results of expensive function calls and returning the cached result when the same inputs occur again. It helps avoid redundant calculations and improves performance.

Here's a simple example in JavaScript:

```javascript
function memoize(fn) {
  const cache = {};
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache[key]) {
      console.log('Fetching from cache:', key);
      return cache[key];
    }
    console.log('Calculating result for:', key);
    const result = fn(...args);
    cache[key] = result;
    return result;
  };
}

// A function that performs an expensive calculation
function slowFunction(num) {
  for (let i = 0; i < 1e9; i++) {} // Simulate a slow process
  return num * 2;
}

// Memoized version of the slow function
const memoizedSlowFunction = memoize(slowFunction);

console.log(memoizedSlowFunction(5)); // Calculates and returns 10
console.log(memoizedSlowFunction(5)); // Fetches and returns 10 from cache
console.log(memoizedSlowFunction(10)); // Calculates and returns 20
console.log(memoizedSlowFunction(10)); // Fetches and returns 20 from cache
