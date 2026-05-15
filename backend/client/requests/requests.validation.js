import { body, param } from "express-validator";

const EDITABLE_FIELDS = [
  "title",
  "description",
  "scope",
  "priority",
  "dueDate",
  "serviceType",
];

const PROTECTED_FIELDS = [
  "status",
  "clientId",
  "serviceId",
  "completedAt",
  "createdAt",
  "updatedAt",
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const requestIdValidation = [
  param("id").isUUID().withMessage("معرّف الطلب غير صالح"),
];

export const updateRequestValidation = [
  ...requestIdValidation,
  body("title")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("العنوان يجب أن يكون نصاً بين 3 و 200 حرف"),
  body("description")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 3000 })
    .withMessage("الوصف يجب ألا يتجاوز 3000 حرف"),
  body("scope")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("النطاق يجب ألا يتجاوز 5000 حرف"),
  body("priority")
    .optional()
    .isIn(PRIORITIES)
    .withMessage("قيمة priority غير صحيحة"),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("قيمة dueDate يجب أن تكون تاريخاً صالحاً")
    .custom((value) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return false;
      return date.getTime() > Date.now();
    })
    .withMessage("dueDate يجب أن يكون تاريخاً مستقبلياً"),
  body("serviceType")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("قيمة serviceType غير صحيحة"),
  body().custom((payload) => {
    const keys = Object.keys(payload || {});

    if (!keys.length) {
      throw new Error("يجب إرسال حقل واحد على الأقل للتعديل");
    }

    const hasProtectedField = keys.some((k) => PROTECTED_FIELDS.includes(k));
    if (hasProtectedField) {
      throw new Error("تحتوي البيانات على حقول غير مسموح بتعديلها");
    }

    const hasEditableField = keys.some((k) => EDITABLE_FIELDS.includes(k));
    if (!hasEditableField) {
      throw new Error("يجب إرسال حقل قابل للتعديل واحد على الأقل");
    }

    const hasUnknownField = keys.some(
      (k) => !EDITABLE_FIELDS.includes(k) && !PROTECTED_FIELDS.includes(k)
    );
    if (hasUnknownField) {
      throw new Error("تحتوي البيانات على حقول غير مدعومة");
    }

    return true;
  }),
];
