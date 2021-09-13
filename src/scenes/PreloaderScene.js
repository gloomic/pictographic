import {Image, Style, StorageData} from '../common.js';
import {Storage} from '../utils/adapter.js';

export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super('PreloaderScene');
    }

    preload() {

        // Progress bar

        let barWidth = Math.floor(width * 0.6);
        let barHeight = Math.floor(height * 0.04);
        let x = (width - barWidth) / 2;
        let y = centerY - barHeight / 2;
        let lineWidth = Math.max(Math.floor(barHeight * 0.1), 2);
        let progressBox = this.add.graphics();
        progressBox.lineStyle(lineWidth, Style.highlightColor)
            .strokeRect(x, y, barWidth, barHeight);

        let padding = lineWidth * 2;
        x += padding;
        y += padding;
        barWidth -= padding * 2;
        barHeight -= padding * 2;
        let progressBar = this.add.graphics();

        // Assets.

        this.load.setPath('assets/images/');

        this.load.atlas(Image.chars, 'chars.png', 'chars.json');
        this.load.atlas(Image.labels, 'labels.png', 'labels.json');

        // Loading progress.

        this.load.on('progress', function (value) {
            progressBar.clear();

            progressBar.fillStyle(Style.highlightColor)
                .fillRect(x, y, barWidth * value, barHeight);
        });

        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
        });
    }

    create() {
        this.loadStorage();
    }

    next() {
        this.scene.start('MainMenuScene');
    }

    loadStorage() {
        Storage.get(StorageData.key, (function (data) {
            this.game.registry.set(StorageData.key, data);
        }).bind(this), (function () {
            this.next();
        }).bind(this));
    }
}
