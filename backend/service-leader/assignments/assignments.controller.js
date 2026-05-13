import { validationResult } from "express-validator";
import * as assignmentsService from "./assignments.service.js";

const SUCCESS_MESSAGE = "Operation completed successfully";
const ERROR_MESSAGE = "Something went wrong";

const sendSuccess = (res, data) => {
  return res.json({
    success: true,
    message: SUCCESS_MESSAGE,
    data,
  });
};

const sendError = (res, errorCode, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message: ERROR_MESSAGE,
    error: errorCode,
  });
};

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return null;

  const firstError = errors.array()[0];
  const errorCode = firstError?.msg || "INVALID_REQUEST";
  return sendError(res, errorCode, 400);
};

const handleControllerError = (res, err) => {
  if (err?.errorCode) {
    return sendError(res, err.errorCode, err.statusCode || 400);
  }

  return sendError(res, "INTERNAL_SERVER_ERROR", 500);
};

export const getAssignments = async (req, res) => {
  const validationResponse = handleValidationErrors(req, res);
  if (validationResponse) return validationResponse;

  try {
    const data = await assignmentsService.getAssignments({
      userId: req.user.id,
      clientName: req.query.clientName,
    });

    return sendSuccess(res, data);
  } catch (err) {
    return handleControllerError(res, err);
  }
};

export const getAssignmentById = async (req, res) => {
  const validationResponse = handleValidationErrors(req, res);
  if (validationResponse) return validationResponse;

  try {
    const data = await assignmentsService.getAssignmentByRequestId({
      userId: req.user.id,
      requestId: req.params.id,
    });

    return sendSuccess(res, data);
  } catch (err) {
    return handleControllerError(res, err);
  }
};

export const updateAssignmentStatus = async (req, res) => {
  const validationResponse = handleValidationErrors(req, res);
  if (validationResponse) return validationResponse;

  try {
    const data = await assignmentsService.updateAssignmentRequestStatus({
      userId: req.user.id,
      requestId: req.params.id,
      requestStatus: req.body.requestStatus,
    });

    return sendSuccess(res, data);
  } catch (err) {
    return handleControllerError(res, err);
  }
};

export const getAssignmentChat = async (req, res) => {
  const validationResponse = handleValidationErrors(req, res);
  if (validationResponse) return validationResponse;

  try {
    const data = await assignmentsService.getAssignmentChatUrl({
      userId: req.user.id,
      requestId: req.params.id,
    });

    return sendSuccess(res, data);
  } catch (err) {
    return handleControllerError(res, err);
  }
};
