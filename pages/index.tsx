import styled from 'styled-components';
import Layout from '../components/Layout';
import LandingSearchBar from '../components/LandingSearchBar';

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
    <LandingSearchBar />
  </Layout>
);

export default IndexPage;
