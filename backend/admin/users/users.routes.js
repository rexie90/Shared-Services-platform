import { Router } from "express";
import {
  activateUserHandler,
  approveUserHandler,
  createUserHandler,
  deactivateUserHandler,
  getUsers,
  updateUserRoleHandler,
} from "./users.controller.js";

const router = Router();

router.get("/", getUsers);
router.post("/", createUserHandler);
router.put("/:id/approve", approveUserHandler);
router.put("/:id/activate", activateUserHandler);
router.put("/:id/deactivate", deactivateUserHandler);
router.put("/:id/role", updateUserRoleHandler);

export default router;


