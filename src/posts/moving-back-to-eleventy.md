---
layout: "layouts/blog.njk"
status: "draft"
title: "Back to 11ty"
description: "Moving my personal blog back to Eleventy"
publishDate: 2025-05-11
tags: ["blog", "11ty", "ssg", "jamstack", "astro"]
image: "https://res.cloudinary.com/dtm8qhbwk/image/upload/c_thumb,q_auto,g_face,f_auto,w_200/v1720813596/blog/stock/nasa--hI5dX2ObAs-unsplash_vk2jwn.webp"
image_alt: "A simple header image"
---

# Back to 11ty

Moving my personal blog back to Eleventy. The reasons, bumps and lumps along the way.

## Reasoning

First of all, let me say that I have nothing against [Astro]("https://www.astro.build")! It's a great SSG and offers a dump truck load of features, not to mention flexibility. But the reason I decided to move back to [11ty]("https://www.11ty.dev") was because, quite simply, it's what I was most comfortable with. I don't know if I misused [Content Collections]("https://docs.astro.build/en/guides/content-collections/") in v4 of Astro, but upgrading my old blog to v5 was going to take a complete rewrite. Not that I am apposed to a rewrite, but there was just enough frustrations with Astro that it got to the point of where I was not having fun with it anymore.

- Scoped styles just did not work... ever
- Image optimizations where sorta meh. I ended up putting all my images on [Cloudinary]("https://www.cloudinary.com") to work around it.
- I was not happy with the overly complex Front Matter story. Being forced into JS for that felt weird, although it did offer a lot of flexibility.

Even though I am not a professional developer, when I get into situations like this I still tend to ask myself, "If I was being paid to work on this project, would I be willing to take the time and construct my thoughts into a well crafted email to my manager?". If the answer was yes, I will stop using a piece of tech. I had a similar rule at my previous job. If a particular piece of equipment was having an issue and a pattern began to emerge with the issues it was having, I would sit down with our company owner and let him know. From this, he began to trust my point as the years went on. To keep that trust, I could not come into his office and just say to him, "Stop selling this model because servicing it is hard!". So when I found out that due to the changes in Content Collections was going to cause me to rewrite my blog, I decided I would take that as an opportunity to start getting more enjoyment out of my blog.

> #### We do this not because it's easy, but because of the enjoyment we get out of doing it!

## Game Plan

The game plan was going to be pretty simple. All my previous posts and portfolio items were already in Markdown, so that was no big deal. And moving my templates over from Astro syntax to Nunjucks or Liquid would not be the end of the world. But for one reason or another, I did not want to keep my previously written CSS. I am not particularly fond of the design I had or currently have, but that is a stroy for another day. Mainly because I don't even know what that story looks like yet.

Game plan was as follows:

- Create new repo
- Install 11ty
- Use [PicoCSS]("https://picocss.com/docs")
- Copy over my posts & portfolio folders with their content
- Fill in the blanks till it works

## Execution

Since my wife and I run a business and non-profit out of our home, I knew I wouldn't exactly have a ton of free time to spend doing this. But after 30 mins here, 10 mins there, spread over a few days, it was done. Well, at least functioning much like the first version.

### Base Install & Config

Install 11ty and add my typical config. I like to use a `./src` folder as my root working directory and that's pretty much the only thing I change from default. Although I do declare that I want to use `./_site` as my build directory, this is not required since that is already the default. But I like to declare it anyway. Other than that, I start out with a very basic asset workflow. Anything is `./src/assets` gets copied to `./_site/assets`. I used to have some dev server config items I always changed, but after v3 of 11ty, they tend to be more reliable than in previous releases.

```js
export default function (eleventyConfig) {
  // Passthrough copy for static assets
  eleventyConfig.addPassthroughCopy("src/assets");

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
}
```

### Custom Collections & Filters

One feature I wanted to add to this version of my blog was the ability to display posts grouped by tags. So, you might have noticed that each blog has a list of tags associated with it. When viewing `/posts/`, you will see a list of all posts. Under the title and description of each post, are a few small pills. These are the posts tags. Tags are simply another way to associate posts with each other. Although these existed in the previous version, they did not really serve a purpose. A goal I had for this version was to make each tag into a link that would take you to a page that displayed each post for that tag/topic. For example, if you go to `/jamstack/`, you should see a list of posts that have a tag of `jamstack` associated with it.

