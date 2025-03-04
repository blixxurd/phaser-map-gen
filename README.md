# Phaser Map Gen

## Project Overview

- **Purpose:**  
  This project is a fully functional 2D RPG Map generator using Phaser 3. It demonstrates procedural world generation with dynamic chunk loading, creating an infinite explorable world with varied terrain, water bodies, and objects like trees. The project serves as a solid foundation for developing 2D RPG games with procedural content.

- **Project Structure:**  
  The project follows a modular architecture that clearly separates game logic (handled by Phaser) from the UI and layout (managed by Next.js and React). This design facilitates easy expansion, maintenance, and rapid development through hot-reloading.
  
- **Technologies Used:**  
  - **Phaser 3:** For game logic, physics, and rendering
  - **Next.js & React:** For the user interface and server-side rendering
  - **TypeScript:** For type safety and modern development practices
  - **Simplex Noise:** For natural-looking procedural terrain generation

## Procedural Map Generation System

The game implements a sophisticated chunk-based procedural world generation system with the following key components:

### World Generator
The `WorldGenerator` class uses multiple layers of noise to create varied terrain:

- **Multi-layered Noise Generation:**
  - Uses Simplex noise with multiple octaves for natural-looking terrain
  - Separate noise generators for terrain height and resource distribution
  - Configurable noise scale and octaves for fine-tuning terrain features

- **Diverse Terrain Types:**
  - Water (deep, medium, shallow)
  - Sand (beaches and shorelines)
  - Grass (light and dark variants)
  - Dirt
  - Rock

- **Resource Distribution:**
  - Secondary noise layer controls object placement
  - Trees and other objects placed based on terrain type and resource values
  - Natural-looking distribution patterns

### Chunk Management System
The `ChunkManager` handles dynamic loading and unloading of world chunks:

- **Dynamic Chunk Loading:**
  - World is divided into chunks (8x8 tiles by default)
  - Chunks are generated and loaded dynamically as the player moves
  - Configurable load and unload distances (currently 4-chunk radius for loading)

- **Memory Optimization:**
  - Automatic unloading of distant chunks (beyond 5-chunk radius)
  - Complete cleanup of physics bodies and game objects
  - Efficient memory management through object pooling

- **Seamless World Exploration:**
  - No loading screens or transitions between chunks
  - Continuous world that extends in all directions
  - Consistent terrain generation across chunk boundaries

### Performance Optimization

The game includes several systems to ensure smooth performance:

- **Culling Manager:**
  - Automatically disables rendering and physics for off-screen objects
  - Camera-based culling with configurable padding
  - Optimizes rendering and physics calculations

- **Coordinate Utilities:**
  - Efficient conversion between pixel, tile, and chunk coordinate systems
  - Optimized calculations for world positioning
  - Helper functions for coordinate transformations

- **Object Group Management:**
  - Organized management of solid and interactive objects
  - Efficient collision detection through physics groups
  - Automatic cleanup when objects are destroyed

## Player System

The player system includes:

- **Smooth Movement:**
  - Arrow key and WASD controls
  - Physics-based movement with collision detection
  - Configurable movement speed

- **Animations:**
  - Directional animations (up, down, left, right)
  - Walking and idle animation states
  - Smooth transitions between animation states

- **Inventory System:**
  - Basic inventory implementation with 28 slots
  - Support for item stacking
  - Methods for adding, removing, and checking items

## Technical Implementation

### Coordinate Systems

The game uses three coordinate systems:

1. **Pixel Coordinates:** Actual screen/world positions in pixels
2. **Tile Coordinates:** Grid-based positions where each tile is a discrete unit
3. **Chunk Coordinates:** Groups of tiles organized into chunks

The `CoordinateUtils` class provides methods to convert between these systems.

### Physics Integration

- **Collision Detection:**
  - Automatic collision setup for walls and objects
  - Physics bodies for interactive elements
  - Optimized collision through culling and grouping

- **Performance Optimization:**
  - Physics bodies are only active for visible objects
  - Static bodies for immovable objects
  - Dynamic bodies for moving entities

### Spawn System

The `SpawnManager` implements intelligent player spawning:

- Searches for suitable spawn locations (preferably beaches near water)
- Ensures the player doesn't spawn in water or inside objects
- Falls back to any valid ground tile if ideal conditions aren't found

## Game Controls

### Main Menu
- Click the "Enter World" button to start the game
- Mouse hover effects show button interactivity

### In-Game Controls
- **Arrow Keys or WASD:** Move the player character

## Configuration

The game is highly configurable through the `GameConfig` object:

- **Grid Settings:** Tile size (16px), chunk size (8 tiles)
- **Player Settings:** Movement speed (80), player size (12px)
- **World Settings:** Chunk load/unload radius, spawn search radius
- **Performance Settings:** Culling padding, physics radius, update intervals
- **Camera Settings:** Zoom level (2.5x)

## Known Bugs
- Player can sometimes spawn in the water or in trees, and cannot move. To fix, just reload the page to try loading in again.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Launch a development web server |
| `npm run build` | Create a production build in the `dist` folder |
| `npm run dev-nolog` | Launch a development web server without sending anonymous data |
| `npm run build-nolog` | Create a production build without sending anonymous data |

## Future Enhancements

Potential areas for future development:

- Additional tile layer for user generated content
- Persistent object destruction
- Additional biome types (desert, snow, forest)
- More object types (rocks, plants, structures)
- Interactive objects (resources to gather, NPCs)
- Day/night cycle with lighting effects
- Weather systems
- Expanded player capabilities (tools, combat)
- Save/load system for world persistence


