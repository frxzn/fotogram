import Link from 'next/link';
import Layout from '../components/Layout';
import styled from 'styled-components';

const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  color: ${(props) => props.theme.colors.primary};
`;

const IndexPage = () => (
  <Layout title="Home | Next.js + TypeScript Example">
    <Title>Hello Next.js 👋</Title>
    <p>
      <Link href="/about">
        <a>About</a>
      </Link>
    </p>
  </Layout>
);

export default IndexPage;
