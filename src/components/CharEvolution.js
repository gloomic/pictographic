const CHARS_KEY = 'chars';
const GLYPH_COUNT = 5;
const EVOLUTION_BG_KEY = 'evolution-bg';
const EVOLUTION_LINE_KEY = 'evolution-line';

/**
 * A container game object which displays the glyph evolution of a char and its earliest glyph form
 * as the main char.
 */
export default class CharEvolution extends Phaser.GameObjects.Container {
    constructor(scene, x, y, width, charImageWidth, style, evolutionChars = null) {
        super(scene, x, y);

        this.width = width;
        this.height = Math.floor(charImageWidth * 4); // Evolution line height + height of 3 chars.

        this.charImageWidth = this.charImageHeight = charImageWidth;
        this.charImageStepH = Math.floor(this.charImageHeight * 1.1);

        // Background, evolution line, char images.

        this.charImageColCount;
        this.charImageLayout;
        this.lineStep;
        this.createBgAndEvolutionLine(style);

        this.evolutionChars = evolutionChars;
        this.charImageGroup = this.scene.add.group();
        this.mainCharImage = null;

        // State

        this.charIndex = 0;

        this.scene.add.existing(this);
    }

    reset() {
        this.charIndex = 0;

        this.hideEvolution();
    }

    setEvolutionChars(texture, evolutionChars) {
        this.reset();
        this.evolutionChars = evolutionChars;
        this.texture = texture;

        if (!this.mainCharImage) {
            this.mainCharImage = this.scene.add.image(0, 0, this.texture, this.evolutionChars[0].image);
            this.add(this.mainCharImage);
        } else {
            this.mainCharImage.setTexture(this.texture, this.evolutionChars[0].image);
        }
    }

    createBgAndEvolutionLine(style) {
        // Allow the char images of clerical and regular to be located on the same column with seal.
        // this.charImageColCount = this.width > (this.charImageWidth * 7) ? GLYPH_COUNT : GLYPH_COUNT - 2;

        // All char images are located on the same row, if the space is not enough, scale them to half size.
        // ---.---.---.---.---.---
        //    c   c   c   c   c
        this.charImageColCount = GLYPH_COUNT;
        let minWidth = this.charImageWidth * this.charImageColCount * 1.5;
        this.charImageScale = this.width > minWidth ? -1 : 0.5;

        const x = - this.width / 2;
        const y = - this.height / 2;
        // More offset if the width is enough.
        let firstCharImageX = this.charImageWidth * (this.charImageScale > 0 ? 0.6 : 1.2);
        let charImageX = Math.floor(x + firstCharImageX);
        let charImageY = Math.floor(y + this.charImageHeight * 0.9);

        this.lineStep = (this.width - firstCharImageX * 2) / (this.charImageColCount - 1);

        this.charImageLayout = {};
        let glyphs = ['oracle', 'bronze', 'seal', 'clerical', 'regular'];
        for (let glyph of glyphs) {
            this.charImageLayout[glyph] = {
                x: charImageX,
                y: charImageY
            };
            charImageX += this.lineStep;
        }

        // If there are not enough for 5 columns.
        for (let i = this.charImageColCount; i < glyphs.length; i++) {
            this.charImageLayout[glyphs[i]].x = this.charImageLayout[glyphs[i - 1]].x;
            this.charImageLayout[glyphs[i]].y = this.charImageLayout[glyphs[i - 1]].y + this.charImageStepH;
        }

        this.createTextures(firstCharImageX, style);
        this.add(this.scene.add.image(0, 0, EVOLUTION_BG_KEY));
        this.evolutionLine = this.scene.add.image(0, (y + this.charImageWidth * 0.1), EVOLUTION_LINE_KEY)
            .setOrigin(0.5, 0).setActive(false).setVisible(false);
        this.add(this.evolutionLine);
    }

    showCharImages(count = 1) {
        if (!this.evolutionChars) {
            return;
        }

        for (let i = this.charIndex; i < this.evolutionChars.length; ++i) {
            let evolutionChar = this.evolutionChars[i];
            let charImage = this.charImageGroup.getFirstDead();
            if (!charImage) {
                charImage = this.scene.add.image(0, 0, this.texture, evolutionChar.image);
                if (this.charImageScale > 0) {
                    charImage.setScale(this.charImageScale);
                }
                this.charImageGroup.add(charImage);
                this.add(charImage);
            } else {
                charImage.setTexture(this.texture, evolutionChar.image);
            }
            let layout = this.charImageLayout[evolutionChar.glyph];
            charImage.setPosition(layout.x, layout.y)
                .setActive(true).setVisible(true);

            this.charIndex++;

            if (count > 0 && !(--count)) {
                return;
            }
        }
    }

