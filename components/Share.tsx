import React from 'react';
import styled from 'styled-components';
import { useSnackbar } from 'react-simple-snackbar';

const Container = styled.button`
  border: 1px solid ${(props) => props.theme.colors.borderColor};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 9px;
  margin: 9px;
  background-color: transparent;
  color: ${(props) => props.theme.colors.primaryText};
  :hover {
    cursor: pointer;
    color: #000;
  }

  @media (max-width: 735px) {
    margin-left: 0;
  }
`;

const Icon = styled.img`
  height: 1rem;
  width: 1rem;
  margin-right: 4px;
`;

const Share: React.FC = () => {
  const [openSnackbar] = useSnackbar();

  const handleClick = () => {
    const supported = document.execCommand('copy');

    if (supported) {
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(window.location.href)
          .then(() => {
            openSnackbar('Link copied to clipboard!');
          })
          .catch((err) => {
            console.log(err);
            openSnackbar('Failed to copy link to clipboard.');
          });
      }
    }
  };

  return (
    <Container onClick={handleClick}>
      <Icon src="/icons/share.svg" />
      Share
    </Container>
  );
};

export default Share;
