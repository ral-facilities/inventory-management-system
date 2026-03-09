import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import APIConfigProvider from '../../apiConfigProvider.component';
import { server } from '../../mocks/server';
import { URLPathKeyType } from '../../paths';
import { RootState } from '../../state/store';
import { renderComponentWithRouterProvider } from '../../testUtils';
import CatalogueItemLayout from './catalogueItemLayout.component';

describe('Catalogue Item Layout', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });
  const createView = (
    path: string,
    urlPathKey: URLPathKeyType,
    preloadedState?: Partial<RootState>
  ) => {
    return renderComponentWithRouterProvider(
      <APIConfigProvider>
        <CatalogueItemLayout />
      </APIConfigProvider>,
      urlPathKey,
      path,
      preloadedState
    );
  };

  it('renders catalogue items landing page title correctly', async () => {
    createView('/catalogue/5/items/89', 'catalogueItem');
    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
  });

  it('renders catalogue items landing page title correctly when is_flagged is true (critical mode)', async () => {
    createView('/catalogue/6/items/10', 'catalogueItem', {
      criticality: { isCriticalMode: true },
    });
    await waitFor(() => {
      expect(screen.getByText('Wavefront Sensors 31')).toBeInTheDocument();
    });

    expect(screen.getByTestId('ErrorIcon')).toBeInTheDocument();

    await user.hover(screen.getByTestId('ErrorIcon'));

    expect(
      await screen.findByText('This catalogue item is critical.')
    ).toBeInTheDocument();
  });

  it('renders catalogue items landing page title correctly when spares definition is not defined', async () => {
    server.use(
      http.get('/v1/settings/spares-definition', () => {
        return HttpResponse.json(undefined, { status: 204 });
      })
    );
    createView('/catalogue/6/items/10', 'catalogueItem', {
      criticality: { isCriticalMode: true },
    });
    await waitFor(() => {
      expect(screen.getByText('Wavefront Sensors 31')).toBeInTheDocument();
    });

    await waitFor(() =>
      expect(screen.queryByTestId('ErrorIcon')).not.toBeInTheDocument()
    );
  });

  it('renders catalogue items landing page title correctly when is_flagged is null (critical mode)', async () => {
    createView('/catalogue/6/items/9', 'catalogueItem', {
      criticality: { isCriticalMode: true },
    });
    await waitFor(() => {
      expect(screen.getByText('Wavefront Sensors 30')).toBeInTheDocument();
    });

    expect(screen.getByTestId('WarningIcon')).toBeInTheDocument();

    await user.hover(screen.getByTestId('WarningIcon'));

    expect(
      await screen.findByText(
        'Unable to determine if this catalogue item is critical. If the expected lifetime is "None" please update this field. Otherwise wait until this is recalculated.'
      )
    ).toBeInTheDocument();
  });

  it('renders catalogue items landing page title correctly when is_flagged is false (critical mode)', async () => {
    createView('/catalogue/4/items/1', 'catalogueItem', {
      criticality: { isCriticalMode: true },
    });
    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    await user.hover(screen.getAllByTestId('CheckCircleIcon')[0]);

    expect(
      await screen.findByText('This catalogue item is not critical.')
    ).toBeInTheDocument();
  });

  it('renders the items page correctly', async () => {
    createView('/catalogue/4/items/1/items', 'items');

    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });
    expect(screen.getByText('(Items)')).toBeInTheDocument();
  });

  it('renders the item landing page page correctly', async () => {
    createView('/catalogue/4/items/1/items/KvT2Ox7n', 'item');

    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });
    expect(screen.getByText('(Item Details)')).toBeInTheDocument();
  });
});
