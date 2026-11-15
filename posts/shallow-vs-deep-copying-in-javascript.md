---
title: "Shallow vs. Deep Copying in JavaScript"
date: "2026-11-15"
image: "shallow-vs-deep"
excerpt: "Understand how JavaScript copies objects, why nested data can cause unexpected changes, and when to use shallow or deep copying."
isFeatured: true
---

# Shallow vs. Deep Copying in JavaScript

## 1. Introduction

Copying data in JavaScript sounds like a very simple operation:

```javascript
const original = { name: "John" };
const copy = original;
```

We created a variable called `copy` and assigned the value of `original` to it. So, we now have two objects with the same information, right?

Well, not exactly.

Let's try changing the copy:

```javascript
copy.name = "Peter";

console.log(original.name); // "Peter"
console.log(copy.name);     // "Peter"
```

Wait... why did changing `copy` also change `original`?

This happens because JavaScript does not always copy values in the way we might expect. Depending on the type of data, assigning a value to another variable can either create an independent copy or simply create another reference to the same data.

This is the foundation of **shallow copying** and **deep copying**.

Understanding these concepts is important because they help us avoid unexpected changes in our applications, especially when working with objects, arrays, React state, or nested data structures.

Let's start from the beginning.

---

## 2. How JavaScript handles values

Before understanding copying, we need to understand how JavaScript handles data.

JavaScript has two important categories of values:

- Primitive values.
- Objects (also called reference types).

### 2.1. Primitive values

Primitive values include:

- `string`
- `number`
- `boolean`
- `undefined`
- `null`
- `bigint`
- `symbol`

When we assign a primitive value to another variable, JavaScript copies the actual value.

For example:

```javascript
let age = 30;
let anotherAge = age;

anotherAge = 35;

console.log(age);        // 30
console.log(anotherAge); // 35
```

Why didn't `age` change?

Because `anotherAge` received its own copy of the value `30`.

We can imagine two independent boxes:

```text
age         → 30

anotherAge  → 30
```

Changing one does not affect the other.

This is what we normally expect when copying something.

### 2.2. Objects and reference types

Objects work differently.

In JavaScript, objects include:

- Regular objects: `{}`
- Arrays: `[]`
- Functions
- Dates
- Maps
- Sets
- And other object types.

When we assign an object to another variable, JavaScript does not create a new independent object.

Instead, both variables refer to the same object.

Let's see:

```javascript
const user = {
  name: "John",
  age: 30
};

const anotherUser = user;

anotherUser.name = "Peter";

console.log(user.name);        // "Peter"
console.log(anotherUser.name); // "Peter"
```

Both variables point to the same object.

We can imagine it like this:

```text
user ──────────┐
               │
               ▼
          ┌──────────────┐
          │ name: Peter  │
          │ age: 30      │
          └──────────────┘
               ▲
               │
anotherUser ───┘
```

There is only one object in memory, but two variables accessing it.

This is called **reference sharing**.

The important thing to understand is that the variable does not contain an independent copy of the object. It holds a reference that allows JavaScript to access that object.

### 2.3. A small but important detail: `const` does not make objects immutable

You might have noticed that we used `const` in our examples.

Why can we still modify the object?

Because `const` prevents us from assigning a completely different value to the variable. It does not prevent us from modifying the properties of the object it references.

```javascript
const user = {
  name: "John"
};

// This is allowed
user.name = "Peter";

// This is NOT allowed
user = { name: "Mary" };
```

Think of `const` as protecting the reference, not the contents of the object.

This distinction will be important when we start copying objects.

---

## 3. What is shallow copying?

A **shallow copy** creates a new object, but only copies its first level of properties.

If those properties contain primitive values, they are copied independently.

However, if a property contains another object or array, only its reference is copied.

In other words:

- The new object is independent.
- Nested objects are still shared.

Let's see it in practice.

### 3.1. A simple example

```javascript
const original = {
  name: "John",
  age: 30
};

const copy = { ...original };

copy.name = "Peter";

console.log(original.name); // "John"
console.log(copy.name);     // "Peter"
```

Great! This time, changing the copy did not affect the original.

Why?

Because the spread operator (`...`) created a new object.

We now have two independent objects:

```text
original ──→ { name: "John", age: 30 }

copy ──────→ { name: "Peter", age: 30 }
```

But what happens when we have nested objects?

### 3.2. The problem with nested objects

Let's make our example a little more realistic:

```javascript
const original = {
  name: "John",
  address: {
    city: "Barcelona",
    country: "Spain"
  }
};

const copy = { ...original };
```

At first glance, everything looks fine. We have a new object called `copy`.

Let's check:

```javascript
console.log(original === copy); // false
```

This returns `false` because they are two different objects.

However, let's compare their nested properties:

```javascript
console.log(original.address === copy.address); // true
```

