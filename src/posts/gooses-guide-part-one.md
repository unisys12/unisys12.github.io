---
layout: "layouts/blog.njk"
status: "draft"
title: "Gooses Guide - Part One"
description: "Recreating and improving a really old project."
publishDate: 2024-11-06
tags: ["blog", "laravel", "flat files", "php"]
image: "https://res.cloudinary.com/dtm8qhbwk/image/upload/c_thumb,q_auto,g_face,f_auto,w_200/v1720813611/blog/stock/vincentiu-solomon-ln5drpv_ImI-unsplash_ihdhru.jpg"
image_alt: "A simple header image"
---

# Goose's Guide

This will be a three part series on handling marginally complex data structures in an application environment. Part One will simply read the data from a flat file. Performing all queries directly on the flat file. No databases or ORMs will be used. Part Two will use a rudimentary database structure without the use of relationships. Finally, part three will utilize relationships and more advanced methods of data abstraction.

Timing and analytics will attempt to be monitored, logged or tracked so that comparisons can be made between each of the methods.

## A little about the data

Back when I serviced copiers for a local office equipment dealer, we were passed down a technical resource called the "Gooses Guide". No, I don't know why it was called that. But it was a spreadsheet that contained 4 columns of information. "Product Family", "Problem Description", "Solution Text" & "Date". Each column had a `ComboBox` at the in the first row, which allowed you to filter the sheet based on your selection. For the technicians, it was a life saver. Well, if nothing else, it was time saver.

After a few years at the local dealer, I decided that I would make a web based version of the tool and place on our company website. This way, would could easily access it from our phones _(Blackberries!)_ while in the field. It was very rudimentary, but it worked! I always wanted to make it better or at the very least, make it easier to update, but I never got around to it. Also, there was no way for us to add information or solutions to it.

