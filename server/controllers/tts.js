const axios = require('axios');
const path = require('path');
const fs = require('fs');

const TtsController = {
    speak: async (req, res) => {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        try {
            const response = await axios.post('http://flask_service:5000/speak', { text });
            const { file_path } = response.data;

            // Lire le fichier généré par Flask
            const audioPath = path.join(__dirname, file_path);
            const audioContent = fs.readFileSync(audioPath);

            // Envoyer le fichier audio en réponse
            res.set('Content-Type', 'audio/mpeg');
            res.send(audioContent);
        } catch (error) {
            console.error('ERROR:', error);
            res.status(500).json({ error: 'Failed to generate audio content' });
        }
    },
};

module.exports = TtsController;
