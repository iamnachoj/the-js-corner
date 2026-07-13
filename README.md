This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, make sure you use Node version 16. Run `npm install --force` to avoid node-sass issue, and then the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

Create a new Post
---
To create a new post, you need to go to posts, create a markdown file (`md`) with the name of the new article's name, and then fill in the next template:
```angular2html
title:title
excerpt: excerpt
image: ajpegimage.jpeg
isFeatured: boolean
date: 'YYYY-MM-DD'
```
Then, the markdown text.

For the image, it'd be necessary to add it in `public/images/posts` matching the name of the file. You can add extra images in the same folder.

Admin UI (private) to create posts
---
You can now create posts from the UI using a private route and password.

1. Create a `.env.local` file with:

```bash
ADMIN_PASSWORD="your-strong-password"
ADMIN_SESSION_SECRET="a-long-random-secret"
```

2. Start the app and open:

```text
/admin/login
```

3. Log in and go to:

```text
/admin/new-post
```

4. Submit the form.

What it does:

- Creates `posts/<slug>.md` with frontmatter + markdown body.
- Creates folder `public/images/posts/<slug>/` so you can quickly drop your cover image there.
- If you select an image file in the admin form, it uploads and saves it automatically in `public/images/posts/<slug>/`.

Important notes:

- This approach keeps your current file-based setup (simple and fast).
- It only works as expected on a server where the filesystem is writable.
- If you deploy to read-only/serverless environments, this writing approach will not persist files.
