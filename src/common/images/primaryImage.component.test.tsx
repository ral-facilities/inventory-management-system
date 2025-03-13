import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { renderComponentWithRouterProvider } from '../../testUtils';
import PrimaryImage, { PrimaryImageProps } from './primaryImage.component'; // Adjust the import path as necessary

vi.mock('../../handleIMS_APIError');

let props: PrimaryImageProps;
let user: UserEvent;

const createView = () => {
  return renderComponentWithRouterProvider(<PrimaryImage {...props} />);
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

describe('PrimaryImage Component', () => {
  it('matches the snapshot', async () => {
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('can open and close the set primary image dialog', async () => {
    createView();
    await waitFor(() => {
      expect(
        screen.getByLabelText('primary images action menu')
      ).toBeInTheDocument();
    });
    const actionButton = screen.getByLabelText('primary images action menu');
    user.click(actionButton);
    await waitFor(() => {
      expect(screen.getByText('Set Primary Image')).toBeInTheDocument();
    });
    const primaryImageButton = screen.getByText('Set Primary Image');
    await user.click(primaryImageButton);
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

  it('can open and close the remove primary image dialog', async () => {
    createView();

    const actionButton = screen.getByLabelText('primary images action menu');
    user.click(actionButton);

    await waitFor(() => {
      expect(screen.getByText('Remove Primary Image')).toBeInTheDocument();
    });

    const primaryImageButton = screen.getByText('Remove Primary Image');
    user.click(primaryImageButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    const element = screen.getByTestId('remove-image-name');
    expect(element).toHaveTextContent('stfc-logo-blue-text.png');

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('Removes the remove primary image button when there is no set primary image', async () => {
    props.entityId = '90';
    createView();

    const actionButton = screen.getByLabelText('primary images action menu');
    user.click(actionButton);

    await waitFor(() => {
      expect(
        screen.queryByText('Remove Primary Image')
      ).not.toBeInTheDocument();
    });
  });
});
