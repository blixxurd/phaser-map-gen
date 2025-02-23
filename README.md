# Phaser Map Gen - Proof of Concept

This is a Phaser 3 project template that uses the Next.js framework. It includes a bridge for React to Phaser game communication, hot-reloading for quick development workflow and scripts to generate production-ready builds.

### Versions

This app currently uses the following versions:

- [Phaser 3.88.2](https://github.com/phaserjs/phaser)
- [Next.js 14.2.3](https://github.com/vercel/next.js)
- [TypeScript 5](https://github.com/microsoft/TypeScript)

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Launch a development web server |
| `npm run build` | Create a production build in the `dist` folder |
| `npm run dev-nolog` | Launch a development web server without sending anonymous data (see "About log.js" below) |
| `npm run build-nolog` | Create a production build in the `dist` folder without sending anonymous data (see "About log.js" below) |

## Writing Code

After cloning the repo, run `npm install` from your project directory. Then, you can start the local development server by running `npm run dev`.

The local development server runs on `http://localhost:8080` by default. Please see the Next.js documentation if you wish to change this, or add SSL support.

Once the server is running you can edit any of the files in the `src` folder. Next.js will automatically recompile your code and then reload the browser.

## Template Project Structure & Key Components

Below is an outline of the key parts of the Phaser app and its integration with Next.js:

### 1. Project Overview

- **Purpose:**  
  This project is a proof-of-concept template for integrating a Phaser 3 game with a Next.js (React) application. It demonstrates how to bridge game logic and UI components—enabling hot-reloading and production-ready builds.
  
- **Technologies Used:**  
  - **Phaser 3:** For game logic and rendering.  
  - **Next.js & React:** For the user interface and server-side rendering (with client-side game instantiation).  
  - **TypeScript:** For type safety and modern development practices.  
  - **Additional Libraries:** Such as `simplex-noise` for procedural world generation.

### 2. Key Folders and Files
- **src Folder:**  
  - **pages:**  
    - `index.tsx`: The main entry point that dynamically imports the main app component via Next.js (with SSR disabled for the Phaser game).  
    - `_app.tsx` & `_document.tsx`: Set up global styles and document structure.
  
  - **styles:**  
    Contains global and module CSS style definitions.
  
  - **App.tsx:**  
    Acts as the main React component interfacing with the Phaser game. It manages state (like player position or debug info) and provides controls for scene changes.

- **game Folder:**  
  Contains all Phaser-specific logic and organization:
  
  - **main.ts:**  
    Sets up the Phaser game configuration including dimensions, physics settings, and scene order (Boot, Preloader, MainMenu, Game, GameOver).
  
  - **PhaserGame.tsx:**  
    A React wrapper responsible for creating and exposing the Phaser game, integrating it with React's lifecycle.
  
  - **EventBus.ts:**  
    Implements an event emitter (using Phaser's Events) for communication between Phaser scenes and React components.
  
  - **scenes:**  
    - **Boot:** Loads minimal assets needed immediately to kickstart the game.  
    - **Preloader:** Displays a loading progress bar while loading game assets and then transitions to the MainMenu scene.  
    - **MainMenu:** Shows the main menu, including an animated logo and title, and allows transitioning to the main Game scene.  
    - **Game:** Contains the core gameplay logic, including player input and world management (using a ChunkManager for generating world chunks).  
    - **GameOver:** Presents a game-over screen and provides logic to return to the main menu.
  
  - **config/GameConfig.ts:**  
    Holds configuration constants such as grid sizes, player speed, and other world settings.
  
  - **world:**  
    Manages the procedural generation and dynamic loading of the game world:
    - **WorldGenerator.ts:** Uses noise generation to build the game world's terrain procedurally.
    - **ChunkManager.ts:** Handles dynamic generation and unloading of world chunks based on the player's position.
    - **GameObject.ts:** Serves as a base class for in-game objects, encapsulating properties for rendering and physics.
    - **objects/Tree.ts:** An example of a game object (a tree) rendered with Phaser primitives.

- **Utility Script:**  
  - `log.js`: A Node.js script used during development and builds to send optional anonymous logging data.

### 3. React and Phaser Integration

- **Communication Mechanism:**  
  An event bus (`EventBus.ts`) is used for communication between React components (UI) and Phaser scenes. This helps synchronize actions like scene transitions and debug updates.
  
- **Dynamic Client-Side Loading:**  
  The main game component is dynamically imported on the client side using Next.js (ensuring that Phaser runs only in the browser).
  
- **Debugging and Controls:**  
  The `App.tsx` component provides UI elements (buttons, debug panels) that interact with the Phaser game instance via React refs and the event bus.

### 4. Summary

This project is structured to clearly separate game logic (handled by Phaser) from the UI and layout (managed by Next.js and React). This modular design facilitates easy expansion, maintenance, and rapid development through hot-reloading.

Happy coding!


