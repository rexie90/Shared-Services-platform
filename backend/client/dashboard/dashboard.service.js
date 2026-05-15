import prisma from "../../core/config/db.js";
import { ApiError } from "../../core/utils/ApiError.js";

const RECENT_NOTIFICATIONS_LIMIT = 5;
const RECENT_REQUESTS_LIMIT = 5;

const ACTIVE_REQUEST_STATUSES = [
  "SUBMITTED",
  "ASSIGNED",
  "IN_PROGRESS",
  "PENDING_CLIENT_APPROVAL",
];

const DELIVERED_REQUEST_STATUSES = ["COMPLETED"];
const UNDER_REVIEW_REQUEST_STATUSES = ["UNDER_REVIEW"];
const CLOSED_REQUEST_STATUSES = ["CANCELLED", "REJECTED"];

const getClientProfileOrThrow = async (userId) => {
  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!clientProfile) {
    throw new ApiError(404, "ملف العميل غير موجود");
  }

  return clientProfile;
};

const countByStatuses = (requests, statuses) =>
  requests.filter((request) => statuses.includes(request.status)).length;

export const getClientDashboard = async (userId) => {
  const clientProfile = await getClientProfileOrThrow(userId);

  const [requests, unreadNotifications, recentNotifications] = await Promise.all([
    prisma.request.findMany({
      where: { clientId: clientProfile.id },
      select: {
        id: true,
        requestNumber: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        service: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    }),

    prisma.notification.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        body: true,
        isRead: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: RECENT_NOTIFICATIONS_LIMIT,
    }),
  ]);

  const summary = {
    activeRequests: countByStatuses(requests, ACTIVE_REQUEST_STATUSES),
    deliveredRequests: countByStatuses(requests, DELIVERED_REQUEST_STATUSES),
    underReviewRequests: countByStatuses(requests, UNDER_REVIEW_REQUEST_STATUSES),
    closedRequests: countByStatuses(requests, CLOSED_REQUEST_STATUSES),
    unreadNotifications,
  };

  const recentRequests = requests.slice(0, RECENT_REQUESTS_LIMIT).map((request) => ({
    id: request.id,
    requestNumber: request.requestNumber,
    title: request.title,
    status: request.status,
    priority: request.priority,
    dueDate: request.dueDate,
    createdAt: request.createdAt,
    service: request.service
      ? {
          id: request.service.id,
          name: request.service.name,
          nameAr: request.service.nameAr,
          category: request.service.category,
        }
      : null,
  }));

  return {
    summary,
    recentNotifications,
    recentRequests,
  };
};
