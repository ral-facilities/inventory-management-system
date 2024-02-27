import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '../homePage/homePage.component';

describe('Home page component', () => {
  it('homepage renders correctly', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
