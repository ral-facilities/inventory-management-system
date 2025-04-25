import { screen, waitFor } from '@testing-library/react';
import type { paths } from '../App';
import { renderComponentWithRouterProvider } from '../testUtils';
import SystemsTree from './systemsTree.component';

describe('SystemsTree', () => {
  let mockDOMMatrixReadOnly: typeof global.DOMMatrixReadOnly;
  let originalDOMMatrixReadOnly: typeof global.DOMMatrixReadOnly;

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

    expect(view.asFragment()).toMatchSnapshot();
  });
});
