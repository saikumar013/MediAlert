import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import MedicationScreen from '../screens/MedicationScreen';
import CalendarScreen from '../screens/CalendarScreen';
import RemindersScreen from '../screens/RemindersScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            switch (route.name) {
              case 'Home':
                iconName = focused ? 'medical' : 'medical-outline';
                break;
              case 'Schedule':
                iconName = focused ? 'calendar' : 'calendar-outline';
                break;
              case 'Add':
                iconName = focused ? 'add-circle' : 'add-circle-outline';
                break;
              case 'Reminders':
                iconName = focused ? 'notifications' : 'notifications-outline';
                break;
              case 'Profile':
                iconName = focused ? 'person' : 'person-outline';
                break;
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            height: 65,
            paddingBottom: 10,
            paddingTop: 5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            paddingBottom: 5,
          },
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.text,
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            title: 'MediAlert',
            tabBarLabel: 'Meds'
          }}
        />
        <Tab.Screen 
          name="Schedule" 
          component={CalendarScreen}
          options={{ tabBarLabel: 'Schedule' }}
        />
        <Tab.Screen 
          name="Add" 
          component={MedicationScreen}
          options={{ 
            title: 'Add Medication',
            tabBarLabel: 'Add'
          }}
        />
        <Tab.Screen 
          name="Reminders" 
          component={RemindersScreen}
          options={{ tabBarLabel: 'Alerts' }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ tabBarLabel: 'Profile' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
} 