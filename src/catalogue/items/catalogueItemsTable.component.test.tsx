import React from 'react';
import { renderComponentWithBrowserRouter } from '../../setupTests';
import { screen, waitFor, within } from '@testing-library/react';
import CatalogueItemsTable, {
  CatalogueItemsTableProps,
} from './catalogueItemsTable.component';
import userEvent from '@testing-library/user-event';

describe('Catalogue Items Table', () => {
  let props: CatalogueItemsTableProps;
  let user;
  const onChangeCatalogueItemDetails = jest.fn();
  const onChangeCatalogueItemManufacturer = jest.fn();
  const onChangeCatalogueItemPropertyValues = jest.fn();

  const createView = () => {
    return renderComponentWithBrowserRouter(<CatalogueItemsTable {...props} />);
  };

  beforeEach(() => {
    props = {
      catalogueItemDetails: { name: undefined, description: '' },
      onChangeCatalogueItemDetails: onChangeCatalogueItemDetails,
      catalogueItemManufacturer: {
        name: '',
        url: '',
        address: '',
      },
      onChangeCatalogueItemManufacturer: onChangeCatalogueItemManufacturer,
      catalogueItemPropertyValues: [12, '23'],
      onChangeCatalogueItemPropertyValues: onChangeCatalogueItemPropertyValues,
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
    };
    user = userEvent.setup();
  });

  it('renders text correctly', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Measurement Range (Joules)')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
    expect(screen.getByText('Manufacturer Name')).toBeInTheDocument();
    expect(screen.getByText('Manufacturer URL')).toBeInTheDocument();
    expect(screen.getByText('Manufacturer Address')).toBeInTheDocument();
  });

  it('displays descriptions tooltip on hover', async () => {
    createView();

    await waitFor(() => {
      expect(
        screen.getByLabelText(
          'Catalogue item description: Precision energy meters for accurate measurements. 26'
        )
      ).toBeInTheDocument();
    });

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
    createView();

    await waitFor(() => {
      expect(
        screen.getByRole('row', { name: 'Energy Meters 26 row' })
      ).toBeInTheDocument();
    });

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

  it('opens the delete catalogue item dialog and can delete an item', async () => {
    createView();

    await waitFor(() => {
      expect(
        screen.getByLabelText(
          'Catalogue item description: Precision energy meters for accurate measurements. 26'
        )
      ).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', {
      name: 'Delete Energy Meters 26 catalogue item',
    });

    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('opens the edit catalogue item dialog', async () => {
    createView();

    await waitFor(() => {
      expect(
        screen.getByLabelText(
          'Catalogue item description: Precision energy meters for accurate measurements. 26'
        )
      ).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', {
      name: 'Edit Energy Meters 26 catalogue item',
    });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
  it('navigates to the manufacturer url', async () => {
    createView();
    await waitFor(() => {
      expect(
        screen.getByRole('row', { name: 'Energy Meters 26 row' })
      ).toBeInTheDocument();
    });

    const row = screen.getByRole('row', { name: 'Energy Meters 26 row' });
    const url = await within(row).findByText('http://example.com');
    expect(url).toHaveAttribute('href', 'http://example.com');
  });

  it.only('progress bar renders correctly', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
});
