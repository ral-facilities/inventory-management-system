import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CatalogueCategory } from '../../app.types';
import { renderComponentWithBrowserRouter } from '../../testUtils';
import CardView, {
  CatalogueCardViewProps,
} from './catalogueCardView.component';

describe('CardView', () => {
  let user;
  let props: CatalogueCardViewProps;
  const onChangeOpenDeleteCategoryDialog = vi.fn();
  const onChangeOpenEditCategoryDialog = vi.fn();
  const onChangeOpenSaveAsDialog = vi.fn();
  const handleToggleSelect = vi.fn();
  const createView = () => {
    return renderComponentWithBrowserRouter(<CardView {...props} />);
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
    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      disconnect: vi.fn(),
      observe: vi.fn(),
      unobserve: vi.fn(),
    }));
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
    createView();

    await waitFor(() => {
      expect(screen.getByText('Test 1')).toBeInTheDocument();
    });

    expect(screen.queryByText('Test 31')).not.toBeInTheDocument();

    const page2 = screen.getByRole('button', { name: 'Go to page 2' });
    await user.click(page2);

    await waitFor(() => {
      expect(screen.getByText('Test 31')).toBeInTheDocument();
    });
  });

  it('changes max results correctly', async () => {
    props.catalogueCategoryData = createData();
    createView();

    await waitFor(() => {
      expect(screen.getByText('Test 1')).toBeInTheDocument();
    });

    expect(screen.queryByText('Test 31')).not.toBeInTheDocument();

    const maxresults = screen.getByRole('combobox');
    await user.click(maxresults);

    await user.click(screen.getByRole('option', { name: '45' }));

    expect(screen.getByText('Test 31')).toBeInTheDocument();
  });
});
