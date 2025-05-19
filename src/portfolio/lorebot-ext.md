---
layout: "layouts/blog.njk"
status: "draft"
title: "LoreBotExt"
description: "A Chrome browser extension to display in-game lore in your browser while playing Destiny 1."
date: 2024-07-12
tags: ["portfolio", "Vue", "browser extension", "destiny"]
image: "https://res.cloudinary.com/dtm8qhbwk/image/upload/c_thumb,q_auto,g_face,f_auto,w_200/v1635373637/blog/stock/pexels-markus-spiske-2061168_coxasy.jpg"
image_alt: "A simple header image"
---

# LoreBotExt

[Repo Link](https://github.com/unisys12/LoreBotExt)

![Screen Shot](https://camo.githubusercontent.com/13eb5ef15386975d895f83a25a301bb4aadf0a45824681ee295e0d847f13a5b3/68747470733a2f2f64726976652e676f6f676c652e636f6d2f75633f6578706f72743d766965772669643d30422d6b4b43496d3874573467515774425232737459304e305a4451)

## Project Purpose

Create a browser extension that, once enabled, will allow the user to play Destiny and get Grimoire as well as other game related lore delivered to their browser in real time. In short, try to get as close to giving the player "in-game lore" without our code actually being in the game.

## Tech Used

[VueJS](https://vuejs.org/) - v2
[Bulma CSS](https://www.bulma.io) - v0.3.2

## Proud Moments

- This was, at the time, the largest JavaScript projects I had ever created and managed. It sadly didn't last very long, but it birthed what would become [Lorebot12-86](lorebot12-86). Quiet a few Twitch Streamers started using it during their streams and this happened around the same time as OBS and Twitch.tv was experimenting with custom overlay systems on Twitch, which would allow the a streamer to display information or custom objects over their existing stream. Due to this conversation, which I was not aware of at the time I created this project, I was offered positions _(not jobs)_ on other much larger projects. One of which would become [Destiny Item Manager](https://destinyitemmanager.com/en/) and what would become the very first officially support Twitch Game Overlay/Extension for Borderlands 3 Tiny Tina's Wonderland. I sadly turned down the latter, due to overwhelming ` imposter syndrome` at the time. I did work, very little, but a little early work on the second version of DIM, using the new Angular 2 framework and hated every minute of it. I backed out of the project very quickly.
- One project offer I did take was to joined [Baxter](https://ie.linkedin.com/in/paulboxley) as an _engineer(?)_ on [Ishtar Collective](https://www.ishtar-collective.net), which was a hugh honor. I will never forget the day I got a DM from him on Twitter asking to have a chat with me about joining the project. I started shaking from the shear excitement. Several hours later I was part of the team, and he gave me access to the repo. It was then I found out Ishtar was a Rails project and I had very little experience with Ruby. Other than old Sass workflows and writing Vagrant configs for environments. Baxter _(Paul)_ was a great sport and really took me under his wing. I learned so much from him, I cannot put into words. I will be forever great-ful for my time on the project.
- The amount of mental gymnastics that was needed to recreate a players emblem was insane! Working through that was a big leap for me, at the time.

Ex: Character.vue _(component that gathered character info from the Bungie API, store that in a VueStore for other uses, and displayed the characters emblem in the upper left of the image above)_

```js
<template>
<section class="section" :thisAccount="getActivity(fetchGamer)">
  <div class="container" v-if="activeCharacter != ''">
    <span class="title">Active Character</span>
    <hr>
    <div class="columns">
      <div class="column emblem is-1"
          :style="{ 'background': 'url(https://bungie.net' + activeCharacter.emblemPath + ') no-repeat' }">
      </div>
      <div class="column stats"
          :style="{ 'background': 'url(https://bungie.net' + activeCharacter.backgroundPath + ') no-repeat' }">
        <div class="columns">
            <div class="column class">
                <p>{{ characterClass }}</p>
            </div>
            <div class="column blevel is-1">
                <p>{{ activeCharacter.characterLevel }}</p>
            </div>
        </div>
        <div class="columns">
          <div class="column race is-1">
              <p>{{characterRace}}</p>
          </div>
          <div class="column gender">
              <p>{{ characterGender}}</p>
          </div>
          <div class="column plevel is-1">
              <p>{{ activeCharacter.characterBase.powerLevel }}</p>
          </div>
        </div>
      </div>
      <div class="column">
        <section if="activeCharacter != ''" class="activity">
          <div class="activityImage">
            <figure class="activityBackground">
                <img :src="'https://www.bungie.net' + characterActivity.pgcrImage" alt="activityBackground">
            </figure>
            <figure class="activityIcon">
                <img :src="'https://www.bungie.net' + characterActivity.icon" alt="activityIcon">
            </figure>
          </div>
          <div class="column content">
            <h2>{{ characterActivity.activityName }}</h2>
            <h3>{{ characterActivity.activityDescription }}</h3>
          </div>
        </section>
      </div>
    </div>
  </div>
  <div class="container" v-else>
    <div class="notification is-primary" v-show="characterMessage">
      {{ characterMessage }}
    </div>
  </div>
</section>

</template>

<script>
const _ = require('underscore')
import Store from '../store'
import { searchDestinyPlayer, getSummary, getActivity, getClass, getGender, getRace } from '../Bungie/api.js'

export default {
  name: 'Character',
  Store,
  data () {
    return {
      gamer: '',
      characterMessage: '',
      activeCharacter: '',
      characterGender: '',
      characterRace: '',
      characterClass: '',
      characterActivity: ''
    }
  },
  computed: {
    fetchGamer: function() {
      return Store.getters.fetchGamer
    },
    fetchAccount: function() {
      return Store.getters.fetchAccount
    },
    fetchSummary: function() {
      return Store.getters.fetchSummary
    },
    fetchActiveCharacter: function() {
      return Store.getters.fetchActive
    }
  },
  methods: {
    getPlayer: async function(obj) {
      let res = await searchDestinyPlayer(obj.trim())
      let account = res.data.Response
      if(account){
        if(account.length > 0){
          Store.commit('storeAccount', account)
        }else{
          // Display message that the account could not be found
          this.characterMessage = `No valid BNet account can be found with the name - `
          + obj + `. Make you are using a valid BNet account name and not a Twitch handle...`
        }
      }else{
        this.characterMessage = 'Seemed to have lost our network connection...'
      }
    },
    getAccountSummary: async function(obj) {
      if(this.fetchGamer){
        // Find the player on BNet and store their info
        await this.getPlayer(obj)
        // Fetch that info from the Store and put into a var
        let account = await this.fetchAccount
        // Use map to extract the data we need for the next API call and
        // place it in the Store for further use... later...
        account.map((x)=>{
          Store.commit('storeMembershipId', x.membershipId)
          Store.commit('storeMembershipType', x.membershipType)
        })
        let summary = await getSummary(Store.state.membershipType, Store.state.membershipId)
        if(summary.data.ErrorCode != 1){
          this.characterMessage = 'Error fetching Summary: ' + summary.data.ErrorStatus + ' :' + summary.data.Message
        }else{
          Store.commit('storeSummary', summary)
        }
      }else{
        // Return message to display that no account was found
        this.characterMessage = 'No characters found using this account... ' + obj
      }
    },
    getActiveCharacter: async function(obj) {
      if(this.fetchGamer){
        await this.getAccountSummary(obj)
        let characters = await this.fetchSummary
        let chars = characters.data.Response.data.characters
        let active = []

        for (let i = 0; i < chars.length; i++) {
          if (chars[i].characterBase.currentActivityHash > 0) {
            active.push(chars[i])
          }
        }

        if(active.length > 0){
          Store.commit('storeActiveCharacters', active[0])

          this.activeCharacter = await this.fetchActiveCharacter

          let characterRace = []
          characterRace.push(await getRace(this.activeCharacter.characterBase.raceHash))
          characterRace.map((x)=>{
            this.characterRace = x.data.Response.data.race.raceName
          })

          let characterClass = []
          characterClass.push(await getClass(this.activeCharacter.characterBase.classHash))
          characterClass.map((x)=>{
            this.characterClass = x.data.Response.data.classDefinition.className
          })

          let characterGender = []
          characterGender.push(await getGender(this.activeCharacter.characterBase.genderHash))
          characterGender.map((x)=>{
            this.characterGender = x.data.Response.data.gender.genderName
          })
        }else{
          this.characterMessage = 'There are no active characters on ' + this.fetchGamer + "'s account at the moment..."
        }
      }
    },
    getActivity: _.throttle(async function(obj) {
      let gamertag = this.fetchGamer
      if(gamertag.length > 0){
        await this.getActiveCharacter(obj)
        if(this.activeCharacter != ''){
          let activity = await getActivity(this.activeCharacter.characterBase.currentActivityHash)
          Store.commit('storeActivity', activity.data.Response.data.activity)
          this.characterActivity = Store.getters.fetchActivity
        }
      }else{
        this.characterMessage = 'Please enter a valid Bungie.net Username or gamertag to get started...'
      }
    }, 3000, true)
  }
}
</script>
```

## Lessons Learned

- Sometimes, those _"Hey! It would be neat if..."_ projects can pay off!
- Allowed me to get my brain around using a inward facing storage solution, VueStore, on a project.
- Webpack really is hell.
- Learned how to distribute software through the Google Playstore.
- Although I got it working locally, I was never able to distribute this project as an extension on Firefox due to my use of Vue. Somewhere in the rendering process, `eval()` was used and Firefox strictly prohibited it's use. I would have to completely rewrite the project.
- When Destiny 2 was announced, this project really took off due to many players coming back and a lot of hype was surrounding me releasing a v1 of this project after D2 came out. A month before D2 was released, Bungie allowed access to the new API that would support the upcoming release, to several community members. I was one of them. I was shocked to learn that this project was not going to work with the new API. All the lore was now in game, so if you wanted to see it, you didn't need a app like this. So, I announced that I would no longer support the application and focus my efforts on Ishtar going forward.
