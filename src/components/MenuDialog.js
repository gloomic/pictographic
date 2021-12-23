import {Image, Style, Layout, StorageData} from '../common.js';
import levels from '../data/data.js';

import ToggleButton from '../components/ToggleButton.js';

/**
 * Dislay level menu.
 */
export default class MenuDialog extends Phaser.GameObjects.Layer {
    constructor(scene) {
        super(scene);

        this.levelBoard;
        this.interactiveChildren = [];

        this.currentLevelImage = null;
        this.flipEnabled = true;
        this.infoEnabled = true;

        this.createBackgroundTextureKey();
        let bg = this.scene.add.image(centerX, centerY, Image.dialogBackground);
        this.add(bg);
        this.createWidgets();

        // !Important. It needs to set a higher depth otherwise it will be covered by something.
        this.scene.add.existing(this).setDepth(Layout.dialogDepth);

        this.hide();
    }

    createWidgets() {
        //---------------- Level board

        let padding =  Math.floor(height * Layout.paddingHeightRatio);
        let boardWidth = portraitWidth - padding; // 1/2 padding
        const startX = (width - boardWidth) / 2;
        let x = startX; // Top left position of levelBoard.
        let y = padding;
        this.levelBoard = new LevelBoard(this.scene, x, y, boardWidth, this.onLevelImageClicked.bind(this));
        this.interactiveChildren.push(this.levelBoard);
        this.add(this.levelBoard);

        //---------------- Buttons

        const margin = padding * 2;
        y += this.levelBoard.height + margin; // Top of button.
        this.flipCharButton = new ToggleButton(this.scene, x, y,
            {key: Image.labels, frame: Image.frameFlip}, {key: Image.labels, frame: Image.frameFlipClose})
            .setInteractive().on('pointerup', this.onFlipCharButtonClicked, this);
        x += this.flipCharButton.displayWidth / 2;
        this.flipCharButton.x = x;
        y += this.flipCharButton.displayHeight / 2;
        this.flipCharButton.y = y;
        this.interactiveChildren.push(this.flipCharButton);
        this.add(this.flipCharButton);

        x += this.flipCharButton.displayWidth + margin;
        this.infoButton = new ToggleButton(
            this.scene, x, y,
            {key: Image.labels, frame: Image.frameInfo},
            {key: Image.labels, frame: Image.frameInfoClose},
            false
        ).setInteractive().on('pointerup', this.onInfoButtonClicked, this);
        this.interactiveChildren.push(this.infoButton);
        this.add(this.infoButton);

        x += this.infoButton.displayWidth / 2 + margin;
        const style = {
            fontFamily: Style.fontFamily,
            fontSize: this.flipCharButton.displayWidth / 2,
            color: Style.textColorStr
        };
        this.infoText = this.scene.add.text(x, y, '', style).setOrigin(0, 0.5);
        this.add(this.infoText);

        // Goto level buton
        x = startX + this.levelBoard.width;
        this.gotoLevelButton = this.scene.add.image(x, y, Image.labels, Image.frameContinue)
            .setOrigin(1, 0.5).setInteractive().on('pointerup', this.onGotoButtonClicked, this);
        this.interactiveChildren.push(this.gotoLevelButton);
        this.add(this.gotoLevelButton);

        // Close button
        y = height - padding;
        this.closeButton = this.scene.add.image(centerX, y, Image.labels, Image.frameClose)
            .setOrigin(0.5, 1).setInteractive().on('pointerup', this.onCloseButtonClicked, this);
        this.interactiveChildren.push(this.closeButton);
        this.add(this.closeButton);
    }

    createBackgroundTextureKey() {
        if (!this.scene.textures.exists(Image.dialogBackground)) {
            const graphics = this.scene.make.graphics();
            graphics.fillStyle(Style.backgroundColor).fillRect(0, 0, width, height);
            graphics.generateTexture(Image.dialogBackground, width, height);
            graphics.destroy();
        }
    }

    reset() {
        this.levelBoard.reset();
        this.infoText.setText('');
    }

    show() {
        this.setActive(true).setVisible(true);
        this.interactiveChildren.forEach(e => e.setVisible(true));
        this.reset();
    }

    hide() {
        this.setActive(false).setVisible(false);
        // Important! Avoid to error in in HTMLCanvasElement.onMouseUp.
        this.interactiveChildren.forEach(e => e.setVisible(false));
    }

    onFlipCharButtonClicked() {
        this.scene.playClickSound();
        this.flipCharButton.toggleFace();
    }

    onInfoButtonClicked() {
        this.scene.playClickSound();
        this.infoButton.toggleFace();

        if (this.infoButton.isEnabled()) {
            let levelImage = this.levelBoard.getHighlightLevelImage();
            if (levelImage && levelImage.charData.state === 1) {
                this.infoText.setText(levelImage.charData.meaning);
            }
        } else {
            this.infoText.setText('');
        }
    }

    onLevelImageClicked(levelImage) {
        this.scene.playClickSound();
        this.levelBoard.highlight(levelImage);

        if (this.infoButton.isEnabled()) {
            // Show meaning only if the info button is enabled and the level has been passed.
            if (levelImage.charData.state === 1) {
                this.infoText.setText(levelImage.charData.meaning);
            } else {
                this.infoText.setText('');
            }
        }

        if (this.flipCharButton.isEnabled()) {
            levelImage.toggleFace();
        }
    }

