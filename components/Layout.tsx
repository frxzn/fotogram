import { ReactNode } from 'react';
// import Link from 'next/link';
import Head from 'next/head';

type Props = {
  children?: ReactNode;
  title?: string;
  content?: string;
};

const Layout = ({
  children,
  title = 'This is the default title',
  content = 'Mira, haz zoom y descarga fotos en alta definición de Instagram de forma anónima.',
}: Props) => (
  <>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta name="description" content={content} />
    </Head>
    {children}
  </>
);

export default Layout;
