import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { type LoaderFunctionArgs } from 'react-router';
import APIConfigProvider from '../apiConfigProvider.component';
import { server } from '../mocks/server';
import { URLPathKeyType } from '../paths';
import { RootState } from '../state/store';
import { renderComponentWithRouterProvider } from '../testUtils';
import SystemsLayout, {
  SystemsLayoutErrorComponent,
  systemsLayoutLoader,
} from './systemsLayout.component';

describe('Systems Layout', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  const createView = (
    path: string,
    urlPathKey: URLPathKeyType,
    preloadedState?: Partial<RootState>
  ) => {
    return renderComponentWithRouterProvider(
      <APIConfigProvider>
        <SystemsLayout />
      </APIConfigProvider>,
      urlPathKey,
      path,
      preloadedState
    );
  };

  it('renders root systems correctly', async () => {
    const view = createView('/systems', 'systems');

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: 'navigate to systems home',
        })
      ).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders units breadcrumbs correctly', async () => {
    const view = createView('/systems/65328f34a40ff5301575a4e3', 'system');

    await waitFor(() => {
      expect(screen.getAllByText('Giant laser')).toHaveLength(2);
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders critical mode correctly', async () => {
    const view = createView('/systems/65328f34a40ff5301575a4e3', 'system', {
      criticality: { isCriticalMode: true },
    });

    await waitFor(() => {
      expect(screen.getAllByText('Giant laser')).toHaveLength(2);
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders critical mode correctly when spares is not defined', async () => {
    server.use(
      http.get('/v1/settings/spares-definition', () => {
        return HttpResponse.json(undefined, { status: 204 });
      })
    );
    const view = createView('/systems/65328f34a40ff5301575a4e3', 'system', {
      criticality: { isCriticalMode: true },
    });

    await waitFor(() => {
      expect(screen.getAllByText('Giant laser')).toHaveLength(2);
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('calls useNavigate when the home button is clicked', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const { router } = createView(
      '/systems/65328f34a40ff5301575a4e3',
      'system'
    );

    await waitFor(() => {
      expect(screen.getAllByText('Giant laser')).toHaveLength(2);
    });

    const homeButton = screen.getByRole('button', {
      name: 'navigate to systems home',
    });

    await user.click(homeButton);

    expect(router.state.location.pathname).toBe('/systems');

    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });
});

describe('Systems Layout Error Component', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  const createView = () => {
    return renderComponentWithRouterProvider(<SystemsLayoutErrorComponent />);
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders system error page correctly', async () => {
    const { asFragment, router } = createView();

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: 'navigate to systems home',
        })
      ).toBeInTheDocument();
    });

    const homeButton = screen.getByRole('button', {
      name: 'navigate to systems home',
    });

    await user.click(homeButton);

    expect(router.state.location.pathname).toBe('/systems');

    expect(asFragment()).toMatchSnapshot();
  });
});

describe('systemsLayoutLoader', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    vi.clearAllMocks();
  });
  it('should fetch system_id is provided', async () => {
    const params = { system_id: '65328f34a40ff5301575a4e3' };
    const output = await systemsLayoutLoader(queryClient)({
      params,
    } as unknown as LoaderFunctionArgs);

    expect(output).toEqual(params);
  });

  it('should throw an error if an invalid system_id is provided', async () => {
    const params = { system_id: '120' };

    await expect(
      systemsLayoutLoader(queryClient)({
        params,
      } as unknown as LoaderFunctionArgs)
    ).rejects.toThrow('Request failed with status code 404');
  });
});
