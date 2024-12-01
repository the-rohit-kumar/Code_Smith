"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const generative_ai_1 = require("@google/generative-ai");
const prompts_1 = require("./prompts");
const node_1 = require("./default/node");
const react_1 = require("./default/react");
const cors_1 = __importDefault(require("cors"));
if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
}
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const templateHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            res.status(400).json({ error: "Prompt is required" });
            return;
        }
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = yield model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                maxOutputTokens: 200,
            }
        });
        const response = yield result.response;
        const projectType = response.text().trim().toLowerCase();
        switch (projectType) {
            case "react":
                res.json({
                    prompts: [
                        prompts_1.DEFAULT_DESIGN_MESSAGE,
                        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`
                    ],
                    uiPrompts: [react_1.basePrompt]
                });
                break;
            case "node":
                res.json({
                    prompts: [
                        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${node_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`
                    ],
                    uiPrompts: [node_1.basePrompt]
                });
                break;
            default:
                res.status(400).json({ error: "Unsupported project type" });
        }
    }
    catch (error) {
        console.error("Error generating template:", error);
        res.status(500).json({ error: "Failed to generate template" });
    }
});
const chatHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            res.status(400).json({ error: "Valid messages array is required" });
            return;
        }
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const systemPrompt = (0, prompts_1.getSystemPrompt)();
        const lastMessage = messages[messages.length - 1].content;
        const combinedPrompt = `${systemPrompt}\n\n${prompts_1.DEFAULT_DESIGN_MESSAGE}\n\n${prompts_1.DEFAULT_CONTEXT_MESSAGE}\n\n${prompts_1.PROJECT_STRUCTURE}\n\n${prompts_1.FILE_CHANGES_MESSAGE}\n\nUser: ${lastMessage}`;
        const result = yield model.generateContentStream({
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
            try {
                for (var _d = true, _e = __asyncValues(result.stream), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const chunk = _c;
                    const text = chunk.text();
                    res.write(`data: ${JSON.stringify({ text })}\n\n`);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            res.end();
        }
        catch (error) {
            console.error("Error in stream:", error);
            res.write(`data: ${JSON.stringify({ error: "Stream error occurred" })}\n\n`);
            res.end();
        }
    }
    catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ error: "Failed to process chat request" });
    }
});
app.post("/template", templateHandler);
app.post("/chat", chatHandler);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
