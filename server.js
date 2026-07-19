import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the static built files from the React frontend
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Zen Backend is healthy!' });
});

// Fallback all other routes to React's index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(` 🌸 Zen is running locally!`);
  console.log(` Server running on: http://localhost:${PORT}`);
  console.log(`=========================================`);
});
