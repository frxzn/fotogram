import React from 'react';
import styled from 'styled-components';

interface Props {}

const Header = styled.header`
  background-color: #fff;
  border-bottom: 1px solid #dbdbdb;
`;

const Container = styled.div`
  display: flex;
  /* align-items: center; */
  justify-content: space-between;
  margin: 0 auto;
  height: ${(props) => props.theme.dimensions.barHeight};
  max-width: ${(props) => props.theme.dimensions.maxWidth};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.colors.primary};
  font-size: 1.6rem;

  :hover {
    cursor: pointer;
  }
`;

const List = styled.ul`
  display: flex;
  padding: 0;
  margin: 0;
`;

const Item = styled.li`
  display: flex;
  align-items: center;
  list-style: none;
  padding: 0 1rem;

  :hover {
    cursor: pointer;
    background-color: #fafafa;
    color: ${(props) => props.theme.colors.primary};
  }
`;

const Navbar: React.FC<Props> = () => {
  return (
    <Header>
      <Container>
        <Logo>Fotogram</Logo>
        <List>
          <Item>Home</Item>
          <Item>Blog</Item>
          <Item>Login</Item>
          <Item>Signup</Item>
        </List>
      </Container>
    </Header>
  );
};

export default Navbar;
