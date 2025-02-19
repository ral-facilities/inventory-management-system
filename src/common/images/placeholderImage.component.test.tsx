import { renderComponentWithRouterProvider } from '../../testUtils';
import PlaceholderImage from './placeholderImage.component'; // Adjust the import path as necessary

describe('PlaceholderImage Component', () => {
  const createView = () => {
    return renderComponentWithRouterProvider(<PlaceholderImage />);
  };

  it('matches the snapshot', () => {
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });
});
