const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs').promises; // 
const cors = require('cors');

// Initialize Express app
const app = express();
// Enable CORS for all requests
app.use(cors());

// Middleware to parse incoming JSON requests
app.use(express.json());

// Your Google Gemini API Key
const GOOGLE_GEMINI_API_KEY = ''; // Replace with your actual Google Gemini API key

// Function to call the Google Gemini API for rewriting text
const rewriteTextWithGemini = async (text) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GOOGLE_GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              // { text: `Please describe the below text, first add the header then show the positive and negative point in bullets: "${text}"` }, // The input text to be rewritten
              {
                text: `You are a helpful assistant aiding a UX researcher in summarizing the response from a recorded usability study. You will receive a JSON object containing details of the tasks in the study. 

The description key provides the task description. Tasks come in different types:
Type 0 is a website navigation task.
Type 3 is a Figma prototype navigation task.
Type 5 is a survey question. The subtype is specified in ques_type, and if there are options, they will be in ques_options. For ranking options, the order of items in the options indicates the user's ranking. For open questions, the answer will be in open_text_answer.

The task_start_time and task_end_time keys indicate when the user started and ended the task, in seconds. This information helps map the transcription data to understand what the user said during each task. 
Many keys might be empty; ignore them as they are either irrelevant or the data is missing. 

The transcription is a list of strings with timestamp data. Summarize this data into sensible, bookmark-worthy sections that will be helpful for the UX researcher. Only include sections where the participant is speaking their thoughts, giving feedback, asking questions, sharing usability or providing insights. Do not include sections where the participant is simply reading instructions or the task details.
Don't miss the Initial part, Second quarter, middle part, third quarter and last part of input transcription list for summary section.

Sentiment is calculated based on the tone, language, and emotional cues present in the user's feedback. Here's how to adjust for a more nuanced sentiment score:
Positive Sentiment: Indicates satisfaction, ease of use, enthusiasm, or appreciation.
Negative Sentiment: Indicates frustration, confusion, criticism, dissatisfaction, or difficulty.
Neutral Sentiment: Indicates impartial or descriptive feedback without clear positive or negative emotions.
You should calculate the sentiment by interpreting both the content and the tone of the user's statements.

Generate the output in pure JSON format according to the following structure:
{
  "summary": "",
  "sections": [
    {
      "title": "section title",
      "subtitle": "subtitle",
      "section": [
        {
          "type": "VERBATIM / TEXT",
          "text": "verbatim or summarized text",
          "sentiment": "POSITIVE/NEGATIVE/NEUTRAL",
          "log_id": "<log_id from input JSON>",
          "timestamp": "<resultStartTime of the text or verbatim>"
        }
      ]
    }
  "sentiment": "",
  ]
}

In this JSON structure:
summary (String, Mandatory): The overall outcome or insight gathered from the participant's response.
sections (Array of Objects, Mandatory): Contains section objects. Each section object includes:
  - title (String): The title of the section.
  - subtitle (String): The subtitle of the section.
  - section (Array of Objects): Contains the following keys:
    - type (String): The type of content, either VERBATIM or TEXT.
    - text (String): The text or verbatim content.
    - sentiment (String): tell me the sentiment analysis of text
    - log_id (String): The log ID from the JSON.
    - timestamp (String): The timestamp of the text.
sentiment (String, Mandatory): The sentiment of the participant's response will be (POSITIVE/NEGATIVE/NEUTRAL) and it is based on all the sentiments section array.(POSTIVE/NEGATIVE/NEUTRAL). [calculate it using score 0-10, >5 positive, <5 negative, 5 neutral]

Remember the following:
Prioritize insights over verbatims. Verbatims should only support insights.
Make sure the section timestamp are different in each object.
Standalone verbatims are less useful unless they would lose context if summarized.
Avoid one or two-word verbatims like "Yes, Understood," "No," "Ok," etc., unless they follow a question or statement.
Avoid verbatims that repeat the task or instructions.
Ensure the output is valid JSON that can be parsed by json.loads in Python, without any surrounding markdown.
                "${text}"`
              }, // The input text to be rewritten
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.candidates[0].content.parts[0].text; // Return the rewritten content
  } catch (error) {
    console.error('Error with Google Gemini API:', error.response ? error.response.data : error.message);
    throw new Error('Failed to rewrite text');
  }
};

