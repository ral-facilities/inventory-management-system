import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { URLPathKeyType } from '../paths';
import { renderComponentWithRouterProvider } from '../testUtils';
import SettingsLayout, {
  SettingsErrorComponent,
} from './settingsLayout.component';

const mockedUseNavigate = vi.fn();

vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => mockedUseNavigate,
}));

describe('Settings Layout', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });
  const createView = (path: string, urlPathKey: URLPathKeyType) => {
    return renderComponentWithRouterProvider(
      <SettingsLayout />,
      urlPathKey,
      path
    );
  };

  it('renders settings layout page correctly', async () => {
    const view = createView('/settings', 'settings');

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: 'navigate to settings home',
        })
      ).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders units breadcrumbs correctly', async () => {
    const view = createView('/settings/units', 'settingsUnits');

    await waitFor(() => {
      expect(screen.getByText('Units')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders usage statuses breadcrumbs correctly', async () => {
    const view = createView(
      '/settings/usage-statuses',
      'settingsUsageStatuses'
    );

    await waitFor(() => {
      expect(screen.getByText('Usage statuses')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('calls useNavigate when the home button is clicked', async () => {
    createView('/settings/usage-statuses', 'settingsUsageStatuses');

    await waitFor(() => {
      expect(screen.getByText('Usage statuses')).toBeInTheDocument();
    });

    const homeButton = screen.getByRole('button', {
      name: 'navigate to settings home',
    });

    await user.click(homeButton);

    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/settings');
  });
});

describe('Settings Error Component', () => {
  const createView = () => {
    return renderComponentWithRouterProvider(<SettingsErrorComponent />);
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders Settings error page correctly', async () => {
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });
});