Surprise!

The `address` property is still referencing the same object.

Why?

Because the spread operator only copies the first level of properties. When it reaches `address`, it copies the reference, not the nested object itself.

Let's visualize it:

```text
                 ORIGINAL
                    │
          ┌─────────┴─────────┐
          │                   │
        name               address
          │                   │
        "John"                │
                              ▼
                        ┌───────────┐
                        │ Barcelona│
                        │ Spain    │
                        └───────────┘
                              ▲
                              │
          ┌───────────────────┴───┐
          │                       │
        name                   address
          │                       │
        "John"                    │
          │                       │
          └───────────────────────┘
                    COPY
```

Both objects have their own `name` property, but their `address` properties point to the same nested object.

Let's test it:

```javascript
copy.name = "Peter";
copy.address.city = "Madrid";

console.log(original.name);         // "John"
console.log(original.address.city); // "Madrid"
```

Changing the top-level property does not affect the original.

But changing a nested property does!

This is the main limitation of shallow copying.

---

## 4. How to create shallow copies in JavaScript

There are several common ways to create shallow copies.

### 4.1. Object spread syntax

This is probably the most common approach for copying objects.

```javascript
const original = {
  name: "John",
  age: 30
};

const copy = { ...original };
```

It creates a new object with the same enumerable own properties.

Remember: it is still a shallow copy.

### 4.2. Object.assign()

Another way is using `Object.assign()`.

```javascript
const original = {
  name: "John",
  age: 30
};

const copy = Object.assign({}, original);
```

The first argument is the target object. The second argument is the source object.

`Object.assign()` copies the source properties into the target and returns that target.

In this case, `{}` is a new empty object, so we get a new object containing the original properties.

It also performs a shallow copy.

### 4.3. Array spread syntax

The spread operator works with arrays too.

```javascript
const original = [1, 2, 3];

const copy = [...original];

copy.push(4);

console.log(original); // [1, 2, 3]
console.log(copy);     // [1, 2, 3, 4]
```

The array itself is independent.

But what if the array contains objects?

```javascript
const original = [
  { name: "John" },
  { name: "Mary" }
];

const copy = [...original];

copy[0].name = "Peter";

console.log(original[0].name); // "Peter"
```

The array was copied, but the objects inside it were not.

Exactly the same principle applies.

### 4.4. Array methods such as slice()

Another common way to create a shallow copy of an array is `slice()`.

```javascript
const original = [1, 2, 3];

const copy = original.slice();
```

It returns a new array containing the same elements.

Again, if those elements are objects, their references are shared.

---

## 5. What is deep copying?

A **deep copy** creates a completely independent copy of an object, including its nested objects and arrays.

Unlike shallow copying, it does not keep references to the original nested objects.

Let's use our previous example:

```javascript
const original = {
  name: "John",
  address: {
    city: "Barcelona",
    country: "Spain"
  }
};
```

Imagine creating a deep copy:

```javascript
const copy = /* deep copy of original */;
```

Now, we want both objects to be completely independent.

Conceptually:

```text
ORIGINAL                    COPY

{                           {
  name: "John",               name: "John",
  address: {                  address: {
    city: "Barcelona",           city: "Barcelona",
    country: "Spain"             country: "Spain"
  }                            }
}                           }
```

The important difference is that the nested `address` objects are also different objects in memory.

Let's test:

```javascript
console.log(original === copy); // false

console.log(
  original.address === copy.address
); // false
```

Both comparisons return `false`.

Now, changing the copy:

```javascript
copy.name = "Peter";
copy.address.city = "Madrid";

console.log(original.name);         // "John"
console.log(original.address.city); // "Barcelona"
```

Nothing changes in the original.

We have successfully created an independent copy.

---

## 6. How to create deep copies in JavaScript

There are different approaches, but some are much better than others.

### 6.1. structuredClone()

Modern JavaScript provides a native method called `structuredClone()`.

It creates a deep copy of a value using the structured clone algorithm.

```javascript
const original = {
  name: "John",
  address: {
    city: "Barcelona",
    country: "Spain"
  },
  hobbies: ["climbing", "reading"]
};

const copy = structuredClone(original);
```

Now, nested objects and arrays are copied too.

```javascript
copy.address.city = "Madrid";
copy.hobbies.push("cycling");

console.log(original.address.city); // "Barcelona"
console.log(original.hobbies);      // ["climbing", "reading"]
```

This is usually the easiest and most reliable option for deep copying supported data structures.

It also supports several built-in types, including:

- Objects
- Arrays
- Dates
- Maps
- Sets
- ArrayBuffers
- Typed arrays

It can also preserve circular references.

For example:

```javascript
const original = {
  name: "John"
};

original.self = original;

const copy = structuredClone(original);

console.log(copy.self === copy); // true
```

