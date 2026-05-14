import prisma from "../../core/config/db.js";
import { ApiError } from "../../core/utils/ApiError.js";

const NEAR_BREACH_HOURS = 24;

const getLeaderProfile = async (userId) => {
  const leader = await prisma.serviceLeaderProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!leader) {
    throw new ApiError(404, "مسؤول الخدمة غير موجود");
  }

  return leader;
};

const computeSlaStatus = (slaTracking) => {
  if (!slaTracking) {
    return {
      status: "on-track",
      remainingHours: null,
      deadlineAt: null,
    };
  }

  const deadlineAt = new Date(
    slaTracking.startedAt.getTime() + slaTracking.targetHours * 60 * 60 * 1000
  );

  const remainingMs = deadlineAt.getTime() - Date.now();
  const remainingHours = Number((remainingMs / (1000 * 60 * 60)).toFixed(2));

  // Display-only computed breach status (read-only, no DB update)
  if (slaTracking.isBreached || remainingHours <= 0) {
    return {
      status: "breached",
      remainingHours,
      deadlineAt,
    };
  }

  if (remainingHours <= NEAR_BREACH_HOURS) {
    return {
      status: "near-breach",
      remainingHours,
      deadlineAt,
    };
  }

  return {
    status: "on-track",
    remainingHours,
    deadlineAt,
  };
};

export const getSlaOverview = async (userId) => {
  const leader = await getLeaderProfile(userId);

  const assignments = await prisma.assignment.findMany({
    where: { leaderId: leader.id },
    include: {
      request: {
        include: {
          slaTracking: true,
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  const items = assignments
    .filter((a) => Boolean(a.request?.slaTracking))
    .map((a) => {
      const sla = a.request.slaTracking;
      const computed = computeSlaStatus(sla);

      return {
        requestId: a.request.id,
        requestNumber: a.request.requestNumber,
        requestTitle: a.request.title,
        priority: a.request.priority,
        dueDate: a.request.dueDate,
        requestStatus: a.request.status,
        assignedAt: a.assignedAt,
        targetHours: sla.targetHours,
        startedAt: sla.startedAt,
        breachedAt: sla.breachedAt,
        isBreached: sla.isBreached,
        deadlineAt: computed.deadlineAt,
        remainingHours: computed.remainingHours,
        slaStatus: computed.status,
      };
    });

  const totalTracked = items.length;
  const breachedCount = items.filter((i) => i.slaStatus === "breached").length;
  const nearBreachCount = items.filter((i) => i.slaStatus === "near-breach").length;
  const onTrackCount = items.filter((i) => i.slaStatus === "on-track").length;

  const compliancePercentage =
    totalTracked === 0
      ? 100
      : Number((((onTrackCount + nearBreachCount) / totalTracked) * 100).toFixed(2));

  return {
    summary: {
      compliancePercentage,
      breachedCount,
      nearBreachCount,
      totalTracked,
    },
    items,
  };
};