// Endpoint to handle POST requests from the React app
app.post('/rewrite', async (req, res) => {
  const { text } = req.body;

  try {
    // Call the Gemini API to rewrite the text
    const rewrittenText = await rewriteTextWithGemini(text);

    // Respond with the rewritten text
    res.status(200).json({ rewrittenText });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Function to call the Google Gemini API for rewriting text
const supportTextWithGemini = async (text, previousResponse) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GOOGLE_GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `If "${previousResponse}" of your chat is present and this is relevant to the new asked "${text}" than consider the previous response and 
                then solve the query with more accuracy and whenever question is related to coding then make sure answer doesn't involve changes in many places
                and give steps and different ways to resolve and share weblink for reference as well
                : "${text}"`
              }, // The input text to be rewritten
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(response.data.candidates[0].content)
    return response.data.candidates[0].content.parts[0].text; // Return the rewritten content
  } catch (error) {
    console.error('Error with Google Gemini API:', error.response ? error.response.data : error.message);
    throw new Error('Failed to rewrite text');
  }
};

// Endpoint to handle POST requests from the React app
app.post('/support', async (req, res) => {
  const { text, text2 } = req.body;

  try {
    // Call the Gemini API to rewrite the text
    const responseText = await supportTextWithGemini(text, text2);

    // Respond with the rewritten text
    res.status(200).json({ responseText });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Function to call Gemini API
const aggregatePrompt = async (text, previousResponse, fileContent) => {
  try {
    // Construct the query with optional file content
    let promptText = `If the previous response, "${previousResponse}", is present and relevant to the new query, "${text}", consider it for more accuracy. 

Based on the provided "${text}" and ,`;

    if (fileContent) {
      promptText += `\n\n dataset :\n${fileContent}`;
    }

    promptText += `\n\nAggregate the data from the file and consider all categories if provided:
- Identify key points and useful insights in detail, with verbatim excerpts from the research relevant to the industry.
- Highlight both positive and negative feedback.
- If possible, generate graphs based on the provided data. If graph generation is not possible, do not mention it.
- Compare the data with historical datasets globally, including sources and numerical insights.
- Present a comparison of insights between the provided data and historical data.
- If possible, generate graphs to visualize the comparison.

Note:  
a) Consider each feedback carefully and make the insight informative and detailed.  
b) Present the results in bullet points with elaboration.
c) elobrate all the category finding in detail
d) use proper formatting and highlighting`;


    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: promptText }],
          },
        ],
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
app.post('/aggregate', upload.single('file'), async (req, res) => {
  const { text, text2 } = req.body;
  let fileContent = '';

  try {
    if (req.file) {
      // Read file content (assumes text-based file)
      fileContent = await fs.readFile(req.file.path, 'utf-8');
    }

    // Call Gemini API with text, previous response, and file content
    const responseText = await aggregatePrompt(text, text2, fileContent);

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

const noteTakerPrompt = async (text, previousResponse, fileContent) => {
  try {
    // Construct the query with optional file content
    let promptText = `
You are a helpful assistant aiding a UX researcher in summarizing the response from a recorded user interview of a usability study where multiple people might be speaking. There will be atleast one moderator who would be a UX researcher and at least one participant for the study.
The transcription is a list of strings with timestamp data. Summarize this data into sensible, bookmark-worthy sections that will be helpful for the UX researcher. Only include sections where the participant is speaking their thoughts, giving feedback, asking questions, or providing insights. Do not include sections where the participant is simply repeating instructions or the question details. Don't miss to summarize any parts of the transcription the initial, second quarter, third quarter and last part middle part, basically any part of the transcription for summary.
Sentiment Analysis:
Sentiment is calculated based on the tone, language, and emotional cues present in the participant's feedback. Here's how to adjust for a more nuanced sentiment score:
Positive Sentiment: Indicates satisfaction, ease of use, enthusiasm, or appreciation.
Negative Sentiment: Indicates frustration, confusion, dissatisfaction, criticism or difficulty.
Neutral Sentiment: Indicates impartial or descriptive feedback without clear positive or negative emotions.
You should calculate the sentiment by interpreting both the content and the tone of the user's statements.
Generate the output in pure JSON format according to the following structure:
{
  "summary": "",
  "sections": [
    {
      "title": "section title",
      "subtitle": "subtitle",
      "section": [
        {
          "type": "VERBATIM / TEXT",
          "text": "verbatim or summarized text",
          "sentiment": "POSITIVE/NEGATIVE/NEUTRAL",
          "log_id": "<log_id from input JSON>",
          "timestamp": "<resultStartTime of the text or verbatim>"
        }
      ]
    }
  "sentiment": "POSITIVE/NEGATIVE/NEUTRAL",
  ]
}
In this JSON structure:
summary (String, Mandatory): The overall outcome or insight gathered from the participant's response as per the goal of the study. Understand the goal of the study and try to provide insights that are relevant to that goal. Do not include obvious observations such as "particpant navigated the journey" since those things would be obvious to the researcher.
sections (Array of Objects, Mandatory): Contains section objects. Each section object must be in sequence of timestamp and includes:
  - title (String): The title of the section. Try to make it a concise summary of the section in not more than 8 words
  - subtitle (String): The subtitle of the section. Quick findings of the section. If available include quantifiable data here which could help researcher find answers to their goal of the study like whether the participant succeeded or failed or how much easy/difficult it was or whatever the researcher wants to find out.
  - section (Array of Objects): Contains the following keys:
    - type (String): The type of content, either VERBATIM or TEXT.
    - text (String): The text or verbatim content.
    - sentiment (String): analyze the text/verbatim and assign a sentiment score from 0 to 10 (0 being extremely negative, 5 being neutral, and 10 being extremely positive). When determining the score, consider not only overtly emotional language but also factual statements that convey criticism or negative sentiments, even if presented in a neutral tone (POSITIVE/NEGATIVE/NEUTRAL). [calculate it using score 0-10, >5 positive, <5 negative, 5 neutral]
    - timestamp (String): The timestamp of the text.
sentiment (String, Mandatory): The sentiment of the participant's response will be (POSITIVE/NEGATIVE/NEUTRAL all uppercase) and it is based on all the sentiments combination of sections.(POSTIVE/NEGATIVE/NEUTRAL). [calculate it using score 0-10, >5 POSTIVE, <5 NEGATIVE, 5 NEUTRAL]
Remember the following:
- Understand the goal of the study by deducing what the moderator wants from the transcription provided to you. The summary you provide would be placed next to the raw data so it is your job to make the researcher quickly find the insights they were looking for from your summary instead of the raw data
- Try to find insights more than verbatims. Verbatims in a section MUST only be a follow up proof to the insight. 
- Standalone verbatims aren't very useful unless they'd lose context if summarized.
- Avoid one or two word verbatims like "Yes", "No", "Ok", "I am", "previously", etc., unless they follow a question or statement.
- Avoid verbatims that repeat the task or instructions.
- Avoid text in Section if Type=Text and subtitle giving same context
- Include sections from the entire transcription, not just the initial parts.
- The section objects within the sections array should be in the order of the timestamp.
- The info of timestamps is in epoch format so don't include anywhere as text except the designated timestamp key.
- Ensure the output is valid JSON that can be parsed by json.loads in Python, without any surrounding markdown.
 

Below is transcription JSON ${text}
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GOOGLE_GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: promptText }],
          },
        ],
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
app.post('/noteTaker', upload.single('file'), async (req, res) => {
  const { text, text2 } = req.body;
  let fileContent = '';

  try {
    if (req.file) {
      // Read file content (assumes text-based file)
      fileContent = await fs.readFile(req.file.path, 'utf-8');
    }

    // Call Gemini API with text, previous response, and file content
    const responseText = await noteTakerPrompt(text, text2, fileContent);

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


// Catch-all for 404 errors
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
