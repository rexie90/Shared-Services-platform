import prisma from '../../core/config/db.js';

export const getSettings = async (req, res) => {
  try {
    let settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {} // Uses default values defined in schema
      });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateGeneralSettings = async (req, res) => {
  try {
    const { clientReviewDays, maxConcurrentRequests } = req.body;
    const settings = await prisma.systemSettings.findFirst();
    const updated = await prisma.systemSettings.update({
      where: { id: settings.id },
      data: {
        clientReviewDays: clientReviewDays ?? settings.clientReviewDays,
        maxConcurrentRequests: maxConcurrentRequests ?? settings.maxConcurrentRequests,
      },
    });
    res.json({ success: true, message: 'Settings updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateSecuritySettings = async (req, res) => {
  try {
    const { twoFactorForAdmins, encryptDataRoomFiles, allowMultiDeviceLogin } = req.body;
    const settings = await prisma.systemSettings.findFirst();
    const updated = await prisma.systemSettings.update({
      where: { id: settings.id },
      data: {
        twoFactorForAdmins: twoFactorForAdmins ?? settings.twoFactorForAdmins,
        encryptDataRoomFiles: encryptDataRoomFiles ?? settings.encryptDataRoomFiles,
        allowMultiDeviceLogin: allowMultiDeviceLogin ?? settings.allowMultiDeviceLogin,
      },
    });
    res.json({ success: true, message: 'Settings updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateNotificationsSettings = async (req, res) => {
  try {
    const { notifyNewRequests, notifyUserApproval, notifyDailyActivityReport, notifySlaDelay, notifyNewDataRoomFiles } = req.body;
    const settings = await prisma.systemSettings.findFirst();
    const updated = await prisma.systemSettings.update({
      where: { id: settings.id },
      data: {
        notifyNewRequests: notifyNewRequests ?? settings.notifyNewRequests,
        notifyUserApproval: notifyUserApproval ?? settings.notifyUserApproval,
        notifyDailyActivityReport: notifyDailyActivityReport ?? settings.notifyDailyActivityReport,
        notifySlaDelay: notifySlaDelay ?? settings.notifySlaDelay,
        notifyNewDataRoomFiles: notifyNewDataRoomFiles ?? settings.notifyNewDataRoomFiles,
      },
    });
    res.json({ success: true, message: 'Settings updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updatePermissionsSettings = async (req, res) => {
  try {
    const { serviceLeaderPermissions, clientManagerPermissions, clientTeamPermissions } = req.body;
    const settings = await prisma.systemSettings.findFirst();
    const updated = await prisma.systemSettings.update({
      where: { id: settings.id },
      data: {
        serviceLeaderPermissions: serviceLeaderPermissions ?? settings.serviceLeaderPermissions,
        clientManagerPermissions: clientManagerPermissions ?? settings.clientManagerPermissions,
        clientTeamPermissions: clientTeamPermissions ?? settings.clientTeamPermissions,
      },
    });
    res.json({ success: true, message: 'Settings updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
