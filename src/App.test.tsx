import { act } from '@testing-library/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

vi.mock('loglevel');
vi.mock('./state/slices/configSlice', async () => {
  const actual = await vi.importActual('./state/slices/configSlice');
  return {
    ...actual,
    loadConfig: vi.fn(
      () => () =>
        Promise.resolve({
          type: 'config/loadConfig/fulfilled',
          payload: {
            settings: {
              pluginHost: 'http://localhost',
              privilegedRoles: ['admin'],
            },
          },
        })
    ),
  };
});

describe('App', () => {
  it('renders without crashing', async () => {
    const el = document.createElement('div');
    const root = createRoot(el);

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    });
  });
});
