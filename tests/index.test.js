import React from 'react';
import { render, screen, waitFor } from '../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import Index from '../pages';
import { mainTitle } from '../pages/index';
import { mock } from './mock-data';
import { baseUrl } from '../utils/utils';

const server = setupServer(
  rest.get(`${baseUrl}/web/search/topsearch/`, (req, res, ctx) => {
    const qs = req.url.searchParams.get('query');
    return res(ctx.status(200), ctx.json(mock(qs)));
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
    const { container } = render(<Index />);

    const heading = screen.getByText(mainTitle);
    const textbox = screen.getByRole('textbox');
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).not.toBeChecked(); // not checked on init
    expect(textbox).toHaveFocus();

    userEvent.type(textbox, 'aaa');
    expect(textbox).toHaveValue('aaa');

    await waitFor(() => {
      expect(container.querySelector('#spinner')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getAllByText(/AAA/)).toHaveLength(3);
      expect(container.querySelector('#close-icon')).toBeInTheDocument();
    });

    userEvent.type(textbox, 'bbb');
    expect(textbox).toHaveValue('aaabbb');

    await waitFor(() => {
      expect(container.querySelector('#spinner')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getAllByText(/AAABBB/)).toHaveLength(2);
      expect(container.querySelector('#close-icon')).toBeInTheDocument();
    });

    userEvent.type(textbox, 'ccc');
    expect(textbox).toHaveValue('aaabbbccc');

    await waitFor(() => {
      expect(container.querySelector('#spinner')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getAllByText(/AAABBBCCC/)).toHaveLength(1);
      expect(container.querySelector('#close-icon')).toBeInTheDocument();
    });

    userEvent.click(checkbox); // checked
    expect(checkbox).toBeChecked();
    expect(screen.queryByText(/AAABBBCCC/)).toBeNull();

    userEvent.click(checkbox); // not checked
    expect(screen.getByText(/AAABBBCCC/)).toBeInTheDocument();

    userEvent.click(heading); // to lose input focus
    expect(textbox).not.toHaveFocus();
    expect(screen.queryByText(/AAABBBCCC/)).toBeNull();
  });
});
