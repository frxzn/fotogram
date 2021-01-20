import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { theme } from './pages/_app';
import Index from './pages';

test('Renders landing page', () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <Index />
    </ThemeProvider>
  );
  const title = 'View, zoom & download HD Instagram pictures';
  getByText(title);
});
