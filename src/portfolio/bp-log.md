---
layout: "layouts/blog.njk"
status: "draft"
title: "Blood Pressure Log"
description: "Was told my blood pressure was high, so I decided to make a tracking app instead of downloading one."
date: 2025-05-12
tags: ["portfolio", "php", "laravel", "seeding", "database"]
image: "https://res.cloudinary.com/dtm8qhbwk/image/upload/c_thumb,w_200,g_face/v1747072485/blog/diastolic_example_ajqvwd.webp"
image_alt: "A simple header image"
---

# Blood Pressure Log

[Blood Pressure Log](https://github.com/unisys12/bp-log)

## Purpose/Goals

I had to pay a visit to the doctor a few weeks ago due to me not feeling well, over the course of a week or so. And while there, I was informed that my blood pressure was **high**. _"Your blood pressure has always been spot on, even when you were sick. We need to watch this closely!"_ . I thought to myself, **128/92** is not that bad. I shrugged it off. I'm 51 years old, as of 2025 and will turn 52 later this year. I work like a dog _(dog trainer, rescue operator)_ and eat like a slave from the time of the pharaohs. _"Yeah, it's gonna be a bit off. No big deal!"_, I said. I'm in better physical condition that I have ever been in my life, weighing in at 193 at 5'9". Where as I weighed 230 when I left my previous job just over 4 years ago. Nevertheless, she gave me a sheet of paper that contained a table to track my blood pressure over time.

Given all that, I did take a few moments to ponder one thing that has bugged me for a few years now. I feel like garbage most of the time. Even when I feel _good_, it's not nearly the same _good_ feeling I had 5 years ago. Maybe there is something to this after all. One way to find out. And if I am going to do this, I'm not going to write this crap on a piece of paper just so I can loose it later. I'll make something!

## Tech Used

- PHP 8.4
- Laravel 12 w/Livewire Starter Kit
- Chartjs

## Knowledge Gained

This was the first time that I mixed PHP and Javascript! I've played with sites and made sites that used InertiaJS to help tie Laravel to Vue, but this was different. I take the typical Laravel Starter Kit dashboard and bring in my chart to display blood pressure readings over time. Simple enough!

`resources/views/dashboard.blade.php`

```html
<x-layouts.app :title="__('Dashboard')">
  <x-dashboard-heading :heading="__('Dashboard')" :subheading="__('')" />
  <div class="flex h-full w-full flex-1 flex-col gap-4 rounded-xl">
    <div
      class="relative h-full flex-1 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700"
    >
      @livewire('blood-pressure-chart')
    </div>
  </div>
</x-layouts.app>
```

In my `blood-pressure-chart` component:

`app/Livewire/BloodPressureChart.php`

```php
<?php

namespace App\Livewire;

use App\Enums\Category;
use App\Models\Record;
use Livewire\Component;
use App\Enums\PulsePressure;
use Illuminate\Support\Facades\Auth;

class BloodPressureChart extends Component
{

    public $bloodPressureData = [];

    public function mount()
    {
        $this->bloodPressureData = Record::where('user_id', Auth::user()->id)
            ->orderBy('date', 'desc')
            ->take(10)
            ->get()
            ->map(function ($record) {
                return [
                    'systolic' => $record->systolic,
                    'diastolic' => $record->diastolic,
                    'date' => $record->date->format('Y-m-d'),
                    'blood_pressure_status' => Category::status($record->systolic, $record->diastolic),
                    'pulse_pressure' => Category::pulsePressure($record->systolic, $record->diastolic),
                    'pulse_pressure_status' => PulsePressure::status(
                        Category::pulsePressure($record->systolic, $record->diastolic)
                    ),
                ];
            });
    }

    public function render()
    {
        return view('livewire.blood-pressure-chart');
    }
}
```

Within the mount function above, we populate the public property `bloodPressureData`. We then use that property in the blade file, that contains our chart, using the $wire object - made available through Livewire. Basically, much like InertiaJS ties the backend to the frontend of your codebase, $wire acts as a bridge between Livewire _(backend)_ and AlpineJS _(frontend)_.

`resources/views/livewire/blood-pressure-chart.blade.php`

```js
@assets
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
@endassets

<div class="">
  <canvas id="bpChart"></canvas>
  <flux:separator />
  <canvas id="ppChart"></canvas>
</div>

@script
<script>
const bpctx = document.getElementById('bpChart').getContext('2d');
const ppctx = document.getElementById('ppChart').getContext('2d');
const bpdata = $wire.bloodPressureData;

const bpchart = new Chart(bpctx, {
    type: 'line',
    data: {
        labels: bpdata.map(item => item.date),
        datasets: [
            {
                label: 'Systolic',
                data: bpdata.map(item => item.systolic),
                //- Removed -//
            },
            {
                label: 'Diastolic',
                data: bpdata.map(item => item.diastolic),
                //- Removed -//
            }
        ],
    },
    options: {
        responsive: true,
        plugins: {
            //- Removed -//
            tooltip: {
                callbacks: {
                    footer: ((ctx) => {
                        return bpdata[ctx[0].dataIndex].blood_pressure_status;
                    })
                }
            }
        },
        //- Removed -//
    },
});
</script>
@endscript
```

In the above example, I have removed a lot code for sake of keeping the sample as simple as possible. For a full look, check out the repo that I have linked above.

But, you can see that we assign the data that we queried from the database within the mount function of the component earlier to `const bpdata = $wire.bloodPressureData;` using `$wire.bloodPressureData`. Now, all of the queried data is available to the frontend.

> _$wire is so freaking powerful!_

I will be writing a blog post on the making of this app very soon and will update this page to point it as soon as it is published. There is a lot to cover!

> Part 1 of the post is available [here](/posts/bp-log).