import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, useFormikContext } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';

const RegisterSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email tidak valid')
    .required('Email wajib diisi'),
  password: Yup.string()
    .min(6, 'Password minimal 6 karakter')
    .required('Password wajib diisi'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Password tidak cocok')
    .required('Konfirmasi password wajib diisi'),
  firstName: Yup.string()
    .required('Nama depan wajib diisi'),
  lastName: Yup.string()
    .required('Nama belakang wajib diisi'),
  idType: Yup.string()
    .oneOf(['nim', 'nip'], 'Pilih NIM atau NIP')
    .required('Pilih identitas wajib'),
  nim: Yup.string()
    .when('idType', {
      is: 'nim',
      then: (schema) => schema
        .matches(/^[0-9]*$/, 'NIM hanya boleh angka')
        .min(5, 'NIM minimal 5 digit')
        .max(20, 'NIM maksimal 20 digit')
        .required('NIM wajib diisi untuk mahasiswa'),
      otherwise: (schema) => schema.notRequired()
    }),
  nip: Yup.string()
    .when('idType', {
      is: 'nip',
      then: (schema) => schema
        .matches(/^[0-9]*$/, 'NIP hanya boleh angka')
        .min(5, 'NIP minimal 5 digit')
        .max(20, 'NIP maksimal 20 digit')
        .required('NIP wajib diisi untuk dosen'),
      otherwise: (schema) => schema.notRequired()
    })
});

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // observer component to handle email -> idType side-effect using Formik context
  const FormObserver = () => {
    const { values, setFieldValue } = useFormikContext();
    useEffect(() => {
      const emailIsStudent = values.email && values.email.endsWith('@students.um.ac.id');
      if (emailIsStudent && !values.idType) {
        setFieldValue('idType', 'nim');
      }
    }, [values.email, values.idType, setFieldValue]);
    return null;
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setSuccess('');
      const { confirmPassword, ...registerData } = values;
      
      const response = await api.post('/auth/register', registerData);
      
      setSuccess(response.data.message || 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="mb-2">📚 GABTA</h2>
                <p className="text-muted">Buat akun baru</p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success">
                  {success}
                </Alert>
              )}

              <Formik
                initialValues={{
                  email: '',
                  password: '',
                  confirmPassword: '',
                  firstName: '',
                  lastName: '',
                  idType: '',
                  nim: '',
                  nip: ''
                }}
                validationSchema={RegisterSchema}
                onSubmit={handleSubmit}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  isSubmitting,
                  setFieldValue
                }) => {
                  // Check if email is student email
                  const emailIsStudent = values.email && values.email.endsWith('@students.um.ac.id');

                  return (
                    <>
                      <FormObserver />
                      <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          placeholder="nama@students.um.ac.id atau nama@um.ac.id"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.email && errors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          {emailIsStudent && '✓ Email mahasiswa terdeteksi'}
                        </Form.Text>
                      </Form.Group>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Nama Depan</Form.Label>
                            <Form.Control
                              type="text"
                              name="firstName"
                              placeholder="John"
                              value={values.firstName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.firstName && errors.firstName}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.firstName}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Nama Belakang</Form.Label>
                            <Form.Control
                              type="text"
                              name="lastName"
                              placeholder="Doe"
                              value={values.lastName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.lastName && errors.lastName}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.lastName}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Anda adalah <span className="text-danger">*</span></Form.Label>
                        <div>
                          <Form.Check
                            inline
                            type="radio"
                            label="👨‍🎓 Mahasiswa (NIM)"
                            name="idType"
                            id="idType-nim"
                            value="nim"
                            checked={values.idType === 'nim'}
                            onChange={handleChange}
                            disabled={emailIsStudent}
                          />
                          <Form.Check
                            inline
                            type="radio"
                            label="👨‍🏫 Dosen (NIP)"
                            name="idType"
                            id="idType-nip"
                            value="nip"
                            checked={values.idType === 'nip'}
                            onChange={handleChange}
                            disabled={emailIsStudent}
                          />
                        </div>
                        {touched.idType && errors.idType && (
                          <div className="text-danger small mt-1">{errors.idType}</div>
                        )}
                        <Form.Text className="text-muted">
                          {emailIsStudent && '⚠️ Email mahasiswa otomatis memilih NIM'}
                        </Form.Text>
                      </Form.Group>

                      {values.idType === 'nim' && (
                        <Form.Group className="mb-3">
                          <Form.Label>NIM (Nomor Induk Mahasiswa) <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="text"
                            name="nim"
                            placeholder="200500123456"
                            value={values.nim}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.nim && errors.nim}
                            maxLength={20}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.nim}
                          </Form.Control.Feedback>
                          <Form.Text className="text-muted">
                            Masukkan NIM Anda (5-20 digit)
                          </Form.Text>
                        </Form.Group>
                      )}

                      {values.idType === 'nip' && (
                        <Form.Group className="mb-3">
                          <Form.Label>NIP (Nomor Induk Pegawai) <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="text"
                            name="nip"
                            placeholder="198012345678901234"
                            value={values.nip}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.nip && errors.nip}
                            maxLength={20}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.nip}
                          </Form.Control.Feedback>
                          <Form.Text className="text-muted">
                            Masukkan NIP Anda (5-20 digit)
                          </Form.Text>
                        </Form.Group>
                      )}

                      <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          placeholder="Minimal 6 karakter"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.password && errors.password}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.password}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>Konfirmasi Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          placeholder="Ketik ulang password"
                          value={values.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.confirmPassword && errors.confirmPassword}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.confirmPassword}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Button
                        variant="primary"
                        type="submit"
                        className="w-100 mb-3"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Mendaftar...' : 'Daftar'}
                      </Button>

                      <div className="text-center">
                        <span className="text-muted">Sudah punya akun? </span>
                        <Link to="/login">Login di sini</Link>
                      </div>
                    </Form>
                    </>
                  );
                }}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
