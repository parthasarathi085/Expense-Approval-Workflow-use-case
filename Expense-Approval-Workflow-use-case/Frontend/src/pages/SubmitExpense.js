import React, { useState , useEffect } from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrashAlt , FaArrowLeft } from 'react-icons/fa';
import { doc, setDoc , getDoc } from 'firebase/firestore';
import db from '../config/firebase_config';
import { useNavigate } from 'react-router-dom';

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

const FormContainer = styled.div`
  background: rgba(0, 0, 0, 0.8);
  padding: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  width: 90%;
  text-align: center;
  margin: 1rem 0;
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
  color: #00bca5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const sharedInputStyles = `
  width: 100%;
  padding: 0.5rem;
  margin: 0.5rem 0;
  border: 1px solid #333;
  border-radius: 4px;
  box-sizing: border-box;
  background: #222;
  color: #fff;

  &::placeholder {
    color: #aaa;
  }
`;

const Select = styled.select`
  ${sharedInputStyles}
`;

const Input = styled.input`
  ${sharedInputStyles}
`;

const Textarea = styled.textarea`
  ${sharedInputStyles}
`;

const Button = styled.button`
  width: 100%;
  padding: 0.5rem;
  background-color: ${props => props.red ? 'rgba(51, 51, 51, 0.7)' : '#00bca5'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background-color: ${props => props.red ? 'rgba(51, 51, 51, 1.0)' : '#00a59f'};
  }
`;


const ErrorMessage = styled.p`
  color: red;
  font-size: 0.875rem;
  margin: 0 0 0.7rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const TableHeader = styled.th`
  background-color: #00bca5; /* Primary color */
  color: white;
  padding: 0.25rem;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: rgba(51, 51, 51, 0.5);
  }
`;

const TableCell = styled.td`
  padding: 0.25rem;
  text-align: center;
  color: #00bca5;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #00bca5; /* Primary color */
  cursor: pointer;
  font-size: 1.2rem;

  &:hover {
    color: #009b87; /* Darker shade of primary color */
  }
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 1rem;
`;

const BatchName = styled.h3`
  margin: 0;
  color: #999;
`;

