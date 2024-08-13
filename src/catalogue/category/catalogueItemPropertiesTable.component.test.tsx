import { screen } from '@testing-library/react';
import { CatalogueCategory } from '../../api/api.types';
import { AddCatalogueCategoryPropertyWithPlacementIds } from '../../app.types';
import {
  getCatalogueCategoryById,
  renderComponentWithRouterProvider,
} from '../../testUtils';
import { transformToAddCatalogueCategoryWithPlacementIds } from './catalogueCategoryDialog.component';
import PropertiesTable, {
  PropertiesTableProps,
} from './catalogueItemPropertiesTable.component';

describe('CatalogueItemPropertiesTable', () => {
  let props: PropertiesTableProps;

  const createView = () => {
    return renderComponentWithRouterProvider(<PropertiesTable {...props} />);
  };

  beforeEach(() => {
    props = {
      properties: transformToAddCatalogueCategoryWithPlacementIds(
        getCatalogueCategoryById('12') as CatalogueCategory
      ).properties as AddCatalogueCategoryPropertyWithPlacementIds[],
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders table correctly (not editing properties)', async () => {
    const { asFragment } = createView();
    expect(screen.getByRole('table')).toBeInTheDocument();
    const pumpingSpeed = await screen.findByText('Pumping Speed');
    expect(pumpingSpeed).toBeInTheDocument();

    expect(asFragment()).toMatchSnapshot();
  });
});
