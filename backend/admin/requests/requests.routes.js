import { Router } from "express";
import { validate } from "../../core/middleware/validation.middleware.js";
import * as controller from "./requests.controller.js";
import {
  listRequestsValidation,
  requestIdValidation,
  reviewValidation,
  updateStatusValidation,
} from "./requests.validation.js";

const router = Router();

router.get("/", listRequestsValidation, validate, controller.getAllRequests);
router.get("/:id", requestIdValidation, validate, controller.getRequestDetails);
router.patch(
  "/:id/status",
  updateStatusValidation,
  validate,
  controller.updateRequestStatus
);
router.patch("/:id/review", reviewValidation, validate, controller.reviewRequest);

export default router;


