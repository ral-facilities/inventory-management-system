import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { ZodError } from 'zod';
import paths from '../paths';
import {
  getCatalogueItemById,
  getItemById,
  renderComponentWithRouterProvider,
} from '../testUtils';
import {
  CodeRedirectErrorComponent,
  codeRedirectLoader,
} from './codeRedirectLoader';

describe('codeRedirectLoader', () => {
  let queryClient: QueryClient;

  const runLoader = (params: Record<string, string>) =>
    codeRedirectLoader(queryClient)({
      url: new URL(`http://localhost${paths.codeRedirect}?${new URLSearchParams(params).toString()}`),
      request: new Request(
        `http://localhost${paths.codeRedirect}?${new URLSearchParams(params).toString()}`
      ),
      pattern: paths.codeRedirect,
      params: {},
      context: null
    });

  const expectRedirectTo = (response: Response, location: string) => {
    expect((response).status).toBe(302);
    expect((response).headers.get('Location')).toBe(location);
  };

  beforeEach(() => {
    queryClient = new QueryClient();
    vi.clearAllMocks();
  });

  it('redirects to the system page when type is system', async () => {
    const response = await runLoader({
      oid: '65328f34a40ff5301575a4e3',
      type: 'system',
    });

    expectRedirectTo(response, '/systems/65328f34a40ff5301575a4e3');
  });

  it('redirects to the item page when type is item', async () => {
    const item = getItemById('KvT2Ox7n');
    const catalogueItem = getCatalogueItemById(item.catalogue_item_id)!;

    const response = await runLoader({ oid: item.id, type: 'item' });

    expectRedirectTo(
      response,
      `/catalogue/${catalogueItem.catalogue_category_id}/items/${item.catalogue_item_id}/items/${item.id}`
    );
  });

  it.each([
    ['missing the type', { oid: 'KvT2Ox7n' }],
    ['missing the oid', { type: 'system' }],
    ['an unknown type', { oid: 'KvT2Ox7n', type: 'catalogue_item' }],
    ['no params', {}],
  ])(
    'throws an error when the search params are invalid: %s',
    async (_name, params) => {
      await expect(runLoader(params)).rejects.toBeInstanceOf(ZodError);
    }
  );

  it('throws an error when the item cannot be retrieved', async () => {
    await expect(
      runLoader({ oid: 'does-not-exist', type: 'item' })
    ).rejects.toThrow('Request failed with status code 404');
  });
});

describe('CodeRedirectErrorComponent', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('links to the catalogue home page from the error state', async () => {
    const { router } = renderComponentWithRouterProvider(
      <CodeRedirectErrorComponent />
    );

    expect(await screen.findByText('Page not found')).toBeInTheDocument();

    const homeLink = screen.getByRole('link', {
      name: 'catalogue home page',
    });
    expect(homeLink).toHaveAttribute('href', '/catalogue');

    await user.click(homeLink);

    expect(router.state.location.pathname).toBe('/catalogue');
  });
});
