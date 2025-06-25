---
title: 'Redux Toolkit: an example'
date: '2025-6-25'
image: reduxtoolkit.png
excerpt: In this post, I disseminate Redux Toolkit, providing a quick example to understand all the basics and brush up on concepts.
isFeatured: true
---

# 🧠 Redux Toolkit – A Real-World Example: User Authentication

**Redux Toolkit (RTK)** is the official, recommended approach for writing Redux logic. But it can be easy to forget and miss on the structure when you haven't work in it for a while or you join a new project that build its structure long time ago. 

For that reason I wanted to create this article that works as a refresher summary where I define every file and the purpose by means of examples.

---

## 🧩 Core Concepts
```
| Concept             | Purpose                                                              |
|---------------------|-----------------------------------------------------------------------|
| `configureStore`    | Creates the Redux store with sensible defaults                        |
| `createSlice`       | Combines reducer, action creators, and initial state in one           |
| `createAsyncThunk`  | Manages async logic and auto-generates pending/fulfilled/rejected     |
| `useDispatch`       | React hook to dispatch actions                                        |
| `useSelector`       | React hook to access store state                                      |
```
---

## 🧪 Real-World Use Case: User Authentication

We'll create a small app where:

- A user can **log in**
- JWT token and user data are stored in **Redux state**
- Token is **persisted** in `localStorage`
- Auth state is accessed across components

---

## 📁 Suggested Folder Structure

```angular2html
src/
├── app/
│ └── store.js # Store configuration
├── features/
│ └── auth/
│ ├── authSlice.js # Redux slice for auth
│ └── authAPI.js # API logic
├── components/
│ └── LoginForm.jsx
```

## 🛠 Step-by-Step Guide

### 1. `store.js` – Create the store

```js 
    //src/app/store.js
    import { configureStore } from '@reduxjs/toolkit'
    import authReducer from '../features/auth/authSlice'

    export const store = configureStore({
      reducer: {
        auth: authReducer,
      },
    })
```
---

### 2. `authSlice.js` – Auth logic with `createAsyncThunk`
```js
    // src/features/auth/authSlice.js
    import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
    import { loginAPI } from './authAPI'

    const token = localStorage.getItem('token')

    const initialState = {
      user: null,
      token: token || null,
      status: 'idle',
      error: null,
    }

    export const loginUser = createAsyncThunk(
      'auth/loginUser',
      async (credentials, thunkAPI) => {
        try {
          const response = await loginAPI(credentials)
          return response
        } catch (err) {
          return thunkAPI.rejectWithValue(err.message)
        }
      }
    )

    const authSlice = createSlice({
      name: 'auth',
      initialState,
      reducers: {
        logout: (state) => {
          state.user = null
          state.token = null
          localStorage.removeItem('token')
        },
      },
      extraReducers: (builder) => {
        builder
          .addCase(loginUser.pending, (state) => {
            state.status = 'loading'
          })
          .addCase(loginUser.fulfilled, (state, action) => {
            state.status = 'succeeded'
            state.user = action.payload.user
            state.token = action.payload.token
            localStorage.setItem('token', action.payload.token)
          })
          .addCase(loginUser.rejected, (state, action) => {
            state.status = 'failed'
            state.error = action.payload
          })
      },
    })

    export const { logout } = authSlice.actions
    export default authSlice.reducer
```
---

### 3. `authAPI.js` – Fake API login
```js
    // src/features/auth/authAPI.js
    export const loginAPI = async ({ email, password }) => {
      if (email === 'admin@site.com' && password === '123456') {
        return {
          user: { id: 1, name: 'Admin', email },
          token: 'fake-jwt-token-123',
        }
      } else {
        throw new Error('Invalid credentials')
      }
    }
```
---

### 4. `LoginForm.jsx` – Component using the auth state
```js
    // src/components/LoginForm.jsx
    import React, { useState } from 'react'
    import { useDispatch, useSelector } from 'react-redux'
    import { loginUser } from '../features/auth/authSlice'

    export default function LoginForm() {
      const dispatch = useDispatch()
      const auth = useSelector((state) => state.auth)
      const [email, setEmail] = useState('')
      const [password, setPassword] = useState('')

      const handleLogin = (e) => {
        e.preventDefault()
        dispatch(loginUser({ email, password }))
      }

      return (
        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button type="submit">Login</button>

          {auth.status === 'loading' && <p>Loading...</p>}
          {auth.error && <p style={{ color: 'red' }}>{auth.error}</p>}
          {auth.user && <p>Welcome, {auth.user.name}!</p>}
        </form>
      )
    }
```
---

## 💡 What You Get

✅ Centralized user auth state  
✅ Automatic loading/error handling  
✅ Token stored in localStorage  
✅ Easy access to user across the app  
✅ Scalable, testable, and clean setup

---

## 🔐 Bonus: Rehydrate Token on App Load
```js
    // in App.jsx or a layout component
    useEffect(() => {
      const token = localStorage.getItem('token')
      if (token && !auth.token) {
        // Optionally re-fetch user data here using a new thunk
        dispatch(rehydrateUserFromToken(token))
      }
    }, [])
```
> You’d have to implement `rehydrateUserFromToken` as another `createAsyncThunk` if needed.

# Redux Toolkit: Simple Analogies Summary

### 1. **Store**
Think of it as the **central library** where all your app’s state books live. It keeps everything organized and ready to be accessed or updated.

### 2. **Slice** (`createSlice`)
Imagine a **book section** in the library dedicated to one topic (like "auth" or "products"). It contains the state, the rules to update it (reducers), and the bookmarks (actions) to mark those updates.

### 3. **Action**
An **instruction slip** you send to the library saying “Please update this section like so.” It’s a simple message describing *what* you want changed.

### 4. **Reducer**
The **librarian** who reads the instruction slip (action) and updates the books (state) accordingly, making sure everything stays organized and consistent.

### 5. **Thunk** (`createAsyncThunk`)
The **messenger** who can go outside the library (perform async tasks like API calls), fetch new information, and then come back with instructions for the librarian to update the books.

### 6. **`configureStore`**
The **library builder** who sets up the library with the right sections (reducers), adds helpers (middleware like thunk), and ensures the system works smoothly.

### 7. **`useDispatch`**
Your **mailbox** to send instruction slips (actions) to the librarian.

### 8. **`useSelector`**
Your **window** to look inside the library and read the current state of any section you want.

---

This way, Redux Toolkit is like a well-run library with clear roles:

- You send requests (actions) through your mailbox (`useDispatch`).
- The librarian (reducer) updates the right section (slice) of the library.
- The messenger (thunk) can do errands (async work) before updating things.
- And you always have a window (`useSelector`) to see the latest info.

---

Now it's your turn. The best way to learn is to practice. Go build something on your own!