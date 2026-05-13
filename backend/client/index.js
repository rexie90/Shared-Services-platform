import { Router } from "express";
import { protect } from "../core/middleware/auth.middleware.js";
import { requireRole } from "../core/middleware/rbac.middleware.js";
import cartRoutes from "./cart/cart.routes.js";
import marketplaceRoutes from "./marketplace/marketplace.routes.js";

// import authRoutes         from './auth/auth.routes.js'
// import requestsRoutes     from './requests/requests.routes.js'
// import documentsRoutes    from './documents/documents.routes.js'
// import invoicesRoutes     from './invoices/invoices.routes.js'
// import notifRoutes        from './notifications/notifications.routes.js'

const router = Router();

// router.use('/auth', authRoutes)

router.use(protect, requireRole("CLIENT"));

router.use("/cart", cartRoutes);
router.use("/marketplace", marketplaceRoutes);

// router.use('/requests',      requestsRoutes)
// router.use('/documents',     documentsRoutes)
// router.use('/invoices',      invoicesRoutes)
// router.use('/notifications', notifRoutes)

export default router;
