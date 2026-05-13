import prisma from "../../core/config/db.js";

export const getServices = async (filters = {}) => {
  const { category, search } = filters;

  const where = {
    isActive: true,
    ...(category && { category }),
    ...(search && {
      OR: [
        { nameAr: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const services = await prisma.service.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      nameAr: true,
      description: true,
      descriptionAr: true,
      category: true,
      isActive: true,
    },
  });

  return services;
};

export const getServiceById = async (id) => {
  const service = await prisma.service.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      nameAr: true,
      description: true,
      descriptionAr: true,
      category: true,
      isActive: true,
    },
  });

  if (!service || !service.isActive) {
    throw new Error("الخدمة غير موجودة");
  }

  return service;
};

export const getCategories = async () => {
  const categories = await prisma.service.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ["category"],
  });

  return categories.map((c) => c.category);
};