A circular reference happens when an object refers to itself, directly or indirectly.

However, `structuredClone()` has some limitations.

It cannot clone everything. For example:

- Functions cannot be cloned.
- DOM nodes cannot be cloned.
- Objects containing certain unsupported values, such as functions, will cause a `DataCloneError`.
- Custom prototypes, property descriptors and getters/setters are not preserved as they are in the original object.

So, it is excellent for many normal data structures, but it is not a universal solution for every JavaScript object.

### 6.2. JSON.parse() and JSON.stringify()

Before `structuredClone()` became widely available, developers often used a small trick:

```javascript
const copy = JSON.parse(
  JSON.stringify(original)
);
```

How does this work?

Let's break it down:

1. `JSON.stringify()` converts a JavaScript value into a JSON string.
2. `JSON.parse()` reads that JSON string and creates a new JavaScript value.

For example:

```javascript
const original = {
  name: "John",
  address: {
    city: "Barcelona"
  }
};

const copy = JSON.parse(
  JSON.stringify(original)
);
```

The process creates new objects, including nested ones.

However, this technique has important limitations.

It only works correctly for data that can be represented in JSON.

Some examples:

| JavaScript value | What happens |
|---|---|
| String | Preserved |
| Number | Preserved |
| Boolean | Preserved |
| Array | Preserved |
| Plain object | Preserved |
| `undefined` in an object | Property is removed |
| `undefined` in an array | Becomes `null` |
| Function | Removed from objects |
| `Date` | Becomes a string |
| `Map` / `Set` | Usually becomes an empty object |
| `BigInt` | Throws an error |
| Circular references | Throws an error |

For example:

```javascript
const original = {
  name: "John",
  birthday: new Date("1994-08-15"),
  value: undefined
};

const copy = JSON.parse(
  JSON.stringify(original)
);

console.log(copy.birthday); // String, not Date
console.log(copy.value);    // undefined (property is missing)
```

The original `Date` object has become a string.

So, although this trick can work for simple data, `structuredClone()` is normally a better option.

### 6.3. Writing your own deep copy function

Could we write our own function to recursively copy an object?

Yes!

The basic idea is:

1. Create a new object.
2. Loop through its properties.
3. If a property is primitive, copy its value.
4. If a property is another object, recursively copy it too.

For example:

```javascript
function deepCopy(value) {
  // Primitive values can be returned directly
  if (value === null || typeof value !== "object") {
    return value;
  }

  // Create a new array or object
  const copy = Array.isArray(value) ? [] : {};

  // Copy every property recursively
  for (const key in value) {
    if (Object.hasOwn(value, key)) {
      copy[key] = deepCopy(value[key]);
    }
  }

  return copy;
}
```

Let's test it:

```javascript
const original = {
  name: "John",
  address: {
    city: "Barcelona"
  },
  hobbies: ["climbing", "reading"]
};

const copy = deepCopy(original);

copy.address.city = "Madrid";
copy.hobbies.push("cycling");

console.log(original.address.city); // "Barcelona"
console.log(original.hobbies);      // ["climbing", "reading"]
```

It works for this simple example.

But don't use this function as a general replacement for `structuredClone()`!

It is only a basic demonstration of recursion and deep copying.

It does not correctly handle many cases, such as:

- Circular references.
- Dates.
- Maps and Sets.
- Functions and special object types.
- Custom prototypes.
- Symbol properties.
- Non-enumerable properties.

A production-ready deep cloning function is much more complicated than it first looks.

---

## 7. Shallow copy vs. deep copy: the main differences

Let's put everything together.

| Feature | Shallow Copy | Deep Copy |
|---|---|---|
| Creates a new top-level object | Yes | Yes |
| Copies primitive properties | Yes | Yes |
| Creates new nested objects | No | Yes |
| Shares nested object references | Yes | No |
| Independent nested modifications | No | Yes |
| Usually faster and simpler | Yes | Not necessarily |
| Common examples | Spread, `Object.assign()` | `structuredClone()` |

The most important thing to remember:

**A shallow copy creates a new first-level object, while a deep copy also creates new copies of the nested objects.**

---

## 8. A common real-world problem: updating nested objects

Let's imagine we have a user object in an application.

```javascript
const user = {
  name: "John",
  preferences: {
    theme: "dark",
    notifications: true
  }
};
```

We want to create a modified version of this user, changing only the theme.

A common mistake would be:

```javascript
const updatedUser = { ...user };

updatedUser.preferences.theme = "light";
```

It looks correct, but there is a problem.

We only copied the first level.

The `preferences` object is still shared.

Therefore:

```javascript
console.log(user.preferences.theme); // "light"
```

We unintentionally modified the original user.

How can we avoid this?

One option is to copy the nested object too:

```javascript
const updatedUser = {
  ...user,
  preferences: {
    ...user.preferences,
    theme: "light"
  }
};
```

