import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

export interface InventorySlot {
    itemId: string | null;
    quantity: number;
}

export class Player extends Phaser.GameObjects.Rectangle {
    private inventory: InventorySlot[];
    private readonly INVENTORY_SIZE = 28;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasdKeys!: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, GameConfig.PLAYER.SIZE, GameConfig.PLAYER.SIZE, 0xff00ff);
        
        // Initialize inventory with empty slots
        this.inventory = Array(this.INVENTORY_SIZE).fill(null).map(() => ({
            itemId: null,
            quantity: 0
        }));

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

        if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
            body.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
            body.setVelocityX(speed);
        }

        if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
            body.setVelocityY(-speed);
        } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
            body.setVelocityY(speed);
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
} 