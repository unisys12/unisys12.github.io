---
layout: "layouts/blog.njk"
status: "draft"
title: Usage of Enums in Livewire Form
description: "Wanted to test the usability of using native PHP Enums, over database relationships or enums, in forms."
publishDate: 2024-11-27
tags: ["blog", "laravel", "livewire", "forms", "php", "enums"]
image: "https://res.cloudinary.com/dtm8qhbwk/image/upload/c_thumb,q_auto,g_face,f_auto,w_200/v1720813596/blog/stock/nasa--hI5dX2ObAs-unsplash_vk2jwn.webp"
image_alt: "A simple header image"
---

# Native PHP Enums & Enumeration Methods

As I have mentioned in a few other posts of mine, I have this large project I am working on in my spare time. It's a CRM, of sorts, for our non-profit business that we will be using to track the animals in our rescue. Why I am building this and not relying on the countless other solutions available is a post for another day. And one of the many details that I have been spending a great deal of time on is trying to decide how I want to store the animal attributes. Details like - The breed of the animal, the color of it's coat and eyes, patterns, tail, etc. Currently, I have roughly 60 attributes I can track for each animal. Insane... I know!

I have been thinking about this so much because of cost and performance. If I have a form, that is going to have 70 plus input fields, what is the most performant and cost effective way to handle this? My worst nightmare is, adding an animal being the most expensive and frustrating part of the using the app. No matter how small the tables are, 60+ database queries are still 60+ queries. And that will have an impact. I don't know about you, but I would hate to try and manage this. Not to mention that, I _might_ want to turn this into a SaaS product down the road. I know that there are ways to mitigate this by using separate Read and Write Replica connections. But I personally feel that if I am running one instances of my app, I should not have to do that due to the poor performance of my queries being so bloated.

My thought was, why not move all the attributes to native PHP Enums? But that has it's drawbacks as well. What I find, after launch, that I need to add more attribute types. It wouldn't be hard for me to simply add them, but if I do turn this into a SaaS... that would be a requirement. Clients would want to customize most of these to fit their rescue. And that was the moment it hit me. Most of these are not going to ever change or need to be different. Dogs and Cats only have so many types of tails. Or coat types, etc. Take the attributes, such as these, and move those to Enums and the others can stay in the DB as a table. But how would Enums work in a form? I had never used them like that. Just how flexible are they really? Come to find out, _very flexible_!

## Setting Up Our Enum

The first enum I wanted to create, for reasons I will expand on in a few moments, was for Age Groups. An animals lifespan can be broken down into several age groups. Since these groups are split in a standard way, there is little need of someone needing to expand them latter. So let's tackle dogs first, since that's what we work with the most.

`app\Enums\AgeGroup.php`

```php
<?php

namespace App\Enums;

// Puppy: Up to One year of age
// Adolescent: One to less than three years old
// Young adult: Three to less than seven years old
// Older adult: Seven to less than 11 years old
// Senior: 11 years or older

enum AgeGroup: string
{
    case Puppy = "Puppy";
    case Adolescent = "Adolescent";
    case Young_Adult = "Young Adult";
    case Older_Adult = "Older Adult";
    case Senior = "Senior";
}
```

I decided to use Backed Enums, since I will want to display the names without needing to perform any sort of string manipulation later. Now that we have our enum created, let's try to use it in our Livewire Component. All I want to do is populate a `select` element. That's it!

## Populating a Select Element using a Enum

First we need to create our property, `age_groups` and associate it with the appropriate enum class.
`app\Livewire\CreateAnimal.php`

```php
<?php

namespace App\Livewire;

use App\Enums\AgeGroup;
use App\Livewire\Forms\AnimalForm;
use Livewire\Attributes\Computed;
use Livewire\Component;

class CreateAnimal extends Component
{

    public AnimalForm $form;
    public $age_groups;

    public function mount()
    {
        $this->age_groups = AgeGroup::cases();
    }

    public function render()
    {
        return view('livewire.create-animal');
    }
}
```

Next will will add our select element to the component.

