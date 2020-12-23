import Link from 'next/link';
import styled from 'styled-components';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import 'bootstrap/dist/css/bootstrap.min.css';

const Title = styled.h1`
  font-size: 2em;
  font-weight: 300;
  text-align: center;
  color: ${(props) => props.theme.colors.primaryText};
  margin: 4rem 0;
`;

const IndexPage = () => (
  <Layout title="Fotogram.app">
    <Title>View, zoom & download HD Instagram pictures</Title>
    <SearchBar />
    <p>
      <Link href="/about">
        <a>About</a>
      </Link>
    </p>
  </Layout>
);

export default IndexPage;
