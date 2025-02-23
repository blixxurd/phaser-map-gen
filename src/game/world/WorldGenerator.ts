import { Scene } from 'phaser';
import Alea from 'alea';
import { createNoise2D } from 'simplex-noise';
import { Tree } from './objects/Tree';
import { GameObject } from './GameObject';

export interface TileType {
    isWall: boolean;
    color: number;
    name: string;
} 

export class WorldGenerator {
    public noise: {
        terrain: (x: number, y: number) => number;
        water: (x: number, y: number) => number;
        resources: (x: number, y: number) => number;
    };

    constructor() {
        // Initialize noise generators with seeded PRNGs
        const terrainSeed = 'terrain' + Math.random();
        const waterSeed = 'water' + Math.random();
        const resourcesSeed = 'resources' + Math.random();

        this.noise = {
            terrain: createNoise2D(Alea(terrainSeed)),
            water: createNoise2D(Alea(waterSeed)),
            resources: createNoise2D(Alea(resourcesSeed))
        };
    }

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

    getTileObject(
        scene: Scene,
        pixelX: number,
        pixelY: number,
        tileType: TileType,
    ): GameObject | null {
        const resourceValue = this.getResourceValue(pixelX, pixelY);
        // Only attempt to spawn trees on valid ground tiles
        if (!tileType.isWall && tileType.name !== 'Sand' && resourceValue > 0.2) {
            return new Tree(scene, pixelX, pixelY, tileType, this);
        }

        return null;
    }

    getTileTypeAt(x: number, y: number): TileType {
        return this.getTileType(x, y);
    }

    getResourceValue(x: number, y: number): number {
        return this.getNoise(x, y, this.noise.resources, 250);
    }
}