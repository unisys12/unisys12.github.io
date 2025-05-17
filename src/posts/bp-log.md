---
layout: "layouts/blog.njk"
status: "draft"
title: Blood Pressure Log Part 1
description: "Found out my blood pressure is high, so I have to start tracking it. So I built an app to do that."
publishDate: 2025-05-13
tags:
  [
    "blog",
    "laravel",
    "chartjs",
    "livewire",
    "alpinejs",
    "blood pressure log",
  ]
image: "https://res.cloudinary.com/dtm8qhbwk/image/upload/c_thumb,w_200,g_face/v1747072485/blog/dashboard_qclhvg.webp"
image_alt: "A simple header image"
---

# Blood Pressure Log

I visited my local doctor, at the advice of wife _(which means she told me to go)_, last week due to a cold that I just could not break free of. It literally had me in chains for about 3 weeks. And during that visit, I was notified that my blood pressure was _high_. I shrugged it off and gave a few reasons why it might be, but the nurse was not convinced. A few moments later, the doctor comes in and has this worried look on her face.

_"Your blood pressure has always been spot on, even when you were sick. We need to watch this closely!"_ . I thought to myself, **128/92** is not that bad. I shrugged it off, again. I'm 51 years old, as of 2025 and will turn 52 later this year. I work like a dog _(dog trainer, rescue operator)_ and eat like a slave from the time of the pharaohs. _"Yeah, it's gonna be a bit off. No big deal!"_, I said. I'm in better physical condition that I have ever been in my life, weighing in at 193 at 5'9". Where as I weighed 230 when I left my previous job just over 4 years ago. Nevertheless, she gave me a sheet of paper that contained a table to track my blood pressure over time.

Given all that, I did take a few moments to ponder one thing that has bugged me for a few years now. I feel like garbage most of the time. Even when I feel _good_, it's not nearly the same _good_ feeling I had 5 years ago. Maybe there is something to this after all. One way to find out. And if I am going to do this, I'm not going to write this crap on a piece of paper just so I can loose it later. I'll make something!

## Goals

