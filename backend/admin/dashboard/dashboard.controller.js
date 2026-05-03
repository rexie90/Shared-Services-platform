const dashboardService = require('./dashboard.service');

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    return res.status(200).json(stats);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboardStats,
};
