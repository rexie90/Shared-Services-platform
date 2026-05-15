import { ApiResponse } from "../../core/utils/ApiResponse.js";
import * as requestsService from "./requests.service.js";

export const getRequestDetails = async (req, res, next) => {
  try {
    const data = await requestsService.getRequestDetails(req.user.id, req.params.id);
    res.json(new ApiResponse(200, data, "تم جلب تفاصيل الطلب بنجاح"));
  } catch (err) {
    next(err);
  }
};

export const updateRequest = async (req, res, next) => {
  try {
    const data = await requestsService.updateRequest(
      req.user.id,
      req.params.id,
      req.body
    );
    res.json(new ApiResponse(200, data, "تم تحديث الطلب بنجاح"));
  } catch (err) {
    next(err);
  }
};
