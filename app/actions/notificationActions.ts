"use server";

import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/sanity/lib/notifications/notifications";

export async function getNotificationsAction(clerkId: string) {
  try {
    const notifications = await getNotifications(clerkId);
    return { success: true, data: notifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, data: [] };
  }
}

export async function getUnreadCountAction(clerkId: string) {
  try {
    const count = await getUnreadCount(clerkId);
    return { success: true, count };
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return { success: false, count: 0 };
  }
}

export async function markNotificationReadAction(notificationId: string) {
  try {
    await markNotificationRead(notificationId);
    return { success: true };
  } catch (error) {
    console.error("Error marking notification read:", error);
    return { success: false };
  }
}

export async function markAllNotificationsReadAction(clerkId: string) {
  try {
    await markAllNotificationsRead(clerkId);
    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications read:", error);
    return { success: false };
  }
}
