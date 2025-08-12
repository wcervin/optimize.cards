// Security configuration for Express server
export const securityConfig = {
  // CORS configuration
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] // Update with your domain
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  },

  // Helmet security headers
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  },

  // Input validation
  validation: {
    maxBodySize: '10mb',
    maxUrlLength: 2048
  }
}

// Security middleware functions
export const securityMiddleware = {
  // Basic security headers
  basicHeaders: (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    next()
  },

  // Request size validation
  validateRequestSize: (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0')
    if (contentLength > 10 * 1024 * 1024) { // 10MB limit
      return res.status(413).json({ error: 'Request entity too large' })
    }
    next()
  },

  // Basic input sanitization
  sanitizeInput: (req, res, next) => {
    // Remove potential XSS vectors
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key]
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
        }
      })
    }
    next()
  }
}
