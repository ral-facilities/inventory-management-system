import { act, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { RootState } from '../../state/store';
import { renderComponentWithRouterProvider } from '../../testUtils';
import CriticalityJobDialog, {
  CriticalityJobDialogProps,
} from './criticalityJobDialog.component';

describe('Criticality dialog', () => {
  let props: CriticalityJobDialogProps;

  const onClose = vi.fn();

  const createView = (preloadedState?: Partial<RootState>) => {
    return renderComponentWithRouterProvider(
      <CriticalityJobDialog {...props} />,
      undefined,
      undefined,
      preloadedState
    );
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
  it('renders dialog correctly', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    expect(screen.getByText('finished')).toBeInTheDocument();
    expect(baseElement).toMatchSnapshot();
  });

  it('renders dialog correctly admin and submits a job', async () => {
    createView({
      authorisation: { role: 'admin', isAdminMode: true, isAdminUser: true },
    });
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    expect(screen.getByText('finished')).toBeInTheDocument();

    const runJobButton = screen.getByRole('button', { name: 'Run Job' });

    expect(runJobButton).toBeInTheDocument();
  });

  it('display warning message, when the job is not found', async () => {
    server.use(
      http.get('jobs/criticality', () => {
        return HttpResponse.json(
          {
            detail: 'Job not found',
          },
          { status: 404 }
        );
      })
    );
    createView({
      authorisation: { role: 'admin', isAdminMode: true, isAdminUser: true },
    });
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    expect(
      screen.getByText('Job not found. Please contact support.')
    ).toBeInTheDocument();
  });

  it('displays warning message, when ims job scheduler is not enabled', async () => {
    server.use(
      http.get('jobs/criticality', () => {
        return HttpResponse.error();
      })
    );
    createView({
      authorisation: { role: 'admin', isAdminMode: true, isAdminUser: true },
    });
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    expect(
      screen.getByText('Not enabled. Please contact support to enable it.')
    ).toBeInTheDocument();
  });
});
