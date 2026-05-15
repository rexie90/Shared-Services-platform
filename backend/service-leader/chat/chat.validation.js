import { body, param } from "express-validator";

export const requestIdValidation = [
  param("requestId").isUUID().withMessage("معرّف الطلب غير صالح"),
];

export const sendMessageValidation = [
  ...requestIdValidation,
  body("messageText")
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 5000 })
    .withMessage("نص الرسالة غير صالح"),
  body("attachment")
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 2000 })
    .withMessage("مرفق الرسالة غير صالح"),
  body().custom((value) => {
    const text = value?.messageText;
    const attachment = value?.attachment;

    const hasText = typeof text === "string" && text.trim().length > 0;
    const hasAttachment =
      typeof attachment === "string" && attachment.trim().length > 0;

    if (!hasText && !hasAttachment) {
      throw new Error("يجب إدخال messageText أو attachment على الأقل");
    }

    return true;
  }),
];

export const markReadValidation = [...requestIdValidation];


