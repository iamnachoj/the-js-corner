---
title: 'The Weird Parts of JavaScript: Hoisting, Coercion, and More'
excerpt: hoisting, type coercion, and some other odd behaviors
image: The-weird-parts-of-Javascript.webp
isFeatured: true
date: '2024-06-25'
---
# Hoisting, Coercion, and More

JavaScript is an awesome language, but let’s be real—it has some weird quirks. If you've ever been surprised by JavaScript's behavior, you're not alone. Let's explore a few of the "weird parts" of JavaScript, including **hoisting, type coercion, and some other odd behaviors** that can trip up even experienced developers.

## 1. Hoisting: Variables That Seem to Magically Move

Hoisting is JavaScript’s way of moving function and variable declarations to the top of their scope. But **only the declarations are moved, not the assignments.**

### Example:
```js
console.log(name); // undefined
var name = "Alice";
console.log(name); // "Alice"
```

Why does this happen? Because JavaScript **hoists** the variable declaration (var name;) to the top, but not the assignment (name = "Alice"). So internally, the code runs like this:

```js
var name;
console.log(name); // undefined
name = "Alice";
console.log(name); // "Alice"
```

#### What about let and const?
Unlike var, variables declared with let and const are also hoisted but **stay in a "temporal dead zone"** until they are initialized.

```js
console.log(age); // ReferenceError: Cannot access 'age' before initialization
let age = 30;
```

Lesson? Use let and const instead of var to avoid hoisting confusion.

---

## 2. Type Coercion: JavaScript’s Best Guess
JavaScript loves to convert types for you. Sometimes this is useful, other times it leads to **unexpected** results.

### Example:
```js
console.log(5 + "5"); // "55" (number + string = string)
console.log("5" - 2); // 3 (string is converted to number)
console.log(0 == false); // true (because 0 is "falsy")
console.log([] == 0); // true (empty array converts to "")
```

Why does this happen? JavaScript automatically converts types to try to make sense of what you’re doing. This is called **type coercion**.

#### How to avoid coercion issues?
- **Use strict equality (===)** instead of loose equality (==).
- **Explicitly convert values** instead of relying on JavaScript’s guesses.

Example:
```js
console.log(Number("5") + 5); // 10
console.log(Boolean("")); // false
console.log([] === 0); // false (strict equality avoids type conversion)
```

---

## 3. Other Weird Behaviors

### **Truthy and Falsy Values**
Some values are automatically considered "truthy" or "falsy" in JavaScript. Check this out:

```js
if ("0") console.log("Truthy!"); // This runs, because "0" is a non-empty string
if (0) console.log("Falsy!"); // This does NOT run, because 0 is falsy
```

Values that are **falsy** in JavaScript:
- false
- 0
- "" (empty string)
- null
- undefined
- NaN

Everything else is truthy, even "0" and "false" as strings!

### **Adding Arrays and Objects**
Ever tried adding arrays or objects?

```js
console.log([] + []); // "" (empty string)
console.log([] + {}); // "[object Object]"
console.log({} + []); // "[object Object]" (Weird behavior due to automatic type conversion)
```

### **Function Overloading Doesn't Work Like You Think**
Unlike other languages, JavaScript doesn’t support function overloading in the usual way.

```js
function greet(name) {
console.log("Hello, " + name);
}

function greet() {
console.log("Hi there!");
}

greet("Alice"); // Output: "Hi there!" (the second function overwrites the first)
```

### **NaN is Not Equal to Itself**
NaN (Not-a-Number) is the only value in JavaScript that **is not equal to itself.**

```js
console.log(NaN === NaN); // false
```

If you need to check if a value is NaN, use Number.isNaN(value) instead.

```js
console.log(Number.isNaN(NaN)); // true
```

---

## Conclusion
JavaScript has its quirks, but understanding them makes you a better developer. **Hoisting, type coercion, and truthy/falsy values** are just a few of the many things that can surprise you. The key is to always test your assumptions and write clear, explicit code.

Got any other weird JavaScript behaviors that confused you? Share them in the comments! 🚀