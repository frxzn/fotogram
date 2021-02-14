import React from 'react';
import { render, screen } from '../utils/test-utils';
import Index from '../pages';
import { mainTitle } from '../pages/index';

test('renders landing page', () => {
  render(<Index />);
  expect(screen.getByText(mainTitle)).toBeInTheDocument();
});
