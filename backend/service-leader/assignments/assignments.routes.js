import { Router } from "express";
import { validate } from "../../core/middleware/validation.middleware.js";
import * as assignmentsController from "./assignments.controller.js";
import {
  validateAssignmentId,
  validateAssignmentsQuery,
  validateUpdateRequestStatus,
} from "./assignments.validation.js";

const router = Router();

router.get(
  "/",
  validateAssignmentsQuery,
  validate,
  assignmentsController.getAssignments
);

router.get(
  "/:id",
  validateAssignmentId,
  validate,
  assignmentsController.getAssignmentById
);

router.put(
  "/:id/status",
  validateUpdateRequestStatus,
  validate,
  assignmentsController.updateAssignmentStatus
);

router.get(
  "/:id/chat",
  validateAssignmentId,
  validate,
  assignmentsController.getAssignmentChat
);

export default router;
