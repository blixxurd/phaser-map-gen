export const GameConfig = {
    GRID: {
        TILE_SIZE: 16,      // Size of a single tile in pixels
        CHUNK_SIZE: 16,     // Number of tiles in a chunk (both width and height)
    },
    PLAYER: {
        SPEED: 200,         // Player movement speed
        SIZE: 16,          // Player size in pixels
    },
    WORLD: {
        CHUNK_LOAD_RADIUS: 2,   // Number of chunks to load around player
        CHUNK_UNLOAD_RADIUS: 3, // Distance at which chunks are unloaded
        SPAWN_SEARCH_RADIUS: 50 // Radius to search for spawn point
    }
} as const; 