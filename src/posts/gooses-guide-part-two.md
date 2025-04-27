---
layout: "layouts/blog.njk"
status: "draft"
title: "Gooses Guide - Part Two"
description: "Recreating and improving a really old project with SQLite."
publishDate: 2024-11-16
tags: ["blog", "laravel", "sqlite", "php"]
image: "https://res.cloudinary.com/dtm8qhbwk/image/upload/c_thumb,q_auto,g_face,f_auto,w_200/v1720813611/blog/stock/vincentiu-solomon-ln5drpv_ImI-unsplash_ihdhru.jpg"
image_alt: "A simple header image"
---

> ## Part Two
>
> Use a sqlite database with no relationships

- id (int)
- product_code (string)
- problem_description (string)
- resolution_description (string)
- date (string)

To get started, we first need to create our migration file and migrate our database. Next we will create our seeder and seed the database. Finally, we will wire up our views.

### Migration

To generate our migration, we will use `artisan`, like so:

`php artisan make:model GoosesGuide -ms`

The above command will stub out our Eloquent modal _(so that we can query the db)_, our migration file and a seeder. To the migration file!
`database/migrations/2024_11_14_013252_create_gooses_guides_table.php`

```php
<?php

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
        Schema::create('gooses_guides', function (Blueprint $table) {
            $table->id();
            $table->string('product_code');
            $table->string('problem_description');
            $table->string('resolution_description');
            $table->string('date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gooses_guides');
    }
};
```

After a quick migrate, we can turn to our seeder and get to work.

### Seeder

Much like in Part One, we will read our TAB Delimited file and use `explode()` to extract our columns and rows. Then perform our seeding/inserts into the `gooses_guides` table that we just created.

`database/seeders/GoosesGuideSeeder.php`

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class GoosesGuideSeeder extends Seeder
{
    public array $guide = [];
    protected array $codes = [];
    protected array $problems = [];
    protected array $resolutions = [];
    protected array $date = [];
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $file = file_get_contents(asset("GG_2014_2.txt"));

        $rows = explode("\n", $file);

        array_pop($rows);

        foreach ($rows as $row) {
            $columns = explode("\t", $row);
            DB::table('gooses_guides')->insert([
                'product_code' => $columns[0],
                'problem_description' => $columns[1],
                'resolution_description' => $columns[2],
                'date' => $columns[3]
            ]);
        }
    }
}
```

```shell
C:\Users\unisy\Herd\goosesguide>php artisan db:seed

   INFO  Seeding database.

  Database\Seeders\GoosesGuideSeeder ......................................................................... RUNNING
  Database\Seeders\GoosesGuideSeeder ................................................................. 254,173 ms DONE
```

As you can see, it took quite a bit of time to seed the database on my system. It's pretty old, but still. Remember, this file contains just over 50,000 rows of data. Just over 4 minutes to seed a database is pretty intense and not exactly something you would want to do on just any host. Something to keep in mind. The size of the newly created SQLite database is now just over 5MB.

As we discussed in Part One of this series, there is a lot of duplicate data in this file. That duplication is just part of dealing with this type of data.

### Routing, Views and Controllers... Oh my!

Instead of simply using the Router to perform all our logic, this time we will use controllers. More specifically, we will be using a feature in Laravel called ['Single Action Controllers'](https://laravel.com/docs/11.x/controllers#single-action-controllers) or Invokable Controllers. Since our project will have three views, there will be 3 controllers and a route for each one.

### Views

Let's get our views sorted a bit first. At the very least, let's get some foundational things out of the way so that we can start getting data in these views.

**Layouts**

Laravel uses their own template engine, called Blade. It has a ton of features, much like every other engine out there today. But what we are worried about is setting up a layout that can be extended to each of the views for our project. To do that, we create a new folder titled `_components_` in our views folder. Inside the new `_components_` folder, we can create a file titled `layout.blade.php`. To start, this is what we will place in this layout file.

`resources/views/components/layout.blade.php`

```html
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>Laravel</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net" />
    <link
      href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap"
      rel="stylesheet"
    />

    <!-- Styles / Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
  </head>
  <body class="font-sans antialiased dark:bg-black dark:text-white/50">
    <div
      class="bg-gray-50 text-black/75 dark:bg-black dark:text-white/50 grid place-items-center"
    >
      {{ $slot }}
      <nav>
        <a href="/goosesguide">Gooses Guide</a>
      </nav>
    </div>
  </body>
