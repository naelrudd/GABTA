import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Alert, Button, Form, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '' });
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  // Group attendance by class
  const groupedHistory = attendanceHistory.reduce((acc, record) => {
    const className = record.session?.className || 'Tanpa Kelas';
    if (!acc[className]) {
      acc[className] = [];
    }
    acc[className].push(record);
    return acc;
  }, {});

  // Calculate stats per class
  const classStats = Object.entries(groupedHistory).map(([className, records]) => ({
    className,
    total: records.length,
    present: records.filter(r => r.status === 'present').length,
    late: records.filter(r => r.status === 'late').length,
    absent: records.filter(r => r.status === 'absent').length,
  }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get('/attendance/stats/user'),
          api.get('/attendance/user'),
        ]);
        setStats(statsRes.data);
        setAttendanceHistory(historyRes.data.attendance || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  const getStatusBadge = (status) => {
    const variants = { present: 'success', late: 'warning', absent: 'danger' };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const handleEditClick = () => {
    setEditForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || ''
    });
    setShowEditModal(true);
    setUpdateError('');
    setUpdateSuccess('');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdateError('');
      const response = await api.put('/auth/profile', editForm);
      setUpdateSuccess('Profil berhasil diperbarui!');
      
      // Update user context
      const updatedUser = { ...user, ...editForm };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setTimeout(() => {
        setShowEditModal(false);
        setUpdateSuccess('');
      }, 1500);
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Gagal memperbarui profil');
    }
  };

  return (
    <Container className="py-4">
      <h2>Profil & Rekap Kehadiran</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Row className="mb-4">
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                  <strong>👤 Informasi Akun</strong>
                  <Button 
                    variant="light" 
                    size="sm"
                    onClick={handleEditClick}
                  >
                    <i className="bi bi-pencil"></i> Edit
                  </Button>
                </Card.Header>
                <Card.Body>
                  <table className="table table-borderless mb-0">
                    <tbody>
                      <tr>
                        <td className="text-muted" width="35%"><strong>Nama:</strong></td>
                        <td>{user?.firstName} {user?.lastName}</td>
                      </tr>
                      <tr>
                        <td className="text-muted"><strong>Email:</strong></td>
                        <td><small>{user?.email}</small></td>
                      </tr>
                      {user?.nim && (
                        <tr>
                          <td className="text-muted"><strong>NIM:</strong></td>
                          <td><Badge bg="secondary">{user.nim}</Badge></td>
                        </tr>
                      )}
                      {user?.nip && (
                        <tr>
                          <td className="text-muted"><strong>NIP:</strong></td>
                          <td><Badge bg="info">{user.nip}</Badge></td>
                        </tr>
                      )}
                      <tr>
                        <td className="text-muted"><strong>Role:</strong></td>
                        <td>
                          <Badge bg="primary">{user?.role === 'committee' || user?.role === 'admin' ? '🎓 Dosen' : '👨‍🎓 Mahasiswa'}</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Header className="bg-success text-white">
                  <strong>📊 Statistik Kehadiran (Total)</strong>
                </Card.Header>
                <Card.Body>
                  <Row className="text-center">
                    <Col xs={6} className="mb-3">
                      <div className="display-6">{stats?.total || 0}</div>
                      <small className="text-muted">Total Presensi</small>
                    </Col>
                    <Col xs={6} className="mb-3">
                      <div className="display-6 text-success">{stats?.present || 0}</div>
                      <small className="text-muted">Hadir</small>
                    </Col>
                    <Col xs={6}>
                      <div className="display-6 text-warning">{stats?.late || 0}</div>
                      <small className="text-muted">Terlambat</small>
                    </Col>
                    <Col xs={6}>
                      <div className="display-6 text-danger">{stats?.absent || 0}</div>
                      <small className="text-muted">Tidak Hadir</small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Stats per Class */}
          {classStats.length > 0 && (
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-info text-white">
                <strong>📚 Statistik per Kelas</strong>
              </Card.Header>
              <Card.Body className="p-0">
                <Table responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Kelas</th>
                      <th className="text-center">Total</th>
                      <th className="text-center">Hadir</th>
                      <th className="text-center">Terlambat</th>
                      <th className="text-center">Persentase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStats.map((stat, idx) => (
                      <tr key={idx}>
                        <td><strong>🎓 {stat.className}</strong></td>
                        <td className="text-center">{stat.total}</td>
                        <td className="text-center">
                          <Badge bg="success">{stat.present}</Badge>
                        </td>
                        <td className="text-center">
                          <Badge bg="warning">{stat.late}</Badge>
                        </td>
                        <td className="text-center">
                          <Badge bg="primary">
                            {stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 0}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          <Card className="shadow-sm">
            <Card.Header className="bg-secondary text-white">
              <strong>📋 Riwayat Kehadiran (Grouped by Class)</strong>
            </Card.Header>
            <Card.Body className="p-0">
              {attendanceHistory.length === 0 ? (
                <Alert variant="info" className="m-3">Belum ada riwayat kehadiran.</Alert>
              ) : (
                Object.entries(groupedHistory).map(([className, records]) => (
                  <div key={className} className="mb-0">
                    <div className="bg-light p-2 border-bottom">
                      <strong>🎓 {className}</strong>
                      <Badge bg="secondary" className="ms-2">{records.length} sesi</Badge>
                    </div>
                    <Table responsive hover className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Sesi</th>
                          <th>Waktu Presensi</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((record) => (
                          <tr key={record.id}>
                            <td>{record.session?.name || 'N/A'}</td>
                            <td>{formatDate(record.timestamp)}</td>
                            <td>{getStatusBadge(record.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </>
      )}

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {updateError && (
            <Alert variant="danger" dismissible onClose={() => setUpdateError('')}>
              {updateError}
            </Alert>
          )}
          {updateSuccess && (
            <Alert variant="success">{updateSuccess}</Alert>
          )}
          <Form onSubmit={handleUpdateProfile}>
            <Form.Group className="mb-3">
              <Form.Label>Nama Depan</Form.Label>
              <Form.Control
                type="text"
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nama Belakang</Form.Label>
              <Form.Control
                type="text"
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                required
              />
            </Form.Group>
            <div className="d-grid gap-2">
              <Button variant="primary" type="submit">
                Simpan Perubahan
              </Button>
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Batal
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Profile;
