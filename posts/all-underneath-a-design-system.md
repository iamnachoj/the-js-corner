---
title: "All Underneath A Design System"
date: "2026-09-24"
image: "all-underneath-a-design-system.jpg"
excerpt: "A Design System has a lot more than just tokens and components, and the library is a lot trickier to organise than more people think. In this article, I dive deep into the logistics of the deliverables, not skipping the most basics, and making sure everything is so clear!"
isFeatured: true
---

When working in frontend development, it is common to come across concepts such as **Design System, Storybook, library, package, versioning, bundle, registries, artifacts**. These are all quite different things, but they are so closely related that they can be difficult to understand when studied separately. This article presents the complete system: from the creation of a component to the moment that component ends up running inside an application's browser.

## 1. What is a Design System, really?

A **Design System** is a broader concept than a component library. It is a set of rules, decisions, patterns, and tools that allow an organization to build interfaces consistently.

It can include:

* design colors and tokens
* typography
* spacing
* sizes
* borders and radii
* shadows
* iconography
* accessibility principles
* interaction patterns
* reusable components
* documentation
* guidelines on when and how to use each component
* designs in tools such as Figma
* implementations of those components in code

Therefore:

> **A Design System is not necessarily a package.**

A company could have a Design System defined in visual and UX terms without yet having a reusable component library.

However, in a software company it is very common for the Design System to have a **technical implementation**, for example a React component library:

```text
                     DESIGN SYSTEM
                         │
         ┌────────────────┼────────────────┐
         │                │                │
       Design         Guidelines         Code
         │                │                │
       Figma        Documentation     React library
```

The library is therefore **one of the technical pieces that materialize the Design System**.

## 2. Why does a Design System library exist?

Imagine a company with several frontend applications:

```text
Company
│
├── Booking App
├── Dashboard
├── Website Builder
├── Owner Portal
└── Admin
```

They all need buttons, modals, inputs, selects, tables, date pickers, etc.

Without a shared library, each team could implement its own components. Over time, differences might appear:

```text
Dashboard Button
  → padding: 12px
  → blue: #0066FF

Booking Button
  → padding: 10px
  → blue: #0055DD

Admin Button
  → padding: 12px
  → blue: #0066FF
  → radius: 6px
```

Even though they are all called "Button", their behavior and appearance could diverge.

A shared library allows those implementations to be centralized:

```text
              @company/design-system
                       │
           ┌────────────┼────────────┐
           │            │            │
       Booking       Dashboard      Admin
           │            │            │
           └──────── imports ────────┘
```

An application can then write:

```tsx
import { Button, Modal, Input } from '@company/design-system'
```

and directly use the components that another part of the organization has already implemented.

This provides reuse, consistency, and a common API across teams.

## 3. It is a library, not an application

A traditional application ultimately aims to provide a service to a user:

```text
Frontend application
        ↓
      User
```

A library has a different type of consumer:

```text
Library
    ↓
Developer
    ↓
Application
    ↓
User
```

When developing a library, the developers who use it are its immediate consumers.

That is why the **library API** is especially important.

For example:

```tsx
<Button
  variant="primary"
  size="large"
  loading
>
  Book now
</Button>
```

For the team maintaining the library, that API is a fundamental part of the product. Consumers do not need to know how the button works internally; they need to know how to use it.

This is similar to a backend API: the consumer interacts with a stable interface without needing to know the entire internal implementation. Today, it is becoming increasingly important to make libraries "agent-friendly"; in other words, since AI agents will be one of their main consumers, we need to make them more accessible to those agents.

## 4. Storybook is not the Design System or the library

It is important to separate these concepts.

**Design System** → a set of rules, patterns, components, and design decisions.

**Component library** → a reusable implementation of those components in code.

**Storybook** → a tool for developing, visualizing, documenting, and testing UI components.

For example, a library might have:

```text
design-system/
│
├── src/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.stories.tsx
│
│   ├── Modal/
│   │   ├── Modal.tsx
│   │   └── Modal.stories.tsx
│
│   └── Input/
│       ├── Input.tsx
│       └── Input.stories.tsx
│
├── package.json
└── .storybook/
```

`Button.tsx` contains the actual component:

```tsx
export function Button() {
  return <button>...</button>
}
```

While `Button.stories.tsx` tells Storybook how to display it:

```tsx
export default {
  title: 'Components/Button',
  component: Button,
}

export const Primary = {
  args: {
    children: 'Book now',
  },
}
```

Storybook can then present different states:

```text
Button
├── Primary
├── Secondary
├── Disabled
├── Loading
└── Long text
```

Therefore, it can be useful to think of Storybook as a **work environment for a UI library**. It allows developers to view and manipulate components without having to build a complete application around them.

