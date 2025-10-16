import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Badge, Alert, Button } from 'react-bootstrap';
import api from '../services/api';

const SessionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get(`/sessions/${id}`);
        setSession(res.data);
        setAttendees(res.data.attendances || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat sesi');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  // Fetch QR data and refresh every 30s
  useEffect(() => {
    const fetchQR = async () => {
      try {
        const res = await api.get(`/sessions/${id}/qr`);
        setQrData(res.data);
        setCountdown(30);
      } catch (err) {
        console.error('Failed to fetch QR:', err);
      }
    };

    fetchQR();
    const interval = setInterval(fetchQR, 30000); // refresh every 30s

    return () => clearInterval(interval);
  }, [id]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  const getStatusBadge = (status) => {
    const variants = { present: 'success', late: 'warning', absent: 'danger' };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }
  
  if (error) return <Container className="py-4"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="py-4">
      <Button variant="outline-secondary" size="sm" className="mb-3" onClick={() => navigate('/dashboard')}>
        ← Kembali ke Dashboard
      </Button>

      {/* Session Info Header */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={8}>
              <h2 className="mb-1">{session?.name}</h2>
              {session?.className && (
                <Badge bg="primary" className="mb-2">🎓 {session.className}</Badge>
              )}
              <p className="text-muted mb-2">
                🕐 {formatDate(session?.startTime)} - {formatDate(session?.endTime)}
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Badge bg="info" pill>📏 Radius: {session?.radiusMeters || 50}m</Badge>
                <Badge bg="secondary" pill>
                  📍 Lat: {session?.locationLat?.toFixed(4)}, Lng: {session?.locationLng?.toFixed(4)}
                </Badge>
                <Badge bg="success" pill>👥 Hadir: {attendees.length} orang</Badge>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* QR CODE - TENGAH (BESAR) */}
      <Row className="mb-4 justify-content-center">
        <Col lg={6} md={8}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white text-center">
              <h4 className="mb-0"><i className="bi bi-qr-code"></i> QR Code Presensi</h4>
            </Card.Header>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center bg-light p-4">
              {qrData ? (
                <div className="text-center w-100">
                  <div className="bg-white p-4 d-inline-block rounded shadow mb-3" style={{ border: '4px solid #0d6efd' }}>
                    <img 
                      src={qrData.qrCodeImage} 
                      alt="QR Code" 
                      style={{ maxWidth: '400px', width: '100%', height: 'auto' }} 
                      className="img-fluid"
                    />
                  </div>
                  <div className="mb-3">
                    <h5 className="text-muted mb-2">Atau Gunakan Kode Manual:</h5>
                    <Badge bg="dark" className="fs-1 px-5 py-3 font-monospace shadow">
                      {qrData.manualCode}
                    </Badge>
                  </div>
                  <Alert variant="info" className="mb-0">
                    <i className="bi bi-clock-history"></i> QR akan refresh dalam <strong className="fs-4">{countdown}s</strong>
                  </Alert>
                </div>
              ) : (
                <div className="py-5 text-center">
                  <div className="spinner-border text-primary mb-3" style={{ width: '4rem', height: '4rem' }}>
                    <span className="visually-hidden">Loading QR...</span>
                  </div>
                  <p className="text-muted">Memuat QR Code...</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* DETAIL INFO DI BAWAH */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0"><i className="bi bi-info-circle"></i> Detail Sesi</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <table className="table table-borderless mb-0">
                    <tbody>
                      <tr>
                        <td className="text-muted" width="40%"><strong>Pembuat:</strong></td>
                        <td>{session?.creator?.firstName} {session?.creator?.lastName}</td>
                      </tr>
                      <tr>
                        <td className="text-muted"><strong>Email:</strong></td>
                        <td><small>{session?.creator?.email}</small></td>
                      </tr>
                      <tr>
                        <td className="text-muted"><strong>Radius:</strong></td>
                        <td><Badge bg="info">{session?.radiusMeters || 50} meter</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
                <Col md={6}>
                  <table className="table table-borderless mb-0">
                    <tbody>
                      <tr>
                        <td className="text-muted" width="40%"><strong>Total Hadir:</strong></td>
                        <td>
                          <Badge bg="success">{attendees.filter(a => a.status === 'present').length} Hadir</Badge>{' '}
                          <Badge bg="warning">{attendees.filter(a => a.status === 'late').length} Terlambat</Badge>
                        </td>
                      </tr>
                      {session?.maxCapacity && (
                        <tr>
                          <td className="text-muted"><strong>Kapasitas:</strong></td>
                          <td>
                            <Badge bg={attendees.length >= session.maxCapacity ? 'danger' : 'primary'}>
                              {attendees.length} / {session.maxCapacity}
                            </Badge>
                            {attendees.length >= session.maxCapacity && <span className="text-danger ms-2">⚠️ Penuh</span>}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
          <span><strong>👥 Daftar Peserta</strong></span>
          {session?.maxCapacity ? (
            <Badge bg="light" text="dark" className="fs-6">
              {attendees.length} / {session.maxCapacity}
            </Badge>
          ) : (
            <Badge bg="light" text="dark" className="fs-6">
              {attendees.length} peserta
            </Badge>
          )}
        </Card.Header>
        <Card.Body className="p-0">
          {attendees.length === 0 ? (
            <Alert variant="info" className="m-3">📋 Belum ada peserta yang melakukan presensi.</Alert>
          ) : (
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>NIM</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Waktu Presensi</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((att, idx) => (
                  <tr key={att.id}>
                    <td>{idx + 1}</td>
                    <td><Badge bg="secondary">{att.user?.nim || '-'}</Badge></td>
                    <td>{att.user?.firstName} {att.user?.lastName}</td>
                    <td><small>{att.user?.email}</small></td>
                    <td>{formatDate(att.timestamp)}</td>
                    <td>{getStatusBadge(att.status)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SessionDetails;
