import { screen } from '@testing-library/react';
import {
  getCatalogueCategoryById,
  getCatalogueItemById,
  renderComponentWithBrowserRouter,
} from '../../testUtils';

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
});
