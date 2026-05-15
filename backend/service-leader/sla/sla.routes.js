import { Router } from "express";
import * as controller from "./sla.controller.js";

const router = Router();

router.get("/", controller.getSlaOverview);

export default router;
