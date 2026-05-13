import {
  activateUser,
  approveUser,
  createUser,
  deactivateUser,
  getAllUsers,
  updateUserRole,
} from "./users.service.js";

const ALLOWED_ROLES = ["ADMIN", "SERVICE_LEADER", "CLIENT"];

const successResponse = (res, data) =>
  res.json({
    success: true,
    message: "تم تنفيذ العملية",
    data,
  });

const errorResponse = (res, statusCode, errorCode) =>
  res.status(statusCode).json({
    success: false,
    message: "حدث خطأ",
    error: errorCode,
  });

export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    return successResponse(res, users);
  } catch (error) {
    return errorResponse(res, 500, "INTERNAL_SERVER_ERROR");
  }
};

export const createUserHandler = async (req, res) => {
  try {
    const { email, password, fullName, role, companyName } = req.body;

    if (!email || !password || !fullName || !role) {
      return errorResponse(res, 400, "MISSING_REQUIRED_FIELDS");
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return errorResponse(res, 400, "INVALID_ROLE");
    }

    const user = await createUser({
      email,
      password,
      fullName,
      role,
      companyName,
    });

    return successResponse(res, user);
  } catch (error) {
    if (error.code === "P2002") {
      return errorResponse(res, 409, "EMAIL_ALREADY_EXISTS");
    }

    if (error.code === "INVALID_ROLE") {
      return errorResponse(res, 400, "INVALID_ROLE");
    }

    return errorResponse(res, 500, "INTERNAL_SERVER_ERROR");
  }
};

export const approveUserHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await approveUser(id);
    return successResponse(res, user);
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, 404, "USER_NOT_FOUND");
    }

    return errorResponse(res, 500, "INTERNAL_SERVER_ERROR");
  }
};

export const activateUserHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await activateUser(id);
    return successResponse(res, user);
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, 404, "USER_NOT_FOUND");
    }

    return errorResponse(res, 500, "INTERNAL_SERVER_ERROR");
  }
};

export const deactivateUserHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await deactivateUser(id);
    return successResponse(res, user);
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, 404, "USER_NOT_FOUND");
    }

    return errorResponse(res, 500, "INTERNAL_SERVER_ERROR");
  }
};

export const updateUserRoleHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return errorResponse(res, 400, "MISSING_ROLE");
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return errorResponse(res, 400, "INVALID_ROLE");
    }

    const user = await updateUserRole(id, role);
    return successResponse(res, user);
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, 404, "USER_NOT_FOUND");
    }

    if (error.code === "INVALID_ROLE") {
      return errorResponse(res, 400, "INVALID_ROLE");
    }

    return errorResponse(res, 500, "INTERNAL_SERVER_ERROR");
  }
};


