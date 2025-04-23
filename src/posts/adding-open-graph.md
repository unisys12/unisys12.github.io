---
layout: "layouts/blog.liquid"
status: "draft"
title: Adding Open Graph Protocol to Our Non-Profit Site
description: "Adding Open Graph Protocol to our non-profit site"
publishDate: 2024-07-18
tags: ["blog", "11ty", "ssg", "jamstack", "open graph"]
image: "https://res.cloudinary.com/dtm8qhbwk/image/upload/c_thumb,q_auto,g_face,f_auto,w_200/v1720813596/blog/stock/nasa--hI5dX2ObAs-unsplash_vk2jwn.webp"
image_alt: "A simple header image"
---

# Adding Open Graph Protocol to Our Non-Profit Site

If you are unfamiliar with the [Open Graph Protocol](https://ogp.me/), I would highly suggest you get yourself aquatinted. It's not anything very technical, like you might think, but it is going to be help out a ton when it comes how people view your site going forward.

> While many different technologies and schemas exist and could be combined together, there isn't a single technology which provides enough information to richly represent any web page within the social graph. The Open Graph protocol builds on these existing technologies and gives developers one thing to implement. Developer simplicity is a key goal of the Open Graph protocol which has informed many of the technical design decisions.

_copy from ogp.me_

First and foremost, when you share a link to your website on say a social media site, it can look pretty boring. By adding Open Graph meta properties to your site head, you can have _some_ control in how that looks.

![Facebook Post w/o Open Graph Meta](https://res.cloudinary.com/dtm8qhbwk/image/upload/q_auto,g_face,f_auto/v1721184392/blog/facebook_post_examply_yddivj.webp)

_Facebook Post w/o Open Graph Meta Tags_

The items that we are going to focus on, for now, are 5 properties:

- og:title : "The title of the object as it should appear within the graph" _Ex: "For The Puppies Foundation, Inc"_
- og:type : "The type of your object, _e.g., \"movie\"_. Depending on the type you specify, other properties may also be required."
- og:url : "The canonical URL of your object that will be used as its permanent ID in the graph" _Ex: "https://www.forthepuppiesfoundation.org"_
- og:description : "A one to two sentence description of your object." _Ex:"Application for adoption through For The Puppies Foundation, Inc"_
- og:image : "An image URL which should represent your object within the graph."

The above list looks self explanatory. But I had some confusion over the `type` property and did a bit more research. There are six supported type objects that are supported for use as a value of the `type` property. Depending on the type you specify, other properties may also be required.

- **Music**
  - music.song
    - music:duration - integer >=1 - The song's length in seconds.
    - music:album - music.album array - The album this song is from.
    - music:album:disc - integer >=1 - Which disc of the album this song is on.
    - music:album:track - integer >=1 - Which track this song is.
    - music:musician - profile array - The musician that made this song.
  - music.album
    - music:song - music.song - The song on this album.
    - music:song:disc - integer >=1 - The same as music:album:disc but in reverse.
    - music:song:track - integer >=1 - The same as music:album:track but in reverse.
    - music:musician - profile - The musician that made this song.
    - music:release_date - datetime - The date the album was released.
  - music.playlist
    - music:song - Identical to the ones on music.album
  - music:song:disc
    - music:song:track
    - music:creator - profile - The creator of this playlist.
  - music.radio_station
    - music:creator - profile - The creator of this station.
- **Video**
  - video.movie
    - video:actor - profile array - Actors in the movie.
    - video:actor:role - string - The role they played.
    - video:director - profile array - Directors of the movie.
    - video:writer - profile array - Writers of the movie.
    - video:duration - integer >=1 - The movie's length in seconds.
    - video:release_date - datetime - The date the movie was released.
    - video:tag - string array - Tag words associated with this movie.
  - video.episode
    - video:actor - Identical to video.movie
    - video:actor:role
    - video:director
    - video:writer
    - video:duration
    - video:release_date
    - video:tag
    - video:series - video.tv_show - Which series this episode belongs to.
  - video.tv_show
    - A multi-episode TV show. The metadata is identical to video.movie.
  - video.other
    - A video that doesn't belong in any other category. The metadata is identical to video.movie.
- **Article**
  - article:published_time - datetime - When the article was first published.
  - article:modified_time - datetime - When the article was last changed.
  - article:expiration_time - datetime - When the article is out of date after.
  - article:author - profile array _(use the profile type below for this)_ - Writers of the article.
    - Ex: <meta type="article" content="article:author:profile:first_name" content="Bobby Joe" />
  - article:section - string - A high-level section name. E.g. Technology
  - article:tag - string array - Tag words associated with this article.
- **Book**
  - book:author - profile array _(use the profile type below for this)_ - Who wrote this book.
    - Ex: <meta type="book" content="book:author:profile:first_name" content="Bobby Joe" />
  - book:isbn - string - The ISBN
  - book:release_date - datetime - The date the book was released.
  - book:tag - string array - Tag words associated with this book.
- **Profile**
  - profile:first_name - string - A name normally given to an individual by a parent or self-chosen.
  - profile:last_name - string - A name inherited from a family or marriage and by which the individual is commonly known.
  - profile:username - string - A short unique string to identify them.
  - profile:gender - enum(male, female) - Their gender.
- **Website**

So! Given all this information, I added the following tags to our site's head section:

```liquid
---
title: "Home Page"
page_description: "Provide local rescue communities with reliable fosters, evaluation and training of rescue dogs and cats thereby enhancing their successful adoption rates."
---

<!DOCTYPE html>
<html lang="en">
<head>
    {...}
    <meta property="og:title" content="{{ title }}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.forthepuppiesfoundation.org{{ page.url }}" />
    <meta property="og:description" content="{{ page_description }}" />
    <meta property="og:image" content="https://www.forthepuppiesfoundation.org{{ '/assets/imgs/ftpf_logo_small.webp' | url }}" />
    {...}
</head>
```

Which render's out like so:
_`index.html`_

```html
<head>
  {...}
  <meta property="og:title" content="Home Page" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.forthepuppiesfoundation.org/" />
  <meta
    property="og:description"
    content="Provide local rescue communities with reliable fosters, evaluation and training of rescue dogs and cats thereby enhancing their successful adoption rates."
  />
  <meta
    property="og:image"
    content="https://www.forthepuppiesfoundation.org/assets/imgs/ftpf_logo_small.webp"
  />
  {...}
</head>
```

> ## 11ty Top Tip
>
> If you are using [Pagination](https://www.11ty.dev/docs/pagination/) in 11ty and have an issue where your editor is
> reformatting your text to the left _(removing your nested properties)_, make sure that you have your editors file
> association actually set to Nunjucks or the correct file type! I just lost an hr on this!!

And with the above additions to our sites head, when sharing a link to our site now looks like this...

_Facebook_

![Facebook Post w/OG tags](https://res.cloudinary.com/dtm8qhbwk/image/upload/q_auto,g_face,f_auto/v1721313137/blog/facebook_post_example_2_c0amjd.jpg)

_Outlook_

![Outlook Example](https://res.cloudinary.com/dtm8qhbwk/image/upload/q_auto,g_face,f_auto/v1721313391/blog/outlook_share_example_ty7lzh.jpg)

Based on the above examples, you kinda get the idea. You will notice that I need to update the sites home page title to something a bit more descriptive, but yeah! Very handy stuff to add value to your site in just a few minutes.
