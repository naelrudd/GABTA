import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SessionsListScreen from '../screens/SessionsListScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import AttendanceSubmitScreen from '../screens/AttendanceSubmitScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const SessionsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Sessions" 
      component={SessionsListScreen}
      options={{ title: '📚 Available Sessions' }}
    />
    <Stack.Screen 
      name="QRScanner" 
      component={QRScannerScreen}
      options={{ title: '📷 Scan QR Code' }}
    />
    <Stack.Screen 
      name="AttendanceSubmit" 
      component={AttendanceSubmitScreen}
      options={{ title: '✅ Submit Attendance' }}
    />
  </Stack.Navigator>
);

const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'SessionsTab') {
          iconName = 'event-note';
        } else if (route.name === 'Profile') {
          iconName = 'person';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4CAF50',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen 
      name="SessionsTab" 
      component={SessionsStack}
      options={{ title: 'Sessions' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ 
        title: 'Profile',
        headerShown: true,
        headerTitle: '👤 My Profile',
      }}
    />
  </Tab.Navigator>
);

export default MainNavigator;
