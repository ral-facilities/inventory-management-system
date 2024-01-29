import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  renderComponentWithBrowserRouter,
} from '../../setupTests';
import CardView, { CardViewProps } from './catalogueCardView.component';
import { CatalogueCategory } from '../../app.types';

describe('CardView', () => {
  let user;
  let props: CardViewProps;
  const onChangeOpenDeleteCategoryDialog = jest.fn();
  const onChangeOpenEditCategoryDialog = jest.fn();
  const onChangeOpenSaveAsDialog = jest.fn();
  const handleToggleSelect = jest.fn();
  const createView = () => {
    return renderComponentWithBrowserRouter(<CardView {...props} />);
  };

  function createData(): CatalogueCategory[] {
    let data: CatalogueCategory[] = [];
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
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
      unobserve: jest.fn(),
    }));
    window.Element.prototype.getBoundingClientRect = jest
      .fn()
      .mockReturnValue({ height: 100, width: 200 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders pagination component correctly', async () => {
    props.catalogueCategoryData = createData();
    createView();

    await waitFor(() => {
      expect(screen.getByText('Test 1')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('pagination')).toBeInTheDocument();
    expect(screen.getByText('Max Results')).toBeInTheDocument();
  });

  it('change page correctly changes and rerenders data', async () => {
    props.catalogueCategoryData = createData();
    createView();

    await waitFor(() => {
      expect(screen.getByText('Test 1')).toBeInTheDocument();
    });

    const page2 = screen.getByRole('button', { name: 'Go to page 2' });
    user.click(page2);

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
