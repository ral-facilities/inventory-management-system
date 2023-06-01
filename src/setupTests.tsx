// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { server } from './mocks/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RenderOptions, render } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { History } from 'history';

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 300000,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: jest.fn(),
    },
  });

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  queryClient?: QueryClient;
}

export function renderComponentWithBrowserRouter(
  ui: React.ReactElement,
  {
    // Automatically create a store instance if no store was passed i
    // Automatically create a query client instance if no query client was passed in
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({
    children,
  }: React.PropsWithChildren<unknown>): JSX.Element {
    return (
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </BrowserRouter>
    );
  }
  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

export function renderComponentWithMemoryRouter(
  ui: React.ReactElement,
  path: string,
  {
    // Automatically create a store instance if no store was passed i
    // Automatically create a query client instance if no query client was passed in
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({
    children,
  }: React.PropsWithChildren<unknown>): JSX.Element {
    return (
      <MemoryRouter initialEntries={[path]}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </MemoryRouter>
    );
  }
  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
