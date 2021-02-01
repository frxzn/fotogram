import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';

const LogoContainer = styled.a`
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.colors.primary};
  font-size: 1.2rem;

  :hover {
    cursor: pointer;
  }
`;

const Logo = styled.img`
  width: 32px;
  height: 32px;
  /* 
  @media (max-width: 735px) {
    width: 32px;
    height: 32px;
  } */
`;

const ComponentName: React.FC = () => {
  return (
    <Link href={'/'} passHref>
      <LogoContainer>
        <Logo className="logo" src="/logo.png" />
      </LogoContainer>
    </Link>
  );
};

export default ComponentName;
