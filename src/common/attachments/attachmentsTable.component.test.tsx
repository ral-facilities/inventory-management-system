import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { act } from 'react';
import { server } from '../../mocks/server';
import { renderComponentWithRouterProvider } from '../../testUtils';
import AttachmentsTable, { AttachmentTableProps } from './attachmentsTable.component';

describe('Attachments Table', () => {
  let props: AttachmentTableProps;
  let user: UserEvent;

  const createView = () => {
    return renderComponentWithRouterProvider(<AttachmentsTable {...props} />);
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

  it('renders table correctly', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    expect((await screen.findAllByText('laser-calibration.txt')).length).toEqual(3);

    expect(baseElement).toMatchSnapshot();
  });

  it('renders no results page correctly', async () => {
    server.use(
      http.get('/attachments', async () => {
        return HttpResponse.json([], { status: 200 });
      })
    );

    let baseElement;
    await act(async () => {
        baseElement = createView().baseElement;
    });

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect(screen.queryByText('laser-calibration.txt')).not.toBeInTheDocument();

    expect(baseElement).toMatchSnapshot();
  });

  it('changes page correctly and rerenders data', async () => {
    const { router } = createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect(screen.getAllByText('laser-calibration.txt').length).toEqual(3);
    expect(router.state.location.search).toBe('');

    await user.click(screen.getByRole('button', { name: 'Go to page 2' }));

    await waitFor(() => {
      expect(screen.getAllByText('laser-calibration.txt').length).toEqual(2);
    });

    expect(router.state.location.search).toBe(
      '?state=N4IgDiBcpghg5gUwMoEsBeioEYCsAacBRASQDsATRADxwF86g'
    );

    await user.click(screen.getByRole('button', { name: 'Go to page 1' }));

    await waitFor(() => {
      expect(screen.getAllByText('laser-calibration.txt').length).toEqual(3);
    });

    expect(router.state.location.search).toBe('');
  });

  it('sets the table filters and clears the table filters', async () => {
    createView();

    await waitFor(() => {
        expect(screen.getAllByText('laser-calibration.txt').length).toEqual(3);
    });

    const clearFiltersButton = screen.getByRole('button', {
      name: 'Clear Filters',
    });

    expect(clearFiltersButton).toBeDisabled();

    const nameInput = screen.getByLabelText('Filter by File name');

    await user.type(nameInput, 'camera');

    await waitFor(() => {
      expect(screen.queryByText('laser-calibration.txt')).not.toBeInTheDocument();
    });

    await user.click(clearFiltersButton);

    await waitFor(() => {
        expect(screen.getAllByText('laser-calibration.txt').length).toEqual(3);
    });

    expect(clearFiltersButton).toBeDisabled();
  }, 10000);

  it('opens download dialog and can close the dialog', async () => {
    createView();

    expect((await screen.findAllByText('safety-protocols.pdf')).length).toEqual(4);

    const rowActionsButton = screen.getAllByLabelText('Row Actions');
    await user.click(rowActionsButton[0]);

    await waitFor(() => {
      expect(screen.getByText('Download')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Download'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByText('Download Attachment?')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(screen.queryByText('Download Attachment?')).not.toBeInTheDocument();
  });

  it('opens edit dialog and closes it correctly', async () => {
    createView();

    expect((await screen.findAllByText('safety-protocols.pdf')).length).toEqual(4);

    const rowActionsButton = screen.getAllByLabelText('Row Actions');
    await user.click(rowActionsButton[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByText('Edit Attachment')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(screen.queryByText('Edit Attachment')).not.toBeInTheDocument();
  });

  it('opens delete dialog and closes it correctly', async () => {
    createView();

    expect((await screen.findAllByText('safety-protocols.pdf')).length).toEqual(4);

    const rowActionsButton = screen.getAllByLabelText('Row Actions');
    await user.click(rowActionsButton[0])

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByText('Delete Attachment')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(screen.queryByText('Delete Attachment')).not.toBeInTheDocument();
  });
});
