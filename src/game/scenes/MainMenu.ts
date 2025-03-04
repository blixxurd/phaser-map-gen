import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    title: GameObjects.Text;
    enterButton: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        // Get the center coordinates of the screen
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Set background to black using a rectangle instead of an image
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000).setOrigin(0);

        this.title = this.add.text(centerX, centerY - 50, 'Generative RPG Demo', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Create simple text button
        this.enterButton = this.add.text(centerX, centerY + 50, 'Enter World', {
            fontFamily: 'Arial Black', 
            fontSize: 32, 
            color: '#ff0000',
            align: 'center'
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
            this.enterButton.setColor('#00ff00');
        })
        .on('pointerout', () => {
            this.enterButton.setColor('#ff0000');
        })
        .on('pointerdown', () => this.changeScene());

        EventBus.emit('current-scene-ready', this);
    }
    
    changeScene ()
    {
        this.scene.start('Game');
    }
}

