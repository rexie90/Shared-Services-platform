import prisma from "../../core/config/db.js";
import { ApiError } from "../../core/utils/ApiError.js";

const getLeaderProfileOrThrow = async (userId) => {
  const leader = await prisma.serviceLeaderProfile.findUnique({
    where: { userId },
    select: { id: true, userId: true },
  });

  if (!leader) {
    throw new ApiError(404, "ملف مسؤول الخدمة غير موجود");
  }

  return leader;
};

const ensureAssignedRequestOrThrow = async (leaderId, requestId) => {
  const assignment = await prisma.assignment.findFirst({
    where: {
      leaderId,
      requestId,
    },
    select: { id: true, requestId: true },
  });

  if (!assignment) {
    throw new ApiError(403, "لا يمكنك الوصول إلى هذه المحادثة");
  }

  return assignment;
};

export const getChatContext = async (userId) => {
  const leader = await getLeaderProfileOrThrow(userId);

  const assignments = await prisma.assignment.findMany({
    where: { leaderId: leader.id },
    include: {
      request: {
        include: {
          client: {
            include: {
              user: { select: { fullName: true } },
            },
          },
          service: { select: { id: true, nameAr: true } },
          chatMessages: {
            where: {
              isRead: false,
              sender: { role: "CLIENT" },
            },
            select: { id: true },
          },
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  return assignments.map((a) => ({
    requestId: a.request.id,
    requestNumber: a.request.requestNumber,
    companyName: a.request.client?.companyName ?? null,
    clientName: a.request.client?.user?.fullName ?? null,
    serviceId: a.request.service?.id ?? null,
    serviceName: a.request.service?.nameAr ?? null,
    status: a.request.status,
    unreadCount: a.request.chatMessages.length,
  }));
};

export const getMessagesByRequest = async (userId, requestId) => {
  const leader = await getLeaderProfileOrThrow(userId);
  await ensureAssignedRequestOrThrow(leader.id, requestId);

  const messages = await prisma.chatMessage.findMany({
    where: { requestId },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return messages.map((m) => ({
    id: m.id,
    senderId: m.sender.id,
    senderName: m.sender.fullName,
    senderRole: m.sender.role,
    messageText: m.content,
    attachment: m.fileUrl,
    isRead: m.isRead,
    createdAt: m.createdAt,
  }));
};

export const sendMessage = async (userId, requestId, payload) => {
  const leader = await getLeaderProfileOrThrow(userId);
  await ensureAssignedRequestOrThrow(leader.id, requestId);

  const messageText =
    typeof payload.messageText === "string" ? payload.messageText.trim() : "";
  const attachment =
    typeof payload.attachment === "string" ? payload.attachment.trim() : null;

  const created = await prisma.chatMessage.create({
    data: {
      requestId,
      senderId: userId,
      content: messageText,
      fileUrl: attachment || null,
      isRead: false,
    },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
    },
  });

  return {
    id: created.id,
    requestId: created.requestId,
    senderId: created.sender.id,
    senderName: created.sender.fullName,
    senderRole: created.sender.role,
    messageText: created.content,
    attachment: created.fileUrl,
    isRead: created.isRead,
    createdAt: created.createdAt,
  };
};

export const markClientMessagesAsRead = async (userId, requestId) => {
  const leader = await getLeaderProfileOrThrow(userId);
  await ensureAssignedRequestOrThrow(leader.id, requestId);

  const result = await prisma.chatMessage.updateMany({
    where: {
      requestId,
      isRead: false,
      sender: {
        role: "CLIENT",
      },
    },
    data: {
      isRead: true,
    },
  });

  return {
    requestId,
    updatedCount: result.count,
  };
};


