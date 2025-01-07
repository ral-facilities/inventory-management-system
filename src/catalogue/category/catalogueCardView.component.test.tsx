import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { CatalogueCategory } from '../../api/api.types';
import { paths } from '../../App';
import { server } from '../../mocks/server';
import { renderComponentWithRouterProvider } from '../../testUtils';
import CardView from './catalogueCardView.component';

describe('CardView', () => {
  let user: UserEvent;

  const createView = (path?: string, urlPathKey?: keyof typeof paths) => {
    return renderComponentWithRouterProvider(
      <CardView />,
      urlPathKey || 'catalogue',
      path || '/catalogue'
    );
  };

  function createData(): CatalogueCategory[] {
    const data: CatalogueCategory[] = [];
    for (let index = 1; index < 50; index++) {
      data.push({
        id: index.toString(),
        name: 'Test ' + index.toString(),
        parent_id: null,
        code: index.toString(),
        is_leaf: true,
        created_time: '2024-01-01T12:00:00.000+00:00',
        modified_time: '2024-01-02T13:10:10.000+00:00',
        properties: [],
      });
    }
    return data;
  }

  beforeEach(() => {
    user = userEvent.setup();

    window.Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockReturnValue({ height: 100, width: 200 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('progress bar renders correctly', async () => {
    createView('/catalogue');

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('redirects to catalogue items if isLeaf is true ', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const { router } = createView('/catalogue/4', 'catalogueCategories');

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/catalogue/4/items');
    });
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('renders catalogue category card view correctly', async () => {
    createView('/catalogue');

    await waitFor(() => {
      expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
    });
    expect(screen.getByText('Motion')).toBeInTheDocument();
    expect(screen.getByText('Vacuum Technology')).toBeInTheDocument();
    expect(screen.getByText('High Power Lasers')).toBeInTheDocument();
    expect(screen.getByText('X-RAY Beams')).toBeInTheDocument();
  });

  it('opens the add catalogue category dialog', async () => {
    createView('/catalogue');

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    const addButton = screen.getByRole('button', {
      name: 'Add Catalogue Category',
    });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('no results found page after X-rays opened', async () => {
    createView('/catalogue/16', 'catalogueCategories');

    await waitFor(() => {
      expect(
        screen.getByText(
          'There are no catalogue categories. Please add a category using the button in the top left of your screen'
        )
      ).toBeInTheDocument();
    });
  });

  it('root has no categories so there is no results page', async () => {
    server.use(
      http.get('/v1/catalogue-categories', () => {
        return HttpResponse.json([], { status: 200 });
      })
    );

    createView('/catalogue');

    await waitFor(() => {
      expect(
        screen.getByText(
          'There are no catalogue categories. Please add a category using the button in the top left of your screen'
        )
      ).toBeInTheDocument();
    });
  });

  it('opens the delete catalogue category dialog', async () => {
    createView('/catalogue');

    await waitFor(() => {
      expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
    });

    const actionsButton = screen.getByRole('button', {
      name: 'actions Beam Characterization catalogue category button',
    });
    await user.click(actionsButton);

    const deleteButton = screen.getByRole('menuitem', {
      name: 'delete Beam Characterization catalogue category button',
    });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('can open the edit catalogue category dialog and close it again', async () => {
    createView('/catalogue/1', 'catalogueCategories');

    await waitFor(() => {
      expect(screen.getByText('Amp Meters')).toBeInTheDocument();
    });

    const actionsButton = screen.getByRole('button', {
      name: 'actions Amp Meters catalogue category button',
    });
    await user.click(actionsButton);

    const editButton = screen.getByRole('menuitem', {
      name: 'edit Amp Meters catalogue category button',
    });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });

    await user.type(screen.getByLabelText('Name *'), '1');
    await user.click(saveButton);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('can open the duplicate catalogue category dialog and close it again', async () => {
    createView('/catalogue/1', 'catalogueCategories');

    await waitFor(() => {
      expect(screen.getByText('Amp Meters')).toBeInTheDocument();
    });

    const actionsButton = screen.getByRole('button', {
      name: 'actions Amp Meters catalogue category button',
    });
    await user.click(actionsButton);

    const editButton = screen.getByRole('menuitem', {
      name: 'duplicate Amp Meters catalogue category button',
    });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });

    await user.type(screen.getByLabelText('Name *'), '1');
    await user.click(saveButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('opens move catalogue category dialog and can closes the dialog', async () => {
    createView('/catalogue/1', 'catalogueCategories');

    await waitFor(() => {
      expect(screen.getByText('Cameras')).toBeInTheDocument();
    });

    const camerasCheckbox = screen.getByLabelText('Cameras checkbox');

    await user.click(camerasCheckbox);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Move to' })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Move to' }));

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('opens copy catalogue category dialog and can close the dialog', async () => {
    createView('/catalogue/1', 'catalogueCategories');

    await waitFor(() => {
      expect(screen.getByText('Cameras')).toBeInTheDocument();
    });

    const camerasCheckbox = screen.getByLabelText('Cameras checkbox');

    await user.click(camerasCheckbox);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Copy to' })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Copy to' }));

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('selects and deselects catalogue categories', async () => {
    createView('/catalogue/1', 'catalogueCategories');

    await waitFor(() => {
      expect(screen.getByText('Energy Meters')).toBeInTheDocument();
    });

    const energyMetersCheckbox = screen.getByLabelText(
      'Energy Meters checkbox'
    );

    await user.click(energyMetersCheckbox);

    const camerasCheckbox = screen.getByLabelText('Cameras checkbox');

    await user.click(camerasCheckbox);

    await user.click(energyMetersCheckbox);
    await user.click(camerasCheckbox);

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Move to' })
      ).not.toBeInTheDocument();
    });
  });

  it('selects and deselects all catalogue categories', async () => {
    createView('/catalogue/1', 'catalogueCategories');

    await waitFor(() => {
      expect(screen.getByText('Energy Meters')).toBeInTheDocument();
    });

    const energyMetersCheckbox = screen.getByLabelText(
      'Energy Meters checkbox'
    );

    await user.click(energyMetersCheckbox);

    const camerasCheckbox = screen.getByLabelText('Cameras checkbox');

    await user.click(camerasCheckbox);

    const clearSelected = await screen.findByRole('button', {
      name: '2 selected',
    });

    await user.click(clearSelected);

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Move to' })
      ).not.toBeInTheDocument();
    });
  });

  describe('pagination', () => {
    beforeEach(() => {
      server.use(
        http.get('/v1/catalogue-categories', () => {
          return HttpResponse.json(createData(), { status: 200 });
        })
      );
    });
    it('renders pagination component correctly', async () => {
      createView();

      await waitFor(() => {
        expect(screen.getByText('Test 1')).toBeInTheDocument();
      });

      expect(screen.getByText('Categories per page')).toBeInTheDocument();
    });

    it('toggles filter visibility when clicking the toggle button', async () => {
      createView();

      await waitFor(() => {
        expect(screen.getByText('Test 1')).toBeInTheDocument();
      });

      expect(screen.queryByText('Hide Filters')).not.toBeInTheDocument();
      expect(screen.getByText('Show Filters')).toBeInTheDocument();

      await user.click(screen.getByText('Show Filters'));

      expect(screen.getByText('Hide Filters')).toBeInTheDocument();
      expect(screen.getByText('Categories per page')).toBeInTheDocument();

      await user.click(screen.getByText('Hide Filters'));

      expect(screen.queryByText('Hide Filters')).not.toBeInTheDocument();
      expect(screen.getByText('Show Filters')).toBeInTheDocument();
    });

    it('changes page correctly and rerenders data', async () => {
      const { router } = createView();

      await waitFor(() => {
        expect(screen.getByText('Test 1')).toBeInTheDocument();
      });
      expect(screen.queryByText('Test 31')).not.toBeInTheDocument();
      expect(router.state.location.search).toBe('');

      await user.click(screen.getByRole('button', { name: 'Go to page 2' }));

      await waitFor(() => {
        expect(screen.getByText('Test 31')).toBeInTheDocument();
      });
      expect(screen.queryByText('Test 1')).not.toBeInTheDocument();
      expect(router.state.location.search).toBe(
        '?state=N4IgDiBcpghg5gUwMoEsBeioGYAMAacBRASQDsATRADygEYBfBoA'
      );

      await user.click(screen.getByRole('button', { name: 'Go to page 1' }));

      await waitFor(() => {
        expect(screen.getByText('Test 1')).toBeInTheDocument();
      });
      expect(screen.queryByText('Test 31')).not.toBeInTheDocument();
      expect(router.state.location.search).toBe('');
    });

    it('changes max results correctly', async () => {
      const { router } = createView();

      await waitFor(() => {
        expect(screen.getByText('Test 1')).toBeInTheDocument();
      });
      expect(screen.queryByText('Test 31')).not.toBeInTheDocument();
      expect(router.state.location.search).toBe('');

      const maxResults = screen.getByRole('combobox');
      await user.click(maxResults);
      await user.click(screen.getByRole('option', { name: '45' }));

      expect(screen.getByText('Test 31')).toBeInTheDocument();
      expect(router.state.location.search).toBe(
        '?state=N4IgDiBcpghg5gUwMoEsBeioBYCsAacBRASQDsATRADygAYBfBoA'
      );

      await user.click(maxResults);
      await user.click(screen.getByRole('option', { name: '30' }));

      await waitFor(() => {
        expect(screen.getByText('Test 1')).toBeInTheDocument();
      });
      expect(screen.queryByText('Test 31')).not.toBeInTheDocument();
      expect(router.state.location.search).toBe('');
    });

    it('can change the table filters and clear the table filters', async () => {
      createView();

      expect(await screen.findByText('Test 1')).toBeInTheDocument();

      await user.click(screen.getByText('Show Filters'));

      expect(await screen.findByText('Hide Filters')).toBeInTheDocument();

      const nameInput = screen.getByLabelText('Filter by Name');
      await user.type(nameInput, 'Test 1');
      await waitFor(() => {
        expect(screen.queryByText('Test 2')).not.toBeInTheDocument();
      });
      const clearFiltersButton = screen.getByRole('button', {
        name: 'Clear Filters',
      });

      await user.click(clearFiltersButton);
      expect(await screen.findByText('Test 1')).toBeInTheDocument();

      expect(clearFiltersButton).toBeDisabled();
    });

    it('renders the multi-select filter mode dropdown correctly', async () => {
      createView();

      await waitFor(() =>
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      );

      await user.click(screen.getByText('Show Filters'));

      const dropdownButtons = await screen.findAllByTestId('FilterListIcon');

      expect(dropdownButtons[3]).toBeInTheDocument();

      await user.click(dropdownButtons[3]);

      const includeAnyText = await screen.findByRole('menuitem', {
        name: 'Includes any',
      });
      const excludeAnyText = await screen.findByRole('menuitem', {
        name: 'Excludes any',
      });

      const includeAllText = await screen.findByRole('menuitem', {
        name: 'Includes all',
      });
      const excludeAllText = await screen.findByRole('menuitem', {
        name: 'Excludes all',
      });

      expect(includeAnyText).toBeInTheDocument();
      expect(excludeAnyText).toBeInTheDocument();
      expect(includeAllText).toBeInTheDocument();
      expect(excludeAllText).toBeInTheDocument();
    });
  });
});
