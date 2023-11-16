import { screen } from '@testing-library/react';
import React from 'react';
import { renderComponentWithBrowserRouter } from '../../setupTests';

import userEvent from '@testing-library/user-event';
import CatalogueItemsDetailsPanel, {
  CatalogueItemsDetailsPanelProps,
} from './CatalogueItemsDetailsPanel.component';

describe('Catalogue Items details panel', () => {
  let user;
  let props: CatalogueItemsDetailsPanelProps;
  const createView = () => {
    return renderComponentWithBrowserRouter(
      <CatalogueItemsDetailsPanel {...props} />
    );
  };

  beforeEach(() => {
    props = {
      catalogueItemIdData: {
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
      catalogueCategoryData: {
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
    };
    user = userEvent.setup();
  });

  it('renders details panel correctly', async () => {
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders properties panel correctly', async () => {
    const view = createView();

    await user.click(screen.getByText('Properties'));

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders manufacturer panel correctly', async () => {
    const view = createView();
    await user.click(screen.getByText('Manufacturer'));

    expect(view.asFragment()).toMatchSnapshot();
  });
});
