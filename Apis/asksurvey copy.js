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
    console.log("pre",previousResponse)
    try {
        // Construct the query with optional file content
        let promptText = `

        The json data provided is the response data of a usability research survey. It consists the result of all the participant accross the survey
        Detail about Survey JSON Data
        1) Json is a array of object where each object is a task(or question) with participant response (Keep task in that order only)
        2) taskDesc = description of task(or question)
        3) testerResponse = participant detail contain gender, country, task(or question) duration, response detail survey answer,etc
        4) surveyOption = contain all the option of a survey
        5) surveyanswer = actual answer given by the participant
        6) otherOptionanswer = answer of other option when paticipant select the option option 
        7) transcription = text that participant speak during that task(or question)
        8) type = "Survey Question" - Don't have the success or fail criteria
        9) Result key value meaning = {NULL: 0,"Fail": 3 , "Success": 1, "UNCLASSIFIED": 2, "DIRECT SUCCESS": 4,"INDIRECT SUCCESS": 5}
        
        You are an AI assistant analyzing survey response data. Based on the following survey data, analayze it and provide a clear, brief markdown answer to the researcher's question include table & charts (if needed) and make sure all information is correct.
        Researcher question: -  ${text}

        Note- Don't mention JSON data and its raw key in response 
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