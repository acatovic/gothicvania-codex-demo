# GothicVania Codex Demo

2D platformer game demo created with no coding - using only Codex CLI and [agent skills](https://agentskills.io).
Enjoy the game [here](https://acatovic.github.io/gothicvania-codex-demo/), or continue reading below to understand how I did it.

## Playing the game

**You can play the game here:** https://acatovic.github.io/gothicvania-codex-demo/

You can also run the game locally. Simply run:

```bash
./run.sh
```

...and point your web browser to http://localhost:8000/

## Demo (Gameplay Video)

https://github.com/user-attachments/assets/18b55dbe-a5fd-4bd3-9a9e-095b0ed191aa

## The Story

*No - this is not an **actual** story for the game. Rather, it's a log of how I built the bloody thing.*

### In the beginning there was the Codex command line (and agent skills)

Since late last year I've become a huge fan of two things:

(1) using coding agents (e.g. Claude Code and Codex) as general purpose AI orchestrators i.e. due to the state management
and inherent validation guarantees they provide; and

(2) using agent skills as both a tool calling specification and a context management method.

Couple of weeks ago I decided to perform an experiment: can I build a sandbox 2D game level in under 30 minutes
without writing a single line of code - *and without any understanding of the underlying game engine* - by simply using
[OpenAI Codex Agent Skills](https://developers.openai.com/codex/skills/)? The answer was **yes**.
The demo got a very positive reaction from the community so I decided to spend a couple more hours on it to really polish it up,
and do a proper writeup. The result is...well, you are looking at it.

*PS. I'm a fan of Neal Stephenson.*

### Applying harness engineering and progressive disclosure

The key is to apply [harness engineering](https://openai.com/index/harness-engineering/) and **progressive disclosure**.
By harness engineering we mean creating a bunch of Markdown files and any additional scripts or templates that Codex can use
to build out the game. For example, environment pre-requisites, testing/evaluation guidelines, asset directory structure, etc.

When it comes to progressive disclosure, to quote OpenAI:

> agents start with a small, stable entry point and are taught where to look next, rather than being overwhelmed up front.

I stipulate progressive disclosure by:

* Treating my `SKILL.md` purely as a table-of-contents (ToC) - a very lightweight document that easily fits into the context
* Enforcing an **agentic separation of concerns** by clearly splitting out the skills into dedicated markdown docs
* Enforcing a *living* `PROGRESS.md` as a log/memory mechanism for Codex, so it doesn't consume context with things that don't work

In the end, my game harness is the `game-dev` agent skillset, combined with a pre-set game structure, i.e.


```
DESIGN-DOCUMENT.md            # Game Design Document - explains the story, objectives, layout, mechanics, etc.
PROGRESS.md                   # Progress log and memory store for the game dev agent
.agents/
├── skills/
│   ├── game-dev/
│   │   ├── SKILL.md          # ToC / Skills Map
│   │   ├── PREREQUISITES.md  # Environment Setup
│   │   ├── WORKFLOW.md       # Describes "how" the game dev agent should behave
│   │   ├── ASSETS.md         # How to interpret the game assets
│   │   ├── GAME-ENGINE.md    # Simply a pointer to online Phaser docs
│   │   ├── TESTING.md        # CRITICAL! How the game dev agent should test its progress
assets/
│   ├── spritesheets/
│   ├── fonts/
│   ├── images/
│   │   ├── backgrounds/
│   │   ├── misc/
│   ├── tilemaps/
│   │   ├── maps/
│   │   ├── tiles/
│   ├── audio/
│   │   ├── sfx/
│   │   ├── music/
```

The "engineering" aspects were essentially:

* Updating the different game dev skills
* Updating the `DESIGN-DOCUMENT.md`
* Iterative prompting in Codex CLI

### implement() -> evaluate() cycle is the key

One of the keys to success is a robust implement() -> test() cycle. I enforced a comprehensive use of
Playwright as the test driver, as well as a rigorous list of checks the agent needed to perform.
It was absolutely magical watching Codex implement a feature then automatically open a web browser window
and speed-play the game to validate the said feature. The best part was when it found problems - such as when
it found one of the enemies floating in the air, so it went back to implement proper gravity controls.

Essentially, without this implement() -> evaluate() cycle, you are simply feeling around in the dark.

### Progressive prompting

One-shot prompt/game dev agent will basically get the game up and running, with some basic level and player mechanics.
Codex is currently unable to (even on the highest setting) perform a fully valid game creation using all the skills,
the design document, and the full game development harness - at least not for a game such as this ("snake game" should be ok!).

My answer was to perform **progressive prompting** as a way to progressively get the game from zero to hero. Essentially:

1. Get the game up and running with background and full player mechanics
2. Add the tiles/level map into the game
3. Add the enemies/NPCs with player->NPC dynamics, i.e. "hurt", "die", "destroy enemy", "reset level"
4. Add the title and pause menu as well as help/instructions
5. Add the sfx and music

In between I had to take some screenshots and feed it to Codex to implement fixes, i.e. collision detection errors,
give more "intelligence" to NPCs, etc.

In total I made around 10 prompts.

### Final thoughts

This was an immensely pleasurable experience, and a few hours well spent. I felt like we (as devs) achieved what we've
been trying to achieve for decades - focus on the actual requirements and specifications, and watch something beautiful
come alive. I personally felt more like a game designer - orchestrating the levels, the mechanics, the look'n'feel.

Saying that, the graphics and the assets were human-created. I tried different models (GPT-5.2, Gemini, Flux) to create
sprites - we are not there yet. Probably the backgrounds and maybe the tilemaps we could do relatively easily with the
help of AI, but sprites are not there yet. Regardless, this was an amazing experience and a great stepping stone to
more agentic game creation.

## Attribution

The assets in this project were **NOT** AI generated - they were made by humans.
While all the assets are free and fully permissable, I'd like to give credit where
it's due:

* Backgrounds, tiles and sprites are created by [ansimuz](https://ansimuz.itch.io/gothicvania-church-pack).
* The haunting soundtrack is created by [Pascal Belisle](https://soundcloud.com/thetoadz).
* I created the level using [Tiled](https://www.mapeditor.org/) map editor.
* I am using [Phaser](https://phaser.io/) JS game engine - though I never looked at a single piece of code there.


https://openai.com/index/harness-engineering/
