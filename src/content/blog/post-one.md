---
layout: "../../layouts/BlogLayout.astro"
title: Post One
tags: ["blog", "11ty", "ssg", "jamstack"]
description: "This is a short description of the topic I will cover in this post"
image: "https://res.cloudinary.com/dtm8qhbwk/image/upload/v1635373637/blog/stock/pexels-markus-spiske-2061168_coxasy.jpg"
image_alt: "A simple header image"
---

# Post One

!["A simple header image"](https://res.cloudinary.com/dtm8qhbwk/image/upload/v1635373637/blog/stock/pexels-markus-spiske-2061168_coxasy.jpg)

This is post one of many to come

```html
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width" />
    <meta name="generator" content="{Astro.generator}" />
    <title>{Astro.props.title}</title>
  </head>
  <body>
    <header>
      <h1>{Astro.props.title}</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/blog">Blog</a>
        <a href="/portfolio">Portfolio</a>
      </nav>
    </header>
    <main>
      <slot />
    </main>
  </body>
</html>
```