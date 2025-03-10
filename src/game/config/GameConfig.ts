/**
 * GameConfig is a configuration object that contains all the configuration for the game.
 */

export const GameConfig = {
    // Grid constants
    GRID: {
        TILE_SIZE: 16,      // Size of a single tile in pixels
        CHUNK_SIZE: 8,     // Number of tiles in a chunk (both width and height)
    },
    // Player constants
    PLAYER: {
        SPEED: 80,         // Player movement speed
        SIZE: 12,          // Player size in pixels
    },
    // World constants
    WORLD: {
        CHUNK_LOAD_RADIUS: 4,   // Number of chunks to load around player
        CHUNK_UNLOAD_RADIUS: 5, // Distance at which chunks are unloaded
        SPAWN_SEARCH_RADIUS: 300 // Radius to search for spawn point
    },
    // Performance and garbage collection configuration
    PERFORMANCE: {
        CULLING_PADDING: 32,      // Pixels beyond camera view to maintain objects
        UPDATE_INTERVAL: 200,     // Ms between distant object updates
        PHYSICS_RADIUS: 400,      // Active physics radius around player
        MAX_VISIBLE_OBJECTS: 10  // Maximum simultaneous visible objects
    },
    // Camera constants
    CAMERA: {
        ZOOM: 2.5,            // Camera zoom level
    }
} as const; 