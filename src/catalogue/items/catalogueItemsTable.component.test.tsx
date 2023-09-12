import React from 'react';
import {
  renderComponentWithBrowserRouter,
  catalogueItemData,
  getCatalogueItemsPropertiesById,
} from '../../setupTests';
import { screen, waitFor } from '@testing-library/react';
import CatalogueItemsTable, {
  CatalogueItemsTableProps,
} from './catalogueItemsTable.component';
import userEvent from '@testing-library/user-event';

describe('Catalogue Items Table', () => {
  let props: CatalogueItemsTableProps;
  let user;

  const createView = () => {
    return renderComponentWithBrowserRouter(<CatalogueItemsTable {...props} />);
  };

  beforeEach(() => {
    props = {
      tableHeight: 'calc(100vh - (64px + 36px + 50px)',
      data: [],
      catalogueItemProperties: [],
    };
    user = userEvent.setup();
  });

  it('renders text correctly', async () => {
    props.catalogueItemProperties = getCatalogueItemsPropertiesById('5');
    props.data = catalogueItemData('5');
    createView();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Measurement Range (Joules)')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
  });

  it('displays descriptions tooltip on hover', async () => {
    props.catalogueItemProperties = getCatalogueItemsPropertiesById('5');
    props.data = catalogueItemData('5');
    createView();

    const infoIcon = screen.getByLabelText(
      'Catalogue item description: Precision energy meters for accurate measurements. 26'
    );

    await user.hover(infoIcon);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Precision energy meters for accurate measurements. 26'
        )
      ).toBeInTheDocument();
    });

    await user.unhover(infoIcon);

    await waitFor(() => {
      expect(
        screen.queryByText(
          'Precision energy meters for accurate measurements. 26'
        )
      ).not.toBeInTheDocument();
    });
  });

  it('highlights the row on hover', async () => {
    props.catalogueItemProperties = getCatalogueItemsPropertiesById('5');
    props.data = catalogueItemData('5');
    createView();

    const row = screen.getByRole('row', { name: 'Energy Meters 26 row' });

    await user.hover(row);

    expect(row).not.toHaveStyle('background-color: inherit');

    await user.unhover(row);

    await waitFor(() => {
      expect(
        screen.getByRole('row', { name: 'Energy Meters 26 row' })
      ).toHaveStyle('background-color: inherit');
    });
  });
});
