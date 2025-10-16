import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import api from '../services/api';

const SessionsListScreen = ({ navigation }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groupedSessions, setGroupedSessions] = useState({});

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sessions');
      setSessions(response.data);
      groupSessionsByClass(response.data);
    } catch (error) {
      console.error('Fetch sessions error:', error);
      Alert.alert('Error', 'Failed to fetch sessions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const groupSessionsByClass = (sessionsList) => {
    const grouped = sessionsList.reduce((acc, session) => {
      const className = session.className || 'Tanpa Kelas';
      if (!acc[className]) {
        acc[className] = [];
      }
      acc[className].push(session);
      return acc;
    }, {});
    setGroupedSessions(grouped);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  const isSessionActive = (session) => {
    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    return now >= start && now <= end;
  };

  const getSessionStatus = (session) => {
    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);

    if (now < start) {
      return { text: 'Upcoming', color: '#2196F3' };
    } else if (now > end) {
      return { text: 'Ended', color: '#9E9E9E' };
    } else {
      return { text: 'Active', color: '#4CAF50' };
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleScanQR = (session) => {
    if (!isSessionActive(session)) {
      Alert.alert('Session Not Active', 'This session is not currently active.');
      return;
    }
    navigation.navigate('QRScanner');
  };

  const handleManualEntry = (session) => {
    if (!isSessionActive(session)) {
      Alert.alert('Session Not Active', 'This session is not currently active.');
      return;
    }
    navigation.navigate('AttendanceSubmit', {
      sessionId: session.id,
      fromQR: false,
    });
  };

  const renderSessionItem = ({ item: session }) => {
    const status = getSessionStatus(session);
    const active = isSessionActive(session);

    return (
      <View style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionName}>{session.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.text}</Text>
          </View>
        </View>

        <View style={styles.sessionDetails}>
          <Text style={styles.detailText}>⏰ {formatDateTime(session.startTime)}</Text>
          <Text style={styles.detailText}>📏 Radius: {session.radiusMeters || 50}m</Text>
          {session.description && (
            <Text style={styles.detailText}>📝 {session.description}</Text>
          )}
        </View>

        {active && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => handleScanQR(session)}
            >
              <Text style={styles.buttonText}>📷 Scan QR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => handleManualEntry(session)}
            >
              <Text style={styles.buttonText}>📝 Manual Entry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderClassGroup = ({ item: [className, sessions] }) => {
    const activeSessions = sessions.filter(isSessionActive);

    return (
      <View style={styles.classGroup}>
        <View style={styles.classHeader}>
          <Text style={styles.className}>🎓 {className}</Text>
          {activeSessions.length > 0 && (
            <View style={styles.activeCountBadge}>
              <Text style={styles.activeCountText}>{activeSessions.length} active</Text>
            </View>
          )}
        </View>
        <FlatList
          data={sessions}
          renderItem={renderSessionItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading sessions...</Text>
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>📚 No sessions available</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchSessions}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={Object.entries(groupedSessions)}
        renderItem={renderClassGroup}
        keyExtractor={([className]) => className}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    padding: 15,
  },
  classGroup: {
    marginBottom: 20,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  activeCountBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sessionCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  sessionDetails: {
    marginBottom: 10,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SessionsListScreen;