Storybook can also be used alongside testing, accessibility, and visual regression tools.

## 5. A library does not need a server to work

This distinction is fairly basic, but many developers do not have the complete picture of this part of the delivery process, and it is worth stopping here because we will later discuss more complicated concepts around orchestrating versions, and we need to establish the fundamentals first.

A frontend application normally ends up being something that is served to a browser:

```text
Browser
   ↓
Frontend application
   ↓
Backend/API
```

A library is different. A library can simply be a collection of files that another project downloads and uses:

```text
Application
     ↓
Package
     ↓
JavaScript / CSS / types
```

There is not necessarily a "Design System server" running constantly. This is one of the things that distinguishes a library from a service.

For example, an application might do this:

```text
Browser
   │
   │ HTTP request
   ▼
Backend service
```

Whereas an application that uses a library does something conceptually similar to:

```text
Source code
    │
    │ import
    ▼
Library package
```

The library is consumed during the development and build process of the application.

## 6. Where does the library live?

This is where the concept of a **package registry** appears.

When you run:

```bash
npm install @company/design-system
```

npm looks for that package in a registry.

The best-known public registry is the **npm registry**, but companies can also use private registries such as GitHub Packages, GitLab Package Registry, AWS CodeArtifact, Artifactory, or other internal systems.

Conceptually:

```text
             Package Registry
                    │
        ┌────────────┼────────────┐
        │            │            │
  @company/ui   @company/icons  @company/utils
```

A company can publish its own packages there:

```text
@company/design-system@1.2.3
@company/icons@3.1.0
@company/api-client@2.4.1
```

The registry is, simplifying things, a system specialized in storing and distributing versions of packages.

## 7. What happens when the package is installed?

Suppose a Todo List application needs the Design System:

```bash
npm install @company/design-system
```

npm downloads the package and its dependencies and places them in the project, normally inside `node_modules/`.

For example:

```text
todo-app/
│
├── src/
│
├── package.json
│
└── node_modules/
    ├── react/
    ├── react-dom/
    ├── @company/
    │   └── design-system/
    ├── clsx/
    └── ...
```

`node_modules` is, as we already know, **the local collection of packages that the project needs**.

It is not some kind of magical file system. They are real files: JavaScript, TypeScript declaration files, CSS, JSON, images, source maps, documentation, etc.

A package might have a structure like this:

```text
@company/design-system/
├── package.json
├── dist/
│   ├── index.js
│   ├── index.d.ts
│   ├── Button.js
│   ├── Modal.js
│   └── styles.css
└── README.md
```

The `package.json` contains information about the package, such as its name, version, dependencies, and entry points.

## 8. What actually happens when you `import` something?

If the application writes:

```tsx
import { Button } from '@company/design-system'
```

the build system needs to locate that package.

Conceptually:

```text
TodoList.tsx
     │
     │ import Button
     ▼
@company/design-system
     │
     ▼
package.json
     │
     ▼
dist/index.js
     │
     ▼
Button.js
```

The package indicates where its entry code is located and which exports it provides.

Therefore, an `import` does not necessarily mean "download something from the Internet when the user clicks". During development and the build process, the tools resolve that import to the corresponding files.

In general, `node_modules` can become huge because dependencies have their own dependencies. For example:

```text
todo-app
│
└── node_modules
    ├── @company/design-system
    │
    ├── react
    │
    ├── react-dom
    │
    ├── clsx
    │
    ├── some-library
    │   └── dependencies...
    │
    └── ...
```

Also, not everything in `node_modules` ends up in the browser.

There may be packages used exclusively during development:

```text
typescript
vite
eslint
prettier
vitest
```

These help write, check, and build the application, but they do not necessarily become part of the JavaScript that the user eventually executes.

Therefore:

> **`node_modules` does not mean "everything that gets sent to the browser".**

It means:

> **"The packages that this project has installed as dependencies."**

At this point, the **Node.js** and **browser** environments are often mixed together. We already know that the browser has an engine capable of executing JavaScript, and Node.js is another runtime, and it is commonly needed for the **development environment and tooling**:

```text
                     Computer
                         │
              ┌───────────┴───────────┐
              │                       │
             Node                  Browser
              │                       │
       npm / pnpm                JavaScript engine
       Vite                      DOM
       TypeScript                CSS
       build tools               UI
```

For example:

```bash
npm install
npm run dev
npm run build
```

normally means running tools that operate on Node.js.

The browser appears later, when the application has already been built and its assets are served to the user.

### Why do we need to transpile?

JavaScript is the language that the browser can execute directly, but developers often write using additional languages or syntax.

For example, TypeScript:

```tsx
const age: number = 32
```

The browser does not need or understand the `: number` annotation.

A transformation can produce:

