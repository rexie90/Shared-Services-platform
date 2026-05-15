import { query, param, body } from "express-validator";

const FILTERS = ["ACTIVE", "CLOSED", "PENDING_REVIEW"];
const SORTS = ["newest", "oldest"];
const REQUEST_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "PENDING_CLIENT_APPROVAL",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
];

export const listRequestsValidation = [
  query("filter")
    .optional()
    .isIn(FILTERS)
    .withMessage("قيمة filter غير صحيحة"),
  query("sort")
    .optional()
    .isIn(SORTS)
    .withMessage("قيمة sort غير صحيحة"),
  query("search")
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage("قيمة search غير صحيحة"),
];

export const requestIdValidation = [
  param("id").isUUID().withMessage("معرّف الطلب غير صالح"),
];

export const updateStatusValidation = [
  ...requestIdValidation,
  body("status")
    .isIn(REQUEST_STATUSES)
    .withMessage("قيمة status غير صحيحة"),
];

export const reviewValidation = [
  ...requestIdValidation,
  body("action")
    .isIn(["approve", "reject"])
    .withMessage("قيمة action يجب أن تكون approve أو reject"),
];


