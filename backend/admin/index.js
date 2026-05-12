import { Router } from "express";
import { protect } from "../core/middleware/auth.middleware.js";
import { requireRole } from "../core/middleware/rbac.middleware.js";
import dashboardRoutes from "./dashboard/dashboard.routes.js";

// import usersRoutes         from './users/users.routes.js'
// import servicesCatalogRoutes from './services-catalog/services-catalog.routes.js'
// import requestsRoutes      from './requests/requests.routes.js'
// import assignmentsRoutes   from './assignments/assignments.routes.js'
// import reportsRoutes       from './reports/reports.routes.js'
// import settingsRoutes      from './settings/settings.routes.js'

const router = Router();

router.use(protect, requireRole("ADMIN"));

router.use("/dashboard", dashboardRoutes);

// router.use('/users',            usersRoutes)
// router.use('/services-catalog', servicesCatalogRoutes)
// router.use('/requests',         requestsRoutes)
// router.use('/assignments',      assignmentsRoutes)
// router.use('/reports',          reportsRoutes)
// router.use('/settings',         settingsRoutes)

export default router;
