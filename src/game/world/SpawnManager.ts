import { WorldGenerator } from './WorldGenerator';
import { GameConfig } from '../config/GameConfig';
import { CoordinateUtils } from '../utils/CoordinateUtils';

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
                    // Convert center pixel coordinates to tile coordinates
                    const { tileX: baseTileX, tileY: baseTileY } = CoordinateUtils.pixelToTile(centerX, centerY);
                    const tileX = baseTileX + x;
                    const tileY = baseTileY + y;
                    
                    const currentTile = this.worldGenerator.getTileType(tileX, tileY);
                    
                    // Convert tile coordinates to pixel for resource value check
                    const { pixelX, pixelY } = CoordinateUtils.tileToPixel(tileX, tileY);
                    const resourceValue = this.worldGenerator.getResourceValue(pixelX, pixelY);
                    
                    if (!currentTile.isWall && resourceValue <= 0.2) {
                        const hasAdjacentWater = [
                            this.worldGenerator.getTileType(tileX + 1, tileY),
                            this.worldGenerator.getTileType(tileX - 1, tileY),
                            this.worldGenerator.getTileType(tileX, tileY + 1),
                            this.worldGenerator.getTileType(tileX, tileY - 1)
                        ].some(tile => tile.isWall);

                        if (hasAdjacentWater) {
                            // Return the center of the tile in pixel coordinates
                            const { pixelX, pixelY } = CoordinateUtils.tileToPixel(tileX, tileY);
                            return { x: pixelX, y: pixelY };
                        }
                    }
                }
            }
        }
        
        // Fallback: Look for any valid ground tile without trees
        for (let r = 1; r < this.searchRadius; r++) {
            for (let x = -r; x <= r; x++) {
                for (let y = -r; y <= r; y++) {
                    const { tileX: baseTileX, tileY: baseTileY } = CoordinateUtils.pixelToTile(centerX, centerY);
                    const tileX = baseTileX + x;
                    const tileY = baseTileY + y;
                    
                    const currentTile = this.worldGenerator.getTileType(tileX, tileY);
                    const { pixelX, pixelY } = CoordinateUtils.tileToPixel(tileX, tileY);
                    const resourceValue = this.worldGenerator.getResourceValue(pixelX, pixelY);
                    
                    if (!currentTile.isWall && resourceValue <= 0.2) {
                        const { pixelX, pixelY } = CoordinateUtils.tileToPixel(tileX, tileY);
                        return { x: pixelX, y: pixelY };
                    }
                }
            }
        }
        
        return { x: centerX, y: centerY };
    }
} 