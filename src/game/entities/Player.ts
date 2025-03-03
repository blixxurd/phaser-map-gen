import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

export interface InventorySlot {
    itemId: string | null;
    quantity: number;
}

export class Player extends Phaser.GameObjects.Rectangle {
    private inventory: InventorySlot[];
    private readonly INVENTORY_SIZE = 28;

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
} 