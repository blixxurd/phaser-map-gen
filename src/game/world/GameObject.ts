import { Scene } from 'phaser';
import { TileType, WorldGenerator } from './WorldGenerator';
import { Game } from '../scenes/Game';
import { GameConfig } from '../config/GameConfig';

export class GameObject extends Phaser.GameObjects.Container {
    protected shape: Phaser.GameObjects.Shape;
    protected worldGenerator: WorldGenerator;
    public isSolid: boolean = true;
    public tileType: TileType;
    protected physicsRect: Phaser.GameObjects.Rectangle;
    protected physicsBody: Phaser.Physics.Arcade.StaticBody;

    constructor(
        scene: Scene, 
        x: number, 
        y: number,
        worldGenerator: WorldGenerator
    ) {
        super(scene, x, y);
        this.worldGenerator = worldGenerator;
        this.tileType = this.worldGenerator.getTileTypeAt(x, y);
    }

    protected setupPhysics(): void {
        if (this.isSolid) {
            // Create a separate invisible rectangle for physics
            this.physicsRect = this.scene.add.rectangle(
                this.x,
                this.y,
                GameConfig.GRID.TILE_SIZE,
                GameConfig.GRID.TILE_SIZE
            );
            
            // Enable physics on the rectangle
            this.scene.physics.add.existing(this.physicsRect, true);
            this.physicsBody = this.physicsRect.body as Phaser.Physics.Arcade.StaticBody;
            
            // Make the physics rectangle invisible
            this.physicsRect.setAlpha(0);
            
            // Debug visualization
            if (this.scene.physics.config.debug) {
                const debugRect = this.scene.add.rectangle(
                    0, 0,
                    GameConfig.GRID.TILE_SIZE,
                    GameConfig.GRID.TILE_SIZE,
                    0xff0000,
                    0.2
                );
                this.add(debugRect);
            }

            // Add collision with player
            const gameScene = this.scene as Game;
            if (gameScene.player) {
                this.scene.physics.add.collider(gameScene.player, this.physicsRect);
            }
        }
    }

    public destroy(fromScene?: boolean): void {
        // Clean up physics rectangle when destroying the object
        if (this.physicsRect) {
            this.physicsRect.destroy();
        }
        super.destroy(fromScene);
    }

    public canSpawn(): boolean {
        return false;
    }

    public update(): void {
        // Base update method - override in specific object classes
    }

    public render() {
        this.setDepth(50);
        this.scene.add.existing(this);
        this.setupPhysics();
    }
}