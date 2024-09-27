import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaInfoCircle, FaSignOutAlt, FaBars } from 'react-icons/fa';
import LoadingScreen from './LoadingScreen';
import { notifySuccess, notifyError } from './notifications';

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(15px);
`;

const Header = styled.header`
  width: 100%;
  background: rgba(0, 0, 0, 0.9);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  color: #00bca5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px 5px;

  @media (max-width: 768px) {
    position: relative;
    padding: 5px 10px 5px;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 1.8rem;
  margin: 0;
  font-weight: 700;
  padding: 5px 10px 5px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    padding: 5px 10px 5px;
  }
`;

const NavLinks = styled.nav`
  display: flex;
  gap: 1.5rem;
  padding: 5px 10px 5px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.button`
  background: none;
  border: none;
  color: #00bca5;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    text-decoration: underline;
    color: #00e5bf;
  }

  &:focus {
    outline: none;
  }
`;

const MenuIcon = styled.div`
  display: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px 10px 5px;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileMenu = styled.div`
  position: absolute;
  top: 60px;
  right: 15px;
  background: rgba(0, 0, 0, 0.9);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: ${props => (props.open ? 'block' : 'none')};
  z-index: 1000;
`;

const MobileNavLink = styled.button`
  background: none;
  border: none;
  color: #00bca5;
  font-size: 1rem;
  cursor: pointer;
  display: block;
  margin-bottom: 1rem;

  &:hover {
    text-decoration: underline;
    color: #00e5bf;
  }

  &:focus {
    outline: none;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
  padding: 2rem;
  box-sizing: border-box;
`;

const Button = styled.button`
  width: 250px;
  padding: 1rem;
  margin: 1rem 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: #00bca5;
  border: 2px solid #00bca5;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 500;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    background-color: #00bca5;
    color: black;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
  }
`;

// Dashboard component
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    const approver = localStorage.getItem('approver');

    if (!user || approver === 'true') {
      navigate('/');
    } else {
      try {
        const parsedUser = JSON.parse(user);
        setName(parsedUser.name || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
  }, [navigate]);

  const navigateToSubmitExpense = () => {
    navigate('/submit-expense');
  };

  const navigateToViewExpenseStatus = () => {
    navigate('/view-expense-status');
  };

  const handleSignOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('approver');
    notifySuccess("You have been logged out successfully.");
    navigate('/');
  };

  const handleProfileView = () => {
    console.log('View Profile');
  };

  const handleAbout = () => {
    console.log('About');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Container>
      <Header>
        <HeaderTitle>Expense Management Dashboard</HeaderTitle>
        <NavLinks>
          <NavLink onClick={handleProfileView}>
            <FaUser /> {name}
          </NavLink>
          <NavLink onClick={handleSignOut}>
            <FaSignOutAlt /> Sign Out
          </NavLink>
        </NavLinks>
        <MenuIcon onClick={toggleMenu}>
          <FaBars />
        </MenuIcon>
        <MobileMenu open={menuOpen}>
          <MobileNavLink onClick={handleProfileView}>
            <FaUser /> {name}
          </MobileNavLink>
          <MobileNavLink onClick={handleSignOut}>
            <FaSignOutAlt /> Sign Out
          </MobileNavLink>
        </MobileMenu>
      </Header>
      <MainContent>
        <Button onClick={navigateToSubmitExpense}>Submit Expense Details</Button>
        <Button onClick={navigateToViewExpenseStatus}>View Submitted Expense Status</Button>
      </MainContent>
    </Container>
  );
};

export default Dashboard;
