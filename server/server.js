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
const checkAuth = require("./middlewares/check-auth");
const bodyParser = require("body-parser");
const port = 3001;
const sequelize = require('./db/db');

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
        console.log(`Taille des données audio reçues: ${audioData.length} octets`);
    });
  
    socket.on('disconnect', () => {
        console.log('Utilisateur déconnecté');
    });
});
  

server.listen(port, () => {
    console.log("Server running on port " + port);
});

module.exports = server;