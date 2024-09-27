import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaEye } from 'react-icons/fa';
import { FaCheckCircle, FaTimesCircle , FaArrowLeft , FaBan } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import db from '../config/firebase_config';

import LoadingScreen from './LoadingScreen';
import { notifySuccess, notifyError , notifyInfo } from './notifications';

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

const Title = styled.h1`
  font-size: 2rem;
  margin-top: 1rem;
  margin-bottom: 2rem;
  color: #00bca5;
`;

const ToggleButton = styled.button`
  padding: 0.5rem 1rem;
  margin: 0.5rem;
  font-size: 1rem;
  color: ${props => (props.active ? 'rgba(0, 0, 0, 0.6)' : '#00bca5')};
  background-color: ${props => (props.active ? '#00bca5' : 'rgba(0, 0, 0, 0.6)')};
  border-radius: 4px;
  cursor: pointer;

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

const BatchContainer = styled.div`
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  width: 90%;
  max-width: 1000px;
  text-align: center;
  margin: 1rem 0;
`;

const BatchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BatchName = styled.h3`
  margin: 0;
  color: #999;
`;

const Status = styled.span`
  color: ${props => (props.status === 'Approved' ? 'green' : 'orange')};
`;

const ExpenseDetails = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const TableHeader = styled.th`
  background-color: #00bca5; /* Primary color */
  color: white;
  padding: 0.5rem;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: rgba(51, 51, 51, 0.5);
  }
`;

const TableCell = styled.td`
  padding: 0.5rem;
  text-align: center;
  color: #00bca5;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #6200ea;
  cursor: pointer;
  font-size: 1.2rem;

  &:hover {
    color: #3700b3;
  }
`;

const StatusSymbol = styled.span`
  font-size: 1.2rem;
  color: ${props => (props.status === 'Approved' ? 'green' : 'orange')};
`;

const NoExpensesMessage = styled.p`
  font-size: 1.2rem;
  padding: 100px;
  color: #666;
  text-align: center;
  margin: 2rem 0;

`;

const ScrollableContainer = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  margin-top: 1rem;
`;

const formatData = (rawData , status) => {
  return Object.keys(rawData).map(key => {
    const batch = rawData[key];
    return {
      batchName: batch.batchname,
      status: status,
      date: `${batch.startdate} to ${batch.enddate}`,
      expenses: batch.expenses.map(expense => ({
        category: expense.expenseCategory,
        subcategory: expense.expenseSubcategory,
        amount: expense.amount,
        expensetype: expense.expenseType,
        department: expense.department,
        paymentmethod: expense.paymentMethod,
        receipt: expense.receiptOption,
        position: expense.position,
        status: expense.status
      }))
    };
  });
};

const ViewExpenseStatus = () => {

  const [loading, setLoading] = useState(true); 

  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [expandedBatchIndex, setExpandedBatchIndex] = useState(null);
  const [username, setUsername] = useState('');
  const [view, setView] = useState('pending'); 

  const check_server = async () => {
    const docRef_server = doc(db, 'GenAI Expense Workflow', 'Post_expense');
    const response_server = await getDoc(docRef_server);

    if(response_server.exists()) {
      notifyInfo("Offline!! Server unavailable.");
      notifyInfo("Maybe your status is not up-to-date.");
    }
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    const approver = localStorage.getItem('approver');

    if (!user || approver === 'true') {
      navigate('/');
    } else {
      try {
        const parsedUser = JSON.parse(user);
        setUsername(parsedUser.password || ''); // Use default empty string if username is undefined
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!username) return;

      try {
        const docRef = doc(db, 'GenAI Expense Workflow', 'Employees');
        const response = await getDoc(docRef);

        if (response.exists()) {
          const data = response.data();
          const userKey = username.replace('@', '_');
          const userExpenses = data[userKey]?.xpenses;

          if (view === 'pending' && userExpenses?.pending) {
            const batchInfo = formatData(userExpenses.pending , 'Pending');
            setData(batchInfo);
            check_server();
          } else if (view === 'approved' && userExpenses?.approved) {
            const batchInfo = formatData(userExpenses.approved , 'Approved');
            setData(batchInfo);
            check_server();
          } else {
            setData([]);
            console.log('No expenses found for the selected view!');
          }
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, view]);

  const handleToggleDetails = (index) => {
    setExpandedBatchIndex(expandedBatchIndex === index ? null : index);
  };



  if(loading) {
    return <LoadingScreen />
  }

  return (
    <Container>
      <BackButton />
      <Title>View Expense Status</Title>
      <div>
        <ToggleButton active={view === 'pending'} onClick={() => setView('pending')}>
          Pending
        </ToggleButton>
        <ToggleButton active={view === 'approved'} onClick={() => setView('approved')}>
          Approved
        </ToggleButton>
      </div>
  
      {data.length === 0 ? (
        <NoExpensesMessage>No {view} Expense</NoExpensesMessage>
      ) : (
        data.map((batch, index) => (
          <BatchContainer key={index}>
            <BatchHeader>
              <BatchName>{batch.batchName}</BatchName>
              <Status status={batch.status}>{batch.status}</Status>
              <BatchName>{batch.date}</BatchName>
              <IconButton onClick={() => handleToggleDetails(index)}>
                <FaEye />
              </IconButton>
            </BatchHeader>
            {expandedBatchIndex === index && (
              <ScrollableContainer><ExpenseDetails>
                <thead>
                  <TableRow>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Category</TableHeader>
                    <TableHeader>Subcategory</TableHeader>
                    <TableHeader>Type</TableHeader>
                    <TableHeader>Department</TableHeader>
                    <TableHeader>Position</TableHeader>
                    <TableHeader>Payment Method</TableHeader>
                    <TableHeader>Receipt</TableHeader>
                    <TableHeader>Amount</TableHeader>
                  </TableRow>
                </thead>
                <tbody>
                  {batch.expenses.map((expense, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <StatusSymbol status={expense.status}>
                          {expense.status === 'Approved' ? <FaCheckCircle /> : expense.status === 'Denied' ? <FaBan /> : <FaTimesCircle />}
                        </StatusSymbol>
                      </TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>{expense.subcategory}</TableCell>
                      <TableCell>{expense.expensetype}</TableCell>
                      <TableCell>{expense.department}</TableCell>
                      <TableCell>{expense.position}</TableCell>
                      <TableCell>{expense.paymentmethod}</TableCell>
                      <TableCell>{expense.receipt}</TableCell>
                      <TableCell>{expense.amount}</TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </ExpenseDetails></ScrollableContainer>
            )}
          </BatchContainer>
        ))
      )}
    </Container>
  );  

};

export default ViewExpenseStatus;
