import { ApiResponse } from "../../core/utils/ApiResponse.js";
import * as marketplaceService from "./marketplace.service.js";

export const getServices = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const data = await marketplaceService.getServices({ category, search });
    res.json(new ApiResponse(200, data, "تم جلب الخدمات"));
  } catch (err) {
    next(err);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await marketplaceService.getServiceById(id);
    res.json(new ApiResponse(200, data, "تم جلب الخدمة"));
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const data = await marketplaceService.getCategories();
    res.json(new ApiResponse(200, data, "تم جلب التصنيفات"));
  } catch (err) {
    next(err);
  }
};
