import webPush from "web-push";
import db from "@/lib/db";

webPush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:ggamk24@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

export async function sendPushToStudent(
  studentId: number,
  payload: {
    title: string;
    body: string;
    url?: string;
  }
) {
  const [rows] = await db.query<any[]>(
    `
      SELECT push_subscription_id, subscription_json
      FROM push_subscription
      WHERE student_id = ?
    `,
    [studentId]
  );

  for (const row of rows) {
    try {
      await webPush.sendNotification(
        JSON.parse(row.subscription_json),
        JSON.stringify(payload)
      );
    } catch (error: any) {
      console.error("Push notification error:", error);

      if (error?.statusCode === 404 || error?.statusCode === 410) {
        await db.query(
          `
            DELETE FROM push_subscription
            WHERE push_subscription_id = ?
          `,
          [row.push_subscription_id]
        );
      }
    }
  }
}

export default webPush;