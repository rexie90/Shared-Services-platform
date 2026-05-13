import { Router } from "express";
import { protect } from "../core/middleware/auth.middleware.js";
import { requireRole } from "../core/middleware/rbac.middleware.js";
import dashboardRoutes from "./dashboard/dashboard.routes.js";
import assignmentsRoutes from "./assignments/assignments.routes.js";

// import requestsRoutes     from './requests/requests.routes.js'
// import assignmentsRoutes  from './assignments/assignments.routes.js'
// import deliverablesRoutes from './deliverables/deliverables.routes.js'
// import chatRoutes         from './chat/chat.routes.js'
// import slaRoutes          from './sla/sla.routes.js'

const router = Router();
router.use(protect, requireRole("SERVICE_LEADER"));

router.use("/dashboard", dashboardRoutes);
router.use("/assignments", assignmentsRoutes);

// router.use('/requests',     requestsRoutes)
// router.use('/assignments',  assignmentsRoutes)
// router.use('/deliverables', deliverablesRoutes)
// router.use('/chat',         chatRoutes)
// router.use('/sla',          slaRoutes)

export default router;
