import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { StorageUtils } from '../utils/storage';
import { TimeUtils } from '../utils/timeUtils';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [adherenceStats, setAdherenceStats] = useState({
    taken: 0,
    skipped: 0,
    missed: 0,
    total: 0
  });
  const [medications, setMedications] = useState([]);
  const [upcomingDoses, setUpcomingDoses] = useState([]);

  useEffect(() => {
    loadData();
    loadAdherenceStats();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
      loadAdherenceStats();
    });

    return unsubscribe;
  }, [navigation]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadData(),
        loadAdherenceStats()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
    setRefreshing(false);
  }, []);

  const loadData = async () => {
    const meds = await StorageUtils.getMedications();
    setMedications(meds);
    
    // Calculate upcoming doses
    const now = new Date();
    const upcomingMeds = meds.filter(med => {
      const [hours, minutes] = med.time.split(':');
      const medTime = new Date();
      medTime.setHours(parseInt(hours), parseInt(minutes));
      return medTime > now;
    }).sort((a, b) => {
      const [aHours, aMinutes] = a.time.split(':');
      const [bHours, bMinutes] = b.time.split(':');
      return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
    });

    setUpcomingDoses(upcomingMeds);
  };

  const loadAdherenceStats = async () => {
    const stats = await StorageUtils.getAdherenceStats();
    if (stats) {
      setAdherenceStats(stats);
    }
  };

  const calculatePercentage = (value) => {
    return adherenceStats.total > 0 ? ((value / adherenceStats.total) * 100).toFixed(1) : '0';
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      padding: 20,
      backgroundColor: theme.surface,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
    },
    section: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 15,
    },
    statsSection: {
      backgroundColor: theme.surface,
      marginVertical: 8,
      borderRadius: 8,
      padding: 16,
    },
    statsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    adherenceBar: {
      height: 6,
      backgroundColor: theme.border,
      borderRadius: 3,
      marginTop: 8,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    adherenceSegment: {
      height: '100%',
    },
    noMedicationsText: {
      textAlign: 'center',
      color: theme.textSecondary,
      fontSize: 14,
      marginTop: 10,
    },
    addButton: {
      backgroundColor: theme.primary,
      borderRadius: 8,
      padding: 15,
      alignItems: 'center',
      marginTop: 20,
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    medicationItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    medicationName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
    },
    medicationTime: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    medicationDetails: {
      fontSize: 12,
      color: theme.textSecondary,
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Medications</Text>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>Medication Adherence</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.success }]}>
              {calculatePercentage(adherenceStats.taken)}%
            </Text>
            <Text style={styles.statLabel}>Taken</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.error }]}>
              {calculatePercentage(adherenceStats.skipped)}%
            </Text>
            <Text style={styles.statLabel}>Skipped</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.warning }]}>
              {calculatePercentage(adherenceStats.missed)}%
            </Text>
            <Text style={styles.statLabel}>Missed</Text>
          </View>
        </View>
        <View style={styles.adherenceBar}>
          <View 
            style={[
              styles.adherenceSegment, 
              { 
                backgroundColor: theme.success,
                width: `${calculatePercentage(adherenceStats.taken)}%`
              }
            ]} 
          />
          <View 
            style={[
              styles.adherenceSegment, 
              { 
                backgroundColor: theme.error,
                width: `${calculatePercentage(adherenceStats.skipped)}%`
              }
            ]} 
          />
          <View 
            style={[
              styles.adherenceSegment, 
              { 
                backgroundColor: theme.warning,
                width: `${calculatePercentage(adherenceStats.missed)}%`
              }
            ]} 
          />
        </View>
        <Text style={[styles.statLabel, { textAlign: 'center', marginTop: 8 }]}>
          Total tracked: {adherenceStats.total} doses
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Doses</Text>
        {upcomingDoses.length > 0 ? (
          upcomingDoses.map(med => (
            <View key={med.id} style={styles.medicationItem}>
              <Text style={styles.medicationName}>{med.name}</Text>
              <Text style={styles.medicationTime}>
                {TimeUtils.formatTime(med.time)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noMedicationsText}>No upcoming doses for today</Text>
        )}

        <Text style={styles.sectionTitle}>All Medications</Text>
        {medications.length > 0 ? (
          medications.map(med => (
            <View key={med.id} style={styles.medicationItem}>
              <Text style={styles.medicationName}>{med.name}</Text>
              <Text style={styles.medicationDetails}>
                {med.dosage} - Daily at {TimeUtils.formatTime(med.time)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noMedicationsText}>No medications added yet</Text>
        )}
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('Add')}
        >
          <Text style={styles.addButtonText}>Add Medication</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 