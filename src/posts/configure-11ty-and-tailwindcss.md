---
layout: "layouts/blog.liquid"
status: "draft"
title: "How I Configure 11ty and TailwindCSS"
description: "Come along as I share with you my 11ty project setup config!"
publishDate: 2024-07-13
tags: ["blog", "11ty", "ssg", "jamstack"]
image: "https://res.cloudinary.com/dtm8qhbwk/image/upload/c_thumb,q_auto,g_face,f_auto,w_200/v1720813611/blog/stock/vincentiu-solomon-ln5drpv_ImI-unsplash_ihdhru.jpg"
image_alt: "A simple header image"
---

# How I Configure 11ty and TailwindCSS

## Technologies

- [11ty](https://www.11ty.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [npm-run-all](https://www.npmjs.com/package/npm-run-all)

## Project Setup

When setting up a new 11ty project, I have few defaults that I tend to put in place before diving into actually creating pages and such. They are as follows:

### Setup 11ty Input/Output directories

By default, 11ty, takes any files in the root of your project and transforms them into static pages... in the root of you project. So, if you had an empty directory other than your `package.json` & `package-lock.json`, followed creating a `index.md` file.

```txt
| package.json
| package-lock.json
| index.md
```

Then running `npx @eleventy` from that directory you would end up with:

```txt
| index
| - index.html
| eleventy.js
| package.json
| package-lock.json
| index.md
```

Things can get a bit confusing like this, so the first thing I add to my `.eleventy.js` config file is:

_`.eleventy.js`_

```js
require("dotenv").config();
module.exports = (config) => {
  return {
    dir: {
      input: "src",
      ouput: "_site",
    },
  };
};
```

...and then create the `src` directory in the root of the project. This tells the `template-engine` to look for files in the `src` directory and output the build files to a new folder named `_site`. Now, after a build, your directory structure looks like the following:

```txt
| _site (built automagically!)
| - index
| - - index.html
| src
| - index.md
| eleventy.js
| package.json
| package-lock.json
```

### Configure The Template Engine

By default 11ty uses [liquid](https://shopify.github.io/liquid/) to render all content created. But for one reason or another, I have gotten used to [Nunjucks](https://mozilla.github.io/nunjucks/) for static site templates. So I need to configure 11ty to use Nunjucks instead of Liquid. To do that, we add the following to our config.

```js
require('dotenv').config()
module.exports = (config) => {
  return {
    htmlTemplateEngine: "njk", // [!code ++]
    markdownTemplateEngine: "njk", // [!code ++]
    dir: {
      input: "src",
      ouput: "_site",
    },
  };
})
```

For now, I think that's about it for the 11ty config. We will have a few other things to add later, but for now, let's move on.

### Configure .gitignore

Before we install anything, we need to get our `.gitignore` set-up!

```ini
node_modules
_site
localhost.cert
localhost.key
.cache
.env
```

### Add Tailwind CSS

The workflow that I have settled on, over the last year or two, when it comes to TailwindCSS is like so:

Add TailwindCSS to the project

```bash
npm install -D tailwindcss
```

Then, generate your config for TailwindCSS

```bash
npx tailwindcss init
```

Add TailwindCSS to your stylesheet used in your project
_/src/assets/css/style.css_

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Then, in `package.json` I add a _dev_ and _build_ cmd with the script property.

```js
"scripts": {
    "11ty-dev": "npx @11ty/eleventy --serve",
    "11ty-build": "npx @11ty/eleventy",
    "tailwind-dev": "npx tailwindcss -i ./src/assets/css/styles.css -o ./_site/assets/css/styles.css --watch",
    "tailwind-build": "npx tailwindcss -i ./src/assets/css/styles.css -o ./_site/assets/css/styles.css --minify",
    "dev": "run-p -l tailwind-dev 11ty-dev",
    "build": "run-p -l tailwind-build 11ty-build"
  }
```

Lastly, add `npm-run-all` to your project

```bash
npm i npm-run-all
```

There's a lot going on here, so let's break it down.
**Working Locally**

- `npm-p` is a parallel process runner for NPM. I use it to run both TailwindCSS CLI and 11ty at the same time. At the bottom of the script property, I have a `dev` and `build` cmd. Taking a closer look at the dev cmd, you will notice that I first call `npm-p` to start up a parallel process.
- Then I pass that process the tailwind-dev cmd, then the 11ty-dev cmd. Looking at each of those, tailwind-dev calls the tailwind cli and I pass it the input `(-i)` path for our css so tailwinds JIT compiler can process it. I then pass it the output `(-o)` directory for the compiled css file. In this case, since we are in working in dev, I am also passing the `--watch` flag, which enables... you got it! Watch Mode! The JIT compiler will watch files and recompile the CSS as we make changes to any files or directories we inform it about. We will do that in a sec.
- Lastly, we pass the `11ty-dev` cmd to `npm-p`, which builds the site and launches as web server that we can use locally with reloading, etc. We can even secure it, if we want.
- When you open the project in your terminal, just run `npm run dev` and your good to go!

**Building for Production**
Same process applies, but instead of passing `--watch` flag to TailwindCSS, we pass `--minify`, which I really don't think needs much explanation. To build the site, we just call `npx @11ty/eleventy`. In your CI/CD or server config, just make sure you call `npm run build`.

### Configure TailwindCSS

I like to add a depth of at least two directories to Tailwinds config. This way, if I add extra directories to the `_includes` dir, they will be picked up. And I main work in either, HTML, Markdown or Nunjucks files, so I pass those as file types to watch.

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/**/*.{html,md,njk}"], // [!code ++]
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### Further Configure 11ty

Typically, I don't use any plugins/libraries to manipulate images or anything else. So, I just use the 11ty `addPassthroughCopy()` method, within the config, to simply pass those things over to the build dir untouched.

_.eleventy.js_

```js
require("dotenv").config();
module.exports = (config) => {
  // [!code highlight:4]
  config.addPassthroughCopy("src/assets/imgs/*.jpg");
  config.addPassthroughCopy("src/assets/imgs/*.png");
  config.addPassthroughCopy("src/favicon.ico");

  return {
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    dir: {
      input: "src",
      ouput: "_site",
    },
  };
};
```

Next, I like to add a little snippet that makes page loads much smoother when working in dev. It simply reloads the section of the page that changed, instead of performing a full page reload. If possible!

_.eleventy.js_

```js
require("dotenv").config();
module.exports = (config) => {
  // [!code highlight:4]
  config.setServerOptions({
    domDiff: false,
  });

  config.addPassthroughCopy("src/assets/imgs/*.jpg");
  config.addPassthroughCopy("src/assets/imgs/*.png");
  config.addPassthroughCopy("src/favicon.ico");

  return {
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    dir: {
      input: "src",
      ouput: "_site",
    },
  };
};
```

And that's about it! I think!

_looks around the room behind me just to make sure._

This setup is not near as fancy or complex as some that I have seen, but it works for me. And although I have read through and studied many other `.eleventy.js` configs, I came up with this on my own. If I had a pain point, that seemed to pop-up over and over, I solved it and added it to my workflow. Bam! That simple.
