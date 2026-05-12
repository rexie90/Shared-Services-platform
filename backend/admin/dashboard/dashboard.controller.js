import { ApiResponse } from "../../core/utils/ApiResponse.js";
import { ApiError } from "../../core/utils/ApiError.js";
import * as dashboardService from "./dashboard.service.js";

export const getStats = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardStats();
    res.json(new ApiResponse(200, data, "تم جلب إحصاءات لوحة التحكم"));
  } catch (err) {
    next(err);
  }
};

export const getActivity = async (req, res, next) => {
  try {
    const data = await dashboardService.getRecentActivity();
    res.json(new ApiResponse(200, data, "تم جلب النشاط الأخير"));
  } catch (err) {
    next(err);
  }
};

export const getStatusDistribution = async (req, res, next) => {
  try {
    const data = await dashboardService.getRequestStatusDistribution();
    res.json(new ApiResponse(200, data, "تم جلب توزيع حالات الطلبات"));
  } catch (err) {
    next(err);
  }
};

export const getPendingAssignments = async (req, res, next) => {
  try {
    const data = await dashboardService.getPendingAssignments();
    res.json(new ApiResponse(200, data, "تم جلب الطلبات بانتظار التعيين"));
  } catch (err) {
    next(err);
  }
};
