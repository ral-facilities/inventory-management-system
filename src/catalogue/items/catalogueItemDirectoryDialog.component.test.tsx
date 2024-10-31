import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { MockInstance } from 'vitest';
import { imsApi } from '../../api/api';
import { CatalogueCategoryPropertyType } from '../../api/api.types';
import { renderComponentWithRouterProvider } from '../../testUtils';
import CatalogueItemDirectoryDialog, {
  CatalogueItemDirectoryDialogProps,
} from './catalogueItemDirectoryDialog.component';

describe('catalogue item directory Dialog', () => {
  let props: CatalogueItemDirectoryDialogProps;
  let user: UserEvent;
  let axiosPatchSpy: MockInstance;
  let axiosPostSpy: MockInstance;
  const onClose = vi.fn();
  const onChangeSelectedItems = vi.fn();

  const createView = () => {
    return renderComponentWithRouterProvider(
      <CatalogueItemDirectoryDialog {...props} />
    );
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      onChangeSelectedItems: onChangeSelectedItems,
      parentCategoryId: '1',
      requestType: 'moveTo',
      parentInfo: {
        id: '5',
        name: 'Energy Meters',
        parent_id: '1',
        code: 'energy-meters',
        is_leaf: true,

        properties: [
          {
            id: '7',
            name: 'Measurement Range',
            type: CatalogueCategoryPropertyType.Number,
            unit: 'Joules',
            unit_id: '3',
            mandatory: true,
            allowed_values: null,
          },
          {
            id: '8',
            name: 'Accuracy',
            type: CatalogueCategoryPropertyType.Text,
            unit: null,
            unit_id: null,
            mandatory: false,
            allowed_values: null,
          },
        ],
        created_time: '2024-01-01T12:00:00.000+00:00',
        modified_time: '2024-01-02T13:10:10.000+00:00',
      },
      selectedItems: [
        {
          catalogue_category_id: '5',
          name: 'Energy Meters 26',
          description: 'Precision energy meters for accurate measurements. 26',
          properties: [
            {
              id: '7',
              name: 'Measurement Range',
              value: 1000,
              unit: 'Joules',
              unit_id: '3',
            },
            {
              id: '8',
              name: 'Accuracy',
              value: '±0.5%',
              unit: null,
              unit_id: null,
            },
          ],
          id: '89',
          manufacturer_id: '1',
          cost_gbp: 500,
          cost_to_rework_gbp: null,
          days_to_replace: 7,
          days_to_rework: null,
          expected_lifetime_days: 840,
          drawing_number: null,
          drawing_link: null,
          item_model_number: null,
          is_obsolete: true,
          obsolete_replacement_catalogue_item_id: '6',
          obsolete_reason: 'The item is no longer being manufactured',
          notes: null,
          created_time: '2024-01-01T12:00:00.000+00:00',
          modified_time: '2024-01-02T13:10:10.000+00:00',
        },
        {
          catalogue_category_id: '5',
          name: 'Energy Meters 27',
          description: 'Precision energy meters for accurate measurements. 27',
          properties: [
            {
              id: '7',
              name: 'Measurement Range',
              value: 2000,
              unit: 'Joules',
              unit_id: '3',
            },
            {
              id: '8',
              name: 'Accuracy',
              value: null,
              unit: null,
              unit_id: null,
            },
          ],
          id: '6',
          manufacturer_id: '1',
          cost_gbp: 600,
          cost_to_rework_gbp: 89,
          days_to_replace: 7,
          days_to_rework: 60,
          expected_lifetime_days: null,
          drawing_number: null,
          drawing_link: null,
          item_model_number: null,
          is_obsolete: false,
          obsolete_replacement_catalogue_item_id: null,
          obsolete_reason: null,
          notes: null,
          created_time: '2024-01-01T12:00:00.000+00:00',
          modified_time: '2024-01-02T13:10:10.000+00:00',
        },
      ],
    };
    user = userEvent.setup();

    window.Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockReturnValue({ height: 100, width: 2000 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
  describe('Move to', () => {
    beforeEach(() => {
      axiosPatchSpy = vi.spyOn(imsApi, 'patch');
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('calls onClose when cancel is clicked', async () => {
      createView();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onClose).toHaveBeenCalled();
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

    it('navigates to home when the home button is clicked', async () => {
      createView();

      await waitFor(() => {
        expect(screen.getByText('Cameras')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('navigate to catalogue home'));

      await waitFor(() => {
        expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
      });
    });

    it('navigates to a new to a new location', async () => {
      createView();

      await waitFor(() => {
        expect(screen.getByText('Cameras')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Wavefront Sensors'));

      await waitFor(() => {
        expect(screen.getByText('Wavefront Sensors 30')).toBeInTheDocument();
      });
    });

    it('navigates to a new to a new location using the breadcrumbs', async () => {
      props.parentCategoryId = '5';

      createView();

      await waitFor(() => {
        expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole('link', { name: 'Beam Characterization' })
      );

      await waitFor(() => {
        expect(screen.getByText('Cameras')).toBeInTheDocument();
      });
    });

    it('renders add button when viewing category table, and has duplicate functionality when clicked', async () => {
      props.parentCategoryId = '5';

      createView();

      await waitFor(() => {
        expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole('link', { name: 'Beam Characterization' })
      );

      await waitFor(() => {
        expect(screen.getByText('Cameras')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', {
        name: 'Add Catalogue Category',
      });

      await user.click(addButton);

      expect(
        screen.getByDisplayValue('Energy Meters_copy_1')
      ).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', {
        name: 'Cancel',
      });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText('Cameras')).toBeInTheDocument();
      });
    }, 10000);

    it('moves multiple catalogue items', async () => {
      props.parentCategoryId = '8967';

      createView();

      await waitFor(() => {
        expect(
          screen.getByText('No catalogue items found')
        ).toBeInTheDocument();
      });
      const moveButton = await screen.findByRole('button', {
        name: 'Move here',
      });

      await user.click(moveButton);

      expect(onClose).toHaveBeenCalled();
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/89', {
        catalogue_category_id: '8967',
      });
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/6', {
        catalogue_category_id: '8967',
      });
    });

    it('moves multiple catalogue items to a catalogue category with different catalogue item properties and errors', async () => {
      props.parentCategoryId = '4';

      createView();

      await waitFor(() => {
        expect(
          screen.getByText('No catalogue items found')
        ).toBeInTheDocument();
      });

      const moveButton = screen.getByRole('button', { name: 'Move here' });
      await user.click(moveButton);

      expect(onClose).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(
          screen.getByText(
            'The destination catalogue item properties must precisely match the current destination. Ensure identical attributes, order, and formatting, with no spacing variations.'
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe('Copy to', () => {
    beforeEach(() => {
      props.requestType = 'copyTo';
      axiosPostSpy = vi.spyOn(imsApi, 'post');
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('copies multiple catalogue items (new catalogue category)', async () => {
      props.parentCategoryId = '8967';

      createView();

      await waitFor(() => {
        expect(
          screen.getByText('No catalogue items found')
        ).toBeInTheDocument();
      });

      const moveButton = screen.getByRole('button', { name: 'Copy here' });
      await user.click(moveButton);

      expect(onClose).toHaveBeenCalled();
      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-items', {
        catalogue_category_id: '8967',
        cost_gbp: 500,
        cost_to_rework_gbp: null,
        days_to_replace: 7,
        days_to_rework: null,
        expected_lifetime_days: 840,
        description: 'Precision energy meters for accurate measurements. 26',
        drawing_link: null,
        drawing_number: null,
        id: '89',
        is_obsolete: true,
        item_model_number: null,
        manufacturer_id: '1',
        name: 'Energy Meters 26',
        obsolete_reason: 'The item is no longer being manufactured',
        obsolete_replacement_catalogue_item_id: '6',
        notes: null,
        created_time: '2024-01-01T12:00:00.000+00:00',
        modified_time: '2024-01-02T13:10:10.000+00:00',
        properties: [
          { id: '9', value: 1000 },
          { id: '10', value: '±0.5%' },
        ],
      });
      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-items', {
        catalogue_category_id: '8967',
        cost_gbp: 600,
        cost_to_rework_gbp: 89,
        days_to_replace: 7,
        days_to_rework: 60,
        expected_lifetime_days: null,
        description: 'Precision energy meters for accurate measurements. 27',
        drawing_link: null,
        drawing_number: null,
        id: '6',
        is_obsolete: false,
        item_model_number: null,
        manufacturer_id: '1',
        name: 'Energy Meters 27',
        obsolete_reason: null,
        obsolete_replacement_catalogue_item_id: null,
        notes: null,
        created_time: '2024-01-01T12:00:00.000+00:00',
        modified_time: '2024-01-02T13:10:10.000+00:00',
        properties: [
          { id: '9', value: 2000 },
          { id: '10', value: null },
        ],
      });
    });

    it('copies multiple catalogue items (same catalogue category)', async () => {
      props.parentCategoryId = '5';

      createView();

      await waitFor(() => {
        expect(
          screen.getByText('No catalogue items found')
        ).toBeInTheDocument();
      });

      const moveButton = screen.getByRole('button', { name: 'Copy here' });
      await user.click(moveButton);

      expect(onClose).toHaveBeenCalled();
      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-items', {
        catalogue_category_id: '5',
        cost_gbp: 500,
        cost_to_rework_gbp: null,
        days_to_replace: 7,
        days_to_rework: null,
        expected_lifetime_days: 840,
        description: 'Precision energy meters for accurate measurements. 26',
        drawing_link: null,
        drawing_number: null,
        id: '89',
        is_obsolete: true,
        item_model_number: null,
        manufacturer_id: '1',
        name: 'Energy Meters 26',
        obsolete_reason: 'The item is no longer being manufactured',
        obsolete_replacement_catalogue_item_id: '6',
        notes: null,
        created_time: '2024-01-01T12:00:00.000+00:00',
        modified_time: '2024-01-02T13:10:10.000+00:00',
        properties: [
          { id: '7', value: 1000 },
          { id: '8', value: '±0.5%' },
        ],
      });
      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-items', {
        catalogue_category_id: '5',
        cost_gbp: 600,
        cost_to_rework_gbp: 89,
        days_to_replace: 7,
        days_to_rework: 60,
        expected_lifetime_days: null,
        description: 'Precision energy meters for accurate measurements. 27',
        drawing_link: null,
        drawing_number: null,
        id: '6',
        is_obsolete: false,
        item_model_number: null,
        manufacturer_id: '1',
        name: 'Energy Meters 27',
        obsolete_reason: null,
        obsolete_replacement_catalogue_item_id: null,
        notes: null,
        created_time: '2024-01-01T12:00:00.000+00:00',
        modified_time: '2024-01-02T13:10:10.000+00:00',
        properties: [
          { id: '7', value: 2000 },
          { id: '8', value: null },
        ],
      });
    });

    it('copies multiple catalogue items to a catalogue category with different catalogue item properties and errors', async () => {
      props.parentCategoryId = '4';

      createView();

      await waitFor(() => {
        expect(
          screen.getByText('No catalogue items found')
        ).toBeInTheDocument();
      });

      const moveButton = screen.getByRole('button', { name: 'Copy here' });
      await user.click(moveButton);

      expect(onClose).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(
          screen.getByText(
            'The destination catalogue item properties must precisely match the current destination. Ensure identical attributes, order, and formatting, with no spacing variations.'
          )
        ).toBeInTheDocument();
      });
    });

    it('displays copy warning tooltip', async () => {
      createView();
      await waitFor(() => {
        expect(screen.getByLabelText('Copy Warning')).toBeInTheDocument();
      });

      const infoIcon = screen.getByLabelText('Copy Warning');

      await user.hover(infoIcon);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Only the catalogue items details, properties and manufacturer will be copied; no contained items within the catalogue category will be included.'
          )
        ).toBeInTheDocument();
      });

      await user.unhover(infoIcon);

      await waitFor(() => {
        expect(
          screen.queryByText(
            'Only the catalogue items details, properties and manufacturer will be copied; no contained items within the catalogue category will be included.'
          )
        ).not.toBeInTheDocument();
      });
    });
  });
});
