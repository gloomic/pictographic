import {Image, Audio, Style, QuestionType, StorageData} from '../common.js';
import levels from '../data/data.js';
import charMap from '../data/char-map.js';
import {Storage} from '../utils/adapter.js';

import Option from '../components/Option.js';
import CharEvolution from '../components/CharEvolution.js';

export default class GameScene extends Phaser.Scene {

    constructor() {
        super('GameScene');

        // Widgets.

        this.charEvolution;
        this.options;
        this.infoText;
        this.levelText;
        this.continueButton;
        this.menuButton;
        this.hintButton;

        // Sizes.

        this.charImageStepH = Math.floor(Image.charImageWidth * 1.2);
        this.nextStepDelay = 200;
        this.lineStep;

        // States.

        this.isPlayerFirst = false;
        this.levelIndex = 0;
        this.levelObj;
        this.charImageColCount = width > height ? 5 : 3;
        this.answered = false;
        this.answerCorrect = false;
    }

    create() {
        let layout = this.initLayout();

        //---------------- Dashboard,  char evolution, options and action bar.

        // Dashboard
        this.createDashboard(layout);

        // Char evolution.
        this.charEvolution = new CharEvolution(this, layout.charEvolutionX, layout.charEvolutionY,
            (width - layout.padding * 2), Image.charImageWidth, Style);
        this.charEvolution.y += this.charEvolution.height / 2; // Adjust y position.

        // Option.
        let y = this.charEvolution.y + this.charEvolution.height / 2;
        this.createOptionsAndTexts(y, layout);

        this.input.on('gameobjectdown', function (pointer, gameObject) {
            if (gameObject.clickCallback) {
                gameObject.clickCallback(gameObject);
            }

        }, this);

        // Action bar.
        this.createActionBar(layout);

        //---------------- Storage.

        if (!this.game.registry.get(StorageData.key)) {
            Storage.set(StorageData.key, {
                levelIndex: this.levelIndex,
                points: 0
            });
        }

        //---------------- Volume
        this.sound.volume = 0.4;
        this.clickSound = this.sound.add(Audio.click, {volume: 0.3});

        this.reset();
    }

    initLayout() {
        let padding = Math.floor(height * 0.02);
        let dashboardHeight = Math.floor(Image.charImageHeight / 2);

        let layout = {
            padding: padding,
            margin: padding * 2,
            dashboardHeight: dashboardHeight,

            charEvolutionX: centerX,
            charEvolutionY: padding + dashboardHeight + padding
        };

        if (DEBUG) {
            console.log('layout:');
            for (let p in layout) {
                console.log('%s=%d', p, layout[p]);
            }
        }

        return layout;
    }

    // Menu, continue, hint button.
    createActionBar(layout) {
        this.muteButton = this.add.image(0, 0, Image.labels, Image.frameMenu);
        this.continueButton = this.add.image(0, 0, Image.labels, Image.frameContinue)
            .setInteractive().on('pointerup', this.onContinueButtonClicked, this);
        this.hintButton = this.add.image(0, 0, Image.labels, Image.frameHint);

        let buttons = [this.muteButton, this.continueButton, this.hintButton];
        let cellW = Math.floor((width - layout.padding * 2) / buttons.length);
        let cellH = this.continueButton.displayHeight;
        Phaser.Actions.GridAlign(buttons, {
            width: buttons.length,
            height: 1,
            cellWidth: cellW,
            cellHeight: cellH,
            position: Phaser.Display.Align.CENTER,
            x: (width - cellW * buttons.length) / 2 + cellW / 2,
            y: (height - layout.padding) - cellH / 2
        });
    }

    createDashboard(layout) {
        let height = layout.dashboardHeight;
        let fontSize = Math.floor(height * 0.8);
        const textStyle = {
            fontFamily: Style.fontFamily,
            fontSize: fontSize,
            color: Style.lightColorStr
        };

        let x = centerX;
        let y = Math.floor(layout.padding + height / 2);
        this.levelText = this.add.text(x, y, '', textStyle).setOrigin(0.5, 0.5);
    }