```html
<form wire:submit="store">
  <div>
    <label for="age_group">Age Group</label>
    <select name="age_group" wire:model="form.age_group">
      <option value=""></option>
      @foreach ($this->age_groups as $group)
      <option value="{{ $group->value }}">{{ $group->value }}</option>
      @endforeach
    </select>
  </div>
</form>
```

Now that we know this works... I actually don't want to use this now. I will use it for other elements, just not this example. The reason is because the age groups are separated by the animals age. And the very next field that I will be adding to the form is a date-picker for the animals birthday. If I have the birthday, I can determine the animals age, and from that I can determine the age group automatically. Why not do that? This form is already very large, so if we can remove a few fields to make it even slightly smaller, I think that would be a good thing.

## Using Enumeration Methods

To determine the dogs appropriate age group, I can add a method to the enum class that will do just that. This allows all logic for an animals age group to live in one place.

`app/Enums/AgeGroup.php`

```php
<?php

namespace App\Enums;

enum AgeGroup: string
{
    case Puppy = "Puppy";
    case Adolescent = "Adolescent";
    case Young_Adult = "Young Adult";
    case Older_Adult = "Older Adult";
    case Senior = "Senior";

    /**
     * Determine the age group based on the age of the animal
     * by passing the year of age.
     *
     * ex: `AgeGroup::getGroup(4) // Young `
     */
    // [!code highlight:12]
    public static function getGroup(int $age): string
    {
        return match (true) {
            $age < 1 => static::Puppy->value,
            $age >= 1 && $age < 3 => static::Adolescent->value,
            $age >= 3 && $age < 7 => static::Young_Adult->value,
            $age >= 7 && $age < 11 => static::Older_Adult->value,
            $age >= 11 => static::Senior->value,
            default => "No Match Found!"
        };
    }
}
```

As you can see, in the example above, all we need to do is pass in the number of years old the animal is and this enum method will return a string that represents the age group. Now, determining the animals age is not that difficult. We can utilize Carbon for that and pass the results to the new method above. This is perfect spot to utilize [Livewire Computed Properties](https://livewire.laravel.com/docs/computed-properties) within our component.

`resources/views/livewire/create-animal.blade.php`

```html
<div>
  <input
    type="date"
    name="birthdate"
    id="birthdate"
    wire:model.blur="form.birthdate"
  />
</div>
```

Notice in the date element above, I am using `blur` on the binding of the model. This allows us to update the form property `birthdate` when we remove focus of the element, not on form submission. In turn, this allows the age_group property to update, live.

`app/Livewire/CreateAnimal.php`

```php
#[Computed]
public function getAgeGroup()
{
    $birth = Carbon::createFromDate($this->form->birthdate);
    $age = $birth->diffInYears();
    $this->form->age_group = AgeGroup::getGroup($age);
}
```

Now we just need some way to call this computed property above, and this took the most time to figure out. Technically, your supposed call this method within your Livewire component class. But in this case, I need to call it when the form.birthdate property is updated. Thinking about it now, I could dispatch an event on change by adding a bit of javascript that ties it all together. But, this is what I came up with in the meantime.

```html
<div>
  <x-input
    label="Age Group"
    description="Will be auto-populated by birthdate..."
    placeholder="{{ $this->getAgeGroup }}"
    wire:model="form.age_group"
    disabled="true"
    readonly="true"
  />
</div>
```

> **Note**: Notice that I am calling the computed property method on the placeholder of a disabled element. _I don't think this would be considered an approved way of doing this. Try it at your own risk!_

This is more for testing purposes, just to see if it works correctly and it does! Submitting the form passes the data along nicely. In practice though, I would use a hidden element so that I can actually remove it from the view completely. By the way, this is a [WireUI Input Component](https://wireui.dev/components/input), which I will be using throughout the project. By setting the `disabled` property to `true`, as well as the `readonly` property to `true`, we remove the possibility that the user might change this value to something unexpected. The placeholder attribute of the element itself is not rendered in the DOM that I can see.

## Summary

This project currently has 19 enums for different animal attributes, with more to added as I progress through the project, and I cannot wait to play with others. Most of them will not require such things as this, but that's fine.

## Update

I have to be honest here. This feels like some kind of super power! I used the above method on another element combo and it just works.
