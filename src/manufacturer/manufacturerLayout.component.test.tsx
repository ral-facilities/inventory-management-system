import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { type LoaderFunctionArgs } from 'react-router';
import { renderComponentWithRouterProvider } from '../testUtils';
import ManufacturerLayout, {
  ManufacturerLayoutErrorComponent,
  manufacturerLayoutLoader,
} from './manufacturerLayout.component';

describe('Manufacturer Layout', () => {
  let user: UserEvent;
  const createView = (path: string, isLandingPage?: boolean) => {
    return renderComponentWithRouterProvider(
      <ManufacturerLayout />,
      isLandingPage ? 'manufacturer' : 'manufacturers',
      path
    );
  };
  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('navigates back to the root directory from root', async () => {
    const { router } = createView('/manufacturers');

    await waitFor(() => {
      expect(screen.queryByText('Manufacturer A')).not.toBeInTheDocument();
    });

    const homeButton = await screen.findByRole('button', {
      name: 'navigate to manufacturers home',
    });

    await user.click(homeButton);

    expect(router.state.location.pathname).toBe('/manufacturers');
  });
  it('navigates back to the root directory from landing page', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const { router } = createView('/manufacturers/1', true);

    await waitFor(() => {
      expect(screen.queryByText('Manufacturer A')).not.toBeInTheDocument();
    });

    const homeButton = await screen.findByRole('button', {
      name: 'navigate to manufacturers home',
    });

    await user.click(homeButton);

    expect(router.state.location.pathname).toBe('/manufacturers');
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });
});

describe('Manufacturer Layout Error Component', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });
  const createView = () => {
    return renderComponentWithRouterProvider(
      <ManufacturerLayoutErrorComponent />
    );
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders manufacturer error page correctly', async () => {
    const { asFragment, router } = createView();

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: 'navigate to manufacturers home',
        })
      ).toBeInTheDocument();
    });

    const homeButton = screen.getByRole('button', {
      name: 'navigate to manufacturers home',
    });

    await user.click(homeButton);

    expect(router.state.location.pathname).toBe('/manufacturers');

    expect(asFragment()).toMatchSnapshot();
  });
});

describe('manufacturerLayoutLoader', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    vi.clearAllMocks();
  });
  it('should fetch catalogue category data if catalogue_category_id is provided', async () => {
    const params = { manufacturer_id: '1' };
    const output = await manufacturerLayoutLoader(queryClient)({
      params,
    } as unknown as LoaderFunctionArgs);

    expect(output).toEqual(params);
  });

  it('should throw an error if an invalid catalogue_category_id is provided', async () => {
    const params = { manufacturer_id: '120' };

    await expect(
      manufacturerLayoutLoader(queryClient)({
        params,
      } as unknown as LoaderFunctionArgs)
    ).rejects.toThrow('Request failed with status code 404');
  });
});
