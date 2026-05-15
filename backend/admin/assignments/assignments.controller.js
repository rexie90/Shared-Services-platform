import { ApiResponse } from "../../core/utils/ApiResponse.js";
import * as assignmentsService from "./assignments.service.js";

export const getPendingRequests = async (req, res, next) => {
  try {
    const data = await assignmentsService.getPendingRequests();
    res.json(new ApiResponse(200, data, "تم جلب الطلبات بانتظار التعيين"));
  } catch (err) {
    next(err);
  }
};

export const getAvailableLeaders = async (req, res, next) => {
  try {
    const { category } = req.query;
    const data = await assignmentsService.getAvailableLeaders(category);
    res.json(new ApiResponse(200, data, "تم جلب مسؤولي الخدمات المتاحين"));
  } catch (err) {
    next(err);
  }
};

export const assignLeader = async (req, res, next) => {
  try {
    const { requestId, leaderId } = req.body;
    const data = await assignmentsService.assignLeader(requestId, leaderId);
    res.json(new ApiResponse(201, data, "تم تعيين مسؤول الخدمة بنجاح"));
  } catch (err) {
    next(err);
  }
};