I had been reading a lot about [Datastar](https://data-star.dev/) recently and have really wanted to play around with it. It's a hypermedia framework and makes it super simple to pass data _(wrapped in HTML components or fragments)_ to HTML templates or fragments. But I thought to myself, that the quickest way to get this project off the ground was going to be using a Laravel Starter Kit w/Livewire. Mainly because I wanted to be able to just see the data for a single person at a time. Since the Livewire Starter kit already has authentication built right in, all I needed to worry about was the input of records, display all records in a table, and display a range of records in a chart. As an added challenge, I wanted to add some basic diagnostics to the app as well.

## Research

Before typing out the first cli cmd, I needed to do some research. I know what blood pressure is, but what each number is called - I had no idea. I _thought_ I knew what normal blood pressure was suppose to be, but come to find out I didn't. There was a lot I didn't know and if I was going to be making an app to track this stuff, I kinda want it to accurate and use the correct terms. To see all my notes, you can take a look at the `README.MD` on the projects [repo](https://github.com/unisys12/bp-log). But to say I learned a lot is an understatement!

## Base Setup

Now that all the research is out of the way and I have an idea of what I want to track and display, it's time to write some code.

- Install Laravel w/Livewire Starter Kit & Laravel Auth
- Create our Migrations, Models, Factories and Seeders that will hold our records
  - `php artisan make:model Records -mfs`

_`database/migrations/create_records_table.php`_

```php
<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('records', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(User::class)->constrained();
            $table->integer('weight');
            $table->integer('systolic');
            $table->integer('diastolic');
            $table->integer('pulse');
            $table->date('date');
            $table->time('time');
            $table->string('notes')->nullable();
            $table->timestamps();
        });
    }
};
```

_`database/factories/RecordFactory.php`_

```php
<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Record>
 */
final class RecordFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'date' => $this->faker->date(),
            'time' => $this->faker->time(),
            'weight' => $this->faker->numberBetween(100, 300),
            'systolic' => $this->faker->numberBetween(90, 180),
            'diastolic' => $this->faker->numberBetween(60, 120),
            'pulse' => $this->faker->numberBetween(60, 100),
            'notes' => $this->faker->sentence(),
        ];
    }
}
```

_`database/seeders/DatabaseSeeder.php`_

```php
<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Record;
use Illuminate\Database\Seeder;

final class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()
            ->has(Record::factory()->count(10))
            ->create();
    }
}
```

- Add the follow HasMany relationship method to the Users model

_`app/Models/User.php`_

```php
/**
 * Get the user's records
 */
public function records(): HasMany
{
    return $this->hasMany(Record::class);
}
```

- And do the same, but the inverse, in the Record Model

_`app/Models/Record.php`_

```php
/**
 * Get the records for the user.
 */
public function user()
{
    return $this->belongsTo(User::class);
}
```

- With this in place, we should be able to our open migrations, followed by our seeder.

`php artisan migrate` & `php artisan db:seed`

## Building out the Frontend
With that, our database is populated and we now have something to work with when building our views.

- First order of business is change our layout to use the _header_ nav, instead of the default _sidebar_. This will give us more screen real estate for our charts. But we are also storing quite a bit in our tables as well.

_`resources/views/components/layouts/app.php`_

```diff-html
- <x-layouts.app.sidebar :title="$title ?? null">
+ <x-layouts.app.header :title="$title ?? null">
    <flux:main>
        {{ $slot }}
    </flux:main>
  </x-layouts.app.header>
```
_We will be coming back to edit `app.header` in just a moment._

- Next, we need to create a controller for our views and routes. This is optional, since we are using Livewire. We could just leverage Livewire for everything, but I didn't want to do that. I want to use Livewire where it makes sense. I do not require that this app have a SPA type of navigation or feel. I just want it to work, at the moment. I will most likely go back, during a refactor, and convert this to a Invokable Controller later.

`php artisan make:controller RecordController --resource`

_`routes/web.php`_
```diff-php
Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', Profile::class)->name('settings.profile');
    Route::get('settings/password', Password::class)->name('settings.password');
    Route::get('settings/appearance', Appearance::class)->name('settings.appearance');

+    Route::resource('records', RecordController::class);
});
```

And in the index method of our controller, we will grab all the records for the currently authenticated user and order them by descending date.

_`app/Http/Controllers/RecordController.php`_
```php
/**
 * Display a listing of the resource.
 */
public function index()
{
    $records = Record::where('user_id', Auth::user()->id)
        ->orderBy('date', 'desc')->get();
    return view('record.index', ['records' => $records]);
}
```

Now, we create a new view directory to hold our view file

_`resources/views/records/index.blade.php`_

```html
<x-layouts.app :title="__('Records')">
    <x-dashboard-heading
    :heading="__('Records')"
    :subheading="__('Display of all records')"
    />
    <div class="flex h-full w-full flex-1 flex-col gap-4 rounded-xl" id="records">
        <div class="overflow-x-auto">
        <table class="min-w-full divide-y-2 divide-gray-200 dark:divide-gray-700">
            <thead class="ltr:text-left rtl:text-right">
                <tr class="*:font-medium *:text-gray-900 dark:*:text-white">
                    <th class="px-3 py-2 whitespace-nowrap capitalize">id</th>
                    <th class="px-3 py-2 whitespace-nowrap capitalize">user</th>
                    <th class="px-3 py-2 whitespace-nowrap capitalize">weight</th>
                    <th class="px-3 py-2 whitespace-nowrap capitalize">systolic</th>
                    <th class="px-3 py-2 whitespace-nowrap capitalize">diastolic</th>
                    <th class="px-3 py-2 whitespace-nowrap capitalize">pulse</th>
                    <th class="px-3 py-2 whitespace-nowrap capitalize">date</th>
                    <th class="px-3 py-2 whitespace-nowrap capitalize">time</th>
                    <th class="px-3 py-2 whitespace-nowrap capitalize">notes</th>
                </tr>
            </thead>

            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                @foreach ($records as $record)
                    <tr>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ $record->id }}</td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ $record->user->name }}</td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ $record->weight }}</td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ $record->systolic }}</td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ $record->diastolic }}</td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ $record->pulse }}</td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ $record->date->format('Y-m-d') }}</td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ $record->time->format('H:i a') }}</td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ $record->notes }}</td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <a href="{{ route('records.edit', $record->id) }}" class="text-blue-500 hover:text-blue-700">Edit</a>
                            <form action="{{ route('records.destroy', $record->id) }}" method="POST" class="inline">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="text-red-500 hover:text-red-700">Delete</button>
                            </form>
                    </tr>
                @endforeach
            </tbody>
        </table>
        </div>
    </div>
</x-layouts.app>
```

- To view this table, we need to add a link to our header nav so that we can access it. Make to add the same link further down the page on between lines `106-113` or there about.

```diff-html
<flux:navbar class="-mb-px max-lg:hidden">
    <flux:navbar.item
      icon="layout-grid"
      :href="route('dashboard')"
      :current="request()->routeIs('dashboard')"
      wire:navigate>
        {{ __('Dashboard') }}
    </flux:navbar.item>
+   <flux:navbar.item
+       icon="book-open"
+       :href="route('records.index')"
+       :current="request()->routeIs('records.index')"
+       wire:navigate>
+       {{ __('Records') }}
+   </flux:navbar.item>
</flux:navbar>
```

## Charting our Records
Now that we can see all our records in a table, lets do what we came here to do. Look at them in chart or graph!

`php artisan make:livewire BloodPressureChart`

We first need to setup the backend of our component, so that we have something to pass to the frontend.

_`app/Livewire/BloodPressureChart.php`_
```php
<?php

namespace App\Livewire;

use App\Enums\BloodPressure;
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
                    'blood_pressure_status' => BloodPressure::status($record->systolic, $record->diastolic),
                    'pulse_pressure' => BloodPressure::pulsePressure($record->systolic, $record->diastolic),
                    'pulse_pressure_status' => PulsePressure::status(
                        BloodPressure::pulsePressure($record->systolic, $record->diastolic)
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
We are doing much like we did with our controller action, but this time we are only grabbing the most recent 10 records, mapping over them and returning an array that contains a mix of data.

- **systolic** - the top number of the blood pressure reading that was recorded
- **diastolic** - the bottom number of the blood pressure reading that was recorded
- **date** - the date when the blood pressure reading was recorded
- **blood_pressure_status** - the category or classification of the blood pressure reading that was recorded
- **pulse_pressure** - the pulse pressure, calculated from the blood pressure reading that was recorded
- **pulse_pressure_status** - the pulse pressure classification, determined from the pulse pressure reading that was calculated previously

First, let's actually get a chart that shows the basic info - Systolic, Diastolic and Date. At the moment, I want to try and display both Systolic and Diastolic in the same line chart. Sys on the left and Dia on the right.

_`resources/views/livewire/blood-pressure-chart.php`_

```html
@assets
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
@endassets

<div class="">
  <canvas id="bpChart"></canvas>
</div>

@script
<script>
const bpctx = document.getElementById('bpChart').getContext('2d');
const bpdata = $wire.bloodPressureData;

const bpchart = new Chart(bpctx, {
    type: 'line',
    data: {
        labels: bpdata.map(item => item.date),
        datasets: [
            {
                label: 'Systolic',
                data: bpdata.map(item => item.systolic),
                tension: 0.1,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: false,
                yAxisID: 'y',
            },
            {
                label: 'Diastolic',
                data: bpdata.map(item => item.diastolic),
                tension: 0.1,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: false,
                yAxisID: 'y1',
            }
        ],
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: true,
            },
            title: {
                display: true,
                text: 'Blood Pressure Chart',
            },
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Blood Pressure (mmHg)',
                    color: 'rgba(255, 99, 132, 0.7)',
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Diastolic Pressure (mmHg)',
                    color: 'rgba(54, 162, 235, 0.7)',
                }
            }
        }
    },
});
</script>
@endscript
```

There's actually something cool going on here I want to point out. Notice that we are writing Javascript, right? Well, take notice to the third line in the `@script` block in the code-block above. See the line `const bpdata = $wire.bloodPressureData;`. We are passing the data that we queried, using Eloquent, in the backend part of the component and passing it to the frontend. Right into the hands of Javascript! This is all thanks to Livewire using AlpineJS under the hood.

> I have decide that I will make a separate post on the chart itself. _Stay Tuned!_

Next we need to actually add our component to the dashboard...

_`resources/views/dashboard.blade.php`_

```html
<x-layouts.app :title="__('Dashboard')">
    <x-dashboard-heading
    :heading="__('Dashboard')"
    :subheading="__('')"
    />
    <div class="flex h-full w-full flex-1 flex-col gap-4 rounded-xl">
        <div class="relative h-full flex-1 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
            @livewire('blood-pressure-chart')
        </div>
    </div>
