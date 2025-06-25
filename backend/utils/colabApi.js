const axios = require("axios");
const COLAB_API = "https://your-ngrok-url/chat";

exports.sendToColab = async (message) => {
  const res = await axios.post(COLAB_API, { message });
  return res.data;
};