</html>
```

We are loading our web font, css and getting some basic styling down for us to work with. Nothing fancy! _(we stole most of this from the welcome view that comes with a fresh install on Laravel)_ The `{{ $slot }}` element is where we will be injecting HTML into this layout. To access our root directory/welcome view, we just remove everything in `resources\views\welcome.blade.php` and replace it with:

```html
<x-layout>
  <h1 class="text-3xl text-slate-700 text-center">Gooses Guide Project</h1>
</x-layout>
```

Now that we have a basic view structure in place, we can get to work on our first controller and setting up our first route.

`resources/routes/web.php`

```php
<?php

++ use App\Http\Controllers\ProblemSelection;
use App\Http\Controllers\ProductSelection;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/goosesguide', ProductSelection::class); // [!code ++]
```

**Controllers**

To create a Single Action Controller, we simple pass the `--invokable` parameter to the `make:controller` command.

`php artisan make:controller ProductSelectionController --invokable`

Inside of our single method, we need to query the database for each of the available `product_codes` and pass them to the view so that we can display them as options in a select element.

`app/controllers/ProductSelectionController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\GoosesGuide;
use Illuminate\Http\Request;

class ProductSelection extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $codes = GoosesGuide::all()->unique('product_code');
        return view('gooses-guide.product-selection', compact('codes'));
    }
}
```

Notice that we make use of the `unique()` method, to only grab a single instance of each product code in the database. The query for `$codes` take _86.02ms_ to complete. What if we use the Query Builder instead? Changing our query to

```php
$codes = DB::table('gooses_guides')->distinct()->get('product_code');
```

gets the query execution time down to _16.54ms_. That's a hugh savings!! **SOLD!**

`resources/views/gooses-guide/product-selection.blade.php`

```html
<x-layout>
  <h1 class="text-3xl text-slate-700">Product Selection</h1>

  <form action="" method="get">
    <label for="" class="block font-medium text-slate-700/75"
      >Select a Prodcut Code:</label
    >
    <select
      name="product_code"
      id="product_code"
      class="border border-gray-600 rounded-sm"
      required
    >
      <option value=""></option>
      @foreach ($codes as $code)
      <option value="{{ $code->product_code }}">
        {{ $code->product_code }}
      </option>
      @endforeach
    </select>
    <button class="block py-2 px-3 mt-4 bg-blue-500 text-slate-100 rounded-md">
      Select
    </button>
  </form>
</x-layout>
```

You may notice that I did not pass the `id` to the value attribute of each option element. This would be the preferred way of doing this. That way when the form is submitted, the value/id of the selected product would be passed to the next method by way of the Request class. We cannot do that hear for two reasons.

1. When performing the query, we are using `DISTINCT` to grab the unique product codes from the DB. If we pass the id to the `SELECT` method, it simply ignores the distinct() and performs a basic `SELECT * from 'gooses_guides'` query. I even tried using the `addSelect()` method, but it simply returned the same result.

```php
$query = DB::table('gooses_guides')->select('product_code')->distinct();
$codes = $query->addSelect('id')->get();
```

To work around this, I would have to query all and then pass the collection returned to `unique()`, like I did previously, to end up with an object that only contains the "id" & "product\*code". Query time for that is about _58ms_. **NOPE!**

2. Come to find out, after working on this for about 10 mins, I realized that I will not need the ID's after-all. I cannot query the data using the ID's, since there is not relationships and each ID represents an entire row of data. I would need to query all problem_descriptions for a given product_code. Which will look more like this, using the Query Builder.

```php
$problems = DB::table('gooses_guides')
    ->select('problem_description')
    ->where('product_code', $code)
    ->get();
