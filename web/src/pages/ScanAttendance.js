import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, Badge, Modal } from 'react-bootstrap';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ScanAttendance = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [token, setToken] = useState('');
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [rememberLogin, setRememberLogin] = useState(false);
  const scannerRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Auto-login check
  useEffect(() => {
    const savedCredentials = localStorage.getItem('gabta_credentials');
    if (savedCredentials && !isAuthenticated) {
      // Will be handled by AuthContext auto-login
      navigate('/login', { state: { returnTo: '/scan', autoLogin: true } });
    }
  }, [isAuthenticated, navigate]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: '/scan' } });
    }
  }, [isAuthenticated, navigate]);

  // Get location on mount
  useEffect(() => {
    if (isAuthenticated) {
      getCurrentLocation();
    }
  }, [isAuthenticated]);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.clear().catch(err => console.error('Scanner cleanup error:', err));
      }
    };
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Browser tidak mendukung geolocation');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (err) => {
        setError('Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin lokasi diberikan.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const startScanning = () => {
    setScanning(true);
    setError(null);
    setResult(null);
    setManualMode(false);

    // Initialize scanner
    setTimeout(() => {
      if (scannerRef.current && !qrScannerRef.current) {
        const scanner = new Html5QrcodeScanner(
          'qr-reader',
          { 
            fps: 10,
            qrbox: { width: 300, height: 300 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true,
          },
          false
        );

        scanner.render(onScanSuccess, onScanError);
        qrScannerRef.current = scanner;
      }
    }, 100);
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.clear().catch(err => console.error('Stop scan error:', err));
      qrScannerRef.current = null;
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText, decodedResult) => {
    try {
      stopScanning();
      const data = JSON.parse(decodedText);
      
      if (data.sessionId && data.token) {
        setSessionId(data.sessionId);
        setToken(data.token);
        // Auto-submit
        await submitAttendance(data.sessionId, data.token);
      } else {
        setError('QR Code tidak valid. Silakan scan QR code dari sesi presensi.');
      }
    } catch (err) {
      setError('Format QR Code tidak valid');
      setTimeout(() => startScanning(), 2000); // Resume scanning after 2s
    }
  };

  const onScanError = (errorMessage) => {
    // Ignore continuous scan errors, only log
    // console.log('Scan error:', errorMessage);
  };

  const submitAttendance = async (sid = sessionId, tkn = token) => {
    if (!sid || !tkn) {
      setError('Session ID dan Token harus diisi');
      return;
    }

    if (!location) {
      setError('Lokasi belum tersedia. Klik tombol Refresh Lokasi.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const response = await api.post('/attendance/submit', {
        sessionId: sid,
        token: tkn,
        location,
      });

      setResult({
        type: 'success',
        message: 'Presensi berhasil dicatat!',
        data: response.data,
      });

      // Reset form
      setSessionId('');
      setToken('');
      setManualMode(false);
      
      // Refresh location for next scan
      setTimeout(() => {
        getCurrentLocation();
        setResult(null);
      }, 3000);

    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Gagal mencatat presensi';
      setError(errorMsg);
      setResult({
        type: 'error',
        message: errorMsg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    submitAttendance();
  };

  if (!isAuthenticated) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Memuat...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <Card className="mb-4 shadow-sm border-primary">
        <Card.Body className="bg-primary bg-opacity-10">
          <Row className="align-items-center">
            <Col>
              <h3 className="mb-1">
                <i className="bi bi-qr-code-scan"></i> Scan QR Presensi
              </h3>
              <p className="mb-0 text-muted">
                Selamat datang, <strong>{user?.name}</strong>!
              </p>
            </Col>
            <Col xs="auto">
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={() => navigate('/profile')}
              >
                <i className="bi bi-person-circle"></i> Profil
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Location Status */}
      <Alert variant={location ? 'success' : 'warning'} className="d-flex justify-content-between align-items-center">
        <div>
          <i className={`bi ${location ? 'bi-geo-alt-fill' : 'bi-geo-alt'}`}></i>
          {location ? (
            <span>
              {' '}Lokasi: <code>{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</code>
            </span>
          ) : (
            <span> Lokasi belum tersedia</span>
          )}
        </div>
        <Button 
          variant="outline-secondary" 
          size="sm" 
          onClick={getCurrentLocation}
          disabled={locationLoading}
        >
          <i className="bi bi-arrow-clockwise"></i> {locationLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </Alert>

      {/* Result Messages */}
      {result && (
        <Alert 
          variant={result.type === 'success' ? 'success' : 'danger'} 
          dismissible 
          onClose={() => setResult(null)}
          className="mb-4"
        >
          <Alert.Heading>
            <i className={`bi ${result.type === 'success' ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
            {' '}{result.type === 'success' ? 'Berhasil!' : 'Gagal'}
          </Alert.Heading>
          <p className="mb-0">{result.message}</p>
          {result.data && (
            <div className="mt-2">
              <Badge bg={result.data.status === 'present' ? 'success' : 'warning'}>
                Status: {result.data.status === 'present' ? 'Hadir' : 'Terlambat'}
              </Badge>
            </div>
          )}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <i className="bi bi-exclamation-triangle"></i> {error}
        </Alert>
      )}

      {/* Main Action Area */}
      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <strong>
                  <i className="bi bi-camera-fill"></i> Mode Presensi
                </strong>
                <div>
                  <Button
                    variant={!manualMode ? 'light' : 'outline-light'}
                    size="sm"
                    onClick={() => {
                      setManualMode(false);
                      if (!scanning) startScanning();
                    }}
                    className="me-2"
                  >
                    <i className="bi bi-qr-code-scan"></i> QR Scan
                  </Button>
                  <Button
                    variant={manualMode ? 'light' : 'outline-light'}
                    size="sm"
                    onClick={() => {
                      stopScanning();
                      setManualMode(true);
                    }}
                  >
                    <i className="bi bi-keyboard"></i> Manual
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {/* QR Scanner Mode */}
              {!manualMode && (
                <div>
                  {!scanning ? (
                    <div className="text-center py-5">
                      <i className="bi bi-qr-code-scan display-1 text-primary mb-3"></i>
                      <h5>Scan QR Code untuk Presensi</h5>
                      <p className="text-muted mb-4">
                        Arahkan kamera ke QR code yang ditampilkan dosen
                      </p>
                      <Button 
                        variant="primary" 
                        size="lg" 
                        onClick={startScanning}
                        disabled={!location}
                      >
                        <i className="bi bi-camera-fill"></i> Mulai Scan
                      </Button>
                      {!location && (
                        <p className="text-warning mt-3">
                          <i className="bi bi-exclamation-triangle"></i> Aktifkan lokasi terlebih dahulu
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div id="qr-reader" ref={scannerRef}></div>
                      <div className="text-center mt-3">
                        <Button variant="danger" onClick={stopScanning}>
                          <i className="bi bi-stop-circle"></i> Berhenti Scan
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Manual Mode */}
              {manualMode && (
                <Form onSubmit={handleManualSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Session ID</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Masukkan Session ID"
                      value={sessionId}
                      onChange={(e) => setSessionId(e.target.value)}
                      required
                    />
                    <Form.Text className="text-muted">
                      ID sesi dapat dilihat dari dosen atau URL
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Token (6 Digit)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="123456"
                      value={token}
                      onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      required
                      className="font-monospace fs-4 text-center"
                    />
                    <Form.Text className="text-muted">
                      Kode 6 digit yang ditampilkan di bawah QR code
                    </Form.Text>
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button
                      type="submit"
                      variant="success"
                      size="lg"
                      disabled={submitting || !location || !sessionId || token.length !== 6}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle"></i> Kirim Presensi
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>

          {/* Info Card */}
          <Card className="mt-3 border-info">
            <Card.Body className="bg-info bg-opacity-10">
              <h6 className="mb-2">
                <i className="bi bi-info-circle"></i> Cara Presensi:
              </h6>
              <ol className="mb-0 small">
                <li>Pastikan lokasi GPS aktif</li>
                <li>Pilih mode <strong>QR Scan</strong> atau <strong>Manual</strong></li>
                <li>Scan QR code atau masukkan Session ID + Token</li>
                <li>Sistem akan memvalidasi lokasi Anda</li>
                <li>Presensi tercatat jika dalam radius yang ditentukan</li>
              </ol>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ScanAttendance;
