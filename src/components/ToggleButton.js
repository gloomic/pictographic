/**
 * A button with two status.
 */
export default class ToggleButton extends Phaser.GameObjects.Image {

    /**
     *
     * @param {Phaser.Scene} scene
     * @param {num} x
     * @param {num} y
     * @param {Object} enabledFace {key, frame}
     * @param {Object} disabledFace {key, frame}
     * @param {boolean} enabled
     */
    constructor(scene, x, y, enabledFace, disabledFace, enabled = true) {
        super(scene, x, y, enabledFace.key, enabledFace.frame);

        this.faces = [
            {key: disabledFace.key, frame: disabledFace.frame},
            {key: enabledFace.key, frame: enabledFace.frame},
        ];

        this.faceIndex = 1;
        if (!enabled) {
            this.toggleFace();
        }
    }

    toggleFace() {
        this.faceIndex = 1 - this.faceIndex;
        this.setTexture(this.faces[this.faceIndex].key, this.faces[this.faceIndex].frame);
    }

    isEnabled() {
        return this.faceIndex === 1;
    }
}
