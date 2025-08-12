// server.js
const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

const VERSION = process.env.APP_VERSION || 'unknown';
const BUILD_TIME = process.env.BUILD_TIME || 'unknown';

// Security: Disable powered-by header
app.disable('x-powered-by');

// Security: Basic headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Compression middleware
app.use(compression());

// Request size validation
app.use((req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  if (contentLength > 10 * 1024 * 1024) { // 10MB limit
    return res.status(413).json({ error: 'Request entity too large' });
  }
  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    ts: Date.now(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Version endpoint
app.get('/version', (_req, res) => {
  res.status(200).json({ 
    version: VERSION, 
    buildTime: BUILD_TIME,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files
const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir, { 
  maxAge: '1h', 
  index: 'index.html',
  etag: true,
  lastModified: true
}));

// Catch-all route for SPA
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`[server] listening on :${PORT}`);
  console.log(`[server] version: ${VERSION}`);
  console.log(`[server] environment: ${process.env.NODE_ENV || 'development'}`);
});
