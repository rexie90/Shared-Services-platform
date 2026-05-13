import prisma from "../../core/config/db.js";

const PROGRESS_BY_STATUS = {
  DRAFT: 0,
  SUBMITTED: 10,
  UNDER_REVIEW: 25,
  ASSIGNED: 40,
  IN_PROGRESS: 60,
  PENDING_CLIENT_APPROVAL: 80,
  COMPLETED: 100,
  CANCELLED: 0,
  REJECTED: 0,
};

const buildServiceError = (errorCode, statusCode = 400) => {
  const err = new Error("Something went wrong");
  err.errorCode = errorCode;
  err.statusCode = statusCode;
  return err;
};

const resolveServiceLeaderProfile = async (userId) => {
  const leaderProfile = await prisma.serviceLeaderProfile.findUnique({
    where: { userId },
  });

  if (!leaderProfile) {
    throw buildServiceError("SERVICE_LEADER_PROFILE_NOT_FOUND", 404);
  }

  return leaderProfile;
};

const getSlaStatus = (slaTracking) => {
  if (!slaTracking) return "ON_TIME";
  if (slaTracking.isBreached === true) return "BREACHED";
  if (slaTracking.breachedAt) return "BREACHED";
  return "ON_TIME";
};

const mapAssignmentToServiceItem = (assignment) => {
  const request = assignment.request;

  return {
    id: assignment.id,
    requestId: request.id,
    requestNumber: request.requestNumber,
    serviceName: request.service?.nameAr || request.service?.name || "",
    clientName: request.client?.companyName || "",
    requestStatus: request.status,
    progressPercentage: PROGRESS_BY_STATUS[request.status] ?? 0,
    slaStatus: getSlaStatus(request.slaTracking),
    chatUrl: `/chat/${request.requestNumber}`,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
};

const assignmentInclude = {
  request: {
    include: {
      service: true,
      client: {
        include: {
          user: true,
        },
      },
      slaTracking: true,
    },
  },
};

export const getAssignments = async ({ userId, clientName }) => {
  const leaderProfile = await resolveServiceLeaderProfile(userId);

  const where = {
    leaderId: leaderProfile.id,
    ...(clientName
      ? {
          request: {
            client: {
              companyName: {
                contains: clientName,
                mode: "insensitive",
              },
            },
          },
        }
      : {}),
  };

  const assignments = await prisma.assignment.findMany({
    where,
    include: assignmentInclude,
    orderBy: { assignedAt: "desc" },
  });

  return assignments.map(mapAssignmentToServiceItem);
};

export const getAssignmentByRequestId = async ({ userId, requestId }) => {
  const leaderProfile = await resolveServiceLeaderProfile(userId);

  const assignment = await prisma.assignment.findFirst({
    where: {
      leaderId: leaderProfile.id,
      requestId,
    },
    include: assignmentInclude,
  });

  if (!assignment) {
    throw buildServiceError("REQUEST_NOT_FOUND", 404);
  }

  return mapAssignmentToServiceItem(assignment);
};

export const updateAssignmentRequestStatus = async ({
  userId,
  requestId,
  requestStatus,
}) => {
  const leaderProfile = await resolveServiceLeaderProfile(userId);

  const assignment = await prisma.assignment.findFirst({
    where: {
      leaderId: leaderProfile.id,
      requestId,
    },
    include: assignmentInclude,
  });

  if (!assignment) {
    throw buildServiceError("REQUEST_NOT_FOUND", 404);
  }

  const updatedRequest = await prisma.request.update({
    where: { id: requestId },
    data: { status: requestStatus },
    include: {
      service: true,
      client: { include: { user: true } },
      slaTracking: true,
    },
  });

  return mapAssignmentToServiceItem({
    ...assignment,
    request: updatedRequest,
  });
};

export const getAssignmentChatUrl = async ({ userId, requestId }) => {
  const leaderProfile = await resolveServiceLeaderProfile(userId);

  const assignment = await prisma.assignment.findFirst({
    where: {
      leaderId: leaderProfile.id,
      requestId,
    },
    include: {
      request: {
        select: {
          requestNumber: true,
        },
      },
    },
  });

  if (!assignment) {
    throw buildServiceError("REQUEST_NOT_FOUND", 404);
  }

  return {
    chatUrl: `/chat/${assignment.request.requestNumber}`,
  };
};
