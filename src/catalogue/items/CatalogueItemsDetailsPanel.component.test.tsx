import { screen } from '@testing-library/react';
import React from 'react';
import {
  getCatalogueCategoryById,
  getCatalogueItemById,
  renderComponentWithBrowserRouter,
} from '../../setupTests';

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
      catalogueItemIdData: getCatalogueItemById('89'),
      catalogueCategoryData: getCatalogueCategoryById('5'),
    };
    user = userEvent.setup();
  });

  it('renders details panel correctly', async () => {
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders details panel correctly (with obsolete replacement link)', async () => {
    props.catalogueItemIdData = getCatalogueItemById('11');
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
