import React from 'react';
import { renderComponentWithBrowserRouter } from '../../setupTests';
import { screen } from '@testing-library/react';
import CatalogueItemsTable from './catalogueItemsTable.component';

describe('Catalogue Items Table', () => {
  const createView = () => {
    return renderComponentWithBrowserRouter(<CatalogueItemsTable />);
  };

  it('renders text correctly', async () => {
    createView();
    expect(screen.getByText('Catalogue Items table')).toBeInTheDocument();
  });
});
