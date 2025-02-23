# Phaser Map Gen

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

## Known Bugs
- Player can sometimes spawn in the water or in trees, and cannot move. To fix, just reload the page and try loading in again. 

## Game Controls

### Main Menu
- Click the "Enter World" button to start the game
- Mouse hover effects show button interactivity

### In-Game Controls
- **Arrow Keys:** Move the player character

The debug panel in the corner shows:
- Current world coordinates (X, Y)
- Current chunk coordinates
- Real-time position updates

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Launch a development web server |
| `npm run build` | Create a production build in the `dist` folder |
| `npm run dev-nolog` | Launch a development web server without sending anonymous data (see "About log.js" below) |
| `npm run build-nolog` | Create a production build in the `dist` folder without sending anonymous data (see "About log.js" below) |


