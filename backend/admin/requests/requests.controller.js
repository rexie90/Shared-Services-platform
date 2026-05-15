import { ApiResponse } from "../../core/utils/ApiResponse.js";
import * as requestsService from "./requests.service.js";

export const getAllRequests = async (req, res, next) => {
  try {
    const { filter, search, sort } = req.query;
    const data = await requestsService.getAllRequests({ filter, search, sort });
    res.json(new ApiResponse(200, data, "تم جلب الطلبات بنجاح"));
  } catch (err) {
    next(err);
  }
};

export const getRequestDetails = async (req, res, next) => {
  try {
    const data = await requestsService.getRequestDetails(req.params.id);
    res.json(new ApiResponse(200, data, "تم جلب تفاصيل الطلب بنجاح"));
  } catch (err) {
    next(err);
  }
};

export const updateRequestStatus = async (req, res, next) => {
  try {
    const data = await requestsService.updateRequestStatus(
      req.params.id,
      req.body.status
    );
    res.json(new ApiResponse(200, data, "تم تحديث حالة الطلب بنجاح"));
  } catch (err) {
    next(err);
  }
};

export const reviewRequest = async (req, res, next) => {
  try {
    const data = await requestsService.reviewRequest(
      req.params.id,
      req.body.action
    );
    res.json(new ApiResponse(200, data, "تم تنفيذ إجراء المراجعة بنجاح"));
  } catch (err) {
    next(err);
  }
};


