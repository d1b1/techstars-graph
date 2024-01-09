require('dotenv').config();

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log('Note: AI is ready');

module.exports = new OpenAIApi(configuration);
