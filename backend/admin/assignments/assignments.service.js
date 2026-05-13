import prisma from "../../core/config/db.js";
import { ApiError } from "../../core/utils/ApiError.js";

export const getPendingRequests = async () => {
  const requests = await prisma.request.findMany({
    where: { status: "SUBMITTED" },
    include: {
      client: {
        include: {
          user: { select: { fullName: true } },
        },
      },
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

export const getAvailableLeaders = async (category) => {
  const leaders = await prisma.serviceLeaderProfile.findMany({
    where: {
      ...(category && { department: category }),
    },
    include: {
      user: { select: { fullName: true, email: true } },
      _count: {
        select: {
          assignments: {
            where: {
              request: {
                status: { in: ["ASSIGNED", "IN_PROGRESS"] },
              },
            },
          },
        },
      },
    },
  });

  return leaders.map((l) => ({
    id: l.id,
    userId: l.userId,
    fullName: l.user.fullName,
    email: l.user.email,
    department: l.department,
    maxCapacity: l.maxCapacity,
    activeCount: l._count.assignments,
    available: l._count.assignments < l.maxCapacity,
  }));
};

export const assignLeader = async (requestId, leaderId) => {
  const request = await prisma.request.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new ApiError(404, "الطلب غير موجود");
  }

  if (request.status !== "SUBMITTED") {
    throw new ApiError(400, "لا يمكن تعيين مسؤول لهذا الطلب في حالته الحالية");
  }

  const leader = await prisma.serviceLeaderProfile.findUnique({
    where: { id: leaderId },
  });

  if (!leader) {
    throw new ApiError(404, "مسؤول الخدمة غير موجود");
  }

  const existing = await prisma.assignment.findUnique({
    where: { requestId },
  });

  if (existing) {
    throw new ApiError(409, "تم تعيين مسؤول لهذا الطلب مسبقاً");
  }

  const [assignment] = await prisma.$transaction([
    prisma.assignment.create({
      data: { requestId, leaderId, notes: "" },
    }),
    prisma.request.update({
      where: { id: requestId },
      data: { status: "ASSIGNED" },
    }),
    prisma.notification.create({
      data: {
        userId: leader.userId,
        requestId: requestId,
        title: "تم تعيينك على طلب جديد",
        body: `تم تعيينك مسؤولاً عن الطلب رقم ${request.requestNumber}`,
      },
    }),
  ]);

  return assignment;
};
