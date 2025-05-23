import { screen, waitFor } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { paths } from '../App';
import { server } from '../mocks/server';
import { renderComponentWithRouterProvider } from '../testUtils';
import SystemsTree from './systemsTree.component';

describe('SystemsTree', () => {
  let mockDOMMatrixReadOnly: typeof global.DOMMatrixReadOnly;
  let originalDOMMatrixReadOnly: typeof global.DOMMatrixReadOnly;
  let user: UserEvent;
  beforeEach(() => {
    user = userEvent.setup();
  });

  beforeAll(() => {
    originalDOMMatrixReadOnly = global.DOMMatrixReadOnly;

    // @ts-expect-error: Ignore TypeScript error related to DOMMatrixReadOnly
    mockDOMMatrixReadOnly = vi
      .fn()
      .mockImplementation((_init?: string | number[]) => ({
        fromFloat32Array: vi.fn(),
        fromFloat64Array: vi.fn(),
        fromMatrix: vi.fn(),
      }));

    global.DOMMatrixReadOnly = mockDOMMatrixReadOnly;
  });

  afterAll(() => {
    global.DOMMatrixReadOnly = originalDOMMatrixReadOnly;
    vi.restoreAllMocks();
  });
  // Quite a few of these take more than 5 seconds on CI
  vi.setConfig({ testTimeout: 14000 });

  const createView = (path: string, urlPathKey?: keyof typeof paths) => {
    return renderComponentWithRouterProvider(<SystemsTree />, urlPathKey, path);
  };

  it('renders system tree correct at root', async () => {
    const view = createView('/systems/tree', 'systemRootTree');

    await waitFor(() => {
      expect(screen.getByText('Root')).toBeInTheDocument();
    });

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders system tree correct in subsystem', async () => {
    const view = createView(
      '/systems/65328f34a40ff5301575a4e3/tree',
      'systemTree'
    );

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders the systems tree at level 2 depth', async () => {
    const { router } = createView(
      '/systems/65328f34a40ff5301575a4e3/tree',
      'systemTree'
    );

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });

    const depth2Button = screen.getByRole('button', { name: '2' });

    await user.click(depth2Button);

    expect(router.state.location.search).toContain('?maxDepth=2');

    const depth1Button = screen.getByRole('button', { name: '1' });

    await user.click(depth1Button);

    expect(router.state.location.search).toContain('');
  });

  it('renders the systems tree horizontally', async () => {
    const { router } = createView(
      '/systems/65328f34a40ff5301575a4e3/tree',
      'systemTree'
    );

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });

    const horizontalButton = screen.getByRole('button', { name: 'Horizontal' });

    await user.click(horizontalButton);

    expect(router.state.location.search).toContain('?layoutDirection=LR');

    const verticalButton = screen.getByRole('button', { name: 'Vertical' });

    await user.click(verticalButton);

    expect(router.state.location.search).toContain('');
  });

  it('renders max subsystem message', async () => {
    server.use(
      http.get('/v1/systems', () => {
        const generateMockSystems = () => {
          return Array.from({ length: 101 }, (_, i) => ({
            name: `Giant laser ${i + 1}`,
            location: '80371 Alvarado Drive Apt. 272, Heatherhaven, MP 33307',
            owner: 'Juan Horton',
            importance: 'high',
            description:
              'Take Democrat early money some.\nTree meet fly her likely.',
            parent_id: null,
            id: `mock-id-${i + 1}`,
            code: 'giant-laser',
            created_time: '2024-01-01T12:00:00.000+00:00',
            modified_time: '2024-01-02T13:10:10.000+00:00',
          }));
        };

        return HttpResponse.json(generateMockSystems(), { status: 200 });
      })
    );

    createView('/systems/65328f34a40ff5301575a4e3/tree', 'systemTree');

    // Ensure no loading bars visible
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );
    expect(
      await screen.findByText(
        'The maximum number of subsystems has been reached.'
      )
    );
  });

  it('renders system tree with any items ', async () => {
    server.use(
      http.get('/v1/items', () => {
        return HttpResponse.json([], { status: 200 });
      })
    );

    const view = createView(
      '/systems/65328f34a40ff5301575a4e3/tree',
      'systemTree'
    );

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });
});
