import prisma from "../../core/config/db.js";
import { ApiError } from "../../core/utils/ApiError.js";

const SERVICE_CATEGORIES = [
  "FINANCE",
  "ACCOUNTING",
  "HR",
  "GOVERNMENT_RELATIONS",
  "LEGAL",
  "PROCUREMENT",
  "MARKETING",
  "BUSINESS_DEVELOPMENT",
];

const buildWhereClause = ({ search, category, isActive }) => {
  const where = {};

  if (category) {
    where.category = category;
  }

  if (typeof isActive === "boolean") {
    where.isActive = isActive;
  }

  if (search) {
    const normalized = search.trim();
    const upperSearch = normalized.toUpperCase();

    const orConditions = [
      { name: { contains: normalized, mode: "insensitive" } },
      { nameAr: { contains: normalized, mode: "insensitive" } },
      { description: { contains: normalized, mode: "insensitive" } },
      { descriptionAr: { contains: normalized, mode: "insensitive" } },
    ];

    if (SERVICE_CATEGORIES.includes(upperSearch)) {
      orConditions.push({ category: { equals: upperSearch } });
    }

    where.OR = orConditions;
  }

  return where;
};

const findDuplicateService = async ({ name, nameAr, excludeId }) => {
  const orConditions = [];

  if (name !== undefined) {
    orConditions.push({ name: { equals: name, mode: "insensitive" } });
  }

  if (nameAr !== undefined) {
    orConditions.push({ nameAr: { equals: nameAr, mode: "insensitive" } });
  }

  if (orConditions.length === 0) {
    return null;
  }

  const where = {
    OR: orConditions,
    ...(excludeId ? { id: { not: excludeId } } : {}),
  };

  return prisma.service.findFirst({ where });
};

export const getAllServices = async (filters) => {
  const where = buildWhereClause(filters);

  return prisma.service.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
};

export const createService = async (payload) => {
  const duplicate = await findDuplicateService({
    name: payload.name,
    nameAr: payload.nameAr,
  });

  if (duplicate) {
    throw new ApiError(409, "يوجد خدمة بنفس الاسم أو الاسم العربي مسبقاً");
  }

  return prisma.service.create({
    data: {
      name: payload.name,
      nameAr: payload.nameAr,
      description: payload.description ?? null,
      descriptionAr: payload.descriptionAr ?? null,
      category: payload.category,
      isActive: payload.isActive ?? true,
    },
  });
};

export const updateService = async (id, payload) => {
  const existing = await prisma.service.findUnique({ where: { id } });

  if (!existing) {
    throw new ApiError(404, "الخدمة غير موجودة");
  }

  const duplicate = await findDuplicateService({
    name: payload.name,
    nameAr: payload.nameAr,
    excludeId: id,
  });

  if (duplicate) {
    throw new ApiError(409, "يوجد خدمة بنفس الاسم أو الاسم العربي مسبقاً");
  }

  return prisma.service.update({
    where: { id },
    data: {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.nameAr !== undefined ? { nameAr: payload.nameAr } : {}),
      ...(payload.description !== undefined
        ? { description: payload.description }
        : {}),
      ...(payload.descriptionAr !== undefined
        ? { descriptionAr: payload.descriptionAr }
        : {}),
      ...(payload.category !== undefined ? { category: payload.category } : {}),
      ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
    },
  });
};

export const softDeleteService = async (id) => {
  const existing = await prisma.service.findUnique({ where: { id } });

  if (!existing) {
    throw new ApiError(404, "الخدمة غير موجودة");
  }

  return prisma.service.update({
    where: { id },
    data: { isActive: false },
  });
};
