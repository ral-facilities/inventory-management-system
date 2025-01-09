import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import type { LoaderFunctionArgs } from 'react-router-dom';
import { paths } from '../App';
import { renderComponentWithRouterProvider } from '../testUtils';
import SystemsLayout, {
  SystemsLayoutErrorComponent,
  systemsLayoutLoader,
} from './systemsLayout.component';

const mockedUseNavigate = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUseNavigate,
}));

describe('Systems Layout', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createView = (path: string, urlPathKey: keyof typeof paths) => {
    return renderComponentWithRouterProvider(
      <SystemsLayout />,
      urlPathKey,
      path
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
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('calls useNavigate when the home button is clicked', async () => {
    createView('/systems/65328f34a40ff5301575a4e3', 'system');

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });

    const homeButton = screen.getByRole('button', {
      name: 'navigate to systems home',
    });

    await user.click(homeButton);

    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/systems');
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
    const view = createView();

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

    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/systems');

    expect(view.asFragment()).toMatchSnapshot();
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
