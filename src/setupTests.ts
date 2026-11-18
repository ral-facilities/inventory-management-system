// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
// Needed for proper FormData handling in MSW when running tests in Node environment.
// See: https://github.com/mswjs/msw/issues/2166
import 'blob-polyfill';
import Uppy from '@uppy/core';
import { server } from './mocks/server';

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

window.ResizeObserver = vi.fn().mockImplementation(function (
  this: ResizeObserver
) {
  this.disconnect = vi.fn();
  this.observe = vi.fn();
  this.unobserve = vi.fn();
}) as unknown as typeof ResizeObserver;

// @uppy/dashboard debounces a `superFocus` call (260ms) but never cancels it when the plugin is
// uninstalled. If a test file finishes within that window, the timer fires after Vitest has torn
// down jsdom, causing "ReferenceError: document is not defined" unhandled errors. Every unmount path
// (DashboardModal/Dashboard unmount and uppy.destroy()) goes through removePlugin, so cancel it here.
const originalRemovePlugin = Uppy.prototype.removePlugin;
Uppy.prototype.removePlugin = function (
  this: Uppy,
  ...args: Parameters<typeof originalRemovePlugin>
) {
  (args[0] as { superFocus?: { cancel?: () => void } }).superFocus?.cancel?.();
  return originalRemovePlugin.apply(this, args);
};
