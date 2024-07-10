---
layout: "../../layouts/BaseLayout.astro"
title: Post Two
---

# Post Two

This is post two of many to come

```html
<html lang="en">
  <head>
    {...}
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
