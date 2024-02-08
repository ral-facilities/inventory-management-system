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
  let axiosPostSpy;
  const onChangeSelectedCategories = jest.fn();
  const onClose = jest.fn();
  const onChangeCatalogueCurrDirId = jest.fn();
  const createView = () => {
    return renderComponentWithBrowserRouter(
      <CatalogueCategoryDirectoryDialog {...props} />
    );
  };

  describe('Move to', () => {
    beforeEach(() => {
      props = {
        open: true,
        onClose: onClose,
        selectedCategories: [],
        onChangeSelectedCategories: onChangeSelectedCategories,
        onChangeCatalogueCurrDirId: onChangeCatalogueCurrDirId,
        catalogueCurrDirId: null,
        requestType: 'moveTo',
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
          'Move 2 catalogue categories to a different catalogue category'
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
        screen.getByText(
          'Move 1 catalogue category to a different catalogue category'
        )
      ).toBeInTheDocument();
    });

    it('calls onClose when Close button is clicked', async () => {
      createView();
      const closeButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(closeButton);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
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
        expect(
          screen.getByRole('link', { name: 'motion' })
        ).toBeInTheDocument();
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
  });

  describe('Copy to', () => {
    beforeEach(() => {
      props = {
        open: true,
        onClose: onClose,
        selectedCategories: [],
        onChangeSelectedCategories: onChangeSelectedCategories,
        onChangeCatalogueCurrDirId: onChangeCatalogueCurrDirId,
        catalogueCurrDirId: null,
        requestType: 'copyTo',
      };

      user = userEvent.setup();

      axiosPostSpy = jest.spyOn(axios, 'post');
    });

    afterEach(() => {
      jest.clearAllMocks();
      axiosPostSpy.mockRestore();
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
          'Copy 2 catalogue categories to a different catalogue category'
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
        screen.getByText(
          'Copy 1 catalogue category to a different catalogue category'
        )
      ).toBeInTheDocument();
    });

    it('copies multiple catalogue categories', async () => {
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
        {
          id: '5',
          name: 'Energy Meters',
          parent_id: '1',
          code: 'energy-meters',
          is_leaf: true,
          catalogue_item_properties: [
            {
              name: 'Measurement Range',
              type: 'number',
              unit: 'Joules',
              mandatory: true,
            },
            {
              name: 'Accuracy',
              type: 'string',
              mandatory: false,
            },
          ],
        },
      ];

      props.catalogueCurrDirId = '3';
      createView();

      const copyButton = screen.getByRole('button', { name: 'Copy here' });
      await user.click(copyButton);

      props.selectedCategories.forEach((selectedCategory) =>
        expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-categories', {
          ...selectedCategory,
          name: selectedCategory.name,
          parent_id: '3',
        })
      );
      expect(onClose).toBeCalled();
    });

    it('displays descriptions tooltip on hover', async () => {
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

      const infoIcon = screen.getByLabelText('Copy Warning');

      await user.hover(infoIcon);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Only the catalogue category details will be copied; no contained catalogue categories or catalogue items within the catalogue category will be included.'
          )
        ).toBeInTheDocument();
      });

      await user.unhover(infoIcon);

      await waitFor(() => {
        expect(
          screen.queryByText(
            'Only the catalogue category details will be copied; no contained catalogue categories or catalogue items within the catalogue category will be included.'
          )
        ).not.toBeInTheDocument();
      });
    });

    it('copies multiple catalogue categories (move category into the same directory)', async () => {
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

      const copyButton = screen.getByRole('button', { name: 'Copy here' });
      await user.click(copyButton);

      props.selectedCategories.forEach((selectedCategory) =>
        expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-categories', {
          ...selectedCategory,
          name: `${selectedCategory.name}_copy_1`,
        })
      );
      expect(onClose).toBeCalled();
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
  });
});
