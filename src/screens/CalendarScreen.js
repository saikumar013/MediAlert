import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { StorageUtils } from '../utils/storage';
import { TimeUtils } from '../utils/timeUtils';

export default function CalendarScreen() {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [medications, setMedications] = useState([]);
  const [medicationHistory, setMedicationHistory] = useState({});

  useEffect(() => {
    loadData();
    generateWeekDates(selectedDate);
  }, [selectedDate]);

  const loadData = async () => {
    const meds = await StorageUtils.getMedications();
    const history = await StorageUtils.getMedicationHistory();
    setMedications(meds);
    setMedicationHistory(history);
  };

  const generateWeekDates = (date) => {
    const week = [];
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    setWeekDates(week);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction * 7));
    setSelectedDate(newDate);
  };

  const formatTime = (time) => {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    let formattedHours = date.getHours();
    const ampm = formattedHours >= 12 ? 'pm' : 'am';
    formattedHours = formattedHours % 12;
    formattedHours = formattedHours ? formattedHours : 12; // Convert 0 to 12
    const formattedMinutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    weekContainer: {
      backgroundColor: theme.surface,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    weekNavigation: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 15,
    },
    monthText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    daysContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 10,
    },
    dayButton: {
      alignItems: 'center',
      width: 40,
      height: 65,
      justifyContent: 'center',
      borderRadius: 20,
    },
    selectedDay: {
      backgroundColor: theme.primary,
    },
    dayName: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 4,
    },
    dayNumber: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
    },
    selectedDayText: {
      color: '#FFFFFF',
    },
    scheduleContainer: {
      padding: 20,
    },
    scheduleTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 15,
    },
    medicationItem: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 15,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    timeContainer: {
      width: 100,
      alignItems: 'center',
      borderRightWidth: 1,
      borderRightColor: theme.border,
      paddingRight: 15,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    timeText: {
      fontSize: 16,
      color: theme.primary,
      fontWeight: '500',
      textAlign: 'center',
    },
    medicationInfo: {
      flex: 1,
      marginLeft: 15,
    },
    medicationName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    medicationDosage: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 4,
    },
    noMedicationsText: {
      textAlign: 'center',
      color: theme.textSecondary,
      marginTop: 20,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.weekContainer}>
        <View style={styles.weekNavigation}>
          <TouchableOpacity onPress={() => navigateWeek(-1)}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => navigateWeek(1)}>
            <Ionicons name="chevron-forward" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.daysContainer}>
          {weekDates.map((date) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            return (
              <TouchableOpacity
                key={date.toISOString()}
                style={[styles.dayButton, isSelected && styles.selectedDay]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dayName, isSelected && styles.selectedDayText]}>
                  {date.toLocaleString('default', { weekday: 'short' })}
                </Text>
                <Text style={[styles.dayNumber, isSelected && styles.selectedDayText]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView style={styles.scheduleContainer}>
        <Text style={styles.scheduleTitle}>Schedule</Text>
        {medications.length > 0 ? (
          medications.map((med) => (
            <View key={med.id} style={styles.medicationItem}>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatTime(med.time)}</Text>
              </View>
              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>{med.name}</Text>
                <Text style={styles.medicationDosage}>{med.dosage}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noMedicationsText}>No medications scheduled</Text>
        )}
      </ScrollView>
    </View>
  );
} 