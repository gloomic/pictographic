const Image = {
    chars: 'chars',
    charImageWidth: 256,
    charImageHeight: 256,

    options: 'options',
    optionDefaultEmoji: '⬜',
    infoEmoji: '💡 ',

    labels: 'labels.png',
    frameLogo: 'logo.png',
    frameGameTitle: 'game-title.png',
    framePlayButton: 'play.png',
    frameMenu: 'menu.png',
    frameContinue: 'continue.png',
    frameVolume: 'volume.png',
    frameMute: 'mute.png',
    frameHint: 'eye.png',
    frameClose: 'close.png'
}

const Style = {
    fontFamily: 'Helvetica, Arial',
    textColorStr: '#eeeeee',
    lightColor: 0xeeeeee,
    lightColorStr: '#eeeeee',
    darkColor: 0x201b17,
    darkColorStr: '#201b17',
    foregroundColor: 0xfdeca6,
    foregroundColorStr: '#fdeca6',
    backgroundColor: 0x201b17,
    backgroundColorStr: '#201b17',
    highlightColor: 0xd79468,
    highlightColorStr: '#d79468',

    evolutionBorderColor: 0xd79468,
    evolutionBackgroundColor: 0xfdeca6,
    evolutionLineColor: 0x000000,

    optionBorderColor: 0x989085,
    optionBoderHighlightColor: 0xd79468
}

const QuestionType = {
    trueFalse: 'true-false',
    test: 'test'
}

const StorageData = {
    key: 'pctgp-data'
}

export {Image, Style, QuestionType, StorageData};
