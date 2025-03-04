import { Scene } from 'phaser';
import { WorldGenerator } from './WorldGenerator';
import { GameObject } from './GameObject';
import { GameConfig } from '../config/GameConfig';
import { CoordinateUtils } from '../utils/CoordinateUtils';

/**
 * The ChunkManager is responsible for managing the chunks of the world.
 * It is responsible for loading and unloading chunks based on the player's position.
 * It is also responsible for creating and destroying chunks.
 */
export class ChunkManager {
    private chunks: Map<string, Phaser.GameObjects.Rectangle[]> = new Map();
    private gameObjects: Map<string, GameObject[]> = new Map();
    private loadedChunks: Set<string> = new Set();
    private scene: Scene;
    private worldGenerator: WorldGenerator;
    private player: Phaser.GameObjects.Rectangle;
    private tileSize: number;
    private chunkSize: number;

    constructor(
        scene: Scene, 
        player: Phaser.GameObjects.Rectangle, 
        tileSize: number = GameConfig.GRID.TILE_SIZE, 
        chunkSize: number = GameConfig.GRID.CHUNK_SIZE
    ) {
        this.scene = scene;
        this.player = player;
        this.tileSize = tileSize;
        this.chunkSize = chunkSize;
        this.worldGenerator = WorldGenerator.getInstance();
    }

    /**
     * Get the key for a chunk.
     * @param chunkX - The x coordinate of the chunk.
     * @param chunkY - The y coordinate of the chunk.
     * @returns The key for the chunk.
     */
    private getChunkKey(chunkX: number, chunkY: number): string {
        return `${chunkX},${chunkY}`;
    }

    /**
     * Generate a chunk.
     * @param chunkX - The x coordinate of the chunk.
     * @param chunkY - The y coordinate of the chunk.
     */
    generateChunk(chunkX: number, chunkY: number) {
        const key = this.getChunkKey(chunkX, chunkY);
        if (this.loadedChunks.has(key)) return;

        const tiles: Phaser.GameObjects.Rectangle[] = [];
        const objects: GameObject[] = [];
        
        // Get the starting tile coordinates for this chunk
        const { tileX: startX, tileY: startY } = CoordinateUtils.chunkToTile(chunkX, chunkY);

        for (let x = 0; x < this.chunkSize; x++) {
            for (let y = 0; y < this.chunkSize; y++) {
                // Calculate tile coordinates
                const tileX = startX + x;
                const tileY = startY + y;
                
                // Get tile type based on tile coordinates
                const tileType = this.worldGenerator.getTileType(tileX, tileY);
                
                // Convert to pixel coordinates for rendering
                const { pixelX, pixelY } = CoordinateUtils.tileToPixel(tileX, tileY, false);
                
                // Create tile
                const tile = this.scene.add.rectangle(
                    pixelX + this.tileSize/2, // Center of tile
                    pixelY + this.tileSize/2, // Center of tile
                    this.tileSize,
                    this.tileSize,
                    tileType.color
                );
                
                if (tileType.isWall) {
                    this.scene.physics.add.existing(tile, true);
                    const tileBody = tile.body as Phaser.Physics.Arcade.Body;
                    tileBody.setSize(this.tileSize, this.tileSize);
                    this.scene.physics.add.collider(this.player, tile);
                }
                
                // Create objects at the center of the tile
                const tileObject = this.worldGenerator.getTileObject(
                    this.scene, 
                    pixelX + this.tileSize/2,
                    pixelY + this.tileSize/2,
                    tileType
                );
                
                if (tileObject) {
                    objects.push(tileObject);
                }
                
                tiles.push(tile);
            }
        }

        this.chunks.set(key, tiles);
        this.gameObjects.set(key, objects);
        this.loadedChunks.add(key);

        objects.forEach(obj => {
            obj.setDepth(1);
        });
    }

    /**
     * Update the chunks based on the player's position.
     * This function loads chunks that are in the player's view and unloads chunks that are too far away.
     * See GameConfig for the load and unload distances.
     */
    update() {
        // Convert player's pixel position to chunk coordinates
        const { chunkX: playerChunkX, chunkY: playerChunkY } = CoordinateUtils.pixelToChunk(
            this.player.x, 
            this.player.y
        );
        
        // Generate chunks in view distance
        for (let x = -GameConfig.WORLD.CHUNK_LOAD_RADIUS; x <= GameConfig.WORLD.CHUNK_LOAD_RADIUS; x++) {
            for (let y = -GameConfig.WORLD.CHUNK_LOAD_RADIUS; y <= GameConfig.WORLD.CHUNK_LOAD_RADIUS; y++) {
                this.generateChunk(playerChunkX + x, playerChunkY + y);
            }
        }

        // Clean up far chunks
        this.loadedChunks.forEach(key => {
            const [chunkX, chunkY] = key.split(',').map(Number);
            if (Math.abs(chunkX - playerChunkX) > GameConfig.WORLD.CHUNK_UNLOAD_RADIUS || 
                Math.abs(chunkY - playerChunkY) > GameConfig.WORLD.CHUNK_UNLOAD_RADIUS) {
                const tiles = this.chunks.get(key);
                const objects = this.gameObjects.get(key);
                
                tiles?.forEach(tile => tile.destroy());
                objects?.forEach(obj => obj.destroy());
                
                this.chunks.delete(key);
                this.gameObjects.delete(key);
                this.loadedChunks.delete(key);
            }
        });
    }
} 