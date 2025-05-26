# Batao

Batao - try to tell

## About

Batao is a turn-based multiplayer word-guessing game. Where, for a given turn, there is one artist who tries his best to draw an accurate representation of the word other players are trying to guess.


## Running Locally
### Prerequisites

Make sure you have [Bun](https://bun.sh/) installed on your system, this will help you install packages as well as run the server.

### Installation

To run locally, clone the repo and:-

1. set env variables,

    - generate hash for your custom passcode
        ```bash
        bun run _utils/codegen.js <your-passcode>
        ```
        output is your `<passcode-hash>`

    ```
    // .env
    NODE_ENV="production"
    APP_URL="http://localhost:3000"
    CREATION_PASSCODE_HASH=<passcode-hash> // optional in dev
    ```
2. Using Docker, simply build and run the docker image.
    ```bash
    docker build -t batao . 
    docker run --rm -p 3000:3000 --name batao_container batao
    ```
    OR
    
    2.2. Build frontend
    ```bash
    cd frontend
    bun i && bun run build
    ```
    2.3. Run the server
    ```bash
    // cd into the root of the repo
    bun i
    bun run start
    ```
4. Game can be accessed at http://localhost:3000

## For Devs

### Running Dev server

1. install dependencies:
    ```bash
    bun i && cd frontend && bun i
    ```
2. run dev servers,
    - during development we are running two development servers the frontend dev server is a simple vite server for Tanstack router frontend, 
    - It is set-up to catch requests made to game-server and send them to the hono instance running the game-server logic. This gives us the hot-reloading and devtools experience of tanstack router. 
    - Bun game-server- ``` bun run dev ```
    - frontend- ```cd frontend && bun run dev```
    - In-production, the frontend is just build as static files and served by Hono.
    
## License

All the source code in this repository is licensed under [BSD 4-Clause "Original" or "Old" License](./LICENSE.md)
