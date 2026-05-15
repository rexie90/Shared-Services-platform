import { query, param } from "express-validator";

export const validateGetServices = [
  query("category")
    .optional()
    .isString()
    .withMessage("التصنيف يجب أن يكون نصاً"),

  query("search")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("البحث يجب أن لا يتجاوز 100 حرف"),
];

export const validateGetServiceById = [
  param("id")
    .notEmpty()
    .withMessage("معرف الخدمة مطلوب")
    .isUUID()
    .withMessage("معرف الخدمة غير صحيح"),
];
