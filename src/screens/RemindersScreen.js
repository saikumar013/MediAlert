import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, RefreshControl } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { StorageUtils } from '../utils/storage';
import { requestNotificationPermissions } from '../notifications';
import * as Notifications from 'expo-notifications';
import { TimeUtils } from '../utils/timeUtils';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RemindersScreen() {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [medications, setMedications] = useState([]);

  useEffect(() => {
    const setup = async () => {
      await loadMedications();
      await checkPermissions();
    };
    
    setup();

    const foregroundSubscription = Notifications.addNotificationReceivedListener(async () => {
      await loadMedications();
    });

    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(async () => {
      await loadMedications();
    });

    return () => {
      foregroundSubscription.remove();
      backgroundSubscription.remove();
    };
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadMedications(),
        checkPermissions()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
    setRefreshing(false);
  }, []);

  const loadMedications = async () => {
    const meds = await StorageUtils.getMedications();
    setMedications(meds);
  };

  const checkPermissions = async () => {
    const hasPermission = await requestNotificationPermissions();
    setNotifications(hasPermission);
  };

  const handleMedicationStatus = async (medicationId, status) => {
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const currentTime = TimeUtils.getCurrentTime();
      
      await StorageUtils.updateMedicationStatus(medicationId, {
        status: status,
        date: currentDate,
        time: currentTime
      });
      
      await loadMedications();
    } catch (error) {
      console.error('Error updating medication status:', error);
    }
  };

  const handleDeleteMedication = async (medicationId) => {
    try {
      await StorageUtils.deleteMedication(medicationId);
      await loadMedications();
    } catch (error) {
      console.error('Error deleting medication:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    section: {
      backgroundColor: theme.surface,
      marginVertical: 8,
      borderRadius: 8,
      overflow: 'hidden',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      padding: 16,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    settingLabel: {
      fontSize: 16,
      color: theme.text,
    },
    reminderItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    medicationName: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
    },
    reminderTime: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 4,
    },
    noRemindersText: {
      textAlign: 'center',
      color: theme.textSecondary,
      padding: 16,
    },
    deleteButton: {
      padding: 8,
    },
    actionButtons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusButton: {
      padding: 5,
      borderRadius: 20,
      marginHorizontal: 4,
    },
    statusText: {
      fontSize: 12,
      marginTop: 2,
    },
  });

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.primary]}
          tintColor={theme.primary}
          progressBackgroundColor={theme.surface}
        />
      }
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Enable Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={async (value) => {
              if (value) {
                const hasPermission = await requestNotificationPermissions();
                setNotifications(hasPermission);
              } else {
                setNotifications(false);
              }
            }}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Reminders</Text>
        {medications.length > 0 ? (
          medications.map((med) => (
            <View key={med.id} style={styles.reminderItem}>
              <View>
                <Text style={[styles.medicationName, { color: theme.text }]}>{med.name}</Text>
                <Text style={[styles.reminderTime, { color: theme.textSecondary }]}>
                  Daily at {med.time}
                </Text>
                <Text style={[styles.statusText, { 
                  color: med.todayStatus === 'taken' ? theme.success : 
                        med.todayStatus === 'skipped' ? theme.error :
                        theme.textSecondary 
                }]}>
                  {med.todayStatus ? med.todayStatus.charAt(0).toUpperCase() + med.todayStatus.slice(1) : 'Pending'}
                </Text>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  onPress={() => handleMedicationStatus(med.id, 'taken')}
                  style={[styles.statusButton, { backgroundColor: theme.success }]}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => handleMedicationStatus(med.id, 'skipped')}
                  style={[styles.statusButton, { backgroundColor: theme.error }]}
                >
                  <Ionicons name="close-circle" size={24} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => handleDeleteMedication(med.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={24} color={theme.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noRemindersText}>No active reminders</Text>
        )}
      </View>
    </ScrollView>
  );
} 