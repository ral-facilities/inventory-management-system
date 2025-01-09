import { screen, waitFor } from '@testing-library/react';
import { renderComponentWithRouterProvider } from '../testUtils';
import AdminCardView from './adminCardView.component';

describe('AdminCardView', () => {
  const createView = () => {
    return renderComponentWithRouterProvider(<AdminCardView />);
  };
  it('renders admin card view correctly', async () => {
    const view = createView();

    await waitFor(() => {
      expect(screen.getByText('Units')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });
});
