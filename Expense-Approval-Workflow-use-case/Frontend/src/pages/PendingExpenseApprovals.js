// src/pages/PendingExpenseApprovals.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { doc, getDoc , setDoc } from 'firebase/firestore';
import db from '../config/firebase_config';
import { updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';

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

const BatchList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BatchItem = styled.li`
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  width: 100%;
  text-align: center;
  margin: 1rem 0;
`;

const BatchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BatchTitle = styled.h3`
  margin: 0;
  color: #999;
`;

const Status = styled.span`
  font-weight: bold;
  color: ${props => (props.status === 'Approved' ? 'green' : props.status === 'Denied' ? 'red' : 'orange')};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const TableHeader = styled.th`
  background-color: #00bca5;
  color: white;
  padding: 0.5rem;
`;

const TableRow = styled.tr`
  border-radius: 8px;
  &:nth-child(even) {
    background-color: rgba(51, 51, 51, 0.5);
  }
`;

const TableCell = styled.td`
  padding: 0.5rem;
  text-align: center;
  color: #00bca5;
`;

const Row = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 1rem;
`;

const Buttons = styled.div`
  display: flex;
  gap: 1rem;
`;

const ApproveButton = styled.button`
  background-color: #000;
  color: green;
  border: 1px solid green;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: green;
    color: white;
  }
`;

const DenyButton = styled.button`
  background-color: #000;
  color: red;
  border: 1px solid red;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: red;
    color: white;
  }
`;

const ReviewButton = styled.button`
  background-color: #000;
  color: orange;
  border: 1px solid orange;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: orange;
    color: white;
  }
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
  const batchMap = {};

  rawData.forEach(item => {
    const { username, expenses } = item;

    if (!batchMap[username]) {
      batchMap[username] = {
        batchName: username,
        status: status,
        expenses: []
      };
    }

    batchMap[username].expenses.push({
      category: expenses.expenseCategory,
      subcategory: expenses.expenseSubcategory,
      expensetype: expenses.expenseType,
      department: expenses.department,
      position: expenses.position,
      paymentmethod: expenses.paymentMethod,
      receipt: expenses.receiptOption,
      amount: expenses.amount,
      status: status
    });
  });

  return Object.values(batchMap);
};

const PendingExpenseApprovals = () => {

  const [loading, setLoading] = useState(true); 


  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [data, setData] = useState([]);
  const [view, setView] = useState('pending'); 

  const check_server = async () => {
    const docRef_server = doc(db, 'GenAI Expense Workflow', 'Post_expense');
    const response_server = await getDoc(docRef_server);

    if(response_server.exists()) {
      notifyInfo("Offline!! Server Unavailable.");
      notifyInfo("You may have new submissions that are not up-to-date.");
    }
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    const approver = localStorage.getItem('approver');

    if (!(approver === 'true') || !user) {
      navigate('/');
    } else {
      try {
        const parsedUser = JSON.parse(user);
        setUserName(parsedUser.name || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/');
      } 
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userName) return;

      try {
        setLoading(true);
        const docRef = doc(db, 'GenAI Expense Workflow', 'Approvers');
        const response = await getDoc(docRef);

        if (response.exists()) {
          const data = response.data();
          const userKey = userName.replace(" ", "");
          const pending_exp = data[userKey]?.pending;
          const approved_exp = data[userKey]?.approved;
          const denied_exp = data[userKey]?.denied;

          if (view === 'pending' && pending_exp) {
            const batchInfo = formatData(pending_exp , "Pending");
            check_server();
            setData(batchInfo);
          } else if (view === 'approved' && approved_exp) {
            const batchInfo = formatData(approved_exp , "Approved");
            setData(batchInfo);
          } else if (view === 'denied' && denied_exp) {
            const batchInfo = formatData(denied_exp , "Denied");
            setData(batchInfo);
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
  }, [userName, view]);

  const handleApprove = async (batchName) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'GenAI Expense Workflow', 'Approvers');
      const response = await getDoc(docRef);

      // const docRef_server = doc(db, 'GenAI Expense Workflow', 'Post_expense');
      // const response_server = await getDoc(docRef_server);
  
      // if(response_server.exists()) {
      //   notifyInfo("Offline!! Server unavailable.");
      //   notifyInfo("Try again later.");
      // }
  
      if (response.exists()) {
        const firebase_data = response.data();
        const userKey = userName.replace(" ", "");
        const pendingExpenses = firebase_data[userKey]?.pending;
        const approvedExpenses = firebase_data[userKey]?.approved || [];
        const deniedExpenses = firebase_data[userKey]?.denied || [];


        // Find all matching batches in pendingExpenses
        const batchesToApprove = pendingExpenses.filter(batch => batch.username === batchName);

        // Find all matching batches in deniedExpenses
        const batchesToApproveDenied = deniedExpenses.filter(batch => batch.username === batchName);

      
        if (batchesToApprove.length > 0) { // Check if there are any matching batches in pendingExpenses
          // Iterate through each batch in pendingExpenses and update
          for (const batchToApprove of batchesToApprove) {
              // Update each batch's status
            console.log(batchToApprove);
            console.log("============");
            await updateExpenseStatus(batchToApprove, "Approved");
    
            // Update Firestore
            await updateDoc(docRef, {
                [`${userKey}.pending`]: arrayRemove(batchToApprove),
                [`${userKey}.approved`]: arrayUnion(batchToApprove)
            });
            // await setDoc(docRef, {
            //   [userKey] : {
            //     pending : arrayRemove(batchToApprove)
            //   },
            //   [userKey] : {
            //     approved : arrayUnion(batchToApprove)
            //   },
            // } , {merge : true });
          }
      
          // Update the state locally
          setData(data.filter(batch => batch.batchName !== batchName));
      
          notifySuccess("Expenses approved successfully.");
          console.log(`Batch ${batchName} approved and moved to the approved list`);
        } else if (batchesToApproveDenied.length > 0) { // Check if there are any matching batches in deniedExpenses
            // Iterate through each batch in deniedExpenses and update
            for (const batchToApproveDenied of batchesToApproveDenied) {
              console.log(batchToApproveDenied);
              console.log("============");
              // Update each batch's status
              await updateExpenseStatus(batchToApproveDenied, "Approved");
      
              // Update Firestore
              await updateDoc(docRef, {
                  [`${userKey}.denied`]: arrayRemove(batchToApproveDenied),
                  [`${userKey}.approved`]: arrayUnion(batchToApproveDenied)
              });
              // await setDoc(docRef, {
              //   [userKey] : {
              //     denied : arrayRemove(batchToApproveDenied),
              //   },
              //   [userKey] : {
              //     approved : arrayUnion(batchToApproveDenied)
              //   }
              // }, {merge : true });
            }
        
            // Update the state locally
            setData(data.filter(batch => batch.batchName !== batchName));
            notifySuccess("Expenses approved successfully.");
            console.log(`Batch ${batchName} approved and moved to the approved list`);
        } else {
            console.error(`Batch ${batchName} not found in pending or denied list`);
        }
      
      } else {
        notifyError("An error occurred. Please try again later.");
        console.log('No such document!');
      }
    } catch (error) {
      notifyError("Error approving expense.");
      console.error('Error approving batch:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleDeny = async (batchName) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'GenAI Expense Workflow', 'Approvers');
      const response = await getDoc(docRef);

      // const docRef_server = doc(db, 'GenAI Expense Workflow', 'Post_expense');
      // const response_server = await getDoc(docRef_server);
  
      // if(response_server.exists()) {
      //   notifyInfo("Offline!! Server unavailable.");
      //   notifyInfo("Try again later.");
      // }
  
      if (response.exists()) {
        const firebase_data = response.data();
        const userKey = userName.replace(" ", "");
        const pendingExpenses = firebase_data[userKey]?.pending;
        const approvedExpenses = firebase_data[userKey]?.approved || [];
        const deniedExpenses = firebase_data[userKey]?.denied || [];
        
        // Find the batch to approve
        const batchesToDeny = pendingExpenses.filter(batch => batch.username === batchName);
        const batchesToDeny_approved = approvedExpenses.filter(batch => batch.username === batchName);

        if (batchesToDeny.length > 0) {

          for (const batchToDeny of batchesToDeny) {
            // Update each batch's status
            await updateExpenseStatus(batchToDeny , "Denied");
            await updateDoc(docRef, {
              [`${userKey}.pending`]: arrayRemove(batchToDeny),
              [`${userKey}.denied`]: arrayUnion(batchToDeny)
            });
            // await setDoc(docRef, {
            //   [userKey] : {
            //     pending : arrayRemove(batchToDeny),
            //   },
            //   [userKey] : {
            //     denied : arrayUnion(batchToDeny)
            //   }
            // } , { merge : true });
            
          }

          // Update the state locally
          setData(data.filter(batch => batch.batchName !== batchName));

          notifySuccess("Expenses denied successfully.");
          console.log(`Batch ${batchName} denied and moved to the denied list`);
        } else if(batchesToDeny_approved.length > 0) {

          for (const batchToDeny_approved of batchesToDeny_approved) {
            updateExpenseStatus(batchToDeny_approved , "Denied");
            await updateDoc(docRef, {
              [`${userKey}.approved`]: arrayRemove(batchToDeny_approved),
              [`${userKey}.denied`]: arrayUnion(batchToDeny_approved)
            });
            // await setDoc(docRef, {
            //   [userKey] : {
            //     approved : arrayRemove(batchToDeny_approved),
            //   },
            //   [userKey] : {
            //     denied : arrayUnion(batchToDeny_approved)
            //   }
            // } , {merge: true} );
          }
  
          // Update the state locally
          setData(data.filter(batch => batch.batchName !== batchName));

          notifySuccess("Expenses denied successfully.");
        } else {
          notifyError("An error occurred. Please try again later.");
          console.error(`Batch ${batchName} not found in pending list`);
        }
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      notifyError("Error dening expense.");
      console.error('Error dening batch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (batchName) => {
    setData(data.map(batch => 
      batch.batchName === batchName ? { ...batch, status: 'Pending' } : batch
    ));
    console.log(`Batch ${batchName} under review`);
  };


  // Function to update expense status
  const updateExpenseStatus = async (batch_to_approve, newStatus) => {
    const split_up = (batch_to_approve.username).split('--');
    const username = split_up[1];
    const batchKey = split_up[0] + "--" + split_up[2] + "--" + split_up[3];

    const expenseToUpdate = batch_to_approve.expenses;

    // Reference to the Firestore document
    const docRef = doc(db, 'GenAI Expense Workflow', 'Employees');
    const response = await getDoc(docRef);
    let data = response.data();
    const userKey = username.replace('@', '_');
    let userExpenses = data[userKey]?.xpenses;

    if (!userExpenses) {
        console.error("User expenses not found.");
        return;
    }

    const { pending, approved } = userExpenses;

    // Helper function to update expense status
    const updateStatusInBatch = (batch, batchKey) => {
        const batchData = batch[batchKey];
        if (!batchData) return false;
        
        let found = false;
        batchData.expenses = batchData.expenses.map(expense => {
            if (
                expense.expenseCategory === expenseToUpdate.expenseCategory &&
                expense.amount === expenseToUpdate.amount &&
                expense.paymentMethod === expenseToUpdate.paymentMethod &&
                expense.position === expenseToUpdate.position &&
                expense.receiptOption === expenseToUpdate.receiptOption &&
                expense.expenseType === expenseToUpdate.expenseType &&
                expense.expenseSubcategory === expenseToUpdate.expenseSubcategory &&
                expense.department === expenseToUpdate.department
            ) {
                found = true;
                return { ...expense, status: newStatus };
            }
            return expense;
        });
        return found;
    };

    // Update status in the appropriate batch
    let statusUpdated = false;
    if (updateStatusInBatch(pending, batchKey)) {
        statusUpdated = true;
    } else if (updateStatusInBatch(approved, batchKey)) {
        statusUpdated = true;
    } else {
        console.error("Expense item not found in either list.");
        return;
    }

    // Update Firestore document with the new data
    if (statusUpdated) {
        try {
            await updateDoc(docRef, {
                [`${userKey}.xpenses`]: {
                    pending,
                    approved
                }
            });
            // await setDoc(docRef, {
            //   [userKey] : {
            //     xpenses : {
            //       pending : [pending],
            //       approved : [approved]
            //     }
            //   }
            // } , {merge: true});
            console.log("Expense status updated successfully.");
        } catch (error) {
            console.error("Error updating expense status:", error);
        }
    }

    // Fetch the latest data after updating status
    const updatedResponse = await getDoc(docRef);
    const updatedData = updatedResponse.data();
    const updatedUserExpenses = updatedData[userKey]?.xpenses;

    const { pending: updatedPending, approved: updatedApproved } = updatedUserExpenses;

    // Function to check if all expenses in a batch have a specific status
    const allExpensesHaveStatus = (batch, status) => {
        const batchData = batch[batchKey];
        if (!batchData) return false; // Batch not found
        return batchData.expenses.every(expense => expense.status === status);
    };

    // Logic to move batches if all expenses match the status
    if (allExpensesHaveStatus(updatedPending, "Approved")) {
        // Move from pending to approved
        const batchToMove = { ...updatedPending[batchKey] };
        delete updatedPending[batchKey];
        updatedApproved[batchKey] = batchToMove;
    } else if (allExpensesHaveStatus(updatedApproved, "Pending")) {
        // Move from approved to pending
        const batchToMove = { ...updatedApproved[batchKey] };
        delete updatedApproved[batchKey];
        updatedPending[batchKey] = batchToMove;
    } else if (newStatus === "Denied" && updatedApproved[batchKey]) {
      // If any expense is denied in an approved batch, move the entire batch back to pending
      const batchToMove = { ...updatedApproved[batchKey] };
      delete updatedApproved[batchKey];
      updatedPending[batchKey] = batchToMove;
  }

    // Update Firestore document with the moved batch
    try {
        await updateDoc(docRef, {
            [`${userKey}.xpenses`]: {
                pending: updatedPending,
                approved: updatedApproved
            }
        });
        // await setDoc(docRef, {
        //   [userKey] : {
        //     xpenses : {
        //       pending : [updatedPending],
        //       approved : [updatedApproved]
        //     }
        //   }
        // } , {merge: true});
        console.log("Expense batch position updated successfully.");
    } catch (error) {
        console.error("Error updating expense batch position:", error);
    }
  };

  if(loading) {
    return <LoadingScreen />
  }

  return (
    <Container>
      <BackButton />
      <Title>Expense Approvals</Title>
      <div>
        <ToggleButton active={view === 'pending'} onClick={() => setView('pending')}>
          Pending
        </ToggleButton>
        <ToggleButton active={view === 'denied'} onClick={() => setView('denied')}>
          Denied
        </ToggleButton>
        <ToggleButton active={view === 'approved'} onClick={() => setView('approved')}>
          Approved
        </ToggleButton>
      </div>
      <BatchList>
        {data.length === 0 ? (
          <NoExpensesMessage>No {view} Expense</NoExpensesMessage>
        ) : (data.map((batch) => (
          <BatchItem key={batch.batchName}>
            <BatchHeader>
              <BatchTitle>{batch.batchName}</BatchTitle>
              <Status status={batch.status}>{batch.status}</Status>
            </BatchHeader>
              <ScrollableContainer>
                <Table>
                <thead>
                  <TableRow>
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
                  {batch.expenses.map((expense, index) => (
                    <TableRow key={index}>
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
              </Table>
            </ScrollableContainer>
            {batch.status === 'Pending' && (
              <Row>
                <Buttons>
                  {view !== 'approved' && (<ApproveButton onClick={() => handleApprove(batch.batchName)}>Approve</ApproveButton>)}
                  {view !== 'denied' && (<DenyButton onClick={() => handleDeny(batch.batchName)}>Deny</DenyButton>)}
                </Buttons>
              </Row>
            )}
            {batch.status !== 'Pending' && (
              <Row>
                <ReviewButton onClick={() => handleReview(batch.batchName)}>Review</ReviewButton>
              </Row>
            )}
          </BatchItem>
        )))}
      </BatchList>
    </Container>
  );
};

export default PendingExpenseApprovals;
