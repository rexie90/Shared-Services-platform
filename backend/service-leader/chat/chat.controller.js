import { ApiResponse } from "../../core/utils/ApiResponse.js";
import * as chatService from "./chat.service.js";

export const getChatContext = async (req, res, next) => {
  try {
    const data = await chatService.getChatContext(req.user.id);
    res.json(new ApiResponse(200, data, "تم جلب سياق المحادثات بنجاح"));
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const data = await chatService.getMessagesByRequest(
      req.user.id,
      req.params.requestId
    );
    res.json(new ApiResponse(200, data, "تم جلب الرسائل بنجاح"));
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const data = await chatService.sendMessage(
      req.user.id,
      req.params.requestId,
      req.body
    );
    res
      .status(201)
      .json(new ApiResponse(201, data, "تم إرسال الرسالة بنجاح"));
  } catch (err) {
    next(err);
  }
};

export const markMessagesAsRead = async (req, res, next) => {
  try {
    const data = await chatService.markClientMessagesAsRead(
      req.user.id,
      req.params.requestId
    );
    res.json(new ApiResponse(200, data, "تم تحديث حالة القراءة بنجاح"));
  } catch (err) {
    next(err);
  }
};


