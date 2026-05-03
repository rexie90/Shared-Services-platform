require("dotenv").config();
const express = require("express");
const dashboardRoutes = require("./dashboard/dashboard.routes");

const app = express();

app.use(express.json());

app.use("/api/admin/dashboard", dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  return res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Admin service running on port ${PORT}`);
});

module.exports = app;