    showEvolution() {
        this.evolutionLine.setActive(true).setVisible(true);
        this.showCharImages(-1);
    }

    hideEvolution() {
        this.evolutionLine.setActive(false).setVisible(false);
        this.charImageGroup.getChildren().forEach(e => e.setActive(false).setVisible(false));
    }

    /**
     * It allows 3 evolution chars at most for oracle and bronze,
     * it allows only one for the rest of the glhpys.
     *
     * @param {number} count How many char images to display. -1 indicates all of the rest.
     */
    showCharImagesForOneGlyphMultipleImages(count = 1) {
        if (!this.evolutionChars) {
            return;
        }

        let tempImageIndex = this.charImageIndex;
        for (let i = this.charIndex; i < this.evolutionChars.length; ++i) {
            let evolutionChar = this.evolutionChars[i];
            for (let j = tempImageIndex; j < evolutionChar.images.length; ++j) {
                let charImage = this.charImageGroup.getFirstDead();
                if (!charImage) {
                    charImage = this.scene.add.image(0, 0, CHARS_KEY, evolutionChar.images[j]);
                    if (this.charImageScale > 0) {
                        charImage.setScale(this.charImageScale);
                    }
                    this.charImageGroup.add(charImage);
                    this.add(charImage);
                } else {
                    charImage.setTexture(evolutionChar.images[j]);
                }
                let layout = this.charImageLayout[evolutionChar.glyph];
                charImage.setPosition(layout.x, layout.y + this.charImageStepH * j)
                    .setActive(true).setVisible(true);

                this.charImageIndex++;

                if (count > 0 && !(--count)) {
                    return;
                }
            }
            tempImageIndex = 0; // for later loop except the first one.

            this.charIndex++;
        }
    }

    /**
     * Create a background texture and evolution line texture.
     */
    createTextures(firstCharImageX, style, drawBorder = true) {
        if (this.scene.textures.exists(EVOLUTION_BG_KEY)) {
            return;
        }

        const graphics = this.scene.make.graphics();

        let x = 0, y = 0, w, h;

        // Border and background

        if (drawBorder) {
            let borderWidth = Math.max(Math.floor(this.height * 0.008), 4);
            borderWidth += (borderWidth % 2 === 0) ? 0 : 1;
            x = y = borderWidth / 2;
            w = this.width - borderWidth;
            h = this.height - borderWidth;
            graphics.lineStyle(borderWidth, style.evolutionBorderColor);
            graphics.strokeRect(x, y, w, h);

            x = y = borderWidth * 4;
        }

        w = this.width - x * 2;
        h = this.height - y * 2;
        graphics.fillStyle(style.evolutionBackgroundColor);
        graphics.fillRect(x, y, w, h);

        graphics.generateTexture(EVOLUTION_BG_KEY, this.width, this.height);

        // Evolution Line

        graphics.clear();

        const lineWidth = Math.floor(this.charImageWidth * 0.03);
        x += lineWidth * 4;
        y += lineWidth * 2;
        w = this.width - x * 2;
        graphics.lineStyle(lineWidth, style.evolutionLineColor);
        graphics.beginPath();
        graphics.moveTo(x, y);
        x += w;
        graphics.lineTo(x, y);

        // Arrow
        let arrowOffsetX = lineWidth * 5;
        let arrowOffsetY = lineWidth * 2;
        graphics.moveTo(x - arrowOffsetX, y - arrowOffsetY);
        graphics.lineTo(x, y);
        graphics.lineTo(x - arrowOffsetX, y + arrowOffsetY);

        graphics.strokePath();

        // Dots on the line.
        const dotRadius = lineWidth * 2;
        x = firstCharImageX;
        graphics.fillStyle(style.evolutionLineColor);
        for (let i = 0; i < this.charImageColCount; ++i) {
            graphics.fillCircle(x, y, dotRadius);
            x += this.lineStep;
        }

        graphics.generateTexture(EVOLUTION_LINE_KEY, this.width, y * 2);
        graphics.destroy();
    }
}
