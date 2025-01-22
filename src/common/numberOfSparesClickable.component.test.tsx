import { screen, waitFor } from '@testing-library/react';
import CatalogueItemsJSON from '../mocks/CatalogueItems.json';
import { renderComponentWithRouterProvider } from '../testUtils';
import NumberOfSparesClickable, {
  NumberOfSparesClickableProps,
} from './numberOfSparesClickable.component';

describe('NumberOfSparesClickable Snapshot Tests', () => {
  let props: NumberOfSparesClickableProps;

  const createView = (path: string) => {
    return renderComponentWithRouterProvider(
      <NumberOfSparesClickable {...props} />,
      'items',
      path
    );
  };

  beforeEach(() => {
    props = {
      catalogueItem: CatalogueItemsJSON[1],
      type: 'link',
      label: 'View Spares',
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('link', () => {
    it('renders correctly as a link with label', async () => {
      const view = createView(
        `/catalogue/${props.catalogueItem.catalogue_category_id}/items/${props.catalogueItem.id}/items`
      );

      const link = screen.getByRole('link', { name: 'View Spares' });
      expect(link).toBeInTheDocument();

      await waitFor(() => {
        expect(link).toHaveAttribute(
          'href',
          `/catalogue/4/items/1/items?state=N4IgxgYiBcDaoEsAmMQIC4FMC2A6ArgM4CGA5pgPqHrHpEgA0IAbsQDb6YzwjoCeABy7QQ1AE4IAdqUYt2nVADlMAdxABfBqH5DU4qTKasOwkAFVCmFOoC6t9UA`
        );
      });

      expect(view.asFragment()).toMatchSnapshot();
    });

    it('renders correctly as a link without label', async () => {
      props.label = undefined;
      const view = createView(
        `/catalogue/${props.catalogueItem.catalogue_category_id}/items/${props.catalogueItem.id}/items`
      );

      const link = screen.getByRole('link', { name: '2' });
      expect(link).toBeInTheDocument();

      await waitFor(() => {
        expect(link).toHaveAttribute(
          'href',
          `/catalogue/4/items/1/items?state=N4IgxgYiBcDaoEsAmMQIC4FMC2A6ArgM4CGA5pgPqHrHpEgA0IAbsQDb6YzwjoCeABy7QQ1AE4IAdqUYt2nVADlMAdxABfBqH5DU4qTKasOwkAFVCmFOoC6t9UA`
        );
      });

      expect(view.asFragment()).toMatchSnapshot();
    });
  });

  describe('button', () => {
    beforeEach(() => {
      props.type = 'button';
    });
    it('renders correctly as a button with label', async () => {
      const view = createView(
        `/catalogue/${props.catalogueItem.catalogue_category_id}/items/${props.catalogueItem.id}/items`
      );

      const link = screen.getByRole('link', { name: 'View Spares' });
      expect(link).toBeInTheDocument();

      await waitFor(() => {
        expect(link).toHaveAttribute(
          'href',
          `/catalogue/4/items/1/items?state=N4IgxgYiBcDaoEsAmMQIC4FMC2A6ArgM4CGA5pgPqHrHpEgA0IAbsQDb6YzwjoCeABy7QQ1AE4IAdqUYt2nVADlMAdxABfBqH5DU4qTKasOwkAFVCmFOoC6t9UA`
        );
      });

      expect(view.asFragment()).toMatchSnapshot();
    });

    it('renders correctly as a button without label', async () => {
      props.label = undefined;
      const view = createView(
        `/catalogue/${props.catalogueItem.catalogue_category_id}/items/${props.catalogueItem.id}/items`
      );

      const link = screen.getByRole('link', { name: '2' });
      expect(link).toBeInTheDocument();

      await waitFor(() => {
        expect(link).toHaveAttribute(
          'href',
          `/catalogue/4/items/1/items?state=N4IgxgYiBcDaoEsAmMQIC4FMC2A6ArgM4CGA5pgPqHrHpEgA0IAbsQDb6YzwjoCeABy7QQ1AE4IAdqUYt2nVADlMAdxABfBqH5DU4qTKasOwkAFVCmFOoC6t9UA`
        );
      });

      expect(view.asFragment()).toMatchSnapshot();
    });

    it('renders correctly as a button without label (disabled)', async () => {
      props.label = undefined;
      const view = createView(
        `/catalogue/${props.catalogueItem.catalogue_category_id}/items/${props.catalogueItem.id}/items?state=N4IgxgYiBcDaoEsAmMQIC4FMC2A6ArgM4CGA5pgPqHrHpEgA0IAbsQDb6YzwjoCeABy7QQ1AE4IAdqUYt2nVADlMAdxABfBqH5DU4qTKasOwkAFVCmFOoC6t9UA`
      );

      const link = screen.getByRole('link', { name: '2' });
      expect(link).toBeInTheDocument();

      await waitFor(() => {
        expect(link).toHaveAttribute(
          'href',
          `/catalogue/4/items/1/items?state=N4IgxgYiBcDaoEsAmMQIC4FMC2A6ArgM4CGA5pgPqHrHpEgA0IAbsQDb6YzwjoCeABy7QQ1AE4IAdqUYt2nVADlMAdxABfBqH5DU4qTKasOwkAFVCmFOoC6t9UA`
        );
      });

      expect(view.asFragment()).toMatchSnapshot();
    });
  });
});
