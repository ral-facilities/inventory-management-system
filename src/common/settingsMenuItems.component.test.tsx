import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import handleTransferState from '../handleTransferState';
import { server } from '../mocks/server';
import { RootState } from '../state/store';
import { renderComponentWithRouterProvider } from '../testUtils';
import SettingsMenuItems from './settingsMenuItems.component';

vi.mock('../handleTransferState');
describe('Settings Menu Items component', () => {
  let settings: HTMLDivElement;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
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
      const { store } = createView({
        authorisation: { role: 'admin', isAdminMode: false, isAdminUser: true },
      });

      const adminToggleButton = screen.getByText('Switch admin mode on');

      await user.click(adminToggleButton);

      expect(
        await screen.findByText('Switch admin mode off')
      ).toBeInTheDocument();

      expect(store.getState().authorisation.isAdminMode).toStrictEqual(true);
    });

    it('does not display admin toggle if user is not a admin user', () => {
      createView();
      expect(
        screen.queryByText('Switch admin mode on')
      ).not.toBeInTheDocument();
    });
  });

  describe('Critical mode toggle', () => {
    it('can toggle critical mode on ', async () => {
      const { store } = createView();

      const criticalToggleButton = screen.getByText('Switch critical mode on');

      await user.click(criticalToggleButton);

      expect(
        await screen.findByText('Switch critical mode off')
      ).toBeInTheDocument();

      expect(store.getState().criticality.isCriticalMode).toStrictEqual(true);

      expect(handleTransferState).toHaveBeenCalledTimes(2);
      expect(handleTransferState).toHaveBeenCalledWith([
        {
          name: 'Criticality',
          message: 'Last updated at 10 Mar 2026 17:12',
          state: 'info',
        },
      ]);

      expect(handleTransferState).toHaveBeenCalledWith([
        {
          name: 'Criticality',
          message: 'Next scheduled run at 10 Mar 2026 17:12',
          state: 'info',
        },
      ]);
    });

    it('displays warning message, when job is not found', async () => {
      server.use(
        http.get('jobs/criticality', () => {
          return HttpResponse.json(
            {
              detail: 'Job not found',
            },
            { status: 404 }
          );
        })
      );

      const { store } = createView();

      const criticalToggleButton = screen.getByText('Switch critical mode on');

      await user.click(criticalToggleButton);

      expect(
        await screen.findByText('Switch critical mode off')
      ).toBeInTheDocument();

      expect(store.getState().criticality.isCriticalMode).toStrictEqual(true);

      expect(handleTransferState).toBeCalled();
      expect(handleTransferState).toHaveBeenCalledWith([
        {
          name: 'Critical Mode',
          message: 'Job not found. Please contact support.',
          state: 'warning',
        },
      ]);
    });

    it('displays warning message, when ims job scheduler is not enabled', async () => {
      server.use(
        http.get('jobs/criticality', () => {
          return HttpResponse.error();
        })
      );

      const { store } = createView();

      const criticalToggleButton = screen.getByText('Switch critical mode on');

      await user.click(criticalToggleButton);

      expect(
        await screen.findByText('Switch critical mode off')
      ).toBeInTheDocument();

      expect(store.getState().criticality.isCriticalMode).toStrictEqual(true);

      expect(handleTransferState).toBeCalled();
      expect(handleTransferState).toHaveBeenCalledWith([
        {
          name: 'Critical Mode',
          message: 'Not enabled. Please contact support to enable it.',
          state: 'warning',
        },
      ]);
    });
  });
});
