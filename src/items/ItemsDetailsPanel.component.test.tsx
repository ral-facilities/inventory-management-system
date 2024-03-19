import { screen } from '@testing-library/react';
import {
  getCatalogueItemById,
  getItemById,
  renderComponentWithRouterProvider,
} from '../testUtils';

import userEvent, { UserEvent } from '@testing-library/user-event';
import ItemsDetailsPanel, {
  ItemsDetailsPanelProps,
} from './ItemsDetailsPanel.component';

describe('Catalogue Items details panel', () => {
  let user: UserEvent;
  let props: ItemsDetailsPanelProps;
  const createView = () => {
    return renderComponentWithRouterProvider(
      <ItemsDetailsPanel {...props} />,
      undefined
    );
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

  it('renders details panel correctly (None values for telephone and url)', async () => {
    props.itemData = getItemById('I26EJNJ0');

    const view = createView();

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

  it('renders details panel correctly (when there are no Notes)', async () => {
    props.itemData = getItemById('3lmRHP8q');

    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });
});
