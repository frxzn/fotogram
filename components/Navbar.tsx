import React, { useState } from 'react';
import styled from 'styled-components';
import Dropdown from './Dropdown';

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
  const [selected, setSelected] = useState('English');

  return (
    <StyledHeader>
      <div className="center">
        <div className="logo">Fotogram</div>
        <Dropdown
          dropdownButton={selected}
          menuItems={['English', 'Español', 'Portuguese', 'Italiano']}
          setSelected={setSelected}
        />
      </div>
    </StyledHeader>
  );
};

export default Navbar;
