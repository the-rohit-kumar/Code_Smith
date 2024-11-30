require("dotenv").config();
import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  try {
    const chat = model.startChat();
    
    const messages = [
      
      { role: 'user', parts: [{ text: 'what can be the good name for this project we are using right now' }] }
    ];

    for (const message of messages) {
      if (message.role === 'user') {
        const result = await chat.sendMessageStream(message.parts[0].text);
        console.log(`\nUser: ${message.parts[0].text}\nAssistant: `);
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          process.stdout.write(chunkText);
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
