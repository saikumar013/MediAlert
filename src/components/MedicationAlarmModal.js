import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { stopAlarm } from '../notifications';
import { StorageUtils } from '../utils/storage';

export default function MedicationAlarmModal({ visible, medication, onDismiss }) {
  const { theme } = useTheme();

  const handleTaken = async () => {
    await StorageUtils.markMedicationTaken(medication.id);
    stopAlarm(medication.id);
    onDismiss();
  };

  const handleSnooze = () => {
    // Snooze for 5 minutes
    setTimeout(() => {
      playSound('alarm');
    }, 5 * 60 * 1000);
    stopAlarm(medication.id);
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <Text style={[styles.title, { color: theme.text }]}>
            Time to take {medication?.name}
          </Text>
          <Text style={[styles.dosage, { color: theme.textSecondary }]}>
            Dosage: {medication?.dosage}
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.success }]}
              onPress={handleTaken}
            >
              <Text style={styles.buttonText}>Taken</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleSnooze}
            >
              <Text style={styles.buttonText}>Snooze (5 min)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dosage: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
}); 