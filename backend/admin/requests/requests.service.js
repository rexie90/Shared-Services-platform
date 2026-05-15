import prisma from "../../core/config/db.js";
import { ApiError } from "../../core/utils/ApiError.js";

const FILTER_TO_STATUSES = {
  ACTIVE: ["ASSIGNED", "IN_PROGRESS"],
  CLOSED: ["COMPLETED", "CANCELLED", "REJECTED"],
  PENDING_REVIEW: ["SUBMITTED", "UNDER_REVIEW"],
};

const REVIEW_REJECTABLE = ["UNDER_REVIEW", "SUBMITTED"];

const buildListWhere = ({ filter, search }) => {
  const where = {};

  if (filter && FILTER_TO_STATUSES[filter]) {
    where.status = { in: FILTER_TO_STATUSES[filter] };
  }

  if (search) {
    where.OR = [
      { requestNumber: { contains: search, mode: "insensitive" } },
      {
        client: {
          user: {
            fullName: { contains: search, mode: "insensitive" },
          },
        },
      },
      {
        service: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { nameAr: { contains: search, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  return where;
};

export const getAllRequests = async ({ filter, search, sort = "newest" }) => {
  const where = buildListWhere({ filter, search });
  const orderBy = { createdAt: sort === "oldest" ? "asc" : "desc" };

  const requests = await prisma.request.findMany({
    where,
    orderBy,
    include: {
      client: { include: { user: { select: { fullName: true } } } },
      service: { select: { nameAr: true } },
    },
  });

  return requests.map((r) => ({
    id: r.id,
    requestNumber: r.requestNumber,
    clientName: r.client?.user?.fullName ?? null,
    requestDate: r.createdAt,
    status: r.status,
    serviceName: r.service?.nameAr ?? null,
  }));
};

export const getRequestDetails = async (id) => {
  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      client: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
      service: {
        select: {
          id: true,
          name: true,
          nameAr: true,
          category: true,
        },
      },
      slaTracking: {
        select: {
          targetHours: true,
          startedAt: true,
          breachedAt: true,
          isBreached: true,
        },
      },
      assignment: {
        include: {
          leader: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!request) {
    throw new ApiError(404, "الطلب غير موجود");
  }

  return {
    id: request.id,
    requestNumber: request.requestNumber,
    title: request.title,
    description: request.description,
    scope: request.scope,
    status: request.status,
    priority: request.priority,
    serviceType: request.serviceType,
    createdAt: request.createdAt,
    dueDate: request.dueDate,
    completedAt: request.completedAt,
    client: {
      id: request.client?.id ?? null,
      companyName: request.client?.companyName ?? null,
      industry: request.client?.industry ?? null,
      phone: request.client?.phone ?? null,
      user: request.client?.user
        ? {
            id: request.client.user.id,
            fullName: request.client.user.fullName,
            email: request.client.user.email,
            avatarUrl: request.client.user.avatarUrl,
          }
        : null,
    },
    service: request.service,
    sla: request.slaTracking,
    assignedServiceLeader: request.assignment?.leader?.user
      ? {
          id: request.assignment.leader.user.id,
          fullName: request.assignment.leader.user.fullName,
          email: request.assignment.leader.user.email,
          assignedAt: request.assignment.assignedAt,
          notes: request.assignment.notes,
        }
      : null,
  };
};

export const updateRequestStatus = async (id, status) => {
  const existing = await prisma.request.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, "الطلب غير موجود");
  }

  return prisma.request.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      requestNumber: true,
      status: true,
      updatedAt: true,
    },
  });
};

export const reviewRequest = async (id, action) => {
  const request = await prisma.request.findUnique({
    where: { id },
    select: { id: true, requestNumber: true, status: true, updatedAt: true },
  });

  if (!request) {
    throw new ApiError(404, "الطلب غير موجود");
  }

  if (action === "approve") {
    if (request.status !== "UNDER_REVIEW") {
      throw new ApiError(400, "لا يمكن الموافقة إلا إذا كانت الحالة UNDER_REVIEW");
    }

    return prisma.request.update({
      where: { id },
      data: { status: "ASSIGNED" },
      select: {
        id: true,
        requestNumber: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  if (action === "reject") {
    if (!REVIEW_REJECTABLE.includes(request.status)) {
      throw new ApiError(
        400,
        "لا يمكن الرفض إلا إذا كانت الحالة UNDER_REVIEW أو SUBMITTED"
      );
    }

    return prisma.request.update({
      where: { id },
      data: { status: "REJECTED" },
      select: {
        id: true,
        requestNumber: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  throw new ApiError(400, "قيمة action غير مدعومة");
};


