import { Router } from "express";
import { validate } from "../../core/middleware/validation.middleware.js";
import * as controller from "./chat.controller.js";
import {
  markReadValidation,
  requestIdValidation,
  sendMessageValidation,
} from "./chat.validation.js";

const router = Router();

router.get("/context", controller.getChatContext);
router.get(
  "/:requestId/messages",
  requestIdValidation,
  validate,
  controller.getMessages
);
router.post(
  "/:requestId/messages",
  sendMessageValidation,
  validate,
  controller.sendMessage
);
router.patch(
  "/:requestId/read",
  markReadValidation,
  validate,
  controller.markMessagesAsRead
);

export default router;


