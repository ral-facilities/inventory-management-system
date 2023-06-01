import React from 'react';
import { renderComponentWithBrowserRouter } from '../setupTests';
import { screen } from '@testing-library/react';
import Systems from './systems.component';

describe('Systems', () => {
  const createView = () => {
    return renderComponentWithBrowserRouter(<Systems />);
  };

  it('renders text correctly', async () => {
    createView();
    expect(screen.getByText('Systems Page')).toBeInTheDocument();
  });
});
