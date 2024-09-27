import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa';

// Styled components
const Header = styled.header`
  width: 100%;
  background: rgba(0, 0, 0, 0.9);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  color: #00bca5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0px 5px;
  

  @media (max-width: 768px) {
    position: relative;
    padding: 5px 0px 5px;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #00bca5;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-right: auto;
  
  &:hover {
    color: #00e5bf;
  }

  &:focus {
    outline: none;
  }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin: 0;
  font-weight: 700;
  padding: 5px 10px;
`;

const CommonHeader = ({ title }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <Header>
      <BackButton onClick={handleBack}>
        <FaArrowLeft />
      </BackButton>
      <Title>{title}</Title>
    </Header>
  );
};

export default CommonHeader;
