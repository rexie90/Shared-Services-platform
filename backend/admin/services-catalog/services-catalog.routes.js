import { Router } from "express";
import { protect } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/rbac.middleware.js";
import * as controller from "./services-catalog.controller.js";
import {
  listServicesValidation,
  createServiceValidation,
  updateServiceValidation,
  deleteServiceValidation,
} from "./services-catalog.validation.js";

const router = Router();

router.use(protect, requireRole("ADMIN"));

router.get("/", listServicesValidation, controller.getServices);
router.post("/", createServiceValidation, controller.createService);
router.put("/:id", updateServiceValidation, controller.updateService);
router.delete("/:id", deleteServiceValidation, controller.deleteService);

export default router;
