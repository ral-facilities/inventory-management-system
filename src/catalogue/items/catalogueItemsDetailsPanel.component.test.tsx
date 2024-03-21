import { screen } from '@testing-library/react';
import {
  getCatalogueCategoryById,
  getCatalogueItemById,
  renderComponentWithRouterProvider,
} from '../../testUtils';

import userEvent, { UserEvent } from '@testing-library/user-event';
import CatalogueItemsDetailsPanel, {
  CatalogueItemsDetailsPanelProps,
} from './catalogueItemsDetailsPanel.component';
import { paths } from '../../view/viewTabs.component';

describe('Catalogue Items details panel', () => {
  let user: UserEvent;
  let props: CatalogueItemsDetailsPanelProps;
  const createView = () => {
    return renderComponentWithRouterProvider(
      <CatalogueItemsDetailsPanel {...props} />,
      paths.catalogue
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
    props.catalogueCategoryData = getCatalogueCategoryById('9');
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders details panel correctly (None values for telephone and url)', async () => {
    props.catalogueCategoryData = getCatalogueCategoryById('4');
    props.catalogueItemIdData = getCatalogueItemById('33');
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

  it('renders notes panel correctly', async () => {
    const view = createView();
    await user.click(screen.getByText('Notes'));

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders details panel correctly (when there are no Notes)', async () => {
    props.catalogueCategoryData = getCatalogueCategoryById('4');
    props.catalogueItemIdData = getCatalogueItemById('33');

    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });
});
