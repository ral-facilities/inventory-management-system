import { screen } from '@testing-library/react';
import {
  getCatalogueCategoryById,
  getCatalogueItemById,
  getManufacturerById,
  renderComponentWithRouterProvider,
} from '../../testUtils';

import userEvent, { UserEvent } from '@testing-library/user-event';
import CatalogueItemsDetailsPanel, {
  CatalogueItemsDetailsPanelProps,
} from './catalogueItemsDetailsPanel.component';

describe('Catalogue Items details panel', () => {
  let user: UserEvent;
  let props: CatalogueItemsDetailsPanelProps;
  const createView = () => {
    return renderComponentWithRouterProvider(
      <CatalogueItemsDetailsPanel {...props} />
    );
  };
  const catalogueItem = getCatalogueItemById('89');
  const catalogueCategory = getCatalogueCategoryById('5');
  beforeEach(() => {
    if (catalogueItem && catalogueCategory) {
      props = {
        catalogueItemIdData: catalogueItem,
        catalogueCategoryData: catalogueCategory,
        manufacturerData: getManufacturerById('1'),
      };
    }
    user = userEvent.setup();
  });

  it('renders details panel correctly', async () => {
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders details panel correctly (with obsolete replacement link)', async () => {
    const catalogueItem = getCatalogueItemById('11');
    const catalogueCategory = getCatalogueCategoryById('9');
    if (catalogueItem && catalogueCategory) {
      props.catalogueItemIdData = catalogueItem;
      props.catalogueCategoryData = catalogueCategory;
    }
    props.manufacturerData = getManufacturerById('3');
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders details panel correctly (None values for telephone and url)', async () => {
    const catalogueItem = getCatalogueItemById('33');
    const catalogueCategory = getCatalogueCategoryById('4');
    if (catalogueItem && catalogueCategory) {
      props.catalogueItemIdData = catalogueItem;
      props.catalogueCategoryData = catalogueCategory;
    }
    props.manufacturerData = getManufacturerById('4');
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
    const catalogueItem = getCatalogueItemById('33');
    const catalogueCategory = getCatalogueCategoryById('4');
    if (catalogueItem && catalogueCategory) {
      props.catalogueItemIdData = catalogueItem;
      props.catalogueCategoryData = catalogueCategory;
    }
    props.manufacturerData = getManufacturerById('4');

    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });
});
