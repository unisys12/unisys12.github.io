---
layout: "../../layouts/BaseLayout.astro"
title: Post Three
---

# Post Three

This is post three of many to come

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
