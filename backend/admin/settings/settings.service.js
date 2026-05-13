import prisma from '../../core/config/db.js';

const NOTIFICATION_MESSAGES = {
  NEW_REQUEST: {
    title: 'تم إنشاء طلب جديد',
    body: 'قام العميل بإرسال طلب جديد بانتظار التعيين.',
  },

  REQUEST_ASSIGNED: {
    title: 'تم تعيين طلب جديد لك',
    body: 'تم تعيين طلب جديد لك، الرجاء مراجعة التفاصيل والبدء بالتنفيذ.',
  },

  DELIVERABLE_UPLOADED: {
    title: 'تم رفع مخرج جديد',
    body: 'تم رفع مخرج جديد للطلب وهو الآن بانتظار المراجعة.',
  },

  DELIVERABLE_APPROVED: {
    title: 'تم اعتماد المخرج',
    body: 'تم اعتماد المخرج بنجاح ويمكنك الآن الاطلاع عليه.',
  },

  DELIVERABLE_REJECTED: {
    title: 'تم رفض المخرج',
    body: 'تم رفض المخرج، الرجاء مراجعة ملاحظات الأدمن وإعادة الرفع.',
  },

  NEW_CHAT_MESSAGE: {
    title: 'رسالة جديدة',
    body: 'لديك رسالة جديدة بخصوص الطلب.',
  },

  SLA_DELAY: {
    title: 'تنبيه تأخر SLA',
    body: 'يوجد طلب تجاوز المدة المحددة لاتفاقية مستوى الخدمة.',
  },

  USER_APPROVED: {
    title: 'تم اعتماد حسابك',
    body: 'تم اعتماد حسابك بنجاح ويمكنك الآن استخدام المنصة.',
  },

  DAILY_REPORT: {
    title: 'التقرير اليومي جاهز',
    body: 'تم إنشاء التقرير اليومي للنشاطات ويمكنك مراجعته الآن.',
  },
};

export const getSystemSettingsOrDefault = async () => {
  let settings = await prisma.systemSettings.findFirst();

  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: {},
    });
  }

  return settings;
};

export const getAdminUsers = async () => {
  return prisma.user.findMany({
    where: {
      role: 'ADMIN',
    },
    select: {
      id: true,
    },
  });
};

export const createNotification = async ({
  userId,
  requestId = null,
  title,
  body,
}) => {
  if (!userId || !title || !body) return null;

  return prisma.notification.create({
    data: {
      userId,
      requestId,
      title,
      body,
      isRead: false,
    },
  });
};

export const createNotificationsBulk = async (notifications = []) => {
  const validNotifications = notifications.filter(
    (item) => item.userId && item.title && item.body
  );

  if (validNotifications.length === 0) {
    return { count: 0 };
  }

  return prisma.notification.createMany({
    data: validNotifications.map((item) => ({
      userId: item.userId,
      requestId: item.requestId ?? null,
      title: item.title,
      body: item.body,
      isRead: false,
    })),
  });
};

export const shouldNotify = async (settingKey) => {
  const settings = await getSystemSettingsOrDefault();
  return settings?.[settingKey] === true;
};

