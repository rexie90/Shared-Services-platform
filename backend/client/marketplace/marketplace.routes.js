import { Router } from "express";
import { protect } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/rbac.middleware.js";
import { validate } from "../../core/middleware/validation.middleware.js";
import * as controller from "./marketplace.controller.js";
import {
  validateGetServices,
  validateGetServiceById,
} from "./marketplace.validation.js";

const router = Router();

router.use(protect, requireRole("CLIENT"));

router.get("/", validateGetServices, validate, controller.getServices);
router.get("/categories", controller.getCategories);
router.get("/:id", validateGetServiceById, validate, controller.getServiceById);

export default router;