```jsx
const age = 32
```

Similarly, JSX:

```tsx
function App() {
  return <h1>Hello</h1>
}
```

is not JavaScript that the browser can directly interpret as JSX.

React tooling transforms JSX into JavaScript that uses React APIs.

Simplifying:

```jsx
TypeScript
     ↓
JavaScript
```

```visual-basic
   JSX
     ↓
JavaScript
```

This type of transformation between languages or variants of a language is usually called **transpilation**.

### Transpilation, compilation, and bundling are not exactly the same

These terms are often used informally, so it is easy to mix them up.

**Transpilation** consists, simplifying things, of transforming code from one form into another compatible form. For example:

```text
TypeScript → JavaScript
JSX → JavaScript
```

**Compilation** is a broader concept: transforming code from one representation into another that the machine can understand in order to execute it. In the modern frontend world, it is often used informally to refer to the complete process of transforming source code into production code.

**Bundling** is another operation: bringing modules and their dependencies together into one or more files that can be used by the application.

For example:

```text
main.tsx
   │
   ├── App.tsx
   │     └── TodoList.tsx
   │
   ├── api.ts
   │
   └── @company/design-system
             └── Button
```

This forms a **dependency graph**.

The bundler traverses that graph and generates the assets required by the application.

Therefore, a simplified way of imagining a modern build is:

```text
Source code
    │
    ├── TypeScript / JSX transformation
    │
    ├── module resolution
    │
    ├── bundling
    │
    ├── optimization
    │
    └── minification
          │
          ▼
    Production artifacts
```

### So what exactly is the build?

The **build** is the complete process through which a project's source code is transformed into the files that can be used to run or deploy the application.

For example:

```text
src/
├── App.tsx
├── TodoList.tsx
└── main.tsx

        ↓ BUILD

dist/
├── index.html
└── assets/
    ├── index.js
    ├── index.css
    └── ...
```

The result can be called a **build artifact** or simply an **artifact**: the files produced by the build process.

In a typical frontend application, these can include:

```text
HTML
JavaScript
CSS
images
fonts
other static assets
```

These are the files that a web server or CDN can ultimately serve to the browser.

#### What happens to the Design System Button during the build?

This is one of the fundamental ideas.

Suppose we have:

```tsx
import { Button } from '@company/design-system'

export function TodoList() {
  return (
    <div>
      <h1>My Todos</h1>
      <Button>New todo</Button>
    </div>
  )
}
```

The application has:

```text
todo-app/
├── src/
│   └── TodoList.tsx
│
└── node_modules/
    └── @company/
        └── design-system/
            └── dist/
                └── Button.js
```

During the build, the tooling follows the `import` and finds the required code.

Conceptually:

```text
TodoList.tsx
      │
      │ imports
      ▼
Design System
      │
      ▼
Button.js
      │
      ▼
Application build
```

The final application contains the code necessary to execute that Button.

It is important to clarify that there is not necessarily a literal copy of `Button.js` as a separate file. The bundler may combine it with other modules, split it into chunks, optimize it, remove unused code, or apply other transformations.

But conceptually, it is perfectly valid to think:

> **The application incorporates the code necessary for the Button it consumed from the library into its build.**

The browser does not need to know that this code originally came from `@company/design-system`. For the browser, what ultimately exists is executable JavaScript.

### The Design System has its own build too

Here we reach a very important distinction: **the library and the consuming application have different builds**.

The Design System team might write:

```text
Design System source
    │
    ├── Button.tsx
    ├── Modal.tsx
    ├── Input.tsx
    └── ...
```

and build it:

```text
Design System source
        ↓
Design System build
        ↓
dist/
        ↓
package
        ↓
Package Registry
```

For example:

```text
@company/design-system@1.2.3
```

Later, the Todo App consumes that package:

```text
Todo App source
       +
Design System package
       +
React
       +
other dependencies
       ↓
Todo App build
       ↓
dist/
       ↓
Browser
```

Therefore, there are two conceptually different processes:

```text
DESIGN SYSTEM

TSX source
   ↓
build
   ↓
package
   ↓
registry
```

and:

```text
APPLICATION

TSX source
   +
installed packages
   ↓
build
   ↓
production artifacts
   ↓
browser
```

## 9. Publishing a new version

Suppose the Design System currently has:

```text
@company/design-system@1.2.2
```

The Button is modified and a new version is published:

```text
@company/design-system@1.2.3
```

The new package is built and published to the package registry:

```text
Developer
    ↓
Git repository
    ↓
CI/CD
    ├── tests
    ├── build
    └── publish
          ↓
Package Registry
          ↓
@company/design-system@1.2.3
```

The application that was using `1.2.2` **does not automatically change simply because `1.2.3` now exists**.

