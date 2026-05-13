import { param, query, body } from "express-validator";
import { RequestStatus } from "@prisma/client";

const REQUEST_STATUSES = Object.values(RequestStatus);

export const validateAssignmentId = [
  param("id").isString().trim().notEmpty().withMessage("REQUEST_ID_REQUIRED"),
];

export const validateAssignmentsQuery = [
  query("clientName").optional().isString().trim(),
];

export const validateUpdateRequestStatus = [
  ...validateAssignmentId,
  body("requestStatus")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("INVALID_REQUEST_STATUS")
    .isIn(REQUEST_STATUSES)
    .withMessage("INVALID_REQUEST_STATUS"),
];

export { REQUEST_STATUSES };
