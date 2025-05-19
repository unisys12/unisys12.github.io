---
layout: "layouts/blog.njk"
status: "draft"
title: Making a Laravel Seed Helper
description: "Working on a project and having to seed just over 15 tables with info and I wanted to see if I could make a helper class to simplify the process a bit."
date: 2024-11-29
tags: ["blog", "laravel", "helper classes", "tables", "seeders"]
image: "https://res.cloudinary.com/dtm8qhbwk/image/upload/c_thumb,q_auto,g_face,f_auto,w_200/v1720813596/blog/stock/nasa--hI5dX2ObAs-unsplash_vk2jwn.webp"
image_alt: "A simple header image"
---

# Making a Laravel Seed Helper

I've been working a larger personal project a week or so now and after a few iterations, I am close to where I will be moving it into a production phase. One of the things that I would like to offer in this project is a sensible default options for a lot of the choices that need to be made.

## Let me back up a little

I am making, what I hope to be, a SaaS product that can be used by animal rescues and shelters to help them manage their animals and day to day tasks. It is a hugh undertaking, but nothing that I am not overly unfamiliar with, since my wife and I have run a successful dog training business _(out of our home)_ for the last 5 years. Add to that, in the last year _(2023)_ we started a Non-Profit _(501c3)_ with the goal of helping rescues and shelters. It turned out that we was suppose to be a rescue, I guess, since that is currently what we are operating as. TLDR _"Plan all you want, but life has a way of making sure to do what your needed most for at that time."_

The project has several moving parts, but the most important is the Animal Model. Pretty much everything else links back to a animal through relationships. Medication schedules, feeding regimens, vet appointments and don't get me started on the all the different attributes that have to be assigned to each animal! Around 60... at the moment!! Each of these tables are very simple and contain only a `label` property.

## Which Brings Us to Our Simple Need

A typical seeder would look like this

`database/seeders/ActivityLevelSeeder.php`

```php
<?php

namespace Database\Seeders;

use App\Helpers\LabelHelper;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ActivityLevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $levels = ['Not Active', 'Slightly Active', 'Moderately Active', 'Highly Active'];
        foreach ($levels as $level) {
            DB::table('activity_levels')->insert([
                'label' => $level
            ]);
        }
    }
}
```

Simple enough, right? Well, type that out 60+ times! After the second one, I thought this would be a great time to create a helper class to... _wait for it_... help me.

`app/Helpers/LabelHelper.php` _naming is hard!_

```php
<?php

namespace App\Helpers;

use Illuminate\Support\Facades\DB;

class LabelHelper {

    public static function assign(string $table_name, array $labels): void {
        foreach ($labels as $label) {
            DB::table($table_name)->insert([
                'label' => $label
            ]);
        }
    }

}
```

Putting it to use looks like this

`database/seeders/ActivityLevelSeeder.php`

```php
<?php

namespace Database\Seeders;

use App\Helpers\LabelHelper;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ActivityLevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        LabelHelper::assign('activity_levels', ['Not Active', 'Slightly Active', 'Moderately Active', 'Highly Active']);
    }
}
```

Much easier! Enjoy!
