const levels = [
    {
        type: 'true-false',
        char: '山',
        evolutionChars: [
            {
                glyph: 'oracle',
                image: "shan-moutain-oracle-0.png"
            },
            {
                glyph: 'bronze',
                image: "shan-moutain-bronze-2.png"
            },
            {
                glyph: 'seal',
                image: "shan-moutain-seal-0.png"
            },
            {
                glyph: 'clerical',
                image: "shan-moutain-clerical-1.png"
            },
            {
                glyph: 'regular',
                image: "shan-moutain-regular-0.png"
            }
        ],
        options: [
            {image: '🔥',  text: 'fire, flame', isAnswer: false},
            {image: '⛰️', text: 'moutain', isAnswer: true}
        ],
        info: 'Derived characters: 峰(peak), 岩(rock)'
    },
    {
        type: 'true-false',
        char: '日',
        evolutionChars: [
            {
                glyph: 'oracle',
                image: "ri-sun-oracle-0.png"
            },
            {
                glyph: 'bronze',
                image: "ri-sun-bronze-0.png"
            },
            {
                glyph: 'seal',
                image: "ri-sun-seal-0.png"
            },
            {
                glyph: 'clerical',
                image: "ri-sun-clerical-0.png"
            },
            {
                glyph: 'regular',
                image: "ri-sun-regular-0.png"
            }
        ],
        options: [
            {image: '💧', text: 'water', isAnswer: false},
            {image: '☀️', text: '☉ sun', isAnswer: true}
        ],
        info: 'Derived characters: 明(bright), 时(time)'
    },

];

export {levels};
