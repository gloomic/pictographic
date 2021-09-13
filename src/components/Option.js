const ANSWER_MARKS = ['❌', '✔️'];
const OPTION_BG_KEY = 'option-bg';
const OPTION_BG_HIGHLIGHT_KEY = 'option-bg-highlight';
let optionTextureCreated = false;

/**
 * A question option with an emoji/image, a text and a answer mark.
 */
export default class Option extends Phaser.GameObjects.Container {
    constructor(scene, x, y, optionConfig, emojiStyle, textStyle, style) {
        super(scene, x, y);

        if (!optionTextureCreated) {
            let w = Math.floor(emojiStyle.fontSize * 3.84);
            let h = Math.floor(emojiStyle.fontSize * 2.8);
            this.createTextures(w, h, style);
        }

        // Background

        this.bgImage = this.scene.add.image(0, 0, OPTION_BG_KEY);
        this.add(this.bgImage);

        this.width = this.bgImage.displayWidth;
        this.height = this.bgImage.displayHeight;

        if (DEBUG) {
            console.log('option.size, w=%d, h=%d', this.width, this.height);
        }

        // Emoji

        x = 0;
        y = - this.height * 0.5 + this.height * 0.08;
        this.imageText = this.scene.add.text(x, y, optionConfig.image, emojiStyle).setOrigin(0.5, 0);
        this.add(this.imageText);

        // Text

        let imageWidth = this.imageText.displayWidth;
        this.text = this.scene.add.text(x, 0, optionConfig.text, textStyle).setOrigin(0.5, 0);
        this.text.y = y + this.imageText.displayHeight * 1.1;
        this.add(this.text);

        // Mark

        // Padding is necessary to avoid the top part being missing for some emoji chars
        // like check mark.
        const markStyle = {
            fontSize: Math.floor(imageWidth * 0.5),
            padding: {top: Math.floor(imageWidth * 0.1)}
        };
        x = Math.floor(this.width * 0.2);
        this.answerMark = this.scene.add.text(x, y, '', markStyle)
            .setActive(false).setVisible(false);
        this.add(this.answerMark);

        this.scene.add.existing(this);
    }

    reset() {
        this.highlight(false);
        this.answerMark.setActive(false).setVisible(false);
    }

    setCallback(callback) {
        this.setInteractive();
        this.clickCallback = callback.bind(this.scene);
        return this;
    }

    setConfig(optionConfig) {
        this.imageText.setText(optionConfig.image);
        this.text.setText(optionConfig.text);
        this.isAnswer = optionConfig.isAnswer;

        this.reset();
        return this;
    }

    highlight(value = true) {
        if (this.isHighlight !== value) {
            this.isHighlight = value;
            if (this.isHighlight) {
                this.bgImage.setTexture(OPTION_BG_HIGHLIGHT_KEY);
            } else {
                this.bgImage.setTexture(OPTION_BG_KEY);
            }
        }

        return this;
    }

    showAnswer() {
        this.answerMark.setText(ANSWER_MARKS[this.isAnswer? 1 : 0]).setActive(true).setVisible(true);
    }

    hideAnswer() {
        this.answerMark.setActive(false).setVisible(false);
    }

    createTextures(w, h, style) {
        if (this.scene.textures.exists(OPTION_BG_KEY)) {
            return;
        }

        optionTextureCreated = true;

        const graphics = this.scene.make.graphics();

        let x = 0, y = 0;

        let borderWidth = Math.max(Math.floor(w * 0.015), 4);
        borderWidth += (borderWidth / 2 === 0) ? 0 : 1;
        x = y = borderWidth / 2;
        let rw = w - borderWidth;
        let rh = h - borderWidth;
        graphics.lineStyle(borderWidth, style.optionBorderColor);
        graphics.strokeRect(x, y, rw, rh);
        graphics.generateTexture(OPTION_BG_KEY, w, h);

        graphics.clear();
        graphics.lineStyle(borderWidth, style.optionBoderHighlightColor);
        graphics.strokeRect(x, y, rw, rh);
        graphics.generateTexture(OPTION_BG_HIGHLIGHT_KEY, w, h);

        graphics.destroy();
    }
}
