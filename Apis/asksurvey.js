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
const askAIPrompt = async (text, previousResponse, fileContent) => {
    console.log("pre", previousResponse)
    try {
        // Construct the query with optional file content
        let promptText = `

                The following is the response data from a usability research survey. Each entry corresponds to a task or question with participant responses. The data includes demographic info, survey answers, and spoken feedback.

                ### Survey JSON Structure Summary:
                1. Each item is a task (question), in survey order.
                2. \`taskDesc\`: description of the task or question.
                3. \`testerResponse\`: contains participant info (gender, country, time taken, survey answer, etc.).
                4. \`surveyOption\`: the predefined answer choices for the survey question.
                5. \`surveyanswer\`: the actual option selected by the participant.
                6. \`otherOptionanswer\`: custom input if "Other" was chosen.
                7. \`transcription\`: spoken feedback from the participant.
                8. \`type = "Survey Question"\`: indicates general questions, not performance-based.
                9. \`Result\` value mapping:
                - NULL: 0  
                - Fail: 3  
                - Success: 1  
                - UNCLASSIFIED: 2  
                - DIRECT SUCCESS: 4  
                - INDIRECT SUCCESS: 5

                ### Instructions:
                You are an AI assistant analyzing this survey data. Based on the researcher's question below, generate a concise and accurate markdown report. Ensure clarity and readability.

                - Summarize insights using lists or tables where applicable.
                - When useful, **include charts using Mermaid syntax** (see examples below).
                - Do **not** mention JSON structure or keys in your response.
                - Only include visualizations if they add clarity.

                ### Mermaid Chart Examples:
                **Pie Chart Example:**
                \`\`\`mermaid
                pie title Gender Distribution
                    "Male" : 6
                    "Female" : 4
                \`\`\`

                ### Researcher's question:
                - ${text}
            `;
        if (fileContent) {
            promptText += `\n\n survey Data :\n${fileContent}`;
        }

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
    let fileContent = '';
    try {
        if (req.file) {
            // Read file content (assumes text-based file)
            fileContent = await fs.readFile(req.file.path, 'utf-8');
        }

        console.log(fileContent)

        // Call Gemini API with text, previous response, and file content
        const responseText = await askAIPrompt(text, text2, fileContent);
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