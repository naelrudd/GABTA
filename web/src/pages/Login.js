import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
});

const Login = () => {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  
  // Get redirect path from navigation state (for /scan redirect)
  const returnTo = location.state?.returnTo || location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoginError(null);
      setNeedsVerification(false);
      await login(values.email, values.password);
      navigate(returnTo); // Redirect to original destination
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        setNeedsVerification(true);
        setLoginError('Email Anda belum diverifikasi. Silakan cek inbox email Anda.');
      } else {
        setLoginError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center mb-4">Login to GABTA</Card.Title>
              
              {(loginError || error) && (
                <Alert variant={needsVerification ? 'warning' : 'danger'}>
                  {loginError || error}
                  {needsVerification && (
                    <div className="mt-2">
                      <Link to="/resend-verification" className="alert-link">
                        Kirim ulang email verifikasi
                      </Link>
                    </div>
                  )}
                </Alert>
              )}
              
              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={loginSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <Field 
                        type="email" 
                        name="email" 
                        className="form-control" 
                        placeholder="Enter your email" 
                      />
                      <ErrorMessage 
                        name="email" 
                        component="div" 
                        className="text-danger" 
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="password" className="form-label">Password</label>
                      <Field 
                        type="password" 
                        name="password" 
                        className="form-control" 
                        placeholder="Enter your password" 
                      />
                      <ErrorMessage 
                        name="password" 
                        component="div" 
                        className="text-danger" 
                      />
                    </div>

                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Logging in...' : 'Login'}
                    </Button>
                  </Form>
                )}
              </Formik>
              
              <div className="text-center mt-3">
                <p>
                  Don't have an account? <Link to="/register" state={{ returnTo }}>Register</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;