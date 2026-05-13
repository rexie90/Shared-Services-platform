import { Router } from "express";
import { protect } from "../core/middleware/auth.middleware.js";
import { requireRole } from "../core/middleware/rbac.middleware.js";
import dashboardRoutes from "./dashboard/dashboard.routes.js";
import settingsRoutes      from './settings/settings.routes.js'

const router = Router();

router.use(protect, requireRole("ADMIN"));

router.use("/dashboard", dashboardRoutes);

// router.use('/users',            usersRoutes)
// router.use('/services-catalog', servicesCatalogRoutes)
// router.use('/requests',         requestsRoutes)
// router.use('/assignments',      assignmentsRoutes)
// router.use('/reports',          reportsRoutes)
router.use('/settings',         settingsRoutes)

export default router;