> A working example can be seen on the original site [here](http://raycocopiers.com/goosesguide)

My old workflow for updating the data was: Each quarter, a new file was released. I would save this as a CSV and manually import it into our hosted MySQL database. It was a pain!

Usage on the site, like I mentioned before, was very rudimentary. There is a basic form with a single `select` element that allows you to select the product family/code. The page refreshes to show a list of problems for that product, within a single select element. After choosing a problem, the page refreshes to show all solutions available.

Given all that, let's move on and first re-create the old app. From there, we will progressively add functionality to the app. The tech stack we will be using will be PHP v8.3 for the language, Laravel v11 for the framework, Tailwind v3 for the CSS. Later, we will add SQLite 3 as the database and Livewire v3 to the Laravel app for filtering and a bit of creativity... maybe. For each of these stages, I will add [Laravel Debug Bar](https://github.com/barryvdh/laravel-debugbar) just as a means of gathering some stats on the page loads from the server, query performance, etc. By no means is this going to be a detailed breakdown of performance metrics. Just a 10,000 view and only to see if our code architecture choices have an impact on performance.

## Part One

<sub>Read data directly from flat file</sub>

The flat file we will be using is not going to be a CSV this time around. In previous attempts working with on this project, I found that CSV is not the best option here. So, I converted the spreadsheet to a TAB Delimited file. The file was littered with variously placed line-break (`\n`) and return (`\r`) characters. This was due to `word-wrap` being applied to the cells. It would have been impossible to remove these programmatically and maintain a usable format. The easiest solution was to simply select all the cells and remove `word-wrap`. I actually had to do this twice. Now, we have a much cleaner document to work with. Aside from the very last entry... haven't looked into that yet _(EDIT: It was a missing problem description)_. Don't worry! There are over 50k entries in the file. We have plenty to work with.

### Assembling the Product Codes

Since we will be reading a flat file here, it should be fairly straight forward for us to simply read the file and return it's contents. We use php's `file_get_contents` for that, which will return a single string for us to work with.

We know that we are going to be fully refactoring this, let's start out with the simplest solution and perform most of our coding in the `routes\web.php` file. We will abstract any code that interacts with the flat-file into a helper class, to keep things a bit cleaner.

Checking the output of `file_get_contents` on our flat-file:

```shell
A019/A045/A046\t"DEAD MACHINE, NO OPERATION"\t"[dead machine, no display or fans] - power supply"\t4/4/2008\n
```

From the output above, we know that we can use `explode("\n", $file)` to gain access to each row. Explode returns an array so we will next loop through that and use explode again, this time passing `"\t"` as our separator. This will gain us access to each row and column.

Here is our helper class to the get the results above.

```php
<?php

namespace App\Helpers;

class GoosesGuideHelper
{
    public string $path;
    public array $guide = [];

    function __construct(string $path)
    {
        $this->path = $path;
    }

    public function getAll(): array
    {
        $file = file_get_contents($this->path);

        $rows = explode("\n", $file);

        foreach ($rows as $row) {
            $column = explode("\t", $row);
            array_push($this->guide, $column);
        }

        return $this->guide;
    }
}
```

... in our routes file, we have...

```php
Route::get('/', function () {
    $guide = new GoosesGuideHelper(asset('GG_2014_2.txt'));

    dd($guide->getAll());
    return view('welcome');
});
```

```shell
array:50315 [▼ // routes\web.php:9
  0 => array:4 [▼
    0 => "A019/A045/A046"
    1 => ""DEAD MACHINE, NO OPERATION""
    2 => ""[dead machine, no display or fans] - power supply""
    3 => "4/4/2008"
  ]
  1 => array:4 [▶]
```

Before we start putting these results to work for us, we two problems to deal with.

- There is a lot of duplication in the results that need to remove.
- Some text is surrounded by two sets of double quotes.

To tackle the first one, we will create a new method and refactor our method call to reflect the new method we create to solve this.

```php
<?php

namespace App\Helpers;

class GoosesGuideHelper
{
    public string $path;
    public array $codes = [];
    public array $problems = [];
    public array $solutions = [];
    public array $guide = [];

    function __construct(string $path)
    {
        $this->path = $path;
    }

    public function getAll(): array
    {
        $rows = $this->getRows();

        foreach ($rows as $row) {
            $column = explode("\t", $row);
            array_push($this->guide, $column);
        }

        return $this->guide;
    }

    private function getRows(): array
    {
        $file = file_get_contents($this->path);

        return explode("\n", $file);
    }

    public function getCodes(): array
    {
        $rows = $this->getRows();

        foreach ($rows as $row) {
            $column = explode("\t", $row);
            array_push($this->codes, $column[0]);
        }

        // removes duplicates from the array
        $codes = array_unique($this->codes);

        // from <50k to 220 entries
        return $codes;
    }
}
```

Now, we can actually put this to use. Since all we need on the product selection code is the codes and nothing else, we will only return the codes.

Update our route to actually return the view, with the variable that holds our product codes.

```php
$guide = new GoosesGuideHelper(asset('GG_2014_2.txt'));

$codes = $guide->getCodes();
return view('welcome')->with('codes', $codes);
```

Then put to work in a that view

```html
<x-layout>
  <form action="/problem" method="get">
    <label for="code" class="block">
      Select a Product Code:
      <select name="product_code" id="product_code">
        <option value=""></option>
        @foreach ($codes as $code) {
        <option value="{{ $code }}">{{ $code }}</option>
        } @endforeach
      </select>
    </label>
    <button
      class="py-2 px-4 mt-2 bg-blue-500 hover:bg-blue-600 border border-cyan-950 hover:border-cyan-950/50 hover:text-slate-200 transition-colors duration-300 rounded-md"
      type="submit"
    >
      Select Product Code
    </button>
  </form>
</x-layout>
```

### Fetching the associated Problem Descriptions

We can't just copy and paste our previous code over to get all our problem descriptions, because we only need to fetch the problems that are associated with the product code selected in the previous view. Since we are sending a get request, we can use the Laravel `Request` support facade to help us grab that in our routes file.

```php
Route::get('/problem', function () {
    dd(Request::get('product_code'));
});
```

We can pass this to a new helper method that will filter everything for us. Like so.

```php
$code = Request::get('product_code');
$guide = new GoosesGuideHelper(asset('GG_2014_2.txt'));

$problems = $guide->getProblems($code);

dd(count($problems));
```

We know it is working, since all unique problems originally totaled 2250 and that number is down to 13.

This is new method `getProblems` that we added to our GoosesGuideHelper class.

```php
public function getProblems(string $code): array
{
    $rows = $this->getRows();

    // remove the last row due to it is missing a problem description
    array_pop($rows);

    foreach ($rows as $row) {
        $column = explode("\t", $row);
        if ($column[0] == $code) {
            array_push($this->problems, $column[1]);
        }
    }

    $problems = array_unique($this->problems);
    sort($problems);

    return $problems;
}
```

Now, we just need to filter this down further to where we have only the solutions for a given product code and it's selected problem description. Doing so is pretty simple though...

```php
public function getSolutions(string $prob, string $code)
{
    $rows = $this->getRows();
    foreach ($rows as $row) {
        $column = explode("\t", $row);
        if ($column[0] == $code && $column[1] == $prob) {
            array_push($this->solutions, $column[2]);
        }
    }

    return $this->solutions;
}
```

Our route looks like so...

```php
Route::get('/solutions', function () {
   $prob = Request::get('problem');
   $code = Request::get('code');
   $guide = new GoosesGuideHelper(asset('GG_2014_2.txt'));
   $solutions = $guide->getSolutions($prob, $code);

   return view('solutions')
       ->with('solutions', $solutions)
       ->with('prob', $prob)
       ->with('code', $code);
});
```

...and finally, our view

```html
<x-layout>
  <div class="grid place-items-center">
    <header>
      <a href="/">Home</a>
      <h2 class="text-2xl">{{ $code }}</h2>
      <p>{{ $prob }}</p>
    </header>
    @if (count($solutions) > 1)
    <div class="grid max-w-screen-lg mx-auto gap-10 mt-16 px-5">
      @foreach ($solutions as $text )
      <div
        class="flex gap-4 items-start flex-row p-5 shadow-lg hover:shadow-md transition-all duration-300"
      >
        <div>
          <p class="mt-1 text-gray-500">{{ $text }}</p>
        </div>
      </div>
      @endforeach
    </div>
    @else
    <div class="flex gap-2 p-4 shadow-lg hover:shadow-md">
      <p>{{ $solutions[0] }}</p>
    </div>
    @endif
  </div>
</x-layout>
```

Actually, this is not all that bad as far as performance goes.

![Laravel Debug Bar with metrics](https://res.cloudinary.com/dtm8qhbwk/image/upload/v1730935048/blog/gg_part1_finish_cgrslu.jpg)

That's 130ms boot time for the app, followed by 122ms for the application code to run. Total application time is 253ms using 17mb of memory. I gotta admit, I was really expecting far worse. This varies by a fairly wide margin though. I've got some results for total application time below 150ms. Just depends on the amount of returns really.

All in all, even though my code could be cleaned up a bit more _(probably)_ this is very usable. Heck, it's how I should've done it before really. I would actually like to do this same example something like Slim. Uhm!

In part two, I will refactor this to use SQLite 3 and query the DB instead of just reading from a flat-file.
