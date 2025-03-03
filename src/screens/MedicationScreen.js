import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { scheduleMedicationReminder, requestNotificationPermissions } from '../notifications';
import { StorageUtils } from '../utils/storage';
import { TimeUtils } from '../utils/timeUtils';

export default function MedicationScreen() {
  const { theme } = useTheme();
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleAddMedication = async () => {
    try {
      if (!medicationName || !dosage) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert('Error', 'Notification permissions are required');
        return;
      }

      // Get the current date
      const currentDate = new Date();
      
      // Create a new date object for the selected time
      const selectedTime = new Date(currentDate);
      selectedTime.setHours(time.getHours());
      selectedTime.setMinutes(time.getMinutes());
      selectedTime.setSeconds(0);
      selectedTime.setMilliseconds(0);

      const medicationId = Date.now().toString();
      const reminderId = await scheduleMedicationReminder(
        selectedTime,  // Pass the full date object
        `Time to take ${medicationName} (${dosage})`,
        medicationId
      );

      if (!reminderId) {
        Alert.alert('Error', 'Failed to schedule reminder');
        return;
      }

      const medication = {
        id: medicationId,
        name: medicationName,
        dosage,
        frequency,
        time: `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}`,
        reminderId,
      };

      const saved = await StorageUtils.saveMedication(medication);
      if (saved) {
        Alert.alert('Success', 'Medication has been added');
        setMedicationName('');
        setDosage('');
        setTime(new Date());
      }
    } catch (error) {
      console.error('Error adding medication:', error);
      Alert.alert('Error', 'Failed to add medication');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
    },
    timeButton: {
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.border,
    },
    timeText: {
      fontSize: 16,
      color: theme.text,
    },
    frequencyContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
      gap: 8,
    },
    frequencyOption: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    frequencyOptionSelected: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    frequencyText: {
      color: theme.textSecondary,
    },
    frequencyTextSelected: {
      color: '#FFFFFF',
    },
    addButton: {
      backgroundColor: theme.primary,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginTop: 32,
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Medication Name</Text>
          <TextInput
            style={styles.input}
            value={medicationName}
            onChangeText={setMedicationName}
            placeholder="Enter medication name"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Dosage</Text>
          <TextInput
            style={styles.input}
            value={dosage}
            onChangeText={setDosage}
            placeholder="Enter dosage (e.g., 1 pill)"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Frequency</Text>
          <View style={styles.frequencyContainer}>
            {['daily', 'weekly', 'monthly'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.frequencyOption,
                  frequency === option && styles.frequencyOptionSelected,
                ]}
                onPress={() => setFrequency(option)}
              >
                <Text
                  style={[
                    styles.frequencyText,
                    frequency === option && styles.frequencyTextSelected,
                  ]}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Time</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.timeText}>
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Ionicons name="time-outline" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedTime) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (selectedTime) {
                setTime(selectedTime);
              }
            }}
          />
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddMedication}>
          <Text style={styles.addButtonText}>Add Medication</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 