```

This also means that we will need to go back and add an INDEX to our table for the `product_code` & `problem_description` columns. Wonder if that will increase performance of the query very much? It turns out that it does. Query performance went from _16ms_ to _5ms_. **AWESOME!**

### Problem Selection

`app/Http/Controllers/ProblemSelection.php`

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProblemSelection extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $problems = DB::table('gooses_guides')
            ->select('problem_description')
            ->distinct()
            ->where('product_code', $request->product_code)
            ->groupBy('problem_description')
            ->get();

        return view('gooses-guide.problem-selection', compact('problems'));
    }
}
```

Given that we have placed an index on the `problem_description` column, our query times here are between _1-2ms_, depending on the amount of returns. We could go all out here and validate in the

`resources/views/gooses-guide/problem-selection.blade.php`

```html
<x-layout>
  <h1 class="text-3xl text-slate-700">Problem Selection</h1>
  <form action="/goosesguide/resolution" method="get">
    <input type="text" name="code" value="{{$code}}" hidden />
    <label for="" class="block font-medium text-slate-700/75"
      >Select a Problem for the <span class="text-lg">{{ $code }}</span>:</label
    >
    <select
      name="problem_description"
      id="problem_description"
      class="border border-gray-600 rounded-sm"
      required
    >
      <option value=""></option>
      @foreach ($problems as $problem)
      <option value="{{ $problem->problem_description }}">
        {{ $problem->problem_description }}
      </option>
      @endforeach
    </select>
    <button class="block py-2 px-3 mt-4 bg-blue-500 text-slate-100 rounded-md">
      Select
    </button>
  </form>
</x-layout>
```

You might notice that I added a hidden input element in the above form. This is so that we can pass along the product code selected previously and use it in our next query.

`resources/routes/web.php`

```php
<?php

++ use App\Http\Controllers\ProblemSelection;
use App\Http\Controllers\ProductSelection;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/goosesguide', ProductSelection::class);
Route::get('/goosesguide/problem-selection', ProblemSelection::class); // [!code ++]
```

### Resolutions Display

To display our list of resolutions to the user it's a matter of rinse and repeat.

`app\Http\Controllers\Resolution.php`

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Resolution extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $code = $request->code;
        $problem = $request->problem_description;
        $resolutions = DB::table('gooses_guides')
            ->select('resolution_description')
            ->where('product_code', $code)
            ->where('problem_description', $problem)
            ->get();
        return view('gooses-guide.resolution', compact('problem', 'code', 'resolutions'));
    }
}
```

`resources/views/gooses-guide/resolution.blade.php`

```php
<x-layout>
    <h2 class="text-1xl text-slate-700 text-center mb-4">Resolutions for <span class="text-xl text-slate-900>"> {{ $problem }} on a {{ $code }}</span></h1>

    <div class="grid grid-rows gap-4 place-items-center">
        @foreach ($resolutions as $resolution)
        <div class="bg-slate-200/90 border border-black/50 shadow-md hover:shadow-sm rounded-sm p-4 max-w-lg max-lg:max-w-sm">
            {{ $resolution->resolution_description }}
        </div>
    @endforeach
    </div>
</x-layout>
```

And last but not least, the route that glues it all together...

`routes/web.php`

```php
<?php

use App\Http\Controllers\ProblemSelection;
use App\Http\Controllers\ProductSelection;
use App\Http\Controllers\Resolution;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/goosesguide', ProductSelection::class);
Route::get('/goosesguide/problem-selection', ProblemSelection::class);
++ Route::get('/goosesguide/resolution', Resolution::class);
```

I gotta say. This turned out way better than what I thought it would. Each query is finishing in less than a _ms_ now. Pretty cool! But our next iteration of this project will be to use relationships and trim up the database size. Although it's currently not a issue, if database size or OCD is a real issue, then relationships are the way to go here.
