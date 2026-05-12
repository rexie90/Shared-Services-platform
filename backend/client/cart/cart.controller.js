import { ApiResponse } from "../../core/utils/ApiResponse.js";
import * as cartService from "./cart.service.js";

export const getCart = async (req, res, next) => {
  try {
    const data = await cartService.getCart(req.user.id);
    res.json(new ApiResponse(200, data, "تم جلب السلة"));
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { serviceId } = req.body;
    const data = await cartService.addToCart(req.user.id, serviceId);
    res.json(new ApiResponse(200, data, "تمت إضافة الخدمة للسلة"));
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const data = await cartService.removeFromCart(req.user.id, serviceId);
    res.json(new ApiResponse(200, data, "تمت إزالة الخدمة من السلة"));
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const data = await cartService.clearCart(req.user.id);
    res.json(new ApiResponse(200, data, "تم تفريغ السلة"));
  } catch (err) {
    next(err);
  }
};
