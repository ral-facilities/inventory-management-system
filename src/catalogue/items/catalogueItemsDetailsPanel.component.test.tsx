import { screen, waitFor } from '@testing-library/react';
import {
  getCatalogueCategoryById,
  getCatalogueItemById,
  getManufacturerById,
  renderComponentWithRouterProvider,
} from '../../testUtils';

import userEvent, { UserEvent } from '@testing-library/user-event';
import { CatalogueCategory, CatalogueItem } from '../../api/api.types';
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

  beforeEach(() => {
    props = {
      catalogueItemIdData: getCatalogueItemById('89') as CatalogueItem,
      catalogueCategoryData: getCatalogueCategoryById('5') as CatalogueCategory,
      manufacturerData: getManufacturerById('1'),
    };

    user = userEvent.setup();
  });

  it('renders details panel correctly', async () => {
    const view = createView();
    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Click here' })
      ).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders details panel correctly (with obsolete replacement link)', async () => {
    props.catalogueItemIdData = getCatalogueItemById('11') as CatalogueItem;
    props.catalogueCategoryData = getCatalogueCategoryById(
      '9'
    ) as CatalogueCategory;

    props.manufacturerData = getManufacturerById('3');
    const view = createView();

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Click here' })
      ).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders details panel correctly (None values for telephone and url)', async () => {
    props.catalogueItemIdData = getCatalogueItemById('33') as CatalogueItem;
    props.catalogueCategoryData = getCatalogueCategoryById(
      '4'
    ) as CatalogueCategory;
    props.manufacturerData = getManufacturerById('4');
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders properties panel correctly', async () => {
    const view = createView();

    await user.click(screen.getByText('Properties'));

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders properties panel correctly (empty property list)', async () => {
    props.catalogueItemIdData = {
      ...getCatalogueItemById('33'),
      properties: [],
    } as CatalogueItem;
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
    props.catalogueItemIdData = getCatalogueItemById('33') as CatalogueItem;
    props.catalogueCategoryData = getCatalogueCategoryById(
      '4'
    ) as CatalogueCategory;
    props.manufacturerData = getManufacturerById('4');

    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });
});
