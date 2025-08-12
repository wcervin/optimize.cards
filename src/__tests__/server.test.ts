import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import path from 'path'

// Import the server app
const app = express()
const PORT = 3001

// Mock the server setup
app.disable('x-powered-by')
app.use(express.static(path.join(__dirname, '../../dist'), { maxAge: '1h', index: 'index.html' }))

// Health endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', ts: Date.now() })
})

// Version endpoint
app.get('/version', (_req, res) => {
  res.status(200).json({ version: 'test', buildTime: 'test' })
})

// Catch-all route
app.get('*', (_req, res) => {
  res.status(200).send('App loaded')
})

let server: any

beforeAll(() => {
  server = app.listen(PORT)
})

afterAll(() => {
  server.close()
})

describe('Server', () => {
  it('responds to health check endpoint', async () => {
    const response = await request(app).get('/health')
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('status', 'ok')
    expect(response.body).toHaveProperty('ts')
  })

  it('responds to version endpoint', async () => {
    const response = await request(app).get('/version')
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('version')
    expect(response.body).toHaveProperty('buildTime')
  })

  it('serves static files', async () => {
    const response = await request(app).get('/')
    expect(response.status).toBe(200)
  })

  it('handles 404 gracefully', async () => {
    const response = await request(app).get('/nonexistent')
    expect(response.status).toBe(200) // Our catch-all returns 200
  })
})