Eleventy makes this simple as can be by adding a `tags` property to the FrontMatter of each post. I then add whatever tags I would like to associate with that post and Eleventy automagically creates a new collection for each of the tags.

```diff-yaml
---
title: Boring Title Not Great for SEO
description: An even more boring and lack luster description of this post
+ tags: ["blog", "11ty", "ssg", "jamstack", "astro"]
---
```

To capitalize on this, I just need to gather all those collection names together and display them somehow. Here's how I went about it:

- First I create a collections folder inside `src`. I could've called it anything. Tags probably would've been better.
- Inside that, create a `index.njk` file to display all the tags or collections.
- In the FrontMatter of this file, I used Eleventy's Pagination and Permalinks properties to basically do all the hard work for me.

`src/collections/index.njk`

```yaml
---
title: Collections
pagination:
  data: collections
  size: 1
  alias: tag
permalink: /collections/{{ tag | slugify }}/
layout: "layouts/blog.njk"
---
```

- Under the _pagination_ property, the data that we are passing to it is all the collections within our current build. We only want 1 of each per iteration, hence the size value of 1. This is also commonly referred to as a _chunk size_. Finally, we alias that data to _tag_ since that is the verbiage we decided on.

> Think of 11ty's Pagination as a builtin iterator tucked away in your FrontMatter.

- Finally, I use the _permalink_ property in the FrontMatter to construct a new URL for each collection, making sure to pass the tag to a builtin filter to `slugify` the name of the tag or collection.

The output of the new build looks like so:

```shell
{...}
[11ty] Writing ./_site/collections/blog/index.html from ./src/collections/index.njk
[11ty] Writing ./_site/collections/ssg/index.html from ./src/collections/index.njk
[11ty] Writing ./_site/collections/jamstack/index.html from ./src/collections/index.njk
[11ty] Writing ./_site/collections/components/index.html from ./src/collections/index.njk
[11ty] Writing ./_site/collections/givebutter/index.html from ./src/collections/index.njk
[11ty] Writing ./_site/collections/open-graph/index.html from ./src/collections/index.njk
[11ty] Writing ./_site/collections/flat-files/index.html from ./src/collections/index.njk
[11ty] Writing ./_site/collections/sqlite/index.html from ./src/collections/index.njk
[11ty] Writing ./_site/collections/helper-classes/index.html from ./src/collections/index.njk
[11ty] Writing ./_site/collections/tables/index.html from ./src/collections/index.njk
[11ty] Writing ./_site/collections/seeders/index.html from ./src/collections/index.njk
[11ty] Writing ./_site/collections/html/index.html from ./src/collections/index.njk
[11ty] Writing ./_site/collections/astro/index.html from ./src/collections/index.njk
[11ty] Writing ./_site/collections/forms/index.html from ./src/collections/index.njk
[11ty] Writing ./_site/collections/enums/index.html from ./src/collections/index.njk
[11ty] Writing ./_site/collections/getalltags/index.html from ./src/collections/index.njk
[11ty] Copied 10 Wrote 60 files in 0.67 seconds (v3.0.0)
```

Now we need to create a way to view each set of the collections. To do that, I needed to write a custom Collection. It's a little gnarly at the moment, but it works!

`eleventy.config.js`

```diff-js
export default function (eleventyConfig) {

   // Add a collection for related posts
+  eleventyConfig.addCollection("getAllTags", (collection) => {
+    const allTags = new Set();
+    collection.getAll().forEach((item) => {
+      let tags = item.data.tags;
+      if (tags) {
+        tags.forEach((tag) => {
+          allTags.add(tag);
+        });
+      }
+    });
+    return allTags;
+  });

  // Passthrough copy for static assets
  eleventyConfig.addPassthroughCopy("src/assets");

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
}
```

The `getAllTags` collection basically grabs all the tags from every post and then returns a [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) that contains those tags as collection names.

Next I create a file in the root directory _(./src)_ called `collections.njk` and add the following code -

