---
title: "Understanding a Message Queue"
date: "2026-08-04"
image: "message-queue.png"
excerpt: "What is a message queue? what do we try to solve with it? it's hard to wrasp this concept without ever visualizing an example in JavaScript, and in this article, I do so with nodeJS!"
isFeatured: false
---

# Understanding Message Queues in Node.js

As you build larger backend applications, you'll eventually come across the term **message queue**. At first, it can be confusing, at least it was for me as a Frontend Developer. It often appears alongside concepts like the checkout flow in a big marketplace or e-commerce, streaming images downloaded in big social media apps, sending verification emails, or any other logic flow that involves background jobs and workers.

A message queue is not a JavaScript feature, nor is it specific to Node.js. Instead, it is an architectural pattern that allows applications to move work out of the request-response cycle and process it asynchronously in the background. At first, it can be confusing because it often appears alongside concepts like `async/await`, and while these ideas are related, they solve different problems.

Understanding when and why to use a message queue is an important step toward building scalable and responsive applications.

---

## What is a message queue?

A message queue is exactly what its name suggests: a queue that stores messages representing work that needs to be done.

Instead of performing an expensive task immediately, an application places a message into the queue. One or more background workers later retrieve that message and perform the required work.

You can think of it like a restaurant.

When you order food, the waiter doesn't cook it himself. Instead, he writes your order on a ticket and places it in the kitchen. The chefs then pick up tickets one by one and prepare the meals.

```
Client
   │
   ▼
Node.js API
   │
Creates a job
   │
   ▼
Message Queue
   │
   ▼
Worker
   │
Processes the job
```

The queue acts as a buffer between the application receiving requests and the workers performing the heavy work.

---

## Why not just use `async/await`?

This is probably the biggest source of confusion.

Both `async/await` and message queues involve asynchronous work, but they solve completely different problems.

`async/await` answers the question:

> **"How do I wait efficiently?"**

A message queue answers a different question:

> **"Do I need to wait at all?"**

Consider this endpoint:

```ts
app.post("/signup", async (req, res) => {
    await createUser(req.body);
    await sendWelcomeEmail(req.body.email);

    res.send("User created");
});
```

Many developers initially think that `await` blocks Node.js.

It doesn't.

While the email is being sent, Node.js is perfectly free to process hundreds of other requests. The event loop isn't blocked.

What **is** waiting is **this particular HTTP request**.

The client won't receive a response until every awaited operation has finished.

So while `async/await` prevents your server from blocking, it does **not** make your users receive responses any sooner.

---

## How a message queue changes the architecture

Imagine that sending the welcome email takes three seconds.

Does the user really need to wait those three seconds?

Probably not.

Instead of sending the email immediately, the API can simply create a job.

```ts
app.post("/signup", async (req, res) => {
    await createUser(req.body);

    await emailQueue.add({
        type: "WELCOME_EMAIL",
        email: req.body.email,
    });

    res.send("User created");
});
```

Now the request finishes almost immediately.

The actual email is sent later by a background worker.

```
Client
   │
POST /signup
   │
Create user
   │
Add job to queue
   │
Respond immediately

-----------------------------

Worker

↓

Read next job

↓

Send welcome email
```

Notice that the email hasn't disappeared—it has simply been delegated to another process.

That's the real purpose of a message queue.

---

## A real-world example: image processing

Imagine you're building a social media application.

A user uploads a photo.

Before the photo is ready, your application needs to:

- Resize the original image.
- Generate thumbnails.
- Compress the image.
- Run AI image recognition.
- Store metadata.

Without a queue, every upload request would have to wait until all of those tasks completed before receiving a response.

With a queue, the API simply stores the uploaded image and creates a job.

The user immediately sees something like:

> "Your image is being processed."

Meanwhile, one or more workers process the queued jobs independently.

This makes the application feel much faster while also allowing image processing to scale separately from the API itself.

---

## Another example: e-commerce

Imagine placing an order on an online store.

After payment succeeds, many things still need to happen:

- Send a confirmation email.
- Generate an invoice.
- Notify the warehouse.
- Update inventory.
- Trigger analytics events.
- Award loyalty points.

None of those operations need to finish before the customer sees:

> "Your order has been placed successfully."

Instead, the checkout service creates several jobs in a queue.

Different workers consume those jobs independently, each specializing in a specific task.

This keeps checkout fast while allowing the rest of the system to continue working in the background.

---

## Why workers?

One of the biggest advantages of message queues is that the API and the workers are completely independent.

Your API might be running as one Node.js process:

```bash
node api.js
```

while your workers run as separate processes:

```bash
node worker.js
```

Both communicate only through the queue.

This separation provides several benefits:

- The API stays responsive because it performs only the essential work required to answer the request.
- Workers can be scaled independently. If image processing becomes a bottleneck, you can simply start more workers without changing the API.
- Jobs remain safely stored in the queue even if a worker crashes, allowing them to be retried later.

---

## Popular message queue technologies

Very few production applications build their own queue from scratch. Instead, they rely on proven technologies that provide persistence, retries, monitoring and fault tolerance.

Some of the most popular options are:

- **BullMQ**, built on top of Redis and very popular in the Node.js ecosystem.
- **RabbitMQ**, a powerful general-purpose message broker.
- **Amazon SQS**, a fully managed queue service on AWS.
- **Google Pub/Sub**, Google's messaging platform.
- **Apache Kafka**, designed for processing massive streams of events.

Each has different strengths, but they all implement the same fundamental idea: decoupling work from the request that created it.

---

## Key takeaway

One of the most common misconceptions is that message queues exist because `async/await` isn't asynchronous enough.

That's not true.

`async/await` already allows Node.js to wait efficiently without blocking the event loop.

The real reason message queues exist is architectural.

They allow you to decide that certain work **doesn't need to finish before responding to the user**.

In other words:

- **`async/await` lets a function wait efficiently.**
- **A message queue removes the need to wait altogether.**

Once you understand that distinction, message queues become much easier to reason about. They're not a replacement for `async/await`; they're a way of moving long-running or non-essential work out of the request-response cycle, resulting in applications that are faster, more scalable and more resilient.
