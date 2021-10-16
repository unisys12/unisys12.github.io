---
layout: 'templates/postTemplate.njk'
title: 'Static Data in 11ty'
tags: posts, 11ty, nunjucks, tips
excerpt: 'Data can be hard, but you sometimes have to try harder.'
---

# {{ title }}

![Placeholder Image](https://res.cloudinary.com/dtm8qhbwk/image/upload/c_fit,q_auto,w_800/v1633697298/blog/stock/kevin-ku-w7ZyuGYNpRQ-unsplash_qsnklf.jpg)

When working in 11ty, it can sometimes be hard to figure out how to handle the data within your project. Sometimes it might be static data that you create yourself, using either JSON or YAML. Other times, it might be from an unfamiliar API. Either way, it has been one of my single weakest point when it comes to using a SSG to create web content.

Funny thing though... Data has always been my thing. I love data in all forms. I love parsing it and extracting different things from it. Honestly, it's one of the most enjoyable aspects of development, for me. _I know I'm a sick bastard and love punishment._ But I ran into a interesting situation when working on a personal challenge site the other day and wanted to share what I learned.

## Iterating Over Objects That's Not An Array

First off, in JavaScript, everything's an object! So what do I mean by Object? An Object in JavaScript can look like so,
given the file `users.json` exists in your `_data` directory.

`/src/_data/users.json`

```json
{
  "1": {
    "name": "Phillip Jackson",
    "email": "unisy12@gmail.com"
  },
  "2": {
    "name": "Kim Jackson",
    "email": "ftpta@gmail.com"
  }
}
```

Using [Nunjucks](https://mozilla.github.io/nunjucks/), we can see the data by writing the following:

{% highlight liquid %}
<div>
  <code>{{ users | dump }}</code>
</div>
{% endhighlight %}

The output will look like so:

```json
{
  "1": { "name": "Phillip Jackson", "email": "unisy12@gmail.com" },
  "2": { "name": "Kim Jackson", "email": "ftpta@gmail.com" }
}
```

So, I was working with an API the other day that returned a JSON response that was formatted like the above example. Given this example, the typical JavaScript Array methods will not work since the Object is not an array. If you iterate over it as normal, nothing will be displayed:

{% highlight liquid %}
{% for person in test %}
<div>
  <code>{{ person }}</code>
</div>
{% endfor %}
{% endhighlight %}

DOH! How in the hell will we deal with this using Nunjucks or any other template syntax? I played around with writing a custom shortcode that would parse the json response and convert into an array, but I figured there had to be a slightly better way.

> {{ excerpt }}

### Maybe There is a Way

After a few hours of playing around and scratching my head, I thought about rendering the index from the for loop. Like you would for other languages, so I tried the following:

{% highlight liquid %}
{% for p, person in test %}
<div>
  <code>{{ p }}</code>
</div>
<div>
  <code>{{ person }}</code>
</div>
<br>
{% endfor %}
{% endhighlight %}

Outputs the following:

```
1
[object Object]

2
[object Object]
```

As you can see, _p_ is our iterator index and _person_ is our iterator value that we should be able to work with.

{% highlight liquid %}
{% for p, person in test %}
  <div>
    <p>Name: <code>{{ person.name }}</code></p>
    <p>Email: <code>{{ person.email }}</code></p>
  </div>
  <br>
{% endfor %}
{% endhighlight %}

{% highlight text %}
// Iterate over each person
Name: Phillip Jackson
Email: unisy12@gmail.com

Name: Kim Jackson
Email: ftpta@gmail.com
{% endhighlight %}

Adding the index declaration to the _for_ loop is not documented, in Nunjucks or Liquid, but I figured I would give it shot. What's the worst thing that would happen. And it worked!
