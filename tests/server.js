import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { baseUrl } from '../utils/utils';
import { mock } from './mock-data';

export const server = setupServer(
  rest.get(`${baseUrl}/web/search/topsearch/`, (req, res, ctx) => {
    const qs = req.url.searchParams.get('query');
    return res(ctx.status(200), ctx.json(mock(qs)));
  })
);
