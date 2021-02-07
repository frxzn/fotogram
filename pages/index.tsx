import styled from 'styled-components';
import Layout from '../components/Blog/Layout';
import LandingSearchBar from '../components/LandingSearchBar';

const Container = styled.div`
  flex: 1;
  margin: 1rem;
  color: ${(props) => props.theme.colors.primaryText};

  h1,
  h2,
  h3 {
    font-weight: 500;
  }

  @media (max-width: 735px) {
    min-height: 120vh;
  }
`;

const Center = styled.div`
  margin: auto;
  max-width: ${(props) => props.theme.dimensions.maxWidth};

  li {
    margin-top: 1rem;
  }
`;

const StyledH1 = styled.h1`
  text-align: center;
  margin: 4rem 0;

  @media (max-width: 735px) {
    margin-top: 2rem;
  }
`;

const StyledH2 = styled.h2`
  margin-top: 4rem;

  @media (max-width: 735px) {
  }
`;

// const StyledH3 = styled.h3`
//   margin-left: 2rem;

//   @media (max-width: 735px) {
//   }
// `;

const Paragraph = styled.p`
  /* font-size: 1.2rem; */
  font-weight: 300;

  @media (max-width: 735px) {
    /* font-size: 1rem; */
  }
`;

const IndexPage = () => (
  <Layout title="Descargar fotos y videos de Instagram | Fotogram">
    <Container>
      <StyledH1>Descargar fotos y videos de Instagram</StyledH1>
      <LandingSearchBar />
      <Center>
        <StyledH2>Que es Fotogram?</StyledH2>
        <Paragraph>
          Fotogram es una plataforma online que te permite ver perfiles de
          Instagram de forma anónima, descargar sus fotos y videos en alta
          calidad de manera simple y rápida.
        </Paragraph>
        {/* <StyledH2>Como buscar un usuario?</StyledH2>
        <Paragraph>
          Simplemente ingresa el nombre del usuario cuyo perfil quieras ver en
          la barra anterior, y automáticamente aparecerá una lista de resultados
          de los cuales elegir. Selecciona el perfil que quieras ver y se
          cargarán todas sus fotos y videos.
        </Paragraph>
        <StyledH2>Como descargar multimedia?</StyledH2>
        <Paragraph>
          Existen dos posibilidades para descargar publicaciones de un perfil.
        </Paragraph>
        <StyledH3>De manera individual</StyledH3>
        <StyledH3>En simultaneo</StyledH3>
        <StyledH2>Ventajas de usar Fotogram</StyledH2>
        <ul>
          <li>
            Puedes acceder a todo el contenido de perfiles públicos de Instagram
            de manera anónima.
          </li>
          <li>
            No necesitas tener cuenta ni estar logueado en Instagram para
            disfrutar de nuestra herramienta.
          </li>
          <li>
            Puedes navegar entre publicaciones de manera más rápida ya que nos
            enfocamos en cargar las imágenes únicamente.
          </li>
          <li>
            Puedes ver las fotos en tamaño completo y hacer zoom en las
            imágenes.
          </li>
          <li>Compatible con cualquier dispositivo.</li>
          <li>Simple de usar.</li>
        </ul> */}
      </Center>
    </Container>
  </Layout>
);

export default IndexPage;
