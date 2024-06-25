const say = require('say');
const path = require('path');
const fs = require('fs');

const TtsController = {
    speak: (req, res) => {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }
        say.speak(text);
    },
};

module.exports = TtsController;