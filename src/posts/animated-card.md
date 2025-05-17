---
layout: "layouts/blog.njk"
status: "draft"
title: Animated Card
description: "Attempting to learn how an animated social media card works"
publishDate: 2024-07-18
tags: ["blog", "11ty", "ssg", "jamstack", "open graph"]
image: "https://res.cloudinary.com/dtm8qhbwk/image/upload/c_thumb,q_auto,g_face,f_auto,w_200/v1720813611/blog/stock/lucas-k-wQLAGv4_OYs-unsplash_c3nxua.webp"
image_alt: "A simple header image"
---

# Animated Card

I was browsing the web the other night, looking for a weekend get-away spot for the wife and I, and I ran across this site. [Land Trust of North Alabama](https://landtrustnal.org/). There are quit a few things happening on this site that I found very interesting, but what I want to focus on right now is near the bottom on their home page. There you will find a selection of images, displayed in a somewhat random way, all linking back to specific post from their Instagram account. As a self-proclaimed _back-end guy_ myself, the posts being displayed is not what caught my eye. That's a simple API who's response gets aggregated and then consumed on the frontend. What made stop and play with whole section was the animations on each image block _(we will call them cards, or a card, from here on)_.

Let me break down whats happening in the animation:

- Initial state of the card has an image as the background with a small Instagram SVG icon the lower right.
- When hovering over the card, the background image fades to white
- The actual post text appears over the white background
- The Instagram SVG is replaced by a curved arrow SVG that allows you to share the post to Facebook or Instagram
- The Instagram SVG is moved to the top center
- Lower left is a logo of the Land Trust

Last night, I hopped on [CodePen](https://codepen.io/unisys12/pen/RwzrgPX) and threw together a first attempt. Just to see if I could figure out how it was done. But I think this can be done a slightly better way. Maybe.

Here's what we are starting with:

_`html`_

```html
<div class="container">
  <div class="card">
    <figure class="card_bg_img">
      <img
        src="https://res.cloudinary.com/ftpta-com/image/upload/q_auto,g_face,f_auto,c_thumb,w_200/v1667322860/training/20220930_finn_jack_crystal_ewgzde.jpg"
        alt="card image"
      />
    </figure>
    <figcaption>
      Arbitrary wall of text that should explain the image. More often than not,
      the text will come from a social media API.
    </figcaption>
  </div>
</div>
```

Instead of using a bunch of random divs, spans and such, I opted to use actual elements. One div for the container, which most sites use in some form or another. A div for the card itself. A figure element to hold the image element, followed by a figcaption that will hold the text. If I were to add the other logo and two SVG's, there would have to be a few more elements, but we will start with this for now. Again, this is just an exercise to learn how this works and not to complete recreate the card as it stands.

_`css`_

```css
.container {
  display: grid;
  grid-template-columns: minmax(200px, 1fr);
  place-items: center;
}

.card {
  max-width: 200px;
}

.card_bg_img {
  margin-left: -7px;
}

.card_bg_img > img {
  transition:
    opacity 0.3s ease-in-out,
    transform 0.3s ease-in-out;
}

.card_bg_img:hover > img {
  opacity: 0.2;
}

figcaption {
  opacity: 0;
}

.card_bg_img:hover + figcaption {
  opacity: 1;
  transform: translateY(-250px);
}
```

There are a few things in the above prototype that will not work in the real world, but since I did this on CodePen, it is what it is. Things like using px in the transform of figcaption on hover and having to set a negative margin on the img container just to properly align the image with the figcaption text. There are also some things I need to fix/solve, such as an issue when hovering over the displayed text. It causes stuttering.

We will be starting off by keeping the initial html and basically wiping all the css, since we will be working in the browser with VSCode. I tested it before hand and it all works perfectly. But I just feel like I could do a better job of execution. So, let's see what I ended up with!

_css_ _final code_

```diff-css
.container {
  display: grid;
-  grid-template-columns: minmax(200px, 1fr);
+  grid-template-columns: repeat(2, 1fr);
  place-items: center;
}

.card {
  max-width: 200px; // [!code --]
  display: grid; /* set display to style contents */ // [!code ++]
  place-items: center; /* centers vertically and horizontally, but it can't */ // [!code ++]
  grid-template-rows: subgrid; /* setting to subgrid allows us to center text perfectly within the parent */ // [!code ++]
}

figcaption {
  text-align: center;
  width: 200px; /* makes the text fit within the image */ // [!code ++]
  text-wrap: justify; /* balance leaves space on the edges */ // [!code ++]
  display: none; /* hides figcation until hover. very sus! */ // [!code ++]
  opacity: 0; /* set default opacity to 0 to hide text */
  transition: opacity 0.4s linear; // [!code ++]
}

/* show the text in the figcaption */
.card_bg_img:hover + figcaption {
  display: block; // [!code ++]
  opacity: 1;
}

.card_bg_img > img {
  transition: opacity 0.3s ease-in-out, transform 2s 0.2s; // [!code --]
  transition: opacity 0.3s ease-in-out; // [!code ++]
}

.card_bg_img:hover > img {
  opacity: 0.2;
}
```

## .container

Breaking this down a bit, we can see that I actually declared the template columns in this one. I believe cause of using `minmax` in my previous attempt was from me _keyboard thrashing_. This happens you just change values with little thought behind them, just to see what sticks as fast as possible. Although the code did work, just looking at it you could see it was not ideal. This time around, I actually set my container columns with `grid-template-columns: repeat(2, 1fr);`. I did experiment with adding more cards to the container and then adjusting the track list count _(first param of the repeat method)_ accordingly and it worked just as expected. Bear in mind, this is not mobile ready, so... shame on me!

## .card

I could remove the `max-width` property due to the fact that I was properly setting my grid now. But I also, set this class to be a grid as well. Then used subgrid, so that everything would reference the parent container. Followed by centering everything inside the card vertically and horizontally.

## .card_bg_img

Removed this wackiness all together.

## .figcaption

The changes to `.card` placed the `figcaption` directly on top of the image, whereas before, I left it below the image an used `transform` to move it up on hover of the image container _(figure element)_. Now, since the text I needed was already where I wanted it to be, I just simply have to set the opacity to zero on the `figcaption` and then transition that on hover, like before.

I added `text-wrap: balance` here as well. This does add a slight bit of padding/space between the edge of the image and the text. If this is not of your liking, just remove it and the text will run right the edge of the image. Setting this to `pretty` has a similar effect as `balance`, but that might change with the amount of text or other constraints you might have.

The astute might notice that I added `display: none` to the `figcaption` and on hover of the image, I can it to `block`. The reason? It's a _hack_ and I know that's not good. This will mess up with screen readers and the like, so it is not a good solution. Why did I do this then? When hovering over the image, if your cursor entered any area occupied by the figcaption element, the nullify the transition declared on the img with `.card_bg_img > img`. Which means that if your cursor traveled through the image, from either the right-center or left-center, you were not actually hovering over the image. Instead, you would be hovering over the figcaption, which is in the middle of the image now. To solve this, for now, I just hide it. Then on hover I set it block, just to show it again. We still transition the opacity so that we can hide any jank or flicker when changing from display:none to display:block.

To resolve this, we could put it back to how it was before and still have to same issues as before.

## Summary

I learned a lot from this exercise! And let me be honest... it's been a long time since I have written CSS. I've been using [TailwindCSS](https://tailwindcss.com/) for years now and I had almost forgotten how to write it! I had to look-up so many things, because I forgot them due to Tailwinds naming conventions are not exactly one-to-one with the CSS API. I mean, it can't be! If it were, we would just write in-line styles all the time. But as far as not having written CSS in a long time, it feels good to write it again. This exercise actually made me feel creative, which I haven't felt in forever. I still can't design worth a crap and that will never change. But! Making a design in an effective and efficient way can still be creative.

Something that's quit obvious from this exercise is that I have some research to do. I remember a few years ago reading about how to handle these situations with `display:none`, but it has slipped right past me. That will be added to my _things to search`_ list for sure.
