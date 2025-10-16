import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import api from '../services/api';

const AttendanceSubmitScreen = ({ navigation, route }) => {
  const { sessionId: routeSessionId, token: routeToken, fromQR } = route.params || {};
  
  const [sessionId, setSessionId] = useState(routeSessionId || '');
  const [token, setToken] = useState(routeToken || '');
  const [location, setLocation] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSessionInfo();
    }
  }, [sessionId]);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const permission = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const result = await check(permission);

      if (result === RESULTS.GRANTED) {
        getCurrentLocation();
      } else if (result === RESULTS.DENIED) {
        const requestResult = await request(permission);
        if (requestResult === RESULTS.GRANTED) {
          getCurrentLocation();
        }
      } else if (result === RESULTS.BLOCKED) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permission in your device settings to submit attendance.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (error) => {
        console.error('Location error:', error);
        Alert.alert('Location Error', 'Failed to get your location. Please check your GPS settings.');
        setLocationLoading(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 10000,
        forceRequestLocation: true,
      }
    );
  };

  const fetchSessionInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/sessions/${sessionId}`);
      setSessionInfo(response.data);
    } catch (error) {
      console.error('Fetch session error:', error);
      Alert.alert('Error', 'Failed to fetch session information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!sessionId || !token) {
      Alert.alert('Error', 'Please provide both Session ID and Token');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location is required. Please enable GPS and try again.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/attendance/submit', {
        sessionId,
        token,
        location,
      });

      Alert.alert(
        'Success!',
        'Your attendance has been recorded successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Sessions' }],
              });
            },
          },
        ]
      );
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to submit attendance';
      Alert.alert('Submission Failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderSessionInfo = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#4CAF50" />;
    }

    if (!sessionInfo) {
      return null;
    }

    return (
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📚 Session Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{sessionInfo.name}</Text>
        </View>
        {sessionInfo.className && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Class:</Text>
            <Text style={styles.infoValue}>{sessionInfo.className}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Radius:</Text>
          <Text style={styles.infoValue}>{sessionInfo.radiusMeters || 50}m</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Location:</Text>
          <Text style={styles.infoValue}>
            {sessionInfo.latitude?.toFixed(6)}, {sessionInfo.longitude?.toFixed(6)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>✅ Submit Attendance</Text>
        
        {renderSessionInfo()}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Session Details</Text>
          
          <Text style={styles.label}>Session ID</Text>
          <TextInput
            style={styles.input}
            value={sessionId}
            onChangeText={setSessionId}
            placeholder="Enter Session ID"
            editable={!fromQR}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Token (6-digit code)</Text>
          <TextInput
            style={styles.input}
            value={token}
            onChangeText={(text) => setToken(text.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit token"
            keyboardType="number-pad"
            maxLength={6}
            editable={!fromQR}
          />

          <View style={styles.locationSection}>
            <View style={styles.locationHeader}>
              <Text style={styles.label}>📍 Your Location</Text>
              <TouchableOpacity 
                onPress={getCurrentLocation}
                disabled={locationLoading}
              >
                <Text style={styles.refreshButton}>
                  {locationLoading ? '⟳ Getting...' : '🔄 Refresh'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {location ? (
              <View style={styles.locationInfo}>
                <Text style={styles.locationText}>
                  ✓ Lat: {location.latitude.toFixed(6)}
                </Text>
                <Text style={styles.locationText}>
                  ✓ Long: {location.longitude.toFixed(6)}
                </Text>
              </View>
            ) : (
              <Text style={styles.locationError}>
                {locationLoading ? 'Getting your location...' : '⚠️ Location not available'}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!sessionId || !token || !location || submitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!sessionId || !token || !location || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                📝 Submit Attendance
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {fromQR && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✓ Scanned from QR Code</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 14,
    color: '#555',
    width: 80,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  locationSection: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  refreshButton: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  locationInfo: {
    marginTop: 5,
  },
  locationText: {
    fontSize: 13,
    color: '#4CAF50',
    marginBottom: 3,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  locationError: {
    fontSize: 13,
    color: '#F44336',
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
  },
  badge: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AttendanceSubmitScreen;
