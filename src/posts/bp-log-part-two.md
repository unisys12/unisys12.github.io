---
layout: "layouts/blog.njk"
status: "draft"
title: Blood Pressure Log Part 2
description: "Part two of building a blood pressure tracking app using Laravel 12 and Livewire."
date: 2025-05-15
tags:
  [
    "blog",
    "laravel",
    'php',
    'enums',
    "chartjs",
    "livewire",
    "alpinejs",
    "blood pressure log",
  ]
image: "https://res.cloudinary.com/dtm8qhbwk/image/upload/c_thumb,w_200,g_face/v1747072485/blog/dashboard_qclhvg.webp"
image_alt: "A simple header image"
---

# Blood Pressure Log Part 2

In [Part One](/posts/bp-log) of this series, I covered the setting up the app using the Laravel 12 Livewire Starter Kit. We got the migrations, models configured the appropriate relationship methods, factory, seeder and a single controller. We also were able to view all our records _(blood pressure readings)_ in a table format, and finished off with creating a chart using [ChartJS](https://www.chartjs.org/) to view the last 10 records entered for the given authenticated user.

In Part Two, we will modify the tooltips of the charts to display some very basic diagnostic information about each reading, and get our Pulse Pressure chart setup as well.

## Diagnostic Data
There are few meaningful points of data that can be gathered from just a single blood pressure reading.

- High/Low Pressure Readings _(hypertension and hypotension)_
- Inter-Arm Difference _(which we are currently not tracking, but will be add as a feature later)_
- Pulse Pressure _(actually used to determine one's risk factor of conditions such as atrial fibrillation and cardiovascular disease)_

## Pulse Pressure Levels
Works the same as BP above, but for posterity.

_`app/Enums/PulsePressure.php`_

```php
<?php

declare(strict_types=1);

namespace App\Enums;

enum PulsePressure: string
{
    case Low = 'Low';
    case Normal = 'Normal';
    case High = 'High';

    public static function status(int $pulsePressure): string
    {
        return match (true) {
            $pulsePressure < 40 => self::Low->value,
            $pulsePressure >= 40 && $pulsePressure <= 60 => self::Normal->value,
            default => self::High->value,
        };
    }
}
```

## Modifying Tooltips In ChartJS
Now that we have some very basic diagnostic data to display, based on our readings, we are move on to displaying that in a ChartJS [Tooltip](https://www.chartjs.org/docs/latest/configuration/tooltip.html) - which are pretty flexible. Way more than I originally thought going into this. But once I landed on the docs, my mind melted a little. Seriously! But, sticking to the basics of what we need to accomplish, it shouldn't be too bad.

Tooltips are an object on the Plugins property of your charts configuration object. And this is what I landed on for a first pass...

_`resources/views/livewire/blood-pressure-chart.blade.php`_
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
+       tooltip: {
+           callbacks: {
+               footer: ((ctx) => {
+                   return bpdata[ctx[0].dataIndex].blood_pressure_status;
+               })
+           }
+       }
+   },
}
```

This gives us the following result when we hover over a point with the charts data. We just repeat this for each chart and data point that we want to display custom on and wa-la!

![Tooltip Example Image display Systolic data and diagnostics](https://res.cloudinary.com/dtm8qhbwk/image/upload/g_face/v1747072485/blog/systolic_example_uxepvm.webp)

## Display Pulse Pressure
We will setup a separate chart to display Pulse Pressure, since trying to view it within the Blood Pressure line graph chart might be confusing. I have ideas, but at this point, we are just trying to get our idea into a working state. Onward then!

- Modify our blade view file with the additional chart:

_`resources/views/livewire/blood-pressure-chart.blade.php`_

```diff-html
    <div class="">
        <canvas id="bpChart"></canvas>
        <flux:separator />
+       <canvas id="ppChart"></canvas>
    </div>
```

```diff-js
@script
    <script>
    const bpctx = document.getElementById('bpChart').getContext('2d');
+   const ppctx = document.getElementById('ppChart').getContext('2d');
    const bpdata = $wire.bloodPressureData;

    const bpchart = new Chart(bpctx, {
        // Removed
    });

+    const ppChart = new Chart(ppctx, {
+        type: 'line',
+        data: {
+            labels: bpdata.map(item => item.date),
+            datasets: [
+                {
+                    label: 'Pulse Pressure',
+                    data: bpdata.map(item => item.pulse_pressure),
+                    tension: 0.2,
+                    borderColor: 'rgba(75, 192, 192, 1)',
+                    backgroundColor: 'rgba(25, 25, 192, 0.2)',
+                    fill: false,
+                }
+            ],
+        },
+        options: {
+            responsive: true,
+            plugins: {
+                legend: {
+                    display: true,
+                },
+                title: {
+                    display: true,
+                    text: 'Pulse Pressure Chart',
+                },
+                tooltip: {
+                    callbacks: {
+                        footer: ((ctx) => {
+                            return bpdata[ctx[0].dataIndex].pulse_pressure_status;
+                        })
+                    }
+                }
+            },
+            scales: {
+                y: {
+                    type: 'linear',
+                    display: true,
+                    position: 'left',
+                    title: {
+                        display: true,
+                        text: 'Pulse Pressure (mmHg)',
+                        color: 'rgba(75, 192, 192, 0.7)',
+                    },
+                    grid: {
+                        color: (context) => {
+                            const gridLineValue = context.tick.value;
+                            if (gridLineValue === 40 || gridLineValue === 50) {
+                                // Highlight the grid line at value 40
+                                return 'rgba(0, 200, 0, 0.8)';
+                            }
+                            if (gridLineValue >= 60 || gridLineValue <= 30) {
+                                // Highlight the grid line at value 60
+                                return 'rgba(255, 0, 0, 0.8)';
+                            }
+                            return 'rgba(171, 171, 171, 1)'; // Default color
+                        }
+                    }
+                }
+            }
+        },
+    })
    </script>
@endscript

```

![Pulse Pressure Chart](https://res.cloudinary.com/dtm8qhbwk/image/upload/v1747072485/blog/pulse_pressure_example_dke7vg.webp)

> Honestly, the charts alone would make for a great blog post! Maybe I should do that?

After putting it all together, we have the following:

![Finished MVP](https://res.cloudinary.com/dtm8qhbwk/image/upload/v1747072485/blog/dashboard_qclhvg.webp)

## Conclusion

All-in-all this was a lot of fun! Would it make for a great SaaS? Nope! I can only imagine how many of these exist already in the wild. But that's not really the point though. This was all about solving a personal need. Oh! And speaking of that. Notice that we have been using _dummy_ data generated by the Factories and not real data. So I made an account, entered my first record and...

![Personal Reading](https://res.cloudinary.com/dtm8qhbwk/image/upload/v1747336501/blog/personal-entry_ltqvyj.webp)

And that's why my doctor was freaking out! I went from having perfect blood pressure to Hypertension Stage 2 in less than a year. I gotta tell ya folks, getting old is rough!

### Room For Improvement

- Of course, refactoring the BloodPressure & PulsePressure Enum classes and related methods. Had a few issues and design mistakes there that I would like to fix.
- Add a feature that would allow for the user to input which arm a given reading was taken. This is called the **Inter-Arm Difference**. If both right and left arms are entered, I could display all four readings easily on the one Blood Pressure chart. Just adjust the alpha value for each arm.
- This would also lead into adding more diagnostic information that we could display to the user.
- You might've noticed that I added a _"Safe Area"_ to the Pulse Pressure chart. Doing this for the Blood Pressure would be far more difficult since it shares two different readings. But maybe find a better way to communicate this _"Safe Area"_ to the user.
- And what would be really top shelf is if I added a feature that facilitated a user uploading data from their _fit tracking devices_ and see how that correlates to their blood pressure over time.