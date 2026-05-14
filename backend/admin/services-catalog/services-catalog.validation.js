import { body, param, query, validationResult } from "express-validator";
import { ApiError } from "../../core/utils/ApiError.js";

const SERVICE_CATEGORIES = [
  "FINANCE",
  "ACCOUNTING",
  "HR",
  "GOVERNMENT_RELATIONS",
  "LEGAL",
  "PROCUREMENT",
  "MARKETING",
  "BUSINESS_DEVELOPMENT",
];

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }

  return value;
};

const atLeastOne = (fields) => (value, { req }) => {
  const hasAtLeastOne = fields.some((field) => req.body[field] !== undefined);

  if (!hasAtLeastOne) {
    throw new Error(
      `يجب إرسال حقل واحد على الأقل للتحديث: ${fields.join(", ")}`
    );
  }

  return true;
};

export const validate = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return next(
      new ApiError(400, "فشل التحقق من صحة البيانات المدخلة", formattedErrors)
    );
  }

  return next();
};

export const listServicesValidation = [
  query("search")
    .optional()
    .isString()
    .withMessage("search يجب أن يكون نصاً")
    .trim(),

  query("category")
    .optional()
    .isIn(SERVICE_CATEGORIES)
    .withMessage("category غير صالح"),

  query("isActive")
    .optional()
    .customSanitizer(toBoolean)
    .isBoolean()
    .withMessage("isActive يجب أن يكون true أو false"),

  validate,
];

export const createServiceValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("name مطلوب")
    .isString()
    .withMessage("name يجب أن يكون نصاً"),

  body("nameAr")
    .trim()
    .notEmpty()
    .withMessage("nameAr مطلوب")
    .isString()
    .withMessage("nameAr يجب أن يكون نصاً"),

  body("category")
    .exists({ checkFalsy: true })
    .withMessage("category مطلوب")
    .isIn(SERVICE_CATEGORIES)
    .withMessage("category غير صالح"),

  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage("description يجب أن يكون نصاً")
    .trim(),

  body("descriptionAr")
    .optional({ nullable: true })
    .isString()
    .withMessage("descriptionAr يجب أن يكون نصاً")
    .trim(),

  body("isActive")
    .optional()
    .customSanitizer(toBoolean)
    .isBoolean()
    .withMessage("isActive يجب أن يكون true أو false"),

  validate,
];

export const updateServiceValidation = [
  param("id").isUUID().withMessage("id يجب أن يكون UUID صالح"),

  body().custom(
    atLeastOne([
      "name",
      "nameAr",
      "description",
      "descriptionAr",
      "category",
      "isActive",
    ])
  ),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("name لا يمكن أن يكون فارغاً")
    .isString()
    .withMessage("name يجب أن يكون نصاً"),

  body("nameAr")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("nameAr لا يمكن أن يكون فارغاً")
    .isString()
    .withMessage("nameAr يجب أن يكون نصاً"),

  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage("description يجب أن يكون نصاً")
    .trim(),

  body("descriptionAr")
    .optional({ nullable: true })
    .isString()
    .withMessage("descriptionAr يجب أن يكون نصاً")
    .trim(),

  body("category")
    .optional()
    .isIn(SERVICE_CATEGORIES)
    .withMessage("category غير صالح"),

  body("isActive")
    .optional()
    .customSanitizer(toBoolean)
    .isBoolean()
    .withMessage("isActive يجب أن يكون true أو false"),

  validate,
];

export const deleteServiceValidation = [
  param("id").isUUID().withMessage("id يجب أن يكون UUID صالح"),
  validate,
];
