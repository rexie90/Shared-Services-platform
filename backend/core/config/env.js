// التحقق من المتغيرات المطلوبة عند بدء التشغيل
const required = ["DATABASE_URL", "JWT_SECRET", "PORT"];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
});

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT) || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
};
