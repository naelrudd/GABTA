import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [status, setStatus] = useState('verifying'); // verifying, success, error, alreadyVerified
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Token verifikasi tidak ditemukan. Silakan gunakan link yang benar dari email Anda.');
        return;
      }

      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);

        if (response.data.alreadyVerified) {
          setStatus('alreadyVerified');
          setMessage('Email Anda sudah terverifikasi sebelumnya. Silakan login.');
        } else if (response.data.verified) {
          setStatus('success');
          setMessage('Email berhasil diverifikasi! Anda akan otomatis login...');

          // Auto-login
          const { accessToken, user } = response.data;
          localStorage.setItem('token', accessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          setUser(user);

          // Redirect to profile after 2 seconds
          setTimeout(() => {
            navigate('/profile');
          }, 2000);
        }
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.message ||
          'Verifikasi gagal. Token mungkin tidak valid atau sudah kedaluwarsa.'
        );
      }
    };

    verifyEmail();
  }, [searchParams, navigate, setUser]);

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow text-center">
            <Card.Body className="p-5">
              {status === 'verifying' && (
                <>
                  <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem' }} />
                  <h3 className="mt-4">Memverifikasi Email...</h3>
                  <p className="text-muted">Mohon tunggu sebentar</p>
                </>
              )}

              {status === 'success' && (
                <>
                  <div style={{ fontSize: '5rem' }}>✅</div>
                  <h3 className="mt-3 text-success">Email Terverifikasi!</h3>
                  <Alert variant="success" className="mt-3">
                    {message}
                  </Alert>
                  <div className="mt-3">
                    <Spinner animation="border" size="sm" className="me-2" />
                    <span>Mengalihkan ke halaman profil...</span>
                  </div>
                </>
              )}

              {status === 'alreadyVerified' && (
                <>
                  <div style={{ fontSize: '5rem' }}>ℹ️</div>
                  <h3 className="mt-3 text-info">Sudah Terverifikasi</h3>
                  <Alert variant="info" className="mt-3">
                    {message}
                  </Alert>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/login')}
                    className="mt-3"
                  >
                    Login Sekarang
                  </Button>
                </>
              )}

              {status === 'error' && (
                <>
                  <div style={{ fontSize: '5rem' }}>❌</div>
                  <h3 className="mt-3 text-danger">Verifikasi Gagal</h3>
                  <Alert variant="danger" className="mt-3">
                    {message}
                  </Alert>
                  <div className="d-grid gap-2 mt-4">
                    <Button
                      variant="outline-primary"
                      onClick={() => navigate('/resend-verification')}
                    >
                      Kirim Ulang Email Verifikasi
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => navigate('/login')}
                    >
                      Kembali ke Login
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VerifyEmail;
