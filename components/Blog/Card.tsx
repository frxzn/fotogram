import React from 'react';
import styled from 'styled-components';

interface Props {}

const Container = styled.li`
  background: #fff;
  border-left: 5px solid ${(props) => props.theme.colors.primary};
  border-right: 5px solid #fff;
  margin: 0 auto 4rem;
  padding: 2rem;
  list-style: none;
`;

const Title = styled.h2`
  display: inline-block;
  margin: 0;

  :hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

const Date = styled.p`
  color: #777777;
`;

const Button = styled.div`
  display: inline-block;
  background-color: ${(props) => props.theme.colors.primary};
  color: #fff;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 4px 12px;

  :hover {
    cursor: pointer;
  }
`;

const Card: React.FC<Props> = () => {
  return (
    <Container>
      <Title>The Great Gatsby Bootcamp</Title>
      <Date>April 15th, 2019</Date>
      <p>
        Learn how to create fast websites and web applications with Gatsby.
        You’ll use Gatsby, React, and GraphQL to build an entire CMS-powered
        website from scratch.
      </p>
      <Button>Explorar</Button>
    </Container>
  );
};

export default Card;
