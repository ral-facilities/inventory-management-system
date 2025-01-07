import { screen, waitFor } from '@testing-library/react';
import { renderComponentWithRouterProvider } from '../../testUtils';
import ObsoleteReplacementLink, {
  ObsoleteReplacementLinkProps,
} from './obsoleteReplacementLink.component';

describe('ObsoleteReplacementLink', () => {
  let props: ObsoleteReplacementLinkProps;

  const createView = () => {
    return renderComponentWithRouterProvider(
      <ObsoleteReplacementLink {...props} />
    );
  };

  beforeEach(() => {
    props = { catalogueItemId: '1' };
  });

  it('renders a link correctly', async () => {
    const view = createView();

    await waitFor(() => {
      expect(screen.getByText('Click here')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders nothing when data is undefined correctly', async () => {
    props.catalogueItemId = 'fdsfsdfds';
    const view = createView();

    await waitFor(
      () => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument(),
      { timeout: 10000 }
    );

    await waitFor(() => {
      expect(screen.queryByText('Click here')).not.toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });
}, 15000);
