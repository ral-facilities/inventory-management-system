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
  const onChangeOpenSaveAsDialog = vi.fn();
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
      catalogueCategoryData: [],
      onChangeOpenDeleteCategoryDialog: onChangeOpenDeleteCategoryDialog,
      onChangeOpenEditCategoryDialog: onChangeOpenEditCategoryDialog,
      onChangeOpenSaveAsDialog: onChangeOpenSaveAsDialog,
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
    props.catalogueCategoryData = createData();
    createView();

    await waitFor(() => {
      expect(screen.getByText('Test 1')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('pagination')).toBeInTheDocument();
    expect(screen.getByText('Categories per page')).toBeInTheDocument();
  });

  it('changes page correctly and rerenders data', async () => {
    props.catalogueCategoryData = createData();
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
      '?state=N4IgDiBcpghg5gUwMoEsBeioGYAMAacBRASQDsATRADygCYBfBoA'
    );

    await user.click(screen.getByRole('button', { name: 'Go to page 1' }));

    await waitFor(() => {
      expect(screen.getByText('Test 1')).toBeInTheDocument();
    });
    expect(screen.queryByText('Test 31')).not.toBeInTheDocument();
    expect(router.state.location.search).toBe('');
  });

  it('changes max results correctly', async () => {
    props.catalogueCategoryData = createData();
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
      '?state=N4IgDiBcpghg5gUwMoEsBeioBYCsAacBRASQDsATRADygEYBfBoA'
    );

    await user.click(maxResults);
    await user.click(screen.getByRole('option', { name: '30' }));

    await waitFor(() => {
      expect(screen.getByText('Test 1')).toBeInTheDocument();
    });
    expect(screen.queryByText('Test 31')).not.toBeInTheDocument();
    expect(router.state.location.search).toBe('');
  });
});
