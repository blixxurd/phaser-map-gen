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

## Project Overview

- **Purpose:**  
  This project is a proof-of-concept template for creating a 2D RPG Map generator using Phaser 3. It is designed to be a starting point for developing a 2D RPG, and specifically focuses on the map generation and management through procedural generation. 

- **Project Structure:**  
  This project is structured to clearly separate game logic (handled by Phaser) from the UI and layout (managed by Next.js and React). This modular design facilitates easy expansion, maintenance, and rapid development through hot-reloading.
  
- **Technologies Used:**  
  - **Phaser 3:** For game logic and rendering.  
  - **Next.js & React:** For the user interface and server-side rendering (with client-side game instantiation).  
  - **TypeScript:** For type safety and modern development practices.  
  - **Additional Libraries:** Such as `simplex-noise` for procedural world generation.

### Key Folders and Files
- **src Folder (React):**  
  - **pages:**  
    - `index.tsx`: The main entry point that dynamically imports the main app component via Next.js (with SSR disabled for the Phaser game).  
    - `_app.tsx` & `_document.tsx`: Set up global styles and document structure.
  
  - **styles:**  
    Contains global and module CSS style definitions.
  
  - **App.tsx:**  
    Acts as the main React component interfacing with the Phaser game. It manages state (like player position or debug info) and provides controls for scene changes.

- **game Folder (Phaser):**  
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

React and Phaser Integration

- **Communication Mechanism:**  
  An event bus (`EventBus.ts`) is used for communication between React components (UI) and Phaser scenes. This helps synchronize actions like scene transitions and debug updates.
  
- **Dynamic Client-Side Loading:**  
  The main game component is dynamically imported on the client side using Next.js (ensuring that Phaser runs only in the browser).
  
- **Debugging and Controls:**  
  The `App.tsx` component provides UI elements (buttons, debug panels) that interact with the Phaser game instance via React refs and the event bus.

## Procedural Map Generation

The game implements a chunk-based procedural world generation system with the following key components:

### World Generator
The `WorldGenerator` class uses multiple layers of noise to create varied terrain:

- Uses Simplex noise with multiple octaves for natural-looking terrain generation
- Separate noise generators for terrain, water, and resources
- Generates different tile types (water, sand, dirt, grass, rock) based on height values
- Handles object placement (like trees) based on resource noise values

### Chunk Management
The `ChunkManager` handles dynamic loading and unloading of world chunks:

- World is divided into chunks (16x16 tiles by default)
- Chunks are generated and loaded dynamically as the player moves
- Maintains efficient memory usage by unloading distant chunks
- Handles both terrain tiles and game objects within chunks

### Key Features

1. **Terrain Generation**
   - Multiple biome types based on height values
   - Smooth transitions between different terrain types
   - Water bodies and coastlines
   - Collision handling for walls and obstacles

2. **Object Placement**
   - Dynamic object spawning based on terrain type
   - Trees and other objects placed using resource noise
   - Physics-enabled objects with proper collision detection
   - Automatic cleanup when chunks unload

3. **Performance Optimization**
   - Chunk-based loading/unloading system
   - Object culling for off-screen entities
   - Efficient physics handling for active objects
   - Memory management through dynamic chunk lifecycle

### Technical Implementation

The generation system uses a multi-layered approach:

1. **Base Terrain Layer**
   - Generated using octaved Simplex noise
   - Height values determine basic terrain type
   - Handles water level and land mass distribution

2. **Resource Distribution**
   - Secondary noise layer for object placement
   - Controls density and distribution of trees and resources
   - Ensures natural-looking object clusters

3. **Physics Integration**
   - Automatic collision setup for walls and objects
   - Dynamic physics body creation and cleanup
   - Optimized collision detection within active chunks

The system is designed to be expandable, allowing for easy addition of new terrain types, objects, and biomes while maintaining performance through efficient chunk management and object culling.

## Writing Code & Running the Game

After cloning the repo, run `npm install` from your project directory. Then, you can start the local development server by running `npm run dev`.

The local development server runs on `http://localhost:8080` by default. Please see the Next.js documentation if you wish to change this, or add SSL support.

Once the server is running you can edit any of the files in the `src` folder. Next.js will automatically recompile your code and then reload the browser.

## Template Project Structure & Key Components

Below is an outline of the key parts of the Phaser app and its integration with Next.js:


