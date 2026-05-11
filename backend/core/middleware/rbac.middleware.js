import { ApiError } from '../utils/ApiError.js'

// الاستخدام: requireRole('ADMIN') أو requireRole('ADMIN', 'SERVICE_LEADER')
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'غير مصرح'))
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'ليس لديك صلاحية للقيام بهذا الإجراء'))
    }
    next()
  }
}
