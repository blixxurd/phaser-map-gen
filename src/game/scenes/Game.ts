import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { ChunkManager } from '../world/ChunkManager';
import { WorldGenerator } from '../world/WorldGenerator';
import { GameObject } from '../world/GameObject';
import { GameConfig } from '../config/GameConfig';
import { Player } from '../entities/Player';
import { CullingManager } from '../world/CullingManager';
import { SpawnManager } from '../world/SpawnManager';
import { ObjectGroupManager } from '../world/ObjectGroupManager';

/**
 * The main game scene.
 * This scene is responsible for handling the player's movement, camera, and the chunk manager.
 * It also handles the culling of objects that are outside the camera's view.
 */
export class Game extends Scene
{
    private player!: Player;
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
    public interactiveObjectsGroup!: Phaser.GameObjects.Group;
    public cullingManager!: CullingManager;
    private spawnManager!: SpawnManager;
    public objectGroupManager!: ObjectGroupManager;

    constructor ()
    {
        super({ key: 'Game' });
    }

    /**
     * Create the game scene.
     * This is called when the scene is created.
     */
    create ()
    {
        // Initialize managers
        this.worldGenerator = new WorldGenerator();
        this.cullingManager = new CullingManager(this.cameras.main);
        this.spawnManager = new SpawnManager(this.worldGenerator);
        this.objectGroupManager = new ObjectGroupManager(this);
        
        // Find spawn point and create player
        const spawnPoint = this.spawnManager.findBeachSpawnPoint();
        this.setupPlayer(spawnPoint);
        
        // Initialize chunk manager
        this.chunkManager = new ChunkManager(this, this.player);
        
        // Setup physics collisions
        this.physics.add.collider(
            this.player,
            this.objectGroupManager.solidObjectsGroup
        );
        
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

        EventBus.emit('current-scene-ready', this);
    }

    /**
     * Setup the player.
     * @param spawnPoint - The spawn point.
     */
    private setupPlayer(spawnPoint: { x: number, y: number }) {
        this.player = new Player(this, spawnPoint.x, spawnPoint.y);
        this.add.existing(this.player);
        
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(2.5);
    }

    /**
     * The main game update loop.
     */
    update() {
        this.player.handleMovement();
        this.chunkManager.update();
    }

    /**
     * Change the scene to the given scene.
     * @param scene - The scene to change to.
     */
    changeScene (scene: string)
    {
        this.scene.start(scene);
    }

    /**
     * Get the player's position.
     * @returns The player's position.
     */
    public getPlayerPosition() {
        return this.player.getPosition();
    }

    /**
     * Get the current tile type.
     * @returns The tile type of the current tile.
     */
    public getCurrentTileType() {
        if (this.player) {
            const worldX = Math.floor(this.player.x / GameConfig.GRID.TILE_SIZE);
            const worldY = Math.floor(this.player.y / GameConfig.GRID.TILE_SIZE);
            return this.worldGenerator.getTileType(worldX, worldY);
        }
        return null;
    }
}
