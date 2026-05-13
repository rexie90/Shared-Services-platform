import { body, validationResult } from 'express-validator';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation error', errors: errors.array() });
  }
  next();
};

export const validateGeneral = [
  body('clientReviewDays').isInt({ min: 1 }).optional(),
  body('maxConcurrentRequests').isInt({ min: 1 }).optional(),
  validate
];

export const validateSecurity = [
  body('twoFactorForAdmins').isBoolean().optional(),
  body('encryptDataRoomFiles').isBoolean().optional(),
  body('allowMultiDeviceLogin').isBoolean().optional(),
  validate
];

export const validateNotifications = [
  body('notifyNewRequests').isBoolean().optional(),
  body('notifyUserApproval').isBoolean().optional(),
  body('notifyDailyActivityReport').isBoolean().optional(),
  body('notifySlaDelay').isBoolean().optional(),
  body('notifyNewDataRoomFiles').isBoolean().optional(),
  validate
];

export const validatePermissions = [
  body('serviceLeaderPermissions').custom(value => {
    if (value && typeof value !== 'object') throw new Error('Must be an object');
    return true;
  }).optional(),
  body('clientManagerPermissions').custom(value => {
    if (value && typeof value !== 'object') throw new Error('Must be an object');
    return true;
  }).optional(),
  body('clientTeamPermissions').custom(value => {
    if (value && typeof value !== 'object') throw new Error('Must be an object');
    return true;
  }).optional(),
  validate
];
