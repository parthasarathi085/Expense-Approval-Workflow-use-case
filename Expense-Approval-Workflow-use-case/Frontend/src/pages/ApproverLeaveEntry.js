import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { doc, getDoc , setDoc } from 'firebase/firestore';
import db from '../config/firebase_config';

import LoadingScreen from './LoadingScreen';
import { notifySuccess, notifyError } from './notifications';

import BackButton from './BackButton';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  overflow-y: auto;
  padding: 1rem;
  box-sizing: border-box;
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

const Button = styled.button`
  width: 100%;
  padding: 0.5rem;
  background-color: ${props => props.active ? '#00bca5' : '#dc3545'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background-color: ${props => props.active ? '#00a59f' : '#c82333'};
  }
`;



const ApproverLeaveEntry = () => {
  const [loading, setLoading] = useState(true); 
  const [isApproved, setIsApproved] = useState(false);
  const navigate = useNavigate();

  const [name, setName] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    const user = localStorage.getItem('user');
    const approver = localStorage.getItem('approver');
    console.log(user);

    if (!(approver === 'true') || !user) {
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

  useEffect(() => {

    const fetchLeaveStatus = async () => {
      try {
        const docRef = doc(db, 'GenAI Expense Workflow', 'Approvers_leave');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsApproved(data[name] || false);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error("Error fetching leave status: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveStatus();
  });

  const handleToggle = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'GenAI Expense Workflow', 'Approvers_leave');
      await setDoc(docRef, {
        [name]: !isApproved,
      }, { merge: true });
      notifySuccess("Leave status updated successfully");
      setIsApproved(!isApproved);
    } catch (error) {
      notifyError("Error updating leave status.");
      console.error("Error updating leave status: ", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Container>
      <BackButton />
      <FormContainer>
        <Title>Leave Entry</Title>
        <Button onClick={handleToggle} active={isApproved}>
          {isApproved ? 'Turn Leave Off' : 'Turn Leave On'}
        </Button>
      </FormContainer>
    </Container>
  );
};

export default ApproverLeaveEntry;
