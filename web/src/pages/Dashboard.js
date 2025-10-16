import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Alert, Badge, Accordion } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isDosen = user?.role === 'committee' || user?.role === 'admin';

  // Group sessions by className
  const groupedSessions = sessions.reduce((acc, session) => {
    const className = session.className || 'Tanpa Kelas';
    if (!acc[className]) {
      acc[className] = [];
    }
    acc[className].push(session);
    return acc;
  }, {});

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const query = isDosen ? '?mine=true' : ''; // Dosen: sessions mereka, Mahasiswa: active sessions
        const res = await api.get(`/sessions${query}`);
        setSessions(res.data.sessions || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [isDosen]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  const isSessionActive = (session) => {
    const now = new Date();
    return now >= new Date(session.startTime) && now <= new Date(session.endTime);
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Dashboard {isDosen ? 'Dosen' : 'Mahasiswa'}</h2>
          <p className="text-muted">
            {isDosen
              ? 'Kelola sesi pertemuan dan lihat rekap kehadiran mahasiswa'
              : 'Daftar sesi pertemuan aktif untuk presensi'}
          </p>
        </Col>
        {isDosen && (
          <Col xs="auto">
            <Button variant="primary" onClick={() => navigate('/sessions/create')}>
              + Buat Sesi Baru
            </Button>
          </Col>
        )}
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : sessions.length === 0 ? (
        <Alert variant="info">
          {isDosen ? '📋 Belum ada sesi. Klik "Buat Sesi Baru" untuk memulai.' : '📚 Tidak ada sesi aktif saat ini.'}
        </Alert>
      ) : (
        <Accordion defaultActiveKey="0">
          {Object.entries(groupedSessions).map(([className, classSessions], idx) => {
            const activeCount = classSessions.filter(isSessionActive).length;
            const totalCount = classSessions.length;
            
            return (
              <Accordion.Item eventKey={idx.toString()} key={className}>
                <Accordion.Header>
                  <div className="d-flex justify-content-between align-items-center w-100 pe-3">
                    <div>
                      <strong>🎓 {className}</strong>
                      <span className="text-muted ms-2">({totalCount} sesi)</span>
                    </div>
                    {activeCount > 0 && (
                      <Badge bg="success" className="ms-auto">
                        {activeCount} Aktif
                      </Badge>
                    )}
                  </div>
                </Accordion.Header>
                <Accordion.Body className="p-0">
                  <Table responsive hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Nama Sesi</th>
                        <th>Waktu</th>
                        <th>Radius</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classSessions.map((session) => (
                        <tr key={session.id}>
                          <td>
                            <strong>{session.name}</strong>
                          </td>
                          <td>
                            <small>
                              {formatDate(session.startTime)}
                              <br />
                              s/d {formatDate(session.endTime)}
                            </small>
                          </td>
                          <td>
                            <Badge bg="info" pill>
                              📏 {session.radiusMeters || 50}m
                            </Badge>
                          </td>
                          <td>
                            {isSessionActive(session) ? (
                              <Badge bg="success">✓ Aktif</Badge>
                            ) : new Date() < new Date(session.startTime) ? (
                              <Badge bg="warning">⏰ Belum Mulai</Badge>
                            ) : (
                              <Badge bg="secondary">✓ Selesai</Badge>
                            )}
                          </td>
                          <td>
                            {isDosen ? (
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => navigate(`/sessions/${session.id}`)}
                              >
                                📊 Detail & QR
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant={isSessionActive(session) ? 'success' : 'secondary'}
                                onClick={() => navigate(`/scan?sessionId=${session.id}`)}
                                disabled={!isSessionActive(session)}
                              >
                                {isSessionActive(session) ? '✓ Presensi' : '🔒 Tidak Aktif'}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
      )}
    </Container>
  );
};

export default Dashboard;
