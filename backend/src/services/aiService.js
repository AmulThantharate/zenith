const { GoogleGenAI } = require('@google/genai');
const todoService = require('./todoService');

class AiService {
  constructor() {
    // We initialize lazily or pass apiKey if it's available
    // For @google/genai, passing empty object picks up process.env.GEMINI_API_KEY automatically if present
    this.ai = new GoogleGenAI({});
  }

  async chat(userId, message) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Get todos for context
    const { data: todos } = await todoService.getTodos(userId, { limit: 100, page: 1 });
    
    const context = `
You are a helpful AI assistant for a Todo application.
Here are the user's current tasks:
${JSON.stringify(todos, null, 2)}

User's message: ${message}

Please provide a helpful, concise response. Do not expose internal JSON IDs or formats unnecessarily. Talk naturally.
    `.trim();

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: context,
    });

    return response.text;
  }
}

module.exports = new AiService();
