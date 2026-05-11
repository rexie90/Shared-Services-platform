import { ApiError } from '../utils/ApiError.js'

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message    = err.message    || 'خطأ داخلي في الخادم'
  let errors     = err.errors     || []

  // Prisma errors
  if (err.code === 'P2002') {
    statusCode = 409
    message = 'هذا السجل موجود مسبقاً'
  }
  if (err.code === 'P2025') {
    statusCode = 404
    message = 'السجل المطلوب غير موجود'
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err)
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
