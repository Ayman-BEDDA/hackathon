require("dotenv").config();
const express = require("express");
const app = express();
const http = require('http');
const { OpenAI } = require("openai"); // Importation de la librairie OpenAI
const UserRouter = require("./routes/user");
const RoomRouter = require("./routes/room");
const SecurityRouter = require("./routes/security");
const cors = require("cors");
const checkFormat = require("./middlewares/check-format");
const errorHandler = require("./middlewares/error-handler");
const bodyParser = require("body-parser");
const port = 3001;
const sequelize = require('./db/db');
const ttsRoutes = require('./routes/tts');

// Instanciation de l'objet OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function transcribeAudio(audioBuffer) {
    const audioLength = (audioBuffer.length / 2) * (1 / 16000);
    return model.stt(audioBuffer, 16000);
}

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

// Nouvelle route POST pour interagir avec l'API OpenAI
app.post("/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const result = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
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
                    `
                },
                {
                    role: "user",
                    content: message
                }
            ]
        });

        res.json({
            response: result.choices[0].message.content
        });
    } catch (error) {
        console.error('Error with OpenAI API:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.use(errorHandler);

const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté');

    socket.on('audioMessage', (audioData) => {
        console.log('Données audio reçues');
        const audioBuffer = Buffer.from(new Uint8Array(audioData));
        const text = transcribeAudio(audioBuffer);
        console.log(`Transcription: ${text}`);
    });

    socket.on('disconnect', () => {
        console.log('Utilisateur déconnecté');
    });
});

server.listen(port, () => {
    console.log("Server running on port " + port);
});

module.exports = server;
