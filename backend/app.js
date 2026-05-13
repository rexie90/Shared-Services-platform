import 'dotenv/config'
import './core/config/env.js'  // التحقق من المتغيرات أولاً

import express   from 'express'
import cors      from 'cors'
import helmet    from 'helmet'
import rateLimit from 'express-rate-limit'

import { corsConfig }    from './core/config/cors.js'
import { errorHandler }  from './core/middleware/error.middleware.js'


import adminRoutes  from './admin/index.js'
import clientRoutes from './client/index.js'
import leaderRoutes from './service-leader/index.js'

const app = express()

// ── Security ────────────────────────────────────────────────
app.use(helmet())

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'طلبات كثيرة جداً، حاول بعد قليل' },
})
app.use('/api/', globalLimiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'محاولات تسجيل دخول كثيرة، حاول بعد 15 دقيقة' },
})
app.use('/api/v1/client/auth/', authLimiter)

// ── Parsers ─────────────────────────────────────────────────
app.use(cors(corsConfig))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Static uploads ──────────────────────────────────────────
app.use('/uploads', express.static('uploads'))

// ── Routes ──────────────────────────────────────────────────

app.use('/api/v1/admin',          adminRoutes)
app.use('/api/v1/client',         clientRoutes)
app.use('/api/v1/service-leader', leaderRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: '✅ Server is running' })
})

// ── Error Handler (يجب أن يكون آخر middleware) ──────────────
app.use(errorHandler)

export default app
