const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs').promises; // 
const axios = require('axios');
const cors = require('cors');

require('dotenv').config();
const app = express();
app.use(cors());
const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Function to call Gemini API
const getOpenQuestionAnalysis = async (text, previousResponse) => {
    console.log("pre", previousResponse)
    try {
        // Construct the query with optional file content
        let promptText = `
                You are an AI research assistant helping analyze qualitative usability research data.

                ### INPUT STRUCTURE:
                You will receive a JSON object with open-ended participant responses. Each object contains:
                - "taskDesc": The open-ended research question asked to participants.
                - "testerResponse": An array of participant responses, where each response includes:
                - "gender": Participant's gender
                - "country": Country of the participant
                - "duration": Time spent on the task/question
                - "surveyanswer": The written answer to the question
                - "transcription": The spoken commentary during the task

                ### TASK:
                Your job is to:
                1. Analyze participant responses to the given question.
                2. Extract key themes and insights from the written and spoken data.
                3. Classify the sentiment for each insight and overall.
                4. Include meaningful quotes from participants to support the insights.
                5. Output the result in a clean and fixed JSON format.

                ### RESEARCH QUESTION:
                "${text}"

                ### OUTPUT FORMAT (JSON):
                {
                "researchQuestion": "…",
                "keyInsights": [
                    {
                    "theme": "…", 
                    "summary": "…", 
                    "sentiment": "Positive | Neutral | Negative", 
                    "sampleQuotes": [
                                    {
                                    "quote": "…",
                                    "gender": "…",
                                    "country": "…",
                                    "userId": "…"
                                    }
                                ]
                    }
                ],
                "overallSentiment": "Positive | Neutral | Negative"
                }

                ### NOTES:
                - Do NOT mention the JSON structure or keys in the analysis.
                - Focus on concrete, actionable insights.
                - Quotes should be short, real participant responses from either "surveyanswer" or "transcription".
            `;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        role: "user",
                        parts: [{ text: promptText }],
                    },
                ],
                generationConfig: {
                    temperature: 0.7,
                }

            },
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );

        //  console.log(response.data.candidates[0].content);
        return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error with Google Gemini API:', error.response ? error.response.data : error.message);
        throw new Error('Failed to generate response');
    }
};

// Endpoint to aggregate POST requests from the React app, including file uploads
router.post('/', upload.single('file'), async (req, res) => {
    const { text, text2 } = req.body;
    try {
        // Call Gemini API with text, previous response, and file content
        const responseText = await getOpenQuestionAnalysis(text, text2);
        // Respond with the generated text
        res.status(200).json({ responseText });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        // Clean up uploaded file after processing
        if (req.file) {
            await fs.unlink(req.file.path);
        }
    }
});

module.exports = router;