</x-layouts.app>
```

![Blood Pressure Chart](https://res.cloudinary.com/dtm8qhbwk/image/upload/v1747164163/blog/sys_dia_mif5qu.jpg)

Now, when I hover over what ChartJS calls a **tick** _(that's the dots on the chart that denote a point of time on where the x and y axis intersect. Or in layman's terms, a point of data.)_, I would like to display the classification of the blood pressure reading. To do that, we need to modify our options object attached to our chart by adding a `tooltip` property to the `plugins` property.

```diff-js
options: {
  responsive: true,
  plugins: {
      legend: {
          display: true,
      },
      title: {
          display: true,
          text: 'Blood Pressure Chart',
      },
+      tooltip: {
+          callbacks: {
+              footer: ((ctx) => {
+                  return bpdata[ctx[0].dataIndex].blood_pressure_status;
+              })
+          }
+      },
    },
  },
```

![Tool tip displaying status](https://res.cloudinary.com/dtm8qhbwk/image/upload/v1747072485/blog/systolic_example_uxepvm.webp)

## Status & Classification
To determine classification of the blood pressure reading, you may have noticed that I am passing the readings to a class `BloodPressure` and using the method `status` _(should be refactored to classification)_. That class is an Enum using an Enumeration Method called status. It looks like this:

_`app/Enums/BloodPressure`_

```php
<?php