const ScrollableContainer = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  margin-top: 1rem;
`;

const expenseCategories = ['Travel', 'Meals', 'Supplies', 'Entertainment', 'Training', 'Miscellaneous'];
const expenseSubcategories = {
  'Travel': ['Airfare', 'Lodging', 'Transportation'],
  'Meals': ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
  'Supplies': ['Office Supplies', 'Hardware', 'Software'],
  'Entertainment': ['Team Outing', 'Client Entertainment', 'Gifts'],
  'Training': ['Courses', 'Conferences', 'Certifications'],
  'Miscellaneous': ['Others', 'Subscriptions', 'Donations']
};
const expenseTypes = ['Business', 'Personal'];
const departments = ['Sales', 'Engineering', 'HR', 'Finance', 'Marketing', 'Operations'];
const positions = ['Manager', 'Engineer', 'Analyst', 'Executive', 'Coordinator'];
const paymentMethods = ['Credit Card', 'Cash', 'Bank Transfer'];
const receiptOptions = ['Yes', 'No'];

const SubmitExpense = () => {

  const [loading, setLoading] = useState(true); 

  const [batchName, setBatchName] = useState('');
  const [isBatchName, setIsBatchName] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseSubcategory, setExpenseSubcategory] = useState('');
  const [expenseType, setExpenseType] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [receiptOption, setReceiptOption] = useState('');
  const [amount, setAmount] = useState('');
  // const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const check_server = async () => {
    const docRef_server = doc(db, 'GenAI Expense Workflow', 'Post_expense');
    const response_server = await getDoc(docRef_server);

    if(response_server.exists()) {
      notifyInfo("Offline!! Server unavailable.");
      notifyInfo("But data will be saved.");
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    const user = localStorage.getItem('user');
    const approver = localStorage.getItem('approver');
    console.log(user);

    if (!user || approver === 'true') {
      navigate('/');
    } else {
      try {
        const parsedUser = JSON.parse(user);
        setName(parsedUser.name || '');
        setUserName(parsedUser.password || '');
        //check_server();
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
  }, [navigate]);

  const isDateWithinLastMonth = (date) => {
    const selectedDate = new Date(date);
    const currentDate = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);
    return selectedDate >= oneMonthAgo && selectedDate <= currentDate;
  };

  const isStartDateBeforeEndDate = (start, end) => {
    return new Date(start) <= new Date(end);
  };

  const handleBatchNameSubmit = (e) => {

    setLoading(true);

    e.preventDefault();

    let validationErrors = {};

    if (!batchName.trim()) {
      validationErrors.batchName = 'Please enter a batch name';
    }
    if (!startDate || !isDateWithinLastMonth(startDate)) {
      validationErrors.startDate = 'Start date must be within the last month and cannot be in the future.';
    }
    if (!endDate || new Date(endDate) > new Date()) {
      validationErrors.endDate = 'End date cannot be in the future.';
    }
    if (!isStartDateBeforeEndDate(startDate, endDate)) {
      validationErrors.dateRange = 'Start date must be before the end date.';
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsBatchName(true);
      setErrors({});
      notifySuccess("Batch Created.");
    } 
    setLoading(false);
  };

  const handleEditBatchDetails = () => {
    const newBatchName = prompt('Enter new batch name', batchName);
    const newStartDate = prompt('Enter new start date', startDate);
    const newEndDate = prompt('Enter new end date', endDate);

    if (newBatchName !== null && newStartDate !== null && newEndDate !== null) {
      let validationErrors = {};

      if (!isDateWithinLastMonth(newStartDate)) {
        validationErrors.startDate = 'Start date must be within the last month and cannot be in the future.';
      }
      if (new Date(newEndDate) > new Date()) {
        validationErrors.endDate = 'End date cannot be in the future.';
      }
      if (!isStartDateBeforeEndDate(newStartDate, newEndDate)) {
        validationErrors.dateRange = 'Start date must be before the end date.';
      }

      if (Object.keys(validationErrors).length === 0) {
        setBatchName(newBatchName);
        setStartDate(newStartDate);
        setEndDate(newEndDate);
        setErrors({});
      } else {
        setErrors(validationErrors);
      }
    }
  };

  const handleSubmitExpense = (e) => {
    e.preventDefault();

    setLoading(true);

    let validationErrors = {};
    if (!expenseCategory) {
      validationErrors.expenseCategory = 'Please select an expense category';
    }
    if (!expenseSubcategory) {
      validationErrors.expenseSubcategory = 'Please select an expense subcategory';
    }
    if (!expenseType) {
      validationErrors.expenseType = 'Please select an expense type';
    }
    if (!department) {
      validationErrors.department = 'Please select a department';
    }
    if (!position) {
      validationErrors.position = 'Please select a position';
    }
    if (!paymentMethod) {
      validationErrors.paymentMethod = 'Please select a payment method';
    }
    if (!receiptOption) {
      validationErrors.receiptOption = 'Please select receipt option';
    }
    if (!amount || isNaN(amount)) {
      validationErrors.amount = 'Amount must be a number';
    }
    // if (!description) {
    //   validationErrors.description = 'Please enter a description';
    // }
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      const newExpense = { expenseCategory, expenseSubcategory, expenseType, department, position, paymentMethod, receiptOption, amount };
      if (isEditMode) {
        const updatedExpenses = expenses.map((expense, index) =>
          index === editIndex ? newExpense : expense
        );
        setExpenses(updatedExpenses);
        setIsEditMode(false);
        setEditIndex(null);
      } else {
        setExpenses([...expenses, newExpense]);
      }
      setExpenseCategory('');
      setExpenseSubcategory('');
      setExpenseType('');
      setDepartment('');
      setPaymentMethod('');
      setPosition('');
      setReceiptOption('');
      setAmount('');
      // setDescription('');
      notifySuccess("Expense added/updated.");
    } else {
      notifyError("Required fields are missing.");
    }
    setLoading(false);
  };

  const handleEditExpense = (index) => {
    const expense = expenses[index];
    setExpenseCategory(expense.expenseCategory);
    setExpenseSubcategory(expense.expenseSubcategory);
    setExpenseType(expense.expenseType);
    setDepartment(expense.department);
    setPaymentMethod(expense.paymentMethod);
    setReceiptOption(expense.receiptOption);
    setAmount(expense.amount);
    setPosition(expense.position);
    // setDescription(expense.description);
    setIsEditMode(true);
    setEditIndex(index);
  };

  const handleDeleteExpense = (index) => {
    setLoading(true);
    const updatedExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(updatedExpenses);
    notifySuccess("Expense deleted successfully.");
    setLoading(false);
  };
  
  const handleSubmitAll = async () => {
    
    setLoading(true);

    // Check if batch name and username are available
    if (!batchName || !userName) {
      console.error('Batch name or username is missing');
      return;
    }
  
    // Format the data
    const formattedData = {
      [`${batchName}--${userName}`]: {
        username: userName,
        expenses: expenses,
        startdata: startDate,
        enddata: endDate
      }
    };
  
    try {
      // Create a reference to the Firestore document
      const docRef = doc(db, 'GenAI Expense Workflow', 'Post_expense');

      // const docRef_e = doc(db, 'GenAI Expense Workflow', 'Employees');
      // const response = await getDoc(docRef_e);

      // if (response.exists()) {
      //   const firebase_data = response.data();
      //   const userKey = userName.replace("@","_");
      //   const data = firebase_data[userKey];
      //   if(!data) {
      //     await setDoc(docRef_e, {
      //       [userKey] : {
      //         xpenses : {
      //           pending : [],
      //           denied : []
      //         }
      //       }
      //     }, { merge: true });
      //   }
      // }
      
      // Save the formatted data to Firestore
      await setDoc(docRef, formattedData, { merge: true }); // Using { merge: true } to avoid overwriting existing data
  
      console.log('Expenses submitted successfully:', formattedData);
  
      // Clear all expenses and reset fields
      setExpenses([]);
      setBatchName('');
      setStartDate('');
      setEndDate('');
      setIsBatchName(false);
      notifySuccess('Expenses submitted successfully.');
    } catch (error) {
      notifyError("Expense submission failed. Please try again.");
      console.error('Error submitting expenses:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleExit = async () => {
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    navigate('/');
    console.log('Exit');
  };

  const handleBack = () => {
    navigate(-1);
  };
  

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Container>
      <BackButton />
      <FormContainer>
        <Title>Submit Expense Details</Title>

        {!isBatchName && (
          <Form onSubmit={handleBatchNameSubmit}>
            <div>
              <Input
                type="text"
                placeholder="Batch Name"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
              />
              {errors.batchName && <ErrorMessage>{errors.batchName}</ErrorMessage>}
            </div>
            <div>
              <Input
                type="date"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              {errors.startDate && <ErrorMessage>{errors.startDate}</ErrorMessage>}
            </div>
            <div>
              <Input
                type="date"
                placeholder="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              {errors.endDate && <ErrorMessage>{errors.endDate}</ErrorMessage>}
            </div>
            {errors.dateRange && <ErrorMessage>{errors.dateRange}</ErrorMessage>}
            <Button type="submit">Set Batch Details</Button>
          </Form>
        )}

        {isBatchName && (
          <>
            <Row>
              <BatchName>{`Batch: ${batchName}`}</BatchName>
              {/* <IconButton onClick={handleEditBatchDetails}>
                <FaEdit />
              </IconButton> */}
            </Row>
            <Row>
              <BatchName>{`Start Date: ${startDate}`}</BatchName>
              <BatchName>{`End Date: ${endDate}`}</BatchName>
            </Row>
            <Form onSubmit={handleSubmitExpense}>
              <div>
                <Select value={expenseCategory} onChange={(e) => {
                  setExpenseCategory(e.target.value);
                  setExpenseSubcategory(''); // Reset subcategory when category changes
                }}>
                  <option value="">Select Expense Category</option>
                  {expenseCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Select>
                {errors.expenseCategory && <ErrorMessage>{errors.expenseCategory}</ErrorMessage>}
              </div>
              <div>
                {expenseCategory && (
                  <Select value={expenseSubcategory} onChange={(e) => setExpenseSubcategory(e.target.value)}>
                    <option value="">Select Expense Subcategory</option>
                    {expenseSubcategories[expenseCategory]?.map(subcategory => (
                      <option key={subcategory} value={subcategory}>{subcategory}</option>
                    ))}
                  </Select>
                )}
                {errors.expenseSubcategory && <ErrorMessage>{errors.expenseSubcategory}</ErrorMessage>}
              </div>
              <div>
                <Select value={expenseType} onChange={(e) => setExpenseType(e.target.value)}>
                  <option value="">Select Expense Type</option>
                  {expenseTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
                {errors.expenseType && <ErrorMessage>{errors.expenseType}</ErrorMessage>}
              </div>
              <div>
                <Select value={department} onChange={(e) => setDepartment(e.target.value)}>
                  <option value="">Select Department</option>
                  {departments.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </Select>
                {errors.department && <ErrorMessage>{errors.department}</ErrorMessage>}
              </div>
              <div>
                <Select value={position} onChange={(e) => setPosition(e.target.value)}>
                  <option value="">Select Position</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </Select>
                {errors.position && <ErrorMessage>{errors.position}</ErrorMessage>}
              </div>
              <div>
                <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="">Select Payment Method</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </Select>
                {errors.paymentMethod && <ErrorMessage>{errors.paymentMethod}</ErrorMessage>}
              </div>
              <div>
                <Select value={receiptOption} onChange={(e) => setReceiptOption(e.target.value)}>
                  <option value="">Receipt Provided?</option>
                  {receiptOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
                {errors.receiptOption && <ErrorMessage>{errors.receiptOption}</ErrorMessage>}
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {errors.amount && <ErrorMessage>{errors.amount}</ErrorMessage>}
              </div>
              {/* <div>
                <Textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
              </div> */}
              <Button type="submit">{isEditMode ? 'Update Expense' : 'Add Expense'}</Button>
            </Form>
          </>
        )}

        {expenses.length > 0 && (
          <div>
            <h3>Preview Expenses</h3>
            <ScrollableContainer>
              <Table>
                <thead>
                  <TableRow>
                    <TableHeader>Actions</TableHeader>
                    <TableHeader>Category</TableHeader>
                    <TableHeader>Subcategory</TableHeader>
                    <TableHeader>Type</TableHeader>
                    <TableHeader>Department</TableHeader>
                    <TableHeader>Position</TableHeader>
                    <TableHeader>Payment Method</TableHeader>
                    <TableHeader>Receipt</TableHeader>
                    <TableHeader>Amount</TableHeader>
                    {/* <TableHeader>Description</TableHeader> */}
                  </TableRow>
                </thead>
                <tbody>
                  {expenses.map((expense, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <IconButton onClick={() => handleEditExpense(index)}><FaEdit /></IconButton>
                        <IconButton onClick={() => handleDeleteExpense(index)}><FaTrashAlt /></IconButton>
                      </TableCell>
                      <TableCell>{expense.expenseCategory}</TableCell>
                      <TableCell>{expense.expenseSubcategory}</TableCell>
                      <TableCell>{expense.expenseType}</TableCell>
                      <TableCell>{expense.department}</TableCell>
                      <TableCell>{expense.position}</TableCell>
                      <TableCell>{expense.paymentMethod}</TableCell>
                      <TableCell>{expense.receiptOption}</TableCell>
                      <TableCell>{expense.amount}</TableCell>
                      {/* <TableCell>{expense.description}</TableCell> */}
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            </ScrollableContainer>
            <Button onClick={handleSubmitAll}>Submit All Expenses</Button>
            <Button red onClick={handleExit}>Exit</Button>
          </div>
        )}
      </FormContainer>
    </Container>
  );
};

export default SubmitExpense;
