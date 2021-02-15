import React from 'react';
import { render, screen, waitFor, fireEvent } from '../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import Index from '../pages';
import { mainTitle } from '../pages/index';
import { mock } from './mock-data';
import { baseUrl } from '../utils/utils';

const server = setupServer(
  rest.get(`${baseUrl}/web/search/topsearch/`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mock));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

jest.mock('next/link', () => ({ children }) => children);

describe('Landing page', () => {
  test('renders correctly', () => {
    render(<Index />);
    expect(screen.getByText(mainTitle)).toBeInTheDocument();
  });

  test('search bar works', async () => {
    render(<Index />);
    const searchInput = screen.getByRole('textbox');
    // fireEvent.change(searchInput, { target: { value: 'ariana' } });
    userEvent.type(searchInput, 'ariana');
    await waitFor(() => {
      expect(screen.getByText('arianagrande')).toBeInTheDocument();
    });
  });
});
