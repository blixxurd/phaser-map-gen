import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { ChunkManager } from '../world/ChunkManager';
import { WorldGenerator } from '../world/WorldGenerator';
import { GameObject } from '../world/GameObject';
import { GameConfig } from '../config/GameConfig';

export class Game extends Scene
{
    public player!: Phaser.GameObjects.Rectangle;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasdKeys!: {
      W: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
    }
    private chunkManager!: ChunkManager;
    public gameObjectsLayer!: Phaser.GameObjects.Layer;
    private worldGenerator!: WorldGenerator;
    public solidObjectsGroup!: Phaser.GameObjects.Group;
    private visibleObjects: Set<GameObject> = new Set();
    private cullPadding: number = GameConfig.GRID.TILE_SIZE * 2;

    constructor ()
    {
        super({ key: 'Game' });
    }

    create ()
    {
        this.worldGenerator = new WorldGenerator();
        
        // Find a suitable beach spawn point
        const spawnPoint = this.findBeachSpawnPoint();
        
        // Create player and setup
        this.setupPlayer(spawnPoint);
        
        // Initialize chunk manager
        this.chunkManager = new ChunkManager(this, this.player);

        if(!this.input.keyboard)
        {
            throw new Error('No keyboard found');
        }
        
        // Get cursor keys for movement
        this.cursors = this.input.keyboard.createCursorKeys();

        // Get WASD keys for movement
        this.wasdKeys = {
            W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        }

        if (!this.cursors) {
            console.error('No cursor keys found');
        }

        if (!this.wasdKeys) {
            console.error('No WASD keys found');
        }

        this.solidObjectsGroup = this.add.group();

        EventBus.emit('current-scene-ready', this);

        // Setup camera culling check
        this.cameras.main.on('camerascroll', this.cullObjects, this);
    }

    private setupPlayer(spawnPoint: { x: number, y: number }) {
        this.player = this.add.rectangle(
            spawnPoint.x, 
            spawnPoint.y, 
            GameConfig.PLAYER.SIZE, 
            GameConfig.PLAYER.SIZE, 
            0xff00ff
        );
        this.physics.add.existing(this.player);
        this.player.setDepth(100);
        
        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        playerBody.setCollideWorldBounds(false);
        
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(2.5);
    }

    private findBeachSpawnPoint(): { x: number, y: number } {
        const searchRadius = GameConfig.WORLD.SPAWN_SEARCH_RADIUS;
        const tileWorldSize = GameConfig.GRID.TILE_SIZE;
        
        let centerX = 0;
        let centerY = 0;
        
        // First pass: Look for beach tiles adjacent to water with no trees
        for (let r = 1; r < searchRadius; r++) {
            for (let x = -r; x <= r; x++) {
                for (let y = -r; y <= r; y++) {
                    const worldX = Math.floor(centerX/tileWorldSize) + x;
                    const worldY = Math.floor(centerY/tileWorldSize) + y;
                    
                    const currentTile = this.worldGenerator.getTileType(worldX, worldY);
                    const resourceValue = this.worldGenerator.getResourceValue(worldX * tileWorldSize, worldY * tileWorldSize);
                    
                    // Check if it's a valid ground tile AND has no tree (resource value <= 0.2)
                    if (!currentTile.isWall && resourceValue <= 0.2) {
                        const hasAdjacentWater = [
                            this.worldGenerator.getTileType(worldX + 1, worldY),
                            this.worldGenerator.getTileType(worldX - 1, worldY),
                            this.worldGenerator.getTileType(worldX, worldY + 1),
                            this.worldGenerator.getTileType(worldX, worldY - 1)
                        ].some(tile => tile.isWall);

                        if (hasAdjacentWater) {
                            return {
                                x: worldX * tileWorldSize + tileWorldSize/2,
                                y: worldY * tileWorldSize + tileWorldSize/2
                            };
                        }
                    }
                }
            }
        }
        
        // Fallback: Look for any valid ground tile without trees
        for (let r = 1; r < searchRadius; r++) {
            for (let x = -r; x <= r; x++) {
                for (let y = -r; y <= r; y++) {
                    const worldX = Math.floor(centerX/tileWorldSize) + x;
                    const worldY = Math.floor(centerY/tileWorldSize) + y;
                    
                    const currentTile = this.worldGenerator.getTileType(worldX, worldY);
                    const resourceValue = this.worldGenerator.getResourceValue(worldX * tileWorldSize, worldY * tileWorldSize);
                    
                    if (!currentTile.isWall && resourceValue <= 0.2) {
                        return {
                            x: worldX * tileWorldSize + tileWorldSize/2,
                            y: worldY * tileWorldSize + tileWorldSize/2
                        };
                    }
                }
            }
        }
        
        return { x: centerX, y: centerY };
    }

    update() {
        this.handlePlayerMovement();
        this.chunkManager.update();
        
        // Only update visible objects
        this.visibleObjects.forEach(obj => {
            if (obj.active) {
                obj.update();
            }
        });
    }

    private handlePlayerMovement() {
        const body = this.player.body as Phaser.Physics.Arcade.Body;
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

    changeScene ()
    {
        this.scene.start('GameOver');
    }

    // Add getter for player position
    public getPlayerPosition() {
        return {
            x: this.player.x,
            y: this.player.y
        };
    }

    private cullObjects(): void {
        const camera = this.cameras.main;
        const bounds = {
            left: camera.scrollX - this.cullPadding,
            right: camera.scrollX + camera.width + this.cullPadding,
            top: camera.scrollY - this.cullPadding,
            bottom: camera.scrollY + camera.height + this.cullPadding
        };

        // Cull objects outside camera view
        this.visibleObjects.forEach(obj => {
            const visible = obj.x >= bounds.left && 
                          obj.x <= bounds.right && 
                          obj.y >= bounds.top && 
                          obj.y <= bounds.bottom;
            
            obj.setVisible(visible);
            obj.setActive(visible);
            
            // Disable physics for culled objects
            if (obj.physicsBody) {
                obj.physicsBody.enable = visible;
            }
        });
    }

    // Add method to register objects for culling
    public registerForCulling(obj: GameObject): void {
        this.visibleObjects.add(obj);
    }

    public unregisterFromCulling(obj: GameObject): void {
        this.visibleObjects.delete(obj);
    }

    public getCurrentTileType() {
        if (this.player) {
            const worldX = Math.floor(this.player.x / GameConfig.GRID.TILE_SIZE);
            const worldY = Math.floor(this.player.y / GameConfig.GRID.TILE_SIZE);
            return this.chunkManager.worldGenerator.getTileTypeAt(worldX, worldY);
        }
        return null;
    }
}
