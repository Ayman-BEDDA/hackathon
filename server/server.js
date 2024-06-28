require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const sequelize = require("./db/db");
const socket = require("./socket");
const errorHandler = require("./middlewares/error-handler");

const app = express();
const port = 3001;

sequelize.sync()
  .then(() => {
    console.log("Database synchronized");
  })
  .catch(err => {
    console.error("Unable to synchronize the database:", err);
  });

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.json());

app.use("/", require("./routes/security"));
app.use("/users", require("./routes/user"));
app.use("/rooms", require("./routes/room"));
app.use("/report", require("./routes/report"));
app.use("/", require("./routes/tts"));
app.use(require("./routes/upload"));

app.use(errorHandler);

const server = http.createServer(app);
socket.init(server);

server.listen(port, () => {
  console.log("Server running on port " + port);
});

module.exports = server;
