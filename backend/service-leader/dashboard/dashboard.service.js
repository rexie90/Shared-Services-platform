import prisma from "../../core/config/db.js";

export const getLeaderDashboardStats = async (userId) => {
  const leader = await prisma.serviceLeaderProfile.findUnique({
    where: { userId },
  });

  if (!leader) throw new Error("مسؤول الخدمة غير موجود");

  const [totalActive, totalCompleted, nearingSLA, breachedSLA] =
    await Promise.all([
      prisma.assignment.count({
        where: {
          leaderId: leader.id,
          request: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
        },
      }),
      prisma.assignment.count({
        where: {
          leaderId: leader.id,
          request: { status: "COMPLETED" },
        },
      }),
      prisma.sLATracking.count({
        where: {
          isBreached: false,
          request: {
            assignment: { leaderId: leader.id },
            status: { in: ["ASSIGNED", "IN_PROGRESS"] },
          },
        },
      }),
      prisma.sLATracking.count({
        where: {
          isBreached: true,
          request: { assignment: { leaderId: leader.id } },
        },
      }),
    ]);

  return { totalActive, totalCompleted, nearingSLA, breachedSLA };
};

export const getLeaderAssignedRequests = async (userId) => {
  const leader = await prisma.serviceLeaderProfile.findUnique({
    where: { userId },
  });

  if (!leader) throw new Error("مسؤول الخدمة غير موجود");

  const assignments = await prisma.assignment.findMany({
    where: { leaderId: leader.id },
    include: {
      request: {
        include: {
          service: { select: { nameAr: true } },
          client: {
            include: {
              user: { select: { fullName: true } },
            },
          },
          slaTracking: true,
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  return assignments.map((a) => ({
    id: a.request.id,
    requestNumber: a.request.requestNumber,
    serviceName: a.request.service.nameAr,
    clientName: a.request.client.user.fullName,
    status: a.request.status,
    slaBreached: a.request.slaTracking?.isBreached ?? false,
    assignedAt: a.assignedAt,
  }));
};
