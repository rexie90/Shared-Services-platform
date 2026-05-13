import { body, query } from "express-validator";

export const validateAssignLeader = [
  body("requestId")
    .notEmpty()
    .withMessage("معرف الطلب مطلوب")
    .isUUID()
    .withMessage("معرف الطلب غير صحيح"),

  body("leaderId")
    .notEmpty()
    .withMessage("معرف مسؤول الخدمة مطلوب")
    .isUUID()
    .withMessage("معرف مسؤول الخدمة غير صحيح"),
];

export const validateGetLeaders = [
  query("category")
    .optional()
    .isString()
    .withMessage("التصنيف يجب أن يكون نصاً"),
];
