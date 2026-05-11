import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { ApiError } from '../utils/ApiError.js'

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/documents')
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  },
})

export const uploadDocument = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new ApiError(400, 'نوع الملف غير مسموح به'))
    }
  },
})
