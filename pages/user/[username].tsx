import React from 'react';
// import Link from 'next/link';
import styled from 'styled-components';
import Layout from '../../components/Layout';
import SearchBar from '../../components/SearchBar';

interface Props {}

const Container = styled.div``;

const User: React.FC<Props> = () => {
  return (
    <Layout title="Home | Next.js + TypeScript Example">
      <Container>
        <SearchBar />
      </Container>
    </Layout>
  );
};

export default User;
