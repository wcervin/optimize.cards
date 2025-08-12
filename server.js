// server.js
const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

const VERSION = process.env.APP_VERSION || 'unknown';
const BUILD_TIME = process.env.BUILD_TIME || 'unknown';

app.disable('x-powered-by');
app.use(compression());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', ts: Date.now() });
});

app.get('/version', (_req, res) => {
  res.status(200).json({ version: VERSION, buildTime: BUILD_TIME });
});

const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir, { maxAge: '1h', index: 'index.html' }));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[server] listening on :${PORT}`);
});
