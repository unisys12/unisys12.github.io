---
layout: "layouts/blog.liquid"
status: "draft"
title: "FTPTA Manager"
description: "Building a project for my wife, without her permission."
publishDate: 2024-07-11
tags:
  [
    "portfolio",
    "php",
    "laravel",
    "livewire",
    "self-employed",
    "Splade",
    "Vue 3.2",
    "FilepondJS",
    "ChoicesJS",
    "FlatpickerJS",
  ]
image: "https://res.cloudinary.com/dtm8qhbwk/image/upload/c_thumb,q_auto,g_face,f_auto,w_200/v1635373637/blog/stock/pexels-markus-spiske-2061168_coxasy.jpg"
image_alt: "A simple header image"
---

# FTPTA Manager

[Repo Link](https://github.com/unisys12/ftpta-manager)

## Project Purpose

My wife and I started a dog training business back in late 2019. After a very short while, we needed software to help us keep track of everything, so I started this project to help solve that.

## Tech Used

- [Laravel v9](https://laravel.com/docs/9.x)
- [Splade v1.1.0](https://splade.dev/docs)
  - Vue 3.2
  - Filepond
  - Choices
  - Flatpicker

## Proud Moments

- I had used VueJS before. I knew it was a great. But this really pushed me over the edge. Bring it into a project using Splade was very different, but it really paid off. Too bad the project is no longer maintained/abandoned. The creator is authoring his own framework, so... it might be a few minutes before it's really ready.
- I created a Factory that seeds the database with a ton of information about different dog breeds! I was super happy about how that worked out.

```php
<?php

namespace Database\Factories;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Breed>
 */
class BreedFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $response = Http::withHeaders(
            [
                'x-api-key' => env('DOG_API_KEY')
            ]
        )->get('https://api.thedogapi.com/v1/breeds');

        if ($response->ok()) {
            $body = $response->collect();

            $breed_count = 0;

            foreach ($body as $value) {
                // print_r($value);
                DB::table('breeds')->insert([
                    'name' => $value['name'],
                    'bred_for' => $value['bred_for'] ?? "",
                    'breed_group' => $value['breed_group'] ?? "",
                    'height' => $value['height']['imperial'] ?? "",
                    'image_url' => $value['image']['url'] ?? "",
                    'life_span' => $value['life_span'] ?? "",
                    'origin' => $value['origin'] ?? "",
                    'temperament' => $value['temperament'] ?? "",
                    'weight' => $value['weight']['imperial'] ?? ""
                ]);

                $breed_count++;
            }

            echo "Seeded {$breed_count} breeds to the DB!";

            exit;
        }
    }
}
```

- There's nothing here really to brag about, other than... Look! I made a thing! It's a pretty standard Laravel app. Why am I listing it? Keep reading.

## Lessons Learned

Never start on a project like this until you know what the full list of client expectations. Once I got the project to the point in which the repo currently sites, I called my wife over and asked her to sit next me. _"I got sumtin I want to show ya!"_ . I was so proud of myself. I showed her the dashboard and what the different boxes were. Even showed her the calendar and how she could add events to the calendar and they would just show up. Events couldn't over lap, etc. I even showed her how events would automatically be added based on training schedules or private lesson appointments. How easy it was to add a new dog, user, employee, etc.

She flipped out and got so mad at me. I bet she was mad at me for a month over this project. And I didn't realize that what I had actually done was taken away some of her agency from the business. She wanted to be able to sit down and look over the different features that different software vendors provided and make decisions from there. She didn't really know what all she needed, at that time.

So... I stopped working on it and learned a very valuable lesson.
