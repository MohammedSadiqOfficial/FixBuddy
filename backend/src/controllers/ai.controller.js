import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

async function generateWithFallback(modelName, content, modelOptions = {}) {
    try {
        const model = genAI.getGenerativeModel({ model: modelName, ...modelOptions });
        const result = await model.generateContent(content);
        return result.response.text();
    } catch (error) {
        // If 429 (Quota) or 404 (Model Not Found) or 503 (Model Unavailable)
        const isQuotaError = error.message && (error.message.includes("429") || error.message.includes("quota"));
        const isModelError = error.message && (error.message.includes("404") || error.message.includes("503"));
        
        if (isQuotaError || isModelError) {
            console.warn(`Falling back from gemini-2.0-flash to gemini-1.5-flash due to ${isQuotaError ? "quota" : "unavailability"}`);
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash", ...modelOptions });
            const result = await fallbackModel.generateContent(content);
            return result.response.text();
        }
        throw error;
    }
}

const getFallbackHelp = (question, role = 'USER') => {
    const normalized = question.toLowerCase();
    const isCaptain = role === 'CAPTAIN' || normalized.includes('captain') || normalized.includes('job');

    if (normalized.includes('cancel')) {
        return 'You can cancel a request while it is still pending from your requests page. Once a captain accepts it, use chat or support so the job can be handled properly.';
    }

    if (normalized.includes('request') || normalized.includes('book') || normalized.includes('repair')) {
        return 'Create a request from the dashboard, add the service type, describe the issue, attach photos if available, and submit it. If you choose a specific professional, FixBuddy sends the request directly to that captain.';
    }

    if (normalized.includes('location') || normalized.includes('map') || normalized.includes('track')) {
        return isCaptain
            ? 'Open your dashboard or active job page and allow location access. FixBuddy will show the customer location when the customer is sharing it and will update your location for live tracking.'
            : 'After a captain accepts your request, keep the dashboard open and allow location access. The live map will show both your location and the captain location when both devices are sharing updates.';
    }

    if (normalized.includes('accept') || normalized.includes('start') || normalized.includes('complete')) {
        return 'Captains can accept pending jobs from Incoming Requests, then open the active job to start work, chat with the customer, track location, and mark the job complete.';
    }

    if (normalized.includes('pay') || normalized.includes('rate') || normalized.includes('earning')) {
        return 'Captains can update their hourly rate from the profile page. Earnings are calculated when a job is completed and appear on the captain dashboard.';
    }

    if (normalized.includes('verified') || normalized.includes('professional')) {
        return 'FixBuddy highlights verified professionals in the app. You can view a captain profile, skills, rating, and hourly rate before sending a request.';
    }

    return isCaptain
        ? 'I can help with accepting jobs, live tracking, profile setup, chat, and completing work. Try asking about a specific captain workflow so I can guide you.'
        : 'I can help with creating requests, finding professionals, live tracking, chat, cancellations, and reviews. Try asking about the part of FixBuddy you are using right now.';
};

export const describeImage = async (req, res, next) => {
    try {
        if (!genAI) {
            return res.status(503).json({ success: false, message: "AI features are currently unavailable. Missing GEMINI_API_KEY in environment variables." });
        }
        
        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ success: false, message: "Upload image first to generate description." });
        }

        const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
        let mimeType = "image/jpeg";
        if (imageBase64.startsWith("data:")) {
            mimeType = imageBase64.split(";")[0].split(":")[1];
        }

        const content = [
            "Describe the issue or damage visible in this image to help a maintenance professional understand what needs to be fixed. Keep it concise, helpful, and under 3 sentences. Output just the description.",
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            }
        ];

        const text = await generateWithFallback("gemini-2.0-flash", content);
        res.status(200).json({ success: true, data: text.trim() });
    } catch (error) {
        console.error("AI describeImage Error:", error);
        if (error.message && (error.message.includes("429") || error.message.includes("quota"))) {
            return res.status(429).json({ success: false, message: "AI daily limit reached. Please try again tomorrow or upgrade your plan." });
        }
        if (error.message && error.message.includes("API key")) {
            return res.status(503).json({ success: false, message: "Invalid GEMINI_API_KEY provided." });
        }
        res.status(500).json({ success: false, message: error.message || "Failed to generate description based on image." });
    }
};

export const getHelp = async (req, res, next) => {
    try {
        const { question, role } = req.body;
        if (!question || !question.trim()) {
            return res.status(400).json({ success: false, message: "Please provide a question." });
        }

        const userRole = role || req.user?.role || 'USER';

        if (!genAI) {
            return res.status(200).json({
                success: true,
                data: getFallbackHelp(question.trim(), userRole),
                fallback: true
            });
        }

        const prompt = `You are FixBuddy Support AI, a friendly and concise assistant for the FixBuddy platform.
FixBuddy connects users with local maintenance professionals (Captains) like electricians, carpenters, plumbers, etc.
Users can create requests, attach images, and wait. Captains can view requests, accept jobs, and use live tracking over a map to reach users.
The current user role is ${userRole}. Answer for that role unless the question asks about the other side of the platform.
Answer the user's question concisely in a helpful, professional tone. Keep answers under 4 sentences.
User question: ${question.trim()}`;

        const text = await generateWithFallback("gemini-2.0-flash", prompt);
        res.status(200).json({ success: true, data: text.trim() });
    } catch (error) {
        console.error("AI getHelp Error:", error);
        if (error.message && (error.message.includes("429") || error.message.includes("quota"))) {
            return res.status(200).json({ success: true, data: getFallbackHelp(req.body.question?.trim() || '', req.body.role || req.user?.role), fallback: true });
        }
        if (error.message && error.message.includes("API key")) {
            return res.status(200).json({ success: true, data: getFallbackHelp(req.body.question?.trim() || '', req.body.role || req.user?.role), fallback: true });
        }
        res.status(500).json({ success: false, message: error.message || "Failed to get an answer from the AI support assistant." });
    }
};
