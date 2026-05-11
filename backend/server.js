import app from './app.js'
import { env } from './core/config/env.js'

app.listen(env.PORT, () => {
  console.log(`✅ Server running → http://localhost:${env.PORT}`)
  console.log(`📦 Environment: ${env.NODE_ENV}`)
})
