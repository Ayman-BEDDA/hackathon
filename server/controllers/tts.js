const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
const uuid = require('uuid');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI(OPENAI_API_KEY);

const speechFile = path.resolve("./audio_files", `${uuid.v4()}.mp3`);

const TtsController = {
    speak: async (req, res) => {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        console.log('Text to synthesize:', text);

        try {
            const mp3 = await openai.audio.speech.create({
                model: "tts-1",
                voice: "shimmer",
                input: text,
            });

            const buffer = Buffer.from(await mp3.arrayBuffer());
            fs.writeFileSync(speechFile, buffer);

            res.set('Content-Type', 'audio/mp3');
            res.send(buffer);

        } catch (error) {
            console.error('Error during speech synthesis', error);
            res.status(500).json({ error: 'Error during speech synthesis' });
        }
    },
};

module.exports = TtsController;
