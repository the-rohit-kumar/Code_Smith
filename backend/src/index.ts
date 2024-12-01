require("dotenv").config();
import express, { Request, Response, RequestHandler } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSystemPrompt, DEFAULT_DESIGN_MESSAGE, DEFAULT_CONTEXT_MESSAGE, PROJECT_STRUCTURE, FILE_CHANGES_MESSAGE } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./default/node";
import { basePrompt as reactBasePrompt } from "./default/react";
import cors from "cors";

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const app = express();
app.use(cors());
app.use(express.json());

const templateHandler: RequestHandler = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            res.status(400).json({ error: "Prompt is required" });
            return;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                maxOutputTokens: 200,
            }
        });

        const response = await result.response;
        const projectType = response.text().trim().toLowerCase();

        switch (projectType) {
            case "react":
                res.json({
                    prompts: [
                        DEFAULT_DESIGN_MESSAGE,
                        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`
                    ],
                    uiPrompts: [reactBasePrompt]
                });
                break;
            case "node":
                res.json({
                    prompts: [
                        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`
                    ],
                    uiPrompts: [nodeBasePrompt]
                });
                break;
            default:
                res.status(400).json({ error: "Unsupported project type" });
        }
    } catch (error) {
        console.error("Error generating template:", error);
        res.status(500).json({ error: "Failed to generate template" });
    }
};

const chatHandler: RequestHandler = async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            res.status(400).json({ error: "Valid messages array is required" });
            return;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const systemPrompt = getSystemPrompt();
        const lastMessage = messages[messages.length - 1].content;
        const combinedPrompt = `${systemPrompt}\n\n${DEFAULT_DESIGN_MESSAGE}\n\n${DEFAULT_CONTEXT_MESSAGE}\n\n${PROJECT_STRUCTURE}\n\n${FILE_CHANGES_MESSAGE}\n\nUser: ${lastMessage}`;

        const result = await model.generateContentStream({
            contents: [{ role: "user", parts: [{ text: combinedPrompt }] }],
            generationConfig: {
                maxOutputTokens: 11024,
            }
        });

        // Set up SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        try {
            for await (const chunk of result.stream) {
                const text = chunk.text();
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
            res.end();
        } catch (error) {
            console.error("Error in stream:", error);
            res.write(`data: ${JSON.stringify({ error: "Stream error occurred" })}\n\n`);
            res.end();
        }
    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ error: "Failed to process chat request" });
    }
};

app.post("/template", templateHandler);
app.post("/chat", chatHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