```html
<article class="cloud">
  {% for tag in collections.getAllTags %}
  <div>
    <a href="/collections/{{ tag | slugify }}">
      <button class="outline secondary">{{ tag }}</button>
    </a>
  </div>
  {% endfor %}
</article>
```

which iterates through the Set of collections and generates a link with a button that takes you to that collections page, where all the posts related to a given tag are displayed.

`src/collections/index.njk`

```html
---
title: Collections
pagination:
  data: collections
  size: 1
  alias: tag
permalink: /collections/{{ tag | slugify }}/
layout: "layouts/blog.njk"
---

{% set taglist = collections[tag] %}

<header>
  <h1>Found {{ taglist.length }} Articles Related to “{{ tag }}”</h1>
</header>

{% for post in taglist | reverse %}
<article class="grid">
  <section class="container">
    <hgroup>
      <h2>
        <a href="{{ post.url }}">{{ post.data.title }}</a>
      </h2>
      <p>{{ post.data.description }}</p>
      <small>{{ post.data.publishDate | formatDate }}</small>
    </hgroup>
    <section class="cloud">
      {% for tag in post.data.tags %}
      <span class="tags">
        <a href="/collections/{{ tag | slug }}">{{ tag }}</a>
      </span>
      {% endfor %}
    </section>
  </section>
  <img
    src="{{post.data.image}}"
    alt="{{ post.data.image_alt }}"
    style="place-self: center;"
  />
</article>
{% endfor %}
```

## Hurdles

### Hurdle 1

**Hosting** - Believe it or not, deploying a site is still confusing. Even on Github Pages! But I digress. How I finally got it working was using the follow Github Action

`.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  pull_request:

jobs:
  deploy:
    runs-on: ubuntu-22.04
    permissions:
      contents: write
    concurrency:
      group: ${{ github.workflow }}-${{ github.ref }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Persist npm cache
        uses: actions/cache@v4
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package.json') }}

      - name: Persist Eleventy .cache
        uses: actions/cache@v4
        with:
          path: ./.cache
          key: ${{ runner.os }}-eleventy-fetch-cache

      - run: npm install
      - run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v4
        if: github.ref == 'refs/heads/main'
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./_site
```

combined with making the following changes to the repo settings:

- Once the above yaml file in located in `.github/workflows/deploy.yml`, push the change up to your repo on origin/main. Your build is going to fail!
- Under Settings on the repo, go to Pages.
- Change Build and Deployment to _Deploy from Branch_
- Make sure that **github_pages** is selected as the branch to deploy from and the default **root** folder is selected.
- Click Save and push up some changes or go into actions and force a rebuild. Everything should work now.

The reason this was so confusing was because after reading through three different blog posts about deploying an 11ty site to Github Pages, none of them tell you "not to create a gh-pages branch". This actually happens automatically after the first build fails... I think. Either way, I really was starting to think I was a complete idiot! Then I completely wiped the repo, deleted all Git history. I went full nuclear! After the first build failure, I noticed that the github_pages option was already there and decided to leave everything alone. Forced another build and it worked. Since I created a gh_pages branch and pushed it, the build would not work.

Another thing to point out here is that the caching does not work. I don't why... :(

### Hurdle 2

- **Rendering Code Blocks** - One would think that rendering a code block inside a markdown file would be... well, no one today really thinks about it. Well, in 11ty land you might want to think about it. The problem is that 11ty uses Liquid to render all pages by default. Unless you create a template in using a different language, such as Nunjucks, which you may have noticed I use a lot. You can of course override this behavior though. Liquid and Nunjucks are very similar though. So if you have a lot of pages with code blocks that contain Nunjucks, instead of rendering the code block, it tries to render the Nunjucks inside the code block. Ugh!

To solve this, all you have to do is go into your `eleventy.config.js` file and set a default template engine for Markdown files. I only do this for Markdown files, since these are the only pages that will use or have syntax highlighting.

```diff-js
return {
  dir: {
    input: "src",
    output: "_site",
  },
+  markdownTemplateEngine: "html",
};
```

## That's a Wrap!

And that's about it. I hope that some of my ramblings eventually help someone and you are able to get back to having fun at web development.
