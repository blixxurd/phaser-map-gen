import { Scene } from 'phaser';
import Alea from 'alea';
import { createNoise2D } from 'simplex-noise';
import { Tree } from './objects/Tree';
import { GameObject } from './GameObject';
import { CoordinateUtils } from '../utils/CoordinateUtils';

export interface TileType {
    isWall: boolean;
    color: number;
    name: string;
} 

/**
 * The WorldGenerator is responsible for generating the world.
 * 
 * It works in three separate noise layers:
 * - Terrain - This is used to generate the height map of the world, which is used to determine the type of tile at each point in the world.
 * - Resources - This is used to generate the resources in the world, which is used to determine if a tile contains a resource.
 * 
 * The WorldGenerator works hand in hand with the ChunkManager to generate the world.
 * The ChunkManager will call the WorldGenerator to get the tile type at a given position.
 * The ChunkManager will then use the tile type to generate the tiles and objects for a chunk.
 */
export class WorldGenerator {
    private static instance: WorldGenerator;
    
    /**
     * Get the singleton instance of WorldGenerator.
     * This ensures that all parts of the code use the same world generation.
     */
    public static getInstance(): WorldGenerator {
        if (!WorldGenerator.instance) {
            WorldGenerator.instance = new WorldGenerator();
        }
        return WorldGenerator.instance;
    }
    
    /**
     * The noise generators for the world.
     */
    public noise: {
        terrain: (x: number, y: number) => number;
        resources: (x: number, y: number) => number;
    };

    /**
     * Private constructor to enforce singleton pattern.
     * Use WorldGenerator.getInstance() instead of new WorldGenerator().
     */
    private constructor() {
        // Initialize noise generators with seeded PRNGs
        const terrainSeed = 'terrain' + Math.random();
        const resourcesSeed = 'resources' + Math.random();

        this.noise = {
            terrain: createNoise2D(Alea(terrainSeed)),
            resources: createNoise2D(Alea(resourcesSeed))
        };
    }

    /**
     * Get the noise value for a given position.
     * @param x - The x coordinate of the position.
     * @param y - The y coordinate of the position.
     * @param noiseFn - The noise function to use.
     * @param scale - The scale of the noise.
     * @returns The noise value for the given position (0-1)
     */
    getNoise(x: number, y: number, noiseFn: (x: number, y: number) => number, scale: number = 250): number {
        const octaves = 4;
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            value += amplitude * noiseFn(x * frequency / scale, y * frequency / scale);
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }

        return value / maxValue;
    }

    /**
     * Get the tile type for a given position.
     * @param x - The x coordinate of the position.
     * @param y - The y coordinate of the position.
     * @returns The tile type for the given position.
     */
    getTileType(x: number, y: number): TileType {
        const terrainHeight = this.getNoise(x, y, this.noise.terrain, 250);

        if (terrainHeight < -0.4) return { color: 0x0D4F8B, isWall: true, name: 'Water' };
        if (terrainHeight < -0.25) return { color: 0x1A75FF, isWall: true, name: 'Water' };
        if (terrainHeight < -0.15) return { color: 0x4F94CD, isWall: true, name: 'Water' };
        if (terrainHeight < -0.05) return { color: 0xF7E9C3, isWall: false, name: 'Sand' };
        if (terrainHeight < 0.2) return { color: 0x90B674, isWall: false, name: 'Light Grass' };
        if (terrainHeight < 0.4) return { color: 0x4A7340, isWall: false, name: 'Dark Grass' };
        if (terrainHeight < 0.6) return { color: 0x8B7355, isWall: false, name: 'Dirt' };
        if (terrainHeight < 0.8) return { color: 0x736F6E, isWall: true, name: 'Rock' };
        return { color: 0xE5E4E2, isWall: true, name: 'Rock' };
    }

    /**
     * Get the tile type for a given position in pixel coordinates.
     * @param pixelX - The x coordinate of the position in pixels.
     * @param pixelY - The y coordinate of the position in pixels.
     * @returns The tile type for the given position.
     */
    getTileTypeAtPixel(pixelX: number, pixelY: number): TileType {
        const { tileX, tileY } = CoordinateUtils.pixelToTile(pixelX, pixelY);
        return this.getTileType(tileX, tileY);
    }

    /**
     * Get the tile object for a given position.
     * @param scene - The scene to use.
     * @param pixelX - The x coordinate of the position in pixels.
     * @param pixelY - The y coordinate of the position in pixels.
     * @param tileType - The tile type for the given position.
     * @returns The tile object for the given position.
     */
    getTileObject(
        scene: Scene,
        pixelX: number,
        pixelY: number,
        tileType: TileType
    ): GameObject | null {
        const resourceValue = this.getResourceValue(pixelX, pixelY);
        // Only attempt to spawn trees on valid ground tiles
        if (!tileType.isWall && tileType.name !== 'Sand' && resourceValue > 0.15) {
            return new Tree(scene, pixelX, pixelY, tileType, this);
        }

        return null;
    }

    /**
     * Get the tile type for a given position.
     * @param x - The x coordinate of the position.
     * @param y - The y coordinate of the position.
     * @returns The tile type for the given position.
     */
    getTileTypeAt(x: number, y: number): TileType {
        return this.getTileType(x, y);
    }

    /**
     * Get the resource value for a given position.
     * @param x - The x coordinate of the position.
     * @param y - The y coordinate of the position.
     * @returns The resource value for the given position.
     */
    getResourceValue(x: number, y: number): number {
        return this.getNoise(x, y, this.noise.resources, 250);
    }
}