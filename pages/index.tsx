import styled from 'styled-components';
import Layout from '../components/Layout';
import LandingSearchBar from '../components/LandingSearchBar';

const Title = styled.h1`
  font-size: 2em;
  font-weight: 300;
  text-align: center;
  color: ${(props) => props.theme.colors.primaryText};
  margin: 4rem 0;

  @media (max-width: 735px) {
    font-size: 1.6rem;
    margin: 2rem 0;
  }
`;

const Container = styled.div`
  height: 200vh;
  margin: 1rem;
`;

const IndexPage = () => (
  <Layout title="Fotogram.app">
    <Container>
      <Title>View, zoom & download HD Instagram pictures</Title>
      <LandingSearchBar />
    </Container>
  </Layout>
);

export default IndexPage;
