import type { AppProps } from 'next/app';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import SnackbarProvider from 'react-simple-snackbar';

const GlobalStyle = createGlobalStyle`
  html,
  body {
    margin: 0;
    padding: 0;
    background-color: #fafafa;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  a, a:hover {
    text-decoration: none;
  }

  * {
    box-sizing: border-box;
  }
`;

export const theme = {
  colors: {
    backgroundColor: '#fafafa',
    primary: '#ff0078',
    primaryText: '#262626',
    secondaryText: '#8e8e8e',
    borderColor: '#dbdbdb',
  },
  dimensions: {
    maxWidth: '935px',
    barHeight: '54px',
  },
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <Component {...pageProps} />
        </SnackbarProvider>
      </ThemeProvider>
    </>
  );
}
