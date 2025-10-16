import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const CreateSessionSchema = Yup.object().shape({
  name: Yup.string().required('Nama sesi wajib diisi'),
  className: Yup.string().required('Nama kelas wajib diisi'),
  kodeKelas: Yup.string().matches(/^[A-Z0-9]*$/, 'Kode kelas hanya boleh huruf kapital dan angka'),
  maxCapacity: Yup.number().min(1).max(500).nullable(),
  startTime: Yup.date().required('Waktu mulai wajib diisi'),
  endTime: Yup.date()
    .required('Waktu selesai wajib diisi')
    .min(Yup.ref('startTime'), 'Waktu selesai harus setelah waktu mulai'),
  locationLat: Yup.number().required('Latitude wajib diisi').min(-90).max(90),
  locationLng: Yup.number().required('Longitude wajib diisi').min(-180).max(180),
  radiusMeters: Yup.number().min(10).max(1000).required('Radius wajib diisi'),
});

const CreateSession = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [savedClasses, setSavedClasses] = useState([]);
  const [showNewClass, setShowNewClass] = useState(false);

  useEffect(() => {
    const classes = JSON.parse(localStorage.getItem('savedClasses') || '[]');
    setSavedClasses(classes);
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError(null);
      setSuccess('');
      if (values.className && !savedClasses.includes(values.className)) {
        const newClasses = [...savedClasses, values.className];
        setSavedClasses(newClasses);
        localStorage.setItem('savedClasses', JSON.stringify(newClasses));
      }
      await api.post('/sessions', values);
      setSuccess('Sesi berhasil dibuat!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat sesi');
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrentLocation = (setFieldValue) => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung');
      return;
    }
    setGettingLocation(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFieldValue('locationLat', position.coords.latitude.toFixed(6));
        setFieldValue('locationLng', position.coords.longitude.toFixed(6));
        setGettingLocation(false);
        setSuccess('Lokasi berhasil didapatkan!');
        setTimeout(() => setSuccess(''), 3000);
      },
      () => {
        setError('Gagal mendapatkan lokasi');
        setGettingLocation(false);
      }
    );
  };

  const getSuggestedTimes = () => {
    const now = new Date();
    const start = new Date(now);
    start.setMinutes(0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 2);
    return {
      start: start.toISOString().slice(0, 16),
      end: end.toISOString().slice(0, 16),
    };
  };

  const suggestedTimes = getSuggestedTimes();

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h3 className="mb-0">Buat Sesi Presensi Baru</h3>
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
              {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
              <Formik
                initialValues={{
                  name: '',
                  className: '',
                  kodeKelas: '',
                  maxCapacity: '',
                  startTime: suggestedTimes.start,
                  endTime: suggestedTimes.end,
                  locationLat: '',
                  locationLng: '',
                  radiusMeters: 50,
                }}
                validationSchema={CreateSessionSchema}
                onSubmit={handleSubmit}
              >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Nama Kelas</Form.Label>
                      {savedClasses.length > 0 && !showNewClass ? (
                        <>
                          <Form.Select
                            name="className"
                            value={values.className}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.className && errors.className}
                          >
                            <option value="">-- Pilih Kelas --</option>
                            {savedClasses.map((cls, idx) => <option key={idx} value={cls}>{cls}</option>)}
                          </Form.Select>
                          <Button variant="link" size="sm" className="mt-1 p-0" onClick={() => setShowNewClass(true)}>+ Tambah kelas baru</Button>
                        </>
                      ) : (
                        <>
                          <Form.Control
                            type="text"
                            name="className"
                            placeholder="Pemrograman Web A"
                            value={values.className}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.className && errors.className}
                          />
                          {savedClasses.length > 0 && <Button variant="link" size="sm" className="mt-1 p-0" onClick={() => setShowNewClass(false)}>Pilih dari kelas tersimpan</Button>}
                        </>
                      )}
                      <Form.Control.Feedback type="invalid">{errors.className}</Form.Control.Feedback>
                      <Form.Text className="text-muted">Kelas akan tersimpan otomatis</Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Kode Kelas <Badge bg="secondary">Opsional</Badge></Form.Label>
                      <Form.Control 
                        type="text" 
                        name="kodeKelas" 
                        placeholder="IF101, MTK201, FIS102" 
                        value={values.kodeKelas}
                        onChange={(e) => setFieldValue('kodeKelas', e.target.value.toUpperCase())}
                        onBlur={handleBlur} 
                        isInvalid={touched.kodeKelas && errors.kodeKelas}
                        maxLength={20}
                      />
                      <Form.Control.Feedback type="invalid">{errors.kodeKelas}</Form.Control.Feedback>
                      <Form.Text className="text-muted">Kode identifikasi kelas (huruf kapital dan angka saja)</Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Kapasitas Kelas <Badge bg="secondary">Opsional</Badge></Form.Label>
                      <Form.Control 
                        type="number" 
                        name="maxCapacity" 
                        placeholder="100" 
                        value={values.maxCapacity}
                        onChange={handleChange}
                        onBlur={handleBlur} 
                        isInvalid={touched.maxCapacity && errors.maxCapacity}
                        min="1"
                        max="500"
                      />
                      <Form.Control.Feedback type="invalid">{errors.maxCapacity}</Form.Control.Feedback>
                      <Form.Text className="text-muted">Batas maksimal peserta kelas (kosongkan jika tidak ada limit)</Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Nama Sesi</Form.Label>
                      <Form.Control type="text" name="name" placeholder="Pertemuan 1" value={values.name} onChange={handleChange} onBlur={handleBlur} isInvalid={touched.name && errors.name} />
                      <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                    </Form.Group>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Waktu Mulai</Form.Label>
                          <Form.Control type="datetime-local" name="startTime" value={values.startTime} onChange={handleChange} onBlur={handleBlur} isInvalid={touched.startTime && errors.startTime} />
                          <Form.Control.Feedback type="invalid">{errors.startTime}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Waktu Selesai</Form.Label>
                          <Form.Control type="datetime-local" name="endTime" value={values.endTime} onChange={handleChange} onBlur={handleBlur} isInvalid={touched.endTime && errors.endTime} />
                          <Form.Control.Feedback type="invalid">{errors.endTime}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Lokasi Presensi</Form.Label>
                      <Button variant={values.locationLat ? "success" : "outline-primary"} size="lg" className="mb-2 w-100" onClick={() => getCurrentLocation(setFieldValue)} disabled={gettingLocation} type="button">
                        {gettingLocation ? 'Mendapatkan Lokasi...' : values.locationLat ? 'Lokasi Didapatkan' : 'Dapatkan Lokasi GPS'}
                      </Button>
                      <Row>
                        <Col>
                          <InputGroup size="sm">
                            <InputGroup.Text>Lat</InputGroup.Text>
                            <Form.Control type="number" step="any" name="locationLat" value={values.locationLat} onChange={handleChange} onBlur={handleBlur} isInvalid={touched.locationLat && errors.locationLat} readOnly />
                          </InputGroup>
                        </Col>
                        <Col>
                          <InputGroup size="sm">
                            <InputGroup.Text>Lng</InputGroup.Text>
                            <Form.Control type="number" step="any" name="locationLng" value={values.locationLng} onChange={handleChange} onBlur={handleBlur} isInvalid={touched.locationLng && errors.locationLng} readOnly />
                          </InputGroup>
                        </Col>
                      </Row>
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">Radius: <Badge bg="info">{values.radiusMeters}m</Badge></Form.Label>
                      <Form.Range name="radiusMeters" min={10} max={500} step={10} value={values.radiusMeters} onChange={handleChange} />
                      <div className="d-flex justify-content-between small text-muted">
                        <span>10m</span>
                        <span>100m</span>
                        <span>500m</span>
                      </div>
                    </Form.Group>
                    <div className="d-grid gap-2">
                      <Button variant="primary" type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting ? 'Membuat...' : 'Buat Sesi'}
                      </Button>
                      <Button variant="outline-secondary" onClick={() => navigate('/dashboard')} disabled={isSubmitting}>Batal</Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateSession;
