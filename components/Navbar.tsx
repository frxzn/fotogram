import React from 'react';
import styled from 'styled-components';

interface Props {}

const StyledHeader = styled.header`
  background-color: #fff;
  border-bottom: 1px solid #dbdbdb;
  height: 54px;

  .center {
    margin: 0 auto;
    height: 100%;
    width: 60%;
    max-width: 800px;
    min-width: 300px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    color: ${(props) => props.theme.colors.primary};
    font-size: 1.4rem;
    font-weight: bold;
  }
`;

const Navbar: React.FC<Props> = () => {
  return (
    <StyledHeader>
      <div className="center">
        <div className="logo">Fotogram</div>
        <div>Dropdown</div>
      </div>
    </StyledHeader>
  );
};

export default Navbar;
