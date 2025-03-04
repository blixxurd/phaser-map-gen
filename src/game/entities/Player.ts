import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { CoordinateUtils } from '../utils/CoordinateUtils';

export interface InventorySlot {
    itemId: string | null;
    quantity: number;
}

export class Player extends Phaser.GameObjects.Sprite {
    private inventory: InventorySlot[];
    private readonly INVENTORY_SIZE = 28;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasdKeys!: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };
    private currentAnimation: string = 'idle-down';

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, 'player-idle-down');
        
        // Scale the sprite to match the desired size
        this.setScale(GameConfig.PLAYER.SIZE / 16);
        
        // Initialize inventory with empty slots
        this.inventory = Array(this.INVENTORY_SIZE).fill(null).map(() => ({
            itemId: null,
            quantity: 0
        }));

        // Create animations
        this.createAnimations();

        // Enable physics
        scene.physics.add.existing(this);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(false);

        // Set the depth to ensure player is visible above terrain
        this.setDepth(100);

        // Setup input
        if (!scene.input.keyboard) {
            throw new Error('No keyboard found');
        }
        
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasdKeys = {
            W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        // Start with idle animation
        this.play('idle-down');
    }

    private createAnimations() {
        const FRAMES_PER_ANIMATION = 6;
        const walkFrameRate = GameConfig.PLAYER.SPEED / FRAMES_PER_ANIMATION;
        const idleFrameRate = 5;  // Slower frame rate for idle animations
        
        // Create idle animations with all frames
        ['down', 'left', 'right'].forEach(direction => {
            this.scene.anims.create({
                key: `idle-${direction}`,
                frames: this.scene.anims.generateFrameNumbers(`player-idle-${direction}`, {
                    start: 0,
                    end: 5  // Use all 6 frames for idle animations
                }),
                frameRate: idleFrameRate,
                repeat: -1  // Loop the idle animation
            });
        });

        // Create walking animations
        ['down', 'up', 'left', 'right'].forEach(direction => {
            this.scene.anims.create({
                key: `walk-${direction}`,
                frames: this.scene.anims.generateFrameNumbers(`player-walk-${direction}`, {
                    start: 0,
                    end: 5  // 6 frames total (0-5)
                }),
                frameRate: walkFrameRate,
                repeat: -1
            });
        });

        // Use walk-up first frame for idle-up since we don't have an idle-up sprite
        this.scene.anims.create({
            key: 'idle-up',
            frames: [{ key: 'player-walk-up', frame: 0 }],
            frameRate: 1
        });
    }

    public getInventory(): InventorySlot[] {
        return this.inventory;
    }

    public getInventorySlot(index: number): InventorySlot | null {
        if (index >= 0 && index < this.INVENTORY_SIZE) {
            return this.inventory[index];
        }
        return null;
    }

    public addItem(itemId: string, quantity: number = 1): boolean {
        // First try to stack with existing items
        for (let i = 0; i < this.INVENTORY_SIZE; i++) {
            if (this.inventory[i].itemId === itemId) {
                this.inventory[i].quantity += quantity;
                return true;
            }
        }

        // If no existing stack, find first empty slot
        for (let i = 0; i < this.INVENTORY_SIZE; i++) {
            if (this.inventory[i].itemId === null) {
                this.inventory[i].itemId = itemId;
                this.inventory[i].quantity = quantity;
                return true;
            }
        }

        // Inventory is full
        return false;
    }

    public removeItem(itemId: string, quantity: number = 1): boolean {
        for (let i = 0; i < this.INVENTORY_SIZE; i++) {
            if (this.inventory[i].itemId === itemId) {
                if (this.inventory[i].quantity >= quantity) {
                    this.inventory[i].quantity -= quantity;
                    if (this.inventory[i].quantity === 0) {
                        this.inventory[i].itemId = null;
                    }
                    return true;
                }
            }
        }
        return false;
    }

    public hasItem(itemId: string, quantity: number = 1): boolean {
        let totalQuantity = 0;
        for (const slot of this.inventory) {
            if (slot.itemId === itemId) {
                totalQuantity += slot.quantity;
                if (totalQuantity >= quantity) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Handle the player's movement. Should be called in the update loop.
     */
    public handleMovement() {
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0);
        const speed = GameConfig.PLAYER.SPEED;

        let moving = false;
        let newAnimation = this.currentAnimation;
        let dx = 0;
        let dy = 0;

        // Calculate movement direction
        if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
            dx = -1;
            newAnimation = 'walk-left';
            moving = true;
        } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
            dx = 1;
            newAnimation = 'walk-right';
            moving = true;
        }

        if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
            dy = -1;
            newAnimation = moving ? newAnimation : 'walk-up';
            moving = true;
        } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
            dy = 1;
            newAnimation = moving ? newAnimation : 'walk-down';
            moving = true;
        }

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            // Moving diagonally, normalize the speed
            const normalizer = 1 / Math.sqrt(2);
            dx *= normalizer;
            dy *= normalizer;
        }

        // Apply movement
        body.setVelocity(dx * speed, dy * speed);

        // If not moving, switch to idle animation
        if (!moving) {
            const direction = this.currentAnimation.split('-')[1];
            newAnimation = `idle-${direction}`;
        }

        // Only change animation if it's different
        if (newAnimation !== this.currentAnimation) {
            this.play(newAnimation);
            this.currentAnimation = newAnimation;
        }
    }

    /**
     * Get the player's position.
     */
    public getPosition() {
        return {
            x: this.x,
            y: this.y
        };
    }

    /**
     * Get the player's position in tile coordinates.
     */
    public getTilePosition() {
        return CoordinateUtils.pixelToTile(this.x, this.y);
    }

    /**
     * Get the player's position in chunk coordinates.
     */
    public getChunkPosition() {
        return CoordinateUtils.pixelToChunk(this.x, this.y);
    }
} 