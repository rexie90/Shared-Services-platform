import prisma from "../../core/config/db.js";

export const getDashboardStats = async () => {
  const [totalUsers, totalRequests, activeRequests, completedRequests] =
    await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.request.count(),
      prisma.request.count({
        where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
      }),
      prisma.request.count({
        where: { status: "COMPLETED" },
      }),
    ]);

  return {
    totalUsers,
    totalRequests,
    activeRequests,
    completedRequests,
  };
};

export const getRecentActivity = async () => {
  const requests = await prisma.request.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      client: { include: { user: { select: { fullName: true } } } },
      service: { select: { nameAr: true } },
    },
  });

  return requests.map((r) => ({
    id: r.id,
    requestNumber: r.requestNumber,
    clientName: r.client.user.fullName,
    serviceName: r.service.nameAr,
    status: r.status,
    createdAt: r.createdAt,
  }));
};

export const getRequestStatusDistribution = async () => {
  const statuses = await prisma.request.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  return statuses.map((s) => ({
    status: s.status,
    count: s._count.status,
  }));
};

export const getPendingAssignments = async () => {
  const requests = await prisma.request.findMany({
    where: { status: "SUBMITTED" },
    include: {
      client: { include: { user: { select: { fullName: true } } } },
      service: { select: { nameAr: true, category: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return requests.map((r) => ({
    id: r.id,
    requestNumber: r.requestNumber,
    clientName: r.client.user.fullName,
    serviceName: r.service.nameAr,
    category: r.service.category,
    createdAt: r.createdAt,
  }));
};
