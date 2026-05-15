import { Router } from "express";
import { validate } from "../../core/middleware/validation.middleware.js";
import * as controller from "./requests.controller.js";
import {
  requestIdValidation,
  updateRequestValidation,
} from "./requests.validation.js";

const router = Router();

router.get("/:id", requestIdValidation, validate, controller.getRequestDetails);
router.patch("/:id", updateRequestValidation, validate, controller.updateRequest);

export default router;
