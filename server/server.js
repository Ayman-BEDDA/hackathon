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
const path = require('path');
const { tmpdir } = require('os');
const { join } = require('path');
const { v4: uuidv4 } = require('uuid');
const ttsRoutes = require('./routes/tts');

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

app.use(errorHandler);

const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('audioMessage', async (audioData) => {
        console.log('Audio data received');
        const audioBuffer = Buffer.from(audioData);
        console.log(`Received audio data size: ${audioBuffer.length} bytes`);

        const tempAudioFilePath = join(tmpdir(), `${uuidv4()}.webm`);
        console.log('Saving audio data to temporary file:', tempAudioFilePath);
        
        try {
            fs.writeFileSync(tempAudioFilePath, audioBuffer);

            const form = new FormData();
            form.append('file', fs.createReadStream(tempAudioFilePath));

        } catch (error) {
            console.error('Error during Huggingface transcription:', error);
            socket.emit('transcriptionError', 'Error during audio transcription.');
        } finally {
            fs.unlinkSync(tempAudioFilePath); // Clean up the temporary file
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