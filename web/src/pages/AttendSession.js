import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/**
 * AttendSession - Halaman otomatis untuk submit presensi
 * 
 * Flow:
 * 1. User scan QR → browser buka /attend/:sessionId
 * 2. ProtectedRoute cek auth:
 *    - Belum login → redirect ke /login → setelah login kembali ke sini
 *    - Sudah login → lanjut ke component ini
 * 3. Component auto-request fresh token dari backend
 * 4. Component auto-detect GPS location
 * 5. Component auto-submit attendance
 * 6. Show success/error message
 * 
 * Praktis: User cukup scan QR sekali, semua otomatis!
 */
const AttendSession = () => {
  const { sessionId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [location, setLocation] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Step 1: Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          returnTo: `/attend/${sessionId}`,
          message: 'Silakan login untuk melanjutkan presensi'
        } 
      });
    }
  }, [isAuthenticated, sessionId, navigate]);

  // Step 2: Get GPS location
  useEffect(() => {
    if (!isAuthenticated) return;

    if (!navigator.geolocation) {
      setError('Browser tidak mendukung GPS. Gunakan browser modern seperti Chrome.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        console.error('GPS error:', err);
        setError('Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin lokasi diberikan ke browser.');
        setLoading(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  }, [isAuthenticated]);

  // Step 3: When location is ready, fetch session info and submit attendance
  useEffect(() => {
    if (!isAuthenticated || !location) return;

    const submitAttendance = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get fresh token from backend
        console.log('📡 Fetching fresh token for session:', sessionId);
        const sessionRes = await api.get(`/sessions/${sessionId}/scan`);
        const { token, sessionName } = sessionRes.data;

        setSessionInfo({ id: sessionId, name: sessionName });

        console.log('📍 Submitting attendance with location:', location);
        
        // Submit attendance
        const attendRes = await api.post('/attendance/submit', {
          sessionId,
          token,
          location,
        });

        console.log('✅ Attendance submitted:', attendRes.data);

        setResult({
          type: 'success',
          message: `Presensi berhasil untuk "${sessionName}"!`,
          data: attendRes.data,
        });

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);

      } catch (err) {
        console.error('❌ Attendance error:', err);
        const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Gagal mencatat presensi';
        setError(errorMsg);
        setResult({
          type: 'error',
          message: errorMsg,
        });
      } finally {
        setLoading(false);
      }
    };

    submitAttendance();
  }, [isAuthenticated, location, sessionId, navigate]);

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-center">
        <Card style={{ maxWidth: '500px', width: '100%' }}>
          <Card.Body className="text-center p-4">
            <h3 className="mb-4">📱 Presensi Otomatis</h3>
            
            {loading && (
              <div className="py-4">
                <Spinner animation="border" variant="primary" className="mb-3" />
                <p className="text-muted mb-2">Memproses presensi...</p>
                {!location && (
                  <p className="text-muted small">Mendeteksi lokasi GPS...</p>
                )}
                {location && !sessionInfo && (
                  <p className="text-muted small">Menghubungi server...</p>
                )}
                {sessionInfo && (
                  <p className="text-muted small">Mengirim presensi untuk {sessionInfo.name}...</p>
                )}
              </div>
            )}

            {result && result.type === 'success' && (
              <Alert variant="success" className="mt-3">
                <Alert.Heading>✅ Berhasil!</Alert.Heading>
                <p className="mb-0">{result.message}</p>
                <hr />
                <p className="mb-0 small text-muted">
                  Anda akan diarahkan ke dashboard...
                </p>
              </Alert>
            )}

            {error && (
              <Alert variant="danger" className="mt-3">
                <Alert.Heading>❌ Gagal</Alert.Heading>
                <p className="mb-2">{error}</p>
                <hr />
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => navigate('/dashboard')}
                  >
                    Kembali ke Dashboard
                  </button>
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => window.location.reload()}
                  >
                    Coba Lagi
                  </button>
                </div>
              </Alert>
            )}

            {!loading && !result && !error && (
              <Alert variant="info">
                <p className="mb-0">Mempersiapkan presensi...</p>
              </Alert>
            )}
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default AttendSession;
