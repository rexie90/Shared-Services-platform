import { Router } from "express";
import { protect } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/rbac.middleware.js";
import * as controller from "./cart.controller.js";

const router = Router();

router.use(protect, requireRole("CLIENT"));

router.get("/", controller.getCart);
router.post("/", controller.addToCart);
router.delete("/:serviceId", controller.removeFromCart);
router.delete("/", controller.clearCart);

export default router;
