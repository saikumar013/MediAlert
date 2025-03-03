import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { StorageUtils } from '../utils/storage';

export default function MedicationHistoryScreen() {
  const { theme } = useTheme();
  const [history, setHistory] = useState({});
  const [medications, setMedications] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const meds = await StorageUtils.getMedications();
    setMedications(meds);
    const hist = await StorageUtils.getMedicationHistory();
    setHistory(hist || {});
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {Object.entries(history)
        .sort((a, b) => new Date(b[0]) - new Date(a[0]))
        .map(([date, entries]) => (
          <View key={date} style={[styles.dateSection, { backgroundColor: theme.surface }]}>
            <Text style={[styles.dateHeader, { color: theme.text }]}>{date}</Text>
            {entries.map((entry, index) => {
              const medication = medications.find(med => med.id === entry.medicationId);
              return (
                <View key={index} style={styles.entryItem}>
                  <Text style={[styles.medicationName, { color: theme.text }]}>
                    {medication?.name}
                  </Text>
                  <Text style={[styles.takenTime, { color: theme.textSecondary }]}>
                    Taken at {new Date(entry.takenAt).toLocaleTimeString()}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateSection: {
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  entryItem: {
    marginLeft: 10,
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '500',
  },
  takenTime: {
    fontSize: 14,
    marginTop: 2,
  },
}); 