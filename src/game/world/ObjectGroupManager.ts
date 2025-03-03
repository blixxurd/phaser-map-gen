import { Scene } from 'phaser';
import { GameObject } from './GameObject';

export class ObjectGroupManager {
    public solidObjectsGroup: Phaser.GameObjects.Group;
    public interactiveObjectsGroup: Phaser.GameObjects.Group;
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
        this.solidObjectsGroup = scene.add.group({ runChildUpdate: true });
        this.interactiveObjectsGroup = scene.add.group({ runChildUpdate: true });
    }

    public addSolidObject(obj: GameObject): void {
        this.solidObjectsGroup.add(obj);
    }

    public addInteractiveObject(obj: GameObject): void {
        this.interactiveObjectsGroup.add(obj);
    }

    public removeSolidObject(obj: GameObject): void {
        this.solidObjectsGroup.remove(obj, true, true);
    }

    public removeInteractiveObject(obj: GameObject): void {
        this.interactiveObjectsGroup.remove(obj, true, true);
    }

    public destroy(): void {
        this.solidObjectsGroup.destroy(true);
        this.interactiveObjectsGroup.destroy(true);
    }
} 