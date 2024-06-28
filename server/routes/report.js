const { Router } = require("express");
const ReportService = require("../services/report");
const { Report } = require("../db");
const OpenAI = require("openai");
const genericRouter = require("./generic");
const genericController = require("../controllers/generic");

const router = new Router();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI(OPENAI_API_KEY);

// Route spécifique pour créer un rapport
router.post("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { message, roomId } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Tu es un assistant médical virtuel. Tu dois extraire le sujet et la description du message et les mettre absolument dans un objet, quelque soit le type de message." },
        { role: "user", content: message }
      ],
    });

    const responseMessage = response.choices[0].message.content;

    const parsedResponseMessage = JSON.parse(responseMessage);
    const subject = parsedResponseMessage.sujet;
    const description = parsedResponseMessage.description;

    const relevanceCheckResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Tu es un assistant médical virtuel. Tu dois vérifier si le sujet et la description suivants sont liés au médical ou à la santé. Réponds par 'Oui' ou 'Non'." },
        { role: "user", content: `Sujet: ${subject}\nDescription: ${description}` }
      ],
    });

    const isRelevant = relevanceCheckResponse.choices[0].message.content.trim().toLowerCase() === "oui";

    if (isRelevant) {
      const createdReport = await Report.create({
        userId,
        subject,
        description,
        roomId
      });

      return res.status(201).json(createdReport);
    } else {
      return res.status(400).json({ error: "The message is not relevant to medical or health topics" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to create report" });
  }
});

router.use("/", new genericRouter(new genericController(new ReportService())));

module.exports = router;
