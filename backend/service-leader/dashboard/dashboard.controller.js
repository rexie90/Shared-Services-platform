import { ApiResponse } from "../../core/utils/ApiResponse.js";
import * as dashboardService from "./dashboard.service.js";

export const getStats = async (req, res, next) => {
  try {
    const data = await dashboardService.getLeaderDashboardStats(req.user.id);
    res.json(new ApiResponse(200, data, "تم جلب إحصاءات مسؤول الخدمة"));
  } catch (err) {
    next(err);
  }
};

export const getAssignedRequests = async (req, res, next) => {
  try {
    const data = await dashboardService.getLeaderAssignedRequests(req.user.id);
    res.json(new ApiResponse(200, data, "تم جلب الطلبات المعيّنة"));
  } catch (err) {
    next(err);
  }
};
