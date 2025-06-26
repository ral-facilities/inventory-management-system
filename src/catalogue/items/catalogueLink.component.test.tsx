import { screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { renderComponentWithRouterProvider } from '../../testUtils';
import CatalogueLink, {
  type CatalogueLinkProps,
} from './catalogueLink.component';

describe('ObsoleteReplacementLink', () => {
  let props: CatalogueLinkProps;

  const createView = () => {
    return renderComponentWithRouterProvider(<CatalogueLink {...props} />);
  };

  it('renders a link correctly (catalogue item)', async () => {
    props = { catalogueItemId: '1', children: 'Click here' };

    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Click here' })
      ).toBeInTheDocument();
    });

    expect(baseElement).toMatchSnapshot();
  });

  it('renders a link correctly (item)', async () => {
    props = { itemId: 'KvT2Ox7n', children: 'Click here' };
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Click here' })
      ).toBeInTheDocument();
    });

    expect(baseElement).toMatchSnapshot();
  });

  it('renders nothing when data is undefined correctly (catalogue item)', async () => {
    props = { catalogueItemId: 'invalid', children: 'test' };
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    await waitFor(() => {
      expect(
        screen.queryByRole('link', { name: 'test' })
      ).not.toBeInTheDocument();
    });

    expect(baseElement).toMatchSnapshot();
  });

  it('renders nothing when data is undefined correctly (item)', async () => {
    props = { itemId: 'invalid', children: 'test' };
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    await waitFor(() => {
      expect(
        screen.queryByRole('link', { name: 'test' })
      ).not.toBeInTheDocument();
    });

    expect(baseElement).toMatchSnapshot();
  });
}, 15000);
