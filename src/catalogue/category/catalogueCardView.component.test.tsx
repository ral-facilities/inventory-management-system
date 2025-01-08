import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { CatalogueCategory } from '../../api/api.types';
import { renderComponentWithRouterProvider } from '../../testUtils';
import CardView, {
  CatalogueCardViewProps,
} from './catalogueCardView.component';

describe('CardView', () => {
  let user: UserEvent;
  let props: CatalogueCardViewProps;
  const onChangeOpenDeleteCategoryDialog = vi.fn();
  const onChangeOpenEditCategoryDialog = vi.fn();
  const onChangeOpenDuplicateDialog = vi.fn();
  const handleToggleSelect = vi.fn();
  const createView = () => {
    return renderComponentWithRouterProvider(
      <CardView {...props} />,
      'catalogue',
      '/catalogue'
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
    props = {
      catalogueCategoryData: createData(),
      onChangeOpenDeleteCategoryDialog: onChangeOpenDeleteCategoryDialog,
      onChangeOpenEditCategoryDialog: onChangeOpenEditCategoryDialog,
      onChangeOpenDuplicateDialog: onChangeOpenDuplicateDialog,
      handleToggleSelect: handleToggleSelect,
      selectedCategories: [],
    };

    user = userEvent.setup();

    window.Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockReturnValue({ height: 100, width: 200 });
  });

  afterEach(() => {
    vi.clearAllMocks();
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
