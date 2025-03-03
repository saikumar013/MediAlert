import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function FullScreenAlarm({ medication, onSnooze, onDismiss }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      <Text style={styles.time}>
        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
      <Text style={styles.date}>
        {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
      </Text>
      <Text style={styles.alarmText}>
        Take {medication?.name}
      </Text>
      <Text style={styles.dosageText}>
        Dosage: {medication?.dosage}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.dismissButton, { backgroundColor: '#fff' }]}
          onPress={onDismiss}
        >
          <Ionicons name="checkmark" size={32} color={theme.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.snoozeButton}
          onPress={onSnooze}
        >
          <Text style={styles.snoozeText}>Snooze 5 mins</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2F2D52', // Dark purple background
    zIndex: 9999,
    elevation: 9999,
    top: 0,
    left: 0,
  },
  time: {
    fontSize: 96,
    color: '#fff',
    fontWeight: '300',
    letterSpacing: 2,
    marginBottom: 5,
  },
  date: {
    fontSize: 20,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 10,
  },
  alarmText: {
    fontSize: 20,
    color: '#fff',
    opacity: 0.8,
  },
  dosageText: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 60,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  dismissButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  snoozeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  snoozeText: {
    color: '#fff',
    fontSize: 16,
  }
}); 