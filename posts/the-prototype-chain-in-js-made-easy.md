---
title: Inheritance? prototype?
excerpt: JavaScript is a dynamic language, and it has a prototype chain! how cool is that?
image: inheritance.jpg
isFeatured: false
date: '2024-2-22'
---

# Inheritance and the Prototype chain in JS

In JavaScript, like in many other languages, inheritance is like borrowing stuff from your older siblings. Imagine you have a bunch of objects, and you want some of them to share properties and methods. Instead of rewriting the same code for each object, you can create a parent object (or prototype) with those properties and methods.

Here's where the prototype chain comes into play. Each object in JavaScript has a hidden link to another object called its prototype. If JavaScript can't find a property or method on an object, it looks up the prototype chain until it finds what it's looking for.

So, when you call a method on an object, JavaScript first checks if that method exists directly on the object. If not, it checks the object's prototype, and if it's not there, it keeps going up the prototype chain until it finds what it needs. Or until it reaches null.

It's like asking your sibling for something, and if they don't have it, they ask your older sibling, and so on until someone has what you're looking for.

```javascript
// Constructor function for Car
function Car(make, model, year) {
    this.make = make;
    this.model = model;
    this.year = year;
}

// Adding a method to the Car prototype
Car.prototype.getAge = function() {
    const currentYear = new Date().getFullYear();
    return currentYear - this.year;
};

// Creating instances of Car
const car1 = new Car('Toyota', 'Camry', 2015);
const car2 = new Car('Honda', 'Accord', 2018);

// Using the method from the prototype
console.log(car1.getAge()); // Output: 9 (if current year is 2024)
console.log(car2.getAge()); // Output: 6 (if current year is 2024)

```

That's the gist of inheritance and the prototype chain in JavaScript! It's a powerful concept that helps keep your code clean and efficient.

## What's this `__proto__` thingy? how is this similar to prototype?

The `__proto__` property in JavaScript is an internal property of objects that points to the object's prototype. It's a reference to the prototype object that was used to create the object through either constructor function or literal notation.

Here's how `__proto__` is similar to prototype:

Relationship with Constructors: Both `__proto__` and prototype are related to object construction in JavaScript. When you create objects using constructor functions, the prototype property of the constructor function becomes the prototype of the objects created by that constructor, and the `__proto__` property of each instance points to that prototype.

Prototype Chain: Both `__proto__` and prototype are part of the prototype chain mechanism in JavaScript. When you access a property or method on an object, JavaScript first checks the object itself, then its `__proto__`, then the `__proto__` of the `__proto__`, and so on until it reaches null.

Inheritance: Both `__proto__` and prototype are involved in the inheritance model of JavaScript. Methods and properties defined in the prototype object are inherited by all instances of objects created with that constructor function, whether accessed through `__proto__` or the prototype chain.

However, there are some key differences:

prototype is a property of constructor functions, used to define properties and methods that are inherited by instances of objects created with that constructor.
`__proto__` is a property of individual instances of objects, used to reference the prototype of the object.
While prototype is used to define shared properties and methods for a type of object, `__proto__` is used to access the prototype of a specific instance of an object.

In modern JavaScript, direct manipulation of `__proto__` is discouraged, and it's recommended to use Object.getPrototypeOf() and Object.setPrototypeOf() for accessing and setting the prototype of objects respectively. This helps maintain cleaner and more readable code while adhering to JavaScript best practices.
