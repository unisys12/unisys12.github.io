---
layout: "layouts/blog.njk"
status: "draft"
title: Lorebot12-86
description: "This is my most popular project. For some reason, it really caught on!"
date: 2024-07-11
tags: ["portfolio", "javascript", "discord", "destiny", "api"]
image: "https://res.cloudinary.com/dtm8qhbwk/image/upload/c_thumb,q_auto,g_face,f_auto,w_200/v1635373637/blog/stock/pexels-markus-spiske-2061168_coxasy.jpg"
image_alt: "A simple header image"
---

# Lorebot12-86

[Repo Link](https://github.com/unisys12/lorebot12-86) _No Longer in Production_

## Project Purpose

8 years ago or so, I was heavily active within the lore community of a video game called Destiny. You might've heard of it! I also had a previous project that saw some success called [Lorebot-ex](lorebot-ex). Anyway, after joining a few different social groups on Discord, I noticed a few patterns develop within the conversations.

- Someone would pose a theory or question and wait on a response.
- The conversation would start fairly slow, but would quickly gain pace, due to the main server I was on had several thousand active users daily.
- When someone would respond, more often than not, they would want to reference a piece of game lore, website, etc to back-up their response.
- The responding user would fetch a link related to their statement, only to find that the conversation had moved so far ahead, their statement was no longer relevant and time was wasted.

I wanted to solve this problem by offering the users a way to enter a quick cmd they could enter, that would link to the resource they wanted. Since the most commonly referenced site for the Destiny Lore Community was [Ishtar Collective](https://www.ishtar-collective.net), I figured I could just parse the users input and return a link to Ishtar based on their input. The very first command I made looked something like this:

```js
let itemCmd = input.startsWith("!item");

if (itemCmd) {
  message.reply(searchItems(input));
}

function searchItems(input) {
  let query = scripts.normalizeItemInput(input.substr("6"));
  return "https://www.ishtar-collective.net/items/" + query;
}
```

And from there, it grew into a massive project that I continued to tinker with for about three yrs after. Up until 2021 I believe. This was before well before support for Async/Await was in Node or JS, so there are `callbacks` everywhere. But I feel that I keep the code base pretty clean for my first large NodeJS based project.

## Tech Used

[NodeJS v14](https://nodejs.org/en)
[DiscordJS](https://discord.js.org/) primarily, but there where a few other things in there as well.
[MochaJS](https://mochajs.org/)
[IstanbulJS](https://istanbul.js.org/)

```json
"dependencies": {
    "axios": "^0.21.1",
    "discord.js": "^12.5.3",
    "mysql2": "^1.1.2",
    "underscore": "^1.13.1"
  },
  "devDependencies": {
    "@babel/cli": "^7.14.5",
    "@babel/core": "^7.4.5",
    "@babel/preset-env": "^7.4.5",
    "@babel/register": "^7.4.4",
    "babel-plugin-istanbul": "^5.1.4",
    "chai": "^3.5.0",
    "cross-env": "^5.2.0",
    "dotenv": "^2.0.0",
    "mocha": "^6.1.4",
    "nyc": "^14.1.1",
    "sinon": "^1.17.7"
  },
```

Yes! There was even a database added not too long after the project took off.

## Proud Moments

The project overall is pretty simple. But! I became addicted to Halo lore as well. So I had to add something in there for that. It was **Today in Halo**. An online friend of mine worked with a team of other Halo addicts and put together a hugh Google Sheet that contained events, ordered chronologically. This sheet spans hundreds of years from the stories of Halo. So, as a surprise to this group, I decided to make a automated post happen each day in our Halo Lore channel that posted an event that happen on the current day within the story of Halo.

This is how it worked:

First, find all the `Guilds`/servers that was running the bot with a specific channel name and place them in an array for later iteration. Then, at a certain time each morning, get the current date info. Pass this to the sheet and filter the results based on the current month and day. If more than one event took place on a given day, pick one at random. Once an event is selected from the list, post a message with data provided by the sheet to each Discord server.

```js
// bot.js
// initialize the bot/client
const Discord = require("discord.js");
const bot = new Discord.Client();

bot.once("ready", function () {
  // Gather all the servers/guilds and channels for each
  let channels = bot.channels;
  let guilds = bot.guilds;
  let halo_channels = [];

  guilds.forEach((x) => {
    // If a Guild/Server is running LoreBot has a '#lore__halo' channel, add it
    let halo_channel = x.channels.find((ch) => ch.name === "lore__halo");

    if (halo_channel) {
      halo_channels.push(halo_channel);
    }
  });

  setInterval(
    function () {
      let timestamp = new Date();

      if (timestamp.getHours() === 14) {
        halo.haloRequest(function (err, motd) {
          if (err) {
            return console.error(err);
          }
          halo_channels.map(function (x) {
            x.send(motd).catch(console.error);
          });
        });
      }
    },
    1000 * 60 * 60,
  );
});
```

And to get the events from the Google Sheet, I did the following:

```js
function haloRequest(cb) {
  sheet.spreadsheets.values.get(
    {
      key: process.env.googleSheetsKey,
      spreadsheetId: process.env.googleSheetID,
      range: process.env.googleSheetRange,
    },
    function (err, response) {
      if (err) {
        return cb(new Error("Error accessing spreadsheet", err));
      } else {
        let rows = response.data.values;
        if (rows.length == 0) {
          return cb(
            new Error("No rows found! Something happend to the spreadsheet!!"),
          );
        } else {
          return cb(null, gatherMessage(rows));
        }
      }
    },
  );
}
```

To see the full process, head over to the projects [commit history](https://github.com/unisys12/lorebot12-86/commit/3af05d167f34cf0209f0e25395ffc77deae49715) and check it out. Pretty gnarly process, but I learned so much through this, since I had to figure out how to do this by myself. Also of note, soon after I launched this, the ESO _(Elder Scrolls Online)_ lore fans wanted something similar, so I did that as well. Works very similarly.

## Lessons Learned

The most important thing I learned from this project was `structure` and _abstraction, just for the sake of abstraction, has no value._

For me to maintain this project, as long as I did, it would not have been possible without a somewhat decent structure. Could it be improved upon? Heck ya! But that should always be the case when you go back to code you wrote 3-5 yrs ago. If not, you haven't grown as a developer.
