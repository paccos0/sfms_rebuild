import db from "@/lib/db";

type CreatePortalNotificationInput = {
  student_id: number;
  title: string;
  message: string;
  notification_type?: "payment" | "general" | "warning";
};

export async function createPortalNotification({
  student_id,
  title,
  message,
  notification_type = "general"
}: CreatePortalNotificationInput) {
  try {
    await db.query(
      `
        INSERT INTO portal_notification (
          student_id,
          title,
          message,
          notification_type,
          is_read
        )
        VALUES (?, ?, ?, ?, 0)
      `,
      [student_id, title, message, notification_type]
    );
  } catch (error) {
    console.error("Create portal notification error:", error);
  }
}