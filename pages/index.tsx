import styled from 'styled-components';
import Layout from '../components/Blog/Layout';
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
  flex: 1;
  margin: 1rem;

  @media (max-width: 735px) {
    min-height: 120vh;
  }
`;

const IndexPage = () => (
  <Layout title="Descargar fotos Instagram | Fotogram">
    <Container>
      <Title>
        Mira, haz zoom y descarga fotos en alta definición de Instagram
      </Title>
      <LandingSearchBar />
    </Container>
  </Layout>
);

export default IndexPage;
