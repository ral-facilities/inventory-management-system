import React from 'react';
import { RenderResult } from '@testing-library/react';
import { HomePage } from '../homePage/homePage.component';
import { renderComponentWithRouterProvider } from '../setupTests';

describe('Home page component', () => {
  const createView = (): RenderResult => {
    return renderComponentWithRouterProvider(<HomePage />, undefined);
  };
  it('homepage renders correctly', () => {
    const { asFragment } = createView();

    expect(asFragment()).toMatchSnapshot();
  });
});
