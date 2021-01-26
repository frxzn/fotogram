import React from 'react';
import styled from 'styled-components';

interface Props {}

const Footer = styled.footer`
  color: #4a4a4a;
  background-color: #fff;
  border-top: 1px solid #dbdbdb;
`;

const Container = styled.div`
  margin: 0 auto;
  max-width: ${(props) => props.theme.dimensions.maxWidth};
  height: ${(props) => props.theme.dimensions.barHeight};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ComponentName: React.FC<Props> = () => {
  return (
    <Footer>
      <Container>Fotogram {new Date().getFullYear()}</Container>
    </Footer>
  );
};

export default ComponentName;
