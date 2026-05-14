import { ApiResponse } from "../../core/utils/ApiResponse.js";
import * as slaService from "./sla.service.js";

export const getSlaOverview = async (req, res, next) => {
  try {
    const data = await slaService.getSlaOverview(req.user.id);

    res.json(new ApiResponse(200, data, "تم جلب بيانات SLA بنجاح"));
  } catch (err) {
    next(err);
  }
};
