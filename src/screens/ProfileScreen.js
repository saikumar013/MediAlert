import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { StorageUtils } from '../utils/storage';

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Add any data refresh logic here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleResetData = () => {
    Alert.alert(
      "Reset All Data",
      "Are you sure you want to reset all data? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await StorageUtils.resetAllData();
              Alert.alert(
                "Success",
                "All data has been reset successfully.",
                [{ text: "OK" }]
              );
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert(
                "Error",
                "Failed to reset data. Please try again.",
                [{ text: "OK" }]
              );
            }
          }
        }
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.surface,
      padding: 20,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    profileIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    userName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
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
    resetButton: {
      backgroundColor: theme.error,
      margin: 16,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    resetButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
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
        <View style={styles.profileIcon}>
          <Ionicons name="person" size={40} color="#FFFFFF" />
        </View>
        <Text style={styles.userName}>User Profile</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.resetButton}
        onPress={handleResetData}
      >
        <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
        <Text style={styles.resetButtonText}>Reset All Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
} 