const { sendToColab } = require("../utils/colabApi");

exports.chat = async (req, res) => {
  const { message } = req.body;
  try {
    const response = await sendToColab(message);
    res.json(response); // { answer, mood, language }
  } catch (err) {
    console.error(err);
    res.status(500).send("Chatbot error");
  }
};
