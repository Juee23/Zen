import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mount JSON body parser
app.use(express.json());

// Serve the static built files from the React frontend
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Zen Backend is healthy!' });
});

// Secure server-side LLM streaming endpoint
app.post('/api/ai/stream', async (req, res) => {
  const { prompt, systemInstruction } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set on the server.");
    return res.status(500).json({ 
      error: 'GEMINI_API_KEY is not configured on the server. Please add GEMINI_API_KEY to your Environment Variables on your hosting provider (such as AWS App Runner, Render, or GCP).' 
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "You are Zen, a calm and elegant writing, reflection, and workspace assistant. Keep your responses structured, inspiring, and concise. Format with nice markdown."
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(chunk.text);
      }
    }
    res.end();
  } catch (error) {
    console.error("Error streaming content from Gemini:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Error occurred while streaming from Gemini API' });
    } else {
      res.write(`\n[STREAM_ERROR: ${error.message}]`);
      res.end();
    }
  }
});

// Fallback all other routes to React's index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(` 🌸 Zen is running with secure AI Streaming!`);
  console.log(` Server running on: http://localhost:${PORT}`);
  console.log(`=========================================`);
});

