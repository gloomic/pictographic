const ANSWER_MARKS = ['❌', '✔️'];
const OPTION_BG_KEY = 'option-bg';
const OPTION_BG_HIGHLIGHT_KEY = 'option-bg-highlight';
let optionTextureCreated = false;

/**
 * A question option with an emoji/image, a text and a answer mark.
 */
export default class Option extends Phaser.GameObjects.Container {

    // x and y indicates the center position of the position.
    constructor(scene, x, y, w, h, optionConfig, style) {
        super(scene, x, y);

        this.width = w;
        this.height = h;
        if (!optionTextureCreated) {
            this.createTextures(w, h, style.bgStyle);
            optionTextureCreated = true;
        }

        // Background

        this.bgImage = this.scene.add.image(0, 0, OPTION_BG_KEY);
        this.add(this.bgImage);

        if (DEBUG) {
            console.log('option.size, w=%d, h=%d', this.width, this.height);
        }

        // Emoji

        x = 0;
        y = - this.height * 0.15;
        this.imageText = this.scene.add.text(x, y, optionConfig.image, style.emojiStyle).setOrigin(0.5, 0.5);
        this.add(this.imageText);

        this.image = this.scene.add.image(x, y, 'options', null);
        this.add(this.image);

        // Text

        let imageWidth = this.imageText.displayWidth;
        this.text = this.scene.add.text(x, 0, optionConfig.text, style.textStyle).setOrigin(0.5, 0);
        this.text.y = y + this.imageText.displayHeight * 0.6;
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
        if (optionConfig.image.endsWith('.png')) {
            this.image.setFrame(optionConfig.image, false, false).setActive(true).setVisible(true);
            this.imageText.setActive(false).setVisible(false);

        } else {
            this.imageText.setText(optionConfig.image).setActive(true).setVisible(true);
            this.image.setActive(false).setVisible(false);
        }
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

        const graphics = this.scene.make.graphics();

        let x = 0, y = 0;

        let borderWidth = Math.max(Math.floor(w * 0.01), 4);
        borderWidth += (borderWidth / 2 === 0) ? 0 : 1;
        x = y = borderWidth / 2;
        let rw = w - borderWidth;
        let rh = h - borderWidth;

        graphics.lineStyle(borderWidth, style.optionBorderColor);
        graphics.strokeRect(x, y, rw, rh);

        let padding = borderWidth * 3;
        graphics.fillStyle(style.foregroundColor);
        graphics.fillRect(x + padding, y + padding, rw - padding * 2, rh - padding * 2);

        graphics.generateTexture(OPTION_BG_KEY, w, h);

        graphics.clear();
        graphics.fillStyle(style.foregroundColor)
        graphics.fillRect(x + padding, y + padding, rw - padding * 2, rh - padding * 2);
        graphics.lineStyle(borderWidth, style.optionBoderHighlightColor);
        graphics.strokeRect(x, y, rw, rh);
        graphics.generateTexture(OPTION_BG_HIGHLIGHT_KEY, w, h);

        graphics.destroy();
    }
}
