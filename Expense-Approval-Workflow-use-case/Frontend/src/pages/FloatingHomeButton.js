import React from 'react';
import styled from 'styled-components';
import { FaHome } from 'react-icons/fa';

const Button = styled.button`
  position: fixed;
  bottom: 20px;
  left: 20px;
  background-color: black;
  color: #00bca5;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), 0 0 10px rgba(0, 188, 165, 0.8); /* Glowing effect */
  cursor: pointer;
  font-size: 1.5rem;
  transition: box-shadow 0.3s ease-in-out;

  &:hover {
    background-color: black;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 188, 165, 0.8); /* Enhanced glow on hover */
  }
`;

const FloatingHomeButton = () => {
  const handleClick = () => {
    window.open('https://matops-home.web.app', '_blank');
  };

  return (
    <Button onClick={handleClick}>
      <FaHome />
    </Button>
  );
};

export default FloatingHomeButton;
