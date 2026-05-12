import { Router } from "express";
import { protect } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/rbac.middleware.js";
import * as controller from "./dashboard.controller.js";

const router = Router();

router.use(protect, requireRole("SERVICE_LEADER"));

router.get("/stats", controller.getStats);
router.get("/requests", controller.getAssignedRequests);

export default router;
