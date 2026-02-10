import * as Notifications from 'expo-notifications';
import { reconcileNotificationSchedule } from './scheduler';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowAlert: true,
  }),
});

export async function configureNotifications(): Promise<void> {
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: null,
    vibrationPattern: [0],
  });

  await Notifications.setNotificationChannelAsync('timetable-silent', {
    name: 'Timetable Silent',
    importance: Notifications.AndroidImportance.LOW,
    sound: null,
    vibrationPattern: [0],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });

  await Notifications.requestPermissionsAsync();
  await reconcileNotificationSchedule();
}
