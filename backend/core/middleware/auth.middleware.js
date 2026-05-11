import { verifyToken } from '../config/jwt.js'
import { ApiError } from '../utils/ApiError.js'
import prisma from '../config/db.js'

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      return next(new ApiError(401, 'يجب تسجيل الدخول أولاً'))
    }

    const token = header.split(' ')[1]
    const decoded = verifyToken(token)

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, isActive: true },
    })

    if (!user || !user.isActive) {
      return next(new ApiError(401, 'الحساب غير موجود أو غير مفعّل'))
    }

    req.user = user
    next()
  } catch {
    next(new ApiError(401, 'رمز المصادقة غير صالح أو منتهي الصلاحية'))
  }
}
