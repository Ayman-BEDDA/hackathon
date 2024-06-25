require("dotenv").config();
const express = require("express");
const app = express();
const http = require('http');
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
const DeepSpeech = require('deepspeech');
let modelPath = './deepspeech-0.9.3-models.pbmm';
let model = new DeepSpeech.Model(modelPath);

function transcribeAudio(audioBuffer) {
    const audioLength = (audioBuffer.length / 2) * (1 / 16000);
    return model.stt(audioBuffer, 16000);
}


if (fs.existsSync('./deepspeech-0.9.3-models.scorer')) {
  model.enableExternalScorer('./deepspeech-0.9.3-models.scorer');
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
app.use("/rooms",RoomRouter);
app.use("/", ttsRoutes);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.post("/", (req, res) => {
    res.json(req.body);
});

app.use(errorHandler);

const server = http.createServer(app);
const io = require('socket.io')(server, {cors: {origin: "*"}});

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