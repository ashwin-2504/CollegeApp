import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowAlert: true,
  }),
});

export async function configureNotifications(): Promise<void> {
  // Local notification handler setup only; no network services required.
  await Promise.resolve();
}
