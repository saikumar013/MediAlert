import AsyncStorage from '@react-native-async-storage/async-storage';

const MEDICATIONS_KEY = '@medications';
const MEDICATION_HISTORY_KEY = '@medication_history';
const ADHERENCE_STATS_KEY = '@adherence_stats';

export const StorageUtils = {
  // Save a new medication
  saveMedication: async (medication) => {
    try {
      const existingMeds = await StorageUtils.getMedications();
      existingMeds.push(medication);
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(existingMeds));
      return true;
    } catch (error) {
      console.error('Error saving medication:', error);
      return false;
    }
  },

  // Get all medications
  getMedications: async () => {
    try {
      const medications = await AsyncStorage.getItem(MEDICATIONS_KEY);
      return medications ? JSON.parse(medications) : [];
    } catch (error) {
      console.error('Error getting medications:', error);
      return [];
    }
  },

  // For compatibility with App.js
  getAllMedicines: async () => {
    return StorageUtils.getMedications();
  },

  // Track medication completion
  markMedicationTaken: async (medicationId) => {
    try {
      const now = new Date();
      const history = await StorageUtils.getMedicationHistory() || {};
      const dateKey = now.toDateString();
      
      if (!history[dateKey]) {
        history[dateKey] = [];
      }
      
      history[dateKey].push({
        medicationId,
        takenAt: now.toISOString(),
      });
      
      await AsyncStorage.setItem(MEDICATION_HISTORY_KEY, JSON.stringify(history));
      return true;
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      return false;
    }
  },

  // Get medication history
  getMedicationHistory: async () => {
    try {
      const history = await AsyncStorage.getItem(MEDICATION_HISTORY_KEY);
      return history ? JSON.parse(history) : {};
    } catch (error) {
      console.error('Error getting medication history:', error);
      return {};
    }
  },

  // Export medical records
  exportMedicalRecords: async () => {
    try {
      const medications = await StorageUtils.getMedications();
      const history = await StorageUtils.getMedicationHistory();
      
      return {
        medications,
        history,
        exportDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error exporting medical records:', error);
      return null;
    }
  },

  // Delete a medication
  deleteMedication: async (medicationId) => {
    try {
      const medications = await StorageUtils.getMedications();
      const updatedMedications = medications.filter(med => med.id !== medicationId);
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(updatedMedications));
      return true;
    } catch (error) {
      console.error('Error deleting medication:', error);
      return false;
    }
  },

  updateMedicationStatus: async (medicationId, statusData) => {
    try {
      const historyKey = `${statusData.date}_history`;
      const existingHistory = await StorageUtils.getMedicationHistory() || {};
      
      if (!existingHistory[historyKey]) {
        existingHistory[historyKey] = [];
      }

      // Add to history
      existingHistory[historyKey].push({
        medicationId,
        status: statusData.status,
        time: statusData.time,
        timestamp: new Date().getTime()
      });

      // Update medications with today's status
      const medications = await StorageUtils.getMedications();
      const updatedMedications = medications.map(med => {
        if (med.id === medicationId) {
          return {
            ...med,
            todayStatus: statusData.status
          };
        }
        return med;
      });

      // Update adherence statistics
      await StorageUtils.updateAdherenceStats(statusData.status);

      // Save both updates
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(updatedMedications));
      await AsyncStorage.setItem(MEDICATION_HISTORY_KEY, JSON.stringify(existingHistory));

      return true;
    } catch (error) {
      console.error('Error updating medication status:', error);
      return false;
    }
  },

  // Get adherence statistics
  getAdherenceStats: async () => {
    try {
      const stats = await AsyncStorage.getItem(ADHERENCE_STATS_KEY);
      return stats ? JSON.parse(stats) : {
        taken: 0,
        skipped: 0,
        missed: 0,
        total: 0,
        lastUpdated: null
      };
    } catch (error) {
      console.error('Error getting adherence stats:', error);
      return null;
    }
  },

  // Update adherence statistics
  updateAdherenceStats: async (status) => {
    try {
      const currentStats = await StorageUtils.getAdherenceStats();
      const updatedStats = {
        ...currentStats,
        [status]: (currentStats[status] || 0) + 1,
        total: (currentStats.total || 0) + 1,
        lastUpdated: new Date().toISOString()
      };
      await AsyncStorage.setItem(ADHERENCE_STATS_KEY, JSON.stringify(updatedStats));
      return updatedStats;
    } catch (error) {
      console.error('Error updating adherence stats:', error);
      return null;
    }
  },

  // Get adherence percentage
  getAdherencePercentage: async () => {
    try {
      const stats = await StorageUtils.getAdherenceStats();
      if (stats && stats.total > 0) {
        return {
          taken: (stats.taken / stats.total) * 100,
          skipped: (stats.skipped / stats.total) * 100,
          missed: (stats.missed / stats.total) * 100,
          total: stats.total
        };
      }
      return null;
    } catch (error) {
      console.error('Error calculating adherence percentage:', error);
      return null;
    }
  },

  // Reset daily statuses
  resetDailyStatuses: async () => {
    try {
      const medications = await StorageUtils.getMedications();
      const updatedMedications = medications.map(med => {
        if (!med.todayStatus) {
          // If medication wasn't taken today, mark it as missed
          StorageUtils.updateAdherenceStats('missed');
        }
        return {
          ...med,
          todayStatus: undefined
        };
      });
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(updatedMedications));
    } catch (error) {
      console.error('Error resetting daily statuses:', error);
    }
  },

  resetAllData: async () => {
    try {
      const keys = [
        MEDICATIONS_KEY,
        MEDICATION_HISTORY_KEY,
        ADHERENCE_STATS_KEY,
        // Add any other storage keys that need to be cleared
      ];
      
      await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
      return true;
    } catch (error) {
      console.error('Error resetting data:', error);
      throw error;
    }
  }
};