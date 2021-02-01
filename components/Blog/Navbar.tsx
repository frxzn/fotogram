import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import Logo from '../Logo';

interface Props {}

const Header = styled.header`
  background-color: #fff;
  border-bottom: 1px solid #dbdbdb;
`;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  height: ${(props) => props.theme.dimensions.barHeight};
  max-width: ${(props) => props.theme.dimensions.maxWidth};
  padding-left: 1rem;
`;

const List = styled.ul`
  display: flex;
  padding: 0;
  margin: 0;
`;

const Item = styled.li`
  list-style: none;
  color: #4a4a4a;

  a,
  a:visited,
  a:hover,
  a:active {
    display: flex;
    align-items: center;
    justify-content: center;
    color: inherit;
    height: 100%;
    padding: 0 1rem;
  }

  :hover {
    cursor: pointer;
    background-color: #fafafa;
    color: ${(props) => props.theme.colors.primary};
  }
`;

const Navbar: React.FC<Props> = () => {
  const routes = [
    { name: 'Inicio', slug: '/' },
    { name: 'Blog', slug: '/blog' },
  ];

  return (
    <Header>
      <Container>
        <Logo />
        <List>
          {routes.map((route) => (
            <Item key={route.slug}>
              <Link href={route.slug}>
                <a>{route.name}</a>
              </Link>
            </Item>
          ))}
        </List>
      </Container>
    </Header>
  );
};

export default Navbar;
