---
layout: "../../layouts/BlogLayout.astro"
title: Post One
---

# Post One

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
