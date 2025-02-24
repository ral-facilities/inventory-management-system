import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { renderComponentWithRouterProvider } from '../../testUtils';
import PlaceholderImage, {
  PlaceholderImageProps,
} from './placeholderImage.component'; // Adjust the import path as necessary

let props: PlaceholderImageProps;
let user: UserEvent;

const createView = () => {
  return renderComponentWithRouterProvider(<PlaceholderImage {...props} />);
};

beforeEach(() => {
  props = {
    entityId: '1',
  };
  user = userEvent.setup();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('PlaceholderImage Component', () => {
  it('matches the snapshot', async () => {
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('can open and close the set primary images dialog', async () => {
    createView();

    const actionButton = screen.getByLabelText('primary images action menu');
    user.click(actionButton);

    await waitFor(() => {
      expect(screen.getByText('Set Primary Image')).toBeInTheDocument();
    });

    const primaryImageButton = screen.getByText('Set Primary Image');
    user.click(primaryImageButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect((await screen.findAllByText('logo1.png')).length).toEqual(9);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('can open and close the primary images menu', async () => {
    createView();

    const actionButton = screen.getByLabelText('primary images action menu');
    user.click(actionButton);

    await waitFor(() => {
      expect(screen.getByText('Set Primary Image')).toBeInTheDocument();
    });

    const dialogButton = screen.getByRole('menuitem', {
      name: 'Set Primary Image',
    });

    await waitFor(() => {
      expect(dialogButton).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByText('Set Primary Image')).not.toBeInTheDocument();
    });
  });
});
