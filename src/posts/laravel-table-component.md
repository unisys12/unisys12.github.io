---
layout: "layouts/blog.njk"
status: "draft"
title: Making a Laravel Table Component
description: "Working on a project and have a need for several tables. So I wanted to see if I could make a component, using Laravel Blade only, to generate the table for me after passing it the results of a Eloquent query."
publishDate: 2024-11-27
tags: ["blog", "laravel", "components", "tables", "html"]
image: "https://res.cloudinary.com/dtm8qhbwk/image/upload/c_thumb,q_auto,g_face,f_auto,w_200/v1720813596/blog/stock/nasa--hI5dX2ObAs-unsplash_vk2jwn.webp"
image_alt: "A simple header image"
---

# Making a Laravel Table Component

It's not that I hate making tables or that tables are hard. But when I have several tables to make, I tend to become emotionally drained. Not sure why. But it dawned on me, "That's what components are for!". If you have a lot of repeating mark-up across your site, place that into a component and pass it the data. So let's do that!

## Table Component

There are few caveats that we need to keep in mind when doing this. Giving a bit of thought to this, dynamically generating a `table` element can be very simple or very complex. We need to be able to call our component, pass it some data and boom! How do we want this to look? Ideally, I would like for it to look similar to this:

`<x-table :data='$data' />`

Seems doable and a decent starting point. By the way, we will _not_ be using Livewire. Not because I don't like it, but to challenge myself to make a fairly complex native Laravel component.

We need to remember that there are 9 primary parts to a table.

- `<caption>` \*
- `<thead>` \*
- `<colgroup>`
- `<col>`
- `<th>` \*
- `<tbody>` \*
- `<tr>` \*
- `<td>` \*
- `<tfoot>`

To keep this components first iterations scope in check, I say we skip trying to implement `colgroup`, `col`, and `tfoot`. These could be a bit more difficult to implement and take more time to work-out all the details. So our new table component will only be able to support simple table layouts for now.

## Creating the component

`php artisan make:component TableComponent`

We now have two new files in:
`app\View\Components\TableComponent.php`, which is our component class.
`resources\views\components/table-component.blade.php` which is where our html will live.

We know that we will be passing the data to the component class, so let's set that up and make sure that we can pass it to the view portion of the component.

`component class`

```php
<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class TableComponent extends Component
{
    /**
     * Create a new component instance.
     */
    public function __construct(
        public array $cellData
    ) {}

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.table-component');
    }
}
```

Next, let's call our component on a page and pass it some data.

`component view`

```html
<div>
  <table>
    <thead>
      <tr>
        {{-- WORK IN PROGRESS --}}
      </tr>
    </thead>
    <tbody>
      @foreach ($cellData as $row)
      <tr>
        @foreach (collect($row) as $cell)
        <td class="px-4">{{ $cell }}</td>
        @endforeach
      </tr>
      @endforeach
    </tbody>
  </table>
  {{ $cellData }}
</div>
```

Notice we have two `foreach` loops in play here. The first one to generate each of the needed rows, based on the number of items returned. And the second one is to generate each of the cells. Since the data is basically a string after the first loop, we pass the result to the next foreach using the `collect()` method, which turns it into a Collection object. This allows us to loop over this next level. The padding added the each cell is merely there to space out each cell on the page.

And using the component in a view file would look like:

```html
<x-layout>
  <x-table-component :cell-data="$journals" />
</x-layout>
```

In the above example, we are returning a Eloquent query, `$journals` from our JournalControllers index method. And the result looks like this.

`rendered html`

```html
<table>
  <thead>
    <tr></tr>
  </thead>
  <tbody>
    <tr>
      <td class="px-4">1</td>
      <td class="px-4">12</td>
      <td class="px-4">2024-11-25T23:03:04.000000Z</td>
      <td class="px-4">2024-11-25T23:03:04.000000Z</td>
    </tr>
  </tbody>
</table>
```

In theory, it works. But what about the `thead`?

## Tackling the Table Head

Since the collections returned from an Eloquent query are stripped of their keys. This means that we do not have access to them in our view. One thing we could do is send the keys in separately, as a new variable, and pass them to the component.

`<x-table-component :cell-data="$journals" :thead="$keys" />`

We can do this, like so:

```php
public function index()
{
    $journals = Journal::all();
   $keys = collect($journals->first())->keys()->all(); // [!code ++]

    return view('journal.index', compact('journals', 'keys'));
}
```

`rendered output`

```html
<table>
  <thead>
    <tr>
      <th class="uppercase">id</th>
      <th class="uppercase">animal_id</th>
      <th class="uppercase">created_at</th>
      <th class="uppercase">updated_at</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="px-4">1</td>
      <td class="px-4">12</td>
      <td class="px-4">2024-11-25T23:03:04.000000Z</td>
      <td class="px-4">2024-11-25T23:03:04.000000Z</td>
    </tr>
  </tbody>
</table>
```

But this has one glaring problem! How would I handle relationships?

- What if the data we are displaying contains relationships? It currently has no way to know that.
- If I wanted to aggregate data from the relationship and display the results? I cannot currently do that.

For plan tables, this method works just fine. But anything else... not gonna work. So, we have work to do.
