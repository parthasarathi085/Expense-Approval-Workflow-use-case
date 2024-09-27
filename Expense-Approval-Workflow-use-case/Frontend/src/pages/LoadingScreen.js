import React from 'react';
import './LoadingScreen.css';
import logo from '../images/XpFlowLogo.png';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <img
        src={logo}
        alt="Loading..."
        className="loading-image"
      />
    </div>
  );
};

export default LoadingScreen;
