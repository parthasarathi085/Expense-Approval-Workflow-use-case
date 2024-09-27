import { FaArrowLeft} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const BackButtonStyle = styled.button`
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

const BackButton = () => {
    const navigate = useNavigate();
    const handleBack = () => {
        navigate(-1);
    };
      
    return(
      <BackButtonStyle onClick={handleBack}>
        <FaArrowLeft />
      </BackButtonStyle>
    );
}

export default BackButton;