import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, InputGroup, Badge, Row, Col } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const AttendanceScan = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('sessionId');

  const [manualToken, setManualToken] = useState('');
  const [scannedToken, setScannedToken] = useState('');
  const [location, setLocation] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fetch session info
    const fetchSession = async () => {
      if (!sessionId) return;
      try {
        const res = await api.get(`/sessions/${sessionId}`);
        setSessionInfo(res.data);
      } catch (err) {
        console.error('Failed to fetch session:', err);
      }
    };
    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationLoading(false);
        },
        (error) => {
          setError('📍 Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.');
          setLocationLoading(false);
        }
      );
    } else {
      setError('❌ Geolocation tidak didukung oleh browser Anda.');
      setLocationLoading(false);
    }
  }, []);

  const handleSubmit = async (token, isManual) => {
    if (!location) {
      setError('Lokasi belum tersedia. Mohon tunggu...');
      return;
    }

    if (!sessionId) {
      setError('Session ID tidak valid.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/attendance/submit', {
        sessionId,
        token,
        locationLat: location.lat,
        locationLng: location.lng,
        isManual,
      });

      setSuccess(true);
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal submit presensi');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken) {
      setError('Kode manual wajib diisi.');
      return;
    }
    handleSubmit(manualToken, true);
  };

  const handleScanSubmit = (e) => {
    e.preventDefault();
    if (!scannedToken) {
      setError('Token scan wajib diisi.');
      return;
    }
    handleSubmit(scannedToken, false);
  };

  return (
    <Container className="py-4">
      <Button variant="outline-secondary" size="sm" className="mb-3" onClick={() => navigate('/dashboard')}>
        ← Kembali ke Dashboard
      </Button>

      {/* Session Info */}
      {sessionInfo && (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <h4 className="mb-3">{sessionInfo.name}</h4>
            {sessionInfo.className && (
              <Badge bg="primary" className="mb-2">🎓 {sessionInfo.className}</Badge>
            )}
            <Row className="mt-3">
              <Col md={4}>
                <small className="text-muted">Radius Presensi:</small>
                <div><Badge bg="info" pill>📏 {sessionInfo.radiusMeters || 50}m</Badge></div>
              </Col>
              <Col md={4}>
                <small className="text-muted">Lokasi Anda:</small>
                <div>
                  {locationLoading ? (
                    <small>⏳ Mengambil lokasi...</small>
                  ) : location ? (
                    <small className="text-success">✓ Siap</small>
                  ) : (
                    <small className="text-danger">✗ Gagal</small>
                  )}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      <Card className="shadow-sm">
        <Card.Header className="bg-success text-white">
          <h4 className="mb-0">✓ Presensi Mahasiswa</h4>
        </Card.Header>
        <Card.Body>
          {success && (
            <Alert variant="success">
              ✅ <strong>Presensi berhasil!</strong> Anda akan dialihkan ke profil...
            </Alert>
          )}

          {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

          {locationLoading && (
            <Alert variant="info">
              <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                📍 Mengambil lokasi Anda...
              </div>
            </Alert>
          )}

          <p className="text-muted mb-4">
            💡 Pilih salah satu cara untuk melakukan presensi:
          </p>

          {/* QR Scanner */}
          <Card className="mb-3 border-primary">
            <Card.Header className="bg-primary bg-opacity-10">
              <strong>1️⃣ Scan QR Code</strong>
            </Card.Header>
            <Card.Body>
              <p className="text-muted small">
                📱 Untuk scan QR code, gunakan aplikasi mobile atau paste token hasil scan di bawah:
              </p>
              <Form onSubmit={handleScanSubmit}>
                <InputGroup>
                  <InputGroup.Text>🔍</InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Paste token dari QR scan"
                    value={scannedToken}
                    onChange={(e) => setScannedToken(e.target.value)}
                    disabled={loading || !location}
                  />
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading || !location || !scannedToken}
                  >
                    {loading ? '⏳ Submit...' : '✓ Submit'}
                  </Button>
                </InputGroup>
              </Form>
            </Card.Body>
          </Card>

          {/* Manual Code Entry */}
          <Card className="border-success">
            <Card.Header className="bg-success bg-opacity-10">
              <strong>2️⃣ Input Kode Manual (6 Digit)</strong>
            </Card.Header>
            <Card.Body>
              <p className="text-muted small">
                🔢 Masukkan kode 6-digit yang ditampilkan oleh dosen:
              </p>
              <Form onSubmit={handleManualSubmit}>
                <InputGroup>
                  <InputGroup.Text>#️⃣</InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Contoh: 123456"
                    maxLength={6}
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value.replace(/\D/g, ''))}
                    disabled={loading || !location}
                    className="text-center fs-5 font-monospace"
                  />
                  <Button 
                    variant="success" 
                    type="submit" 
                    disabled={loading || !location || manualToken.length !== 6}
                  >
                    Kirim
                  </Button>
                </InputGroup>
              </Form>
            </Card.Body>
          </Card>

          <div className="mt-3">
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Kembali ke Dashboard
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AttendanceScan;
