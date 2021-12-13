import {Image, Audio} from '../common.js';

/**
 * Dislay game logo, title and play button.
 */
export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        // Logo and title

        let y = Math.floor(height * 0.25);
        let logo = this.add.image(centerX, y, Image.labels, Image.frameLogo);

        y += logo.displayHeight * 1.5;
        this.add.image(centerX, y,  Image.labels, Image.frameGameTitle);

        // Play button

        y = Math.floor(height * 0.6);
        this.add.image(centerX, y, Image.labels, Image.framePlayButton)
            .setInteractive()
            .on('pointerup', () => {
                this.sound.play(Audio.playGame);
                this.scene.start('GameScene');
            }
        );
    }
}
