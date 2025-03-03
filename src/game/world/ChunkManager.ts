import { Scene } from 'phaser';
import { WorldGenerator } from './WorldGenerator';
import { GameObject } from './GameObject';
import { GameConfig } from '../config/GameConfig';

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
        this.worldGenerator = new WorldGenerator();
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
        const startX = chunkX * this.chunkSize;
        const startY = chunkY * this.chunkSize;

        for (let x = 0; x < this.chunkSize; x++) {
            for (let y = 0; y < this.chunkSize; y++) {
                const worldX = startX + x;
                const worldY = startY + y;
                const pixelX = worldX * this.tileSize;
                const pixelY = worldY * this.tileSize;
                
                const tileType = this.worldGenerator.getTileType(worldX, worldY);
                
                // Create tile
                const tile = this.scene.add.rectangle(
                    pixelX + this.tileSize/2,
                    pixelY + this.tileSize/2,
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
                
                // Create objects at the same position
                const tileObject = this.worldGenerator.getTileObject(
                    this.scene, 
                    pixelX + this.tileSize/2,
                    pixelY + this.tileSize/2,
                    tileType
                );
                
                if (tileObject) {
                    objects.push(tileObject);
                    // Note: Collision is now handled in GameObject.setupPhysics()
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
        const playerChunkX = Math.floor(this.player.x / (this.chunkSize * this.tileSize));
        const playerChunkY = Math.floor(this.player.y / (this.chunkSize * this.tileSize));
        
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