    gotoLevel(levelIndex) {
        this.scene.playClickSound();
        this.goBack();
        this.scene.gotoLevel(levelIndex);
    }

    onGotoButtonClicked() {
        this.scene.playClickSound();

        let levelImage = this.levelBoard.getHighlightLevelImage();
        if (levelImage) {
            this.gotoLevel(levelImage.charData.levelIndex);
        } else {
            this.goBack();
        }
    }

    onCloseButtonClicked() {
        this.scene.playClickSound();
        this.goBack();
    }

    /**
     * Back to scene.
     */
    goBack() {
        this.hide();
        this.scene.onDialogClosed();
    }
}

class LevelBoard  extends Phaser.GameObjects.Container {
    constructor(scene, x, y, w, clickCallback) {

        super(scene, x, y);

        this.width = w;
        // this.colCount = 10; // Layout by rows.
        // this.rowCount = Math.ceil(levels.length / this.colCount);

        this.rowCount = 10; // Layout by columns.
        this.colCount = Math.ceil(levels.length / this.rowCount)
        this.cellWidth = Math.floor(this.width / this.colCount);
        this.cellHeight = this.cellWidth;
        this.height = this.cellHeight * this.rowCount + this.cellHeight / 2; // blocks and the head line
        this.blockWidth = Math.floor(this.cellWidth * 0.92)
        this.blockHeight = this.blockWidth;
        this.disabledAlpha = 0.4;

        this.levelImages;

        this.create(clickCallback);
        this.scene.add.existing(this);
    }

    create(clickCallback) {
        const gridX = 0;
        let gridY = 0;

        let offsetX = gridX + this.cellWidth / 2; // Center of the first image.

        //---------------- Head line

        const style = {
            fontFamily: Style.fontFamily,
            color: Style.highlightColorStr,
            fontSize: Math.floor(this.cellHeight * 0.3)
        }
        for (let i = 0; i < this.colCount; ++i) {
            let text = this.scene.add.text(offsetX + this.cellWidth * i, gridY, i + 1, style)
                .setOrigin(0.5, 0);
            this.add(text);
        }
        gridY += this.cellHeight / 2;

        //---------------- Cell blocks

        this.levelImages =  new Array(levels.length);
        this.highlightLevelImage = null;

        this.createBlockTexture();

        // Do not use an outline to indicate the highlighted block.
        // The margin between blocks is too small to put an outline.

        //---------------- Cell chars


        let offsetY = gridY + this.cellHeight / 2;
        for (let i = 0; i < levels.length; ++i) {
            let levelObj = levels[i];

            // let row = Math.floor(i / this.colCount); // Layout by rows.
            // let col = i % this.colCount;
            let row = i % this.rowCount; // Layout by columns.
            let col = Math.floor(i / this.rowCount);
            let block = this.scene.add.image(offsetX + this.cellWidth * col,
                offsetY + this.cellHeight * row, Image.block);
            this.add(block);

            let answerOptionIndex = levelObj.options[0].isAnswer ? 0 : 1;
            let charData = {
                levelIndex: levelObj.no - 1,
                originalImage: levelObj.evolutionChars[0].image,
                regularImage: levelObj.evolutionChars[levelObj.evolutionChars.length - 1].image,
                meaning: levelObj.options[answerOptionIndex].text,
                state: -1
            };
            let levelImage = new ToggleButton(this.scene, block.x, block.y,
                {key: Image.levelChars, frame: charData.originalImage},
                {key: Image.levelChars, frame: charData.regularImage});
            levelImage.block = block;
            levelImage.block.setAlpha(this.disabledAlpha); // Disabled state.
            levelImage.clickCallback = clickCallback;
            levelImage.charData = charData;
            this.add(levelImage);
            this.levelImages[i] = levelImage;
        }
    }

    reset() {
        // Level images
        let storageData = this.scene.game.registry.get(StorageData.key);
        for (let i = 0; i < storageData.levelResult.length; ++i) {
            let state = storageData.levelResult[i];
            let levelImage = this.levelImages[i];
            if (levelImage.charData.state !== state) { // Upddate only if state being inconsistence.
                if (state === 0) {
                    levelImage.block.setAlpha(1).setTint(Style.failColor);
                    levelImage.setInteractive();

                } else if (state === 1) {
                    levelImage.block.setAlpha(1).setTint(Style.passColor);
                    levelImage.setInteractive();
                    levelImage.toggleFace();
                }
                levelImage.charData.state = state;
            }
        }

        // Block
        this.unhighlight();
    }

    getHighlightLevelImage() {
        return this.highlightLevelImage;
    }

    highlight(levelImage) {
        this.unhighlight();

        this.highlightLevelImage = levelImage;
        this.highlightLevelImage.block.clearTint();
    }

    unhighlight() {
        if (this.highlightLevelImage) {
            let charData = this.highlightLevelImage.charData;
            this.highlightLevelImage.block.setTint((charData.state === -1) ? Style.foregroundColor
                : (charData.state === 1 ? Style.passColor : Style.failColor));
            this.highlightLevelImage = null;
        }
    }

    /**
     * Generate block texture.
     */
    createBlockTexture() {
        if (!this.scene.textures.exists(Image.block)) {
            const graphics = this.scene.make.graphics();
            graphics.fillStyle(Style.foregroundColor)
                .fillRect(0, 0, this.blockWidth, this.blockHeight)
                .generateTexture(Image.block, this.blockWidth, this.blockHeight);

            graphics.destroy();
        }
    }
}