Now, both the top-level object and the nested `preferences` object are new.

```javascript
console.log(user.preferences.theme);        // "dark"
console.log(updatedUser.preferences.theme); // "light"
```

Notice something interesting:

We didn't need to deep copy the entire object.

We only copied the levels that we wanted to modify.

This is a very common and useful pattern in JavaScript.

### 8.1. Why this matters in React

React is a good example of why understanding object references is important.

React state should generally be treated as immutable. Instead of modifying an existing object directly, we create a new object and update the state with it.

Imagine this state:

```javascript
const [user, setUser] = useState({
  name: "John",
  preferences: {
    theme: "dark"
  }
});
```

A bad approach would be:

```javascript
user.preferences.theme = "light";

setUser(user);
```

We modified the existing object and passed the same reference back to React.

React uses reference identity in its state update logic. If the new state is the same object reference, React may skip rendering the component.

A better approach:

```javascript
setUser(previousUser => ({
  ...previousUser,
  preferences: {
    ...previousUser.preferences,
    theme: "light"
  }
}));
```

Here we create:

- A new user object.
- A new preferences object.
- The same references for any other nested objects we didn't modify.

This is enough because we only changed the `preferences.theme` property.

**Important:** We don't always need a deep copy when updating state. In fact, copying everything unnecessarily can be inefficient.

The goal is to create new references along the path of the properties we are changing, while keeping unchanged data as it is.

---

## 9. Common mistakes and things to remember

### Mistake 1: Thinking the spread operator performs a deep copy

```javascript
const copy = { ...original };
```

This only copies the first level.

Nested objects and arrays are still shared.

### Mistake 2: Thinking arrays are different

Arrays are objects in JavaScript.

Therefore, the same rules apply:

```javascript
const copy = [...originalArray];
```

Creates a new array, but does not recursively copy objects inside it.

### Mistake 3: Thinking `const` makes an object immutable

```javascript
const user = { name: "John" };

user.name = "Peter"; // Allowed
```

`const` protects the variable assignment, not the object properties.

### Mistake 4: Using JSON cloning for everything

```javascript
JSON.parse(JSON.stringify(original));
```

This can lose information and does not support all JavaScript values.

Prefer `structuredClone()` when you need a deep copy of supported data.

### Mistake 5: Deep copying everything

Deep copying is not automatically better.

If you only need to change one nested property, copying the entire object can be unnecessary.

Sometimes a shallow copy combined with a few nested copies is the best solution.

---

## 10. Final mental model

If you remember only one thing from this article, remember this:

**JavaScript objects are accessed through references. Copying an object does not automatically mean copying everything inside it.**

Think about it like this:

- **Assignment (`=`):** Two variables share the same object.
- **Shallow copy (`...`, `Object.assign()`):** A new outer object, but nested objects are still shared.
- **Deep copy (`structuredClone()`):** A new outer object and new copies of its supported nested data.

And one last important detail:

You don't always need a deep copy. What you need is to understand which objects are shared and which ones are independent.

Once you understand that, many strange JavaScript behaviours become much easier to explain.

---

## 11. Quick knowledge check

Try to answer these questions before looking at the solutions.

### Question 1

What will be printed?

```javascript
const original = {
  name: "John"
};

const copy = original;

copy.name = "Peter";

console.log(original.name);
```

### Question 2

What will be printed?

```javascript
const original = {
  name: "John",
  address: {
    city: "Barcelona"
  }
};

const copy = { ...original };

copy.name = "Peter";
copy.address.city = "Madrid";

console.log(original.name);
console.log(original.address.city);
```

### Question 3

What will be printed?

```javascript
const original = {
  name: "John",
  address: {
    city: "Barcelona"
  }
};

const copy = structuredClone(original);

copy.address.city = "Madrid";

console.log(original.address.city);
```

### Question 4

Which approach is better when you only want to update the theme?

```javascript
const user = {
  name: "John",
  preferences: {
    theme: "dark"
  }
};
```

**A:**

```javascript
const updatedUser = structuredClone(user);
updatedUser.preferences.theme = "light";
```

**B:**

```javascript
const updatedUser = {
  ...user,
  preferences: {
    ...user.preferences,
    theme: "light"
  }
};
```

---

## 12. Answers

**Question 1:** `"Peter"`

Both variables reference exactly the same object.

**Question 2:** `"John"` and `"Madrid"`.

The top-level object was copied, so changing `name` does not affect the original. However, `address` is still shared, so changing its `city` affects both objects.

**Question 3:** `"Barcelona"`.

`structuredClone()` created a new object, including a new nested `address` object.

**Question 4:** B is generally the better approach.

We only need to create new references for the object and the nested `preferences` object that we are modifying. There is no need to deep copy the entire structure.

---

*End of article.*
