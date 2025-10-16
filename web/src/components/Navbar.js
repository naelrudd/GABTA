import React from 'react';
import { Navbar as BSNavbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isDosen = user?.role === 'dosen';
  const isMahasiswa = user?.role === 'mahasiswa';

  return (
    <BSNavbar bg="primary" variant="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container>
        <LinkContainer to={isMahasiswa ? "/scan" : "/dashboard"}>
          <BSNavbar.Brand className="fw-bold">
            <span className="fs-4">📚 GABTA</span>
            <Badge bg="light" text="dark" className="ms-2">v2.0</Badge>
          </BSNavbar.Brand>
        </LinkContainer>
        
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isMahasiswa && (
              <>
                <LinkContainer to="/scan">
                  <Nav.Link><i className="bi bi-qr-code-scan"></i> Scan QR</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/profile">
                  <Nav.Link><i className="bi bi-person-circle"></i> Profil</Nav.Link>
                </LinkContainer>
              </>
            )}
            
            {isDosen && (
              <>
                <LinkContainer to="/dashboard">
                  <Nav.Link><i className="bi bi-speedometer2"></i> Dashboard</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/create-session">
                  <Nav.Link><i className="bi bi-plus-circle"></i> Buat Sesi</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/classes">
                  <Nav.Link><i className="bi bi-journal-text"></i> Kelola Kelas</Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
          
          <Nav>
            <NavDropdown 
              title={
                <span>
                  <i className="bi bi-person-fill"></i> {user?.name || user?.email}
                </span>
              } 
              id="user-nav-dropdown"
              align="end"
            >
              <NavDropdown.Item disabled>
                <small className="text-muted">
                  {isDosen ? '👨‍🏫 Dosen' : '👨‍🎓 Mahasiswa'}
                </small>
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <LinkContainer to="/profile">
                <NavDropdown.Item>
                  <i className="bi bi-person-circle"></i> Profil Saya
                </NavDropdown.Item>
              </LinkContainer>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="text-danger">
                <i className="bi bi-box-arrow-right"></i> Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;