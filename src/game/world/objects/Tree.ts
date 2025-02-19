import { Scene, Physics } from 'phaser';
import { GameObject } from '../GameObject';
import { TileType, WorldGenerator } from '../WorldGenerator';
import { GameConfig } from '../../config/GameConfig';

export class Tree extends GameObject {
    protected worldGenerator: WorldGenerator;
    protected shape: Phaser.GameObjects.Triangle;

    constructor(scene: Scene, x: number, y: number, tile: TileType, worldGenerator: WorldGenerator) {
        super(scene, x, y, worldGenerator);
        this.worldGenerator = worldGenerator;
        
        // Add debug visualization
        const debugCircle = scene.add.circle(0, 0, 2, 0xff0000);
        this.add(debugCircle);
        
        // Create and assign the tree sprite
        this.shape = this.sprite(scene, GameConfig.GRID.TILE_SIZE, 0x2d5a27);
        this.add(this.shape);
        
        this.render();
    }

    public sprite(scene: Scene, size: number, color: number) {
        const halfTile = GameConfig.GRID.TILE_SIZE / 2;
        
        const triangle = scene.add.triangle(
            halfTile, halfTile,
            -halfTile, halfTile,  // left base vertex (at the bottom left of the tile)
            0, -halfTile,         // top vertex (at the top center of the tile)
            halfTile, halfTile,   // right base vertex (at the bottom right of the tile)
            color
        );
        
        return triangle;
    }

    public canSpawn(): boolean {
        const resourceValue = this.worldGenerator.getNoise(this.x, this.y, this.worldGenerator.noise.resources, 100);
        return resourceValue > 0.3;
    }
} 