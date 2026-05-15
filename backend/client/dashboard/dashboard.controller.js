import { ApiResponse } from "../../core/utils/ApiResponse.js";
import * as dashboardService from "./dashboard.service.js";

export const getDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getClientDashboard(req.user.id);

    res.json(new ApiResponse(200, data, "تم جلب بيانات لوحة العميل بنجاح"));
  } catch (err) {
    next(err);
  }
};
