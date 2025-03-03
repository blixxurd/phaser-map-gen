import { Scene } from 'phaser';
import { TileType, WorldGenerator } from './WorldGenerator';
import { Game } from '../scenes/Game';
import { GameConfig } from '../config/GameConfig';

/**
 * Base class for all objects in the game.
 * All objects in the game should extend this class. 
 * Each object is responsible for its own rendering and physics.
 * It is also responsible for registering and unregistering itself from the culling system.
 */
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

    /**
     * Setup the physics for the object.
     */
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

            // Add to appropriate group based on object type
            const gameScene = this.scene as Game;
            if (gameScene.objectGroupManager) {
                gameScene.objectGroupManager.addSolidObject(this.physicsRect);
            }
        }
    }

    /**
     * Destroy the object.
     * @param fromScene - Whether the object is being destroyed from the main game scene.
     */
    public destroy(fromScene?: boolean): void {
        if (this.scene instanceof Game) {
            this.scene.cullingManager.unregisterObject(this);
            
            if (this.isSolid && this.physicsRect) {
                this.scene.objectGroupManager.removeSolidObject(this.physicsRect);
            }
        }
        
        if (this.physicsRect) {
            this.physicsRect.destroy();
        }
        super.destroy(fromScene);
    }

    /**
     * Update the object.
     */
    public update(): void {
        // Base update method - override in specific object classes
        if (this.physicsRect) {
            // Update physics body position if it exists
            this.physicsRect.setPosition(this.x, this.y);
        }
    }

    /**
     * Render the object.
     */
    public render() {
        this.setDepth(50);
        this.scene.add.existing(this);
        this.setupPhysics();
        
        // Register for culling using the new manager
        if (this.scene instanceof Game) {
            this.scene.cullingManager.registerObject(this);
        }
    }
}