    createOptionsAndTexts(topY, layout) {
        const textFontSize = Math.floor(Image.charImageWidth / 4);
        const textStyle = {
            fontFamily: Style.fontFamily,
            fontSize: textFontSize,
            color: Style.darkColorStr
        };
        const style = {
            emojiStyle: {
                    fontFamily: Style.fontFamily,
                    fontSize: Math.floor(Image.charImageWidth * 0.5),
                    color: Style.darkColorStr,
                    padding: {y: Math.floor(Image.charImageWidth * 0.1)}
            },
            textStyle: textStyle,
            bgStyle: Style
        };

        // Options.

        let x = width / 4;
        let y = topY + layout.margin;
        let w = Image.charImageWidth * 2;
        let h = Math.floor(Image.charImageWidth * 1.5);
        this.options = new Array(2);
        const optionConfig = {image: Image.optionDefaultEmoji, text: '', isAnswer: false};
        for (let i = 0; i < this.options.length; ++i) {
            this.options[i] = new Option(this, x, y, w, h, optionConfig, style);
            this.options[i].y += this.options[i].height * 0.5;
            this.options[i].setCallback(this.onOptionClicked);

            x += centerX;
        }

        // Info text in multiple lines.

        y += this.options[0].height + layout.margin;
        textStyle.color = Style.textColorStr;
        this.infoText = this.add.text(layout.padding, y, '', textStyle)
            .setWordWrapWidth(width - layout.padding * 2 , false)
            .setLineSpacing(Math.floor(textFontSize / 2));
    }

    reset() {
        this.levelObj = levels[this.levelIndex];
        if (this.levelObj.type === QuestionType.trueFalse) {
            let texture = charMap.get(this.levelObj.evolutionChars[0].image);
            if (DEBUG && !texture) {
                console.log('no texture', this.levelObj.evolutionChars[0].image);
            }
            this.charEvolution.setEvolutionChars(texture, this.levelObj.evolutionChars);
            this.setOptions(this.levelObj.options);
        }

        // Hide evolution, info, continue button.

        this.infoText.setActive(false).setVisible(false);
        this.levelText.setText(this.levelIndex + 1);
        this.continueButton.setActive(false).setVisible(false);

        this.charIndex = 0;
        this.answered = false;
    }

    setOptions(options) {
        for (let i = 0; i < options.length; ++i) {
            let option = options[i];
            this.options[i].setConfig(option);
        }
    }

    nextLevel() {
        this.levelIndex++;
        this.reset();
    }

    /**
     * Show evolution, info and continues button.
     */
    showGameOver() {
        this.charEvolution.showEvolution(1500);
        if (this.levelObj.info) {
            this.infoText.setText(Image.infoEmoji + this.levelObj.info).setActive(true).setVisible(true);
        }

        if ((this.levelIndex + 1) < levels.length) { // Not the last level
            this.continueButton.setActive(true).setVisible(true);
            this.tweens.add({
                targets: this.continueButton.setAlpha(0),
                alpha: 1,
                ease: 'Power3',
                delay: 1000,
                duration: 500,
                onStart: () => this.sound.play(Audio.ready)
            });
        }
    }

    onOptionClicked(optionGameObject) {
        if (DEBUG) {
            console.log('onOptionClicked');
        }

        if (!this.answered) {
            optionGameObject.highlight();
            optionGameObject.showAnswer();
            this.answered = true;
            this.answerCorrect = optionGameObject.isAnswer;

            if (this.answerCorrect) {
                this.winGame();
            } else {
                this.loseGame();
            }
        }
    }

    onContinueButtonClicked() {
        if (DEBUG) {
            console.log('Continue button is clicked');
        }

        this.clickSound.play();
        this.nextLevel();
    }

    nextLevel() {
        this.levelIndex++;
        this.reset();
    }

    winGame() {
        if (DEBUG) {
            console.log('win');
        }

        this.sound.play(Audio.true);
        this.time.delayedCall(500, this.showGameOver, [], this);
    }

    loseGame() {
        if (DEBUG) {
            console.log('lose');
        }

        this.sound.play(Audio.false);
        this.time.delayedCall(500, this.showGameOver, [], this);
    }
}
