import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { Provider } from 'react-redux';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import SnackbarProvider from 'react-simple-snackbar';
import * as gtag from '../lib/gtag';
import store from '../store';

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
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <GlobalStyle />
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <Component {...pageProps} />
          </Provider>
        </ThemeProvider>
      </SnackbarProvider>
    </>
  );
}
