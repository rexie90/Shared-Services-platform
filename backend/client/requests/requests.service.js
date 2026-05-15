import prisma from "../../core/config/db.js";
import { ApiError } from "../../core/utils/ApiError.js";

const EDITABLE_STATUSES = ["DRAFT", "SUBMITTED"];
const LOCKED_STATUS_REASON = {
  UNDER_REVIEW: "لا يمكن تعديل الطلب أثناء المراجعة",
  ASSIGNED: "لا يمكن تعديل الطلب بعد التعيين",
  IN_PROGRESS: "لا يمكن تعديل الطلب أثناء التنفيذ",
  PENDING_CLIENT_APPROVAL: "لا يمكن تعديل الطلب بانتظار اعتماد العميل",
  COMPLETED: "لا يمكن تعديل الطلب المكتمل",
  CANCELLED: "لا يمكن تعديل الطلب الملغي",
  REJECTED: "لا يمكن تعديل الطلب المرفوض",
};

const ALLOWED_UPDATE_FIELDS = [
  "title",
  "description",
  "scope",
  "priority",
  "dueDate",
  "serviceType",
];

const getClientProfile = async (userId) => {
  const client = await prisma.clientProfile.findUnique({ where: { userId } });
  if (!client) throw new ApiError(404, "العميل غير موجود");
  return client;
};

const getOwnedRequest = async (requestId, clientId) => {
  const request = await prisma.request.findFirst({
    where: { id: requestId, clientId },
    include: {
      service: {
        select: {
          id: true,
          name: true,
          nameAr: true,
          category: true,
        },
      },
      documents: {
        select: {
          id: true,
          name: true,
          fileType: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!request) throw new ApiError(404, "الطلب غير موجود");
  return request;
};

const getEditState = (status) => {
  const canEdit = EDITABLE_STATUSES.includes(status);
  return {
    canEdit,
    editLockReason: canEdit
      ? null
      : LOCKED_STATUS_REASON[status] ?? "لا يمكن تعديل الطلب في حالته الحالية",
  };
};

const mapRequestDetails = (request) => {
  const editState = getEditState(request.status);
  return {
    id: request.id,
    requestNumber: request.requestNumber,
    title: request.title,
    description: request.description,
    scope: request.scope,
    priority: request.priority,
    serviceType: request.serviceType,
    dueDate: request.dueDate,
    status: request.status,
    updatedAt: request.updatedAt,
    service: request.service,
    documents: request.documents,
    canEdit: editState.canEdit,
    editLockReason: editState.editLockReason,
  };
};

const buildUpdatePayload = (payload) => {
  const data = {};
  for (const key of ALLOWED_UPDATE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      data[key] = payload[key];
    }
  }
  return data;
};

export const getRequestDetails = async (userId, requestId) => {
  const client = await getClientProfile(userId);
  const request = await getOwnedRequest(requestId, client.id);
  return mapRequestDetails(request);
};

export const updateRequest = async (userId, requestId, payload) => {
  const client = await getClientProfile(userId);
  const current = await getOwnedRequest(requestId, client.id);

  const editState = getEditState(current.status);
  if (!editState.canEdit) {
    throw new ApiError(400, editState.editLockReason);
  }

  const data = buildUpdatePayload(payload);
  if (!Object.keys(data).length) {
    throw new ApiError(400, "لا توجد حقول قابلة للتعديل");
  }

  const updated = await prisma.request.update({
    where: { id: current.id },
    data,
    include: {
      service: {
        select: {
          id: true,
          name: true,
          nameAr: true,
          category: true,
        },
      },
      documents: {
        select: {
          id: true,
          name: true,
          fileType: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return mapRequestDetails(updated);
};
