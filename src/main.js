import '../libs/phaser.min.js'; // v3.51.0, note there are issues with v3.53.1 if running it in browser directly.

import {Style} from './common.js';
import PreloaderScene from './scenes/PreloaderScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import GameScene from './scenes/GameScene.js';

window.DEBUG = true;
window.width = 1500;
window.height = 2400;

function getSizeAccordingToRatio() {
    const deviceSize = {
        width: window.innerWidth * window.devicePixelRatio,
        height: window.innerHeight * window.devicePixelRatio
    };

    const desiredLandscapeSize = { // ratio: 12 / 9 = 1.333
        width: 3200, // 2400,
        height: 2400 // 1800
    };
    const desiredPortraitSize = { // ratio: 1.6
        width: 1500, // 1125,  // 375 x 4
        height: 2400 // 1800 // 600 * 4
    }

    const minLandscapeAspectRatio = desiredLandscapeSize.width / desiredLandscapeSize.height;
    const maxLandscapeAspectRatio = 1.5;

    // Set game size to the screen size if the ratio is proper for landscape mode,
    // otherwise use portrait. In both modes, the screen height controls width.
    let ratio = (deviceSize.width / deviceSize.height);
    if (ratio > minLandscapeAspectRatio) { // Landscape
        height = desiredLandscapeSize.height;
        width = height * (ratio > maxLandscapeAspectRatio ? maxLandscapeAspectRatio : ratio);
    } else { // Portrait
        // Based on width
        width = desiredPortraitSize.width;

        const minPortraitAspectRatio = desiredPortraitSize.height / desiredPortraitSize.width;
        const maxPortraitAspectRatio = 2;
        ratio = deviceSize.height / deviceSize.width;
        ratio = ratio < minPortraitAspectRatio ?
            minPortraitAspectRatio : (ratio > maxPortraitAspectRatio ? maxPortraitAspectRatio : ratio);
        height = width * ratio;
    }

    width = Math.floor(width);
    height = Math.floor(height);
}

getSizeAccordingToRatio();
window.centerX = Math.floor(width * 0.5);
window.centerY = Math.floor(height * 0.5);
if (DEBUG) {
    console.log('screenW=%d, screenH=%d', window.innerWidth, window.innerHeight);
    console.log('w=%d', width);
    console.log('h=%d', height);
    console.log('centerX=%d', centerX);
    console.log('window.devicePixelRatio=%d', window.devicePixelRatio);
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: Style.backgroundColor,
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: width,
        height: height,
        mode: Phaser.Scale.ScaleModes.FIT // For better overall display on kinds of browsers cmpared to using zoom.
    },
    scene: [PreloaderScene, MainMenuScene, GameScene]
};

const game = new Phaser.Game(config);
