const pool = require('../config/db');

const getDashboardStats = async () => {
  const totalUsersQuery = 'SELECT COUNT(*)::int AS count FROM users';
  const totalRequestsQuery = 'SELECT COUNT(*)::int AS count FROM requests';
  const requestsByStatusQuery = `
    SELECT status, COUNT(*)::int AS count
    FROM requests
    GROUP BY status
  `;

  const [totalUsersResult, totalRequestsResult, requestsByStatusResult] = await Promise.all([
    pool.query(totalUsersQuery),
    pool.query(totalRequestsQuery),
    pool.query(requestsByStatusQuery),
  ]);

  const statusCounts = {
    ACTIVE: 0,
    COMPLETED: 0,
    PENDING: 0,
  };

  requestsByStatusResult.rows.forEach((row) => {
    const status = String(row.status || '').toUpperCase();
    if (Object.prototype.hasOwnProperty.call(statusCounts, status)) {
      statusCounts[status] = row.count;
    }
  });

  return {
    totalUsers: totalUsersResult.rows[0].count,
    totalRequests: totalRequestsResult.rows[0].count,
    activeRequests: statusCounts.ACTIVE,
    completedRequests: statusCounts.COMPLETED,
    pendingRequests: statusCounts.PENDING,
  };
};

module.exports = {
  getDashboardStats,
};