const getRequestWithRelations = async (requestId) => {
  return prisma.request.findUnique({
    where: {
      id: requestId,
    },

    include: {
      client: {
        include: {
          user: true,
        },
      },

      assignment: {
        include: {
          leader: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });
};

export const notifyOnNewRequestCreated = async (requestId) => {
  try {
    if (!(await shouldNotify('notifyNewRequests'))) return;

    const admins = await getAdminUsers();

    const { title, body } = NOTIFICATION_MESSAGES.NEW_REQUEST;

    await createNotificationsBulk(
      admins.map((admin) => ({
        userId: admin.id,
        requestId,
        title,
        body,
      }))
    );
  } catch (error) {
    console.error(
      'Notification failed: notifyOnNewRequestCreated',
      error.message
    );
  }
};

export const notifyOnRequestAssignedToLeader = async (
  requestId,
  leaderUserId
) => {
  try {
    const { title, body } = NOTIFICATION_MESSAGES.REQUEST_ASSIGNED;

    await createNotification({
      userId: leaderUserId,
      requestId,
      title,
      body,
    });
  } catch (error) {
    console.error(
      'Notification failed: notifyOnRequestAssignedToLeader',
      error.message
    );
  }
};

export const notifyOnDeliverableUploaded = async (requestId) => {
  try {
    if (!(await shouldNotify('notifyNewDataRoomFiles'))) return;

    const request = await getRequestWithRelations(requestId);

    if (!request) return;

    const admins = await getAdminUsers();

    const clientUserId = request.client?.user?.id;

    const { title, body } =
      NOTIFICATION_MESSAGES.DELIVERABLE_UPLOADED;

    const recipientIds = [
      ...admins.map((admin) => admin.id),
      clientUserId,
    ].filter(Boolean);

    const uniqueRecipientIds = [...new Set(recipientIds)];

    await createNotificationsBulk(
      uniqueRecipientIds.map((userId) => ({
        userId,
        requestId,
        title,
        body,
      }))
    );
  } catch (error) {
    console.error(
      'Notification failed: notifyOnDeliverableUploaded',
      error.message
    );
  }
};

export const notifyOnDeliverableApproved = async (requestId) => {
  try {
    const request = await getRequestWithRelations(requestId);

    if (!request) return;

    const clientUserId = request.client?.user?.id;

    const leaderUserId =
      request.assignment?.leader?.user?.id;

    const { title, body } =
      NOTIFICATION_MESSAGES.DELIVERABLE_APPROVED;

    const recipientIds = [
      ...new Set([clientUserId, leaderUserId].filter(Boolean)),
    ];

    await createNotificationsBulk(
      recipientIds.map((userId) => ({
        userId,
        requestId,
        title,
        body,
      }))
    );
  } catch (error) {
    console.error(
      'Notification failed: notifyOnDeliverableApproved',
      error.message
    );
  }
};

export const notifyOnDeliverableRejected = async (requestId) => {
  try {
    const request = await getRequestWithRelations(requestId);

    if (!request) return;

    const leaderUserId =
      request.assignment?.leader?.user?.id;

    const { title, body } =
      NOTIFICATION_MESSAGES.DELIVERABLE_REJECTED;

    await createNotification({
      userId: leaderUserId,
      requestId,
      title,
      body,
    });
  } catch (error) {
    console.error(
      'Notification failed: notifyOnDeliverableRejected',
      error.message
    );
  }
};

export const notifyOnNewChatMessage = async (
  requestId,
  senderUserId
) => {
  try {
    const request = await getRequestWithRelations(requestId);

    if (!request) return;

    const clientUserId = request.client?.user?.id;

    const leaderUserId =
      request.assignment?.leader?.user?.id;

    const receiverId =
      senderUserId === clientUserId
        ? leaderUserId
        : clientUserId;

    if (!receiverId) return;

    const { title, body } =
      NOTIFICATION_MESSAGES.NEW_CHAT_MESSAGE;

    await createNotification({
      userId: receiverId,
      requestId,
      title,
      body,
    });
  } catch (error) {
    console.error(
      'Notification failed: notifyOnNewChatMessage',
      error.message
    );
  }
};

export const notifyOnSlaDelay = async (requestId) => {
  try {
    if (!(await shouldNotify('notifySlaDelay'))) return;

    const request = await getRequestWithRelations(requestId);

    if (!request) return;

    const admins = await getAdminUsers();

    const leaderUserId =
      request.assignment?.leader?.user?.id;

    const { title, body } =
      NOTIFICATION_MESSAGES.SLA_DELAY;

    const recipientIds = [
      ...admins.map((admin) => admin.id),
      leaderUserId,
    ].filter(Boolean);

    const uniqueRecipientIds = [...new Set(recipientIds)];

    await createNotificationsBulk(
      uniqueRecipientIds.map((userId) => ({
        userId,
        requestId,
        title,
        body,
      }))
    );
  } catch (error) {
    console.error(
      'Notification failed: notifyOnSlaDelay',
      error.message
    );
  }
};

export const notifyOnUserApproved = async (userId) => {
  try {
    if (!(await shouldNotify('notifyUserApproval'))) return;

    const { title, body } =
      NOTIFICATION_MESSAGES.USER_APPROVED;

    await createNotification({
      userId,
      title,
      body,
    });
  } catch (error) {
    console.error(
      'Notification failed: notifyOnUserApproved',
      error.message
    );
  }
};

export const notifyOnDailyReportReady = async () => {
  try {
    if (!(await shouldNotify('notifyDailyActivityReport'))) return;

    const admins = await getAdminUsers();

    const { title, body } =
      NOTIFICATION_MESSAGES.DAILY_REPORT;

    await createNotificationsBulk(
      admins.map((admin) => ({
        userId: admin.id,
        title,
        body,
      }))
    );
  } catch (error) {
    console.error(
      'Notification failed: notifyOnDailyReportReady',
      error.message
    );
  }
};

export const createAdminNotification = async (
  title,
  body,
  requestId = null
) => {
  const admins = await getAdminUsers();

  return createNotificationsBulk(
    admins.map((admin) => ({
      userId: admin.id,
      requestId,
      title,
      body,
    }))
  );
};