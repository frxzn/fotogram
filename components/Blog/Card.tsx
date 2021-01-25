import React from 'react';
import styled from 'styled-components';

interface Props {}

const Container = styled.li`
  background: #fff;
  border-left: 5px solid ${(props) => props.theme.colors.primary};
  border-right: 5px solid #fff;
  margin: 0 auto 4rem;
  padding: 2rem;
  color: #444444;
  list-style: none;
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
`;

const Card: React.FC<Props> = () => {
  return (
    <Container>
      <h2 style={{ marginTop: 0 }}>The Great Gatsby Bootcamp</h2>
      <Date>April 15th, 2019</Date>
      <p>
        Learn how to create fast websites and web applications with Gatsby.
        You’ll use Gatsby, React, and GraphQL to build an entire CMS-powered
        website from scratch.
      </p>
      <Button>Read more</Button>
    </Container>
  );
};

export default Card;
