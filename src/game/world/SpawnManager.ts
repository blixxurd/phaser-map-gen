import { WorldGenerator } from './WorldGenerator';
import { GameConfig } from '../config/GameConfig';

export class SpawnManager {
    private worldGenerator: WorldGenerator;
    private searchRadius: number;
    private tileSize: number;

    constructor(worldGenerator: WorldGenerator) {
        this.worldGenerator = worldGenerator;
        this.searchRadius = GameConfig.WORLD.SPAWN_SEARCH_RADIUS;
        this.tileSize = GameConfig.GRID.TILE_SIZE;
    }

    public findBeachSpawnPoint(): { x: number, y: number } {
        let centerX = 0;
        let centerY = 0;
        
        // First pass: Look for beach tiles adjacent to water with no trees
        for (let r = 1; r < this.searchRadius; r++) {
            for (let x = -r; x <= r; x++) {
                for (let y = -r; y <= r; y++) {
                    const worldX = Math.floor(centerX/this.tileSize) + x;
                    const worldY = Math.floor(centerY/this.tileSize) + y;
                    
                    const currentTile = this.worldGenerator.getTileType(worldX, worldY);
                    const resourceValue = this.worldGenerator.getResourceValue(worldX * this.tileSize, worldY * this.tileSize);
                    
                    if (!currentTile.isWall && resourceValue <= 0.2) {
                        const hasAdjacentWater = [
                            this.worldGenerator.getTileType(worldX + 1, worldY),
                            this.worldGenerator.getTileType(worldX - 1, worldY),
                            this.worldGenerator.getTileType(worldX, worldY + 1),
                            this.worldGenerator.getTileType(worldX, worldY - 1)
                        ].some(tile => tile.isWall);

                        if (hasAdjacentWater) {
                            return {
                                x: worldX * this.tileSize + this.tileSize/2,
                                y: worldY * this.tileSize + this.tileSize/2
                            };
                        }
                    }
                }
            }
        }
        
        // Fallback: Look for any valid ground tile without trees
        for (let r = 1; r < this.searchRadius; r++) {
            for (let x = -r; x <= r; x++) {
                for (let y = -r; y <= r; y++) {
                    const worldX = Math.floor(centerX/this.tileSize) + x;
                    const worldY = Math.floor(centerY/this.tileSize) + y;
                    
                    const currentTile = this.worldGenerator.getTileType(worldX, worldY);
                    const resourceValue = this.worldGenerator.getResourceValue(worldX * this.tileSize, worldY * this.tileSize);
                    
                    if (!currentTile.isWall && resourceValue <= 0.2) {
                        return {
                            x: worldX * this.tileSize + this.tileSize/2,
                            y: worldY * this.tileSize + this.tileSize/2
                        };
                    }
                }
            }
        }
        
        return { x: centerX, y: centerY };
    }
} 