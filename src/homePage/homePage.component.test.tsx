import { RenderResult } from '@testing-library/react';
import { HomePage } from '../homePage/homePage.component';
import { renderComponentWithBrowserRouter } from '../testUtils';

describe('Home page component', () => {
  const createView = (): RenderResult => {
    return renderComponentWithBrowserRouter(<HomePage />);
  };

  it('homepage renders correctly', () => {
    const { asFragment } = createView();

    expect(asFragment()).toMatchSnapshot();
  });
});
