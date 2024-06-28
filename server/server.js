require("dotenv").config();
const express = require("express");
const http = require('http');
const multer = require('multer');
const fs = require('fs');
const FormData = require('form-data');
const UserRouter = require("./routes/user");
const RoomRouter = require("./routes/room");
const { Report } = require("./db");
const ttsRoutes = require("./routes/tts");
const SecurityRouter = require("./routes/security");
const cors = require("cors");
const checkFormat = require("./middlewares/check-format");
const errorHandler = require("./middlewares/error-handler");
const bodyParser = require("body-parser");
const sequelize = require('./db/db');
const OpenAI = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI(OPENAI_API_KEY);
const upload = multer({ dest: 'uploads/' });

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

app.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const imagePath = req.file.path;

        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "system",
                    content: "Tu es un assistant médical virtuel capable de fournir des conseils basés sur l'analyse d'images médicales."
                },
                {
                  role: "user",
                  content: [
                    { type: "text", text: "Bonjour, je voudrais des conseils médicaux basés sur l'image suivante." },
                    {
                      type: "image_url",
                      image_url: {
                        "url": `data:image/jpeg;base64,${fs.readFileSync(imagePath).toString('base64')}`,
                      },
                    },
                  ],
                },
              ],
        });

        const description = response.choices[0].message.content;

        console.log('Image description:', description);
        
        res.json({ response: description });
    } catch (error) {
        console.error('Error during image description:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (req.file && fs.existsSync (req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
    }
});

app.post("/report/:userId", async (req, res) => {
    const { userId } = req.params;
    const { message, roomId } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                { role: "system", content: "Tu es un assistant médical virtuel. Tu dois extraire le sujet et la description du message, quelque soit le type de message." },
                { role: "user", content: message }
            ],
        });

        const responseMessage = response.choices[0].message.content;
        console.log('Report response:', responseMessage);
        const lines = responseMessage.split('\n');
        const subjectLine = lines.find(line => line.startsWith('Sujet:'));
        const descriptionLine = lines.find(line => line.startsWith('Description:'));

        if (!subjectLine || !descriptionLine) {
            throw new Error('Could not parse subject and description');
        }

        const subject = subjectLine.replace('Sujet:', '').trim();
        const description = descriptionLine.replace('Description:', '').trim();

        const createdReport = await Report.create({
            userId,
            subject,
            description,
            roomId
        });

        res.status(201).json(createdReport);
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: 'Failed to create report' });
    }
});


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

    socket.on('audioMessage', async (message) => {
        console.log('Message received:', message);

        if (!conversations[socket.id]) {
            conversations[socket.id] = [];
        }

        conversations[socket.id].push({ role: "user", content: message });

        try {
            const chatResponse = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Tu es un assistant médical virtuel. Tu dois répondre aux questions des patients et leur fournir des informations utiles." },
                    ...conversations[socket.id]
                ],
            });

            const responseMessage = chatResponse.choices[0].message.content;
            console.log('Chat response:', responseMessage);

            conversations[socket.id].push({ role: "assistant", content: responseMessage });

            socket.emit('chatResponse', responseMessage);
        } catch (error) {
            console.error('Error during chat response:', error);
            socket.emit('chatResponseError', 'Error during chat response.');
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        delete conversations[socket.id];
    });
});


server.listen(port, () => {
    console.log("Server running on port " + port);
});

module.exports = server;