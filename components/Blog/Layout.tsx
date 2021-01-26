import { ReactNode } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import Navbar from './Navbar';
import Footer from './Footer';

type Props = {
  children?: ReactNode;
  title?: string;
  content?: string;
};

const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
`;

const Layout = ({
  children,
  title = 'Fotogram',
  content = 'Mira, haz zoom y descarga fotos en alta definición de Instagram de forma anónima.',
}: Props) => (
  <>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta name="description" content={content} />
    </Head>
    <FlexContainer>
      <Navbar />
      {children}
      <Footer />
    </FlexContainer>
  </>
);

export default Layout;
