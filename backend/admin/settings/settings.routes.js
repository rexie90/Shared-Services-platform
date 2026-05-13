import express from 'express';
import { getSettings, updateGeneralSettings, updateSecuritySettings, updateNotificationsSettings, updatePermissionsSettings } from './settings.controller.js';
import { validateGeneral, validateSecurity, validateNotifications, validatePermissions } from './settings.validation.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/general', validateGeneral, updateGeneralSettings);
router.put('/security', validateSecurity, updateSecuritySettings);
router.put('/notifications', validateNotifications, updateNotificationsSettings);
router.put('/permissions', validatePermissions, updatePermissionsSettings);

export default router;
