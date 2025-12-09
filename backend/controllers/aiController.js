const { generateResponse } = require("../config/gemini");

const aiController = async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log(prompt)

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const result = await generateResponse(prompt);

    res.status(200).json({ message: result });
  } catch (error) {
    res.json({ message: error.message });
  }
};

module.exports = { aiController };
