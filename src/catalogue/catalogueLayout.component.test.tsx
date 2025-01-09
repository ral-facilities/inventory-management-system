import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import type { LoaderFunctionArgs } from 'react-router-dom';
import { paths } from '../App';
import { renderComponentWithRouterProvider } from '../testUtils';
import CatalogueLayout, {
  CatalogueLayoutErrorComponent,
  catalogueLayoutLoader,
} from './catalogueLayout.component';

const mockedUseNavigate = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUseNavigate,
}));

describe('Catalogue Layout', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
  const createView = (path: string, urlPathKey: keyof typeof paths) => {
    return renderComponentWithRouterProvider(
      <CatalogueLayout />,
      urlPathKey,
      path
    );
  };

  it('renders catalogue home page correctly', async () => {
    const view = createView('/catalogue', 'catalogue');

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: 'navigate to catalogue home',
        })
      ).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders a catalogue categories page correctly', async () => {
    const view = createView('/catalogue/1', 'catalogueCategories');

    await waitFor(() => {
      expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders a catalogue items page correctly', async () => {
    const view = createView('/catalogue/4/items', 'catalogueItems');

    await waitFor(() => {
      expect(screen.getByText('Cameras')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders a catalogue items landing page correctly', async () => {
    const view = createView('/catalogue/4/items/1', 'catalogueItem');

    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders the items page correctly', async () => {
    const view = createView('/catalogue/4/items/1/items', 'items');

    await waitFor(() => {
      expect(screen.getByText('Items')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders the item landing page page correctly', async () => {
    const view = createView('/catalogue/4/items/1/items/KvT2Ox7n', 'item');

    await waitFor(() => {
      expect(screen.getByText('5YUQDDjKpz2z')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('calls useNavigate when the home button is clicked', async () => {
    createView('/catalogue/4/items/1/items', 'items');

    await waitFor(() => {
      expect(screen.getByText('Items')).toBeInTheDocument();
    });

    const homeButton = screen.getByRole('button', {
      name: 'navigate to catalogue home',
    });

    await user.click(homeButton);

    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/catalogue');
  });
});

describe('Catalogue Layout Error Component', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });
  const createView = () => {
    return renderComponentWithRouterProvider(<CatalogueLayoutErrorComponent />);
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders catalogue error page correctly', async () => {
    const view = createView();

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: 'navigate to catalogue home',
        })
      ).toBeInTheDocument();
    });

    const homeButton = screen.getByRole('button', {
      name: 'navigate to catalogue home',
    });

    await user.click(homeButton);

    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/catalogue');

    expect(view.asFragment()).toMatchSnapshot();
  });
});

describe('catalogueLayoutLoader', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    vi.clearAllMocks();
  });
  it('should fetch catalogue category data if catalogue_category_id is provided', async () => {
    const params = { catalogue_category_id: '1' };
    const output = await catalogueLayoutLoader(queryClient)({
      params,
    } as unknown as LoaderFunctionArgs);

    expect(output).toEqual({
      catalogue_category_id: '1',
    });
  });

  it('should throw an error if an invalid catalogue_category_id is provided', async () => {
    const params = { catalogue_category_id: '120' };

    await expect(
      catalogueLayoutLoader(queryClient)({
        params,
      } as unknown as LoaderFunctionArgs)
    ).rejects.toThrow('Request failed with status code 404');
  });

  it('should throw an error if catalogue_item_id does not belong to catalogue_category_id', async () => {
    const params = { catalogue_category_id: '1', catalogue_item_id: '2' };

    await expect(
      catalogueLayoutLoader(queryClient)({
        params,
      } as unknown as LoaderFunctionArgs)
    ).rejects.toThrow(
      'Catalogue item 2 does not belong to catalogue category 1'
    );
  });

  it('should throw an error if an invalid catalogue_item_id is provided', async () => {
    const params = { catalogue_category_id: '1', catalogue_item_id: 'invalid' };

    await expect(
      catalogueLayoutLoader(queryClient)({
        params,
      } as unknown as LoaderFunctionArgs)
    ).rejects.toThrow('Request failed with status code 404');
  });

  it('should fetch item data if item_id is provided', async () => {
    const params = { item_id: 'KvT2Ox7n' };
    const output = await catalogueLayoutLoader(queryClient)({
      params,
    } as unknown as LoaderFunctionArgs);

    expect(output).toEqual({
      item_id: 'KvT2Ox7n',
    });
  });

  it('should throw an error if an invalid item_id is provided', async () => {
    const params = {
      catalogue_category_id: '4',
      catalogue_item_id: '1',
      item_id: 'invalid',
    };

    await expect(
      catalogueLayoutLoader(queryClient)({
        params,
      } as unknown as LoaderFunctionArgs)
    ).rejects.toThrow('Request failed with status code 404');
  });

  it('should fetch catalogue category data if catalogue_category_id  and catalogue_item_id is provided', async () => {
    const params = { catalogue_category_id: '4', catalogue_item_id: '1' };
    const output = await catalogueLayoutLoader(queryClient)({
      params,
    } as unknown as LoaderFunctionArgs);

    expect(output).toEqual(params);
  });

  it('should fetch catalogue category data if catalogue_category_id, item_id and catalogue_item_id is provided', async () => {
    const params = {
      catalogue_category_id: '4',
      catalogue_item_id: '1',
      item_id: 'KvT2Ox7n',
    };
    const output = await catalogueLayoutLoader(queryClient)({
      params,
    } as unknown as LoaderFunctionArgs);

    expect(output).toEqual(params);
  });

  it('should throw an error if item_id does not belong to catalogue_item_id', async () => {
    const params = {
      catalogue_category_id: '4',
      catalogue_item_id: '2',
      item_id: 'KvT2Ox7n',
    };

    await expect(
      catalogueLayoutLoader(queryClient)({
        params,
      } as unknown as LoaderFunctionArgs)
    ).rejects.toThrow('Item KvT2Ox7n does not belong to catalogue item 2');
  });
});
