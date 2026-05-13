-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "client_review_days" INTEGER NOT NULL DEFAULT 1,
    "max_concurrent_requests" INTEGER NOT NULL DEFAULT 50,
    "two_factor_for_admins" BOOLEAN NOT NULL DEFAULT false,
    "encrypt_data_room_files" BOOLEAN NOT NULL DEFAULT false,
    "allow_multi_device_login" BOOLEAN NOT NULL DEFAULT false,
    "notify_new_requests" BOOLEAN NOT NULL DEFAULT true,
    "notify_user_approval" BOOLEAN NOT NULL DEFAULT true,
    "notify_daily_activity_report" BOOLEAN NOT NULL DEFAULT false,
    "notify_sla_delay" BOOLEAN NOT NULL DEFAULT true,
    "notify_new_data_room_files" BOOLEAN NOT NULL DEFAULT true,
    "service_leader_permissions" JSONB,
    "client_manager_permissions" JSONB,
    "client_team_permissions" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);
