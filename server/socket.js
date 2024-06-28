const { Server } = require("socket.io");
const OpenAI = require("openai");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI(OPENAI_API_KEY);

const conversations = {};

function init(server) {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("audioMessage", async (message) => {
      console.log("Message received:", message);

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
        console.log("Chat response:", responseMessage);

        conversations[socket.id].push({ role: "assistant", content: responseMessage });

        socket.emit("chatResponse", responseMessage);
      } catch (error) {
        console.error("Error during chat response:", error);
        socket.emit("chatResponseError", "Error during chat response.");
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
      delete conversations[socket.id];
    });
  });
}

module.exports = { init };