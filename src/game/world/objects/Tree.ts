import { Scene, Physics } from 'phaser';
import { GameObject } from '../GameObject';
import { TileType, WorldGenerator } from '../WorldGenerator';
import { GameConfig } from '../../config/GameConfig';

export class Tree extends GameObject {
    protected worldGenerator: WorldGenerator;
    protected treeSprite: Phaser.GameObjects.Sprite;

    constructor(scene: Scene, x: number, y: number, tile: TileType, worldGenerator: WorldGenerator) {
        super(scene, x, y, worldGenerator);
        this.worldGenerator = worldGenerator;
        
        // // Add debug visualization
        // const debugCircle = scene.add.circle(0, 0, 2, 0xff0000);
        // this.add(debugCircle);
        
        // Create and assign the tree sprite
        this.treeSprite = this.sprite(scene, GameConfig.GRID.TILE_SIZE);
        this.add(this.treeSprite);
        
        this.render();
    }

    public sprite(scene: Scene, size: number) {
        // Create a sprite and set a random frame for variety
        const sprite = scene.add.sprite(0, 0, 'trees');
        
        // Get the total number of frames in the spritesheet
        const totalFrames = scene.textures.get('trees').frameTotal;
        
        // Set a random frame
        sprite.setFrame(Phaser.Math.Between(0, totalFrames - 3));
        
        return sprite;
    }
} 