declare(strict_types=1);

namespace App\Enums;

enum BloodPressure: string
{
    case Hypotension = 'Hypotension';
    case Normal = 'normal';
    case Elevated = 'Elevated';
    case HypertensionStage1 = 'Hypertension Stage 1';
    case HypertensionStage2 = 'Hypertension Stage 2';
    case HypertensiveCrisis = 'Hypertensive Crisis';

    public static function status($systolic, $diastolic): string
    {
        return match (true) {

            $systolic < 90 &&
                $systolic > 0 &&
                $diastolic < 60 &&
                $diastolic > 0
            => self::Hypotension->value,

            $systolic < 120 &&
                $systolic > 90 &&
                $diastolic < 80 &&
                $diastolic > 60
            => self::Normal->value,

            $systolic >= 120 &&
                $systolic <= 129 &&
                $diastolic < 80
            => self::Elevated->value,

            /**
             * Had to move this condition here because it was
             * conflicting with the Hypertension Stage 1 condition.
             */
            $systolic > 180 ||
                $diastolic > 120
            => self::HypertensiveCrisis->value,

            $systolic >= 130 &&
                $systolic <= 139 ||
                $diastolic >= 80 &&
                $diastolic <= 89
            => self::HypertensionStage1->value,

            $systolic >= 140 ||
                $diastolic >= 90
            => self::HypertensionStage2->value,

            default => 'Awaiting valid reading...',
        };
    }

    /**
     * Calculate the pulse pressure based on systolic and diastolic values.
     *
     * - A normal pulse pressure is typically around 40 mmHg.
     * - A pulse pressure of less than 40 mmHg may indicate aortic stenosis or other heart conditions.
     * - A pulse pressure of 60 mmHg or more is considered high and may indicate an increased risk of cardiovascular disease.
     *
     * @param int $systolic Systolic blood pressure value.
     * @param int $diastolic Diastolic blood pressure value.
     * @return int Pulse pressure value.
     */
    public static function pulsePressure($systolic, $diastolic): int
    {
        return $systolic - $diastolic;
    }
}
```

I have also decided that this alone is worth a post itself. I have already discussed this topic [here](/posts/using-enums-livewire-forms), but I ran into an interesting issue in writing tests for this class and fill like it would make a good post.

## Future Plans
Notice that I am not covering the full CRUD operations at this time. The reason is because I don't honestly care about them at the moment. It's more important for me to get to a heart of this app as quickly as possible. That way I can determine if it's viable for me to put hours and hours into it. Anyway!

 > [BP Log Part ](/posts/bp-log-part-two)