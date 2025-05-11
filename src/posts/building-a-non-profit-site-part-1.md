---
layout: "layouts/blog.njk"
status: "draft"
title: Building an 11ty Site for Our Non-Profit
publishDate: 2024-07-13
description: "Come along as I show you how I built a site for our non-profit"
tags: ["blog", "11ty", "ssg", "jamstack"]
image: "https://res.cloudinary.com/dtm8qhbwk/image/upload/c_thumb,q_auto,g_face,f_auto,w_200/v1720813608/blog/stock/aldebaran-s-qtRF_RxCAo0-unsplash_bbmcd3.jpg"
image_alt: "A simple header image"
---

# Building an 11ty Site for Our Non-Profit

First of all, the set-up and config for this project can be found in this [post](configure-11ty-and-tailwindcss). If you have not read it or you have your own config or workflow, you can still follow along. The full repo can be found [here](https://github.com/unisys12/ftp-foundation).

There are still some aspects of this site that are in flux and there are aspects of the site not even finished. Things such as proper page descriptions, Open Graph meta-data, etc. Hosting and Domain residency is not one of them and I will not go over that in this post. That's a _"Another post for another time!"_ situation!

## Layouts _(?)_

I am using two different layouts for this simple site. And I will explain why.

![For The Puppies Foundation Home Page](https://res.cloudinary.com/dtm8qhbwk/image/upload/q_auto,f_auto/v1720908399/ftpf_screenshot_d2mj6e.jpg)

As you can see, the page is divided into two uneven columns. The division of these two columns are different depending on the page. So, let's take a look!

_`src/_includes/landing_layout.njk`_

```liquid
<body class="container mx-auto my-2">
  {% include 'components/header.html' %}
  <main class="grid grid-flow-row sm:grid-cols-3 text-center mt-8 gap-4">
    {{ content | safe }}
    <div class="mx-auto">
      <img
        src="{{ '/assets/imgs/ftpf_logo.jpg' | url }}"
        class=""
        alt="Foundation Logo"
      >
      {% include 'components/donate_qr.html' %}
    </div>
  </main>
  {% include 'components/footer.html' %}
</body>
```

_`src/_includes/base_layout.njk`_

```liquid
<body class="container mx-auto my-2">
  {% include 'components/header.html' %}
  <main class="grid grid-flow-row sm:grid-cols-3 text-center mt-8 gap-4">
    <div class="sm:col-span-2 flex flex-row flex-wrap justify-center gap-4">
      // [!code highlight]
      <article class="prose mx-4 lg:prose-xl text-left">
        // [!code highlight]
        {{ content | safe }}
      </article>
      // [!code highlight]
    </div>
    // [!code highlight]
    <div class="mx-auto print:hidden">
      <img
        src="{{ '/assets/imgs/ftpf_logo.jpg' | url }}"
        class=""
        alt="Foundation Logo"
      >
      {% include 'components/donate_qr.html' %}
    </div>
  </main>
  {% include 'components/footer.html' %}
</body>
```

Using `base_layout.njk` brings in [TailwindCSS Typography](https://github.com/tailwindlabs/tailwindcss-typography) to help with content layout and shifting. Where as the `landing_layout.njk` does not include that.

Another thing that's different about the layouts is that one has several conditionals added to aid in loading assets that are not required on other pages. For a clearer picture, here are the other parts of the base_layout.

_`src/_includes/base_layout.njk`_

```html
---
title: "FTP Foundation"
page_description: "Test description"
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="{{ page_description }}" />
    <title>{{ title }}</title>
    <link rel="shortcut icon" href="{{ '/favicon.ico' | url }}" />
    <link rel="stylesheet" href="{{ '/assets/css/styles.css' | url }}" />
    {{ ...POSTHOG CONFIG OMITTED... }} {% if '/dogs/' in page.url %}
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.15.0/cdn/themes/light.css"
    />
    <script
      type="module"
      src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.15.0/cdn/shoelace-autoloader.js"
    ></script>
    {% endif %} {% if '/donate/' in page.url %}
    <script
      async
      src="https://widgets.givebutter.com/latest.umd.cjs?acct=8VuptvZqPuoDFArI&p=other"
    ></script>
    {% endif %}
  </head>

  <body class="container mx-auto my-2">
    {{ ... }} {% if '/dogs/' in page.url %}
    <script
      type="module"
      src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.15.0/cdn/components/carousel-item/carousel-item.js"
    ></script>
    {% endif %}
  </body>
</html>
```

Notice that I am bringing in Shoelace if the current url contains `/dogs/` and a GiveButter widget if the url contains `/donate/`. Nowhere else on the site or page will these remote assets be loaded.

With layout out of the way, let's get to the interesting bits!

## Dog Listings

If you navigate to `/dogs/` you will two columns of dogs that we currently have available for adoption. Each of our animals is currently stored in a backend service provided by [RescueGroups.org](https://www.rescuegroups.org). They have a very nice JSON API that I am using to fetch all the dogs for our organization. To do that, we are assigned a `ORG_ID` after submitting all required documentation. So, we add this to our `.env` file, like so:

```txt
ORG_ID=01556
RESCUE_GROUPS_API_KEY=DXXRBHS8
```

11ty has several ways to share data throughout your site, but for the initial fetching of all the animals I decided to use the [Global Data Directory](https://www.11ty.dev/docs/data-global/), which is simply the `_data` dir. Inside that directory, I make a new file called, `dog.js` and place the code to fetch all the animals.

First, we need to add the [11ty Fetch](https://www.11ty.dev/docs/plugins/fetch/) library to our project. We don't technically have to use it, but it comes with built in caching, so why the heck not!

_`src/_data/dogs.js`_

```js
const Fetch = require("@11ty/eleventy-fetch");
require("dotenv").config();
module.exports = async () => {
  let url = `https://api.rescuegroups.org/v5/public/orgs/${process.env.ORG_ID}/animals/search/available/`;
  let body = {
    data: {
      filterRadius: {
        miles: 25,
        postalcode: 38834,
      },
    },
  };

  try {
    return await Fetch(url, {
      duration: "5m",
      type: "json",
      fetchOptions: {
        method: "POST",
        headers: {
          Authorization: `${process.env.RESCUE_GROUPS_API_KEY}`,
          "Content-Type": "application/vnd.api+json",
        },
        body: JSON.stringify(body),
      },
    });
  } catch (error) {
    console.error(
      `There was an error fetching your dogs from RescueGroups.org: ${error}`,
    );
  }
};
```

_**NOTE** that we are sending a POST request here. The reason is because we are actually sending a data object that contains params to filter the results before being sent back to us_.

To use the newly acquired response we iterate through the now available `dogs` \_(it's named dogs because we named the file dogs and we are exporting an anonymous function) object.

In the src dir, we create a new folder called _"dogs"_, since we want our uri to be _"/dogs/"_ and create a `index.njk` page with the following:

_`src/dogs/index.njk`_

```liquid
---
layout: 'base_layout.njk'
page_description: 'Dogs available for adoption through For The Puppies Foundation, Inc'
---
<div class="not-prose grid sm:grid-cols-2 place-content-center gap-4 pb-4">
    {% for dog in dogs['data'] %}
    <section
    class="border border-solid  shadow-sm shadow-blue-500/50 hover:cursor-help hover:shadow-md"
    #id="card-{{ loop.index }}">
        <h2 class="text-2xl font-bold text-center">{{ dog.attributes.name }}</span>
        <a href="/dogs/{{ dog.id }}">
            <img src="{{ dog.attributes.pictureThumbnailUrl }}" alt="{{ dog.attributes.name }}" height="80px" class="mx-auto max-h-20">
        </a>
        {% if dog.attributes.isSpecialNeeds %}
        <div class="mt-1">
            <sl-tooltip content="{{ dog.attributes.specialNeedsDetails }}">
                <sl-badge variant="primary" pulse>Special Needs</sl-badge>
            </sl-tooltip>
        </div>
        {% endif %}
        <span class="text-sm font-medium">{{ dog.attributes.breedString }}</span>
    </section>
    {%- endfor %}
</div>
```

Notice in `{% for dog in dogs['data'] %}`, we are looping through the network response, which is now cached. If your confused at this point, I understand. The actual fetch request does not take place on page load. We never added any JavaScript to the page to do that. No! The fetch happens at build, then cached in a new dir that 11ty created for us in `./.cache` in the root of our project. That's what we are actually iterating over. If you open that directory, you will find two files:

_`./.cache/11ty-fetch-6b2afcc92c4976f8a13d4541bf13d1`_

```json
[
  { "6b2afcc92c4976f8a13d4541bf13d1": "1" },
  { "cachedAt": 1719191336440, "type": "2" },
  "json"
]
```

and a sample of the cached data looks like
_`./.cache/11ty-fetch-6b2afcc92c4976f8a13d4541bf13d1.json`_

```json
{
  "meta": {
    "count": 1,
    "countReturned": 1,
    "pageReturned": 1,
    "limit": 25,
    "pages": 1,
    "transactionId": "VLGLBjVcDFmg"
  },
  "data": [
    {
      "type": "animals",
      "id": "20516874",
      "attributes": {
        "activityLevel": "Slightly Active",
        "adoptionFeeString": "550",
        "isAdoptionPending": false,
        "adultSexesOk": "All",
        "ageGroup": "Young",
        "ageString": "1 Year",
        "availableDate": "2024-05-30T00:00:00Z",
        "birthDate": "2023-05-30T00:00:00Z",
        "isBirthDateExact": false,
        "breedString": "Labrador Retriever (short coat)",
        "breedPrimary": "Labrador Retriever",
        "breedPrimaryId": 162,
        "isBreedMixed": false
      }
    }
  ]
}
```

## Viewing a single animal

It would be a pain to do this manually! Thankfully, 11ty can do the heavy lifting for us by utilizing it's built-in [pagination](https://www.11ty.dev/docs/pagination/) feature _(by the way, I hate the naming convention of this feature!)_ to auto-generate a page for each dog from the cached data. We will also utilize [permalinks](https://www.11ty.dev/docs/permalinks/) to generate the uri's for each page.

Let's look at the front-matter first:

_`src/dog-pages.njk Front Matter Only`_

```yml
---
layout: base_layout.njk
pagination:
  data: dogs.data
  size: 1
  alias: dog
  resolve: values
permalink: "dogs/{{ dog.id }}/"
description: Adoption information for {{ dog.attributes.name }}
---
```

To set-up the pagination, we need to pass it some params.

- data: This tells the pagination method what data it will iterate over to generate the pages.
- size: We pass through a size of 1, since we only want 1 page returned.
- alias: How do we want to reference the data on our page. We will call our data object, dog.
- resolve: Objects are resolved to pagination arrays using either the Object.keys or Object.values JavaScript functions. We want the values so that's what we pass.

For the permalink, we use the dogs id, so the urls will look like `https://forthepuppiesfoundation.org/dogs/20244138`. Description is pretty obvious. Now, for the displaying a single dog...

_`src/dog-pages.njk`_

```liquid
<section class="not-prose">
  <header class="grid grid-rows">
    <div
      class="bg-orange-100 mx-auto w-fit overflow-hidden rounded-md hover:bg-orange-50 transition-colors ease-in-out duration-300"
    >
      <img
        src="{{ dog.attributes.pictureThumbnailUrl }} max-w-fit"
        class="rounded-md shadow-md shadow-zinc-500 hover:shadow-sm transition-shadow ease-in-out duration-500"
      >
      <h2 class="text-center py-2 text-xl font-bold text-gray-900 sm:text-3xl">
        {{ dog.attributes.name }}
      </h2>
    </div>
    {% if dog.attributes.isSpecialNeeds %}
      <div class="mt-1 mx-auto">
        <sl-badge variant="primary" pulse>Special Needs</sl-badge>
      </div>
    {% endif %}
  </header>
  <article class="mx-auto mt-4 max-w-xl">
    <p class="text-gray-700 leading-tight">
      {{ dog.attributes.descriptionText | safe }}
    </p>
  </article>
  <div class="mt-4 flex flex-wrap items-center justify-center gap-4">
    <sl-carousel
      class="aspect-ratio"
      autoplay
      loop
      navigation
      pagination
      style="--aspect-ratio: 1/1;"
    >
      {% currentDog dog.id %}
    </sl-carousel>
    <div class="my-4 mx-auto">
      <a
        href="/adoption"
        class="h-12 w-full text-center rounded bg-green-600 px-6 py-3 font-medium tracking-wide text-white shadow-md transition hover:bg-blue-800 focus:outline-none md:mr-4 md:mb-0 md:w-auto"
      >
        Apply to Adopt {{ dog.attributes.name }}
      </a>
    </div>
  </div>
</section>
```

## Shoelaces

The last thing I do want to touch on briefly is my use of [Shoelaces](https://shoelace.style/). I brought it in for one thing that I was trouble solving. We currently have a dog in our care that has special needs and that should be clearly displayed to people that viewing our dogs. So I wanted a small div, with a background that would stand out from the rest of the page and a pop-over that would display what the special need was. This is the snippet that creates what I described.

_`src/dog-pages.njk Special Needs Element`_

```liquid
{% if dog.attributes.isSpecialNeeds %}
  <div class="mt-1 mx-auto">
    <sl-badge variant="primary" pulse>Special Needs</sl-badge>
  </div>
{% endif %}
```

And it looks like this:
![Special Needs w/ Pop-over](https://res.cloudinary.com/dtm8qhbwk/image/upload/q_auto,f_auto/v1720925448/blog/pop-over_cxbfny.jpg)

I struggled with this for about two hours. About 1hr and 45min longer than I should have. Maybe I'm being a little hard on myself, but here's what's sad - I guess it's not sad - It's nature of web development. A few days later, the [Pop-Over API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) was released to the public and I had no idea it was coming!

I will write up a Part 2 about some other aspects of the site and resolving some of the issues I named at the beginning of this post.
