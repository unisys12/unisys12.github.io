---
layout: "layouts/blog.njk"
status: "draft"
title: Periodic Table
description: "This is short description of the project"
date: 2024-07-11
tags: ["portfolio", "css", "11ty", "challenge"]
image: "https://res.cloudinary.com/dtm8qhbwk/image/upload/c_thumb,q_auto,g_face,f_auto,w_200/v1635373637/blog/stock/pexels-markus-spiske-2061168_coxasy.jpg"
image_alt: "A simple header image"
---

# Periodic Table

[Link to Repo](https://github.com/unisys12/periodic-table)

![Finished Project](/assets/imgs/periodic-table-v2.jpg)

## Project Purpose

This project was inspired by a Twitter post. Not from another developer or designer, but an artist friend of mine that was showing off some new enamel pin designs that she was thinking of selling. I don't don't know why, but I immediately wondered if I could make a Periodic Table using only CSS Grid. Look... I never said I was sain, ok!

## Tech Used

- [11ty](https://www.11ty.dev/ "Eleventy Link") - 11ty is hands down the simplest solution to build this project. Yes! There are a thousand million Javascript frameworks out there that I could've used, but I wanted simple. And 11ty is just simple. It gives me a build process for Nunjucks as well as a hot reloading local server to run the project. Not to mention a really easy way to import the Periodic Table data into the project without overloading the load times of the page. I could've leveraged 11ty's config system a bit more with the CSS, such as combining and compressing the output, but...
- [Nunjucks](https://mozilla.github.io/nunjucks/ "Link to Nunjucks Project") - I would need a templating language, due to the nature of the project. I was familiar with Nunjucks, so it only made sense to use it.
- [CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout "MDN Link") - The whole purpose of the project. Grid is very powerful and is even more powerful when combined with [Flexbox](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Flexbox "MDN Link"). None the less, this project was about learning Grid and not Flexbox.
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties "MDN Link") - Due to the repetitive nature of this project, one of the challenges was going to be dynamically applying properties to elements. Alignment and background colors specifically. Using Custom Properties made this very simple, I really was not able to leverage them very well and it ended up costing me. More on that later.
- [TippyJS](https://atomiks.github.io/tippyjs/ "TippyJS Link") - The Periodic Table is actually quit large, so I found out. And one of the first issues I had, after the layout was solved, was actually viewing the individual elements. I decided to use this library because it allowed me to quickly create the hover interactions with each element on the table. I mean, I guess I could've created my own solution to this, but since the project was to be centered around getting more familiar with CSS Grid and not creating custom hover effects, I chose this route.
- Vanilla Javascript - There are two or three JS files that I created to perform separate tasks, which will be covered later. None of them are built into the project, so there are never loaded on the page. They are utilities and have no effect on the project running locally.

## Proud Moments

I created a freaking Periodic Table of Elements for Christs sake! I was so stoked when I was done with this!! Still am honestly.

```liquid
<section class="block-{{ block }}">
  {% for element in elements %}
    <article
      data-template="{{ element.atomicNumber }}"
      class="period-{{ element.period }} group-{{ element.group }} {{ element.groupBlock | replace(" ", "-") }}"
      data-block="{{ block }}"
      id="{{ element.symbol }}"
    >
      <div class="subgrid">
        <div>{{ element.atomicNumber }}</div>
        <div class="symbol">{{ element.symbol }}</div>
        <div class="name">{{ element.name }}</div>
        <div class="mass">{{ element.atomicMass }}</div>
      </div>
    </article>
  {% endfor %}
</section>
```

## Lessons Learned

- With as many 11ty sites I have created, using Nunjucks as my template language of choice, you would think that I had used the `groupby()` method before. But no... I had not. But it can be really powerful!

```liquid
<main class="table-element">
  {% set elements = pte %}

  {% for group, elements in elements | groupby("group") %}
    {% for block, elements in elements | groupby("block") %}
      {% if block != 'f' %}
        <section class="block-{{ block }}">
          {% for element in elements %}
            <article
              data-template="{{ element.atomicNumber }}"
              class="period-{{ element.period }} group-{{ element.group }} {{ element.groupBlock | replace(" ", "-") }}"
              data-block="{{ block }}"
              id="{{ element.symbol }}"
            >
              <div class="subgrid">
                <div>{{ element.atomicNumber }}</div>
                <div class="symbol">{{ element.symbol }}</div>
                <div class="name">{{ element.name }}</div>
                <div class="mass">{{ element.atomicMass }}</div>
              </div>
            </article>
          {% endfor %}
        </section>
      {% endif %}
    {% endfor %}
  {% endfor %}
</main>
```

- The shear mental gymnastics I had to go through to make this, given the data I had, was a lot. Well, for me anyway. But that's when it seems we learn the most, right? Such as, I had to learn how to convert a HEX value into a RGB value. I think it turned out ok.

```js
module.exports.hexToRGB = (hex, alpha) => {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  } else {
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }
};
```

- This was my deepest dive into CSS Grid to date. And this was one of those projects that tend to refer back to when I say to myself, _"How did I do that?"_. One of those things was configuring the layout of the elements, like we see them everywhere, by the elements Block and Period using `grid-template-rows` combined with `grid-row`. I heavily utilize [Attribute Selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors) for this.

```css
/* the overlay page layout/container **/
.table-element {
  /* margin: 0 auto; */
  padding: 0 1em;
  width: 100vw;
  display: grid;
  grid-template-columns: repeat(
    var(--num-group-cols),
    minmax(max-content, 1fr)
  );
  grid-auto-flow: row;
  gap: var(--gap);
}

/*
- Blocks indicate which electron sublevel is being filled.
- Blocks are used to group elements together
*/
section[class*="block-"] {
  display: grid;
  grid-template-rows: repeat(var(--num-period-rows), minmax(max-content, 1fr));
  justify-content: center;
  gap: var(--gap);
}

/*
- A period is represented as a row in the table
- The period number of an element indicates how many of its energy levels house electrons
- Moving down the table, periods are longer because it takes more electrons to fill the larger
    and more complex outer levels
*/
.period-1 {
  grid-row: 1 / 2;
}

.period-2 {
  grid-row: 2 / 3;
}

.period-3 {
  grid-row: 3 / 4;
}

.period-4 {
  grid-row: 4 / 5;
}

.period-5 {
  grid-row: 5 / 6;
}

.period-6 {
  grid-row: 6 / 7;
}

.period-7 {
  grid-row: 7 / 8;
}
```

I even created my own, maybe not as functional, `subgrid` for the inside of each elements container.

```css
.subgrid {
  display: grid;
  grid-template-rows: repeat(4, minmax(min-content, min-content));
  font-family: var(--font-family);
  text-rendering: optimizeLegibility;
  font-size: var(--font-size);
}

.subgrid div:nth-child(n + 2) {
  text-align: center;
}
```

Overall, this was a fun project and I really enjoyed the challenge.
