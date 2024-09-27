import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom base style using your color palette and glass effect
const baseToastStyle = {
  background: 'rgba(0, 0, 0, 0.8)', 
  color: '#fff',
  backdropFilter: 'blur(10px)',
  borderRadius: '10px',
  padding: '10px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
};

// Specific styles for different types of notifications
const successToastStyle = {
  ...baseToastStyle,
  border: '2px solid #00bca5', // Teal border for success
  color: '#00bca5',
};

const errorToastStyle = {
  ...baseToastStyle,
  border: '2px solid #ff453a', // Red border for error
  color: '#ff453a',
};

const infoToastStyle = {
  ...baseToastStyle,
  border: '2px solid #1e90ff', // Dodger blue border for info
  color: '#le90ff'
};

const warningToastStyle = {
  ...baseToastStyle,
  border: '2px solid #ffa500', // Orange border for warning
  color: '#ffa500'
};

export const notifySuccess = (message = "Operation successful!") => {
  toast.success(message, {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    style: successToastStyle,
    progressStyle: { backgroundColor: '#00bca5'},
  });
};

export const notifyError = (message = "An error occurred!") => {
  toast.error(message, {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    style: errorToastStyle,
  });
};

export const notifyInfo = (message = "Here is some information!") => {
  toast.info(message, {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    style: infoToastStyle,
  });
};

export const notifyWarning = (message = "Warning!") => {
  toast.warn(message, {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    style: warningToastStyle,
  });
};
