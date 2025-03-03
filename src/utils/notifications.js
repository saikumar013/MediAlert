import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

let activeAlarms = new Map(); // Store active alarms

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

// Create a notification channel for Android
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('medication-reminders', {
    name: 'Medication Reminders',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    sound: 'default',
  });
}

// Request permissions
export async function requestNotificationPermissions() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('medication-reminders', {
        name: 'Medication Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }
    
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
      },
    });
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
}

// Schedule a medication reminder with custom sound
export async function scheduleMedicationReminder(selectedTime, message, medicationId) {
  try {
    if (!(selectedTime instanceof Date)) {
      throw new Error('Invalid time format: must be a Date object');
    }

    const notificationData = {
      medicationId: medicationId,
      message: message
    };

    // Cancel any existing notifications for this medication
    await Notifications.cancelScheduledNotificationAsync(medicationId);

    // Extract hours and minutes from the selected time
    const hours = selectedTime.getHours();
    const minutes = selectedTime.getMinutes();
    
    console.log(`Scheduling notification for ${hours}:${minutes} every day`);
    
    // Schedule the notification to trigger at the specified time
    const identifier = await Notifications.scheduleNotificationAsync({
      identifier: medicationId,
      content: {
        title: "Medication Reminder",
        body: message,
        data: notificationData,
        sound: 'default',
      },
      trigger: {
        channelId: Platform.OS === 'android' ? 'medication-reminders' : undefined,
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });

    console.log('Scheduled notification with ID:', identifier);
    console.log(`Set to trigger at ${hours}:${minutes} daily`);

    return identifier;
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    return null;
  }
}

export function stopAlarm(medicationId) {
  try {
    // No need for sound handling as we're using default notification sounds
    return;
  } catch (error) {
    console.error('Error stopping alarm:', error);
  }
}

// Cancel a specific reminder
export async function cancelMedicationReminder(identifier) {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    return true;
  } catch (error) {
    console.error('Error canceling notification:', error);
    return false;
  }
}

// Handle notification response
export function setNotificationResponseHandler(handler) {
  Notifications.addNotificationResponseReceivedListener(handler);
}

// Get all scheduled reminders
export async function getAllScheduledReminders() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

// Schedule all medication reminders
export async function scheduleAllMedicationReminders(medications) {
  try {
    // Cancel all existing notifications first
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduledNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
    
    // Schedule new notifications for each medication
    for (const medication of medications) {
      if (medication.reminderTime) {
        const reminderTime = new Date(medication.reminderTime);
        const message = `Time to take ${medication.name} (${medication.dosage})`;
        await scheduleMedicationReminder(reminderTime, message, medication.id);
      }
    }
    
    console.log(`Scheduled reminders for ${medications.length} medications`);
    return true;
  } catch (error) {
    console.error('Error scheduling all reminders:', error);
    return false;
  }
}
