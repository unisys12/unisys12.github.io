---
layout: "layouts/blog.njk"
status: "draft"
title: "Destiny Seed Project"
description: "Attempt at creating a package to seed a database, from Laravel, with data from Destiny the Game Manifest file"
publishDate: 2024-07-11
tags: ["portfolio", "php", "laravel", "seeding", "database"]
image: "https://res.cloudinary.com/dtm8qhbwk/image/upload/c_thumb,q_auto,g_face,f_auto,w_200/v1635373637/blog/stock/pexels-markus-spiske-2061168_coxasy.jpg"
image_alt: "A simple header image"
---

# Destiny Project

[Destiny Project](https://github.com/unisys12/destiny-project/)

## Project Purpose

In all honesty, this was one of those _"Hey! Wouldn't this be neat?"_ type of projects.

I wanted to create a PHP Package that you could add to a Laravel project, then run a few artisan commands and end up with a fully seeded database full of data. This data would come from the Manifest file that is released every two weeks or after each update to the game.

## Tech Used

- PHP 8.1 or greater required due to use of Enums _(which was new, natively, to PHP at the time)_
- Laravel 8

## Proud Moments

- At the time, Laravel did not support the concept of a single action controller. I don't believe anyway. So I just put my single actions within `routes/web.php` and it was super clean.

Ex: `/activity`

```php
<?php
Route::get('/activity', function () {
    $activity = DestinyActivityDefinition::find(1);

    return view('destiny.activity', compact('activity'));
});
```

- It was the first time I got to play with native [Enums](https://www.php.net/manual/en/language.enumerations.basics.php) and liked it.

Ex: `/energy_type/{id}` route

```php
<?php
Route::get('/energy_type/{id}', function ($id) {
    $energy = DestinyEnergyTypeDefinition::find($id);
    $name = DestinyEnergyType::from($energy->enumValue)->name;

    return view('destiny.energy_type', compact('energy', 'name'));
});
```

Ex: `app/Destiny/Enums`

```php
<?php

namespace App\Destiny\Enums;

enum DestinyEnergyType: int
{
    case Any = 0;
    case Arc = 1;
    case Thermal = 2;
    case Void = 3;
    case Ghost = 4;
    case Subclass = 5;
    case Statis = 6;
}
```

- This project was the first time I had created my own Artisan commands for a Laravel app. I will go over them all and how they work. You can take a look at [repo](https://github.com/unisys12/destiny-project/tree/main/app/Console/Commands, "Custom Artisan Commands") and it's all there.

## Lessons Learned

I learned to walk away from _neat_ projects, like this. There comes a point where there is so much pain in pushing a project forward, that even the knowledge you **might** gain from it, is not worth it. That knowledge can be gained in far better ways. Why did I come to this conclusion?

_Seeding Relationships_

The Manifest file that Destiny ships is a zipped SQLite database. Each table only contains two columns: ID, BLOB. The ID column was of course pointless. But the blog column contained a JSON object with the information for an item, with a separate ID for that item or entry. This ID was referenced as a property called "hash". And this hash value could be found in thousands of places throughout other tables or even the same table. Piecing those relationships together was going to bea nightmare! When I finally came to the conclusion that I could solve all this by using MongoDB _(or any other noSQL database)_, that's what I did. And MongoDB support for Laravel is just as big of a nightmare as the problem I was trying to solve. Back to NodeJS I went!

If there was money involved here, I still would've taken a step back and looked everything over a second time. Depending on _how much money_: It might've been worth configuring MongoDB adapter for Laravel and pushing forward. Laravel easily supports multiple database connections, so it would not have been a big deal.
