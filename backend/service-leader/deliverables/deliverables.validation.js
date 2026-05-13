import { body, validationResult, param } from 'express-validator';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation error', errors: errors.array() });
  }
  next();
};

export const validateDeliverableCreation = [
  body('requestId').isUUID().notEmpty(),
  body('title').isString().notEmpty(),
  body('description').isString().optional(),
  body('fileUrl').isString().notEmpty(),
  validate
];

export const validateResubmission = [
  param('id').isUUID(),
  body('title').isString().optional(),
  body('description').isString().optional(),
  body('fileUrl').isString().optional(),
  validate
];
