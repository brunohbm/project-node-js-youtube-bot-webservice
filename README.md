# nodejs-youtube-bot

## Table of Contents

- [About](#about)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)

## About

The idea is to create a service that can generate videos with compilations of trailers. Those trailers can be games, movies, series, or anime... Anything that has a title, description, evaluation, and release year.

## Prerequisites

To use this project you will need to install the latest version of [Python](https://www.python.org/downloads/) on your computer.

## Installation

1. Clone the repository: `git clone https://github.com/...`
2. Navigate to the project directory: `cd project`
3. Install dependencies: `yarn install`

### Usage

Before you start the project make sure that you have created a `.env` file with all the following ENVS:

- PORT=3001
- OPENAI_API_KEY=[Get key](https://platform.openai.com/account/api-keys)
- YOUTUBE_API_KEY=[Get key](https://developers.google.com/youtube/v3/getting-started)
- GOOGLE_CREDENCIAL_CLIENT_ID=[Get key](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)
- GOOGLE_CREDENCIAL_CLIENT_SECRET=[Get key](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)
- TINIFY_API_KEY=[Get key](https://tinypng.com/developers)

After that, run the project with the command `yarn start` and have fun:

### Generate JSON Video

#### Route: 
`GET: /generator/video-compilation`

#### Query params:
`theme`

Exemple: 
`GET /generator/video-compilation?theme=List of the best 5 co-op games for pc`

#### Response
```json
{
    "theme": "List of the best 5 co-op games for pc",
    "videos": [
        {
            "name": "Left 4 Dead 2",
            "genre": "First-Person Shooter",
            "evaluation": "9/10",
            "releaseYear": 2009,
            "description": "Left 4 Dead 2 is a cooperative first-person shooter video game developed and published by Valve Corporation. The sequel to Turtle Rock Studios's Left 4 Dead, the game was released for Microsoft Windows and Xbox 360 in November 2009, and for OS X in October 2010, and for Linux in July 2013.",
            "trailerId": "9XIle_kLHKU"
        },
        {
            "name": "Overcooked 2",
            "genre": "Simulation",
            "evaluation": "8/10",
            "releaseYear": 2018,
            "description": "Overcooked 2 is a cooperative cooking simulation video game developed by Ghost Town Games and published by Team17. It is the sequel to Overcooked. The game was released for Microsoft Windows, Nintendo Switch, PlayStation 4 and Xbox One on August 7, 2018.",
            "trailerId": "gEjbXb_eZcs"
        },
        {
            "name": "Divinity: Original Sin 2",
            "genre": "Role-Playing",
            "evaluation": "10/10",
            "releaseYear": 2017,
            "description": "Divinity: Original Sin 2 is a role-playing video game developed and published by Larian Studios. The sequel to 2014's Divinity: Original Sin, it was released for Microsoft Windows in September 2017, for PlayStation 4 and Xbox One in August 2018, for macOS in January 2019, and Nintendo Switch in September 2019.",
            "trailerId": "bTWTFX8qzPI"
        },
        {
            "name": "A Way Out",
            "genre": "Action-Adventure",
            "evaluation": "8/10",
            "releaseYear": 2018,
            "description": "A Way Out is an action-adventure game developed by Hazelight Studios and published by Electronic Arts under their EA Originals program. It was released for Microsoft Windows, PlayStation 4, and Xbox One on March 23, 2018. The game is played from a third-person perspective and its world is navigated on foot or by vehicle.",
            "trailerId": "yGZGSdgJVPM"
        },
        {
            "name": "Keep Talking and Nobody Explodes",
            "genre": "Puzzle",
            "evaluation": "9/10",
            "releaseYear": 2015,
            "description": "Keep Talking and Nobody Explodes is a puzzle video game developed by Steel Crate Games. The game requires one player to defuse a bomb while another player, who has the bomb defusal manual, gives instructions. It was released for Microsoft Windows, OS X, Linux, PlayStation 4, Xbox One, Android, and iOS.",
            "trailerId": "1-MM1UTtjyU"
        }
    ],
    "tags": [
        "Left 4 Dead 2",
        "Overcooked 2",
        "Divinity: Original Sin 2",
        "A Way Out",
        "Keep Talking and Nobody Explodes",
        "first-person shooter",
        "simulation",
        "role-playing",
        "action-adventure",
        "puzzle",
        "left 4 dead 2",
        "left 4 dead 2 gameplay",
        "left 4 dead 2 trailer",
        "left 4 dead 2 video",
        "left 4 dead 2 walkthrough",
        "left 4 dead 2 playthrough",
        "ve3tro",
        "ve3trogamesmedia",
        "ve3tro games media",
        "ve3tro media",
        "ve3tromedia",
        "ve3tro games",
        "ve3tro network",
        "ve3tro walkthrough",
        "playstation 3",
        "ps3"
    ]
}
```

### Create video compilation

#### Route: 
`POST: /create/compilation-video`

#### Body:
```json
{
    "title": "List of the best 5 co-op games for pc",
    "videos": [
        {
            "name": "Left 4 Dead 2",
            "genre": "First-Person Shooter",
            "evaluation": "9/10",
            "releaseYear": 2009,
            "description": "Left 4 Dead 2 is a cooperative first-person shooter video game developed and published by Valve Corporation. The sequel to Turtle Rock Studios's Left 4 Dead, the game was released for Microsoft Windows and Xbox 360 in November 2009, and for OS X in October 2010, and for Linux in July 2013.",
            "trailerId": "9XIle_kLHKU"
        },
        {
            "name": "Overcooked 2",
            "genre": "Simulation",
            "evaluation": "8/10",
            "releaseYear": 2018,
            "description": "Overcooked 2 is a cooperative cooking simulation video game developed by Ghost Town Games and published by Team17. It is the sequel to Overcooked. The game was released for Microsoft Windows, Nintendo Switch, PlayStation 4 and Xbox One on August 7, 2018.",
            "trailerId": "gEjbXb_eZcs"
        },
        {
            "name": "Divinity: Original Sin 2",
            "genre": "Role-Playing",
            "evaluation": "10/10",
            "releaseYear": 2017,
            "description": "Divinity: Original Sin 2 is a role-playing video game developed and published by Larian Studios. The sequel to 2014's Divinity: Original Sin, it was released for Microsoft Windows in September 2017, for PlayStation 4 and Xbox One in August 2018, for macOS in January 2019, and Nintendo Switch in September 2019.",
            "trailerId": "bTWTFX8qzPI"
        },
        {
            "name": "A Way Out",
            "genre": "Action-Adventure",
            "evaluation": "8/10",
            "releaseYear": 2018,
            "description": "A Way Out is an action-adventure game developed by Hazelight Studios and published by Electronic Arts under their EA Originals program. It was released for Microsoft Windows, PlayStation 4, and Xbox One on March 23, 2018. The game is played from a third-person perspective and its world is navigated on foot or by vehicle.",
            "trailerId": "_ApSmPvxz1o"
        },
        {
            "name": "Keep Talking and Nobody Explodes",
            "genre": "Puzzle",
            "evaluation": "9/10",
            "releaseYear": 2015,
            "description": "Keep Talking and Nobody Explodes is a puzzle video game developed by Steel Crate Games. The game requires one player to defuse a bomb while another player, who has the bomb defusal manual, gives instructions. It was released for Microsoft Windows, OS X, Linux, PlayStation 4, Xbox One, Android, and iOS.",
            "trailerId": "1-MM1UTtjyU"
        }
    ],
    "tags": [
        "first-person shooter",
        "simulation",
        "role-playing",
        "action-adventure",
        "puzzle",
        "best co-op games",
        "best coop games",
        "co-op games",
        "best coop games pc",
        "coop games",
        "co-op pc games",
        "best pc co op games",
        "best pc coop games",
        "best couch co-op games",
        "best co op games",
        "best pc co op games 2022",
        "best coop games pc 2018",
        "best pc games to play with friends",
        "best pc games 2021",
        "best pc games for coop",
        "free online multiplayer games for pc",
        "top co-op games",
        "multiplayer games",
        "best pc multiplayer games 2022",
        "best local co-op games on pc",
        "new co-op games",
        "left 4 dead 2",
        "left 4 dead 2 gameplay",
        "left 4 dead 2 trailer",
        "left 4 dead 2 video",
        "left 4 dead 2 walkthrough",
        "left 4 dead 2 playthrough",
        "ve3tro",
        "ve3trogamesmedia",
        "ve3tro games media",
        "ve3tro media",
        "ve3tromedia",
        "ve3tro games",
        "ve3tro network",
        "ve3tro walkthrough",
        "playstation 3",
        "ps3",
        "pc",
        "live",
        "arcade",
        "network",
        "Xbox",
        "Xbox360",
        "xbox 360",
        "Xbox One",
        "Overcooked2",
        "Overcooked 2",
        "Overcooked",
        "Co-op",
        "CoOp",
        "Cooking Game",
        "Cooking",
        "Team17",
        "Team 17",
        "Ghost Town Games",
        "Ghost Town",
        "Larian",
        "Larian Studios",
        "Divinity: Original Sin 2",
        "DOS2",
        "Divinity",
        "RPG",
        "cRPG",
        "Role Playing Game",
        "Trailer",
        "Cinematic",
        "A Way Out",
        "Way Out",
        "A Way Out Trailer",
        "A Way Out Gameplay",
        "A Way Out Game",
        "Way Out Trailer",
        "Way Out Gameplay",
        "Way Out Game",
        "EA Originals",
        "EA",
        "Electronic Arts",
        "Originals",
        "Indie",
        "Indies",
        "A Way Out PS4",
        "A Way Out Xbox One",
        "A Way Out PC",
        "EA Play",
        "ea play 2017",
        "E3",
        "e3 trailer",
        "e3 gameplay",
        "e3 2017",
        "Xbox",
        "Xbox360",
        "xbox 360",
        "Xbox One",
        "Bomb Game",
        "Co-op",
        "Party",
        "Defuse",
        "Diffuse",
        "Don't Stop Talking"
    ],
    "type": {
        "key": "animes",
        "label": "Animes",
        "fontColor": "#F34213",
        "backgroungColor": "#C0F8D1",
        "primaryColor": "#F34213"
    },
    "image_name": "thumbnail.png"
}
```

After you request the second route, the video creation will start. The process of the creation is consoled on the terminal and when it's finished will open your browser so you can authenticate at the youtube account that you want to upload the video. 

If the upload fails for some reason you can find your video in the files folder. 

## License

![Do whatever you want](./assets/license.gif)
