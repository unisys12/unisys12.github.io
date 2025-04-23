---
layout: "layouts/blog.liquid"
status: "draft"
title: "Adding Givebutter widgets to a Static Website"
description: "Working with Dynamic Custom/Third-Party Components in a Static Site"
publishDate: 2024-07-26
tags: ["blog", "11ty", "ssg", "jamstack", "components", "givebutter"]
image: "https://res.cloudinary.com/dtm8qhbwk/image/upload/c_thumb,q_auto,g_face,f_auto,w_200/v1720813611/blog/stock/greg-rakozy-oMpAz-DN-9I-unsplash_qebiip.webp"
image_alt: "A simple header image"
---

# Adding Givebutter widgets to a Static Website

Working with third-party components or custom elements is not a new thing in the web sphere. But it can seem as though working with Dynamic Custom Components would be a headache when working in a static-site. Each SSG _(static site generator)_ deals with data a bit differently, so make sure to check the docs of your SSG to find the best path forward. Hopefully, this post will give you a good general idea of how to at least approach this minor hurtle in the JAMStack.

## Task At Hand

What I set out to accomplish tonight was adding sponsorships to our non-profit site. What we want to do is offer a way for people to give donations to one of our animals and once a goal is reached, the adoption fee for that dog will be free. This is not a new practice in the animal rescue world. It's not uncommon to see shelters waving adoption fee's around holidays or offering discounted fee's on certain dogs from time to time. But we want to offer this on all our animals! All year round!! Also, as an added bonus, any remaining funds left over after the adoption fee is subtracted will be given to the adaptors account at their veterinarian to help with any future vet related expenses. What do we need to make this happen?

- We recently started using [Givebutter](https://givebutter.com/) for our fundraiser marketing and donation collections. On our dashboard, we just create a new campaign for each dog. Yes, we have to do this manually and it's a real pain for 25+ animals! But I digress. After making a form, you can go to _Sharing_ and select _Widgets_. They refer to them as Widgets, but they are basically custom components made with [Lit](https://lit.dev), which I think is cool as heck! To get started using their components, just add their js snippet to the head of your sites pages that need it. I use them on our `donate` page and all of the pages under the `dogs` uri.

```html
{% if '/donate/' or '/dogs/' in page.url %}
<script
  async
  src="https://widgets.givebutter.com/latest.umd.cjs?acct=7VuutvZqPuoDFArI&p=other"
></script>
{% endif %}
```

- If you want to customize the look or text of the components, just click the gear icon.
- When your ready, click the Embed button and copy the component html from the modal that pops up.

```html
<givebutter-widget id="gJLN4o"></givebutter-widget>
```

You might notice the use of the `id` attribute on the component. This is it's identifier to Givebutter. Each component you create under your account is unique and will have a unique id associated with it. And this is where things could get tricky! How do you assign the correct id dynamically? Especially since will be dynamically creating 25 or more of them. Why have unique id's you ask?

We will be using two different components per animal. A button, when clicked will open a donation modal, where they can choose their donation amount and submit it. And the other is goal component that will track the amount of donations received for a single animal and display that one the page of each animal. When the donation goal is meet, that animals adoption is now free! When a user clicks on the **Sponsor** button for any given animal, the donation window that opens needs to point to the form that we created for that animal. This way, we can track the donations properly for each animal. And the **Goal** should give a clear indication to anyone viewing our pets as to which ones have meet their goal and which have not. This will help donors and adopters equally with clear feedback of information.

## Hurdles Are Not Meant to be Rabbit Holes

On a standard website, with a backend and frontend, this task would be very simple to handle. In our case, since we will be using two different components, we could easily create a table for the ids, associate them with each dog using a One-to-Many relationship and when we query the dogs data from the database, the ids will be available to us. But we don't have a database since we are using 11ty for our site.

To accomplish this, I created a file in `src/_data/sponsor_ids.js`. _Naming things is hard, ok!_ This file returns a JS Object that contains the dogs and their associated ids. The format looks like this:

```js
module.exports = [
  {
    name: "Peanut",
    goal: "jbR3Xj",
    button: "gJKN1p",
  },
];
```

So, we have an array of objects that each have a name, goal and button property with their respective values. I have a template that is used to generate & view each of the animals pages at build time. We just need to add our logic there to display our new button and goal components. But most importantly, to only the animals that have a sponsorship and the correct sponsorship is displayed with the correct animal.

```liquid
<div class="my-4 mx-auto flex flex-wrap justify-center items-center gap-2">
  {% for id in sponsor_ids %}
    {% if dog.attributes.name === id.name %}
      <givebutter-widget id="{{ id.goal }}"></givebutter-widget>
      <givebutter-widget id="{{ id.button }}"></givebutter-widget>
    {% endif %}
  {% endfor %}
  <a
    href="/adoption"
    class="h-12 w-full text-center rounded bg-green-600 px-6 py-2 sm:py-1 font-medium tracking-wide text-white shadow-md transition hover:bg-blue-800 focus:outline-none md:mr-4 md:mb-0 md:w-auto"
  >
    Apply to Adopt {{ dog.attributes.name }}
  </a>
</div>
```

If your wondering where I am getting `dog.attributes.name` in the above snippet - I have another Global Data file in _src/\_data_ named `dogs.js` that fetches all our animals from an API. You can view the whole template in the projects [Github Repo](https://github.com/unisys12/ftp-foundation/blob/main/src/dog-pages.njk#L6).

![Finished Product](https://res.cloudinary.com/dtm8qhbwk/image/upload/c_thumb,q_auto,g_face,f_auto/v1721958186/blog/sponsorship-prototype_l0dgpp.jpg)

And that's that! We end up with the following on our page now!
