import webPush from "@/lib/push";
import db from "@/lib/db";

export async function POST() {
  const [rows]: any = await db.query(
    `SELECT subscription_json FROM push_subscription`
  );

  const payload = JSON.stringify({
    title: "New Payment Recorded",
    body: "A payment has been added to your account."
  });

  for (const row of rows) {
    const sub = JSON.parse(row.subscription_json);

    try {
      await webPush.sendNotification(sub, payload);
    } catch (e) {
      console.error("Push error:", e);
    }
  }

  return new Response("ok");
}