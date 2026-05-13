import bcrypt from "bcryptjs";
import prisma from "../../core/config/db.js";

const STATUS = {
  ACTIVE: "ACTIVE",
  PENDING_APPROVAL: "PENDING_APPROVAL",
};

const ALLOWED_ROLES = ["ADMIN", "SERVICE_LEADER", "CLIENT"];

const mapUserResponse = (user) => ({
  userId: user.id,
  fullName: user.fullName,
  role: user.role,
  companyName: user.role === "CLIENT" ? user.clientProfile?.companyName ?? null : null,
  status: user.isActive ? STATUS.ACTIVE : STATUS.PENDING_APPROVAL,
});

export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    include: {
      clientProfile: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users.map(mapUserResponse);
};

export const createUser = async ({ email, password, fullName, role, companyName }) => {
  if (!ALLOWED_ROLES.includes(role)) {
    const error = new Error("INVALID_ROLE");
    error.code = "INVALID_ROLE";
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName,
      role,
      ...(role === "CLIENT" && companyName
        ? {
            clientProfile: {
              create: {
                companyName,
              },
            },
          }
        : {}),
    },
    include: {
      clientProfile: true,
    },
  });

  return mapUserResponse(user);
};

export const approveUser = async (id) => {
  const user = await prisma.user.update({
    where: { id },
    data: { isActive: true },
    include: {
      clientProfile: true,
    },
  });

  return mapUserResponse(user);
};

export const activateUser = async (id) => {
  const user = await prisma.user.update({
    where: { id },
    data: { isActive: true },
    include: {
      clientProfile: true,
    },
  });

  return mapUserResponse(user);
};

export const deactivateUser = async (id) => {
  const user = await prisma.user.update({
    where: { id },
    data: { isActive: false },
    include: {
      clientProfile: true,
    },
  });

  return mapUserResponse(user);
};

export const updateUserRole = async (id, role) => {
  if (!ALLOWED_ROLES.includes(role)) {
    const error = new Error("INVALID_ROLE");
    error.code = "INVALID_ROLE";
    throw error;
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    include: {
      clientProfile: true,
    },
  });

  return mapUserResponse(user);
};


