import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RootState } from '../state/store';
import {
  getInitialState,
  renderComponentWithRouterProvider,
} from '../testUtils';
import SettingsMenuItems from './settingsMenuItems.component';

describe('Settings Menu Items component', () => {
  let settings: HTMLDivElement;
  let user: ReturnType<typeof userEvent.setup>;
  let state: RootState;

  beforeEach(() => {
    state = getInitialState();
    settings = document.createElement('div');
    settings.id = 'settings';
    const ul = document.createElement('ul');
    settings.appendChild(ul);

    document.body.appendChild(settings);

    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createView = (preloadedState?: Partial<RootState>) => {
    return renderComponentWithRouterProvider(
      <SettingsMenuItems />,
      undefined,
      undefined,
      preloadedState
    );
  };
  describe('Admin toggle', () => {
    it('can toggle to admin mode ', async () => {
      state = {
        ...state,
        authorisation: { ...state.authorisation, isPrivilegedUser: true },
      };
      const { store } = createView(state);

      const adminToggleButton = screen.getByText('Switch admin mode on');

      await user.click(adminToggleButton);

      expect(
        await screen.findByText('Switch admin mode off')
      ).toBeInTheDocument();

      expect(store.getState().authorisation.isAdminMode).toStrictEqual(true);
    });

    it('does not display admin toggle if user is not a privileged user', () => {
      createView();
      expect(
        screen.queryByText('Switch admin mode on')
      ).not.toBeInTheDocument();
    });
  });
});
