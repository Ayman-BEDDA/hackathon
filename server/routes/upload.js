const express = require("express");
const multer = require("multer");
const fs = require("fs");
const OpenAI = require("openai");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI(OPENAI_API_KEY);

router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
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
                url: `data:image/jpeg;base64,${fs.readFileSync(imagePath).toString('base64')}`,
              },
            },
          ],
        },
      ],
    });

    const description = response.choices[0].message.content;

    res.json({ response: description });
  } catch (error) {
    console.error("Error during image description:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
});

module.exports = router;
