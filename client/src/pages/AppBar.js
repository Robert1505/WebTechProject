import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {jwtDecode} from 'jwt-decode';
import { Navbar, Nav, Button, NavDropdown } from 'react-bootstrap';

const AppBar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('');

  const onLogOut = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        setIsLoggedIn(true);
        const data = jwtDecode(token);
        if (data.user.type) {
          setRole(data.user.type);
        } else setIsLoggedIn(false)
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
      }
    } else setIsLoggedIn(false);
  }, []);

  return (
    <Navbar bg="primary" expand="lg" variant="dark">
      <Navbar.Brand className="mx-3" href="/">
        My university
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="navbarNav" />
      <Navbar.Collapse id="navbarNav" className='mx-3'>
        <Nav className="ml-auto">
          {isLoggedIn && role != 'admin'&& role != 'rector' && (
            <Nav.Link href="/" className="my-3">
              Home
            </Nav.Link>
          )}
         {isLoggedIn && role === 'rector' && (
            <Nav.Link href="/studenti-statistici" className="my-3 bg-primary primary">
              Statistici
            </Nav.Link>
          )}
           {!isLoggedIn && (
            <Nav.Link href="/login" className="ml-lg-0 ml-3">
              <Button variant="outline-info">Log in</Button>
            </Nav.Link>
          )}
          {isLoggedIn && (
            <Nav.Link onClick={onLogOut} className="my-2">
              <Button variant="outline-danger">Log out</Button>
            </Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default AppBar;