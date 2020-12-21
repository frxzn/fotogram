import type { AppProps } from 'next/app';
import { createGlobalStyle, ThemeProvider } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: #fafafa;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  a, a:hover {
    text-decoration: none;
  }
`;

const theme = {
  colors: {
    backgroundColor: '#fafafa',
    primary: '#ff0078',
    primaryText: '#262626',
    secondaryText: '#8e8e8e',
    borderColor: '#dbdbdb',
  },
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
