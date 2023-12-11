import React from 'react';
import { renderComponentWithBrowserRouter } from '../../setupTests';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import CatalogueItemDirectoryDialog, {
  CatalogueItemDirectoryDialogProps,
} from './catalogueItemDirectoryDialog.component';

describe('catalogue item directory Dialog', () => {
  let props: CatalogueItemDirectoryDialogProps;
  let user;
  let axiosPatchSpy;
  const onClose = jest.fn();
  const onChangeCatalogueCurrDirId = jest.fn();
  const onChangeSelectedItems = jest.fn();

  const createView = () => {
    return renderComponentWithBrowserRouter(
      <CatalogueItemDirectoryDialog {...props} />
    );
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      onChangeCatalogueCurrDirId: onChangeCatalogueCurrDirId,
      onChangeSelectedItems: onChangeSelectedItems,
      requestType: 'moveTo',
      catalogueCurrDirId: '1',
      parentInfo: {
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
          { name: 'Accuracy', type: 'string', mandatory: false },
        ],
      },
      selectedItems: [
        {
          catalogue_category_id: '5',
          name: 'Energy Meters 26',
          description: 'Precision energy meters for accurate measurements. 26',
          properties: [
            {
              name: 'Measurement Range',
              value: 1000,
              unit: 'Joules',
            },
            {
              name: 'Accuracy',
              value: '±0.5%',
              unit: '',
            },
          ],
          id: '89',
          manufacturer: {
            name: 'Manufacturer A',
            url: 'http://example.com',
            address: '10 My Street',
          },
          cost_gbp: 500,
          cost_to_rework_gbp: null,
          days_to_replace: 7,
          days_to_rework: null,
          drawing_number: null,
          drawing_link: null,
          item_model_number: null,
          is_obsolete: true,
          obsolete_replacement_catalogue_item_id: '6',
          obsolete_reason: 'The item is no longer being manufactured',
        },
        {
          catalogue_category_id: '5',
          name: 'Energy Meters 27',
          description: 'Precision energy meters for accurate measurements. 27',
          properties: [
            {
              name: 'Measurement Range',
              value: 2000,
              unit: 'Joules',
            },
          ],
          id: '6',
          manufacturer: {
            name: 'Manufacturer A',
            url: 'http://example.com',
            address: '10 My Street',
          },
          cost_gbp: 600,
          cost_to_rework_gbp: 89,
          days_to_replace: 7,
          days_to_rework: 60,
          drawing_number: null,
          drawing_link: null,
          item_model_number: null,
          is_obsolete: false,
          obsolete_replacement_catalogue_item_id: null,
          obsolete_reason: null,
        },
      ],
    };
    user = userEvent.setup();

    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
      unobserve: jest.fn(),
    }));
    window.Element.prototype.getBoundingClientRect = jest
      .fn()
      .mockReturnValue({ height: 100, width: 2000 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('Move to', () => {
    beforeEach(() => {
      axiosPatchSpy = jest.spyOn(axios, 'patch');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('calls onClose when cancel is clicked', async () => {
      createView();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onClose).toHaveBeenCalled();
    });
    it('navigates to home when the home button is clicked', async () => {
      createView();
      await waitFor(() => {
        expect(screen.getByText('Cameras')).toBeInTheDocument();
      });
      await user.click(screen.getByLabelText('navigate to catalogue home'));

      expect(onChangeCatalogueCurrDirId).toBeCalledWith(null);
    });

    it('navigates to a new to a new location', async () => {
      createView();
      await waitFor(() => {
        expect(screen.getByText('Cameras')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Energy Meters V2'));
      expect(onChangeCatalogueCurrDirId).toBeCalledWith('8967');
    });

    it('navigates to a new to a new location using the breadcrumbs', async () => {
      props.catalogueCurrDirId = '5';
      createView();
      await waitFor(() => {
        expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
      });
      await user.click(
        screen.getByRole('link', { name: 'beam-characterization' })
      );
      expect(onChangeCatalogueCurrDirId).toBeCalledWith('1');
    });

    it('moves multiple catalogue items', async () => {
      props.catalogueCurrDirId = '8967';
      createView();

      await waitFor(() => {
        expect(
          screen.getByText('No catalogue items found')
        ).toBeInTheDocument();
      });
      const moveButton = screen.getByRole('button', { name: 'Move here' });

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
      props.catalogueCurrDirId = '4';
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
    });
    afterEach(() => {
      jest.clearAllMocks();
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
            'Only the catalogue items details, properies and manufacturer will be copied; no contained items within the catalogue category will be included.'
          )
        ).toBeInTheDocument();
      });

      await user.unhover(infoIcon);

      await waitFor(() => {
        expect(
          screen.queryByText(
            'Only the catalogue items details, properies and manufacturer will be copied; no contained items within the catalogue category will be included.'
          )
        ).not.toBeInTheDocument();
      });
    });
  });
});
