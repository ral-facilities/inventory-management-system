import { RenderResult } from '@testing-library/react';
import {
  HomePage,
  HomePageErrorComponent,
} from '../homePage/homePage.component';
import { renderComponentWithRouterProvider } from '../testUtils';

describe('Home page component', () => {
  const createView = (): RenderResult => {
    return renderComponentWithRouterProvider(<HomePage />);
  };

  it('homepage renders correctly', () => {
    const { asFragment } = createView();

    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Home Page Error Component', () => {
  const createView = () => {
    return renderComponentWithRouterProvider(<HomePageErrorComponent />);
  };

  it('renders catalogue error page correctly', async () => {
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });
});
