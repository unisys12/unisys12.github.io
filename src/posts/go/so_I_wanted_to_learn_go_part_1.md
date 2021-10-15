---
layout: 'templates/postTemplate.njk'
title: 'Learning Golang Part 1'
tags: posts, go
excerpt: 'So, I wanted to learn Go!'
---

# {{ title }}

![Placeholder Image](https://res.cloudinary.com/dtm8qhbwk/image/upload/c_fit,q_auto,w_800/v1633697298/blog/stock/kevin-ku-w7ZyuGYNpRQ-unsplash_qsnklf.jpg)

For a few years now, I have been on the fence about learning either [Go](https://golang.org/) or [Rust](https://www.rust-lang.org/). Both are very interesting and offer a whole new world of development that I've never experienced. It would also open me up to developing software, not just for the web, but for desktop. They are both languages that operate _very close to the metal_, as they say, which I am not overly familiar with. Other languages such as [C++](https://docs.microsoft.com/en-us/cpp/cpp/?view=msvc-160), [Kotlin](https://kotlinlang.org/) and even [Crystal](https://crystal-lang.org/) are fairly similar and offer similar promises. But why/how did I narrow my list to just two languages? It was pretty simply really. And although it was a simply process, it took awhile for me to settle on just one.

What I tend to do the most though is create these small one-off type applications that either solve a single problem or help with a given task. Discord Bots, Chrome Extensions and every now and then, a full blown fullstack CMS. And I recently had an idea for a new cli project that I felt would be a perfect fit for either of the above mentioned languages.

## Narrowing the field

This was the simple part. I just had to ask myself the question, "How comfortable is the language and it's tooling to use?". Given that most of my experience is with web technologies, I would assume that the main portion of my time would be spent there. I had no real _need_ to create desktop specific applications. And if we are being honest with ourselves, that _need_ disappeared a long time ago. But comfort was key, at the end of the day. So let's go through the list real quick.

### C++

I knew that I was not going to be comfortable with C++ due to the fact that it would be like buying a backhoe to plant a shrug in our front flower bed. C++ is a great language and serves many horizontals within the tech and game industry very well. But for a fairly simple to complex CLI app... nah. Pass!

### Kotlin

Ok, I have zero experience with Kotlin itself. I do have some Java experience, but I know it would not be fair to just lump the two in one package. Java, like C++, would be massive overkill. Kotlin is not Java, per say. But the way I view Kotlin is - it's like saying, "Python is not enough and I need just a little more. Java is overkill!" Is that fair? Probably not, but it does seem to be a bit of more than what is required.

### Crystal

I've been interested in Crystal for a while as well. Not as long as Go or Rust, but yeah. It's been on my radar. And really, Crystal would be a good fit for this project and actually closer to Rust and Go than the other two languages.

## The Contenders

Now that I have a list of three languages, all of which are pretty similar on the surface, it's time to narrow it a bit further and start playing around with all three. Finally, pick the one I like the most. Or makes me comfortable.

So, to get an idea of which one I will choose, I need to create a few exercises that cover the main working components of the project I am going to be creating. That will consist of the following actions:

- Making API requests
- Parse the returned JSON response from the API
- Format the parsed JSON into a displayable format

For the sake of keeping these exercises simple, we will stick to parsing JSON and working with strings.

### Crystal

Follow the [getting started](https://crystal-lang.org/reference/getting_started/index.html) section on their website for your platform. I'm on Windows 10 and using Ubuntu through WSL2.

```shell
unisys12@DESKTOP-3LSQHQ2:~/projects/crystal-strings$ crystal --version
Crystal 1.1.1 [6d9a1d583] (2021-07-26)

LLVM: 10.0.1
Default target: x86_64-unknown-linux-gnu
```

They even have a CLI example app that we can work through. Sweet! Let's follow along!

helper.cr

```crystal
require "option_parser"

OptionParser.parse do |parser|
  parser.banner = "Welcome to our test CLI app!"

  parser.on "-v", "--version", "Show version" do
    puts "version 0.0.1"
    exit
  end

  parser.on "-h", "--help", "Show help" do
    puts parser
    exit
  end
end
```

```shell
unisys12@DESKTOP-3LSQHQ2:~/projects/crystal-strings$ crystal run ./help.cr -- -h
Welcome to our test CLI app!
    -v, --version                    Show version
    -h, --help                       Show help
unisys12@DESKTOP-3LSQHQ2:~/projects/crystal-strings$ crystal run ./help.cr -- -v
version 0.0.1
```

Now, let's strike out on our own and parse some JSON! So, create another file and call it whatever you want.

cli-parser.cr

```ruby
require 'option_parser'

people = {
  "person_1": { "name": 'Bradly', "email": 'somethingspecial@nowhere.com' },
  "person_2": { "name": 'Tammy', "email": 'moreorlessbetter@nowhere.com' }
}

OptionParser.parse do |parser|
  parser.banner = 'Welcome to our CLI Parser Application'

  parser.on '-n', '--name', 'Display the persons name' do
  end
end
```