The application has to resolve or update its dependency and rebuild its own project in order to incorporate the new version.

Conceptually:

```text
Todo App
    │
    │ currently uses
    ▼
1.2.2

Design System publishes
    │
    ▼
1.2.3

Todo App
    │
    │ update dependency
    ▼
1.2.3
    │
    │ build
    ▼
new application artifact
```

This is important:

**Publishing a library and deploying an application are different operations.**

## 17. Versions and Semantic Versioning

Libraries often use some form of versioning, frequently **Semantic Versioning**:

```text
1.2.3
│ │ │
│ │ └── patch
│ └──── minor
└────── major
```

Simplifying:

```text
1.2.3 → 1.2.4
```

usually represents compatible fixes.

```text
1.2.3 → 1.3.0
```

usually represents new compatible functionality.

```text
1.2.3 → 2.0.0
```

usually indicates changes that may break the existing API.

This is especially important for a Design System library because many applications may depend on it simultaneously.

A seemingly small change to a component's API can affect multiple consumers.

## 18. `package.json` and lockfiles

An application might declare a dependency like this:

```json
{
  "dependencies": {
    "@company/design-system": "^1.2.2"
  }
}
```

The `^` symbol allows certain compatible updates according to Semantic Versioning rules.

But the project will usually also have a lockfile, such as:

```text
package-lock.json
pnpm-lock.yaml
yarn.lock
```

The lockfile records the exact versions that were resolved.

This allows different machines and environments to reproduce the same dependencies consistently.

Therefore, updating a dependency may involve changes both in:

```text
package.json
```

and:

```text
pnpm-lock.yaml
```

or the corresponding lockfile.

## 19. Storybook and the package have different destinations

A library can have two different technical products derived from the same code:

```text
              Design System repository
                       │
               ┌───────┴───────┐
               │               │
           Storybook          Package
               │               │
               ↓               ↓
        Hosting/web app   Package Registry
               │               │
               ↓               ↓
        Developers browse  Apps install
```

Storybook can be published at an internal URL so that developers can browse the components.

The package, on the other hand, is published to a package registry so that applications can install it.

They are two different things:

> **Storybook displays and provides a workspace for the components. The package allows them to be consumed from code.**

## 20. The complete picture

The entire system can be summarized in this flow:

```text
                     DESIGN SYSTEM
                         │
           ┌─────────────┴──────────────┐
           │                            │
        Design                         Code
        rules                           │
           │                    Component library
        Figma                           │
           │                       Storybook
           │                            │
           │                    ┌───────┴───────┐
           │                    │               │
           │                Storybook         Package
           │                 hosting           registry
           │                    │               │
           │                    │               │
           │                Developers      Applications
           │                                    │
           │                              npm/pnpm install
           │                                    │
           │                                    ▼
           │                                node_modules
           │                                    │
           │                                    ▼
           │                              Application build
           │                                    │
           │                                    ▼
           │                               HTML / JS / CSS
           │                                    │
           └────────────────────────────────────┤
                                                ▼
                                             Browser
```

The fundamental idea is that there are **two major phases**.

During development:

```text
Source code
    ↓
Packages
    ↓
node_modules
    ↓
Build tools
```

During execution:

```text
Production artifacts
    ↓
Browser
    ↓
JavaScript / CSS / HTML
```

The browser does not need to know what npm is, what `node_modules` is, where the package registry was, or who originally wrote a component.

All of those are concerns of the development and build process.

## 21. The mental model worth keeping

A good way to think about this entire ecosystem is:

> **A package is a way of distributing reusable code. A package registry is the place from which that code is distributed. `node_modules` is the local copy of the packages that a project has installed. A build transforms source code and its dependencies into artifacts that can be executed or served. Storybook provides an environment for developing, visualizing, documenting, and testing UI components. And a Design System is the broader concept that encompasses design decisions, patterns, components, documentation, and, usually, their technical implementations.**

The complete journey of a component can therefore be imagined like this:

```text
Developer writes Button
        ↓
Button exists inside Design System
        ↓
Storybook displays/tests Button
        ↓
Design System is built
        ↓
Package is published
        ↓
Package Registry stores version 1.2.3
        ↓
Todo App installs 1.2.3
        ↓
Package appears in node_modules
        ↓
Todo App imports Button
        ↓
Todo App is built
        ↓
Button's required code becomes part of
the application's production output
        ↓
HTML + CSS + JavaScript are served
        ↓
Browser executes the JavaScript
        ↓
User sees the Button
```

The library, therefore, **is not a remote service that the browser queries to obtain a Button**. It is reusable code that an application incorporates during its development and build process.

And that distinction — **library versus service, package versus application, build versus runtime** — is one of the fundamental foundations for understanding how modern frontend development is organized.
