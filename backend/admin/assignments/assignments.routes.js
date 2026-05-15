import { Router } from "express";
import { protect } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/rbac.middleware.js";
import { validate } from "../../core/middleware/validation.middleware.js";
import * as controller from "./assignments.controller.js";
import {
  validateAssignLeader,
  validateGetLeaders,
} from "./assignments.validation.js";

const router = Router();

router.use(protect, requireRole("ADMIN"));

router.get("/pending", controller.getPendingRequests);
router.get(
  "/leaders",
  validateGetLeaders,
  validate,
  controller.getAvailableLeaders,
);
router.post("/assign", validateAssignLeader, validate, controller.assignLeader);

export default router;
