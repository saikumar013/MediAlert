import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function AdherenceStats({ stats }) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
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
    }
  });

  const calculatePercentage = (value) => {
    return stats.total > 0 ? ((value / stats.total) * 100).toFixed(1) : '0';
  };

  return (
    <View style={styles.statsSection}>
      <Text style={styles.statsTitle}>Medication Adherence</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.success }]}>
            {calculatePercentage(stats.taken)}%
          </Text>
          <Text style={styles.statLabel}>Taken</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.error }]}>
            {calculatePercentage(stats.skipped)}%
          </Text>
          <Text style={styles.statLabel}>Skipped</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.warning }]}>
            {calculatePercentage(stats.missed)}%
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
              width: `${calculatePercentage(stats.taken)}%`
            }
          ]} 
        />
        <View 
          style={[
            styles.adherenceSegment, 
            { 
              backgroundColor: theme.error,
              width: `${calculatePercentage(stats.skipped)}%`
            }
          ]} 
        />
        <View 
          style={[
            styles.adherenceSegment, 
            { 
              backgroundColor: theme.warning,
              width: `${calculatePercentage(stats.missed)}%`
            }
          ]} 
        />
      </View>
      <Text style={[styles.statLabel, { textAlign: 'center', marginTop: 8 }]}>
        Total tracked: {stats.total} doses
      </Text>
    </View>
  );
} 