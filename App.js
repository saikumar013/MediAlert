import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import * as Notifications from 'expo-notifications';
import { scheduleAllMedicationReminders } from './src/utils/notifications';
import { StorageUtils } from './src/utils/storage';
import { Platform } from 'react-native';

export default function App() {
  useEffect(() => {
    async function setupNotifications() {
      try {
        // Request permissions
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Notification permissions not granted');
          return;
        }

        // Configure notification handler
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            priority: Notifications.AndroidNotificationPriority.MAX,
          }),
        });

        // Create notification channel for Android
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('medication-reminders', {
            name: 'Medication Reminders',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            sound: 'default',
          });
        }

        // Fetch stored medicines and schedule notifications
        const medicines = await StorageUtils.getAllMedicines();
        if (medicines.length > 0) {
          await scheduleAllMedicationReminders(medicines);
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    }

    setupNotifications();

    // Reset and reschedule notifications at midnight
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(0, 0, 0, 0);
    midnight.setDate(midnight.getDate() + 1);

    const timeUntilMidnight = midnight - now;

    const resetTimer = setTimeout(async () => {
      try {
        await StorageUtils.resetDailyStatuses();
        
        // Reschedule notifications
        const medicines = await StorageUtils.getAllMedicines();
        if (medicines.length > 0) {
          await scheduleAllMedicationReminders(medicines);
        }
        
        // Set up daily reset interval
        setInterval(async () => {
          await StorageUtils.resetDailyStatuses();
          
          // Reschedule notifications
          const updatedMedicines = await StorageUtils.getAllMedicines();
          if (updatedMedicines.length > 0) {
            await scheduleAllMedicationReminders(updatedMedicines);
          }
        }, 24 * 60 * 60 * 1000);
      } catch (error) {
        console.error('Error in daily reset:', error);
      }
    }, timeUntilMidnight);

    return () => clearTimeout(resetTimer);
  }, []);

  return (
    <ThemeProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </ThemeProvider>
  );
}
