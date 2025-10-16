import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import * as XLSX from 'xlsx';

const ClassManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editReason, setEditReason] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sessions?mine=true');
      // Group by className
      const grouped = response.data.reduce((acc, session) => {
        const className = session.className || 'Tanpa Kelas';
        if (!acc[className]) {
          acc[className] = {
            className,
            kodeKelas: session.kodeKelas || '-',
            sessions: [],
          };
        }
        acc[className].sessions.push(session);
        return acc;
      }, {});
      setClasses(grouped);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data kelas');
    } finally {
      setLoading(false);
    }
  };

  const viewClassDetails = async (className) => {
    try {
      const classData = classes[className];
      if (!classData) return;

      // Fetch attendance for all sessions in this class
      const attendancePromises = classData.sessions.map(session =>
        api.get(`/sessions/${session.id}`).then(res => ({
          session: res.data,
          attendances: res.data.attendances || []
        }))
      );

      const results = await Promise.all(attendancePromises);
      setSelectedClass({ ...classData, details: results });
    } catch (err) {
      setError('Gagal memuat detail kelas');
    }
  };

  const exportToExcel = async (className) => {
    try {
      const classData = classes[className];
      if (!classData) return;

      // Fetch full data for export
      const attendancePromises = classData.sessions.map(session =>
        api.get(`/sessions/${session.id}`).then(res => ({
          sessionName: res.data.name,
          sessionDate: new Date(res.data.startTime).toLocaleDateString('id-ID'),
          attendances: res.data.attendances || []
        }))
      );

      const results = await Promise.all(attendancePromises);

      // Prepare data for Excel
      const allStudentsMap = new Map();
      results.forEach(({ attendances }) => {
        attendances.forEach(att => {
          const email = att.user?.email || 'Unknown';
          if (!allStudentsMap.has(email)) {
            allStudentsMap.set(email, {
              name: `${att.user?.firstName || ''} ${att.user?.lastName || ''}`.trim(),
              nim: att.user?.nim || '-',
              email: email
            });
          }
        });
      });

      const excelData = Array.from(allStudentsMap.values()).map(student => {
        const row = { 
          'NIM': student.nim,
          'Nama': student.name,
          'Email': student.email 
        };
        results.forEach(({ sessionName, attendances }) => {
          const attendance = attendances.find(att => att.user?.email === student.email);
          row[sessionName] = attendance ? (attendance.status === 'present' ? 'Hadir' : attendance.status === 'late' ? 'Terlambat' : 'Tidak Hadir') : 'Tidak Hadir';
        });
        return row;
      });

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rekap Kehadiran');

      // Download
      const fileName = `Rekap_${className.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      setError('Gagal mengekspor data');
    }
  };

  const handleEditAttendance = async () => {
    if (!editData || !editReason.trim()) {
      alert('Alasan wajib diisi');
      return;
    }

    try {
      await api.patch(`/attendance/${editData.attendanceId}`, {
        status: editData.newStatus,
        notes: editReason,
      });

      alert('Status kehadiran berhasil diupdate');
      setShowEditModal(false);
      setEditData(null);
      setEditReason('');
      
      // Refresh data
      if (selectedClass) {
        viewClassDetails(selectedClass.className);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengupdate kehadiran');
    }
  };

  const openEditModal = (attendance, sessionName) => {
    setEditData({
      attendanceId: attendance.id,
      studentName: attendance.user?.name || attendance.user?.email,
      sessionName,
      currentStatus: attendance.status,
      newStatus: attendance.status,
    });
    setEditReason('');
    setShowEditModal(true);
  };

  if (user?.role !== 'dosen') {
    return (
      <Container className="py-4">
        <Alert variant="warning">Halaman ini hanya untuk dosen.</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-journal-text"></i> Manajemen Kelas
        </h2>
        <Button variant="primary" onClick={() => navigate('/create-session')}>
          <i className="bi bi-plus-circle"></i> Buat Sesi Baru
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

      {Object.keys(classes).length === 0 ? (
        <Alert variant="info">
          Belum ada kelas. <Link to="/create-session">Buat sesi pertama Anda</Link>.
        </Alert>
      ) : (
        <Row>
          {Object.entries(classes).map(([className, classData]) => (
            <Col md={6} lg={4} key={className} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Header className="bg-primary text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>{className}</strong>
                    {classData.kodeKelas !== '-' && (
                      <Badge bg="light" text="dark">{classData.kodeKelas}</Badge>
                    )}
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <h5 className="mb-2">
                      <Badge bg="info">{classData.sessions.length}</Badge> Sesi
                    </h5>
                    <small className="text-muted">
                      {classData.sessions.filter(s => new Date(s.endTime) > new Date()).length} aktif/akan datang
                    </small>
                  </div>
                  
                  <div className="d-grid gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => viewClassDetails(className)}
                    >
                      <i className="bi bi-eye"></i> Lihat Detail
                    </Button>
                    <Button 
                      variant="outline-success" 
                      size="sm"
                      onClick={() => exportToExcel(className)}
                    >
                      <i className="bi bi-file-earmark-excel"></i> Export Excel
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Detail Modal */}
      <Modal show={!!selectedClass} onHide={() => setSelectedClass(null)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedClass?.className}
            {selectedClass?.kodeKelas !== '-' && (
              <Badge bg="secondary" className="ms-2">{selectedClass.kodeKelas}</Badge>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {selectedClass?.details ? (
            selectedClass.details.map(({ session, attendances }, idx) => (
              <Card key={session.id} className="mb-3">
                <Card.Header>
                  <strong>{session.name}</strong>
                  <Badge bg="secondary" className="ms-2">
                    {new Date(session.startTime).toLocaleDateString('id-ID')}
                  </Badge>
                  <Badge bg="info" className="ms-2">{attendances.length} hadir</Badge>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table responsive hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>No</th>
                        <th>NIM</th>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Waktu</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendances.length > 0 ? (
                        attendances.map((att, i) => (
                          <tr key={att.id}>
                            <td>{i + 1}</td>
                            <td><Badge bg="secondary">{att.user?.nim || '-'}</Badge></td>
                            <td>{att.user?.firstName} {att.user?.lastName}</td>
                            <td><small>{att.user?.email}</small></td>
                            <td><small>{new Date(att.timestamp).toLocaleString('id-ID')}</small></td>
                            <td>
                              <Badge bg={att.status === 'present' ? 'success' : att.status === 'late' ? 'warning' : 'danger'}>
                                {att.status === 'present' ? 'Hadir' : att.status === 'late' ? 'Terlambat' : 'Tidak Hadir'}
                              </Badge>
                            </td>
                            <td>
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => openEditModal(att, session.name)}
                              >
                                <i className="bi bi-pencil"></i> Edit
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center text-muted">
                            Belum ada mahasiswa yang hadir
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            ))
          ) : (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Attendance Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Status Kehadiran</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editData && (
            <>
              <p><strong>Mahasiswa:</strong> {editData.studentName}</p>
              <p><strong>Sesi:</strong> {editData.sessionName}</p>
              <p><strong>Status Saat Ini:</strong> <Badge bg="info">{editData.currentStatus}</Badge></p>

              <Form.Group className="mb-3">
                <Form.Label>Status Baru</Form.Label>
                <Form.Select
                  value={editData.newStatus}
                  onChange={(e) => setEditData({ ...editData, newStatus: e.target.value })}
                >
                  <option value="present">Hadir</option>
                  <option value="late">Terlambat</option>
                  <option value="absent">Tidak Hadir</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Alasan / Catatan <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Jelaskan alasan perubahan status..."
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  required
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleEditAttendance}>
            Simpan Perubahan
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ClassManagement;
