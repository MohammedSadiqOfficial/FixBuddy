import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

export const describeImage = async (req, res, next) => {
    try {
        if (!genAI) {
            return res.status(503).json({ success: false, message: "AI features are currently unavailable. Missing GEMINI_API_KEY in environment variables." });
        }
        
        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ success: false, message: "Upload image first to generate description." });
        }

        // Clean up base64 string if it contains data uri prefix
        const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
        let mimeType = "image/jpeg";
        if (imageBase64.startsWith("data:")) {
            mimeType = imageBase64.split(";")[0].split(":")[1];
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent([
            "Describe the issue or damage visible in this image to help a maintenance professional understand what needs to be fixed. Keep it concise, helpful, and under 3 sentences. Output just the description.",
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            }
        ]);
        
        const description = result.response.text();
        res.status(200).json({ success: true, data: description.trim() });
    } catch (error) {
        console.error("AI describeImage Error:", error);
        if (error.message && error.message.includes("API key")) {
            return res.status(503).json({ success: false, message: "Invalid GEMINI_API_KEY provided." });
        }
        if (error.message && (error.message.includes("404") || error.message.includes("not found"))) {
            return res.status(503).json({ success: false, message: "AI model unavailable. Please try again later." });
        }
        res.status(500).json({ success: false, message: error.message || "Failed to generate description based on image." });
    }
};

export const getHelp = async (req, res, next) => {
    try {
        if (!genAI) {
            return res.status(503).json({ success: false, message: "AI features are currently unavailable. GEMINI_API_KEY is not set." });
        }
        
        const { question } = req.body;
        if (!question || !question.trim()) {
            return res.status(400).json({ success: false, message: "Please provide a question." });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `You are FixBuddy Support AI, a friendly and concise assistant for the FixBuddy platform.
FixBuddy connects users with local maintenance professionals (Captains) like electricians, carpenters, plumbers, etc.
Users can create requests, attach images, and wait. Captains can view requests, accept jobs, and use live tracking over a map to reach users.
Answer the user's question concisely in a helpful, professional tone. Keep answers under 4 sentences.
User question: ${question.trim()}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        res.status(200).json({ success: true, data: text });
    } catch (error) {
        console.error("AI getHelp Error:", error);
        if (error.message && error.message.includes("API key")) {
            return res.status(503).json({ success: false, message: "AI service configuration error. Please contact support." });
        }
        if (error.message && (error.message.includes("404") || error.message.includes("not found"))) {
            return res.status(503).json({ success: false, message: "AI model unavailable. Please try again later." });
        }
        res.status(500).json({ success: false, message: error.message || "Failed to get an answer from the AI support assistant." });
    }
};
