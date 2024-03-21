import { RenderResult } from '@testing-library/react';
import { HomePage } from '../homePage/homePage.component';
import { renderComponentWithRouterProvider } from '../testUtils';
import { paths } from '../view/viewTabs.component';

describe('Home page component', () => {
  const createView = (): RenderResult => {
    return renderComponentWithRouterProvider(<HomePage />, paths.homepage);
  };

  it('homepage renders correctly', () => {
    const { asFragment } = createView();

    expect(asFragment()).toMatchSnapshot();
  });
});
