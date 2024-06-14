import { screen, waitFor } from '@testing-library/react';
import {
  getCatalogueItemById,
  getItemById,
  renderComponentWithRouterProvider,
} from '../testUtils';

import userEvent, { UserEvent } from '@testing-library/user-event';
import ItemsDetailsPanel, {
  ItemsDetailsPanelProps,
} from './itemsDetailsPanel.component';
import { CatalogueItem, Item } from '../app.types';

describe('Catalogue Items details panel', () => {
  let user: UserEvent;
  let props: ItemsDetailsPanelProps;
  const createView = () => {
    return renderComponentWithRouterProvider(<ItemsDetailsPanel {...props} />);
  };

  beforeEach(() => {
    props = {
      catalogueItemIdData: getCatalogueItemById('1') as CatalogueItem,
      itemData: getItemById('KvT2Ox7n') as Item,
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
    } as Item;
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders properties panel correctly', async () => {
    const view = createView();

    await user.click(screen.getByRole('tab', { name: 'Properties' }));

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders details panel correctly (None values for telephone and url)', async () => {
    props.itemData = getItemById('I26EJNJ0') as Item;

    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders manufacturer panel correctly', async () => {
    const view = createView();
    await user.click(screen.getByRole('tab', { name: 'Manufacturer' }));

    await waitFor(() => {
      expect(screen.getByText('Manufacturer A')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders notes panel correctly', async () => {
    const view = createView();
    await user.click(screen.getByRole('tab', { name: 'Notes' }));

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders details panel correctly (when there are no Notes)', async () => {
    props.itemData = getItemById('3lmRHP8q') as Item;

    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });
});
