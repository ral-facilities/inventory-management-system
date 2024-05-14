import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { imsApi } from '../../api/api';
import { renderComponentWithRouterProvider } from '../../testUtils';
import CatalogueCategoryDirectoryDialog, {
  CatalogueCategoryDirectoryDialogProps,
} from './catalogueCategoryDirectoryDialog.component';

describe('CatalogueCategoryDirectoryDialog', () => {
  let props: CatalogueCategoryDirectoryDialogProps;
  let user: UserEvent;
  let axiosPatchSpy;
  let axiosPostSpy;
  const onChangeSelectedCategories = vi.fn();
  const onClose = vi.fn();
  const createView = () => {
    return renderComponentWithRouterProvider(
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
        parentCategoryId: null,
        requestType: 'moveTo',
      };

      user = userEvent.setup();

      axiosPatchSpy = vi.spyOn(imsApi, 'patch');
    });

    afterEach(() => {
      vi.clearAllMocks();
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

    it('does not close dialog on background click, or on escape key press', async () => {
      createView();

      await userEvent.click(document.body);

      expect(onClose).not.toHaveBeenCalled();

      fireEvent.keyDown(screen.getByRole('dialog'), {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        charCode: 27,
      });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('renders the breadcrumbs and can navigate to another directory', async () => {
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

      props.parentCategoryId = '8';

      createView();

      await waitFor(() => {
        expect(screen.getByText('Motorized Actuators')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('link', { name: 'motion' }));

      await waitFor(() => {
        expect(screen.getByText('Actuators')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('navigate to catalogue home'));

      await waitFor(() => {
        expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
      });
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

      props.parentCategoryId = null;

      createView();

      await waitFor(() => {
        expect(screen.getByText('Vacuum Technology')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Vacuum Technology'));

      await waitFor(() => {
        expect(screen.getByText('Vacuum Pumps')).toBeInTheDocument();
      });
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

      props.parentCategoryId = '3';
      createView();

      const moveButton = screen.getByRole('button', { name: 'Move here' });
      await waitFor(() => {
        expect(moveButton).not.toBeDisabled();
      });
      await user.click(moveButton);

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-categories/1', {
        parent_id: '3',
      });
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-categories/2', {
        parent_id: '3',
      });
      expect(onClose).toHaveBeenCalled();
    });

    it('renders add dialog when button is clicked and closes it', async () => {
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

      props.parentCategoryId = null;

      createView();

      const addButton = screen.getByRole('button', {
        name: 'Add Catalogue Category',
      });
      await user.click(addButton);
      //Used 'Name*' as 'Add Catalogue Category is the same as button name
      expect(screen.getByText('Name *')).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', {
        name: 'Cancel',
      });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText('Vacuum Technology')).toBeInTheDocument();
      });
    });
  });

  describe('Copy to', () => {
    beforeEach(() => {
      props = {
        open: true,
        onClose: onClose,
        selectedCategories: [],
        onChangeSelectedCategories: onChangeSelectedCategories,
        parentCategoryId: null,
        requestType: 'copyTo',
      };

      user = userEvent.setup();

      axiosPostSpy = vi.spyOn(imsApi, 'post');
    });

    afterEach(() => {
      vi.clearAllMocks();
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

      props.parentCategoryId = '3';
      createView();

      const copyButton = screen.getByRole('button', { name: 'Copy here' });
      await waitFor(() => {
        expect(copyButton).not.toBeDisabled();
      });
      await user.click(copyButton);

      props.selectedCategories.forEach((selectedCategory) =>
        expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-categories', {
          ...selectedCategory,
          name: selectedCategory.name,
          parent_id: '3',
        })
      );
      expect(onClose).toHaveBeenCalled();
    });

    it('copies a catalogue category to a location with a duplicate code but not a duplicate name', async () => {
      props.selectedCategories = [
        {
          id: '111',
          name: 'Vacuum pumps',
          parent_id: null,
          code: 'vacuum-pumps',
          is_leaf: false,
        },
      ];

      props.parentCategoryId = '3';
      createView();

      const copyButton = screen.getByRole('button', { name: 'Copy here' });
      await waitFor(() => {
        expect(copyButton).not.toBeDisabled();
      });
      await user.click(copyButton);

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-categories', {
        ...props.selectedCategories[0],
        name: 'Vacuum pumps_copy_1',
        parent_id: '3',
      });

      expect(onClose).toHaveBeenCalled();
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
      await waitFor(() => {
        expect(copyButton).not.toBeDisabled();
      });
      await user.click(copyButton);

      props.selectedCategories.forEach((selectedCategory) =>
        expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-categories', {
          ...selectedCategory,
          name: `${selectedCategory.name}_copy_1`,
        })
      );
      expect(onClose).toHaveBeenCalled();
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

      props.parentCategoryId = null;

      createView();

      await waitFor(() => {
        expect(screen.getByText('Vacuum Technology')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Vacuum Technology'));

      await waitFor(() => {
        expect(screen.getByText('Vacuum Pumps')).toBeInTheDocument();
      });
    });
  });
});
