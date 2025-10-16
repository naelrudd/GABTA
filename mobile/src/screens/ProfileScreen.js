import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProfileScreen = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, historyRes] = await Promise.all([
        api.get('/attendance/stats/user'),
        api.get('/attendance/user'),
      ]);
      setStats(statsRes.data);
      setAttendanceHistory(historyRes.data);
    } catch (error) {
      console.error('Fetch profile data error:', error);
      Alert.alert('Error', 'Failed to fetch profile data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const groupedHistory = attendanceHistory.reduce((acc, record) => {
    const className = record.session?.className || 'Tanpa Kelas';
    if (!acc[className]) {
      acc[className] = [];
    }
    acc[className].push(record);
    return acc;
  }, {});

  const classStats = Object.entries(groupedHistory).map(([className, records]) => {
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const late = records.filter(r => r.status === 'late').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    return { className, total, present, late, absent, percentage };
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'present':
        return '#4CAF50';
      case 'late':
        return '#FF9800';
      case 'absent':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present':
        return 'Hadir';
      case 'late':
        return 'Terlambat';
      case 'absent':
        return 'Tidak Hadir';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* User Info Card */}
      <View style={styles.card}>
        <View style={[styles.cardHeader, { backgroundColor: '#2196F3' }]}>
          <Text style={styles.cardHeaderText}>👤 Informasi Akun</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama:</Text>
            <Text style={styles.infoValue}>{user?.name || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>NIM/NIP:</Text>
            <Text style={styles.infoValue}>{user?.nim || user?.nip || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role:</Text>
            <Text style={styles.infoValue}>
              {user?.role === 'mahasiswa' ? 'Mahasiswa' : 'Dosen'}
            </Text>
          </View>
        </View>
      </View>

      {/* Overall Stats Card */}
      {stats && (
        <View style={styles.card}>
          <View style={[styles.cardHeader, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.cardHeaderText}>📊 Statistik Kehadiran</Text>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.total || 0}</Text>
                <Text style={styles.statLabel}>Total Sesi</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                  {stats.present || 0}
                </Text>
                <Text style={styles.statLabel}>Hadir</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#FF9800' }]}>
                  {stats.late || 0}
                </Text>
                <Text style={styles.statLabel}>Terlambat</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#F44336' }]}>
                  {stats.absent || 0}
                </Text>
                <Text style={styles.statLabel}>Tidak Hadir</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Stats Per Class Card */}
      {classStats.length > 0 && (
        <View style={styles.card}>
          <View style={[styles.cardHeader, { backgroundColor: '#9C27B0' }]}>
            <Text style={styles.cardHeaderText}>🎓 Statistik Per Kelas</Text>
          </View>
          <View style={styles.cardBody}>
            {classStats.map((classStat, index) => (
              <View key={index} style={styles.classStatItem}>
                <Text style={styles.classStatName}>{classStat.className}</Text>
                <View style={styles.classStatDetails}>
                  <View style={styles.classStatRow}>
                    <Text style={styles.classStatLabel}>Total:</Text>
                    <Text style={styles.classStatValue}>{classStat.total}</Text>
                  </View>
                  <View style={styles.classStatRow}>
                    <Text style={styles.classStatLabel}>Hadir:</Text>
                    <Text style={[styles.classStatValue, { color: '#4CAF50' }]}>
                      {classStat.present}
                    </Text>
                  </View>
                  <View style={styles.classStatRow}>
                    <Text style={styles.classStatLabel}>Terlambat:</Text>
                    <Text style={[styles.classStatValue, { color: '#FF9800' }]}>
                      {classStat.late}
                    </Text>
                  </View>
                  <View style={styles.classStatRow}>
                    <Text style={styles.classStatLabel}>Absen:</Text>
                    <Text style={[styles.classStatValue, { color: '#F44336' }]}>
                      {classStat.absent}
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.percentageBadge,
                  { backgroundColor: classStat.percentage >= 75 ? '#4CAF50' : '#FF9800' }
                ]}>
                  <Text style={styles.percentageText}>{classStat.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Attendance History Grouped by Class */}
      <View style={styles.card}>
        <View style={[styles.cardHeader, { backgroundColor: '#607D8B' }]}>
          <Text style={styles.cardHeaderText}>📋 Riwayat Kehadiran</Text>
        </View>
        <View style={styles.cardBody}>
          {attendanceHistory.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada riwayat kehadiran.</Text>
          ) : (
            Object.entries(groupedHistory).map(([className, records]) => (
              <View key={className} style={styles.historyGroup}>
                <View style={styles.historyGroupHeader}>
                  <Text style={styles.historyGroupTitle}>🎓 {className}</Text>
                  <View style={styles.historyCountBadge}>
                    <Text style={styles.historyCountText}>{records.length} sesi</Text>
                  </View>
                </View>
                {records.map((record) => (
                  <View key={record.id} style={styles.historyItem}>
                    <View style={styles.historyItemContent}>
                      <Text style={styles.historySessionName}>
                        {record.session?.name || 'N/A'}
                      </Text>
                      <Text style={styles.historyDate}>
                        {formatDate(record.timestamp)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.historyStatusBadge,
                        { backgroundColor: getStatusBadgeColor(record.status) }
                      ]}
                    >
                      <Text style={styles.historyStatusText}>
                        {getStatusText(record.status)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
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
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    marginBottom: 0,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 15,
  },
  cardHeaderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: 100,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  classStatItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  classStatName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  classStatDetails: {
    marginBottom: 8,
  },
  classStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  classStatLabel: {
    fontSize: 13,
    color: '#666',
  },
  classStatValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  percentageBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyGroup: {
    marginBottom: 15,
  },
  historyGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  historyGroupTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  historyCountBadge: {
    backgroundColor: '#607D8B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  historyCountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyItemContent: {
    flex: 1,
  },
  historySessionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  historyDate: {
    fontSize: 12,
    color: '#666',
  },
  historyStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyStatusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default ProfileScreen;
