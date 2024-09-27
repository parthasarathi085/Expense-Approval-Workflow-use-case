import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import db from '../config/firebase_config';
import { doc, getDoc } from 'firebase/firestore';

import LoadingScreen from './LoadingScreen';
import { notifySuccess, notifyError } from './notifications';

import logo from '../images/XpFlowLogo.png'; 

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(15px);
`;

const FormContainer = styled.div`
  background: rgba(0, 0, 0, 0.8);
  padding: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  width: 300px;
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
  color: #00bca5;
`;

const ToggleMenu = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 1.5rem;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: ${props => (props.active ? '#00bca5' : '#aaa')};
  border-bottom: ${props => (props.active ? '2px solid #00bca5' : 'none')};

  &:focus {
    outline: none;
  }
`;

const Icon = styled.img`
  height: 100px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin: 0.5rem 0;
  border: 1px solid #333;
  border-radius: 4px;
  box-sizing: border-box; /* Ensure padding and border are included in width */
  background: #222;
  color: #fff;

  &::placeholder {
    color: #aaa;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.5rem;
  background-color: #00bca5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background-color: #00a59f;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.875rem;
  margin: 0 0 0.7rem;
`;

const SigninSignup = () => {
  const [loading, setLoading] = useState(true); 
  const [isSignin, setIsSignin] = useState(true);

  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');

  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = localStorage.getItem('user');
        const approver = localStorage.getItem('approver');
        if (user && (approver === 'true')) {
          navigate('/approver-dashboard');
        } else if (user) {
          navigate('/dashboard');
        }
      } finally {
        setLoading(false); 
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSignin = async () => {
    setLoading(true); 
    let validationErrors = {};
    if (!signinEmail) {
      validationErrors.signinEmail = 'Invalid Username';
    }
    if (!signinPassword) {
      validationErrors.signinPassword = 'Password must';
    }
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        if (signinEmail.startsWith("matops")) {
          const docRef = doc(db, 'GenAI Expense Workflow', 'Employees');
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const user = data[signinEmail];
            if (user && user.password === signinPassword) {
              localStorage.setItem('user', JSON.stringify(user));
              localStorage.setItem('approver', false);
              notifySuccess("Login successful. Welcome back!");
              navigate('/dashboard');
            } else {
              notifyError('Invalid username or password');
              setErrors({ signinEmail: 'Invalid username or password' });
            }
          } else {
            notifyError('Invalid username or password');
            setErrors({ signinEmail: 'No such user found' });
          }

        } else {
          const docRef_approver = doc(db, 'GenAI Expense Workflow', 'Approvers');
          const docSnap_approver = await getDoc(docRef_approver);

          if (docSnap_approver.exists()) {
            const data = docSnap_approver.data();
            const user = data[signinEmail];
            if (user && user.password === signinPassword) {
              localStorage.setItem('user', JSON.stringify(user));
              localStorage.setItem('approver', true);
              notifySuccess("Login successful. Welcome back!");
              navigate('/approver-dashboard');
            } else {
              notifyError('Invalid username or password');
              setErrors({ signinEmail: 'Invalid username or password' });
            }
          } else {
            notifyError('Invalid username or password');
            setErrors({ signinEmail: 'No such user found' });
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        notifyError("Login failed. Please try again.");
        setErrors({ signinEmail: 'Error fetching user information' });
      } finally {
        setLoading(false); 
      }
    } else {
      notifyError("Required fields are missing.");
      setLoading(false);
    }
  };

  const handleSignup = () => {
    let validationErrors = {};
    if (signupUsername.length < 8) {
      validationErrors.signupUsername = 'Username must be at least 8 characters';
    }
    if (signupPassword.length < 8) {
      validationErrors.signupPassword = 'Password must be at least 8 characters';
    }
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      console.log('Signup Username:', signupUsername);
      console.log('Signup Email:', signupEmail);
      console.log('Signup Password:', signupPassword);
      // Handle Signup Logic
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Container>
      <FormContainer>
        {/* <ToggleMenu>
          <ToggleButton active={isSignin} onClick={() => setIsSignin(true)}>
            Sign In
          </ToggleButton>
          <ToggleButton active={!isSignin} onClick={() => setIsSignin(false)}>
            Sign Up
          </ToggleButton>
        </ToggleMenu> */}
        {isSignin ? (
          <>
            <Icon src={logo} alt="Sign In Icon" />
            <Title>Sign In</Title>
            <Input 
              type="text" 
              placeholder="Username" 
              value={signinEmail} 
              onChange={(e) => setSigninEmail(e.target.value)} 
            />
            {errors.signinEmail && <ErrorMessage>{errors.signinEmail}</ErrorMessage>}
            <Input 
              type="password" 
              placeholder="Password" 
              value={signinPassword} 
              onChange={(e) => setSigninPassword(e.target.value)} 
            />
            {errors.signinPassword && <ErrorMessage>{errors.signinPassword}</ErrorMessage>}
            <Button onClick={handleSignin}>Sign In</Button>
          </>
        ) : (
          <>
            <Title>Sign Up</Title>
            <Input 
              type="text" 
              placeholder="Username" 
              value={signupUsername} 
              onChange={(e) => setSignupUsername(e.target.value)} 
            />
            {errors.signupUsername && <ErrorMessage>{errors.signupUsername}</ErrorMessage>}
            <Input 
              type="email" 
              placeholder="Email" 
              value={signupEmail} 
              onChange={(e) => setSignupEmail(e.target.value)} 
            />
            {errors.signupEmail && <ErrorMessage>{errors.signupEmail}</ErrorMessage>}
            <Input 
              type="password" 
              placeholder="Password" 
              value={signupPassword} 
              onChange={(e) => setSignupPassword(e.target.value)} 
            />
            {errors.signupPassword && <ErrorMessage>{errors.signupPassword}</ErrorMessage>}
            <Button onClick={handleSignup}>Sign Up</Button>
          </>
        )}
      </FormContainer>
    </Container>
  );
};

export default SigninSignup;
