import { screen } from '@testing-library/react';
import React from 'react';
import {
  getCatalogueItemById,
  getItemById,
  renderComponentWithBrowserRouter,
} from '../setupTests';

import userEvent from '@testing-library/user-event';
import ItemsDetailsPanel, {
  ItemsDetailsPanelProps,
} from './ItemsDetailsPanel.component';

describe('Catalogue Items details panel', () => {
  let user;
  let props: ItemsDetailsPanelProps;
  const createView = () => {
    return renderComponentWithBrowserRouter(<ItemsDetailsPanel {...props} />);
  };

  beforeEach(() => {
    props = {
      catalogueItemIdData: getCatalogueItemById('1'),
      itemData: getItemById('KvT2Ox7n'),
    };

    user = userEvent.setup();
  });

  it('renders details panel correctly', async () => {
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders details panel correctly (no dates)', async () => {
    props.itemData = {
      ...getItemById('wKsFzrSq'),
      delivered_date: null,
      warranty_end_date: null,
    };
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders properties panel correctly', async () => {
    const view = createView();

    await user.click(screen.getByRole('tab', { name: 'Properties' }));

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders manufacturer panel correctly', async () => {
    const view = createView();
    await user.click(screen.getByRole('tab', { name: 'Manufacturer' }));

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders notes panel correctly', async () => {
    const view = createView();
    await user.click(screen.getByRole('tab', { name: 'Notes' }));

    expect(view.asFragment()).toMatchSnapshot();
  });
});
