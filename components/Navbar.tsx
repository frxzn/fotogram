import React from 'react';
import styled from 'styled-components';
import SearchBar from './SearchBar';

const StyledHeader = styled.header`
  position: fixed;
  top: 0;
  height: 54px;
  width: 100%;
  z-index: 200;
  background-color: #fff;
  border-bottom: 1px solid #dbdbdb;
  display: flex;
  align-items: center;
`;

const Navbar: React.FC = () => {
  return (
    <StyledHeader>
      <SearchBar />
    </StyledHeader>
  );
};

export default Navbar;
