import { Scene } from 'phaser';
import { GameObject } from './GameObject';
import { GameConfig } from '../config/GameConfig';

export class CullingManager {
    private visibleObjects: Set<GameObject> = new Set();
    private cullPadding: number;
    private camera: Phaser.Cameras.Scene2D.Camera;

    constructor(camera: Phaser.Cameras.Scene2D.Camera, cullPadding: number = GameConfig.GRID.TILE_SIZE * 2) {
        this.camera = camera;
        this.cullPadding = cullPadding;
        
        // Setup camera culling check
        this.camera.on('camerascroll', this.cullObjects, this);
    }

    public registerObject(obj: GameObject): void {
        this.visibleObjects.add(obj);
    }

    public unregisterObject(obj: GameObject): void {
        this.visibleObjects.delete(obj);
    }

    private cullObjects(): void {
        const bounds = {
            left: this.camera.scrollX - this.cullPadding,
            right: this.camera.scrollX + this.camera.width + this.cullPadding,
            top: this.camera.scrollY - this.cullPadding,
            bottom: this.camera.scrollY + this.camera.height + this.cullPadding
        };

        this.visibleObjects.forEach(obj => {
            const visible = obj.x >= bounds.left && 
                          obj.x <= bounds.right && 
                          obj.y >= bounds.top && 
                          obj.y <= bounds.bottom;
            
            if (obj.visible !== visible) {
                obj.setVisible(visible);
                obj.setActive(visible);
                
                if (obj.body) {
                    const body = obj.body as Phaser.Physics.Arcade.Body;
                    body.enable = visible;
                    if (!visible) {
                        body.setVelocity(0, 0);
                    }
                }
            }
        });
    }

    public destroy(): void {
        this.camera.off('camerascroll', this.cullObjects, this);
        this.visibleObjects.clear();
    }
} 