require("dotenv").config();
const express = require("express");
const http = require('http');
const FormData = require('form-data');
const UserRouter = require("./routes/user");
const RoomRouter = require("./routes/room");
const SecurityRouter = require("./routes/security");
const cors = require("cors");
const checkFormat = require("./middlewares/check-format");
const errorHandler = require("./middlewares/error-handler");
const bodyParser = require("body-parser");
const sequelize = require('./db/db');
const fs = require('fs');
const { join } = require('path');
const { v4: uuidv4 } = require('uuid');
const ttsRoutes = require('./routes/tts');
const axios = require('axios');
const OpenAI = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI(OPENAI_API_KEY);

const conversations = {};

const app = express();
const port = 3001;

sequelize.sync()
    .then(() => {
        console.log('Database synchronized');
    })
    .catch(err => {
        console.error('Unable to synchronize the database:', err);
    });

app.use(cors());
app.use(checkFormat);
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json());
app.use("/", SecurityRouter);
app.use("/users", UserRouter);
app.use("/rooms", RoomRouter);
app.use("/", ttsRoutes);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.post("/", (req, res) => {
    res.json(req.body);
});

app.post("/response/:roomId", async (req, res) => {
    const { roomId } = req.params;
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    if (!conversations[roomId]) {
        conversations[roomId] = [
            {
                role: "system",
                content: `
                    Tu es un assistant médical virtuel spécialisé dans l'analyse des données patient collectées via SMS et messages vocaux. 
                    Ton rôle est d'aider à identifier des thèmes récurrents, des préoccupations des patients et des tendances émergentes pour améliorer les services médicaux. 
                    Tu dois fournir des analyses utiles et proposer des projets pertinents basés sur ces données.

                    Voici le contexte de ton application:
                    - Collecte de données: Réponses SMS et messages vocaux des patients.
                    - Objectif: Analyser ces données pour en tirer des informations utiles et proposer des projets pertinents.
                    - Techniques utilisées: Transcription audio, analyse textuelle, analyse quantitative, etc.
                    - Exemples de solutions: Chatbots médicaux, systèmes d’analyse de sentiments, systèmes de prévisions, tableaux de bord, études de données.

                    Informations sur le client:
                    - Société: Calmedica, fondée en 2013 par Corinne Segalen (médecin) et Alexis Hernot (ingénieur).
                    - Mission: Révolutionner le rapport entre le patient et le système de soin, faire gagner du temps aux personnels de santé.
                    - Produit: Plateforme de télésuivi multi-pathologies, agent conversationnel fonctionnant par SMS.
                    - Chiffres clés: 20 millions de patients suivis, 150 établissements équipés, 500 parcours patients.

                    Réponds uniquement et seulement en français.
                `
            }
        ];
    }

    conversations[roomId].push({
        role: "user",
        content: message
    });

    try {
        const result = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: conversations[roomId]
        });

        const responseMessage = result.data.choices[0].message.content;

        conversations[roomId].push({
            role: "assistant",
            content: responseMessage
        });

        res.json({
            response: responseMessage
        });
    } catch (error) {
        console.error('Error with OpenAI API:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.use(errorHandler);

const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: "*" } });

const transcribeAudio = async (audioFilePath) => {
    const form = new FormData();
    form.append('file', fs.createReadStream(audioFilePath));
    form.append('model', 'whisper-1');

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/audio/transcriptions',
            form,
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    ...form.getHeaders()
                }
            }
        );

        return response.data.text;
    } catch (error) {
        console.error('Error during transcription:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const getChatResponse = async (message) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Tu es un assistant médical virtuel. Tu dois répondre aux questions des patients et leur fournir des informations utiles." },
                { role: "user", content: message }
            ],
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error during chat response:', error.response ? error.response.data : error.message);
        throw error;
    }
};

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('audioMessage', async (audioData) => {
        console.log('Audio data received');
        const audioBuffer = Buffer.from(audioData);
        console.log(`Received audio data size: ${audioBuffer.length} bytes`);

        const localDirectory = './audio_files';
        if (!fs.existsSync(localDirectory)){
            fs.mkdirSync(localDirectory);
        }

        const audioFilePath = join(localDirectory, `${uuidv4()}.webm`);
        console.log('Saving audio data to local file:', audioFilePath);

        try {
            fs.writeFileSync(audioFilePath, audioBuffer);
            console.log('Audio data successfully saved to', audioFilePath);

            const transcription = await transcribeAudio(audioFilePath);
            console.log('Transcription:', transcription);

            socket.emit('transcriptionResult', transcription);

            const chatResponse = await getChatResponse(transcription);
            console.log('Chat response:', chatResponse);

            socket.emit('chatResponse', chatResponse);
        } catch (error) {
            console.error('Error saving or transcribing audio file:', error);
            socket.emit('transcriptionError', 'Error during audio transcription.');

            if (fs.existsSync(audioFilePath)) {
                fs.unlinkSync(audioFilePath);
                console.log('Audio file deleted:', audioFilePath);
            }
            
        } finally {
            if (fs.existsSync(audioFilePath)) {
                fs.unlinkSync(audioFilePath);
                console.log('Audio file deleted:', audioFilePath);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(port, () => {
    console.log("Server running on port " + port);
});

module.exports = server;