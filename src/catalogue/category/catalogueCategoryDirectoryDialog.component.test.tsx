import React from 'react';
import { renderComponentWithBrowserRouter } from '../../setupTests';
import { screen, waitFor } from '@testing-library/react';
import CatalogueCategoryDirectoryDialog, {
  CatalogueCategoryDirectoryDialogProps,
} from './catalogueCategoryDirectoryDialog.component';
import userEvent from '@testing-library/user-event';
import axios from 'axios';

describe('CatalogueCategoryDirectoryDialog', () => {
  let props: CatalogueCategoryDirectoryDialogProps;
  let user;
  let axiosPatchSpy;
  const onChangeSelectedCategories = jest.fn();
  const onClose = jest.fn();
  const onChangeCatalogueCurrDirId = jest.fn();
  const createView = () => {
    return renderComponentWithBrowserRouter(
      <CatalogueCategoryDirectoryDialog {...props} />
    );
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      selectedCategories: [],
      onChangeSelectedCategories: onChangeSelectedCategories,
      onChangeCatalogueCurrDirId: onChangeCatalogueCurrDirId,
      catalogueCurrDirId: null,
    };

    user = userEvent.setup();

    axiosPatchSpy = jest.spyOn(axios, 'patch');
  });

  afterEach(() => {
    jest.clearAllMocks();
    axiosPatchSpy.mockRestore();
  });

  it('renders dialog correctly with multiple selected categories', async () => {
    props.selectedCategories = [
      {
        id: '1',
        name: 'Beam Characterization',
        parent_id: null,
        code: 'beam-characterization',
        is_leaf: false,
      },
      {
        id: '2',
        name: 'Motion',
        parent_id: null,
        code: 'motion',
        is_leaf: false,
      },
    ];
    createView();
    expect(
      screen.getByText(
        'Move 2 catalogue categories to new a catalogue category'
      )
    ).toBeInTheDocument();
  });

  it('renders dialog correctly with one selected category', async () => {
    props.selectedCategories = [
      {
        id: '1',
        name: 'Beam Characterization',
        parent_id: null,
        code: 'beam-characterization',
        is_leaf: false,
      },
    ];
    createView();
    expect(
      screen.getByText('Move 1 catalogue category to new a catalogue category')
    ).toBeInTheDocument();
  });

  it('calls onClose when Close button is clicked', async () => {
    createView();
    const closeButton = screen.getByRole('button', { name: 'Cancel' });
    user.click(closeButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('highlights the row on hover', async () => {
    createView();

    await waitFor(() => {
      expect(
        screen.getByRole('row', { name: 'Beam Characterization row' })
      ).toBeInTheDocument();
    });

    const row = screen.getByRole('row', { name: 'Beam Characterization row' });

    await user.hover(row);

    expect(row).not.toHaveStyle('background-color: inherit');

    await user.unhover(row);

    await waitFor(() => {
      expect(
        screen.getByRole('row', { name: 'Beam Characterization row' })
      ).toHaveStyle('background-color: inherit');
    });
  });

  it('renders the breadcrumbs and navigate to another directory', async () => {
    props.selectedCategories = [
      {
        id: '1',
        name: 'Beam Characterization',
        parent_id: null,
        code: 'beam-characterization',
        is_leaf: false,
      },
      {
        id: '2',
        name: 'Motion',
        parent_id: null,
        code: 'motion',
        is_leaf: false,
      },
    ];

    props.catalogueCurrDirId = '8';

    createView();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'motion' })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('link', { name: 'motion' }));

    expect(onChangeCatalogueCurrDirId).toBeCalledWith('2');

    await user.click(screen.getByLabelText('navigate to catalogue home'));

    expect(onChangeCatalogueCurrDirId).toBeCalledWith(null);
  });

  it('navigates through the directory table', async () => {
    props.selectedCategories = [
      {
        id: '1',
        name: 'Beam Characterization',
        parent_id: null,
        code: 'beam-characterization',
        is_leaf: false,
      },
      {
        id: '2',
        name: 'Motion',
        parent_id: null,
        code: 'motion',
        is_leaf: false,
      },
    ];

    props.catalogueCurrDirId = null;

    createView();

    await waitFor(() => {
      expect(screen.getByText('Motion')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Vacuum Technology')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Vacuum Technology'));

    expect(onChangeCatalogueCurrDirId).toBeCalledWith('3');
  });

  it('moves multiple catalogue categories', async () => {
    props.selectedCategories = [
      {
        id: '1',
        name: 'Beam Characterization',
        parent_id: null,
        code: 'beam-characterization',
        is_leaf: false,
      },
      {
        id: '2',
        name: 'Motion',
        parent_id: null,
        code: 'motion',
        is_leaf: false,
      },
    ];

    props.catalogueCurrDirId = '3';
    createView();

    const moveButton = screen.getByRole('button', { name: 'Move here' });
    await user.click(moveButton);

    expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-categories/1', {
      parent_id: '3',
    });
    expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-categories/2', {
      parent_id: '3',
    });
    expect(onClose).toBeCalled();
  });
  it('shows loading indicator', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
});
