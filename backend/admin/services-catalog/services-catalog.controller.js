import { ApiResponse } from "../../core/utils/ApiResponse.js";
import * as servicesCatalogService from "./services-catalog.service.js";

export const getServices = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search,
      category: req.query.category,
      isActive:
        req.query.isActive !== undefined
          ? req.query.isActive === true || req.query.isActive === "true"
          : undefined,
    };

    const data = await servicesCatalogService.getAllServices(filters);

    res.json(new ApiResponse(200, data, "تم جلب الخدمات بنجاح"));
  } catch (err) {
    next(err);
  }
};

export const createService = async (req, res, next) => {
  try {
    const data = await servicesCatalogService.createService(req.body);

    res
      .status(201)
      .json(new ApiResponse(201, data, "تم إنشاء الخدمة بنجاح"));
  } catch (err) {
    next(err);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const data = await servicesCatalogService.updateService(req.params.id, req.body);

    res.json(new ApiResponse(200, data, "تم تحديث الخدمة بنجاح"));
  } catch (err) {
    next(err);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const data = await servicesCatalogService.softDeleteService(req.params.id);

    res.json(
      new ApiResponse(200, data, "تم تعطيل الخدمة بنجاح (Soft Delete)")
    );
  } catch (err) {
    next(err);
  }
};
