import { Router } from "express";
import { protect } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/rbac.middleware.js";
import * as controller from "./dashboard.controller.js";

const router = Router();

router.use(protect, requireRole("ADMIN"));

router.get("/stats", controller.getStats);
router.get("/activity", controller.getActivity);
router.get("/status-distribution", controller.getStatusDistribution);
router.get("/pending-assignments", controller.getPendingAssignments);

export default router;
