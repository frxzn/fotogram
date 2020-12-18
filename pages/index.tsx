import Link from 'next/link';
import styled from 'styled-components';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import 'bootstrap/dist/css/bootstrap.min.css';

const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  color: ${(props) => props.theme.colors.primary};
`;

const IndexPage = () => (
  <Layout title="Home | Next.js + TypeScript Example">
    <Title>Watch, Zoom & Download HD Instagram Pictures</Title>
    <SearchBar />
    <p>
      <Link href="/about">
        <a>About</a>
      </Link>
    </p>
  </Layout>
);

export default IndexPage;
